export type Feed = {
  title: string | undefined;
  url: string | undefined;
  items: FeedItem[];
};

export type FeedItem = {
  id: string | undefined;
  link: string | undefined;
  title: string | undefined;
  enclosures: { url: string; type?: string }[];
  image: string | undefined;
  content: string | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
};

export type FeedResolver = (feedData: string) => Feed;
export type IsResolvable = (feedData: string) => boolean;
