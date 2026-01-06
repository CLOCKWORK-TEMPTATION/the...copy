import * as React from "react";

// ==================== HELPER FUNCTIONS ====================

export const toCssString = (style: React.CSSProperties) => {
    return Object.entries(style)
        .map(([k, v]) => {
            const cssKey = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
            return `${cssKey}: ${v}`;
        })
        .join("; ");
};

export const escapeHtml = (text: string) => {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// ==================== ARABIC SCREENPLAY CLASSIFIER (FULL SOURCE) ====================

export class ScreenplayClassifier {
    // Constants from source
    static readonly AR_AB_LETTER = '\\u0600-\\u06FF';
    static readonly EASTERN_DIGITS = '٠١٢٣٤٥٦٧٨٩';
    static readonly WESTERN_DIGITS = '0123456789';
    static readonly ACTION_VERB_LIST = 'يدخل|يخرج|ينظر|يرفع|تبتسم|ترقد|تقف|يبسم|يضع|يقول|تنظر|تربت|تقوم|يشق|تشق|تضرب|يسحب|يلتفت|يقف|يجلس|تجلس|يجري|تجري|يمشي|تمشي|يركض|تركض|يصرخ|اصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يكتب|تكتب|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينصر|تنتصر|يخسر|تخسر|يكتب|تكتب|يرسم|ترسم|يصمم|تصمم|يخطط|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تتذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تتعلم|يعلم|تعلم|يوجه|توجه|يسافر|تسافر|يعود|تعود|يرحل|ترحل|يبقى|تبقى|ينتقل|تنتقل|يتغير|تتغير|ينمو|تنمو|يتطور|تتطور|يواجه|تواجه|يحل|تحل|يفشل|تفشل|ينجح|تنجح|يحقق|تحقق|يبدأ|تبدأ|ينهي|تنهي|يوقف|توقف|يستمر|تستمر|ينقطع|تنقطع|يرتبط|ترتبط|ينفصل|تنفصل|يتزوج|تتزوج|يطلق|يطلق|يولد|تولد|يكبر|تكبر|يشيخ|تشيخ|يمرض|تمرض|يشفي|تشفي|يصاب|تصاب|يتعافى|تتعافى|يموت|يقتل|تقتل|يُقتل|تُقتل|يختفي|تختفي|يظهر|تظهر|يختبئ|تختبئ|يطلب|تطلب|يأمر|تأمر|يمنع|تمنع|يسمح|تسمح|يوافق|توافق|يرفض|ترفض|يعتذر|تعتذر|يغفر|يغفر|يحب|تحب|يبغض|يبغض|يكره|يكره|يحسد|تحسد|يغبط|يغبط|يعجب|تعجب|يحب|تحب';

    // Regex patterns from source
    static readonly ACTION_VERBS = new RegExp('^(?:' + ScreenplayClassifier.ACTION_VERB_LIST + ')(?:\\s|$)');
    static readonly BASMALA_RE = /^\s*بسم\s+الله\s+الرحمن\s+الرحيم\s*$/i;
    static readonly SCENE_PREFIX_RE = /^\s*(?:مشهد|م\.)\s*([0-9]+)\s*(?:[-–—:،]\s*)?(.*)$/i;
    static readonly INOUT_PART = '(?:داخلي|خارجي|د\\.|خ\\.)';
    static readonly TIME_PART = '(?:ليل|نهار|ل\\.|ن\\.|صباح|مساء|فجر|ظهر|عصر|مغرب|الغروب|الفجر)';
    static readonly TL_REGEX = new RegExp('(?:' + ScreenplayClassifier.INOUT_PART + '\\s*-?\\s*' + ScreenplayClassifier.TIME_PART + '\\s*|' + ScreenplayClassifier.TIME_PART + '\\s*-?\\s*' + ScreenplayClassifier.INOUT_PART + ')', 'i');
    static readonly CHARACTER_RE = new RegExp('^\\s*(?:صوت\\s+)?[' + ScreenplayClassifier.AR_AB_LETTER + '][' + ScreenplayClassifier.AR_AB_LETTER + '\\s]{0,30}:?\\s*$');
    static readonly TRANSITION_RE = /^\s*(?:قطع|قطع\s+إلى|إلى|مزج|ذوبان|خارج\s+المشهد|CUT TO:|FADE IN:|FADE OUT:)\s*$/i;
    static readonly PARENTHETICAL_SHAPE_RE = /^\s*\(.*?\)\s*$/;

    // Patterns object for scene header formatting
    static Patterns = {
        sceneHeader1: /^\s*مشهد\s*\d+\s*$/i,
        sceneHeader2: {
            time: /(ليل|نهار|صباح|مساء|فجر|ظهر|عصر| المغرب|الغروب|الفجر)/i,
            inOut: /(داخلي|خارجي|د\.|خ\.)/i,
        },
        sceneHeader3: /^(مسجد|بيت|منزل|شارع|حديقة|مدرسة|جامعة|مكتب|محل|مستشفى|مطعم|فندق|سيارة|غرفة|قاعة|ممر|سطح|ساحة|مقبرة|مخبز|مكتبة|نهر|بحر|جبل|غابة|سوق|مصنع|بنك|محكمة|سجن|موقف|محطة|مطار|ميناء|كوبرى|نفق|مبنى|قصر|قصر عدلي|فندق|نادي|ملعب|ملهى|بار|كازينو|متحف|مسرح|سينما|معرض|مزرعة|مصنع|مختبر|مستودع|محل|مطعم|مقهى|موقف|مكتب|شركة|كهف|الكهف|غرفة الكهف|كهف المرايا)/i,
    };

    // Helper functions from source
    static easternToWesternDigits(s: string): string {
        const map: { [key: string]: string } = {
            '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
            '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
        };
        return s.replace(/[٠١٢٣٤٥٦٧٨٩]/g, char => map[char]);
    }

    static stripTashkeel(s: string): string {
        return s.replace(/[\u064B-\u065F\u0670]/g, '');
    }

    static normalizeSeparators(s: string): string {
        return s.replace(/[-–—]/g, '-').replace(/[،,]/g, ',').replace(/\s+/g, ' ');
    }

    static normalizeLine(input: string): string {
        return ScreenplayClassifier.stripTashkeel(
            ScreenplayClassifier.normalizeSeparators(input)
        ).replace(/[\u200f\u200e\ufeff\t]+/g, '').trim();
    }

    static textInsideParens(s: string): string {
        const match = s.match(/^\s*\((.*?)\)\s*$/);
        return match ? match[1] : '';
    }

    static hasSentencePunctuation(s: string): boolean {
        return /[\.!\؟\?]/.test(s);
    }

    static wordCount(s: string): number {
        return s.trim() ? s.trim().split(/\s+/).length : 0;
    }

    static isBlank(line: string): boolean {
        return !line || line.trim() === '';
    }

    // Type checkers from source
    static isBasmala(line: string): boolean {
        const normalizedLine = line.trim();
        const basmalaPatterns = [
            /^بسم\s+الله\s+الرحمن\s+الرحيم$/i,
            /^[{}]*\s*بسم\s+الله\s+الرحمن\s+الرحيم\s*[{}]*$/i
        ];
        return basmalaPatterns.some(pattern => pattern.test(normalizedLine));
    }

    static isSceneHeaderStart(line: string): boolean {
        return ScreenplayClassifier.SCENE_PREFIX_RE.test(line);
    }

    static isTransition(line: string): boolean {
        return ScreenplayClassifier.TRANSITION_RE.test(line);
    }

    static isParenShaped(line: string): boolean {
        return ScreenplayClassifier.PARENTHETICAL_SHAPE_RE.test(line);
    }

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

    // CRITICAL: Add isLikelyAction method from source (was missing in target)
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
            const actionIndicators = ScreenplayClassifier.ACTION_VERB_LIST.split('|');
            for (const indicator of actionIndicators) {
                if (normalized.includes(indicator)) {
                    return true;
                }
            }
            return false;
        }

        if (ScreenplayClassifier.wordCount(line) > 5 && !line.includes(':')) {
            const actionIndicators = ScreenplayClassifier.ACTION_VERB_LIST.split('|');
            for (const indicator of actionIndicators) {
                if (normalized.includes(indicator)) {
                    return true;
                }
            }
        }

        return false;
    }
}

