# Lighthouse 감사 스냅샷 — 2026-07-22 (GRM-001)

> 날짜 산출물(라이브 아님). 대상: 홈 `/` · 카테고리 `/hair` · 게시글 상세 `/posts/[id]` · 검색 `/search` · 프로필 `/profile/[username]`.

## ⚠️ 측정 한계 (정직 고지)

**이 세션에서 실제 Lighthouse *숫자 스코어*는 산출하지 못함.** 이유:
- 로컬에 Supabase 자격증명(`.env.local`) 부재 → 데이터 구동 페이지(홈·게시글·프로필·검색)가 서버 렌더 단계에서 실패 → 실행해도 에러 페이지를 측정하게 됨(무의미).
- 런타임 성능 지표(LCP·TBT·CLS·Speed Index)는 실 데이터+배포 환경에서만 유효.

**따라서 본 감사 = 정적(코드 레벨) 감사 + 안전한 최적화 적용.** 숫자 ≥90 검증은 **배포 환경(Vercel preview + env)에서 실행** 필요 — AC의 "측정" 항목은 그 단계로 이연(아래 §실행 체크리스트).

## 카테고리별 정적 감사

### SEO — 양호 ✅
- 전 경로 `title`/`description` 존재(layout 기본 + 경로별 `generateMetadata`/`metadata`). 검색은 의도적 `robots: noindex`(중복 색인 방지 — 정상).
- `<html lang="ko">` · `metadataBase` · OG(siteName·locale ko_KR) · canonical · `sitemap.ts` · `robots.ts` · JSON-LD(게시글) 모두 구현.
- **갭 없음**(정적 기준). 런타임 확인: 크롤 가능 링크·모바일 폰트 크기.

### Accessibility — 대체로 양호, 소폭 개선
- `<html lang>` ✅ · 아이콘 전용 버튼(테마 전환·검색)에 `aria-label` ✅ · 이미지 alt(정보성=username, 장식성=`alt=""`) 적절.
- **개선 여지(런타임 측정 필요)**: 색상 대비 — 브랜드기획서 §9에서 `--text-4 #9ca3af`(2.5:1)를 본문 금지로 규칙화했으나 코드 전수 적용은 미검증. 다크 테마 상태별 대비 미검증.
- 적용: 아래 §적용한 수정에서 상호작용 요소 접근성 이름 재확인.

### Best Practices — 이미지가 주 감점원
- **raw `<img>` 14곳** — Lighthouse "이미지에 명시적 width/height 없음"(CLS)·"올바른 종횡비"·"차세대 포맷"·"적절한 크기" 감점. next/image 미사용.
- HTTPS·콘솔 오류·deprecated API: 런타임 확인 필요.

### Performance — 런타임 지표 중심(측정 이연)
- 정적으로 개선 가능: 이미지 lazy/async 디코딩, 폰트(Pretendard) 로딩, next/image 전환.
- LCP·TBT·CLS·SI: 배포 측정 필요.

## 적용한 수정 (안전·측정 불필요 항목만)

1. **이미지 디코딩·지연 로딩**: 리스트/썸네일·아바타 raw `<img>`에 `loading="lazy"`·`decoding="async"` 추가(레이아웃 불변, best-practices/perf 순수 이득). LCP 후보(상단 대형 이미지)는 lazy 제외.
2. **`viewport`/`themeColor`**: `layout`에 `export const viewport` 추가(라이트/다크 테마 컬러) — 모바일·PWA 신호 보강.
3. **next/image 전면 전환 완료**: raw `<img>` 14곳 → `next/image`(0개 잔존). fill 패턴(부모 `relative`+`sizes`)·admin은 fixed(width/height). 자동 lazy·WebP·반응형 크기 → Lighthouse best-practices/perf(CLS·차세대 포맷·적절한 크기) 정적 개선. tsc·build 검증(구조). **시각 정합은 배포 후 확인 권고**(fill+object-cover는 기존 `w-full h-full object-cover`와 시각 동일 패턴).

## 실행 체크리스트 (배포 환경에서 — 숫자 검증)

- [ ] Vercel preview에 env 설정 후 5개 경로 모바일 Lighthouse 실행(`npx lighthouse <url> --preset=perf --form-factor=mobile` 또는 PageSpeed Insights).
- [ ] 각 경로 Performance·SEO·Accessibility·Best Practices ≥ 90 확인.
- [ ] 미달 시: 이미지 next/image 전환·폰트 preload·미사용 JS 분할·색상 대비 조정.
- [ ] 다크 테마 WCAG 대비 전수(브랜드기획서 §9 [미확정]과 병합).

## 상태

- **정적 감사 + 안전 최적화: 완료(이 PR).**
- **숫자 ≥90 측정·미달 항목 조치: 이연** — 배포 환경 필요(인간 액션: env 설정/preview 배포). GRM-001은 "부분 완료"로 두고 측정 잔여를 명시.
