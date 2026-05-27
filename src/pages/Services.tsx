import { useEffect, useState, useCallback } from 'react';
import { Award, Users, Shield, TrendingUp, Monitor, BookOpen, ArrowRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ICON_MAP: Record<string, any> = { LMT: Users, CST: Award, HSE: Shield, AFT: TrendingUp, DDT: Monitor, GEN: BookOpen };

const FALLBACK_SERVICES = [
  { code: 'LMT', title: 'Leadership & Management', description: 'Strategic leadership, supervisory excellence, accountability and decision-making for modern managers.', full_description: 'Develop strategic thinking, supervisory skills, accountability, and effective decision-making capabilities.', image_url: 'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg' },
  { code: 'CST', title: 'Customer Service Training', description: 'Excellence in client relationship management, frontline service delivery and building customer-centric cultures.', full_description: 'Master customer service excellence, relationship management, and complaint handling.', image_url: 'https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg' },
  { code: 'HSE', title: 'Health, Safety & Environment', description: 'Workplace safety, risk prevention, defensive driving and fleet management for organisational compliance.', full_description: 'Ensure workplace compliance and staff safety across all operational areas.', image_url: 'https://images.pexels.com/photos/3935702/pexels-photo-3935702.jpeg' },
  { code: 'AFT', title: 'Accounting & Finance', description: 'Financial management, budgetary control, internal controls and compliance reporting.', full_description: 'Master financial management, budgeting, reporting, and compliance.', image_url: 'https://images.pexels.com/photos/3532554/pexels-photo-3532554.jpeg' },
  { code: 'DDT', title: 'Data & Digital Skills', description: 'Data management, analysis, reporting using Excel and practical analytics for business decisions.', full_description: 'Transform data into actionable insights with advanced analytics and Excel mastery.', image_url: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg' },
  { code: 'GEN', title: 'Professional Development', description: 'Communication, report writing, time management, productivity and teamwork for workplace excellence.', full_description: 'Develop essential workplace competencies for career advancement and organisational success.', image_url: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg' },
];

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

interface ServicesProps {
  onNavigate: (page: string) => void;
}

export default function Services({ onNavigate }: ServicesProps) {
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbProgrammes, setDbProgrammes] = useState<any[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [svcRes, progRes] = await Promise.all([
      supabase.from('services').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('programmes').select('code, title, days, category').eq('is_active', true).order('category, code'),
    ]);
    if (svcRes.data && svcRes.data.length > 0) setDbServices(svcRes.data);
    if (progRes.data) setDbProgrammes(progRes.data);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const services = dbServices.length > 0 ? dbServices : FALLBACK_SERVICES;

  const getProgramsForService = (code: string) => {
    const prefix = code.split(' ')[0];
    return dbProgrammes.filter(p => p.code.startsWith(prefix));
  };

  return (
    <div className="min-h-screen bg-white font-sans pt-20 overflow-hidden">
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg"
            alt="Services"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}95, ${NAVY}85)` }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-lg backdrop-blur-sm text-white font-semibold hover:bg-white/10 transition-colors animate-fade-in-down"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <ChevronLeft size={18} /> Back to Home
          </button>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg animate-fade-in-up">
            Our Training <span style={{ color: GOLD }}>Disciplines</span>
          </h1>
          <p className="text-blue-100 text-xl max-w-3xl drop-shadow-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Six core training areas designed to build capability across every layer of your organisation.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any, idx: number) => {
              const Icon = ICON_MAP[service.code] || BookOpen;
              const progs = getProgramsForService(service.code);
              return (
                <div
                  key={service.code}
                  className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 flex flex-col bg-white"
                  style={{
                    animation: `slideInUp 0.6s ease-out ${idx * 100}ms both`
                  }}
                  onMouseEnter={() => setHoveredCard(service.code)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image container with overlay */}
                  <div className="relative h-56 overflow-hidden bg-gray-200">
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-120"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-300 group-hover:from-black/80" />

                    {/* Floating icon */}
                    <div
                      className="absolute top-4 right-4 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 transform"
                      style={{
                        background: `${NAVY}0d`,
                        transform: hoveredCard === service.code ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
                      }}
                    >
                      <Icon size={28} style={{ color: NAVY }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 flex-1 flex flex-col">
                    <div className="text-sm font-bold tracking-widest uppercase mb-2 transition-all duration-300" style={{ color: GOLD }}>
                      {service.code} Discipline
                    </div>
                    <h3 className="text-xl font-bold mb-3 transition-all duration-300 group-hover:text-yellow-600" style={{ color: NAVY }}>
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm mb-4 flex-1 transition-all duration-300 group-hover:text-gray-800">
                      {service.description}
                    </p>

                    {/* Programs preview */}
                    {progs.length > 0 && (
                      <div className="pt-4 border-t border-gray-200 transition-all duration-300">
                        <div className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">Related Programmes:</div>
                        <div className="space-y-2">
                          {progs.slice(0, 2).map((prog: any) => (
                            <div
                              key={prog.code}
                              className="text-xs text-gray-600 p-2 rounded-lg transition-all duration-300 hover:bg-yellow-50"
                              style={{ color: hoveredCard === service.code ? GOLD : '#666' }}
                            >
                              <span className="font-bold">{prog.code}</span> • {prog.days} days
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={() => onNavigate('programmes')}
                      className="flex items-center gap-1 text-sm font-bold mt-auto transition-all duration-300 group-hover:gap-2 py-2"
                      style={{ color: GOLD }}
                    >
                      View All <ArrowRight size={16} />
                    </button>
                  </div>

                  {/* Animated border accent */}
                  <div
                    className="absolute top-0 left-0 w-0 h-1 transition-all duration-500 group-hover:w-full"
                    style={{ background: GOLD }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-yellow-400 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-16" style={{ color: NAVY }}>
            Why Choose Our <span style={{ color: GOLD }}>Training Disciplines?</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: 'Industry Experts', desc: 'Trainers with proven experience across all disciplines' },
              { icon: TrendingUp, title: 'Measurable Results', desc: 'Immediate skill transfer and workplace impact' },
              { icon: Users, title: 'Custom Fit', desc: 'Tailored programmes for your specific needs' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                  style={{
                    animation: `slideInUp 0.6s ease-out ${500 + idx * 100}ms both`
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110"
                    style={{ background: `${GOLD}22` }}
                  >
                    <Icon size={28} style={{ color: GOLD }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: NAVY }}>{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg"
            alt="Team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}95, ${NAVY}85)` }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Ready to Transform<br />
            <span style={{ color: GOLD }}>Your Team?</span>
          </h2>
          <p className="text-blue-100 text-lg mb-10 drop-shadow-md">
            All trainings are delivered in-house and customised to your organisational needs.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="inline-flex items-center gap-2 px-10 py-4 font-bold text-lg rounded tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1"
            style={{ background: GOLD, color: NAVY }}
          >
            Get In Touch <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
