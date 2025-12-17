'use client';

import { motion } from 'framer-motion';
import { Shield, ArrowRight, AlertTriangle, Clock, CheckCircle, FileText, Phone, Users, ChevronRight } from 'lucide-react';
import type { Asset } from '@/types';

interface CrisisTemplateProps {
  query: string;
  narrative: string;
  assets: Asset[];
}

export function CrisisTemplate({ query, narrative, assets }: CrisisTemplateProps) {
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Hero - Urgent & Clear */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Alert pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-red-950/50 to-slate-950" />
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1 bg-red-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1 }}
          />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Alert badge */}
            <motion.div 
              className="inline-flex items-center gap-3 px-5 py-3 rounded bg-red-500/20 border border-red-500/30 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-bold tracking-wider text-sm">CRISIS COMMUNICATIONS</span>
            </motion.div>

            {/* Headline - Direct and Clear */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              {query}
            </h1>

            {/* Key message */}
            <p className="text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
              When every word matters. Swift, strategic communications that protect reputation and rebuild trust.
            </p>

            {/* Response time indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-sm">24/7 Response Team</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm">Proven Framework</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Immediate Action Plan</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Strategic Approach - Clear Framework */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded bg-red-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <div className="text-red-400 font-bold text-sm uppercase tracking-wider">Strategic Response</div>
                <div className="text-slate-500 text-sm">Clear. Swift. Effective.</div>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">{narrative}</p>
          </motion.div>
        </div>
      </section>

      {/* Response Framework */}
      <section className="py-16 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <h2 className="text-2xl font-bold text-center">Our Crisis Response Framework</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Assess', desc: 'Rapid situation analysis', icon: AlertTriangle, color: 'text-red-400' },
              { step: '02', title: 'Strategize', desc: 'Response planning', icon: FileText, color: 'text-amber-400' },
              { step: '03', title: 'Communicate', desc: 'Stakeholder messaging', icon: Users, color: 'text-blue-400' },
              { step: '04', title: 'Recover', desc: 'Reputation rebuilding', icon: Shield, color: 'text-green-400' },
            ].map((phase, i) => (
              <motion.div 
                key={phase.step} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800 border border-slate-700 p-6 text-center"
              >
                <span className={`text-3xl font-bold ${phase.color}`}>{phase.step}</span>
                <phase.icon className={`w-8 h-8 ${phase.color} mx-auto my-4`} />
                <h3 className="font-bold text-white mb-2">{phase.title}</h3>
                <p className="text-slate-400 text-sm">{phase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies - Crisis Handled */}
      {caseStudies.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-green-400 font-bold text-sm uppercase tracking-wider">Crisis Resolved</span>
              </div>
              <h2 className="text-3xl font-bold">When It Mattered Most</h2>
            </motion.div>

            <div className="space-y-4">
              {caseStudies.map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <a href={`/asset/${asset.id}`} className="group block bg-slate-900 border border-slate-800 p-6 hover:border-red-500/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded bg-slate-800 flex items-center justify-center">
                          <Shield className="w-8 h-8 text-slate-600 group-hover:text-red-400 transition-colors" />
                        </div>
                      </div>
                      <div className="flex-1">
                        {asset.client && <span className="text-red-400 text-sm font-medium">{asset.client}</span>}
                        <h3 className="text-xl font-bold text-white mt-1 group-hover:text-red-100 transition-colors">{asset.title}</h3>
                        <p className="text-slate-400 mt-2 line-clamp-2">{asset.description || asset.content?.substring(0, 120) + '...'}</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles - Resources */}
      {articles.length > 0 && (
        <section className="py-20 px-6 bg-slate-900">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <h2 className="text-2xl font-bold">Crisis Preparedness Resources</h2>
              <p className="text-slate-400 mt-2">Essential reading for your team</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
              {articles.slice(0, 6).map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <a href={`/asset/${asset.id}`} className="group flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 transition-colors">
                    <FileText className="w-5 h-5 text-slate-500 group-hover:text-red-400 flex-shrink-0" />
                    <span className="text-slate-300 group-hover:text-white transition-colors flex-1 line-clamp-1">{asset.title}</span>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-red-400" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Emergency CTA */}
      <section className="py-20 px-6 border-t border-slate-800">
        <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bg-gradient-to-r from-red-950 to-slate-900 border border-red-900/50 p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-6 h-6 text-red-400" />
                  <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Immediate Response</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Facing a crisis right now?</h2>
                <p className="text-slate-400">Our team is standing by. Reach out immediately for rapid response support.</p>
              </div>
              <div className="flex flex-col gap-4">
                <a href="#" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-500 text-white font-bold hover:bg-red-400 transition-colors">
                  <Phone className="w-5 h-5" />
                  Get Emergency Support
                </a>
                <a href="#" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
                  Download Crisis Checklist
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
