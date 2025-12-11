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
      className={`stock-card bg-stock-bg-panel p-5 min-h-[180px] cursor-pointer transition-all duration-300 hover:border-stock-primary/50 hover:shadow-lg group relative overflow-hidden`}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* External Link Icon */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ArrowTopRightOnSquareIcon className="w-5 h-5 text-stock-primary" />
      </div>

      {/* Content */}
      <div className="flex flex-col h-full">
        {/* Title */}
        <h3 className="text-base font-semibold text-white mb-3 line-clamp-2 pr-6">
          {item.title}
        </h3>

        {/* Snippet */}
        {item.snippet && (
          <p className="text-sm text-stock-text-secondary leading-relaxed mb-4 line-clamp-3 flex-1">
            {item.snippet}
          </p>
        )}

        {/* Footer: Source Badge + Date */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <div
            className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold"
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
