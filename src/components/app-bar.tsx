'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ThemeSelector } from "@/components/theme-selector"
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useStore } from '@/lib/store'

interface VersionResponse {
  version: string;
}

export function AppBar() {
  const pathname = usePathname()
  const wsUrl = useStore((state) => state.wsUrl)
  const apiUrl = wsUrl ? `http${wsUrl.slice(2)}` : ''

  const { data: versionData } = useQuery<VersionResponse>({
    queryKey: ['version'],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/`);
      return data;
    },
    enabled: !!apiUrl,
  })

  const navItems = ['movies', 'shows', 'settings']

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Annie</h1>
            <span className="text-sm text-muted-foreground">riven {versionData?.version || 'Loading...'}</span>
          </div>
          <nav className="flex space-x-4">
            {navItems.map((item) => (
              <Button
                key={item}
                variant={pathname === `/dashboard/${item}` ? "default" : "ghost"}
                asChild
              >
                <Link href={`/dashboard/${item}`}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Link>
              </Button>
            ))}
          </nav>
          <ThemeSelector />
        </div>
      </div>
    </header>
  )
}