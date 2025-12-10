'use client';

import { motion } from 'framer-motion';

interface StrategicBridgeProps {
  narrative: string;
}

export function StrategicBridge({ narrative }: StrategicBridgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mb-12"
    >
      <div className="relative">
        {/* Decorative quote mark */}
        <span className="absolute -top-4 -left-4 text-6xl text-blue-100 font-serif select-none">
          &ldquo;
        </span>
        
        <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-light pl-8 pr-4">
          {narrative}
        </p>
        
        {/* Decorative line */}
        <div className="mt-6 ml-8 w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
      </div>
    </motion.div>
  );
}
