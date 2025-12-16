'use client';

import { motion } from 'framer-motion';
import { Presentation, Play, ArrowRight, Sparkles, Quote } from 'lucide-react';
import type { Asset } from '@/types';

interface KeynoteTemplateProps {
  query: string;
  narrative: string;
  assets: Asset[];
}

export function KeynoteTemplate({ query, narrative, assets }: KeynoteTemplateProps) {
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
              <Presentation className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium tracking-wide">KEYNOTE DEVELOPMENT</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.9] tracking-tight">
              <span className="block text-white/40 text-2xl md:text-3xl font-normal tracking-widest uppercase mb-4">Your Challenge</span>
              {query}
            </h1>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-500" />
              <Sparkles className="w-5 h-5 text-red-400" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-500" />
            </div>

            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">We craft keynotes that command attention and drive action</p>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-12 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Narrative */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/50 to-black" />
        
        <motion.div className="relative max-w-4xl mx-auto" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <Quote className="w-16 h-16 text-red-500/30 mb-8" />
          <blockquote className="text-2xl md:text-4xl font-light leading-relaxed text-white/90 mb-8">{narrative}</blockquote>
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/50 to-transparent" />
            <span className="text-red-400 text-sm tracking-widest uppercase">Article Group</span>
          </div>
        </motion.div>
      </section>

      {/* Case Studies */}
      {caseStudies.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
              <span className="text-red-400 text-sm tracking-widest uppercase mb-4 block">Featured Work</span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Keynotes that made<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"> history</span>
              </h2>
            </motion.div>

            <div className="grid gap-8">
              {caseStudies.map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <a href={`/asset/${asset.id}`} className="group relative block">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 p-8 md:p-12 hover:border-red-500/50 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                        <div className="flex-shrink-0 w-32 h-32 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center group-hover:border-red-500/50 transition-colors">
                          <Play className="w-10 h-10 text-red-400" />
                        </div>
                        <div className="flex-1">
                          {asset.client && <span className="text-red-400 text-sm tracking-wide uppercase mb-2 block">{asset.client}</span>}
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-red-100 transition-colors">{asset.title}</h3>
                          <p className="text-white/60 line-clamp-2">{asset.description || asset.content?.substring(0, 150) + '...'}</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-white/40 group-hover:text-red-400 group-hover:translate-x-2 transition-all" />
                      </div>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles */}
      {articles.length > 0 && (
        <section className="py-24 px-6 bg-zinc-900/50">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <span className="text-red-400 text-sm tracking-widest uppercase mb-4 block">From the Stage</span>
              <h2 className="text-3xl font-bold">Related Thinking</h2>
            </motion.div>

            <div className="space-y-1">
              {articles.slice(0, 5).map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <a href={`/asset/${asset.id}`} className="group flex items-center justify-between py-6 border-b border-white/10 hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-6">
                      <span className="text-white/20 text-sm font-mono">0{i + 1}</span>
                      <h3 className="text-lg font-medium text-white/80 group-hover:text-white transition-colors">{asset.title}</h3>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[150px]" />
        </div>
        
        <motion.div className="relative max-w-3xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to own<span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">the stage?</span>
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-xl mx-auto">Let&apos;s craft a keynote that your audience will never forget.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all">
              Start a conversation <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 rounded-full font-semibold hover:bg-white/5 transition-colors">See more work</a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
