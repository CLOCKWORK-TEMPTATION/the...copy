/**
 * Paste handler utilities
 * Extracted to reduce cyclomatic complexity in handlePaste
 */

export interface PasteContext {
  lastFormat: string;
  isInDialogueBlock: boolean;
  pendingCharacterLine: boolean;
}

export interface LineProcessingResult {
  html: string;
  context: PasteContext;
  currentCharacter: string;
  shouldContinue: boolean;
}

/**
 * Process blank line
 */
export function processBlankLine(
  context: PasteContext,
  currentCharacter: string
): LineProcessingResult {
  const newContext = {
    ...context,
    isInDialogueBlock: false,
    lastFormat: "action",
  };

  return {
    html: '<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;"></div>',
    context: newContext,
    currentCharacter: "",
    shouldContinue: true,
  };
}

/**
 * Process basmala line
 */
export function processBasmalaLine(
  line: string,
  context: PasteContext,
  currentCharacter: string
): LineProcessingResult {
  const newContext = {
    ...context,
    lastFormat: "basmala",
    isInDialogueBlock: false,
  };

  return {
    html: `<div class="basmala" style="direction: rtl; text-align: left; margin: 0;">${line}</div>`,
    context: newContext,
    currentCharacter,
    shouldContinue: true,
  };
}

/**
 * Process transition line
 */
export function processTransitionLine(
  line: string,
  context: PasteContext,
  currentCharacter: string
): LineProcessingResult {
  const newContext = {
    ...context,
    lastFormat: "transition",
    isInDialogueBlock: false,
    pendingCharacterLine: false,
  };

  return {
    html: `<div class="transition" style="direction: rtl; text-align: center; font-weight: bold; text-transform: uppercase; margin: 1rem 0;">${line}</div>`,
    context: newContext,
    currentCharacter,
    shouldContinue: true,
  };
}

/**
 * Process character line
 */
export function processCharacterLine(
  line: string,
  context: PasteContext
): LineProcessingResult {
  const cleanCharacter = line.trim().replace(":", "");
  const newContext = {
    ...context,
    lastFormat: "character",
    isInDialogueBlock: true,
    pendingCharacterLine: false,
  };

  return {
    html: `<div class="character" style="direction: rtl; text-align: center; font-weight: bold; text-transform: uppercase; width: 2.5in; margin: 12px auto 0 auto;">${line}</div>`,
    context: newContext,
    currentCharacter: cleanCharacter,
    shouldContinue: true,
  };
}

/**
 * Process parenthetical line
 */
export function processParentheticalLine(
  line: string,
  context: PasteContext,
  currentCharacter: string
): LineProcessingResult {
  const newContext = {
    ...context,
    lastFormat: "parenthetical",
    pendingCharacterLine: false,
  };

  return {
    html: `<div class="parenthetical" style="direction: rtl; text-align: center; font-style: italic; width: 2.0in; margin: 6px auto;">${line}</div>`,
    context: newContext,
    currentCharacter,
    shouldContinue: true,
  };
}

/**
 * Process dialogue line
 */
export function processDialogueLine(
  line: string,
  context: PasteContext,
  currentCharacter: string
): LineProcessingResult {
  const newContext = {
    ...context,
    lastFormat: "dialogue",
  };

  return {
    html: `<div class="dialogue" style="direction: rtl; text-align: right; width: 3.5in; margin: 6px auto;">${line}</div>`,
    context: newContext,
    currentCharacter,
    shouldContinue: true,
  };
}

/**
 * Process action line
 */
export function processActionLine(
  line: string,
  context: PasteContext
): LineProcessingResult {
  const newContext = {
    ...context,
    lastFormat: "action",
    isInDialogueBlock: false,
    pendingCharacterLine: false,
  };

  return {
    html: `<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;">${line}</div>`,
    context: newContext,
    currentCharacter: "",
    shouldContinue: true,
  };
}
