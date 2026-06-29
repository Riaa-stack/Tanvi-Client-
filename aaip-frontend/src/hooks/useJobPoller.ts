import { useQuery } from '@tanstack/react-query'
import { papersApi } from '@/api/papers.api'
import { ProcessingJob, JobStatus } from '@/types/models'
import { useEffect } from 'react'
import { queryKeys } from '@/config/queryClient'

export function useJobPoller(jobId: string | null, options?: {
  onComplete?: (job: ProcessingJob) => void
  onFailed?: (job: ProcessingJob) => void
  intervalMs?: number
}) {
  const query = useQuery({
    queryKey: queryKeys.admin.jobs.detail(jobId || ''),
    queryFn: () => papersApi.getJobStatus(jobId!).then(r => r.data.data),
    enabled: !!jobId,
    refetchInterval: (data) => {
      if (!data) return options?.intervalMs ?? 2000
      // Check data structure: react-query v5 puts it inside query.state.data or just returns it
      // actually, the callback function receives `query` object in v5: (query) => number | false
      // Let's use standard v5 syntax
      const jobData = data.state?.data as ProcessingJob | undefined
      if (jobData?.status === JobStatus.COMPLETED || jobData?.status === JobStatus.FAILED) return false
      return options?.intervalMs ?? 2000
    },
  })

  useEffect(() => {
    if (query.data) {
      if (query.data.status === JobStatus.COMPLETED && options?.onComplete) {
        options.onComplete(query.data)
      } else if (query.data.status === JobStatus.FAILED && options?.onFailed) {
        options.onFailed(query.data)
      }
    }
  }, [query.data, options])

  return query
}
