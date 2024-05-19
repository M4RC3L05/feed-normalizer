import type { Feed, FeedItem, FeedResolver, IsResolvable } from "./types.ts";
import {
  findImageInContent,
  findImageInEnclosures,
  isLinkPossiblyAImage,
  normalizeContentUrls,
  normalizeUrl,
  unscapeEntities,
} from "../utils/utils.ts";

const resolveFeedItemId = (feedItem: Record<string, unknown>) => {
  const value = feedItem?.id as string | undefined;

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
};

const resolveFeedItemLink = (feedItem: Record<string, unknown>) => {
  const value = (feedItem?.url ?? feedItem?.external_url) as string | undefined;

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
};

const resolveFeedItemTitle = (feedItem: Record<string, unknown>) => {
  const value = (feedItem?.title as string | undefined)?.trim();

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
};

const resolveFeedItemEnclosures = (feedItem: Record<string, unknown>) =>
  (
    feedItem?.attachments as { url?: string; mime_type?: string }[] ??
      []
  )
    .filter(({ url }) => url !== null && url !== undefined)
    .map(({ mime_type, url }) => ({
      url: url!.trim(),
      type: mime_type?.trim(),
    }));

const resolveFeedItemImage = (feedItem: Record<string, unknown>) => {
  const image = feedItem?.image as string | undefined;

  if (typeof image === "string" && image.trim().length > 0) return image.trim();

  const banner = feedItem?.banner_image as string;

  if (typeof banner === "string" && banner.trim().length > 0) {
    return banner.trim();
  }

  const imgFromEnclosures = findImageInEnclosures(
    resolveFeedItemEnclosures(feedItem),
  );

  if (imgFromEnclosures && imgFromEnclosures.trim().length > 0) {
    return imgFromEnclosures.trim();
  }

  const imageFromContent = findImageInContent(
    resolveFeedItemContent(feedItem) ?? "",
  );

  if (imageFromContent && imageFromContent.trim().length > 0) {
    return imageFromContent.trim();
  }

  const imgFromLink = resolveFeedItemLink(feedItem);

  if (typeof imgFromLink === "string" && isLinkPossiblyAImage(imgFromLink)) {
    return imgFromLink.trim();
  }
};

const resolveFeedItemContent = (feedItem: Record<string, unknown>) =>
  ((feedItem?.content_html ?? feedItem?.content_text ??
    feedItem?.summary) as string | undefined)?.trim();

const resolveFeedItemPubDate = (feedItem: Record<string, unknown>) => {
  if (
    typeof feedItem?.date_published !== "string" ||
    Number.isNaN(new Date(feedItem?.date_published).valueOf())
  ) return;

  return new Date(feedItem.date_published);
};

const resolveUpdatedAt = (feedItem: Record<string, unknown>) => {
  if (
    typeof feedItem?.date_modified !== "string" ||
    Number.isNaN(new Date(feedItem?.date_modified).valueOf())
  ) return;

  return new Date(feedItem.date_modified);
};

export const jsonFeedResolver: FeedResolver = (
  feed: Record<string, unknown>,
) => {
  const root = unscapeEntities(
    typeof feed.home_page_url === "string" &&
      feed.home_page_url.trim().length > 0
      ? feed.home_page_url.trim()
      : undefined,
  );

  const result: Feed = {
    title: unscapeEntities(
      typeof feed.title === "string" && feed.title.trim().length > 0
        ? feed.title.trim()
        : undefined,
    ),
    url: root,
    items: (Array.isArray(feed.items) ? feed.items : []).map((
      item: Record<string, unknown>,
    ) => {
      const link = unscapeEntities(resolveFeedItemLink(item));

      let image = unscapeEntities(resolveFeedItemImage(item));
      image = normalizeUrl(image, link ?? root) ??
        image;

      const enclosures = resolveFeedItemEnclosures(item).map((
        { url, ...rest },
      ) => ({
        ...rest,
        url: normalizeUrl(unscapeEntities(url), link ?? root) ?? url,
      }));

      let content = resolveFeedItemContent(item);
      content = normalizeContentUrls(content, link ?? root) ?? content;

      return ({
        createdAt: resolveFeedItemPubDate(item),
        content,
        enclosures,
        id: resolveFeedItemId(item),
        image,
        link,
        title: unscapeEntities(resolveFeedItemTitle(item)),
        updatedAt: resolveUpdatedAt(item),
      } as FeedItem);
    }),
  };

  return result;
};

export const isValidJsonData: IsResolvable = (data: unknown) => {
  try {
    // deno-lint-ignore no-explicit-any
    return { success: true, data: JSON.parse(data as any) };
  } catch {
    return { success: false };
  }
};

export const jsonFeedIsResolvable = (feed: Record<string, unknown>): boolean =>
  Array.isArray(feed?.items);
