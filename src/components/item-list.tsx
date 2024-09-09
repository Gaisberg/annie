'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, useRef, useCallback } from 'react'
import { useIntersection } from '@mantine/hooks'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"

interface Item {
  id: string
  title: string
  imdb_id: string
  state: string
  genres: string[]
}

interface ApiResponse {
  success: boolean
  items: Item[]
  page: number
  limit: number
  total_items: number
  total_pages: number
}

interface ItemListProps {
  apiUrl: string
  type: string
  filters: { genres: string[], search: string }
  sort: string
}

export function ItemList({ apiUrl, type, filters, sort }: ItemListProps) {
  const router = useRouter()

  const fetchItems = useCallback(async ({ pageParam = 1 }) => {
    if (!apiUrl) {
      throw new Error('API URL is not set')
    }
    const { data } = await axios.get(`${apiUrl}/items`, {
      params: {
        type: type.slice(0, -1),
        page: pageParam,
        limit: 20,
        search: filters.search,
        sort: sort,
      },
    })
    return data
  }, [apiUrl, type, filters, sort])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<ApiResponse>({
    queryKey: ['items', type, filters, sort],
    queryFn: fetchItems,
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!apiUrl,
  })

  const lastItemRef = useRef<HTMLDivElement>(null)
  const { ref, entry } = useIntersection({
    root: null,
    threshold: 1,
  })

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [entry, fetchNextPage, hasNextPage, isFetchingNextPage])

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'Completed':
        return 'bg-green-500'
      case 'Ongoing':
        return 'bg-blue-500'
      default:
        return 'bg-red-500'
    }
  }

  if (status === 'pending') {
    return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(12)].map((_, i) => (
        <Skeleton key={i} className="w-full h-[200px]" />
      ))}
    </div>
  }

  if (status === 'error') {
    return <div>Error fetching data</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {data?.pages.map((page, i) => (
        page.items.map((item, index) => (
          <Card
            key={item.id}
            className="relative overflow-hidden group"
            ref={i === data.pages.length - 1 && index === page.items.length - 1 ? ref : null}
            onClick={() => router.push(`/dashboard/${type}/${item.id}`)}
          >
            <CardContent className="p-0">
              <img
                src={`https://images.metahub.space/poster/small/${item.imdb_id}/img`}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-200 flex items-end">
                <p className="text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className={`absolute top-2 right-2 rounded-full`}>
                    <Badge color={getStatusColor(item.state)}> {item.state} </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.genres?.map(genre => (
                      <Badge key={genre} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                </p>
              </div>
            </CardContent>
          </Card>
        ))
      ))}
      {isFetchingNextPage && (
        <div className="col-span-full flex justify-center">
          <Skeleton className="w-full h-[200px]" />
        </div>
      )}
      <div ref={lastItemRef} />
    </div>
  )
}