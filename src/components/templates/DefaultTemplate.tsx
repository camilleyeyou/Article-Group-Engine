'use client';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Briefcase, Target } from 'lucide-react';
import type { Asset, Template } from '@/types';

interface DefaultTemplateProps {
  template: Template;
  query: string;
  narrative: string;
  assets: Asset[];
}

// Color themes based on template category
const THEME_COLORS: Record<string, { gradient: string; accent: string; light: string }> = {
  'gtm-strategy': { gradient: 'from-indigo-600 to-blue-700', accent: 'text-indigo-500', light: 'bg-indigo-50' },
  'sales-enablement': { gradient: 'from-orange-500 to-amber-600', accent: 'text-orange-500', light: 'bg-orange-50' },
  'internal-communications': { gradient: 'from-cyan-600 to-teal-700', accent: 'text-cyan-500', light: 'bg-cyan-50' },
  'technical-translation': { gradient: 'from-emerald-600 to-teal-700', accent: 'text-emerald-500', light: 'bg-emerald-50' },
  'narrative-framework': { gradient: 'from-violet-600 to-purple-700', accent: 'text-violet-500', light: 'bg-violet-50' },
  'employer-branding': { gradient: 'from-pink-500 to-rose-600', accent: 'text-pink-500', light: 'bg-pink-50' },
  'partner-marketing': { gradient: 'from-sky-600 to-blue-700', accent: 'text-sky-500', light: 'bg-sky-50' },
  'thought-leadership': { gradient: 'from-amber-500 to-orange-600', accent: 'text-amber-500', light: 'bg-amber-50' },
  'crisis-communications': { gradient: 'from-red-600 to-rose-700', accent: 'text-red-500', light: 'bg-red-50' },
  'ma-communications': { gradient: 'from-slate-700 to-zinc-800', accent: 'text-slate-500', light: 'bg-slate-50' },
  'customer-marketing': { gradient: 'from-green-600 to-emerald-700', accent: 'text-green-500', light: 'bg-green-50' },
  'general': { gradient: 'from-slate-600 to-slate-800', accent: 'text-slate-500', light: 'bg-slate-50' },
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
      {/* Hero */}
      <section className={`relative min-h-[70vh] flex items-center bg-gradient-to-br ${theme.gradient} text-white overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">{template.name}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight max-w-4xl mx-auto">
              {query}
            </h1>

            {/* Description */}
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {template.description}
            </p>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Narrative */}
      <section className="py-20 px-6">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={`border-l-4 ${theme.accent.replace('text-', 'border-')} pl-8`}>
            <p className="text-2xl md:text-3xl text-slate-700 leading-relaxed font-light">
              {narrative}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Case Studies */}
      {caseStudies.length > 0 && (
        <section className={`py-20 px-6 ${theme.light}`}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-12"
            >
              <Briefcase className={`w-6 h-6 ${theme.accent}`} />
              <h2 className="text-2xl font-bold text-slate-900">Relevant Work</h2>
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
                  className="group block bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all"
                >
                  {asset.client && (
                    <span className={`text-sm font-medium ${theme.accent} mb-2 block`}>
                      {asset.client}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700">
                    {asset.title}
                  </h3>
                  <p className="text-slate-500 line-clamp-2 mb-4">
                    {asset.description || asset.content?.substring(0, 120) + '...'}
                  </p>
                  <div className={`flex items-center gap-1 ${theme.accent} text-sm font-medium`}>
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
              className="flex items-center gap-3 mb-12"
            >
              <BookOpen className={`w-6 h-6 ${theme.accent}`} />
              <h2 className="text-2xl font-bold text-slate-900">Related Thinking</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {articles.slice(0, 6).map((asset, i) => (
                <motion.a
                  key={asset.id}
                  href={`/asset/${asset.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group block p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                >
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
      <section className={`py-20 px-6 bg-gradient-to-br ${theme.gradient} text-white`}>
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Let&apos;s talk about how we can help with your challenge.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:shadow-xl transition-all"
          >
            Start a conversation
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
