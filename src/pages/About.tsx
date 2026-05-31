import { CheckCircle, Award, Target, Users, ChevronLeft, ArrowRight } from 'lucide-react';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

interface AboutProps {
  onNavigate: (page: string) => void;
  settings: Record<string, string>;
}

export default function About({ onNavigate, settings }: AboutProps) {
  return (
    <div className="min-h-screen bg-white font-sans pt-20 overflow-hidden">
      {/* Header */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings.about_hero_image || "https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg"}
            alt="About"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}95, ${NAVY}85)` }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-lg backdrop-blur-sm text-white font-semibold hover:bg-white/10 transition-colors animate-fade-in-down"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <ChevronLeft size={18} /> Back to Home
          </button>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg animate-fade-in-up">
            About <span style={{ color: GOLD }}>Enka Prime</span>
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl max-w-3xl drop-shadow-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Transforming organisations through world-class, practical corporate training.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-14 sm:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14 sm:mb-20">
            <div className="animate-fade-in-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 transition-all hover:scale-110 hover:shadow-lg"
                style={{ background: `${GOLD}22`, color: GOLD }}>
                Our Story
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: NAVY }}>
                {settings.about_title || 'Delivering Excellence'}<br />
                <span style={{ color: GOLD }}>Since Day One</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-base sm:text-lg transition-all hover:text-gray-800">
                {settings.about_description || 'Enka Prime Consulting Ltd is a professional corporate training firm committed to empowering individuals and organisations through high-impact, practical skill development programmes.'}
              </p>
              <p className="text-gray-600 leading-relaxed mb-6 transition-all hover:text-gray-800">
                {settings.about_extended || 'Founded on the principle that training should directly translate to workplace performance, we deliver tailored, in-house programmes across six core disciplines. Our approach combines deep industry expertise with hands-on methodologies.'}
              </p>
              <p className="text-gray-600 leading-relaxed transition-all hover:text-gray-800">
                Every trainer brings real-world experience. Every programme is customised. Every outcome is measurable.
                We don't just train — we transform.
              </p>
            </div>

            <div className="animate-fade-in-right">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <img
                  src={settings.about_image || "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg"}
                  alt="Professional meeting"
                  className="w-full h-64 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                <div className="absolute inset-0 border-2 rounded-2xl" style={{ borderColor: `${GOLD}40` }} />
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-5 sm:gap-10 mb-14 sm:mb-20">
            {[
              {
                title: 'Our Mission',
                icon: Target,
                content: 'To empower individuals and organisations through transformative, practical training that builds capability, enhances performance, and drives sustainable growth.',
                tagline: settings.about_tagline || 'Empowering People. Enhancing Performance. Delivering Excellence.',
              },
              {
                title: 'Our Values',
                icon: CheckCircle,
                content: 'Practicality, Excellence, Integrity, Accountability, Innovation, Collaboration',
                tagline: 'Built on trust and proven results',
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 sm:p-10 rounded-xl sm:rounded-2xl border-2 transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
                  style={{
                    background: `${NAVY}02`,
                    borderColor: `${GOLD}40`,
                    animation: `slideInUp 0.6s ease-out ${idx * 100}ms both`
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon size={28} style={{ color: GOLD }} />
                    <h3 className="text-2xl font-bold" style={{ color: NAVY }}>{item.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {item.content}
                  </p>
                  <div className="text-sm italic font-semibold" style={{ color: GOLD }}>
                    {item.tagline}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-14 sm:py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-16 animate-fade-in-down">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: NAVY }}>
              Why Choose <span style={{ color: GOLD }}>Enka Prime?</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg">
              We're committed to delivering training that makes a measurable difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[
              { icon: CheckCircle, title: 'In-House Delivery', desc: 'All programmes delivered at your premises for convenience and team cohesion.' },
              { icon: Award, title: 'Certified Trainers', desc: 'Industry-experienced facilitators with proven track records across disciplines.' },
              { icon: Target, title: 'Practical Focus', desc: 'Hands-on training that translates directly to workplace performance.' },
              { icon: Users, title: 'Tailored Content', desc: 'Programmes customised to your sector, team size and goals.' },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={title}
                className="bg-white p-6 sm:p-7 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 group"
                style={{
                  animation: `slideInUp 0.6s ease-out ${idx * 100}ms both`
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${GOLD}22` }}
                >
                  <Icon size={24} style={{ color: GOLD }} />
                </div>
                <h4 className="font-bold text-lg mb-2 transition-all duration-300 group-hover:text-yellow-600" style={{ color: NAVY }}>
                  {title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-14 sm:py-20 sm:rounded-2xl overflow-hidden mx-0 sm:mx-6 my-0 sm:my-20">
        <div className="absolute inset-0">
          <img
            src={settings.team_image || "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg"}
            alt="Team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}95, ${NAVY}88)` }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6 py-10 sm:py-20 animate-fade-in">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Our <span style={{ color: GOLD }}>Experienced Team</span>
          </h3>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed drop-shadow-md">
            Every trainer on our team brings extensive corporate experience. We recruit facilitators who have walked
            in our clients' shoes — individuals who understand the real challenges of modern organisations and know
            what it takes to deliver results.
          </p>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-14 sm:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16 animate-fade-in-down">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: NAVY }}>
              Our <span style={{ color: GOLD }}>Commitment to You</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-8">
            {[
              { number: '01', title: 'Quality Assurance', desc: 'Every programme is rigorously designed, delivered by certified trainers, and evaluated for measurable outcomes.' },
              { number: '02', title: 'Customisation', desc: 'We work closely with you to understand your specific needs and tailor content to your industry and team.' },
              { number: '03', title: 'Ongoing Support', desc: 'We don\'t just deliver training — we support implementation and reinforce learning in the workplace.' },
            ].map(({ number, title, desc }, idx) => (
              <div
                key={number}
                className="bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 group"
                style={{
                  animation: `slideInUp 0.6s ease-out ${idx * 100}ms both`
                }}
              >
                <div className="text-5xl font-bold mb-3 transition-all duration-300 group-hover:scale-110 origin-left" style={{ color: GOLD }}>
                  {number}
                </div>
                <h3 className="text-xl font-bold mb-3 transition-all duration-300 group-hover:text-yellow-600" style={{ color: NAVY }}>
                  {title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings.about_cta_image || "https://images.pexels.com/photos/3532554/pexels-photo-3532554.jpeg"}
            alt="Partnership"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}95, ${NAVY}85)` }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Let's Partner<br />
            <span style={{ color: GOLD }}>For Success</span>
          </h2>
          <p className="text-blue-100 text-lg mb-10 drop-shadow-md">
            Ready to invest in your team's development? Contact us today to discuss your training needs.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 font-bold text-base sm:text-lg rounded tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto"
            style={{ background: GOLD, color: NAVY }}
          >
            Get In Touch <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
