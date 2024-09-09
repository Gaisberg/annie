'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { FilterSort } from './filter-sort'
import { useStore } from '@/lib/store'


interface TraktItem {
  type: 'movie' | 'show'
  score: number
  movie?: {
    title: string
    year: number
    ids: {
      trakt: number
      slug: string
      imdb: string
      tmdb: number
    }
    overview: string
    genres: string[]
  }
  show?: {
    title: string
    year: number
    ids: {
      trakt: number
      slug: string
      imdb: string
      tmdb: number
    }
    overview: string
    genres: string[]
  }
}

interface LibraryStatus {
  [key: string]: boolean;
}

export default function TraktSearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')
  const [results, setResults] = useState<TraktItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: 'all' })
  const [sort, setSort] = useState('score')
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus>({})
  const wsUrl = useStore((state) => state.wsUrl)
  const apiUrl = useMemo(() => wsUrl ? `http${wsUrl.slice(2)}` : '', [wsUrl])
  const router = useRouter();
  
  useEffect(() => {
    const fetchTraktResults = async () => {
      setLoading(true)
      try {
        const response = await axios.get('https://api.trakt.tv/search/movie,show', {
          params: { 
            query,
            extended: 'full'
          },
          headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': "0183a05ad97098d87287fe46da4ae286f434f32e8e951caad4cc147c947d79a3",
          },
        })

        setResults(response.data)

        // Fetch library status for all results
        const imdbIds = response.data.map((item: TraktItem) => 
          item.type === 'movie' ? item.movie?.ids.imdb : item.show?.ids.imdb
        ).filter(Boolean)

        const statusResponse = await axios.get(`${apiUrl}/items?imdb_ids=${imdbIds.join(',')}`)
        console.log('statusResponse', statusResponse.data)
        setLibraryStatus(statusResponse.data)
      } catch (error) {
        console.error('Error fetching Trakt results or library status:', error)
      } finally {
        setLoading(false)
      }
    }

    if (query && apiUrl) {
      fetchTraktResults()
    }
  }, [query, apiUrl])

  const handleRequest = async (item: TraktItem) => {
    const mediaItem = item.type === 'movie' ? item.movie : item.show
    if (!mediaItem) return

    try {
      await axios.post(`${apiUrl}/items/add?imdb_ids=${mediaItem.ids.imdb}`)
      // Update the library status for this item
      router.push(`/dashboard/${item.type}s`)
    } catch (error) {
      console.error('Error requesting item:', error)
    }
  }

  const filteredAndSortedResults = useMemo(() => {
    return results
      .filter(item => {
        if (filters.type !== 'all' && item.type !== filters.type) return false
        return true
      })
      .sort((a, b) => {
        const itemA = a.type === 'movie' ? a.movie : a.show
        const itemB = b.type === 'movie' ? b.movie : b.show
        if (!itemA || !itemB) return 0
        switch (sort) {
          case 'year_desc':
            return itemB.year - itemA.year
          case 'year_asc':
            return itemA.year - itemB.year
          case 'title_asc':
            return itemA.title.localeCompare(itemB.title)
          case 'title_desc':
            return itemB.title.localeCompare(itemA.title)
          default:
            return b.score - a.score
        }
      })
  }, [results, filters, sort])

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-[200px] w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
      <FilterSort 
        onFilterChange={setFilters}
        onSortChange={setSort}
        showTypeFilter={true}
      />
      <div className="space-y-4">
        {filteredAndSortedResults.map((item) => {
          const mediaItem = item.type === 'movie' ? item.movie : item.show
          if (!mediaItem) return null
          
          const isInLibrary = libraryStatus[mediaItem.ids.imdb]
          
          return (
            <Card key={mediaItem.ids.trakt}>
              <CardContent className="p-4 flex">
                <div className="flex-shrink-0 w-32 h-48 mr-4">
                  <img
                    src={`https://images.metahub.space/poster/small/${mediaItem.ids.imdb}/img`}
                    alt={mediaItem.title}
                    className="object-cover w-full h-full rounded-md"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">
                      {mediaItem.title} ({mediaItem.year})
                    </h2>
                    <Badge variant="secondary">{item.type}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {mediaItem.genres.map((genre) => (
                      <Badge key={genre} variant="outline">{genre}</Badge>
                    ))}
                  </div>
                  <p className="text-sm mb-4 line-clamp-3">{mediaItem.overview}</p>
                  <Button 
                    onClick={() => handleRequest(item)} 
                    className="w-full sm:w-auto"
                    disabled={isInLibrary}
                  >
                    {isInLibrary ? 'In Library' : 'Request'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}