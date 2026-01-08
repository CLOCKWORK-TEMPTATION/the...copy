/**
 * @class AutoSaveManager
 * @description Manages auto-saving and backups for the screenplay editor.
 * @property {number | null} autoSaveInterval - The interval for auto-saving.
 * @property {string} currentContent - The current content of the editor.
 * @property {string} lastSaved - The last saved content.
 * @property {((content: string) => Promise<void>) | null} saveCallback - The callback to execute when saving.
 * @property {number} intervalMs - The interval in milliseconds for auto-saving.
 */
export class AutoSaveManager {
  private autoSaveInterval: number | null = null;
  private currentContent = "";
  private lastSaved = "";
  private saveCallback: ((content: string) => Promise<void>) | null = null;
  private intervalMs: number;

  /**
   * @constructor
   * @param {number} intervalMs - The interval in milliseconds for auto-saving.
   */
  constructor(intervalMs: number = 30000) {
    this.intervalMs = intervalMs;
  }

  /**
   * @method setSaveCallback
   * @description Sets the save callback.
   * @param {(content: string) => Promise<void>} callback - The callback to execute when saving.
   * @returns {void} Stores the provided callback for subsequent save operations.
   */
  setSaveCallback(callback: (content: string) => Promise<void>): void {
    this.saveCallback = callback;
  }

  /**
   * @method updateContent
   * @description Updates the current content.
   * @param {string} content - The new content.
   * @returns {void} Caches the latest editor snapshot for future saves.
   */
  updateContent(content: string): void {
    this.currentContent = content;
  }

  /**
   * @method startAutoSave
   * @description Starts the auto-save interval.
   * @returns {void} Begins polling for changes at the configured interval.
   */
  startAutoSave(): void {
    if (this.autoSaveInterval) return;

    this.autoSaveInterval = window.setInterval(async () => {
      if (this.currentContent !== this.lastSaved && this.saveCallback) {
        try {
          await this.saveCallback(this.currentContent);
          this.lastSaved = this.currentContent;
          console.log("Auto-saved at:", new Date().toLocaleTimeString());
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    }, this.intervalMs);
  }

  /**
   * @method stopAutoSave
   * @description Stops the auto-save interval.
   * @returns {void} Clears any scheduled auto-save timers.
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * @method forceSave
   * @description Forces a save.
   * @returns {Promise<void>} Resolves once the latest content snapshot is persisted.
   */
  async forceSave(): Promise<void> {
    if (this.saveCallback) {
      await this.saveCallback(this.currentContent);
      this.lastSaved = this.currentContent;
    }
  }

  /**
   * @method destroy
   * @description Cleans up the auto-save manager.
   * @returns {void}
   */
  destroy(): void {
    this.stopAutoSave();
    this.saveCallback = null;
    this.currentContent = "";
    this.lastSaved = "";
  }
}
