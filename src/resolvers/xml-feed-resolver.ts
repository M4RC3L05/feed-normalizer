import { _, parse, stringify } from "../deps.ts";
import type { Feed, FeedItem, FeedResolver, IsResolvable } from "./types.ts";
import { findImageInContent, normalizeContentUrls } from "../utils/utils.ts";
import {
  findImageInEnclosures,
  isLinkPossiblyAImage,
  normalizeUrl,
} from "../utils/utils.ts";

const parseXml = (data: string) =>
  parse(data, {
    emptyToNull: false,
    flatten: true,
    reviveBooleans: false,
    reviveNumbers: false,
  });

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
        ? stringify(value as any)
        : _.isObject(value)
        ? _.get(value, "#text")
        : value
    )
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => (value as string).trim())
    .at(0);

const resolveFeedItemCreatedAt = (feedItem: Record<string, unknown>) =>
  ["published", "pubDate", "dc:date"]
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
    .filter((value) =>
      typeof value === "string" || (_.isObject(value) && "#text" in value) ||
      _.get(value, "@rel") === "alternate"
    )
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
      if (typeof value === "string") return value;

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
    .at(0)?.trim() as string | undefined;

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
  const root = resolveFeedUrl(feed);

  const result: Feed = {
    title: resolveFeedTitle(feed),
    url: root,
    items: items
      .filter((item) => !!item)
      .map(
        (item) => {
          const link = resolveFeedItemLink(item);

          let image = normalizeUrl(resolveFeedItemImage(item), link ?? root);
          image = normalizeUrl(image, link ?? root) ?? image;

          const enclosures = resolveFeedItemEnclosures(item)
            .map(({ url, ...rest }) => ({
              ...rest,
              url: normalizeUrl(url, link ?? root) ?? url,
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
            title: resolveFeedItemTitle(item),
            updatedAt: resolveFeedItemUpdatedAt(item),
          } as FeedItem;
        },
      ),
  };

  return result;
};

export const atomFeedResolver: FeedResolver = (feed: string) => {
  try {
    const data = parseXml(feed)?.feed as Record<string, unknown>;

    return resolver(
      data,
      Array.isArray(data.entry)
        ? data.entry
        : [data.entry] as Record<string, unknown>[],
    );
  } catch (e) {
    console.log(Deno.inspect(e));

    throw e;
  }
};

export const atomFeedIsResolvable: IsResolvable = (feedData) => {
  try {
    const data = parseXml(feedData);

    return _.isObject(_.get(data, "feed")) &&
      !_.isEmpty(_.get(data, "feed.entry"));
  } catch {
    return false;
  }
};

export const rssFeedResolver: FeedResolver = (feed: string) => {
  const data = _.get(parseXml(feed), "rss.channel") as Record<string, unknown>;

  return resolver(
    data,
    Array.isArray(data.item)
      ? data.item
      : [data.item] as Record<string, unknown>[],
  );
};

export const rssFeedIsResolvable: IsResolvable = (feedData) => {
  try {
    const data = parseXml(feedData);

    return _.isObject(_.get(data, "rss")) &&
      !_.isEmpty(_.get(data, "rss.channel"));
  } catch {
    return false;
  }
};

export const rdfFeedResolver: FeedResolver = (feed: string) => {
  const parsed = parseXml(feed);
  const channel = _.get(parsed, "rdf:RDF.channel") as Record<string, unknown>;
  const items = _.get(parsed, "rdf:RDF.item") as
    | Record<string, unknown>
    | Record<string, unknown>[];

  return resolver(
    channel,
    Array.isArray(items) ? items : [items],
  );
};

export const rdfFeedIsResolvable: IsResolvable = (feedData) => {
  try {
    const data = parseXml(feedData);

    return _.isObject(_.get(data, "rdf:RDF")) &&
      !_.isEmpty(_.get(data, "rdf:RDF.channel")) &&
      !_.isEmpty(_.get(data, "rdf:RDF.item"));
  } catch {
    return false;
  }
};
