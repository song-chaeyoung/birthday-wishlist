# Birthday Wishlist Design

## Goal

Build a personal birthday wishlist site that shows expensive wish items in a cute Y2K pixel-kitsch style. Visitors can leave a private nickname and message for a specific wish item, but there is no payment flow, public guestbook, admin page, or author-facing message lookup.

## Current Project Context

The existing repository is a fresh Next.js app using the App Router. The installed stack is Next.js 16.2.6, React 19.2.4, TypeScript, ESLint, and Tailwind CSS 4. The current home page is still the create-next-app starter screen, so the first implementation should replace the root page with the actual wishlist experience.

Project instructions require reading relevant local Next.js documentation under `node_modules/next/dist/docs/` before writing Next-specific code because this Next.js version may differ from older conventions. The implementation should continue to use the existing Tailwind 4 setup instead of recreating the project.

## Scope

The first version includes:

- A root `/` page that immediately shows the wishlist instead of a marketing landing page.
- A top summary section with `Birthday Wishlist`, a short Korean intro, and overall `Wish funding progress`.
- A grid of wish cards with image or pixel fallback, name, description, price, funded amount, item progress, and a `마음만 보태기` button.
- A message form opened from each card with nickname and private message fields.
- A client-side success state after submission with pixel heart or coin-like visual feedback.
- A `POST /api/messages` route shape that validates requests and returns a clear unavailable-storage response until Supabase is connected.
- Static wishlist data managed in code through `src/data/wishes.json`.

The first version excludes:

- Real payment or checkout.
- Visitor-entered funding amounts.
- Updating `fundedAmount` from visitor actions.
- Public guestbook or public message display.
- Admin pages.
- Message lookup, edit links, or author-facing retrieval.
- Real Supabase insert until the dependency and environment variables are intentionally added.

## Content And Tone

The text style is Korean-first with selected English headings. Primary examples:

- `Birthday Wishlist`
- `Wish funding progress`
- `마음만 보태기`
- `마음이 보태졌어요`
- `아직 메시지 저장소가 연결되지 않았어요`

The visual direction is Y2K pixel kitsch with clean readable structure. The UI should use dot backgrounds, pixel-like borders, sticker labels, bright accent colors, and playful feedback effects while keeping the card grid easy to scan.

## Data Model

Wish items are stored in `src/data/wishes.json`.

Each item has this shape:

```json
{
  "id": "designer-bag",
  "name": "Designer Bag",
  "description": "A cute birthday wish item.",
  "price": 3200000,
  "fundedAmount": 850000,
  "image": "/wishes/designer-bag.jpg",
  "priority": "top",
  "status": "open"
}
```

Field rules:

- `id`: Stable string used by forms and API requests.
- `name`: Display name.
- `description`: Short card copy.
- `price`: Target price in KRW.
- `fundedAmount`: Current manually managed amount in KRW.
- `image`: Public URL under `/wishes/`; the UI must still render a fallback when the file is missing or the value is empty.
- `priority`: Display hint such as `top` or `normal`.
- `status`: `open` items are shown as active wishes; non-open items can be styled or filtered by utility functions.

## Architecture

Use the existing Next.js App Router project.

Planned file responsibilities:

- `src/data/wishes.json`: Source of truth for wishlist items and manually managed funding amounts.
- `src/lib/wishes.ts`: Wish type definitions, data loading, currency formatting, progress calculation, clamping, and status helpers.
- `src/components/wishlist/wishlist-page.tsx`: Main client-facing wishlist composition.
- `src/components/wishlist/wish-card.tsx`: Individual card UI and form toggle boundary.
- `src/components/wishlist/message-form.tsx`: Nickname/message form, validation state, submission state, and success/error display.
- `src/components/wishlist/progress-meter.tsx`: Reusable progress bar for total and item progress.
- `app/api/messages/route.ts`: Server route for validating message submissions and returning a clear storage-unavailable response in the first version.
- `app/page.tsx`: Root page that loads wish data and renders the wishlist page.
- `app/layout.tsx`: Metadata update from the starter values to birthday wishlist copy.
- `app/globals.css`: Global Tailwind 4-compatible styles for pixel/dot/background helpers where utility classes are not enough.

