-- ============================================================
-- GROOMAN 초기 마이그레이션 v1.0
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

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'user_' || substr(NEW.id::text, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
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
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  hot_rank         float8 NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION update_hot_rank()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hot_rank := log(GREATEST(NEW.view_count * 0.3 + NEW.like_count * 3.0 + NEW.comment_count * 2.0, 1)) +
                  EXTRACT(EPOCH FROM NEW.created_at) / 45000.0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_hot_rank
  BEFORE INSERT OR UPDATE OF view_count, like_count, comment_count ON posts
  FOR EACH ROW EXECUTE FUNCTION update_hot_rank();

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

CREATE OR REPLACE FUNCTION sync_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    UPDATE profiles SET post_count = post_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status <> 'published' AND NEW.status = 'published' THEN
      UPDATE profiles SET post_count = post_count + 1 WHERE id = NEW.user_id;
    ELSIF OLD.status = 'published' AND NEW.status <> 'published' THEN
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

CREATE INDEX idx_posts_category_status ON posts(category, status, created_at DESC);
CREATE INDEX idx_posts_hot_rank ON posts(hot_rank DESC) WHERE status = 'published';
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_fts ON posts USING GIN(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content_text,'')));
CREATE INDEX idx_posts_slug ON posts(slug);

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
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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

CREATE INDEX idx_comments_post ON comments(post_id, created_at);
CREATE INDEX idx_comments_parent ON comments(parent_id);

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

INSERT INTO crawl_sources (source_name, rss_url, category) VALUES
  ('탈모 블로그 예시', 'https://example-hair.com/feed.xml', 'hair'),
  ('스킨케어 블로그 예시', 'https://example-skin.com/feed.xml', 'skin'),
  ('뽐뿌 뷰티', 'https://www.ppomppu.co.kr/rss.php?id=beauty', 'deals');

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
  received_likes  int;
  new_level       smallint;
BEGIN
  SELECT EXTRACT(DAY FROM now() - created_at)::int INTO days_since_join
  FROM profiles WHERE id = NEW.id;

  SELECT COUNT(*) INTO received_likes
  FROM post_likes pl
  JOIN posts p ON pl.post_id = p.id
  WHERE p.user_id = NEW.id;

  new_level := NEW.level;

  IF NEW.level < 4 THEN
    IF days_since_join >= 90 AND NEW.post_count >= 50 AND received_likes >= 100 THEN
      new_level := 4;
    ELSIF days_since_join >= 30 AND NEW.post_count >= 20 AND received_likes >= 30 THEN
      new_level := GREATEST(new_level, 3);
    ELSIF days_since_join >= 7 AND NEW.post_count >= 5 THEN
      new_level := GREATEST(new_level, 2);
    END IF;
  END IF;

  IF new_level > NEW.level THEN
    NEW.level := new_level;
    INSERT INTO notifications (user_id, type, message)
    VALUES (NEW.id, 'level_up', 'Lv.' || new_level || '으로 승급했습니다!');
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

-- posts
CREATE POLICY "posts_select" ON posts FOR SELECT
  USING (status = 'published'
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin));
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE
  USING (auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin));
CREATE POLICY "posts_delete" ON posts FOR DELETE
  USING (auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin));

-- comments
CREATE POLICY "comments_select_all" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE
  USING (auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin));

-- post_likes
CREATE POLICY "post_likes_select_all" ON post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_insert" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- comment_likes
CREATE POLICY "comment_likes_select_all" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- bookmarks
CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- notifications
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- crawl_sources
CREATE POLICY "crawl_sources_select_all" ON crawl_sources FOR SELECT USING (true);
CREATE POLICY "crawl_sources_admin" ON crawl_sources FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin));

-- crawl_queue
CREATE POLICY "crawl_queue_admin" ON crawl_queue FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin));

-- reports
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_admin" ON reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin));
