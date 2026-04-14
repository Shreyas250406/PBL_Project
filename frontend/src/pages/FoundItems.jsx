import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import { CheckCircle, Loader, Package, ChevronLeft, ChevronRight, UserCheck, ShieldAlert } from 'lucide-react';

export default function FoundItems() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    color: searchParams.get('color') || '',
    sort: 'newest',
    page: 1,
  });

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.color) params.set('color', filters.color);
      if (filters.sort) params.set('sort', filters.sort);
      params.set('page', filters.page);

      const res = await api.get(`/items/found?${params.toString()}`);
      setItems(res.data.items || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeItems = items.filter(i => i.status === 'active');
  const claimedItems = items.filter(i => i.status === 'claimed');

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: '#ecfdf5' }}>
          <CheckCircle className="w-5 h-5" style={{ color: '#059669' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Found Items</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>{pagination.total} items found & reported</p>
        </div>
      </div>

      <SearchBar filters={filters} onFilterChange={setFilters} />

      {/* Info banner about claimed items */}
      {claimedItems.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-6 animate-fade-in"
          style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#92400e' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
              {claimedItems.length} item{claimedItems.length !== 1 ? 's' : ''} already claimed
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#78350f' }}>
              If you believe a claimed item belongs to you, click on it to request a re-verification from the current claimer.
              Items are auto-removed after 15 days if unchallenged.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="w-8 h-8 animate-spin" style={{ color: '#111827' }} />
        </div>
      ) : items.length > 0 ? (
        <>
          {/* Active Items */}
          {activeItems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4" style={{ color: '#059669' }} />
                <h2 className="text-base font-semibold" style={{ color: '#111827' }}>
                  Available Items ({activeItems.length})
                </h2>
              </div>
              <div className="grid-cards stagger">
                {activeItems.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Claimed Items */}
          {claimedItems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-4 h-4" style={{ color: '#92400e' }} />
                <h2 className="text-base font-semibold" style={{ color: '#111827' }}>
                  Claimed Items ({claimedItems.length})
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#fef3c7', color: '#92400e' }}>
                  Disputable
                </span>
              </div>
              <div className="grid-cards stagger">
                {claimedItems.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page <= 1}
                className="p-2.5 rounded-xl disabled:opacity-30 transition-all duration-200 cursor-pointer"
                style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#374151' }}
                onMouseEnter={(e) => { if (filters.page > 1) e.currentTarget.style.borderColor = '#111827'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm px-4 font-medium" style={{ color: '#6b7280' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= pagination.pages}
                className="p-2.5 rounded-xl disabled:opacity-30 transition-all duration-200 cursor-pointer"
                style={{ background: '#ffffff', border: '1px solid #e5e7eb', color: '#374151' }}
                onMouseEnter={(e) => { if (filters.page < pagination.pages) e.currentTarget.style.borderColor = '#111827'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: '#d1d5db' }} />
          <h3 className="text-lg font-semibold mb-1" style={{ color: '#374151' }}>No items found</h3>
          <p className="text-sm" style={{ color: '#9ca3af' }}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
