import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtendedCastMember } from "../types";

// ============================================
// CONFIGURATION
// ============================================

const DEFAULT_CAST_MODEL = 'gemini-3-pro-preview';

export interface CastAgentOptions {
  apiKey?: string;
  model?: string;
}

/**
 * Initialize Google GenAI with API key - Safe handling
 */
const getAI = (apiKey?: string): GoogleGenAI => {
  const keyToUse = apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!keyToUse) {
    console.warn('⚠️ Warning: GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenAI({ apiKey: keyToUse });
};

// ============================================
// TYPES
// ============================================

export type RoleCategory = 'Lead' | 'Supporting' | 'Bit Part' | 'Silent' | 'Group' | 'Mentioned' | 'Mystery';
export type ViewMode = 'grid' | 'list' | 'stats' | 'network' | 'timeline';
export type SortOption = 'importance' | 'name' | 'scenes' | 'dialogue' | 'alpha';
export type EmotionType = 'neutral' | 'positive' | 'negative' | 'intense' | 'mysterious';

export interface CharacterProfile {
  id: string;
  name: string;
  normalizedName: string;
  age: string;
  gender: string;
  roleType: RoleCategory;
  description: string;
  dialogueCount: number;
  wordCount: number;
  mentionCount: number;
  scenes: number[];
  mentionedScenes: number[];
  firstScene: number;
  lastScene: number;
  importanceScore: number;
  aliases: string[];
  isTimeVariant?: boolean;
  genderConflict?: boolean;
  emotions?: EmotionStats;
  tags?: string[];
  notes?: string;
  color?: string;
}

export interface EmotionStats {
  neutral: number;
  positive: number;
  negative: number;
  intense: number;
  mysterious: number;
  dominant: EmotionType;
}

export interface SceneData {
  number: number;
  heading: string;
  characters: string[];
  mentioned: string[];
  location?: string;
  timeOfDay?: string;
  pageEstimate?: number;
}

export interface AnalysisResult {
  characters: CharacterProfile[];
  scenes: SceneData[];
  totalScenes: number;
  suggestions: MergeSuggestion[];
  stats?: OverallStats;
}

export interface MergeSuggestion {
  sourceId: string;
  targetId: string;
  reason: string;
}

export interface OverallStats {
  totalCharacters: number;
  totalDialogue: number;
  avgSceneLength: number;
  genderDistribution: { male: number; female: number; unknown: number };
  emotionDistribution: EmotionStats;
  mostActiveScene: number;
  characterConnections: number;
}

export interface Connection {
  source: string;
  target: string;
  strength: number;
  scenes: number[];
}

// ============================================
// CONSTANTS & NLP LISTS
// ============================================

const GROUP_KEYWORDS = [
  'CROWD', 'POLICE', 'GUARDS', 'SOLDIERS', 'PEOPLE', 'MEN', 'WOMEN', 'KIDS', 'OFFICERS', 'GUESTS', 'EMPLOYEES', 'THUGS', 'GANG', 'TEAM', 'STAFF', 'VOICES',
  'الشرطة', 'شرطة', 'حراس', 'جنود', 'عساكر', 'ناس', 'جمهور', 'رجال', 'نساء', 'أطفال', 'ضيوف', 'موظفين', 'عمال', 'فريق', 'عصابة', 'أصوات', 'المعازيم', 'أمن', 'الأمن', 'المارة', 'الجميع', 'الكل'
];

const GENERIC_KEYWORDS = [
  'MAN', 'WOMAN', 'STRANGER', 'FIGURE', 'UNKNOWN', 'TBD', 'SOMEONE', 'VOICE',
  'رجل', 'امرأة', 'شخص', 'مجهول', 'غريب', 'شبح', 'صوت', 'أحدهم', 'الرجل', 'المرأة', 'فتاة', 'ولد'
];

const TRANSITIONS = [
  'CUT TO:', 'FADE IN:', 'FADE OUT', 'DISSOLVE TO:', 'SMASH CUT TO:', 'MATCH CUT TO:', 'TIME CUT:', 'JUMP CUT TO:', 'INTERCUT WITH:', 'END', 'THE END',
  'قطع إلى', 'ظلام', 'تلاشي', 'نهاية', 'النهاية', 'قطع', 'انتقال'
];

const TECHNICAL_EXTENSIONS = [
  'V.O', 'O.S', 'CONT\'D', 'FILTERED', 'ON PHONE', 'INTO PHONE',
  'صوت', 'تابع', 'على الهاتف', 'عبر الهاتف', 'خارج الكادر', 'مكمل', 'من الهاتف'
];

const ARABIC_TITLES = [
  'أبو', 'ابو', 'أم', 'ام', 'الشيخ', 'الحاج', 'حاج', 'دكتور', 'د.', 'الست', 'المعلم', 'الاسطى', 'كابتن', 'اللواء', 'العقيد', 'المقدم', 'يا', 'السيد', 'الأستاذ'
];

// EMOTION KEYWORDS (Arabic & English)
const EMOTION_KEYWORDS: Record<string, string[]> = {
  positive: [
    'سعيد', 'فرح', 'ضحك', 'أحب', 'حب', 'أمل', 'نجح', 'فوز', 'سلام', 'جميل', 'رائع', 'ممتاز',
    'happy', 'laugh', 'love', 'hope', 'success', 'beautiful', 'wonderful', 'excellent', 'smile', 'joy'
  ],
  negative: [
    'حزين', 'بكي', 'ألم', 'خوف', 'غضب', 'كره', 'مات', 'موت', 'فشل', 'حزن', 'بكا', 'صرخ',
    'sad', 'cry', 'pain', 'fear', 'anger', 'hate', 'death', 'fail', 'sorrow', 'scream', 'cry'
  ],
  intense: [
    'صريخ', 'صراخ', 'هجوم', 'ضرب', 'قتل', 'انفجار', 'هرب', 'طار', 'ضغط', 'عنيف',
    'scream', 'shout', 'attack', 'hit', 'kill', 'explosion', 'run', 'violent', 'urgent'
  ],
  mysterious: [
    'سر', 'غامض', 'مجهول', 'ظل', 'خفي', 'مريب', 'مشبوه', 'لغز',
    'secret', 'mystery', 'unknown', 'shadow', 'hidden', 'suspicious', 'puzzle', 'strange'
  ]
};

// Character color palette for visual distinction
export const CHARACTER_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

// ============================================
// NLP HELPERS
// ============================================

/**
 * Normalizes Arabic text for accurate matching
 */
export const normalizeArabic = (text: string): string => {
  if (!text) return "";
  let normalized = text;
  normalized = normalized.replace(/\u0640/g, ''); // Remove tatweel
  normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, ''); // Remove diacritics
  normalized = normalized.replace(/[أإآ]/g, 'ا');
  normalized = normalized.replace(/ى/g, 'ي');
  normalized = normalized.replace(/ة/g, 'ه');
  return normalized.trim().toUpperCase();
};

