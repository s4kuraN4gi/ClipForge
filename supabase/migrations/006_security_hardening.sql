-- セキュリティ強化マイグレーション
-- S-16: subscriptions RLS を FOR SELECT のみに制限（プラン改竄防止）
-- S-6: SECURITY DEFINER 関数に search_path を設定

-- === S-16: subscriptions テーブルの RLS ポリシー修正 ===
-- 既存の FOR ALL ポリシーを削除
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;

-- SELECT のみ許可（INSERT/UPDATE/DELETE は service_role のみ）
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- === S-6: SECURITY DEFINER 関数に search_path 設定 ===
CREATE OR REPLACE FUNCTION increment_video_count(target_user_id UUID)
RETURNS VOID AS $$
  UPDATE public.subscriptions
  SET monthly_video_count = monthly_video_count + 1, updated_at = now()
  WHERE user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER
SET search_path = public;

CREATE OR REPLACE FUNCTION decrement_video_count(target_user_id UUID)
RETURNS VOID AS $$
  UPDATE public.subscriptions
  SET monthly_video_count = GREATEST(monthly_video_count - 1, 0), updated_at = now()
  WHERE user_id = target_user_id;
$$ LANGUAGE sql SECURITY DEFINER
SET search_path = public;
