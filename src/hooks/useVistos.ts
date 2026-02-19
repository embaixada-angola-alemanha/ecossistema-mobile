import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VistoService } from '@services/visto';
import { VistoCreateRequest } from '@types/visto';

export function useVistos() {
  return useInfiniteQuery({
    queryKey: ['vistos'],
    queryFn: ({ pageParam = 0 }) => VistoService.getMyVistos(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    initialPageParam: 0,
  });
}

export function useVisto(id: string) {
  return useQuery({
    queryKey: ['visto', id],
    queryFn: () => VistoService.getById(id),
    enabled: !!id,
  });
}

export function useVistoTimeline(vistoId: string) {
  return useQuery({
    queryKey: ['visto-timeline', vistoId],
    queryFn: () => VistoService.getTimeline(vistoId),
    enabled: !!vistoId,
  });
}

export function useCreateVisto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: VistoCreateRequest) => VistoService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vistos'] });
    },
  });
}

export function useSubmitDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => VistoService.submitDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vistos'] });
    },
  });
}
