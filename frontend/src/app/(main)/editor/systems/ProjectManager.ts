/**
 * @class ProjectManager
 * @description Manages projects and templates for the screenplay editor.
 * @property {Array<{ id: string; name: string; createdAt: Date; lastModified: Date }>} projects - The list of projects.
 * @property {Array<{ id: string; name: string; content: string }>} templates - The list of templates.
 */
export class ProjectManager {
  private projects: Array<{
    id: string;
    name: string;
    createdAt: Date;
    lastModified: Date;
  }> = [];
  private templates: Array<{ id: string; name: string; content: string }> = [];

  /**
   * @method createProject
   * @description Creates a new project.
   * @param {string} name - The name of the project.
   * @returns {{ id: string; name: string; createdAt: Date; lastModified: Date }} - The new project.
   */
  createProject(name: string): {
    id: string;
    name: string;
    createdAt: Date;
    lastModified: Date;
  } {
    const project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      createdAt: new Date(),
      lastModified: new Date(),
    };
    this.projects.push(project);
    return project;
  }

  /**
   * @method getProjects
   * @description Gets the list of projects.
   * @returns {Array<{ id: string; name: string; createdAt: Date; lastModified: Date }>} - The list of projects.
   */
  getProjects(): Array<{
    id: string;
    name: string;
    createdAt: Date;
    lastModified: Date;
  }> {
    return [...this.projects];
  }

  /**
   * @method getProject
   * @description Gets a project by its ID.
   * @param {string} id - The ID of the project.
   * @returns {{ id: string; name: string; createdAt: Date; lastModified: Date } | undefined} - The project.
   */
  getProject(id: string): {
    id: string;
    name: string;
    createdAt: Date;
    lastModified: Date;
  } | undefined {
    return this.projects.find((p) => p.id === id);
  }

  /**
   * @method updateProject
   * @description Updates a project.
   * @param {string} id - The ID of the project to update.
   * @param {any} updates - The updates to apply.
   * @returns {{ id: string; name: string; createdAt: Date; lastModified: Date } | null} - The updated project.
   */
  updateProject(
    id: string,
    updates: any
  ): {
    id: string;
    name: string;
    createdAt: Date;
    lastModified: Date;
  } | null {
    const project = this.projects.find((p) => p.id === id);
    if (project) {
      Object.assign(project, updates, { lastModified: new Date() });
      return project;
    }
    return null;
  }

  /**
   * @method deleteProject
   * @description Deletes a project.
   * @param {string} id - The ID of the project to delete.
   * @returns {void} Removes the project from the internal collection.
   */
  deleteProject(id: string): void {
    this.projects = this.projects.filter((p) => p.id !== id);
  }

  /**
   * @method addTemplate
   * @description Adds a new template.
   * @param {string} name - The name of the template.
   * @param {string} content - The content of the template.
   * @returns {{ id: string; name: string; content: string }} - The new template.
   */
  addTemplate(name: string, content: string): {
    id: string;
    name: string;
    content: string;
  } {
    const template = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      content,
    };
    this.templates.push(template);
    return template;
  }

  /**
   * @method getTemplates
   * @description Gets the list of templates.
   * @returns {Array<{ id: string; name: string; content: string }>} - The list of templates.
   */
  getTemplates(): Array<{ id: string; name: string; content: string }> {
    return [...this.templates];
  }

  /**
   * @method applyTemplate
   * @description Applies a template.
   * @param {string} templateId - The ID of the template to apply.
   * @returns {string | null} - The content of the template.
   */
  applyTemplate(templateId: string): string | null {
    const template = this.templates.find((t) => t.id === templateId);
    return template ? template.content : null;
  }

  /**
   * @method clear
   * @description Clears all projects and templates.
   * @returns {void}
   */
  clear(): void {
    this.projects = [];
    this.templates = [];
  }
}
