'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RivenSettings from './riven-settings'

export default function SettingsPage() {
  const wsUrl = useStore((state) => state.wsUrl)
  const setWsUrl = useStore((state) => state.setWsUrl)
  const [localWsUrl, setLocalWsUrl] = useState(wsUrl)
  const apiUrl = useMemo(() => wsUrl ? `http${wsUrl.slice(2)}` : '', [wsUrl])

  const handleWsUrlChange = (e) => {
    setLocalWsUrl(e.target.value)
  }

  const saveWsUrl = () => {
    setWsUrl(localWsUrl)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Tabs defaultValue="frontend" className="w-full">
        <TabsList>
          <TabsTrigger value="frontend">Frontend Settings</TabsTrigger>
          <TabsTrigger value="riven">Riven Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="frontend">
          <Card>
            <CardHeader>
              <CardTitle>Frontend Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wsUrl">WebSocket URL</Label>
                <Input
                  id="wsUrl"
                  value={localWsUrl}
                  onChange={handleWsUrlChange}
                  placeholder="ws://localhost:8000"
                />
              </div>
              <Button onClick={saveWsUrl}>Save WebSocket URL</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="riven">
          <RivenSettings apiUrl={apiUrl} />
        </TabsContent>
      </Tabs>
    </div>
  )
}