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
import CleanIntegratedScreenplayEditor from "./CleanIntegratedScreenplayEditor";

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
  static readonly ACTION_VERB_LIST = 'يدخل|يخرج|ينظر|يرفع|تبتسم|ترقد|تقف|يبسم|يضع|يقول|تنظر|تربت|تقوم|يشق|تشق|تضرب|يسحب|يلتفت|يقف|يجلس|تجلس|يجري|تجري|يمشي|تمشي|يركض|تركض|يصرخ|اصرخ|يبكي|تبكي|يضحك|تضحك|يغني|تغني|يرقص|ترقص|يأكل|تأكل|يشرب|تشرب|ينام|تنام|يستيقظ|تستيقظ|يكتب|تكتب|يقرأ|تقرأ|يسمع|تسمع|يشم|تشم|يلمس|تلمس|يأخذ|تأخذ|يعطي|تعطي|يفتح|تفتح|يغلق|تغلق|يبدأ|تبدأ|ينتهي|تنتهي|يذهب|تذهب|يعود|تعود|يأتي|تأتي|يموت|تموت|يحيا|تحيا|يقاتل|تقاتل|ينصر|تنتصر|يخسر|تخسر|يكتب|تكتب|يرسم|ترسم|يصمم|تخطط|تخطط|يقرر|تقرر|يفكر|تفكر|يتذكر|تذكر|يحاول|تحاول|يستطيع|تستطيع|يريد|تريد|يحتاج|تحتاج|يبحث|تبحث|يجد|تجد|يفقد|تفقد|يحمي|تحمي|يحمي|تحمي|يراقب|تراقب|يخفي|تخفي|يكشف|تكشف|يكتشف|تكتشف|يعرف|تعرف|يتعلم|تعلن|يعلم|تعلن|يوجه|وجه|يسافر|تسافر|يعود|تعود|يرحل|ترحل|يبقى|تبقى|ينتقل|تنتقل|يتغير|تتغير|ينمو|تنمو|يتطور|تتطور|يواجه|تواجه|يحل|تحل|يفشل|تفشل|ينجح|تنجح|يحقق|تحقن|يبدأ|تبدأ|ينهي|تنهي|يوقف|توقف|يستمر|تستمر|ينقطع|تنقطع|يرتبط|ترتبط|ينفصل|تنفصل|يتزوج|تتزوج|يطلق|يطلق|يولد|تولد|يكبر|تكبر|يشيخ|تشيخ|يمرض|تمرض|يشفي|تشفي|يصاب|تصيب|يتعافى|تعافي|يموت|يقتل|تقتل|يُقتل|تُقتل|يختفي|تختفي|يظهر|تظهر|يختبئ|تخبوء|يطلب|تطلب|يأمر|تأمر|يمنع|تمنع|يسمح|تسمح|يوافق|توافق|يرفض|ترفض|يعتذر|تعتذر|يغفر|يحب|تحب|يبغض|يبغض|يكره|يكره|يحسد|تحسد|يغبط|يغبط|ي admire|تعجب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب|يحب|تحب';

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
        'يدخل', 'يخرج', 'ينظر', 'يرفع', 'تبتسم', 'ترقد', 'تقف', 'يبسم', 'يضع', 'تنظر', 'تربت', 'تقوم', 'يشق', 'تشق', 'تضرب', 'يسحب', 'يلتفت', 'يقف', 'يجلس', 'تجلس', 'يجري', 'تجري', 'يمشي', 'تمشي', 'يركض', 'تركض', 'يصرخ', 'اصرخ', 'يبكي', 'تبكي', 'يضحك', 'تضحك', 'يغني', 'تغني', 'يرقص', 'ترقص', 'يأكل', 'تأكل', 'يشرب', 'تشرب', 'ينام', 'تنام', 'يستيقظ', 'تستيقظ', 'يكتب', 'تكتب', 'يقرأ', 'تقرأ', 'يسمع', 'تسمع', 'يشم', 'تشم', 'يلمس', 'تلمس', 'يأخذ', 'تأخذ', 'يعطي', 'تعطي', 'يفتح', 'تفتح', 'يغلق', 'تغلق', 'يبدأ', 'تبدأ', 'ينتهي', 'تنتهي', 'يذهب', 'تذهب', 'يعود', 'تعود', 'يأتي', 'تأتي', 'يموت', 'تموت', 'يحيا', 'تحيا', 'يقاتل', 'تقاتل', 'ينصر', 'تنتصر', 'يخسر', 'تخسر', 'يرسم', 'ترسم', 'يصمم', 'تخطط', 'يقرر', 'تقرر', 'يفكر', 'تفكر', 'يتذكر', 'تذكر', 'يحاول', 'تحاول', 'يستطيع', 'تستطيع', 'يريد', 'تريد', 'يحتاج', 'تحتاج', 'يبحث', 'تبحث', 'يجد', 'تجد', 'يفقد', 'تفقد', 'يحمي', 'تحمي', 'يراقب', 'تراقب', 'يخفي', 'تخفي', 'يكشف', 'تكشف', 'يكتشف', 'تكتشف', 'يعرف', 'تعرف', 'يتعلم', 'تعلن', 'يعلم', 'تعلن', 'يوجه', 'وجه', 'يسافر', 'تسافر', 'يرحل', 'ترحل', 'يبقى', 'تبقى', 'ينتقل', 'تنتقل', 'يتغير', 'تتغير', 'ينمو', 'تنمو', 'يتطور', 'تتطور', 'يواجه', 'تواجه', 'يحل', 'تحل', 'يفشل', 'تفشل', 'ينجح', 'تنجح', 'يحقق', 'تحقن', 'يوقف', 'توقف', 'ينقطع', 'تنقطع', 'يرتبط', 'ترتبط', 'ينفصل', 'تنفصل', 'يتزوج', 'تتزوج', 'يطلق', 'يولد', 'تولد', 'يكبر', 'تكبر', 'يشيخ', 'تشيخ', 'يمرض', 'تمرض', 'يشفي', 'تشفي', 'يصاب', 'تصيب', 'يتعافى', 'تعافي', 'يقتل', 'تقتل', 'يُقتل', 'تُقتل', 'يختفي', 'تختفي', 'يظهر', 'تظهر', 'يختبئ', 'تخبوء', 'يطلب', 'تطلب', 'يامر', 'تأمر', 'يمنع', 'تمنع', 'يسمح', 'تسمح', 'يوافق', 'توافق', 'يرفض', 'ترفض', 'يعتذر', 'تعتذر', 'يغفر', 'يحب', 'تحب', 'يبغض', 'يكره', 'يحسد', 'تحسد', 'يغبط', 'تعجب'
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

export default function ScreenplayEditorEnhanced() {
  return <CleanIntegratedScreenplayEditor />;
}