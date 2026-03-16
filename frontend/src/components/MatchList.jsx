import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 80) return '#059669';
  if (score >= 60) return '#d97706';
  return '#9ca3af';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Strong Match';
  if (score >= 60) return 'Possible Match';
  return 'Weak Match';
}

export default function MatchList({ matches, currentItemId }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-10 rounded-xl"
        style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
        <TrendingUp className="w-10 h-10 mx-auto mb-3" style={{ color: '#d1d5db' }} />
        <p className="text-sm" style={{ color: '#9ca3af' }}>No matches found yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const otherItem = match.lostItemId?._id === currentItemId ? match.foundItemId : match.lostItemId;
        if (!otherItem) return null;
        const color = getScoreColor(match.matchScore);

        return (
          <Link
            key={match._id}
            to={`/item/${otherItem._id}`}
            className="block p-5 rounded-xl transition-all duration-200"
            style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = color;
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {otherItem.imageUrl ? (
                  <img src={otherItem.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: '#f3f4f6', color: '#9ca3af' }}>
                    {otherItem.type === 'lost' ? 'L' : 'F'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {otherItem.name}
                  </h4>
                  <span className="text-xs capitalize px-2 py-0.5 rounded"
                    style={{
                      background: otherItem.type === 'lost' ? '#fef2f2' : '#ecfdf5',
                      color: otherItem.type === 'lost' ? '#dc2626' : '#059669',
                    }}>
                    {otherItem.type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color }}>{match.matchScore}%</div>
                  <div className="text-xs" style={{ color }}>{getScoreLabel(match.matchScore)}</div>
                </div>
                <ArrowRight className="w-4 h-4" style={{ color: '#d1d5db' }} />
              </div>
            </div>
            {/* Score breakdown bar */}
            <div className="score-bar mt-2">
              <div className="score-bar-fill" style={{ width: `${match.matchScore}%`, background: color }}></div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
