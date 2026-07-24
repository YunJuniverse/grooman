---
version: alpha
name: 그루맨 (Grooman)
description: 대한민국 남성 그루밍 커뮤니티. 헤어케어·탈모·스킨케어·쉐이빙·향수·시술 후기를 다루는 정보 공유형 커뮤니티. 담백한 정보 밀도와 다크 우선 무드.
colors:
  # 키 컬러 (에이전트가 자동 생성하지 않도록 명시)
  primary: "#4f46e5"      # = accent(라이트). 링크·강조·선택 상태
  secondary: "#0f172a"    # = text-1(라이트). 주요 버튼·본문
  neutral: "#f4f5f7"      # = bg-base(라이트). 바탕
  # ── 라이트 모드 토큰 (globals.css :root에서 추출, 불일치 0) ──
  light:
    bg-base:   "#f4f5f7"   # 페이지 바탕
    bg-card:   "#ffffff"   # 카드·헤더·패널
    bg-subtle: "#f9fafb"   # 입력창·연한 면
    border:    "#e2e8f0"
    border-sub: "#edf2f7"
    text-1:    "#0f172a"   # 본문·제목
    text-2:    "#374151"   # 보조 본문
    text-3:    "#6b7280"   # 메타(날짜·조회수) — 흰 배경 대비 4.83:1
    text-4:    "#9ca3af"   # 최약 메타 — 아이콘·비활성 전용(본문 텍스트에 쓰지 말 것)
    accent:    "#4f46e5"   # 인디고. 흰 텍스트 대비 6.29:1
  # ── 다크 모드 토큰 (globals.css .dark에서 추출) ──
  dark:
    bg-base:   "#10131a"
    bg-card:   "#1c2030"
    bg-subtle: "#161b27"
    border:    "#2d3650"
    border-sub: "#232b3e"
    text-1:    "#f1f5f9"
    text-2:    "#cbd5e1"
    text-3:    "#94a3b8"   # 다크 배경 대비 충분
    text-4:    "#64748b"
    accent:    "#818cf8"   # 다크에선 밝은 인디고. ⚠️ 흰 텍스트 대비 2.98:1 — 배경으로 쓰고 흰 글자 얹지 말 것
  # 상태색 (Tailwind 팔레트 직접 사용 — 토큰화 안 됨)
  positive: "green-700 / green-100"   # 구매 인증·성공
  critical: "red-500 / red-50"        # 신고·삭제·경고
  caution:  "amber-800 / amber-50"    # 표시광고 경고(expression.ts)
  # 카테고리 색 (PostCard.tsx CATEGORY_COLORS — 배지·필터)
  category:
    hair:      "amber"    # 헤어케어·탈모
    skin:      "sky"      # 스킨케어
    shaving:   "violet"   # 쉐이빙
    fragrance: "pink"     # 향수
    clinic:    "emerald"  # 시술·성형 후기
    deals:     "red"      # 핫딜·이벤트
  # HOT 순위 (globals.css .rank-*)
  rank-gold:   "#f59e0b"
  rank-silver: "#94a3b8"
  rank-bronze: "#b45309"
typography:
  fontFamily: "Pretendard Variable"    # dynamic-subset 자체 호스팅(app/pretendard.css)
  weights: [400, 500, 700, 900]        # normal·medium·bold·black — 실사용 4단계만
  display:
    fontSize: 1.5rem      # text-2xl. 페이지 제목
    fontWeight: 700
    lineHeight: 1.35
  h1:
    fontSize: 1.25rem     # text-xl. 글 제목
    fontWeight: 700
    lineHeight: 1.4
  h2:
    fontSize: 0.875rem    # text-sm. 섹션 제목("최신 글")
    fontWeight: 700
  body:
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontSize: 0.875rem    # text-sm. 커뮤니티 UI 기본
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontSize: 0.875rem
    fontWeight: 500
  meta:
    fontSize: 0.75rem     # text-xs. 날짜·조회수·배지. 이보다 작게 쓰지 말 것
    fontWeight: 400
rounded:
  default: 4px    # rounded — 배지·작은 요소
  md: 6px         # rounded-md — 카테고리 배지
  lg: 8px         # rounded-lg — 버튼·입력
  xl: 12px        # rounded-xl — 카드
  2xl: 16px       # rounded-2xl — 큰 패널
  full: 9999px    # 칩·아바타·pill 버튼
spacing:
  # Tailwind 기본 4px 스케일. 카드 내부 md(16px), 섹션 사이 xl(40px) 이상.
  base: 4px
layout:
  maxWidth: 1280px   # max-w-7xl. 좌우 여백 px-3(모바일)~px-4
  grid: "모바일 1열 → 데스크톱 사이드바 + 메인"
theme:
  default: dark      # 다크 우선 — 남성 그루밍 커뮤니티 무드. ThemeProvider가 토글
  modes: [light, dark]
