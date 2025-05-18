import * as _ from "radash";
import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";
import type { Feed, FeedItem, FeedResolver, IsResolvable } from "./types.ts";
import {
  findImageInContent,
  normalizeContentUrls,
  unscapeEntities,
} from "../utils/utils.ts";
import {
  findImageInEnclosures,
  isLinkPossiblyAImage,
  normalizeUrl,
} from "../utils/utils.ts";

const isXMLValid = (data: string) => XMLValidator.validate(data);

const parseXml = (data: string) =>
  new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    textNodeName: "#text",
    transformTagName: (name) => name.toLowerCase(),
    transformAttributeName: (name) => name.toLowerCase(),
  }).parse(data);

const stringyfyXML = (data: Record<string, unknown>) =>
  new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    textNodeName: "#text",
  }).build(data);

const resolveFeedTitle = (feed: Record<string, unknown>) =>
  ["title"]
    .flatMap((path) => _.get(feed, path))
    .map((value) => _.isObject(value) ? _.get(value, "#text") : value)
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => (value as string).trim())
    .at(0);

const resolveFeedUrl = (feed: Record<string, unknown>) =>
  ["link", "atom:link"]
    .flatMap((path) => _.get(feed, path))
    .map((value) =>
      typeof value === "string"
        ? value
        : _.isObject(value) && _.get(value, "@rel") === "self"
        ? _.get(value, "@href")
        : _.get(value, "#text")
    )
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => (value as string).trim())
    .at(0) as string | undefined;

const resolveFeedItemContent = (feedItem: Record<string, unknown>) =>
  [
    "content",
    "content:encoded",
    "summary",
    "description",
    "media:group.media:description",
    "dc:description",
  ]
    .flatMap((path) => _.get(feedItem, path))
    // Make html contents be with higher priority.
    .toSorted((a, b) => {
      const aType = _.get(a, "@type");
      const bType = _.get(b, "@type");
      const aWithHtml = _.isObject(a) && typeof aType === "string" &&
        ["html", "xhtml"].some((type) => aType.includes(type));
      const bWithHtml = _.isObject(a) && typeof bType === "string" &&
        ["html", "xhtml"].some((type) => bType.includes(type));

      if (aWithHtml && bWithHtml) return 0;
      if (aWithHtml) return -1;
      if (bWithHtml) return 1;
      return 0;
    })
    .map((value) =>
      // Parse xhtml object
      _.get(value, "@type") === "xhtml"
        // deno-lint-ignore no-explicit-any
        ? stringyfyXML(value as any)
        : _.isObject(value)
        ? _.get(value, "#text")
        : value
    )
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => (value as string).trim())
    .at(0);

const resolveFeedItemCreatedAt = (feedItem: Record<string, unknown>) =>
  ["published", "pubdate", "dc:date"]
    .flatMap((path) => _.get(feedItem, path))
    .map((value) => _.isObject(value) ? _.get(value, "#text") : value)
    .filter((value) =>
      typeof value === "string" && !Number.isNaN(new Date(value).valueOf())
    )
    .map((value) => new Date(value as string))
    .at(0);

const resolveFeedItemEnclosures = (feedItem: Record<string, unknown>) =>
  ["enclosure", "link"]
    .flatMap((path) => _.get(feedItem, path))
    .filter((value) =>
      _.isObject(value) && "@rel" in value
        ? value["@rel"] === "enclosure"
        : _.isObject(value)
    )
    .map((value) => ({
      url: (_.get(value, "@href") ?? _.get(value, "@url")) as string,
      type: _.get(value, "@type") as string | undefined,
    }))
    .filter(({ url }) => url !== null && url !== undefined);

const resolveFeedItemLink = (feedItem: Record<string, unknown>) =>
  ["link"]
    .flatMap((path) => _.get(feedItem, path))
    .filter((value) => typeof value === "string" || _.isObject(value))
    .map((value) =>
      typeof value === "string"
        ? value
        : _.get(value, "@href") ?? _.get(value, "@url") ?? _.get(value, "#text")
    )
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => (value as string).trim())
    .at(0) as string | undefined;

const resolveFeedItemId = (feedItem: Record<string, unknown>) =>
  ["id", "guid"]
    .flatMap((path) => _.get(feedItem, path))
    .map((value) => _.isObject(value) ? _.get(value, "#text") : value)
    .filter((value) =>
      typeof value === "string" && value.trim().length > 0 ||
      typeof value === "number"
    )
    .map((value) => typeof value === "string" ? value.trim() : value)
    .at(0);

