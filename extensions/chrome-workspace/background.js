import { createBridge } from "./bridge.js";

const dispatch = createBridge(chrome);
chrome.runtime.onMessageExternal.addListener((message, sender, reply) => {
  dispatch(message, sender)
    .then(reply)
    .catch((error) => reply({ ok: false, error: error.message }));
  return true;
});
chrome.tabs.onRemoved.addListener((tabId) => {
  void chrome.storage.session.remove(`page:${tabId}`);
});
chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (change.url || change.status === "loading")
    void chrome.storage.session.remove(`page:${tabId}`);
});
