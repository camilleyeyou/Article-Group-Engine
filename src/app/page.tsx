'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QueryInput } from '@/components/input/QueryInput';
import { StarterPrompts } from '@/components/input/StarterPrompts';
import { ThinkingState } from '@/components/loading/ThinkingState';
import { ResponseRenderer } from '@/components/blocks/ResponseRenderer';
import type { GeneratedResponse } from '@/types';
import { ArrowLeft } from 'lucide-react';

type ViewState = 'input' | 'loading' | 'results';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('input');
  const [currentQuery, setCurrentQuery] = useState('');
  const [response, setResponse] = useState<GeneratedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (query: string) => {
    setCurrentQuery(query);
    setViewState('loading');
    setError(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResponse(data.data);
      setViewState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setViewState('input');
    }
  };

  const handleReset = () => {
    setViewState('input');
    setCurrentQuery('');
    setResponse(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {viewState === 'results' && (
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <span className="text-xl font-semibold text-slate-900">
                Article Group
              </span>
            </div>
            
            {viewState === 'results' && (
              <button
                onClick={handleReset}
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                New search
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-16">
        <AnimatePresence mode="wait">
          {viewState === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16"
            >
              {/* Hero */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  How can we help?
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Tell us about your challenge, and we&apos;ll show you relevant work 
                  and thinking from Article Group.
                </p>
              </div>

              {/* Query input */}
              <QueryInput onSubmit={handleSubmit} />

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm max-w-md"
                >
                  {error}
                </motion.div>
              )}

              {/* Starter prompts */}
              <div className="mt-12">
                <StarterPrompts onSelect={handleSubmit} />
              </div>
            </motion.div>
          )}

          {viewState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4"
            >
              <ThinkingState />
              
              {/* Show the query */}
              <p className="text-slate-500 text-center max-w-lg mt-8">
                &quot;{currentQuery}&quot;
              </p>
            </motion.div>
          )}

          {viewState === 'results' && response && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-12"
            >
              {/* Query recap */}
              <div className="max-w-3xl mx-auto mb-8 text-center">
                <p className="text-sm text-slate-500 mb-2">Your challenge:</p>
                <p className="text-lg text-slate-700 font-medium">
                  &quot;{currentQuery}&quot;
                </p>
              </div>

              {/* Response */}
              <ResponseRenderer 
                layout={response.layout} 
                assets={response.assets} 
              />

              {/* Footer info */}
              <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-500">
                  Response generated in {response.latency_ms}ms • 
                  Template: {response.template.name}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
