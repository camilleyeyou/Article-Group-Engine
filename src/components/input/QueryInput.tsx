'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function QueryInput({ onSubmit, isLoading = false, placeholder }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className={cn(
        "relative rounded-2xl border-2 transition-all duration-300",
        "bg-white shadow-lg",
        "border-slate-200 focus-within:border-blue-500 focus-within:shadow-xl",
        isLoading && "opacity-70 pointer-events-none"
      )}>
        <div className="flex items-start gap-3 p-4">
          <Sparkles className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Tell us about your challenge..."}
            disabled={isLoading}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent outline-none",
              "text-slate-900 placeholder:text-slate-400",
              "text-lg leading-relaxed",
              "min-h-[28px] max-h-[200px]"
            )}
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={cn(
              "p-2 rounded-xl transition-all duration-200",
              "bg-blue-500 text-white",
              "hover:bg-blue-600 hover:scale-105",
              "disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed",
              "flex-shrink-0"
            )}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <p className="text-center text-sm text-slate-500 mt-3">
        Press Enter to submit, Shift+Enter for new line
      </p>
    </motion.form>
  );
}
