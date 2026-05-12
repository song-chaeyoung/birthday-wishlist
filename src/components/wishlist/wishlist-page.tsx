import { wishlistTitle } from "@/src/lib/profile";
import type { Wish, WishlistSummary } from "@/src/lib/wishes";
import { BankAccountPanel } from "./bank-account-panel";
import { ProgressMeter } from "./progress-meter";
import { WishCard } from "./wish-card";
import { WishlistMessagePanel } from "./wishlist-message-panel";

type WishlistPageProps = {
  wishes: Wish[];
  summary: WishlistSummary;
};

export function WishlistPage({ wishes, summary }: WishlistPageProps) {
  return (
    <main className="dot-bg min-h-screen px-4 py-8 text-[#381a55] sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="pixel-card bg-[#fffdf4] p-6 sm:p-8">
          <div className="max-w-2xl space-y-4">
            <p className="sticker-label w-fit">Y2K BIRTHDAY BOARD</p>
            <h1 className="pixel-display text-4xl leading-tight sm:text-6xl">
              {wishlistTitle}
            </h1>
            <p className="text-base font-bold leading-7 text-[#5a3a6f] sm:text-lg">
              결제는 없고, 메시지는 저만 조용히 확인할게요.
            </p>
          </div>

          <WishlistMessagePanel />
        </header>

        <BankAccountPanel />

        <section
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          aria-label="Birthday wish items"
        >
          {wishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} />
          ))}
        </section>

        <section
          className="rounded border-4 border-[#381a55] bg-[#a8fff0] p-5 shadow-[6px_6px_0_#381a55] sm:p-6"
          aria-label="전체 펀딩 진행률"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-3">
              <p className="sticker-label w-fit">WISH SUMMARY</p>
              <ProgressMeter
                label="Wish funding progress"
                percent={summary.progressPercent}
                size="large"
              />
            </div>
            <p className="text-sm font-black lg:text-right">
              {summary.formattedTotalFundedAmount} /{" "}
              {summary.formattedTotalPrice}
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
