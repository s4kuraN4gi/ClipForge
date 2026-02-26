-- C-1: processed_webhook_events テーブルに RLS を有効化
-- サービスロールのみがアクセスすべきテーブル（ユーザー向けポリシーは不要）
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- H-2: 30日以上前の古いイベントを自動削除する関数
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM processed_webhook_events
  WHERE processed_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
