'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Briefcase, Target, Sparkles, Zap } from 'lucide-react';
import type { Asset, Template } from '@/types';

interface DefaultTemplateProps {
  template: Template;
  query: string;
  narrative: string;
  assets: Asset[];
}

const THEME_COLORS: Record<string, { gradient: string; accent: string; light: string; dark: string }> = {
  'gtm-strategy': { gradient: 'from-indigo-600 via-blue-600 to-cyan-500', accent: 'text-indigo-500', light: 'bg-indigo-50', dark: 'bg-indigo-900' },
  'sales-enablement': { gradient: 'from-orange-500 via-amber-500 to-yellow-500', accent: 'text-orange-500', light: 'bg-orange-50', dark: 'bg-orange-900' },
  'internal-communications': { gradient: 'from-cyan-500 via-teal-500 to-emerald-500', accent: 'text-cyan-500', light: 'bg-cyan-50', dark: 'bg-cyan-900' },
  'technical-translation': { gradient: 'from-emerald-500 via-teal-500 to-cyan-500', accent: 'text-emerald-500', light: 'bg-emerald-50', dark: 'bg-emerald-900' },
  'narrative-framework': { gradient: 'from-violet-600 via-purple-600 to-fuchsia-500', accent: 'text-violet-500', light: 'bg-violet-50', dark: 'bg-violet-900' },
  'employer-branding': { gradient: 'from-pink-500 via-rose-500 to-red-500', accent: 'text-pink-500', light: 'bg-pink-50', dark: 'bg-pink-900' },
  'partner-marketing': { gradient: 'from-sky-500 via-blue-500 to-indigo-500', accent: 'text-sky-500', light: 'bg-sky-50', dark: 'bg-sky-900' },
  'thought-leadership': { gradient: 'from-amber-500 via-orange-500 to-red-500', accent: 'text-amber-500', light: 'bg-amber-50', dark: 'bg-amber-900' },
  'crisis-communications': { gradient: 'from-red-600 via-rose-600 to-pink-500', accent: 'text-red-500', light: 'bg-red-50', dark: 'bg-red-900' },
  'ma-communications': { gradient: 'from-slate-600 via-gray-600 to-zinc-600', accent: 'text-slate-500', light: 'bg-slate-50', dark: 'bg-slate-800' },
  'customer-marketing': { gradient: 'from-green-500 via-emerald-500 to-teal-500', accent: 'text-green-500', light: 'bg-green-50', dark: 'bg-green-900' },
  'general': { gradient: 'from-slate-700 via-slate-600 to-slate-500', accent: 'text-blue-500', light: 'bg-slate-50', dark: 'bg-slate-900' },
};

export function DefaultTemplate({ template, query, narrative, assets }: DefaultTemplateProps) {
  const theme = THEME_COLORS[template.slug] || THEME_COLORS['general'];
  
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero - Dynamic Gradient */}
      <section className={`relative min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-black/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], y: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Template badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Target className="w-5 h-5" />
              <span className="font-semibold tracking-wide">{template.name}</span>
            </motion.div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight max-w-5xl mx-auto">
              {query}
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12">
              {template.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              {caseStudies.length > 0 && (
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Briefcase className="w-5 h-5" />
                  <span>{caseStudies.length} Case {caseStudies.length === 1 ? 'Study' : 'Studies'}</span>
                </motion.div>
              )}
              {articles.length > 0 && (
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>{articles.length} Articles</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className={`absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.gradient} rounded-full`} />
            
            <div className="pl-8">
              <Zap className={`w-8 h-8 ${theme.accent} mb-4`} />
              <p className="text-2xl md:text-3xl text-slate-700 leading-relaxed font-light">
                {narrative}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      {caseStudies.length > 0 && (
        <section className={`py-20 px-6 ${theme.light}`}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-12"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Relevant Work</h2>
                <p className="text-slate-600">Case studies demonstrating our expertise</p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {caseStudies.map((asset, i) => (
                <motion.a
                  key={asset.id}
                  href={`/asset/${asset.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group block bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    {asset.client && (
                      <span className={`text-sm font-semibold ${theme.accent}`}>
                        {asset.client}
                      </span>
                    )}
                    <Sparkles className={`w-5 h-5 ${theme.accent} opacity-50`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                    {asset.title}
                  </h3>
                  
                  <p className="text-slate-500 line-clamp-2 mb-4">
                    {asset.description || asset.content?.substring(0, 120) + '...'}
                  </p>
                  
                  <div className={`flex items-center gap-2 ${theme.accent} font-medium text-sm`}>
                    View case study
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles */}
      {articles.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-12"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Related Thinking</h2>
                <p className="text-slate-600">Ideas and frameworks from our team</p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 6).map((asset, i) => (
                <motion.a
                  key={asset.id}
                  href={`/asset/${asset.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group block p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 bg-white"
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.gradient} mb-4`} />
                  
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-slate-700 line-clamp-2">
                    {asset.title}
                  </h3>
                  
                  <div className={`flex items-center gap-1 ${theme.accent} text-sm`}>
                    Read
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className={`py-24 px-6 bg-gradient-to-br ${theme.gradient}`}>
        <motion.div 
          className="max-w-3xl mx-auto text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Let&apos;s talk about how we can help with your challenge.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all"
          >
            Start a conversation
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
