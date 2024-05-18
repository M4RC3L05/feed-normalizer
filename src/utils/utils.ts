import { unescape } from "../deps.ts";

// Ref: https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
export const webImageFileExtensions = [
  // APNG
  ".apng",

  // AVIF
  ".avif",

  // GIF
  ".gif",

  // JPEG
  ".jpg",
  ".jpeg",
  ".jfif",
  ".pjpeg",
  ".pjp",

  // PNG
  ".png",

  // SVG
  ".svg",

  // WebP
  ".webp",
];

export const normalizeUrl = (url?: string, base?: string) => {
  if (!url || url.startsWith("http")) {
    return url;
  } else {
    return URL.parse(url, base)?.toString() ?? url;
  }
};

export const normalizeContentUrls = (content?: string, base?: string) => {
  if (!content || content.trim().length <= 0) return content;

  const regexes = [
    /<img[^>]+src="([^"]+)"/img,
    /<audio[^>]+src="([^"]+)"/img,
    /<source[^>]+src="([^"]+)"/img,
    /<video[^>]+src="([^"]+)"/img,
    /<video[^>]+poster="([^"]+)"/img,
    /<iframe[^>]+src="([^"]+)"/img,
    /<a[^>]+href="([^"]+)"/img,
  ];

  for (const re of regexes) {
    content = content.replaceAll(
      re,
      (str, url) => str.replace(url, normalizeUrl(url, base) ?? url),
    );
  }

  return content;
};

export const isLinkPossiblyAImage = (link: string) =>
  webImageFileExtensions.some((ext) => link.toLowerCase().includes(ext));

export const findImageInEnclosures = (
  enclosures: { url: string; type?: string }[],
) =>
  enclosures.find(({ type, url }) => {
    const hasUrl = typeof url === "string" && url.trim().length > 0;
    const isImgByType = ["image", "img"].some((fragment) =>
      type?.includes(fragment)
    );
    const isImageByUrl = isLinkPossiblyAImage(url);

    return hasUrl && (isImgByType || isImageByUrl);
  })?.url;

export const findImageInContent = (content: string) => {
  const r = /<img[^>]+src=["']([^"']+)["']/img;
  const match = r.exec(content);

  if (match?.[1]) {
    return match[1];
  }
};

export const unscapeEntities = <T>(data: T): T =>
  (typeof data === "string" ? unescape(data) : data) as T;
