# OpenSeed React + TypeScript 프론트엔드 전체 구현 PLAN

> 기준 문서: `08_통합_프로젝트_기획서_수정본.md`, `09_통합_기능_명세서_수정본.md`, `design-system.md`, `prototype/`
>
> 범위: 실제 서비스 가능한 MVP 프론트엔드 전체. 모든 백엔드 endpoint 호출, DTO, 인증·권한 응답 처리, 캐시 갱신, 오류 처리를 실제 연동 형태로 구현한다. 현재는 MSW가 동일한 HTTP 계약과 도메인 규칙으로 응답하며, 백엔드 준비 후 Mock worker를 끄고 API base URL만 변경해 연결한다.

## 1. 목표와 완료 기준

HTML/CSS/JavaScript 프로토타입을 유지보수 가능한 React + TypeScript 애플리케이션으로 전환한다. Guest, 이메일 미인증 User, 인증 User, Idea Author, 인증 Company의 모든 MVP 흐름을 완성한다. 각 기능은 실제 HTTP API를 호출하는 application layer를 사용하고, 개발·테스트 환경에서는 MSW가 백엔드 역할을 대신한다.

이 문서에서 “Mock 구현”은 정적 화면이나 하드코딩을 뜻하지 않는다. 실제 MVP와 동일하게 폼 검증, API 요청, 서버 상태 변경, 권한 검사 결과, 원장·버전·타임라인 갱신, 오류·동시성 응답을 거쳐야 한다. 차이는 응답 주체가 실제 서버가 아니라 브라우저 안의 MSW라는 점뿐이다.

완료 조건은 다음과 같다.

- 기능 명세의 Must 항목이 화면, API 상태, 테스트와 연결된다.
- 320px 모바일부터 데스크톱까지 핵심 기능을 사용할 수 있다.
- loading, empty, error, success, forbidden, disabled 상태가 모두 존재한다.
- 공개 범위와 역할별 UI가 정확하고, 서버의 401/403/404/409/422를 처리한다.
- 핵심 7개 E2E 시나리오와 접근성·성능 게이트를 통과한다.
- Seed Unit 화면마다 비금전성 안내를 노출한다.
- `VITE_API_MODE=mock`과 `VITE_API_MODE=real`에서 page/feature 코드가 완전히 동일하다.
- 기능 명세 113개 요구사항 각각에 구현 파일, API operation, 테스트, 완료 상태가 기록된다.

## 2. 범위

### 2.1 MVP 포함

- 이메일 회원가입·로그인·로그아웃·이메일 인증, 프로필 수정, 기업 이메일 인증
- 메인 랭킹, 급상승, 최신순, 제목·키워드 검색, 기여자 Top 5
- AI 후보 5개 생성, 후보 편집, 기획서·대표 이미지 생성, 공개 범위·검증 질문, 미리보기·게시
- 공개 범위 4종, 아이디어 상세, 좋아요, 조회, 버전, 기여·성장 타임라인
- 구조화 피드백 작성·수정·삭제, 게시자 채택·답글, 채택 기반 버전 업데이트
- 포인트 지갑·원장·회수 가능 잔액, Seed Unit 구매·보유·회수
- 기업 관심, 상세 열람 요청·승인/거절, 비동기 1:1 메시지·읽지 않음
- 신고, 사용자 차단·해제, 마이페이지 전체

### 2.2 명시적 제외

관리자 UI, 소셜 로그인/SSO, 현금 결제·정산, 사용자 간 Unit 거래, 실시간 채팅·푸시, 의미 기반 검색, 복합 필터, 광고, 다중 AI 이미지, 포인트 만료는 구현하지 않는다.

## 3. 기술 기준

| 영역 | 선택 | 원칙 |
|---|---|---|
| 런타임 | React 19 + TypeScript strict | `any` 금지, 도메인 union 적극 사용 |
| 빌드 | Vite | 환경 변수는 `VITE_` schema로 시작 시 검증 |
| 라우팅 | React Router | URL이 탭·검색·정렬·페이지 상태의 기준 |
| 서버 상태 | TanStack Query | 서버 데이터는 전역 store에 복제하지 않음 |
| 폼 | React Hook Form + Zod | 입력·API 경계 schema 공유 |
| 클라이언트 상태 | Zustand(최소) | toast, modal 등 UI 상태만 저장 |
| 스타일 | CSS Modules + CSS variables | 프로토타입 토큰을 변수로 이전 |
| API | OpenAPI 생성 타입 + 얇은 fetch client | 임의 DTO 수기 중복 금지 |
| 테스트 | Vitest, RTL, MSW, Playwright, axe | 사용자 행동과 권한 경계를 우선 검증 |

