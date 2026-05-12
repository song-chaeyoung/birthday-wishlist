import { describe, expect, it } from "vitest";
import { wishlistTitle } from "@/src/lib/profile";
import {
  alt,
  contentType,
  moneygraphyPixelFontName,
  moneygraphyPixelFontPath,
  size,
} from "./opengraph-image";

describe("opengraph image metadata", () => {
  it("uses the configurable wishlist title for sharing cards", () => {
    expect(alt).toBe(wishlistTitle);
  });

  it("uses the standard Open Graph image size and PNG output", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
  });

  it("uses the Moneygraphy Pixel font for the sharing image", () => {
    expect(moneygraphyPixelFontName).toBe("Moneygraphy Pixel");
    expect(moneygraphyPixelFontPath).toMatch(
      /public[\\/]+fonts[\\/]+Moneygraphy-Pixel\.otf$/,
    );
  });
});
