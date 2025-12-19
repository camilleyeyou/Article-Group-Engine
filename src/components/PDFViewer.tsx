'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  X,
  FileText,
  ExternalLink
} from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  downloadFilename?: string;
  accentColor?: string;
}

export function PDFViewer({ pdfUrl, title, downloadFilename, accentColor = 'indigo' }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = downloadFilename || `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNew = () => {
    window.open(pdfUrl, '_blank');
  };

  const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string }> = {
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500', hover: 'hover:bg-indigo-600' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', hover: 'hover:bg-cyan-600' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', hover: 'hover:bg-rose-600' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', hover: 'hover:bg-emerald-600' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', hover: 'hover:bg-orange-600' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500', hover: 'hover:bg-violet-600' },
    red: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', hover: 'hover:bg-red-600' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', hover: 'hover:bg-amber-600' },
  };

  const colors = colorClasses[accentColor] || colorClasses.indigo;

  // Fullscreen Modal
  const FullscreenViewer = () => (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
        >
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-white/60" />
              <span className="text-white font-medium">{title}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <button
                onClick={handleZoomOut}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-sm min-w-[4rem] text-center">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              
              <div className="w-px h-6 bg-white/20 mx-2" />
              
              {/* Download */}
              <button
                onClick={handleDownload}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              
              {/* Open in new tab */}
              <button
                onClick={handleOpenNew}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              
              <div className="w-px h-6 bg-white/20 mx-2" />
              
              {/* Close */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* PDF Content */}
          <div className="flex-1 overflow-auto p-6">
            <div 
              className="mx-auto transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                maxWidth: '100%'
              }}
            >
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full bg-white rounded-lg shadow-2xl"
                style={{ height: '90vh', minWidth: '800px' }}
                title={title}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Error state
  if (error) {
    return (
      <div className="bg-slate-100 rounded-2xl p-12 text-center">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">PDF Preview Unavailable</h3>
        <p className="text-slate-500 mb-6">The document preview couldn&apos;t be loaded.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDownload}
            className={`inline-flex items-center gap-2 px-6 py-3 ${colors.bg} text-white rounded-lg font-semibold ${colors.hover} transition-colors`}
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Open in New Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <FullscreenViewer />
      
      <div className="bg-slate-900 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <FileText className={`w-5 h-5 ${colors.text}`} />
            <span className="text-white font-medium text-sm truncate max-w-xs">{title}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Zoom controls */}
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-slate-400 text-xs min-w-[3rem] text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <div className="w-px h-5 bg-slate-600 mx-2" />
            
            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            
            {/* Download */}
            <button
              onClick={handleDownload}
              className={`p-2 ${colors.text} hover:bg-slate-700 rounded-lg transition-colors`}
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* PDF Preview */}
        <div className="relative bg-slate-950 overflow-hidden" style={{ height: '600px' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <div className={`w-12 h-12 border-4 border-slate-700 ${colors.border} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
                <p className="text-slate-400">Loading document...</p>
              </div>
            </div>
          )}
          
          <div 
            className="h-full overflow-auto"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
              className="w-full h-full border-0"
              title={title}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError(true);
              }}
            />
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            View the full document for the best experience
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </button>
            <button
              onClick={handleDownload}
              className={`inline-flex items-center gap-2 px-4 py-2 ${colors.bg} text-white rounded-lg font-medium ${colors.hover} transition-colors text-sm`}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Compact PDF card for use in templates
interface PDFCardProps {
  pdfUrl: string;
  title: string;
  client?: string;
  thumbnailUrl?: string;
  accentColor?: string;
}

export function PDFCard({ pdfUrl, title, client, thumbnailUrl, accentColor = 'indigo' }: PDFCardProps) {
  const colorClasses: Record<string, string> = {
    indigo: 'from-indigo-500 to-violet-500',
    cyan: 'from-cyan-500 to-teal-500',
    rose: 'from-rose-500 to-pink-500',
    emerald: 'from-emerald-500 to-teal-500',
    orange: 'from-orange-500 to-red-500',
  };

  const gradient = colorClasses[accentColor] || colorClasses.indigo;

  return (
    <a 
      href={pdfUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:shadow-xl">
        {/* Thumbnail or gradient */}
        <div className="aspect-[4/3] relative">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-80`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-16 h-16 text-white/30" />
              </div>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {/* PDF badge */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
            PDF
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {client && (
            <span className="text-slate-400 text-sm">{client}</span>
          )}
          <h3 className="font-semibold text-white mt-1 line-clamp-2 group-hover:text-slate-300 transition-colors">
            {title}
          </h3>
        </div>
      </div>
    </a>
  );
}
