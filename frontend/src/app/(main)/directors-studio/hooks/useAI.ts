import { useMutation } from "@tanstack/react-query";
import * as api from "@/lib/api";

export function useChatWithAI() {
  return useMutation({
    mutationFn: ({ message, context }: { message: string; context?: any }) =>
      api.chatWithAI(message, context),
  });
}

export function useGetShotSuggestion() {
  return useMutation({
    mutationFn: ({
      projectId,
      sceneId,
      shotType,
    }: {
      projectId: string;
      sceneId: string;
      shotType: string;
    }) => api.getShotSuggestion(projectId, sceneId, shotType),
  });
}