/**
 * Checks if a line is a scene heading
 */
export const isSceneHeading = (line: string): boolean => {
  const upperLine = line.trim().toUpperCase();
  const patterns = [
    /^INT\./, /^EXT\./, /^I\/E\./, /^INT\/EXT/,
    /^DAKHEL/, /^KHAREG/,
    /^مشهد/, /^داخلي/, /^خارجي/, /^ليل/, /^نهار/,
    /^\d+\s*[\-\.]/
  ];
  return patterns.some(pattern => pattern.test(upperLine));
};

/**
 * Checks if a line is a transition
 */
export const isTransition = (line: string): boolean => {
  const upper = line.trim().toUpperCase();
  return TRANSITIONS.some(t => upper.startsWith(t) || upper.endsWith(t.replace(':', '')));
};

/**
 * Checks if a line is a comment
 */
export const isComment = (line: string): boolean => {
  const trim = line.trim();
  return trim.startsWith('//') || trim.startsWith('[[') || (trim.startsWith('(') && trim.endsWith(')'));
};

/**
 * Parses character name from script header
 */
export const parseNameHeader = (line: string) => {
  let raw = line.trim();
  const parenMatch = raw.match(/\((.*?)\)/);
  let isVariant = false;
  if (parenMatch) {
    const content = parenMatch[1].toUpperCase().trim();
    const isTech = TECHNICAL_EXTENSIONS.some(ext => content.includes(ext) || content === ext);
    if (isTech) {
      raw = raw.replace(/\(.*?\)/, '').trim();
    } else {
      isVariant = true;
    }
  }
  raw = raw.replace(/[:\-]$/, '').trim();
  raw = raw.replace(/^[\.\-\*]+/, '').trim();
  return { name: raw.toUpperCase(), isVariant };
};

