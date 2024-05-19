import { assertEquals, assertSnapshot, describe, it } from "../test_deps.ts";
import {
  atomFeedIsResolvable,
  atomFeedResolver,
  isValidXMLData,
  rdfFeedResolver,
  resolver,
  rssFeedResolver,
} from "./xml-feed-resolver.ts";

const xmlToObj = (data: string) =>
  (isValidXMLData(data) as { data?: Record<string, unknown> })?.data;

describe("isValidXMLData()", () => {
  it("should validate if it is a valid xml", () => {
    assertEquals(isValidXMLData(""), { success: false });

    assertEquals(isValidXMLData('<?xml version="1.0"?>'), { success: false });

    assertEquals(isValidXMLData('<?xml version="1.0"?><feed></feed>'), {
      success: true,
      data: {
        "?xml": {
          "@version": "1.0",
        },
        feed: "",
      },
    });
  });
});

describe("ATOM FEED", () => {
  describe("atomFeedIsResolvable()", () => {
    it("should return false if not a valid atom feed", () => {
      assertEquals(atomFeedIsResolvable({}), false);

      assertEquals(
        atomFeedIsResolvable(
          xmlToObj('<?xml version="1.0"?><feed></feed>')!,
        ),
        false,
      );

      assertEquals(
        atomFeedIsResolvable(
          xmlToObj('<?xml version="1.0"?><feed><entry></entry></feed>')!,
        ),
        false,
      );
    });

    it("should return true if a valid atom feed", () => {
      assertEquals(
        atomFeedIsResolvable(
          xmlToObj(
            '<?xml version="1.0"?><feed><entry>foo</entry></feed>',
          )!,
        ),
        true,
      );

      assertEquals(
        atomFeedIsResolvable(
          xmlToObj(
            '<?xml version="1.0"?><feed><entry></entry><entry></entry></feed>',
          )!,
        ),
        true,
      );
    });
  });
});

