'use client';

import { motion } from 'framer-motion';
import { Cpu, ArrowRight, Zap, CircuitBoard, Binary, Layers, Settings, ChevronRight } from 'lucide-react';
import type { Asset } from '@/types';

interface HardTechTemplateProps {
  query: string;
  narrative: string;
  assets: Asset[];
}

export function HardTechTemplate({ query, narrative, assets }: HardTechTemplateProps) {
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Hero - Blueprint Style */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Blueprint grid */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Circuit pattern overlay */}
        <div className="absolute inset-0">
          <svg className="absolute top-20 left-10 w-64 h-64 text-cyan-500/10" viewBox="0 0 100 100">
            <path d="M10 50 H40 V20 H60 V50 H90" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="40" cy="50" r="3" fill="currentColor" />
            <circle cx="60" cy="20" r="3" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-20 right-10 w-64 h-64 text-cyan-500/10" viewBox="0 0 100 100">
            <path d="M10 30 H30 V70 H70 V30 H90" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="30" cy="70" r="3" fill="currentColor" />
            <circle cx="70" cy="30" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded border border-cyan-500/30 bg-cyan-500/10 mb-8">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-mono tracking-wider">HARD_TECH_LAUNCH</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="text-cyan-400 font-mono text-xl block mb-4">{`// INITIATIVE`}</span>
              {query}
            </h1>

            {/* Tech specs style info */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mb-12">
              {[
                { label: 'CASE_STUDIES', value: caseStudies.length },
                { label: 'ARTICLES', value: articles.length },
                { label: 'TOTAL_ASSETS', value: assets.length },
              ].map((spec) => (
                <div key={spec.label} className="border border-slate-700 p-3">
                  <div className="text-cyan-400 font-mono text-xs mb-1">{spec.label}</div>
                  <div className="text-2xl font-bold">{spec.value}</div>
                </div>
              ))}
            </div>

            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
              Engineering precision meets market strategy. We launch complex technology with clarity.
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border border-cyan-500/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-cyan-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Narrative - Technical Documentation Style */}
      <section className="py-24 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500 rounded" />
              <div>
                <div className="text-cyan-400 font-mono text-sm mb-4">{`/** @overview */`}</div>
                <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">{narrative}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies - Technical Cards */}
      {caseStudies.length > 0 && (
        <section className="py-24 px-6 bg-slate-900/50">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <CircuitBoard className="w-6 h-6 text-cyan-400" />
                <span className="text-cyan-400 font-mono text-sm">CASE_STUDIES[]</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Technical Implementations</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {caseStudies.map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <a href={`/asset/${asset.id}`} className="group block border border-slate-700 bg-slate-900/50 p-6 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <Binary className="w-8 h-8 text-cyan-500/50" />
                      <span className="text-slate-500 font-mono text-xs">v{i + 1}.0</span>
                    </div>
                    {asset.client && <div className="text-cyan-400 font-mono text-xs mb-2">{`// ${asset.client}`}</div>}
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-100 transition-colors">{asset.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">{asset.description || asset.content?.substring(0, 120) + '...'}</p>
                    <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono">
                      <span>READ_MORE</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="w-6 h-6 text-cyan-400" />
                <span className="text-cyan-400 font-mono text-sm">DOCUMENTATION[]</span>
              </div>
              <h2 className="text-2xl font-bold">Technical Resources</h2>
            </motion.div>

            <div className="space-y-2">
              {articles.slice(0, 6).map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <a href={`/asset/${asset.id}`} className="group flex items-center justify-between py-4 px-4 border-l-2 border-slate-700 hover:border-cyan-500 hover:bg-slate-900/50 transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
                      <h3 className="text-slate-300 group-hover:text-white transition-colors">{asset.title}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-6 border-t border-slate-800">
        <motion.div className="max-w-4xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Settings className="w-12 h-12 text-cyan-400 mx-auto mb-6 animate-spin-slow" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-cyan-400 font-mono text-lg block mb-2">{`// INITIALIZE`}</span>
            Ready to engineer your launch?
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">Complex technology deserves precise positioning. Let&apos;s build your go-to-market strategy.</p>
          <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors">
            <Zap className="w-5 h-5" />
            START_PROJECT
          </a>
        </motion.div>
      </section>
    </div>
  );
}
