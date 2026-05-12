# Birthday Wishlist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first version of the birthday wishlist site with static wish funding data, private-message form flow, and a storage-unavailable API route.

**Architecture:** Keep the existing Next.js App Router project. Store wish data in JSON, isolate funding calculations in `src/lib/wishes.ts`, render the root page from server data, and keep form/image interactivity in small Client Components. The message API validates input and returns a clear `503` response until Supabase storage is intentionally connected.

**Tech Stack:** Next.js 16.2.6, React 19.2.4, TypeScript, Tailwind CSS 4, Vitest, React Testing Library, jsdom.

---

## File Structure

- Create `vitest.config.ts`: Vitest config with React plugin, jsdom, and `@` alias.
- Create `test/setup.ts`: Jest-DOM matcher setup.
- Modify `package.json`: Add `test` and `test:watch` scripts; add Vitest and Testing Library dev dependencies through `corepack pnpm`.
- Create `src/data/wishes.json`: Static wishlist source data.
- Create `src/lib/wishes.ts`: Wish types, data access, KRW formatting, progress calculation, and lookup helpers.
- Create `src/lib/wishes.test.ts`: Unit tests for formatting, progress, summary, status filtering, and lookup.
- Create `app/api/messages/route.ts`: `POST` route with JSON parsing, field validation, wish lookup, and storage-unavailable response.
- Create `app/api/messages/route.test.ts`: Route tests for malformed JSON, missing fields, unknown wish id, and valid request with disconnected storage.
- Create `src/components/wishlist/progress-meter.tsx`: Accessible reusable progress meter.
- Create `src/components/wishlist/message-form.tsx`: Client form with local validation, submit state, success state, and API error display.
- Create `src/components/wishlist/wish-card.tsx`: Client card with image fallback, form toggle, and local success effect.
- Create `src/components/wishlist/wishlist-page.tsx`: Main page composition.
- Create `src/components/wishlist/message-form.test.tsx`: Form tests.
- Create `src/components/wishlist/wish-card.test.tsx`: Card toggle test.
- Modify `app/page.tsx`: Replace create-next-app starter with wishlist rendering.
- Modify `app/layout.tsx`: Update metadata and document language.
- Modify `app/globals.css`: Add Y2K pixel-kitsch visual base and helper classes.

## Project Guardrails

- Use `corepack pnpm` for package commands. In this environment, plain `pnpm` is not on PATH, while `corepack pnpm --version` returns `10.33.0`.
- Before Next-specific code changes, read local docs because `AGENTS.md` requires `node_modules/next/dist/docs/`.
- Use App Router route handlers in `app/api/messages/route.ts`; do not add Pages Router API routes.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in Client Components.
- Do not make visitor messages public.
- Do not update `fundedAmount` from visitor actions.

---

### Task 1: Add Test Tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`

- [ ] **Step 1: Read the relevant local Next.js docs**

Run:

```powershell
Get-Content -Raw node_modules\next\dist\docs\01-app\01-getting-started\15-route-handlers.md
Get-Content -Raw node_modules\next\dist\docs\01-app\03-api-reference\03-file-conventions\route.md
Get-Content -Raw node_modules\next\dist\docs\01-app\01-getting-started\05-server-and-client-components.md
Get-Content -Raw node_modules\next\dist\docs\01-app\01-getting-started\12-images.md
Get-Content -Raw node_modules\next\dist\docs\01-app\01-getting-started\14-metadata-and-og-images.md
```

Expected: The files explain that App Router route handlers live in `app/**/route.ts`, can use Web `Request` and `Response`, Client Components need `"use client"`, and metadata belongs in layout/page exports.

- [ ] **Step 2: Install test dependencies**

Run:

```powershell
corepack pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Expected: `package.json` and `pnpm-lock.yaml` are updated with the new dev dependencies.

- [ ] **Step 3: Add test scripts**

Edit the `scripts` block in `package.json` so it is exactly:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Expected: Existing scripts remain and `test`/`test:watch` are available.

- [ ] **Step 4: Create Vitest config**

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": dirname,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["app/**/*.test.ts", "src/**/*.test.{ts,tsx}"],
    setupFiles: ["./test/setup.ts"],
  },
});
```

