/**
 * Regression: a custom provider added via POST /v1/providers must surface as
 * exactly ONE entry in the provider's "Active Credentials" list — i.e.
 * GetProviderById returns it in `connections`, enabled, with the stored
 * credential, and the registry exposes one executor under the custom alias.
 */
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { deleteProviderDB, getAllProvidersDB } from "@srouter/db";
import { ProvidersLogic } from "../src/logic/providers.logic.js";
import { loadSavedProvidersFromDB, registry } from "../src/services/registry.js";

const createdIds: string[] = [];

afterEach(async () => {
    for (const id of createdIds.splice(0)) {
        await deleteProviderDB(id);
    }
    await loadSavedProvidersFromDB();
});

async function addCustomProvider() {
    const result = await ProvidersLogic.AddProvider({
        name: "activecred",
        category: "custom_provider",
        protocol: "openai",
        base_url: "https://example.com/v1",
        api_key: "sk-active-cred-key"
    });
    createdIds.push(result.id);
    return result;
}

test("custom provider appears once in Active Credentials list", async () => {
    const created = await addCustomProvider();

    const detail = await ProvidersLogic.GetProviderById(created.id);
    assert.ok(detail, "custom provider must resolve by its UUID");

    const connections = detail.connections ?? [];
    assert.equal(connections.length, 1, "exactly one connection in Active Credentials");
    assert.equal(connections[0]?.id, created.id);
    assert.equal(connections[0]?.enabled, true, "connection must be enabled");
    assert.equal(connections[0]?.apiKey, "sk-active-cred-key");
    assert.equal(detail.status.connectedCount, 1);
    assert.equal(detail.status.state, "connected");
});

test("custom provider is registered once in the runtime registry", async () => {
    const created = await addCustomProvider();
    await loadSavedProvidersFromDB();

    const all = Array.from(registry.getAllProviders().values());
    const mine = all.filter((p) => p.id === created.id);
    assert.equal(mine.length, 1, "registry must hold a single executor for the custom provider");
    assert.equal(mine[0]?.alias, "activecred", "custom alias must be the routing key");
});

test("only one DB row is created per custom provider", async () => {
    const created = await addCustomProvider();

    const rows = (await getAllProvidersDB()).filter((r) => r.id === created.id);
    assert.equal(rows.length, 1, "no duplicate rows for a single custom provider");
    assert.equal(rows[0]?.providerId, created.id);
});

test("second key joins an existing custom provider's Active Credentials", async () => {
    const parent = await addCustomProvider();

    // Mirrors apps/web handleAddSubmit: parent id + "-" + timestamp, with the
    // parent linkage sent explicitly as provider_id.
    const childId = `${parent.id}-${Date.now()}`;
    createdIds.push(childId);
    await ProvidersLogic.AddProvider({
        id: childId,
        provider_id: parent.id,
        name: "Active Cred Gateway Key",
        category: "custom_provider",
        protocol: "openai",
        base_url: "https://example.com/v1",
        api_key: "sk-second-key"
    });

    const detail = await ProvidersLogic.GetProviderById(parent.id);
    assert.equal(detail?.connections?.length ?? 0, 2, "both keys under one provider");
    assert.equal(detail?.status.connectedCount, 2);
});

test("extra keys inherit the parent alias and do not rename the catalog entry", async () => {
    const parent = await addCustomProvider();

    // Key rows carry no alias of their own — the executor must inherit the
    // parent's alias ("activecred") so models stay under one prefix, and the
    // catalog entry must keep the parent's name, not the newest key's.
    const child = await ProvidersLogic.AddProvider({
        provider_id: parent.id,
        name: "Key 2",
        category: "custom_provider",
        protocol: "openai",
        base_url: "https://example.com/v1",
        api_key: "sk-child-key"
    });
    createdIds.push(child.id);
    await loadSavedProvidersFromDB();

    const registered = registry.getAllProviders().get(child.id);
    assert.ok(registered, "child key must be registered");
    assert.equal(registered?.alias, "activecred", "child must inherit the parent's alias");

    const catalog = await ProvidersLogic.GetCatalog();
    const entry = catalog.categories.custom_provider.find((p) => p.id === parent.id);
    assert.equal(entry?.name, "activecred", "catalog name stays the provider's own");
});

test("non-UUID custom provider ids stay whole and group under their own id", async () => {
    // Production DBs hold custom providers created with an explicit id like
    // "grok-web". providerCatalogBaseId must not truncate such ids to "grok":
    // deep links /providers/grok-web must keep resolving, and two providers
    // sharing a first token ("grok-web", "grok-mini") must stay separate.
    const parent = await ProvidersLogic.AddProvider({
        id: "grok-web",
        name: "Grok Web",
        alias: "grokweb",
        category: "custom_provider",
        protocol: "openai",
        base_url: "https://example.com/v1",
        api_key: "sk-grok-web"
    });
    createdIds.push(parent.id);

    const second = await ProvidersLogic.AddProvider({
        id: "grok-mini",
        name: "Grok Mini",
        alias: "grokmini",
        category: "custom_provider",
        protocol: "openai",
        base_url: "https://example.com/v1",
        api_key: "sk-grok-mini"
    });
    createdIds.push(second.id);

    const detail = await ProvidersLogic.GetProviderById("grok-web");
    assert.ok(detail, "deep link /providers/grok-web must still resolve");
    assert.equal(detail?.name, "Grok Web");
    assert.equal(detail?.connections?.length ?? 0, 1, "only grok-web's own key groups under it");

    const catalog = await ProvidersLogic.GetCatalog();
    const ids = catalog.categories.custom_provider.map((p) => p.id);
    assert.ok(ids.includes("grok-web"), "grok-web keeps its own catalog entry");
    assert.ok(ids.includes("grok-mini"), "grok-mini is not merged into grok-web");
});

test("custom provider alias is derived from name, sanitized, and de-duplicated", async () => {
    const first = await ProvidersLogic.AddProvider({
        name: "My Gateway!",
        category: "custom_provider",
        protocol: "openai",
        base_url: "https://example.com/v1",
        api_key: "sk-alias-1"
    });
    createdIds.push(first.id);
    await loadSavedProvidersFromDB();
    assert.equal(
        registry.getAllProviders().get(first.id)?.alias,
        "mygateway",
        "spaces and punctuation are stripped"
    );

    const second = await ProvidersLogic.AddProvider({
        name: "My Gateway",
        category: "custom_provider",
        protocol: "openai",
        base_url: "https://example.com/v1",
        api_key: "sk-alias-2"
    });
    createdIds.push(second.id);
    await loadSavedProvidersFromDB();
    assert.equal(
        registry.getAllProviders().get(second.id)?.alias,
        "mygateway-2",
        "taken alias gets a numeric suffix"
    );
});

test("custom provider alias avoids built-in provider aliases", async () => {
    const created = await ProvidersLogic.AddProvider({
        name: "Anthropic",
        category: "custom_provider",
        protocol: "openai",
        base_url: "https://example.com/v1",
        api_key: "sk-alias-builtin"
    });
    createdIds.push(created.id);
    await loadSavedProvidersFromDB();
    assert.equal(
        registry.getAllProviders().get(created.id)?.alias,
        "anthropic-2",
        "built-in id 'anthropic' must not be reused"
    );
});
