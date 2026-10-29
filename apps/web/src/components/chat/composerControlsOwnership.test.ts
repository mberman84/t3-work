import { describe, expect, it } from "vite-plus/test";

import { resolveComposerControlsOwnership } from "./composerControlsOwnership";

const base = {
  matchesDefault: true,
  hasTraits: true,
  planModeUiEnabled: false,
  collapsed: false,
  measuredHiddenBlockCount: 0,
};

describe("resolveComposerControlsOwnership", () => {
  it("keeps a separate permissions icon at the default", () => {
    const result = resolveComposerControlsOwnership(base);
    expect(result).toMatchObject({
      accessDisplay: "icon",
      showModeBlock: true,
      hiddenBlockIds: [],
      effortOwnsModeShortcut: false,
    });
  });

  it("shows a labelled chip that owns composer.mode when the mode differs", () => {
    const result = resolveComposerControlsOwnership({ ...base, matchesDefault: false });
    expect(result).toMatchObject({
      accessDisplay: "label",
      showModeBlock: true,
      effortOwnsModeShortcut: false,
    });
  });

  it("moves permissions into the overflow without moving the effort chip", () => {
    const result = resolveComposerControlsOwnership({
      ...base,
      matchesDefault: false,
      measuredHiddenBlockCount: 1,
    });
    expect(result.hiddenBlockIds).toEqual(["mode"]);
    expect(result.overflowShowsPermissions).toBe(true);
    // One composer.mode target: the overflow menu, not the overflowed effort chip.
    expect(result.effortOwnsModeShortcut).toBe(false);
  });

  it("keeps the Plan toggle block at the default and overflows it before the effort chip", () => {
    const result = resolveComposerControlsOwnership({
      ...base,
      planModeUiEnabled: true,
      measuredHiddenBlockCount: 1,
    });
    expect(result.showModeBlock).toBe(true);
    expect(result.hiddenBlockIds).toEqual(["mode"]);
    expect(result.overflowShowsPermissions).toBe(true);
    expect(result.effortOwnsModeShortcut).toBe(false);
  });

  it("overflows only the chip when the Plan toggle gives the overflow menu content", () => {
    const result = resolveComposerControlsOwnership({
      ...base,
      matchesDefault: false,
      planModeUiEnabled: true,
      measuredHiddenBlockCount: 1,
    });
    expect(result.hiddenBlockIds).toEqual(["mode"]);
    expect(result.overflowShowsPermissions).toBe(true);
    expect(result.effortOwnsModeShortcut).toBe(false);
  });

  it("keeps a permissions icon for models without traits, even at the default", () => {
    const result = resolveComposerControlsOwnership({ ...base, hasTraits: false });
    expect(result.accessDisplay).toBe("icon");
    const overflowed = resolveComposerControlsOwnership({
      ...base,
      hasTraits: false,
      measuredHiddenBlockCount: 1,
    });
    expect(overflowed.hiddenBlockIds).toEqual(["mode"]);
    expect(overflowed.overflowShowsPermissions).toBe(true);
  });

  it("shows the non-default chip as an icon in the compacted row", () => {
    const result = resolveComposerControlsOwnership({
      ...base,
      matchesDefault: false,
      collapsed: true,
    });
    expect(result.accessDisplay).toBe("icon");
  });
});
