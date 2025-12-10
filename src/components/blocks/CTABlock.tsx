'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MessageCircle } from 'lucide-react';

interface CTABlockProps {
  variant?: 'primary' | 'secondary';
}

export function CTABlock({ variant = 'primary' }: CTABlockProps) {
  if (variant === 'secondary') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-2xl mx-auto text-center py-8"
      >
        <p className="text-slate-600 mb-4">
          Want to see more work in a specific area?
        </p>
        <button className="inline-flex items-center px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:border-blue-500 hover:text-blue-600 transition-colors">
          <MessageCircle className="w-5 h-5 mr-2" />
          Refine your search
        </button>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto mt-16 mb-8"
    >
      <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to explore what this could look like for you?
          </h3>
          
          <p className="text-blue-100 mb-8 max-w-xl">
            Let&apos;s talk about your challenge. No pitch, no pressure—just a conversation about what&apos;s possible.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule a call
            </a>
            
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              Get in touch
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
