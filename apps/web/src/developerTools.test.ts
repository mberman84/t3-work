import { describe, expect, it } from "vite-plus/test";
import {
  filterDeveloperMenuItems,
  isDeveloperCommand,
  isDeveloperSettingsPath,
  isDeveloperSurface,
} from "./developerTools";

describe("developer tools visibility", () => {
  it("identifies developer shortcuts while preserving normal work controls", () => {
    for (const command of [
      "terminal.toggle",
      "diff.toggle",
      "editor.openFavorite",
      "composer.previousWorktree",
      "composer.branch",
      "script.launch",
    ])
      expect(isDeveloperCommand(command)).toBe(true);
    for (const command of [
      "composer.mode",
      "composer.effort",
      "chat.newWithoutProject",
      "rightPanel.toggle",
      "filePicker.toggle",
      "projectSearch.toggle",
    ])
      expect(isDeveloperCommand(command)).toBe(false);
  });
  it("removes Git actions recursively without losing thread organization", () => {
    expect(
      filterDeveloperMenuItems([
        { id: "new-thread-on-branch", label: "New thread on branch" },
        {
          id: "copy",
          label: "Copy",
          children: [
            { id: "copy-branch", label: "Branch" },
            { id: "copy-thread", label: "Thread" },
          ],
        },
        { id: "move-project", label: "Move to project" },
      ]),
    ).toEqual([
      { id: "copy", label: "Copy", children: [{ id: "copy-thread", label: "Thread" }] },
      { id: "move-project", label: "Move to project" },
    ]);
  });
  it("hides saved development panels and settings while preserving files and browsing", () => {
    expect(
      ["terminal", "diff", "device", "pull-request", "pull-requests"].every((kind) =>
        isDeveloperSurface({ kind }),
      ),
    ).toBe(true);
    expect(["preview", "file", "files"].some((kind) => isDeveloperSurface({ kind }))).toBe(false);
    expect(isDeveloperSettingsPath("/settings/worktrees")).toBe(true);
    expect(isDeveloperSettingsPath("/settings/projects")).toBe(false);
    expect(isDeveloperSettingsPath("/settings/browser")).toBe(false);
  });
});
