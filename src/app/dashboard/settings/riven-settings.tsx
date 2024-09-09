'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from 'lucide-react'

export default function RivenSettings({ apiUrl }) {
  const [schema, setSchema] = useState(null)
  const [settings, setSettings] = useState(null)
  const [originalSettings, setOriginalSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!apiUrl) {
        setError('API URL is not available')
        setLoading(false)
        return
      }

      try {
        const [schemaResponse, settingsResponse] = await Promise.all([
          fetch(`${apiUrl}/settings/schema`),
          fetch(`${apiUrl}/settings/get/all`)
        ])

        if (!schemaResponse.ok || !settingsResponse.ok) {
          throw new Error('Failed to fetch schema or settings')
        }

        const schemaData = await schemaResponse.json()
        const settingsData = await settingsResponse.json()

        setSchema(schemaData)
        setSettings(settingsData.data)
        setOriginalSettings(JSON.parse(JSON.stringify(settingsData.data)))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [apiUrl])

  const handleChange = (path, value) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings }
      let current = newSettings
      const keys = path.split('.')
      const lastKey = keys.pop()
      for (const key of keys) {
        if (!current[key]) current[key] = {}
        current[key] = { ...current[key] }
        current = current[key]
      }
      current[lastKey] = value
      return newSettings
    })
  }

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const renderField = (key, value, path = '') => {
    if (key === 'version') return null // Hide version field

    const currentPath = path ? `${path}.${key}` : key
    const currentValue = getNestedValue(settings, currentPath)

    if (!value || typeof value !== 'object') return null

    if (value.$ref && schema.$defs) {
      const refKey = value.$ref.split('/').pop()
      const refSchema = schema.$defs[refKey]
      return renderObject(key, refSchema, currentPath)
    }

    switch (value.type) {
      case 'boolean':
        return (
          <div key={currentPath} className="flex items-center justify-between">
            <Label htmlFor={currentPath}>{value.title || key}</Label>
            <Switch
              id={currentPath}
              checked={!!currentValue}
              onCheckedChange={(checked) => handleChange(currentPath, checked)}
            />
          </div>
        )
      case 'string':
      case 'integer':
      case 'number':
        return (
          <div key={currentPath} className="space-y-2">
            <Label htmlFor={currentPath}>{value.title || key}</Label>
            <Input
              id={currentPath}
              type={value.type === 'string' ? 'text' : 'number'}
              value={currentValue ?? ''}
              onChange={(e) => handleChange(currentPath, e.target.value)}
            />
          </div>
        )
      case 'array':
        return (
          <div key={currentPath} className="space-y-2">
            <Label htmlFor={currentPath}>{value.title || key}</Label>
            <Input
              id={currentPath}
              value={Array.isArray(currentValue) ? currentValue.join(', ') : ''}
              onChange={(e) => handleChange(currentPath, e.target.value.split(', ').filter(Boolean))}
            />
          </div>
        )
      case 'object':
        return renderObject(key, value, currentPath)
      default:
        return null
    }
  }

  const renderObject = (key, value, path) => {
    if (!value || !value.properties) return null
    return (
      <Card key={path}>
        <CardHeader>
          <CardTitle>{value.title || key}</CardTitle>
          {value.description && <CardDescription>{value.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(value.properties).map(([subKey, subValue]) => 
            renderField(subKey, subValue, path)
          )}
        </CardContent>
      </Card>
    )
  }

  const hasChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }

  const saveSettings = async () => {
    if (!apiUrl) {
      setError('API URL is not available')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`${apiUrl}/settings/set/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setOriginalSettings(JSON.parse(JSON.stringify(settings)))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const renderTabs = () => {
    if (!schema || !schema.properties) return null

    const generalSettings = []
    const refTabs = []

    Object.entries(schema.properties).forEach(([key, value]) => {
      if (key !== 'version') {
        if (value.$ref) {
          refTabs.push(
            <TabsContent key={key} value={key}>
              {renderField(key, value)}
            </TabsContent>
          )
        } else {
          generalSettings.push(renderField(key, value))
        }
      }
    })

    return (
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {Object.entries(schema.properties).map(([key, value]) => 
            value.$ref && key !== 'version' && (
              <TabsTrigger key={key} value={key}>
                {value.title || key}
              </TabsTrigger>
            )
          )}
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generalSettings}
            </CardContent>
          </Card>
        </TabsContent>
        {refTabs}
      </Tabs>
    )
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return (
    <div className="flex items-center space-x-2 text-red-500">
      <AlertCircle />
      <span>Error: {error}</span>
    </div>
  )

  if (!schema || !settings) return <div>No settings available</div>

  return (
    <div>
      {renderTabs()}
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={saveSettings} 
          disabled={!hasChanges() || saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : hasChanges() ? (
            'Save Changes'
          ) : (
            'No Changes'
          )}
        </Button>
      </div>
    </div>
  )
}