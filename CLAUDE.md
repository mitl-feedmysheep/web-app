# Web App (유저용 모바일 웹앱)

React 19 / Vite 7 / TypeScript 5.9

## 개요

모바일 퍼스트 웹앱 (max-width: 32rem). 교회 소그룹 활동 관리 앱의 사용자 인터페이스.

## 주요 라이브러리

- 라우팅: react-router-dom 7
- UI: shadcn/ui + Radix UI
- 폼: react-hook-form + zod
- 스타일: Tailwind CSS 4
- 토스트: sonner
- 테마: next-themes (다크모드)
- 아이콘: lucide-react

## 디렉토리 구조

```
src/
├── lib/
│   ├── api.ts              # API 클라이언트 (도메인별 함수)
│   ├── utils.ts            # 유틸 (날짜, 전화번호, 이미지 리사이즈)
│   └── auth-handler.ts     # 인증 상태 핸들러
├── hooks/
│   └── useLocalStorage.ts  # localStorage 커스텀 훅
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx    # 메인 레이아웃
│   │   └── BottomNav.tsx   # 하단 네비게이션 (4탭)
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   ├── ui/                 # shadcn 컴포넌트 (17개)
│   └── DaumPostcodeModal.tsx
├── features/               # 페이지별 기능
│   ├── auth/               # 로그인, 회원가입
│   ├── home/               # 홈
│   ├── group/              # 소그룹
│   ├── gathering/          # 모임
│   ├── prayer/             # 기도제목
│   ├── messages/           # 메시지
│   ├── notifications/      # 알림
│   └── my/                 # 마이페이지
└── types/index.ts          # 공유 타입 정의
```

## 코드 패턴

- 상태관리: React hooks만 사용 (useState, useEffect 등). Redux/Zustand 없음
- 데이터 페칭: useEffect 내 직접 API 호출. TanStack Query 없음
- API: fetch 기반, `VITE_API_BASE_URL` 환경변수 (기본: localhost:8080)
- 인증: localStorage에 `authToken` 저장, Authorization 헤더로 전송
- 폰트: Pretendard Variable (한국어)
- 경로 별칭: `@/` -> `./src/*`

## API 클라이언트 (lib/api.ts)

도메인별로 분리: `authApi`, `membersApi`, `churchesApi`, `groupsApi`, `gatheringsApi`, `messagesApi`, `notificationsApi`, `prayersApi`

## 온보딩 슬라이드 (features/onboarding/)

앱 최초 진입 시 표시되는 코치마크 튜토리얼. 실제 앱 화면을 본뜬 모의 UI + box-shadow 컷아웃 오버레이로 기능을 소개.

- 슬라이드 정의: `onboarding-data.ts` (ONBOARDING_SLIDES 배열)
- 모의 화면: `slides/` 디렉토리 (HomeSlide, GroupSlide, PrayerSlide, SermonNotesSlide, MySlide)
- 트리거: 로그인 페이지 진입 시 자동 (`onboarding.seen` localStorage), MY 페이지 "앱 사용법 보기"로 수동 재실행

**새로운 화면이나 주요 기능이 추가될 때**: 온보딩 슬라이드에 추가할지 사용자에게 반드시 물어볼 것.
