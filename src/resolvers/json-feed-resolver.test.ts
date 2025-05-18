import { describe, it } from "@std/testing/bdd";
import { assertSnapshot } from "@std/testing/snapshot";
import { assertEquals } from "@std/assert";
import {
  isValidJsonData,
  jsonFeedIsResolvable,
  jsonFeedResolver,
} from "./json-feed-resolver.ts";

describe("isValidJsonData()", () => {
  it("shold validate it is a valid json", () => {
    assertEquals(isValidJsonData(""), { success: false });

    assertEquals(isValidJsonData("{"), { success: false });

    assertEquals(isValidJsonData("{}"), { success: true, data: {} });
  });
});

describe("jsonFeedIsResolvable()", () => {
  it("should return false if not a valid json feed", () => {
    assertEquals(jsonFeedIsResolvable({}), false);
  });

  it("should return true if a valid json feed", () => {
    assertEquals(jsonFeedIsResolvable({ "items": [] }), true);
  });
});
describe("jsonFeedResolver()", () => {
  describe("feed", () => {
    describe("title", () => {
      it("should not resolve the feed title id value is invalid", () => {
        assertEquals(jsonFeedResolver({ items: [] }).title, undefined);
      });

      it("should resolve the feed title", () => {
        assertEquals(
          jsonFeedResolver({ items: [], title: "foo" }).title,
          "foo",
        );
      });
    });
    describe("url", () => {
      it("should not resolve the feed url id value is invalid", () => {
        assertEquals(jsonFeedResolver({ items: [] }).url, undefined);
      });

      it("should resolve the feed url", () => {
        assertEquals(
          jsonFeedResolver({ items: [], home_page_url: "foo" }).url,
          "foo",
        );
      });
    });

    describe("items", () => {
      describe("createdAt", () => {
        it("should not resolve feed item created at if the value is not a valid date", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ date_published: "" }] }).items[0]
              .createdAt,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ date_published: "foo" }] }).items[0]
              .createdAt,
            undefined,
          );
        });

        it("should resolve feed item created at", () => {
          assertEquals(
            jsonFeedResolver({
              items: [{ date_published: "2023-03-28T00:00:00Z" }],
            }).items[0].createdAt,
            new Date("2023-03-28T00:00:00Z"),
          );
        });
      });

      describe("content", () => {
        it("should not resolve feed item content if the value is not valid", () => {
          assertEquals(
            jsonFeedResolver({ items: [{}] }).items[0].content,
            undefined,
          );
        });

        it("should resolve feed item content", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ content_html: "foo" }] }).items[0]
              .content,
            "foo",
          );

          assertEquals(
            jsonFeedResolver({ items: [{ content_text: "foo" }] }).items[0]
              .content,
            "foo",
          );

          assertEquals(
            jsonFeedResolver({ items: [{ summary: "foo" }] }).items[0].content,
            "foo",
          );

          assertEquals(
            jsonFeedResolver({
              items: [{
                content_html: "foo",
                content_text: "bar",
                summary: "biz",
              }],
            }).items[0].content,
            "foo",
          );

          assertEquals(
            jsonFeedResolver({
              items: [{ content_text: "bar", summary: "biz" }],
            }).items[0].content,
            "bar",
          );

          assertEquals(
            jsonFeedResolver({
              items: [{
                content_html: undefined,
                content_text: "bar",
                summary: "biz",
              }],
            }).items[0].content,
            "bar",
          );
        });
      });

      describe("enclosures", () => {
        it("should not resolve feed item enclosures if the value is not valid", () => {
          assertEquals(
            jsonFeedResolver({ items: [{}] }).items[0].enclosures,
            [],
          );

          assertEquals(
            jsonFeedResolver({ items: [{ attachments: [{ foo: "bar" }] }] })
              .items[0].enclosures,
            [],
          );

          assertEquals(
            jsonFeedResolver({ items: [{ attachments: [{ type: "bar" }] }] })
              .items[0].enclosures,
            [],
          );
        });

        it("should resolve feed item enclosures", () => {
          assertEquals(
            jsonFeedResolver({
              items: [{
                attachments: [{ url: "foo.png", mime_type: "image/png" }],
              }],
            }).items[0].enclosures,
            [{ type: "image/png", url: "foo.png" }],
          );

          assertEquals(
            jsonFeedResolver({
              items: [{
                attachments: [{ url: "foo.png", mime_type: "image/png" }, {
                  url: "bar.mp3",
                }],
              }],
            }).items[0].enclosures,
            [{ type: "image/png", url: "foo.png" }, {
              url: "bar.mp3",
              type: undefined,
            }],
          );
        });
      });

      describe("id", () => {
        it("should not resolve feed item id if the value is not valid", () => {
          assertEquals(
            jsonFeedResolver({ items: [{}] }).items[0].id,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ id: "" }] }).items[0].id,
            undefined,
          );
        });

        it("should resolve feed item id", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ id: "foo" }] }).items[0].id,
            "foo",
          );
        });
      });

      describe("image", () => {
        it("should not resolve feed item image if the value is not valid", () => {
          assertEquals(
            jsonFeedResolver({ items: [{}] }).items[0].image,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ image: "" }] }).items[0].image,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ banner_image: "" }] }).items[0].image,
            undefined,
          );
        });

        it("should resolve feed item image from `image`", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ image: "foo" }] }).items[0].image,
            "foo",
          );
        });

        it("should resolve feed item image from `image`", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ banner_image: "foo" }] }).items[0]
              .image,
            "foo",
          );
        });

        it("should resolve feed item image from `enclosures`", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ attachments: [] }] }).items[0].image,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({
              items: [{ attachments: [{ mime_type: "foo", url: "bar" }] }],
            }).items[0].image,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({
              items: [{ attachments: [{ mime_type: "foo", url: "bar.png" }] }],
            }).items[0].image,
            "bar.png",
          );

          assertEquals(
            jsonFeedResolver({
              items: [{
                attachments: [{ mime_type: "image/png", url: "bar" }],
              }],
            }).items[0].image,
            "bar",
          );

          assertEquals(
            jsonFeedResolver({ items: [{ attachments: [{ url: "bar" }] }] })
              .items[0].image,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ attachments: [{ url: "bar.jpg" }] }] })
              .items[0].image,
            "bar.jpg",
          );
        });

        it("should resolve feed item image from `content`", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ content_html: "" }] }).items[0].image,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ content_html: `<p>foo</p>` }] })
              .items[0].image,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({
              items: [{ content_html: `<p>foo</p> <img src="foo.png" />` }],
            }).items[0].image,
            "foo.png",
          );

          assertEquals(
            jsonFeedResolver({
              items: [{
                content_html:
                  `<p>foo</p> <img src="biz.png" /> <img src="foo.png" />`,
              }],
            }).items[0].image,
            "biz.png",
          );

          assertEquals(
            jsonFeedResolver({
              items: [{
                content_html:
                  `<p>foo</p> <img src=\'biz.png\' /> <img src="foo.png" />`,
              }],
            }).items[0].image,
            "biz.png",
          );
        });

        it("should resolve feed item image from `link`", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ url: "" }] }).items[0].image,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ url: "foo" }] }).items[0].image,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ url: "foo.png" }] }).items[0].image,
            "foo.png",
          );
        });
      });

      describe("link", () => {
        it("should not resolve feed item link if the value is not valid", () => {
          assertEquals(
            jsonFeedResolver({ items: [{}] }).items[0].link,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ url: "" }] }).items[0].link,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ external_url: "" }] }).items[0].link,
            undefined,
          );
        });

        it("should resolve feed item link", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ url: "foo" }] }).items[0].link,
            "foo",
          );

          assertEquals(
            jsonFeedResolver({ items: [{ external_url: "foo" }] }).items[0]
              .link,
            "foo",
          );

          assertEquals(
            jsonFeedResolver({ items: [{ url: "bar", external_url: "foo" }] })
              .items[0].link,
            "bar",
          );
        });
      });

      describe("title", () => {
        it("should not resolve feed item link if the value is not valid", () => {
          assertEquals(
            jsonFeedResolver({ items: [{}] }).items[0].title,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ title: "" }] }).items[0].title,
            undefined,
          );
        });

        it("should resolve feed item title", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ title: "foo" }] }).items[0].title,
            "foo",
          );
        });
      });
      describe("updatedAt", () => {
        it("should not resolve feed item created at if the value is not a valid date", () => {
          assertEquals(
            jsonFeedResolver({ items: [{ date_modified: "" }] }).items[0]
              .updatedAt,
            undefined,
          );

          assertEquals(
            jsonFeedResolver({ items: [{ date_modified: "foo" }] }).items[0]
              .updatedAt,
            undefined,
          );
        });

        it("should resolve feed item created at", () => {
          assertEquals(
            jsonFeedResolver({
              items: [{ date_modified: "2023-03-28T00:00:00Z" }],
            }).items[0].updatedAt,
            new Date("2023-03-28T00:00:00Z"),
          );
        });
      });
    });
  });

  it("should be able to resolve a spec compliant json feed", async (test) => {
    await assertSnapshot(
      test,
      jsonFeedResolver({
        version: "https://jsonfeed.org/version/1.1",
        title: "My Awesome Blog",
        home_page_url: "https://example.com",
        feed_url: "https://example.com/feed.json",
        description: "Sharing cool stuff and updates",
        items: [{
          id: "1",
          url: "https://example.com/post/1",
          title: "JSON Feed: A Modern Approach to RSS",
          content_html: "<p>Learn about JSON Feed and its advantages...</p>",
          summary: "A quick introduction to JSON Feed",
          author: { name: "John Doe" },
          date_published: "2024-05-16T00:00:00Z",
        }, {
          id: "2",
          url: "https://example.com/post/2",
          title: "Exploring Machine Learning with Python",
          summary: "A beginner's guide to machine learning",
          date_published: "2024-05-15T00:00:00Z",
          tags: ["machine learning", "python"],
        }, {
          id: "3",
          url: "https://example.com/post/3",
          title: "Top 10 Travel Destinations for 2024",
          summary: "A beginner's guide to machine learning",
          content_text: "Travel inspiration for the year",
          date_published: "2024-05-14T00:00:00Z",
          image: "https://example.com/post/3.jpg",
          attachments: [{
            url: "https://example.com/post/3/map.pdf",
            title: "Travel Map 2024",
          }],
          date_modified: "2024-05-14T00:00:00Z",
        }],
      }),
    );
  });
});
