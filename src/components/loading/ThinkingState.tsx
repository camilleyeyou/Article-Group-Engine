'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const THINKING_MESSAGES = [
  "Understanding your challenge...",
  "Finding relevant work...",
  "Curating the best examples...",
  "Building your presentation...",
];

export function ThinkingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto py-16"
    >
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Animated logo/icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        
        {/* Thinking messages */}
        <div className="h-8 overflow-hidden">
          <motion.div
            animate={{ y: [0, -32, -64, -96, 0] }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1]
            }}
            className="flex flex-col items-center"
          >
            {THINKING_MESSAGES.map((message, index) => (
              <span 
                key={index} 
                className="h-8 flex items-center text-slate-600 text-lg"
              >
                {message}
              </span>
            ))}
          </motion.div>
        </div>
        
        {/* Progress dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity,
                delay: index * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-blue-500"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