// ==================== SCENE HEADER AGENT (FROM SOURCE) ====================

export const SceneHeaderAgent = (
    line: string,
    ctx: any,
    getFormatStylesFn: (type: string) => React.CSSProperties
): { processed: boolean; html: string } | null => {
    const Patterns = ScreenplayClassifier.Patterns;
    const trimmedLine = line.trim();

    // Check for scene header with number and optional time/location info
    const m2 = trimmedLine.match(/^(مشهد\s*\d+)\s*[-–—:،]?\s*(.*)$/i);

    if (m2) {
        const head = escapeHtml(m2[1].trim());
        const rest = m2[2].trim();
        const escapedRest = escapeHtml(rest);

        const getStyle = (type: string) => toCssString(getFormatStylesFn(type));

        if (rest && (Patterns.sceneHeader2.time.test(rest) || Patterns.sceneHeader2.inOut.test(rest))) {
            const styleTop = getStyle('scene-header-top-line');
            const style1 = getStyle('scene-header-1');
            const style2 = getStyle('scene-header-2');

            return {
                html: `<div class="scene-header-top-line" style="${styleTop}">
            <span class="scene-header-1" style="${style1}">${head}</span>
            <span class="scene-header-2" style="${style2}">${escapedRest}</span>
        </div>`,
                processed: true
            };
        } else if (rest) {
            const styleTop = getStyle('scene-header-top-line');
            const style1 = getStyle('scene-header-1');
            const style2 = getStyle('scene-header-2');

            return {
                html: `<div class="scene-header-top-line" style="${styleTop}">
            <span class="scene-header-1" style="${style1}">${head}</span>
            <span class="scene-header-2" style="${style2}">${escapedRest}</span>
        </div>`,
                processed: true
            };
        } else {
            const styleTop = getStyle('scene-header-top-line');
            const style1 = getStyle('scene-header-1');

            return {
                html: `<div class="scene-header-top-line" style="${styleTop}">
            <span class="scene-header-1" style="${style1}">${head}</span>
        </div>`,
                processed: true
            };
        }
    }

    // Check for standalone location names (scene header 3)
    if (Patterns.sceneHeader3.test(trimmedLine)) {
        const style3 = toCssString(getFormatStylesFn('scene-header-3'));
        return {
            html: `<div class="scene-header-3" style="${style3}">${escapeHtml(trimmedLine)}</div>`,
            processed: true
        };
    }

    return null;
};

