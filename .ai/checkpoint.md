# Checkpoint — talmo-com 교차조사 + 권고 1~4번 반영

> **역할 = 이번 세션의 서사 바통** (콜드스타트 인계문). 매 세션 종료 시 *덮어씀*.
> **누적 상태(오픈이슈·결정·링크·최근이력 표)는 `HANDOFF.md`가 정본**이므로 여기서 중복하지 말고 참조. (경계: CLAUDE.md §4)

## 작성자

- Agent: Claude (Opus 4.8, Claude Code)
- Branch: `feat/talmo-insights-legal-hot` (main에서 분기, #18·#19 머지 후)

## 방금 한 것 (이번 세션)

### 1) talmo-com 전수조사

사용자 요청으로 자매 프로젝트 `/Users/hayden/talmo-com`을 전수조사했다. **같은 방법론(v4.0)·같은 도메인(탈모/두피)·6일 앞선 출발**이라 grooman이 아직 안 겪은 문제를 이미 겪고 문서화해둔 상태였다. 산출물: `40_dev/snapshots/talmo-com-cross-project-research-2026-07-24.md`(권고 8건 우선순위표 포함).

핵심: talmo는 Next 16/React 19/Tailwind 4 + 기획서 6종 + **specs 5종 + ADR 5종 + DESIGN.md**(grooman에 없는 문서 유형)를 갖췄지만 **테스트가 0개**고 main 직접 커밋이 많다 → 역방향 주입 후보(테스트·PR 워크플로우·방법론 sync)도 §5에 정리.

### 2) 권고 1~4번 구현 (사용자 "응 진행해")

- **①(Class C) clinic 재게시 차단** — 사용자에게 3지선다로 물어 "HOT에서 clinic 제외" 선택받음. 근거를 내가 조사 중 도출: talmo는 고지 문구(`REPUBLISH_DISCLOSURE`)로 처리했지만 **그건 그쪽 재게시 면이 화장품·건기식(표시광고법)이라 통하는 것**이고, grooman clinic은 의료 시술이라 광고 전환 시 **의료법 §56①(광고 주체를 의료인·의료기관으로 한정)**에 걸려 고지로 치유되지 않는다. → `lib/community/policy.ts` 신설.
  - 조사하다 **`RelatedPosts`의 태그 경로에도 카테고리 필터가 없다**는 걸 추가 발견(홈 HOT만이 아니었음) → 같이 차단.
- **② 검토메모 §4-2 보강** — 의료법 **§27(환자 유인)**, **식약처 표시광고 축**(화장품법·건기식법)이 통째로 빠져 있었음. §5 남은 불확실성에 5·6·7번 추가, §6 조치 요약 갱신. 부수로 §5-4(개인정보처리방침)는 GRM-013으로 이미 해소됐으므로 취소선 처리.
- **③ 카테고리 인지형 표현 경고** — `lib/community/expression.ts`. **차단이 아니라 경고**로 설계한 이유를 코드 주석에 박음: 블랭킷 차단은 합법 표현("탈모 증상 완화"는 기능성화장품 허용)까지 죽이고, 대상이 판매자 상품 등록이 아니라 **이용자 커뮤니티 발화**다. `WriteForm`에 실시간 노출(발행은 막지 않음).
- **④ HOT 최소 추천 임계값** — `hot_rank = log(engagement) + epoch/45000`은 Reddit 공식인데, 임계값이 없으면 시간항이 지배해 **"HOT = 그냥 최신"**이 된다. talmo 실측(글 80개에 임계값 5 → 78%가 BEST) 근거로 `HOT_MIN_LIKES = 3` 도입.
- 부수 리팩터: `extractText`/`extractThumbnail`이 `'use server'` 파일에 갇혀 클라이언트에서 못 쓰던 것 → `lib/utils/tiptap.ts`로 추출(중복도 제거).

## 검증한 것

- tsc 0 · vitest **43/43**(27→43, 신규 16종) · build 27 routes
- **PostgREST 필터 실측**: `category=not.in.(clinic)` → HTTP 200 / 괄호 뺀 오형식 → HTTP 400. 즉 **조용히 무시되지 않는다**는 걸 대조군으로 확인.
- **경고 UI 실재 확인**: 오늘 겪은 "타입은 통과하는데 CSS가 안 나오는" 함정(Tailwind var+opacity) 때문에, 빌드 산출물에서 경고 문구가 클라이언트 청크에 포함됐는지 + amber 클래스 4종이 실제 CSS로 컴파일됐는지 grep으로 확인.
- **미검증(정직)**: production에 글이 0건이라 **clinic 제외의 행 단위 동작은 실데이터로 확인 못 했다.** 문법 검증 + 단위 테스트(리터럴 형식 고정)로 대체.

## 다음 구체 행동

1. **아직 커밋 안 함** — wrap → ship → PR 생성이 다음 스텝.
2. 리뷰·머지 후: TODO **GRM-016**(권고 5~8: 폰트 static 전환·DESIGN.md·UX 진단·clinic 신뢰장치) 중 선택.
3. 병행 대기: GTM 콘솔 GA4 연결(사람) → 전환 이벤트 삽입(AI).

## 막힌 것 / 주의

- **HOT_MIN_LIKES=3은 공개 전 추정값이다.** talmo가 실제 데이터 보고 5→10으로 올린 것처럼, grooman도 글이 쌓이면 재보정해야 한다(정책 파일 주석에 명시).
- clinic을 HOT에서 뺐으므로 **clinic 카테고리 유입이 홈에서 끊긴다.** 제품상 대가이며, 사용자가 선택지 설명을 읽고 결정했다.
- 병렬 세션(PERF-2 다크모드 감사)이 돌고 있어 라이브 파일 충돌 가능성 있음 — 이번에도 머지 시 확인할 것(이번 세션에 이미 2회 겪음).

## 환경

- 브랜치 `feat/talmo-insights-legal-hot`, main은 #19까지 머지된 상태
- talmo-com 참조 경로: `/Users/hayden/talmo-com`(private repo, Supabase `qnxaazbucggumshwbgfo`)
