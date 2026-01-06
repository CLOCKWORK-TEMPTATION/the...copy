"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles, X, Loader2, Sun, Moon, FileText, Bold, Italic, Underline,
  MoveVertical, Type, Search, Replace, Save, FolderOpen, Printer, Settings,
  Download, FilePlus, Undo, Redo, Scissors, Film, Camera, Feather, UserSquare,
  Parentheses, MessageCircle, FastForward, ChevronDown, BookHeart, Hash, Play,
  Pause, RotateCcw, Upload, Activity, Globe, Database, Zap, Share2, Check,
  Edit3, Trash2, Copy, ExternalLink, GitBranch, Clock, Bookmark, Tag, MapPin,
  AlertTriangle, CheckCircle, XCircle, Plus, Minus, MoreVertical, Filter,
  SortAsc, SortDesc, Calendar, User, Mail, Phone, Link, Star, Heart,
  ThumbsUp, MessageSquare, Send, Maximize2, Minimize2, RefreshCw, HelpCircle,
  BarChart3, Users, PenTool, Brain,
} from "lucide-react";

import AdvancedAgentsPopup from "./AdvancedAgentsPopup";
import MainHeader from "./MainHeader";
import { logger } from "../../services/LoggerService";
import { applyRegexReplacementToTextNodes } from "../../modules/text/domTextReplacement";
import type {
  Script, Scene, Character, DialogueLine, SceneActionLine,
} from "../../types/types";
import {
  ScreenplayClassifier,
  SceneHeaderAgent,
  postProcessFormatting,
  toCssString,
  escapeHtml
} from "./screenplayUtils";

// ==================== PRODUCTION-READY SYSTEM CLASSES ====================

/**
 * @class StateManager
 * @description Manages the state of the application.
 */
class StateManager {
  private state = new Map();
  private subscribers = new Map();

  subscribe(key: string, callback: (value: any) => void) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key).push(callback);

    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  setState(key: string, value: any) {
    this.state.set(key, value);
    const callbacks = this.subscribers.get(key) || [];
    callbacks.forEach((callback: any) => callback(value));
  }

  getState(key: string) {
    return this.state.get(key);
  }
}

/**
 * @class AutoSaveManager
 * @description Manages auto-saving and backups.
 */
class AutoSaveManager {
  private autoSaveInterval: number | null = null;
  private currentContent = "";
  private lastSaved = "";
  private saveCallback: ((content: string) => Promise<void>) | null = null;
  private intervalMs: number;

  constructor(intervalMs: number = 30000) {
    this.intervalMs = intervalMs;
  }

  setSaveCallback(callback: (content: string) => Promise<void>) {
    this.saveCallback = callback;
  }

  updateContent(content: string) {
    this.currentContent = content;
  }

  startAutoSave() {
    if (this.autoSaveInterval) return;

    this.autoSaveInterval = window.setInterval(async () => {
      if (this.currentContent !== this.lastSaved && this.saveCallback) {
        try {
          await this.saveCallback(this.currentContent);
          this.lastSaved = this.currentContent;
          logger.info("Auto-saved at:", new Date().toLocaleTimeString());
        } catch (error) {
          logger.error("Auto-save failed:", error);
        }
      }
    }, this.intervalMs);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  async forceSave() {
    if (this.saveCallback) {
      await this.saveCallback(this.currentContent);
      this.lastSaved = this.currentContent;
    }
  }
}

/**
 * @class AdvancedSearchEngine
 * @description Provides advanced search and replace functionality.
 */
class AdvancedSearchEngine {
  async searchInContent(content: string, query: string, options: any = {}) {
    const results: Array<{
      lineNumber: number;
      content: string;
      matches: Array<{ text: string; index: number; length: number }>;
    }> = [];
    const lines = content.split("\n");
    const caseSensitive = options.caseSensitive || false;
    const wholeWords = options.wholeWords || false;
    const useRegex = options.useRegex || false;

    let searchPattern: RegExp;

    try {
      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi";
        searchPattern = new RegExp(query, flags);
      } else if (wholeWords) {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flags = caseSensitive ? "g" : "gi";
        searchPattern = new RegExp(`\\b${escapedQuery}\\b`, flags);
      } else {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flags = caseSensitive ? "g" : "gi";
        searchPattern = new RegExp(escapedQuery, flags);
      }

      lines.forEach((line, lineNumber) => {
        const matches = Array.from(line.matchAll(searchPattern));
        if (matches.length > 0) {
          results.push({
            lineNumber: lineNumber + 1,
            content: line,
            matches: matches.map((match) => ({
              text: match[0],
              index: match.index || 0,
              length: match[0].length,
            })),
          });
        }
      });

      return {
        success: true,
        query: query,
        totalMatches: results.reduce((sum, r) => sum + r.matches.length, 0),
        results: results,
        searchTime: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: `خطأ في البحث: ${error}`,
        results: [],
      };
    }
  }

