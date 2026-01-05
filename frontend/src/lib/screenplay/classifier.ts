/**
 * Screenplay Classifier - معالج نصوص السيناريو العربي
 *
 * هذا الملف يحتوي على class متقدم لتصنيف نصوص السيناريو العربية.
 * يدعم اكتشاف:
 * - رؤوس المشاهد (مشهد 1)
 * - أسماء الشخصيات
 * - الحوار
 * - خطوط الحركة
 * - الانتقالات (قطع، مزج، ذوبان)
 * - البسملة
 *
 * @module lib/screenplay/classifier
 */

/**
 * أنواع الخطوط في السيناريو
 */
export type LineType =
  | 'basmala'
  | 'scene-header-top-line'
  | 'scene-header-1'
  | 'scene-header-2'
  | 'scene-header-3'
  | 'character'
  | 'dialogue'
  | 'parenthetical'
  | 'action'
  | 'transition'
  | 'unknown';

/**
 * سياق الحوار
 */
export interface DialogueContext {
  inBlock: boolean;
  character: string | null;
}

/**
 * سياق السطر
 */
export interface LineContext {
  previousLineType: LineType;
  dialogueState: DialogueContext;
}

/**
 * ScreenplayClassifier - مصنف نصوص السيناريو العربي
 *
 * class متقدم لتصنيف نصوص السيناريو العربية مع دعم كامل لـ:
 * - 60+ فعل عربي للحركة
 * - اكتشاف رؤوس المشاهد
 * - اكتشاف أسماء الشخصيات
 * - اكتشاف الحوار
 * - اكتشاف الانتقالات
 * - معالجة التشكيل
 * - تحويل الأرقام الشرقية إلى غربية
 */
export class ScreenplayClassifier {
  // === Constants ===

  /**
   * نطاق الحروف العربية
   */
  static readonly AR_AB_LETTER = '\u0600-\u06FF';

  /**
   * الأرقام الشرقية (٠١٢٣٤٥٦٧٨٩)
   */
  static readonly EASTERN_DIGITS = '٠٢٣٤٥٦٧٨٩';

  /**
   * الأرقام الغربية (0123456789)
   */
  static readonly WESTERN_DIGITS = '0123456789';

  /**
   * قائمة أفعال الحركة العربية (60+ فعل)
   */
  static readonly ACTION_VERB_LIST = 'يدخل|يخرج|ينظر|يرفع|تبتسم|ترقد|تقف|يبسم|يضع|يقول|تنظر|تربت|تقوم|يشق|تشق|تضرب|يسحب|يلتفت|يقف|يجلس|تجلس|يجري|تجري|يمشي|تمشي|يركض|تركض|يصرخ|اصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يكتب|تكتب|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينصر|تنتصر|يخسر|تخسر|يكتب|تكتب|يرسم|ترسم|يصمم|تخطط|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلن|يعلم|تعلن|يوجه|وجه|يسافر|تسافر|يعود|تعود|يرحل|ترحل|يبقى|تبقى|ينتقل|تنتقل|يتغير|تتغير|ينمو|تنمو|يتطور|تتطور|يواجه|تواجه|يحل|تحل|يفشل|تفشل|ينجح|تنجح|يحقق|تحقن|يبدأ|تبدأ|ينهي|تنهي|يوقف|توقف|يستمر|تستمر|ينقطع|تنقطع|يرتبط|ترتبط|ينفصل|تنفصل|يتزوج|تتزوج|يطلق|يطلق|يولد|تولد|يكبر|تكبر|يشيخ|تشيخ|يمرض|تمرض|يشفي|تشفي|يصاب|تصيب|يتعافى|تعافي|يموت|يقتل|تقتل|يُقتل|تُقتل|يختفي|تختفي|يظهر|تظهر|يختبئ|تخبوء|يطلب|تطلب|يأمر|تأمر|يمنع|تمنع|يسمح|تسمح|يوافق|توافق|يرفض|ترفض|يعتذر|تعتذر|يغفر|يغفر|يحب|تحب|يبغض|يبغض|يكره|يكره|يحسد|تحسد|يغبط|يغبط|ي admire|تعجب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب';

  // === Regex Patterns ===

  /**
   * Regex للأفعال الحركية
   */
  static readonly ACTION_VERBS = new RegExp('^(?:' + ScreenplayClassifier.ACTION_VERB_LIST + ')(?:\\s|$)');

  /**
   * Regex للبسملة
   */
  static readonly BASMALA_RE = /^\s*بسم\s+الله\s+الرحمن\s+الرحيم\s*$/i;

