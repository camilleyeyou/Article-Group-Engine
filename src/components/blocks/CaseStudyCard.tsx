'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Asset } from '@/types';

interface CaseStudyCardProps {
  asset: Asset;
  index?: number;
  size?: 'default' | 'large';
}

export function CaseStudyCard({ asset, index = 0, size = 'default' }: CaseStudyCardProps) {
  const thumbnailUrl = asset.thumbnail_url || '/placeholder-case-study.jpg';
  
  return (
    <motion.a
      href={asset.source_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      className={`
        group block rounded-xl overflow-hidden bg-white border border-slate-200
        shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1
        ${size === 'large' ? 'col-span-2' : ''}
      `}
    >
      {/* Thumbnail */}
      <div className={`
        relative overflow-hidden bg-slate-100
        ${size === 'large' ? 'aspect-[2/1]' : 'aspect-[4/3]'}
      `}>
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
        
        {/* Client badge */}
        {asset.client && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700">
              {asset.client}
            </span>
          </div>
        )}
        
        {/* Arrow icon */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4 text-slate-700" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {asset.title}
        </h3>
        
        {asset.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {asset.description}
          </p>
        )}
        
        {/* Tags from metadata */}
        {asset.metadata && Array.isArray((asset.metadata as Record<string, unknown>).tags) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {((asset.metadata as Record<string, unknown>).tags as string[]).slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.a>
  );
}
