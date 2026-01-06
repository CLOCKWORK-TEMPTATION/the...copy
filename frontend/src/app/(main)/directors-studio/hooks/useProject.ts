import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as api from "@/lib/api";

export function useProjects() {
  return useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await api.getProjects();
      return response.data ?? [];
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["/api/projects", id],
    queryFn: async () => {
      const response = await api.getProject(id!);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useProjectScenes(projectId: string | undefined) {
  return useQuery({
    queryKey: ["/api/projects", projectId, "scenes"],
    queryFn: async () => {
      const response = await api.getProjectScenes(projectId!);
      return response.data ?? [];
    },
    enabled: !!projectId,
  });
}

export function useProjectCharacters(projectId: string | undefined) {
  return useQuery({
    queryKey: ["/api/projects", projectId, "characters"],
    queryFn: async () => {
      const response = await api.getProjectCharacters(projectId!);
      return response.data ?? [];
    },
    enabled: !!projectId,
  });
}

export function useCreateCharacter() {
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      api.createCharacter(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", variables.projectId, "characters"],
      });
    },
  });
}

export function useUpdateCharacter() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateCharacter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "/api/projects" &&
          query.queryKey[2] === "characters",
      });
    },
  });
}

export function useDeleteCharacter() {
  return useMutation({
    mutationFn: (id: string) => api.deleteCharacter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "/api/projects" &&
          query.queryKey[2] === "characters",
      });
    },
  });
}

export function useCreateProject() {
  return useMutation({
    mutationFn: (data: { title: string; scriptContent?: string }) =>
      api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}

export function useUpdateProject() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", variables.id],
      });
    },
  });
}

export function useDeleteProject() {
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}

export function useAnalyzeScript() {
  return useMutation({
    mutationFn: async ({
      projectId,
      file,
    }: {
      projectId: string;
      file: File;
    }) => {
      // Convert File to text
      const scriptText = await file.text();
      return api.analyzeScript(projectId, scriptText);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", variables.projectId, "scenes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", variables.projectId, "characters"],
      });
    },
  });
}

export function useCreateScene() {
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      api.createScene(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", variables.projectId, "scenes"],
      });
    },
  });
}

export function useUpdateScene() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateScene(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "/api/projects" &&
          query.queryKey[2] === "scenes",
      });
    },
  });
}

export function useDeleteScene() {
  return useMutation({
    mutationFn: (id: string) => api.deleteScene(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "/api/projects" &&
          query.queryKey[2] === "scenes",
      });
    },
  });
}

export function useSceneShots(
  projectId: string | undefined,
  sceneId: string | undefined
) {
  return useQuery({
    queryKey: ["/api/scenes", sceneId, "shots"],
    queryFn: async () => {
      const response = await api.getSceneShots(sceneId!);
      return response.data ?? [];
    },
    enabled: !!sceneId,
  });
}

export function useCreateShot() {
  return useMutation({
    mutationFn: ({ sceneId, data }: { sceneId: string; data: any }) =>
      api.createShot(sceneId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/scenes", variables.sceneId, "shots"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}

export function useUpdateShot() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateShot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "/api/scenes" && query.queryKey[2] === "shots",
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "/api/projects" &&
          query.queryKey[2] === "scenes",
      });
    },
  });
}

export function useDeleteShot() {
  return useMutation({
    mutationFn: (id: string) => api.deleteShot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "/api/scenes" && query.queryKey[2] === "shots",
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "/api/projects" &&
          query.queryKey[2] === "scenes",
      });
    },
  });
}
