# GROOMAN — CLAUDE.md (자율 빌드 버전)

> 이 파일을 그루맨 프로젝트 루트에 `CLAUDE.md`로 저장한다.
> Claude Code는 매 세션마다 이 파일을 자동으로 읽고 컨텍스트를 이어받는다.

---

## ⚡ 자율 빌드 프로토콜 (가장 먼저 읽을 것)

> Claude Code가 `--dangerously-skip-permissions` 모드로 실행되었을 때 따르는 작업 원칙.

### 세션 시작 시 반드시 할 것

1. 이 파일 전체를 읽는다
2. `## 빌드 체크리스트`에서 미완료 항목(`[ ]`)을 확인한다
3. 미완료 중 **가장 앞선 의존성**부터 순서대로 시작한다
4. 작업 완료 시 체크리스트 `[ ]`를 `[x]`로 업데이트한다
5. 모든 항목이 `[x]`가 될 때까지 반복한다

### 막혔을 때 규칙

- 환경변수 누락 → `.env.local.example` 파일 생성 후 필요한 값 목록 출력, 다른 작업으로 우회
- API 연동 실패 → 해당 기능 mock 처리 후 다음 항목 진행, 주석으로 TODO 표시
- 타입 에러 → strict 타입으로 해결. `any` 사용 절대 금지
- 빌드 에러 → 에러 원인 분석 후 수정. 같은 에러 3회 이상 반복 시 우회 방법 채택

### 코딩 규칙 (절대 준수)

- Server Components 기본. `"use client"`는 최소화 (이벤트 핸들러·훅 필요 시만)
- TypeScript strict mode. `any` 타입 금지
- Supabase 쿼리: 서버에서는 `lib/supabase/server.ts`, 클라이언트에서는 `lib/supabase/client.ts`
- 모든 migrations에 RLS 정책 포함
- 환경변수 하드코딩 절대 금지
- `pages/` 라우터 사용 금지. App Router만 사용
- 모든 `page.tsx`에 `export async function generateMetadata()` 필수
- slug 형식: `한국어제목-uuid8자리` (예: `탈모예방루틴-a1b2c3d4`)
- 이미지는 모두 Cloudinary 경유. `next/image`로 렌더링

---

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | Grooman (그루맨) |
| 도메인 | grooman.kr |
| 콘셉트 | 대한민국 남성 그루밍 전문 커뮤니티 |
| 벤치마크 | 퀘이사존(UI/UX) + 대다모 댄디(콘텐츠 구조) |
| 개발 방식 | 1인 바이브코딩 (Claude Code) |
| 브랜드 원칙 | 브랜드 중립성 최우선. 특정 제품·병원 편향 금지 |

### 카테고리

| 카테고리 | 슬러그 | 특이사항 |
|---|---|---|
| 헤어케어·탈모 | `/hair` | 자동수급 허용 |
| 스킨케어 | `/skin` | 자동수급 허용 |
| 쉐이빙 | `/shaving` | 자동수급 허용 |
| 향수 | `/fragrance` | 자동수급 허용 |
| 시술·성형 후기 | `/clinic` | **자동수급 금지. UGC 전용** |
| 핫딜·이벤트 | `/deals` | 자동수급 허용 |

---

## 기술 스택

```
Next.js 14 (App Router · RSC · Server Actions)
Supabase (PostgreSQL 15 · Auth · Storage · Realtime · RLS)
Vercel (배포 · Cron Jobs · Edge)
Tailwind CSS v3 + shadcn/ui
Tiptap v2 (리치 에디터)
Cloudinary (이미지 최적화 · WebP 자동 변환)
Claude API - claude-haiku-3 (크롤링 AI 처리)
TypeScript strict mode
```

---

## 환경변수 목록

