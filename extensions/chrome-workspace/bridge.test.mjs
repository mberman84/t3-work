import * as NodeAssert from "node:assert/strict";
import { it } from "vite-plus/test";
import { createBridge, workspaceOrigin } from "./bridge.js";

const sender = { url: "http://localhost:3773/", origin: "http://localhost:3773", frameId: 0 };
function fixture() {
  const local = { approvedOrigin: sender.origin };
  const snapshots = {};
  const tabs = new Map([
    [1, { id: 1, windowId: 1, title: "Mail", url: "https://mail.example/" }],
    [2, { id: 2, windowId: 1, title: "Secret", url: "https://private.example/", incognito: true }],
    [3, { id: 3, windowId: 1, url: "chrome://settings" }],
  ]);
  const storage = (data) => ({
    async get(key) {
      return key === null ? { ...data } : { [key]: data[key] };
    },
    async remove(key) {
      delete data[key];
    },
    async clear() {
      for (const key of Object.keys(data)) delete data[key];
    },
  });
  const api = {
    storage: { local: storage(local), session: storage(snapshots) },
    tabs: {
      async query() {
        return [...tabs.values()];
      },
      async get(id) {
        if (!tabs.has(id)) throw new Error("Tab closed");
        return tabs.get(id);
      },
      async create(tab) {
        tabs.set(4, { id: 4, ...tab });
      },
      async update(id, change) {
        Object.assign(tabs.get(id), change);
      },
      async reload() {},
      async remove(id) {
        tabs.delete(id);
      },
    },
    windows: { async update() {} },
  };
  return { dispatch: createBridge(api), local, snapshots, tabs };
}
const message = (method, input = {}) => ({ version: 1, method, ...input });

it("rejects unapproved origins, subframes, extensions and malformed requests before mutations", async () => {
  const { dispatch, tabs } = fixture();
  for (const badSender of [
    { ...sender, url: "https://attacker.example/", origin: "https://attacker.example" },
    { ...sender, url: "http://localhost:9999/", origin: "http://localhost:9999" },
    { ...sender, origin: "https://attacker.example" },
    { ...sender, frameId: 1 },
    { ...sender, id: "another-extension" },
  ])
    await NodeAssert.rejects(dispatch(message("close", { tabId: 1 }), badSender));
  await NodeAssert.rejects(dispatch({ method: "close", tabId: 1 }, sender));
  await NodeAssert.rejects(dispatch(message("evaluate", { code: "alert(1)" }), sender));
  NodeAssert.equal(tabs.size, 3);
  for (const value of [
    "file:///tmp",
    "http://localhost.attacker.example/",
    "http://user@localhost/",
  ])
    NodeAssert.throws(() => workspaceOrigin(value));
});

it("returns regular web tabs and requires explicit page sharing with matching URL", async () => {
  const { dispatch, snapshots, tabs } = fixture();
  NodeAssert.deepEqual((await dispatch(message("tabs"), sender)).tabs, [
    { id: 1, title: "Mail", url: "https://mail.example/", shared: false },
  ]);
  await NodeAssert.rejects(dispatch(message("page", { tabId: 1 }), sender), /share/);
  snapshots["page:1"] = { title: "Mail", url: "https://mail.example/", text: "Chosen page" };
  NodeAssert.equal(
    (await dispatch(message("page", { tabId: 1 }), sender)).page.text,
    "Chosen page",
  );
  tabs.get(1).url = "https://mail.example/other";
  await NodeAssert.rejects(dispatch(message("page", { tabId: 1 }), sender), /share/);
  await NodeAssert.rejects(dispatch(message("page", { tabId: 2 }), sender), /Incognito/);
});

it("opens only web URLs and controls existing tabs without reading browser credentials", async () => {
  const { dispatch, tabs, snapshots } = fixture();
  for (const url of [
    "javascript:alert(1)",
    "file:///secret",
    "chrome://settings",
    "https://user:pass@example.com",
  ])
    await NodeAssert.rejects(dispatch(message("open", { url }), sender));
  await dispatch(message("open", { url: "https://example.com/" }), sender);
  NodeAssert.equal(tabs.get(4).url, "https://example.com/");
  await dispatch(message("focus", { tabId: 1 }), sender);
  NodeAssert.equal(tabs.get(1).active, true);
  snapshots["page:1"] = { url: tabs.get(1).url };
  await dispatch(message("reload", { tabId: 1 }), sender);
  NodeAssert.equal(snapshots["page:1"], undefined);
  await dispatch(message("close", { tabId: 1 }), sender);
  NodeAssert.equal(tabs.has(1), false);
});

it("disconnect revokes further control and clears shared pages", async () => {
  const { dispatch, snapshots } = fixture();
  snapshots["page:1"] = { text: "shared" };
  await dispatch(message("disconnect"), sender);
  NodeAssert.deepEqual(snapshots, {});
  await NodeAssert.rejects(dispatch(message("tabs"), sender), /Approve/);
});
