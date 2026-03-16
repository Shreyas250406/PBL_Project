import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'phone', label: 'Phone' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'bag', label: 'Bag' },
  { value: 'id_card', label: 'ID Card' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'keys', label: 'Keys' },
  { value: 'books', label: 'Books' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'other', label: 'Other' },
];

const colors = [
  { value: '', label: 'All Colors' },
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'brown', label: 'Brown' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'pink', label: 'Pink' },
  { value: 'gray', label: 'Gray' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A–Z' },
];

export default function SearchBar({ filters, onFilterChange }) {
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onFilterChange({ search: '', category: '', color: '', sort: 'newest', page: 1 });
  };

  const hasActiveFilters = filters.category || filters.color || filters.search;

  const selectStyle = {
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  };

  return (
    <div className="mb-6">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, description, or location..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            id="search-input"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: showFilters ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
            color: showFilters ? 'var(--primary-light)' : 'var(--text-secondary)',
            border: `1px solid ${showFilters ? 'var(--primary)' : 'var(--border)'}`,
          }}
          id="filter-toggle"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }}></span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-3 p-4 rounded-xl animate-fade-in"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--danger)' }}>
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm outline-none appearance-none cursor-pointer"
              style={selectStyle}
              id="filter-category"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={filters.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm outline-none appearance-none cursor-pointer"
              style={selectStyle}
              id="filter-color"
            >
              {colors.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={filters.sort}
              onChange={(e) => handleChange('sort', e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm outline-none appearance-none cursor-pointer"
              style={selectStyle}
              id="filter-sort"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
