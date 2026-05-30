import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, ChevronLeft, Filter, GraduationCap, Star, Clock, Calendar, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';
const CATEGORIES = ['All', 'Leadership', 'Customer Service', 'HSE', 'Finance', 'Digital', 'General'];

const CATEGORY_META: Record<string, { color: string; bg: string; desc: string }> = {
  Leadership: { color: '#1d4ed8', bg: '#dbeafe', desc: 'Strategic leadership, management and supervisory excellence' },
  'Customer Service': { color: '#0891b2', bg: '#cffafe', desc: 'Client relationship management and frontline service delivery' },
  HSE: { color: '#16a34a', bg: '#dcfce7', desc: 'Workplace safety, risk prevention and compliance' },
  Finance: { color: '#7c3aed', bg: '#ede9fe', desc: 'Financial management, budgeting and reporting' },
  Digital: { color: '#ea580c', bg: '#ffedd5', desc: 'Data, analytics, Excel and digital tools' },
  General: { color: '#6b7280', bg: '#f3f4f6', desc: 'Communication, report writing and professional development' },
};

interface TrainingProps {
  onNavigate: (page: string) => void;
}

export default function Training({ onNavigate }: TrainingProps) {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadProgrammes = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('programmes')
      .select('*')
      .eq('is_active', true)
      .order('category, code');
    if (data) setProgrammes(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadProgrammes(); }, [loadProgrammes]);

  const filtered = activeCategory === 'All'
    ? programmes
    : programmes.filter(p => p.category === activeCategory);

  const featured = programmes.filter(p => p.is_featured);

  return (
    <div className="min-h-screen bg-white font-sans pt-20 overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
            alt="Training & Capacity Building"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}F0 0%, ${NAVY}C0 100%)` }} />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-lg text-white font-semibold hover:bg-white/10 transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ChevronLeft size={16} /> All Services
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: `${GOLD}25`, color: GOLD, border: `1px solid ${GOLD}40` }}>
            <GraduationCap size={12} /> Service 04
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-5 leading-tight">
            Training & <span style={{ color: GOLD }}>Capacity Building</span>
          </h1>
          <p className="text-blue-100 text-xl max-w-2xl leading-relaxed">
            Bespoke in-house corporate training programmes delivered at your premises — building skills that translate directly into workplace results.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <BookOpen size={16} style={{ color: GOLD }} />
              {programmes.length}+ Programmes Available
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Clock size={16} style={{ color: GOLD }} />
              1–5 Day Programmes
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Calendar size={16} style={{ color: GOLD }} />
              Nationwide Delivery
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: GraduationCap, title: 'In-House Delivery', desc: 'All programmes delivered at your organisation — no travel, no disruption, total customisation.' },
              { icon: Star, title: 'Certified Trainers', desc: 'Experienced professionals with deep sector knowledge across all training disciplines.' },
              { icon: ArrowRight, title: 'Immediate Impact', desc: 'Practical, skills-focused content that participants can apply from the very next working day.' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${GOLD}20` }}>
                    <Icon size={22} style={{ color: GOLD }} />
                  </div>
                  <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY }}>{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROGRAMMES ── */}
      {featured.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-10">
              <Star size={20} style={{ color: GOLD }} className="fill-current" style={{ color: GOLD, fill: GOLD }} />
              <h2 className="text-2xl font-extrabold" style={{ color: NAVY }}>Featured Programmes</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(prog => {
                const meta = CATEGORY_META[prog.category] || CATEGORY_META['General'];
                return (
                  <div key={prog.id} className="p-6 rounded-2xl border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                    style={{ borderColor: `${GOLD}40`, background: `${GOLD}05` }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg" style={{ background: meta.bg, color: meta.color }}>
                        {prog.category}
                      </span>
                      <Star size={14} style={{ color: GOLD, fill: GOLD }} />
                    </div>
                    <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: GOLD }}>{prog.code}</div>
                    <h3 className="font-bold text-sm mb-3 leading-snug" style={{ color: NAVY }}>{prog.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Clock size={12} />
                        {prog.days} {prog.days === 1 ? 'Day' : 'Days'}
                      </div>
                      <button
                        onClick={() => onNavigate('contact')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                        style={{ background: NAVY, color: 'white' }}
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── TRAINING CATALOGUE ── */}
      <section id="training-catalogue" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: NAVY }}>
                <span style={{ color: GOLD }}>Training</span> Catalogue
              </h2>
              <p className="text-gray-500 text-sm">Browse all {programmes.length} available programmes</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-semibold">Filter by category</span>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(cat => {
              const meta = CATEGORY_META[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-2 text-xs font-bold rounded-full transition-all duration-200"
                  style={isActive
                    ? { background: NAVY, color: 'white' }
                    : meta
                      ? { background: meta.bg, color: meta.color }
                      : { background: '#f3f4f6', color: '#374151' }
                  }
                >
                  {cat} {cat !== 'All' && `(${programmes.filter(p => p.category === cat).length})`}
                </button>
              );
            })}
          </div>

          {/* Category description */}
          {activeCategory !== 'All' && CATEGORY_META[activeCategory] && (
            <div className="mb-6 p-4 rounded-xl text-sm font-medium"
              style={{ background: CATEGORY_META[activeCategory].bg, color: CATEGORY_META[activeCategory].color }}>
              {CATEGORY_META[activeCategory].desc}
            </div>
          )}

          {/* Programme list */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading programmes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No programmes found in this category.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(prog => {
                const meta = CATEGORY_META[prog.category] || CATEGORY_META['General'];
                return (
                  <div
                    key={prog.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-xl bg-white hover:bg-yellow-50/40 transition-colors duration-200 group border border-gray-100 hover:border-yellow-200"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-extrabold tracking-widest px-3 py-1.5 rounded-lg flex-shrink-0"
                        style={{ background: `${NAVY}0d`, color: NAVY }}>
                        {prog.code}
                      </span>
                      <div>
                        <span className="text-gray-800 font-semibold text-sm">{prog.title}</span>
                        {prog.description && (
                          <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{prog.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 pl-2 sm:pl-0">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ background: meta.bg, color: meta.color }}>
                        {prog.category}
                      </span>
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: `${GOLD}22`, color: '#8a6b1e' }}>
                        {prog.days} {prog.days === 1 ? 'Day' : 'Days'}
                      </span>
                      <button
                        onClick={() => onNavigate('contact')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: NAVY, color: 'white' }}
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── REGISTRATION CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg" alt="Training CTA" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}F2, ${NAVY}D0)` }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
            Ready to Upskill <span style={{ color: GOLD }}>Your Team?</span>
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            All programmes are fully customised and delivered in-house at your premises. Contact us to discuss scheduling and content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 font-bold text-base rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: GOLD, color: NAVY }}
            >
              Enroll Your Team <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 font-bold text-base rounded-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              Request Custom Programme
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
