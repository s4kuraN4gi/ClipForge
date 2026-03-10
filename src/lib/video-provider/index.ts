import type {
  VideoGenerateResponse,
  VideoTaskStatus,
  VideoGenerationParams,
  VideoProvider,
} from "./types";
import { SeedanceProvider } from "./providers/seedance";
import { WaveSpeedProvider } from "./providers/wavespeed";
import { KlingProvider } from "./providers/kling";
import { MockProvider } from "./providers/mock";

export type { VideoGenerateResponse, VideoTaskStatus, VideoGenerationParams };

export type ProviderType =
  | "seedance"
  | "wavespeed"
  | "wavespeed-fast"
  | "kling"
  | "mock";

const VALID_PROVIDERS: ProviderType[] = [
  "seedance",
  "wavespeed",
  "wavespeed-fast",
  "kling",
  "mock",
];

function resolveDefaultProviderType(): ProviderType {
  const explicit = process.env.VIDEO_PROVIDER as ProviderType | undefined;
  if (explicit && VALID_PROVIDERS.includes(explicit)) {
    return explicit;
  }

  // 後方互換: VIDEO_PROVIDER 未設定時は既存の挙動を維持
  if (process.env.SEEDANCE_USE_MOCK === "true") return "mock";
  if (!process.env.BYTEPLUS_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "VIDEO_PROVIDER または BYTEPLUS_API_KEY が未設定です。本番環境ではプロバイダーの設定が必須です。"
      );
    }
    return "mock";
  }
  return "seedance";
}

/**
 * プラン別プロバイダー選択
 * Free → WaveSpeed (Wan 2.6 Flash)
 * Pro  → Kling 3.0 (Replicate経由)
 */
export function getProviderTypeForPlan(plan: "free" | "pro"): ProviderType {
  if (plan === "pro" && process.env.REPLICATE_API_TOKEN) {
    return "kling";
  }
  return "wavespeed";
}

const _providers = new Map<ProviderType, VideoProvider>();

function getProvider(type?: ProviderType): VideoProvider {
  const resolvedType = type || resolveDefaultProviderType();

  const cached = _providers.get(resolvedType);
  if (cached) return cached;

  let provider: VideoProvider;

  switch (resolvedType) {
    case "seedance":
      provider = new SeedanceProvider();
      break;
    case "wavespeed":
      provider = new WaveSpeedProvider("wan-2.6-flash");
      break;
    case "wavespeed-fast":
      provider = new WaveSpeedProvider("wan-720p-fast");
      break;
    case "kling":
      provider = new KlingProvider();
      break;
    case "mock":
      provider = new MockProvider();
      break;
  }

  _providers.set(resolvedType, provider);
  console.log(`[video-provider] Using provider: ${resolvedType}`);
  return provider;
}

export async function createVideoGeneration(
  params: VideoGenerationParams,
  providerType?: ProviderType,
): Promise<VideoGenerateResponse> {
  return getProvider(providerType).createGeneration(params);
}

export async function getTaskStatus(
  taskId: string,
  providerType?: ProviderType,
): Promise<VideoTaskStatus> {
  return getProvider(providerType).getStatus(taskId);
}

export function getVideoAllowedHosts(providerType?: ProviderType): string[] {
  return getProvider(providerType).allowedVideoHosts;
}