/**
 * Determines if a line is likely a character name
 */
export const isLikelyCharacter = (line: string, nextLine: string): boolean => {
  const trimmed = line.trim();
  const nextTrimmed = nextLine ? nextLine.trim() : '';

  if (!trimmed || isSceneHeading(line) || isTransition(line) || isComment(line)) return false;
  if (trimmed.length > 40) return false;

  const isAllUpper = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
  const isArabicName = /[\u0600-\u06FF]/.test(trimmed);
  const startsWithTitle = ARABIC_TITLES.some(t => trimmed.startsWith(t + ' '));

  const isShortLine = trimmed.length < 30 && trimmed.split(' ').length <= 5;
  const nextIsDialogue = nextTrimmed.length > 0 && !isSceneHeading(nextTrimmed) && !isTransition(nextTrimmed);
  const hasNumber = /\d/.test(trimmed);

  return (isAllUpper || isArabicName || startsWithTitle || hasNumber) && isShortLine && nextIsDialogue;
};

/**
 * Scans text for character mentions
 */
export const scanForMentions = (text: string, knownNames: string[]): string[] => {
  if (!text) return [];
  const found: string[] = [];
  const normText = normalizeArabic(text);

  knownNames.forEach(name => {
    if (name.length < 3) return;
    const normName = normalizeArabic(name);
    if (normText.includes(` ${normName} `) || normText.startsWith(`${normName} `) || normText.endsWith(` ${normName}`)) {
      found.push(name);
    }
  });
  return [...new Set(found)];
};

/**
 * Counts words in text
 */
export const countWords = (text: string) => text.trim().split(/\s+/).length;

// ============================================
// ADVANCED ANALYSIS FUNCTIONS
// ============================================

/**
 * Analyzes emotion from text
 */
export const analyzeEmotion = (text: string): EmotionStats => {
  const normalized = text.toLowerCase();
  const stats: EmotionStats = {
    neutral: 0,
    positive: 0,
    negative: 0,
    intense: 0,
    mysterious: 0,
    dominant: 'neutral'
  };

  Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
    const count = keywords.filter(kw => normalized.includes(kw.toLowerCase())).length;
    stats[emotion as EmotionType] = count;
  });

  // Find dominant emotion
  const emotionEntries = Object.entries(stats).filter(([k]) => k !== 'dominant') as [EmotionType, number][];
  const max = Math.max(...emotionEntries.map(([, v]) => v));
  if (max > 0) {
    stats.dominant = emotionEntries.find(([, v]) => v === max)?.[0] || 'neutral';
  }

  return stats;
};

/**
 * Analyzes gender and detects conflicts
 */
export const analyzeGenderAndConflict = (lines: string[], charName: string): { gender: string, conflict: boolean, desc: string } => {
  let maleScore = 0;
  let femaleScore = 0;
  let firstDesc = "";

  const normName = normalizeArabic(charName);

  const malePatterns = [/\b(هو|قال|نظر|مشى|جلس|وقف|صرخ|ضحك)\b/, /\b(HE|HIM|HIS|MAN|BOY)\b/i];
  const femalePatterns = [/\b(هي|قالت|نظرت|مشت|جلست|وقفت|صرخت|ضحكت)\b/, /\b(SHE|HER|HERS|WOMAN|GIRL)\b/i];

  lines.forEach(line => {
    if (isSceneHeading(line) || isTransition(line)) return;

    if (normalizeArabic(line).includes(normName)) {
      if (!firstDesc) firstDesc = line;
      if (malePatterns.some(p => p.test(line))) maleScore++;
      if (femalePatterns.some(p => p.test(line))) femaleScore++;
    }
  });

  let gender = "";
  if (maleScore > femaleScore) gender = "ذكر";
  else if (femaleScore > maleScore) gender = "أنثى";

  const total = maleScore + femaleScore;
  const conflict = total > 3 && (Math.min(maleScore, femaleScore) / total > 0.25);

  return { gender, conflict, desc: firstDesc };
};