`design-system.md`의 Ink, Signal Blue, Trust Green, Seed Orange, Alert Red, Canvas, Line을 semantic token으로 변환한다. 색상만으로 상승·하락·오류를 표현하지 않는다.

## 4. 애플리케이션 구조

```text
src/
  app/             # router, providers, error boundary, app shell
  pages/           # route 단위 조합만 담당
  features/        # auth, idea-create, feedback, seed-unit, company, safety...
  entities/        # user, idea, wallet, message의 표시 모델/공용 UI
  shared/
    api/           # client, generated types, errors, query keys
    ui/            # Button, Dialog, Tabs, Tooltip, FormField, Skeleton...
    lib/           # date, money, permissions, analytics
    styles/        # tokens, reset, global responsive rules
  mocks/           # MSW handlers, role/visibility fixtures
  test/            # render helpers, fake clock, accessibility helpers
```

의존 방향은 `app/pages → features → entities → shared`로 고정한다. 페이지는 비즈니스 요청을 직접 만들지 않고 feature hook을 조합한다.

### 4.1 상태 원칙

- URL: `q`, `sort`, cursor/page, 상세 tab, 메시지 thread.
- Query: 사용자, 목록, 상세, 지갑, 보유 Lot, 메시지 등 서버 원본.
- Form: 작성 중 입력과 검증. 등록 wizard는 sessionStorage에 버전이 있는 임시 초안을 저장한다.
- UI store: toast와 전역 dialog만. 인증 원본은 `/me` query가 담당한다.
- 서버가 반환한 가격·포인트·손익을 신뢰하고 프론트 계산은 예상 표시 용도로만 사용한다.

### 4.2 공통 Query key

```text
['me']
['ideas', { q, sort, cursor }]
['idea', ideaId]
['idea', ideaId, 'feedback', filters]
['idea', ideaId, 'timeline']
['wallet'], ['wallet', 'ledger', cursor]
['holdings'], ['messages', 'threads'], ['messages', threadId]
```

Mutation 성공 시 영향받는 최소 key만 무효화한다. 좋아요는 낙관적 갱신하되 구매·회수·채택·권한 결정은 서버 응답 후 확정한다.

### 4.3 Mock-first 데이터 전략

백엔드 준비 여부와 관계없이 모든 화면과 사용자 흐름을 먼저 완성한다. 초기 개발에서는 MSW가 실제 API 역할을 하며, 기획 문서에 값이 부족한 경우 현실적인 Mock 데이터로 보완한다.

- `src/mocks/fixtures/`에 사용자, 아이디어, 피드백, 지갑, Seed Unit, 기업, 메시지 fixture를 도메인별로 둔다.
- `src/mocks/handlers/`는 실제 예정 API의 URL, method, request/response 형태를 그대로 모방한다.
- 목록 개수, 날짜, 가격, 포인트, 랭킹 수치는 기능 정책의 경계값을 위반하지 않는 범위에서 작성한다.
- 정상 데이터뿐 아니라 빈 목록, 긴 텍스트, 이미지 없음, 권한 없음, 한도 도달, 잠금 전후, AI 처리 중·실패 데이터를 함께 만든다.
- Mock 데이터는 컴포넌트 안에 직접 작성하지 않고 handler/fixture를 통해서만 공급한다.
- `VITE_API_MODE=mock | real` 환경 변수로 데이터 공급자를 전환하며, 페이지와 feature 코드는 모드에 따라 분기하지 않는다.
- Mock 단계에서도 TanStack Query와 공통 API client를 사용하여 실제 연동 시 UI 코드를 다시 작성하지 않는다.
- 브라우저에서 수행한 mutation은 MSW의 in-memory store에 반영해 등록·수정·삭제·구매·회수 흐름을 연속으로 검증할 수 있게 한다. 새로고침 시 초기 fixture로 재설정되어도 된다.

