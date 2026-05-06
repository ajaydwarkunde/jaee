import { api } from '@/lib/api'

export interface CommunityExperience {
  id: number
  authorName: string
  location: string
  body: string
  status: string
  curated: boolean
  createdAt: string
  mine: boolean
  canEdit: boolean
  canDelete: boolean
}

export type CommunityExperienceStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export const communityExperienceService = {
  list: async (): Promise<CommunityExperience[]> => {
    const res = await api.get<CommunityExperience[]>('/community/experiences')
    return res.data
  },

  create: async (payload: { authorName?: string; location?: string; body: string }) => {
    const res = await api.post<CommunityExperience>('/community/experiences', payload)
    return res.data
  },

  update: async (
    id: number,
    payload: { authorName?: string; location?: string; body: string }
  ) => {
    const res = await api.put<CommunityExperience>(`/community/experiences/${id}`, payload)
    return res.data
  },

  delete: async (id: number) => {
    await api.delete(`/community/experiences/${id}`)
  },

  adminList: async (): Promise<CommunityExperience[]> => {
    const res = await api.get<CommunityExperience[]>('/admin/community-experiences')
    return res.data
  },

  adminUpdateStatus: async (id: number, status: CommunityExperienceStatus) => {
    const res = await api.patch<CommunityExperience>(
      `/admin/community-experiences/${id}/status`,
      { status }
    )
    return res.data
  },

  adminDelete: async (id: number) => {
    await api.delete(`/admin/community-experiences/${id}`)
  },
}
