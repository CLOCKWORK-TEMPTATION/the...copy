// Stub file created by Worktree-5 to resolve type errors
// This module was referenced but missing from the codebase

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export async function fetchProjects(): Promise<ApiResponse<Project[]>> {
  return { success: true, data: [] };
}

export async function fetchProject(id: string): Promise<ApiResponse<Project>> {
  return { success: true, data: { id, name: "Project" } };
}

export default {
  fetchProjects,
  fetchProject,
};
