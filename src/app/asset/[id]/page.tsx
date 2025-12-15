'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, FileText, Calendar, Tag } from 'lucide-react';
import type { Asset, AssetMetadata} from '@/types';

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
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">{error || 'Asset not found'}</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    );
  }

  const metadata = asset.metadata as AssetMetadata | undefined;
  const formattedDate = asset.created_at
    ? new Date(asset.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to results
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Meta badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Content type */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <FileText className="w-3.5 h-3.5" />
              {asset.type.replace('_', ' ')}
            </span>

            {/* Client */}
            {asset.client && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                <Building2 className="w-3.5 h-3.5" />
                {asset.client}
              </span>
            )}

            {/* Capability */}
            {metadata?.primary_capability && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">
                <Tag className="w-3.5 h-3.5" />
                {metadata.primary_capability.replace(/-/g, ' ')}
              </span>
            )}

            {/* Date */}
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            )}

            {/* Case study badge */}
            {metadata?.is_case_study && (
              <span className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                ✦ Case Study
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
            {asset.title}
          </h1>

          {/* Description */}
          {asset.description && (
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {asset.description}
            </p>
          )}

          {/* Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-p:leading-relaxed">
              {asset.content ? (
                asset.content.split('\n').map((paragraph, i) =>
                  paragraph.trim() ? (
                    <p key={i} className="mb-4 text-slate-700">
                      {paragraph}
                    </p>
                  ) : (
                    <br key={i} />
                  )
                )
              ) : (
                <p className="text-slate-500 italic">No content available.</p>
              )}
            </div>
          </div>

          {/* Source link */}
          {asset.source_url && (
            <div className="mt-8">
              <a
                href={asset.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                View original source →
              </a>
            </div>
          )}
        </motion.article>
      </main>
    </div>
  );
}