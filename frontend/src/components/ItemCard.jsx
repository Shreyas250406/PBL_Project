import { Link } from "react-router-dom"
import { MapPin, Calendar, ImageOff, Clock } from "lucide-react"

const API_BASE = ""

function getTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function ItemCard({ item, variant = "default" }) {
  const isClaimed = item.status === 'claimed'

  const statusConfig = {
    lost: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Lost' },
    found: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Found' },
    claimed: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: 'Claimed' }
  }

  const status = item.type === 'lost' ? statusConfig.lost :
                 item.type === 'found' ? statusConfig.found : statusConfig.claimed

  const reporterInitial = item.reportedBy?.name?.charAt(0)?.toUpperCase() || '?'

  if (variant === "compact") {
    return (
      <Link
        to={`/item/${item._id}`}
        className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200 flex"
      >
        <div className="w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden rounded-l-xl">
          {item.imageUrl ? (
            <img
              src={`${API_BASE}${item.imageUrl}`}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <ImageOff size={18} className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {item.name}
              </h3>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {item.description}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin size={11} />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} />
              {getTimeAgo(item.date)}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/item/${item._id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 ease-out hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 hover:border-gray-300 h-full flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={`${API_BASE}${item.imageUrl}`}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <ImageOff size={28} className="text-gray-400" />
          </div>
        )}

        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text} ${status.border}`}>
          {status.label}
        </span>

        {item.matchConfidence && item.matchConfidence > 0 && (
          <span className="absolute top-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
            {item.matchConfidence}% match
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {item.category || 'Other'}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            {getTimeAgo(item.date)}
          </span>
        </div>

        <h3 className="text-base font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
          {item.name}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{reporterInitial}</span>
            </div>
            <span className="text-xs text-gray-500">
              {item.reportedBy?.name || 'Student'}
            </span>
          </div>

          <span className="text-xs font-medium text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
            View details
          </span>
        </div>

        {isClaimed && item.claimedBy && (
          <div className="flex items-center gap-1.5 pt-2 text-xs text-emerald-600">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span className="font-medium">Returned to owner</span>
          </div>
        )}
      </div>
    </Link>
  )
}