/**
 * Extracts scene location and time from heading
 */
export const extractSceneLocation = (heading: string): { location?: string, timeOfDay?: string } => {
  const upper = heading.toUpperCase();
  let timeOfDay = 'unknown';
  let location = 'unknown';

  // Time of day detection
  if (upper.includes('NIGHT') || upper.includes('ليلا') || upper.includes('ليل')) timeOfDay = 'night';
  else if (upper.includes('DAY') || upper.includes('نهار') || upper.includes('صباح')) timeOfDay = 'day';
  else if (upper.includes('MORNING') || upper.includes('صباحا')) timeOfDay = 'morning';
  else if (upper.includes('EVENING') || upper.includes('مساء')) timeOfDay = 'evening';
  else if (upper.includes('SUNSET') || upper.includes('غروب')) timeOfDay = 'sunset';
  else if (upper.includes('DAWN') || upper.includes('فجر')) timeOfDay = 'dawn';

  // Location extraction
  const locationMatch = heading.match(/(?:INT\.|EXT\.|DAKHEL|KHAREG|داخلي|خارجي)\s*(.+?)(?:\s*-\s*[A-Z]+)?$/);
  if (locationMatch) {
    location = locationMatch[1].trim();
  }

  return { location, timeOfDay };
};

/**
 * Calculates connections between characters based on scene co-appearance
 */
export const calculateConnections = (scenes: SceneData[]): Connection[] => {
  const connections: Connection[] = [];
  const connectionMap = new Map<string, Connection>();

  scenes.forEach(scene => {
    const chars = scene.characters.filter(c => !GROUP_KEYWORDS.some(k => c.includes(k)));

    for (let i = 0; i < chars.length; i++) {
      for (let j = i + 1; j < chars.length; j++) {
        const key = [chars[i], chars[j]].sort().join('-');
        const existing = connectionMap.get(key);

        if (existing) {
          existing.strength++;
          existing.scenes.push(scene.number);
        } else {
          const conn: Connection = {
            source: chars[i],
            target: chars[j],
            strength: 1,
            scenes: [scene.number]
          };
          connectionMap.set(key, conn);
          connections.push(conn);
        }
      }
    }
  });

  return connections.sort((a, b) => b.strength - a.strength);
};

/**
 * Generates character tags based on profile
 */
export const generateCharacterTags = (char: CharacterProfile): string[] => {
  const tags: string[] = [];

  if (char.roleType === 'Lead') tags.push('protagonist');
  if (char.dialogueCount > 50) tags.push('talkative');
  if (char.scenes.length > char.scenes.length * 0.5) tags.push('frequent');
  if (char.mentionCount > 10) tags.push('mentioned');
  if (char.genderConflict) tags.push('conflict');
  if (char.isTimeVariant) tags.push('time-variant');
  if (char.scenes.length > 0) {
    const span = char.lastScene - char.firstScene;
    if (span > char.scenes.length * 0.7) tags.push('arc-span');
  }

  return tags;
};

// ============================================
// MAIN ANALYSIS FUNCTION (LOCAL NLP)
// ============================================

/**
 * Analyzes script text and extracts character information using local NLP
 * No API key required - uses pattern matching and linguistic analysis
 */
