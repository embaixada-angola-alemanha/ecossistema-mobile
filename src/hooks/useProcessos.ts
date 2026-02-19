import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { ProcessoService, DocumentoService } from '@services/documento';

export function useProcessos() {
  return useInfiniteQuery({
    queryKey: ['processos'],
    queryFn: ({ pageParam = 0 }) => ProcessoService.getMyProcessos(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    initialPageParam: 0,
  });
}

export function useProcessoDocuments(processoId: string) {
  return useQuery({
    queryKey: ['documentos', processoId],
    queryFn: () => DocumentoService.getByProcesso(processoId),
    enabled: !!processoId,
  });
}
