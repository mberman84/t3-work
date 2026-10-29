import { describe, expect, it, vi } from "vite-plus/test";
import {
  DEFAULT_BROWSER_PROFILE_ID,
  INCOGNITO_BROWSER_PROFILE_ID,
  LIVE_CHROME_PROFILE_ID,
} from "@t3tools/contracts";

const settings = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock("~/hooks/useSettings", () => ({
  getClientSettings: () => settings.current,
  useClientSettings: () => undefined,
  ensureClientSettingsHydrated: vi.fn(async () => undefined),
}));

const { getBrowserDefaults } = await import("./browserDefaults");

const withDefaultProfile = (browserDefaultProfileId: string) => {
  settings.current = {
    browserDefaultViewport: { _tag: "fill" },
    browserDefaultZoomFactor: 1,
    browserDefaultAppearance: "system",
    browserAutoShowFloatingPreview: true,
    browserProfiles: [{ id: "work", name: "Work", kind: "persistent" }],
    browserDefaultProfileId,
  };
  return getBrowserDefaults();
};

describe("getBrowserDefaults profile resolution", () => {
  it("keeps a chosen persistent profile", () => {
    expect(withDefaultProfile("work").profileId).toBe("work");
  });
  it.each([INCOGNITO_BROWSER_PROFILE_ID, LIVE_CHROME_PROFILE_ID, "missing"])(
    "uses a persistent browser instead of %s as the default",
    (profileId) => {
      expect(withDefaultProfile(profileId).profileId).toBe(DEFAULT_BROWSER_PROFILE_ID);
    },
  );
});