describe("resolver()", () => {
  describe("feed", () => {
    describe("title", () => {
      it("should not resolve the feed title if value is invalid", () => {
        assertEquals(
          resolver({}, [{}]).title,
          undefined,
        );

        assertEquals(
          resolver({ title: "" }, [{}]).title,
          undefined,
        );
      });

      it("should resolve the feed title", () => {
        assertEquals(
          resolver({ title: "foo" }, [{}]).title,
          "foo",
        );

        assertEquals(
          resolver({ title: { "#text": "foo" } }, [{}]).title,
          "foo",
        );
      });
    });

    describe("url", () => {
      it("should not resolve the feed url if value is invalid", () => {
        assertEquals(resolver({}, [{}]).url, undefined);

        assertEquals(resolver({ link: "" }, [{}]).url, undefined);

        assertEquals(resolver({ link: { "#text": "" } }, [{}]).url, undefined);

        assertEquals(resolver({ "atom:link": "" }, [{}]).url, undefined);

        assertEquals(
          resolver({ "atom:link": { "@href": "foo", "@rel": "bar" } }, [{}])
            .url,
          undefined,
        );
      });

      it("should resolve the feed url", () => {
        assertEquals(resolver({ link: "foo" }, [{}]).url, "foo");

        assertEquals(resolver({ link: { "#text": "foo" } }, [{}]).url, "foo");

        assertEquals(resolver({ "atom:link": "foo" }, [{}]).url, "foo");

        assertEquals(
          resolver({ "atom:link": { "@href": "foo", "@rel": "self" } }, [{}])
            .url,
          "foo",
        );

        assertEquals(
          resolver({
            "atom:link": { "@href": "foo", "@rel": "self" },
            link: "bar",
          }, [{}])
            .url,
          "bar",
        );
      });
    });

    describe("items", () => {
      describe("content", () => {
        it("should not resolve the feed content if value is invalid", () => {
          assertEquals(resolver({}, [{}]).items[0].content, undefined);

          assertEquals(
            resolver({}, [{ content: undefined }]).items[0].content,
            undefined,
          );

          assertEquals(
            resolver({}, [{ content: {} }]).items[0].content,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "content:encoded": undefined }]).items[0].content,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "content:encoded": {} }]).items[0].content,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "summary": undefined }]).items[0].content,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "summary": {} }]).items[0].content,
            undefined,
          );

          assertEquals(
            resolver({}, [{
              "media:group": { "media:description": undefined },
            }]).items[0].content,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "media:group": { "media:description": {} } }])
              .items[0].content,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "dc:description": undefined }]).items[0].content,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "dc:description": {} }]).items[0].content,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "dc:description": "" }]).items[0].content,
            undefined,
          );
        });

        it("should resolve feed content", () => {
          assertEquals(
            resolver({}, [{ content: "foo" }]).items[0].content,
            "foo",
          );

          assertEquals(
            resolver({}, [{ content: { "#text": "foo" } }]).items[0].content,
            "foo",
          );

          assertEquals(
            resolver({}, [{ "content:encoded": "foo" }]).items[0].content,
            "foo",
          );

          assertEquals(
            resolver({}, [{ "content:encoded": { "#text": "foo" } }]).items[0]
              .content,
            "foo",
          );

          assertEquals(
            resolver({}, [{ "summary": "foo" }]).items[0].content,
            "foo",
          );

          assertEquals(
            resolver({}, [{ "summary": { "#text": "foo" } }]).items[0].content,
            "foo",
          );

          assertEquals(
            resolver({}, [{
              "media:group": { "media:description": "foo" },
            }]).items[0].content,
            "foo",
          );

          assertEquals(
            resolver({}, [{
              "media:group": { "media:description": { "#text": "foo" } },
            }])
              .items[0].content,
            "foo",
          );

          assertEquals(
            resolver({}, [{ "dc:description": "foo" }]).items[0].content,
            "foo",
          );

          assertEquals(
            resolver({}, [{ "dc:description": { "#text": "foo" } }]).items[0]
              .content,
            "foo",
          );
        });

        it("should give priority to html type content", () => {
          assertEquals(
            resolver({}, [{
              "content": "bar",
              "content:encoded": { "#text": "foo", "@type": "html" },
            }]).items[0]
              .content,
            "foo",
          );

          assertEquals(
            resolver({}, [{
              "content:encoded": { "#text": "foo", "@type": "xhtml" },
              "content": { "#text": "bar", "@type": "html" },
            }]).items[0]
              .content,
            "bar",
          );

          assertEquals(
            resolver({}, [{
              "content:encoded": {
                div: { a: { "@href": "foo" }, p: { "#text": "foo" } },
                "@type": "xhtml",
              },
            }]).items[0]
              .content,
            '<div><a href="foo"></a><p>foo</p></div>',
          );
        });
      });

      describe("createdAt", () => {
        it("should not resolve the feed created at if vaue is invalid", () => {
          assertEquals(resolver({}, [{}]).items[0].createdAt, undefined);

          assertEquals(
            resolver({}, [{ published: "foo" }]).items[0].createdAt,
            undefined,
          );

          assertEquals(
            resolver({}, [{ pubDate: "foo" }]).items[0].createdAt,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "dc:date": "foo" }]).items[0].createdAt,
            undefined,
          );
        });

        it("should resolve the feed created at", () => {
          assertEquals(
            resolver({}, [{ published: "2024-01-01T00:00:00.000Z" }]).items[0]
              .createdAt,
            new Date("2024-01-01T00:00:00.000Z"),
          );

          assertEquals(
            resolver({}, [{ pubDate: "2024-01-01T00:00:00.000Z" }]).items[0]
              .createdAt,
            new Date("2024-01-01T00:00:00.000Z"),
          );

          assertEquals(
            resolver({}, [{ "dc:date": "2024-01-01T00:00:00.000Z" }]).items[0]
              .createdAt,
            new Date("2024-01-01T00:00:00.000Z"),
          );
        });
      });

      describe("enclosures", () => {
        it("should not resolve feed item enclosures if the value is not valid", () => {
          assertEquals(resolver({}, [{}]).items[0].enclosures, []);

          assertEquals(
            resolver({}, [{ enclosure: { foo: "bar" } }]).items[0].enclosures,
            [],
          );

          assertEquals(
            resolver({}, [{ enclosure: [{ foo: "bar" }] }]).items[0].enclosures,
            [],
          );

          assertEquals(
            resolver({}, [{ link: "foo" }]).items[0].enclosures,
            [],
          );
        });

        it("should resolve feed item enclosures", () => {
          assertEquals(
            resolver({}, [{ enclosure: { "@url": "bar" } }]).items[0]
              .enclosures,
            [{ url: "bar", type: undefined }],
          );

          assertEquals(
            resolver({}, [{ enclosure: { "@url": "bar", "@type": "foo" } }])
              .items[0]
              .enclosures,
            [{ url: "bar", type: "foo" }],
          );

          assertEquals(
            resolver({}, [{ enclosure: [{ "@url": "bar" }] }]).items[0]
              .enclosures,
            [{ url: "bar", type: undefined }],
          );

          assertEquals(
            resolver({}, [{ enclosure: [{ "@url": "bar", "@type": "foo" }] }])
              .items[0]
              .enclosures,
            [{ url: "bar", type: "foo" }],
          );

          assertEquals(
            resolver({}, [{ link: { "@rel": "enclosure", "@href": "foo" } }])
              .items[0].enclosures,
            [{ url: "foo", type: undefined }],
          );

          assertEquals(
            resolver({}, [{
              link: { "@rel": "enclosure", "@href": "foo", "@type": "foo" },
            }])
              .items[0].enclosures,
            [{ url: "foo", type: "foo" }],
          );
        });
      });

      describe("link", () => {
        it("should not resolve feed item link if the value is not valid", () => {
          assertEquals(resolver({}, [{}]).items[0].link, undefined);

          assertEquals(
            resolver({}, [{ link: undefined }]).items[0].link,
            undefined,
          );

          assertEquals(
            resolver({}, [{ link: { "foo": "foo" } }]).items[0].link,
            undefined,
          );
        });

        it("should resolve feed item link", () => {
          assertEquals(resolver({}, [{ link: "foo" }]).items[0].link, "foo");

          assertEquals(
            resolver({}, [{ link: { "#text": "foo" } }]).items[0].link,
            "foo",
          );

          assertEquals(
            resolver({}, [{ link: { "@rel": "alternate", "@href": "foo" } }])
              .items[0].link,
            "foo",
          );

          assertEquals(
            resolver({}, [{ link: { "@href": "foo" } }])
              .items[0].link,
            "foo",
          );

          assertEquals(
            resolver({}, [{ link: { "@rel": "alternate", "@url": "foo" } }])
              .items[0].link,
            "foo",
          );
        });
      });

      describe("id", () => {
        it("should not resolve feed item id if the value is not valid", () => {
          assertEquals(resolver({}, [{}]).items[0].id, undefined);

          assertEquals(
            resolver({}, [{ id: undefined }]).items[0].id,
            undefined,
          );

          assertEquals(
            resolver({}, [{ guid: {} }]).items[0].id,
            undefined,
          );
        });

        it("should resolve feed item id", () => {
          assertEquals(
            resolver({}, [{ id: "foo" }]).items[0].id,
            "foo",
          );

          assertEquals(
            resolver({}, [{ id: { "#text": "foo" } }]).items[0].id,
            "foo",
          );

          assertEquals(
            resolver({}, [{ guid: "foo" }]).items[0].id,
            "foo",
          );

          assertEquals(
            resolver({}, [{ guid: { "#text": "foo" } }]).items[0].id,
            "foo",
          );
        });
      });

      describe("image", () => {
        it("should not resolve feed item image if the value is not valid", () => {
          assertEquals(resolver({}, [{}]).items[0].image, undefined);

          assertEquals(
            resolver({}, [{ enclosure: [] }]).items[0].image,
            undefined,
          );

          assertEquals(
            resolver({}, [{ link: { "@rel": "enclosure", "@href": "" } }])
              .items[0].image,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "media:content": { "@url": "" } }]).items[0].image,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "media:thumbnail": { "@url": "" } }]).items[0]
              .image,
            undefined,
          );

          assertEquals(
            resolver({}, [{
              "media:group": { "media:content": { "@url": "" } },
            }]).items[0].image,
            undefined,
          );

          assertEquals(
            resolver({}, [{
              "media:group": { "media:thumbnail": { "@url": "" } },
            }]).items[0].image,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "itunes:image": { "@href": "" } }]).items[0]
              .image,
            undefined,
          );
        });

        it("should resolve feed item image from `enclosures`", () => {
          assertEquals(
            resolver({}, [{
              enclosure: [{ "@url": "foo", "@type": "image/png" }],
            }]).items[0].image,
            "foo",
          );

          assertEquals(
            resolver({}, [{
              link: { "@rel": "enclosure", "@href": "foo.png" },
            }])
              .items[0].image,
            "foo.png",
          );
        });

        it("should resolve feed item image from `tags`", () => {
          assertEquals(
            resolver({}, [{
              "media:content": { "@src": "foo", "@type": "image/png" },
            }]).items[0].image,
            "foo",
          );

          assertEquals(
            resolver({}, [{ "media:thumbnail": { "@url": "foo" } }]).items[0]
              .image,
            "foo",
          );

          assertEquals(
            resolver({}, [{
              "media:group": {
                "media:content": { "@url": "foo", "@type": "image/png" },
              },
            }]).items[0].image,
            "foo",
          );

          assertEquals(
            resolver({}, [{
              "media:group": {
                "media:thumbnail": { "@url": "foo" },
              },
            }]).items[0].image,
            "foo",
          );

          assertEquals(
            resolver({}, [{
              "media:group": {
                "media:content": {},
                "media:thumbnail": { "@url": "foo" },
              },
            }]).items[0].image,
            "foo",
          );

          assertEquals(
            resolver({}, [{ "itunes:image": { "@href": "foo" } }]).items[0]
              .image,
            "foo",
          );
        });

        it("should resolve feed item image from `content`", () => {
          assertEquals(
            resolver({}, [{ "content:encoded": undefined }]).items[0].image,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "content:encoded": "<p>oi</p>" }]).items[0].image,
            undefined,
          );

          assertEquals(
            resolver({}, [{
              "content:encoded": 'foobar <img alt="biz" src="foo" />',
            }]).items[0].image,
            "foo",
          );

          assertEquals(
            resolver({}, [{
              "content:encoded": "<img src='foo' />",
            }]).items[0].image,
            "foo",
          );
        });

        it("should resolve feed item image from `link`", () => {
          assertEquals(
            resolver({}, [{ "link": undefined }]).items[0].image,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "link": { "#text": "foo.png" } }]).items[0].image,
            "foo.png",
          );
        });
      });

      describe("title", () => {
        it("should not resolve feed item title if the value is not valid", () => {
          assertEquals(resolver({}, [{}]).items[0].title, undefined);

          assertEquals(
            resolver({}, [{ title: "" }]).items[0].title,
            undefined,
          );

          assertEquals(
            resolver({}, [{ title: { "#text": "" } }]).items[0].title,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "dc:title": "" }]).items[0].title,
            undefined,
          );

          assertEquals(
            resolver({}, [{ "dc:title": { "#text": "" } }]).items[0].title,
            undefined,
          );
        });

        it("should resolve feed item id", () => {
          assertEquals(
            resolver({}, [{ title: "foo" }]).items[0].title,
            "foo",
          );

          assertEquals(
            resolver({}, [{ title: { "#text": "foo" } }]).items[0].title,
            "foo",
          );

          assertEquals(
            resolver({}, [{ "dc:title": "foo" }]).items[0].title,
            "foo",
          );

          assertEquals(
            resolver({}, [{ "dc:title": { "#text": "foo" } }]).items[0].title,
            "foo",
          );
        });
      });

      describe("createdAt", () => {
        it("should not resolve the feed created at if vaue is invalid", () => {
          assertEquals(resolver({}, [{}]).items[0].updatedAt, undefined);

          assertEquals(
            resolver({}, [{ updated: "foo" }]).items[0].updatedAt,
            undefined,
          );
        });

        it("should resolve the feed created at", () => {
          assertEquals(
            resolver({}, [{ updated: "2024-01-01T00:00:00.000Z" }]).items[0]
              .updatedAt,
            new Date("2024-01-01T00:00:00.000Z"),
          );
        });
      });
    });
  });
});

