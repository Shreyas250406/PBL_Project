import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ filters, onFilterChange }) {

  const [showFilters,setShowFilters] = useState(false);

  const handleChange = (key,value)=>{
    onFilterChange({...filters,[key]:value,page:1})
  }

  const clearFilters=()=>{
    onFilterChange({search:'',category:'',color:'',sort:'newest',page:1})
  }

  const hasActiveFilters = filters.category || filters.color || filters.search

  return(
    <div className="mb-10">

      <div className="flex gap-4 items-center">

        <div className="relative flex-1">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>

          <input
          type="text"
          placeholder="Search items..."
          value={filters.search}
          onChange={(e)=>handleChange('search',e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 outline-none"
          />

        </div>

        <button
        onClick={()=>setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium hover:bg-gray-50"
        >
          <SlidersHorizontal className="w-4 h-4"/>
          Filters
        </button>

      </div>


      {showFilters && (
        <div className="mt-4 bg-white border rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <select
          value={filters.category}
          onChange={(e)=>handleChange('category',e.target.value)}
          className="px-4 py-3 border rounded-xl text-sm"
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
          onChange={(e)=>handleChange('color',e.target.value)}
          className="px-4 py-3 border rounded-xl text-sm"
          >
            <option value="">All Colors</option>
            <option value="black">Black</option>
            <option value="white">White</option>
            <option value="blue">Blue</option>
          </select>

          <select
          value={filters.sort}
          onChange={(e)=>handleChange('sort',e.target.value)}
          className="px-4 py-3 border rounded-xl text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {hasActiveFilters && (
            <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-red-500"
            >
              <X className="w-3 h-3"/> Clear Filters
            </button>
          )}

        </div>
      )}

    </div>
  )
}