  async replaceInContent(
    content: string,
    searchQuery: string,
    replaceText: string,
    options: any = {},
  ) {
    const caseSensitive = options.caseSensitive || false;
    const wholeWords = options.wholeWords || false;
    const useRegex = options.useRegex || false;
    const replaceAll = options.replaceAll !== false;

    let searchPattern: RegExp;

    try {
      if (useRegex) {
        const flags = replaceAll
          ? caseSensitive
            ? "g"
            : "gi"
          : caseSensitive
            ? ""
            : "i";
        searchPattern = new RegExp(searchQuery, flags);
      } else if (wholeWords) {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flags = replaceAll
          ? caseSensitive
            ? "g"
            : "gi"
          : caseSensitive
            ? ""
            : "i";
        searchPattern = new RegExp(`\\b${escapedQuery}\\b`, flags);
      } else {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flags = replaceAll
          ? caseSensitive
            ? "g"
            : "gi"
          : caseSensitive
            ? ""
            : "i";
        searchPattern = new RegExp(escapedQuery, flags);
      }

      const originalMatches =
        content.match(new RegExp(searchPattern.source, "g")) || [];
      const newContent = content.replace(searchPattern, replaceText);

      return {
        success: true,
        originalContent: content,
        newContent: newContent,
        replacements: originalMatches.length,
        searchQuery: searchQuery,
        replaceText: replaceText,
        patternSource: searchPattern.source,
        patternFlags: searchPattern.flags,
        replaceAll: replaceAll,
      };
    } catch (error) {
      return {
        success: false,
        error: `خطأ في الاستبدال: ${error}`,
        originalContent: content,
        newContent: content,
        replacements: 0,
        searchQuery: searchQuery,
        replaceText: replaceText,
      };
    }
  }
}

class CollaborationSystem {
  private collaborators: Array<{ id: string; name: string; color: string }> = [];
  private comments: Array<{
    id: string;
    content: string;
    author: string;
    timestamp: Date;
    position: any;
  }> = [];
  private changeCallbacks: Array<(data: any) => void> = [];

  addCollaborator(collaborator: { id: string; name: string; color: string }) {
    this.collaborators.push(collaborator);
    this.notifyChanges({ type: "collaborator_added", collaborator });
  }

  removeCollaborator(id: string) {
    this.collaborators = this.collaborators.filter((c) => c.id !== id);
    this.notifyChanges({ type: "collaborator_removed", id });
  }

  addComment(comment: {
    id: string;
    content: string;
    author: string;
    timestamp: Date;
    position: any;
  }) {
    this.comments.push(comment);
    this.notifyChanges({ type: "comment_added", comment });
  }

  removeComment(id: string) {
    this.comments = this.comments.filter((c) => c.id !== id);
    this.notifyChanges({ type: "comment_removed", id });
  }

  subscribeToChanges(callback: (data: any) => void) {
    this.changeCallbacks.push(callback);
  }

  private notifyChanges(data: any) {
    this.changeCallbacks.forEach((callback) => callback(data));
  }

  getCollaborators() {
    return [...this.collaborators];
  }

  getComments() {
    return [...this.comments];
  }

  toggleComments() {
    logger.info("Toggling comments visibility");
    // Implementation for toggling comments
  }
}

export class AIWritingAssistant {
  async generateText(
    prompt: string,
    context: string,
    options: any = {},
  ): Promise<{ text?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: `نص مُولد بواسطة الذكاء الاصطناعي استنادًا إلى: "${prompt}"\n\nهذا نص تجريبي يُظهر كيف يمكن للمساعد إنشاء محتوى مفيد للمؤلف.`,
        });
      }, 1500);
    });
  }

  async rewriteText(text: string, style: string, options: any = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          originalText: text,
          rewrittenText: `النص المعاد كتابته بأسلوب ${style}:\n\n${text}`,
          changes: [
            { type: "style", description: `تم تطبيق أسلوب ${style}` },
            { type: "improvement", description: "تحسين التدفق العام" },
          ],
        });
      }, 1500);
    });
  }
}

class ProjectManager {
  private projects: Array<{
    id: string;
    name: string;
    createdAt: Date;
    lastModified: Date;
  }> = [];
  private templates: Array<{ id: string; name: string; content: string }> = [];