Mock에 임시로 정한 값은 `MOCK_ASSUMPTION` 주석과 별도 목록으로 남긴다. 백엔드 계약이 확정되면 해당 목록을 검토하고 실제 enum, 필드, 제한값으로 교체한다.

### 4.4 실제 MVP용 계층 구조

현재의 단일 `App.tsx`, 단일 `types.ts`, 단일 Mock handler 구조는 폐기한다. 다음 책임 경계를 적용한다.

```text
src/
  app/
    router/                 # route 정의, lazy loading, route error UI
    providers/              # QueryClient, Auth bootstrap, Toast, MSW bootstrap
    layouts/                # PublicLayout, AppLayout, AuthLayout
  pages/                    # feature를 조합하는 route entry, 직접 fetch 금지
  features/
    auth/                   # signup, login, verify-email, company verification
    idea-create/            # AI wizard, draft, preview, publish
    idea-edit/              # contribution 기반 새 version 발행
    feedback/               # CRUD, accept, evidence, revisions
    reaction/               # like, view event
    seed-unit/              # quote, purchase, recovery, pending payout
    company/                # interest, access request, decision
    messaging/              # thread, message, read state
    safety/                 # report, block, hidden content
    profile/                # profile edit와 verification status
  entities/
    user/ idea/ feedback/ wallet/ holding/ company/ message/
    # entity DTO mapper, query keys, read model UI
  shared/
    api/
      client.ts             # base URL, credentials, JSON, timeout, AbortSignal
      errors.ts             # ApiError와 error-code → UX message
      generated/            # OpenAPI 도입 후 생성 타입 위치
    auth/permissions.ts     # capability 표시 mapper, 보안 판정 자체는 서버 응답
    config/env.ts           # mock/real, base URL schema
    ui/ styles/ lib/
  mocks/
    db/                     # 정규화된 mutable Mock DB와 reset/seed
    fixtures/               # 역할·공개 범위·경계값 scenario
    handlers/               # 도메인별 실제 REST endpoint
    services/               # 서버가 담당할 계산·권한·트랜잭션의 Mock 구현
  test/
    render.tsx fixtures.ts clock.ts
```

의존 규칙은 다음과 같다.

1. `shared`는 어떤 상위 layer도 import하지 않는다.
2. `entities`는 `shared`만 import한다.
3. `features`는 `entities`, `shared`만 import한다. feature 간 직접 import는 금지하고 page에서 조합한다.
4. `pages`는 화면 조합과 route parameter 해석만 담당한다.
5. MSW handler와 React feature는 타입 계약을 공유하지만 서로 직접 import하지 않는다.
6. 컴포넌트는 `fetch`를 직접 호출하지 않고 feature의 query/mutation hook만 사용한다.

### 4.5 API 연동 구조

모든 endpoint는 실제 연동 전제의 네 부분으로 구현한다.

```text
Zod request/response schema
        ↓
domain API 함수 (HTTP method/path/credentials)
        ↓
TanStack Query hook (key/cache/invalidation/optimistic rule)
        ↓
화면 component (loading/empty/error/success/disabled)
```

예를 들어 Seed Unit 구매는 다음 파일 단위로 구성한다.

```text
features/seed-unit/api/purchaseSeedUnit.ts
features/seed-unit/model/purchase.schema.ts
features/seed-unit/model/usePurchaseSeedUnit.ts
features/seed-unit/ui/PurchaseSeedUnitDialog.tsx
mocks/handlers/seed-unit.handlers.ts
mocks/services/seed-unit.service.ts
features/seed-unit/__tests__/purchase.integration.test.tsx
```

`mock`과 `real` 모드에서 달라지는 것은 네트워크 interception 여부뿐이다. 별도의 `mockApi()` 또는 화면 조건 분기를 만들지 않는다.

### 4.6 Mock 백엔드가 구현할 서버 규칙

MSW는 fixture 반환기에 머물지 않고 MVP 백엔드의 행동을 재현한다.

