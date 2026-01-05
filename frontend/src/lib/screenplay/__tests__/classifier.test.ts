/**
 * Screenplay Classifier Tests
 *
 * اختبارات وحدة لمعالج نصوص السيناريو العربي
 */

import { describe, test, expect } from 'vitest';
import { ScreenplayClassifier } from '../classifier';

describe('ScreenplayClassifier', () => {
  const classifier = new ScreenplayClassifier();

  describe('البسملة', () => {
    test('يجب اكتشاف البسملة بالتنسيق القياسي', () => {
      expect(classifier.isBasmala('بسم الله الرحمن الرحيم')).toBe(true);
    });

    test('يجب اكتشاف البسملة مع الأقواس', () => {
      expect(classifier.isBasmala('}بسم الله الرحمن الرحيم{')).toBe(true);
    });

    test('يجب عدم اكتشاف نص عادي كبسملة', () => {
      expect(classifier.isBasmala('مرحباً بك')).toBe(false);
    });
  });

  describe('رؤوس المشاهد', () => {
    test('يجب اكتشاف رأس مشهد بسيط', () => {
      expect(classifier.isSceneHeaderStart('مشهد 1')).toBe(true);
      expect(classifier.isSceneHeaderStart('مشهد 2')).toBe(true);
    });

    test('يجب اكتشاف رأس مشهد مع اختصار', () => {
      expect(classifier.isSceneHeaderStart('م. 1')).toBe(true);
    });

    test('يجب اكتشاف رأس مشهد مع وقت ومكان', () => {
      expect(classifier.isSceneHeaderStart('مشهد 1 - ليل-داخلي')).toBe(true);
      expect(classifier.isSceneHeaderStart('مشهد 1 - نهار-خارجي')).toBe(true);
    });
  });

  describe('الشخصيات', () => {
    test('يجب اكتشاف خط شخصية مع نقطتين', () => {
      expect(classifier.isCharacterLine('محمد:')).toBe(true);
      expect(classifier.isCharacterLine('فاطمة:')).toBe(true);
    });

    test('يجب اكتشاف خط شخصية مع نص', () => {
      expect(classifier.isCharacterLine('محمد: مرحباً بك')).toBe(true);
    });

    test('يجب عدم اكتشاف خط حركة كشخصية', () => {
      expect(classifier.isCharacterLine('يدخل محمد')).toBe(false);
    });
  });

  describe('الحوار', () => {
    test('يجب اكتشاف الحوار البسيط', () => {
      expect(classifier.isLikelyAction('مرحباً بك')).toBe(false);
    });

    test('يجب اكتشاف حوار طويل', () => {
      expect(classifier.isLikelyAction('هذا حوار طويل جداً يتحدث فيه الشخص عن很多事情 مهمة')).toBe(false);
    });
  });

  describe('الحركة', () => {
    test('يجب اكتشاف خط الحركة مع فعل', () => {
      expect(classifier.isLikelyAction('يدخل محمد')).toBe(true);
      expect(classifier.isLikelyAction('تبتسم فاطمة')).toBe(true);
      expect(classifier.isLikelyAction('يخرج علي')).toBe(true);
    });
  });

  describe('الانتقالات', () => {
    test('يجب اكتشاف انتقال قطع', () => {
      expect(classifier.isTransition('قطع')).toBe(true);
      expect(classifier.isTransition('قطع إلى')).toBe(true);
    });

    test('يجب اكتشاف انتقال مزج', () => {
      expect(classifier.isTransition('مزج')).toBe(true);
    });

    test('يجب اكتشاف انتقال ذوبان', () => {
      expect(classifier.isTransition('ذوبان')).toBe(true);
    });
  });

  describe('التحويل', () => {
    test('يجب تحويل الأرقام الشرقية إلى غربية', () => {
      expect(ScreenplayClassifier.easternToWesternDigits('٠١٢٣')).toBe('0123');
      expect(ScreenplayClassifier.easternToWesternDigits('٤٥٦')).toBe('456');
    });

    test('يجب إزالة التشكيل', () => {
      expect(ScreenplayClassifier.stripTashkeel('مُحَمَّد')).toBe('محمد');
      expect(ScreenplayClassifier.stripTashkeel('فَاطِمَة')).toBe('فاطمة');
    });

    test('يجب حساب عدد الكلمات', () => {
      expect(ScreenplayClassifier.wordCount('مرحباً بك')).toBe(2);
      expect(ScreenplayClassifier.wordCount('هذا نص طويل')).toBe(3);
      expect(ScreenplayClassifier.wordCount('')).toBe(0);
    });
  });

  describe('التصنيف الشامل', () => {
    test('يجب تصنيف سيناريو كامل بشكل صحيح', () => {
      const screenplay = `بسم الله الرحمن الرحيم

مشهد 1

محمد: مرحباً بك في المنزل

يبتسم ويجلس

فاطمة: أهلاً بك

قطع`;

      const lines = screenplay.split('\n');

      // السطر الأول: بسملة
      expect(classifier.classifyLine(lines[0])).toBe('basmala');

      // السطر الثاني: فارغ
      expect(classifier.classifyLine(lines[1])).toBe('action');

      // السطر الثالث: رأس مشهد
      expect(classifier.classifyLine(lines[2])).toBe('scene-header-top-line');

      // السطر الرابع: فارغ
      expect(classifier.classifyLine(lines[3])).toBe('action');

      // السطر الخامس: شخصية
      expect(classifier.classifyLine(lines[4])).toBe('character');

      // السطر السادس: حوار
      expect(classifier.classifyLine(lines[5])).toBe('dialogue');

      // السطر السابع: حركة
      expect(classifier.classifyLine(lines[6])).toBe('action');

      // السطر الثامن: شخصية
      expect(classifier.classifyLine(lines[7])).toBe('character');

      // السطر التاسع: حوار
      expect(classifier.classifyLine(lines[8])).toBe('dialogue');

      // السطر العاشر: انتقال
      expect(classifier.classifyLine(lines[9])).toBe('transition');
    });
  });
});