const resolveFeedItemImage = (feedItem: Record<string, unknown>) => {
  const imgFromEnclosures = findImageInEnclosures(
    resolveFeedItemEnclosures(feedItem),
  );

  if (
    typeof imgFromEnclosures === "string" && imgFromEnclosures.trim().length > 0
  ) return imgFromEnclosures.trim();

  const searchKeys = [
    "media:content",
    "media:thumbnail.@url",
    "media:group.media:content",
    "media:group.media:thumbnail.@url",
    "itunes:image.@href",
  ];

  const result = searchKeys
    .flatMap((path) => _.get(feedItem, path))
    .filter((value) => typeof value === "string" || _.isObject(value))
    .map((value) => {
      if (typeof value === "string") {
        return value;
      }

      const url = (_.get(value, "@src") ?? _.get(value, "@url") ??
        _.get(value, "@href")) as string | undefined;
      const isImageByUrl = isLinkPossiblyAImage(url ?? "");
      const type = _.get<string | undefined>(value, "@type");
      const isImgByType = ["image", "img"].some((fragment) =>
        type?.includes(fragment)
      );

      if (typeof url === "string" && (isImageByUrl || isImgByType)) {
        return url;
      }
    })
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => (value as string).trim())
    .at(0) as string | undefined;

  if (typeof result === "string" && result.length > 0) return result;

  const imageFromContent = findImageInContent(
    resolveFeedItemContent(feedItem) ?? "",
  );

  if (
    typeof imageFromContent === "string" && imageFromContent.trim().length > 0
  ) {
    return imageFromContent.trim();
  }

  const imgFromLink = resolveFeedItemLink(feedItem);

  if (typeof imgFromLink === "string" && isLinkPossiblyAImage(imgFromLink)) {
    return imgFromLink.trim();
  }
};

const resolveFeedItemTitle = (feedItem: Record<string, unknown>) =>
  ["title", "dc:title"]
    .flatMap((path) => _.get(feedItem, path))
    .map((value) => _.isObject(value) ? _.get(value, "#text") : value)
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => (value as string).trim())
    .at(0) as string | undefined;

const resolveFeedItemUpdatedAt = (feedItem: Record<string, unknown>) =>
  ["updated"]
    .flatMap((path) => _.get(feedItem, path))
    .map((value) => _.isObject(value) ? _.get(value, "#text") : value)
    .filter((value) =>
      typeof value === "string" && !Number.isNaN(new Date(value).valueOf())
    )
    .map((value) => new Date(value as string))
    .at(0);

export const resolver = (
  feed: Record<string, unknown>,
  items: Record<string, unknown>[],
) => {
  const root = unscapeEntities(resolveFeedUrl(feed));

  const result: Feed = {
    title: unscapeEntities(resolveFeedTitle(feed)),
    url: root,
    items: items
      .filter((item) => !!item)
      .map(
        (item) => {
          const link = unscapeEntities(resolveFeedItemLink(item));

          let image = normalizeUrl(
            unscapeEntities(resolveFeedItemImage(item)),
            link ?? root,
          );
          image = normalizeUrl(image, link ?? root) ?? image;

          const enclosures = resolveFeedItemEnclosures(item)
            .map(({ url, ...rest }) => ({
              ...rest,
              url: normalizeUrl(unscapeEntities(url), link ?? root) ?? url,
            }));

          let content = resolveFeedItemContent(item);
          content = normalizeContentUrls(content, link ?? root) ?? content;

          return {
            content,
            createdAt: resolveFeedItemCreatedAt(item),
            enclosures,
            link,
            id: resolveFeedItemId(item),
            image,
            title: unscapeEntities(resolveFeedItemTitle(item)),
            updatedAt: resolveFeedItemUpdatedAt(item),
          } as FeedItem;
        },
      ),
  };

  return result;
};

export const isValidXMLData: IsResolvable = (data: string) =>
  typeof data === "string" && data.trim().length > 0 &&
    isXMLValid(data) === true
    ? { success: true, data: parseXml(data) as Record<string, unknown> }
    : { success: false };

export const atomFeedIsResolvable = (feed: Record<string, unknown>): boolean =>
  _.isObject(_.get(feed, "feed")) && !_.isEmpty(_.get(feed, "feed.entry"));

export const atomFeedResolver: FeedResolver = (
  feed: Record<string, unknown>,
) => {
  const data = _.get(feed, "feed") as Record<string, unknown>;

  return resolver(
    data,
    Array.isArray(data.entry)
      ? data.entry
      : [data.entry] as Record<string, unknown>[],
  );
};

export const rssFeedIsResolvable = (feed: Record<string, unknown>): boolean =>
  _.isObject(_.get(feed, "rss")) && !_.isEmpty(_.get(feed, "rss.channel"));

export const rssFeedResolver: FeedResolver = (
  feed: Record<string, unknown>,
) => {
  const data = _.get(feed, "rss.channel") as Record<string, unknown>;

  return resolver(
    data,
    Array.isArray(data.item)
      ? data.item
      : [data.item] as Record<string, unknown>[],
  );
};

export const rdfFeedIsResolvable = (feed: Record<string, unknown>): boolean =>
  _.isObject(_.get(feed, "rdf:rdf")) &&
  !_.isEmpty(_.get(feed, "rdf:rdf.channel")) &&
  !_.isEmpty(_.get(feed, "rdf:rdf.item"));

export const rdfFeedResolver: FeedResolver = (
  feed: Record<string, unknown>,
) => {
  const channel = _.get(feed, "rdf:rdf.channel") as Record<string, unknown>;
  const items = _.get(feed, "rdf:rdf.item") as Record<string, unknown> | Record<
    string,
    unknown
  >[];

  return resolver(channel, Array.isArray(items) ? items : [items]);
};
