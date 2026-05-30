import { useEffect, useState, useCallback } from 'react';
import { 
  ArrowRight, ChevronRight, Zap, Sparkles, Award, Shield, 
  TrendingUp, Monitor, BookOpen, CheckCircle, Building, 
  Briefcase, Landmark, HardHat, Database, Users2 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HomeProps {
  onNavigate: (page: string) => void;
  settings: Record<string, string>;
}

// Fallback services
const FALLBACK_SERVICES = [
  { code: 'LMT', title: 'Leadership & Management', description: 'Strategic leadership, supervisory excellence, accountability and decision-making for modern managers.', image_url: 'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg' },
  { code: 'CST', title: 'Customer Service Training', description: 'Excellence in client relationship management, frontline service delivery and building customer-centric cultures.', image_url: 'https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg' },
  { code: 'HSE', title: 'Health, Safety & Environment', description: 'Workplace safety, risk prevention, defensive driving and fleet management for organisational compliance.', image_url: 'https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg' },
];

// Industries served data
const INDUSTRIES = [
  { icon: Briefcase, title: 'Corporate & Consulting', desc: 'Accelerating business development, strategic management, and project execution.' },
  { icon: Landmark, title: 'Financial & Banking', desc: 'Strengthening internal controls, compliance reporting, and client relationship management.' },
  { icon: HardHat, title: 'Oil & Gas / Energy', desc: 'Upholding strict HSE protocols, risk mitigation, and technical supervisory competence.' },
  { icon: Database, title: 'Digital & Telecommunications', desc: 'Building data analysis skills, Excel automation, and high-performance digital workflows.' },
  { icon: Users2, title: 'Public Sector & NGOs', desc: 'Establishing transparent systems, compliance records, and public leadership accountability.' },
  { icon: Building, title: 'Manufacturing & Hospitality', desc: 'Embedding customer-centric frontline teams and efficient operational standards.' },
];

export default function Home({ onNavigate, settings }: HomeProps) {
  const [dbStats, setDbStats] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);
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
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 6,
      duration: Math.random() * 8 + 6,
      opacity: Math.random() * 0.4 + 0.15
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % phrases.length);
        setIsTransitioning(false);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, [phrases.length]);

  const loadData = useCallback(async () => {
    const [statsRes, servicesRes] = await Promise.all([
      supabase.from('stats').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('services').select('*').eq('is_active', true).order('sort_order'),
    ]);
    if (statsRes.data) setDbStats(statsRes.data);
    if (servicesRes.data && servicesRes.data.length > 0) setDbServices(servicesRes.data);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setVisibleStats(true);
        });
      },
      { threshold: 0.1 }
    );
    const statsEl = document.getElementById('stats-section');
    if (statsEl) observer.observe(statsEl);
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

  const services = dbServices.length > 0 ? dbServices : FALLBACK_SERVICES;

  // Parse modular homepage order and visibility
  const getModules = () => {
    try {
      if (settings.homepage_modules) {
        const modulesData = JSON.parse(settings.homepage_modules);
        if (Array.isArray(modulesData) && modulesData.length > 0) {
          return modulesData;
        }
      }
    } catch (e) {
      console.error('Error parsing homepage modules config:', e);
    }
    // Default fallback layout order
    return [
      { id: 'hero', type: 'hero', is_visible: true },
      { id: 'cta', type: 'cta', is_visible: true },
      { id: 'about_preview', type: 'about_preview', is_visible: true },
      { id: 'services', type: 'services', is_visible: true },
      { id: 'industries', type: 'industries', is_visible: true },
      { id: 'why_choose_us', type: 'why_choose_us', is_visible: true }
    ];
  };

  const modules = getModules();

  // 1. HERO BANNER SECTION
  const renderHero = () => (
    <section key="hero" id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0">
        <img
          src={settings.hero_image || "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg"}
          alt="Professional training"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-900/85 to-blue-900/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-transparent to-blue-900/60" />

        {/* Animated particles */}
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

        {/* Dynamic Glow Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-40" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-yellow-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-40 animate-delay-300" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col justify-center min-h-screen w-full animate-fade-in">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full mt-10 lg:mt-0">
          
          {/* Headline & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
            <div
              className="button-custom inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md animate-fade-in-down hover:scale-105 hover:bg-yellow-400/20 transition-all duration-300 self-center lg:self-start border border-custom-secondary/40"
              style={{ background: 'rgba(201,168,76,0.25)', color: 'var(--secondary-color)' }}
            >
              <Zap size={12} className="animate-pulse text-custom-secondary" />
              {settings.hero_badge_text || 'June 2026 Training Programmes Now Open'}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg animate-fade-in-up text-center lg:text-left" style={{ animationDelay: '100ms' }}>
              {settings.hero_title || 'Empowering People.'}
            </h1>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 drop-shadow-md animate-fade-in-up flex items-center gap-2 text-center lg:text-left text-custom-secondary animate-delay-200" style={{ animationDelay: '200ms' }}>
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
                className="button-custom bg-custom-secondary text-custom-primary group flex items-center justify-center gap-2 px-8 py-4 font-bold text-base tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] hover:-translate-y-0.5 relative overflow-hidden w-full sm:w-auto"
              >
                View Programmes 
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="button-custom flex items-center justify-center gap-2 px-8 py-4 font-bold text-base tracking-wide border-2 border-white/40 text-white transition-all duration-300 hover:bg-white/10 hover:border-yellow-400/50 backdrop-blur-sm hover:scale-105 hover:-translate-y-0.5 w-full sm:w-auto"
              >
                Contact Us <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Premium Glassmorphic Console Dashboard */}
          <div className="lg:col-span-5 hidden lg:flex items-center justify-end w-full animate-fade-in-right" style={{ animationDelay: '200ms' }}>
            <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-500/10 rounded-full filter blur-3xl animate-pulse-slow" />
              
              <div className="relative w-full bg-slate-950/45 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-5 animate-float select-none">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/80" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[9px] text-blue-200/50 font-mono tracking-wider">ENKAPRIME_CONSOLE_V2.0</span>
                </div>

                {/* Active Training Widget */}
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 hover:border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[9px] text-custom-secondary font-bold uppercase tracking-wider">
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
                      <div className="w-5.5 h-5.5 rounded-full bg-custom-secondary text-[8px] font-bold text-slate-900 flex items-center justify-center border border-slate-900">+48</div>
                    </div>
                    <span className="text-[10px] font-bold text-custom-secondary flex items-center gap-1">
                      <Sparkles size={10} className="text-custom-secondary animate-pulse" />
                      Class Active
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1">
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full rounded-full animate-pulse" style={{ width: '74%' }} />
                  </div>
                </div>

                {/* Audit success widget */}
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-custom-secondary font-bold text-sm shadow-inner">
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
                  <span className="text-[8px] font-bold text-custom-secondary bg-yellow-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider border border-yellow-500/20">
                    Certified
                  </span>
                </div>
              </div>
              
              <div className="absolute -bottom-3 -left-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 font-bold text-[10px] px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-1.5 animate-bounce"
                   style={{ animationDuration: '4s' }}>
                <Zap size={10} className="fill-slate-900" />
                <span>10+ Years Excellence</span>
              </div>
            </div>
          </div>

        </div>

        {/* Stats counter */}
        <div id="stats-section" className="mt-16 lg:mt-24 grid grid-cols-2 md:grid-cols-4 gap-5 w-full">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="group text-center p-6 rounded-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:bg-white/12 hover:border-custom-secondary hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: `1px solid rgba(201,168,76,0.3)`,
                animation: visibleStats ? `slideInUp 0.6s ease-out ${idx * 100}ms both` : 'none'
              }}
            >
              <div className="text-3xl md:text-4xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300 text-custom-secondary">
                {stat.value}
              </div>
              <div className="text-sm text-blue-200 font-medium group-hover:text-white transition-colors duration-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer z-10"
           onClick={() => {
             const nextSection = document.getElementById('hero')?.nextElementSibling;
             nextSection?.scrollIntoView({ behavior: 'smooth' });
           }}>
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-custom-secondary rounded-full animate-bounce" />
        </div>
        <span className="text-white text-[9px] font-bold tracking-widest uppercase">Scroll Down</span>
      </div>
    </section>
  );

  // 2. DISCIPLINE / CALL TO ACTION BANNER
  const renderCTA = () => (
    <section key="cta" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={settings.cta_image || "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg"}
          alt="Team collaboration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-custom-primary/90" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10 animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
          {settings.cta_title || 'Discover Our'}<br />
          <span className="text-custom-secondary">{settings.cta_discipline_highlight || 'Training Disciplines'}</span>
        </h2>
        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto drop-shadow-md">
          {settings.cta_description || 'Six core training areas designed to transform your team\'s capability and performance.'}
        </p>
        <button
          onClick={() => onNavigate('services')}
          className="button-custom bg-custom-secondary text-custom-primary inline-flex items-center gap-2 px-10 py-4 font-bold text-lg tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1"
        >
          Explore Services <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );

  // 3. ABOUT PREVIEW SECTION
  const renderAboutPreview = () => (
    <section key="about_preview" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] bg-gradient-to-br from-custom-secondary to-transparent" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-5 bg-custom-secondary" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5 transition-all hover:scale-110"
            style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--secondary-color)' }}>
            About Enka Prime
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-custom-primary">
            {settings.about_title || 'Who We Are'}<br />
            <span className="text-custom-secondary">Since Day One</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
          
          {/* Left Text */}
          <div className="animate-fade-in-left space-y-6 text-left">
            <p className="text-gray-600 leading-relaxed text-lg transition-all hover:text-gray-800">
              {settings.about_description || 'Enka Prime Consulting Ltd is a professional services and organisational improvement firm dedicated to helping organisations strengthen operational systems, improve compliance, enhance accountability, and build workforce capability for sustainable performance.'}
            </p>
            <p className="text-gray-600 leading-relaxed transition-all hover:text-gray-800">
              {settings.about_extended || 'Founded on the principle that sustainable organisational performance depends on strong systems rather than skills development alone, we combine practical implementation expertise with structured capacity-building methodologies.'}
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {bullets.map((item) => (
                <div key={item} className="flex items-start gap-3 group">
                  <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-custom-secondary/15">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="var(--secondary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm font-medium leading-snug group-hover:text-gray-900 transition-colors">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-gray-500 text-sm italic border-l-4 border-custom-secondary pl-4 py-1 leading-relaxed text-left">
              {pullQuote}
            </p>

            <button
              onClick={() => onNavigate('about')}
              className="button-custom bg-custom-secondary text-custom-primary inline-flex items-center gap-2 px-8 py-3.5 font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Learn More <ArrowRight size={18} />
            </button>
          </div>

          {/* Right composition */}
          <div className="animate-fade-in-right">
            <div className="relative pb-10 md:pb-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group border-2 border-custom-secondary/20">
                <img
                  src={settings.about_image || "https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg"}
                  alt="Professional consulting"
                  className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
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
              <div className="hidden md:flex absolute -top-4 -left-4 rounded-2xl shadow-lg px-5 py-3 items-center gap-3 bg-custom-primary border border-custom-secondary/35">
                <div className="text-2xl font-bold text-custom-secondary">10+</div>
                <div className="text-xs text-blue-200 leading-tight text-left">Years of<br/>Excellence</div>
              </div>
            </div>

            {/* Stat mini cards */}
            <div className="grid grid-cols-3 gap-3 mt-14">
              {[
                { number: '500+', label: 'Organisations Served' },
                { number: '4', label: 'Core Service Areas' },
                { number: '100%', label: 'Tailored Solutions' },
              ].map(({ number, label }) => (
                <div key={label}
                  className="text-center py-5 px-3 rounded-xl border border-custom-secondary/20 bg-custom-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-2xl font-bold mb-1 text-custom-secondary">{number}</div>
                  <div className="text-xs text-gray-500 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // 4. DYNAMIC SERVICES GRID MODULE
  const renderServicesBlock = () => {
    // Icons map for database dynamic matching
    const iconMap: Record<string, any> = { 
      LMT: Users2, CST: Award, HSE: Shield, AFT: TrendingUp, DDT: Monitor, GEN: BookOpen 
    };

    return (
      <section key="services" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
              style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--secondary-color)' }}>
              Our Capabilities
            </div>
            <h2 className="text-4xl font-bold text-custom-primary">
              Core Training <span className="text-custom-secondary">Disciplines</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mt-3 text-sm">
              Tailored learning structures designed to resolve operational friction and elevate personnel performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, idx) => {
              const Icon = iconMap[service.code] || BookOpen;
              return (
                <div
                  key={service.code}
                  className="group relative overflow-hidden rounded-2xl shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 flex flex-col bg-white text-left hover:border-custom-secondary/40"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-xl flex items-center justify-center bg-white/95 shadow-lg group-hover:bg-custom-secondary transition-colors duration-300">
                      <Icon size={22} className="text-custom-primary group-hover:text-white" />
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase text-custom-secondary mb-1.5 block">
                        {service.code} Discipline
                      </span>
                      <h3 className="text-lg font-bold text-custom-primary mb-2.5 transition-colors duration-300 group-hover:text-custom-secondary">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-xs leading-relaxed mb-4">
                        {service.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('services')}
                      className="flex items-center gap-1 text-xs font-bold text-custom-secondary mt-2 hover:gap-2 transition-all"
                    >
                      Learn More <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // 5. NEW STUNNING INDUSTRIES SERVED MODULE
  const renderIndustriesBlock = () => (
    <section key="industries" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--secondary-color)' }}>
            Sectors We Serve
          </div>
          <h2 className="text-4xl font-bold text-custom-primary">
            Targeted Solutions by <span className="text-custom-secondary">Industry</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mt-3 text-sm">
            We adapt our curriculum to match the unique operational standards and compliance needs of various sectors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INDUSTRIES.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <div 
                key={ind.title}
                className="p-8 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-custom-secondary/40 transition-all duration-300 text-left hover:shadow-xl hover:-translate-y-1.5 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-custom-primary/5 text-custom-primary mb-5 group-hover:bg-custom-secondary group-hover:text-white transition-colors duration-300">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-custom-primary mb-2 group-hover:text-custom-secondary transition-colors duration-300">
                  {ind.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {ind.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  // 6. WHY CHOOSE US HIGHLIGHTS MODULE
  const renderWhyChooseUsBlock = () => (
    <section key="why_choose_us" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--secondary-color)' }}>
            The Enka Advantage
          </div>
          <h2 className="text-4xl font-bold text-custom-primary animate-delay-100">
            Why Partner With <span className="text-custom-secondary">Enka Prime?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'In-House Convenience', desc: 'All sessions delivered directly at your organization\'s facility to build team synergy.' },
            { title: 'Actionable & Practical', desc: 'We skip theoretical bloat, focusing entirely on workflows, checklists, and execution.' },
            { title: 'Deep Industry Experts', desc: 'Our corporate trainers are seasoned executives who have managed complex organizational frameworks.' },
            { title: 'Structured Systems Focus', desc: 'We address structural capability alongside personal skills to drive long-term resilience.' }
          ].map((item, idx) => (
            <div 
              key={item.title}
              className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-custom-secondary/40 transition-all duration-300 text-left group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-custom-secondary/15 text-custom-secondary mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle size={20} />
              </div>
              <h4 className="font-bold text-sm text-custom-primary mb-2 group-hover:text-custom-secondary transition-colors">
                {item.title}
              </h4>
              <p className="text-gray-500 text-xs leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white overflow-hidden font-custom text-gray-800">
      {modules.map(mod => {
        if (!mod.is_visible) return null;
        switch (mod.type) {
          case 'hero':
            return renderHero();
          case 'cta':
            return renderCTA();
          case 'about_preview':
            return renderAboutPreview();
          case 'services':
            return renderServicesBlock();
          case 'industries':
            return renderIndustriesBlock();
          case 'why_choose_us':
            return renderWhyChooseUsBlock();
          default:
            return null;
        }
      })}
    </div>
  );
}
