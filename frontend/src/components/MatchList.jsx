import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 80) return '#059669';
  if (score >= 60) return '#d97706';
  return '#9ca3af';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Possible';
  return 'Weak';
}

export default function MatchList({ matches, currentItemId }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-xl">
        <TrendingUp className="w-8 h-8 mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-500">No matches found yet</p>
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
            className="block p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {otherItem.imageUrl ? (
                  <img src={otherItem.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium bg-gray-200 text-gray-500">
                    {otherItem.type === 'lost' ? 'L' : 'F'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {otherItem.name}
                  </h4>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    otherItem.type === 'lost' 
                      ? 'bg-amber-50 text-amber-700' 
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {otherItem.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-base font-semibold" style={{ color }}>{match.matchScore}%</div>
                  <div className="text-xs" style={{ color }}>{getScoreLabel(match.matchScore)}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300" 
                style={{ width: `${match.matchScore}%`, background: color }}
              ></div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}