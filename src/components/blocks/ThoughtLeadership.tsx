'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Asset } from '@/types';

interface ThoughtLeadershipProps {
  asset: Asset;
}

export function ThoughtLeadership({ asset }: ThoughtLeadershipProps) {
  const href = asset.source_url || `/asset/${asset.id}`;
  const isExternal = !!asset.source_url;
  
  return (
    <motion.a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="group block w-full max-w-3xl mx-auto mb-12"
    >
      <div className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        
        {/* Label */}
        <span className="text-sm font-medium text-blue-600 mb-2 block">
          From the Ideas Blog
        </span>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
          {asset.title}
        </h3>
        
        {/* Description */}
        {asset.description && (
          <p className="text-slate-600 mb-4 line-clamp-3">
            {asset.description}
          </p>
        )}
        
        {/* Read more link */}
        <div className="flex items-center text-blue-600 font-medium">
          <span>Read article</span>
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.a>
  );
}
