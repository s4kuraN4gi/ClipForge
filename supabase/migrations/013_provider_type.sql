-- 013: generated_videos に provider_type カラムを追加
-- プラン別プロバイダー選択に対応（wavespeed / kling）

ALTER TABLE generated_videos
  ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'wavespeed';
