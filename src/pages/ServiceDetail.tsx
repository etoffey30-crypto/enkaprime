import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, ChevronLeft, CheckCircle, AlertTriangle, Wrench, TrendingUp, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

interface ServiceData {
  title: string;
  tagline: string;
  heroImage: string;
  components: string[];
  painPoints: string[];
  solutions: string[];
  benefits: string[];
}

const SERVICE_DATA: Record<string, ServiceData> = {
  records: {
    title: 'Records Digitalisation & Document Management Systems',
    tagline: 'Turning paper trails into structured, searchable digital intelligence.',
    heroImage: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
    components: [
      'Records audit and classification framework',
      'Digital scanning and metadata tagging of physical records',
      'Document Management System (DMS) design and implementation',
      'Workflow automation for document routing and approvals',
      'Access control and permission-based document security',
      'Retention schedule development and archiving policies',
      'Staff training on DMS usage and document protocols',
    ],
    painPoints: [
      'Thousands of physical files with no systematic organisation',
      'Wasted hours searching for contracts, reports, or financial records',
      'Lost or misplaced documents creating compliance and audit risks',
      'No version control — staff working from outdated documents',
      'Remote teams unable to access records quickly or securely',
      'No retention policy — accumulation of irrelevant or obsolete files',
    ],
    solutions: [
      'Conduct a full records audit to classify, prioritise and categorise all documents',
      'Design a structured folder taxonomy aligned with your organisational functions',
      'Implement a cloud-based or on-premise DMS tailored to your infrastructure',
      'Configure automated workflows for approvals, reviews and retention triggers',
      'Establish role-based access to protect sensitive information',
      'Develop a records management policy and train staff on adoption',
    ],
    benefits: [
      'Instant document retrieval — reducing search time by up to 80%',
      'Full audit trail with version history and access logs',
      'Improved compliance readiness for regulatory inspections',
      'Secure remote access for distributed teams',
      'Reduced storage costs by eliminating duplicate and redundant records',
      'Greater organisational confidence and operational continuity',
    ],
  },

  asset: {
    title: 'Asset Tagging & Asset Register Development',
    tagline: 'Full visibility over every asset — from acquisition to disposal.',
    heroImage: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg',
    components: [
      'Physical asset verification and condition assessment',
      'Barcode or QR code tagging of all identified assets',
      'Asset register design and population in structured format',
      'Asset categorisation by class, location, cost centre and status',
      'Integration with financial systems and depreciation schedules',
      'Disposals, write-offs, and asset movement tracking protocols',
      'Staff training on asset management procedures',
    ],
    painPoints: [
      'No centralised register of what the organisation owns or where it is',
      'Inability to reconcile physical assets with financial statements',
      'Assets reported lost, stolen or "missing" with no tracking trail',
      'Overstated or understated asset values due to lack of data',
      'Annual audits delayed or failed because of incomplete asset records',
      'No lifecycle tracking — assets replaced unnecessarily or used past useful life',
    ],
    solutions: [
      'Deploy a physical verification team to locate and document all assets',
      'Apply durable barcode or QR labels to every identified item',
      'Build a structured asset register capturing all required metadata',
      'Align asset data with your finance team\'s chart of accounts',
      'Implement movement and disposal protocols to keep records current',
      'Provide a digital dashboard for real-time asset status monitoring',
    ],
    benefits: [
      'A clean, complete and accurate asset register ready for audits',
      'Dramatic reduction in asset losses and unaccountable disposals',
      'Better financial reporting with correct depreciation calculations',
      'Faster, cleaner audit processes — both internal and external',
      'Informed procurement decisions based on real asset lifecycle data',
      'Improved accountability across departments and locations',
    ],
  },

  iso: {
    title: 'ISO Implementation & Compliance Support',
    tagline: 'Structured frameworks that build trust, reduce risk, and prove quality.',
    heroImage: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
    components: [
      'ISO gap analysis against relevant standard (ISO 9001, 14001, 45001, 27001)',
      'Implementation roadmap and project management support',
      'Documented quality management system (QMS) development',
      'Process mapping, standard operating procedures (SOPs)',
      'Internal audit programme design and execution',
      'Corrective and preventive action (CAPA) systems',
      'Pre-certification audit support and certification readiness review',
    ],
    painPoints: [
      'Unclear processes — staff operating from informal habits rather than defined procedures',
      'Repeated errors and rework with no root cause analysis system',
      'Clients or funders demanding ISO certification as a contract requirement',
      'Failed or inconclusive audits due to incomplete documentation',
      'Regulatory non-conformances with no structured corrective system',
      'Leadership unsure of how to begin or sustain a compliance framework',
    ],
    solutions: [
      'Conduct a gap analysis to establish your baseline and identify what\'s missing',
      'Develop a realistic, phased implementation plan from gap to certification',
      'Build all required documentation — quality manual, SOPs, forms, registers',
      'Train your internal team to run and maintain the management system',
      'Conduct internal audits to validate conformance before certification',
      'Provide ongoing support through the certification body audit process',
    ],
    benefits: [
      'Internationally recognised certification that builds client and investor confidence',
      'Consistent, repeatable processes that reduce errors and rework',
      'A structured framework for continuous improvement',
      'Demonstrated compliance with legal, regulatory and contractual requirements',
      'Competitive advantage in procurement and tendering processes',
      'Reduced operational risk and improved organisational resilience',
    ],
  },
};

