/**
 * ScreenplayEditorEnhanced - The Ultimate Screenplay Editor
 *
 * This editor combines the best features from:
 * 1. ScreenplayEditor.tsx - SceneHeaderAgent, postProcessFormatting, advanced paste handling
 * 2. CleanIntegratedScreenplayEditor.tsx - System Classes, AdvancedAgentsPopup, Sidebar, Status Bar
 *
 * Key Features:
 * ✅ SceneHeaderAgent for complex Arabic scene headers
 * ✅ postProcessFormatting for intelligent text correction
 * ✅ Advanced paste handling with context tracking
 * ✅ All 7 System Classes (StateManager, AutoSaveManager, AdvancedSearchEngine, etc.)
 * ✅ AdvancedAgentsPopup integration
 * ✅ Full Sidebar with statistics
 * ✅ Status Bar with live info
 * ✅ AI Writing Assistant
 * ✅ Character Rename functionality
 * ✅ Dark/Light mode
 */

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, X, Loader2, Sun, Moon, FileText, Bold, Italic, Underline,
  MoveVertical, Type, Search, Replace, Save, FolderOpen,
  Printer, Settings, Download, FilePlus,
  Undo, Redo, Scissors, Film, Camera, Feather, UserSquare, Parentheses, MessageCircle,
  FastForward, ChevronDown, BookHeart, Hash, Play, Pause, RotateCcw, Upload, Activity,
  Globe, Database, Zap, Share2, Check, Edit3, Trash2, Copy, ExternalLink,
  GitBranch, Clock, Bookmark, Tag, MapPin, AlertTriangle, CheckCircle, XCircle,
  Plus, Minus, MoreVertical, Filter, SortAsc, SortDesc, Calendar, User, Mail, Phone,
  Link, Star, Heart, ThumbsUp, MessageSquare, Send, Maximize2, Minimize2,
  RefreshCw, HelpCircle, BarChart3, Users, PenTool, Brain
} from 'lucide-react';

import AdvancedAgentsPopupLocal from './AdvancedAgentsPopupLocal';
import { applyRegexReplacementToTextNodes } from '../modules/domTextReplacement';

// Import System Classes
import {
  StateManager,
  AutoSaveManager,
  AdvancedSearchEngine,
  CollaborationSystem,
  AIWritingAssistant,
  ProjectManager,
  VisualPlanningSystem,
  createSystems,
  type SystemConfig
} from '../systems';

// ==================== SCREENPLAY CLASSIFIER ====================

/**
 * @class ScreenplayClassifier
 * @description A classifier for Arabic screenplays with enhanced patterns.
 */
class ScreenplayClassifier {
  // Constants
  static readonly AR_AB_LETTER = '\u0600-\u06FF';
  static readonly EASTERN_DIGITS = '٠٢٣٤٥٦٧٨٩';
  static readonly WESTERN_DIGITS = '0123456789';
  static readonly ACTION_VERB_LIST = 'يدخل|يخرج|ينظر|يرفع|تبتسم|ترقد|تقف|يبسم|يضع|يقول|تنظر|تربت|تقوم|يشق|تشق|تضرب|يسحب|يلتفت|يقف|يجلس|تجلس|يجري|تجري|يمشي|تمشي|يركض|تركض|يصرخ|اصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يكتب|تكتب|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينصر|تنتصر|يخسر|تخسر|يكتب|تكتب|يرسم|ترسم|يصمم|تخطط|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلن|يعلم|تعلن|يوجه|وجه|يسافر|تسافر|يعود|تعود|يرحل|ترحل|يبقى|تبقى|ينتقل|تنتقل|يتغير|تتغير|ينمو|تنمو|يتطور|تتطور|يواجه|تواجه|يحل|تحل|يفشل|تفشل|ينجح|تنجح|يحقق|تحقن|يبدأ|تبدأ|ينهي|تنهي|يوقف|توقف|يستمر|تستمر|ينقطع|تنقطع|يرتبط|ترتبط|ينفصل|تنفصل|يتزوج|تتزوج|يطلق|يطلق|يولد|تولد|يكبر|تكبر|يشيخ|تشيخ|يمرض|تمرض|يشفي|تشفي|يصاب|تصيب|يتعافى|تعافي|يموت|يقتل|تقتل|يُقتل|تُقتل|يختفي|تختفي|يظهر|تظهر|يختبئ|تخبوء|يطلب|تطلب|يأمر|تأمر|يمنع|تمنع|يسمح|تسمح|يوافق|توافق|يرفض|ترفض|يعتذر|تعتذر|يغفر|يغفر|يحب|تحب|يبغض|يبغض|يكره|يكره|يحسد|تحسد|يغبط|يغبط|ي admire|تعجب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب';

  // Regex patterns
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