describe("atomFeedResolver()", () => {
  it("should be able to resolve a spec compliant atom feed", async (test) => {
    await assertSnapshot(
      test,
      atomFeedResolver(
        xmlToObj(`
          <?xml version="1.0" encoding="UTF-8"?>
          <feed xmlns="http://www.w3.org/2005/Atom">
            <title>Example Atom Feed</title>
            <link href="http://example.com/feed" rel="self" type="application/atom+xml" />
            <id>urn:uuid:12345678-90ab-cdef-fedc-ba0987654321</id>
            <updated>2024-05-17T19:20:00Z</updated>

            <entry>
              <title>This is the first item title</title>
              <link href="http://example.com/item/1" rel="alternate" />
              <id>urn:uuid:11111111-2222-3333-4444-555555555555</id>
              <published>2024-05-16T10:00:00Z</published>
              <author>
                <name>John Doe</name>
              </author>
              <summary>This is a summary of the first item content.</summary>
            </entry>

            <entry>
              <title>Second item with categories</title>
              <link href="http://example.com/item/2" rel="alternate" />
              <id>urn:uuid:22222222-3333-4444-5555-666666666666</id>
              <updated>2024-05-17T15:30:00Z</updated>
              <category term="News" scheme="http://www.example.com/categories" />
              <category term="Technology" scheme="http://www.example.com/categories" />
              <content type="html">This is the full HTML content of the second item.</content>
            </entry>

            <entry>
              <title>Item with enclosure</title>
              <link href="http://example.com/item/3" rel="alternate" />
              <id>urn:uuid:33333333-4444-5555-6666-777777777777</id>
              <updated>2024-05-17T12:45:00Z</updated>
              <author>
                <name>Jane Smith</name>
              </author>
              <link href="http://example.com/audio/podcast.mp3" rel="enclosure" type="audio/mpeg" length="10245760" />
            </entry>
          </feed>
        `.trim())!,
      ),
    );
  });
});