interface ServiceDetailProps {
  serviceKey: 'records' | 'asset' | 'iso';
  onNavigate: (page: string) => void;
}

export default function ServiceDetail({ serviceKey, onNavigate }: ServiceDetailProps) {
  const [data, setData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadServiceData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: dbData } = await supabase
        .from('services')
        .select('*')
        .eq('code', serviceKey)
        .single();

      if (dbData) {
        setData({
          title: dbData.title,
          tagline: dbData.tagline || dbData.full_description,
          heroImage: dbData.image_url,
          components: dbData.components || [],
          painPoints: dbData.pain_points || [],
          solutions: dbData.solutions || [],
          benefits: dbData.benefits || [],
        });
      } else {
        setData(SERVICE_DATA[serviceKey] || null);
      }
    } catch (e) {
      setData(SERVICE_DATA[serviceKey] || null);
    }
    setLoading(false);
  }, [serviceKey]);

  useEffect(() => {
    loadServiceData();
  }, [loadServiceData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ color: NAVY }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-500 font-custom">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: NAVY }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Service not found</h2>
          <button onClick={() => onNavigate('services')} className="text-sm font-bold underline">
            ← Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans pt-20 overflow-hidden">

      {/* ── SECTION 1: HERO ── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={data.heroImage} alt={data.title} className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}F2 0%, ${NAVY}CC 100%)` }} />
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
            Enka Prime Consulting
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight max-w-4xl">
            {data.title}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl italic leading-relaxed">
            {data.tagline}
          </p>
        </div>
      </section>

      {/* ── SECTION 2: SERVICE COMPONENTS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
                style={{ background: `${GOLD}18`, color: GOLD }}>
                What We Deliver
              </div>
              <h2 className="text-3xl font-extrabold mb-6" style={{ color: NAVY }}>
                Scope of <span style={{ color: GOLD }}>Service</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Our engagement is structured and systematic — covering every aspect of the problem from initial assessment through full implementation and handover.
              </p>
              <div className="space-y-3">
                {data.components.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-yellow-300 hover:shadow-sm transition-all duration-200">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${GOLD}20` }}>
                      <CheckCircle size={14} style={{ color: GOLD }} />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual accent panel */}
            <div className="relative hidden lg:block">
              <div className="rounded-3xl overflow-hidden h-[500px] shadow-2xl">
                <img src={data.heroImage} alt="Service visual" className="w-full h-full object-cover" />
                <div className="absolute inset-0 rounded-3xl"
                  style={{ background: `linear-gradient(to top, ${NAVY}99, transparent 50%)` }} />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs">
                <div className="text-4xl font-black mb-1" style={{ color: GOLD }}>{data.components.length}</div>
                <div className="text-sm font-bold" style={{ color: NAVY }}>Delivery Components</div>
                <div className="text-xs text-gray-500 mt-1">Structured engagement scope</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: PAIN POINTS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              <AlertTriangle size={12} /> The Problem
            </div>
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: NAVY }}>
              What Organisations Are <span className="text-red-600">Struggling With</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              If any of these challenges sound familiar, this is exactly what we were built to fix.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.painPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md"
                style={{ background: '#fff5f5', borderColor: '#fecaca' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-red-100">
                  <AlertTriangle size={14} className="text-red-500" />
                </div>
                <span className="text-gray-700 text-sm leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: WHAT WE FIX ── */}
      <section className="py-20" style={{ background: `${NAVY}06` }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
              <Wrench size={12} /> Our Approach
            </div>
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: NAVY }}>
              How <span style={{ color: GOLD }}>Enka Prime</span> Intervenes
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              A structured, hands-on engagement designed to deliver lasting results — not just a report.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {data.solutions.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-green-100 hover:shadow-md hover:border-green-200 transition-all duration-200">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-extrabold"
                  style={{ background: '#dcfce7', color: '#16a34a' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <span className="text-gray-700 text-sm leading-relaxed pt-1">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: BENEFITS / OUTCOMES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: `${GOLD}18`, color: GOLD }}>
              <TrendingUp size={12} /> Measurable Impact
            </div>
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: NAVY }}>
              Benefits & <span style={{ color: GOLD }}>Outcomes</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Our engagements are results-driven. Here's what your organisation gains.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.benefits.map((benefit, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-yellow-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group bg-white">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${GOLD}18` }}>
                  <CheckCircle size={20} style={{ color: GOLD }} />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg" alt="CTA background" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}F2, ${NAVY}CC)` }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            style={{ background: `${GOLD}25`, color: GOLD, border: `1px solid ${GOLD}40` }}>
            Ready to Get Started?
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Let's Build a Solution for<br />
            <span style={{ color: GOLD }}>Your Organisation</span>
          </h2>

          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Every engagement begins with a free consultation to understand your current situation, challenges, and goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 font-bold text-base rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: GOLD, color: NAVY }}
            >
              Request Consultation <ArrowRight size={18} />
            </button>
            <a
              href="mailto:info@enkaprime.com"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 font-bold text-base rounded-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <Mail size={18} /> Email Us Directly
            </a>
            <a
              href="tel:0200769146"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 font-bold text-base rounded-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <Phone size={18} /> Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
