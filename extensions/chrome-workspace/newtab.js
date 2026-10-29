import { workspaceOrigin } from "./bridge.js";

try {
  const { approvedOrigin } = await chrome.storage.local.get("approvedOrigin");
  if (approvedOrigin) {
    location.replace(`${workspaceOrigin(approvedOrigin)}/#chrome-workspace=${chrome.runtime.id}`);
  }
} catch {
  document.querySelector("#status").textContent =
    "The workspace address is unavailable. Open the companion popup to approve it again.";
}
