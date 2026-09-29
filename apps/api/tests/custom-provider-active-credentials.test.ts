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
        name: "Active Cred Gateway",
        alias: "activecred",
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
    await ProvidersLogic.AddProvider({
        id: `${parent.id}-${Date.now()}`,
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
    const childId = `${parent.id}-${Date.now()}`;
    createdIds.push(childId);
    await ProvidersLogic.AddProvider({
        id: childId,
        provider_id: parent.id,
        name: "Key 2",
        category: "custom_provider",
        protocol: "openai",
        base_url: "https://example.com/v1",
        api_key: "sk-child-key"
    });
    await loadSavedProvidersFromDB();

    const child = registry.getAllProviders().get(childId);
    assert.ok(child, "child key must be registered");
    assert.equal(child?.alias, "activecred", "child must inherit the parent's alias");

    const catalog = await ProvidersLogic.GetCatalog();
    const entry = catalog.categories.custom_provider.find((p) => p.id === parent.id);
    assert.equal(entry?.name, "Active Cred Gateway", "catalog name stays the provider's own");
});
