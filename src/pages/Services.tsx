import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, Database, Tag, ShieldCheck, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

const SERVICE_PILLARS = [
  {
    id: 'records',
    slug: 'service-records',
    icon: Database,
    title: 'Records Digitalisation & Document Management Systems',
    short: 'Transform paper-based records into structured, searchable digital systems that improve efficiency, accessibility and audit readiness.',
    image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
    accent: '#1a6b9a',
  },
  {
    id: 'asset',
    slug: 'service-asset',
    icon: Tag,
    title: 'Asset Tagging & Asset Register Development',
    short: 'Establish end-to-end asset visibility with barcode or QR-based tagging, structured registers, and lifecycle tracking systems.',
    image: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg',
    accent: '#2d6a4f',
  },
  {
    id: 'iso',
    slug: 'service-iso',
    icon: ShieldCheck,
    title: 'ISO Implementation & Compliance Support',
    short: 'Navigate complex compliance frameworks with expert guidance — from gap analysis through certification and sustained conformance.',
    image: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
    accent: '#7b2d8b',
  },
  {
    id: 'training',
    slug: 'training',
    icon: GraduationCap,
    title: 'Training & Capacity Building',
    short: 'Bespoke in-house corporate training programmes across leadership, HSE, finance, customer service and digital skills.',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    accent: '#9a4b1a',
  },
];

const ICON_MAP: Record<string, any> = {
  records: Database,
  asset: Tag,
  iso: ShieldCheck,
  training: GraduationCap,
};

interface ServicesProps {
  onNavigate: (page: string) => void;
}

export default function Services({ onNavigate }: ServicesProps) {
  const [pillars, setPillars] = useState<any[]>([]);

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (data && data.length > 0) {
        const mapped = data.map(item => ({
          id: item.code,
          slug: item.code === 'training' ? 'training' : `service-${item.code}`,
          icon: ICON_MAP[item.code] || Database,
          title: item.title,
          short: item.description,
          image: item.image_url,
          accent: item.code === 'records' ? '#1a6b9a' : item.code === 'asset' ? '#2d6a4f' : item.code === 'iso' ? '#7b2d8b' : '#9a4b1a',
        }));
        setPillars(mapped);
      } else {
        setPillars(SERVICE_PILLARS);
      }
    }
    loadServices();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans pt-20 overflow-hidden">

      {/* ── HERO HEADER ── */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg"
            alt="Our Core Service Areas"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}F0 0%, ${NAVY}CC 60%, ${NAVY}99 100%)` }} />
          {/* Animated grid overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-lg text-white font-semibold hover:bg-white/10 transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ChevronLeft size={16} /> Back to Home
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: `${GOLD}25`, color: GOLD, border: `1px solid ${GOLD}40` }}>
            Consulting & Advisory Services
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Our Core <span style={{ color: GOLD }}>Service Areas</span>
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl max-w-2xl leading-relaxed">
            Four strategic pillars designed to transform how organisations manage information,
            assets, compliance, and human capability.
          </p>
        </div>
      </section>

      {/* ── 4-PILLAR CARD GRID ── */}
      <section className="py-14 sm:py-24 bg-gray-50 relative overflow-hidden">
        {/* background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl" style={{ background: GOLD }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5 blur-3xl" style={{ background: NAVY }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: NAVY }}>
              Choose a <span style={{ color: GOLD }}>Service Area</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Each pillar addresses a distinct organisational challenge. Click any card to explore the full scope of work, pain points, and outcomes.
            </p>
          </div>

          {/* 2×2 Grid */}
          <div className="grid md:grid-cols-2 gap-5 sm:gap-8">
            {pillars.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.id}
                  className="group relative bg-white rounded-xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col border border-gray-100"
                  style={{ animation: `slideInUp 0.5s ease-out ${idx * 100}ms both` }}
                >
                  {/* Gold top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
                    style={{ background: GOLD, transform: 'scaleX(0)', transformOrigin: 'left' }}
                  />
                  <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-500 group-hover:opacity-100 opacity-0"
                    style={{ background: GOLD }} />

                  {/* Image */}
                  <div className="relative h-52 sm:h-64 overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={svc.image}
                      alt={svc.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 transition-all duration-500"
                      style={{ background: `linear-gradient(to top, ${NAVY}CC 0%, transparent 60%)` }}
                    />
                    {/* Icon badge */}
                    <div className="absolute top-5 right-5 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                      style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <Icon size={22} className="text-white" />
                    </div>
                    {/* Card number */}
                    <div className="absolute top-5 left-5 text-[10px] font-extrabold tracking-widest uppercase px-2 py-1 rounded"
                      style={{ background: `${GOLD}`, color: NAVY }}>
                      0{idx + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-extrabold mb-3 leading-snug transition-colors duration-300 group-hover:text-yellow-600"
                      style={{ color: NAVY }}>
                      {svc.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-6">
                      {svc.short}
                    </p>

                    <button
                      onClick={() => onNavigate(svc.slug)}
                      className="self-start inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:gap-4 hover:shadow-lg hover:scale-105"
                      style={{ background: NAVY, color: 'white' }}
                    >
                      Learn More <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY ENKA PRIME ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: NAVY }}>
              Why Organisations Choose <span style={{ color: GOLD }}>Enka Prime</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">Proven delivery across public and private sector institutions in Ghana and West Africa.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-8">
            {[
              { stat: '500+', label: 'Professionals Trained', desc: 'Across multiple sectors and disciplines' },
              { stat: '4', label: 'Core Service Pillars', desc: 'Records, Assets, Compliance & Training' },
              { stat: '100%', label: 'In-House Delivery', desc: 'All services delivered at your premises, nationwide' },
            ].map(item => (
              <div key={item.stat} className="text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl sm:text-5xl font-black mb-2" style={{ color: GOLD }}>{item.stat}</div>
                <div className="font-bold text-base mb-1" style={{ color: NAVY }}>{item.label}</div>
                <div className="text-gray-500 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg" alt="CTA" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}F0, ${NAVY}CC)` }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5">
            Not sure where to <span style={{ color: GOLD }}>start?</span>
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Book a free 30-minute consultation and we'll map the right service area to your organisation's challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 font-bold text-base rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: GOLD, color: NAVY }}
            >
              Request Consultation <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('training')}
              className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 font-bold text-base rounded-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              View Training Calendar <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
