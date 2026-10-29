# Everyday work

T3 Work opens to a home for research, writing, planning, and one-off projects. Describe what you
want to finish, choose a quick task or an existing project, and select **Start working**. This opens
a draft; review it and send when ready. A quick task does not require a repository and keeps its
conversation and files in the scratch workspace. Use the home button to return to recent work.

Task starters fill the draft with a suggested starting point. Edit it to describe your outcome.
Your configured provider still runs the work; at least one provider must be installed and signed in.

## Work with your existing Chrome

The Chrome companion connects the local web app to the Chrome profile in which it is installed.
Your sign-ins stay in Chrome, including sessions that cannot be imported into the built-in browser.
This connection currently requires opening T3 Work's local web app in Chrome. It does not connect
the Electron desktop window or remote clients to Chrome.

1. In Chrome, open `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
   Select this fork's `extensions/chrome-workspace` folder.
2. Open the companion's toolbar popup. Approve the exact local workspace address shown on Work home,
   including the port. Only `localhost` and `127.0.0.1` addresses are supported.
3. Copy the extension ID from the popup, paste it into Work home, and connect.

Work home can list, open, focus, reload, and close regular web tabs. To add a page to a task, open
the page, click **Share this page** in the companion popup, refresh the tab list in Work home, then
choose **Use in task**. This copies a snapshot of visible text into your draft for review, limited
to 40,000 characters. Share again after the page changes. Incognito tabs are excluded.

The companion also makes Work home your Chrome new-tab page after you approve a workspace.
Chrome's address bar and normal browsing work as usual. Keep the local T3 Work server running;
new tabs cannot open the workspace while its server is stopped. Disable the companion in
`chrome://extensions` to restore Chrome's default new-tab page.

Approving a workspace grants it access to tab titles and URLs and tab controls. Page text requires
an explicit share. The companion does not copy cookies, passwords, passkeys, or browser storage.
Page snapshots are temporary and clear when Chrome restarts or the workspace disconnects. Use
**Disconnect Chrome** on Work home or **Disconnect** in the popup to revoke access.

The companion provides tab controls and page context. Chrome remains the browser window; pages
are not embedded inside T3 Work. The existing [built-in browser importer](./browser-import.md)
remains available, with its platform-specific limits.

## Give your agent Chrome control

On Work home, expand **Let your agent work in your signed-in Chrome**. This contains configuration
for the official Chrome DevTools MCP server, pinned to version 1.12.0 with telemetry disabled.
Add this to your provider's MCP configuration; it is separate from the companion connection.
Providers differ in how MCP configuration is registered. The included JSON is for providers that
accept `mcpServers`; translate to your provider's format where needed.

Chrome 144 or later must run on the agent's machine. Open `chrome://inspect/#remote-debugging` in
Chrome, enable remote debugging, restart your agent, and accept Chrome's session prompt when your
agent connects. This uses your running browser and existing sign-ins. It also allows the agent to
interact with pages and access live session data, so approve only trusted agents. Disable remote
debugging there to revoke access. See [Chrome's auto-connect guide](https://developer.chrome.com/docs/devtools/agents/use-cases/auto-connect).
