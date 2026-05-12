import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Wish } from "@/src/lib/wishes";
import { WishCard } from "./wish-card";

const wish: Wish = {
  id: "designer-bag",
  name: "Designer Bag",
  description: "A cute birthday wish item.",
  price: 3200000,
  fundedAmount: 850000,
  image: "",
  productUrl: "https://example.com/designer-bag",
  priority: "top",
  status: "open",
};

describe("WishCard", () => {
  it("does not render a per-card message action or form", () => {
    render(<WishCard wish={wish} />);

    expect(screen.queryByLabelText("닉네임")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "마음만 보태기" }),
    ).not.toBeInTheDocument();
  });

  it("renders image fallback when the wish has no image", () => {
    render(<WishCard wish={wish} />);

    expect(screen.getByText("PIXEL WISH")).toBeInTheDocument();
  });

  it("links to the product page", () => {
    render(<WishCard wish={wish} />);

    const productLink = screen.getByRole("link", { name: "상품 보기" });

    expect(productLink).toHaveAttribute("href", wish.productUrl);
    expect(productLink).toHaveClass("inline-flex");
  });
});
