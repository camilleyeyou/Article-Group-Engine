'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useState } from 'react';
import type { Asset } from '@/types';

interface HeroVideoProps {
  asset: Asset;
}

export function HeroVideo({ asset }: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const vimeoId = asset.vimeo_id;
  const thumbnailUrl = asset.thumbnail_url || '/placeholder-video.jpg';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-4xl mx-auto mb-12"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 aspect-video">
        {isPlaying && vimeoId ? (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {/* Thumbnail */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            
            {/* Play button */}
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group"
            >
              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                <Play className="w-8 h-8 text-slate-900 ml-1" fill="currentColor" />
              </div>
            </button>
            
            {/* Video info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl font-semibold text-white mb-1">
                {asset.title}
              </h3>
              {asset.client && (
                <p className="text-white/70 text-sm">
                  {asset.client}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
