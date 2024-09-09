'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useWebSocketHook } from '@/hooks/useWebSocketHook'
import { useStore } from '@/lib/store'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeSelector } from '@/components/theme-selector'

export default function AppPage() {
  const router = useRouter()
  const { isConnected, error } = useWebSocketHook()
  const [url, setUrl] = useState('')
  const setWsUrl = useStore((state) => state.setWsUrl)
  const storedWsUrl = useStore((state) => state.wsUrl)

  useEffect(() => {
    if (storedWsUrl) {
      setUrl(storedWsUrl);
    }
  }, [storedWsUrl]);

  useEffect(() => {
    console.log('isConnected', isConnected);

    if (isConnected) {
      router.push('/dashboard/movies');
    }
  }, [isConnected, router]);

  const handleConnect = () => {
      setWsUrl(url);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Connect to Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-red-500">{error}</p>}
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter WebSocket URL"
            className="mb-4"
          />
          <Button onClick={handleConnect} className="w-full">
            Connect
          </Button>
        </CardContent>
      </Card>
      <div className="absolute top-4 right-4">
          <ThemeSelector />
        </div>
    </div>
  )
};