components:
  button-primary:
    backgroundColor: "{colors.secondary}"   # gray-900/text-1 — 인디고 아님(아래 근거)
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
  button-accent:
    backgroundColor: "indigo-600"            # 회원가입 등 최상위 CTA에만
    textColor: "#ffffff"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.light.bg-card}"
    rounded: "{rounded.xl}"
    border: "1px {colors.light.border}"
  badge-category:
    # 카테고리별 색(colors.category). bg-{c}-100 / text-{c}-800, 다크는 900/40 + 300
    rounded: "{rounded.md}"
  badge-auto:
    # [자동수집] — 크롤 콘텐츠 표시. 회색 border만, 조용하게
    textColor: "{colors.light.text-4}"
  notice-expression:
    # 표시광고 경고(WriteForm) — amber. 발행을 막지 않는 경고 톤
    backgroundColor: "amber-50"
    textColor: "amber-900"
    rounded: "{rounded.lg}"
  header:
    backgroundColor: "{colors.light.bg-card-translucent}"  # glass. ⚠️ var()+opacity 금지(아래)
    backdrop: "blur(14px) saturate(180%)"
---

## Overview

**담백한 정보 커뮤니티, 다크 우선.** 그루맨은 쇼핑몰도 병원도 아니다. 남성들이 탈모·스킨·쉐이빙 같은 **민감하지만 일상적인 고민**을 조용히 검색하다 들어오는 커뮤니티다.

- **정보 밀도** — 화려함보다 읽기 쉬움. 카드·목록·배지로 정보를 정돈하고, 색은 기능(카테고리 구분·상태 표시)에만 쓴다.
- **다크 우선** — 기본 테마가 다크다. 남성 그루밍 무드에 맞고, 밤에 조용히 보는 사용 맥락에도 맞다. 라이트 모드도 완전 지원하되(토글), **두 모드 모두 대비 기준을 지킨다**(아래 Colors).

타깃은 남성 사용자지만, 남성성은 **색이 아니라 정보 밀도와 담백한 카피**로 표현한다. 형광색·과장·공포 소구를 쓰지 않는다.

**절대 하지 않는 것**: 의약품 오인 표현(발모·양모·육모·치료), before/after 극적 비교, 특정 병원 유인. 이건 취향이 아니라 **규제**다 — 아래 Do's and Don'ts.

## Colors

**색은 기능에만.** 바탕·본문은 전부 뉴트럴(회색 계열 토큰)로 깔고, 채도 있는 색은 세 군데에만 쓴다: ① **accent 인디고**(링크·선택 상태), ② **카테고리 색 6종**(배지·필터 구분), ③ **상태색**(구매 인증 초록·신고 빨강·표시광고 경고 앰버).

토큰은 `globals.css`의 `:root`(라이트)·`.dark`(다크) CSS 변수가 **단일 소스**다. 이 문서의 값은 거기서 추출했다(불일치 0).

