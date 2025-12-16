'use client';

import { motion } from 'framer-motion';
import type { Template, Asset, LayoutBlock } from '@/types';
import { StrategicBridge } from './StrategicBridge';
import { CaseStudyCard } from './CaseStudyCard';
import { CTABlock } from './CTABlock';
import { 
  Mic2, Rocket, Code2, Users, Briefcase, Building2, 
  Presentation, Target, Lightbulb, TrendingUp, Shield,
  GitMerge, BarChart3, Heart, Handshake, BookOpen,
  AlertTriangle, Megaphone, Play
} from 'lucide-react';

interface TemplateRendererProps {
  template: Template;
  narrative: string;
  assets: Asset[];
  layout: LayoutBlock[];
  query: string;
}

// Icon mapping for templates
const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  'executive-messaging': Mic2,
  'product-launch': Rocket,
  'hard-tech-launch': Code2,
  'consumer-launch': Megaphone,
  'rebranding': Building2,
  'developer-relations': Code2,
  'sales-enablement': Briefcase,
  'internal-communications': Users,
  'keynote-development': Presentation,
  'gtm-strategy': Target,
  'technical-translation': Lightbulb,
  'narrative-framework': BookOpen,
  'investor-communications': TrendingUp,
  'employer-branding': Heart,
  'partner-marketing': Handshake,
  'thought-leadership': Lightbulb,
  'crisis-communications': AlertTriangle,
  'ma-communications': GitMerge,
  'analyst-relations': BarChart3,
  'customer-marketing': Users,
  'general': Target,
};

// Color themes for different template categories
const TEMPLATE_THEMES: Record<string, { gradient: string; accent: string; light: string }> = {
  'executive-messaging': { gradient: 'from-slate-900 to-slate-700', accent: 'text-amber-400', light: 'bg-amber-50' },
  'product-launch': { gradient: 'from-blue-600 to-indigo-700', accent: 'text-blue-400', light: 'bg-blue-50' },
  'hard-tech-launch': { gradient: 'from-emerald-600 to-teal-700', accent: 'text-emerald-400', light: 'bg-emerald-50' },
  'consumer-launch': { gradient: 'from-pink-500 to-rose-600', accent: 'text-pink-400', light: 'bg-pink-50' },
  'rebranding': { gradient: 'from-purple-600 to-violet-700', accent: 'text-purple-400', light: 'bg-purple-50' },
  'developer-relations': { gradient: 'from-gray-800 to-gray-900', accent: 'text-green-400', light: 'bg-gray-50' },
  'sales-enablement': { gradient: 'from-orange-500 to-amber-600', accent: 'text-orange-400', light: 'bg-orange-50' },
  'internal-communications': { gradient: 'from-cyan-600 to-blue-700', accent: 'text-cyan-400', light: 'bg-cyan-50' },
  'keynote-development': { gradient: 'from-red-600 to-rose-700', accent: 'text-red-400', light: 'bg-red-50' },
  'gtm-strategy': { gradient: 'from-indigo-600 to-blue-700', accent: 'text-indigo-400', light: 'bg-indigo-50' },
  'technical-translation': { gradient: 'from-teal-600 to-emerald-700', accent: 'text-teal-400', light: 'bg-teal-50' },
  'narrative-framework': { gradient: 'from-violet-600 to-purple-700', accent: 'text-violet-400', light: 'bg-violet-50' },
  'investor-communications': { gradient: 'from-slate-700 to-slate-900', accent: 'text-emerald-400', light: 'bg-slate-50' },
  'employer-branding': { gradient: 'from-pink-600 to-fuchsia-700', accent: 'text-pink-400', light: 'bg-pink-50' },
  'partner-marketing': { gradient: 'from-blue-700 to-indigo-800', accent: 'text-sky-400', light: 'bg-sky-50' },
  'thought-leadership': { gradient: 'from-amber-600 to-orange-700', accent: 'text-amber-400', light: 'bg-amber-50' },
  'crisis-communications': { gradient: 'from-red-700 to-red-900', accent: 'text-red-400', light: 'bg-red-50' },
  'ma-communications': { gradient: 'from-slate-800 to-zinc-900', accent: 'text-blue-400', light: 'bg-zinc-50' },
  'analyst-relations': { gradient: 'from-blue-800 to-slate-900', accent: 'text-cyan-400', light: 'bg-blue-50' },
  'customer-marketing': { gradient: 'from-green-600 to-emerald-700', accent: 'text-green-400', light: 'bg-green-50' },
  'general': { gradient: 'from-slate-600 to-slate-800', accent: 'text-blue-400', light: 'bg-slate-50' },
};

export function TemplateRenderer({ template, narrative, assets, layout, query }: TemplateRendererProps) {
  const Icon = TEMPLATE_ICONS[template.slug] || Target;
  const theme = TEMPLATE_THEMES[template.slug] || TEMPLATE_THEMES['general'];
  
  // Separate assets by type
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study === true
  );
  const articles = assets.filter(a => 
    a.type === 'article' && (a.metadata as Record<string, unknown>)?.is_case_study !== true
  );
  const videos = assets.filter(a => a.type === 'video');
  
  return (
    <div className="w-full">
      {/* Hero Section - Template Specific */}
      <section className={`relative bg-gradient-to-br ${theme.gradient} text-white overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Template badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Icon className={`w-4 h-4 ${theme.accent}`} />
              <span className="text-sm font-medium">{template.name}</span>
            </div>
            
            {/* Query as headline */}
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
              {query}
            </h1>
            
            {/* Template description */}
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              {template.description}
            </p>
          </motion.div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Strategic Bridge / Narrative */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StrategicBridge narrative={narrative} />
        </motion.div>
      </section>

      {/* Case Studies Section */}
      {caseStudies.length > 0 && (
        <section className={`${theme.light} py-16`}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Relevant Work</h2>
                  <p className="text-slate-600">Case studies that demonstrate our expertise</p>
                </div>
              </div>
              
              <div className={`grid gap-6 ${caseStudies.length === 1 ? 'max-w-2xl' : 'md:grid-cols-2'}`}>
                {caseStudies.map((asset, i) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  >
                    <CaseStudyCard asset={asset} index={i} size={caseStudies.length === 1 ? 'large' : 'default'} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Articles / Thought Leadership Section */}
      {articles.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Related Thinking</h2>
                  <p className="text-slate-600">Ideas and frameworks from our team</p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {articles.slice(0, 6).map((asset, i) => (
                  <motion.a
                    key={asset.id}
                    href={asset.source_url || `/asset/${asset.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
                    className="group block p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {(asset.metadata as Record<string, unknown>)?.primary_capability 
                          ? String((asset.metadata as Record<string, unknown>).primary_capability).replace(/-/g, ' ')
                          : 'Article'}
                      </span>
                      {asset.client && (
                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                          {asset.client}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {asset.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {asset.description || asset.content?.substring(0, 120) + '...'}
                    </p>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <section className={`${theme.light} py-16`}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Featured Videos</h2>
                  <p className="text-slate-600">See our work in action</p>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {videos.slice(0, 4).map((asset, i) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                    className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative group cursor-pointer"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-white font-medium">{asset.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <CTABlock variant="primary" />
        </div>
      </section>
    </div>
  );
}