  createProject(name: string) {
    const project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      createdAt: new Date(),
      lastModified: new Date(),
    };
    this.projects.push(project);
    return project;
  }

  getProjects() {
    return [...this.projects];
  }

  getProject(id: string) {
    return this.projects.find((p) => p.id === id);
  }

  updateProject(id: string, updates: any) {
    const project = this.projects.find((p) => p.id === id);
    if (project) {
      Object.assign(project, updates, { lastModified: new Date() });
      return project;
    }
    return null;
  }

  deleteProject(id: string) {
    this.projects = this.projects.filter((p) => p.id !== id);
  }

  addTemplate(name: string, content: string) {
    const template = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      content,
    };
    this.templates.push(template);
    return template;
  }

  getTemplates() {
    return [...this.templates];
  }

  applyTemplate(templateId: string) {
    const template = this.templates.find((t) => t.id === templateId);
    return template ? template.content : null;
  }
}

class VisualPlanningSystem {
  private storyboards: Array<{
    id: string;
    sceneId: string;
    description: string;
    imageUrl?: string;
  }> = [];
  private beatSheets: Array<{
    id: string;
    act: number;
    beat: string;
    description: string;
  }> = [];

  addStoryboard(sceneId: string, description: string, imageUrl?: string) {
    const storyboard = {
      id: Math.random().toString(36).substr(2, 9),
      sceneId,
      description,
      imageUrl,
    };
    this.storyboards.push(storyboard);
    return storyboard;
  }

  getStoryboards() {
    return [...this.storyboards];
  }

  addBeatSheet(act: number, beat: string, description: string) {
    const beatSheet = {
      id: Math.random().toString(36).substr(2, 9),
      act,
      beat,
      description,
    };
    this.beatSheets.push(beatSheet);
    return beatSheet;
  }

  getBeatSheets() {
    return [...this.beatSheets];
  }
}

// ==================== MAIN SCREENPLAY EDITOR COMPONENT ====================

/**
 * Provides the main integrated screenplay editing experience with formatting, tooling, and AI helpers.
 *
 * @returns {JSX.Element} The fully interactive screenplay editor layout.
 */
