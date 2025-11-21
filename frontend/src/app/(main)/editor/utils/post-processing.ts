/**
 * Post-processing utilities for screenplay formatting
 * Extracted to reduce cyclomatic complexity
 */

export const ACTION_DESCRIPTION_PATTERNS = [
  /^\s*[-–—]?\s*(?:[ي|ت][\u0600-\u06FF]+|نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|يظهر|تظهر)/,
  /^\s*[-–—]\s*.+/, // Lines starting with dashes
  /^\s*(?:نرى|ننظر|نسمع|نلاحظ|نشهد|نشاهد|نلمس|نشعر|نصدق|نفهم|نصدق|نشك|نتمنى|نأمل|نخشى|نخاف|نحب|نكره|نحسد|نغبط|ن admire|نحترم)/,
  /\s+(?:يقول|تقول|قال|قالت|يقوم|تقوم|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يكتب|تكتب|ينظر|تنظر|يبتسم|تبتسم|يقف|تقف|يجلس|تجلس|يدخل|تدخل|يخرج|تخرج|يركض|تركض|يمشي|تمشي|يجري|تجرى|يصرخ|اصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينصر|تنتصر|يخسر|تخسر|يرسم|ترسم|يصمم|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلن|يعلم|تعلن)\s+/,
];

const BULLET_CHARACTER_PATTERN = /^\s*[•·●○■▪▫–—‣⁃]([^:]+):(.*)/;

/**
 * Check if text matches action description patterns
 */
export function isActionDescription(textContent: string): boolean {
  for (const pattern of ACTION_DESCRIPTION_PATTERNS) {
    if (pattern.test(textContent)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if text is long action description
 */
export function isLongActionDescription(textContent: string): boolean {
  const wordCount = textContent.split(/\s+/).length;
  return wordCount > 15;
}

/**
 * Parse bullet point with character and dialogue
 */
export function parseBulletCharacterLine(textContent: string): {
  characterName: string;
  dialogueText: string;
} | null {
  const match = textContent.match(BULLET_CHARACTER_PATTERN);

  if (match && match[1] && match[2]) {
    return {
      characterName: match[1].trim(),
      dialogueText: match[2].trim(),
    };
  }

  return null;
}

/**
 * Create character element
 */
export function createCharacterElement(
  characterName: string,
  getFormatStyles: (format: string) => React.CSSProperties
): HTMLDivElement {
  const element = document.createElement("div");
  element.className = "character";
  element.textContent = characterName + ":";
  Object.assign(element.style, getFormatStyles("character"));
  return element;
}

/**
 * Create dialogue element
 */
export function createDialogueElement(
  dialogueText: string,
  getFormatStyles: (format: string) => React.CSSProperties
): HTMLDivElement {
  const element = document.createElement("div");
  element.className = "dialogue";
  element.textContent = dialogueText;
  Object.assign(element.style, getFormatStyles("dialogue"));
  return element;
}

/**
 * Convert element to action format
 */
export function convertToActionFormat(
  element: HTMLElement,
  getFormatStyles: (format: string) => React.CSSProperties
): void {
  element.className = "action";
  Object.assign(element.style, getFormatStyles("action"));
}

/**
 * Check if dialogue should be converted to action
 */
export function shouldConvertDialogueToAction(textContent: string): boolean {
  if (isActionDescription(textContent)) {
    return true;
  }

  if (isLongActionDescription(textContent)) {
    return true;
  }

  return false;
}
