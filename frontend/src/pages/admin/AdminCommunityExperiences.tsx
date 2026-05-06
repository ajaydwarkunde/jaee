import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Card, { CardContent, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  communityExperienceService,
  type CommunityExperience,
  type CommunityExperienceStatus,
} from '@/services/communityExperienceService'

function StatusBadge({ status }: { status: string }) {
  const variant: 'success' | 'error' | 'warning' =
    status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'error' : 'warning'
  return <Badge variant={variant}>{status}</Badge>
}

export default function AdminCommunityExperiences() {
  const queryClient = useQueryClient()

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin-community-experiences'],
    queryFn: communityExperienceService.adminList,
  })

  const pendingCount = useMemo(
    () => rows.filter((r) => r.status === 'PENDING').length,
    [rows]
  )

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-community-experiences'] })
    queryClient.invalidateQueries({ queryKey: ['community-experiences'] })
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: CommunityExperienceStatus }) =>
      communityExperienceService.adminUpdateStatus(id, status),
    onSuccess: () => {
      invalidate()
      toast.success('Status updated')
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e?.response?.data?.message || 'Could not update status')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: communityExperienceService.adminDelete,
    onSuccess: () => {
      invalidate()
      toast.success('Removed')
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e?.response?.data?.message || 'Could not delete')
    },
  })

  const handleDelete = (row: CommunityExperience) => {
    const label = row.curated ? 'This is a featured / curated story.' : ''
    if (
      !window.confirm(
        `Delete this story${row.authorName ? ` from ${row.authorName}` : ''}? ${label}`.trim()
      )
    ) {
      return
    }
    deleteMutation.mutate(row.id)
  }

  if (isLoading) {
    return (
      <div className="bg-cream min-h-screen py-8 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-blush rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="heading-2 text-charcoal flex items-center gap-2">
                <MessageSquare className="w-7 h-7 text-rose shrink-0" />
                Community stories
              </h1>
              <p className="text-warm-gray mt-1">
                Approve or reject customer submissions. Featured seed stories are marked curated.
              </p>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="text-sm font-medium text-warning bg-warning/10 px-3 py-1 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>

        <Card className="mb-6">
          <CardTitle className="text-base">Store settings</CardTitle>
          <CardContent className="text-sm text-warm-gray">
            Toggle visibility, sign-in requirement, and auto-approve under{' '}
            <Link to="/admin/settings" className="text-rose hover:underline font-medium">
              Store Settings
            </Link>
            .
          </CardContent>
        </Card>

        <div className="space-y-4">
          {rows.length === 0 ? (
            <p className="text-warm-gray text-center py-12">No stories yet.</p>
          ) : (
            rows.map((row) => (
              <Card key={row.id}>
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-medium text-charcoal">{row.authorName}</p>
                      <p className="text-xs text-warm-gray mt-0.5">
                        {row.location ? `${row.location} · ` : ''}
                        {new Date(row.createdAt).toLocaleString()}
                        {row.curated && (
                          <span className="ml-2 text-rose font-medium">· Curated</span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={row.status} />
                      {row.status !== 'APPROVED' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          icon={<CheckCircle className="w-4 h-4" />}
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({ id: row.id, status: 'APPROVED' })
                          }
                        >
                          Approve
                        </Button>
                      )}
                      {row.status !== 'REJECTED' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          icon={<XCircle className="w-4 h-4" />}
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({ id: row.id, status: 'REJECTED' })
                          }
                        >
                          Reject
                        </Button>
                      )}
                      {row.status !== 'PENDING' && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          icon={<RotateCcw className="w-4 h-4" />}
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({ id: row.id, status: 'PENDING' })
                          }
                        >
                          Pending
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        icon={<Trash2 className="w-4 h-4" />}
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(row)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="text-charcoal/90 text-sm leading-relaxed whitespace-pre-wrap">
                    {row.body}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
