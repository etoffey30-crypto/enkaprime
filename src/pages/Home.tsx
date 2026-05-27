import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, ChevronRight, Zap } from 'lucide-react';
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

          {/* Animated background elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-40" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-yellow-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-40 animate-delay-300" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center py-32">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-md animate-fade-in-down"
            style={{ background: 'rgba(201,168,76,0.25)', border: `1px solid ${GOLD}80`, color: GOLD }}
          >
            <Zap size={12} />
            {settings.hero_badge_text || 'June 2026 Training Programmes Now Open'}
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {settings.hero_title || 'Empowering People.'}
            <br />
            <span className="animate-fade-in-up inline-block" style={{ color: GOLD, animationDelay: '200ms' }}>
              {settings.hero_subtitle || 'Enhancing Performance.'}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-10 drop-shadow-md animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {settings.hero_description || 'Enka Prime Consulting delivers world-class, in-house corporate training across leadership, finance, safety, digital skills and professional development — transforming organisations from within.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <button
              onClick={() => onNavigate('programmes')}
              className="flex items-center gap-2 px-8 py-4 font-bold text-base rounded tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1"
              style={{ background: GOLD, color: NAVY }}
            >
              View Programmes <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="flex items-center gap-2 px-8 py-4 font-bold text-base rounded tracking-wide border-2 text-white transition-all duration-300 hover:bg-white/10 backdrop-blur-sm hover:scale-105"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Contact Us <ChevronRight size={18} />
            </button>
          </div>

          <div id="stats-section" className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-2xl backdrop-blur-sm transition-all duration-500 hover:scale-110 hover:shadow-xl"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid rgba(201,168,76,0.3)`,
                  animation: visibleStats ? `slideInUp 0.6s ease-out ${idx * 100}ms both` : 'none'
                }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: GOLD }}>{stat.value}</div>
                <div className="text-sm text-blue-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <div className="w-px h-10 bg-white" />
          <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
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
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-3"
          style={{ background: `linear-gradient(135deg, ${GOLD}, transparent)` }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 transition-all hover:scale-110"
                style={{ background: `${GOLD}22`, color: GOLD }}>
                About Enka Prime
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: NAVY }}>
                {settings.about_title || 'Delivering Excellence'}<br />
                <span style={{ color: GOLD }}>Since Day One</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-lg transition-all hover:text-gray-800">
                {settings.about_description || 'Enka Prime Consulting Ltd is a professional corporate training firm committed to empowering individuals and organisations through high-impact, practical skill development programmes.'}
              </p>
              <p className="text-gray-600 leading-relaxed mb-8 transition-all hover:text-gray-800">
                {settings.about_extended || 'Our trainers bring deep industry experience across leadership, finance, health & safety, digital transformation and professional development.'}
              </p>
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 px-8 py-3.5 font-bold rounded tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ background: GOLD, color: NAVY }}
              >
                Learn More <ArrowRight size={18} />
              </button>
            </div>

            <div className="animate-fade-in-right">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <img
                  src={settings.about_image || "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg"}
                  alt="Diverse team"
                  className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                <div className="absolute inset-0 border-2 rounded-2xl" style={{ borderColor: `${GOLD}40` }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
