'use client'

import { useState, useEffect, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter } from 'next/navigation'

interface FilterSortProps {
  onFilterChange: (filters: { search?: string, type?: string }) => void
  onSortChange: (sort: string) => void
  showSearch?: boolean
  showTypeFilter?: boolean
}

export function FilterSort({ 
  onFilterChange, 
  onSortChange, 
  showSearch = false, 
  showTypeFilter = false 
}: FilterSortProps) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string>('all')
  const [sort, setSort] = useState('title_asc')
  const router = useRouter()

  const handleFilterChange = useCallback(() => {
    const filters: { search?: string, type?: string } = {}
    if (showSearch) filters.search = search
    if (showTypeFilter) filters.type = type
    onFilterChange(filters)
  }, [search, type, showSearch, showTypeFilter, onFilterChange])

  useEffect(() => {
    handleFilterChange()
  }, [handleFilterChange])

  useEffect(() => {
    onSortChange(sort)
  }, [sort, onSortChange])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleTypeChange = (value: string) => {
    setType(value)
  }

  const handleSortChange = (value: string) => {
    setSort(value)
  }

  const handleTraktSearch = () => {
    if (search.trim()) {
      router.push(`/dashboard/search?query=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex gap-4">
        {showSearch && (
          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={handleSearchChange}
              className="flex-1"
            />
            <Button onClick={handleTraktSearch} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search Trakt
            </Button>
          </div>
        )}
        {showTypeFilter && (
          <Select onValueChange={handleTypeChange} defaultValue={type}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="movie">Movies</SelectItem>
              <SelectItem value="show">TV Shows</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select onValueChange={handleSortChange} defaultValue={sort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title_asc">Title (A-Z)</SelectItem>
            <SelectItem value="title_desc">Title (Z-A)</SelectItem>
            <SelectItem value="year_asc">Year (Oldest)</SelectItem>
            <SelectItem value="year_desc">Year (Newest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}