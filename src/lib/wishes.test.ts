import { describe, expect, it } from "vitest";
import {
  calculateWishProgress,
  formatKrw,
  getOpenWishes,
  getWishById,
  getWishlistSummary,
  type Wish,
} from "./wishes";

const sampleWishes: Wish[] = [
  {
    id: "open-a",
    name: "Open A",
    description: "First open wish.",
    price: 1000,
    fundedAmount: 250,
    image: "/wishes/open-a.jpg",
    priority: "top",
    status: "open",
  },
  {
    id: "open-b",
    name: "Open B",
    description: "Second open wish.",
    price: 3000,
    fundedAmount: 4500,
    image: "",
    priority: "normal",
    status: "open",
  },
  {
    id: "fulfilled-c",
    name: "Fulfilled C",
    description: "Already fulfilled.",
    price: 2000,
    fundedAmount: 2000,
    image: "/wishes/fulfilled-c.jpg",
    priority: "normal",
    status: "fulfilled",
  },
];

describe("wish utilities", () => {
  it("formats KRW amounts with comma separators", () => {
    expect(formatKrw(3200000)).toBe("3,200,000원");
  });

  it("calculates clamped item progress", () => {
    expect(calculateWishProgress({ fundedAmount: 250, price: 1000 })).toBe(25);
    expect(calculateWishProgress({ fundedAmount: 4500, price: 3000 })).toBe(
      100,
    );
    expect(calculateWishProgress({ fundedAmount: -20, price: 1000 })).toBe(0);
    expect(calculateWishProgress({ fundedAmount: 100, price: 0 })).toBe(0);
  });

  it("computes overall summary from summed open wishes", () => {
    const summary = getWishlistSummary(sampleWishes.slice(0, 2));

    expect(summary.totalPrice).toBe(4000);
    expect(summary.totalFundedAmount).toBe(4750);
    expect(summary.progressPercent).toBe(100);
    expect(summary.formattedTotalPrice).toBe("4,000원");
    expect(summary.formattedTotalFundedAmount).toBe("4,750원");
  });

  it("returns only open wishes", () => {
    expect(getOpenWishes(sampleWishes).map((wish) => wish.id)).toEqual([
      "open-a",
      "open-b",
    ]);
  });

  it("finds a wish by id from project data", () => {
    expect(getWishById("designer-bag")?.name).toBe("Designer Bag");
    expect(getWishById("missing")).toBeUndefined();
  });
});
