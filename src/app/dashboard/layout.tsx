'use client'

import { useRouter } from 'next/navigation'
import { useWebSocketHook } from '@/hooks/useWebSocketHook'
import { useEffect, useState, useCallback } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { AppBar } from "@/components/app-bar"

const queryClient = new QueryClient()

interface EventUpdateCategory {
  movies: string[];
  shows: {
    [showId: string]: {
      [seasonId: string]: number[];
    };
  };
}

interface EventUpdate {
  scraping: EventUpdateCategory;
  downloader: EventUpdateCategory;
  symlinker: EventUpdateCategory;
  updater: EventUpdateCategory;
  postprocessing: EventUpdateCategory;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isConnected, eventUpdate } = useWebSocketHook()
  const [checkedConnection, setCheckedConnection] = useState(false)
  const { toast } = useToast()
  const [toastId, setToastId] = useState<string | null>(null)

  useEffect(() => {
    console.log('isConnected', isConnected)
    if (!isConnected && checkedConnection) {
      router.push('/')
    }
  }, [isConnected, checkedConnection, router])

  useEffect(() => {
    const timer = setTimeout(() => {
      setCheckedConnection(true)
    }, 1000) // Adjust the delay as needed
    return () => clearTimeout(timer)
  }, [])

  const updateOrCreateToast = useCallback((content: React.ReactNode, totalEvents: number) => {
    if (toastId) {
      toast({
        id: toastId,
        title: "Active Events",
        description: content,
        duration: Infinity,
      })
    } else {
      const { id } = toast({
        title: "Active Events",
        description: content,
        duration: Infinity,
      })
      setToastId(id)
    }
  }, [toast, toastId])

  // useEffect(() => {
  //   if (eventUpdate) {
  //     const stages = ["scraping", "downloader", "symlinker", "updater", "postprocessing"] as const

  //     const countItems = (category: EventUpdateCategory) => {
  //       const movieCount = category.movies.length;
  //       const showCount = Object.keys(category.shows).length;
  //       return movieCount + showCount;
  //     }

  //     const totalEvents = stages.reduce((acc, stage) => acc + countItems(eventUpdate[stage]), 0)
  //     console.log('eventUpdate', eventUpdate)

  //     if (totalEvents > 0) {
  //       const content = (
  //         <div className="space-y-2">
  //           {stages.map(stage => {
  //             const count = countItems(eventUpdate[stage])
  //             const progress = (count / totalEvents) * 100
  //             return count > 0 ? (
  //               <div key={stage}>
  //                 <div className="flex justify-between text-sm">
  //                   <span className="capitalize">{stage}</span>
  //                   <span>{count} item{count !== 1 ? 's' : ''}</span>
  //                 </div>
  //                 <Progress value={progress} className="h-2" />
  //               </div>
  //             ) : null
  //           })}
  //         </div>
  //       )

  //       updateOrCreateToast(content, totalEvents)
  //     } else if (toastId) {
  //       toast({
  //         id: toastId,
  //         title: "All Events Completed",
  //         description: "All items have been processed.",
  //         duration: 3000,
  //       })
  //       setToastId(null)
  //     }
  //   }
  // }, [eventUpdate, toast, toastId, updateOrCreateToast])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <AppBar />
        <main className="flex-1 overflow-auto p-4 relative">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  )
}