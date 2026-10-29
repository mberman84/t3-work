/**
 * Where the permissions control lives, which blocks overflow, and which menu answers the
 * composer.mode shortcut. Blocks are ordered [traits, mode]; the last block overflows first.
 * The rule: Permissions have exactly one visible home and composer.mode exactly one target.
 */
export function resolveComposerControlsOwnership(input: {
  /** The default uses an icon; other modes show their label. */
  readonly matchesDefault: boolean;
  /** Whether the model has an effort menu. */
  readonly hasTraits: boolean;
  readonly planModeUiEnabled: boolean;
  readonly collapsed: boolean;
  /** How many trailing blocks the width measurement moved into the overflow menu. */
  readonly measuredHiddenBlockCount: number;
}) {
  const accessDisplay =
    input.matchesDefault || input.collapsed ? ("icon" as const) : ("label" as const);
  const showModeBlock = true;
  const blockIds = [
    ...(input.hasTraits ? ["traits" as const] : []),
    ...(showModeBlock ? ["mode" as const] : []),
  ];
  const hiddenFor = (count: number) => blockIds.slice(blockIds.length - count);
  const hiddenBlockCount = Math.min(input.measuredHiddenBlockCount, blockIds.length);
  const hiddenBlockIds = hiddenFor(hiddenBlockCount);
  const modeHidden = hiddenBlockIds.includes("mode");
  const traitsHidden = hiddenBlockIds.includes("traits");
  return {
    accessDisplay,
    showModeBlock,
    hiddenBlockCount,
    hiddenBlockIds,
    traitsHidden,
    modeHidden,
    effortOwnsModeShortcut: false,
    overflowShowsPermissions: modeHidden,
  };
}
