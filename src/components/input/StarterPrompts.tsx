'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StarterPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const STARTER_PROMPTS = [
  {
    label: "Executive Keynote",
    prompt: "I need help developing a keynote for our CEO at a major industry conference",
    icon: "🎤",
  },
  {
    label: "Product Launch",
    prompt: "We're launching a new enterprise product and need a compelling go-to-market narrative",
    icon: "🚀",
  },
  {
    label: "Technical Translation",
    prompt: "We need to explain our complex technology to non-technical buyers without dumbing it down",
    icon: "🔬",
  },
  {
    label: "Brand Refresh",
    prompt: "Our brand has evolved but our messaging hasn't kept up. We need a refresh.",
    icon: "✨",
  },
  {
    label: "Developer Marketing",
    prompt: "We're launching an API and need to build credibility with the developer community",
    icon: "👩‍💻",
  },
  {
    label: "Internal Comms",
    prompt: "We're going through a major transformation and need to bring our employees along",
    icon: "🏢",
  },
];

export function StarterPrompts({ onSelect, disabled = false }: StarterPromptsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <p className="text-center text-sm text-slate-500 mb-4">
        Or start with one of these:
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STARTER_PROMPTS.map((item, index) => (
          <motion.button
            key={item.label}
            onClick={() => onSelect(item.prompt)}
            disabled={disabled}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={cn(
              "group p-4 rounded-xl text-left transition-all duration-200",
              "bg-white border border-slate-200",
              "hover:border-blue-300 hover:shadow-md hover:scale-[1.02]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            <span className="text-2xl mb-2 block">{item.icon}</span>
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
