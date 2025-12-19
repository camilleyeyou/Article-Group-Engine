'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, ExternalLink, Maximize2, X,
  ZoomIn, ZoomOut, Eye, BookOpen
} from 'lucide-react';

interface PDFSectionProps {
  pdfUrl: string;
  title: string;
  accentColor?: string;
  className?: string;
}

export function PDFSection({ pdfUrl, title, accentColor = 'indigo', className = '' }: PDFSectionProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const colorMap: Record<string, { 
    gradient: string; 
    bg: string; 
    border: string; 
    text: string;
    hoverBg: string;
  }> = {
    indigo: { 
      gradient: 'from-indigo-500 to-violet-500', 
      bg: 'bg-indigo-500', 
      border: 'border-indigo-500',
      text: 'text-indigo-500',
      hoverBg: 'hover:bg-indigo-600'
    },
    cyan: { 
      gradient: 'from-cyan-500 to-teal-500', 
      bg: 'bg-cyan-500', 
      border: 'border-cyan-500',
      text: 'text-cyan-500',
      hoverBg: 'hover:bg-cyan-600'
    },
    red: { 
      gradient: 'from-red-500 to-orange-500', 
      bg: 'bg-red-500', 
      border: 'border-red-500',
      text: 'text-red-500',
      hoverBg: 'hover:bg-red-600'
    },
    emerald: { 
      gradient: 'from-emerald-500 to-teal-500', 
      bg: 'bg-emerald-500', 
      border: 'border-emerald-500',
      text: 'text-emerald-500',
      hoverBg: 'hover:bg-emerald-600'
    },
    amber: { 
      gradient: 'from-amber-500 to-orange-500', 
      bg: 'bg-amber-500', 
      border: 'border-amber-500',
      text: 'text-amber-500',
      hoverBg: 'hover:bg-amber-600'
    },
    violet: { 
      gradient: 'from-violet-500 to-fuchsia-500', 
      bg: 'bg-violet-500', 
      border: 'border-violet-500',
      text: 'text-violet-500',
      hoverBg: 'hover:bg-violet-600'
    },
  };

  const colors = colorMap[accentColor] || colorMap.indigo;

  return (
    <>
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-white/60" />
              <span className="text-white font-medium">{title}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.max(50, z - 25))}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-sm w-16 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(200, z + 25))}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              
              <div className="w-px h-6 bg-white/20 mx-2" />
              
              <button
                onClick={handleDownload}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => window.open(pdfUrl, '_blank')}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              
              <div className="w-px h-6 bg-white/20 mx-2" />
              
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
              className="mx-auto transition-transform duration-200 origin-top"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full bg-white rounded-lg shadow-2xl mx-auto"
                style={{ height: '90vh', maxWidth: '1000px', minWidth: '800px' }}
                title={title}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Inline PDF Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl overflow-hidden bg-slate-900 ${className}`}
      >
        {/* Section Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Original Document</h3>
              <p className="text-slate-400 text-sm">View the beautifully designed PDF</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm"
            >
              <Maximize2 className="w-4 h-4" />
              Fullscreen
            </button>
            <button
              onClick={handleDownload}
              className={`inline-flex items-center gap-2 px-4 py-2 ${colors.bg} text-white rounded-lg font-medium ${colors.hoverBg} transition-colors text-sm`}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
        
        {/* PDF Preview */}
        <div className="relative" style={{ height: '700px' }}>
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
            className="w-full h-full border-0"
            title={title}
          />
          
          {/* Gradient overlay at bottom to indicate more content */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-center gap-4 px-6 py-4 bg-slate-800 border-t border-slate-700">
          <button
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Full Document</span>
          </button>
          <span className="text-slate-600">•</span>
          <button
            onClick={() => window.open(pdfUrl, '_blank')}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in New Tab</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}

// Compact call-to-action for PDF when showing text content
interface PDFCalloutProps {
  pdfUrl: string;
  title: string;
  accentColor?: string;
}

export function PDFCallout({ pdfUrl, title, accentColor = 'indigo' }: PDFCalloutProps) {
  const colorMap: Record<string, { gradient: string; bg: string }> = {
    indigo: { gradient: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-500' },
    cyan: { gradient: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-500' },
    red: { gradient: 'from-red-500 to-orange-500', bg: 'bg-red-500' },
    emerald: { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500' },
    amber: { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500' },
    violet: { gradient: 'from-violet-500 to-fuchsia-500', bg: 'bg-violet-500' },
  };

  const colors = colorMap[accentColor] || colorMap.indigo;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.gradient} p-8 text-white`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">View the Original Document</h3>
          <p className="text-white/80">
            This content is also available as a beautifully designed PDF document.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:shadow-xl transition-all"
          >
            <Eye className="w-5 h-5" />
            View PDF
          </a>
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 rounded-xl font-semibold hover:bg-white/30 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
        </div>
      </div>
    </motion.div>
  );
}
