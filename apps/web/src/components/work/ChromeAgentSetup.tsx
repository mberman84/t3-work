import { useState } from "react";
import { Button } from "../ui/button";

export function ChromeAgentSetup() {
  const [status, setStatus] = useState("");
  const windows = navigator.userAgent.includes("Windows");
  const args = [
    "-y",
    "chrome-devtools-mcp@1.12.0",
    "--autoConnect",
    "--no-usage-statistics",
    "--no-performance-crux",
  ];
  const config = JSON.stringify(
    {
      mcpServers: {
        "chrome-devtools": {
          command: windows ? "cmd" : "npx",
          args: windows ? ["/c", "npx", ...args] : args,
        },
      },
    },
    null,
    2,
  );
  return (
    <details className="space-y-3 rounded-xl border p-4">
      <summary className="cursor-pointer text-sm font-medium">
        Let your agent work in your signed-in Chrome
      </summary>
      <p className="mt-3 text-sm text-muted-foreground">
        Chrome’s own connection lets your agent read pages, click, type, and navigate using your
        existing sessions. It works with local agents from the desktop or web app.
      </p>
      <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
        <li>
          In Chrome 144 or later, open <code>chrome://inspect/#remote-debugging</code> and enable
          remote debugging.
        </li>
        <li>
          Add the configuration below to your agent’s MCP settings, then restart the agent in T3
          Work.
        </li>
        <li>Ask your agent to use Chrome, then accept Chrome’s connection prompt.</li>
      </ol>
      <p className="text-xs text-muted-foreground">
        This grants the agent access to your live browser session. Chrome controls the permission
        prompt. Disconnect from Chrome when finished.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          void navigator.clipboard
            .writeText(config)
            .then(() => setStatus("Configuration copied."))
            .catch(() => setStatus("Copy from the configuration below."));
        }}
      >
        Copy Chrome agent configuration
      </Button>
      <p role="status" className="text-xs text-muted-foreground">
        {status}
      </p>
      <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
        <code>{config}</code>
      </pre>
      <a
        className="text-xs text-muted-foreground underline underline-offset-4"
        href="https://developer.chrome.com/docs/devtools/agents/use-cases/auto-connect"
        target="_blank"
        rel="noreferrer"
      >
        Chrome’s setup guide
      </a>
    </details>
  );
}
