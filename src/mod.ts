import {
  atomFeedIsResolvable,
  atomFeedResolver,
  type FeedResolver,
  jsonFeedIsResolvable,
  jsonFeedResolver,
  rdfFeedIsResolvable,
  rdfFeedResolver,
  rssFeedIsResolvable,
  rssFeedResolver,
} from "./resolvers/mod.ts";

export const resolve: FeedResolver = (data: string) => {
  if (jsonFeedIsResolvable(data)) return jsonFeedResolver(data);
  else if (atomFeedIsResolvable(data)) return atomFeedResolver(data);
  else if (rssFeedIsResolvable(data)) return rssFeedResolver(data);
  else if (rdfFeedIsResolvable(data)) return rdfFeedResolver(data);
  else throw new Error("Could not find suitable feed resolve for given data");
};
