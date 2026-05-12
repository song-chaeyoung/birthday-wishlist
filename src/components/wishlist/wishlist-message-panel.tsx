"use client";

import { useState } from "react";
import { MessageForm } from "./message-form";

export function WishlistMessagePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showEffect, setShowEffect] = useState(false);

  function handleSubmitted() {
    setShowEffect(true);
    window.setTimeout(() => setShowEffect(false), 1600);
  }

  return (
    <section
      className="relative overflow-visible"
      aria-label="비공개 메시지 남기기"
    >
      {showEffect ? (
        <div className="pixel-burst" aria-hidden="true">
          <span>♥</span>
          <span>●</span>
          <span>♥</span>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-3"></div>

        <button
          className="pixel-button w-full lg:w-48"
          type="button"
          aria-controls="wishlist-message-form"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          마음만 보내기
        </button>
      </div>

      {isOpen ? (
        <div id="wishlist-message-form" className="mt-5">
          <MessageForm onSubmitted={handleSubmitted} />
        </div>
      ) : null}
    </section>
  );
}
