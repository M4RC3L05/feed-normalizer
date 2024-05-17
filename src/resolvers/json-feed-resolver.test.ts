import { isResolvable, resolver } from "./json-feed-resolver.ts";
import { assertEquals, assertSnapshot, describe, it } from "../test_deps.ts";

describe("isResolvable()", () => {
  it("should return false if not a valid json feed", () => {
    assertEquals(isResolvable(""), false);

    assertEquals(isResolvable("{}"), false);
  });

  it("should return true if a valid json feed", () => {
    assertEquals(isResolvable('{"items": []}'), true);
  });
});

describe("resolver()", () => {
  describe("feed", () => {
    describe("title", () => {
      it("should not resolve the feed title id value is invalid", () => {
        assertEquals(
          resolver(JSON.stringify({ items: [] })).title,
          undefined,
        );
      });

      it("should resolve the feed title", () => {
        assertEquals(
          resolver(JSON.stringify({ items: [], title: "foo" })).title,
          "foo",
        );
      });
    });

    describe("url", () => {
      it("should not resolve the feed url id value is invalid", () => {
        assertEquals(
          resolver(JSON.stringify({ items: [] })).url,
          undefined,
        );
      });

      it("should resolve the feed url", () => {
        assertEquals(
          resolver(JSON.stringify({ items: [], home_page_url: "foo" })).url,
          "foo",
        );
      });
    });

    describe("items", () => {
      describe("createdAt", () => {
        it("should not resolve feed item created at if the value is not a valid date", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ date_published: "" }] }))
              .items[0].createdAt,
            undefined,
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ date_published: "foo" }] }))
              .items[0].createdAt,
            undefined,
          );
        });

        it("should resolve feed item created at", () => {
          assertEquals(
            resolver(
              JSON.stringify({
                items: [{ date_published: "2023-03-28T00:00:00Z" }],
              }),
            )
              .items[0].createdAt,
            new Date("2023-03-28T00:00:00Z"),
          );
        });
      });

      describe("content", () => {
        it("should not resolve feed item content if the value is not valid", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{}] }))
              .items[0].content,
            undefined,
          );
        });

        it("should resolve feed item content", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ content_html: "foo" }] }))
              .items[0].content,
            "foo",
          );
          assertEquals(
            resolver(JSON.stringify({ items: [{ content_text: "foo" }] }))
              .items[0].content,
            "foo",
          );
          assertEquals(
            resolver(JSON.stringify({ items: [{ summary: "foo" }] }))
              .items[0].content,
            "foo",
          );
          assertEquals(
            resolver(
              JSON.stringify({
                items: [{
                  content_html: "foo",
                  content_text: "bar",
                  summary: "biz",
                }],
              }),
            )
              .items[0].content,
            "foo",
          );
          assertEquals(
            resolver(
              JSON.stringify({
                items: [{
                  content_text: "bar",
                  summary: "biz",
                }],
              }),
            )
              .items[0].content,
            "bar",
          );
          assertEquals(
            resolver(
              JSON.stringify({
                items: [{
                  content_html: undefined,
                  content_text: "bar",
                  summary: "biz",
                }],
              }),
            )
              .items[0].content,
            "bar",
          );
        });
      });

      describe("enclosures", () => {
        it("should not resolve feed item enclosures if the value is not valid", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{}] }))
              .items[0].enclosures,
            [],
          );

          assertEquals(
            resolver(
              JSON.stringify({ items: [{ attachments: [{ foo: "bar" }] }] }),
            )
              .items[0].enclosures,
            [],
          );

          assertEquals(
            resolver(
              JSON.stringify({ items: [{ attachments: [{ type: "bar" }] }] }),
            )
              .items[0].enclosures,
            [],
          );
        });

        it("should resolve feed item enclosures", () => {
          assertEquals(
            resolver(
              JSON.stringify({
                items: [{
                  attachments: [{ url: "foo.png", mime_type: "image/png" }],
                }],
              }),
            )
              .items[0].enclosures,
            [{ type: "image/png", url: "foo.png" }],
          );

          assertEquals(
            resolver(
              JSON.stringify({
                items: [{
                  attachments: [{ url: "foo.png", mime_type: "image/png" }, {
                    url: "bar.mp3",
                  }],
                }],
              }),
            )
              .items[0].enclosures,
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
            resolver(JSON.stringify({ items: [{}] }))
              .items[0].id,
            undefined,
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ id: "" }] }))
              .items[0].id,
            undefined,
          );
        });

        it("should resolve feed item id", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ id: "foo" }] }))
              .items[0].id,
            "foo",
          );
        });
      });

      describe("image", () => {
        it("should not resolve feed item image if the value is not valid", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{}] }))
              .items[0].image,
            undefined,
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ image: "" }] }))
              .items[0].image,
            undefined,
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ banner_image: "" }] }))
              .items[0].image,
            undefined,
          );
        });

        it("should resolve feed item image from `image`", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ image: "foo" }] }))
              .items[0].image,
            "foo",
          );
        });

        it("should resolve feed item image from `image`", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ banner_image: "foo" }] }))
              .items[0].image,
            "foo",
          );
        });

        it("should resolve feed item image from `enclosures`", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ attachments: [] }] }))
              .items[0].image,
            undefined,
          );

          assertEquals(
            resolver(
              JSON.stringify({
                items: [{ attachments: [{ mime_type: "foo", url: "bar" }] }],
              }),
            )
              .items[0].image,
            undefined,
          );

          assertEquals(
            resolver(
              JSON.stringify({
                items: [{
                  attachments: [{ mime_type: "foo", url: "bar.png" }],
                }],
              }),
            )
              .items[0].image,
            "bar.png",
          );

          assertEquals(
            resolver(
              JSON.stringify({
                items: [{
                  attachments: [{ mime_type: "image/png", url: "bar" }],
                }],
              }),
            )
              .items[0].image,
            "bar",
          );

          assertEquals(
            resolver(
              JSON.stringify({
                items: [{
                  attachments: [{ url: "bar" }],
                }],
              }),
            )
              .items[0].image,
            undefined,
          );

          assertEquals(
            resolver(
              JSON.stringify({
                items: [{
                  attachments: [{ url: "bar.jpg" }],
                }],
              }),
            )
              .items[0].image,
            "bar.jpg",
          );
        });

        it("should resolve feed item image from `content`", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ content_html: "" }] }))
              .items[0].image,
            undefined,
          );

          assertEquals(
            resolver(
              JSON.stringify({ items: [{ content_html: `<p>foo</p>` }] }),
            )
              .items[0].image,
            undefined,
          );

          assertEquals(
            resolver(
              JSON.stringify({
                items: [{ content_html: `<p>foo</p> <img src="foo.png" />` }],
              }),
            )
              .items[0].image,
            "foo.png",
          );

          assertEquals(
            resolver(
              JSON.stringify({
                items: [{
                  content_html:
                    `<p>foo</p> <img src="biz.png" /> <img src="foo.png" />`,
                }],
              }),
            )
              .items[0].image,
            "biz.png",
          );
        });

        it("should resolve feed item image from `link`", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ url: "" }] }))
              .items[0].image,
            undefined,
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ url: "foo" }] }))
              .items[0].image,
            undefined,
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ url: "foo.png" }] }))
              .items[0].image,
            "foo.png",
          );
        });
      });

      describe("link", () => {
        it("should not resolve feed item link if the value is not valid", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{}] }))
              .items[0].link,
            undefined,
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ url: "" }] }))
              .items[0].link,
            undefined,
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ external_url: "" }] }))
              .items[0].link,
            undefined,
          );
        });

        it("should resolve feed item link", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ url: "foo" }] }))
              .items[0].link,
            "foo",
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ external_url: "foo" }] }))
              .items[0].link,
            "foo",
          );

          assertEquals(
            resolver(
              JSON.stringify({ items: [{ url: "bar", external_url: "foo" }] }),
            )
              .items[0].link,
            "bar",
          );
        });
      });

      describe("title", () => {
        it("should not resolve feed item link if the value is not valid", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{}] }))
              .items[0].title,
            undefined,
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ title: "" }] }))
              .items[0].title,
            undefined,
          );
        });

        it("should resolve feed item title", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ title: "foo" }] }))
              .items[0].title,
            "foo",
          );
        });
      });

      describe("updatedAt", () => {
        it("should not resolve feed item created at if the value is not a valid date", () => {
          assertEquals(
            resolver(JSON.stringify({ items: [{ date_modified: "" }] }))
              .items[0].updatedAt,
            undefined,
          );

          assertEquals(
            resolver(JSON.stringify({ items: [{ date_modified: "foo" }] }))
              .items[0].updatedAt,
            undefined,
          );
        });

        it("should resolve feed item created at", () => {
          assertEquals(
            resolver(
              JSON.stringify({
                items: [{ date_modified: "2023-03-28T00:00:00Z" }],
              }),
            )
              .items[0].updatedAt,
            new Date("2023-03-28T00:00:00Z"),
          );
        });
      });
    });
  });

  it("should be able to resolve a spec compliant json feed", async (test) => {
    await assertSnapshot(
      test,
      resolver(JSON.stringify({
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
      })),
    );
  });
});
