'use client';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { Rocket, Zap, ArrowRight, TrendingUp, Target, Flame, ChevronRight } from 'lucide-react';
import type { Asset } from '@/types';

interface ProductLaunchTemplateProps {
  query: string;
  narrative: string;
  assets: Asset[];
}

export function ProductLaunchTemplate({ query, narrative, assets }: ProductLaunchTemplateProps) {
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero - Bold Gradient */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-400/20 rounded-full"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-72 h-72 bg-cyan-300/10 rounded-full"
            animate={{ x: [-100, 100, -100], y: [-50, 50, -50] }}
            transition={{ duration: 25, repeat: Infinity }}
          />
        </div>

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Rocket className="w-5 h-5" />
              <span className="font-semibold tracking-wide">PRODUCT LAUNCH</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.95]">
              {query.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subheadline */}
            <motion.p 
              className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              We help technology companies launch products that capture attention and drive adoption
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <a
                href="#work"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all"
              >
                See the work
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/50 rounded-full font-bold hover:bg-white/10 transition-colors"
              >
                Let&apos;s talk
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 200L48 186.7C96 173 192 147 288 133.3C384 120 480 120 576 133.3C672 147 768 173 864 180C960 187 1056 173 1152 153.3C1248 133 1344 107 1392 93.3L1440 80V200H1392C1344 200 1248 200 1152 200C1056 200 960 200 864 200C768 200 672 200 576 200C480 200 384 200 288 200C192 200 96 200 48 200H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Narrative - Bold Block */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-full" />
            
            <p className="text-2xl md:text-4xl font-bold text-slate-900 leading-relaxed pl-8">
              {narrative}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Rocket, value: '50+', label: 'Launches' },
              { icon: TrendingUp, value: '10x', label: 'Avg. engagement lift' },
              { icon: Target, value: '95%', label: 'On-time delivery' },
              { icon: Flame, value: '100%', label: 'Client satisfaction' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                <div className="text-4xl font-black text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies - Big Cards */}
      {caseStudies.length > 0 && (
        <section id="work" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-indigo-500 font-semibold tracking-wide uppercase mb-4 block">
                Featured Launches
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                Products that made an impact
              </h2>
            </motion.div>

            <div className="space-y-8">
              {caseStudies.map((asset, i) => (
                <motion.a
                  key={asset.id}
                  href={`/asset/${asset.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 p-8 md:p-12 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500">
                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                      {/* Number */}
                      <div className="flex-shrink-0">
                        <span className="text-8xl font-black text-indigo-500/20">
                          0{i + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        {asset.client && (
                          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold mb-4">
                            {asset.client}
                          </span>
                        )}
                        <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                          {asset.title}
                        </h3>
                        <p className="text-lg text-slate-600 line-clamp-2">
                          {asset.description || asset.content?.substring(0, 150) + '...'}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 transition-all">
                          <ArrowRight className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles - Grid */}
      {articles.length > 0 && (
        <section className="py-24 px-6 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <span className="text-cyan-400 font-semibold tracking-wide uppercase mb-4 block">
                Launch Intelligence
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                Thinking that fuels great launches
              </h2>
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
                  className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all"
                >
                  <Zap className="w-6 h-6 text-cyan-400 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-100">
                    {asset.title}
                  </h3>
                  <div className="flex items-center gap-2 text-cyan-400 text-sm">
                    <span>Read more</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section id="contact" className="py-24 px-6 bg-gradient-to-br from-indigo-600 to-blue-600 text-white">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Rocket className="w-16 h-16 mx-auto mb-8 opacity-80" />
          
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Ready for liftoff?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Your next launch deserves a story that captures attention and drives action. Let&apos;s build it together.
          </p>
          
          <a
            href="#"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Start your launch
            <ArrowRight className="w-6 h-6" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
