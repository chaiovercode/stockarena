import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { NewsItem } from '../../types';
import { formatRelativeTime, getSourceColor } from '../../utils/dateFormat';

interface NewsCardProps {
  item: NewsItem;
  index: number;
}

export function NewsCard({ item, index }: NewsCardProps) {
  const sourceColor = getSourceColor(item.source);
  const relativeTime = formatRelativeTime(item.date);

  const handleClick = () => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article
      onClick={handleClick}
      className={`stock-card bg-stock-bg-panel p-4 cursor-pointer transition-all duration-300 hover:border-stock-primary/50 hover:shadow-lg group relative overflow-hidden`}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* External Link Icon */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-stock-primary" />
      </div>

      {/* Content */}
      <div className="flex flex-col">
        {/* Title */}
        <h3 className="text-sm font-semibold text-white mb-2 pr-6 leading-snug">
          {item.title}
        </h3>

        {/* Snippet */}
        {item.snippet && (
          <p className="text-xs text-stock-text-secondary leading-relaxed mb-3 line-clamp-2">
            {item.snippet}
          </p>
        )}

        {/* Footer: Source Badge + Date */}
        <div className="flex items-center justify-between gap-2">
          <div
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
            style={{
              backgroundColor: `${sourceColor}20`,
              color: sourceColor,
              border: `1px solid ${sourceColor}40`,
            }}
          >
            {item.source}
          </div>
          <span className="text-xs text-stock-text-muted whitespace-nowrap">
            {relativeTime}
          </span>
        </div>
      </div>

      {/* Hover Effect Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-stock-primary/0 to-stock-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </article>
  );
}
