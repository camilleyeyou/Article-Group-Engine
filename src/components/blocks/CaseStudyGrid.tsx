'use client';

import { motion } from 'framer-motion';
import { CaseStudyCard } from './CaseStudyCard';
import type { Asset } from '@/types';

interface CaseStudyGridProps {
  assets: Asset[];
}

export function CaseStudyGrid({ assets }: CaseStudyGridProps) {
  if (assets.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto mb-12"
    >
      <div className={`
        grid gap-6
        ${assets.length === 1 ? 'grid-cols-1' : ''}
        ${assets.length === 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
        ${assets.length >= 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}
      `}>
        {assets.map((asset, index) => (
          <CaseStudyCard 
            key={asset.id} 
            asset={asset} 
            index={index}
            size={assets.length === 1 ? 'large' : 'default'}
          />
        ))}
      </div>
    </motion.div>
  );
}