  /**
   * Regex لرأس المشهد (مشهد 1، مشهد 2، إلخ)
   */
  static readonly SCENE_PREFIX_RE = /^\s*(?:مشهد|م\.)\s*([0-9]+)\s*(?:[-–—:،]\s*)?(.*)$/i;

  /**
   * جزء الوقت (ليل، نهار، صباح، مساء، إلخ)
   */
  static readonly INOUT_PART = '(?:داخلي|خارجي|د\\.|خ\\.)';

  /**
   * جزء المكان (داخلي، خارجي)
   */
  static readonly TIME_PART = '(?:ليل|نهار|ل\\.|ن\\.|صباح|مساء|فجر|ظهر|عصر|مغرب|الغروب|الفجر)';

  /**
   * Regex للوقت والمكان
   */
  static readonly TL_REGEX = new RegExp('(?:' + ScreenplayClassifier.INOUT_PART + '\\s*-?\\s*' + ScreenplayClassifier.TIME_PART + '\\s*|' + ScreenplayClassifier.TIME_PART + '\\s*-?\\s*' + ScreenplayClassifier.INOUT_PART + ')', 'i');

  /**
   * Regex لخط الشخصية
   */
  static readonly CHARACTER_RE = new RegExp('^\\s*(?:صوت\\s+)?[' + ScreenplayClassifier.AR_AB_LETTER + '][' + ScreenplayClassifier.AR_AB_LETTER + '\\s]{0,30}:?\\s*$');

  /**
   * Regex للانتقالات
   */
  static readonly TRANSITION_RE = /^\s*(?:قطع|قطع\s+إلى|إلى|مزج|ذوبان|خارج\s+المشهد|CUT TO:|FADE IN:|FADE OUT:)\s*$/i;

  /**
   * Regex للأقواس (parenthetical)
   */
  static readonly PARENTHETICAL_SHAPE_RE = /^\s*\(.*?\)\s*$/;

  // === Patterns Object ===

  /**
   * أنماط رؤوس المشاهد
   */
  Patterns: {
    sceneHeader1: RegExp;
    sceneHeader2: {
      time: RegExp;
      inOut: RegExp;
    };
    sceneHeader3: RegExp;
  };

  constructor() {
    const c = (regex: RegExp) => regex;
    this.Patterns = {
      sceneHeader1: c(/^\s*مشهد\s*\d+\s*$/i),
      sceneHeader2: {
        time: /(ليل|نهار|صباح|مساء|فجر|ظهر|عصر| المغرب|الغروب|الفجر)/i,
        inOut: /(داخلي|خارجي|د\.|خ\.)/i,
      },
      sceneHeader3: c(/^(مسجد|بيت|منزل|شارع|حديقة|مدرسة|جامعة|مكتب|محل|مستشفى|مطعم|فندق|سيارة|غرفة|قاعة|ممر|سطح|ساحة|مقبرة|مخبز|مكتبة|نهر|بحر|جبل|غابة|سوق|مصنع|بنك|محكمة|سجن|موقف|محطة|مطار|ميناء|كوبرى|نفق|مبنى|قصر|قصر عدلي|فندق|نادي|ملعب|ملهى|بار|كازينو|متحف|مسرح|سينما|معرض|مزرعة|مصنع|مختبر|مستودع|محل|مطعم|مقهى|موقف|مكتب|شركة|كهف|الكهف|غرفة الكهف|كهف المرايا)/i),
    };
  }

  // === Helper Functions ===

  /**
   * تحويل الأرقام الشرقية إلى غربية
   * @param s - النص المراد تحويله
   * @returns النص المحول
   */
  static easternToWesternDigits(s: string): string {
    const map: { [key: string]: string } = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    return s.replace(/[٠٢٣٤٥٦٧٨٩]/g, char => map[char]);
  }

  /**
   * إزالة التشكيل من النص العربي
   * @param s - النص المراد معالجته
   * @returns النص بدون تشكيل
   */
  static stripTashkeel(s: string): string {
    return s.replace(/[\u064B-\u065F\u0670]/g, '');
  }

  /**
   * توحيد الفواصل
   * @param s - النص المراد معالجته
   * @returns النص الموحد
   */
  static normalizeSeparators(s: string): string {
    return s.replace(/[-–—]/g, '-').replace(/[،,]/g, ',').replace(/\s+/g, ' ');
  }

  /**
   * توحيد السطر
   * @param input - السطر المراد توحيده
   * @returns السطر الموحد
   */
  static normalizeLine(input: string): string {
    return ScreenplayClassifier.stripTashkeel(
      ScreenplayClassifier.normalizeSeparators(input)
    ).replace(/[\u200f\u200e\ufeff\t]+/g, '').trim();
  }

