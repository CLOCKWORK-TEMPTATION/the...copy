/**
 * Character line detection utilities
 * Extracted to reduce cyclomatic complexity
 */

export interface CharacterLineContext {
  lastFormat: string;
  isInDialogueBlock: boolean;
}

const ARABIC_CHARACTER_PATTERN =
  /^[\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+[:\s]*$/;

/**
 * Check if line ends with a colon
 */
function hasTrailingColon(line: string): boolean {
  return line.includes(":") && line.trim().endsWith(":");
}

/**
 * Check if line matches Arabic character pattern
 */
function matchesArabicCharacterPattern(line: string): boolean {
  return ARABIC_CHARACTER_PATTERN.test(line);
}

/**
 * Check if line could be a character name based on regex
 */
function matchesCharacterRegex(line: string, characterRe: RegExp): boolean {
  return characterRe.test(line) || matchesArabicCharacterPattern(line);
}

/**
 * Check if in dialogue context
 */
function isInDialogueContext(
  context: CharacterLineContext,
  line: string,
  characterRe: RegExp
): boolean {
  // If the last line was also a character, this is likely a new character
  if (context.lastFormat === "character") {
    return matchesCharacterRegex(line, characterRe);
  }

  // If the last line was dialogue, this is probably not a character
  if (context.lastFormat === "dialogue") {
    return false;
  }

  return false;
}

/**
 * Check if in action context with colon
 */
function isActionContextWithColon(
  context: CharacterLineContext,
  line: string,
  characterRe: RegExp,
  hasColon: boolean
): boolean {
  if (context.lastFormat === "action" && hasColon) {
    return matchesCharacterRegex(line, characterRe);
  }
  return false;
}

/**
 * Apply context-aware checks for character line detection
 */
export function applyContextChecks(
  line: string,
  characterRe: RegExp,
  hasColon: boolean,
  context?: CharacterLineContext
): boolean | null {
  if (!context) {
    return null; // No context available
  }

  // If we're already in a dialogue block
  if (context.isInDialogueBlock) {
    const result = isInDialogueContext(context, line, characterRe);
    if (result !== false) {
      return result;
    }
  }

  // Check action context
  const actionResult = isActionContextWithColon(
    context,
    line,
    characterRe,
    hasColon
  );
  if (actionResult) {
    return true;
  }

  return null; // Continue with default checks
}

/**
 * Check if line is a character line with basic checks
 */
export function isCharacterLineBasic(
  line: string,
  characterRe: RegExp
): boolean {
  // If it ends with a colon, it's very likely a character line
  if (hasTrailingColon(line)) {
    return true;
  }

  // If it matches Arabic character pattern, it's likely a character line
  if (matchesArabicCharacterPattern(line)) {
    return true;
  }

  // If it doesn't have a colon, it's likely not a character line
  const hasColon = line.includes(":");
  if (!hasColon) {
    return false;
  }

  // Final check against regex
  return matchesCharacterRegex(line, characterRe);
}