describe("rssFeedResolver()", () => {
  it("should be able to resolve a spec compliant rss feed", async (test) => {
    await assertSnapshot(
      test,
      rssFeedResolver(
        xmlToObj(`
          <?xml version="1.0" encoding="UTF-8"?>
          <rss version="2.0">
            <channel>
              <title>Example RSS Feed</title>
              <link>http://example.com/feed</link>
              <description>This is a sample RSS feed description.</description>
              <lastBuildDate>Fri, 17 May 2024 19:20:00 Z</lastBuildDate>
          
              <item>
                <title>This is the first item title</title>
                <link>http://example.com/item/1</link>
                <guid>urn:uuid:11111111-2222-3333-4444-555555555555</guid>
                <pubDate>Thu, 16 May 2024 10:00:00 Z</pubDate>
                <author>John Doe</author>
                <description>This is a summary of the first item content.</description>
              </item>
          
              <item>
                <title>Second item with category</title>
                <link>http://example.com/item/2</link>
                <guid>urn:uuid:22222222-3333-4444-5555-666666666666</guid>
                <pubDate>Fri, 17 May 2024 15:30:00 Z</pubDate>
                <category>News</category>
                <content type="html">This is the full HTML content of the second item.</content>
              </item>
          
              <item>
                <title>Item with image enclosure</title>
                <link>http://example.com/item/3</link>
                <guid>urn:uuid:33333333-4444-5555-6666-777777777777</guid>
                <pubDate>Fri, 17 May 2024 12:45:00 Z</pubDate>
                <author>Jane Smith</author>
                <enclosure url="http://example.com/image.jpg" type="image/jpeg" />
              </item>
            </channel>
          </rss>      
        `.trim())!,
      ),
    );
  });
});

