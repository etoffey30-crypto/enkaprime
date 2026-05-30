import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Menu, X, Phone, Mail, MapPin,
  CheckCircle, ChevronDown, Database, Tag, ShieldCheck, GraduationCap
} from 'lucide-react';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Training from './pages/Training';
import About from './pages/About';
import Admin from './pages/Admin';

const NAV_LINKS = [
  { label: 'Home', href: 'home' },
  { label: 'Services', href: 'services', hasDropdown: true },
  { label: 'Upcoming Training', href: 'training' },
  { label: 'About Us', href: 'about' },
  { label: 'Contact', href: 'contact' },
];

const SERVICE_DROPDOWN = [
  { label: 'Records Digitalisation', sub: 'Document Management Systems', href: 'service-records', icon: Database },
  { label: 'Asset Tagging', sub: 'Asset Register Development', href: 'service-asset', icon: Tag },
  { label: 'ISO Implementation', sub: 'Compliance Support', href: 'service-iso', icon: ShieldCheck },
  { label: 'Training & Capacity', sub: 'Corporate Learning Programmes', href: 'training', icon: GraduationCap },
];

const CATEGORIES = ['All', 'Leadership', 'Customer Service', 'HSE', 'Finance', 'Digital', 'General'];

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

function getPageFromHash(): string {
  const hash = window.location.hash.replace('#', '');
  return hash || 'home';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [formData, setFormData] = useState({ name: '', email: '', organization: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Listen for hash changes (back/forward browser buttons)
  useEffect(() => {
    const onHashChange = () => setCurrentPage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Database-driven data
  const [dbSettings, setDbSettings] = useState<Record<string, string>>({});
  const [dbProgrammes, setDbProgrammes] = useState<any[]>([]);

  const loadPublicData = useCallback(async () => {
    const [settingsRes, programmesRes] = await Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase.from('programmes').select('*').eq('is_active', true).order('category, code'),
    ]);
    if (settingsRes.data) {
      const map: Record<string, string> = {};
      settingsRes.data.forEach((s: any) => { map[s.key] = s.value; });
      setDbSettings(map);
    }
    if (programmesRes.data) setDbProgrammes(programmesRes.data);
  }, []);

  useEffect(() => { loadPublicData(); }, [loadPublicData]);

  // Dynamic Design System Variable & Font Injection
  useEffect(() => {
    try {
      const ds = dbSettings.design_system ? JSON.parse(dbSettings.design_system) : {};
      
      const primary = ds.primary_color || '#0F2044';
      const secondary = ds.secondary_color || '#C9A84C';
      const accent = ds.accent_color || '#F3F4F6';
      const baseFontSize = ds.base_font_size || '16px';
      const fontFamily = ds.font_family || 'Inter';
      const spacingDensity = ds.spacing_density || 'comfortable';
      const buttonPreset = ds.button_preset || 'rounded';

      // Map spacing density to multiplier
      let spacingMultiplier = '1';
      if (spacingDensity === 'compact') spacingMultiplier = '0.75';
      if (spacingDensity === 'loose') spacingMultiplier = '1.25';

      // Map button preset to border-radius
      let borderRadius = '4px';
      if (buttonPreset === 'pill') borderRadius = '9999px';
      if (buttonPreset === 'square') borderRadius = '0px';
      if (buttonPreset === 'rounded-lg') borderRadius = '12px';

      const root = document.documentElement;
      root.style.setProperty('--primary-color', primary);
      root.style.setProperty('--secondary-color', secondary);
      root.style.setProperty('--accent-color', accent);
      root.style.setProperty('--base-font-size', baseFontSize);
      root.style.setProperty('--font-family', `'${fontFamily}', sans-serif`);
      root.style.setProperty('--spacing-multiplier', spacingMultiplier);
      root.style.setProperty('--button-border-radius', borderRadius);

      // Inject Google Font
      const fontId = 'dynamic-google-font';
      let linkElement = document.getElementById(fontId) as HTMLLinkElement;
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.id = fontId;
        linkElement.rel = 'stylesheet';
        document.head.appendChild(linkElement);
      }
      linkElement.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;

    } catch (e) {
      console.error('Error applying dynamic design tokens:', e);
    }
  }, [dbSettings]);

  // Dynamic Navigation menu
  const getNavLinks = useCallback(() => {
    try {
      if (dbSettings.navigation_menu) {
        const menu = JSON.parse(dbSettings.navigation_menu);
        if (Array.isArray(menu) && menu.length > 0) {
          return menu.filter(item => item.is_active !== false).map(item => ({
            label: item.label,
            href: item.href,
            link_type: item.link_type || 'page'
          }));
        }
      }
    } catch (e) {
      console.error('Error parsing dynamic navigation:', e);
    }
    return NAV_LINKS;
  }, [dbSettings.navigation_menu]);

  const navLinks = getNavLinks();

  // Parse dynamic footer config
  const getFooterConfig = useCallback(() => {
    try {
      if (dbSettings.footer_config) {
        return JSON.parse(dbSettings.footer_config);
      }
    } catch (e) {
      console.error('Error parsing footer config:', e);
    }
    return {
      description: 'Professional corporate training that transforms people and organisations.',
      contact_email: dbSettings.contact_email || 'info@enkaprime.com',
      contact_phone: dbSettings.contact_phone || '0200 769 146',
      linkedin_url: 'https://linkedin.com/company/enkaprime',
      copyright_text: '© 2026 Enka Prime Consulting Ltd. All rights reserved.',
      tagline: dbSettings.about_tagline || 'Empowering People. Enhancing Performance. Delivering Excellence.'
    };
  }, [dbSettings]);

  const footerConfig = getFooterConfig();

  const handleNavClick = (link: { label: string; href: string; link_type?: string }) => {
    if (link.link_type === 'external') {
      window.open(link.href, '_blank');
    } else if (link.link_type === 'section') {
      navigate('home');
      setTimeout(() => {
        const targetId = link.href.replace('#', '');
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      navigate(link.href);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [currentPage]);

  const filteredProgrammes = activeCategory === 'All'
    ? dbProgrammes
    : dbProgrammes.filter(p => p.category === activeCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', organization: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const navigate = (page: string) => {
    window.location.hash = page;
    setCurrentPage(page);
    if (page !== 'admin') loadPublicData();
  };

  // Admin pages have their own layout
  if (currentPage === 'admin' || currentPage === 'cms') {
    return <Admin onNavigate={navigate} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigate} settings={dbSettings} />;
      case 'services':
        return <Services onNavigate={navigate} />;
      case 'service-records':
        return <ServiceDetail serviceKey="records" onNavigate={navigate} />;
      case 'service-asset':
        return <ServiceDetail serviceKey="asset" onNavigate={navigate} />;
      case 'service-iso':
        return <ServiceDetail serviceKey="iso" onNavigate={navigate} />;
      case 'training':
        return <Training onNavigate={navigate} />;
      case 'about':
        return <About onNavigate={navigate} settings={dbSettings} />;
      case 'programmes':
        return <Training onNavigate={navigate} />;
      case 'contact':
        return <ContactPage />;
      default:
        return <Home onNavigate={navigate} settings={dbSettings} />;
    }
  };

  const GOLD_COLOR = '#C9A84C';
  const NAVY_COLOR = '#0F2044';

  const NavBar = () => (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-custom ${scrolled ? 'bg-white shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <button onClick={() => handleNavClick({ label: 'Home', href: 'home', link_type: 'page' })} className="flex items-center gap-3">
          <img src={dbSettings.site_logo || "/enkaprime/enkaprime-logo.png"} alt="Enka Prime Consulting Ltd" className="h-11 w-auto object-contain" />
        </button>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link: any) => {
            if (link.hasDropdown || link.href === 'services') {
              return (
                <div key={link.href} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setServicesDropdownOpen(o => !o)}
                    onBlur={() => setTimeout(() => setServicesDropdownOpen(false), 150)}
                    className={`flex items-center gap-1 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                      scrolled ? 'text-gray-700 hover:text-yellow-600' : 'text-white/90 hover:text-yellow-400'
                    }`}
                  >
                    {link.label}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Mega Dropdown */}
                  {servicesDropdownOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      style={{ boxShadow: '0 25px 60px rgba(15,32,68,0.18)' }}>
                      {/* Header */}
                      <div className="px-6 py-4 border-b border-gray-100" style={{ background: `${NAVY_COLOR}08` }}>
                        <div className="text-[10px] font-extrabold tracking-widest uppercase mb-0.5" style={{ color: GOLD_COLOR }}>Consulting Services</div>
                        <div className="text-sm font-bold" style={{ color: NAVY_COLOR }}>Our Core Service Areas</div>
                      </div>

                      {/* Service Links */}
                      <div className="p-3">
                        {SERVICE_DROPDOWN.map(item => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.href}
                              onClick={() => { navigate(item.href); setServicesDropdownOpen(false); }}
                              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-150 group text-left"
                            >
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                                style={{ background: `${NAVY_COLOR}0d` }}>
                                <Icon size={18} style={{ color: NAVY_COLOR }} />
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-sm group-hover:text-yellow-600 transition-colors" style={{ color: NAVY_COLOR }}>{item.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{item.sub}</div>
                              </div>
                              <ChevronDown size={14} className="-rotate-90 text-gray-300 group-hover:text-yellow-500 transition-colors" />
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer CTA in dropdown */}
                      <div className="px-6 py-4 border-t border-gray-100">
                        <button
                          onClick={() => { navigate('services'); setServicesDropdownOpen(false); }}
                          className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all hover:scale-[1.02]" 
                          style={{ background: NAVY_COLOR, color: 'white' }}
                        >
                          View All Services Overview
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={link.href}
                onClick={() => handleNavClick(link)}
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                  scrolled ? 'text-gray-700 hover:text-custom-secondary' : 'text-white/90 hover:text-custom-secondary'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <button
            onClick={() => navigate('contact')}
            className="button-custom bg-custom-secondary text-custom-primary px-5 py-2.5 text-sm font-bold tracking-wide transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            Get In Touch
          </button>
        </div>

        <button
          className={`lg:hidden p-2 rounded ${scrolled ? 'text-gray-800' : 'text-white'}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white shadow-xl border-t border-gray-100 px-6 py-4">
          {/* Services section expanded in mobile */}
          <div className="py-2 border-b border-gray-100">
            <div className="text-[10px] font-extrabold tracking-widest uppercase text-gray-400 mb-2">Services</div>
            {SERVICE_DROPDOWN.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => { navigate(item.href); setMenuOpen(false); }}
                  className="flex items-center gap-3 w-full py-2.5 text-gray-700 hover:text-yellow-600 transition-colors text-left"
                >
                  <Icon size={15} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-[11px] text-gray-400">{item.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
          {navLinks.filter((l: any) => !l.hasDropdown && l.href !== 'services').map((link: any) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link)}
              className="block w-full text-left py-3 text-gray-800 font-semibold border-b border-gray-100 hover:text-custom-secondary transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => navigate('contact')}
            className="button-custom bg-custom-secondary text-custom-primary block w-full mt-4 text-center px-5 py-3 font-bold tracking-wide"
          >
            Get In Touch
          </button>
        </div>
      )}
    </nav>
  );

  const ProgrammesPage = () => (
    <div className="min-h-screen bg-white font-sans pt-20">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={dbSettings.programmes_hero_image || "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg"}
            alt="Programmes"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}95, ${NAVY}85)` }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            June 2026 Training <span style={{ color: GOLD }}>Programmes</span>
          </h1>
          <p className="text-blue-100 text-xl max-w-3xl drop-shadow-md">
            Complete catalogue of in-house training programmes across all disciplines.
          </p>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200"
                style={activeCategory === cat
                  ? { background: NAVY, color: 'white' }
                  : { background: '#f3f4f6', color: '#374151' }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredProgrammes.map(prog => (
              <div
                key={prog.code}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-xl bg-white hover:bg-blue-50 transition-colors duration-200 group border border-gray-100 hover:border-yellow-300"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="text-xs font-bold tracking-widest px-3 py-1.5 rounded-lg flex-shrink-0"
                    style={{ background: `${NAVY}0d`, color: NAVY }}
                  >
                    {prog.code}
                  </span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{prog.title}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 pl-2 sm:pl-0">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: `${GOLD}22`, color: '#8a6b1e' }}>
                    {prog.days} {prog.days === 1 ? 'Day' : 'Days'}
                  </span>
                  <button
                    onClick={() => navigate('contact')}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: NAVY, color: 'white' }}
                  >
                    Enquire
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const ContactPage = () => (
    <div className="min-h-screen bg-white font-sans pt-20">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={dbSettings.contact_hero_image || "https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg"}
            alt="Contact"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}95, ${NAVY}85)` }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Let's Start a <span style={{ color: GOLD }}>Conversation</span>
          </h1>
          <p className="text-blue-100 text-xl max-w-3xl drop-shadow-md">
            Contact us today to discuss your training needs.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
                style={{ background: `${GOLD}22`, color: GOLD }}>
                Get In Touch
              </div>
              <h2 className="text-4xl font-bold mb-6" style={{ color: NAVY }}>
                We're Here<br />to Help
              </h2>
              <p className="text-gray-600 mb-10 leading-relaxed">
                All training programmes are delivered in-house. Contact us to discuss scheduling,
                customisation, and pricing for your organisation.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Email Us', value: dbSettings.contact_email || 'info@enkaprime.com', href: `mailto:${dbSettings.contact_email || 'info@enkaprime.com'}` },
                  { icon: Phone, label: 'Call Us', value: dbSettings.contact_phone || '0200 769 146', href: `tel:${dbSettings.contact_phone || '0200769146'}` },
                  { icon: MapPin, label: 'Location', value: dbSettings.contact_location || 'In-House — Nationwide Delivery', href: '#' },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${NAVY}08` }}>
                      <Icon size={20} style={{ color: NAVY }} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium mb-0.5">{label}</div>
                      <div className="font-semibold group-hover:underline text-sm" style={{ color: NAVY }}>{value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              {submitted ? (
                <div className="h-full min-h-80 flex flex-col items-center justify-center text-center p-10 rounded-2xl"
                  style={{ background: `${NAVY}05`, border: `1px solid ${GOLD}35` }}>
                  <CheckCircle size={48} style={{ color: GOLD }} className="mb-4" />
                  <h3 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>Message Received</h3>
                  <p className="text-gray-500">Thank you for reaching out. Our team will be in touch with you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {[
                    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                    { name: 'organization', label: 'Organisation', type: 'text', placeholder: 'Your organisation name' },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        required
                        placeholder={field.placeholder}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 text-gray-800 bg-gray-50 placeholder-gray-400 transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
                      Training Interest / Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Which programmes are you interested in? Any specific requirements?"
                      value={formData.message}
                      onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 text-gray-800 bg-gray-50 placeholder-gray-400 resize-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 font-bold text-base rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-white"
                    style={{ background: NAVY }}
                  >
                    Send Enquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar />
      {renderPage()}

      {/* Footer */}
      <footer className="bg-custom-primary pt-14 pb-8 border-t border-white/10 font-custom text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
            <div className="md:col-span-2">
              <img src={dbSettings.site_logo || "/enkaprime/enkaprime-logo.png"} alt="Enka Prime Consulting Ltd" className="h-16 w-auto mb-4 object-contain" />
              <p className="text-gray-300 text-sm leading-relaxed mt-4 max-w-sm">
                {footerConfig.description || 'Professional corporate training that transforms people and organisations.'}
              </p>
              {footerConfig.linkedin_url && (
                <div className="mt-4">
                  <a
                    href={footerConfig.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-custom-secondary font-bold hover:underline"
                  >
                    <span>Connect on LinkedIn</span> →
                  </a>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold mb-4 text-xs tracking-widest uppercase text-custom-secondary">Quick Links</h4>
              <div className="space-y-2">
                {navLinks.map(link => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link)}
                    className="block text-gray-300 text-sm hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-xs tracking-widest uppercase text-custom-secondary">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Mail size={14} className="text-custom-secondary" />
                  <a href={`mailto:${footerConfig.contact_email}`} className="hover:text-white transition-colors">
                    {footerConfig.contact_email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Phone size={14} className="text-custom-secondary" />
                  <a href={`tel:${footerConfig.contact_phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                    {footerConfig.contact_phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              {footerConfig.copyright_text || '© 2026 Enka Prime Consulting Ltd. All rights reserved.'}
            </p>
            <p className="text-sm font-semibold italic text-custom-secondary">
              {footerConfig.tagline || 'Empowering People. Enhancing Performance. Delivering Excellence.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