- 인증 세션, 이메일 인증 token, Company 권한과 무료 이메일 domain 거절.
- 공개 범위 4종의 응답 필드 제거와 `capabilities`, `contentAccess` 계산.
- 피드백 revision, soft delete, 채택 답글, Contribution, 보상 원장, timeline의 원자적 변경.
- Point 일일 획득·지갑 2,000P·구매 한도·회수 500P·pending balance 규칙.
- Lot별 24시간 잠금, quote 만료/가격 변경, 회수 시 가격 확정.
- 랭킹 점수, snapshot, 일일 가격 ±10%와 1~100P 제한을 순수 함수로 구현.
- 기업 관심, 상세 열람 요청 상태 전이, 승인 전 상세 필드 차단.
- thread 참여자 권한, 메시지 읽음, 차단 사용자의 메시지/피드백 숨김.
- 모든 mutation의 401/403/404/409/422 및 idempotency 동작.

이 규칙은 나중에 제거할 임시 UI 로직이 아니라 프론트엔드 contract test의 기준 oracle로 남긴다.

### 4.7 현재 코드 구조 전환 순서

1. `App.tsx`에서 router/layout/page를 분리하되 UI 동작을 먼저 보존한다.
2. `types.ts`를 entity별 DTO와 schema로 분리한다.
3. `api.ts`를 공통 client와 domain API 함수로 교체한다.
4. `mocks/data.ts`를 정규화 Mock DB로, `handlers.ts`를 도메인 handler로 분리한다.
5. 전역 `styles.css`는 token/reset/layout만 남기고 feature/component CSS Module로 이동한다.
6. 기존 부분 구현은 명세 수용 기준을 만족할 때만 유지하고, 하드코딩된 텍스트/권한/숫자는 fixture 또는 API 응답으로 이전한다.

## 5. 라우트와 접근 제어

| Route | 화면 | 접근 |
|---|---|---|
| `/` | 메인·랭킹 | 전체 |
| `/login`, `/signup`, `/verify-email` | 인증 | Guest 중심 |
| `/company/verify` | 기업 인증 | 로그인 User |
| `/ideas/new` | AI 아이디어 등록 wizard | 인증 User |
| `/ideas/:ideaId` | 상세 | 공개 범위에 따름 |
| `/ideas/:ideaId/edit` | 채택 기반 업데이트 | Author |
| `/mypage/:section?` | 프로필·지갑·보유·피드백·기여·기업 | 인증 User |
| `/messages/:threadId?` | 문의 스레드 | 참여자 |

`RequireAuth`, `RequireVerifiedEmail`, `RequireCompany`, `RequireAuthor`는 UX 가드다. 보안 판단은 API 응답을 최종 기준으로 하며 403은 전용 안내, 비공개 대상 404는 존재 여부를 노출하지 않는 화면으로 처리한다.

## 6. 공통 UI와 디자인 시스템

1. 토큰: color, typography, spacing, radius, shadow, z-index, breakpoint.
2. primitive: Button, IconButton, Link, Input, Textarea, Select, Checkbox, RadioCard, Badge, MetricChip.
3. overlay: Tooltip, Popover, Dialog, ConfirmDialog, Toast. focus trap·Escape·focus 복귀 필수.
4. data display: RankingRow, IdeaCard, FeedbackCard, Timeline, EmptyState, Skeleton, Pagination/CursorTrigger.
5. layout: AppShell, TopNavigation, PageHeader, ResponsiveTabs, TwoColumnLayout.
6. 도메인: MaturityBadge, VisibilityBadge/Selector, SeedWallet, NonFinancialNotice, CompanySignalCard.

프로토타입 CSS와 스크린샷을 시각 기준으로 사용하되 inline style과 HTML 문자열 렌더링은 이전하지 않는다. 텍스트는 plain text로 출력하며 사용자 HTML을 삽입하지 않는다.

## 7. 기능별 구현 계획

### 7.1 인증·계정 (AUTH-01~09)

- 가입 폼: 이메일, 비밀번호, 비밀번호 확인, 고유 프로필 ID; blur 중복 검사와 submit 재검증.
- 로그인 후 원래 목적지 복귀, 세션 만료 시 query 취소·민감 캐시 제거.
- 이메일 인증 대기/성공/만료/재발송 화면과 미인증 action gate 구현.
- 프로필 수정 및 이메일·기업 인증 상태 badge 구현.
- 기업 인증은 회사 이메일, 무료 메일 거절, 링크 처리, 재시도 상태를 제공한다.
- 테스트: 중복, 잘못된 token, 401, 미인증 피드백/구매 차단, 키보드 제출.

