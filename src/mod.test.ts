import { describe, it } from "@std/testing/bdd";
import { assertEquals, fail } from "@std/assert";
import { resolve } from "./mod.ts";

describe("resolve()", () => {
  it("should throw and error if feed is not supported", () => {
    try {
      resolve("");

      fail("should throw");
    } catch (error) {
      assertEquals(
        (error as Error).message,
        "Could not find suitable feed resolve for given data",
      );
    }
  });

  // Examples provided by https://github.com/macieklamberski/feedsmith
  describe("atom feed", () => {
    it("should resolve an atom 0.3 feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0" encoding="utf-8"?>
          <feed version="0.3" xmlns="http://purl.org/atom/ns#" xml:base="http://example.org/" xml:lang="en">
            <title type="text/plain" mode="escaped">
              Sample Feed
            </title>
            <tagline type="text/html" mode="escaped">
              For documentation &lt;em&gt;only&lt;/em&gt;
            </tagline>
            <link rel="alternate" type="text/html" href="/"/>
            <link rel="self" type="application/atom+xml" href="/feed.atom"/>
            <link rel="prev" type="application/atom+xml" href="/feed.atom?page=1"/>
            <link rel="next" type="application/atom+xml" href="/feed.atom?page=3"/>
            <copyright type="text/html" mode="escaped">
              &lt;p>Copyright 2004, Mark Pilgrim&lt;/p>&lt;
            </copyright>
            <generator url="http://example.org/generator/" version="3.0">
              Sample Toolkit
            </generator>
            <id>tag:feedparser.org,2004-04-20:/docs/examples/atom03.xml</id>
            <modified>2004-04-20T11:56:34Z</modified>
            <created>2004-04-18T09:00:00Z</created>
            <issued>2004-04-19T10:15:00Z</issued>
            <info type="application/xhtml+xml" mode="xml">
              <div xmlns="http://www.w3.org/1999/xhtml"><p>This is an Atom syndication feed.</p></div>
            </info>
            <author>
              <name>Feed Author</name>
              <url>http://example.org/author/</url>
              <email>author@example.org</email>
            </author>
            <contributor>
              <name>Feed Contributor</name>
              <url>http://example.org/contributor/</url>
              <email>contributor@example.org</email>
            </contributor>
            <category term="technology" scheme="http://example.org/categories/" label="Technology"/>
            <category term="sample" scheme="http://example.org/categories/" label="Sample Documents"/>
            <entry>
              <title type="text/plain" mode="escaped">First entry title</title>
              <link rel="alternate" type="text/html" href="/entry/3"/>
              <link rel="service.edit" type="application/atom+xml" title="Atom API entrypoint to edit this entry" href="/api/edit/3"/>
              <link rel="service.post" type="application/atom+xml" title="Atom API entrypoint to add comments to this entry" href="/api/comment/3"/>
              <link rel="enclosure" type="audio/mpeg" length="1337" href="/audio/sample.mp3"/>
              <link rel="related" type="text/html" href="/related/3"/>
              <id>tag:feedparser.org,2004-04-20:/docs/examples/atom03.xml:3</id>
              <created>2004-04-19T07:45:00Z</created>
              <issued>2004-04-20T00:23:47Z</issued>
              <modified>2004-04-20T11:56:34Z</modified>
              <author>
                <name>Mark Pilgrim</name>
                <url>http://diveintomark.org/</url>
                <email>mark@example.org</email>
              </author>
              <contributor>
                <name>Joe</name>
                <url>http://example.org/joe/</url>
                <email>joe@example.org</email>
              </contributor>
              <contributor>
                <name>Sam</name>
                <url>http://example.org/sam/</url>
                <email>sam@example.org</email>
              </contributor>
              <category term="examples" scheme="http://example.org/categories/" label="Examples"/>
              <category term="documentation" scheme="http://example.org/categories/" label="Documentation"/>
              <summary type="text/plain" mode="escaped">
                Watch out for nasty tricks
              </summary>
              <content type="application/xhtml+xml" mode="xml" xml:base="http://example.org/entry/3" xml:lang="en-US">
                <div xmlns="http://www.w3.org/1999/xhtml">Watch out for <span style="background-image: url(javascript:window.location='http://example.org/')"> nasty tricks</span></div>
              </content>
              <source>
                <id>tag:example.org,2004:original-feed</id>
                <title>Original Feed Title</title>
                <link rel="alternate" type="text/html" href="http://original-source.example.org/"/>
                <author>
                  <name>Original Author</name>
                </author>
                <modified>2004-04-18T12:00:00Z</modified>
              </source>
              <copyright type="text/plain" mode="escaped">Copyright 2004, Entry Copyright Holder</copyright>
            </entry>
            <entry>
              <title>Second entry title</title>
              <link rel="alternate" type="text/html" href="/entry/4"/>
              <id>tag:feedparser.org,2004-04-20:/docs/examples/atom03.xml:4</id>
              <created>2004-04-20T08:30:00Z</created>
              <issued>2004-04-20T08:45:00Z</issued>
              <modified>2004-04-20T09:10:00Z</modified>
              <author>
                <name>Jane Smith</name>
                <url>http://example.org/jane/</url>
                <email>jane@example.org</email>
              </author>
              <summary>
                This is a shorter entry with minimal elements to show contrast
              </summary>
            </entry>
            <entry>
              <title>Third entry title</title>
              <link rel="alternate" type="text/html" href="/entry/4"/>
              <id>tag:feedparser.org,2004-04-20:/docs/examples/atom03.xml:4</id>
              <created>2004-04-20T08:30:00Z</created>
              <issued>2004-04-20T08:45:00Z</issued>
              <modified>2004-04-20T09:10:00Z</modified>
              <author>
                <name>Jane Smith</name>
                <url>http://example.org/jane/</url>
                <email>jane@example.org</email>
              </author>
              <summary>
                This is an entry showing a text version of content
              </summary>
              <content type="application/xhtml+xml" mode="xml" xml:base="http://example.org/entry/3" xml:lang="en-US">
                <div xmlns="http://www.w3.org/1999/xhtml">Watch out for <span style="background-image: url(javascript:window.location='http://example.org/')"> nasty tricks</span></div>
              </content>
            </entry>
          </feed>
        `),
        {
          items: [
            {
              content:
                `<div xmlns="http://www.w3.org/1999/xhtml"><span style="background-image: url(javascript:window.location='http://example.org/')">nasty tricks</span>Watch out for</div>`,
              createdAt: undefined,
              enclosures: [
                {
                  title: undefined,
                  type: "audio/mpeg",
                  url: "/audio/sample.mp3",
                },
              ],
              id: "tag:feedparser.org,2004-04-20:/docs/examples/atom03.xml:3",
              image: undefined,
              link: "/entry/3",
              title: "First entry title",
              updatedAt: undefined,
            },
            {
              content:
                "This is a shorter entry with minimal elements to show contrast",
              createdAt: undefined,
              enclosures: [],
              id: "tag:feedparser.org,2004-04-20:/docs/examples/atom03.xml:4",
              image: undefined,
              link: "/entry/4",
              title: "Second entry title",
              updatedAt: undefined,
            },
            {
              content:
                `<div xmlns="http://www.w3.org/1999/xhtml"><span style="background-image: url(javascript:window.location='http://example.org/')">nasty tricks</span>Watch out for</div>`,
              createdAt: undefined,
              enclosures: [],
              id: "tag:feedparser.org,2004-04-20:/docs/examples/atom03.xml:4",
              image: undefined,
              link: "/entry/4",
              title: "Third entry title",
              updatedAt: undefined,
            },
          ],
          title: "Sample Feed",
          url: "/feed.atom",
        },
      );
    });

    it("should resolve an atom 1.0 feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0" encoding="utf-8"?>
          <feed xmlns="http://www.w3.org/2005/Atom" xml:base="http://example.org/" xml:lang="en">
            <title type="text">Comprehensive Atom 1.0 Example Feed</title>
            <subtitle type="html">A &lt;em&gt;comprehensive&lt;/em&gt; example showing all Atom 1.0 elements</subtitle>
            <link rel="alternate" type="text/html" href="/"/>
            <link rel="self" type="application/atom+xml" href="http://example.org/atom10.xml"/>
            <link rel="first" type="application/atom+xml" href="http://example.org/atom10.xml?page=1"/>
            <link rel="previous" type="application/atom+xml" href="http://example.org/atom10.xml?page=2"/>
            <link rel="next" type="application/atom+xml" href="http://example.org/atom10.xml?page=4"/>
            <link rel="last" type="application/atom+xml" href="http://example.org/atom10.xml?page=10"/>
            <link rel="hub" href="http://pubsubhubbub.example.org/"/>
            <link rel="search" type="application/opensearchdescription+xml" href="http://example.org/search.xml" title="Search"/>
            <link rel="license" href="http://creativecommons.org/licenses/by/4.0/"/>
            <link rel="related" href="http://example.org/related" hreflang="en" title="Related Content" length="1000"/>
            <rights type="html">&lt;p&gt;Copyright © 2023, Example Organization. All rights reserved.&lt;/p&gt;</rights>
            <icon>http://example.org/favicon.ico</icon>
            <logo>http://example.org/logo.png</logo>
            <generator uri="http://example.org/generator/" version="4.0">Comprehensive Atom Generator</generator>
            <id>tag:example.org,2023:comprehensive-atom-feed</id>
            <updated>2023-01-15T12:00:00Z</updated>
            <category term="technology" scheme="http://example.org/categories/" label="Technology"/>
            <category term="documentation" scheme="http://example.org/categories/" label="Documentation"/>
            <category term="examples" scheme="http://example.org/categories/" label="Examples"/>
            <category term="atom" label="Atom Feeds"/>
            <author>
              <name>John Doe</name>
              <uri>http://example.org/john/</uri>
              <email>john@example.org</email>
            </author>
            <author>
              <name>Jane Smith</name>
              <uri>http://example.org/jane/</uri>
              <email>jane@example.org</email>
            </author>
            <contributor>
              <name>Bob Johnson</name>
              <uri>http://example.org/bob/</uri>
              <email>bob@example.org</email>
            </contributor>
            <contributor>
              <name>Alice Williams</name>
              <uri>http://example.org/alice/</uri>
              <email>alice@example.org</email>
            </contributor>
            <entry>
              <title type="text">Comprehensive Entry Example</title>
              <link rel="alternate" type="text/html" href="/entry/1"/>
              <link rel="related" type="text/html" href="http://related.example.org/"/>
              <link rel="via" type="text/html" href="http://source.example.org/original"/>
              <link rel="enclosure" type="audio/mpeg" href="http://example.org/audio.mp3" length="1234567" title="Audio Podcast"/>
              <link rel="enclosure" type="video/mp4" href="http://example.org/video.mp4" length="7654321" title="Video Podcast"/>
              <link rel="edit" href="http://example.org/edit/1"/>
              <link rel="self" href="http://example.org/entry/1"/>
              <link rel="replies" type="application/atom+xml" href="http://example.org/comments/1" title="Comments"/>
              <id>tag:example.org,2023:entry-1</id>
              <published>2023-01-10T08:30:00Z</published>
              <updated>2023-01-15T11:45:00Z</updated>
              <author>
                <name>John Doe</name>
                <uri>http://example.org/john/</uri>
                <email>john@example.org</email>
              </author>
              <contributor>
                <name>Technical Editor</name>
                <uri>http://example.org/editor/</uri>
                <email>editor@example.org</email>
              </contributor>
              <contributor>
                <name>Research Assistant</name>
                <uri>http://example.org/assistant/</uri>
                <email>assistant@example.org</email>
              </contributor>
              <category term="atom" scheme="http://example.org/categories/" label="Atom"/>
              <category term="examples" scheme="http://example.org/categories/" label="Examples"/>
              <category term="documentation" scheme="http://example.org/categories/" label="Documentation"/>
              <category term="complete" label="Complete Example"/>
              <summary type="text">
                This is a comprehensive example entry showing all possible Atom 1.0 elements in an entry.
              </summary>
              <content type="xhtml" xml:base="http://example.org/entry/1" xml:lang="en-US">
                <div xmlns="http://www.w3.org/1999/xhtml">
                  <h1>Comprehensive Atom 1.0 Entry</h1>
                  <p>This entry demonstrates all possible elements in an Atom 1.0 entry.</p>
                  <ul>
                    <li>Required elements: id, title, updated</li>
                    <li>Optional elements: author, category, content, contributor, link, published, rights, source, summary</li>
                  </ul>
                  <p>The content can contain rich <strong>XHTML</strong> markup.</p>
                </div>
              </content>
              <source>
                <id>tag:example.org,2023:original-feed</id>
                <title>Original Source Feed</title>
                <updated>2023-01-10T08:00:00Z</updated>
                <author>
                  <name>Original Author</name>
                  <uri>http://original.example.org/author/</uri>
                  <email>original@example.org</email>
                </author>
                <contributor>
                  <name>Original Contributor</name>
                  <uri>http://original.example.org/contributor/</uri>
                  <email>contributor@example.org</email>
                </contributor>
                <link rel="self" href="http://original.example.org/feed.atom"/>
                <link rel="alternate" href="http://original.example.org/"/>
                <category term="original" scheme="http://original.example.org/categories/" label="Original Content"/>
                <generator uri="http://original.example.org/generator/" version="3.0">Original Generator</generator>
                <icon>http://original.example.org/favicon.ico</icon>
                <logo>http://original.example.org/logo.png</logo>
                <rights>Copyright © 2023, Original Organization</rights>
                <subtitle>Original source subtitle</subtitle>
              </source>
              <rights type="html">&lt;p&gt;Copyright © 2023, Entry Copyright Holder. All rights reserved.&lt;/p&gt;</rights>
            </entry>
            <entry>
              <title>Minimal Required Entry</title>
              <id>tag:example.org,2023:entry-2</id>
              <updated>2023-01-14T15:30:00Z</updated>
              <content type="text">This entry contains only the required elements: id, title, and updated.</content>
            </entry>
            <entry>
              <title>Content Types Example</title>
              <id>tag:example.org,2023:entry-3</id>
              <updated>2023-01-13T18:45:00Z</updated>
              <link rel="alternate" href="/entry/3"/>
              <content type="text">
                This is plain text content without any markup.
              </content>
              <summary type="html">
                &lt;p&gt;This is a summary with &lt;strong&gt;HTML&lt;/strong&gt; markup.&lt;/p&gt;
              </summary>
            </entry>
            <entry>
              <title>Content by Reference</title>
              <id>tag:example.org,2023:entry-4</id>
              <updated>2023-01-12T09:15:00Z</updated>
              <content type="text/html" src="http://example.org/full-content.html"/>
              <summary>
                This entry references its content rather than including it inline.
              </summary>
            </entry>
            <entry>
              <title>Multiple Authors Example</title>
              <id>tag:example.org,2023:entry-5</id>
              <updated>2023-01-11T14:20:00Z</updated>
              <author>
                <name>Primary Author</name>
                <uri>http://example.org/primary/</uri>
                <email>primary@example.org</email>
              </author>
              <author>
                <name>Co-Author</name>
                <uri>http://example.org/co-author/</uri>
                <email>co-author@example.org</email>
              </author>
              <content type="text">
                This entry has multiple authors to demonstrate how multiple author elements can be used.
              </content>
            </entry>
            <entry xml:lang="fr">
              <title>Exemple de Contenu en Français</title>
              <id>tag:example.org,2023:entry-6</id>
              <updated>2023-01-10T11:05:00Z</updated>
              <content type="text">
                Cet article est écrit en français pour démontrer l'utilisation de l'attribut xml:lang.
              </content>
              <summary xml:lang="en">
                This is an English summary of a French entry to demonstrate language-specific content.
              </summary>
            </entry>
          </feed>
        `),
        {
          items: [
            {
              content:
                '<div xmlns="http://www.w3.org/1999/xhtml"><h1>Comprehensive Atom 1.0 Entry</h1><p>This entry demonstrates all possible elements in an Atom 1.0 entry.</p><p><strong>XHTML</strong>The content can contain richmarkup.</p><ul><li>Required elements: id, title, updated</li><li>Optional elements: author, category, content, contributor, link, published, rights, source, summary</li></ul></div>',
              createdAt: new Date("2023-01-10T08:30:00.000Z"),
              enclosures: [
                {
                  title: "Audio Podcast",
                  type: "audio/mpeg",
                  url: "http://example.org/audio.mp3",
                },
                {
                  title: "Video Podcast",
                  type: "video/mp4",
                  url: "http://example.org/video.mp4",
                },
              ],
              id: "tag:example.org,2023:entry-1",
              image: undefined,
              link: "http://example.org/entry/1",
              title: "Comprehensive Entry Example",
              updatedAt: new Date("2023-01-15T11:45:00.000Z"),
            },
            {
              content:
                "This entry contains only the required elements: id, title, and updated.",
              createdAt: undefined,
              enclosures: [],
              id: "tag:example.org,2023:entry-2",
              image: undefined,
              link: undefined,
              title: "Minimal Required Entry",
              updatedAt: new Date("2023-01-14T15:30:00.000Z"),
            },
            {
              content:
                "<p>This is a summary with <strong>HTML</strong> markup.</p>",
              createdAt: undefined,
              enclosures: [],
              id: "tag:example.org,2023:entry-3",
              image: undefined,
              link: "http://example.org/entry/3",
              title: "Content Types Example",
              updatedAt: new Date("2023-01-13T18:45:00.000Z"),
            },
            {
              content:
                "This entry references its content rather than including it inline.",
              createdAt: undefined,
              enclosures: [],
              id: "tag:example.org,2023:entry-4",
              image: undefined,
              link: undefined,
              title: "Content by Reference",
              updatedAt: new Date("2023-01-12T09:15:00.000Z"),
            },
            {
              content:
                "This entry has multiple authors to demonstrate how multiple author elements can be used.",
              createdAt: undefined,
              enclosures: [],
              id: "tag:example.org,2023:entry-5",
              image: undefined,
              link: undefined,
              title: "Multiple Authors Example",
              updatedAt: new Date("2023-01-11T14:20:00.000Z"),
            },
            {
              content:
                "Cet article est écrit en français pour démontrer l'utilisation de l'attribut xml:lang.",
              createdAt: undefined,
              enclosures: [],
              id: "tag:example.org,2023:entry-6",
              image: undefined,
              link: undefined,
              title: "Exemple de Contenu en Français",
              updatedAt: new Date("2023-01-10T11:05:00.000Z"),
            },
          ],
          title: "Comprehensive Atom 1.0 Example Feed",
          url: "http://example.org/atom10.xml",
        },
      );
    });

    it("should resolve an atom 1.0 namespaced feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0" encoding="utf-8"?>
          <feed xmlns="http://www.w3.org/2005/Atom">
            <title>Example Feed</title>
            <id>example-feed</id>
            <dc:creator>John Doe</dc:creator>
            <dc:contributor>Jane Smith</dc:contributor>
            <dc:date>2022-01-01T12:00+00:00</dc:date>
            <dc:description>This is an example of description.</dc:description>
            <sy:updateBase>2000-01-01T12:00+00:00</sy:updateBase>
            <sy:updatePeriod>hourly</sy:updatePeriod>
            <sy:updateFrequency>1</sy:updateFrequency>
            <itunes:category text="Society &amp; Culture"/>
            <itunes:owner>
              <itunes:name>Jack Smith</itunes:name>
              <itunes:email>news@example.com</itunes:email>
            </itunes:owner>

            <!-- Media Namespace: Item/Feed Level Tags -->
            <media:content url="https://example.com/videos/sample1.mp4" fileSize="12345678" type="video/mp4" medium="video" isDefault="true" expression="full" bitrate="1500" framerate="30" samplingrate="44.1" channels="2" duration="120" height="720" width="1280" lang="en">
              <media:title type="plain">Sample Video Title</media:title>
              <media:description type="html">This is a &lt;b&gt;sample video&lt;/b&gt; demonstrating media:content</media:description>
              <media:keywords>sample, video, example, media, rss</media:keywords>
              <media:thumbnail url="https://example.com/thumbnails/sample1.jpg" width="320" height="180" time="00:00:15.000"/>
              <media:category scheme="http://search.yahoo.com/mrss/category_schema">Entertainment</media:category>
              <media:hash algo="md5">dfdec888b7f38882e8a698d52eaebc04</media:hash>
              <media:credit role="producer" scheme="urn:ebu">Jane Smith</media:credit>
              <media:rating scheme="urn:simple">adult</media:rating>
              <media:copyright>© 2025 Example Media Inc.</media:copyright>
              <media:text type="transcript" lang="en" start="00:00:03" end="00:00:10">This is a sample transcript text</media:text>
              <media:restriction relationship="allow" type="country">us ca gb</media:restriction>
              <media:community>
                <media:starRating average="4.5" count="2500" min="1" max="5" />
                <media:statistics views="12345" favorites="413" />
                <media:tags>featured, media, example</media:tags>
              </media:community>
              <media:comments>
                <media:comment>Great video!</media:comment>
                <media:comment>Very informative content</media:comment>
              </media:comments>
              <media:embed url="https://example.com/players/embed" width="640" height="360">
                <media:param name="autoplay">true</media:param>
                <media:param name="theme">dark</media:param>
              </media:embed>
              <media:responses>
                <media:response>https://example.com/videos/response1</media:response>
              </media:responses>
              <media:backLinks>
                <media:backLink>https://example.com/articles/related</media:backLink>
              </media:backLinks>
              <media:status state="active" />
              <media:price type="rent" price="2.99" currency="USD" />
              <media:license type="text/html" href="https://example.com/license">Standard License</media:license>
              <media:peerLink type="application/torrent" href="https://example.com/torrents/sample1.torrent" />
              <media:location>Sample Studio</media:location>
              <media:rights status="official" />
              <media:scenes>
                <media:scene>
                  <sceneTitle>Introduction</sceneTitle>
                  <sceneDescription>Opening sequence</sceneDescription>
                  <sceneStartTime>00:00:00</sceneStartTime>
                  <sceneEndTime>00:00:30</sceneEndTime>
                </media:scene>
                <media:scene>
                  <sceneTitle>Main Content</sceneTitle>
                  <sceneStartTime>00:00:30</sceneStartTime>
                  <sceneEndTime>00:01:45</sceneEndTime>
                </media:scene>
              </media:scenes>
            </media:content>
            <media:group>
              <media:title>Multi-Format Content Example</media:title>
              <media:description>This video is available in multiple formats and resolutions</media:description>
              <media:thumbnail url="https://example.com/thumbnails/group-main.jpg" width="640" height="360" />
              <media:thumbnail url="https://example.com/thumbnails/group-alt.jpg" width="1280" height="720" />
              <media:keywords>group, multiple, formats, resolutions</media:keywords>
              <media:category>Technology</media:category>
              <media:rating scheme="urn:mpaa">PG</media:rating>
              <media:copyright>© 2025 Example Media Inc.</media:copyright>
              <media:content url="https://example.com/videos/sample-hd.mp4" fileSize="45678912" type="video/mp4" medium="video" expression="full" bitrate="5000" framerate="60" duration="180" height="1080" width="1920" lang="en">
                <media:title>HD Version (1080p)</media:title>
              </media:content>
              <media:content url="https://example.com/videos/sample-sd.mp4" fileSize="23456789" type="video/mp4" medium="video" expression="full" bitrate="2500" framerate="30" duration="180" height="720" width="1280" lang="en">
                <media:title>SD Version (720p)</media:title>
              </media:content>
              <media:content url="https://example.com/videos/sample.webm" fileSize="19876543" type="video/webm" medium="video" expression="full" bitrate="2000" framerate="30" duration="180" height="720" width="1280" lang="en">
                <media:title>WebM Version</media:title>
              </media:content>
              <media:content url="https://example.com/audio/sample.mp3" fileSize="3456789" type="audio/mpeg" medium="audio" expression="full" bitrate="320" samplingrate="44.1" channels="2" duration="180" lang="en">
                <media:title>Audio Only Version</media:title>
              </media:content>
              <media:content url="https://example.com/captions/sample-en.srt" type="text/srt" medium="document" expression="sample" lang="en">
                <media:title>English Subtitles</media:title>
              </media:content>
              <media:content url="https://example.com/captions/sample-es.srt" type="text/srt" medium="document" expression="sample" lang="es">
                <media:title>Spanish Subtitles</media:title>
              </media:content>
            </media:group>
            <media:title type="text">Advanced Media Features Demo</media:title>
            <media:credit role="director" scheme="urn:ebu">Michael Chang</media:credit>
            <media:credit role="actor" scheme="urn:ebu">Sarah Johnson</media:credit>
            <media:credit role="actor" scheme="urn:ebu">Robert Williams</media:credit>
            <media:category scheme="http://dmoz.org">Arts/Movies/Titles/A/</media:category>
            <media:status state="active" reason="approved" />
            <media:thumbnail url="https://example.com/thumbnails/adv-1.jpg" time="00:00:05.000" />
            <media:thumbnail url="https://example.com/thumbnails/adv-2.jpg" time="00:01:15.000" />
            <media:thumbnail url="https://example.com/thumbnails/adv-3.jpg" time="00:02:30.000" />
            <media:price type="package" price="9.99" currency="USD" info="full access">Complete Package</media:price>
            <media:price type="subscription" price="4.99" currency="USD" info="monthly">Monthly Subscription</media:price>
            <media:restriction relationship="allow" type="country">us ca gb de fr</media:restriction>
            <media:restriction relationship="deny" type="sharing">true</media:restriction>
            <media:rating scheme="urn:mpaa">PG-13</media:rating>
            <media:rating scheme="urn:v-chip">TV-14</media:rating>
            <media:community>
              <media:starRating average="4.8" count="12563" min="1" max="5" />
              <media:statistics views="256789" favorites="3421" shares="1245" />
              <media:tags>cinematic, production, advanced, technical, demo</media:tags>
            </media:community>

            <!-- GeoRSS-Simple Namespace: Item/Feed Level Tags (while not typical, included are all values for testing) -->
            <georss:point>37.78 -122.42</georss:point>
            <georss:line>37.78 -122.42 37.42 -122.10 37.86 -122.27</georss:line>
            <georss:polygon>37.86 -122.47 37.86 -122.37 37.76 -122.37 37.76 -122.47 37.86 -122.47</georss:polygon>
            <georss:box>37.15 -122.85 38.15 -121.85</georss:box>
            <georss:featuretypetag>region</georss:featuretypetag>
            <georss:relationshiptag>contains</georss:relationshiptag>
            <georss:featurename>San Francisco Bay Area</georss:featurename>
            <georss:elev>360</georss:elev>
            <georss:floor>4</georss:floor>
            <georss:radius>50000</georss:radius>

            <entry>
              <title>Example Entry</title>
              <id>example-entry</id>
              <dc:creator>Jack Jackson</dc:creator>
              <dc:date>2022-01-01T12:00+00:00</dc:date>
              <slash:section>articles</slash:section>
              <slash:department>not-an-ocean-unless-there-are-lobsters</slash:department>
              <slash:comments>177</slash:comments>
              <slash:hit_parade>177,155,105,33,6,3,0</slash:hit_parade>
              <itunes:explicit>false</itunes:explicit>

              <!-- Media Namespace: Item/Feed Level Tags -->
              <media:content url="https://example.com/videos/sample1.mp4" fileSize="12345678" type="video/mp4" medium="video" isDefault="true" expression="full" bitrate="1500" framerate="30" samplingrate="44.1" channels="2" duration="120" height="720" width="1280" lang="en">
                <media:title type="plain">Sample Video Title</media:title>
                <media:description type="html">This is a &lt;b&gt;sample video&lt;/b&gt; demonstrating media:content</media:description>
                <media:keywords>sample, video, example, media, rss</media:keywords>
                <media:thumbnail url="https://example.com/thumbnails/sample1.jpg" width="320" height="180" time="00:00:15.000"/>
                <media:category scheme="http://search.yahoo.com/mrss/category_schema">Entertainment</media:category>
                <media:hash algo="md5">dfdec888b7f38882e8a698d52eaebc04</media:hash>
                <media:credit role="producer" scheme="urn:ebu">Jane Smith</media:credit>
                <media:rating scheme="urn:simple">adult</media:rating>
                <media:copyright>© 2025 Example Media Inc.</media:copyright>
                <media:text type="transcript" lang="en" start="00:00:03" end="00:00:10">This is a sample transcript text</media:text>
                <media:restriction relationship="allow" type="country">us ca gb</media:restriction>
                <media:community>
                  <media:starRating average="4.5" count="2500" min="1" max="5" />
                  <media:statistics views="12345" favorites="413" />
                  <media:tags>featured, media, example</media:tags>
                </media:community>
                <media:comments>
                  <media:comment>Great video!</media:comment>
                  <media:comment>Very informative content</media:comment>
                </media:comments>
                <media:embed url="https://example.com/players/embed" width="640" height="360">
                  <media:param name="autoplay">true</media:param>
                  <media:param name="theme">dark</media:param>
                </media:embed>
                <media:responses>
                  <media:response>https://example.com/videos/response1</media:response>
                </media:responses>
                <media:backLinks>
                  <media:backLink>https://example.com/articles/related</media:backLink>
                </media:backLinks>
                <media:status state="active" />
                <media:price type="rent" price="2.99" currency="USD" />
                <media:license type="text/html" href="https://example.com/license">Standard License</media:license>
                <media:peerLink type="application/torrent" href="https://example.com/torrents/sample1.torrent" />
                <media:location>Sample Studio</media:location>
                <media:rights status="official" />
                <media:scenes>
                  <media:scene>
                    <sceneTitle>Introduction</sceneTitle>
                    <sceneDescription>Opening sequence</sceneDescription>
                    <sceneStartTime>00:00:00</sceneStartTime>
                    <sceneEndTime>00:00:30</sceneEndTime>
                  </media:scene>
                  <media:scene>
                    <sceneTitle>Main Content</sceneTitle>
                    <sceneStartTime>00:00:30</sceneStartTime>
                    <sceneEndTime>00:01:45</sceneEndTime>
                  </media:scene>
                </media:scenes>
              </media:content>
              <media:group>
                <media:title>Multi-Format Content Example</media:title>
                <media:description>This video is available in multiple formats and resolutions</media:description>
                <media:thumbnail url="https://example.com/thumbnails/group-main.jpg" width="640" height="360" />
                <media:thumbnail url="https://example.com/thumbnails/group-alt.jpg" width="1280" height="720" />
                <media:keywords>group, multiple, formats, resolutions</media:keywords>
                <media:category>Technology</media:category>
                <media:rating scheme="urn:mpaa">PG</media:rating>
                <media:copyright>© 2025 Example Media Inc.</media:copyright>
                <media:content url="https://example.com/videos/sample-hd.mp4" fileSize="45678912" type="video/mp4" medium="video" expression="full" bitrate="5000" framerate="60" duration="180" height="1080" width="1920" lang="en">
                  <media:title>HD Version (1080p)</media:title>
                </media:content>
                <media:content url="https://example.com/videos/sample-sd.mp4" fileSize="23456789" type="video/mp4" medium="video" expression="full" bitrate="2500" framerate="30" duration="180" height="720" width="1280" lang="en">
                  <media:title>SD Version (720p)</media:title>
                </media:content>
                <media:content url="https://example.com/videos/sample.webm" fileSize="19876543" type="video/webm" medium="video" expression="full" bitrate="2000" framerate="30" duration="180" height="720" width="1280" lang="en">
                  <media:title>WebM Version</media:title>
                </media:content>
                <media:content url="https://example.com/audio/sample.mp3" fileSize="3456789" type="audio/mpeg" medium="audio" expression="full" bitrate="320" samplingrate="44.1" channels="2" duration="180" lang="en">
                  <media:title>Audio Only Version</media:title>
                </media:content>
                <media:content url="https://example.com/captions/sample-en.srt" type="text/srt" medium="document" expression="sample" lang="en">
                  <media:title>English Subtitles</media:title>
                </media:content>
                <media:content url="https://example.com/captions/sample-es.srt" type="text/srt" medium="document" expression="sample" lang="es">
                  <media:title>Spanish Subtitles</media:title>
                </media:content>
              </media:group>
              <media:title type="text">Advanced Media Features Demo</media:title>
              <media:credit role="director" scheme="urn:ebu">Michael Chang</media:credit>
              <media:credit role="actor" scheme="urn:ebu">Sarah Johnson</media:credit>
              <media:credit role="actor" scheme="urn:ebu">Robert Williams</media:credit>
              <media:category scheme="http://dmoz.org">Arts/Movies/Titles/A/</media:category>
              <media:status state="active" reason="approved" />
              <media:thumbnail url="https://example.com/thumbnails/adv-1.jpg" time="00:00:05.000" />
              <media:thumbnail url="https://example.com/thumbnails/adv-2.jpg" time="00:01:15.000" />
              <media:thumbnail url="https://example.com/thumbnails/adv-3.jpg" time="00:02:30.000" />
              <media:price type="package" price="9.99" currency="USD" info="full access">Complete Package</media:price>
              <media:price type="subscription" price="4.99" currency="USD" info="monthly">Monthly Subscription</media:price>
              <media:restriction relationship="allow" type="country">us ca gb de fr</media:restriction>
              <media:restriction relationship="deny" type="sharing">true</media:restriction>
              <media:rating scheme="urn:mpaa">PG-13</media:rating>
              <media:rating scheme="urn:v-chip">TV-14</media:rating>
              <media:community>
                <media:starRating average="4.8" count="12563" min="1" max="5" />
                <media:statistics views="256789" favorites="3421" shares="1245" />
                <media:tags>cinematic, production, advanced, technical, demo</media:tags>
              </media:community>

              <!-- GeoRSS-Simple Namespace: Item/Feed Level Tags (while not typical, included are all values for testing) -->
              <georss:point>37.78 -122.42</georss:point>
              <georss:line>37.78 -122.42 37.42 -122.10 37.86 -122.27</georss:line>
              <georss:polygon>37.86 -122.47 37.86 -122.37 37.76 -122.37 37.76 -122.47 37.86 -122.47</georss:polygon>
              <georss:box>37.15 -122.85 38.15 -121.85</georss:box>
              <georss:featuretypetag>region</georss:featuretypetag>
              <georss:relationshiptag>contains</georss:relationshiptag>
              <georss:featurename>San Francisco Bay Area</georss:featurename>
              <georss:elev>360</georss:elev>
              <georss:floor>4</georss:floor>
              <georss:radius>50000</georss:radius>

              <!-- Atom Threading Namespace: Item Level Tags -->
              <thr:total>100</thr:total>
              <thr:in-reply-to ref="urn:uuid:d5e9c5d0-4c0c-11ec-81d3-0242ac130003" href="https://example.com/posts/understanding-xml-namespaces" type="application/xhtml+xml"/>
              <thr:in-reply-to ref="urn:uuid:e7865b80-4c0c-11ec-81d3-0242ac130003" href="https://example.com/posts/understanding-xml-namespaces/comments/1" type="application/xhtml+xml"/>
              <link rel="replies" href="https://example.com/posts/understanding-xml-namespaces/comments/1/replies" thr:count="2" thr:updated="2025-05-10T16:45:00Z"/>
            </entry>
          </feed>
        `),
        {
          items: [
            {
              content:
                "This video is available in multiple formats and resolutions",
              createdAt: new Date("2022-01-01T12:00:00.000Z"),
              enclosures: [],
              id: "example-entry",
              image: "https://example.com/thumbnails/adv-1.jpg",
              link:
                "https://example.com/posts/understanding-xml-namespaces/comments/1/replies",
              title: "Example Entry",
              updatedAt: undefined,
            },
          ],
          title: "Example Feed",
          url: undefined,
        },
      );
    });
  });

  describe("rss feed", () => {
    it("should resolve an rss 0.9 feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0" encoding="utf-8"?>
          <!DOCTYPE rss PUBLIC "-//Netscape Communications//DTD RSS 0.9//EN" "http://my.netscape.com/publish/formats/rss-0.9.dtd">
          <rss version="0.9">
            <channel>
              <title>Sample Feed</title>
              <link>http://example.org/</link>
              <description>For documentation &lt;em&gt;only&lt;/em&gt;</description>
              <image>
                <title>Example banner</title>
                <url>http://example.org/banner.png</url>
                <link>http://example.org/</link>
              </image>
              <item>
                <title>First item title</title>
                <link>http://example.org/item/1</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location='http://example.org/')"&gt; nasty tricks&lt;/span&gt;</description>
              </item>
              <item>
                <title>Second item title</title>
                <link>http://example.org/item/2</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location='http://example.org/')"&gt; nasty tricks&lt;/span&gt;</description>
              </item>
            </channel>
          </rss>
        `),
        {
          items: [
            {
              content:
                `Watch out for <span style="background: url(javascript:window.location='http://example.org/')"> nasty tricks</span>`,
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://example.org/item/1",
              title: "First item title",
              updatedAt: undefined,
            },
            {
              content:
                `Watch out for <span style="background: url(javascript:window.location='http://example.org/')"> nasty tricks</span>`,
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://example.org/item/2",
              title: "Second item title",
              updatedAt: undefined,
            },
          ],
          title: "Sample Feed",
          url: "http://example.org/",
        },
      );
    });

    it("should resolve an rss 0.91 feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0" encoding="utf-8"?>
          <!DOCTYPE rss PUBLIC "-//Netscape Communications//DTD RSS 0.91//EN" "http://my.netscape.com/publish/formats/rss-0.91.dtd">
          <rss version="0.91">
            <channel>
              <title>Sample Feed</title>
              <link>http://example.org/</link>
              <description>For documentation &lt;em&gt;only&lt;/em&gt;</description>
              <language>en</language>
              <copyright>Copyright 2004, Mark Pilgrim</copyright>
              <managingEditor>editor@example.org</managingEditor>
              <webMaster>webmaster@example.org</webMaster>
              <pubDate>Sat, 19 Mar 1988 07:15:00 GMT</pubDate>
              <lastBuildDate>Sat, 19 Mar 1988 07:15:00 GMT</lastBuildDate>
              <rating>(PICS-1.1 "http://www.rsac.org/ratingsv01.html" l by "webmaster@example.com" on "2006.01.29T10:09-0800" r (n 0 s 0 v 0 l 0))</rating>
              <image>
                <title>Example banner</title>
                <url>http://example.org/banner.png</url>
                <link>http://example.org/</link>
                <width>80</width>
                <height>15</height>
                <description>Quos placeat quod ea temporibus ratione</description>
              </image>
              <textInput>
                <title>Search</title>
                <description>Search this site:</description>
                <name>q</name>
                <link>http://example.org/mt/mt-search.cgi</link>
              </textInput>
              <skipHours>
                <hour>0</hour>
                <hour>20</hour>
                <hour>21</hour>
                <hour>22</hour>
                <hour>23</hour>
              </skipHours>
              <skipDays>
                <day>Monday</day>
                <day>Wednesday</day>
                <day>Friday</day>
              </skipDays>
              <item>
                <title>First item title</title>
                <link>http://example.org/item/1</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location='http://example.org/')"&gt; nasty tricks&lt;/span&gt;</description>
              </item>
              <item>
                <title>Second item title</title>
                <link>http://example.org/item/2</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location='http://example.org/')"&gt; nasty tricks&lt;/span&gt;</description>
              </item>
            </channel>
          </rss>
        `),
        {
          items: [
            {
              content:
                `Watch out for <span style="background: url(javascript:window.location='http://example.org/')"> nasty tricks</span>`,
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://example.org/item/1",
              title: "First item title",
              updatedAt: undefined,
            },
            {
              content:
                `Watch out for <span style="background: url(javascript:window.location='http://example.org/')"> nasty tricks</span>`,
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://example.org/item/2",
              title: "Second item title",
              updatedAt: undefined,
            },
          ],
          title: "Sample Feed",
          url: "http://example.org/",
        },
      );
    });

    it("should resolve an rss 0.92 feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0" encoding="utf-8"?>
          <rss version="0.92">
            <channel>
              <title>Sample Feed</title>
              <link>http://example.org/</link>
              <description>For documentation &lt;em&gt;only&lt;/em&gt;</description>
              <language>en</language>
              <copyright>Copyright 2004, Mark Pilgrim</copyright>
              <managingEditor>editor@example.org</managingEditor>
              <webMaster>webmaster@example.org</webMaster>
              <pubDate>Sat, 19 Mar 1988 07:15:00 GMT</pubDate>
              <lastBuildDate>Sat, 19 Mar 1988 07:15:00 GMT</lastBuildDate>
              <rating>(PICS-1.1 "http://www.rsac.org/ratingsv01.html" l by "webmaster@example.com" on "2006.01.29T10:09-0800" r (n 0 s 0 v 0 l 0))</rating>
              <docs>http://backend.userland.com/rss092</docs>
              <cloud domain="rpc.example.com" port="80" path="/RPC2" registerProcedure="pingMe" protocol="soap" />
              <image>
                <title>Example banner</title>
                <url>http://example.org/banner.png</url>
                <link>http://example.org/</link>
                <width>80</width>
                <height>15</height>
                <description>Quos placeat quod ea temporibus ratione</description>
              </image>
              <textInput>
                <title>Search</title>
                <description>Search this site:</description>
                <name>q</name>
                <link>http://example.org/mt/mt-search.cgi</link>
              </textInput>
              <skipHours>
                <hour>0</hour>
                <hour>20</hour>
                <hour>21</hour>
                <hour>22</hour>
                <hour>23</hour>
              </skipHours>
              <skipDays>
                <day>Monday</day>
                <day>Wednesday</day>
                <day>Friday</day>
              </skipDays>
              <item>
                <title>First item title</title>
                <link>http://example.org/item/1</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location='http://example.org/')"&gt; nasty tricks&lt;/span&gt;</description>
                <category>Miscellaneous</category>
                <enclosure url="http://example.org/audio/demo.mp3" length="1069871" type="audio/mpeg" />
                <source url="http://www.example.org/links.xml">Example's Realm</source>
              </item>
              <item>
                <title>Second item title</title>
                <link>http://example.org/item/2</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location='http://example.org/')"&gt; nasty tricks&lt;/span&gt;</description>
                <category>Miscellaneous</category>
                <enclosure url="http://example.org/audio/demo.mp3" length="1069871" type="audio/mpeg" />
                <source url="http://www.example.org/links.xml">Example's Realm</source>
              </item>
            </channel>
          </rss>
        `),
        {
          items: [
            {
              content:
                `Watch out for <span style="background: url(javascript:window.location='http://example.org/')"> nasty tricks</span>`,
              createdAt: undefined,
              enclosures: [
                {
                  title: undefined,
                  type: "audio/mpeg",
                  url: "http://example.org/audio/demo.mp3",
                },
              ],
              id: undefined,
              image: undefined,
              link: "http://example.org/item/1",
              title: "First item title",
              updatedAt: undefined,
            },
            {
              content:
                `Watch out for <span style="background: url(javascript:window.location='http://example.org/')"> nasty tricks</span>`,
              createdAt: undefined,
              enclosures: [
                {
                  title: undefined,
                  type: "audio/mpeg",
                  url: "http://example.org/audio/demo.mp3",
                },
              ],
              id: undefined,
              image: undefined,
              link: "http://example.org/item/2",
              title: "Second item title",
              updatedAt: undefined,
            },
          ],
          title: "Sample Feed",
          url: "http://example.org/",
        },
      );
    });

    it("should resolve an rss 0.93 feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0" encoding="utf-8"?>
          <rss version="0.93">
            <channel>
              <title>Sample Feed</title>
              <link>http://example.org/</link>
              <description>For documentation &lt;em&gt;only&lt;/em&gt;</description>
              <language>en</language>
              <copyright>Copyright 2004, Mark Pilgrim</copyright>
              <managingEditor>editor@example.org</managingEditor>
              <webMaster>webmaster@example.org</webMaster>
              <pubDate>Sat, 19 Mar 1988 07:15:00 GMT</pubDate>
              <lastBuildDate>Sat, 19 Mar 1988 07:15:00 GMT</lastBuildDate>
              <category>Examples1</category>
              <category>Examples2</category>
              <generator>Sample Toolkit</generator>
              <docs>http://backend.userland.com/rss093</docs>
              <cloud domain="rpc.example.com" port="80" path="/RPC2" registerProcedure="pingMe" protocol="soap" />
              <ttl>60</ttl>
              <image>
                <title>Example banner</title>
                <url>http://example.org/banner.png</url>
                <link>http://example.org/</link>
                <width>80</width>
                <height>15</height>
                <description>Quos placeat quod ea temporibus ratione</description>
              </image>
              <rating>(PICS-1.1 "http://www.rsac.org/ratingsv01.html" l by "webmaster@example.com" on "2006.01.29T10:09-0800" r (n 0 s 0 v 0 l 0))</rating>
              <textInput>
                <title>Search</title>
                <description>Search this site:</description>
                <name>q</name>
                <link>http://example.org/mt/mt-search.cgi</link>
              </textInput>
              <skipHours>
                <hour>0</hour>
                <hour>20</hour>
                <hour>21</hour>
                <hour>22</hour>
                <hour>23</hour>
              </skipHours>
              <skipDays>
                <day>Monday</day>
                <day>Wednesday</day>
                <day>Friday</day>
              </skipDays>
              <item>
                <title>First item title</title>
                <link>http://example.org/item/1</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location='http://example.org/')"&gt; nasty tricks&lt;/span&gt;</description>
                <category>Miscellaneous</category>
                <category>Technology</category>
                <enclosure url="http://example.org/audio/demo.mp3" length="1069871" type="audio/mpeg" />
                <pubDate>Thu, 05 Sep 2002 0:00:01 GMT</pubDate>
                <source url="http://www.example.org/links.xml">Example's Realm</source>
              </item>
              <item>
                <title>Second item title</title>
                <link>http://example.org/item/2</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location='http://example.org/')"&gt; nasty tricks&lt;/span&gt;</description>
                <category>Miscellaneous</category>
                <enclosure url="http://example.org/audio/demo.mp3" length="1069871" type="audio/mpeg" />
                <pubDate>Thu, 05 Sep 2002 0:00:01 GMT</pubDate>
                <source url="http://www.example.org/links.xml">Example's Realm</source>
              </item>
            </channel>
          </rss>
        `),
        {
          items: [
            {
              content:
                `Watch out for <span style="background: url(javascript:window.location='http://example.org/')"> nasty tricks</span>`,
              createdAt: new Date("2002-09-05T00:00:01.000Z"),
              enclosures: [
                {
                  title: undefined,
                  type: "audio/mpeg",
                  url: "http://example.org/audio/demo.mp3",
                },
              ],
              id: undefined,
              image: undefined,
              link: "http://example.org/item/1",
              title: "First item title",
              updatedAt: undefined,
            },
            {
              content:
                `Watch out for <span style="background: url(javascript:window.location='http://example.org/')"> nasty tricks</span>`,
              createdAt: new Date("2002-09-05T00:00:01.000Z"),
              enclosures: [
                {
                  title: undefined,
                  type: "audio/mpeg",
                  url: "http://example.org/audio/demo.mp3",
                },
              ],
              id: undefined,
              image: undefined,
              link: "http://example.org/item/2",
              title: "Second item title",
              updatedAt: undefined,
            },
          ],
          title: "Sample Feed",
          url: "http://example.org/",
        },
      );
    });

    it("should resolve an rss 0.94 feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0" encoding="utf-8"?>
          <rss version="0.94">
            <channel>
              <title>Sample Feed</title>
              <link>http://example.org/</link>
              <description>For documentation &lt;em&gt;only&lt;/em&gt;</description>
              <language>en</language>
              <copyright>Copyright 2004, Mark Pilgrim</copyright>
              <managingEditor>editor@example.org</managingEditor>
              <webMaster>webmaster@example.org</webMaster>
              <pubDate>Sat, 19 Mar 1988 07:15:00 GMT</pubDate>
              <lastBuildDate>Sat, 19 Mar 1988 07:15:00 GMT</lastBuildDate>
              <category>Examples1</category>
              <category domain="http://www.example.com/cusips">Examples2</category>
              <generator>Sample Toolkit</generator>
              <docs>http://backend.userland.com/rss094</docs>
              <cloud domain="rpc.example.com" port="80" path="/RPC2" registerProcedure="pingMe" protocol="soap" />
              <ttl>60</ttl>
              <image>
                <title>Example banner</title>
                <url>http://example.org/banner.png</url>
                <link>http://example.org/</link>
                <description>Quos placeat quod ea temporibus ratione</description>
                <width>80</width>
                <height>15</height>
              </image>
              <rating>(PICS-1.1 "http://www.rsac.org/ratingsv01.html" l by "webmaster@example.com" on "2006.01.29T10:09-0800" r (n 0 s 0 v 0 l 0))</rating>
              <textInput>
                <title>Search</title>
                <description>Search this site:</description>
                <name>q</name>
                <link>http://example.org/mt/mt-search.cgi</link>
              </textInput>
              <skipHours>
                <hour>0</hour>
                <hour>20</hour>
                <hour>21</hour>
                <hour>22</hour>
                <hour>23</hour>
              </skipHours>
              <skipDays>
                <day>Monday</day>
                <day>Wednesday</day>
                <day>Friday</day>
              </skipDays>
              <item>
                <title>First item title</title>
                <link>http://example.org/item/1</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location='http://example.org/')"&gt; nasty tricks&lt;/span&gt;</description>
                <author>mark@example.org</author>
                <category>Miscellaneous</category>
                <category domain="http://www.example.com/categories">Technology</category>
                <comments>http://example.org/comments/1</comments>
                <enclosure url="http://example.org/audio/demo.mp3" length="1069871" type="audio/mpeg" />
                <guid>http://example.org/guid/1</guid>
                <pubDate>Thu, 05 Sep 2002 0:00:01 GMT</pubDate>
                <source url="http://www.example.org/links.xml">Example's Realm</source>
              </item>
              <item>
                <title>Second item title</title>
                <link>http://example.org/item/2</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location='http://example.org/')"&gt; nasty tricks&lt;/span&gt;</description>
                <author>mark@example.org</author>
                <category>Miscellaneous</category>
                <comments>http://example.org/comments/2</comments>
                <enclosure url="http://example.org/audio/demo.mp3" length="1069871" type="audio/mpeg" />
                <guid>http://example.org/guid/2</guid>
                <pubDate>Thu, 05 Sep 2002 0:00:01 GMT</pubDate>
                <source url="http://www.example.org/links.xml">Example's Realm</source>
              </item>
            </channel>
          </rss>
        `),
        {
          items: [
            {
              content:
                `Watch out for <span style="background: url(javascript:window.location='http://example.org/')"> nasty tricks</span>`,
              createdAt: new Date("2002-09-05T00:00:01.000Z"),
              enclosures: [
                {
                  title: undefined,
                  type: "audio/mpeg",
                  url: "http://example.org/audio/demo.mp3",
                },
              ],
              id: "http://example.org/guid/1",
              image: undefined,
              link: "http://example.org/item/1",
              title: "First item title",
              updatedAt: undefined,
            },
            {
              content:
                `Watch out for <span style="background: url(javascript:window.location='http://example.org/')"> nasty tricks</span>`,
              createdAt: new Date("2002-09-05T00:00:01.000Z"),
              enclosures: [
                {
                  title: undefined,
                  type: "audio/mpeg",
                  url: "http://example.org/audio/demo.mp3",
                },
              ],
              id: "http://example.org/guid/2",
              image: undefined,
              link: "http://example.org/item/2",
              title: "Second item title",
              updatedAt: undefined,
            },
          ],
          title: "Sample Feed",
          url: "http://example.org/",
        },
      );
    });

    it("should resolve an rss 2.0 feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0" encoding="utf-8"?>
          <rss version="2.0">
            <channel>
              <title><![CDATA[Sample Feed]]></title>
              <link>http://example.org/</link>
              <description>For documentation &lt;em&gt;only&lt;/em&gt;</description>
              <language>en</language>
              <copyright>Copyright 2004, Mark Pilgrim</copyright>
              <managingEditor>editor@example.org</managingEditor>
              <webMaster>webmaster@example.org</webMaster>
              <pubDate>Sat, 19 Mar 1988 07:15:00 GMT</pubDate>
              <lastBuildDate>Sat, 19 Mar 1988 07:15:00 GMT</lastBuildDate>
              <category>Examples1</category>
              <category domain="http://www.example.com/cusips">Examples2</category>
              <generator>Sample Toolkit</generator>
              <docs>http://feedvalidator.org/docs/rss2.html</docs>
              <cloud domain="rpc.example.com" port="80" path="/RPC2" registerProcedure="pingMe" protocol="soap" />
              <ttl>60</ttl>
              <image>
                <title>Example banner</title>
                <url>http://example.org/banner.png</url>
                <link>http://example.org/</link>
                <description>Quos placeat quod ea temporibus ratione</description>
                <width>80</width>
                <height>15</height>
              </image>
              <rating>(PICS-1.1 "http://www.rsac.org/ratingsv01.html" l by "webmaster@example.com" on "2006.01.29T10:09-0800" r (n 0 s 0 v 0 l 0))</rating>
              <textInput>
                <title>Search</title>
                <description><![CDATA[Search this site:]]></description>
                <name>q</name>
                <link>http://example.org/mt/mt-search.cgi</link>
              </textInput>
              <skipHours>
                <hour>0</hour>
                <hour>20</hour>
                <hour>21</hour>
                <hour>22</hour>
                <hour>23</hour>
              </skipHours>
              <skipDays>
                <day>Monday</day>
                <day>Wednesday</day>
                <day>Friday</day>
              </skipDays>
              <item>
                <title>First item title</title>
                <link>http://example.org/item/1</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location=’http://example.org/’)"&gt; nasty tricks&lt;/span&gt;</description>
                <author>mark@example.org (Mark Pilgrim)</author>
                <category>Miscellaneous</category>
                <category domain="http://www.example.com/categories">Technology</category>
                <comments>http://example.org/comments/1</comments>
                <enclosure url="http://example.org/audio/demo.mp3" length="1069871" type="audio/mpeg" />
                <guid isPermaLink="true">http://example.org/guid/1</guid>
                <pubDate>Thu, 05 Sep 2002 0:00:01 GMT</pubDate>
                <source url="http://www.example.org/links.xml">Example's Realm</source>
              </item>
              <item>
                <title>Second item title</title>
                <link>http://example.org/item/2</link>
                <description>Watch out for &lt;span style="background: url(javascript:window.location=’http://example.org/’)"&gt; nasty tricks&lt;/span&gt;</description>
                <author>mark@example.org (Mark Pilgrim)</author>
                <category>Miscellaneous</category>
                <comments>http://example.org/comments/2</comments>
                <enclosure url="http://example.org/audio/demo.mp3" length="1069871" type="audio/mpeg" />
                <guid>http://example.org/guid/2</guid>
                <pubDate>Thu, 05 Sep 2002 0:00:01 GMT</pubDate>
                <source url="http://www.example.org/links.xml">Example's Realm</source>
              </item>
            </channel>
          </rss>
        `),
        {
          items: [
            {
              content:
                'Watch out for <span style="background: url(javascript:window.location=’http://example.org/’)"> nasty tricks</span>',
              createdAt: new Date("2002-09-05T00:00:01.000Z"),
              enclosures: [
                {
                  title: undefined,
                  type: "audio/mpeg",
                  url: "http://example.org/audio/demo.mp3",
                },
              ],
              id: "http://example.org/guid/1",
              image: undefined,
              link: "http://example.org/item/1",
              title: "First item title",
              updatedAt: undefined,
            },
            {
              content:
                'Watch out for <span style="background: url(javascript:window.location=’http://example.org/’)"> nasty tricks</span>',
              createdAt: new Date("2002-09-05T00:00:01.000Z"),
              enclosures: [
                {
                  title: undefined,
                  type: "audio/mpeg",
                  url: "http://example.org/audio/demo.mp3",
                },
              ],
              id: "http://example.org/guid/2",
              image: undefined,
              link: "http://example.org/item/2",
              title: "Second item title",
              updatedAt: undefined,
            },
          ],
          title: "Sample Feed",
          url: "http://example.org/",
        },
      );
    });

    it("should resolve an rss 2.0 namespaced feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0" encoding="utf-8"?>
          <rss version="2.0">
            <channel>
              <title>Example Feed</title>
              <link>http://example.org</link>
              <dc:creator>John Doe</dc:creator>
              <dc:contributor>Jane Smith</dc:contributor>
              <dc:date>2022-01-01T12:00+00:00</dc:date>
              <dc:description>This is an example of description.</dc:description>
              <sy:updateBase>2000-01-01T12:00+00:00</sy:updateBase>
              <sy:updatePeriod>hourly</sy:updatePeriod>
              <sy:updateFrequency>1</sy:updateFrequency>
              <itunes:category text="Society &amp; Culture"/>
              <itunes:owner>
                <itunes:name>Jack Smith</itunes:name>
                <itunes:email>news@example.com</itunes:email>
              </itunes:owner>

              <!-- Podcast Namespace: Channel Level Tags -->
              <podcast:locked owner="podcast@example.com">yes</podcast:locked>
              <podcast:funding url="https://example.com/support">Support Our Show</podcast:funding>
              <podcast:person group="host" img="https://example.com/images/host.jpg" href="https://example.com/host">Jane Smith</podcast:person>
              <podcast:person group="guest" img="https://example.com/images/guest.jpg" href="https://example.com/guest">John Doe</podcast:person>
              <podcast:location geo="geo:37.7749,-122.4194" osm="R4163767">San Francisco, CA</podcast:location>
              <podcast:trailer url="https://example.com/trailers/season1.mp3" length="1048576" type="audio/mpeg" pubdate="2025-04-20T08:00:00+02:00" season="1">Season 1 Trailer</podcast:trailer>
              <podcast:license url="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</podcast:license>
              <podcast:guid>ead4c236-bf58-58c6-a2c6-a6b28d128cb6</podcast:guid>
              <podcast:value type="lightning" method="keysend" suggested="0.00000005000">
                <podcast:valueRecipient name="Host" address="02d5c1bf8b940dc9cadca86d1b0a3c37fbe39cee83420ef254acd7d8e5edf5f16e" split="90" type="node" />
                <podcast:valueRecipient name="Producer" address="03ae9f91a0cb8ff43840e3c322c4c61f019d8c1c3cea15a25cfc425ac605e61a4a" split="10" type="node" />
              </podcast:value>
              <podcast:medium>podcast</podcast:medium>
              <podcast:images srcset="https://example.com/images/cover-1000.jpg 1000w, https://example.com/images/cover-600.jpg 600w" />
              <podcast:liveItem status="live" start="2025-04-30T09:00:00+01:00" end="2025-04-30T10:00:00+01:00">
                <podcast:person group="host">Jane Smith</podcast:person>
                <podcast:contentLink href="https://example.com/live/chat">Live Chat</podcast:contentLink>
              </podcast:liveItem>
              <podcast:block>yes</podcast:block>
              <podcast:block id="test">no</podcast:block>
              <podcast:txt purpose="info">Additional text information about the podcast</podcast:txt>
              <podcast:remoteItem feedGuid="ead4c236-bf58-58c6-a2c6-a6b28d128cb9" feedUrl="https://guest-podcast.example/feed.xml" itemGuid="episode-guid-here" />
              <podcast:podroll>
                <podcast:remoteItem feedGuid="ead4c236-bf58-58c6-a2c6-a6b28d128cb8" feedUrl="https://example.com/related-podcast1.xml" />
                <podcast:remoteItem feedGuid="ead4c236-bf58-58c6-a2c6-a6b28d128cb7" feedUrl="https://example.com/related-podcast2.xml" />
              </podcast:podroll>
              <podcast:updateFrequency complete="false" rrule="FREQ=WEEKLY;BYDAY=FR" dtstart="2025-01-10T08:00:00+01:00">Weekly on Fridays</podcast:updateFrequency>
              <podcast:podping usesPodping="true" />

              <!-- Media Namespace: Item/Feed Level Tags -->
              <media:content url="https://example.com/videos/sample1.mp4" fileSize="12345678" type="video/mp4" medium="video" isDefault="true" expression="full" bitrate="1500" framerate="30" samplingrate="44.1" channels="2" duration="120" height="720" width="1280" lang="en">
                <media:title type="plain">Sample Video Title</media:title>
                <media:description type="html">This is a &lt;b&gt;sample video&lt;/b&gt; demonstrating media:content</media:description>
                <media:keywords>sample, video, example, media, rss</media:keywords>
                <media:thumbnail url="https://example.com/thumbnails/sample1.jpg" width="320" height="180" time="00:00:15.000"/>
                <media:category scheme="http://search.yahoo.com/mrss/category_schema">Entertainment</media:category>
                <media:hash algo="md5">dfdec888b7f38882e8a698d52eaebc04</media:hash>
                <media:credit role="producer" scheme="urn:ebu">Jane Smith</media:credit>
                <media:rating scheme="urn:simple">adult</media:rating>
                <media:copyright>© 2025 Example Media Inc.</media:copyright>
                <media:text type="transcript" lang="en" start="00:00:03" end="00:00:10">This is a sample transcript text</media:text>
                <media:restriction relationship="allow" type="country">us ca gb</media:restriction>
                <media:community>
                  <media:starRating average="4.5" count="2500" min="1" max="5" />
                  <media:statistics views="12345" favorites="413" />
                  <media:tags>featured, media, example</media:tags>
                </media:community>
                <media:comments>
                  <media:comment>Great video!</media:comment>
                  <media:comment>Very informative content</media:comment>
                </media:comments>
                <media:embed url="https://example.com/players/embed" width="640" height="360">
                  <media:param name="autoplay">true</media:param>
                  <media:param name="theme">dark</media:param>
                </media:embed>
                <media:responses>
                  <media:response>https://example.com/videos/response1</media:response>
                </media:responses>
                <media:backLinks>
                  <media:backLink>https://example.com/articles/related</media:backLink>
                </media:backLinks>
                <media:status state="active" />
                <media:price type="rent" price="2.99" currency="USD" />
                <media:license type="text/html" href="https://example.com/license">Standard License</media:license>
                <media:peerLink type="application/torrent" href="https://example.com/torrents/sample1.torrent" />
                <media:location>Sample Studio</media:location>
                <media:rights status="official" />
                <media:scenes>
                  <media:scene>
                    <sceneTitle>Introduction</sceneTitle>
                    <sceneDescription>Opening sequence</sceneDescription>
                    <sceneStartTime>00:00:00</sceneStartTime>
                    <sceneEndTime>00:00:30</sceneEndTime>
                  </media:scene>
                  <media:scene>
                    <sceneTitle>Main Content</sceneTitle>
                    <sceneStartTime>00:00:30</sceneStartTime>
                    <sceneEndTime>00:01:45</sceneEndTime>
                  </media:scene>
                </media:scenes>
              </media:content>
              <media:group>
                <media:title>Multi-Format Content Example</media:title>
                <media:description>This video is available in multiple formats and resolutions</media:description>
                <media:thumbnail url="https://example.com/thumbnails/group-main.jpg" width="640" height="360" />
                <media:thumbnail url="https://example.com/thumbnails/group-alt.jpg" width="1280" height="720" />
                <media:keywords>group, multiple, formats, resolutions</media:keywords>
                <media:category>Technology</media:category>
                <media:rating scheme="urn:mpaa">PG</media:rating>
                <media:copyright>© 2025 Example Media Inc.</media:copyright>
                <media:content url="https://example.com/videos/sample-hd.mp4" fileSize="45678912" type="video/mp4" medium="video" expression="full" bitrate="5000" framerate="60" duration="180" height="1080" width="1920" lang="en">
                  <media:title>HD Version (1080p)</media:title>
                </media:content>
                <media:content url="https://example.com/videos/sample-sd.mp4" fileSize="23456789" type="video/mp4" medium="video" expression="full" bitrate="2500" framerate="30" duration="180" height="720" width="1280" lang="en">
                  <media:title>SD Version (720p)</media:title>
                </media:content>
                <media:content url="https://example.com/videos/sample.webm" fileSize="19876543" type="video/webm" medium="video" expression="full" bitrate="2000" framerate="30" duration="180" height="720" width="1280" lang="en">
                  <media:title>WebM Version</media:title>
                </media:content>
                <media:content url="https://example.com/audio/sample.mp3" fileSize="3456789" type="audio/mpeg" medium="audio" expression="full" bitrate="320" samplingrate="44.1" channels="2" duration="180" lang="en">
                  <media:title>Audio Only Version</media:title>
                </media:content>
                <media:content url="https://example.com/captions/sample-en.srt" type="text/srt" medium="document" expression="sample" lang="en">
                  <media:title>English Subtitles</media:title>
                </media:content>
                <media:content url="https://example.com/captions/sample-es.srt" type="text/srt" medium="document" expression="sample" lang="es">
                  <media:title>Spanish Subtitles</media:title>
                </media:content>
              </media:group>
              <media:title type="text">Advanced Media Features Demo</media:title>
              <media:credit role="director" scheme="urn:ebu">Michael Chang</media:credit>
              <media:credit role="actor" scheme="urn:ebu">Sarah Johnson</media:credit>
              <media:credit role="actor" scheme="urn:ebu">Robert Williams</media:credit>
              <media:category scheme="http://dmoz.org">Arts/Movies/Titles/A/</media:category>
              <media:status state="active" reason="approved" />
              <media:thumbnail url="https://example.com/thumbnails/adv-1.jpg" time="00:00:05.000" />
              <media:thumbnail url="https://example.com/thumbnails/adv-2.jpg" time="00:01:15.000" />
              <media:thumbnail url="https://example.com/thumbnails/adv-3.jpg" time="00:02:30.000" />
              <media:price type="package" price="9.99" currency="USD" info="full access">Complete Package</media:price>
              <media:price type="subscription" price="4.99" currency="USD" info="monthly">Monthly Subscription</media:price>
              <media:restriction relationship="allow" type="country">us ca gb de fr</media:restriction>
              <media:restriction relationship="deny" type="sharing">true</media:restriction>
              <media:rating scheme="urn:mpaa">PG-13</media:rating>
              <media:rating scheme="urn:v-chip">TV-14</media:rating>
              <media:community>
                <media:starRating average="4.8" count="12563" min="1" max="5" />
                <media:statistics views="256789" favorites="3421" shares="1245" />
                <media:tags>cinematic, production, advanced, technical, demo</media:tags>
              </media:community>

              <!-- GeoRSS-Simple Namespace: Item/Feed Level Tags (while not typical, included are all values for testing) -->
              <georss:point>37.78 -122.42</georss:point>
              <georss:line>37.78 -122.42 37.42 -122.10 37.86 -122.27</georss:line>
              <georss:polygon>37.86 -122.47 37.86 -122.37 37.76 -122.37 37.76 -122.47 37.86 -122.47</georss:polygon>
              <georss:box>37.15 -122.85 38.15 -121.85</georss:box>
              <georss:featuretypetag>region</georss:featuretypetag>
              <georss:relationshiptag>contains</georss:relationshiptag>
              <georss:featurename>San Francisco Bay Area</georss:featurename>
              <georss:elev>360</georss:elev>
              <georss:floor>4</georss:floor>
              <georss:radius>50000</georss:radius>

              <item>
                <title>Example Item</title>
                <link>http://example.org/item/1</link>
                <content:encoded>This is an example of content.</content:encoded>
                <dc:creator>Jack Jackson</dc:creator>
                <dc:date>2022-01-01T12:00+00:00</dc:date>
                <slash:section>articles</slash:section>
                <slash:department>not-an-ocean-unless-there-are-lobsters</slash:department>
                <slash:comments>177</slash:comments>
                <slash:hit_parade>177,155,105,33,6,3,0</slash:hit_parade>
                <itunes:explicit>false</itunes:explicit>
                <author xmlns:author="http://www.w3.org/2005/Atom">
                  <name>John Smith</name>
                  <title>Director, Business Development at Tech Corp</title>
                  <department/>
                  <company/>
                </author>

                <!-- Podcast Namespace: Item Level Tags -->
                <podcast:transcript url="https://example.com/episodes/123/transcript.vtt" type="text/vtt" language="en" />
                <podcast:transcript url="https://example.com/episodes/123/transcript.srt" type="application/x-subrip" language="en" rel="captions" />
                <podcast:chapters url="https://example.com/episodes/123/chapters.json" type="application/json+chapters" />
                <podcast:soundbite startTime="60" duration="30">The key takeaway from this episode</podcast:soundbite>
                <podcast:soundbite startTime="120" duration="45">Another important highlight</podcast:soundbite>
                <podcast:person group="host" img="https://example.com/images/host.jpg" href="https://example.com/host">Jane Smith</podcast:person>
                <podcast:person group="guest" img="https://example.com/images/guest.jpg" href="https://example.com/guest">John Doe</podcast:person>
                <podcast:person role="producer" img="https://example.com/images/producer.jpg" href="https://example.com/producer">Sam Johnson</podcast:person>
                <podcast:location geo="geo:40.7128,-74.0060" osm="R8780673">New York City, NY</podcast:location>
                <podcast:season name="First Season">1</podcast:season>
                <podcast:episode display="Episode 1">1</podcast:episode>
                <podcast:license url="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</podcast:license>
                <podcast:alternateEnclosure type="audio/mpeg" length="24576000" bitrate="128000" title="MP3 Audio" default="true">
                  <podcast:source uri="https://example.com/episodes/123.mp3" />
                  <podcast:integrity type="sri" value="sha384-ExampleHashValueABCDEF123456789" />
                </podcast:alternateEnclosure>
                <podcast:alternateEnclosure type="audio/aac" length="16384000" bitrate="96000" title="AAC Audio">
                  <podcast:source uri="https://example.com/episodes/123.aac" />
                  <podcast:integrity type="sri" value="sha384-DifferentHashValue987654321" />
                </podcast:alternateEnclosure>
                <podcast:value type="lightning" method="keysend" suggested="0.00000002000">
                  <podcast:valueRecipient name="Host" address="02d5c1bf8b940dc9cadca86d1b0a3c37fbe39cee83420ef254acd7d8e5edf5f16e" split="90" type="node" />
                  <podcast:valueRecipient name="Guest" address="03ae9f91a0cb8ff43840e3c322c4c61f019d8c1c3cea15a25cfc425ac605e61a4a" split="10" type="node" />
                </podcast:value>
                <podcast:images srcset="https://example.com/images/episode-1000.jpg 1000w, https://example.com/images/episode-600.jpg 600w" />
                <podcast:socialInteract protocol="twitter" uri="https://twitter.com/examplepodcast/status/123456789" accountId="@examplepodcast" accountUrl="https://twitter.com/examplepodcast" />
                <podcast:socialInteract protocol="mastodon" uri="https://podcastindex.social/@dave/123456789" accountId="@examplepodcast@podcastindex.social" accountUrl="https://podcastindex.social/@examplepodcast" />
                <podcast:txt purpose="transcript">{"version": "1.0.0", "chapters": []}</podcast:txt>
                <podcast:txt purpose="notes">Additional text information about this episode</podcast:txt>

                <!-- Media Namespace: Item/Feed Level Tags -->
                <media:content url="https://example.com/videos/sample1.mp4" fileSize="12345678" type="video/mp4" medium="video" isDefault="true" expression="full" bitrate="1500" framerate="30" samplingrate="44.1" channels="2" duration="120" height="720" width="1280" lang="en">
                  <media:title type="plain">Sample Video Title</media:title>
                  <media:description type="html">This is a &lt;b&gt;sample video&lt;/b&gt; demonstrating media:content</media:description>
                  <media:keywords>sample, video, example, media, rss</media:keywords>
                  <media:thumbnail url="https://example.com/thumbnails/sample1.jpg" width="320" height="180" time="00:00:15.000"/>
                  <media:category scheme="http://search.yahoo.com/mrss/category_schema">Entertainment</media:category>
                  <media:hash algo="md5">dfdec888b7f38882e8a698d52eaebc04</media:hash>
                  <media:credit role="producer" scheme="urn:ebu">Jane Smith</media:credit>
                  <media:rating scheme="urn:simple">adult</media:rating>
                  <media:copyright>© 2025 Example Media Inc.</media:copyright>
                  <media:text type="transcript" lang="en" start="00:00:03" end="00:00:10">This is a sample transcript text</media:text>
                  <media:restriction relationship="allow" type="country">us ca gb</media:restriction>
                  <media:community>
                    <media:starRating average="4.5" count="2500" min="1" max="5" />
                    <media:statistics views="12345" favorites="413" />
                    <media:tags>featured, media, example</media:tags>
                  </media:community>
                  <media:comments>
                    <media:comment>Great video!</media:comment>
                    <media:comment>Very informative content</media:comment>
                  </media:comments>
                  <media:embed url="https://example.com/players/embed" width="640" height="360">
                    <media:param name="autoplay">true</media:param>
                    <media:param name="theme">dark</media:param>
                  </media:embed>
                  <media:responses>
                    <media:response>https://example.com/videos/response1</media:response>
                  </media:responses>
                  <media:backLinks>
                    <media:backLink>https://example.com/articles/related</media:backLink>
                  </media:backLinks>
                  <media:status state="active" />
                  <media:price type="rent" price="2.99" currency="USD" />
                  <media:license type="text/html" href="https://example.com/license">Standard License</media:license>
                  <media:peerLink type="application/torrent" href="https://example.com/torrents/sample1.torrent" />
                  <media:location>Sample Studio</media:location>
                  <media:rights status="official" />
                  <media:scenes>
                    <media:scene>
                      <sceneTitle>Introduction</sceneTitle>
                      <sceneDescription>Opening sequence</sceneDescription>
                      <sceneStartTime>00:00:00</sceneStartTime>
                      <sceneEndTime>00:00:30</sceneEndTime>
                    </media:scene>
                    <media:scene>
                      <sceneTitle>Main Content</sceneTitle>
                      <sceneStartTime>00:00:30</sceneStartTime>
                      <sceneEndTime>00:01:45</sceneEndTime>
                    </media:scene>
                  </media:scenes>
                </media:content>
                <media:group>
                  <media:title>Multi-Format Content Example</media:title>
                  <media:description>This video is available in multiple formats and resolutions</media:description>
                  <media:thumbnail url="https://example.com/thumbnails/group-main.jpg" width="640" height="360" />
                  <media:thumbnail url="https://example.com/thumbnails/group-alt.jpg" width="1280" height="720" />
                  <media:keywords>group, multiple, formats, resolutions</media:keywords>
                  <media:category>Technology</media:category>
                  <media:rating scheme="urn:mpaa">PG</media:rating>
                  <media:copyright>© 2025 Example Media Inc.</media:copyright>
                  <media:content url="https://example.com/videos/sample-hd.mp4" fileSize="45678912" type="video/mp4" medium="video" expression="full" bitrate="5000" framerate="60" duration="180" height="1080" width="1920" lang="en">
                    <media:title>HD Version (1080p)</media:title>
                  </media:content>
                  <media:content url="https://example.com/videos/sample-sd.mp4" fileSize="23456789" type="video/mp4" medium="video" expression="full" bitrate="2500" framerate="30" duration="180" height="720" width="1280" lang="en">
                    <media:title>SD Version (720p)</media:title>
                  </media:content>
                  <media:content url="https://example.com/videos/sample.webm" fileSize="19876543" type="video/webm" medium="video" expression="full" bitrate="2000" framerate="30" duration="180" height="720" width="1280" lang="en">
                    <media:title>WebM Version</media:title>
                  </media:content>
                  <media:content url="https://example.com/audio/sample.mp3" fileSize="3456789" type="audio/mpeg" medium="audio" expression="full" bitrate="320" samplingrate="44.1" channels="2" duration="180" lang="en">
                    <media:title>Audio Only Version</media:title>
                  </media:content>
                  <media:content url="https://example.com/captions/sample-en.srt" type="text/srt" medium="document" expression="sample" lang="en">
                    <media:title>English Subtitles</media:title>
                  </media:content>
                  <media:content url="https://example.com/captions/sample-es.srt" type="text/srt" medium="document" expression="sample" lang="es">
                    <media:title>Spanish Subtitles</media:title>
                  </media:content>
                </media:group>
                <media:title type="text">Advanced Media Features Demo</media:title>
                <media:credit role="director" scheme="urn:ebu">Michael Chang</media:credit>
                <media:credit role="actor" scheme="urn:ebu">Sarah Johnson</media:credit>
                <media:credit role="actor" scheme="urn:ebu">Robert Williams</media:credit>
                <media:category scheme="http://dmoz.org">Arts/Movies/Titles/A/</media:category>
                <media:status state="active" reason="approved" />
                <media:thumbnail url="https://example.com/thumbnails/adv-1.jpg" time="00:00:05.000" />
                <media:thumbnail url="https://example.com/thumbnails/adv-2.jpg" time="00:01:15.000" />
                <media:thumbnail url="https://example.com/thumbnails/adv-3.jpg" time="00:02:30.000" />
                <media:price type="package" price="9.99" currency="USD" info="full access">Complete Package</media:price>
                <media:price type="subscription" price="4.99" currency="USD" info="monthly">Monthly Subscription</media:price>
                <media:restriction relationship="allow" type="country">us ca gb de fr</media:restriction>
                <media:restriction relationship="deny" type="sharing">true</media:restriction>
                <media:rating scheme="urn:mpaa">PG-13</media:rating>
                <media:rating scheme="urn:v-chip">TV-14</media:rating>
                <media:community>
                  <media:starRating average="4.8" count="12563" min="1" max="5" />
                  <media:statistics views="256789" favorites="3421" shares="1245" />
                  <media:tags>cinematic, production, advanced, technical, demo</media:tags>
                </media:community>

                <!-- GeoRSS-Simple Namespace: Item/Feed Level Tags (while not typical, included are all values for testing) -->
                <georss:point>37.78 -122.42</georss:point>
                <georss:line>37.78 -122.42 37.42 -122.10 37.86 -122.27</georss:line>
                <georss:polygon>37.86 -122.47 37.86 -122.37 37.76 -122.37 37.76 -122.47 37.86 -122.47</georss:polygon>
                <georss:box>37.15 -122.85 38.15 -121.85</georss:box>
                <georss:featuretypetag>region</georss:featuretypetag>
                <georss:relationshiptag>contains</georss:relationshiptag>
                <georss:featurename>San Francisco Bay Area</georss:featurename>
                <georss:elev>360</georss:elev>
                <georss:floor>4</georss:floor>
                <georss:radius>50000</georss:radius>

                <!-- Atom Threading Namespace: Item Level Tags -->
                <thr:total>100</thr:total>
                <thr:in-reply-to ref="urn:uuid:d5e9c5d0-4c0c-11ec-81d3-0242ac130003" href="https://example.com/posts/understanding-xml-namespaces" type="application/xhtml+xml"/>
                <thr:in-reply-to ref="urn:uuid:e7865b80-4c0c-11ec-81d3-0242ac130003" href="https://example.com/posts/understanding-xml-namespaces/comments/1" type="application/xhtml+xml"/>
                <link rel="replies" href="https://example.com/posts/understanding-xml-namespaces/comments/1/replies" thr:count="2" thr:updated="2025-05-10T16:45:00Z"/>
              </item>
            </channel>
          </rss>
        `),
        {
          items: [
            {
              content: "This is an example of content.",
              createdAt: new Date("2022-01-01T12:00:00.000Z"),
              enclosures: [],
              id: undefined,
              image: "https://example.com/thumbnails/adv-1.jpg",
              link: "http://example.org/item/1",
              title: "Example Item",
              updatedAt: undefined,
            },
          ],
          title: "Example Feed",
          url: "http://example.org",
        },
      );
    });
  });

  describe("rdf feed", () => {
    it("should resolve an rdf 0.9 feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0"?>
          <rdf:RDF
            xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns="http://channel.netscape.com/rdf/simple/0.9/"
          >
            <channel>
              <title>Mozilla Dot Org</title>
              <link>http://www.mozilla.org</link>
              <description>the Mozilla Organization web site</description>
            </channel>
            <image>
              <title>Mozilla</title>
              <url>http://www.mozilla.org/images/moz.gif</url>
              <link>http://www.mozilla.org</link>
            </image>
            <item rdf:about="http://example.org/item1">
              <title>New Status Updates</title>
              <link>http://www.mozilla.org/status/</link>
            </item>
            <item rdf:about="http://example.org/item2">
              <title>Bugzilla Reorganized</title>
              <link>http://www.mozilla.org/bugs/</link>
            </item>
            <item rdf:about="http://example.org/item3">
              <title>Mozilla Party, 2.0!</title>
              <link>http://www.mozilla.org/party/1999/</link>
            </item>
            <item rdf:about="http://example.org/item4">
              <title>Unix Platform Parity</title>
              <link>http://www.mozilla.org/build/unix.html</link>
            </item>
            <item rdf:about="http://example.org/item5">
              <title>NPL 1.0M published</title>
              <link>http://www.mozilla.org/NPL/NPL-1.0M.html</link>
            </item>
          </rdf:RDF>
        `),
        {
          items: [
            {
              content: undefined,
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://www.mozilla.org/status/",
              title: "New Status Updates",
              updatedAt: undefined,
            },
            {
              content: undefined,
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://www.mozilla.org/bugs/",
              title: "Bugzilla Reorganized",
              updatedAt: undefined,
            },
            {
              content: undefined,
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://www.mozilla.org/party/1999/",
              title: "Mozilla Party, 2.0!",
              updatedAt: undefined,
            },
            {
              content: undefined,
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://www.mozilla.org/build/unix.html",
              title: "Unix Platform Parity",
              updatedAt: undefined,
            },
            {
              content: undefined,
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://www.mozilla.org/NPL/NPL-1.0M.html",
              title: "NPL 1.0M published",
              updatedAt: undefined,
            },
          ],
          title: "Mozilla Dot Org",
          url: "http://www.mozilla.org",
        },
      );
    });

    it("should resolve an rdf 1.0 feed", () => {
      assertEquals(
        resolve(`
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
              <textinput rdf:resource="http://search.xml.com" />
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
            <textinput rdf:about="http://search.xml.com">
              <title>Search XML.com</title>
              <description>Search XML.com's XML collection</description>
              <name>s</name>
              <link>http://search.xml.com</link>
            </textinput>
          </rdf:RDF>
        `),
        {
          items: [
            {
              content:
                "Processing document inclusions with general XML tools can be\n" +
                "              problematic. This article proposes a way of preserving inclusion\n" +
                "              information through SAX-based processing.",
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://xml.com/pub/2000/08/09/xslt/xslt.html",
              title: "Processing Inclusions with XSLT",
              updatedAt: undefined,
            },
            {
              content:
                "Tool and API support for the Resource Description Framework\n" +
                "              is slowly coming of age. Edd Dumbill takes a look at RDFDB,\n" +
                "              one of the most exciting new RDF toolkits.",
              createdAt: undefined,
              enclosures: [],
              id: undefined,
              image: undefined,
              link: "http://xml.com/pub/2000/08/09/rdfdb/index.html",
              title: "Putting RDF to Work",
              updatedAt: undefined,
            },
          ],
          title: "XML.com",
          url: "http://xml.com/pub",
        },
      );
    });

    it("should resolve an rdf 1.0 namespaced feed", () => {
      assertEquals(
        resolve(`
          <?xml version="1.0"?>
          <rdf:RDF
            xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns="http://purl.org/rss/1.0/"
          >
            <channel rdf:about="http://example.org/rss">
              <title>Example Feed</title>
              <link>http://example.org</link>
              <dc:creator>John Doe</dc:creator>
              <dc:contributor>Jane Smith</dc:contributor>
              <dc:date>2022-01-01T12:00+00:00</dc:date>
              <dc:description>This is an example of description.</dc:description>
              <sy:updateBase>2000-01-01T12:00+00:00</sy:updateBase>
              <sy:updatePeriod>hourly</sy:updatePeriod>
              <sy:updateFrequency>1</sy:updateFrequency>

              <!-- Media Namespace: Item/Feed Level Tags -->
              <media:content url="https://example.com/videos/sample1.mp4" fileSize="12345678" type="video/mp4" medium="video" isDefault="true" expression="full" bitrate="1500" framerate="30" samplingrate="44.1" channels="2" duration="120" height="720" width="1280" lang="en">
                <media:title type="plain">Sample Video Title</media:title>
                <media:description type="html">This is a &lt;b&gt;sample video&lt;/b&gt; demonstrating media:content</media:description>
                <media:keywords>sample, video, example, media, rss</media:keywords>
                <media:thumbnail url="https://example.com/thumbnails/sample1.jpg" width="320" height="180" time="00:00:15.000"/>
                <media:category scheme="http://search.yahoo.com/mrss/category_schema">Entertainment</media:category>
                <media:hash algo="md5">dfdec888b7f38882e8a698d52eaebc04</media:hash>
                <media:credit role="producer" scheme="urn:ebu">Jane Smith</media:credit>
                <media:rating scheme="urn:simple">adult</media:rating>
                <media:copyright>© 2025 Example Media Inc.</media:copyright>
                <media:text type="transcript" lang="en" start="00:00:03" end="00:00:10">This is a sample transcript text</media:text>
                <media:restriction relationship="allow" type="country">us ca gb</media:restriction>
                <media:community>
                  <media:starRating average="4.5" count="2500" min="1" max="5" />
                  <media:statistics views="12345" favorites="413" />
                  <media:tags>featured, media, example</media:tags>
                </media:community>
                <media:comments>
                  <media:comment>Great video!</media:comment>
                  <media:comment>Very informative content</media:comment>
                </media:comments>
                <media:embed url="https://example.com/players/embed" width="640" height="360">
                  <media:param name="autoplay">true</media:param>
                  <media:param name="theme">dark</media:param>
                </media:embed>
                <media:responses>
                  <media:response>https://example.com/videos/response1</media:response>
                </media:responses>
                <media:backLinks>
                  <media:backLink>https://example.com/articles/related</media:backLink>
                </media:backLinks>
                <media:status state="active" />
                <media:price type="rent" price="2.99" currency="USD" />
                <media:license type="text/html" href="https://example.com/license">Standard License</media:license>
                <media:peerLink type="application/torrent" href="https://example.com/torrents/sample1.torrent" />
                <media:location>Sample Studio</media:location>
                <media:rights status="official" />
                <media:scenes>
                  <media:scene>
                    <sceneTitle>Introduction</sceneTitle>
                    <sceneDescription>Opening sequence</sceneDescription>
                    <sceneStartTime>00:00:00</sceneStartTime>
                    <sceneEndTime>00:00:30</sceneEndTime>
                  </media:scene>
                  <media:scene>
                    <sceneTitle>Main Content</sceneTitle>
                    <sceneStartTime>00:00:30</sceneStartTime>
                    <sceneEndTime>00:01:45</sceneEndTime>
                  </media:scene>
                </media:scenes>
              </media:content>
              <media:group>
                <media:title>Multi-Format Content Example</media:title>
                <media:description>This video is available in multiple formats and resolutions</media:description>
                <media:thumbnail url="https://example.com/thumbnails/group-main.jpg" width="640" height="360" />
                <media:thumbnail url="https://example.com/thumbnails/group-alt.jpg" width="1280" height="720" />
                <media:keywords>group, multiple, formats, resolutions</media:keywords>
                <media:category>Technology</media:category>
                <media:rating scheme="urn:mpaa">PG</media:rating>
                <media:copyright>© 2025 Example Media Inc.</media:copyright>
                <media:content url="https://example.com/videos/sample-hd.mp4" fileSize="45678912" type="video/mp4" medium="video" expression="full" bitrate="5000" framerate="60" duration="180" height="1080" width="1920" lang="en">
                  <media:title>HD Version (1080p)</media:title>
                </media:content>
                <media:content url="https://example.com/videos/sample-sd.mp4" fileSize="23456789" type="video/mp4" medium="video" expression="full" bitrate="2500" framerate="30" duration="180" height="720" width="1280" lang="en">
                  <media:title>SD Version (720p)</media:title>
                </media:content>
                <media:content url="https://example.com/videos/sample.webm" fileSize="19876543" type="video/webm" medium="video" expression="full" bitrate="2000" framerate="30" duration="180" height="720" width="1280" lang="en">
                  <media:title>WebM Version</media:title>
                </media:content>
                <media:content url="https://example.com/audio/sample.mp3" fileSize="3456789" type="audio/mpeg" medium="audio" expression="full" bitrate="320" samplingrate="44.1" channels="2" duration="180" lang="en">
                  <media:title>Audio Only Version</media:title>
                </media:content>
                <media:content url="https://example.com/captions/sample-en.srt" type="text/srt" medium="document" expression="sample" lang="en">
                  <media:title>English Subtitles</media:title>
                </media:content>
                <media:content url="https://example.com/captions/sample-es.srt" type="text/srt" medium="document" expression="sample" lang="es">
                  <media:title>Spanish Subtitles</media:title>
                </media:content>
              </media:group>
              <media:title type="text">Advanced Media Features Demo</media:title>
              <media:credit role="director" scheme="urn:ebu">Michael Chang</media:credit>
              <media:credit role="actor" scheme="urn:ebu">Sarah Johnson</media:credit>
              <media:credit role="actor" scheme="urn:ebu">Robert Williams</media:credit>
              <media:category scheme="http://dmoz.org">Arts/Movies/Titles/A/</media:category>
              <media:status state="active" reason="approved" />
              <media:thumbnail url="https://example.com/thumbnails/adv-1.jpg" time="00:00:05.000" />
              <media:thumbnail url="https://example.com/thumbnails/adv-2.jpg" time="00:01:15.000" />
              <media:thumbnail url="https://example.com/thumbnails/adv-3.jpg" time="00:02:30.000" />
              <media:price type="package" price="9.99" currency="USD" info="full access">Complete Package</media:price>
              <media:price type="subscription" price="4.99" currency="USD" info="monthly">Monthly Subscription</media:price>
              <media:restriction relationship="allow" type="country">us ca gb de fr</media:restriction>
              <media:restriction relationship="deny" type="sharing">true</media:restriction>
              <media:rating scheme="urn:mpaa">PG-13</media:rating>
              <media:rating scheme="urn:v-chip">TV-14</media:rating>
              <media:community>
                <media:starRating average="4.8" count="12563" min="1" max="5" />
                <media:statistics views="256789" favorites="3421" shares="1245" />
                <media:tags>cinematic, production, advanced, technical, demo</media:tags>
              </media:community>

              <!-- GeoRSS-Simple Namespace: Item/Feed Level Tags (while not typical, included are all values for testing) -->
              <georss:point>37.78 -122.42</georss:point>
              <georss:line>37.78 -122.42 37.42 -122.10 37.86 -122.27</georss:line>
              <georss:polygon>37.86 -122.47 37.86 -122.37 37.76 -122.37 37.76 -122.47 37.86 -122.47</georss:polygon>
              <georss:box>37.15 -122.85 38.15 -121.85</georss:box>
              <georss:featuretypetag>region</georss:featuretypetag>
              <georss:relationshiptag>contains</georss:relationshiptag>
              <georss:featurename>San Francisco Bay Area</georss:featurename>
              <georss:elev>360</georss:elev>
              <georss:floor>4</georss:floor>
              <georss:radius>50000</georss:radius>
            </channel>

            <item rdf:about="http://example.org/item/1">
              <title>Example Item</title>
              <link>http://example.org/item/1</link>
              <content:encoded>This is an example of content.</content:encoded>
              <dc:creator>Jack Jackson</dc:creator>
              <dc:date>2022-01-01T12:00+00:00</dc:date>
              <slash:section>articles</slash:section>
              <slash:department>not-an-ocean-unless-there-are-lobsters</slash:department>
              <slash:comments>177</slash:comments>
              <slash:hit_parade>177,155,105,33,6,3,0</slash:hit_parade>

              <!-- Media Namespace: Item/Feed Level Tags -->
              <media:content url="https://example.com/videos/sample1.mp4" fileSize="12345678" type="video/mp4" medium="video" isDefault="true" expression="full" bitrate="1500" framerate="30" samplingrate="44.1" channels="2" duration="120" height="720" width="1280" lang="en">
                <media:title type="plain">Sample Video Title</media:title>
                <media:description type="html">This is a &lt;b&gt;sample video&lt;/b&gt; demonstrating media:content</media:description>
                <media:keywords>sample, video, example, media, rss</media:keywords>
                <media:thumbnail url="https://example.com/thumbnails/sample1.jpg" width="320" height="180" time="00:00:15.000"/>
                <media:category scheme="http://search.yahoo.com/mrss/category_schema">Entertainment</media:category>
                <media:hash algo="md5">dfdec888b7f38882e8a698d52eaebc04</media:hash>
                <media:credit role="producer" scheme="urn:ebu">Jane Smith</media:credit>
                <media:rating scheme="urn:simple">adult</media:rating>
                <media:copyright>© 2025 Example Media Inc.</media:copyright>
                <media:text type="transcript" lang="en" start="00:00:03" end="00:00:10">This is a sample transcript text</media:text>
                <media:restriction relationship="allow" type="country">us ca gb</media:restriction>
                <media:community>
                  <media:starRating average="4.5" count="2500" min="1" max="5" />
                  <media:statistics views="12345" favorites="413" />
                  <media:tags>featured, media, example</media:tags>
                </media:community>
                <media:comments>
                  <media:comment>Great video!</media:comment>
                  <media:comment>Very informative content</media:comment>
                </media:comments>
                <media:embed url="https://example.com/players/embed" width="640" height="360">
                  <media:param name="autoplay">true</media:param>
                  <media:param name="theme">dark</media:param>
                </media:embed>
                <media:responses>
                  <media:response>https://example.com/videos/response1</media:response>
                </media:responses>
                <media:backLinks>
                  <media:backLink>https://example.com/articles/related</media:backLink>
                </media:backLinks>
                <media:status state="active" />
                <media:price type="rent" price="2.99" currency="USD" />
                <media:license type="text/html" href="https://example.com/license">Standard License</media:license>
                <media:peerLink type="application/torrent" href="https://example.com/torrents/sample1.torrent" />
                <media:location>Sample Studio</media:location>
                <media:rights status="official" />
                <media:scenes>
                  <media:scene>
                    <sceneTitle>Introduction</sceneTitle>
                    <sceneDescription>Opening sequence</sceneDescription>
                    <sceneStartTime>00:00:00</sceneStartTime>
                    <sceneEndTime>00:00:30</sceneEndTime>
                  </media:scene>
                  <media:scene>
                    <sceneTitle>Main Content</sceneTitle>
                    <sceneStartTime>00:00:30</sceneStartTime>
                    <sceneEndTime>00:01:45</sceneEndTime>
                  </media:scene>
                </media:scenes>
              </media:content>
              <media:group>
                <media:title>Multi-Format Content Example</media:title>
                <media:description>This video is available in multiple formats and resolutions</media:description>
                <media:thumbnail url="https://example.com/thumbnails/group-main.jpg" width="640" height="360" />
                <media:thumbnail url="https://example.com/thumbnails/group-alt.jpg" width="1280" height="720" />
                <media:keywords>group, multiple, formats, resolutions</media:keywords>
                <media:category>Technology</media:category>
                <media:rating scheme="urn:mpaa">PG</media:rating>
                <media:copyright>© 2025 Example Media Inc.</media:copyright>
                <media:content url="https://example.com/videos/sample-hd.mp4" fileSize="45678912" type="video/mp4" medium="video" expression="full" bitrate="5000" framerate="60" duration="180" height="1080" width="1920" lang="en">
                  <media:title>HD Version (1080p)</media:title>
                </media:content>
                <media:content url="https://example.com/videos/sample-sd.mp4" fileSize="23456789" type="video/mp4" medium="video" expression="full" bitrate="2500" framerate="30" duration="180" height="720" width="1280" lang="en">
                  <media:title>SD Version (720p)</media:title>
                </media:content>
                <media:content url="https://example.com/videos/sample.webm" fileSize="19876543" type="video/webm" medium="video" expression="full" bitrate="2000" framerate="30" duration="180" height="720" width="1280" lang="en">
                  <media:title>WebM Version</media:title>
                </media:content>
                <media:content url="https://example.com/audio/sample.mp3" fileSize="3456789" type="audio/mpeg" medium="audio" expression="full" bitrate="320" samplingrate="44.1" channels="2" duration="180" lang="en">
                  <media:title>Audio Only Version</media:title>
                </media:content>
                <media:content url="https://example.com/captions/sample-en.srt" type="text/srt" medium="document" expression="sample" lang="en">
                  <media:title>English Subtitles</media:title>
                </media:content>
                <media:content url="https://example.com/captions/sample-es.srt" type="text/srt" medium="document" expression="sample" lang="es">
                  <media:title>Spanish Subtitles</media:title>
                </media:content>
              </media:group>
              <media:title type="text">Advanced Media Features Demo</media:title>
              <media:credit role="director" scheme="urn:ebu">Michael Chang</media:credit>
              <media:credit role="actor" scheme="urn:ebu">Sarah Johnson</media:credit>
              <media:credit role="actor" scheme="urn:ebu">Robert Williams</media:credit>
              <media:category scheme="http://dmoz.org">Arts/Movies/Titles/A/</media:category>
              <media:status state="active" reason="approved" />
              <media:thumbnail url="https://example.com/thumbnails/adv-1.jpg" time="00:00:05.000" />
              <media:thumbnail url="https://example.com/thumbnails/adv-2.jpg" time="00:01:15.000" />
              <media:thumbnail url="https://example.com/thumbnails/adv-3.jpg" time="00:02:30.000" />
              <media:price type="package" price="9.99" currency="USD" info="full access">Complete Package</media:price>
              <media:price type="subscription" price="4.99" currency="USD" info="monthly">Monthly Subscription</media:price>
              <media:restriction relationship="allow" type="country">us ca gb de fr</media:restriction>
              <media:restriction relationship="deny" type="sharing">true</media:restriction>
              <media:rating scheme="urn:mpaa">PG-13</media:rating>
              <media:rating scheme="urn:v-chip">TV-14</media:rating>
              <media:community>
                <media:starRating average="4.8" count="12563" min="1" max="5" />
                <media:statistics views="256789" favorites="3421" shares="1245" />
                <media:tags>cinematic, production, advanced, technical, demo</media:tags>
              </media:community>

              <!-- GeoRSS-Simple Namespace: Item/Feed Level Tags (while not typical, included are all values for testing) -->
              <georss:point>37.78 -122.42</georss:point>
              <georss:line>37.78 -122.42 37.42 -122.10 37.86 -122.27</georss:line>
              <georss:polygon>37.86 -122.47 37.86 -122.37 37.76 -122.37 37.76 -122.47 37.86 -122.47</georss:polygon>
              <georss:box>37.15 -122.85 38.15 -121.85</georss:box>
              <georss:featuretypetag>region</georss:featuretypetag>
              <georss:relationshiptag>contains</georss:relationshiptag>
              <georss:featurename>San Francisco Bay Area</georss:featurename>
              <georss:elev>360</georss:elev>
              <georss:floor>4</georss:floor>
              <georss:radius>50000</georss:radius>
            </item>
          </rdf:RDF>
        `),
        {
          items: [
            {
              content: "This is an example of content.",
              createdAt: new Date("2022-01-01T12:00:00.000Z"),
              enclosures: [],
              id: undefined,
              image: "https://example.com/thumbnails/adv-1.jpg",
              link: "http://example.org/item/1",
              title: "Example Item",
              updatedAt: undefined,
            },
          ],
          title: "Example Feed",
          url: "http://example.org",
        },
      );
    });
  });

  describe("json feed", () => {
    it("should resolve an json 1 feed", () => {
      assertEquals(
        resolve(`
          {
            "version": "https://jsonfeed.org/version/1.0",
            "title": "Example Feed",
            "home_page_url": "https://example.com",
            "feed_url": "https://example.com/feed.json",
            "items": [
              {
                "id": "https://example.com/item1",
                "title": "First Item",
                "url": "https://example.com/item1",
                "content_text": "This is the content of the first item.",
                "date_published": "2025-06-07T12:00:00Z",
                "date_modified": "2025-06-07T12:00:00Z"
              },
              {
                "id": "https://example.com/item2",
                "title": "Second Item",
                "url": "https://example.com/item2",
                "content_text": "This is the content of the second item.",
                "date_published": "2025-06-06T12:00:00Z",
                "date_modified": "2025-06-06T12:00:00Z"
              }
            ]
          }
        `),
        {
          items: [
            {
              content: "This is the content of the first item.",
              createdAt: new Date("2025-06-07T12:00:00.000Z"),
              enclosures: [],
              id: "https://example.com/item1",
              image: undefined,
              link: "https://example.com/item1",
              title: "First Item",
              updatedAt: new Date("2025-06-07T12:00:00.000Z"),
            },
            {
              content: "This is the content of the second item.",
              createdAt: new Date("2025-06-06T12:00:00.000Z"),
              enclosures: [],
              id: "https://example.com/item2",
              image: undefined,
              link: "https://example.com/item2",
              title: "Second Item",
              updatedAt: new Date("2025-06-06T12:00:00.000Z"),
            },
          ],
          title: "Example Feed",
          url: "https://example.com",
        },
      );
    });

    it("should resolve an json 1.1 feed", () => {
      assertEquals(
        resolve(`
          {
            "version": "https://jsonfeed.org/version/1.1",
            "title": "My Example Feed",
            "home_page_url": "https://example.org/",
            "feed_url": "https://example.org/feed.json",
            "description": "Optional to provide more detail beyond the title.",
            "user_comment": "Optional and should be ignored by feed readers.",
            "next_url": "https://example.org/pagination?feed=feed.json&p=17",
            "icon": "https://example.org/favicon-timeline-512x512.png",
            "favicon": "https://example.org/favicon-sourcelist-64x64.png",
            "authors": [
              {
                "name": "Optional Author",
                "url": "https://example.org/authors/optional-author",
                "avatar": "https://example.org/authors/optional-author/avatar-512x512.png"
              }
            ],
            "language": "en-US",
            "items": [
              {
                "id": "2",
                "content_text": "This is a second item.",
                "url": "https://example.org/second-item",
                "language": "es-mx",
                "attachments": [
                  {
                    "url": "https://example.org/second-item/audio.ogg",
                    "mime_type": "audio/ogg",
                    "title": "Optional Title",
                    "size_in_bytes": 31415927,
                    "duration_in_seconds": 1800
                  }
                ]
              },
              {
                "id": "required-unique-string-that-does-not-change: number, guid, url, etc.",
                "url": "https://example.org/initial-post",
                "external_url": "https://en.wikipedia.org/w/index.php?title=JSON_Feed",
                "title": "Optional Title",
                "content_html": "<p>Optional content for the feed reader. You may also use content_text or both at the same time.</p>",
                "content_text": "Optional text for simple feeds.",
                "summary": "Optional summary of the item.",
                "image": "https://example.org/initial-post/main-img.png",
                "banner_image": "https://example.org/initial-post/details-banner.png",
                "date_published": "2021-10-25T19:30:00-01:00",
                "date_modified": "2021-10-26T19:45:00-01:00",
                "authors": [
                  {
                    "name": "Optional Author",
                    "url": "https://example.org/authors/optional-author",
                    "avatar": "https://example.org/authors/optional-author/avatar-512x512.png"
                  }
                ],
                "tags": [
                  "Optional Tag",
                  "Example"
                ],
                "language": "en-US"
              }
            ]
          }
        `),
        {
          items: [
            {
              content: "This is a second item.",
              createdAt: undefined,
              enclosures: [
                {
                  type: "audio/ogg",
                  url: "https://example.org/second-item/audio.ogg",
                },
              ],
              id: "2",
              image: undefined,
              link: "https://example.org/second-item",
              title: undefined,
              updatedAt: undefined,
            },
            {
              content:
                "<p>Optional content for the feed reader. You may also use content_text or both at the same time.</p>",
              createdAt: new Date("2021-10-25T20:30:00.000Z"),
              enclosures: [],
              id:
                "required-unique-string-that-does-not-change: number, guid, url, etc.",
              image: "https://example.org/initial-post/main-img.png",
              link: "https://example.org/initial-post",
              title: "Optional Title",
              updatedAt: new Date("2021-10-26T20:45:00.000Z"),
            },
          ],
          title: "My Example Feed",
          url: "https://example.org/",
        },
      );
    });
  });
});
