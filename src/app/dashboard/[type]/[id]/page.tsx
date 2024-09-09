'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStore } from '@/lib/store'
import axios from 'axios'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RefreshCw, RotateCcw, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Progress } from "@/components/ui/progress"
import { useWebSocketHook } from '@/hooks/useWebSocketHook'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Season {
  number: number
  episodes: BackendItem[]
}

interface BackendItem {
  id: string;
  title: string;
  type: string;
  imdb_id: string;
  tvdb_id: string;
  tmdb_id: string;
  state: string;
  imdb_link: string | null;
  aired_at: string;
  genres: string[];
  is_anime: boolean;
  guid: string | null;
  requested_at: string;
  requested_by: string | null;
  scraped_at: string;
  scraped_times: number;
  seasons: Season[] | undefined;
  language: string;
  country: string;
  network: string;
  active_stream: object;
  streams: object[];
  blacklisted_streams: object[];
  number: number | null;
  symlinked: boolean;
  symlinked_at: string | null;
  symlinked_times: number;
  update_folder: string | null;
  file: string | null;
  folder: string | null;
  symlink_path: string | null;
  subtitles: object[];
}

export default function ItemPage({ params }: { params: { type: string, id: string } }) {
  const wsUrl = useStore((state) => state.wsUrl)
  const apiUrl = wsUrl ? `http${wsUrl.slice(2)}` : ''
  const queryClient = useQueryClient()
  const { getCurrentItemStage, eventUpdate } = useWebSocketHook()
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const router = useRouter()

  const { data: backendItem, isLoading: backendItemLoading, error: backendItemError } = useQuery<BackendItem>({
    queryKey: ['backendItem', params.id],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/items/${params.id}`);
      return data.item;
    },
    onError: () => {
      router.push(`/dashboard/${params.type}`)
    },
  });

  useEffect(() => {
    const stage = getCurrentItemStage(params.id);
    if (stage) {
      setCurrentStage(stage);
    }
  }, [getCurrentItemStage, params.id]);

  const retryMutation = useMutation({
    mutationFn: (id: string) => axios.post(`${apiUrl}/items/retry?ids=${id}`),
    onSuccess: () => queryClient.invalidateQueries(['backendItem', params.id]),
  })

  const resetMutation = useMutation({
    mutationFn: (id: string) => axios.post(`${apiUrl}/items/reset?ids=${id}`),
    onSuccess: () => queryClient.invalidateQueries(['backendItem', params.id]),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${apiUrl}/items/remove?ids=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['backendItem', params.id])
      router.push(`/dashboard/${params.type}`)
    },
  })

  if (backendItemLoading) {
    return <Skeleton className="w-full h-[600px]" />
  }

  if (backendItemError || !backendItem) {
    return null; // The router.push in the onError callback will handle navigation
  }

  const stages = ["scraping", "downloader", "symlinker", "updater", "postprocessing"];
  const currentStageIndex = currentStage ? stages.indexOf(currentStage) : -1;
  const progressPercentage = currentStageIndex !== -1 ? ((currentStageIndex + 1) / stages.length) * 100 : 0;

  const isItemInProgress = !!currentStage;

  const isEpisodeInProgress = (episodeId: string) => {
    return !!getCurrentItemStage(episodeId);
  };

  const getEpisodeStage = (episodeId: string) => {
    return getCurrentItemStage(episodeId);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative h-[400px] rounded-lg overflow-hidden">
        <img
          src={`https://images.metahub.space/background/medium/${backendItem.imdb_id}/img`}
          alt={backendItem.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{backendItem.title}</h1>
          <div className="flex flex-wrap gap-2 mb-2">
            <Link href={`https://www.imdb.com/title/${backendItem.imdb_id}`} target="_blank" rel="noopener noreferrer">
              <Badge variant="secondary" className="cursor-pointer">IMDB: {backendItem.imdb_id}</Badge>
            </Link>
            {backendItem.tvdb_id && (
              <Link href={`https://www.thetvdb.com/?id=${backendItem.tvdb_id}&tab=series`} target="_blank" rel="noopener noreferrer">
                <Badge variant="secondary" className="cursor-pointer">TVDB: {backendItem.tvdb_id}</Badge>
              </Link>)}
            <Link href={`https://www.themoviedb.org/${params.type === 'shows' ? 'tv' : 'movie'}/${backendItem.tmdb_id}`} target="_blank" rel="noopener noreferrer">
              <Badge variant="secondary" className="cursor-pointer">TMDB: {backendItem.tmdb_id}</Badge>
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {backendItem.genres?.map((genre) => (
              <Badge key={genre} variant="outline">{genre}</Badge>
            ))}
          </div>
          <Badge>{backendItem.state}</Badge>
          {isItemInProgress && (
            <Badge variant="secondary" className="ml-2">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {currentStage}
            </Badge>
          )}
        </div>
        <div className="absolute bottom-0 right-0 p-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => retryMutation.mutate(params.id)} disabled={retryMutation.isLoading}>
              {retryMutation.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Retry
            </Button>
            <Button onClick={() => resetMutation.mutate(params.id)} disabled={resetMutation.isLoading}>
              {resetMutation.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Reset
            </Button>
            <Button variant="destructive" onClick={() => removeMutation.mutate(params.id)} disabled={removeMutation.isLoading}>
              {removeMutation.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove
            </Button>
          </div>
        </div>
      </div>
      {currentStage && (
        <div className="w-full">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-center mt-2">Current stage: {currentStage}</p>
        </div>
      )}
      <Card>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {params.type === 'shows' && <TabsTrigger value="seasons">Seasons & Episodes</TabsTrigger>}
          </TabsList>
          <TabsContent value="overview">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold">Requested At</h3>
                  <p>{format(new Date(backendItem.requested_at), 'PPP')}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Requested By</h3>
                  <p>{backendItem.requested_by || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold">Rclone Path</h3>
                <p className="break-all">{backendItem.folder}/{backendItem.file}</p>
              </div>

              {backendItem.symlink_path && (
                <div className="mb-4">
                  <h3 className="font-semibold">Symlink Path</h3>
                  <p className="break-all">{backendItem.symlink_path}</p>
                </div>
              )}
            </CardContent>
          </TabsContent>
          {params.type === 'shows' && (
            <TabsContent value="seasons">
              <CardContent className="p-6">
                {backendItem.seasons && backendItem.seasons.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {backendItem.seasons.map((season) => (
                      <AccordionItem key={season.number} value={`season-${season.number}`}>
                        <AccordionTrigger>Season {season.number}</AccordionTrigger>
                        <AccordionContent>
                          {season.episodes.map((episode) => (
                            <div key={episode.id} className="mb-4 p-4 bg-secondary rounded-lg flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold">
                                  Episode {episode.number}: {episode.title}
                                </h4>
                                <p className="text-sm text-gray-500 mb-2">
                                  Aired: {format(new Date(episode.aired_at), 'PPP')}
                                </p>
                                <Badge>{episode.state}</Badge>
                                {isEpisodeInProgress(episode.id) && (
                                  <Badge variant="secondary" className="ml-2">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {getEpisodeStage(episode.id)}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => retryMutation.mutate(episode.id)} disabled={retryMutation.isLoading}>
                                  {retryMutation.isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => resetMutation.mutate(episode.id)} disabled={resetMutation.isLoading}>
                                  {resetMutation.isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p>No seasons or episodes information available.</p>
                )}
              </CardContent>
            </TabsContent>
          )}
        </Tabs>
      </Card>
    </div>
  )
}