> `.env.local`에 설정. 없으면 해당 기능 mock 처리 후 계속 진행.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CRON_SECRET=                    # 랜덤 32자 문자열
NEXT_PUBLIC_SITE_URL=https://grooman.kr
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
```

---

## 폴더 구조

```
grooman/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   ├── (community)/
│   │   ├── hair/page.tsx
│   │   ├── skin/page.tsx
│   │   ├── shaving/page.tsx
│   │   ├── fragrance/page.tsx
│   │   ├── clinic/page.tsx
│   │   └── deals/page.tsx
│   ├── posts/
│   │   ├── [id]/page.tsx
│   │   └── write/page.tsx
│   ├── profile/[username]/page.tsx
│   ├── search/page.tsx
│   ├── tag/[tag]/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   └── crawl/page.tsx
│   ├── api/
│   │   ├── posts/route.ts
│   │   ├── upload/route.ts
│   │   ├── crawl/route.ts
│   │   └── og/route.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                     # shadcn/ui 컴포넌트
│   ├── posts/
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   └── PostDetail.tsx
│   ├── editor/
│   │   └── TiptapEditor.tsx
│   ├── comments/
│   │   ├── CommentList.tsx
│   │   └── CommentForm.tsx
│   ├── ads/
│   │   └── AdSenseUnit.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── crawlers/
│   │   └── rss.ts
│   ├── ai/
│   │   └── claude.ts
│   └── utils/
│       ├── slug.ts
│       ├── date.ts
│       └── seo.ts
├── hooks/
│   ├── useAuth.ts
│   └── usePosts.ts
├── types/
│   └── supabase.ts
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── vercel.json
├── .env.local
└── CLAUDE.md
```

---

## 데이터베이스 스키마 (완전한 SQL)

> `supabase/migrations/001_initial.sql`에 작성한다.

```sql
-- ============================================================
-- GROOMAN 초기 마이그레이션
-- ============================================================

-- 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ENUM 타입
CREATE TYPE category_enum AS ENUM (
  'hair', 'skin', 'shaving', 'fragrance', 'clinic', 'deals'
);

CREATE TYPE post_status_enum AS ENUM (
  'draft', 'published', 'hidden', 'deleted'
);

CREATE TYPE notification_type_enum AS ENUM (
  'comment', 'reply', 'like', 'mention', 'level_up', 'admin'
);

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text UNIQUE NOT NULL CHECK (char_length(username) BETWEEN 2 AND 20),
  avatar_url    text,
  bio           text CHECK (char_length(bio) <= 200),
  level         smallint NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  point         int NOT NULL DEFAULT 0,
  post_count    int NOT NULL DEFAULT 0,
  is_admin      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 회원가입 시 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- posts
-- ============================================================
CREATE TABLE posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category         category_enum NOT NULL,
  title            text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  content          jsonb NOT NULL DEFAULT '{}',
  content_text     text,
  slug             text UNIQUE NOT NULL,
  thumbnail_url    text,
  tags             text[] NOT NULL DEFAULT '{}',
  status           post_status_enum NOT NULL DEFAULT 'draft',
  view_count       int NOT NULL DEFAULT 0,
  like_count       int NOT NULL DEFAULT 0,
  comment_count    int NOT NULL DEFAULT 0,
  is_auto_crawled  boolean NOT NULL DEFAULT false,
  source_url       text,
  ai_summary       text,
  hot_rank         float8 GENERATED ALWAYS AS (
    log(GREATEST(view_count * 0.3 + like_count * 3.0 + comment_count * 2.0, 1)) +
    EXTRACT(EPOCH FROM created_at) / 45000.0
  ) STORED,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- post_count 트리거
CREATE OR REPLACE FUNCTION sync_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    UPDATE profiles SET post_count = post_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'published' AND NEW.status = 'published' THEN
      UPDATE profiles SET post_count = post_count + 1 WHERE id = NEW.user_id;
    ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
      UPDATE profiles SET post_count = GREATEST(post_count - 1, 0) WHERE id = NEW.user_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
    UPDATE profiles SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_post_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION sync_post_count();

-- 인덱스
CREATE INDEX idx_posts_category_status ON posts(category, status, created_at DESC);
CREATE INDEX idx_posts_hot_rank ON posts(hot_rank DESC) WHERE status = 'published';
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_content_text ON posts USING GIN(to_tsvector('simple', coalesce(content_text, '')));

-- ============================================================
-- comments
-- ============================================================
CREATE TABLE comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  parent_id   uuid REFERENCES comments(id) ON DELETE CASCADE,
  content     text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  like_count  int NOT NULL DEFAULT 0,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT max_depth CHECK (parent_id IS NULL OR (
    SELECT parent_id FROM comments c WHERE c.id = parent_id
  ) IS NULL)
);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- comment_count 트리거
CREATE OR REPLACE FUNCTION sync_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_comment_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION sync_comment_count();

