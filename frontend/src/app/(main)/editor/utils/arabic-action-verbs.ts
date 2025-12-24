/**
 * Arabic action verbs and indicators for screenplay classification
 * Extracted to reduce code complexity in the main editor file
 */

/**
 * Comprehensive list of Arabic action verbs
 */
export const ARABIC_ACTION_VERBS = [
  // Entry/Exit verbs
  "يدخل",
  "يخرج",
  "تدخل",
  "تخرج",

  // Looking/Observing verbs
  "ينظر",
  "تنظر",
  "يرفع",
  "ترفع",

  // Emotional expressions
  "يبتسم",
  "تبتسم",
  "يبسم",
  "تبسم",

  // Positioning verbs
  "يقف",
  "تقف",
  "يجلس",
  "تجلس",
  "يرقد",
  "ترقد",
  "يقوم",
  "تقوم",

  // Placement/Manipulation verbs
  "يضع",
  "تضع",
  "يربت",
  "تربت",
  "يشق",
  "تشق",
  "يضرب",
  "تضرب",
  "يسحب",
  "تسحب",

  // Turning/Movement verbs
  "يلتفت",
  "تلتفت",
  "يجري",
  "تجري",
  "يمشي",
  "تمشي",
  "يركض",
  "تركض",

  // Vocal expressions
  "يصرخ",
  "تصرخ",
  "اصرخ",
  "يقول",
  "تقول",

  // Emotional actions
  "يبكي",
  "تبكي",
  "يضحك",
  "تضحك",

  // Entertainment actions
  "يغني",
  "تغني",
  "يرقص",
  "ترقص",

  // Consumption verbs
  "يأكل",
  "تأكل",
  "يشرب",
  "تشرب",

  // Rest/Awakening verbs
  "ينام",
  "تنام",
  "يستيقظ",
  "تستيقظ",

  // Communication verbs
  "يكتب",
  "تكتب",
  "يقرأ",
  "تقرأ",

  // Sensory verbs
  "يسمع",
  "تسمع",
  "يشم",
  "تشم",
  "يلمس",
  "تلمس",

  // Exchange verbs
  "يأخذ",
  "تأخذ",
  "يعطي",
  "تعطي",

  // Open/Close verbs
  "يفتح",
  "تفتح",
  "يغلق",
  "تغلق",

  // Begin/End verbs
  "يبدأ",
  "تبدأ",
  "ينتهي",
  "تنتهي",

  // Movement direction verbs
  "يذهب",
  "تذهب",
  "يعود",
  "تعود",
  "يأتي",
  "تأتي",

  // Life/Death verbs
  "يموت",
  "تموت",
  "يحيا",
  "تحيا",

  // Conflict verbs
  "يقاتل",
  "تقاتل",
  "ينتصر",
  "تنتصر",
  "يخسر",
  "تخسر",

  // Creative verbs
  "يرسم",
  "ترسم",
  "يصمم",
  "تصمم",
  "يخطط",
  "تخطط",

  // Decision/Thinking verbs
  "يقرر",
  "تقرر",
  "يفكر",
  "تفكر",
  "يتذكر",
  "تتذكر",

  // Ability/Will verbs
  "يحاول",
  "تحاول",
  "يستطيع",
  "تستطيع",
  "يريد",
  "تريد",
  "يحتاج",
  "تحتاج",

  // Search/Find verbs
  "يبحث",
  "تبحث",
  "يجد",
  "تجد",
  "يفقد",
  "تفقد",

  // Protection verbs
  "يحمي",
  "تحمي",
  "يراقب",
  "تراقب",

  // Concealment/Revelation verbs
  "يخفي",
  "تخفي",
  "يكشف",
  "تكشف",
  "يكتشف",
  "تكتشف",

  // Knowledge verbs
  "يعرف",
  "تعرف",
  "يتعلم",
  "تتعلم",
  "يعلم",
  "تعلم",
  "يعلن",
  "تعلن",

  // Direction verbs
  "يوجه",
  "توجه",

  // Travel verbs
  "يسافر",
  "تسافر",
  "يرحل",
  "ترحل",
  "يبقى",
  "تبقى",
  "ينتقل",
  "تنتقل",

  // Change/Development verbs
  "يتغير",
  "تتغير",
  "ينمو",
  "تنمو",
  "يتطور",
  "تتطور",

  // Problem-solving verbs
  "يواجه",
  "تواجه",
  "يحل",
  "تحل",
  "يفشل",
  "تفشل",
  "ينجح",
  "تنجح",
  "يحقق",
  "تحقق",

  // Continuity verbs
  "يوقف",
  "توقف",
  "يستمر",
  "تستمر",
  "ينقطع",
  "تنقطع",

  // Relationship verbs
  "يرتبط",
  "ترتبط",
  "ينفصل",
  "تنفصل",
  "يتزوج",
  "تتزوج",
  "يطلق",
  "تطلق",

  // Life stages verbs
  "يولد",
  "تولد",
  "يكبر",
  "تكبر",
  "يشيخ",
  "تشيخ",

  // Health verbs
  "يمرض",
  "تمرض",
  "يشفى",
  "تشفى",
  "يصاب",
  "تصاب",
  "يتعافى",
  "تتعافى",

  // Violence verbs
  "يقتل",
  "تقتل",
  "يُقتل",
  "تُقتل",

  // Visibility verbs
  "يختفي",
  "تختفي",
  "يظهر",
  "تظهر",
  "يختبئ",
  "تختبئ",

  // Request/Command verbs
  "يطلب",
  "تطلب",
  "يأمر",
  "تأمر",
  "يمنع",
  "تمنع",
  "يسمح",
  "تسمح",

  // Agreement verbs
  "يوافق",
  "توافق",
  "يرفض",
  "ترفض",

  // Apology/Forgiveness verbs
  "يعتذر",
  "تعتذر",
  "يغفر",
  "تغفر",

  // Emotion verbs
  "يحب",
  "تحب",
  "يبغض",
  "تبغض",
  "يكره",
  "تكره",
  "يحسد",
  "تحسد",
  "يغبط",
  "تغبط",
  "يعجب",
  "تعجب",

  // Additional common verbs
  "نرى",
  "ننظر",
  "نسمع",
  "نلاحظ",
  "يبدو",
  "يكون",
  "يوجد",
  "توجد",
] as const;

/**
 * Set of action verbs for fast lookup
 */
export const ACTION_VERBS_SET = new Set(ARABIC_ACTION_VERBS) as Set<string>;

/**
 * Check if a word is an action verb
 */
export function isActionVerb(word: string): boolean {
  return ACTION_VERBS_SET.has(word);
}

/**
 * Check if text contains any action verb
 */
export function containsActionVerb(text: string): boolean {
  return ARABIC_ACTION_VERBS.some((verb) => text.includes(verb));
}

/**
 * Action start patterns for detecting action lines
 */
export const ACTION_START_PATTERNS = [
  /^\s*[-–—]?\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/,
  /^\s*[-–—]?\s*[ي|ت][\u0600-\u06FF]+\s+(?:[^\s\u0600-\u06FF]+\s*)*[^\s\u0600-\u06FF]/, // Verbs starting with ي or ت
];

/**
 * Check if line matches action start patterns
 */
export function matchesActionStartPattern(line: string): boolean {
  return ACTION_START_PATTERNS.some((pattern) => pattern.test(line));
}
