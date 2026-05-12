# Birthday Wishlist

개인 생일 선물 위시리스트를 한 페이지에 보여주는 작은 Next.js 앱입니다.

다른 사람이 이 프로젝트를 클론해서 이름, 상품 목록, 상품 이미지만 바꾸면 자기 생일 위시리스트로 사용할 수 있도록 만들었습니다. 방문자는 결제 없이 위시 아이템을 둘러보고, 닉네임과 비공개 축하 메시지를 남길 수 있습니다.

## 빠르게 내 위시리스트로 바꾸기

1. `src/data/profile.json`에서 이름을 바꿉니다.
2. `src/data/wishes.json`에서 상품 목록을 바꿉니다.
3. 상품 이미지를 `public/wish/`에 넣고 `wishes.json`의 `image` 경로를 맞춥니다.
4. 개발 서버를 실행해서 화면을 확인합니다.

```bash
corepack pnpm dev
```

이름과 상품만 바꾸면 위시리스트 화면은 바로 개인화됩니다. 비공개 메시지를 실제로 저장하려면 Supabase 설정이 추가로 필요합니다.

## 이름 관리

사이트 주인 이름은 `src/data/profile.json`에서 관리합니다.

```json
{
  "ownerName": "이름"
}
```

이 값은 브라우저 제목과 메인 화면 제목에 함께 사용됩니다.

## 상품 관리

선물 목록은 `src/data/wishes.json`에서 관리합니다.

각 상품은 다음 필드를 사용합니다.

- `id`: 상품을 구분하는 고유 ID
- `name`: 화면에 보이는 상품 이름
- `description`: 상품 설명
- `price`: 상품 가격
- `fundedAmount`: 현재 보태진 금액
- `image`: `public` 기준 이미지 경로
- `productUrl`: 외부 상품 링크
- `priority`: `top` 또는 `normal`
- `status`: `open`, `fulfilled`, `paused`

이미지는 `public/wish/상품이미지명` 형태로 넣고, `image` 값에는 `/wish/상품이미지명`처럼 적습니다.

## 메시지 저장

메시지 폼과 API 검증은 포함되어 있습니다. 실제 저장은 Supabase 환경변수가 있을 때 동작합니다.

필요한 환경변수는 `.env.example`을 참고해서 `.env.local`에 설정합니다.

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

메시지는 `birthday_messages` 테이블에 저장됩니다. 저장소가 연결되지 않은 상태에서는 화면에 `아직 메시지 저장소가 연결되지 않았어요.` 메시지가 표시됩니다.

## 개발 명령어

```bash
corepack pnpm dev
corepack pnpm test
corepack pnpm lint
corepack pnpm build
```

## 기술 스택

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Vitest
