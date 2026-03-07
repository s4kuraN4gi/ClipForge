-- 011: ハイブリッド型料金モデル（月額+従量課金）
-- starter/business → pro に統合

-- plan制約変更
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
UPDATE subscriptions SET plan = 'pro' WHERE plan IN ('starter', 'business');
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'pro'));

-- metered billing 用カラム
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_metered_item_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS extra_video_count INT DEFAULT 0;

-- メーター用インクリメント（新カウントを返す）
CREATE OR REPLACE FUNCTION increment_video_count_metered(target_user_id UUID)
RETURNS INT AS $$
DECLARE new_count INT;
BEGIN
  UPDATE subscriptions SET monthly_video_count = monthly_video_count + 1, updated_at = now()
  WHERE user_id = target_user_id RETURNING monthly_video_count INTO new_count;
  RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 追加動画カウント インクリメント
CREATE OR REPLACE FUNCTION increment_extra_video_count(target_user_id UUID)
RETURNS VOID AS $$
  UPDATE subscriptions SET extra_video_count = extra_video_count + 1, updated_at = now()
  WHERE user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 追加動画カウント デクリメント
CREATE OR REPLACE FUNCTION decrement_extra_video_count(target_user_id UUID)
RETURNS VOID AS $$
  UPDATE subscriptions SET extra_video_count = GREATEST(extra_video_count - 1, 0), updated_at = now()
  WHERE user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
