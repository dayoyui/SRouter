import type { ProviderMetadata } from "./types.js";

export const OPENCODE_ZEN_BASE_URL = "https://opencode.ai/zen/v1";

export const OPENCODE_ZEN_PROVIDER: ProviderMetadata = {
    id: "opencode_zen",
    name: "OpenCode Zen",
    category: "free_tier",
    protocol: "openai",
    alias: "zen",
    base_url: OPENCODE_ZEN_BASE_URL,
    web_url: "https://opencode.ai/zen",
    requires_api_key: false,
    requires_oauth: false,
    supports_custom_url: true,
    status_message: "Free Tier Ready (Unlimited)"
};
