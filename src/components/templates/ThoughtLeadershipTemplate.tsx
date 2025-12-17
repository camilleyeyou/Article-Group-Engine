'use client';

import { motion } from 'framer-motion';
import { Feather, ArrowRight, Quote, BookOpen, Lightbulb, Mic, PenTool, ChevronRight } from 'lucide-react';
import type { Asset } from '@/types';

interface ThoughtLeadershipTemplateProps {
  query: string;
  narrative: string;
  assets: Asset[];
}

export function ThoughtLeadershipTemplate({ query, narrative, assets }: ThoughtLeadershipTemplateProps) {
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  return (
    <div className="bg-[#fffdf9] min-h-screen">
      {/* Hero - Editorial Style */}
      <section className="relative min-h-[80vh] flex items-center">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {/* Editorial masthead */}
            <div className="border-b-2 border-slate-900 pb-6 mb-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Feather className="w-6 h-6 text-amber-600" />
                  <span className="text-sm tracking-[0.3em] uppercase text-slate-500">Thought Leadership</span>
                </div>
                <span className="text-sm text-slate-400">Article Group Perspectives</span>
              </div>
            </div>

            {/* Headline - Newspaper style */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-slate-900 leading-[1.1] mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {query}
            </motion.h1>

            {/* Byline */}
            <motion.div 
              className="flex items-center gap-4 text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-slate-900 font-medium">Article Group Editorial</div>
                <div className="text-sm">Ideas that shape industries</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Lead Quote - Magazine Pull Quote */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <Quote className="w-16 h-16 text-amber-500 mx-auto mb-8 opacity-50" />
            <blockquote className="text-2xl md:text-4xl font-serif leading-relaxed text-white/90 mb-8 italic">
              &ldquo;{narrative}&rdquo;
            </blockquote>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Featured Perspectives - Editorial Grid */}
      {caseStudies.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
              <div className="flex items-center gap-2 text-amber-600 mb-4">
                <Lightbulb className="w-5 h-5" />
                <span className="text-sm tracking-widest uppercase font-medium">Featured Perspectives</span>
              </div>
              <h2 className="text-4xl font-serif font-bold text-slate-900">Ideas in Action</h2>
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
                  <a href={`/asset/${asset.id}`} className="group block">
                    <article className={`bg-white border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 ${i === 0 ? 'p-10' : 'p-6'}`}>
                      {asset.client && (
                        <span className="text-amber-600 text-sm font-medium tracking-wide uppercase">{asset.client}</span>
                      )}
                      <h3 className={`font-serif font-bold text-slate-900 mt-2 group-hover:text-amber-700 transition-colors ${i === 0 ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
                        {asset.title}
                      </h3>
                      <p className={`text-slate-500 mt-4 ${i === 0 ? 'text-lg line-clamp-3' : 'line-clamp-2'}`}>
                        {asset.description || asset.content?.substring(0, 200) + '...'}
                      </p>
                      <div className="flex items-center gap-2 mt-6 text-amber-600 font-medium">
                        <span>Read the full story</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </article>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles - Magazine List */}
      {articles.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border-b-2 border-slate-900 pb-4 mb-12">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-slate-900">The Reading List</h2>
                <BookOpen className="w-5 h-5 text-slate-400" />
              </div>
            </motion.div>

            <div className="divide-y divide-slate-200">
              {articles.slice(0, 6).map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <a href={`/asset/${asset.id}`} className="group flex items-start gap-6 py-6 hover:bg-amber-50/50 -mx-4 px-4 transition-colors">
                    <span className="text-4xl font-serif text-slate-300 font-bold">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{asset.title}</h3>
                      <p className="text-slate-500 mt-2 line-clamp-2">{asset.description || asset.content?.substring(0, 120) + '...'}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-amber-500 flex-shrink-0 mt-1" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Speaking & Events */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-amber-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Mic className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-bold text-slate-900">Share Your Voice</h2>
            <p className="text-slate-500 mt-2">Let&apos;s craft your thought leadership platform</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {[
              { title: 'Bylines & Articles', desc: 'Published perspectives', icon: PenTool },
              { title: 'Speaking Engagements', desc: 'Conference presence', icon: Mic },
              { title: 'Industry Reports', desc: 'Original research', icon: BookOpen },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 border border-slate-200 text-center">
                <item.icon className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA - Elegant */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Feather className="w-12 h-12 text-amber-500 mx-auto mb-8" />
          <h2 className="text-4xl font-serif font-bold mb-6">Ready to lead the conversation?</h2>
          <p className="text-xl text-white/70 mb-10 max-w-xl mx-auto">Your expertise deserves a platform. Let&apos;s build your thought leadership presence.</p>
          <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 transition-colors">
            Start Your Platform
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