export const analyzeScriptLocal = (scriptText: string): AnalysisResult => {
  const lines = scriptText.split('\n');
  const scenes: SceneData[] = [];
  const charMap = new Map<string, {
    dialogueCount: number,
    wordCount: number,
    mentionCount: number,
    activeScenes: Set<number>,
    mentionedScenes: Set<number>,
    isVariant: boolean
  }>();

  let currentSceneNum = 0;
  let currentScene: SceneData = { number: 0, heading: 'START', characters: [], mentioned: [] };

  // PASS 1: Detect Active Characters
  const potentialNames = new Set<string>();
  const dialogueMap = new Map<string, string[]>(); // Store dialogue for emotion analysis

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';

    if (isComment(line)) continue;

    if (isSceneHeading(line)) {
      if (currentScene.number > 0 || currentScene.characters.length > 0) {
        scenes.push({ ...currentScene });
      }
      currentSceneNum++;
      const { location, timeOfDay } = extractSceneLocation(line);
      currentScene = {
        number: currentSceneNum,
        heading: line.trim(),
        characters: [],
        mentioned: [],
        location,
        timeOfDay
      };
    } else if (isLikelyCharacter(line, nextLine)) {
      const { name: parsedName, isVariant } = parseNameHeader(line);
      potentialNames.add(parsedName);

      if (!currentScene.characters.includes(parsedName)) {
        currentScene.characters.push(parsedName);
      }

      const stats = charMap.get(parsedName) || {
        dialogueCount: 0,
        wordCount: 0,
        mentionCount: 0,
        activeScenes: new Set(),
        mentionedScenes: new Set(),
        isVariant
      };
      stats.dialogueCount++;
      stats.wordCount += countWords(nextLine);
      stats.activeScenes.add(currentSceneNum || 1);
      charMap.set(parsedName, stats);

      // Store dialogue for emotion analysis
      if (!dialogueMap.has(parsedName)) dialogueMap.set(parsedName, []);
      dialogueMap.get(parsedName)!.push(nextLine);
    }
  }
  scenes.push(currentScene);

  // PASS 2: Mentions & Action Scan
  const nameList = Array.from(potentialNames);
  currentSceneNum = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isSceneHeading(line)) {
      currentSceneNum++;
      continue;
    }
    if (isTransition(line) || isComment(line)) continue;

    const isHeader = isLikelyCharacter(line, lines[i + 1] || '');

    if (!isHeader) {
      const foundNames = scanForMentions(line, nameList);
      foundNames.forEach(name => {
        const prevIsHeader = i > 0 && isLikelyCharacter(lines[i - 1], line);
        const stats = charMap.get(name);

        if (stats) {
          if (prevIsHeader) {
            stats.mentionCount++;
            if (!stats.activeScenes.has(currentSceneNum)) {
              stats.mentionedScenes.add(currentSceneNum || 1);
              const sceneObj = scenes.find(s => s.number === (currentSceneNum || 1));
              if (sceneObj && !sceneObj.characters.includes(name) && !sceneObj.mentioned.includes(name)) {
                sceneObj.mentioned.push(name);
              }
            }
          } else {
            if (!stats.activeScenes.has(currentSceneNum)) {
              stats.activeScenes.add(currentSceneNum || 1);
              const sceneObj = scenes.find(s => s.number === (currentSceneNum || 1));
              if (sceneObj && !sceneObj.characters.includes(name)) {
                sceneObj.characters.push(name);
                sceneObj.mentioned = sceneObj.mentioned.filter(n => n !== name);
              }
            }
          }
        }
      });
    }
  }

  // PASS 3: Build Final Profiles with Enhanced Analysis
  const profiles: CharacterProfile[] = [];
  const totalScenes = currentSceneNum || 1;
  let maxWords = 0;
  charMap.forEach(s => { if (s.wordCount > maxWords) maxWords = s.wordCount; });

  charMap.forEach((stats, name) => {
    const isGroup = GROUP_KEYWORDS.some(k => name.includes(k));
    const isGeneric = GENERIC_KEYWORDS.some(k => name === k || name === `THE ${k}` || name === `ال${k}`);

    const { gender, conflict, desc } = analyzeGenderAndConflict(lines, name);

    // Emotion analysis
    const dialogueText = dialogueMap.get(name)?.join(' ') || '';
    const emotions = analyzeEmotion(dialogueText);

    let roleType: RoleCategory = 'Bit Part';
    const activeCount = stats.activeScenes.size;
    const presenceScore = (activeCount / totalScenes) * 40;
    const volumeScore = (stats.wordCount / (maxWords || 1)) * 30;
    const mentionBonus = Math.min(stats.mentionCount * 0.5, 10);
    const importanceScore = presenceScore + volumeScore + mentionBonus;

    if (stats.dialogueCount === 0 && activeCount === 0) roleType = 'Mentioned';
    else if (stats.dialogueCount === 0 && activeCount > 0) roleType = 'Silent';
    else if (isGroup) roleType = 'Group';
    else if (isGeneric) roleType = 'Mystery';
    else if (importanceScore > 35) roleType = 'Lead';
    else if (importanceScore > 10) roleType = 'Supporting';

    const activeSceneArr = Array.from(stats.activeScenes).sort((a, b) => a - b);
    const mentionedSceneArr = Array.from(stats.mentionedScenes).sort((a, b) => a - b);
    const allScenes = [...activeSceneArr, ...mentionedSceneArr].sort((a, b) => a - b);

    // Generate tags
    const tags = generateCharacterTags({
      id: name,
      name,
      normalizedName: normalizeArabic(name),
      age: '',
      gender,
      roleType,
      description: desc,
      dialogueCount: stats.dialogueCount,
      wordCount: stats.wordCount,
      mentionCount: stats.mentionCount,
      scenes: activeSceneArr,
      mentionedScenes: mentionedSceneArr,
      firstScene: allScenes[0] || 0,
      lastScene: allScenes[allScenes.length - 1] || 0,
      importanceScore,
      aliases: [],
      isTimeVariant: stats.isVariant,
      genderConflict: conflict,
      emotions,
      tags: []
    });

    // Assign color based on role type
    let color = '#64748b';
    switch (roleType) {
      case 'Lead': color = '#ef4444'; break;
      case 'Supporting': color = '#f59e0b'; break;
      case 'Bit Part': color = '#22c55e'; break;
      case 'Silent': color = '#8b5cf6'; break;
      case 'Group': color = '#06b6d4'; break;
      case 'Mentioned': color = '#94a3b8'; break;
      case 'Mystery': color = '#a855f7'; break;
    }

    profiles.push({
      id: name,
      name: name,
      normalizedName: normalizeArabic(name),
      age: "",
      gender,
      roleType,
      description: desc,
      dialogueCount: stats.dialogueCount,
      wordCount: stats.wordCount,
      mentionCount: stats.mentionCount,
      scenes: activeSceneArr,
      mentionedScenes: mentionedSceneArr,
      firstScene: allScenes[0] || 0,
      lastScene: allScenes[allScenes.length - 1] || 0,
      importanceScore,
      aliases: [],
      isTimeVariant: stats.isVariant,
      genderConflict: conflict,
      emotions,
      tags,
      color
    });
  });

  profiles.sort((a, b) => b.importanceScore - a.importanceScore);
  const suggestions = generateMergeSuggestions(profiles);
  const connections = calculateConnections(scenes);

  const stats: OverallStats = {
    totalCharacters: profiles.length,
    totalDialogue: profiles.reduce((sum, c) => sum + c.dialogueCount, 0),
    avgSceneLength: profiles.reduce((sum, c) => sum + c.scenes.length, 0) / (profiles.length || 1),
    genderDistribution: {
      male: profiles.filter(c => c.gender === 'ذكر').length,
      female: profiles.filter(c => c.gender === 'أنثى').length,
      unknown: profiles.filter(c => !c.gender).length
    },
    emotionDistribution: {
      neutral: 0,
      positive: 0,
      negative: 0,
      intense: 0,
      mysterious: 0,
      dominant: 'neutral'
    },
    mostActiveScene: Math.max(...scenes.map(s => s.characters.length)),
    characterConnections: connections.length
  };

  return {
    characters: profiles,
    scenes: scenes,
    totalScenes: currentSceneNum,
    suggestions: suggestions,
    stats
  };
};

