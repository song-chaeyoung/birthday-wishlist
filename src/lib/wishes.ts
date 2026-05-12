import wishesData from "@/src/data/wishes.json";

export type WishPriority = "top" | "normal";
export type WishStatus = "open" | "fulfilled" | "paused";

export type Wish = {
  id: string;
  name: string;
  description: string;
  price: number;
  fundedAmount: number;
  image: string;
  priority: WishPriority;
  status: WishStatus;
};

export type WishlistSummary = {
  totalPrice: number;
  totalFundedAmount: number;
  progressPercent: number;
  formattedTotalPrice: string;
  formattedTotalFundedAmount: string;
};

export type ProgressInput = {
  fundedAmount: number;
  price: number;
};

const projectWishes = wishesData as Wish[];

export function formatKrw(amount: number): string {
  const roundedAmount = Math.max(0, Math.round(amount));

  return `${roundedAmount.toLocaleString("ko-KR")}원`;
}

export function calculateWishProgress({
  fundedAmount,
  price,
}: ProgressInput): number {
  if (!Number.isFinite(price) || price <= 0) {
    return 0;
  }

  const safeFundedAmount = Number.isFinite(fundedAmount)
    ? Math.max(0, fundedAmount)
    : 0;
  const rawPercent = Math.round((safeFundedAmount / price) * 100);

  return Math.min(100, Math.max(0, rawPercent));
}

export function getWishes(): Wish[] {
  return projectWishes;
}

export function getOpenWishes(wishes: Wish[] = getWishes()): Wish[] {
  return wishes.filter((wish) => wish.status === "open");
}

export function getWishById(wishId: string): Wish | undefined {
  return getWishes().find((wish) => wish.id === wishId);
}

export function getWishlistSummary(
  wishes: Wish[] = getOpenWishes(),
): WishlistSummary {
  const totals = wishes.reduce(
    (accumulator, wish) => {
      return {
        totalPrice: accumulator.totalPrice + Math.max(0, wish.price),
        totalFundedAmount:
          accumulator.totalFundedAmount + Math.max(0, wish.fundedAmount),
      };
    },
    {
      totalPrice: 0,
      totalFundedAmount: 0,
    },
  );

  return {
    ...totals,
    progressPercent: calculateWishProgress({
      fundedAmount: totals.totalFundedAmount,
      price: totals.totalPrice,
    }),
    formattedTotalPrice: formatKrw(totals.totalPrice),
    formattedTotalFundedAmount: formatKrw(totals.totalFundedAmount),
  };
}
