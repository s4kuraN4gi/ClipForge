import type {
  VideoGenerateResponse,
  VideoTaskStatus,
  VideoGenerationParams,
  VideoProvider,
} from "./types";
import { SeedanceProvider } from "./providers/seedance";
import { WaveSpeedProvider } from "./providers/wavespeed";
import { MockProvider } from "./providers/mock";

export type { VideoGenerateResponse, VideoTaskStatus, VideoGenerationParams };

type ProviderType =
  | "seedance"
  | "wavespeed"
  | "wavespeed-fast"
  | "mock";

const VALID_PROVIDERS: ProviderType[] = [
  "seedance",
  "wavespeed",
  "wavespeed-fast",
  "mock",
];

function resolveProviderType(): ProviderType {
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

let _provider: VideoProvider | null = null;

function getProvider(): VideoProvider {
  if (_provider) return _provider;

  const type = resolveProviderType();

  switch (type) {
    case "seedance":
      _provider = new SeedanceProvider();
      break;
    case "wavespeed":
      _provider = new WaveSpeedProvider("wan-720p");
      break;
    case "wavespeed-fast":
      _provider = new WaveSpeedProvider("wan-720p-fast");
      break;
    case "mock":
      _provider = new MockProvider();
      break;
  }

  console.log(`[video-provider] Using provider: ${type}`);
  return _provider!;
}

export async function createVideoGeneration(
  params: VideoGenerationParams
): Promise<VideoGenerateResponse> {
  return getProvider().createGeneration(params);
}

export async function getTaskStatus(
  taskId: string
): Promise<VideoTaskStatus> {
  return getProvider().getStatus(taskId);
}

export function getVideoAllowedHosts(): string[] {
  return getProvider().allowedVideoHosts;
}
