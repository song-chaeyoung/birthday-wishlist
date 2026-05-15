"use client";

import { toast } from "sonner";
import { bankAccount } from "@/src/lib/profile";

function copyWithSelectionFallback(text: string): boolean {
  if (typeof document.execCommand !== "function") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.focus({ preventScroll: true });
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

async function copyAccountNumber(text: string): Promise<boolean> {
  if (copyWithSelectionFallback(text)) {
    return true;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function BankAccountPanel() {
  async function handleCopyAccount() {
    const copied = await copyAccountNumber(
      `${bankAccount.bankName} ${bankAccount.accountNumber}`,
    );

    if (copied) {
      toast.success("복사됐어요!");
      return;
    }

    toast.error("복사에 실패했어요.");
  }

  return (
    <section
      className="rounded border-4 border-[#381a55] bg-[#fffdf4] p-5 shadow-[6px_6px_0_#381a55] sm:p-6"
      aria-label="계좌 안내"
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-2">
          <p className="sticker-label w-fit">ACCOUNT</p>
          <h2 className="pixel-display text-2xl text-[#381a55]">
            계좌로 마음 보태기
          </h2>
          <p className="text-sm font-bold text-[#5a3a6f]">
            예금주 {bankAccount.accountHolder}
          </p>
        </div>

        <div className="grid gap-2">
          <button
            className="pixel-button w-full bg-[#72eadc] text-[#381a55] hover:bg-[#48ddcb] md:w-48"
            type="button"
            onClick={handleCopyAccount}
          >
            계좌번호 복사하기
          </button>
        </div>
      </div>
    </section>
  );
}