  /**
   * استخراج النص داخل الأقواس
   * @param s - السطر المراد معالجته
   * @returns النص داخل الأقواس
   */
  static textInsideParens(s: string): string {
    const match = s.match(/^\s*\((.*?)\)\s*$/);
    return match ? match[1] : '';
  }

  /**
   * التحقق من وجود علامات ترقيم الجملة
   * @param s - السطر المراد فحصه
   * @returns true إذا كان هناك علامات ترقيم
   */
  static hasSentencePunctuation(s: string): boolean {
    return /[\.!\؟\?]/.test(s);
  }

  /**
   * حساب عدد الكلمات في السطر
   * @param s - السطر المراد فحصه
   * @returns عدد الكلمات
   */
  static wordCount(s: string): number {
    return s.trim() ? s.trim().split(/\s+/).length : 0;
  }

  /**
   * التحقق من أن السطر فارغ
   * @param line - السطر المراد فحصه
   * @returns true إذا كان السطر فارغاً
   */
  static isBlank(line: string): boolean {
    return !line || line.trim() === '';
  }

  // === Type Checkers ===

  /**
   * التحقق من أن السطر هو بسملة
   * يدعم التنسيقات:
   * - بسم الله الرحمن الرحيم
   * - }بسم الله الرحمن الرحيم{
   *
   * @param line - السطر المراد فحصه
   * @returns true إذا كان السطر بسملة
   */
  static isBasmala(line: string): boolean {
    const normalizedLine = line.trim();
    const basmalaPatterns = [
      /^بسم\s+الله\s+الرحمن\s+الرحيم$/i,
      /^[{}]*\s*بسم\s+الله\s+الرحمن\s+الرحيم\s*[{}]*$/i
    ];

    return basmalaPatterns.some(pattern => pattern.test(normalizedLine));
  }

  /**
   * التحقق من أن السطر هو بداية رأس مشهد
   * @param line - السطر المراد فحصه
   * @returns true إذا كان السطر بداية رأس مشهد
   */
  static isSceneHeaderStart(line: string): boolean {
    return ScreenplayClassifier.SCENE_PREFIX_RE.test(line);
  }

  /**
   * التحقق من أن السطر هو انتقال
   * @param line - السطر المراد فحصه
   * @returns true إذا كان السطر انتقالاً
   */
  static isTransition(line: string): boolean {
    return ScreenplayClassifier.TRANSITION_RE.test(line);
  }

  /**
   * التحقق من أن السطر بين أقواس
   * @param line - السطر المراد فحصه
   * @returns true إذا كان السطر بين أقواس
   */
  static isParenShaped(line: string): boolean {
    return ScreenplayClassifier.PARENTHETICAL_SHAPE_RE.test(line);
  }

