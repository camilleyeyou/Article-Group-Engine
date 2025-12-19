'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowRight, Star, Sparkles, Camera, Music, Coffee } from 'lucide-react';
import type { Asset } from '@/types';

interface ConsumerTemplateProps {
  query: string;
  narrative: string;
  assets: Asset[];
}

export function ConsumerTemplate({ query, narrative, assets }: ConsumerTemplateProps) {
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  const emojis = ['✨', '🚀', '💫', '🎯', '⭐', '💡'];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero - Playful & Colorful */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Colorful gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500" />
        
        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 left-[10%] w-20 h-20 bg-yellow-300 rounded-full"
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-40 right-[15%] w-16 h-16 bg-green-300 rounded-2xl"
            animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-32 left-[20%] w-24 h-24 bg-blue-300 rounded-3xl"
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-40 right-[25%] w-14 h-14 bg-orange-300 rounded-full"
            animate={{ y: [0, 25, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Fun badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm mb-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Consumer Launch</span>
              <span className="text-xl">🎉</span>
            </motion.div>

            {/* Headline with emoji */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              {query} <span className="inline-block animate-bounce">✨</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-10">
              Creating moments that matter. Products people actually love. 💕
            </p>

            {/* Fun stats */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {caseStudies.length > 0 && (
                <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="font-bold">{caseStudies.length}</span> Success Stories 🏆
                </div>
              )}
              {articles.length > 0 && (
                <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="font-bold">{articles.length}</span> Fresh Ideas 💡
                </div>
              )}
            </div>

            <motion.a 
              href="#work" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-fuchsia-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
              whileHover={{ rotate: [0, -2, 2, 0] }}
            >
              See the magic <ArrowRight className="w-5 h-5" />
            </motion.a>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 60C240 120 480 120 720 60C960 0 1200 0 1440 60V120H0V60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Narrative - Friendly Style */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="flex justify-center gap-2 mb-6">
              {emojis.map((emoji, i) => (
                <motion.span 
                  key={i} 
                  className="text-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            <p className="text-2xl md:text-3xl text-slate-700 leading-relaxed">{narrative}</p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies - Card Carousel Style */}
      {caseStudies.length > 0 && (
        <section id="work" className="py-20 px-6 bg-gradient-to-b from-white to-rose-50">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-4xl mb-4 block">🌟</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                Brands We&apos;ve <span className="text-fuchsia-500">Launched</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((asset, i) => (
                <motion.div 
                  key={asset.id} 
                  initial={{ opacity: 0, y: 30, rotate: -2 }} 
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.1 }}
                >
                  <a href={`/asset/${asset.id}`} className="group block">
                    <div className={`relative rounded-3xl p-8 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl ${
                      i % 3 === 0 ? 'bg-gradient-to-br from-rose-400 to-pink-500' :
                      i % 3 === 1 ? 'bg-gradient-to-br from-violet-400 to-purple-500' :
                      'bg-gradient-to-br from-blue-400 to-indigo-500'
                    } text-white`}>
                      <div className="text-4xl mb-4">
                        {i % 3 === 0 ? '💖' : i % 3 === 1 ? '🚀' : '⚡'}
                      </div>
                      {asset.client && <span className="text-white/80 text-sm font-medium block mb-2">{asset.client}</span>}
                      <h3 className="text-xl font-bold mb-3">{asset.title}</h3>
                      <div className="flex items-center gap-2 text-white/90">
                        <span>Read story</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles - Magazine Style */}
      {articles.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-4xl mb-4 block">📚</span>
              <h2 className="text-3xl font-black text-slate-900">Fresh Takes & Hot Ideas</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {articles.slice(0, 6).map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <a href={`/asset/${asset.id}`} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-rose-50 transition-colors">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      i % 4 === 0 ? 'bg-rose-100 text-rose-500' :
                      i % 4 === 1 ? 'bg-violet-100 text-violet-500' :
                      i % 4 === 2 ? 'bg-blue-100 text-blue-500' :
                      'bg-amber-100 text-amber-500'
                    }`}>
                      {i % 4 === 0 ? <Heart className="w-6 h-6" /> :
                       i % 4 === 1 ? <Camera className="w-6 h-6" /> :
                       i % 4 === 2 ? <Music className="w-6 h-6" /> :
                       <Coffee className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-fuchsia-600 transition-colors">{asset.title}</h3>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{asset.description || asset.content?.substring(0, 80) + '...'}</p>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA - Fun & Inviting */}
      <section className="py-24 px-6 bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-400">
        <motion.div className="max-w-3xl mx-auto text-center text-white" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <motion.div 
            className="text-6xl mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎯
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to make some noise?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-xl mx-auto">Let&apos;s create something people will actually want to share, use, and love.</p>
          <a href="#" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-fuchsia-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all">
            <Star className="w-6 h-6" />
            Let&apos;s Do This!
          </a>
        </motion.div>
      </section>
    </div>
  );
}
