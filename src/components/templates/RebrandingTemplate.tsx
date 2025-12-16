'use client';

import { motion } from 'framer-motion';
import { Palette, ArrowRight, Layers, Sparkles, Eye, RefreshCw } from 'lucide-react';
import type { Asset } from '@/types';

interface RebrandingTemplateProps {
  query: string;
  narrative: string;
  assets: Asset[];
}

export function RebrandingTemplate({ query, narrative, assets }: RebrandingTemplateProps) {
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero - Editorial Magazine Style */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-violet-600" />
          <div className="w-1/2 bg-fuchsia-500" />
        </div>
        
        <div className="absolute inset-0 mix-blend-overlay opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <div className="flex items-center gap-3 mb-8">
                <RefreshCw className="w-5 h-5" />
                <span className="text-sm tracking-[0.3em] uppercase font-medium">Rebranding</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8">
                Trans
                <span className="block text-white/40">form</span>
                <span className="block">ation</span>
              </h1>

              <div className="h-1 w-24 bg-white mb-8" />

              <p className="text-xl text-white/80 max-w-md leading-relaxed">{query}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square max-w-lg mx-auto relative">
                <motion.div 
                  className="absolute inset-0 border-2 border-white/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-8 border-2 border-white/30 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-16 border-2 border-white/40 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <Palette className="w-16 h-16 text-violet-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-sm tracking-widest uppercase mb-2">Scroll</div>
          <div className="w-px h-12 bg-white/50 mx-auto" />
        </motion.div>
      </section>

      {/* Narrative */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-3 gap-12 items-start"
          >
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <Sparkles className="w-10 h-10 text-violet-500 mb-6" />
                <p className="text-4xl font-black text-violet-600 leading-tight">
                  Before.<br/>After.<br/><span className="text-fuchsia-500">Beyond.</span>
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <p className="text-2xl md:text-3xl text-slate-700 leading-relaxed font-light">{narrative}</p>
              
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {['bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500'].map((color, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full ${color} border-2 border-white`} />
                  ))}
                </div>
                <span className="text-slate-500">Trusted by leading brands</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      {caseStudies.length > 0 && (
        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-16"
            >
              <div>
                <span className="text-violet-500 font-semibold tracking-wide uppercase mb-2 block">Transformations</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900">Brand Stories</h2>
              </div>
              <Eye className="w-12 h-12 text-slate-300" />
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {caseStudies.map((asset, i) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={i === 0 ? 'md:col-span-2' : ''}
                >
                  <a href={`/asset/${asset.id}`} className={`group relative block overflow-hidden rounded-3xl ${i === 0 ? 'aspect-[2/1]' : 'aspect-square'}`}>
                    <div className={`absolute inset-0 ${i % 2 === 0 ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600' : 'bg-gradient-to-br from-fuchsia-500 to-pink-500'}`} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white">
                      {asset.client && <span className="text-white/60 text-sm tracking-wide uppercase mb-2">{asset.client}</span>}
                      <h3 className="text-2xl md:text-4xl font-bold mb-4 group-hover:translate-x-2 transition-transform">{asset.title}</h3>
                      <div className="flex items-center gap-2 text-white/80">
                        <span>View case study</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
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
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
              <span className="text-fuchsia-500 font-semibold tracking-wide uppercase mb-2 block">The Edit</span>
              <h2 className="text-3xl font-black text-slate-900">Brand Thinking</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {articles.slice(0, 6).map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <a href={`/asset/${asset.id}`} className="group block">
                    <div className={`h-2 w-16 mb-4 ${i % 3 === 0 ? 'bg-violet-500' : i % 3 === 1 ? 'bg-fuchsia-500' : 'bg-pink-500'}`} />
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-violet-600 transition-colors">{asset.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-4">{asset.description || asset.content?.substring(0, 120) + '...'}</p>
                    <span className="text-violet-600 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-4 h-4" />
                    </span>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        
        <motion.div className="relative max-w-4xl mx-auto text-center text-white" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Layers className="w-16 h-16 mx-auto mb-8 opacity-80" />
          <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to transform?</h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">Your brand has a story to tell. Let&apos;s make sure the world sees it the way you do.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-600 rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all">
              Start your rebrand <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 rounded-full font-bold hover:bg-white/10 transition-colors">See our process</a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