  // Helper functions
  static easternToWesternDigits(s: string): string {
    const map: { [key: string]: string } = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    return s.replace(/[٠٢٣٤٥٦٧٨٩]/g, char => map[char]);
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

  // Type checkers
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
        'يدخل', 'يخرج', 'ينظر', 'يرفع', 'تبتسم', 'ترقد', 'تقف', 'يبسم', 'يضع', 'تنظر', 'تربت', 'تقوم', 'يشق', 'تشق', 'تضرب', 'يسحب', 'يلتفت', 'يقف', 'يجلس', 'تجلس', 'يجري', 'تجري', 'يمشي', 'تمشي', 'يركض', 'تركض', 'يصرخ', 'اصرخ', 'يبكي', 'تبكي', 'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام', 'يستيقظ', 'تستيقظ', 'يكتب', 'تكتب', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ', 'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق', 'يبدأ', 'تبدأ', 'ينتهي', 'تنتهي', 'يذهب', 'تذهب', 'يعود', 'تعود', 'يأتي', 'تأتي', 'يموت', 'تموت', 'يحيا', 'تحيا', 'يقاتل', 'تقاتل', 'ينصر', 'تنتصر', 'يخسر', 'تخسر', 'يرسم', 'ترسم', 'يصمم', 'تخطط', 'يقرر', 'تقرر', 'يفكر', 'تفكر', 'يتذكر', 'تذكر', 'يحاول', 'تحاول', 'يستطيع', 'تستطيع', 'يريد', 'تريد', 'يحتاج', 'تحتاج', 'يبحث', 'تبحث', 'يجد', 'تجد', 'يفقد', 'تفقد', 'يحمي', 'تحمي', 'يراقب', 'تراقب', 'يخفي', 'تخفي', 'يكشف', 'تكشف', 'يكتشف', 'تكتشف', 'يعرف', 'تعرف', 'يتعلم', 'تعلن', 'يعلم', 'تعلن', 'يوجه', 'توجه', 'يسافر', 'تسافر', 'يرحل', 'ترحل', 'يبقى', 'تبقى', 'ينتقل', 'تنتقل', 'يتغير', 'تتغير', 'ينمو', 'تنمو', 'يتطور', 'تتطور', 'يواجه', 'تواجه', 'يحل', 'تحل', 'يفشل', 'تفشل', 'ينجح', 'تنجح', 'يحقق', 'تحقن', 'يوقف', 'توقف', 'ينقطع', 'تنقطع', 'يرتبط', 'ترتبط', 'ينفصل', 'تنفصل', 'يتزوج', 'تتزوج', 'يطلق', 'يولد', 'تولد', 'يكبر', 'تكبر', 'يشيخ', 'تشيخ', 'يمرض', 'تمرض', 'يشفي', 'تشفي', 'يصاب', 'تصيب', 'يتعافى', 'تعافي', 'يقتل', 'تقتل', 'يُقتل', 'تُقتل', 'يختفي', 'تختفي', 'يظهر', 'تظهر', 'يختبئ', 'تخبوء', 'يطلب', 'تطلب', 'يامر', 'تأمر', 'يمنع', 'تمنع', 'يسمح', 'تسمح', 'يوافق', 'توافق', 'يرفض', 'ترفض', 'يعتذر', 'تعتذر', 'يغفر', 'يحب', 'تحب', 'يبغض', 'يكره', 'يحسد', 'تحسد', 'يغبط', 'تعجب'
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
        'يدخل', 'يخرج', 'ينظر', 'يرفع', 'تبتسم', 'ترقد', 'تقف', 'يبسم', 'يضع', 'تنظر', 'تربت', 'تقوم', 'يشق', 'تشق', 'تضرب', 'يسحب', 'يلتفت', 'يقف', 'يجلس', 'تجلس', 'يجري', 'تجري', 'يمشي', 'تمشي', 'يركض', 'تركض', 'يصرخ', 'اصرخ', 'يبكي', 'تبكي', 'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام', 'يستيقظ', 'تستيقظ', 'يكتب', 'تكتب', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ', 'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق', 'يعود', 'تعود', 'يأتي', 'تأتي', 'يموت', 'تموت', 'يحيا', 'تحيا', 'يقاتل', 'تقاتل', 'ينصر', 'تنتصر', 'يخسر', 'تخسر', 'يرسم', 'ترسم', 'يصمم', 'تخطط', 'يقرر', 'تقرر', 'يفكر', 'تفكر', 'يتذكر', 'تذكر', 'يحاول', 'تحاول', 'يستطيع', 'تستطيع', 'يريد', 'تريد', 'يحتاج', 'تحتاج', 'يبحث', 'تبحث', 'يجد', 'تجد', 'يفقد', 'تفقد', 'يحمي', 'تحمي', 'يراقب', 'تراقب', 'يخفي', 'تخفي', 'يكشف', 'تكشف', 'يكتشف', 'تكتشف', 'يعرف', 'تعرف', 'يتعلم', 'تعلن', 'يعلم', 'تعلن', 'يوجه', 'توجه', 'يسافر', 'تسافر', 'يرحل', 'ترحل', 'يبقى', 'تبقى', 'ينتقل', 'تنتقل', 'يتغير', 'تتغير', 'ينمو', 'تنمو', 'يتطور', 'تتطور', 'يواجه', 'تواجه', 'يحل', 'تحل', 'يفشل', 'تفشل', 'ينجح', 'تنجح', 'يحقق', 'تحقن', 'يوقف', 'توقف', 'ينقطع', 'تنقطع', 'يرتبط', 'ترتبط', 'ينفصل', 'تنفصل', 'يتزوج', 'تتزوج', 'يطلق', 'يولد', 'تولد', 'يكبر', 'تكبر', 'يشيخ', 'تشيخ', 'يمرض', 'تمرض', 'يشفي', 'تشفي', 'يصاب', 'تصيب', 'يتعافى', 'تعافي', 'يقتل', 'تقتل', 'يُقتل', 'تُقتل', 'يختفي', 'تختفي', 'يظهر', 'تظهر', 'يختبئ', 'تخبوء', 'يطلب', 'تطلب', 'يامر', 'تأمر', 'يمنع', 'تمنع', 'يسمح', 'تسمح', 'يوافق', 'توافق', 'يرفض', 'ترفض', 'يعتذر', 'تعتذر', 'يغفر', 'يحب', 'تحب', 'يبغض', 'يكره', 'يحسد', 'تحسد', 'يغبط', 'تعجب'
      ];

