import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#64748b';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Strong Match';
  if (score >= 60) return 'Possible Match';
  return 'Weak Match';
}

export default function MatchList({ matches, currentItemId }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <TrendingUp className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No matches found yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const otherItem = match.lostItemId?._id === currentItemId ? match.foundItemId : match.lostItemId;
        if (!otherItem) return null;
        const color = getScoreColor(match.matchScore);

        return (
          <Link
            key={match._id}
            to={`/item/${otherItem._id}`}
            className="block p-4 rounded-xl transition-all duration-200"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = color;
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {otherItem.imageUrl ? (
                  <img src={otherItem.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                    {otherItem.type === 'lost' ? 'L' : 'F'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {otherItem.name}
                  </h4>
                  <span className="text-xs capitalize px-2 py-0.5 rounded"
                    style={{
                      background: otherItem.type === 'lost' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                      color: otherItem.type === 'lost' ? '#ef4444' : '#10b981',
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
                <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
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
