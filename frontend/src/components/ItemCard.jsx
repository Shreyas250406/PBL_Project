import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ImageOff } from 'lucide-react';

const API_BASE = '';

const categoryColors = {
  phone: '#6366f1',
  wallet: '#f59e0b',
  bag: '#10b981',
  id_card: '#ef4444',
  laptop: '#8b5cf6',
  keys: '#0ea5e9',
  books: '#ec4899',
  clothing: '#14b8a6',
  electronics: '#f97316',
  other: '#64748b',
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ItemCard({ item }) {
  const catColor = categoryColors[item.category] || '#64748b';

  return (
    <Link
      to={`/item/${item._id}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
        e.currentTarget.style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      id={`item-card-${item._id}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden" style={{ background: 'var(--bg-input)' }}>
        {item.imageUrl ? (
          <img
            src={`${API_BASE}${item.imageUrl}`}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${item.imageUrl ? 'hidden' : 'flex'}`}
          style={{ color: 'var(--text-muted)' }}>
          <ImageOff className="w-10 h-10" />
          <span className="text-xs">No image</span>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
            style={{
              background: item.type === 'lost'
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #10b981, #059669)',
            }}>
            {item.type}
          </span>
        </div>

        {/* Status badge */}
        {item.status && item.status !== 'active' && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
              style={{
                background: 'rgba(0,0,0,0.6)',
                color: item.status === 'claimed' ? '#f59e0b' : '#94a3b8',
                backdropFilter: 'blur(4px)',
              }}>
              {item.status}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold line-clamp-1" style={{ color: 'var(--text-primary)' }}>
            {item.name}
          </h3>
          {item.color && (
            <span className="shrink-0 px-2 py-0.5 rounded text-xs font-medium capitalize"
              style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
              {item.color}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <Tag className="w-3.5 h-3.5" style={{ color: catColor }} />
          <span className="text-xs font-medium capitalize" style={{ color: catColor }}>
            {item.category?.replace('_', ' ')}
          </span>
        </div>

        <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
          {item.description}
        </p>

        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(item.date)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
