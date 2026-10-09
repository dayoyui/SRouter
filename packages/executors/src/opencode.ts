import { OPENCODE_ZEN_BASE_URL } from "@srouter/constants";
import { OpenAIExecutor, type OpenAIExecutorOptions } from "./openai.js";

export interface OpenCodeZenExecutorOptions extends OpenAIExecutorOptions {}

export class OpenCodeZenExecutor extends OpenAIExecutor {
    constructor(options: OpenCodeZenExecutorOptions = {}) {
        super({
            id: options.id ?? "opencode_zen",
            name: options.name ?? "OpenCode Zen (Free)",
            baseUrl: options.baseUrl ?? OPENCODE_ZEN_BASE_URL,
            apiKey: options.apiKey ?? "",
            accessToken: options.accessToken ?? ""
        });
    }
}
