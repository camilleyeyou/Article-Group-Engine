'use client';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { Terminal, Code2, GitBranch, ArrowRight, Cpu, Blocks, ChevronRight } from 'lucide-react';
import type { Asset } from '@/types';

interface DevRelTemplateProps {
  query: string;
  narrative: string;
  assets: Asset[];
}

export function DevRelTemplate({ query, narrative, assets }: DevRelTemplateProps) {
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  return (
    <div className="bg-[#0d1117] text-white min-h-screen font-mono">
      {/* Hero - Terminal Style */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Code rain effect */}
        <div className="absolute inset-0 opacity-[0.03]">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-green-500 text-xs whitespace-nowrap"
              style={{
                left: `${i * 5}%`,
                top: `${Math.random() * 100}%`,
                animation: `fall ${10 + Math.random() * 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              {'{code: true}'}
            </div>
          ))}
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Terminal window */}
            <div className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden shadow-2xl">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#21262d] border-b border-[#30363d]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
                </div>
                <span className="text-xs text-gray-500 ml-4">article-group — zsh — 80×24</span>
              </div>
              
              {/* Terminal content */}
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400">→</span>
                  <span className="text-gray-400">article-group</span>
                  <span className="text-cyan-400">query</span>
                  <span className="text-gray-500">--type=devrel</span>
                </div>
                
                <div className="pl-6">
                  <motion.p 
                    className="text-2xl md:text-4xl font-bold text-white leading-tight"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {query}
                  </motion.p>
                </div>

                <motion.div 
                  className="flex items-center gap-2 text-emerald-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <span>✓</span>
                  <span>Query processed. Results below.</span>
                </motion.div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Case Studies', value: caseStudies.length, icon: Blocks },
                { label: 'Articles', value: articles.length, icon: Code2 },
                { label: 'Total Assets', value: assets.length, icon: GitBranch },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="bg-[#161b22] border border-[#30363d] rounded-lg p-4"
                >
                  <stat.icon className="w-5 h-5 text-emerald-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Narrative - Code Comment Style */}
      <section className="py-20 px-6 border-t border-[#30363d]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-emerald-500 text-lg">/**</div>
              <div>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-sans">
                  {narrative}
                </p>
                <div className="text-emerald-500 mt-4">*/</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies - Card Grid */}
      {caseStudies.length > 0 && (
        <section className="py-20 px-6 bg-[#161b22]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-12"
            >
              <Terminal className="w-6 h-6 text-emerald-400" />
              <h2 className="text-2xl font-bold">
                <span className="text-emerald-400">const</span>{' '}
                <span className="text-white">caseStudies</span>{' '}
                <span className="text-gray-500">=</span>{' '}
                <span className="text-cyan-400">[</span>
              </h2>
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
                  className="group block bg-[#0d1117] border border-[#30363d] rounded-lg p-6 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-emerald-400" />
                      {asset.client && (
                        <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">
                          {asset.client}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 font-sans group-hover:text-emerald-100">
                    {asset.title}
                  </h3>
                  
                  <p className="text-sm text-gray-400 line-clamp-3 font-sans">
                    {asset.description || asset.content?.substring(0, 150) + '...'}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-[#30363d]">
                    <code className="text-xs text-gray-500">
                      id: &quot;{asset.id.substring(0, 8)}...&quot;
                    </code>
                  </div>
                </motion.a>
              ))}
            </div>

            <div className="text-cyan-400 text-2xl mt-8">];</div>
          </div>
        </section>
      )}

      {/* Articles - List */}
      {articles.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <code className="text-emerald-400">// Related reading</code>
            </motion.div>

            <div className="space-y-3">
              {articles.slice(0, 6).map((asset, i) => (
                <motion.a
                  key={asset.id}
                  href={`/asset/${asset.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center gap-4 p-4 rounded-lg hover:bg-[#161b22] transition-colors"
                >
                  <Code2 className="w-5 h-5 text-gray-600 group-hover:text-emerald-400" />
                  <span className="text-gray-300 group-hover:text-white font-sans flex-1">
                    {asset.title}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all" />
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-6 border-t border-[#30363d]">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-block bg-[#161b22] border border-[#30363d] rounded-lg p-8 md:p-12">
            <code className="text-gray-500 text-sm block mb-4">
              // Ready to build something?
            </code>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-sans">
              Let&apos;s ship it together
            </h2>
            
            <p className="text-gray-400 mb-8 font-sans">
              We speak developer. Let&apos;s create documentation, content, and experiences that resonate.
            </p>
            
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors"
            >
              <Terminal className="w-5 h-5" />
              Initialize project
            </a>
          </div>
        </motion.div>
      </section>

      <style jsx global>{`
        @keyframes fall {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}
