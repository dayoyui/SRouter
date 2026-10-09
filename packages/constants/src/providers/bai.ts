import type { ProviderMetadata } from "./types.js";

export const BAI_BASE_URL = "https://api.b.ai/v1";

export const BAI_PROVIDER: ProviderMetadata = {
    id: "bai",
    name: "B.AI",
    category: "free_tier",
    protocol: "openai",
    alias: "bai",
    base_url: BAI_BASE_URL,
    web_url: "https://b.ai",
    requires_api_key: true,
    supports_custom_url: true,
    status_message: "B.AI API key missing"
};
