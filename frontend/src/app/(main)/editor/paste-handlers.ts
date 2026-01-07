/**
 * Paste handler utilities for screenplay editor
 * Extracted to reduce handlePaste complexity
 */

export interface LineProcessingContext {
  lastFormat: string;
  isInDialogueBlock: boolean;
  pendingCharacterLine: boolean;
}

export interface LineProcessingResult {
  html: string;
  currentCharacter?: string;
  updateContext?: Partial<LineProcessingContext>;
}

/**
 * Process blank line
 */
export function processBlankLine(): LineProcessingResult {
  return {
    html: '<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;"></div>',
    currentCharacter: "",
    updateContext: {
      isInDialogueBlock: false,
      lastFormat: "action",
    },
  };
}

/**
 * Process basmala line
 */
export function processBasmalaLine(line: string): LineProcessingResult {
  return {
    html: `<div class="basmala" style="direction: rtl; text-align: left; margin: 0;">${line}</div>`,
    updateContext: {
      lastFormat: "basmala",
      isInDialogueBlock: false,
    },
  };
}

/**
 * Process transition line
 */
export function processTransitionLine(line: string): LineProcessingResult {
  return {
    html: `<div class="transition" style="direction: rtl; text-align: center; font-weight: bold; text-transform: uppercase; margin: 1rem 0;">${line}</div>`,
    updateContext: {
      lastFormat: "transition",
      isInDialogueBlock: false,
      pendingCharacterLine: false,
    },
  };
}

/**
 * Process character line
 */
export function processCharacterLine(line: string): LineProcessingResult {
  const cleanedCharacter = line.trim().replace(":", "");
  return {
    html: `<div class="character" style="direction: rtl; text-align: center; font-weight: bold; text-transform: uppercase; width: 2.5in; margin: 12px auto 0 auto;">${line}</div>`,
    currentCharacter: cleanedCharacter,
    updateContext: {
      lastFormat: "character",
      isInDialogueBlock: true,
      pendingCharacterLine: false,
    },
  };
}

/**
 * Process parenthetical line
 */
export function processParentheticalLine(line: string): LineProcessingResult {
  return {
    html: `<div class="parenthetical" style="direction: rtl; text-align: center; font-style: italic; width: 2.0in; margin: 6px auto;">${line}</div>`,
    updateContext: {
      lastFormat: "parenthetical",
      pendingCharacterLine: false,
    },
  };
}

/**
 * Process action line
 */
export function processActionLine(line: string): LineProcessingResult {
  const cleanedLine = line.replace(/^\s*[-–—]\s*/, "");
  return {
    html: `<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;">${cleanedLine}</div>`,
    updateContext: {
      lastFormat: "action",
      isInDialogueBlock: false,
      pendingCharacterLine: false,
    },
  };
}

/**
 * Process dialogue line
 */
export function processDialogueLine(line: string): LineProcessingResult {
  return {
    html: `<div class="dialogue" style="direction: rtl; text-align: center; width: 2.5in; line-height: 1.2; margin: 0 auto 12px auto;">${line}</div>`,
    updateContext: {
      lastFormat: "dialogue",
      pendingCharacterLine: false,
    },
  };
}

/**
 * Check if line is action description
 */
export function isActionDescription(line: string): boolean {
  const actionDescriptionPatterns = [
    /^\s*[-–—]\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/,
    /^\s*[-–—]\s*[ي|ت][\u0600-\u06FF]+/,
    /^\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/,
  ];

  return actionDescriptionPatterns.some((pattern) => pattern.test(line));
}

/**
 * Process scene header line
 */
export function processSceneHeaderLine(
  line: string,
  ctx: { inDialogue: boolean },
  sceneHeaderResult: { html: string; processed: boolean } | null
): LineProcessingResult | null {
  if (!sceneHeaderResult?.processed) {
    return null;
  }

  return {
    html: sceneHeaderResult.html,
    updateContext: {
      lastFormat: "scene-header",
      isInDialogueBlock: false,
      pendingCharacterLine: false,
    },
  };
}

