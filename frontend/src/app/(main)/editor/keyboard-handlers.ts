/**
 * Keyboard handler utilities for screenplay editor
 * Extracted to reduce handleKeyDown complexity
 */

export type ScreenplayFormat =
  | "scene-header-top-line"
  | "character"
  | "dialogue"
  | "action"
  | "transition"
  | "parenthetical";

export type FormatAction =
  | "bold"
  | "italic"
  | "underline"
  | "undo"
  | "redo"
  | "selectAll"
  | "print";

export interface KeyboardShortcut {
  key: string;
  action: () => void;
}

/**
 * Handle Tab key press
 */
export function handleTabKey(
  event: React.KeyboardEvent,
  currentFormat: ScreenplayFormat,
  getNextFormatOnTab: (
    format: ScreenplayFormat,
    shiftKey: boolean
  ) => ScreenplayFormat | null,
  applyFormatToCurrentLine: (format: ScreenplayFormat) => void
): void {
  event.preventDefault();
  const nextFormat =
    getNextFormatOnTab(currentFormat, event.shiftKey) || "action";
  applyFormatToCurrentLine(nextFormat);
}

/**
 * Handle Enter key press
 */
export function handleEnterKey(
  event: React.KeyboardEvent,
  currentFormat: ScreenplayFormat,
  getNextFormatOnEnter: (format: ScreenplayFormat) => ScreenplayFormat | null,
  applyFormatToCurrentLine: (format: ScreenplayFormat) => void
): void {
  event.preventDefault();
  const nextFormat = getNextFormatOnEnter(currentFormat) || "action";
  applyFormatToCurrentLine(nextFormat);
}

/**
 * Create keyboard shortcut handlers
 */
export function createShortcutHandlers(
  formatText: (action: FormatAction) => void,
  applyFormatToCurrentLine: (format: ScreenplayFormat) => void,
  setShowSearchDialog: (show: boolean) => void,
  setShowReplaceDialog: (show: boolean) => void,
  onSave?: () => void
): Map<string, () => void> {
  const handlers = new Map<string, () => void>();

  // Text formatting shortcuts
  handlers.set("b", () => formatText("bold"));
  handlers.set("B", () => formatText("bold"));
  handlers.set("i", () => formatText("italic"));
  handlers.set("I", () => formatText("italic"));
  handlers.set("u", () => formatText("underline"));
  handlers.set("U", () => formatText("underline"));

  // Undo/Redo
  handlers.set("z", () => formatText("undo"));
  handlers.set("Z", () => formatText("undo"));
  handlers.set("y", () => formatText("redo"));
  handlers.set("Y", () => formatText("redo"));

  // File operations
  handlers.set(
    "s",
    () => onSave?.() || console.log("Save functionality would go here")
  );
  handlers.set(
    "S",
    () => onSave?.() || console.log("Save functionality would go here")
  );
  handlers.set("a", () => formatText("selectAll"));
  handlers.set("A", () => formatText("selectAll"));
  handlers.set("p", () => formatText("print"));
  handlers.set("P", () => formatText("print"));

  // Search and replace
  handlers.set("f", () => setShowSearchDialog(true));
  handlers.set("F", () => setShowSearchDialog(true));
  handlers.set("h", () => setShowReplaceDialog(true));
  handlers.set("H", () => setShowReplaceDialog(true));

  // Format shortcuts
  handlers.set("1", () => applyFormatToCurrentLine("scene-header-top-line"));
  handlers.set("2", () => applyFormatToCurrentLine("character"));
  handlers.set("3", () => applyFormatToCurrentLine("dialogue"));
  handlers.set("4", () => applyFormatToCurrentLine("action"));
  handlers.set("6", () => applyFormatToCurrentLine("transition"));

  return handlers;
}

/**
 * Execute keyboard shortcut if it exists
 */
export function executeShortcut(
  key: string,
  handlers: Map<string, () => void>
): boolean {
  const handler = handlers.get(key);
  if (handler) {
    handler();
    return true;
  }
  return false;
}
