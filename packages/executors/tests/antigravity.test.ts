import assert from "node:assert/strict";
import { test } from "node:test";
import { AntigravityExecutor } from "../src/antigravity.js";

test("AntigravityExecutor initializes with default options", () => {
    const executor = new AntigravityExecutor();
    assert.equal(executor.id, "antigravity");
    assert.equal(executor.category, "oauth");
    assert.equal(executor.protocol, "openai");
});

test("AntigravityExecutor returns no static catalog with accessToken (catalog lives in DB)", async () => {
    const executor = new AntigravityExecutor({
        accessToken: "ya29.test_token"
    });
    const models = await executor.listModels();
    assert.equal(models.length, 0);
});

test("AntigravityExecutor accepts Google One AI credits options", () => {
    const executor = new AntigravityExecutor({
        accessToken: "ya29.test_token",
        enabledCreditTypes: ["GOOGLE_ONE_AI"],
        creditsMode: "always"
    });
    assert.equal(executor.getRemainingCredits(), undefined);
});
