import { describe, expect, it } from "vite-plus/test";
import { chromeEndpointFromPortFile } from "./ChromeConnection.ts";

describe("Chrome connection discovery", () => {
  it("uses only a loopback browser endpoint from Chrome's port file", () => {
    expect(chromeEndpointFromPortFile("9222\r\n/devtools/browser/abcd-1234\r\n")).toBe(
      "ws://127.0.0.1:9222/devtools/browser/abcd-1234",
    );
    for (const value of [
      "0\n/devtools/browser/id",
      "65536\n/devtools/browser/id",
      "9222junk\n/devtools/browser/id",
      "9222\n//attacker.example/path",
      "9222\nhttp://attacker.example/",
      "9222\n/devtools/browser/id?token=abc",
      "9222\n/devtools/page/id",
      "9222\n/devtools/browser/id\nextra",
      "9222",
      "9222\n/devtools/browser/" + "x".repeat(2048),
    ]) {
      expect(() => chromeEndpointFromPortFile(value)).toThrow("connection information is invalid");
    }
  });
});
