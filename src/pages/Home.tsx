import { useEffect, useState, useCallback } from 'react';
import { 
  ArrowRight, ChevronRight, Zap, Award, Shield, 
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
  { code: 'records', title: 'Records Digitalisation', description: 'Structured digital records, document workflows, metadata tagging, and secure retrieval systems for stronger institutional memory.', image_url: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg' },
  { code: 'asset', title: 'Asset Tagging & Registers', description: 'Physical asset verification, barcode or QR tagging, register development, and lifecycle visibility across locations.', image_url: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg' },
  { code: 'iso', title: 'ISO Implementation Support', description: 'Gap assessments, process documentation, internal audit support, and ISO-aligned systems for operational consistency.', image_url: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg' },
  { code: 'training', title: 'Training & Capacity Building', description: 'Custom in-house programmes that strengthen workforce capability, compliance culture, and practical workplace performance.', image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg' },
];

// Industries served data
const INDUSTRIES = [
  { icon: Briefcase, title: 'SMEs & Growing Businesses', desc: 'Practical systems, records, compliance, and people-capability support for structured growth.', image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg' },
  { icon: Landmark, title: 'Financial & Professional Services', desc: 'Governance, documentation, control, and audit-readiness support for regulated environments.', image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg' },
  { icon: HardHat, title: 'Energy, Construction & Operations', desc: 'Asset visibility, compliance routines, safety documentation, and operational accountability.', image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg' },
  { icon: Users2, title: 'Public Sector & NGOs', desc: 'Transparent institutional systems, compliant records, and capacity-building for public value.', image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg' },
  { icon: Building, title: 'Manufacturing & Hospitality', desc: 'Reliable workflows, frontline standards, asset controls, and customer-facing team performance.', image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg' },
  { icon: Database, title: 'Technology & Telecommunications', desc: 'Data discipline, digital records, process controls, and high-performance operational routines.', image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg' },
];

export default function Home({ onNavigate, settings }: HomeProps) {
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
    const servicesRes = await supabase.from('services').select('*').eq('is_active', true).order('sort_order');
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

  const stats = [
    { value: '20+', label: 'SMEs Supported' },
    { value: '15+', label: 'Professional Programmes' },
    { value: '4', label: 'Core Service Pillars' },
    { value: '100%', label: 'Customized Solutions' },
  ];

  const services = (dbServices.length > 0 ? dbServices : FALLBACK_SERVICES).slice(0, 4);

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
    <section key="hero" id="hero" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-32 flex flex-col justify-center min-h-[100svh] w-full animate-fade-in">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center justify-center w-full mt-6 lg:mt-0">
          
          {/* Headline & CTAs */}
          <div className="lg:col-span-8 lg:col-start-3 flex flex-col items-center text-center w-full">
            <div
              className="button-custom inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md animate-fade-in-down hover:scale-105 hover:bg-yellow-400/20 transition-all duration-300 self-center border border-custom-secondary/40"
              style={{ background: 'rgba(201,168,76,0.25)', color: 'var(--secondary-color)' }}
            >
              <Zap size={12} className="animate-pulse text-custom-secondary" />
              {settings.hero_badge_text || 'June 2026 Training Programmes Now Open'}
            </div>

            <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg animate-fade-in-up text-center" style={{ animationDelay: '100ms' }}>
              {settings.hero_title || 'Empowering People.'}
            </h1>

            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-6 drop-shadow-md animate-fade-in-up flex flex-wrap items-center justify-center gap-2 text-center text-custom-secondary animate-delay-200" style={{ animationDelay: '200ms' }}>
              Enhancing{' '}
              <span className="relative inline-block min-w-[140px] text-left">
                <span className={`inline-block transition-all duration-400 transform ${isTransitioning ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                  {phrases[wordIndex]}
                </span>
                <span className="absolute bottom-0 left-0 w-full h-[2px] rounded-full bg-gradient-to-r from-yellow-500/20 via-yellow-400 to-yellow-500/20" />
              </span>
            </h2>

            <p className="text-base md:text-lg text-blue-100 max-w-2xl mb-8 leading-relaxed drop-shadow-md animate-fade-in-up text-center" style={{ animationDelay: '300ms' }}>
              {settings.hero_description || 'Enka Prime Consulting delivers world-class, in-house corporate training across leadership, finance, safety, digital skills and professional development — transforming organisations from within.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up w-full sm:w-auto" style={{ animationDelay: '400ms' }}>
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

        </div>

        {/* Stats counter */}
        <div id="stats-section" className="mt-10 lg:mt-24 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 w-full">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="group text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:bg-white/12 hover:border-custom-secondary hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: `1px solid rgba(201,168,76,0.3)`,
                animation: visibleStats ? `slideInUp 0.6s ease-out ${idx * 100}ms both` : 'none'
              }}
            >
              <div className="text-2xl md:text-4xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300 text-custom-secondary">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-blue-200 font-medium group-hover:text-white transition-colors duration-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer z-10"
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
    <section key="cta" className="py-14 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={settings.cta_image || "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg"}
          alt="Team collaboration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-custom-primary/90" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 animate-fade-in">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
          {settings.cta_title || 'Discover Our'}<br />
          <span className="text-custom-secondary">{settings.cta_discipline_highlight || 'Service Pillars'}</span>
        </h2>
        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto drop-shadow-md">
          {settings.cta_description || 'Four integrated service pillars designed to strengthen systems, improve compliance, and build organisational capacity.'}
        </p>
        <button
          onClick={() => onNavigate('services')}
          className="button-custom bg-custom-secondary text-custom-primary inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 font-bold text-base sm:text-lg tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto"
        >
          Explore Solutions <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );

  // 3. ABOUT PREVIEW SECTION
  const renderAboutPreview = () => (
    <section key="about_preview" className="py-14 sm:py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] bg-gradient-to-br from-custom-secondary to-transparent" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-5 bg-custom-secondary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5 transition-all hover:scale-110"
            style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--secondary-color)' }}>
            About Enka Prime
          </div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight text-custom-primary">
            {settings.about_title || 'Who We Are'}<br />
            <span className="text-custom-secondary">Since Day One</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-12 sm:mb-16">
          
          {/* Left Text */}
          <div className="animate-fade-in-left space-y-6 text-left">
            <p className="text-gray-600 leading-relaxed text-base sm:text-lg transition-all hover:text-gray-800">
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
                  className="w-full h-60 sm:h-72 object-cover transition-transform duration-700 group-hover:scale-105"
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
                <div className="text-sm font-bold text-custom-secondary">PRIME</div>
                <div className="text-xs text-blue-200 leading-tight text-left">System<br/>Approach®</div>
              </div>
            </div>

            {/* Stat mini cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 sm:mt-14">
              {[
                { number: '100%', label: 'Professionalism' },
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
      records: Database,
      asset: Briefcase,
      iso: Shield,
      training: Users2,
      LMT: Users2, CST: Award, HSE: Shield, AFT: TrendingUp, DDT: Monitor, GEN: BookOpen 
    };
    const imageMap: Record<string, string> = {
      records: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
      asset: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg',
      iso: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
      training: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      LMT: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
      CST: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
      HSE: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg',
      AFT: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg',
      DDT: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
      GEN: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
    };

    return (
    <section key="services" className="py-14 sm:py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
              style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--secondary-color)' }}>
              Our Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-custom-primary">
              Core Service <span className="text-custom-secondary">Pillars</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto mt-3 text-sm">
              Tailored service solutions to resolve operational friction and elevate workforce performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {services.slice(0, 6).map((service, idx) => {
              const Icon = iconMap[service.code] || BookOpen;
              return (
                <div
                  key={service.code}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 flex flex-col bg-white text-left hover:border-custom-secondary/40"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={imageMap[service.code] || service.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-xl flex items-center justify-center bg-white/95 shadow-lg group-hover:bg-custom-secondary transition-colors duration-300">
                      <Icon size={22} className="text-custom-primary group-hover:text-white" />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase text-custom-secondary mb-1.5 block">
                        Service Pillar
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
    <section key="industries" className="py-14 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--secondary-color)' }}>
            Sectors We Serve
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-custom-primary">
            Target <span className="text-custom-secondary">Industry</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mt-3 text-sm">
            We adapt our solutions to match the unique operational standards and compliance needs of each sector.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {INDUSTRIES.map((ind) => {
            const Icon = ind.icon;
            return (
              <div 
                key={ind.title}
                className="group overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-custom-secondary/40 hover:shadow-xl"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={ind.image}
                    alt={ind.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-custom-primary/90 via-custom-primary/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-custom-primary shadow-lg transition-colors duration-300 group-hover:bg-custom-secondary group-hover:text-white">
                    <Icon size={21} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-bold text-custom-primary transition-colors duration-300 group-hover:text-custom-secondary">
                    {ind.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-600">
                    {ind.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  // 6. WHY CHOOSE US HIGHLIGHTS MODULE
  const renderWhyChooseUsBlock = () => (
    <section key="why_choose_us" className="py-14 sm:py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(201,168,76,0.12)', color: 'var(--secondary-color)' }}>
            The Enka Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-custom-primary animate-delay-100">
            Why Partner With <span className="text-custom-secondary">Enka Prime?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
          {[
            {
              title: 'Practical, Results-Oriented Solutions',
              desc: 'We focus on operational improvements that are realistic, measurable, and aligned with how organisations actually work.',
            },
            {
              title: 'Multi-Disciplinary Expertise',
              desc: 'Our integrated service model combines records management, ISO systems support, asset management, compliance improvement, and corporate training.',
            },
            {
              title: 'ISO-Aligned Professional Standards',
              desc: 'Our methodologies are guided by recognised standards and best practices that strengthen governance, accountability, and consistency.',
            },
            {
              title: 'Tailored Institutional Support',
              desc: 'We customise every engagement to your structure, industry, operational challenges, and strategic objectives.',
            },
            {
              title: 'Professionalism, Integrity & Confidentiality',
              desc: 'We maintain high standards of professionalism, ethical conduct, and confidentiality across all client engagements and organisational data handling.',
            },
          ].map((item) => (
            <div 
              key={item.title}
              className="bg-white p-6 sm:p-7 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-custom-secondary/40 transition-all duration-300 text-left group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-custom-secondary/15 text-custom-secondary mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle size={20} />
              </div>
              <h4 className="font-bold text-sm text-custom-primary mb-3 group-hover:text-custom-secondary transition-colors">
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