describe("rdfFeedResolver()", () => {
  it("should be able to resolve a spec compliant rdf feed", async (test) => {
    await assertSnapshot(
      test,
      rdfFeedResolver(
        xmlToObj(`
          <?xml version="1.0"?>
          <rdf:RDF 
            xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns="http://purl.org/rss/1.0/"
          >
            <channel rdf:about="http://www.xml.com/xml/news.rss">
              <title>XML.com</title>
              <link>http://xml.com/pub</link>
              <description>
                XML.com features a rich mix of information and services 
                for the XML community.
              </description>
              <image rdf:resource="http://xml.com/universal/images/xml_tiny.gif" />
              <items>
                <rdf:Seq>
                  <rdf:li resource="http://xml.com/pub/2000/08/09/xslt/xslt.html" />
                  <rdf:li resource="http://xml.com/pub/2000/08/09/rdfdb/index.html" />
                </rdf:Seq>
              </items>
            </channel>
              <image rdf:about="http://xml.com/universal/images/xml_tiny.gif">
              <title>XML.com</title>
              <link>http://www.xml.com</link>
              <url>http://xml.com/universal/images/xml_tiny.gif</url>
            </image>
              <item rdf:about="http://xml.com/pub/2000/08/09/xslt/xslt.html">
              <title>Processing Inclusions with XSLT</title>
              <link>http://xml.com/pub/2000/08/09/xslt/xslt.html</link>
              <description>
              Processing document inclusions with general XML tools can be 
              problematic. This article proposes a way of preserving inclusion 
              information through SAX-based processing.
              </description>
            </item>
              <item rdf:about="http://xml.com/pub/2000/08/09/rdfdb/index.html">
              <title>Putting RDF to Work</title>
              <link>http://xml.com/pub/2000/08/09/rdfdb/index.html</link>
              <description>
              Tool and API support for the Resource Description Framework 
              is slowly coming of age. Edd Dumbill takes a look at RDFDB, 
              one of the most exciting new RDF toolkits.
              </description>
            </item>
          </rdf:RDF>  
        `.trim())!,
      ),
    );

    await assertSnapshot(
      test,
      rdfFeedResolver(
        xmlToObj(`
          <?xml version="1.0" encoding="utf-8"?> 
          <rdf:RDF 
            xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
            xmlns:co="http://purl.org/rss/1.0/modules/company/"
            xmlns:ti="http://purl.org/rss/1.0/modules/textinput/"
            xmlns="http://purl.org/rss/1.0/"
          >   
            <channel rdf:about="http://meerkat.oreillynet.com/?_fl=rss1.0">
              <title>Meerkat</title>
              <link>http://meerkat.oreillynet.com</link>
              <description>Meerkat: An Open Wire Service</description>
              <dc:publisher>The O'Reilly Network</dc:publisher>
              <dc:creator>Rael Dornfest (mailto:rael@oreilly.com)</dc:creator>
              <dc:rights>Copyright &#169; 2000 O'Reilly &amp; Associates, Inc.</dc:rights>
              <dc:date>2000-01-01T12:00+00:00</dc:date>
              <sy:updatePeriod>hourly</sy:updatePeriod>
              <sy:updateFrequency>2</sy:updateFrequency>
              <sy:updateBase>2000-01-01T12:00+00:00</sy:updateBase>
              <image rdf:resource="http://meerkat.oreillynet.com/icons/meerkat-powered.jpg" />
              <items>
                <rdf:Seq>
                  <rdf:li resource="http://c.moreover.com/click/here.pl?r123" />
                </rdf:Seq>
              </items>
              <textinput rdf:resource="http://meerkat.oreillynet.com" />
            </channel>
            <image rdf:about="http://meerkat.oreillynet.com/icons/meerkat-powered.jpg">
              <title>Meerkat Powered!</title>
              <url>http://meerkat.oreillynet.com/icons/meerkat-powered.jpg</url>
              <link>http://meerkat.oreillynet.com</link>
            </image>
            <item rdf:about="http://c.moreover.com/click/here.pl?r123">
              <title>XML: A Disruptive Technology</title>
              <link>http://c.moreover.com/click/here.pl?r123</link>
              <dc:description>
                XML is placing increasingly heavy loads on the existing technical
                infrastructure of the Internet.
              </dc:description>
              <dc:publisher>The O'Reilly Network</dc:publisher>
              <dc:creator>Simon St.Laurent (mailto:simonstl@simonstl.com)</dc:creator>
              <dc:rights>Copyright &#169; 2000 O'Reilly &amp; Associates, Inc.</dc:rights>
              <dc:subject>XML</dc:subject>
              <co:name>XML.com</co:name>
              <co:market>NASDAQ</co:market>
              <co:symbol>XML</co:symbol>
            </item>   
            <textinput rdf:about="http://meerkat.oreillynet.com">
              <title>Search Meerkat</title>
              <description>Search Meerkat's RSS Database...</description>
              <name>s</name>
              <link>http://meerkat.oreillynet.com/</link>
              <ti:function>search</ti:function>
              <ti:inputType>regex</ti:inputType>
            </textinput>
          </rdf:RDF>
        `.trim())!,
      ),
    );
  });
});
