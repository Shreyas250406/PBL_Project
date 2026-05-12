import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ filters, onFilterChange }) {

  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 })
  }

  const clearFilters = () => {
    onFilterChange({ search: '', category: '', color: '', sort: 'newest', page: 1 })
  }

  const hasActiveFilters = filters.category || filters.color || filters.search

  return (
    <div className="mb-8">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:ring-2 focus:ring-black/5 outline-none transition-all"
          />
          {filters.search && (
            <button
              onClick={() => handleChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:ring-2 focus:ring-black/5 outline-none transition-all"
          >
            <option value="">All Categories</option>
            <option value="phone">Phone</option>
            <option value="wallet">Wallet</option>
            <option value="bag">Bag</option>
            <option value="id_card">ID Card</option>
            <option value="laptop">Laptop</option>
          </select>

          <select
            value={filters.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:ring-2 focus:ring-black/5 outline-none transition-all"
          >
            <option value="">All Colors</option>
            <option value="black">Black</option>
            <option value="white">White</option>
            <option value="blue">Blue</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:ring-2 focus:ring-black/5 outline-none transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}