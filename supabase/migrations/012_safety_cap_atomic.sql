-- 012: Safety cap レースコンディション修正 + metered_report_pending カラム追加

-- Pro 用アトミックインクリメント（safety cap 付き）
CREATE OR REPLACE FUNCTION try_increment_video_count_pro(
  target_user_id UUID,
  safety_cap INT
) RETURNS BOOLEAN AS $$
DECLARE success BOOLEAN;
BEGIN
  UPDATE subscriptions
  SET monthly_video_count = monthly_video_count + 1, updated_at = now()
  WHERE user_id = target_user_id
    AND monthly_video_count < safety_cap
  RETURNING TRUE INTO success;
  RETURN COALESCE(success, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- メーター使用量報告の未報告フラグ用カラム
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS metered_report_pending INT DEFAULT 0;

-- 未報告分インクリメント
CREATE OR REPLACE FUNCTION increment_metered_pending(target_user_id UUID)
RETURNS VOID AS $$
  UPDATE subscriptions SET metered_report_pending = metered_report_pending + 1, updated_at = now()
  WHERE user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 未報告分クリア
CREATE OR REPLACE FUNCTION clear_metered_pending(target_user_id UUID)
RETURNS VOID AS $$
  UPDATE subscriptions SET metered_report_pending = 0, updated_at = now()
  WHERE user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
