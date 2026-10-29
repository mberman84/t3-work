export function workspaceOrigin(value) {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1"].includes(url.hostname) ||
    url.username ||
    url.password
  ) {
    throw new Error("Use the local T3 Work address, such as http://localhost:3773.");
  }
  return url.origin;
}

function webUrl(value) {
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password)
    throw new Error("Only HTTP and HTTPS pages are supported.");
  return url.href;
}

export function createBridge(api) {
  return async (message, sender) => {
    const { approvedOrigin } = await api.storage.local.get("approvedOrigin");
    const origin = workspaceOrigin(sender.url);
    if (
      !approvedOrigin ||
      origin !== approvedOrigin ||
      sender.origin !== origin ||
      sender.frameId !== 0 ||
      sender.id
    )
      throw new Error("Approve this workspace address in the Chrome companion first.");
    if (!message || message.version !== 1)
      throw new Error("Unsupported Chrome companion protocol.");
    if (message.method === "disconnect") {
      await api.storage.local.remove("approvedOrigin");
      await api.storage.session.clear();
      return { ok: true };
    }
    if (message.method === "tabs") {
      const snapshots = await api.storage.session.get(null);
      const tabs = await api.tabs.query({});
      return {
        ok: true,
        tabs: tabs
          .filter(
            (tab) =>
              Number.isInteger(tab.id) && !tab.incognito && /^https?:\/\//.test(tab.url ?? ""),
          )
          .map((tab) => ({
            id: tab.id,
            title: tab.title ?? "Untitled page",
            url: tab.url,
            shared: snapshots[`page:${tab.id}`]?.url === tab.url,
          })),
      };
    }
    if (message.method === "open") {
      await api.tabs.create({ url: webUrl(message.url) });
      return { ok: true };
    }
    if (!["focus", "reload", "close", "page"].includes(message.method))
      throw new Error("Unsupported Chrome action.");
    if (!Number.isInteger(message.tabId) || message.tabId < 0)
      throw new Error("Choose a valid Chrome tab.");
    const tab = await api.tabs.get(message.tabId);
    if (tab.incognito) throw new Error("Incognito tabs are not shared.");
    webUrl(tab.url);
    if (message.method === "focus") {
      await api.tabs.update(tab.id, { active: true });
      await api.windows.update(tab.windowId, { focused: true });
    } else if (message.method === "reload") {
      await api.storage.session.remove(`page:${tab.id}`);
      await api.tabs.reload(tab.id);
    } else if (message.method === "close") {
      await api.storage.session.remove(`page:${tab.id}`);
      await api.tabs.remove(tab.id);
    } else {
      const key = `page:${tab.id}`;
      const page = (await api.storage.session.get(key))[key];
      if (!page || page.url !== tab.url)
        throw new Error("Open the tab and share it from the Chrome companion first.");
      return { ok: true, page };
    }
    return { ok: true };
  };
}
