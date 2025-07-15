import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";
import type {
  Feed,
  FeedItem,
  FeedResolver,
  IsResolvable,
  ParsedFeed,
  ParsedFeedItem,
} from "./types.ts";
import {
  findImageInContent,
  isObject,
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
    processEntities: false,
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    textNodeName: "#text",
    transformTagName: (name) => name.toLowerCase(),
    transformAttributeName: (name) => name.toLowerCase(),
  }).parse(data);

const stringyfyXML = (data: Record<string, unknown>) =>
  new XMLBuilder({
    processEntities: false,
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    textNodeName: "#text",
  }).build(data);

const resolveFeedTitle = (feed: ParsedFeed) =>
  unscapeEntities(
    [feed?.title]
      .flat()
      .map((value) => value?.["#text"] ?? value)
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value: string) => value.trim())
      .at(0),
  );

const resolveFeedUrl = (feed: ParsedFeed) =>
  unscapeEntities(
    [feed.link, feed["atom:link"]]
      .flat()
      .map((value) =>
        typeof value === "string"
          ? value
          : value?.["@rel"] === "alternate"
          ? value?.["@href"]
          : !value?.["@rel"] && !value?.["#text"]
          ? value?.["@href"]
          : value?.["#text"]
      )
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value: string) => value.trim())
      .at(0),
  );

const resolveFeedItemContent = (feedItem: ParsedFeedItem) => {
  return unscapeEntities(
    [
      feedItem.content,
      feedItem["content:encoded"],
      feedItem.summary,
      feedItem.description,
      feedItem["media:group"]?.["media:description"],
      feedItem["dc:description"],
    ]
      .flat()
      // Make html contents be with higher priority.
      .toSorted((a, b) => {
        const aWithHtml = a?.["@type"]?.includes?.("html");
        const bWithHtml = b?.["@type"]?.includes?.("html");

        if (aWithHtml && bWithHtml) return 0;
        if (aWithHtml) return -1;
        if (bWithHtml) return 1;
        return 0;
      })
      .map((value) =>
        // Parse xhtml object
        typeof value?.["@type"] === "string" &&
          value["@type"].includes?.("html")
          ? stringyfyXML(value)
          : (value?.["#text"] ?? value)
      )
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value: string) => value.trim())
      .at(0),
  );
};

const resolveFeedItemCreatedAt = (feedItem: ParsedFeedItem) =>
  unscapeEntities(
    [feedItem.published, feedItem.pubdate, feedItem["dc:date"]]
      .flat()
      .map((value) => value?.["#text"] ?? value)
      .filter((value) =>
        typeof value === "string" && !Number.isNaN(new Date(value).valueOf())
      )
      .map((value: string) => new Date(value))
      .at(0),
  );

const resolveFeedItemEnclosures = (feedItem: ParsedFeedItem) =>
  [feedItem.enclosure, feedItem.link]
    .flat()
    .filter((value) =>
      isObject(value) && !!value?.["@rel"]
        ? value["@rel"]?.includes?.("enclosure")
        : isObject(value)
    )
    .map((value) => ({
      url: unscapeEntities(
        (value?.["@href"] ?? value?.["@url"]) as string | undefined,
      ),
      type: unscapeEntities(value?.["@type"] as string | undefined),
      title: unscapeEntities(value?.["@title"] as string | undefined),
    }))
    .filter(({ url }) => url !== null && url !== undefined) as {
      url: string;
      type: string | undefined;
      title: string | undefined;
    }[];

const resolveFeedItemLink = (feedItem: ParsedFeedItem) =>
  unscapeEntities(
    [feedItem.link]
      .flat()
      .filter((value) => typeof value === "string" || isObject(value))
      .map((value) =>
        typeof value === "string"
          ? value
          : value?.["@href"] ?? value?.["@url"] ?? value?.["#text"]
      )
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value: string) => value.trim())
      .at(0),
  );

const resolveFeedItemId = (feedItem: ParsedFeedItem) =>
  unscapeEntities(
    [feedItem.id, feedItem.guid]
      .flat()
      .map((value) => isObject(value) ? value?.["#text"] : value)
      .filter((value) =>
        typeof value === "string" && value.trim().length > 0 ||
        typeof value === "number"
      )
      .map((value) => typeof value === "string" ? value.trim() : value)
      .at(0),
  );

