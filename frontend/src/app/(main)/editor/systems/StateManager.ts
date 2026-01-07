/**
 * @class StateManager
 * @description Manages the state of the application with pub/sub pattern.
 * @property {Map<string, any>} state - The state of the application.
 * @property {Map<string, Array<(value: any) => void>>} subscribers - The subscribers to the state changes.
 */
export class StateManager {
  private state = new Map<string, any>();
  private subscribers = new Map<string, Array<(value: any) => void>>();

  /**
   * @method subscribe
   * @description Subscribes to a state change.
   * @param {string} key - The key to subscribe to.
   * @param {(value: any) => void} callback - The callback to execute when the state changes.
   * @returns {() => void} - A function to unsubscribe.
   */
  subscribe(key: string, callback: (value: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key)!.push(callback);

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

  /**
   * @method setState
   * @description Sets the state for a given key.
   * @param {string} key - The key to set.
   * @param {any} value - The value to set.
   * @returns {void} Executes all subscriber callbacks with the updated value.
   */
  setState(key: string, value: any): void {
    this.state.set(key, value);
    const callbacks = this.subscribers.get(key) || [];
    callbacks.forEach((callback: any) => callback(value));
  }

  /**
   * @method getState
   * @description Gets the state for a given key.
   * @param {string} key - The key to get.
   * @returns {any} - The value of the state.
   */
  getState(key: string): any {
    return this.state.get(key);
  }

  /**
   * @method clear
   * @description Clears all state and subscribers.
   * @returns {void}
   */
  clear(): void {
    this.state.clear();
    this.subscribers.clear();
  }
}
