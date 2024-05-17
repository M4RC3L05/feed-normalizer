import { assertEquals, fail } from "./test_deps.ts";
import { describe, it } from "./test_deps.ts";
import { resolve } from "./mod.ts";

describe("resolve()", () => {
  it("should throw and error if feed is not supported", () => {
    try {
      resolve("");
      fail("should throw");
    } catch (error) {
      assertEquals(
        error.message,
        "Could not find suitable feed resolve for given data",
      );
    }
  });
});
