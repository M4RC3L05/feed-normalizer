import {
  findImageInContent,
  findImageInEnclosures,
  isLinkPossiblyAImage,
  normalizeContentUrls,
  normalizeUrl,
  unscapeEntities,
  webImageFileExtensions,
} from "./utils.ts";
import { assertEquals, describe, it } from "../test_deps.ts";

describe("normalizeUrl()", () => {
  it("should not normalize if url is not valid", () => {
    assertEquals(normalizeUrl(), undefined);
    assertEquals(normalizeUrl(undefined, "foo"), undefined);
  });

  it("should normalize relative path", () => {
    assertEquals(
      normalizeUrl("foo/foo.png", "https://example.com/biz/buz"),
      "https://example.com/biz/foo/foo.png",
    );

    assertEquals(
      normalizeUrl("foo/foo.png", "https://example.com"),
      "https://example.com/foo/foo.png",
    );
  });

  it("should normalize relative `/` path", () => {
    assertEquals(
      normalizeUrl("/foo/foo.png", "https://example.com/biz/buz"),
      "https://example.com/foo/foo.png",
    );

    assertEquals(
      normalizeUrl("/foo/foo.png", "https://example.com"),
      "https://example.com/foo/foo.png",
    );
  });

  it("should normalize absolute paths", () => {
    assertEquals(
      normalizeUrl(
        "https://example.com/foo/foo.png",
        "https://example.com/biz/buz",
      ),
      "https://example.com/foo/foo.png",
    );

    assertEquals(
      normalizeUrl("https://example.com/foo/foo.png", "https://example.com"),
      "https://example.com/foo/foo.png",
    );
  });
});

describe("normalizeContentUrls()", () => {
  it("should not normalize if no media urls to normalize", () => {
    assertEquals(normalizeContentUrls(), undefined);
    assertEquals(normalizeContentUrls(""), "");
    assertEquals(normalizeContentUrls("foo"), "foo");
  });

  it("should normalize media urls", () => {
    assertEquals(
      normalizeContentUrls(
        `
        <img alt="foo" src="foo.png" />
        
        <audio src="/foo.mp3" controls/>
        <audio>
          <source src="/bar/foo.ogg" />
        </audio>

        <video src="https://example.com/media/foo.mkv" controls/>
        <video src="https://example.com/media/foo.mkv" poster="../../foo.png" controls/>
        <video>
          <source src="foo.webm" />
        </video>

        foo

        <iframe src="https://exmaple.com/iframe"></iframe>
        <iframe src="/iframe"></iframe>

        <a href="where/to">foo</a>
      `.trim(),
        "https://example.com/foo/bar/biz/buz",
      ),
      `
        <img alt="foo" src="https://example.com/foo/bar/biz/foo.png" />
        
        <audio src="https://example.com/foo.mp3" controls/>
        <audio>
          <source src="https://example.com/bar/foo.ogg" />
        </audio>

        <video src="https://example.com/media/foo.mkv" controls/>
        <video src="https://example.com/media/foo.mkv" poster="https://example.com/foo/foo.png" controls/>
        <video>
          <source src="https://example.com/foo/bar/biz/foo.webm" />
        </video>

        foo

        <iframe src="https://exmaple.com/iframe"></iframe>
        <iframe src="https://example.com/iframe"></iframe>

        <a href="https://example.com/foo/bar/biz/where/to">foo</a>
      `.trim(),
    );

    assertEquals(
      normalizeContentUrls(
        `
        <img alt="foo" src="foo.png" />

        <audio src="/foo.mp3" controls/>
        <audio>
          <source src="/bar/foo.ogg" />
        </audio>

        <video src="https://example.com/media/foo.mkv" controls/>
        <video src="https://example.com/media/foo.mkv" poster="../../foo.png" controls/>
        <video>
          <source src="foo.webm" />
        </video>

        foo

        <iframe src="https://exmaple.com/iframe"></iframe>
        <iframe src="/iframe"></iframe>

        <a href="where/to">foo</a>
      `.trim(),
        "https://example.com",
      ),
      `
        <img alt="foo" src="https://example.com/foo.png" />

        <audio src="https://example.com/foo.mp3" controls/>
        <audio>
          <source src="https://example.com/bar/foo.ogg" />
        </audio>

        <video src="https://example.com/media/foo.mkv" controls/>
        <video src="https://example.com/media/foo.mkv" poster="https://example.com/foo.png" controls/>
        <video>
          <source src="https://example.com/foo.webm" />
        </video>

        foo

        <iframe src="https://exmaple.com/iframe"></iframe>
        <iframe src="https://example.com/iframe"></iframe>

        <a href="https://example.com/where/to">foo</a>
      `.trim(),
    );
  });
});

describe("isLinkPossiblyAImage()", () => {
  it("should indicate if link is a image", () => {
    assertEquals(isLinkPossiblyAImage("foo"), false);

    for (const ext of webImageFileExtensions) {
      assertEquals(isLinkPossiblyAImage(`foo${ext}`), true);
    }

    assertEquals(isLinkPossiblyAImage("foo/bar/fOo.PNG"), true);
  });
});

describe("findImageInEnclosures()", () => {
  it("should find the first image in enclosures", () => {
    assertEquals(findImageInEnclosures([]), undefined);
    assertEquals(
      findImageInEnclosures([{ type: "foo", url: "bar" }]),
      undefined,
    );
    assertEquals(
      findImageInEnclosures([{ url: "foo.png" }, { url: "bar.mp3" }]),
      "foo.png",
    );
    assertEquals(
      findImageInEnclosures([{ type: "image/png", url: "bar" }]),
      "bar",
    );
    assertEquals(
      findImageInEnclosures([{ type: "foo", url: "bar.jpg" }]),
      "bar.jpg",
    );
  });
});

describe("findImageInContent()", () => {
  it("should get the first image from content", () => {
    assertEquals(findImageInContent(""), undefined);
    assertEquals(findImageInContent("foo"), undefined);
    assertEquals(findImageInContent('foo <img src="foo.png" />'), "foo.png");
    assertEquals(
      findImageInContent('foo <img alt="foo" src="foo.png" />'),
      "foo.png",
    );
  });
});

describe("unscapeEntities()", () => {
  it("should unscape html entities", () => {
    assertEquals(unscapeEntities(""), "");
    assertEquals(
      unscapeEntities("foo bar <p>oioio</p>"),
      "foo bar <p>oioio</p>",
    );
    assertEquals(unscapeEntities([]), []);
    assertEquals(unscapeEntities(undefined), undefined);
    assertEquals(
      unscapeEntities("&lt;&gt;&apos;&amp;&#65;foobar&#x41;"),
      "<>'&AfoobarA",
    );
  });
});
