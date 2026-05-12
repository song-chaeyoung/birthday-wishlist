import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { toast } from "sonner";
import { bankAccount, wishlistTitle } from "@/src/lib/profile";
import type { Wish, WishlistSummary } from "@/src/lib/wishes";
import { WishlistPage } from "./wishlist-page";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

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

    const toggleButton = screen.getByRole("button", { name: "마음만 보내기" });

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

  it("copies the bank name with the account number from the standalone account panel", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const accountText = `${bankAccount.bankName} ${bankAccount.accountNumber}`;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<WishlistPage wishes={[wish]} summary={summary} />);

    fireEvent.click(
      screen.getByRole("button", { name: "계좌번호 복사하기" }),
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(accountText);
      expect(toast.success).toHaveBeenCalledWith("복사됐어요!");
    });
    expect(screen.queryByText("복사됐어요!")).not.toBeInTheDocument();
  });

  it("uses a document copy command when it is available", async () => {
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });

    render(<WishlistPage wishes={[wish]} summary={summary} />);

    fireEvent.click(
      screen.getByRole("button", { name: "계좌번호 복사하기" }),
    );

    await waitFor(() => {
      expect(execCommand).toHaveBeenCalledWith("copy");
      expect(toast.success).toHaveBeenCalledWith("복사됐어요!");
    });
    expect(screen.queryByText("복사됐어요!")).not.toBeInTheDocument();
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
