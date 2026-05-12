import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { bankAccount, wishlistTitle } from "@/src/lib/profile";
import type { Wish, WishlistSummary } from "@/src/lib/wishes";
import { WishlistPage } from "./wishlist-page";

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

const summary: WishlistSummary = {
  totalPrice: 3200000,
  totalFundedAmount: 850000,
  progressPercent: 27,
  formattedTotalPrice: "3,200,000원",
  formattedTotalFundedAmount: "850,000원",
};

describe("WishlistPage", () => {
  it("renders the personalized wishlist title", () => {
    render(<WishlistPage wishes={[wish]} summary={summary} />);

    const title = screen.getByRole("heading", { name: wishlistTitle });

    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("pixel-display");
  });

  it("does not clip the general message button shadow", () => {
    const { container } = render(<WishlistPage wishes={[wish]} summary={summary} />);

    const messageButton = container.querySelector<HTMLButtonElement>(
      '[aria-controls="wishlist-message-form"]',
    );
    const messagePanel = messageButton?.closest("section");

    expect(messageButton).toBeInTheDocument();
    expect(messagePanel).toHaveClass("overflow-visible");
    expect(messagePanel).not.toHaveClass("overflow-hidden");
  });

  it("toggles one general message form above the wish cards", () => {
    render(<WishlistPage wishes={[wish]} summary={summary} />);

    const toggleButton = screen.getByRole("button", { name: "마음만 보태기" });

    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("닉네임")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("비공개 메시지")).not.toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("닉네임")).toBeInTheDocument();
    expect(screen.getByLabelText("비공개 메시지")).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("닉네임")).not.toBeInTheDocument();
  });

  it("renders the bank account panel between the header and wish cards", () => {
    render(<WishlistPage wishes={[wish]} summary={summary} />);

    const header = screen.getByRole("banner");
    const accountPanel = screen.getByRole("region", { name: "계좌 안내" });
    const wishItems = screen.getByRole("region", {
      name: "Birthday wish items",
    });

    expect(
      header.compareDocumentPosition(accountPanel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      accountPanel.compareDocumentPosition(wishItems) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "계좌번호 복사하기" }),
    ).toBeInTheDocument();
  });

  it("copies the bank account number from the standalone account panel", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<WishlistPage wishes={[wish]} summary={summary} />);

    fireEvent.click(
      screen.getByRole("button", { name: "계좌번호 복사하기" }),
    );

    expect(writeText).toHaveBeenCalledWith(bankAccount.accountNumber);
    expect(await screen.findByText("복사됐어요!")).toBeInTheDocument();
  });

  it("falls back to a document copy command when clipboard access fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    render(<WishlistPage wishes={[wish]} summary={summary} />);

    fireEvent.click(
      screen.getByRole("button", { name: "계좌번호 복사하기" }),
    );

    expect(await screen.findByText("복사됐어요!")).toBeInTheDocument();
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("renders the total funding progress after the wish cards", () => {
    render(<WishlistPage wishes={[wish]} summary={summary} />);

    const wishItems = screen.getByRole("region", {
      name: "Birthday wish items",
    });
    const totalProgress = screen.getByRole("progressbar", {
      name: "Wish funding progress",
    });

    expect(
      wishItems.compareDocumentPosition(totalProgress) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
