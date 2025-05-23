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
});
