'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useMemo, useEffect, useState } from 'react';
import { 
  ArrowRight, Sparkles, BookOpen, Briefcase, ChevronDown, 
  Quote, Star, Zap, Target, Play, ArrowUpRight, 
  CheckCircle, Users, TrendingUp, Award
} from 'lucide-react';
import type { Asset, Template } from '@/types';

interface DefaultTemplateProps {
  template: Template;
  query: string;
  narrative: string;
  assets: Asset[];
}

// Premium color palettes - carefully curated for maximum impact
const PALETTES = [
  { 
    name: 'Royal Indigo',
    gradient: 'from-indigo-950 via-purple-900 to-violet-950',
    accent: 'indigo',
    accentGradient: 'from-indigo-500 to-violet-500',
    glow: 'bg-indigo-500',
    text: 'text-indigo-400',
    textHover: 'group-hover:text-indigo-400',
    light: 'bg-indigo-950/30',
    badge: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
  },
  { 
    name: 'Ocean Depth',
    gradient: 'from-slate-950 via-cyan-950 to-slate-950',
    accent: 'cyan',
    accentGradient: 'from-cyan-400 to-teal-400',
    glow: 'bg-cyan-500',
    text: 'text-cyan-400',
    textHover: 'group-hover:text-cyan-400',
    light: 'bg-cyan-950/30',
    badge: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300',
  },
  { 
    name: 'Ember',
    gradient: 'from-slate-950 via-orange-950 to-red-950',
    accent: 'orange',
    accentGradient: 'from-orange-500 to-rose-500',
    glow: 'bg-orange-500',
    text: 'text-orange-400',
    textHover: 'group-hover:text-orange-400',
    light: 'bg-orange-950/30',
    badge: 'bg-orange-500/20 border-orange-500/30 text-orange-300',
  },
  { 
    name: 'Emerald Night',
    gradient: 'from-slate-950 via-emerald-950 to-slate-950',
    accent: 'emerald',
    accentGradient: 'from-emerald-400 to-teal-400',
    glow: 'bg-emerald-500',
    text: 'text-emerald-400',
    textHover: 'group-hover:text-emerald-400',
    light: 'bg-emerald-950/30',
    badge: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  },
  { 
    name: 'Rose Gold',
    gradient: 'from-slate-950 via-rose-950 to-pink-950',
    accent: 'rose',
    accentGradient: 'from-rose-400 to-pink-400',
    glow: 'bg-rose-500',
    text: 'text-rose-400',
    textHover: 'group-hover:text-rose-400',
    light: 'bg-rose-950/30',
    badge: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
  },
];

// Generate consistent palette based on query
function usePalette(query: string, templateSlug: string) {
  return useMemo(() => {
    let hash = 0;
    const str = query + templateSlug;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return PALETTES[Math.abs(hash) % PALETTES.length];
  }, [query, templateSlug]);
}

// Magnetic cursor effect for hero
function MagneticButton({ children, className, href }: { children: React.ReactNode; className?: string; href?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.15;
    const y = (clientY - top - height / 2) * 0.15;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href={href || '#'}
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.a>
  );
}

