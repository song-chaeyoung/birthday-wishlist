import { describe, expect, it } from "vitest";
import { getSiteUrl } from "./site-url";

describe("getSiteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL when it is configured", () => {
    expect(
      getSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://wishlist.example.com",
      }).toString(),
    ).toBe("https://wishlist.example.com/");
  });

  it("uses the Vercel production URL with https when no explicit URL is set", () => {
    expect(
      getSiteUrl({
        VERCEL_PROJECT_PRODUCTION_URL: "birthday-wishlist.vercel.app",
      }).toString(),
    ).toBe("https://birthday-wishlist.vercel.app/");
  });

  it("uses the Vercel deployment URL with https as a fallback", () => {
    expect(
      getSiteUrl({
        VERCEL_URL: "birthday-wishlist-git-main.vercel.app",
      }).toString(),
    ).toBe("https://birthday-wishlist-git-main.vercel.app/");
  });

  it("falls back to localhost for local builds", () => {
    expect(getSiteUrl({}).toString()).toBe("http://localhost:3000/");
  });
});
