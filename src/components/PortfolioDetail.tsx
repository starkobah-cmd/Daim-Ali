import React, { useEffect } from 'react';
import { ArrowLeft, ExternalLink, Tag } from 'lucide-react';
import { PortfolioItem } from '../types';
import { PortfolioCard } from './PortfolioCard';

interface PortfolioDetailProps {
  item: PortfolioItem;
  allItems: PortfolioItem[];
  onBack: () => void;
  onSelectPortfolio: (item: PortfolioItem) => void;
}

export const PortfolioDetail: React.FC<PortfolioDetailProps> = ({ item, allItems = [], onBack, onSelectPortfolio }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [item]);

  const relatedItems = allItems
    .filter(p => p.category === item.category && p.id !== item.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 mb-8">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 font-bold transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Portfolio
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider">
            {item.category}
          </span>
          {item.date && (
            <span className="text-sm font-semibold text-slate-400">
              {item.date}
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">{item.title}</h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 mb-16">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
          {item.videoUrl ? (
            <video
              src={item.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto aspect-video object-cover"
            />
          ) : (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-auto aspect-video object-cover"
            />
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Project Overview</h2>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
            <p className="text-lg font-medium">{item.description}</p>
            {item.detailedDescription && (
              <p>{item.detailedDescription}</p>
            )}
          </div>
          
          {item.images && item.images.length > 0 && (
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`Gallery ${idx+1}`} className="rounded-xl border border-slate-200 shadow-sm w-full h-48 object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {item.client && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Client</h4>
                <p className="text-slate-900 font-semibold">{item.client}</p>
              </div>
            )}
            {item.stats && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Key Result</h4>
                <p className="text-emerald-600 font-bold">{item.stats}</p>
              </div>
            )}
            {item.link && (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-bold"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Live Project
              </a>
            )}
          </div>

          {(item.technologies && item.technologies.length > 0) || (item.tags && item.tags.length > 0) ? (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-4">
                <Tag className="w-4 h-4 text-sky-500" />
                Technologies & Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {(item.technologies || item.tags).map((tech, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Related Projects */}
      {relatedItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 border-t border-slate-200 pt-20">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-8">More from {item.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedItems.map(related => (
              <PortfolioCard key={related.id} item={related} onClick={onSelectPortfolio} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