-- ============================================================
-- post_likes
-- ============================================================
CREATE TABLE post_likes (
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE OR REPLACE FUNCTION sync_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    UPDATE profiles SET point = point + 5
      WHERE id = (SELECT user_id FROM posts WHERE id = NEW.post_id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_post_like_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION sync_post_like_count();

-- ============================================================
-- comment_likes
-- ============================================================
CREATE TABLE comment_likes (
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

CREATE OR REPLACE FUNCTION sync_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_comment_like_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION sync_comment_like_count();

-- ============================================================
-- bookmarks
-- ============================================================
CREATE TABLE bookmarks (
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- ============================================================
-- notifications
-- ============================================================
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type        notification_type_enum NOT NULL,
  post_id     uuid REFERENCES posts(id) ON DELETE CASCADE,
  comment_id  uuid REFERENCES comments(id) ON DELETE CASCADE,
  message     text,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- crawl_sources
-- ============================================================
CREATE TABLE crawl_sources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name     text NOT NULL,
  rss_url         text NOT NULL UNIQUE,
  category        category_enum NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  last_crawled_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 초기 크롤링 소스 데이터
INSERT INTO crawl_sources (source_name, rss_url, category) VALUES
  ('탈모 블로그 1', 'https://example-hair-blog.com/feed', 'hair'),
  ('스킨케어 블로그 1', 'https://example-skin-blog.com/feed', 'skin'),
  ('뽐뿌 그루밍', 'https://www.ppomppu.co.kr/rss.php?id=beauty', 'deals');

-- ============================================================
-- crawl_queue
-- ============================================================
CREATE TABLE crawl_queue (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id    uuid REFERENCES crawl_sources(id) ON DELETE CASCADE,
  source_url   text NOT NULL UNIQUE,
  url_hash     text NOT NULL UNIQUE,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','failed')),
  retry_count  int NOT NULL DEFAULT 0,
  error_msg    text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

-- ============================================================
-- reports
-- ============================================================
CREATE TABLE reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_type   text NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id     uuid NOT NULL,
  reason        text NOT NULL,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 회원 등급 자동 업그레이드 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION check_level_upgrade()
RETURNS TRIGGER AS $$
DECLARE
  days_since_join int;
  new_level smallint;
BEGIN
  days_since_join := EXTRACT(DAY FROM now() - (
    SELECT created_at FROM profiles WHERE id = NEW.id
  ));

  new_level := NEW.level;

  IF NEW.level < 5 THEN
    IF days_since_join >= 90 AND NEW.post_count >= 50 AND
       (SELECT COUNT(*) FROM post_likes pl JOIN posts p ON pl.post_id = p.id
        WHERE p.user_id = NEW.id) >= 100 THEN
      new_level := 4;
    ELSIF days_since_join >= 30 AND NEW.post_count >= 20 AND
       (SELECT COUNT(*) FROM post_likes pl JOIN posts p ON pl.post_id = p.id
        WHERE p.user_id = NEW.id) >= 30 THEN
      new_level := GREATEST(new_level, 3);
    ELSIF days_since_join >= 7 AND NEW.post_count >= 5 THEN
      new_level := GREATEST(new_level, 2);
    END IF;
  END IF;

  IF new_level > NEW.level THEN
    NEW.level := new_level;
    INSERT INTO notifications (user_id, type, message)
    VALUES (NEW.id, 'level_up', 'Lv.' || new_level || ' 으로 승급했습니다!');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_level_upgrade_trigger
  BEFORE UPDATE OF post_count, point ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_level_upgrade();

-- ============================================================
-- RLS 정책
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- posts: 비회원은 published만 조회
CREATE POLICY "posts_select_published" ON posts FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id OR
    (SELECT is_admin FROM profiles WHERE id = auth.uid()));
CREATE POLICY "posts_insert_auth" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON posts FOR UPDATE
  USING (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));
CREATE POLICY "posts_delete_own" ON posts FOR DELETE
  USING (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- comments
CREATE POLICY "comments_select_all" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own_or_admin" ON comments FOR DELETE
  USING (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- post_likes
CREATE POLICY "post_likes_select_all" ON post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_insert_auth" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete_own" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- comment_likes
CREATE POLICY "comment_likes_select_all" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert_auth" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete_own" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- bookmarks
CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert_auth" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- notifications
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- crawl_sources: 관리자만 수정
CREATE POLICY "crawl_sources_select_all" ON crawl_sources FOR SELECT USING (true);
CREATE POLICY "crawl_sources_admin" ON crawl_sources FOR ALL
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- reports
CREATE POLICY "reports_insert_auth" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_admin" ON reports FOR SELECT
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));
```

---

## API 엔드포인트 명세

### POST /api/upload
Cloudinary 이미지 업로드. 로그인 필수.
- Request: `multipart/form-data` { file }
- Response: `{ url: string, public_id: string }`
- 처리: WebP 변환, 1920px 리사이즈, CDN 캐시

### GET /api/crawl
Vercel Cron이 호출. `CRON_SECRET` 헤더 검증.
- Header: `x-cron-secret: {CRON_SECRET}`
- 처리: crawl_sources → RSS 파싱 → 중복 체크 → Claude Haiku AI 처리 → posts 저장
- Response: `{ processed: number, skipped: number, failed: number }`

### GET /api/og
OG 이미지 동적 생성. `next/og` (ImageResponse) 사용.
- Query: `?title={제목}&category={카테고리}`
- Response: PNG 이미지 (1200×630)

---

## 핵심 컴포넌트 명세

### Header (`components/layout/Header.tsx`)
- 로고 (grooman.kr 링크)
- 검색창 (submit 시 `/search?q=` 이동)
- 로그인 버튼 / 로그인 상태: 아바타 + 알림 뱃지
- 모바일: 햄버거 메뉴

### Sidebar (`components/layout/Sidebar.tsx`)
- 카테고리 목록 (아이콘 포함, 현재 카테고리 하이라이트)
- 인기글 위젯: 24시간 hot_rank 상위 5개
- 데스크탑만 표시. 모바일은 하단 탭바로 대체

### PostCard (`components/posts/PostCard.tsx`)
Props: `post: Post`
표시 요소:
- 썸네일 이미지 (없으면 카테고리 기본 이미지)
- 카테고리 뱃지 + 크롤링 표시 (`[자동수집]`)
- 제목 (2줄 말줄임)
- ai_summary (있으면 표시, 3줄)
- 작성자 아바타 + 닉네임 + 등급 뱃지
- 날짜 (상대 시간: "3시간 전")
- 조회수 · 추천수 · 댓글수

### TiptapEditor (`components/editor/TiptapEditor.tsx`)
확장: StarterKit, Image, Link, Youtube, Mention
- 이미지 첨부: 클릭 시 `/api/upload` 호출 후 URL 삽입
- 임시저장: 5분마다 localStorage 자동 저장
- `onChange`: Tiptap JSON 반환

### CommentList (`components/comments/CommentList.tsx`)
- 댓글 + 대댓글 2depth 표시
- 비추천 5개 이상 시 자동 접힘 (`[댓글이 숨겨졌습니다]`)
- 멘션 파싱: `@username` 클릭 시 프로필로 이동
- Supabase Realtime 구독으로 실시간 업데이트

---

## 자동수급 파이프라인

### `/api/crawl` 처리 흐름

```
1. CRON_SECRET 헤더 검증
2. crawl_sources WHERE is_active=true 조회
3. 각 소스 RSS XML fetch
4. 각 아이템:
   a. source_url MD5 해시 → crawl_queue 중복 체크
   b. 제목 유사도 pg_trgm > 0.8 → skip
   c. 단어 수 200 미만 → skip
   d. Claude Haiku API 호출:
      - 카테고리 분류
      - 3줄 한국어 요약
      - 태그 5개 추출
      - 스팸 점수 (0~1)
   e. 스팸 점수 >= 0.7 → skip
   f. posts INSERT (status=published, is_auto_crawled=true)
5. crawl_sources.last_crawled_at 업데이트
```

### Claude Haiku 프롬프트 템플릿

```
다음 그루밍 관련 글을 분석하고 JSON으로만 응답하세요:

제목: {title}
내용: {content}

응답 형식:
{
  "category": "hair|skin|shaving|fragrance|deals",
  "summary": "3줄 한국어 요약",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "spam_score": 0.0~1.0,
  "is_advertisement": true|false
}
```

### vercel.json

```json
{
  "crons": [
    {
      "path": "/api/crawl",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## SEO 패턴

### generateMetadata 템플릿

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // post 데이터 조회
  return {
    title: `${post.title} | 그루맨`,
    description: post.ai_summary ?? post.content_text?.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.ai_summary ?? '',
      images: [`${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(post.title)}`],
      type: 'article',
    },
  };
}
```

### JSON-LD (게시글 상세)

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  datePublished: post.created_at,
  dateModified: post.updated_at,
  author: { '@type': 'Person', name: post.profiles?.username },
  publisher: { '@type': 'Organization', name: '그루맨' },
};
```

---

## 빌드 체크리스트

> Claude Code는 세션 시작 시 이 목록을 확인하고 미완료 항목부터 순서대로 진행한다.
> 완료 시 `[ ]` → `[x]` 로 업데이트할 것.

### Phase 1 — 기반 구축

- [ ] `npx create-next-app@14 . --typescript --tailwind --app` 실행
- [ ] `shadcn/ui` 초기화 및 기본 컴포넌트 설치
- [ ] `lib/supabase/client.ts`, `server.ts`, `admin.ts` 작성
- [ ] `supabase/migrations/001_initial.sql` 작성 (위 스키마 전체)
- [ ] `components/layout/Header.tsx` 작성
- [ ] `components/layout/Sidebar.tsx` 작성
- [ ] `components/layout/Footer.tsx` 작성
- [ ] `app/layout.tsx` 작성 (Header + Sidebar + Footer 통합)
- [ ] 카카오 OAuth 로그인 구현 (`app/(auth)/login/page.tsx`, `app/(auth)/callback/route.ts`)
- [ ] `hooks/useAuth.ts` 작성
- [ ] `/hair`, `/skin`, `/shaving`, `/fragrance`, `/clinic`, `/deals` 카테고리 목록 페이지 구현
- [ ] `components/posts/PostCard.tsx` 작성
- [ ] `components/posts/PostList.tsx` 작성 (무한스크롤 포함)
- [ ] `vercel.json` 작성 (Cron Jobs 설정)
- [ ] `app/robots.ts` 작성

### Phase 2 — 핵심 기능

- [ ] `components/editor/TiptapEditor.tsx` 작성 (StarterKit + Image + Link + Youtube + Mention)
- [ ] `app/api/upload/route.ts` 작성 (Cloudinary 연동)
- [ ] `app/posts/write/page.tsx` 작성 (게시글 작성)
- [ ] `app/posts/[id]/page.tsx` 작성 (게시글 상세 + JSON-LD)
- [ ] 게시글 Server Actions (`app/posts/actions.ts`) — create, update, delete
- [ ] `components/comments/CommentList.tsx` 작성 (2depth + 실시간)
- [ ] `components/comments/CommentForm.tsx` 작성
- [ ] 댓글 Server Actions — create, delete
- [ ] 추천(좋아요) 기능 — 낙관적 업데이트 포함
- [ ] 북마크 기능
- [ ] 검색 페이지 (`app/search/page.tsx`) — PostgreSQL FTS
- [ ] 태그 페이지 (`app/tag/[tag]/page.tsx`)

### Phase 3 — 자동수급 + SEO

- [ ] `lib/crawlers/rss.ts` 작성 (RSS XML 파싱)
- [ ] `lib/ai/claude.ts` 작성 (Haiku API 연동 — 요약·태그·스팸 분류)
- [ ] `app/api/crawl/route.ts` 작성 (CRON_SECRET 검증 + 파이프라인)
- [ ] `app/admin/page.tsx` 작성 (is_admin 접근 제한)
- [ ] `app/admin/crawl/page.tsx` 작성 (크롤링 현황 + 소스 관리)
- [ ] 모든 페이지 `generateMetadata` 적용
- [ ] `app/sitemap.ts` 작성 (동적 사이트맵)
- [ ] `app/api/og/route.ts` 작성 (동적 OG 이미지 — next/og)
- [ ] `app/profile/[username]/page.tsx` 작성

### Phase 4 — 마무리

- [ ] 모바일 하단 탭바 (`components/layout/BottomNav.tsx`) — 375px 기준
- [ ] Supabase Realtime 알림 구독 (`hooks/useNotifications.ts`)
- [ ] 알림 센터 UI (헤더 뱃지 + 드롭다운)
- [ ] 인기글 위젯 (사이드바 — hot_rank 24시간 상위 5개)
- [ ] `public/manifest.json` 작성 (PWA)
- [ ] `public/sw.js` 작성 (Service Worker 기본)
- [ ] 개인정보처리방침 페이지 (`app/privacy/page.tsx`)
- [ ] 이용약관 페이지 (`app/terms/page.tsx`)
- [ ] `components/ads/AdSenseUnit.tsx` 작성 (Google AdSense 슬롯)
- [ ] 구글 서치콘솔 소유권 확인 메타태그 삽입
- [ ] 전 페이지 Lighthouse 90+ 확인 및 최적화

### 완료 기준

- 모든 체크리스트 `[x]` 완료
- `npm run build` 에러 없음
- Lighthouse SEO 90+, Performance 80+
- 모바일 375px 레이아웃 깨짐 없음
- 비회원으로 draft 게시글 접근 불가 (RLS 확인)
- 크롤링 1회 실행 성공 (posts 테이블에 is_auto_crawled=true 게시글 생성)

---

*GROOMAN CLAUDE.md v1.0 | 이 파일을 수정할 때는 체크리스트도 함께 업데이트할 것*