### 7.2 메인·검색·랭킹 (HOME-01~08, RANK-01~10 표시)

- URL 기반 debounced 검색과 랭킹/급상승/최신 정렬을 구현한다.
- RankingRow에 순위, 제목, 공개 범위, 성장 단계, 요약, 카테고리, 현재가, 활성 원금, 기업 관심, 가격 등락, 좋아요, 조회를 표시한다.
- 급상승 영역과 기여자 Top 5는 독립 query/error boundary로 구성한다.
- `calculatedAt`과 랭킹 설명 dialog를 제공하며 성공 보장 지표가 아님을 명시한다.
- 빈 검색, 부분 API 실패, 느린 응답, 모바일 지표 축약을 테스트한다.

### 7.3 AI 아이디어 등록 (IDEA-01~13)

Wizard는 `입력 → 후보 선택 → 기획서 편집 → 공개/질문 → 미리보기 → 게시` 6단계다.

- 키워드·문제의식 검증 후 AI job을 생성하고 polling한다. 취소·timeout·재시도·기본 템플릿 전환을 제공한다.
- 서로 다른 후보 5개를 단일 선택하고 제목, 카테고리, 요약, 문제, 고객, 해결책, 수익 모델을 편집한다.
- 대표 이미지 job 실패 시 카테고리 fallback과 대체 텍스트를 사용한다.
- 공개 범위 RadioCard는 공개 필드를 구체적으로 설명하며 hover/focus/tap에서 동일 정보를 준다.
- 검증 질문은 1~3개, 정렬·직접 입력·중복 방지를 지원한다.
- 새로고침 복구, 이탈 확인, 중복 게시 방지 idempotency key, 게시 성공 후 상세 이동을 구현한다.

### 7.4 공개 범위·상세·버전 (VIS-01~06, DETAIL-01~08)

- API의 `contentAccess: FULL | SUMMARY | LOCKED`와 `capabilities`를 기준으로 렌더링한다.
- 반공개 Guest에는 로그인 CTA, 비공개에는 404형 화면, 매칭형에는 회사 인증/요청 상태 CTA를 표시한다.
- 상세 탭은 기획서, 피드백, 성장 타임라인, Author 전용 기업 문의로 나눈다.
- 타임라인은 등록·수정·채택·기업 관심·버전 이벤트와 기여자를 표시한다.
- Author 편집은 주요 변경 시 change summary와 새 버전 게시 확인을 요구한다.
- 권한이 바뀐 캐시가 상세 내용을 잔류시키지 않도록 사용자 변경·로그아웃 시 제거한다.

### 7.5 피드백·기여·좋아요 (FB-01~13, REACT-01~03)

- 검증 질문을 상단에 표시하고 유형, 100자 이상 의견, 선택 근거 URL/설명 폼을 제공한다.
- 작성자만 inline 수정·삭제할 수 있고 수정 표시와 삭제 상태를 표현한다.
- 채택 항목을 상단 고정하고 Author의 채택 이유·수정 방향을 필수 dialog로 받는다.
- 채택 성공 후 feedback, timeline, wallet/contribution query를 갱신하고 ‘AI로 보강’ CTA를 연다.
- 좋아요는 인증 사용자에게 낙관적 반영 후 실패 시 rollback한다. 상세 조회는 화면 진입당 한 번만 전송한다.
- blocked/hidden feedback placeholder 정책과 신고 메뉴를 함께 검증한다.

### 7.6 지갑·Seed Unit (POINT-01~09, UNIT-01~18)

- 지갑 summary, append-only 원장, 유형·증감·잔액·시각, 회수 가능 잔액 지급 CTA를 구현한다.
- 구매 dialog는 정수 Unit, 현재가, 총액, 잔액, 1회/일일/아이디어 한도, 24시간 잠금을 보여준다.
- quote API 결과가 변경되면 사용자 재확인을 받고, 중복 click을 막는다.
- 보유 목록은 Lot별 구매 시각, Unit, 원금, 현재 가치, 손익, unlock countdown을 표시한다.
- 회수 dialog는 확정 가격, 즉시 지급 예상, 대기 예상, 회수 후 가격 비영향을 설명한다.
- fake clock으로 23:59:59 잠금/24:00:00 허용, 가격 변동, 한도 초과, 본인 Idea, 잔액 부족을 테스트한다.
- 구매·보유·회수 모든 영역에 “현금화할 수 없으며 금전적 권리나 수익 배분을 의미하지 않습니다”를 표시한다.

