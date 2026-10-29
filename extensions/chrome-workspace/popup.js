import { workspaceOrigin } from "./bridge.js";

const origin = document.querySelector("#origin");
const status = document.querySelector("#status");
document.querySelector("#extension-id").value = chrome.runtime.id;
const { approvedOrigin } = await chrome.storage.local.get("approvedOrigin");
origin.value = approvedOrigin ?? "";
status.textContent = approvedOrigin ? `Connected to ${approvedOrigin}` : "No workspace approved.";

function action(id, fn) {
  document.querySelector(id).addEventListener("click", async (event) => {
    event.target.disabled = true;
    try {
      await fn();
    } catch (error) {
      status.textContent = error.message;
    } finally {
      event.target.disabled = false;
    }
  });
}

action("#pair", async () => {
  const approvedOrigin = workspaceOrigin(origin.value);
  await chrome.storage.session.clear();
  await chrome.storage.local.set({ approvedOrigin });
  status.textContent = `Approved ${approvedOrigin}. Connect using the extension ID in T3 Work.`;
});
action("#revoke", async () => {
  await chrome.storage.local.remove("approvedOrigin");
  await chrome.storage.session.clear();
  origin.value = "";
  status.textContent = "Disconnected. Shared page snapshots cleared.";
});
action("#share", async () => {
  const { approvedOrigin } = await chrome.storage.local.get("approvedOrigin");
  if (!approvedOrigin) throw new Error("Approve a workspace first.");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || tab.incognito || !/^https?:\/\//.test(tab.url ?? ""))
    throw new Error("Choose a regular web page first.");
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      title: document.title,
      url: location.href,
      text: document.body.innerText.slice(0, 40000),
    }),
  });
  if (!result?.result) throw new Error("Chrome could not read this page.");
  const current = await chrome.tabs.get(tab.id);
  const pairing = await chrome.storage.local.get("approvedOrigin");
  if (current.url !== result.result.url || pairing.approvedOrigin !== approvedOrigin)
    throw new Error("The page or workspace changed. Share again.");
  await chrome.storage.session.set({ [`page:${tab.id}`]: result.result });
  status.textContent = "Page shared. Refresh tabs in T3 Work, then choose Use in task.";
});
