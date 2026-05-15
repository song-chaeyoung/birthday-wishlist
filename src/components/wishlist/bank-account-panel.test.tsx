import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { bankAccount } from "@/src/lib/profile";
import { BankAccountPanel } from "./bank-account-panel";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("BankAccountPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not expose bank account details on screen", () => {
    const { container } = render(<BankAccountPanel />);

    expect(container).not.toHaveTextContent(bankAccount.bankName);
    expect(container).not.toHaveTextContent(bankAccount.accountNumber);
  });

  it("copies the bank name with the account number", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const accountText = `${bankAccount.bankName} ${bankAccount.accountNumber}`;

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<BankAccountPanel />);

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(accountText);
      expect(toast.success).toHaveBeenCalledWith("복사됐어요!");
    });
    expect(screen.queryByText("복사됐어요!")).not.toBeInTheDocument();
  });
});
