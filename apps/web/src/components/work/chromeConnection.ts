export interface ChromeTab {
  readonly id: number;
  readonly title: string;
  readonly url: string;
  readonly shared: boolean;
}

export interface ChromeReply {
  readonly tabs?: readonly ChromeTab[];
  readonly page?: { readonly title: string; readonly url: string; readonly text: string };
}

interface ExtensionRuntime {
  readonly lastError?: { readonly message?: string };
  sendMessage: (id: string, message: unknown, callback: (reply: unknown) => void) => void;
}

function chromeRuntime(): ExtensionRuntime | undefined {
  return (window as Window & { chrome?: { runtime?: ExtensionRuntime } }).chrome?.runtime;
}

export async function chromeRequest(
  extensionId: string,
  method: "tabs" | "open" | "focus" | "close" | "reload" | "page" | "disconnect",
  input: { tabId?: number; url?: string } = {},
): Promise<ChromeReply> {
  const runtime = chromeRuntime();
  if (!runtime || !/^[a-p]{32}$/.test(extensionId)) {
    throw new Error("Open T3 Work in Chrome and enter the companion extension ID.");
  }
  const response = await new Promise<unknown>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error("Chrome did not respond. Check the extension and try again.")),
      10000,
    );
    runtime.sendMessage(extensionId, { version: 1, method, ...input }, (reply) => {
      window.clearTimeout(timeout);
      const failure = runtime.lastError?.message;
      if (failure)
        reject(
          new Error(
            "Could not connect. Check the extension ID and approve this workspace address in the extension.",
          ),
        );
      else resolve(reply);
    });
  });
  if (!response || typeof response !== "object" || !("ok" in response) || response.ok !== true) {
    throw new Error(
      response &&
        typeof response === "object" &&
        "error" in response &&
        typeof response.error === "string"
        ? response.error
        : "Unexpected reply from Chrome.",
    );
  }
  if ("tabs" in response) {
    if (
      !Array.isArray(response.tabs) ||
      !response.tabs.every(
        (tab: unknown) =>
          tab &&
          typeof tab === "object" &&
          "id" in tab &&
          Number.isInteger(tab.id) &&
          "title" in tab &&
          typeof tab.title === "string" &&
          "url" in tab &&
          typeof tab.url === "string" &&
          "shared" in tab &&
          typeof tab.shared === "boolean",
      )
    )
      throw new Error("Invalid tab list from Chrome.");
    return { tabs: response.tabs as ChromeTab[] };
  }
  if ("page" in response) {
    const page = response.page;
    if (
      !page ||
      typeof page !== "object" ||
      !("title" in page) ||
      typeof page.title !== "string" ||
      !("url" in page) ||
      typeof page.url !== "string" ||
      !("text" in page) ||
      typeof page.text !== "string"
    )
      throw new Error("Invalid page from Chrome.");
    return { page: { title: page.title, url: page.url, text: page.text } };
  }
  return {};
}
