'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, FileText, Download, Maximize2, Minimize2,
  ZoomIn, ZoomOut, ExternalLink, X, ChevronLeft, ChevronRight,
  Sparkles, Eye, Share2, Printer, RotateCw
} from 'lucide-react';
import type { Asset, AssetMetadata } from '@/types';

// ============================================
// IMMERSIVE PDF VIEWER
// ============================================
interface ImmersivePDFViewerProps {
  pdfUrl: string;
  title: string;
  client?: string;
  onBack: () => void;
}

function ImmersivePDFViewer({ pdfUrl, title, client, onBack }: ImmersivePDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleZoomIn = () => setZoom(z => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom(z => Math.max(z - 25, 50));
  const handleZoomReset = () => setZoom(100);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out: ${title}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
        setIsFullscreen(f => !f);
      }
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      }
      if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-slate-950 flex flex-col`}>
      
      {/* Top Bar */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={onBack}
              className="flex-shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {client && (
                  <span className="flex-shrink-0 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded">
                    {client}
                  </span>
                )}
              </div>
              <h1 className="text-white font-medium truncate mt-0.5" title={title}>
                {title}
              </h1>
            </div>
          </div>

          {/* Center: Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-3 py-1 text-slate-300 hover:text-white text-sm font-medium min-w-[4rem]"
              title="Reset zoom"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block" />
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen (F)"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* PDF Container */}
      <main className="flex-1 relative overflow-hidden bg-slate-900">
        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-slate-400 text-lg">Loading document...</p>
              <p className="text-slate-500 text-sm mt-2">This may take a moment</p>
            </div>
          </div>
        )}

        {/* PDF iframe with zoom */}
        <div 
          className="h-full overflow-auto flex justify-center"
          style={{ backgroundColor: '#1e293b' }}
        >
          <div 
            className="transition-transform duration-200 origin-top"
            style={{ 
              transform: `scale(${zoom / 100})`,
              width: zoom > 100 ? `${zoom}%` : '100%',
            }}
          >
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full border-0"
              style={{ 
                height: isFullscreen ? '100vh' : 'calc(100vh - 60px)',
                minHeight: '800px',
              }}
              title={title}
              onLoad={() => setIsLoaded(true)}
            />
          </div>
        </div>

        {/* Quick Actions Floating Bar (Mobile) */}
        <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl">
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-slate-300 text-sm w-12 text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-600 mx-1" />
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </main>

      {/* Keyboard shortcuts hint */}
      {!isFullscreen && (
        <footer className="flex-shrink-0 bg-slate-900 border-t border-slate-800 px-4 py-2">
          <div className="flex items-center justify-center gap-6 text-slate-500 text-xs">
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">F</kbd> Fullscreen</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">+</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">-</kbd> Zoom</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Esc</kbd> Exit</span>
          </div>
        </footer>
      )}
    </div>
  );
}

// ============================================
// FALLBACK: No PDF Available
// ============================================
interface NoPDFProps {
  asset: Asset;
  onBack: () => void;
}

function NoPDFFallback({ asset, onBack }: NoPDFProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-slate-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">{asset.title}</h1>
        
        {asset.client && (
          <p className="text-indigo-400 mb-4">{asset.client}</p>
        )}
        
        <p className="text-slate-400 mb-8">
          The PDF for this document is not yet available. Please check back later or contact support.
        </p>
        
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </motion.div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
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

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-slate-400 text-lg">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !asset) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 text-white px-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold">Document not found</h2>
        <p className="text-slate-400 text-center max-w-md">{error || 'The requested document could not be loaded.'}</p>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Go back
        </button>
      </div>
    );
  }

  // If no PDF URL, show fallback
  if (!asset.pdf_url) {
    return <NoPDFFallback asset={asset} onBack={handleBack} />;
  }

  // Main PDF viewer
  return (
    <ImmersivePDFViewer
      pdfUrl={asset.pdf_url}
      title={asset.title}
      client={asset.client}
      onBack={handleBack}
    />
  );
}
