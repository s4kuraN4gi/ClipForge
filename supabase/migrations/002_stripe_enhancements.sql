-- Stripe 連携強化マイグレーション
-- Supabase ダッシュボードの SQL Editor で実行してください

-- サブスクリプションにキャンセル予定フラグ追加
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- 生成失敗時のカウント調整済みフラグ
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS count_adjusted BOOLEAN DEFAULT false;

-- アトミックなカウント操作用 RPC 関数
CREATE OR REPLACE FUNCTION increment_video_count(target_user_id UUID)
RETURNS VOID AS $$
  UPDATE subscriptions
  SET monthly_video_count = monthly_video_count + 1, updated_at = now()
  WHERE user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_video_count(target_user_id UUID)
RETURNS VOID AS $$
  UPDATE subscriptions
  SET monthly_video_count = GREATEST(monthly_video_count - 1, 0), updated_at = now()
  WHERE user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Stripe 顧客ID での検索用ユニークインデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_sub_stripe_cust
  ON subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Stripe サブスクリプションID での検索用インデックス
CREATE INDEX IF NOT EXISTS idx_sub_stripe_sub
  ON subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
