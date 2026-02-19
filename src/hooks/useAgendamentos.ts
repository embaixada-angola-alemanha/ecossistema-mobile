import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgendamentoService } from '@services/agendamento';
import { AgendamentoCreateRequest, TipoAgendamento } from '@types/agendamento';

export function useAgendamentos() {
  return useInfiniteQuery({
    queryKey: ['agendamentos'],
    queryFn: ({ pageParam = 0 }) => AgendamentoService.getMyAgendamentos(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    initialPageParam: 0,
  });
}

export function useAgendamento(id: string) {
  return useQuery({
    queryKey: ['agendamento', id],
    queryFn: () => AgendamentoService.getById(id),
    enabled: !!id,
  });
}

export function useAvailableSlots(tipo: TipoAgendamento | null, data: string | null) {
  return useQuery({
    queryKey: ['slots', tipo, data],
    queryFn: () => AgendamentoService.getAvailableSlots(tipo!, data!),
    enabled: !!tipo && !!data,
  });
}

export function useCreateAgendamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AgendamentoCreateRequest) => AgendamentoService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
    },
  });
}

export function useCancelAgendamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      AgendamentoService.cancel(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
    },
  });
}
