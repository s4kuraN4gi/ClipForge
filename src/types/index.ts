export type TemplateType = "showcase" | "before_after" | "rotation";

export type ProjectStatus = "draft" | "generating" | "completed" | "failed";

export type VideoStatus = "pending" | "processing" | "completed" | "failed";

export type PlanType = "free" | "basic" | "pro";

export interface Project {
  id: string;
  user_id: string;
  title: string | null;
  template: TemplateType;
  status: ProjectStatus;
  product_name: string | null;
  product_price: string | null;
  catchphrase: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface GeneratedVideo {
  id: string;
  project_id: string;
  task_id: string | null;
  storage_path: string | null;
  video_url: string | null;
  duration_seconds: number | null;
  resolution: string;
  aspect_ratio: string;
  status: VideoStatus;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanType;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  monthly_video_count: number;
  cancel_at_period_end?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: TemplateType;
  name: string;
  description: string;
  icon: string;
  prompt: string;
}

export interface PricingPlan {
  id: PlanType;
  name: string;
  price: number;
  priceLabel: string;
  features: string[];
  videoLimit: number | null;
  highlighted?: boolean;
}
