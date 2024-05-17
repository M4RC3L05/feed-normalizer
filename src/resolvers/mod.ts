export {
  isResolvable as jsonFeedIsResolvable,
  resolver as jsonFeedResolver,
} from "./json-feed-resolver.ts";
export type { FeedResolver } from "./types.ts";
export {
  atomFeedIsResolvable,
  atomFeedResolver,
  rdfFeedIsResolvable,
  rdfFeedResolver,
  rssFeedIsResolvable,
  rssFeedResolver,
} from "./xml-feed-resolver.ts";
