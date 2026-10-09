import { BAI_BASE_URL } from "@srouter/constants";
import { OpenAIExecutor, type OpenAIExecutorOptions } from "./openai.js";

export interface BAIExecutorOptions extends OpenAIExecutorOptions {}

export class BAIExecutor extends OpenAIExecutor {
    constructor(options: BAIExecutorOptions = {}) {
        super({
            id: options.id ?? "bai",
            name: options.name ?? "B.AI",
            baseUrl: options.baseUrl ?? BAI_BASE_URL,
            apiKey: options.apiKey,
            accessToken: options.accessToken
        });
    }
}