  /**
   * التحقق من أن السطر هو خط شخصية
   * @param line - السطر المراد فحصه
   * @param context - سياق السطر
   * @returns true إذا كان السطر خط شخصية
   */
  static isCharacterLine(line: string, context?: { lastFormat: string; isInDialogueBlock: boolean }): boolean {
    if (ScreenplayClassifier.isSceneHeaderStart(line) ||
        ScreenplayClassifier.isTransition(line) ||
        ScreenplayClassifier.isParenShaped(line)) {
      return false;
    }

    const wordCount = ScreenplayClassifier.wordCount(line);
    if (wordCount > 7) return false;

    const normalized = ScreenplayClassifier.normalizeLine(line);
    if (ScreenplayClassifier.ACTION_VERBS.test(normalized)) return false;

    const hasColon = line.includes(':');
    const arabicCharacterPattern = /^[\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+[:\s]*$/;

    if (hasColon && line.trim().endsWith(':')) {
      return true;
    }

    if (arabicCharacterPattern.test(line)) {
      return true;
    }

    if (!hasColon) return false;

    if (context) {
      if (context.isInDialogueBlock) {
        if (context.lastFormat === 'character') {
          return ScreenplayClassifier.CHARACTER_RE.test(line) || arabicCharacterPattern.test(line);
        }
        if (context.lastFormat === 'dialogue') {
          return false;
        }
      }

      if (context.lastFormat === 'action' && hasColon) {
        return ScreenplayClassifier.CHARACTER_RE.test(line) || arabicCharacterPattern.test(line);
      }
    }

    return ScreenplayClassifier.CHARACTER_RE.test(line) || arabicCharacterPattern.test(line);
  }

  /**
   * التحقق من أن السطر هو خط حركة
   * @param line - السطر المراد فحصه
   * @returns true إذا كان السطر خط حركة
   */
  static isLikelyAction(line: string): boolean {
    if (ScreenplayClassifier.isBlank(line) ||
        ScreenplayClassifier.isBasmala(line) ||
        ScreenplayClassifier.isSceneHeaderStart(line) ||
        ScreenplayClassifier.isTransition(line) ||
        ScreenplayClassifier.isCharacterLine(line) ||
        ScreenplayClassifier.isParenShaped(line)) {
      return false;
    }

    const normalized = ScreenplayClassifier.normalizeLine(line);

    const actionStartPatterns = [
      /^\s*[-–—]?\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/,
      /^\s*[-–—]?\s*[ي|ت][\u0600-\u06FF]+\s+(?:[^\s\u0600-\u06FF]*\s*)*[^\s\u0600-\u06FF]/
    ];

    for (const pattern of actionStartPatterns) {
      if (pattern.test(line)) {
        return true;
      }
    }

    if (ScreenplayClassifier.ACTION_VERBS.test(normalized)) {
      return true;
    }

    if (ScreenplayClassifier.hasSentencePunctuation(line) && !line.includes(':')) {
      const actionIndicators = [
        'يدخل', 'يخرج', 'ينظر', 'يرفع', 'تبتسم', 'ترقد', 'تقف', 'يبسم', 'يضع', 'تنظر', 'تربت', 'تقوم', 'يشق', 'تشق', 'تضرب', 'يسحب', 'يلتفت', 'يقف', 'يجلس', 'تجلس', 'يجري', 'تجري', 'يمشي', 'تمشي', 'يركض', 'تركض', 'يصرخ', 'اصرخ', 'يبكي', 'تبكي', 'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام', 'يستيقظ', 'تستيقظ', 'يكتب', 'تكتب', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ', 'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق', 'يبدأ', 'تبدأ', 'ينتهي', 'تنتهي', 'يذهب', 'تذهب', 'يعود', 'تعود', 'يأتي', 'تأتي', 'يموت', 'تموت', 'يحيا', 'تحيا', 'يقاتل', 'تقاتل', 'ينصر', 'تنتصر', 'يخسر', 'تخسر', 'يرسم', 'ترسم', 'يصمم', 'تخطط', 'يقرر', 'تقرر', 'يفكر', 'تفكر', 'يتذكر', 'تذكر', 'يحاول', 'تحاول', 'يستطيع', 'تستطيع', 'يريد', 'تريد', 'يحتاج', 'تحتاج', 'يبحث', 'تبحث', 'يجد', 'تجد', 'يفقد', 'تفقد', 'يحمي', 'تحمي', 'يراقب', 'تراقب', 'يخفي', 'تخفي', 'يكشف', 'تكشف', 'يكتشف', 'تكتشف', 'يعرف', 'تعرف', 'يتعلم', 'تعلن', 'يعلم', 'تعلن', 'يوجه', 'توجه', 'يسافر', 'تسافر', 'يرحل', 'ترحل', 'يبقى', 'تبقى', 'ينتقل', 'تنتقل', 'يتغير', 'تتغير', 'ينمو', 'تنمو', 'يتطور', 'تتطور', 'يواجه', 'تواجه', 'يحل', 'تحل', 'يفشل', 'تفشل', 'ينجح', 'تنجح', 'يحقق', 'تحقن', 'يوقف', 'توقف', 'ينقطع', 'تنقطع', 'يرتبط', 'ترتبط', 'ينفصل', 'تنفصل', 'يتزوج', 'تتزوج', 'يطلق', 'يولد', 'تولد', 'يكبر', 'تكبر', 'يشيخ', 'تشيخ', 'يمرض', 'تمرض', 'يشفي', 'تشفي', 'يصاب', 'تصيب', 'يتعافى', 'تعافي', 'يقتل', 'تقتل', 'يُقتل', 'تُقتل', 'يختفي', 'تختفي', 'يظهر', 'تظهر', 'يختبئ', 'تخبوء', 'يطلب', 'تطلب', 'يأمر', 'تأمر', 'يمنع', 'تمنع', 'يسمح', 'تسمح', 'يوافق', 'توافق', 'يرفض', 'ترفض', 'يعتذر', 'تعتذر', 'يغفر', 'يحب', 'تحب', 'يبغض', 'يكره', 'يحسد', 'تحسد', 'يغبط', 'تعجب'
      ];

      for (const indicator of actionIndicators) {
        if (normalized.includes(indicator)) {
          return true;
        }
      }

      return false;
    }

    if (ScreenplayClassifier.wordCount(line) > 5 && !line.includes(':')) {
      const actionIndicators = [
        'يدخل', 'يخرج', 'ينظر', 'يرفع', 'تبتسم', 'ترقد', 'تقف', 'يبسم', 'يضع', 'تنظر', 'تربت', 'تقوم', 'يشق', 'تشق', 'تضرب', 'يسحب', 'يلتفت', 'يقف', 'يجلس', 'تجلس', 'يجري', 'تجري', 'يمشي', 'تمشي', 'يركض', 'تركض', 'يصرخ', 'اصرخ', 'يبكي', 'تبكي', 'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام', 'يستيقظ', 'تستيقظ', 'يكتب', 'تكتب', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ', 'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق', 'يبدأ', 'تبدأ', 'ينتهي', 'تنتهي', 'يذهب', 'تذهب', 'يعود', 'تعود', 'يأتي', 'تأتي', 'يموت', 'تموت', 'يحيا', 'تحيا', 'يقاتل', 'تقاتل', 'ينصر', 'تنتصر', 'يخسر', 'تخسر', 'يرسم', 'ترسم', 'يصمم', 'تخطط', 'يقرر', 'تقرر', 'يفكر', 'تفكر', 'يتذكر', 'تذكر', 'يحاول', 'تحاول', 'يستطيع', 'تستطيع', 'يريد', 'تريد', 'يحتاج', 'تحتاج', 'يبحث', 'تبحث', 'يجد', 'تجد', 'يفقد', 'تفقد', 'يحمي', 'تحمي', 'يراقب', 'تراقب', 'يخفي', 'تخفي', 'يكشف', 'تكشف', 'يكتشف', 'تكتشف', 'يعرف', 'تعرف', 'يتعلم', 'تعلن', 'يعلم', 'تعلن', 'يوجه', 'توجه', 'يسافر', 'تسافر', 'يرحل', 'ترحل', 'يبقى', 'تبقى', 'ينتقل', 'تنتقل', 'يتغير', 'تتغير', 'ينمو', 'تنمو', 'يتطور', 'تتطور', 'يواجه', 'تواجه', 'يحل', 'تحل', 'يفشل', 'تفشل', 'ينجح', 'تنجح', 'يحقق', 'تحقن', 'يوقف', 'توقف', 'ينقطع', 'تنقطع', 'يرتبط', 'ترتبط', 'ينفصل', 'تنفصل', 'يتزوج', 'تتزوج', 'يطلق', 'يولد', 'تولد', 'يكبر', 'تكبر', 'يشيخ', 'تشيخ', 'يمرض', 'تمرض', 'يشفي', 'تشفي', 'يصاب', 'تصيب', 'يتعافى', 'تعافي', 'يقتل', 'تقتل', 'يُقتل', 'تُقتل', 'يختفي', 'تختفي', 'يظهر', 'تظهر', 'يختبئ', 'تخبوء', 'يطلب', 'تطلب', 'يأمر', 'تأمر', 'يمنع', 'تمنع', 'يسمح', 'تسمح', 'يوافق', 'توافق', 'يرفض', 'ترفض', 'يعتذر', 'تعتذر', 'يغفر', 'يحب', 'تحب', 'يبغض', 'يكره', 'يحسد', 'تحسد', 'يغبط', 'تعجب'
      ];

      for (const indicator of actionIndicators) {
        if (normalized.includes(indicator)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * تصنيف السطر
   * @param line - السطر المراد تصنيفه
   * @param context - سياق السطر
   * @returns نوع السطر
   */
  classifyLine(line: string, context?: LineContext): LineType {
    // التحقق من البسملة أولاً
    if (ScreenplayClassifier.isBasmala(line)) {
      return 'basmala';
    }

    // التحقق من رؤوس المشاهد
    if (ScreenplayClassifier.isSceneHeaderStart(line)) {
      return 'scene-header-top-line';
    }

    // التحقق من الانتقالات
    if (ScreenplayClassifier.isTransition(line)) {
      return 'transition';
    }

    // التحقق من خطوط الشخصيات
    if (ScreenplayClassifier.isCharacterLine(line, context ? {
      lastFormat: context.previousLineType,
      isInDialogueBlock: context.dialogueState.inBlock,
    } : undefined)) {
      return 'character';
    }

    // التحقق من parenthetical
    if (ScreenplayClassifier.isParenShaped(line)) {
      return 'parenthetical';
    }

    // التحقق من خطوط الحركة
    if (ScreenplayClassifier.isLikelyAction(line)) {
      return 'action';
    }

    // الافتراضي هو حوار
    return 'dialogue';
  }
}

/**
 * التصدير الافتراضي
 */
export default ScreenplayClassifier;