      for (const indicator of actionIndicators) {
        if (normalized.includes(indicator)) {
          return true;
        }
      }
    }

    return false;
  }
}

// ==================== SCENE HEADER AGENT ====================

/**
 * @function SceneHeaderAgent
 * @description Advanced scene header processing for complex Arabic scene headers.
 * @param {string} line - The line to process.
 * @param {{ inDialogue: boolean }} ctx - The context object.
 * @param {(formatType: string) => React.CSSProperties} getFormatStylesFn - The function to get format styles.
 * @returns {{ html: string; processed: boolean } | null} - The processed scene header or null.
 */
const SceneHeaderAgent = (
  line: string,
  ctx: { inDialogue: boolean },
  getFormatStylesFn: (formatType: string) => React.CSSProperties
) => {
  const classifier = new ScreenplayClassifier();
  const Patterns = classifier.Patterns;
  const trimmedLine = line.trim();

  const m2 = trimmedLine.match(/^(مشهد\s*\d+)\s*[-–—:،]?\s*(.*)$/i);

  if (m2) {
    const head = m2[1].trim();
    const rest = m2[2].trim();

    if (rest && (Patterns.sceneHeader2.time.test(rest) || Patterns.sceneHeader2.inOut.test(rest))) {
      const container = document.createElement('div');
      container.className = 'scene-header-top-line';
      Object.assign(container.style, getFormatStylesFn('scene-header-top-line'));

      const part1 = document.createElement('span');
      part1.className = 'scene-header-1';
      part1.textContent = head;
      Object.assign(part1.style, getFormatStylesFn('scene-header-1'));

      const part2 = document.createElement('span');
      part2.className = 'scene-header-2';
      part2.textContent = rest;
      Object.assign(part2.style, getFormatStylesFn('scene-header-2'));

      container.appendChild(part1);
      container.appendChild(part2);
      ctx.inDialogue = false;
      return { html: container.outerHTML, processed: true };
    } else if (rest) {
      if (rest.includes('–') || rest.includes('-')) {
        const container = document.createElement('div');
        container.className = 'scene-header-top-line';
        Object.assign(container.style, getFormatStylesFn('scene-header-top-line'));

        const part1 = document.createElement('span');
        part1.className = 'scene-header-1';
        part1.textContent = head;
        Object.assign(part1.style, getFormatStylesFn('scene-header-1'));

        const part2 = document.createElement('span');
        part2.className = 'scene-header-2';
        part2.textContent = rest;
        Object.assign(part2.style, getFormatStylesFn('scene-header-2'));

        container.appendChild(part1);
        container.appendChild(part2);
        ctx.inDialogue = false;
        return { html: container.outerHTML, processed: true };
      } else {
        const container = document.createElement('div');
        container.className = 'scene-header-top-line';
        Object.assign(container.style, getFormatStylesFn('scene-header-top-line'));

        const part1 = document.createElement('span');
        part1.className = 'scene-header-1';
        part1.textContent = head;
        Object.assign(part1.style, getFormatStylesFn('scene-header-1'));

        const part2 = document.createElement('span');
        part2.className = 'scene-header-2';
        part2.textContent = rest;
        Object.assign(part2.style, getFormatStylesFn('scene-header-2'));

        container.appendChild(part1);
        container.appendChild(part2);
        ctx.inDialogue = false;
        return { html: container.outerHTML, processed: true };
      }
    } else {
      const container = document.createElement('div');
      container.className = 'scene-header-top-line';
      Object.assign(container.style, getFormatStylesFn('scene-header-top-line'));

      const part1 = document.createElement('span');
      part1.className = 'scene-header-1';
      part1.textContent = head;
      Object.assign(part1.style, getFormatStylesFn('scene-header-1'));

      container.appendChild(part1);
      ctx.inDialogue = false;
      return { html: container.outerHTML, processed: true };
    }
  }

  if (Patterns.sceneHeader3.test(trimmedLine)) {
    const element = document.createElement('div');
    element.className = 'scene-header-3';
    element.textContent = trimmedLine;
    Object.assign(element.style, getFormatStylesFn('scene-header-3'));
    ctx.inDialogue = false;
    return { html: element.outerHTML, processed: true };
  }

  return null;
};