- [ ] **Step 5: Create test setup**

Create `test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Verify the test runner starts**

Run:

```powershell
corepack pnpm test
```

Expected: The command exits successfully with a message equivalent to no test files found, or exits with Vitest's no-tests code before tests exist. After Task 2, this command must pass.

- [ ] **Step 7: Commit test tooling**

Run:

```powershell
git add package.json pnpm-lock.yaml vitest.config.ts test/setup.ts
git commit -m "test: add vitest setup"
```

Expected: A commit is created for the test tooling.

---

### Task 2: Add Wish Data And Funding Utilities

**Files:**
- Create: `src/data/wishes.json`
- Create: `src/lib/wishes.test.ts`
- Create: `src/lib/wishes.ts`

- [ ] **Step 1: Create failing wish utility tests**

Create `src/lib/wishes.test.ts`:

```ts
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
    expect(calculateWishProgress({ fundedAmount: 4500, price: 3000 })).toBe(100);
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
corepack pnpm test src/lib/wishes.test.ts
```

Expected: FAIL with an import error because `src/lib/wishes.ts` does not exist yet.

- [ ] **Step 3: Create static wish data**

Create `src/data/wishes.json`:

```json
[
  {
    "id": "designer-bag",
    "name": "Designer Bag",
    "description": "반짝이는 생일 외출에 들고 싶은 위시템이에요.",
    "price": 3200000,
    "fundedAmount": 850000,
    "image": "/wishes/designer-bag.jpg",
    "priority": "top",
    "status": "open"
  },
  {
    "id": "tablet-pro",
    "name": "Tablet Pro",
    "description": "공부도 낙서도 귀엽게 해낼 수 있는 큰 화면 선물.",
    "price": 1800000,
    "fundedAmount": 620000,
    "image": "",
    "priority": "top",
    "status": "open"
  },
  {
    "id": "weekend-hotel-stay",
    "name": "Weekend Hotel Stay",
    "description": "생일 주간에 푹 쉬고 싶은 하루짜리 도피처.",
    "price": 650000,
    "fundedAmount": 260000,
    "image": "/wishes/weekend-hotel-stay.jpg",
    "priority": "normal",
    "status": "open"
  },
  {
    "id": "noise-canceling-headphones",
    "name": "Noise-Canceling Headphones",
    "description": "출퇴근길을 조용하고 폭신하게 만들어 줄 아이템.",
    "price": 520000,
    "fundedAmount": 120000,
    "image": "/wishes/noise-canceling-headphones.jpg",
    "priority": "normal",
    "status": "open"
  }
]
```

- [ ] **Step 4: Create wish utility implementation**

Create `src/lib/wishes.ts`:

```ts
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
```

- [ ] **Step 5: Run utility tests to verify they pass**

Run:

```powershell
corepack pnpm test src/lib/wishes.test.ts
```

Expected: PASS for all tests in `src/lib/wishes.test.ts`.

- [ ] **Step 6: Commit wish data and utilities**

Run:

```powershell
git add src/data/wishes.json src/lib/wishes.ts src/lib/wishes.test.ts
git commit -m "feat: add wishlist data utilities"
```

Expected: A commit is created for wish data and utility behavior.

---

### Task 3: Add Message API Route

**Files:**
- Create: `app/api/messages/route.test.ts`
- Create: `app/api/messages/route.ts`

- [ ] **Step 1: Create failing route tests**

Create `app/api/messages/route.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { POST } from "./route";

function createJsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function createRawRequest(body: string): Request {
  return new Request("http://localhost/api/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
  });
}

