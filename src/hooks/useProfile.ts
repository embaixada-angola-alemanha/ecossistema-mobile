import { useQuery } from '@tanstack/react-query';
import { CidadaoService } from '@services/cidadao';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: CidadaoService.getProfile,
    staleTime: 10 * 60 * 1000,
  });
}
