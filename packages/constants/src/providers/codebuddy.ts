import type { ProviderMetadata } from "./types.js";

export const CODEBUDDY_BASE_URL = "https://www.codebuddy.ai/v2/chat/completions";
export const CODEBUDDY_AUTH_BASE = "https://www.codebuddy.ai";
export const CODEBUDDY_AUTH_STATE_URL = "https://www.codebuddy.ai/v2/plugin/auth/state";
export const CODEBUDDY_AUTH_TOKEN_URL = "https://www.codebuddy.ai/v2/plugin/auth/token";
export const CODEBUDDY_AUTH_REFRESH_URL = "https://www.codebuddy.ai/v2/plugin/auth/token/refresh";
export const CODEBUDDY_CN_BASE_URL = "https://copilot.tencent.com/v2/chat/completions";
export const CODEBUDDY_CN_AUTH_BASE = "https://copilot.tencent.com";
export const CODEBUDDY_CN_AUTH_STATE_URL = "https://copilot.tencent.com/v2/plugin/auth/state";
export const CODEBUDDY_CN_AUTH_TOKEN_URL = "https://copilot.tencent.com/v2/plugin/auth/token";
export const CODEBUDDY_CN_AUTH_REFRESH_URL =
    "https://copilot.tencent.com/v2/plugin/auth/token/refresh";
export const CODEBUDDY_CN_ORIGIN = "https://www.codebuddy.cn";
export const CODEBUDDY_CN_DOMAIN = "www.codebuddy.cn";
export const CODEBUDDY_CN_USER_AGENT = "CLI/2.96.0 CodeBuddy/2.96.0";
export const CODEBUDDY_AUTH_USER_AGENT = "IDE/2.63.2 CodeBuddy/2.63.2";
export const CODEBUDDY_AUTH_PLATFORM = "ide";

export const CODEBUDDY_PROVIDER: ProviderMetadata = {
    id: "codebuddy",
    name: "CodeBuddy",
    category: "oauth",
    protocol: "openai",
    alias: "codebuddy",
    base_url: CODEBUDDY_BASE_URL,
    web_url: "https://www.codebuddy.ai",
    requires_api_key: false,
    requires_oauth: true,
    supports_custom_url: true,
    status_message: "CodeBuddy OAuth token missing"
};

export const CODEBUDDY_CN_PROVIDER: ProviderMetadata = {
    id: "codebuddy-cn",
    name: "CodeBuddy CN",
    category: "oauth",
    protocol: "openai",
    alias: "codebuddy-cn",
    base_url: CODEBUDDY_CN_BASE_URL,
    web_url: "https://www.codebuddy.cn",
    requires_api_key: false,
    requires_oauth: true,
    supports_custom_url: true,
    status_message: "CodeBuddy CN OAuth token missing"
};