### 7.7 기업 관심·열람·메시지 (COMPANY-01~09)

- 인증 Company만 관심 등록/취소하며 회사 프로필 공개 안내 후 실행한다.
- 매칭형 요청 CTA는 NONE/PENDING/APPROVED/REJECTED 상태를 표시한다.
- Author 요청 목록에서 기업 정보·메시지를 보고 승인/거절하며 상세 query를 갱신한다.
- 메시지는 반응형 thread list + message panel + composer로 구성하고 URL로 thread를 선택한다.
- focus 시 및 30~60초 polling으로 갱신하고 unread badge와 read mutation을 처리한다.
- 실시간 접속, 입력 중, push UI는 만들지 않는다.

### 7.8 신고·차단 (SAFE-01~07)

- Idea/Feedback 메뉴에 사유 enum과 상세 설명 신고 dialog를 둔다. 접수 후 자동 삭제가 아님을 알린다.
- 프로필·피드백·메시지에서 타 사용자를 차단/해제하고 본인 action은 숨긴다.
- 차단 후 feedback/message query를 무효화하고 hidden placeholder 또는 서버 제외 결과를 일관되게 표시한다.
- 관리자 화면은 구현하지 않는다.

### 7.9 마이페이지

- Profile, Wallet, Holdings, Feedback, Contributions, Company 탭을 역할별로 노출한다.
- 각 탭은 독립 query, skeleton, empty, error boundary와 cursor pagination을 갖는다.
- 모바일은 가로 스크롤 tab 또는 select navigation을 사용하고 URL section을 유지한다.
- 삭제·비공개 전환된 Idea 내역은 API가 허용한 최소 정보만 표시한다.

## 8. Mock API 계약과 실제 백엔드 연동

프론트 작업을 막지 않도록 전체 endpoint 계약을 먼저 정의하고 API 함수까지 구현한다. MSW는 이 요청을 가로채 응답한다. OpenAPI가 제공되면 초안과 대조하여 타입을 생성 타입으로 교체하되, page와 feature hook은 변경하지 않는다.

- 공통 error `{ code, message, fieldErrors?, requestId }`, cursor page, 날짜 ISO-8601, 금액 정수 Point.
- 모든 상세 응답의 `capabilities`와 `contentAccess`; 클라이언트가 역할을 추론하지 않게 한다.
- AI job status, purchase/recovery quote, access request status, message unread 모델.
- mutation idempotency key와 409/422의 안정된 error code.
- 생성 타입 CI diff와 MSW handler가 같은 schema를 사용한다.

백엔드 연동은 다음 순서로 진행한다.

1. OpenAPI에서 타입과 operation을 생성한다.
2. Mock request/response와 실제 계약의 필드·enum·오류 코드를 비교한다.
3. 공통 API client의 base URL만 실제 서버로 전환한다.
4. 기능별로 실제 API smoke test와 contract test를 수행한다.
5. 연동이 완료된 handler도 테스트용으로 유지하되 운영 빌드에서는 MSW를 포함하지 않는다.
6. API가 아직 없는 기능은 Mock 모드로 유지하여 다른 기능 개발을 막지 않는다.

MSW는 happy path뿐 아니라 401/403/404/409/422/500, 지연, timeout fixture를 제공한다. 실제 서버와 차이가 발견되면 UI에 임시 예외 처리를 추가하기보다 계약과 Mock을 먼저 동기화한다.

### 8.1 필수 endpoint 묶음

