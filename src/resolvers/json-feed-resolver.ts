import type { Feed, FeedItem, FeedResolver, IsResolvable } from "./types.ts";
import {
  findImageInContent,
  findImageInEnclosures,
  isLinkPossiblyAImage,
  normalizeContentUrls,
  normalizeUrl,
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

export const resolver: FeedResolver = (feed: string) => {
  const data = JSON.parse(feed);

  const result: Feed = {
    title: data.title,
    url: data.home_page_url,
    items: (Array.isArray(data.items) ? data.items : []).map((
      item: Record<string, unknown>,
    ) => {
      const link = resolveFeedItemLink(item);

      let image = resolveFeedItemImage(item);
      image = normalizeUrl(image, link ?? data.home_page_url) ?? image;

      const enclosures = resolveFeedItemEnclosures(item)
        .map(({ url, ...rest }) => ({
          ...rest,
          url: normalizeUrl(url, link ?? data.home_page_url) ?? url,
        }));

      let content = resolveFeedItemContent(item);
      content = normalizeContentUrls(content, link ?? data.home_page_url) ??
        content;

      return ({
        createdAt: resolveFeedItemPubDate(item),
        content,
        enclosures,
        id: resolveFeedItemId(item),
        image,
        link,
        title: resolveFeedItemTitle(item),
        updatedAt: resolveUpdatedAt(item),
      } as FeedItem);
    }),
  };

  return result;
};

const isJson = (data: unknown) => {
  try {
    // deno-lint-ignore no-explicit-any
    JSON.parse(data as any);
    return true;
  } catch {
    return false;
  }
};

export const isResolvable: IsResolvable = (feedData) =>
  isJson(feedData) && Array.isArray(JSON.parse(feedData).items);
