/**
 * Keyboard shortcuts handler for screenplay editor
 * Extracts keyboard shortcut logic to reduce cyclomatic complexity
 */

export type KeyboardAction =
  | "bold"
  | "italic"
  | "underline"
  | "undo"
  | "redo"
  | "save"
  | "find"
  | "replace"
  | "selectAll"
  | "print"
  | "scene-header"
  | "character"
  | "dialogue"
  | "action"
  | "transition";

export interface KeyboardShortcutHandler {
  action: KeyboardAction;
  handler: () => void;
}

/**
 * Map of keyboard shortcuts to their actions
 */
const shortcutMap: Record<string, KeyboardAction> = {
  b: "bold",
  B: "bold",
  i: "italic",
  I: "italic",
  u: "underline",
  U: "underline",
  z: "undo",
  Z: "undo",
  y: "redo",
  Y: "redo",
  s: "save",
  S: "save",
  f: "find",
  F: "find",
  h: "replace",
  H: "replace",
  a: "selectAll",
  A: "selectAll",
  p: "print",
  P: "print",
  "1": "scene-header",
  "2": "character",
  "3": "dialogue",
  "4": "action",
  "6": "transition",
};

/**
 * Get keyboard action from key press
 */
export function getKeyboardAction(key: string): KeyboardAction | null {
  return shortcutMap[key] || null;
}

/**
 * Check if a key is a keyboard shortcut
 */
export function isKeyboardShortcut(key: string): boolean {
  return key in shortcutMap;
}

/**
 * Handle keyboard shortcut
 */
export function handleKeyboardShortcut(
  key: string,
  handlers: {
    formatText: (action: string) => void;
    applyFormatToCurrentLine: (format: string) => void;
    setShowSearchDialog: (show: boolean) => void;
    setShowReplaceDialog: (show: boolean) => void;
    onSave?: () => void;
  }
): boolean {
  const action = getKeyboardAction(key);
  if (!action) return false;

  // Handle formatting actions
  if (
    [
      "bold",
      "italic",
      "underline",
      "undo",
      "redo",
      "selectAll",
      "print",
    ].includes(action)
  ) {
    handlers.formatText(action);
    return true;
  }

  // Handle save action
  if (action === "save") {
    if (handlers.onSave) {
      handlers.onSave();
    } else {
      console.log("Save functionality would go here");
    }
    return true;
  }

  // Handle find action
  if (action === "find") {
    handlers.setShowSearchDialog(true);
    return true;
  }

  // Handle replace action
  if (action === "replace") {
    handlers.setShowReplaceDialog(true);
    return true;
  }

  // Handle format type actions
  const formatMap: Record<string, string> = {
    "scene-header": "scene-header-top-line",
    character: "character",
    dialogue: "dialogue",
    action: "action",
    transition: "transition",
  };

  if (action in formatMap) {
    const format = formatMap[action];
    if (format) {
      handlers.applyFormatToCurrentLine(format);
      return true;
    }
  }

  return false;
}
