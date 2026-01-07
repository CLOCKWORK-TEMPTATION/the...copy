/**
 * @class CollaborationSystem
 * @description Manages collaboration and comments for the screenplay editor.
 * @property {Array<{ id: string; name: string; color: string }>} collaborators - The list of collaborators.
 * @property {Array<{ id: string; content: string; author: string; timestamp: Date; position: any }>} comments - The list of comments.
 * @property {Array<(data: any) => void>} changeCallbacks - The list of callbacks to execute on change.
 */
export class CollaborationSystem {
  private collaborators: Array<{
    id: string;
    name: string;
    color: string;
  }> = [];
  private comments: Array<{
    id: string;
    content: string;
    author: string;
    timestamp: Date;
    position: any;
  }> = [];
  private changeCallbacks: Array<(data: any) => void> = [];

  /**
   * @method addCollaborator
   * @description Adds a collaborator.
   * @param {{ id: string; name: string; color: string }} collaborator - The collaborator to add.
   * @returns {void} Registers the collaborator and notifies subscribers of the change.
   */
  addCollaborator(collaborator: {
    id: string;
    name: string;
    color: string;
  }): void {
    this.collaborators.push(collaborator);
    this.notifyChanges({ type: "collaborator_added", collaborator });
  }

  /**
   * @method removeCollaborator
   * @description Removes a collaborator.
   * @param {string} id - The ID of the collaborator to remove.
   * @returns {void} Removes the collaborator and broadcasts the update.
   */
  removeCollaborator(id: string): void {
    this.collaborators = this.collaborators.filter((c) => c.id !== id);
    this.notifyChanges({ type: "collaborator_removed", id });
  }

  /**
   * @method addComment
   * @description Adds a comment.
   * @param {{ id: string; content: string; author: string; timestamp: Date; position: any }} comment - The comment to add.
   * @returns {void} Stores the comment and dispatches a change event.
   */
  addComment(comment: {
    id: string;
    content: string;
    author: string;
    timestamp: Date;
    position: any;
  }): void {
    this.comments.push(comment);
    this.notifyChanges({ type: "comment_added", comment });
  }

  /**
   * @method removeComment
   * @description Removes a comment.
   * @param {string} id - The ID of the comment to remove.
   * @returns {void} Deletes the comment and alerts all subscribers.
   */
  removeComment(id: string): void {
    this.comments = this.comments.filter((c) => c.id !== id);
    this.notifyChanges({ type: "comment_removed", id });
  }

  /**
   * @method updateComment
   * @description Updates a comment.
   * @param {string} id - The ID of the comment to update.
   * @param {string} content - The new content.
   * @returns {void}
   */
  updateComment(id: string, content: string): void {
    const comment = this.comments.find((c) => c.id === id);
    if (comment) {
      comment.content = content;
      this.notifyChanges({ type: "comment_updated", id, content });
    }
  }

  /**
   * @method subscribeToChanges
   * @description Subscribes to changes.
   * @param {(data: any) => void} callback - The callback to execute on change.
   * @returns {void} Registers the callback for subsequent change notifications.
   */
  subscribeToChanges(callback: (data: any) => void): void {
    this.changeCallbacks.push(callback);
  }

  /**
   * @method notifyChanges
   * @description Notifies subscribers of changes.
   * @param {any} data - The data to send to subscribers.
   * @returns {void}
   */
  private notifyChanges(data: any): void {
    this.changeCallbacks.forEach((callback) => callback(data));
  }

  /**
   * @method getCollaborators
   * @description Gets the list of collaborators.
   * @returns {Array<{ id: string; name: string; color: string }>} - The list of collaborators.
   */
  getCollaborators(): Array<{
    id: string;
    name: string;
    color: string;
  }> {
    return [...this.collaborators];
  }

  /**
   * @method getComments
   * @description Gets the list of comments.
   * @returns {Array<{ id: string; content: string; author: string; timestamp: Date; position: any }>} - The list of comments.
   */
  getComments(): Array<{
    id: string;
    content: string;
    author: string;
    timestamp: Date;
    position: any;
  }> {
    return [...this.comments];
  }

  /**
   * @method getCommentsByPosition
   * @description Gets comments for a specific position.
   * @param {any} position - The position to get comments for.
   * @returns {Array<any>} - The list of comments at that position.
   */
  getCommentsByPosition(position: any): Array<any> {
    return this.comments.filter((c) => c.position === position);
  }

  /**
   * @method clear
   * @description Clears all collaborators and comments.
   * @returns {void}
   */
  clear(): void {
    this.collaborators = [];
    this.comments = [];
    this.changeCallbacks = [];
  }
}
