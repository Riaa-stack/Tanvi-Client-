import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

export function useSSE(url: string, enabled: boolean, body: any) {
  const [tokens, setTokens] = useState<string>('')
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    const token = useAuthStore.getState().accessToken
    const controller = new AbortController()

    setIsDone(false)
    setError(null)
    setTokens('')

    fetch(import.meta.env.VITE_API_BASE_URL + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    }).then(async (res) => {
      if (!res.ok) throw new Error('Stream request failed')
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // Basic SSE parsing
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            if (dataStr === '[DONE]') {
              setIsDone(true)
            } else {
              try {
                const data = JSON.parse(dataStr)
                if (data.token) {
                  setTokens(prev => prev + data.token)
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') setError(err.message)
    })

    return () => controller.abort()
  }, [url, enabled, JSON.stringify(body)])

  return { tokens, isDone, error, reset: () => setTokens('') }
}