const resolveFeedItemImage = (feedItem: ParsedFeedItem) => {
  const imgFromEnclosures = findImageInEnclosures(
    resolveFeedItemEnclosures(feedItem),
  );

  if (
    typeof imgFromEnclosures === "string" && imgFromEnclosures.trim().length > 0
  ) return imgFromEnclosures.trim();

  const result = unscapeEntities(
    [
      feedItem["media:content"],
      feedItem["media:thumbnail"],
      feedItem["media:group"]?.["media:content"],
      feedItem["media:group"]?.["media:thumbnail"],
      feedItem["itunes:image"],
    ]
      .flat()
      .filter((value) => typeof value === "string" || isObject(value))
      .map((value) => {
        if (typeof value === "string") {
          return value;
        }

        const url = value?.["@src"] ?? value?.["@url"] ?? value?.["@href"];
        const isImageByUrl = isLinkPossiblyAImage(url ?? "");
        const type = value?.["@type"];
        const isImgByType = ["image", "img"].some((fragment) =>
          type?.includes(fragment)
        );
        const medium = value?.["@medium"];
        const isImgByMedium = ["image", "img"].some((fragment) =>
          medium?.includes(fragment)
        );

        if (
          typeof url === "string" &&
          (isImageByUrl || isImgByType || isImgByMedium)
        ) {
          return url;
        }
      })
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value) => (value as string).trim())
      .at(0),
  );

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

const resolveFeedItemTitle = (feedItem: ParsedFeedItem) =>
  unscapeEntities(
    [feedItem.title, feedItem["dc:title"]]
      .flat()
      .map((value) => isObject(value) ? value?.["#text"] : value)
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value: string) => value.trim())
      .at(0),
  );

const resolveFeedItemUpdatedAt = (feedItem: ParsedFeedItem) =>
  unscapeEntities(
    [feedItem.updated]
      .flat()
      .map((value) => isObject(value) ? value?.["#text"] : value)
      .filter((value) =>
        typeof value === "string" && !Number.isNaN(new Date(value).valueOf())
      )
      .map((value: string) => new Date(value))
      .at(0),
  );

export const resolver = (
  feed: Record<string, unknown>,
  items: Record<string, unknown>[],
) => {
  const root = resolveFeedUrl(feed);

  const result: Feed = {
    title: resolveFeedTitle(feed),
    url: root,
    items: items
      .map(
        (item) => {
          const link = normalizeUrl(resolveFeedItemLink(item), root);

          let image = normalizeUrl(resolveFeedItemImage(item), link);
          image = normalizeUrl(image, link) ?? image;

          const enclosures = resolveFeedItemEnclosures(item)
            .map(({ url, ...rest }) => ({
              ...rest,
              url: normalizeUrl(url, link) ?? url,
            }));

          let content = resolveFeedItemContent(item);
          content = normalizeContentUrls(content, link);

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

export const isValidXMLData: IsResolvable = (data: string) => {
  return typeof data === "string" && data.trim().length > 0 &&
      isXMLValid(data) === true
    ? { success: true, data: parseXml(data) as Record<string, unknown> }
    : { success: false };
};

export const atomFeedIsResolvable = (feed: Record<string, unknown>) => {
  return isObject(feed?.feed);
};

export const atomFeedResolver: FeedResolver = (
  feed: Record<string, unknown>,
) => {
  const data = feed?.feed as Record<string, unknown>;

  return resolver(
    data,
    Array.isArray(data?.entry)
      ? data.entry.filter((item) => isObject(item))
      : [data?.entry].filter((item) => isObject(item)) as Record<
        string,
        unknown
      >[],
  );
};

export const rssFeedIsResolvable = (feed: Record<string, unknown>): boolean => {
  return isObject(feed?.rss);
};

export const rssFeedResolver: FeedResolver = (
  feed: Record<string, unknown>,
) => {
  const data = (feed?.rss as Record<string, unknown>)?.channel as Record<
    string,
    unknown
  >;

  return resolver(
    data,
    Array.isArray(data?.item)
      ? data.item.filter((item) => isObject(item))
      : [data?.item].filter((item) => isObject(item)) as Record<
        string,
        unknown
      >[],
  );
};

export const rdfFeedIsResolvable = (feed: Record<string, unknown>): boolean => {
  return isObject(feed?.["rdf:rdf"]);
};

export const rdfFeedResolver: FeedResolver = (
  feed: Record<string, unknown>,
) => {
  const channel = (feed?.["rdf:rdf"] as Record<string, unknown>)
    ?.channel as Record<string, unknown>;
  const items = (feed?.["rdf:rdf"] as Record<string, unknown>)?.item;

  return resolver(
    channel,
    Array.isArray(items)
      ? items.filter((item) => isObject(item))
      : [items].filter((item) => isObject(item)),
  );
};
