import {
  atomFeedIsResolvable,
  atomFeedResolver,
  type Feed,
  isValidJsonData,
  isValidXMLData,
  jsonFeedIsResolvable,
  jsonFeedResolver,
  rdfFeedIsResolvable,
  rdfFeedResolver,
  rssFeedIsResolvable,
  rssFeedResolver,
} from "./resolvers/mod.ts";

export const resolve = (payload: string): Feed => {
  const jsonResponse = isValidJsonData(payload);

  if (jsonResponse.success) {
    if (jsonFeedIsResolvable(jsonResponse.data)) {
      return jsonFeedResolver(jsonResponse.data);
    }
  }

  const xmlResponse = isValidXMLData(payload);

  if (xmlResponse.success) {
    if (atomFeedIsResolvable(xmlResponse.data)) {
      return atomFeedResolver(xmlResponse.data);
    }

    if (rssFeedIsResolvable(xmlResponse.data)) {
      return rssFeedResolver(xmlResponse.data);
    }

    if (rdfFeedIsResolvable(xmlResponse.data)) {
      return rdfFeedResolver(xmlResponse.data);
    }
  }

  throw new Error("Could not find suitable feed resolve for given data");
};
