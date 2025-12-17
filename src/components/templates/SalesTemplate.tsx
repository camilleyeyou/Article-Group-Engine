'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, DollarSign, Target, BarChart3, PieChart, Users, Award, ChevronRight } from 'lucide-react';
import type { Asset } from '@/types';

interface SalesTemplateProps {
  query: string;
  narrative: string;
  assets: Asset[];
}

export function SalesTemplate({ query, narrative, assets }: SalesTemplateProps) {
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero - Results Focused */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 overflow-hidden">
        {/* Chart pattern background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 80 Q25 60 50 70 T100 50 V100 H0Z" fill="white" />
            <path d="M0 90 Q30 70 60 80 T100 65 V100 H0Z" fill="white" opacity="0.5" />
          </svg>
        </div>

        {/* Floating metrics */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-20 right-20 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              <span className="font-bold">+127% Pipeline</span>
            </div>
          </motion.div>
          <motion.div 
            className="absolute bottom-40 left-20 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-2 text-white">
              <DollarSign className="w-5 h-5" />
              <span className="font-bold">42% Win Rate ↑</span>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white mb-8">
              <BarChart3 className="w-5 h-5" />
              <span className="font-bold">SALES ENABLEMENT</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight max-w-4xl">
              {query}
            </h1>

            <p className="text-xl text-white/90 max-w-2xl mb-10">
              Arm your sales team with the tools, content, and confidence to close more deals faster.
            </p>

            {/* Key metrics preview */}
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white text-center">
                <div className="text-3xl font-black">3x</div>
                <div className="text-sm opacity-80">Faster Close</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white text-center">
                <div className="text-3xl font-black">85%</div>
                <div className="text-sm opacity-80">Rep Adoption</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white text-center">
                <div className="text-3xl font-black">$2M+</div>
                <div className="text-sm opacity-80">Pipeline</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" className="w-full">
            <path d="M0 100L1440 100V50C1200 80 960 20 720 50C480 80 240 20 0 50V100Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Narrative - Bold Statement */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-orange-500 font-bold text-sm uppercase tracking-wider">The Strategy</div>
                <div className="text-slate-400 text-sm">Winning approach</div>
              </div>
            </div>
            <p className="text-2xl md:text-3xl text-slate-800 leading-relaxed font-medium">{narrative}</p>
          </motion.div>
        </div>
      </section>

      {/* Results Bar */}
      <section className="py-12 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: TrendingUp, value: '127%', label: 'Pipeline Growth', color: 'text-green-400' },
              { icon: Users, value: '500+', label: 'Reps Enabled', color: 'text-blue-400' },
              { icon: Award, value: '94%', label: 'Satisfaction', color: 'text-amber-400' },
              { icon: DollarSign, value: '$50M', label: 'Deals Influenced', color: 'text-emerald-400' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies - Results Cards */}
      {caseStudies.length > 0 && (
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <PieChart className="w-6 h-6 text-orange-500" />
                <span className="text-orange-500 font-bold uppercase tracking-wider text-sm">Proven Results</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900">Success Stories That Sell</h2>
            </motion.div>

            <div className="space-y-6">
              {caseStudies.map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <a href={`/asset/${asset.id}`} className="group block bg-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-xl hover:border-orange-200 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <TrendingUp className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        {asset.client && <span className="text-orange-500 font-bold text-sm">{asset.client}</span>}
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-1 group-hover:text-orange-600 transition-colors">{asset.title}</h3>
                        <p className="text-slate-500 mt-2 line-clamp-2">{asset.description || asset.content?.substring(0, 120) + '...'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-orange-500 font-bold">
                        <span>View Results</span>
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

      {/* Articles - Quick Access */}
      {articles.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900">Sales Playbooks & Resources</h2>
              <p className="text-slate-500 mt-2">Battle-tested strategies for your team</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.slice(0, 6).map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <a href={`/asset/${asset.id}`} className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate group-hover:text-orange-600">{asset.title}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA - Conversion Focused */}
      <section className="py-24 px-6 bg-gradient-to-br from-orange-500 to-amber-500">
        <motion.div className="max-w-4xl mx-auto text-center text-white" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <DollarSign className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to accelerate revenue?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">Your sales team deserves better tools. Let&apos;s build content that converts.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all">
              <Target className="w-5 h-5" />
              Get a Custom Playbook
            </a>
            <a href="#" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/50 rounded-full font-bold hover:bg-white/10 transition-colors">
              See Pricing
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