// ==================== MAIN COMPONENT ====================

interface ScreenplayEditorEnhancedProps {
  onBack?: () => void;
}

export default function ScreenplayEditorEnhanced({ onBack }: ScreenplayEditorEnhancedProps) {
  // State variables
  const [htmlContent, setHtmlContent] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentFormat, setCurrentFormat] = useState('action');
  const [selectedFont, setSelectedFont] = useState('Amiri');
  const [selectedSize, setSelectedSize] = useState('14pt');
  const [documentStats, setDocumentStats] = useState({
    characters: 0,
    words: 0,
    pages: 1,
    scenes: 0
  });

  // Menu states
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  // Dialog states
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [showCharacterRename, setShowCharacterRename] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [oldCharacterName, setOldCharacterName] = useState('');
  const [newCharacterName, setNewCharacterName] = useState('');

  // AI review states
  const [showReviewerDialog, setShowReviewerDialog] = useState(false);
  const [showAgentsPopup, setShowAgentsPopup] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState('');

  // View states
  const [showRulers, setShowRulers] = useState(true);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);

  // System instances (created with refs to maintain stability)
  const systemsRef = useRef(createSystems({
    autoSaveInterval: 30000
  } as SystemConfig));

  // Get format styles
  const getFormatStyles = (formatType: string): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
      fontSize: selectedSize,
      direction: 'rtl',
      lineHeight: '1.8',
      minHeight: '1.2em'
    };

    const formatStyles: { [key: string]: React.CSSProperties } = {
      'basmala': { textAlign: 'left', margin: '0' },
      'scene-header-top-line': { display: 'flex', justifyContent: 'space-between', width: '100%', margin: '1rem 0 0 0' },
      'scene-header-1': { fontWeight: 'bold', textTransform: 'uppercase', margin: '0' },
      'scene-header-2': { fontStyle: 'italic', margin: '0' },
      'scene-header-3': { textAlign: 'center', fontWeight: 'bold', margin: '0 0 1rem 0' },
      'action': { textAlign: 'right', margin: '12px 0' },
      'character': { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', width: '2.5in', margin: '12px auto 0 auto' },
      'parenthetical': { textAlign: 'center', fontStyle: 'italic', width: '2.0in', margin: '6px auto' },
      'dialogue': { textAlign: 'center', width: '2.5in', lineHeight: '1.2', margin: '0 auto 12px auto' },
      'transition': { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', margin: '1rem 0' },
    };

    return { ...baseStyles, ...formatStyles[formatType] };
  };

  // Update cursor position
  const updateCursorPosition = () => {
    // Reserved for future cursor tracking
  };

  // Check if current element is empty
  const isCurrentElementEmpty = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.startContainer.parentElement;
      return element && element.textContent === '';
    }
    return false;
  };

  // Calculate document stats
  const calculateStats = () => {
    if (editorRef.current) {
      const textContent = editorRef.current.innerText || '';
      const characters = textContent.length;
      const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
      const scenes = (textContent.match(/مشهد\s*\d+/gi) || []).length;

      const scrollHeight = editorRef.current.scrollHeight;
      const pages = Math.max(1, Math.ceil(scrollHeight / (29.7 * 37.8)));

      setDocumentStats({ characters, words, pages, scenes });
    }
  };

  // Get next format on Tab
  const getNextFormatOnTab = (currentFormat: string, shiftKey: boolean) => {
    const mainSequence = ['scene-header-top-line', 'action', 'character', 'transition'];

    switch (currentFormat) {
      case 'character':
        if (shiftKey) {
          return isCurrentElementEmpty() ? 'action' : 'transition';
        } else {
          return 'dialogue';
        }
      case 'dialogue':
        if (shiftKey) {
          return 'character';
        } else {
          return 'parenthetical';
        }
      case 'parenthetical':
        return 'dialogue';
      default:
        const currentIndex = mainSequence.indexOf(currentFormat);
        if (currentIndex !== -1) {
          if (shiftKey) {
            return mainSequence[Math.max(0, currentIndex - 1)];
          } else {
            return mainSequence[Math.min(mainSequence.length - 1, currentIndex + 1)];
          }
        }
        return 'action';
    }
  };

  // Get next format on Enter
  const getNextFormatOnEnter = (currentFormat: string) => {
    const transitions: { [key: string]: string } = {
      'scene-header-top-line': 'scene-header-3',
      'scene-header-3': 'action',
      'scene-header-1': 'scene-header-3',
      'scene-header-2': 'scene-header-3'
    };

    return transitions[currentFormat] || 'action';
  };

  // Apply format to current line
  const applyFormatToCurrentLine = (formatType: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.startContainer.parentElement;

      if (element) {
        element.className = formatType;
        Object.assign(element.style, getFormatStyles(formatType));
        setCurrentFormat(formatType);
      }
    }
  };

  // Format text
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  // Update content
  const updateContent = () => {
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const element = range.startContainer.parentElement;
        if (element) {
          setCurrentFormat(element.className || 'action');
        }
      }

      calculateStats();

      // Update AutoSaveManager
      systemsRef.current.autoSaveManager.updateContent(editorRef.current.innerHTML);
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextFormat = getNextFormatOnTab(currentFormat, e.shiftKey);
      applyFormatToCurrentLine(nextFormat);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const nextFormat = getNextFormatOnEnter(currentFormat);
      applyFormatToCurrentLine(nextFormat);
    } else if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
        case 'B':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
        case 'U':
          e.preventDefault();
          formatText('underline');
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          formatText('undo');
          break;
        case 'y':
        case 'Y':
          e.preventDefault();
          formatText('redo');
          break;
        case 's':
        case 'S':
          e.preventDefault();
          systemsRef.current.autoSaveManager.forceSave();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setShowSearchDialog(true);
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          setShowReplaceDialog(true);
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          formatText('selectAll');
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          window.print();
          break;
      }
    }
  };

  // Post-process formatting to correct misclassifications
  const postProcessFormatting = (htmlResult: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlResult;

    const elements = Array.from(tempDiv.children);

    for (let i = 0; i < elements.length - 1; i++) {
      const currentElement = elements[i] as HTMLElement;
      const nextElement = elements[i + 1] as HTMLElement;

      if (currentElement.className === 'action') {
        const textContent = currentElement.textContent || '';
        const bulletCharacterPattern = /^\s*[•·●○■▪▫–—‣⁃]([^:]+):(.*)/;
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

      if (currentElement.className === 'dialogue') {
        const textContent = currentElement.textContent || '';
        const actionPatterns = [
          /^\s*[-–—]?\s*(?:[ي|ت][\u0600-\u06FF]+|نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|يظهر|تظهر)/,
          /^\s*[-–—]\s*.+/,
          /^\s*(?:نرى|ننظر|نسمع|نلاحظ|نشهد|نشاهد|نلمس|نشعر|نصدق|نفهم|نصدق|نشك|نتمنى|نأمل|نخشى|نخاف|نحب|نكره|نحسد|نغبط)/,
          /\s+(?:يقول|تقول|قال|قالت|يقوم|تقوم|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يكتب|تكتب|ينظر|تنظر|يبتسم|تبتسم|يقف|تقف|يجلس|تجلس|يدخل|تدخل|يخرج|تخرج|يركض|تركض|يمشي|تمشي|يجري|تجرى|يصرخ|اصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينصر|تنتصر|يخسر|تخسر|يرسم|ترسم|يصمم|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلن|يعلم|تعلن)\s+/
        ];

        let isActionDescription = false;
        for (const pattern of actionPatterns) {
          if (pattern.test(textContent)) {
            isActionDescription = true;
            break;
          }
        }

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

  // Handle paste with advanced processing
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const pastedText = clipboardData.getData('text/plain');

    if (editorRef.current) {
      const lines = pastedText.split('\n');
      let htmlResult = '';

      const ctx = { inDialogue: false };
      let context = {
        lastFormat: 'action',
        isInDialogueBlock: false,
        pendingCharacterLine: false
      };

      for (const line of lines) {
        if (ScreenplayClassifier.isBlank(line)) {
          context.isInDialogueBlock = false;
          context.lastFormat = 'action';
          htmlResult += '<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;"></div>';
          continue;
        }

        if (ScreenplayClassifier.isBasmala(line)) {
          context.lastFormat = 'basmala';
          context.isInDialogueBlock = false;
          htmlResult += `<div class="basmala" style="direction: rtl; text-align: left; margin: 0;">${line}</div>`;
          continue;
        }

        const sceneHeaderMatch = line.trim().match(/^(مشهد\s*\d+)\s*[-–—:،]?\s*(.*)$/i);
        if (sceneHeaderMatch) {
          const sceneHeaderResult = SceneHeaderAgent(line, ctx, getFormatStyles);
          if (sceneHeaderResult && sceneHeaderResult.processed) {
            context.lastFormat = 'scene-header';
            context.isInDialogueBlock = false;
            context.pendingCharacterLine = false;
            htmlResult += sceneHeaderResult.html;
            continue;
          }
        }

        const sceneHeaderResult = SceneHeaderAgent(line, ctx, getFormatStyles);
        if (sceneHeaderResult && sceneHeaderResult.processed) {
          context.lastFormat = 'scene-header';
          context.isInDialogueBlock = false;
          context.pendingCharacterLine = false;
          htmlResult += sceneHeaderResult.html;
          continue;
        }

        if (ScreenplayClassifier.isTransition(line)) {
          context.lastFormat = 'transition';
          context.isInDialogueBlock = false;
          context.pendingCharacterLine = false;
          htmlResult += `<div class="transition" style="direction: rtl; text-align: center; font-weight: bold; text-transform: uppercase; margin: 1rem 0;">${line}</div>`;
          continue;
        }

        if (ScreenplayClassifier.isCharacterLine(line, context)) {
          context.lastFormat = 'character';
          context.isInDialogueBlock = true;
          context.pendingCharacterLine = false;
          htmlResult += `<div class="character" style="direction: rtl; text-align: center; font-weight: bold; text-transform: uppercase; width: 2.5in; margin: 12px auto 0 auto;">${line}</div>`;
          continue;
        }

        if (ScreenplayClassifier.isParenShaped(line)) {
          context.lastFormat = 'parenthetical';
          context.pendingCharacterLine = false;
          htmlResult += `<div class="parenthetical" style="direction: rtl; text-align: center; font-style: italic; width: 2.0in; margin: 6px auto;">${line}</div>`;
          continue;
        }

        if (ScreenplayClassifier.isLikelyAction(line)) {
          context.lastFormat = 'action';
          context.isInDialogueBlock = false;
          context.pendingCharacterLine = false;
          const cleanedLine = line.replace(/^\s*[-–—]\s*/, '');
          htmlResult += `<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;">${cleanedLine}</div>`;
          continue;
        }

        // Fallback
        context.lastFormat = 'action';
        context.isInDialogueBlock = false;
        context.pendingCharacterLine = false;
        const cleanedLine = line.replace(/^\s*[-–—]\s*/, '');
        htmlResult += `<div class="action" style="direction: rtl; text-align: right; margin: 12px 0;">${cleanedLine}</div>`;
      }

      const correctedHtmlResult = postProcessFormatting(htmlResult);

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = correctedHtmlResult;

        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }

        range.insertNode(fragment);
        updateContent();
      }
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim() || !editorRef.current) return;

    const content = editorRef.current.innerText;
    const result = await systemsRef.current.searchEngine.searchInContent(
      content,
      searchTerm,
    );

    if (result.success) {
      alert(`Found ${result.totalMatches} matches for "${searchTerm}"`);
    } else {
      alert(`Search failed: ${result.error}`);
    }
  };

  // Handle replace
  const handleReplace = async () => {
    if (!searchTerm.trim() || !editorRef.current) return;

    const content = editorRef.current.innerText;
    const result = await systemsRef.current.searchEngine.replaceInContent(
      content,
      searchTerm,
      replaceTerm,
    );

    if (result.success && editorRef.current) {
      const replacementsApplied = applyRegexReplacementToTextNodes(
        editorRef.current,
        result.patternSource as string,
        result.patternFlags as string,
        result.replaceText as string,
        result.replaceAll !== false,
      );

      if (replacementsApplied > 0) {
        updateContent();
      }

      alert(
        `Replaced ${replacementsApplied} occurrences of "${searchTerm}" with "${replaceTerm}"`,
      );
    } else {
      alert(`Replace failed: ${result.error}`);
    }
  };

  // Handle character rename
  const handleCharacterRename = () => {
    if (!oldCharacterName.trim() || !newCharacterName.trim() || !editorRef.current) return;

    const regex = new RegExp(`^\\s*${oldCharacterName}\\s*$`, 'gmi');

    if (editorRef.current) {
      const replacementsApplied = applyRegexReplacementToTextNodes(
        editorRef.current,
        regex.source,
        regex.flags,
        newCharacterName.toUpperCase(),
        true,
      );

      if (replacementsApplied > 0) {
        updateContent();
        alert(
          `Renamed character "${oldCharacterName}" to "${newCharacterName}" (${replacementsApplied})`,
        );
        setShowCharacterRename(false);
        setOldCharacterName('');
        setNewCharacterName('');
      } else {
        alert(`لم يتم العثور على الشخصية "${oldCharacterName}" لإعادة تسميتها.`);
      }
    }
  };

  // Handle AI review
  const handleAIReview = async () => {
    if (!editorRef.current) return;

    setIsReviewing(true);
    const content = editorRef.current.innerText;

    try {
      const result = await systemsRef.current.aiAssistant.reviewScreenplay(content);

      if (result.success && result.review) {
        setReviewResult(result.review);
      } else {
        setReviewResult(result.error || 'فشلت المراجعة');
      }
    } catch (error) {
      setReviewResult(`AI review failed: ${error}`);
    } finally {
      setIsReviewing(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Initialize editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = `
        <div class="basmala" style="${Object.entries(getFormatStyles('basmala')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          بسم الله الرحمن الرحيم
        </div>
        <div class="scene-header-top-line" style="${Object.entries(getFormatStyles('scene-header-top-line')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          <div style="${Object.entries(getFormatStyles('scene-header-1')).map(([k, v]) => `${k}: ${v}`).join('; ')}">مشهد 1</div>
          <div style="${Object.entries(getFormatStyles('scene-header-2')).map(([k, v]) => `${k}: ${v}`).join('; ')}">ليل - داخلي</div>
        </div>
        <div class="action" style="${Object.entries(getFormatStyles('action')).map(([k, v]) => `${k}: ${v}`).join('; ')}">
          اضغط هنا لبدء كتابة السيناريو...
        </div>
      `;

      updateContent();
    }

    // Set up auto-save
    systemsRef.current.autoSaveManager.setSaveCallback(async (content: string) => {
      console.log('Auto-saved content:', content);
      // In real implementation, save to database or file
    });
    systemsRef.current.autoSaveManager.startAutoSave();

    return () => {
      systemsRef.current.autoSaveManager.stopAutoSave();
    };
  }, []);

  // Update stats when content changes
  useEffect(() => {
    calculateStats();
  }, [htmlContent, selectedFont, selectedSize]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <header
        ref={stickyHeaderRef}
        className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md p-2 flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <FileText className="text-blue-500" />
          <h1 className="text-xl font-bold">النسخة - المحرر المحسّن</h1>
          {onBack && (
            <button
              onClick={onBack}
              className="mr-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              العودة للرئيسية
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAgentsPopup(true)}
            className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            title="الوكلاء المتقدمة"
          >
            <Brain className="text-purple-500" />
          </button>

          <div className="relative">
            <button onClick={() => setShowFileMenu(!showFileMenu)} className="flex items-center space-x-1 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <FileText size={16} />
              <span>ملف</span>
              <ChevronDown size={14} />
            </button>
            {showFileMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20">
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"><FilePlus size={16} /><span>جديد</span></button>
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"><FolderOpen size={16} /><span>فتح</span></button>
                <button onClick={() => systemsRef.current.autoSaveManager.forceSave()} className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"><Save size={16} /><span>حفظ</span></button>
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"><Download size={16} /><span>تصدير</span></button>
                <button onClick={() => window.print()} className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"><Printer size={16} /><span>طباعة</span></button>
              </div>
            )}
          </div>

          <button onClick={() => setShowSearchDialog(true)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Search size={18} /></button>
          <button onClick={() => setShowReplaceDialog(true)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Replace size={18} /></button>
          <button onClick={toggleDarkMode} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col">
        {/* Toolbar */}
        <div className="h-12 bg-gray-100 dark:bg-gray-800 flex items-center py-2 px-2 space-x-2">
          <div className="flex space-x-1">
            <button onClick={() => applyFormatToCurrentLine('scene-header-top-line')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="ترويسة مشهد"><Film size={18} /></button>
            <button onClick={() => applyFormatToCurrentLine('character')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="شخصية"><UserSquare size={18} /></button>
            <button onClick={() => applyFormatToCurrentLine('dialogue')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="حوار"><MessageCircle size={18} /></button>
            <button onClick={() => applyFormatToCurrentLine('action')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="فعل"><Feather size={18} /></button>
            <button onClick={() => applyFormatToCurrentLine('transition')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="انتقال"><FastForward size={18} /></button>
          </div>

          <div className="border-r border-gray-300 dark:border-gray-600 h-8 mx-1"></div>

          <div className="flex space-x-1">
            <button onClick={() => formatText('bold')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="عريض"><Bold size={18} /></button>
            <button onClick={() => formatText('italic')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="مائل"><Italic size={18} /></button>
            <button onClick={() => formatText('underline')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="مسطر"><Underline size={18} /></button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex mt-2">
          {/* Sidebar */}
          <div className="w-64 border-l border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">الإحصائيات</h3>
                <div className="space-y-1 text-sm">
                  <div>الأحرف: {documentStats.characters}</div>
                  <div>الكلمات: {documentStats.words}</div>
                  <div>الصفحات: {documentStats.pages}</div>
                  <div>المشاهد: {documentStats.scenes}</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">التنسيق</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm mb-1">الخط</label>
                    <select
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      <option value="Amiri">Amiri</option>
                      <option value="Cairo">Cairo</option>
                      <option value="Tajawal">Tajawal</option>
                      <option value="Noto Sans Arabic">Noto Sans Arabic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">الحجم</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      <option value="12pt">صغير (12pt)</option>
                      <option value="14pt">متوسط (14pt)</option>
                      <option value="16pt">كبير (16pt)</option>
                      <option value="18pt">كبير جداً (18pt)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">العناصر السريعة</h3>
                <div className="space-y-2">
                  <button onClick={() => applyFormatToCurrentLine('scene-header-3')} className="w-full text-right p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded flex items-center"><Hash size={16} className="ml-2" /> إضافة مشهد</button>
                  <button onClick={() => applyFormatToCurrentLine('character')} className="w-full text-right p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 rounded flex items-center"><UserSquare size={16} className="ml-2" /> إضافة شخصية</button>
                  <button onClick={() => applyFormatToCurrentLine('dialogue')} className="w-full text-right p-2 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 rounded flex items-center"><MessageCircle size={16} className="ml-2" /> إضافة حوار</button>
                  <button onClick={() => setShowCharacterRename(true)} className="w-full text-right p-2 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded flex items-center"><Edit3 size={16} className="ml-2" /> إعادة تسمية شخصية</button>
                  <button onClick={() => setShowReviewerDialog(true)} className="w-full text-right p-2 bg-pink-100 dark:bg-pink-900 hover:bg-pink-200 dark:hover:bg-pink-800 rounded flex items-center"><Sparkles size={16} className="ml-2" /> مراجعة AI</button>
                </div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="min-h-screen p-8 outline-none flex-1"
            style={{
              direction: 'rtl',
              fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
              fontSize: selectedSize,
              backgroundColor: 'white',
              color: 'black',
              width: '21cm',
              minHeight: '29.7cm',
              margin: '0 auto',
              padding: '2cm',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
            onInput={updateContent}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onClick={updateCursorPosition}
            onKeyUp={updateCursorPosition}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 p-2 flex justify-between text-sm">
        <div className="flex space-x-4">
          <span>التنسيق: {currentFormat}</span>
          <span>الصفحة: {documentStats.pages}</span>
          <span>المشاهد: {documentStats.scenes}</span>
        </div>
        <div className="flex space-x-4">
          <span>الكلمات: {documentStats.words}</span>
          <span>الأحرف: {documentStats.characters}</span>
        </div>
      </div>

      {/* Dialogs */}
      {showSearchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">بحث</h3>
              <button onClick={() => setShowSearchDialog(false)}><X size={20} /></button>
            </div>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800" placeholder="أدخل نص البحث..." />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowSearchDialog(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">إلغاء</button>
              <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white rounded">بحث</button>
            </div>
          </div>
        </div>
      )}

      {showReplaceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">بحث واستبدال</h3>
              <button onClick={() => setShowReplaceDialog(false)}><X size={20} /></button>
            </div>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-800" placeholder="البحث عن..." />
            <input type="text" value={replaceTerm} onChange={(e) => setReplaceTerm(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800" placeholder="استبدال بـ..." />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowReplaceDialog(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">إلغاء</button>
              <button onClick={handleReplace} className="px-4 py-2 bg-blue-500 text-white rounded">استبدال</button>
            </div>
          </div>
        </div>
      )}

      {showCharacterRename && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">إعادة تسمية شخصية</h3>
              <button onClick={() => setShowCharacterRename(false)}><X size={20} /></button>
            </div>
            <input type="text" value={oldCharacterName} onChange={(e) => setOldCharacterName(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-800" placeholder="الاسم الحالي..." />
            <input type="text" value={newCharacterName} onChange={(e) => setNewCharacterName(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-800" placeholder="الاسم الجديد..." />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowCharacterRename(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">إلغاء</button>
              <button onClick={handleCharacterRename} className="px-4 py-2 bg-blue-500 text-white rounded">إعادة تسمية</button>
            </div>
          </div>
        </div>
      )}

      {showReviewerDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-2/3 max-h-2/3 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">مراجعة الذكاء الاصطناعي</h3>
              <button onClick={() => setShowReviewerDialog(false)}><X size={20} /></button>
            </div>
            {isReviewing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="animate-spin" size={32} />
                <p className="mt-4">جاري مراجعة النص...</p>
              </div>
            ) : reviewResult ? (
              <div className="mb-4">
                <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded">{reviewResult}</pre>
              </div>
            ) : (
              <div className="mb-4">
                <p>هل تريد مراجعة السيناريو باستخدام الذكاء الاصطناعي؟</p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowReviewerDialog(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">إغلاق</button>
              {!isReviewing && !reviewResult && (
                <button onClick={handleAIReview} className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"><Sparkles size={16} className="ml-2" /> مراجعة</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Agents Popup - Local simplified version */}
      <AdvancedAgentsPopupLocal
        isOpen={showAgentsPopup}
        onClose={() => setShowAgentsPopup(false)}
        content={editorRef.current?.innerText || ''}
      />
    </div>
  );
}