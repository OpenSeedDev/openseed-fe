# OpenSeed Frontend

아이디어를 AI로 구체화하고 커뮤니티·기업 반응으로 검증하는 OpenSeed의 React + TypeScript 프론트엔드입니다.

## 실행

```bash
npm install
npm run dev
```

기본 데이터 모드는 MSW 기반 Mock API입니다. 백엔드 연동 시 `.env.local`에 아래 값을 설정합니다.

```text
VITE_API_MODE=real
```

실제 API 모드는 `/api` 계약이 준비된 이후 사용합니다.

## 확인 명령

```bash
npm run build
npm run lint
```

## 구현 화면

- 메인 아이디어 랭킹·검색·정렬
- 아이디어 상세, 기획서, 피드백, 성장 타임라인, 기업 관심
- Seed Unit 구매와 비금전성 안내
- AI 아이디어 등록 5단계 흐름
- 마이페이지 지갑·원장·보유 Unit·기여
- 기업 문의 스레드

기획과 구현 순서는 [`docs/10_기능별_상세_구현_PLAN.md`](docs/10_기능별_상세_구현_PLAN.md)를 기준으로 합니다.
