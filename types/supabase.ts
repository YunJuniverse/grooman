export type CategoryEnum = 'hair' | 'skin' | 'shaving' | 'fragrance' | 'clinic' | 'deals'
export type PostStatusEnum = 'draft' | 'published' | 'hidden' | 'deleted'
export type NotificationTypeEnum = 'comment' | 'reply' | 'like' | 'mention' | 'level_up' | 'admin'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  level: number
  point: number
  post_count: number
  is_admin: boolean
  created_at: string
}

export interface Post {
  id: string
  user_id: string | null
  category: CategoryEnum
  title: string
  content: Record<string, unknown>
  content_text: string | null
  slug: string
  thumbnail_url: string | null
  tags: string[]
  status: PostStatusEnum
  view_count: number
  like_count: number
  comment_count: number
  is_auto_crawled: boolean
  source_url: string | null
  ai_summary: string | null
  hot_rank: number | null
  created_at: string
  updated_at: string
  profiles?: Profile | null
}

export interface Comment {
  id: string
  post_id: string
  user_id: string | null
  parent_id: string | null
  content: string
  like_count: number
  is_deleted: boolean
  created_at: string
  updated_at: string
  profiles?: Profile | null
  replies?: Comment[]
}

export interface PostLike {
  user_id: string
  post_id: string
  created_at: string
}

export interface Bookmark {
  user_id: string
  post_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string | null
  type: NotificationTypeEnum
  post_id: string | null
  comment_id: string | null
  message: string | null
  is_read: boolean
  created_at: string
  profiles?: Profile | null
}

export interface CrawlSource {
  id: string
  source_name: string
  rss_url: string
  category: CategoryEnum
  is_active: boolean
  last_crawled_at: string | null
  created_at: string
}

export interface CrawlQueue {
  id: string
  source_id: string | null
  source_url: string
  url_hash: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  retry_count: number
  error_msg: string | null
  created_at: string
  processed_at: string | null
}

export interface Ad {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link_url: string
  badge: string | null
  placement: 'sidebar' | 'feed' | 'banner'
  is_active: boolean
  order_num: number
  click_count: number
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string | null
  target_type: 'post' | 'comment'
  target_id: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
}

// supabase-js가 기대하는 Database 타입 구조
type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<Profile>
      posts: TableDef<Post>
      comments: TableDef<Comment>
      post_likes: TableDef<PostLike>
      comment_likes: TableDef<{ user_id: string; comment_id: string; created_at: string }>
      bookmarks: TableDef<Bookmark>
      notifications: TableDef<Notification>
      crawl_sources: TableDef<CrawlSource>
      crawl_queue: TableDef<CrawlQueue>
      reports: TableDef<Report>
      ads: TableDef<Ad>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      category_enum: CategoryEnum
      post_status_enum: PostStatusEnum
      notification_type_enum: NotificationTypeEnum
    }
  }
}
