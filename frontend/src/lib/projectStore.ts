const STORAGE_KEY = "thecopy_current_project";
let inMemoryProject: unknown = null;

export const projectStore = {
  getState: () => ({ currentProject: getCurrentProject() }),
  setState: (state: { currentProject?: unknown }) => {
    if (state.currentProject !== undefined) {
      setCurrentProject(state.currentProject);
    }
  },
  subscribe: () => () => {},
};

export function getCurrentProject<T = unknown>(): T | null {
  if (typeof window === "undefined") {
    return (inMemoryProject as T) ?? null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCurrentProject(project: unknown) {
  inMemoryProject = project;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }
}

export function clearCurrentProject() {
  inMemoryProject = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export default projectStore;
