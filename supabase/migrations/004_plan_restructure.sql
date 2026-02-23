-- 料金プラン再設計マイグレーション
-- basic → starter, pro → business に名称変更

-- 1. 先に CHECK 制約を削除（旧制約が UPDATE をブロックするため）
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- 2. 既存データのプラン名を更新
UPDATE subscriptions SET plan = 'starter' WHERE plan = 'basic';
UPDATE subscriptions SET plan = 'business' WHERE plan = 'pro';

-- 3. 新しい CHECK 制約を追加
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'starter', 'business'));
