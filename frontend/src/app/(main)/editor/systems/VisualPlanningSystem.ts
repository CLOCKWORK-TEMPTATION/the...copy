/**
 * @class VisualPlanningSystem
 * @description Manages visual planning tools like storyboards and beat sheets for the screenplay editor.
 * @property {Array<{ id: string; sceneId: string; description: string; imageUrl?: string }>} storyboards - The list of storyboards.
 * @property {Array<{ id: string; act: number; beat: string; description: string }>} beatSheets - The list of beat sheets.
 */
export class VisualPlanningSystem {
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

  /**
   * @method addStoryboard
   * @description Adds a new storyboard.
   * @param {string} sceneId - The ID of the scene.
   * @param {string} description - The description of the storyboard.
   * @param {string} [imageUrl] - The URL of the image for the storyboard.
   * @returns {{ id: string; sceneId: string; description: string; imageUrl?: string }} - The new storyboard.
   */
  addStoryboard(
    sceneId: string,
    description: string,
    imageUrl?: string
  ): {
    id: string;
    sceneId: string;
    description: string;
    imageUrl?: string;
  } {
    const storyboard = {
      id: Math.random().toString(36).substr(2, 9),
      sceneId,
      description,
      imageUrl,
    };
    this.storyboards.push(storyboard);
    return storyboard;
  }

  /**
   * @method getStoryboards
   * @description Gets the list of storyboards.
   * @returns {Array<{ id: string; sceneId: string; description: string; imageUrl?: string }>} - The list of storyboards.
   */
  getStoryboards(): Array<{
    id: string;
    sceneId: string;
    description: string;
    imageUrl?: string;
  }> {
    return [...this.storyboards];
  }

  /**
   * @method getStoryboardByScene
   * @description Gets storyboards for a specific scene.
   * @param {string} sceneId - The ID of the scene.
   * @returns {Array<any>} - The list of storyboards for that scene.
   */
  getStoryboardByScene(sceneId: string): Array<any> {
    return this.storyboards.filter((s) => s.sceneId === sceneId);
  }

  /**
   * @method updateStoryboard
   * @description Updates a storyboard.
   * @param {string} id - The ID of the storyboard.
   * @param {any} updates - The updates to apply.
   * @returns {any | null} - The updated storyboard.
   */
  updateStoryboard(id: string, updates: any): any | null {
    const storyboard = this.storyboards.find((s) => s.id === id);
    if (storyboard) {
      Object.assign(storyboard, updates);
      return storyboard;
    }
    return null;
  }

  /**
   * @method deleteStoryboard
   * @description Deletes a storyboard.
   * @param {string} id - The ID of the storyboard.
   * @returns {void}
   */
  deleteStoryboard(id: string): void {
    this.storyboards = this.storyboards.filter((s) => s.id !== id);
  }

  /**
   * @method addBeatSheet
   * @description Adds a new beat sheet.
   * @param {number} act - The act number.
   * @param {string} beat - The beat.
   * @param {string} description - The description of the beat sheet.
   * @returns {{ id: string; act: number; beat: string; description: string }} - The new beat sheet.
   */
  addBeatSheet(
    act: number,
    beat: string,
    description: string
  ): {
    id: string;
    act: number;
    beat: string;
    description: string;
  } {
    const beatSheet = {
      id: Math.random().toString(36).substr(2, 9),
      act,
      beat,
      description,
    };
    this.beatSheets.push(beatSheet);
    return beatSheet;
  }

  /**
   * @method getBeatSheets
   * @description Gets the list of beat sheets.
   * @returns {Array<{ id: string; act: number; beat: string; description: string }>} - The list of beat sheets.
   */
  getBeatSheets(): Array<{
    id: string;
    act: number;
    beat: string;
    description: string;
  }> {
    return [...this.beatSheets];
  }

  /**
   * @method getBeatsByAct
   * @description Gets beats for a specific act.
   * @param {number} act - The act number.
   * @returns {Array<any>} - The list of beats for that act.
   */
  getBeatsByAct(act: number): Array<any> {
    return this.beatSheets.filter((b) => b.act === act);
  }

  /**
   * @method updateBeatSheet
   * @description Updates a beat sheet.
   * @param {string} id - The ID of the beat sheet.
   * @param {any} updates - The updates to apply.
   * @returns {any | null} - The updated beat sheet.
   */
  updateBeatSheet(id: string, updates: any): any | null {
    const beatSheet = this.beatSheets.find((b) => b.id === id);
    if (beatSheet) {
      Object.assign(beatSheet, updates);
      return beatSheet;
    }
    return null;
  }

  /**
   * @method deleteBeatSheet
   * @description Deletes a beat sheet.
   * @param {string} id - The ID of the beat sheet.
   * @returns {void}
   */
  deleteBeatSheet(id: string): void {
    this.beatSheets = this.beatSheets.filter((b) => b.id !== id);
  }

  /**
   * @method clear
   * @description Clears all storyboards and beat sheets.
   * @returns {void}
   */
  clear(): void {
    this.storyboards = [];
    this.beatSheets = [];
  }
}