The root page can remain a Server Component. Interactive form behavior should live in smaller Client Components so the JavaScript bundle stays scoped to the interactive parts.

## Data Flow

1. `app/page.tsx` imports wish data through `src/lib/wishes.ts`.
2. `src/lib/wishes.ts` returns typed wish data and computes:
   - Item progress as `fundedAmount / price`, clamped from 0 to 100.
   - Overall progress from the sum of all funded amounts over the sum of all prices, clamped from 0 to 100.
   - KRW display strings.
3. `WishlistPage` receives wish data and overall summary.
4. `WishCard` renders each item and opens `MessageForm` on `마음만 보태기`.
5. `MessageForm` posts `{ wishId, nickname, message }` to `/api/messages`.
6. The API validates the body and, while storage is not connected, returns a deterministic `503` response.
7. The client shows a friendly unavailable-storage message for `503`. For successful responses in future Supabase integration, it shows the same local success effect.

Visitor submissions do not change `fundedAmount`. The success effect is only local feedback.

## API Behavior

`POST /api/messages` accepts JSON:

```json
{
  "wishId": "designer-bag",
  "nickname": "친구",
  "message": "생일 축하해!"
}
```

Validation rules:

- `wishId` is required and must match an existing wish id.
- `nickname` is required after trimming and should be short enough for a small form field.
- `message` is required after trimming and should stay within a private note length suitable for console review.
- Invalid JSON or invalid fields return `400`.
- Missing storage configuration returns `503` with a message that storage is not connected yet.

Future Supabase integration should use this table:

```sql
create table birthday_messages (
  id uuid primary key default gen_random_uuid(),
  wish_id text not null,
  nickname text not null,
  message text not null,
  created_at timestamptz not null default now()
);
```

Future environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` must only be read in the server route and must never be imported into Client Components.

## Error Handling

Client-side form errors:

- Empty nickname: ask the visitor to enter a nickname.
- Empty message: ask the visitor to enter a message.
- API `400`: show a concise correction message.
- API `503`: show `아직 메시지 저장소가 연결되지 않았어요`.
- Network or unknown failure: show a retry-oriented message without claiming the message was saved.

Server-side API errors:

- Malformed JSON returns `400`.
- Missing or invalid fields return `400`.
- Unknown `wishId` returns `400`.
- Storage not configured returns `503`.

No submitted message should be shown publicly on the page.

## Image Handling

Product images are expected under `public/wishes/`. The UI must not break when a file is missing. Each card should render a pixel-style fallback panel with playful text or icon-like decoration when the image fails to load or when the `image` value is empty.

This supports the workflow where the site can be built first and real product photos can be added later.

## Testing Strategy

Use focused tests for behavior that carries risk:

- `src/lib/wishes.ts`
  - Formats KRW amounts consistently.
  - Clamps item progress at 0 and 100.
  - Computes overall progress from summed amounts.
  - Handles zero or invalid prices defensively.
  - Filters or labels non-open statuses predictably.
- `app/api/messages/route.ts`
  - Returns `400` for invalid JSON or missing fields.
  - Returns `400` for unknown `wishId`.
  - Returns `503` when storage configuration is absent.
- `src/components/wishlist/message-form.tsx`
  - Opens form flow from a card-level trigger.
  - Blocks empty nickname/message before submit.
  - Shows the storage-unavailable message when the API returns `503`.

The first implementation should run lint and relevant tests before being considered complete.

## Acceptance Criteria

- Visiting `/` shows the wishlist, not the create-next-app starter page.
- The page has the agreed Y2K pixel-kitsch direction while remaining readable.
- Overall and per-item funding progress are derived from `src/data/wishes.json`.
- Product cards do not visually break when real images are not present.
- `마음만 보태기` opens a nickname/message form for the selected wish.
- Submitting invalid form data shows a local validation message.
- Submitting valid form data calls `/api/messages`.
- With Supabase not connected, the API returns a clear `503` response and the UI explains that storage is not connected yet.
- No message appears publicly after submission.
- No client code reads or exposes `SUPABASE_SERVICE_ROLE_KEY`.
- Lint and planned tests pass.
