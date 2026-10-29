import type { ContextMenuItem } from "@t3tools/contracts";

const DEVELOPER_SETTINGS_PATHS = new Set([
  "/settings/source-control",
  "/settings/worktrees",
  "/settings/diffs",
  "/settings/devices",
]);

export function isDeveloperSettingsPath(path: string): boolean {
  return DEVELOPER_SETTINGS_PATHS.has(path);
}

export function isDeveloperCommand(command: string): boolean {
  return (
    /^(terminal\.|git\.|worktree\.|branch\.|pullRequest\.|pullRequests\.|projectScript\.|script\.|editor\.|device\.|diff\.|composer\.(workspace|branch|checkout|previousWorktree))/.test(
      command,
    ) || /^(openFavoriteEditor|openInEditor|changes\.)/.test(command)
  );
}

export function isDeveloperSurface(surface: { readonly kind: string }): boolean {
  return ["terminal", "diff", "pull-request", "pull-requests", "device"].includes(surface.kind);
}

export function filterDeveloperMenuItems<Id extends string>(
  items: ReadonlyArray<ContextMenuItem<Id>>,
): ReadonlyArray<ContextMenuItem<Id>> {
  return items.flatMap((item) => {
    if (["new-thread-on-branch", "copy-branch"].includes(item.id)) return [];
    if (!item.children) return [item];
    const children = filterDeveloperMenuItems(item.children);
    return children.length > 0 ? [{ ...item, children }] : [];
  });
}
