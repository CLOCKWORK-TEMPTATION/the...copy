/**
 * Action classification helpers for screenplay editor
 * Extracted to reduce isLikelyAction complexity
 */

/**
 * Common action verbs used for action detection
 */
export const ACTION_INDICATORS = [
  "يدخل",
  "يخرج",
  "ينظر",
  "يرفع",
  "تبتسم",
  "ترقد",
  "تقف",
  "يبسم",
  "يضع",
  "تنظر",
  "تربت",
  "تقوم",
  "يشق",
  "تشق",
  "تضرب",
  "يسحب",
  "يلتفت",
  "يقف",
  "يجلس",
  "تجلس",
  "يجري",
  "تجري",
  "يمشي",
  "تمشي",
  "يركض",
  "تركض",
  "يصرخ",
  "اصرخ",
  "يبكي",
  "تبكي",
  "يضحك",
  "تضحك",
  "يغني",
  "تغني",
  "يرقص",
  "ترقص",
  "يأكل",
  "تأكل",
  "يشرب",
  "تشرب",
  "ينام",
  "تنام",
  "يستيقظ",
  "تستيقظ",
  "يكتب",
  "تكتب",
  "يقرأ",
  "تقرأ",
  "يسمع",
  "تسمع",
  "يشم",
  "تشم",
  "يلمس",
  "تلمس",
  "يأخذ",
  "تأخذ",
  "يعطي",
  "تعطي",
  "يفتح",
  "تفتح",
  "يغلق",
  "تغلق",
  "يبدأ",
  "تبدأ",
  "ينتهي",
  "تنتهي",
  "يذهب",
  "تذهب",
  "يعود",
  "تعود",
  "يأتي",
  "تأتي",
  "يموت",
  "تموت",
  "يحيا",
  "تحيا",
  "يقاتل",
  "تقاتل",
  "ينصر",
  "تنتصر",
  "يخسر",
  "تخسر",
  "يرسم",
  "ترسم",
  "يصمم",
  "تخطط",
  "يقرر",
  "تقرر",
  "يفكر",
  "تفكر",
  "يتذكر",
  "تذكر",
  "يحاول",
  "تحاول",
  "يستطيع",
  "تستطيع",
  "يريد",
  "تريد",
  "يحتاج",
  "تحتاج",
  "يبحث",
  "تبحث",
  "يجد",
  "تجد",
  "يفقد",
  "تفقد",
  "يحمي",
  "تحمي",
  "يراقب",
  "تراقب",
  "يخفي",
  "تخفي",
  "يكشف",
  "تكشف",
  "يكتشف",
  "تكتشف",
  "يعرف",
  "تعرف",
  "يتعلم",
  "تعلن",
  "يعلم",
  "يوجه",
  "توجه",
  "يسافر",
  "تسافر",
  "يرحل",
  "ترحل",
  "يبقى",
  "تبقى",
  "ينتقل",
  "تنتقل",
  "يتغير",
  "تتغير",
  "ينمو",
  "تنمو",
  "يتطور",
  "تتطور",
  "يواجه",
  "تواجه",
  "يحل",
  "تحل",
  "يفشل",
  "تفشل",
  "ينجح",
  "تنجح",
  "يحقق",
  "تحقن",
  "يوقف",
  "توقف",
  "ينقطع",
  "تنقطع",
  "يرتبط",
  "ترتبط",
  "ينفصل",
  "تنفصل",
  "يتزوج",
  "تتزوج",
  "يطلق",
  "يولد",
  "تولد",
  "يكبر",
  "تكبر",
  "يشيخ",
  "تشيخ",
  "يمرض",
  "تمرض",
  "يشفي",
  "تشفي",
  "يصاب",
  "تصيب",
  "يتعافى",
  "تعافي",
  "يقتل",
  "تقتل",
  "يُقتل",
  "تُقتل",
  "يختفي",
  "تختفي",
  "يظهر",
  "تظهر",
  "يختبئ",
  "تخبوء",
  "يطلب",
  "تطلب",
  "يامر",
  "تأمر",
  "يمنع",
  "تمنع",
  "يسمح",
  "تسمح",
  "يوافق",
  "توافق",
  "يرفض",
  "ترفض",
  "يعتذر",
  "تعتذر",
  "يغفر",
  "يحب",
  "تحب",
  "يبغض",
  "يكره",
  "يحسد",
  "تحسد",
  "يغبط",
  "تعجب",
];

/**
 * Check if line starts with action pattern
 */
export function startsWithActionPattern(line: string): boolean {
  const actionStartPatterns = [
    /^\s*[-–—]?\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/,
    /^\s*[-–—]?\s*[ي|ت][\u0600-\u06FF]+(?:\s+[^\s\u0600-\u06FF]+)*/, // Simplified: removed nested quantifier
  ];

  return actionStartPatterns.some((pattern) => pattern.test(line));
}

/**
 * Check if normalized line contains action indicators
 */
export function containsActionIndicator(normalizedLine: string): boolean {
  return ACTION_INDICATORS.some((indicator) =>
    normalizedLine.includes(indicator)
  );
}

/**
 * Check if line has action indicators with punctuation
 */
export function hasActionWithPunctuation(
  line: string,
  normalizedLine: string,
  hasPunctuation: (line: string) => boolean
): boolean {
  if (!hasPunctuation(line) || line.includes(":")) {
    return false;
  }
  return containsActionIndicator(normalizedLine);
}

/**
 * Check if long line contains action indicators
 */
export function isLongLineWithAction(
  line: string,
  normalizedLine: string,
  wordCount: (line: string) => number
): boolean {
  if (wordCount(line) <= 5 || line.includes(":")) {
    return false;
  }
  return containsActionIndicator(normalizedLine);
}
