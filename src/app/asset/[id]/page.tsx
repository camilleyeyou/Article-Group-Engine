'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building2, FileText, Calendar, Tag, 
  Clock, BookOpen, Sparkles, ExternalLink, ChevronRight
} from 'lucide-react';
import type { Asset, AssetMetadata } from '@/types';

// Theme colors based on capability
const CAPABILITY_THEMES: Record<string, { gradient: string; light: string; accent: string }> = {
  'narrative-frameworks': { gradient: 'from-violet-600 to-purple-700', light: 'bg-violet-50', accent: 'text-violet-600' },
  'positioning-messaging': { gradient: 'from-blue-600 to-indigo-700', light: 'bg-blue-50', accent: 'text-blue-600' },
  'gtm-strategy': { gradient: 'from-indigo-600 to-blue-700', light: 'bg-indigo-50', accent: 'text-indigo-600' },
  'journey-persona': { gradient: 'from-cyan-600 to-teal-700', light: 'bg-cyan-50', accent: 'text-cyan-600' },
  'editorial-strategy': { gradient: 'from-emerald-600 to-green-700', light: 'bg-emerald-50', accent: 'text-emerald-600' },
  'thought-leadership': { gradient: 'from-amber-600 to-orange-700', light: 'bg-amber-50', accent: 'text-amber-600' },
  'copywriting': { gradient: 'from-pink-600 to-rose-700', light: 'bg-pink-50', accent: 'text-pink-600' },
  'social-strategy': { gradient: 'from-fuchsia-600 to-pink-700', light: 'bg-fuchsia-50', accent: 'text-fuchsia-600' },
  'brand-design': { gradient: 'from-purple-600 to-violet-700', light: 'bg-purple-50', accent: 'text-purple-600' },
  'design-systems': { gradient: 'from-slate-600 to-gray-700', light: 'bg-slate-50', accent: 'text-slate-600' },
  'video-production': { gradient: 'from-red-600 to-rose-700', light: 'bg-red-50', accent: 'text-red-600' },
  'sales-collateral': { gradient: 'from-orange-600 to-amber-700', light: 'bg-orange-50', accent: 'text-orange-600' },
  'keynote-events': { gradient: 'from-red-600 to-rose-700', light: 'bg-red-50', accent: 'text-red-600' },
  'partner-marketing': { gradient: 'from-sky-600 to-blue-700', light: 'bg-sky-50', accent: 'text-sky-600' },
  'default': { gradient: 'from-slate-700 to-slate-900', light: 'bg-slate-50', accent: 'text-slate-600' },
};

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAsset() {
      try {
        const response = await fetch(`/api/asset/${params.id}`);
        if (!response.ok) throw new Error('Asset not found');
        const data = await response.json();
        setAsset(data.asset);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load asset');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchAsset();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500">Loading content...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <FileText className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Content not found</h1>
          <p className="text-slate-600">{error || 'This asset could not be located.'}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    );
  }

  const metadata = asset.metadata as AssetMetadata | undefined;
  const capability = metadata?.primary_capability || 'default';
  const theme = CAPABILITY_THEMES[capability] || CAPABILITY_THEMES['default'];
  
  const formattedDate = asset.created_at
    ? new Date(asset.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Estimate read time (roughly 200 words per minute)
  const wordCount = asset.content?.split(/\s+/).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Split content into paragraphs
  const paragraphs = asset.content?.split(/\n\n+/).filter(p => p.trim()) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <header className={`relative bg-gradient-to-br ${theme.gradient} text-white overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Navigation */}
        <div className="relative max-w-5xl mx-auto px-6 pt-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to results
          </button>
        </div>

        {/* Hero content */}
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              {/* Content type */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                <FileText className="w-3.5 h-3.5" />
                {asset.type.replace('_', ' ')}
              </span>

              {/* Case study badge */}
              {metadata?.is_case_study && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 backdrop-blur-sm rounded-full text-sm font-medium text-amber-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  Case Study
                </span>
              )}

              {/* Client */}
              {asset.client && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  <Building2 className="w-3.5 h-3.5" />
                  {asset.client}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight max-w-4xl">
              {asset.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
              {formattedDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readTime} min read
              </span>
              {metadata?.primary_capability && (
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  {metadata.primary_capability.replace(/-/g, ' ')}
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Description callout */}
          {asset.description && (
            <div className={`${theme.light} rounded-2xl p-6 md:p-8 mb-12 border-l-4 border-current ${theme.accent}`}>
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed italic">
                {asset.description}
              </p>
            </div>
          )}

          {/* Main content */}
          <div className="prose prose-lg prose-slate max-w-none">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, i) => {
                // Check if paragraph looks like a heading (short, no period at end)
                const isHeading = paragraph.length < 100 && !paragraph.endsWith('.') && !paragraph.endsWith('?');
                
                if (isHeading && i > 0) {
                  return (
                    <h2 key={i} className="text-2xl font-bold text-slate-900 mt-12 mb-4">
                      {paragraph}
                    </h2>
                  );
                }
                
                return (
                  <p key={i} className="text-slate-700 leading-relaxed mb-6">
                    {paragraph}
                  </p>
                );
              })
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 italic">No content available for this asset.</p>
              </div>
            )}
          </div>

          {/* Source link */}
          {asset.source_url && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <a
                href={asset.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 ${theme.accent} hover:underline font-medium`}
              >
                View original source
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </motion.article>

        {/* Related capabilities */}
        {metadata?.secondary_capabilities && metadata.secondary_capabilities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 pt-8 border-t border-slate-200"
          >
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Related Capabilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {metadata.secondary_capabilities.map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-700"
                >
                  {cap.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to search CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16"
        >
          <div className={`${theme.light} rounded-2xl p-8 text-center`}>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Looking for something else?
            </h3>
            <p className="text-slate-600 mb-6">
              Explore more of our work and thinking
            </p>
            <button
              onClick={() => router.push('/')}
              className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.gradient} text-white rounded-full font-medium hover:shadow-lg transition-shadow`}
            >
              Start a new search
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}