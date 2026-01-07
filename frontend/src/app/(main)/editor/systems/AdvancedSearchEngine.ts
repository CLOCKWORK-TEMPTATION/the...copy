/**
 * @class AdvancedSearchEngine
 * @description Provides advanced search and replace functionality for the screenplay editor.
 */
export class AdvancedSearchEngine {
  /**
   * @method searchInContent
   * @description Searches for a query in the content.
   * @param {string} content - The content to search in.
   * @param {string} query - The query to search for.
   * @param {any} options - The search options.
   * @returns {Promise<any>} - The search results.
   */
  async searchInContent(
    content: string,
    query: string,
    options: any = {}
  ): Promise<{
    success: boolean;
    query: string;
    totalMatches: number;
    results: Array<{
      lineNumber: number;
      content: string;
      matches: Array<{ text: string; index: number; length: number }>;
    }>;
    searchTime: number;
    error?: string;
  }> {
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
        query,
        totalMatches: 0,
        results: [],
        searchTime: Date.now(),
      };
    }
  }

  /**
   * @method replaceInContent
   * @description Replaces a search query with a new text in the content.
   * @param {string} content - The content to search in.
   * @param {string} searchQuery - The query to search for.
   * @param {string} replaceText - The text to replace with.
   * @param {any} options - The replace options.
   * @returns {Promise<any>} - The replace results.
   */
  async replaceInContent(
    content: string,
    searchQuery: string,
    replaceText: string,
    options: any = {}
  ): Promise<{
    success: boolean;
    originalContent: string;
    newContent: string;
    replacements: number;
    searchQuery: string;
    replaceText: string;
    patternSource: string;
    patternFlags: string;
    replaceAll: boolean;
    error?: string;
  }> {
    const caseSensitive = options.caseSensitive || false;
    const wholeWords = options.wholeWords || false;
    const useRegex = options.useRegex || false;
    const replaceAll = options.replaceAll !== false;

    let searchPattern: RegExp;

    try {
      if (useRegex) {
        const flags =
          replaceAll
            ? caseSensitive
              ? "g"
              : "gi"
            : caseSensitive
              ? ""
              : "i";
        searchPattern = new RegExp(searchQuery, flags);
      } else if (wholeWords) {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flags =
          replaceAll
            ? caseSensitive
              ? "g"
              : "gi"
            : caseSensitive
              ? ""
              : "i";
        searchPattern = new RegExp(`\\b${escapedQuery}\\b`, flags);
      } else {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const flags =
          replaceAll
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
        patternSource: "",
        patternFlags: "",
        replaceAll: replaceAll,
      };
    }
  }
}
