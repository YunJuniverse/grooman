# Design System — 토큰 제약 문서

> **이 문서는 AI 생성의 제약(constraint)이다.** UI를 만들 때 색·반경·그림자·모션은
> 아래 토큰 표의 *역할 이름*으로만 부른다. arbitrary hex·off-system Tailwind 팔레트(회색뿐 아니라 amber/blue/rose… 전 family)는 가드레일이 차단한다.
> 토큰 정의 원본: [`theme/tokens.css`](theme/tokens.css) · 규칙: 지침 20.
>
> 🔧 신규 프로젝트는 아래 "값" 열을 이 프로젝트 브랜드에 맞게 채운다(역할 이름은 유지).

## 색 토큰 (이름 = 역할)

### Surfaces — 배경 레이어
| 유틸 | 역할 | 값 |
|------|------|----|
| `bg-surface-base` | 페이지 바닥 | `#ffffff` |
| `bg-surface-raised` | 카드·패널 | `#f8fafc` |
| `bg-surface-overlay` | 모달·팝오버 | `#ffffff` |
| `bg-surface-sunken` | 입력 well·트랙 | `#f1f5f9` |
| `bg-surface-inverse` | 대비 반전 | `#0f172a` |

### Text
| 유틸 | 역할 | 값 |
|------|------|----|
| `text-text-primary` | 본문 | `#0f172a` |
| `text-text-secondary` | 보조 | `#475569` |
| `text-text-muted` | 흐림·placeholder | `#94a3b8` |
| `text-text-inverse` | 반전 배경 위 | `#f8fafc` |
| `text-text-on-brand` | 브랜드 배경 위 | `#ffffff` |

### Border
| 유틸 | 역할 | 값 |
|------|------|----|
| `border-border-subtle` | 약한 구분선 | `#f1f5f9` |
| `border-border-default` | 기본 | `#e2e8f0` |
| `border-border-strong` | 강조 | `#cbd5e1` |
| `border-border-focus` | 포커스 링 | `#6366f1` |

### Brand
| 유틸 | 역할 | 값 |
|------|------|----|
| `bg-brand` / `text-brand` | 주 액션 | `#6366f1` |
| `bg-brand-hover` | hover | `#4f46e5` |
| `bg-brand-active` | active | `#4338ca` |
| `bg-brand-subtle` | 배경 틴트 | `#eef2ff` |

### Semantic — 상태
| 유틸 | 역할 | 값 |
|------|------|----|
| `text-success` / `bg-success-subtle` | 성공 | `#16a34a` / `#dcfce7` |
| `text-warning` / `bg-warning-subtle` | 경고 | `#d97706` / `#fef3c7` |
| `text-danger` / `bg-danger-subtle` | 위험 | `#dc2626` / `#fee2e2` |
| `text-info` / `bg-info-subtle` | 정보 | `#2563eb` / `#dbeafe` |

## 디자인 언어 토큰
| 종류 | 유틸 | 값 |
|------|------|----|
| 반경 | `rounded-sm` / `-md` / `-lg` / `-full` | 0.25 / 0.5 / 0.75rem / full |
| 그림자 | `shadow-sm` / `-md` / `-lg` | (tokens.css) |
| 모션 | `duration-fast/base/slow`, `ease-standard/emphasized` | 120/200/320ms |
| 타이포 | `font-sans` / `font-mono` | system stack |

## 프리미티브 (토큰만 소비)
| 컴포넌트 | variant/prop | 비고 |
|----------|--------------|------|
| `Button` | `variant`: primary/secondary/ghost/danger · `size`: sm/md/lg | `components/primitives/Button.tsx` |
| `Card` | `elevation`: flat/raised/overlay | `components/primitives/Card.tsx` |
| `Badge` | `tone`: neutral/brand/success/warning/danger/info | `components/primitives/Badge.tsx` |

## 규칙 요약
1. 색은 위 토큰으로만. `bg-[#...]`·`text-gray-N`·`bg-amber-N` 등 전 팔레트 금지(가드레일 차단).
2. 새 컴포넌트는 가능하면 프리미티브 조합으로. 클래스 병합은 `cn()`.
3. 의도적 예외는 `guardrails/check-no-arbitrary-color.sh`의 `ALLOW_HEX`로만.