/**
 * Generates merge suggestions for duplicate characters
 */
export const generateMergeSuggestions = (profiles: CharacterProfile[]): MergeSuggestion[] => {
  const suggestions: MergeSuggestion[] = [];
  const processed = new Set<string>();
  const sorted = [...profiles].sort((a, b) => b.name.length - a.name.length);

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const long = sorted[i];
      const short = sorted[j];
      if (long.roleType === 'Group' || short.roleType === 'Group' || long.roleType === 'Mystery' || short.roleType === 'Mystery') continue;

      const key = `${long.id}-${short.id}`;
      if (processed.has(key)) continue;

      if (long.normalizedName === short.normalizedName) {
        suggestions.push({ sourceId: short.id, targetId: long.id, reason: "تطابق إملائي (Spelling)" });
        processed.add(key);
      } else if (long.name.includes(short.name) && short.name.length > 2) {
        const diff = long.name.replace(short.name, '').trim();
        if (ARABIC_TITLES.some(t => diff.includes(t))) {
          suggestions.push({ sourceId: short.id, targetId: long.id, reason: `احتواء اللقب (${diff})` });
          processed.add(key);
        }
      }
    }
  }
  return suggestions;
};

// ============================================
// MAIN AI AGENT FUNCTION
// ============================================

/**
 * Independent Cast Agent using Google GenAI
 * Focused solely on extracting deep character details from the scene.
 */
