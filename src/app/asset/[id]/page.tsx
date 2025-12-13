'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, FileText, Calendar } from 'lucide-react';
import type { Asset } from '@/types';

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
        if (!response.ok) {
          throw new Error('Asset not found');
        }
        const data = await response.json();
        setAsset(data.asset);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load asset');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchAsset();
    }
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

  const formattedDate = asset.created_at 
    ? new Date(asset.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
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
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <FileText className="w-3.5 h-3.5" />
              {asset.type.replace('_', ' ')}
            </span>
            
            {asset.client && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                <Building2 className="w-3.5 h-3.5" />
                {asset.client}
              </span>
            )}
            
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
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
            <div className="prose prose-slate max-w-none">
              {asset.content ? (
                asset.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 text-slate-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-slate-500 italic">No content available.</p>
              )}
            </div>
          </div>

          {/* Source link if available */}
          {asset.source_url && (
            <div className="mt-8">
              <a
                href={asset.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                View original source
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </a>
            </div>
          )}
        </motion.article>
      </main>
    </div>
  );
}