/**
 * Apply context updates
 */
export function applyContextUpdates(
  context: LineProcessingContext,
  updates?: Partial<LineProcessingContext>
): LineProcessingContext {
  if (!updates) return context;

  return {
    ...context,
    ...updates,
  };
}

/**
 * Check if text matches bullet character pattern
 */
export function matchesBulletCharacterPattern(text: string): {
  match: boolean;
  characterName?: string;
  dialogueText?: string;
} {
  const bulletCharacterPattern = /^\s*[•·●○■▪▫–—‣⁃]([^:]+):(.*)/;
  const match = text.match(bulletCharacterPattern);

  if (match && match[1] && match[2]) {
    return {
      match: true,
      characterName: match[1].trim(),
      dialogueText: match[2].trim(),
    };
  }

  return { match: false };
}

/**
 * Check if dialogue should be converted to action
 */
export function shouldConvertDialogueToAction(
  text: string,
  wordCount: (text: string) => number
): boolean {
  const actionPatterns = [
    /^\s*[-–—]?\s*(?:[ي|ت][\u0600-\u06FF]+|نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|يظهر|تظهر)/,
    /^\s*[-–—]\s*.+/,
    /^\s*(?:نرى|ننظر|نسمع|نلاحظ|نشهد|نشاهد|نلمس|نشعر|نصدق|نفهم|نصدق|نشك|نتمنى|نأمل|نخشى|نخاف|نحب|نكره|نحسد|نغبط|ن admire|نحترم)/,
    /\s+(?:يقول|تقول|قال|قالت|يقوم|تقوم|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يكتب|تكتب|ينظر|تنظر|يبتسم|تبتسم|يقف|تقف|يجلس|تجلس|يدخل|تدخل|يخرج|تخرج|يركض|تركض|يمشي|تمشي|يجري|تجرى|يصرخ|اصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينصر|تنتصر|يخسر|تخسر|يرسم|ترسم|يصمم|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلن|يعلم|تعلن)\s+/,
  ];

  // Check action patterns
  if (actionPatterns.some((pattern) => pattern.test(text))) {
    return true;
  }

  // Check long sentences
  if (text.length > 20 && wordCount(text) > 5) {
    return true;
  }

  return false;
}

/**
 * Process bullet character pattern and convert to character/dialogue
 */
export function processBulletCharacterPattern(
  currentElement: HTMLElement,
  nextElement: HTMLElement | null,
  tempDiv: HTMLElement,
  getFormatStyles: (format: string) => Record<string, unknown>
): boolean {
  const textContent = currentElement.textContent || "";
  const match = matchesBulletCharacterPattern(textContent);

  if (!match.match || !match.characterName || !match.dialogueText) {
    return false;
  }

  // Convert this action line to character + dialogue
  currentElement.className = "character";
  currentElement.textContent = match.characterName + ":";
  Object.assign(currentElement.style, getFormatStyles("character"));

  // Create a new dialogue element after this one
  const dialogueElement = document.createElement("div");
  dialogueElement.className = "dialogue";
  dialogueElement.textContent = match.dialogueText;
  Object.assign(dialogueElement.style, getFormatStyles("dialogue"));

  // Insert the dialogue element after the character element
  if (nextElement) {
    tempDiv.insertBefore(dialogueElement, nextElement);
  } else {
    tempDiv.appendChild(dialogueElement);
  }

  return true;
}

/**
 * Convert dialogue element to action element
 */
export function convertDialogueToAction(
  element: HTMLElement,
  getFormatStyles: (format: string) => Record<string, unknown>
): void {
  const textContent = element.textContent || "";

  element.className = "action";
  // Remove leading dashes if present
  const cleanedText = textContent.replace(/^\s*[-–—]\s*/, "");
  element.textContent = cleanedText;
  Object.assign(element.style, getFormatStyles("action"));
}
