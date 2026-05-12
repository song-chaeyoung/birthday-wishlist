import { metadata } from "./layout";
import { wishlistTitle } from "@/src/lib/profile";

describe("metadata", () => {
  it("uses the personalized wishlist title", () => {
    expect(metadata.title).toBe(wishlistTitle);
  });

  it("sets a base URL for social image metadata", () => {
    expect(metadata.metadataBase?.toString()).toBe("http://localhost:3000/");
  });
});