export const runCastAgent = async (
  sceneContent: string,
  options: CastAgentOptions = {}
): Promise<ExtendedCastMember[]> => {
  const { apiKey, model = DEFAULT_CAST_MODEL } = options;
  const ai = getAI(apiKey);

  // Detect script language
  const hasArabic = /[\u0600-\u06FF]/.test(sceneContent);
  const hasEnglish = /[a-zA-Z]/.test(sceneContent);
  const scriptLanguage = hasArabic && hasEnglish ? 'Arabic and English' : hasArabic ? 'Arabic' : 'English';

  const prompt = buildAnalysisPrompt(sceneContent, scriptLanguage);
  const castSchema = buildCastSchema();

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'user', parts: [{ text: `SCENE CONTENT:\n${sceneContent}` }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: castSchema
      }
    });

    const result = response.text ? JSON.parse(response.text) : { members: [] };

    // Post-process to ensure IDs exist
    return (result.members || []).map((m: any, index: number) => ({
      ...m,
      id: m.id || `char-${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Cast Agent Error:", error);
    return [];
  }
};

// ============================================
// PROMPT & SCHEMA BUILDERS
// ============================================

function buildAnalysisPrompt(content: string, language: string): string {
  return `You are the "Casting Director Agent" for a film production.

Analyze the provided ${language} scene text and identify every speaking character or significant figure.

For each character, provide:
1. **name**: The character's name exactly as written in the script
2. **nameArabic**: Arabic name translation if applicable (null if not)
3. **roleCategory**: Role Category - One of: "Lead", "Supporting", "Bit Part", "Silent", "Group", "Mystery"
4. **ageRange**: Estimated Age Range (e.g., "30s", "Teen", "Child", "Elderly", "40-50")
5. **gender**: "Male", "Female", "Non-binary", or "Unknown"
6. **visualDescription**: Visual Description (Physical appearance details mentioned or implied, 2-3 sentences)
7. **motivation**: What this character wants in this specific scene (1-2 sentences)
8. **personalityTraits**: Array of personality traits if observable (optional)
9. **relationships**: Array of relationship objects { character: "name", type: "relationship" } if mentioned (optional)

Return ONLY a valid JSON object with a "members" array containing all characters.

SCRIPT TO ANALYZE:
${content.substring(0, 25000)}`;
}

function buildCastSchema(): Schema {
  return {
    type: Type.OBJECT,
    properties: {
      members: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique character identifier" },
            name: { type: Type.STRING, description: "Character name as written in script" },
            nameArabic: { type: Type.STRING, description: "Arabic name if applicable" },
            roleCategory: {
              type: Type.STRING,
              description: "Lead, Supporting, Bit Part, Silent, Group, or Mystery",
              enum: ["Lead", "Supporting", "Bit Part", "Silent", "Group", "Mystery"]
            },
            ageRange: { type: Type.STRING, description: "Age range like 30s, Teen, Child, Elderly" },
            gender: {
              type: Type.STRING,
              description: "Male, Female, Non-binary, or Unknown",
              enum: ["Male", "Female", "Non-binary", "Unknown"]
            },
            visualDescription: { type: Type.STRING, description: "Visual appearance description" },
            motivation: { type: Type.STRING, description: "Character's goal in this scene" },
            personalityTraits: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Observable personality traits"
            },
            relationships: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  character: { type: Type.STRING },
                  type: { type: Type.STRING }
                }
              },
              description: "Relationships to other characters"
            }
          },
          required: ["name", "roleCategory", "ageRange", "gender", "visualDescription", "motivation"]
        }
      }
    },
    required: ["members"]
  };
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

/**
 * Export analysis result as CSV
 */
export const exportToCSV = (analysis: AnalysisResult): string => {
  let csv = "Name,Role,Gender Conflict,Dialogue Lines,Mentions,Active Scenes,Word Count,Importance Score\n";
  analysis.characters.forEach(c =>
    csv += `"${c.name}",${c.roleType},${c.genderConflict ? 'YES' : 'NO'},${c.dialogueCount},${c.mentionCount},${c.scenes.length},${c.wordCount},${c.importanceScore.toFixed(2)}\n`
  );
  return csv;
};

/**
 * Export analysis result as JSON
 */
export const exportToJSON = (analysis: AnalysisResult): string => {
  return JSON.stringify(analysis, null, 2);
};

/**
 * Export analysis result as TXT report
 */
export const exportToTXT = (analysis: AnalysisResult): string => {
  let txt = "CAST BREAKDOWN REPORT\n";
  txt += "=".repeat(50) + "\n\n";
  txt += `Total Characters: ${analysis.characters.length}\n`;
  txt += `Total Scenes: ${analysis.totalScenes}\n\n`;
  txt += "-".repeat(50) + "\n\n";

  analysis.characters.forEach((c, i) => {
    txt += `${i + 1}. ${c.name} (${c.roleType})\n`;
    txt += `   Gender: ${c.gender || 'Unknown'}${c.genderConflict ? ' ⚠️ CONFLICT' : ''}\n`;
    txt += `   Dialogue: ${c.dialogueCount} lines (${c.wordCount} words)\n`;
    txt += `   Scenes: ${c.scenes.join(', ') || 'None'}\n`;
    if (c.tags?.length) txt += `   Tags: ${c.tags.join(', ')}\n`;
    txt += "\n";
  });

  return txt;
};

/**
 * Generate a casting call document
 */
export const generateCastingCall = (analysis: AnalysisResult): string => {
  let doc = 'CASTING CALL DOCUMENT\n';
  doc += '='.repeat(50) + '\n\n';

  const leads = analysis.characters.filter(c => c.roleType === 'Lead');
  const supporting = analysis.characters.filter(c => c.roleType === 'Supporting');

  if (leads.length > 0) {
    doc += 'LEAD ROLES\n';
    doc += '-'.repeat(30) + '\n';
    leads.forEach(c => {
      doc += `\n${c.name} (${c.gender}, ${c.age || 'Any Age'})\n`;
      doc += `Description: ${c.description || 'N/A'}\n`;
      doc += `Importance Score: ${c.importanceScore.toFixed(1)}\n`;
    });
  }

  if (supporting.length > 0) {
    doc += '\n\nSUPPORTING ROLES\n';
    doc += '-'.repeat(30) + '\n';
    supporting.forEach(c => {
      doc += `\n${c.name} (${c.gender}, ${c.age || 'Any Age'})\n`;
      doc += `${c.description || 'N/A'}\n`;
    });
  }

  return doc;
};

/**
 * Trigger browser download for exported data
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};