**대비 기준 — 두 모드 모두 WCAG AA(4.5:1):**
- 라이트: 본문·메타는 `text-3`(#6b7280, 흰 배경 4.83:1)까지만. `text-4`(#9ca3af, 2.5:1)는 **아이콘·비활성 전용**이고 본문 텍스트에 쓰면 실패한다.
- 다크: 회색 텍스트는 `text-3`(#94a3b8) 이상 밝게. 어두운 회색을 어두운 배경에 얹지 말 것.
- ⚠️ **accent 함정**: 다크 모드 accent(#818cf8)는 흰 텍스트 대비가 2.98:1로 미달이다. 그래서 **버튼 배경에 흰 글자를 얹을 때는 accent가 아니라 `indigo-600`(6.29:1)을 쓴다**(2026-07-24 실제로 이 위반을 고쳤다). accent는 링크 텍스트·선택 표시·연한 배경에 쓴다.

## Typography

**Pretendard 단일 서체, dynamic-subset 자체 호스팅.** `app/pretendard.css`가 92개 unicode-range 청크를 self-host하며, 브라우저가 페이지에 실제 등장한 글자의 청크만 받는다(홈 실측 256KB). 근거: `40_dev/snapshots/font-strategy-2026-07-24.md`.

**굵기는 400·500·700·900 네 단계만** 쓴다(실사용: bold 63·medium 53·semibold 19·black 3). 다른 굵기는 브라우저 합성으로 뭉개진다. semibold(600)는 실사용이 적으니 새 코드에선 medium이나 bold로 흡수하는 걸 권장.

한글 조판 기본값(`globals.css body`):
- `word-break: keep-all` — **필수.** 없으면 "탈모 증상 완화에"가 단어 중간에서 잘린다.
- `line-height: 1.6` — 한글은 라틴보다 넉넉해야 읽힌다. 제목만 1.35~1.4로 조인다.
- 숫자·조회수는 `toLocaleString()`으로 천 단위 구분(`view_count.toLocaleString()` 패턴 사용 중).

**스케일은 좁다.** 커뮤니티 UI는 `body-sm`(text-sm)·`meta`(text-xs)가 압도적이다. 크기를 키우기보다 **굵기와 색으로 위계**를 만든다. `meta`(12px)보다 작은 한글 본문은 쓰지 말 것.

## Layout

**최대 폭 1280px(max-w-7xl), 좌우 여백 px-3(모바일)~px-4.** 데스크톱은 메인 + 우측 사이드바(인기 태그·카테고리), 모바일은 단일 컬럼 + 하단 고정 네비(BottomNav).

간격은 Tailwind 4px 스케일. 카드 내부 16px, 섹션 사이 24~40px. 모바일 하단 네비 높이만큼 본문에 `pb-24` 여유를 준다.

## Elevation & Depth

**면 구분은 배경 단계 + 1px 선으로.** `bg-base`(페이지) → `bg-card`(카드)의 한 단계 차와 `border` 선이 기본이고, 그림자는 hover에만 얹는다.

- **glass 헤더·하단 네비**: `backdrop-filter: blur(14px) saturate(180%)` + 반투명 배경.
- ⚠️ **Tailwind 함정(2026-07-24 실제 버그)**: `bg-[var(--bg-card)]/90` 처럼 **CSS 변수 기반 색에 opacity 수정자(`/90`)를 붙이면 Tailwind가 그 클래스를 컴파일하지 못한다** — 배경이 통째로 사라진다. 반드시 알파값을 미리 넣은 변수(`--bg-card-translucent`)를 쓸 것. 이 함정은 `var()` + `/opacity` 조합 전반에 적용된다.

## Shapes

라운드 기본은 `lg`(8px, 버튼·입력), 카드는 `xl`(12px), 큰 패널은 `2xl`(16px), 배지는 `md`(6px), 칩·아바타·pill 버튼은 `full`. 각진 모서리(0px)는 쓰지 않는다.

## Components

**주요 버튼이 accent(인디고)가 아닌 이유** — 커뮤니티엔 CTA가 화면마다 여럿이다(글쓰기·추천·북마크·공유·필터). 전부 인디고면 accent가 흔해져 강조 기능을 잃고, 다크 모드에선 accent 위 흰 글자가 대비 미달이다(위 Colors). 그래서 **일반 버튼은 `gray-900`(다크에선 밝은 면), accent 인디고는 링크·선택·최상위 CTA(회원가입)에만** 쓴다.

- **card** — 글·상품 공통. hover 시 살짝 떠오른다.
- **badge-category** — 카테고리별 색(위 category 6종). 목록·카드에서 카테고리를 색으로 구분.
- **badge-auto([자동수집])** — 크롤 콘텐츠 표시. **표시 의무 요소**라 제거 금지. 회색 border로 조용하게.
- **notice-expression** — 표시광고 경고(`WriteForm`). 발행을 막지 않는 앰버 경고. **문구를 지우거나 약하게 만들지 말 것**(규제 방어선).
- **rank-gold/silver/bronze** — HOT 순위 1·2·3위 색.

## Do's and Don'ts

**규제 — 디자인 취향이 아니라 법이다.** (근거: `40_dev/snapshots/legal-compliance-review-2026-07-22.md`)

- ❌ **발모·양모·육모·치료·완치·특효** 등 의약품 오인 표현 — 카피·이미지·아이콘 전부. 기능성화장품은 **"탈모 증상 완화"까지만.**
- ❌ **before/after 극적 비교**, 두피 클로즈업 공포 소구, "지금 아니면 늦는다"류 압박.
- ❌ **특정 병원·시술 유인**(연락처·예약 경로·가격·이벤트) — 의료법 §27·§56.
- ✅ **clinic(시술 후기)은 카테고리 밖에 재노출하지 않는다** — 홈 HOT·연관글에서 제외됨(`lib/community/policy.ts`). 재게시는 광고로 전환되기 때문.
- ✅ [자동수집] 배지·출처 링크는 항상 노출(저작권·자동수집 고지).
- ✅ 표시광고 경고(`expression.ts`)는 카테고리 인지형 — hair/clinic/deals에만, **차단 아닌 경고**.

**접근성**

- ✅ 라이트·다크 **양쪽** 대비 AA. 회색 텍스트는 모드별 안전값(위 Colors) 안에서.
- ❌ `var()` + opacity 수정자 조합(컴파일 실패). 알파 baked-in 변수 사용.

**한글**

- ❌ `word-break: normal`(단어 잘림). ❌ 12px 미만 한글 본문.
- ✅ 숫자·조회수 `toLocaleString()`.

**톤**

- ❌ 형광색·과장 이모지·그라데이션 범벅.
- ✅ 사용자는 민감한 고민을 안고 온다. **담백하게, 판단할 재료를 준다.**