describe("POST /api/messages", () => {
  it("returns 400 for malformed JSON", async () => {
    const response = await POST(createRawRequest("{"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("INVALID_JSON");
  });

  it("returns 400 for missing fields", async () => {
    const response = await POST(
      createJsonRequest({
        wishId: "designer-bag",
        nickname: "",
        message: "",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("INVALID_MESSAGE");
    expect(payload.message).toBe("닉네임과 메시지를 모두 입력해주세요.");
  });

  it("returns 400 for an unknown wish id", async () => {
    const response = await POST(
      createJsonRequest({
        wishId: "missing-wish",
        nickname: "친구",
        message: "생일 축하해!",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("UNKNOWN_WISH");
  });

  it("returns 503 for valid input while storage is disconnected", async () => {
    const response = await POST(
      createJsonRequest({
        wishId: "designer-bag",
        nickname: "친구",
        message: "생일 축하해!",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toBe("STORAGE_NOT_CONNECTED");
    expect(payload.message).toBe("아직 메시지 저장소가 연결되지 않았어요.");
  });
});
```

- [ ] **Step 2: Run route tests to verify they fail**

Run:

```powershell
corepack pnpm test app/api/messages/route.test.ts
```

Expected: FAIL with an import error because `app/api/messages/route.ts` does not exist yet.

- [ ] **Step 3: Create message route implementation**

Create `app/api/messages/route.ts`:

```ts
import { getWishById } from "@/src/lib/wishes";

type MessageRequestBody = {
  wishId?: unknown;
  nickname?: unknown;
  message?: unknown;
};

type ValidMessageRequest = {
  wishId: string;
  nickname: string;
  message: string;
};

const MAX_NICKNAME_LENGTH = 24;
const MAX_MESSAGE_LENGTH = 500;

function jsonResponse(
  body: {
    ok: boolean;
    error?: string;
    message: string;
  },
  status: number,
): Response {
  return Response.json(body, { status });
}

function readTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateMessageBody(
  body: MessageRequestBody,
):
  | { ok: true; data: ValidMessageRequest }
  | { ok: false; error: string; message: string } {
  const wishId = readTrimmedString(body.wishId);
  const nickname = readTrimmedString(body.nickname);
  const message = readTrimmedString(body.message);

  if (!wishId || !nickname || !message) {
    return {
      ok: false,
      error: "INVALID_MESSAGE",
      message: "닉네임과 메시지를 모두 입력해주세요.",
    };
  }

  if (nickname.length > MAX_NICKNAME_LENGTH) {
    return {
      ok: false,
      error: "INVALID_MESSAGE",
      message: `닉네임은 ${MAX_NICKNAME_LENGTH}자 이내로 입력해주세요.`,
    };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: "INVALID_MESSAGE",
      message: `메시지는 ${MAX_MESSAGE_LENGTH}자 이내로 입력해주세요.`,
    };
  }

  if (!getWishById(wishId)) {
    return {
      ok: false,
      error: "UNKNOWN_WISH",
      message: "알 수 없는 위시 아이템이에요.",
    };
  }

  return {
    ok: true,
    data: {
      wishId,
      nickname,
      message,
    },
  };
}

export async function POST(request: Request): Promise<Response> {
  let body: MessageRequestBody;

  try {
    body = (await request.json()) as MessageRequestBody;
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "INVALID_JSON",
        message: "요청 형식이 올바르지 않아요.",
      },
      400,
    );
  }

  const validation = validateMessageBody(body);

  if (!validation.ok) {
    return jsonResponse(
      {
        ok: false,
        error: validation.error,
        message: validation.message,
      },
      400,
    );
  }

  return jsonResponse(
    {
      ok: false,
      error: "STORAGE_NOT_CONNECTED",
      message: "아직 메시지 저장소가 연결되지 않았어요.",
    },
    503,
  );
}
```

- [ ] **Step 4: Run route tests to verify they pass**

Run:

```powershell
corepack pnpm test app/api/messages/route.test.ts
```

Expected: PASS for all route tests.

- [ ] **Step 5: Commit message route**

Run:

```powershell
git add app/api/messages/route.ts app/api/messages/route.test.ts
git commit -m "feat: add private message route shell"
```

Expected: A commit is created for the message API route.

---

### Task 4: Add Wishlist Components

**Files:**
- Create: `src/components/wishlist/progress-meter.tsx`
- Create: `src/components/wishlist/message-form.test.tsx`
- Create: `src/components/wishlist/message-form.tsx`
- Create: `src/components/wishlist/wish-card.test.tsx`
- Create: `src/components/wishlist/wish-card.tsx`
- Create: `src/components/wishlist/wishlist-page.tsx`

- [ ] **Step 1: Create failing message form tests**

Create `src/components/wishlist/message-form.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageForm } from "./message-form";

describe("MessageForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("blocks empty nickname and message before submit", () => {
    render(<MessageForm wishId="designer-bag" />);

    fireEvent.click(screen.getByRole("button", { name: "마음 보내기" }));

    expect(screen.getByText("닉네임을 입력해주세요.")).toBeInTheDocument();
  });

  it("shows storage unavailable message when API returns 503", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          ok: false,
          error: "STORAGE_NOT_CONNECTED",
          message: "아직 메시지 저장소가 연결되지 않았어요.",
        }),
      }),
    );

    render(<MessageForm wishId="designer-bag" />);

    fireEvent.change(screen.getByLabelText("닉네임"), {
      target: { value: "친구" },
    });
    fireEvent.change(screen.getByLabelText("비공개 메시지"), {
      target: { value: "생일 축하해!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "마음 보내기" }));

    await waitFor(() => {
      expect(
        screen.getByText("아직 메시지 저장소가 연결되지 않았어요."),
      ).toBeInTheDocument();
    });
  });

  it("shows success state when API returns ok", async () => {
    const onSubmitted = vi.fn();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          ok: true,
          message: "마음이 보태졌어요.",
        }),
      }),
    );

    render(<MessageForm wishId="designer-bag" onSubmitted={onSubmitted} />);

    fireEvent.change(screen.getByLabelText("닉네임"), {
      target: { value: "친구" },
    });
    fireEvent.change(screen.getByLabelText("비공개 메시지"), {
      target: { value: "생일 축하해!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "마음 보내기" }));

    await waitFor(() => {
      expect(screen.getByText("마음이 보태졌어요.")).toBeInTheDocument();
    });
    expect(onSubmitted).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Create failing wish card test**

Create `src/components/wishlist/wish-card.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
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
  priority: "top",
  status: "open",
};

describe("WishCard", () => {
  it("opens the message form from the card action", () => {
    render(<WishCard wish={wish} />);

    expect(screen.queryByLabelText("닉네임")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "마음만 보태기" }));

    expect(screen.getByLabelText("닉네임")).toBeInTheDocument();
    expect(screen.getByLabelText("비공개 메시지")).toBeInTheDocument();
  });

  it("renders image fallback when the wish has no image", () => {
    render(<WishCard wish={wish} />);

    expect(screen.getByText("PIXEL WISH")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run component tests to verify they fail**

Run:

```powershell
corepack pnpm test src/components/wishlist/message-form.test.tsx src/components/wishlist/wish-card.test.tsx
```

Expected: FAIL with import errors because component files do not exist yet.

- [ ] **Step 4: Create progress meter component**

Create `src/components/wishlist/progress-meter.tsx`:

```tsx
type ProgressMeterProps = {
  label: string;
  percent: number;
  size?: "normal" | "large";
};

export function ProgressMeter({
  label,
  percent,
  size = "normal",
}: ProgressMeterProps) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
  const heightClass = size === "large" ? "h-6" : "h-4";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm font-bold">
        <span>{label}</span>
        <span>{safePercent}%</span>
      </div>
      <div
        className={`pixel-progress ${heightClass}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercent}
      >
        <div
          className="pixel-progress-fill"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create message form component**

Create `src/components/wishlist/message-form.tsx`:

```tsx
"use client";

import { FormEvent, useState } from "react";

type MessageFormProps = {
  wishId: string;
  onSubmitted?: () => void;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const EMPTY_NICKNAME_MESSAGE = "닉네임을 입력해주세요.";
const EMPTY_MESSAGE_MESSAGE = "메시지를 입력해주세요.";
const UNKNOWN_ERROR_MESSAGE = "메시지를 보내지 못했어요. 잠시 후 다시 시도해주세요.";

async function readResponseMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: unknown };

    return typeof payload.message === "string"
      ? payload.message
      : UNKNOWN_ERROR_MESSAGE;
  } catch {
    return UNKNOWN_ERROR_MESSAGE;
  }
}

export function MessageForm({ wishId, onSubmitted }: MessageFormProps) {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNickname = nickname.trim();
    const trimmedMessage = message.trim();

    if (!trimmedNickname) {
      setSubmitState("error");
      setFeedback(EMPTY_NICKNAME_MESSAGE);
      return;
    }

    if (!trimmedMessage) {
      setSubmitState("error");
      setFeedback(EMPTY_MESSAGE_MESSAGE);
      return;
    }

    setSubmitState("submitting");
    setFeedback("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          wishId,
          nickname: trimmedNickname,
          message: trimmedMessage,
        }),
      });

      if (!response.ok) {
        setSubmitState("error");
        setFeedback(await readResponseMessage(response));
        return;
      }

      setSubmitState("success");
      setFeedback("마음이 보태졌어요.");
      setNickname("");
      setMessage("");
      onSubmitted?.();
    } catch {
      setSubmitState("error");
      setFeedback(UNKNOWN_ERROR_MESSAGE);
    }
  }

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold text-[#381a55]">
        닉네임
        <input
          className="pixel-input"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={24}
          disabled={submitState === "submitting"}
          autoComplete="nickname"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold text-[#381a55]">
        비공개 메시지
        <textarea
          className="pixel-input min-h-24 resize-y"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={500}
          disabled={submitState === "submitting"}
        />
      </label>

      <button className="pixel-button w-full" disabled={submitState === "submitting"}>
        {submitState === "submitting" ? "보내는 중..." : "마음 보내기"}
      </button>

      {feedback ? (
        <p
          className={
            submitState === "success"
              ? "rounded border-2 border-[#18a558] bg-[#d7ffd8] px-3 py-2 text-sm font-bold text-[#145c2d]"
              : "rounded border-2 border-[#ff6f91] bg-[#ffe3ec] px-3 py-2 text-sm font-bold text-[#8f1741]"
          }
          role={submitState === "error" ? "alert" : "status"}
        >
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 6: Create wish card component**

Create `src/components/wishlist/wish-card.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import {
  calculateWishProgress,
  formatKrw,
  type Wish,
} from "@/src/lib/wishes";
import { MessageForm } from "./message-form";
import { ProgressMeter } from "./progress-meter";

type WishCardProps = {
  wish: Wish;
};

function WishImageFallback() {
  return (
    <div className="grid aspect-[4/3] place-items-center border-b-4 border-[#381a55] bg-[#fff3a7] text-center">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff4fa3]">
          PIXEL WISH
        </p>
        <p className="text-4xl" aria-hidden="true">
          ♡
        </p>
        <p className="text-xs font-bold text-[#381a55]">사진 준비 중</p>
      </div>
    </div>
  );
}

export function WishCard({ wish }: WishCardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const progress = calculateWishProgress(wish);
  const shouldShowImage = Boolean(wish.image) && !imageFailed;

  function handleSubmitted() {
    setShowEffect(true);
    window.setTimeout(() => setShowEffect(false), 1600);
  }

  return (
    <article className="pixel-card relative overflow-hidden bg-white">
      {showEffect ? (
        <div className="pixel-burst" aria-hidden="true">
          <span>♥</span>
          <span>●</span>
          <span>♥</span>
        </div>
      ) : null}

      {shouldShowImage ? (
        <Image
          src={wish.image}
          alt={`${wish.name} product photo`}
          width={640}
          height={480}
          className="aspect-[4/3] w-full border-b-4 border-[#381a55] object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <WishImageFallback />
      )}

      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="sticker-label mb-3">
              {wish.priority === "top" ? "TOP WISH" : "CUTE PICK"}
            </p>
            <h2 className="text-2xl font-black text-[#381a55]">{wish.name}</h2>
          </div>
          <span className="rounded border-2 border-[#381a55] bg-[#a8fff0] px-2 py-1 text-xs font-black text-[#381a55] shadow-[3px_3px_0_#381a55]">
            OPEN
          </span>
        </div>

        <p className="text-sm leading-6 text-[#5a3a6f]">{wish.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded border-2 border-[#381a55] bg-[#fff9d8] p-3">
            <p className="font-bold text-[#7d5c92]">Price</p>
            <p className="text-lg font-black text-[#381a55]">
              {formatKrw(wish.price)}
            </p>
          </div>
          <div className="rounded border-2 border-[#381a55] bg-[#ffe3ec] p-3">
            <p className="font-bold text-[#7d5c92]">Funded</p>
            <p className="text-lg font-black text-[#381a55]">
              {formatKrw(wish.fundedAmount)}
            </p>
          </div>
        </div>

        <ProgressMeter label="Item progress" percent={progress} />

        <button
          className="pixel-button w-full"
          type="button"
          onClick={() => setIsFormOpen((current) => !current)}
        >
          마음만 보태기
        </button>

        {isFormOpen ? (
          <MessageForm wishId={wish.id} onSubmitted={handleSubmitted} />
        ) : null}
      </div>
    </article>
  );
}
```

- [ ] **Step 7: Create wishlist page component**

Create `src/components/wishlist/wishlist-page.tsx`:

```tsx
import type { Wish, WishlistSummary } from "@/src/lib/wishes";
import { ProgressMeter } from "./progress-meter";
import { WishCard } from "./wish-card";

type WishlistPageProps = {
  wishes: Wish[];
  summary: WishlistSummary;
};

export function WishlistPage({ wishes, summary }: WishlistPageProps) {
  return (
    <main className="dot-bg min-h-screen px-4 py-8 text-[#381a55] sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="pixel-card bg-[#fffdf4] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="sticker-label w-fit">Y2K BIRTHDAY BOARD</p>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">
                Birthday Wishlist
              </h1>
              <p className="text-base font-bold leading-7 text-[#5a3a6f] sm:text-lg">
                생일에 살짝 마음을 얹어주고 싶은 고가 위시템들을 모아뒀어요.
                결제는 없고, 메시지는 저만 조용히 확인할게요.
              </p>
            </div>

            <div className="w-full rounded border-4 border-[#381a55] bg-[#a8fff0] p-4 shadow-[6px_6px_0_#381a55] lg:max-w-sm">
              <ProgressMeter
                label="Wish funding progress"
                percent={summary.progressPercent}
                size="large"
              />
              <p className="mt-3 text-sm font-black">
                {summary.formattedTotalFundedAmount} /{" "}
                {summary.formattedTotalPrice}
              </p>
            </div>
          </div>
        </header>

        <section
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          aria-label="Birthday wish items"
        >
          {wishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} />
          ))}
        </section>
      </section>
    </main>
  );
}
```

- [ ] **Step 8: Run component tests to verify they pass**

Run:

```powershell
corepack pnpm test src/components/wishlist/message-form.test.tsx src/components/wishlist/wish-card.test.tsx
```

Expected: PASS for all component tests.

- [ ] **Step 9: Commit wishlist components**

Run:

```powershell
git add src/components/wishlist/progress-meter.tsx src/components/wishlist/message-form.tsx src/components/wishlist/message-form.test.tsx src/components/wishlist/wish-card.tsx src/components/wishlist/wish-card.test.tsx src/components/wishlist/wishlist-page.tsx
git commit -m "feat: add wishlist components"
```

Expected: A commit is created for the wishlist UI components.

---

### Task 5: Wire The Root Page And Global Styling

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace the root page**

Replace `app/page.tsx` with:

```tsx
import { WishlistPage } from "@/src/components/wishlist/wishlist-page";
import { getOpenWishes, getWishlistSummary } from "@/src/lib/wishes";

export default function Home() {
  const wishes = getOpenWishes();
  const summary = getWishlistSummary(wishes);

  return <WishlistPage wishes={wishes} summary={summary} />;
}
```

- [ ] **Step 2: Update root metadata and language**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Birthday Wishlist",
  description: "A private birthday wishlist with cute wish funding progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Replace global styles**

Replace `app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --background: #fff7fc;
  --foreground: #381a55;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
}

body {
  min-height: 100%;
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

button,
input,
textarea {
  font: inherit;
}

.dot-bg {
  background-color: #fff7fc;
  background-image:
    radial-gradient(#ff8cc6 1px, transparent 1px),
    radial-gradient(#72eadc 1px, transparent 1px);
  background-position:
    0 0,
    12px 12px;
  background-size: 24px 24px;
}

.pixel-card {
  border: 4px solid #381a55;
  border-radius: 8px;
  box-shadow: 8px 8px 0 #381a55;
}

.sticker-label {
  display: inline-flex;
  border: 2px solid #381a55;
  border-radius: 999px;
  background: #ffef62;
  padding: 0.35rem 0.65rem;
  color: #381a55;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0;
  box-shadow: 3px 3px 0 #381a55;
}

.pixel-progress {
  overflow: hidden;
  border: 3px solid #381a55;
  border-radius: 6px;
  background:
    linear-gradient(90deg, rgba(56, 26, 85, 0.12) 50%, transparent 50%) 0 0 /
      12px 100%,
    #ffffff;
}

.pixel-progress-fill {
  height: 100%;
  border-right: 3px solid #381a55;
  background: linear-gradient(90deg, #ff4fa3, #ffef62, #72eadc);
  transition: width 240ms ease;
}

.pixel-button {
  min-height: 3rem;
  border: 3px solid #381a55;
  border-radius: 8px;
  background: #ff4fa3;
  padding: 0.75rem 1rem;
  color: #ffffff;
  font-weight: 900;
  box-shadow: 4px 4px 0 #381a55;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.pixel-button:hover:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #381a55;
  background: #ff2f91;
}

.pixel-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.pixel-input {
  width: 100%;
  border: 3px solid #381a55;
  border-radius: 8px;
  background: #fffdf4;
  padding: 0.75rem;
  color: #381a55;
  outline: none;
  box-shadow: 3px 3px 0 #381a55;
}

.pixel-input:focus {
  background: #ffffff;
  box-shadow:
    3px 3px 0 #381a55,
    0 0 0 4px #72eadc;
}

.message-form {
  display: grid;
  gap: 1rem;
  border-top: 3px dashed #381a55;
  padding-top: 1rem;
}

.pixel-burst {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.55);
  color: #ff4fa3;
  font-size: 2rem;
  font-weight: 900;
  animation: burst-fade 1.6s ease forwards;
}

.pixel-burst span {
  margin: 0 0.35rem;
  text-shadow: 3px 3px 0 #381a55;
}

@keyframes burst-fade {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }

  20% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}
```

- [ ] **Step 4: Run all tests**

Run:

```powershell
corepack pnpm test
```

Expected: PASS for wish utility, route, and component tests.

- [ ] **Step 5: Run lint**

Run:

```powershell
corepack pnpm lint
```

Expected: PASS with no ESLint errors.

- [ ] **Step 6: Commit page and styling**

Run:

```powershell
git add app/page.tsx app/layout.tsx app/globals.css
git commit -m "feat: wire birthday wishlist page"
```

Expected: A commit is created for the root page and global styles.

---

### Task 6: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Run the complete test suite**

Run:

```powershell
corepack pnpm test
```

Expected: PASS for every test file.

- [ ] **Step 2: Run lint**

Run:

```powershell
corepack pnpm lint
```

Expected: PASS with no ESLint errors.

- [ ] **Step 3: Run production build**

Run:

```powershell
corepack pnpm build
```

Expected: PASS and a production build is generated in `.next`.

- [ ] **Step 4: Inspect changed files**

Run:

```powershell
git status --short
git diff --stat
```

Expected: The working tree shows only intended uncommitted files, or is clean if every task commit has been made.

- [ ] **Step 5: Verify no service role key is exposed to client code**

Run:

```powershell
rg -n "SUPABASE_SERVICE_ROLE_KEY|process\.env" app src
```

Expected: Either no matches, or only server-side matches inside `app/api/messages/route.ts` after Supabase storage is added in a separate change. For this first version, no client component should contain `process.env` or `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] **Step 6: Stop on unexpected dirty state**

If Step 4 shows uncommitted files, inspect each path before continuing:

```powershell
git status --short
git diff -- app src package.json pnpm-lock.yaml vitest.config.ts test/setup.ts
```

Expected: No uncommitted changes remain after the task commits. If this command shows any changes, do not stage them automatically; inspect the diff and make a deliberate follow-up task.

## Self-Review Notes

- Spec coverage: Tasks cover static wish data, root wishlist page, overall and item progress, image fallback, private message form, API validation, storage-unavailable behavior, metadata, styling, and tests.
- Scope check: Supabase insert, admin pages, public guestbook, payment, visitor-entered amounts, and message lookup remain outside this first implementation.
- Type consistency: `Wish`, `WishlistSummary`, `calculateWishProgress`, `formatKrw`, `getOpenWishes`, and `getWishById` names are used consistently across tests, API route, page, and components.
