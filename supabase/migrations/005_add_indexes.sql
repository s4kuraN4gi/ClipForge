-- パフォーマンス向上のためのインデックス追加

-- generated_videos.status: ステータスでのフィルタリングクエリを高速化
CREATE INDEX IF NOT EXISTS idx_generated_videos_status
  ON generated_videos (status);

-- generated_videos.task_id: タスクIDでの検索を高速化（ポーリング時に使用）
CREATE INDEX IF NOT EXISTS idx_generated_videos_task_id
  ON generated_videos (task_id);

-- projects.user_id: ユーザーごとのプロジェクト検索を高速化
CREATE INDEX IF NOT EXISTS idx_projects_user_id
  ON projects (user_id);
