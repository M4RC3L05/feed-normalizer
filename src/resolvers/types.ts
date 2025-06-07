export type Feed = {
  title: string | undefined;
  url: string | undefined;
  items: FeedItem[];
};

export type FeedItem = {
  id: string | undefined;
  link: string | undefined;
  title: string | undefined;
  enclosures: { url: string; type?: string; title?: string }[];
  image: string | undefined;
  content: string | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
};

export type FeedResolver = (feed: Record<string, unknown>) => Feed;
export type IsResolvable = (
  feedData: string,
) => { success: false } | { success: true; data: Record<string, unknown> };

// deno-lint-ignore no-explicit-any
export type ParsedFeed = Record<string, any>;
// deno-lint-ignore no-explicit-any
export type ParsedFeedItem = Record<string, any>;