| 도메인 | 실제 연동 형태로 미리 구현할 endpoint |
|---|---|
| Auth | signup, duplicate-check, login, logout, me, verify-email, resend, company-verify |
| Idea | list/search/sort, detail, create, update-version, versions, timeline, view-event |
| AI | generation job create/status/retry, image job, accepted-feedback enhancement |
| Feedback | list, create, update, delete, revisions, accept-with-reply |
| Reaction | like, unlike |
| Wallet | summary, ledger, dashboard-summary |
| Seed Unit | quote, purchase, holdings, recovery quote, recover, pending payout |
| Ranking | ranking list, rising list, contributors, ranking explanation/snapshot metadata |
| Company | interest add/remove, access request, author request list, approve/reject |
| Messaging | thread list/create, messages, send, mark-read |
| Safety | report, block, unblock, blocked-users |
| My page | profile update, my feedback, contributions, company interests |

각 operation에는 request/response schema, error code, query key, invalidation 대상과 최소 하나의 MSW contract test가 있어야 한다.

### 8.2 환경별 동작

| 환경 | 데이터 경로 |
|---|---|
| 개발 기본 | React → 공통 API client → HTTP 요청 → MSW → Mock service/DB |
| 자동 테스트 | React → 공통 API client → MSW scenario handler |
| 실제 백엔드 개발 | React → 공통 API client → dev API server |
| 운영 | React → 공통 API client → production API server |

운영 build는 MSW bootstrap과 Mock DB chunk를 포함하지 않는다. `VITE_API_MODE=real`에서 Mock import가 tree-shaking되는지 bundle 분석으로 검증한다.

## 9. 단계별 실행 순서와 완료 게이트

| 단계 | 구현 범위 | 기능 명세 | 완료 게이트 |
|---|---|---|---|
| 0. 구조 재편 | router/provider/page/feature/entity/shared 분리, API client, Mock DB | 공통 | 기존 화면 smoke + import boundary 검사 |
| 1. 인증 완성 | 가입, 중복, 로그인, 인증, Company 인증, route/action guard | AUTH-01~09 | 역할 5종 인증 E2E |
| 2. 탐색·권한 | 검색/정렬/랭킹, 상세 DTO, 공개 범위 4종 | HOME-01~08, VIS-01~06, DETAIL-01~04 | 역할×공개 범위 matrix 전부 통과 |
| 3. AI 등록 | 6단계 wizard, job polling, 질문, 이미지 fallback, draft, 게시 | IDEA-01~13 | 성공/timeout/retry/복구 E2E |
| 4. 기여·버전 | 피드백 CRUD/revision/채택, 좋아요/조회, 새 version/timeline | FB-01~13, REACT-01~03, DETAIL-05~08 | 채택→보상→AI 보강→버전 E2E |
| 5. 포인트 | wallet, 활동 보상, 일일·지갑 한도, 원장 | POINT-01~09 | 경계값과 원장 합계 contract test |
| 6. Seed Unit | quote, 구매, Lot, 24시간, 회수, pending payout | UNIT-01~18 | fake clock·한도·가격변경 E2E |
| 7. 랭킹·가격 | 점수 순수 함수, snapshot fixture, 가격 표시/설명 | RANK-01~10 | 공식 fixture와 가격 비순환 테스트 |
| 8. 기업·메시지 | 관심, 요청/승인, thread/send/read/polling | COMPANY-01~09 | Company↔Author 전체 왕복 E2E |
| 9. 안전·마이페이지 | 신고, 차단, 숨김, profile/wallet/holding/feedback/contribution/company 탭 | SAFE-01~07 + 마이페이지 | 신고·차단 및 역할별 탭 E2E |
| 10. 실제 API 준비 | 전체 endpoint API 함수, OpenAPI adapter, contract diff | 전체 | mock/real 전환 시 UI 코드 변경 0 |
| 11. 출시 QA | 접근성, 320px 반응형, 성능, 보안, 오류 관측 | 전체 | DoD와 113개 추적표 100% |

각 단계에서 API 함수와 MSW handler를 동시에 작성한다. 따라서 10단계는 누락된 연동 코드를 새로 만드는 단계가 아니라 실제 OpenAPI와 이미 구현된 계약을 대조하고 base URL을 전환하는 단계다. 실제 서버가 늦어져도 0~9단계의 MVP 기능과 E2E는 모두 완료되어야 한다.

## 10. 테스트 전략

