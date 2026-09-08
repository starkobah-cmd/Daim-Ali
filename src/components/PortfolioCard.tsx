import React from 'react';
import { Eye } from 'lucide-react';
import { PortfolioItem } from '../types';

interface PortfolioCardProps {
  item: PortfolioItem;
  onClick: (item: PortfolioItem) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ item, onClick }) => {
  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-300 transition-all group flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Image Container with hover overlay */}
        <div className="relative h-52 overflow-hidden bg-slate-100">
          {item.videoUrl ? (
            <video
              src={item.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <img
              src={item.image}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-lg hover:bg-sky-50 flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-sky-600" />
              <span>View Project</span>
            </button>
          </div>
        </div>
        {/* Body Content */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-sky-600">{item.category}</span>
            {item.date && (
              <span className="text-slate-400">
                {item.date}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};
