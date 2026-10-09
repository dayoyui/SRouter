import type { ProviderMetadata } from "./types.js";

export const ANTIGRAVITY_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
export const ANTIGRAVITY_IDE_BASE_URL = "https://daily-cloudcode-pa.googleapis.com";

export const ANTIGRAVITY_OAUTH_CLIENT_ID =
    "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
export const ANTIGRAVITY_OAUTH_CLIENT_SECRET = "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";
export const ANTIGRAVITY_OAUTH_REDIRECT_URI = "http://localhost:1455/auth/antigravity/callback";
export const ANTIGRAVITY_OAUTH_SCOPE =
    "openid profile email https://www.googleapis.com/auth/cloud-platform";
export const ANTIGRAVITY_OAUTH_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const ANTIGRAVITY_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const ANTIGRAVITY_OAUTH_PROMPT = "consent";

export const ANTIGRAVITY_PROVIDER: ProviderMetadata = {
    id: "antigravity",
    name: "Google Antigravity",
    category: "oauth",
    protocol: "openai",
    base_url: ANTIGRAVITY_IDE_BASE_URL,
    web_url: "https://ai.google.dev",
    requires_api_key: false,
    requires_oauth: true,
    status_message: "Antigravity OAuth token missing"
};