const CleanIntegratedScreenplayEditor: React.FC = () => {
  // State variables
  const [htmlContent, setHtmlContent] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentFormat, setCurrentFormat] = useState("action");
  const [selectedFont, setSelectedFont] = useState("Amiri");
  const [selectedSize, setSelectedSize] = useState("14pt");
  const [documentStats, setDocumentStats] = useState({
    characters: 0,
    words: 0,
    pages: 1,
    scenes: 0,
  });

  // Menu states
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showAgentsPopup, setShowAgentsPopup] = useState(false);

  // Dialog states
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [showCharacterRename, setShowCharacterRename] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [oldCharacterName, setOldCharacterName] = useState("");
  const [newCharacterName, setNewCharacterName] = useState("");

  // AI review states
  const [showReviewerDialog, setShowReviewerDialog] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState("");

  // View states
  const [showRulers, setShowRulers] = useState(true);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);

  // Production-ready system instances
  const stateManager = useRef(new StateManager());
  const autoSaveManager = useRef(new AutoSaveManager());
  const searchEngine = useRef(new AdvancedSearchEngine());
  const collaborationSystem = useRef(new CollaborationSystem());
  const aiAssistant = useRef(new AIWritingAssistant());
  const projectManager = useRef(new ProjectManager());
  const visualPlanning = useRef(new VisualPlanningSystem());
  const screenplayClassifier = useRef(new ScreenplayClassifier());

  /**
   * Computes inline styles for a screenplay block based on the semantic format type.
   *
   * @param {string} formatType - The semantic style key (e.g., action, dialogue, transition).
   * @returns {React.CSSProperties} A merged style object ready for inline application.
   */
  const getFormatStyles = (formatType: string): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
      fontSize: selectedSize,
      direction: "rtl",
      lineHeight: "1.8",
      minHeight: "1.2em",
    };

    const formatStyles: { [key: string]: React.CSSProperties } = {
      basmala: { textAlign: "left", margin: "0" },
      "scene-header-top-line": {
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        margin: "1rem 0 0 0",
      },
      "scene-header-3": {
        textAlign: "center",
        fontWeight: "bold",
        margin: "0 0 1rem 0",
      },
      action: { textAlign: "right", margin: "12px 0" },
      character: {
        textAlign: "center",
        fontWeight: "bold",
        textTransform: "uppercase",
        width: "2.5in",
        margin: "12px auto 0 auto",
      },
      parenthetical: {
        textAlign: "center",
        fontStyle: "italic",
        width: "2.0in",
        margin: "6px auto",
      },
      dialogue: {
        textAlign: "center",
        width: "2.5in",
        lineHeight: "1.2",
        margin: "0 auto 12px auto",
      },
      transition: {
        textAlign: "center",
        fontWeight: "bold",
        textTransform: "uppercase",
        margin: "1rem 0",
      },
    };

    const finalStyles = { ...baseStyles, ...formatStyles[formatType] };

    if (formatType === "scene-header-1")
      return {
        ...baseStyles,
        fontWeight: "bold",
        textTransform: "uppercase",
        margin: "0",
      };
    if (formatType === "scene-header-2")
      return { ...baseStyles, fontStyle: "italic", margin: "0" };

    return finalStyles;
  };

  /**
   * Placeholder for future cursor tracking logic that keeps tool state in sync with caret position.
   *
   * @returns {void} Currently performs no action but preserves extensibility hooks.
   */
  const updateCursorPosition = () => {
    // Function implementation removed as variables are unused
  };

  /**
   * Determines whether the node containing the current caret position has any textual content.
   *
   * @returns {boolean} True when the focused element is empty; otherwise false.
   */
  const isCurrentElementEmpty = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.startContainer.parentElement;
      return element && element.textContent === "";
    }
    return false;
  };

  /**
   * Calculates aggregate document statistics and updates the sidebar dashboard.
   *
   * @returns {void} Synchronizes character, word, page, and scene counts with UI state.
   */
  const calculateStats = () => {
    if (editorRef.current) {
      const textContent = editorRef.current.innerText || "";
      const characters = textContent.length;
      const words = textContent.trim()
        ? textContent.trim().split(/\s+/).length
        : 0;
      const scenes = (textContent.match(/مشهد\s*\d+/gi) || []).length;

      // Calculate pages based on A4 height
      const scrollHeight = editorRef.current.scrollHeight;
      const pages = Math.max(1, Math.ceil(scrollHeight / (29.7 * 37.8)));

      setDocumentStats({ characters, words, pages, scenes });
    }
  };

  /**
   * Determines the next screenplay block format when the Tab key navigation is used.
   *
   * @param {string} currentFormat - The format applied to the current line.
   * @param {boolean} shiftKey - Indicates whether the Shift key is held to reverse navigation.
   * @returns {string} The next format identifier to apply.
   */
  const getNextFormatOnTab = (currentFormat: string, shiftKey: boolean) => {
    const mainSequence = [
      "scene-header-top-line",
      "action",
      "character",
      "transition",
    ];

    switch (currentFormat) {
      case "character":
        if (shiftKey) {
          return isCurrentElementEmpty() ? "action" : "transition";
        } else {
          return "dialogue";
        }
      case "dialogue":
        if (shiftKey) {
          return "character";
        } else {
          return "parenthetical";
        }
      case "parenthetical":
        return "dialogue";
      default:
        const currentIndex = mainSequence.indexOf(currentFormat);
        if (currentIndex !== -1) {
          if (shiftKey) {
            return mainSequence[Math.max(0, currentIndex - 1)];
          } else {
            return mainSequence[
              Math.min(mainSequence.length - 1, currentIndex + 1)
            ];
          }
        }
        return "action";
    }
  };

  /**
   * Resolves the subsequent format that should be applied after pressing Enter.
   *
   * @param {string} currentFormat - The format assigned to the current line.
   * @returns {string} The format key for the newly inserted line.
   */
  const getNextFormatOnEnter = (currentFormat: string) => {
    const transitions: { [key: string]: string } = {
      "scene-header-top-line": "scene-header-3",
      "scene-header-3": "action",
      "scene-header-1": "scene-header-3",
      "scene-header-2": "scene-header-3",
    };

    return transitions[currentFormat] || "action";
  };

  /**
   * Applies a semantic screenplay class to the block that currently contains the caret.
   *
   * @param {string} formatType - The screenplay format class to assign.
   * @returns {void} Updates the DOM element class and synchronizes internal state.
   */
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

  /**
   * Executes document editing commands such as bold or italic on the current selection.
   *
   * @param {string} command - The document.execCommand instruction to run.
   * @param {string} [value=''] - Optional value payload for the command.
   * @returns {void} Mutates the DOM selection with the requested formatting.
   */
  const formatText = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
  };

  /**
   * Synchronizes the editor HTML with component state and triggers dependent calculations.
   *
   * @returns {void} Persists the latest HTML snapshot and recalculates document metrics.
   */
  const updateContent = () => {
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const element = range.startContainer.parentElement;
        if (element) {
          setCurrentFormat(element.className || "action");
        }
      }

      calculateStats();
    }
  };

  /**
   * Intercepts keyboard shortcuts to provide screenplay-aware formatting behavior.
   *
   * @param {React.KeyboardEvent} e - The keyboard event triggered by the user.
   * @returns {void} Prevents default behaviors and applies screenplay-aware formatting transitions.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const nextFormat = getNextFormatOnTab(currentFormat, e.shiftKey);
      applyFormatToCurrentLine(nextFormat);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const nextFormat = getNextFormatOnEnter(currentFormat);
      applyFormatToCurrentLine(nextFormat);
    } else if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
        case "B":
          e.preventDefault();
          formatText("bold");
          break;
        case "i":
        case "I":
          e.preventDefault();
          formatText("italic");
          break;
        case "u":
        case "U":
          e.preventDefault();
          formatText("underline");
          break;
      }
    }

    // Small delay to ensure DOM updates before calculating stats
    setTimeout(updateContent, 10);
  };

  /**
   * Normalizes pasted content to plain text to preserve screenplay formatting integrity.
   *
   * @param {React.ClipboardEvent} e - The clipboard event fired when content is pasted.
   * @returns {void} Inserts sanitized text into the editor surface.
   */
  /**
   * Normalizes pasted content to plain text to preserve screenplay formatting integrity.
   *
   * @param {React.ClipboardEvent} e - The clipboard event fired when content is pasted.
   * @returns {void} Inserts sanitized text into the editor surface.
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");

    // Split into lines and process each
    const lines = text.split(/\r\n|\r|\n/);
    let htmlResult = "";

    let lastFormat = currentFormat;
    let isInDialogueBlock = false;
    let currentCharacter = ""; // ← CRITICAL FIX: Add currentCharacter tracking

    lines.forEach((line) => {
      const normalized = ScreenplayClassifier.normalizeLine(line);
      if (!normalized) {
        // Blank line - reset context
        currentCharacter = "";
        isInDialogueBlock = false;
        return;
      }

      // Context for classifier
      const context = { lastFormat, isInDialogueBlock };

      let formatType = "action";

      // 1. Check Scene Header using Agent
      const sceneHeaderResult = SceneHeaderAgent(line, { inDialogue: isInDialogueBlock }, getFormatStyles);
      if (sceneHeaderResult && sceneHeaderResult.processed) {
        htmlResult += sceneHeaderResult.html;
        lastFormat = "scene-header-3";
        isInDialogueBlock = false;
        currentCharacter = "";
        return;
      }

      // 2. Classify Line
      if (ScreenplayClassifier.isBasmala(line)) {
        formatType = "basmala";
        isInDialogueBlock = false;
        currentCharacter = "";
      } else if (ScreenplayClassifier.isTransition(line)) {
        formatType = "transition";
        isInDialogueBlock = false;
        currentCharacter = "";
      } else if (ScreenplayClassifier.isCharacterLine(line, context)) {
        formatType = "character";
        isInDialogueBlock = true;
        currentCharacter = line.trim().replace(":", "");
      } else if (ScreenplayClassifier.isParenShaped(line) && isInDialogueBlock) {
        formatType = "parenthetical";
      } else if (currentCharacter && !line.includes(":")) {
        // CRITICAL FIX: Enhanced logic from source (lines 692-738)
        // If we have a current character and this line doesn't look like a new character,
        // check if it's actually dialogue or just an action description
        if (ScreenplayClassifier.isLikelyAction(line)) {
          formatType = "action";
          isInDialogueBlock = false;
          currentCharacter = "";
        } else {
          // Additional check for action descriptions
          const actionDescriptionPatterns = [
            /^\s*[-–—]\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/,
            /^\s*[-–—]\s*[ي|ت][\u0600-\u06FF]+/,
            /^\s*(?:نرى|ننظر|نسمع|نلاحظ|يبدو|يظهر|يبدأ|ينتهي|يستمر|يتوقف|يتحرك|يحدث|يكون|يوجد|توجد|تظهر)/
          ];

          let isActionDescription = false;
          for (const pattern of actionDescriptionPatterns) {
            if (pattern.test(line)) {
              isActionDescription = true;
              break;
            }
          }

          if (isActionDescription) {
            formatType = "action";
            isInDialogueBlock = false;
            currentCharacter = "";
          } else {
            // Finally, treat as dialogue
            formatType = "dialogue";
          }
        }
      } else if (isInDialogueBlock) {
        // Still in dialogue block but no currentCharacter, use isLikelyAction
        if (ScreenplayClassifier.isLikelyAction(line)) {
          formatType = "action";
          isInDialogueBlock = false;
          currentCharacter = "";
        } else {
          formatType = "dialogue";
        }
      } else {
        // Default to action
        formatType = "action";
        isInDialogueBlock = false;
        currentCharacter = "";
      }

      // 3. Generate HTML
      const styles = getFormatStyles(formatType);
      const cssString = toCssString(styles);

      htmlResult += `<div class="${formatType}" style="${cssString}">${escapeHtml(line.trim())}</div>`;
      lastFormat = formatType;
    });

    // 4. Post-process (CRITICAL FIX: pass getFormatStyles)
    const finalHtml = postProcessFormatting(htmlResult, getFormatStyles);

    // 5. Insert
    document.execCommand("insertHTML", false, finalHtml);
  };

  /**
   * Responds to editor mutations triggered by input events.
   *
   * @returns {void} Synchronizes component state with the latest editor markup.
   */
  const handleContentChange = () => {
    updateContent();
  };

  /**
   * Executes a search across the editor content using the advanced search engine helper.
   *
   * @returns {Promise<void>} Resolves after presenting the search results to the user.
   */
  const handleSearch = async () => {
    if (!searchTerm.trim() || !editorRef.current) return;

    const content = editorRef.current.innerText;
    const result = await searchEngine.current.searchInContent(
      content,
      searchTerm,
    );

    if (result.success) {
      alert(`Found ${result.totalMatches} matches for "${searchTerm}"`);
    } else {
      alert(`Search failed: ${result.error}`);
    }
  };

  /**
   * Performs find-and-replace operations across the screenplay content.
   *
   * @returns {Promise<void>} Resolves after replacing matching instances and updating the editor.
   */
  const handleReplace = async () => {
    if (!searchTerm.trim() || !editorRef.current) return;

    const content = editorRef.current.innerText;
    const result = await searchEngine.current.replaceInContent(
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

  /**
   * Renames a character by replacing matching uppercase headings throughout the document.
   *
   * @returns {void} Applies the rename and closes the rename dialog when complete.
   */
  const handleCharacterRename = () => {
    if (
      !oldCharacterName.trim() ||
      !newCharacterName.trim() ||
      !editorRef.current
    )
      return;

    const regex = new RegExp(`^\\s*${oldCharacterName}\\s*$`, "gmi");

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
        setOldCharacterName("");
        setNewCharacterName("");
      } else {
        alert(
          `لم يتم العثور على الشخصية "${oldCharacterName}" لإعادة تسميتها.`,
        );
      }
    }
  };

  /**
   * Simulates an AI-powered review of the screenplay content and surfaces the findings.
   *
   * @returns {Promise<void>} Resolves after generating and displaying the mock review output.
   */
  const handleAIReview = async () => {
    if (!editorRef.current) return;

    setIsReviewing(true);
    const content = editorRef.current.innerText;

    try {
      // In a real implementation, this would call an AI service
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockReview = `AI Review Results:

Strengths:
- Good character development
- Strong dialogue
- Clear scene structure

Areas for improvement:
- Consider adding more action descriptions
- Some dialogue could be more natural
- Scene transitions could be smoother

Suggestions:
- Add more sensory details to action lines
- Vary sentence structure in dialogue
- Ensure each scene has a clear purpose`;

      setReviewResult(mockReview);
    } catch (error) {
      setReviewResult(`AI review failed: ${error}`);
    } finally {
      setIsReviewing(false);
    }
  };

  /**
   * Switches between light and dark themes for the editor workspace.
   *
   * @returns {void} Flips the dark-mode state flag.
   */
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Initialize editor
  useEffect(() => {
    if (editorRef.current) {
      // Set initial content

      // Set initial content
      editorRef.current.innerHTML = `
        <div class="basmala" style="${toCssString(getFormatStyles("basmala"))}">
          بسم الله الرحمن الرحيم
        </div>
        <div class="scene-header-top-line" style="${toCssString(
        getFormatStyles("scene-header-top-line"),
      )}">
          <div>المؤلف: اسم المؤلف</div>
          <div>التاريخ: ${new Date().toLocaleDateString("ar")}</div>
        </div>
        <div class="scene-header-3" style="${toCssString(
        getFormatStyles("scene-header-3"),
      )}">
          مشهد 1
        </div>
        <div class="action" style="${toCssString(getFormatStyles("action"))}">
          [وصف المشهد والأفعال هنا]
        </div>
        <div class="character" style="${toCssString(
        getFormatStyles("character"),
      )}">
          الاسم
        </div>
        <div class="dialogue" style="${toCssString(
        getFormatStyles("dialogue"),
      )}">
          [الحوار هنا]
        </div>
      `;

      updateContent();
    }

    // Set up auto-save
    autoSaveManager.current.setSaveCallback(async (content) => {
      // In a real implementation, this would save to a database or file
      logger.info("Auto-saved content:", content);
    });
    autoSaveManager.current.startAutoSave();

    // Clean up
    return () => {
      autoSaveManager.current.stopAutoSave();
    };
  }, []);

  // Update stats when content changes
  useEffect(() => {
    calculateStats();
  }, [htmlContent]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .screenplay-editor-root {
            background-color: #1E1E1E !important;
            min-height: 100vh;
          }
          .screenplay-editor-main-container {
            background-color: #2D2D2D !important;
          }
        `
      }} />
      <div className="screenplay-editor-root">

        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <MainHeader
            onInfo={() => {
              // Toggle sidebar or show stats
              const sidebar = document.querySelector(".sidebar");
              if (sidebar) {
                sidebar.classList.toggle("hidden");
              }
            }}
            onUndo={() => document.execCommand("undo")}
            onRedo={() => document.execCommand("redo")}
            onSave={() => autoSaveManager.current.forceSave()}
            onFileDownload={() => {
              // Trigger export menu or default export
              setShowFileMenu(true);
            }}
            onHistory={() => {
              // Future: Show history popup
              logger.info("History feature coming soon");
            }}
            onComment={() => {
              // Future: Toggle collaboration comments
              collaborationSystem.current.toggleComments();
            }}
            onTips={() => setShowAgentsPopup(true)}
            onMedicalServices={() => setShowReviewerDialog(true)}
            onDownload={() => window.print()}
            onMic={() => {
              // Future: Implement speech-to-text
              logger.info("Microphone feature coming soon");
            }}
            canUndo={true}
            canRedo={true}
          />

          {/* Secondary Toolbar (Original) */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Film className="text-blue-500" />
              <h1 className="text-xl font-bold">محرر السيناريو العربي</h1>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowFileMenu(!showFileMenu)}
                  className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  ملف <ChevronDown size={16} className="mr-1" />
                </button>

                {showFileMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                    <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <FilePlus size={16} className="ml-2" /> جديد
                    </button>
                    <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <FolderOpen size={16} className="ml-2" /> فتح
                    </button>
                    <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Save size={16} className="ml-2" /> حفظ
                    </button>
                    <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Download size={16} className="ml-2" /> تصدير
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowEditMenu(!showEditMenu)}
                  className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  تحرير <ChevronDown size={16} className="mr-1" />
                </button>

                {showEditMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                    <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Undo size={16} className="ml-2" /> تراجع
                    </button>
                    <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Redo size={16} className="ml-2" /> إعادة
                    </button>
                    <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Scissors size={16} className="ml-2" /> قص
                    </button>
                    <button className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Copy size={16} className="ml-2" /> نسخ
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowFormatMenu(!showFormatMenu)}
                  className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  تنسيق <ChevronDown size={16} className="mr-1" />
                </button>

                {showFormatMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                    <button
                      onClick={() =>
                        applyFormatToCurrentLine("scene-header-top-line")
                      }
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      عنوان المشهد العلوي
                    </button>
                    <button
                      onClick={() => applyFormatToCurrentLine("scene-header-3")}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      عنوان المشهد
                    </button>
                    <button
                      onClick={() => applyFormatToCurrentLine("action")}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      وصف الأفعال
                    </button>
                    <button
                      onClick={() => applyFormatToCurrentLine("character")}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      الشخصية
                    </button>
                    <button
                      onClick={() => applyFormatToCurrentLine("dialogue")}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      الحوار
                    </button>
                    <button
                      onClick={() => applyFormatToCurrentLine("transition")}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      الانتقال
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowToolsMenu(!showToolsMenu)}
                  className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  أدوات <ChevronDown size={16} className="mr-1" />
                </button>

                {showToolsMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
                    <button
                      onClick={() => setShowSearchDialog(true)}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Search size={16} className="ml-2" /> بحث
                    </button>
                    <button
                      onClick={() => setShowReplaceDialog(true)}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Replace size={16} className="ml-2" /> استبدال
                    </button>
                    <button
                      onClick={() => setShowCharacterRename(true)}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <UserSquare size={16} className="ml-2" /> إعادة تسمية
                      الشخصية
                    </button>
                    <button
                      onClick={() => setShowReviewerDialog(true)}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Sparkles size={16} className="ml-2" /> مراجعة الذكاء
                      الاصطناعي
                    </button>
                    <button
                      onClick={() => setShowAgentsPopup(true)}
                      className="block w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Brain size={16} className="ml-2" /> الوكلاء المتقدمة
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => window.print()}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="طباعة"
              >
                <Printer size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main content - DARK BACKGROUND CONTAINER */}
        <div className="flex screenplay-editor-main-container" style={{ backgroundColor: isDarkMode ? "#1E1E1E" : "#2D2D2D" }}>
          {/* Editor - CENTERED A4 PAGE */}
          <div
            className="flex-1 p-8"
            style={{
              backgroundColor: isDarkMode ? "#1E1E1E" : "#2D2D2D",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              minHeight: "calc(100vh - 64px)" // Full viewport minus header
            }}
          >
            <div
              ref={editorRef}
              contentEditable
              className="screenplay-page min-h-[29.7cm] focus:outline-none"
              style={{
                fontFamily: `${selectedFont}, Amiri, Cairo, Noto Sans Arabic, Arial, sans-serif`,
                fontSize: selectedSize,
                direction: "rtl",
                lineHeight: "1.8",
                width: "21cm", // A4 width
                margin: "2rem auto",
                paddingTop: "1in",
                paddingBottom: "1in",
                paddingRight: "1.5in", // Binding margin
                paddingLeft: "1in",
                backgroundColor: "#FFFFFF", // Pure white paper
                color: "#000000",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", // Professional drop shadow
                borderRadius: "2px", // Subtle corner rounding
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onInput={handleContentChange}
            />
          </div>

          {/* Sidebar */}
          <div className="no-print sidebar w-64 border-l border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">الإحصائيات</h3>
                <div className="space-y-1 text-sm">
                  <div>الشخصيات: {documentStats.characters}</div>
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
                  <button
                    onClick={() => applyFormatToCurrentLine("scene-header-3")}
                    className="w-full text-right p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded flex items-center"
                  >
                    <Hash size={16} className="ml-2" /> إضافة مشهد
                  </button>
                  <button
                    onClick={() => applyFormatToCurrentLine("character")}
                    className="w-full text-right p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 rounded flex items-center"
                  >
                    <UserSquare size={16} className="ml-2" /> إضافة شخصية
                  </button>
                  <button
                    onClick={() => applyFormatToCurrentLine("dialogue")}
                    className="w-full text-right p-2 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 rounded flex items-center"
                  >
                    <MessageCircle size={16} className="ml-2" /> إضافة حوار
                  </button>
                  <button
                    onClick={() => applyFormatToCurrentLine("transition")}
                    className="w-full text-right p-2 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded flex items-center"
                  >
                    <FastForward size={16} className="ml-2" /> إضافة انتقال
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Dialog */}
        {showSearchDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Search className="ml-2" /> بحث
                </h3>
                <button onClick={() => setShowSearchDialog(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1">كلمة البحث</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    placeholder="أدخل النص للبحث عنه"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowSearchDialog(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    بحث
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Replace Dialog */}
        {showReplaceDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Replace className="ml-2" /> بحث واستبدال
                </h3>
                <button onClick={() => setShowReplaceDialog(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1">البحث عن</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    placeholder="أدخل النص للبحث عنه"
                  />
                </div>

                <div>
                  <label className="block mb-1">استبدال بـ</label>
                  <input
                    type="text"
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    placeholder="أدخل النص البديل"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowReplaceDialog(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleReplace}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    استبدال
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Character Rename Dialog */}
        {showCharacterRename && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <UserSquare className="ml-2" /> إعادة تسمية الشخصية
                </h3>
                <button onClick={() => setShowCharacterRename(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1">الاسم الحالي</label>
                  <input
                    type="text"
                    value={oldCharacterName}
                    onChange={(e) => setOldCharacterName(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    placeholder="أدخل الاسم الحالي"
                  />
                </div>

                <div>
                  <label className="block mb-1">الاسم الجديد</label>
                  <input
                    type="text"
                    value={newCharacterName}
                    onChange={(e) => setNewCharacterName(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    placeholder="أدخل الاسم الجديد"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowCharacterRename(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleCharacterRename}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    إعادة تسمية
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Reviewer Dialog */}
        {showReviewerDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-1/2 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Sparkles className="ml-2" /> مراجعة الذكاء الاصطناعي
                </h3>
                <button onClick={() => setShowReviewerDialog(false)}>
                  <X size={20} />
                </button>
              </div>

              {isReviewing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="animate-spin mb-4" size={32} />
                  <p>جاري تحليل النص باستخدام الذكاء الاصطناعي...</p>
                </div>
              ) : reviewResult ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded whitespace-pre-line">
                    {reviewResult}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowReviewerDialog(false)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>هل تريد مراجعة النص باستخدام الذكاء الاصطناعي؟</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowReviewerDialog(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleAIReview}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      مراجعة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Agents Popup */}
        <AdvancedAgentsPopup
          isOpen={showAgentsPopup}
          onClose={() => setShowAgentsPopup(false)}
          content={editorRef.current?.innerText || ""}
        />
      </div>
    </>
  );
};

export default CleanIntegratedScreenplayEditor;