// ==================== POST-PROCESSING (FULL SOURCE IMPLEMENTATION) ====================

export const postProcessFormatting = (
    htmlResult: string,
    getFormatStyles: (type: string) => React.CSSProperties
): string => {
    if (typeof window === 'undefined') return htmlResult;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlResult;

    const elements = Array.from(tempDiv.children);

    for (let i = 0; i < elements.length - 1; i++) {
        const currentElement = elements[i] as HTMLElement;
        const nextElement = elements[i + 1] as HTMLElement;

        // Check for bullet+character pattern in action lines
        if (currentElement.className === 'action') {
            const textContent = currentElement.textContent || '';
            const bulletCharacterPattern = /^\s*[•·●○■▪▫–—‣⁃]([^:]+):(.*)/;
            const match = textContent.match(bulletCharacterPattern);

            if (match) {
                const characterName = match[1].trim();
                const dialogueText = match[2].trim();

                currentElement.className = 'character';
                currentElement.textContent = characterName + ':';
                Object.assign(currentElement.style, getFormatStyles('character'));

                const dialogueElement = document.createElement('div');
                dialogueElement.className = 'dialogue';
                dialogueElement.textContent = dialogueText;
                Object.assign(dialogueElement.style, getFormatStyles('dialogue'));

                if (nextElement) {
                    tempDiv.insertBefore(dialogueElement, nextElement);
                } else {
                    tempDiv.appendChild(dialogueElement);
                }
            }
        }

        // Check if dialogue should be action (comprehensive patterns from source)
        if (currentElement.className === 'dialogue') {
            const textContent = currentElement.textContent || '';
            const actionPatterns = [
                /^\s*[-–—]?\s*(?:[ي|ت][\u0600-\u06FF]+|نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|يظهر|تظهر)/,
                /^\s*[-–—]\s*.+/,
                /^\s*(?:نرى|ننظر|نسمع|نلاحظ|نشهد|نشاهد|نلمس|نشعر|نصدق|نفهم|نصدق|نشك|نتمنى|نأمل|نخشى|نخاف|نحب|نكره|نحسد|نغبط|نحترم)/,
                /\s+(?:يقول|تقول|قال|قالت|يقوم|تقوم|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يكتب|تكتب|ينظر|تنظر|يبتسم|تبتسم|يقف|تقف|يجلس|تجلس|يدخل|تدخل|يخرج|تخرج|يركض|تركض|يمشي|تمشي|يجري|تجري|يصرخ|تصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينصر|تنتصر|يخسر|تخسر|يرسم|ترسم|يصمم|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلم|يعلم|تعلم)\s+/
            ];

            let isActionDescription = false;
            for (const pattern of actionPatterns) {
                if (pattern.test(textContent)) {
                    isActionDescription = true;
                    break;
                }
            }

            // Additional check from source
            if (!isActionDescription && textContent.length > 20 && ScreenplayClassifier.wordCount(textContent) > 5) {
                isActionDescription = true;
            }

            if (isActionDescription) {
                currentElement.className = 'action';
                const cleanedText = textContent.replace(/^\s*[-–—]\s*/, '');
                currentElement.textContent = cleanedText;
                Object.assign(currentElement.style, getFormatStyles('action'));
            }
        }
    }

    return tempDiv.innerHTML;
};
