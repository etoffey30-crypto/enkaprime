import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

interface HomeProps {
  onNavigate: (page: string) => void;
  settings: Record<string, string>;
}

export default function Home({ onNavigate, settings }: HomeProps) {
  const [dbStats, setDbStats] = useState<any[]>([]);
  const [visibleStats, setVisibleStats] = useState<boolean>(false);

  // Read dynamic about preview bullets, split by comma
  const bulletsString = settings.about_bullets || 'Records Digitalisation & Document Management Systems, Asset Tagging and Asset Register Development, ISO Implementation and Audit Support, Training and Capacity Building';
  const bullets = bulletsString.split(',').map(s => s.trim()).filter(Boolean);

  // Read dynamic about pull quote
  const pullQuote = settings.about_pull_quote || 'We do not simply deliver training or isolated services — we help organisations build the systems, structures, and capabilities that drive long-term performance and institutional resilience.';

  // Dynamic Word Rotator state
  const [wordIndex, setWordIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Read dynamic phrases from settings, split by comma
  const phrasesString = settings.hero_rotator_words || 'Performance, Systems, Compliance, Capability, Accountability';
  const phrases = phrasesString.split(',').map(s => {
    const trimmed = s.trim();
    return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
  });

  // Particles state - generated once on mount
  const [particles] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2px to 6px
      left: Math.random() * 100, // %
      top: Math.random() * 100, // %
      delay: Math.random() * 6, // seconds
      duration: Math.random() * 8 + 6, // 6s to 14s
      opacity: Math.random() * 0.4 + 0.15 // 0.15 to 0.55
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % phrases.length);
        setIsTransitioning(false);
      }, 400); // matches fade transition duration
    }, 3500);
    return () => clearInterval(interval);
  }, [phrases.length]);

  const loadStats = useCallback(async () => {
    const { data } = await supabase.from('stats').select('*').eq('is_active', true).order('sort_order');
    if (data) setDbStats(data);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setVisibleStats(true);
        });
      },
      { threshold: 0.1 }
    );
    const stats = document.getElementById('stats-section');
    if (stats) observer.observe(stats);
    return () => observer.disconnect();
  }, []);

  const stats = dbStats.length > 0
    ? dbStats.map(s => ({ value: s.value, label: s.label }))
    : [
        { value: '500+', label: 'Professionals Trained' },
        { value: '15+', label: 'Training Programmes' },
        { value: '6', label: 'Core Disciplines' },
        { value: '100%', label: 'In-House Delivery' },
      ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src={settings.hero_image || "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg"}
            alt="Professional training"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-900/85 to-blue-900/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-transparent to-blue-900/60" />

          {/* Animated particle overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full bg-yellow-400/80 animate-float"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  opacity: p.opacity,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  boxShadow: `0 0 8px rgba(201, 168, 76, 0.6)`,
                }}
              />
            ))}
          </div>

          {/* Animated background shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-40" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-yellow-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-40 animate-delay-300" />
        </div>

        {/* Split Two-Column Content Layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col justify-center min-h-screen w-full animate-fade-in">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full mt-10 lg:mt-0">
            
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md animate-fade-in-down hover:scale-105 hover:bg-yellow-400/20 transition-all duration-300 self-center lg:self-start"
                style={{ background: 'rgba(201,168,76,0.25)', border: `1px solid ${GOLD}80`, color: GOLD }}
              >
                <Zap size={12} className="animate-pulse" />
                {settings.hero_badge_text || 'June 2026 Training Programmes Now Open'}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg animate-fade-in-up text-center lg:text-left" style={{ animationDelay: '100ms' }}>
                {settings.hero_title || 'Empowering People.'}
              </h1>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 drop-shadow-md animate-fade-in-up flex items-center gap-2 text-center lg:text-left" style={{ color: GOLD, animationDelay: '200ms' }}>
                Enhancing{' '}
                <span className="relative inline-block min-w-[140px] text-left">
                  <span className={`inline-block transition-all duration-400 transform ${isTransitioning ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                    {phrases[wordIndex]}
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-[2px] rounded-full bg-gradient-to-r from-yellow-500/20 via-yellow-400 to-yellow-500/20" />
                </span>
              </h2>

              <p className="text-base md:text-lg text-blue-100 max-w-xl mb-8 leading-relaxed drop-shadow-md animate-fade-in-up text-center lg:text-left" style={{ animationDelay: '300ms' }}>
                {settings.hero_description || 'Enka Prime Consulting delivers world-class, in-house corporate training across leadership, finance, safety, digital skills and professional development — transforming organisations from within.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up w-full sm:w-auto" style={{ animationDelay: '400ms' }}>
                <button
                  onClick={() => onNavigate('programmes')}
                  className="group flex items-center justify-center gap-2 px-8 py-4 font-bold text-base rounded tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] hover:-translate-y-0.5 relative overflow-hidden w-full sm:w-auto"
                  style={{ background: GOLD, color: NAVY }}
                >
                  View Programmes 
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="flex items-center justify-center gap-2 px-8 py-4 font-bold text-base rounded tracking-wide border-2 text-white transition-all duration-300 hover:bg-white/10 hover:border-yellow-400/50 backdrop-blur-sm hover:scale-105 hover:-translate-y-0.5 w-full sm:w-auto"
                  style={{ borderColor: 'rgba(255,255,255,0.4)' }}
                >
                  Contact Us <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Right Column: Premium Glassmorphic Console Dashboard Mockup */}
            <div className="lg:col-span-5 hidden lg:flex items-center justify-end w-full animate-fade-in-right" style={{ animationDelay: '200ms' }}>
              <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                {/* Decorative radial background glow */}
                <div className="absolute inset-0 bg-yellow-500/10 rounded-full filter blur-3xl animate-pulse-slow" />
                
                {/* The main dashboard mockup container */}
                <div className="relative w-full bg-slate-950/45 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-5 animate-float select-none">
                  {/* Console Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500/80" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[9px] text-blue-200/50 font-mono tracking-wider">ENKAPRIME_CONSOLE_V2.0</span>
                  </div>

                  {/* Widget 1: Active Class in Session */}
                  <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 hover:border-yellow-500/20">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[9px] text-yellow-400 font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Training
                      </span>
                      <span className="text-[8px] text-blue-200 bg-white/10 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">Leadership</span>
                    </div>
                    <h4 className="text-white text-xs font-semibold leading-relaxed text-left">
                      {settings.hero_widget_left_title || 'Records Digitalisation & Document Management'}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex -space-x-1.5">
                        {[
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80',
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80'
                        ].map((src, i) => (
                          <img key={i} src={src} className="w-5.5 h-5.5 rounded-full border border-slate-900 object-cover" alt="Student avatar" />
                        ))}
                        <div className="w-5.5 h-5.5 rounded-full bg-yellow-500 text-[8px] font-bold text-slate-900 flex items-center justify-center border border-slate-900">+48</div>
                      </div>
                      <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                        <Sparkles size={10} className="text-yellow-400 animate-pulse" />
                        Class Active
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full animate-pulse" style={{ width: '74%' }} />
                    </div>
                  </div>

                  {/* Widget 2: ISO Audit Success */}
                  <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-sm shadow-inner">
                        ✓
                      </div>
                      <div className="text-left">
                        <h4 className="text-white text-xs font-bold leading-tight">
                          {settings.hero_widget_right_title || '100% Audit Pass Rate'}
                        </h4>
                        <p className="text-[10px] text-blue-200">
                          {settings.hero_widget_right_desc || 'ISO 9001 / 27001 Implementation'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-yellow-400 bg-yellow-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider border border-yellow-500/20">
                      Certified
                    </span>
                  </div>
                </div>
                
                {/* Floating mini-badge */}
                <div className="absolute -bottom-3 -left-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 font-bold text-[10px] px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-1.5 animate-bounce"
                     style={{ animationDuration: '4s' }}>
                  <Zap size={10} className="fill-slate-900" />
                  <span>10+ Years Excellence</span>
                </div>
              </div>
            </div>

          </div>

          {/* Stats section placed beautifully across full width below columns */}
          <div id="stats-section" className="mt-16 lg:mt-24 grid grid-cols-2 md:grid-cols-4 gap-5 w-full">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className="group text-center p-6 rounded-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:bg-white/12 hover:border-yellow-500/50 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid rgba(201,168,76,0.3)`,
                  animation: visibleStats ? `slideInUp 0.6s ease-out ${idx * 100}ms both` : 'none'
                }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300" style={{ color: GOLD }}>
                  {stat.value}
                </div>
                <div className="text-sm text-blue-200 font-medium group-hover:text-white transition-colors duration-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Elegant Mouse Wheel Scroll Down */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer z-10"
             onClick={() => {
               const featuredCta = document.querySelector('section:nth-of-type(2)');
               featuredCta?.scrollIntoView({ behavior: 'smooth' });
             }}>
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-yellow-400 rounded-full animate-bounce" />
          </div>
          <span className="text-white text-[9px] font-bold tracking-widest uppercase">Scroll Down</span>
        </div>
      </section>

      {/* Featured CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings.cta_image || "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg"}
            alt="Team collaboration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}95, ${NAVY}85)` }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {settings.cta_title || 'Discover Our'}<br />
            <span style={{ color: GOLD }}>Training Disciplines</span>
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto drop-shadow-md">
            {settings.cta_description || 'Six core training areas designed to transform your team\'s capability and performance.'}
          </p>
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 px-10 py-4 font-bold text-lg rounded tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1"
            style={{ background: GOLD, color: NAVY }}
          >
            Explore Services <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative background accents */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]"
          style={{ background: `linear-gradient(135deg, ${GOLD}, transparent)` }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-5"
          style={{ background: GOLD }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* Section badge + title centred */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5 transition-all hover:scale-110"
              style={{ background: `${GOLD}22`, color: GOLD }}>
              About Enka Prime
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: NAVY }}>
              {settings.about_title || 'Who We Are'}<br />
              <span style={{ color: GOLD }}>Since Day One</span>
            </h2>
          </div>

          {/* Main two-column grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">

            {/* LEFT: Rich text content */}
            <div className="animate-fade-in-left space-y-6">
              <p className="text-gray-600 leading-relaxed text-lg transition-all hover:text-gray-800">
                {settings.about_description || 'Enka Prime Consulting Ltd is a professional services and organisational improvement firm dedicated to helping organisations strengthen operational systems, improve compliance, enhance accountability, and build workforce capability for sustainable performance. We support both public and private sector institutions through integrated solutions across four core service areas.'}
              </p>
              <p className="text-gray-600 leading-relaxed transition-all hover:text-gray-800">
                {settings.about_extended || 'Founded on the principle that sustainable organisational performance depends on strong systems rather than skills development alone, we combine practical implementation expertise with structured capacity-building methodologies to deliver measurable and lasting results. Every engagement is tailored to the client\'s operational context, every solution is designed for real-world application, every outcome is focused on efficiency, compliance, and institutional improvement.'}
              </p>

              {/* Dynamic service area bullets */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {bullets.map((item) => (
                  <div key={item} className="flex items-start gap-3 group">
                    <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: `${GOLD}22` }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm font-medium leading-snug group-hover:text-gray-900 transition-colors">{item}</span>
                  </div>
                ))}
              </div>

              {/* Dynamic Pull quote */}
              <p className="text-gray-500 text-sm italic border-l-4 pl-4 py-1 leading-relaxed text-left" style={{ borderColor: GOLD }}>
                {pullQuote}
              </p>

              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 px-8 py-3.5 font-bold rounded tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ background: GOLD, color: NAVY }}
              >
                Learn More <ArrowRight size={18} />
              </button>
            </div>

            {/* RIGHT: Image composition */}
            <div className="animate-fade-in-right">
              <div className="relative pb-10 md:pb-0">
                {/* Main image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                  <img
                    src={settings.about_image || "https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg"}
                    alt="Professional consulting"
                    className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
                  <div className="absolute inset-0 border-2 rounded-2xl" style={{ borderColor: `${GOLD}40` }} />
                </div>

                {/* Floating secondary image */}
                <div className="hidden md:block absolute -bottom-8 -right-5 w-44 h-32 rounded-xl overflow-hidden shadow-xl border-4 border-white">
                  <img
                    src={settings.team_image || "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg"}
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating badge */}
                <div className="hidden md:flex absolute -top-4 -left-4 rounded-2xl shadow-lg px-5 py-3 items-center gap-3"
                  style={{ background: NAVY, border: `2px solid ${GOLD}40` }}>
                  <div className="text-2xl font-bold" style={{ color: GOLD }}>10+</div>
                  <div className="text-xs text-blue-200 leading-tight">Years of<br/>Excellence</div>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3 mt-14">
                {[
                  { number: '500+', label: 'Organisations Served' },
                  { number: '4', label: 'Core Service Areas' },
                  { number: '100%', label: 'Tailored Solutions' },
                ].map(({ number, label }) => (
                  <div key={label}
                    className="text-center py-5 px-3 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ borderColor: `${GOLD}30`, background: `${NAVY}04` }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: GOLD }}>{number}</div>
                    <div className="text-xs text-gray-500 leading-tight">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
