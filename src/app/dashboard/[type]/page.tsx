'use client'

import { useState, useCallback, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { FilterSort } from '@/components/filter-sort'
import { ItemList } from '@/components/item-list'

export default function ItemsPage({ params }: { params: { type: string } }) {
  const wsUrl = useStore((state) => state.wsUrl)
  const apiUrl = useMemo(() => wsUrl ? `http${wsUrl.slice(2)}` : '', [wsUrl])

  const [filters, setFilters] = useState({ search: '' })
  const [sort, setSort] = useState('title_asc')

  const handleFilterChange = useCallback((newFilters: { search: string }) => {
    setFilters(newFilters)
  }, [])

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort)
  }, [])

  return (
    <div>
      <FilterSort 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        showSearch={true}
      />
      <ItemList
        apiUrl={apiUrl}
        type={params.type}
        filters={filters}
        sort={sort}
      />
    </div>
  )
}