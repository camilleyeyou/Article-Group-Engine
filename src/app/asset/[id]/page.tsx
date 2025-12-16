'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, Building2, FileText, Calendar, Tag, 
  Clock, BookOpen, Sparkles, ExternalLink, ChevronRight,
  Presentation, Code2, Rocket, Crown, Palette, Terminal,
  Play, Quote
} from 'lucide-react';
import type { Asset, AssetMetadata } from '@/types';

// ============================================
// KEYNOTE STYLE - Dark, cinematic
// ============================================
function KeynoteAssetPage({ asset, metadata, readTime, paragraphs, router }: AssetPageProps) {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 pt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <Presentation className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm tracking-widest uppercase">
                {metadata?.primary_capability?.replace(/-/g, ' ') || 'Keynote'}
              </span>
            </div>
            
            {asset.client && (
              <span className="inline-block px-4 py-1 bg-white/10 rounded-full text-sm mb-4">
                {asset.client}
              </span>
            )}
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {asset.title}
            </h1>
            
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {readTime} min read
              </span>
              {metadata?.is_case_study && (
                <span className="flex items-center gap-2 text-red-400">
                  <Sparkles className="w-4 h-4" />
                  Case Study
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {asset.description && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Quote className="w-10 h-10 text-red-500/30 mb-4" />
            <p className="text-2xl text-white/80 font-light leading-relaxed">
              {asset.description}
            </p>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="text-white/70 leading-relaxed mb-6">{p}</p>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
          className="mt-20 pt-12 border-t border-white/10 text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all"
          >
            Start a new search
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}

// ============================================
// DEVREL STYLE - Terminal, dark mode
// ============================================
function DevRelAssetPage({ asset, metadata, readTime, paragraphs, router }: AssetPageProps) {
  return (
    <div className="bg-[#0d1117] text-white min-h-screen font-mono">
      {/* Terminal Header */}
      <header className="border-b border-[#30363d]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            cd ..
          </button>
        </div>
      </header>

      {/* Terminal Window */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden"
        >
          {/* Terminal bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#21262d] border-b border-[#30363d]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
            </div>
            <span className="text-xs text-gray-500 ml-4">asset — {asset.id.substring(0, 8)}</span>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-emerald-400">→</span>
              <span className="text-gray-400">cat</span>
              <span className="text-cyan-400">README.md</span>
            </div>

            <div className="pl-6">
              {asset.client && (
                <div className="text-emerald-400 text-sm mb-2">// {asset.client}</div>
              )}
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 font-sans">
                {asset.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
                <span>{readTime} min read</span>
                {metadata?.is_case_study && (
                  <span className="text-emerald-400">★ case_study</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          {asset.description && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-8">
              <code className="text-emerald-400 text-sm">/** @description */</code>
              <p className="text-gray-300 mt-2 font-sans">{asset.description}</p>
            </div>
          )}

          <div className="space-y-4 font-sans">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-gray-400 leading-relaxed">{p}</p>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors"
          >
            <Terminal className="w-5 h-5" />
            New search
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// PRODUCT LAUNCH STYLE - Bold, energetic
// ============================================
function ProductLaunchAssetPage({ asset, metadata, readTime, paragraphs, router }: AssetPageProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        
        <div className="relative max-w-5xl mx-auto px-6 pt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 mb-6">
              <Rocket className="w-5 h-5" />
              <span className="font-semibold">
                {metadata?.primary_capability?.replace(/-/g, ' ') || 'Product Launch'}
              </span>
            </div>
            
            {asset.client && (
              <span className="block text-white/80 text-lg mb-4">{asset.client}</span>
            )}
            
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              {asset.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-white/80">
              <span>{readTime} min read</span>
              {metadata?.is_case_study && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Case Study</span>
              )}
            </div>
          </motion.div>
        </div>

        <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z" fill="white"/>
        </svg>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {asset.description && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="border-l-4 border-indigo-500 pl-6 mb-12"
          >
            <p className="text-2xl text-slate-700 font-light">{asset.description}</p>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none"
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="text-slate-600 leading-relaxed mb-6">{p}</p>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full font-bold hover:shadow-xl transition-all"
          >
            Start a new search
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}

// ============================================
// EXECUTIVE STYLE - Premium, minimal
// ============================================
function ExecutiveAssetPage({ asset, metadata, readTime, paragraphs, router }: AssetPageProps) {
  return (
    <div className="bg-[#faf9f7] min-h-screen">
      {/* Hero */}
      <header className="max-w-5xl mx-auto px-6 pt-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-px bg-amber-700" />
            <span className="text-amber-700 text-sm tracking-[0.2em] uppercase">
              {metadata?.primary_capability?.replace(/-/g, ' ') || 'Executive'}
            </span>
          </div>

          {asset.client && (
            <span className="text-slate-500 text-sm mb-4 block">{asset.client}</span>
          )}

          <h1 className="text-4xl md:text-5xl font-light text-slate-900 leading-tight mb-8">
            {asset.title}
          </h1>

          <div className="flex items-center gap-4 mb-12">
            <Crown className="w-5 h-5 text-amber-600" />
            <span className="text-slate-500 text-sm">{readTime} min read</span>
            {metadata?.is_case_study && (
              <span className="text-amber-700 text-sm">• Case Study</span>
            )}
          </div>
        </motion.div>

        {asset.description && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="bg-white p-8 mb-12 border-l-4 border-amber-500"
          >
            <p className="text-xl text-slate-700 font-light italic">{asset.description}</p>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none"
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="text-slate-600 leading-relaxed mb-6 font-light">{p}</p>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
          className="mt-20 pt-12 border-t border-slate-200 text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 text-white hover:bg-amber-500 transition-colors"
          >
            Start a new search
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// REBRANDING STYLE - Creative, magazine
// ============================================
function RebrandingAssetPage({ asset, metadata, readTime, paragraphs, router }: AssetPageProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-violet-600" />
          <div className="w-1/2 bg-fuchsia-500" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-white w-full">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm mb-12 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5" />
              <span className="text-sm tracking-[0.2em] uppercase">
                {metadata?.primary_capability?.replace(/-/g, ' ') || 'Rebranding'}
              </span>
            </div>

            {asset.client && (
              <span className="text-white/80 text-lg mb-4 block">{asset.client}</span>
            )}

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              {asset.title}
            </h1>

            <div className="flex items-center gap-4 text-white/80">
              <span>{readTime} min read</span>
              {metadata?.is_case_study && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Case Study</span>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {asset.description && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="mb-12"
          >
            <div className="h-2 w-16 bg-violet-500 mb-6" />
            <p className="text-2xl text-slate-700">{asset.description}</p>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none"
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="text-slate-600 leading-relaxed mb-6">{p}</p>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-bold hover:shadow-xl transition-all"
          >
            Start a new search
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}

// ============================================
// DEFAULT STYLE
// ============================================
function DefaultAssetPage({ asset, metadata, readTime, paragraphs, router }: AssetPageProps) {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-gradient-to-br from-slate-700 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 pt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {asset.client && (
              <span className="text-white/60 text-sm mb-4 block">{asset.client}</span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{asset.title}</h1>
            <div className="flex items-center gap-4 text-white/60 text-sm">
              <span>{readTime} min read</span>
              {metadata?.is_case_study && <span>• Case Study</span>}
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {asset.description && (
          <p className="text-xl text-slate-600 mb-12 border-l-4 border-slate-300 pl-6">
            {asset.description}
          </p>
        )}
        
        <div className="prose prose-lg max-w-none">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-slate-600 mb-6">{p}</p>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800"
          >
            New search <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

// ============================================
// TYPES & MAIN COMPONENT
// ============================================
interface AssetPageProps {
  asset: Asset;
  metadata: AssetMetadata | undefined;
  readTime: number;
  paragraphs: string[];
  router: ReturnType<typeof useRouter>;
}

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
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchAsset();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
        <FileText className="w-12 h-12 text-slate-300" />
        <p className="text-slate-600">{error || 'Not found'}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-slate-900 text-white rounded-full"
        >
          Go back
        </button>
      </div>
    );
  }

  const metadata = asset.metadata as AssetMetadata | undefined;
  const capability = metadata?.primary_capability || '';
  const wordCount = asset.content?.split(/\s+/).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const paragraphs = asset.content?.split(/\n\n+/).filter(p => p.trim()) || [];

  const pageProps: AssetPageProps = { asset, metadata, readTime, paragraphs, router };

  // Route to matching template style
  switch (capability) {
    case 'keynote-events':
      return <KeynoteAssetPage {...pageProps} />;
    
    case 'developer-relations':
      return <DevRelAssetPage {...pageProps} />;
    
    case 'gtm-strategy':
    case 'product-launch':
      return <ProductLaunchAssetPage {...pageProps} />;
    
    case 'executive-messaging':
    case 'investor-communications':
    case 'analyst-relations':
    case 'thought-leadership':
      return <ExecutiveAssetPage {...pageProps} />;
    
    case 'brand-design':
    case 'rebranding':
      return <RebrandingAssetPage {...pageProps} />;
    
    default:
      return <DefaultAssetPage {...pageProps} />;
  }
}
