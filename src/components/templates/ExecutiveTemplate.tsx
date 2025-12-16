'use client';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { Crown, ArrowRight, Quote, Briefcase, Award } from 'lucide-react';
import type { Asset } from '@/types';

interface ExecutiveTemplateProps {
  query: string;
  narrative: string;
  assets: Asset[];
}

export function ExecutiveTemplate({ query, narrative, assets }: ExecutiveTemplateProps) {
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      {/* Hero - Elegant Minimal */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Subtle background texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Refined badge */}
            <motion.div 
              className="flex items-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-px bg-amber-700" />
              <span className="text-amber-700 text-sm tracking-[0.2em] uppercase font-medium">
                Executive Messaging
              </span>
            </motion.div>

            {/* Elegant headline */}
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-light text-slate-900 leading-[1.1] mb-12 max-w-4xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {query}
            </motion.h1>

            {/* Subtle divider */}
            <motion.div 
              className="flex items-center gap-4 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-24 h-px bg-slate-300" />
              <Crown className="w-5 h-5 text-amber-600" />
              <div className="w-24 h-px bg-slate-300" />
            </motion.div>

            {/* Refined subtitle */}
            <motion.p 
              className="text-xl text-slate-600 max-w-2xl font-light leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Every word carries weight at the executive level. We craft communications 
              that command respect and inspire action.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Narrative - Elegant Quote */}
      <section className="py-32 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Quote className="w-12 h-12 text-amber-500 mx-auto mb-8" />
            
            <blockquote className="text-2xl md:text-3xl font-light leading-relaxed text-white/90 mb-10">
              {narrative}
            </blockquote>
            
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-amber-500/50" />
              <span className="text-amber-500 text-sm tracking-widest uppercase">Article Group</span>
              <div className="h-px w-12 bg-amber-500/50" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies - Refined Cards */}
      {caseStudies.length > 0 && (
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-12 bg-slate-300" />
                <Award className="w-5 h-5 text-amber-600" />
                <div className="h-px w-12 bg-slate-300" />
              </div>
              <h2 className="text-3xl md:text-4xl font-light text-slate-900">
                Distinguished Work
              </h2>
            </motion.div>

            <div className="space-y-6">
              {caseStudies.map((asset, i) => (
                <motion.a
                  key={asset.id}
                  href={`/asset/${asset.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group block"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-8 p-8 md:p-12 border border-slate-200 bg-white hover:border-amber-300 hover:shadow-lg transition-all duration-500">
                    {/* Client column */}
                    <div className="md:w-48 flex-shrink-0">
                      {asset.client && (
                        <span className="text-sm text-amber-700 tracking-wide uppercase font-medium">
                          {asset.client}
                        </span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-light text-slate-900 mb-3 group-hover:text-amber-800 transition-colors">
                        {asset.title}
                      </h3>
                      <p className="text-slate-500 line-clamp-2">
                        {asset.description || asset.content?.substring(0, 150) + '...'}
                      </p>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles - Minimal List */}
      {articles.length > 0 && (
        <section className="py-32 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-slate-300" />
                <span className="text-slate-500 text-sm tracking-widest uppercase">Perspectives</span>
              </div>
              <h2 className="text-2xl font-light text-slate-900">
                Selected Reading
              </h2>
            </motion.div>

            <div className="space-y-0">
              {articles.slice(0, 5).map((asset, i) => (
                <motion.a
                  key={asset.id}
                  href={`/asset/${asset.id}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center justify-between py-6 border-b border-slate-100 hover:border-amber-200 transition-colors"
                >
                  <h3 className="text-lg text-slate-700 group-hover:text-amber-800 transition-colors font-light">
                    {asset.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all" />
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA - Understated Elegance */}
      <section className="py-32 px-6 bg-slate-900">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Crown className="w-10 h-10 text-amber-500 mx-auto mb-8" />
          
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Elevate Your Message
          </h2>
          
          <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto font-light">
            When the stakes are highest, your communications deserve 
            the same precision as your strategy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white hover:bg-amber-500 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Schedule a Consultation
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              View Credentials
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
