// @effect-diagnostics nodeBuiltinImport:off - Chrome discovery runs at the Playwright resource boundary.
import * as NodeFSP from "node:fs/promises";
import * as NodePath from "node:path";

const SETUP_MESSAGE =
  "Keep Chrome running, enable remote debugging at chrome://inspect/#remote-debugging, then try again and approve Chrome's connection prompt.";

export function chromeEndpointFromPortFile(value: string): string {
  const lines = value.trim().split(/\r?\n/);
  const portText = lines[0]?.trim() ?? "";
  const browserPath = lines[1]?.trim() ?? "";
  if (
    value.length > 2048 ||
    lines.length !== 2 ||
    !/^\d{1,5}$/.test(portText) ||
    Number(portText) < 1 ||
    Number(portText) > 65535 ||
    !/^\/devtools\/browser\/[A-Za-z0-9-]+$/.test(browserPath)
  ) {
    throw new Error("Chrome's connection information is invalid. " + SETUP_MESSAGE);
  }
  return `ws://127.0.0.1:${Number(portText)}${browserPath}`;
}

export interface ChromeConnectionHost {
  readonly platform: NodeJS.Platform;
  readonly homeDirectory: string;
  readonly env: NodeJS.ProcessEnv;
}

export async function readChromeEndpoint({
  platform,
  homeDirectory: home,
  env,
}: ChromeConnectionHost): Promise<string> {
  const directory =
    platform === "win32"
      ? NodePath.join(
          env.LOCALAPPDATA ?? NodePath.join(home, "AppData", "Local"),
          "Google",
          "Chrome",
          "User Data",
        )
      : platform === "darwin"
        ? NodePath.join(home, "Library", "Application Support", "Google", "Chrome")
        : NodePath.join(env.XDG_CONFIG_HOME ?? NodePath.join(home, ".config"), "google-chrome");
  const contents = await NodeFSP.readFile(
    NodePath.join(directory, "DevToolsActivePort"),
    "utf8",
  ).catch(() => {
    throw new Error(SETUP_MESSAGE);
  });
  return chromeEndpointFromPortFile(contents);
}