- Unit: formatter, permission mapper, countdown, 예상 총액/손익, query invalidation helper.
- Component: schema 오류, Tooltip/Dialog 키보드, 상태별 CTA, 민감 필드 미노출.
- Integration(MSW): 모든 mutation의 성공과 401/403/409/422/500, retry/rollback.
- E2E: ① 가입·인증·300P ② AI 등록 ③ 피드백·채택·버전 ④ 구매·24시간·회수 ⑤ pending 지급 ⑥ 기업 요청·승인·메시지 ⑦ 신고·차단.
- 접근성: axe 자동 검사 + 키보드-only + dialog focus + 200% zoom 수동 검사.
- 시각 회귀: 메인, 등록, 상세, 타임라인, 기업, 모바일 핵심 화면을 prototype screenshot과 비교한다.

고정 fixture는 Guest, 미인증 User, 인증 User, Author, Company, 승인 Company, 차단 관계, 공개 범위 4종, 가격 1/10/100P, 지갑 0/경계/2000P, unlock 전후 Lot을 포함한다.

### 10.1 요구사항 추적표 운영

`docs/12_MVP_REQUIREMENTS_TRACEABILITY.md`를 구현과 함께 생성하고 기능 명세 113개 행을 관리한다.

| ID | 상태 | UI/Route | API operation | Mock service | Test | 비고 |
|---|---|---|---|---|---|---|
| AUTH-01 | TODO/DOING/DONE | `/signup` | `POST /auth/signup` | `auth.service` | E2E 이름 | PR/결정 |

- UI만 있으면 완료가 아니라 `DOING`이다.
- Mock handler만 있어도 완료가 아니다.
- UI + 실제 API 함수 + MSW 동작 + 오류 상태 + 자동 테스트가 모두 있어야 `DONE`이다.
- 각 단계 종료 시 문서 ID 범위의 TODO가 0인지 검사한다.
- Later 항목은 `OUT_OF_SCOPE`로 표시하고 화면에 죽은 CTA를 만들지 않는다.

## 11. 비기능 품질 게이트

- `tsc --noEmit`, ESLint, unit/integration, Playwright smoke가 CI에서 통과한다.
- 주요 route에 lazy loading을 적용하고 초기 화면에 불필요한 editor/message 코드를 포함하지 않는다.
- 중간급 모바일 기준 LCP 2.5초, CLS 0.1 이하를 목표로 한다.
- 이미지 크기·aspect ratio를 고정하고 fallback을 제공한다.
- 320px에서 가로 페이지 overflow 없이 핵심 CTA를 사용할 수 있다.
- 오류 보고에 `requestId`, route, error code만 보내고 이메일·메시지·아이디어 본문은 보내지 않는다.
- CSP를 깨는 inline script/unsafe HTML을 사용하지 않으며 token·개인정보를 로그에 남기지 않는다.

## 12. 구현 전 확정할 정책

- [ ] 인증 방식(cookie session 권장)과 CSRF 처리
- [ ] OpenAPI 소스와 타입 생성 명령
- [ ] AI job polling 간격·timeout·draft 보존 기간
- [ ] Lot 전체 회수/부분 회수(기존 권장안: Lot 전체)
- [ ] 가격 변경 시 quote 재확인 규칙
- [ ] 차단 시 새 메시지 전송 가능 여부와 기존 메시지 placeholder
- [ ] 탈퇴·삭제 콘텐츠의 마이페이지 최소 표시 정책
- [ ] 분석/오류 수집 도구와 개인정보 제외 필드

## 13. 프론트엔드 Definition of Done

기능 하나는 다음을 모두 만족해야 완료다.

1. 기능 명세 ID, route, 컴포넌트, API operation, 테스트가 연결되어 있다.
2. TypeScript strict와 생성 API 타입을 통과한다.
3. loading/empty/error/success/disabled/forbidden 상태가 구현되어 있다.
4. 서버 권한 오류와 공개 범위 변경 후 캐시를 안전하게 처리한다.
5. 모바일·키보드·스크린리더 기본 검증을 통과한다.
6. mutation 중복 제출 방지와 성공 후 최소 query 갱신이 검증된다.
7. Seed Unit 기능은 비금전성 고지와 시간·한도 경계 테스트가 있다.
8. 사용자 입력을 unsafe HTML로 렌더링하지 않는다.
9. MSW 계약 테스트와 해당 핵심 E2E가 통과한다.
10. 문서·OpenAPI·변경된 fixture가 함께 갱신된다.