// Animated counter
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Reveal text animation
function RevealText({ children, className, delay = 0 }: { children: string; className?: string; delay?: number }) {
  const words = children.split(' ');
  
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              delay: delay + i * 0.04,
              duration: 0.5,
              ease: [0.33, 1, 0.68, 1]
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// Floating particles
function Particles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 ${color} rounded-full opacity-40`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

export function DefaultTemplate({ template, query, narrative, assets }: DefaultTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const palette = usePalette(query, template.slug);
  
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  
  const caseStudies = assets.filter(a => 
    a.type === 'case_study' || (a.metadata as Record<string, unknown>)?.is_case_study
  );
  const articles = assets.filter(a => 
    a.type === 'article' && !(a.metadata as Record<string, unknown>)?.is_case_study
  );

  // Stats for social proof
  const stats = [
    { value: 50, suffix: '+', label: 'Projects Delivered', icon: Briefcase },
    { value: 95, suffix: '%', label: 'Client Satisfaction', icon: Star },
    { value: 10, suffix: 'x', label: 'Average ROI', icon: TrendingUp },
  ];

  return (
    <div ref={containerRef} className="bg-slate-950 min-h-screen text-white overflow-hidden">
      
      {/* ============================================ */}
      {/* HERO - Full Screen Cinematic Experience */}
      {/* ============================================ */}
      <section ref={heroRef} className={`relative min-h-screen flex items-center bg-gradient-to-br ${palette.gradient}`}>
        
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className={`absolute top-1/4 left-1/4 w-[800px] h-[800px] ${palette.glow} rounded-full opacity-20 blur-[150px]`}
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className={`absolute bottom-1/4 right-1/4 w-[600px] h-[600px] ${palette.glow} rounded-full opacity-10 blur-[120px]`}
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Floating particles */}
        <Particles color={palette.glow} />

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto px-6 w-full py-32"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div className="max-w-5xl">
            
            {/* Eyebrow */}
            <motion.div 
              className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-sm mb-10 ${palette.badge}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${palette.accentGradient} animate-pulse`} />
              <span className="text-sm font-medium tracking-wide">{template.name}</span>
            </motion.div>

            {/* Main headline - The Query */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8">
              <RevealText delay={0.3}>{query}</RevealText>
            </h1>

            {/* Subheadline */}
            <motion.p 
              className="text-xl md:text-2xl text-white/60 max-w-2xl leading-relaxed mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {template.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <MagneticButton 
                href="#work"
                className={`group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${palette.accentGradient} rounded-full font-semibold text-slate-950 hover:shadow-2xl hover:shadow-${palette.accent}-500/25 transition-all duration-300`}
              >
                Explore Our Work
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
              
              <MagneticButton 
                href="#contact"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold border border-white/20 hover:bg-white/5 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                Watch Showreel
              </MagneticButton>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              className="flex flex-col items-center gap-3 text-white/40"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* ============================================ */}
      {/* SOCIAL PROOF - Trust Bar */}
      {/* ============================================ */}
      <section className="relative py-20 px-6 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <stat.icon className={`w-6 h-6 ${palette.text} mx-auto mb-4 opacity-60`} />
                <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${palette.accentGradient} bg-clip-text text-transparent`}>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/40 text-sm mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* NARRATIVE - The Strategic Story */}
      {/* ============================================ */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            {/* Quote mark */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            >
              <Quote className={`w-20 h-20 ${palette.text} opacity-20 mb-8`} />
            </motion.div>
            
            {/* Narrative text */}
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-white/90">
              {narrative}
            </blockquote>
            
            {/* Accent line */}
            <motion.div 
              className={`mt-12 h-1 bg-gradient-to-r ${palette.accentGradient} rounded-full`}
              initial={{ width: 0 }}
              whileInView={{ width: 120 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            
            {/* Attribution */}
            <div className="mt-8 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${palette.accentGradient} flex items-center justify-center`}>
                <Sparkles className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="font-semibold">Article Group</div>
                <div className="text-white/40 text-sm">Strategic Communications</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CASE STUDIES - Featured Work */}
      {/* ============================================ */}
      {caseStudies.length > 0 && (
        <section id="work" className="relative py-32 px-6">
          {/* Background accent */}
          <div className={`absolute inset-0 ${palette.light}`} />
          
          <div className="relative max-w-7xl mx-auto">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${palette.accentGradient} flex items-center justify-center`}
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  <Briefcase className="w-6 h-6 text-slate-950" />
                </motion.div>
                <span className={`${palette.text} font-semibold tracking-wide uppercase text-sm`}>Featured Work</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold">
                Stories that <span className={`bg-gradient-to-r ${palette.accentGradient} bg-clip-text text-transparent`}>inspire</span>
              </h2>
            </motion.div>

            {/* Bento grid layout */}
            <div className="grid md:grid-cols-2 gap-6">
              {caseStudies.map((asset, i) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className={i === 0 ? 'md:col-span-2' : ''}
                >
                  <a href={`/asset/${asset.id}`} className="group block h-full">
                    <div className={`relative h-full overflow-hidden rounded-3xl bg-slate-900 border border-white/5 hover:border-white/20 transition-all duration-500 ${i === 0 ? 'p-10 md:p-14' : 'p-8'}`}>
                      
                      {/* Hover gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${palette.accentGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                      
                      {/* Corner accent */}
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${palette.accentGradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                      
                      <div className="relative z-10">
                        {/* Client badge */}
                        {asset.client && (
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${palette.badge} text-xs font-medium mb-6`}>
                            <CheckCircle className="w-3 h-3" />
                            {asset.client}
                          </div>
                        )}
                        
                        {/* Title */}
                        <h3 className={`font-bold text-white transition-colors ${i === 0 ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'} ${palette.textHover}`}>
                          {asset.title}
                        </h3>
                        
                        {/* Description */}
                        <p className={`text-white/50 mt-4 leading-relaxed ${i === 0 ? 'text-lg max-w-2xl' : ''} line-clamp-2`}>
                          {asset.description || asset.content?.substring(0, 150) + '...'}
                        </p>
                        
                        {/* CTA */}
                        <div className={`flex items-center gap-2 mt-8 ${palette.text} font-semibold`}>
                          <span>View case study</span>
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* ARTICLES - Thought Leadership */}
      {/* ============================================ */}
      {articles.length > 0 && (
        <section className="relative py-32 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${palette.accentGradient} flex items-center justify-center`}
                  whileHover={{ rotate: -5, scale: 1.05 }}
                >
                  <BookOpen className="w-6 h-6 text-slate-950" />
                </motion.div>
                <span className={`${palette.text} font-semibold tracking-wide uppercase text-sm`}>Perspectives</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Ideas that <span className={`bg-gradient-to-r ${palette.accentGradient} bg-clip-text text-transparent`}>move</span>
              </h2>
            </motion.div>

            {/* Articles grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 6).map((asset, i) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <a href={`/asset/${asset.id}`} className="group block h-full">
                    <div className="relative h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300">
                      
                      {/* Number badge */}
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${palette.accentGradient} text-slate-950 font-bold text-sm mb-6`}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      
                      {/* Title */}
                      <h3 className={`font-semibold text-white text-lg leading-snug ${palette.textHover} transition-colors`}>
                        {asset.title}
                      </h3>
                      
                      {/* Arrow */}
                      <div className="mt-6">
                        <ArrowRight className={`w-5 h-5 text-white/30 ${palette.textHover} group-hover:translate-x-2 transition-all`} />
                      </div>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* CTA - Final Conversion */}
      {/* ============================================ */}
      <section id="contact" className="relative py-40 px-6 overflow-hidden">
        {/* Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${palette.gradient}`} />
        
        {/* Glow effect */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] ${palette.glow} opacity-20 blur-[200px] rounded-full`} />
        
        <motion.div 
          className="relative max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Icon */}
          <motion.div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${palette.accentGradient} mb-10`}
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Zap className="w-10 h-10 text-slate-950" />
          </motion.div>
          
          {/* Headline */}
          <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Ready to create<br />
            <span className={`bg-gradient-to-r ${palette.accentGradient} bg-clip-text text-transparent`}>something extraordinary?</span>
          </h2>
          
          {/* Subtext */}
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Let&apos;s discuss how we can help transform your vision into compelling stories that drive real results.
          </p>
          
          {/* CTA */}
          <MagneticButton
            href="#"
            className={`inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-950 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-white/20 transition-all duration-300`}
          >
            Start a conversation
            <ArrowRight className="w-5 h-5" />
          </MagneticButton>
          
          {/* Trust badges */}
          <div className="mt-16 flex items-center justify-center gap-8 text-white/30">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">Award-winning work</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Fortune 500 clients</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">15+ years experience</span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
