-- S-11: Webhookべき等性チェック用テーブル
-- S-13: 動画生成カウントのアトミック操作用関数

-- === S-11: Webhook イベント重複処理防止 ===
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- 古いイベントの自動削除（30日以上前）
CREATE INDEX idx_webhook_events_processed_at
  ON processed_webhook_events(processed_at);

-- === S-13: アトミックな動画生成カウント関数 ===
-- チェックとインクリメントを1つのトランザクションで実行（レースコンディション防止）
CREATE OR REPLACE FUNCTION try_increment_video_count(
  target_user_id UUID,
  max_count INT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INT;
BEGIN
  -- 行ロックを取得してカウントを確認
  SELECT monthly_video_count INTO current_count
  FROM public.subscriptions
  WHERE user_id = target_user_id
  FOR UPDATE;

  IF current_count IS NULL THEN
    RETURN false;
  END IF;

  -- max_count が 0 以下の場合は無制限（proプラン等）
  IF max_count > 0 AND current_count >= max_count THEN
    RETURN false;
  END IF;

  UPDATE public.subscriptions
  SET monthly_video_count = monthly_video_count + 1, updated_at = now()
  WHERE user_id = target_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
