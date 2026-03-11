import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface BuilderOption {
  id: number
  builderType: string
  optionType: string
  optionKey: string
  label: string
  description: string | null
  emoji: string | null
  hexColor: string | null
  colorsJson: string | null
  basePrice: number
  surcharge: number
  active: boolean
  displayOrder: number
}

function fetchActiveOptions(builderType: string): Promise<BuilderOption[]> {
  return api.get(`/builder-options/${builderType}/active`).then(res => res.data.data)
}

export function useBuilderOptions(builderType: 'CANDLE' | 'HAMPER') {
  const { data: allOptions, isLoading } = useQuery({
    queryKey: ['builder-options-active', builderType],
    queryFn: () => fetchActiveOptions(builderType),
    staleTime: 5 * 60 * 1000,
  })

  const byType = (type: string) =>
    (allOptions || []).filter(o => o.optionType === type)

  return { allOptions: allOptions || [], byType, isLoading }
}
