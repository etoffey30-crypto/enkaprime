import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Menu, LogOut, Settings, Users, BookOpen, BarChart3, Save, Plus, Trash2, CreditCard as Edit3, Eye, EyeOff, ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Star, Image as ImageIcon } from 'lucide-react';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

type Section = 'dashboard' | 'settings' | 'services' | 'programmes' | 'stats';
type Tab = Section;

interface SiteSetting { id: string; key: string; value: string; updated_at: string }
interface Service { id: string; code: string; title: string; description: string; full_description: string; image_url: string; sort_order: number; is_active: boolean; created_at: string; updated_at: string }
interface Programme { id: string; code: string; title: string; days: number; category: string; is_active: boolean; is_featured: boolean; description: string; created_at: string; updated_at: string }
interface Stat { id: string; value: string; label: string; sort_order: number; is_active: boolean; created_at: string; updated_at: string }

interface AdminProps {
  onNavigate: (page: string) => void;
}

export default function Admin({ onNavigate }: AdminProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data states
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  // Edit states
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const [editingSetting, setEditingSetting] = useState<Record<string, string>>({});
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(null);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [showNewService, setShowNewService] = useState(false);
  const [showNewProgramme, setShowNewProgramme] = useState(false);
  const [showNewStat, setShowNewStat] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    if (!session) return;
    const [settingsRes, servicesRes, programmesRes, statsRes] = await Promise.all([
      supabase.from('site_settings').select('*').order('key'),
      supabase.from('services').select('*').order('sort_order'),
      supabase.from('programmes').select('*').order('category, code'),
      supabase.from('stats').select('*').order('sort_order'),
    ]);
    if (settingsRes.data) {
      setSettings(settingsRes.data);
      const map: Record<string, string> = {};
      settingsRes.data.forEach((s: SiteSetting) => { map[s.key] = s.value; });
      setEditingSetting(map);
      setOriginalSettings(map);
    }
    if (servicesRes.data) setServices(servicesRes.data);
    if (programmesRes.data) setProgrammes(programmesRes.data);
    if (statsRes.data) setStats(statsRes.data);
  }, [session]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setAuthError(error.message); return; }
      setSignUpSuccess(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // ─── Settings save ───
  const saveSettings = async () => {
    try {
      const changedSettings = Object.entries(editingSetting)
        .filter(([key, value]) => value !== originalSettings[key])
        .map(([key, value]) => ({
          key,
          value,
          updated_at: new Date().toISOString()
        }));

      if (changedSettings.length === 0) {
        showToast('No changes to save');
        return;
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert(changedSettings, { onConflict: 'key' });

      if (error) throw error;

      await loadData();
      showToast('Settings saved successfully');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      showToast(err.message || 'Failed to save settings. Please check database permissions.', 'error');
    }
  };

  // ─── Service CRUD ───
  const saveService = async (svc: Partial<Service>) => {
    if (svc.id) {
      const { error } = await supabase.from('services').update({ ...svc, updated_at: new Date().toISOString() }).eq('id', svc.id);
      if (error) { showToast(error.message, 'error'); return; }
    } else {
      const { error } = await supabase.from('services').insert(svc);
      if (error) { showToast(error.message, 'error'); return; }
    }
    setEditingService(null);
    setShowNewService(false);
    await loadData();
    showToast('Service saved');
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await supabase.from('services').delete().eq('id', id);
    await loadData();
    showToast('Service deleted');
  };

  const toggleServiceActive = async (id: string, is_active: boolean) => {
    await supabase.from('services').update({ is_active: !is_active, updated_at: new Date().toISOString() }).eq('id', id);
    await loadData();
    showToast(`Service ${!is_active ? 'activated' : 'deactivated'}`);
  };

  // ─── Programme CRUD ───
  const saveProgramme = async (prog: Partial<Programme>) => {
    if (prog.id) {
      const { error } = await supabase.from('programmes').update({ ...prog, updated_at: new Date().toISOString() }).eq('id', prog.id);
      if (error) { showToast(error.message, 'error'); return; }
    } else {
      const { error } = await supabase.from('programmes').insert(prog);
      if (error) { showToast(error.message, 'error'); return; }
    }
    setEditingProgramme(null);
    setShowNewProgramme(false);
    await loadData();
    showToast('Programme saved');
  };

  const deleteProgramme = async (id: string) => {
    if (!confirm('Delete this programme?')) return;
    await supabase.from('programmes').delete().eq('id', id);
    await loadData();
    showToast('Programme deleted');
  };

  const toggleProgrammeActive = async (id: string, is_active: boolean) => {
    await supabase.from('programmes').update({ is_active: !is_active, updated_at: new Date().toISOString() }).eq('id', id);
    await loadData();
  };

  const toggleProgrammeFeatured = async (id: string, is_featured: boolean) => {
    await supabase.from('programmes').update({ is_featured: !is_featured, updated_at: new Date().toISOString() }).eq('id', id);
    await loadData();
  };

  // ─── Stat CRUD ───
  const saveStat = async (stat: Partial<Stat>) => {
    if (stat.id) {
      const { error } = await supabase.from('stats').update({ ...stat, updated_at: new Date().toISOString() }).eq('id', stat.id);
      if (error) { showToast(error.message, 'error'); return; }
    } else {
      const { error } = await supabase.from('stats').insert(stat);
      if (error) { showToast(error.message, 'error'); return; }
    }
    setEditingStat(null);
    setShowNewStat(false);
    await loadData();
    showToast('Stat saved');
  };

  const deleteStat = async (id: string) => {
    if (!confirm('Delete this stat?')) return;
    await supabase.from('stats').delete().eq('id', id);
    await loadData();
    showToast('Stat deleted');
  };

  const toggleStatActive = async (id: string, is_active: boolean) => {
    await supabase.from('stats').update({ is_active: !is_active, updated_at: new Date().toISOString() }).eq('id', id);
    await loadData();
  };

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  // ─── Login screen ───
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/enkaprime/enkaprime-logo.png" alt="Enka Prime" className="h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Admin Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to manage your website content</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {authError}
              </div>
            )}
            {signUpSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> Account created! You can now sign in.
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 bg-gray-50"
                placeholder="admin@enkaprime.com"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 bg-gray-50"
                placeholder={isSignUp ? 'Min. 6 characters' : 'Enter password'}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 font-bold rounded-xl text-white transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{ background: NAVY }}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); setSignUpSuccess(false); }}
              className="w-full mt-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </form>

          <button
            onClick={() => onNavigate('home')}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back to Website
          </button>
        </div>
      </div>
    );
  }

  // ─── Dashboard content ───
  const TAB_CONFIG: { key: Tab; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'settings', label: 'Site Settings', icon: Settings },
    { key: 'services', label: 'Services', icon: Users },
    { key: 'programmes', label: 'Programmes', icon: BookOpen },
    { key: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  const Sidebar = () => (
    <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ background: NAVY }}>
      <div className="p-5 border-b" style={{ borderColor: `${GOLD}30` }}>
        <img src="/enkaprime/enkaprime-logo.png" alt="Enka Prime" className="h-10 object-contain" />
        <div className="text-xs mt-2 font-semibold" style={{ color: GOLD }}>Admin Panel</div>
      </div>

      <nav className="flex-1 py-4">
        {TAB_CONFIG.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.key ? 'text-white' : 'text-blue-300 hover:text-white'
              }`}
              style={activeTab === tab.key ? { background: `${GOLD}20`, borderRight: `3px solid ${GOLD}` } : {}}
            >
              <Icon size={18} /> {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: `${GOLD}20` }}>
        <div className="text-blue-300 text-xs mb-3 truncate">{session.user.email}</div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-900/30 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );

  const DashboardView = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: NAVY }}>Dashboard Overview</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Services', count: services.length, active: services.filter(s => s.is_active).length, icon: Users, color: '#2563eb' },
          { label: 'Programmes', count: programmes.length, active: programmes.filter(p => p.is_active).length, icon: BookOpen, color: '#059669' },
          { label: 'Statistics', count: stats.length, active: stats.filter(s => s.is_active).length, icon: BarChart3, color: '#d97706' },
          { label: 'Settings', count: settings.length, active: settings.length, icon: Settings, color: '#7c3aed' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Icon size={22} style={{ color: item.color }} />
                <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: `${item.color}15`, color: item.color }}>
                  {item.active} active
                </span>
              </div>
              <div className="text-3xl font-bold" style={{ color: NAVY }}>{item.count}</div>
              <div className="text-sm text-gray-500 mt-1">{item.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4" style={{ color: NAVY }}>Featured Programmes</h3>
        <div className="space-y-2">
          {programmes.filter(p => p.is_featured).length === 0 && (
            <p className="text-gray-400 text-sm">No featured programmes. Mark programmes as featured from the Programmes tab.</p>
          )}
          {programmes.filter(p => p.is_featured).map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-100">
              <div>
                <span className="text-xs font-bold mr-2" style={{ color: GOLD }}>{p.code}</span>
                <span className="text-sm font-medium text-gray-800">{p.title}</span>
              </div>
              <span className="text-xs text-gray-500">{p.days} days</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4" style={{ color: NAVY }}>Quick Links</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: 'View Website', action: () => onNavigate('home'), icon: ArrowLeft },
            { label: 'Detailed CMS', action: () => onNavigate('cms'), icon: Settings },
            { label: 'Manage Services', action: () => setActiveTab('services'), icon: Users },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={item.action}
                className="flex items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-yellow-300 hover:shadow-md transition-all text-left">
                <Icon size={18} style={{ color: GOLD }} />
                <span className="text-sm font-semibold text-gray-700">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const ImageSettingField = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showToast('Please select a valid image file', 'error');
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1200;
              const MAX_HEIGHT = 1200;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                // Compress as JPEG at 75% quality to significantly reduce payload size
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                onChange(compressedDataUrl);
              } else {
                onChange(reader.result as string);
              }
            };
            img.src = reader.result;
          }
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col md:flex-row gap-5 items-start md:items-center mb-2">
        {/* Image Preview */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full md:w-48 h-28 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center cursor-pointer hover:border-yellow-500 hover:shadow-md transition-all relative group"
        >
          {value ? (
            <>
              <img src={value} alt={label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                <ImageIcon size={16} /> Click to Upload
              </div>
            </>
          ) : (
            <div className="text-gray-400 flex flex-col items-center gap-1">
              <ImageIcon size={24} />
              <span className="text-[10px] font-semibold">No Image</span>
            </div>
          )}
        </div>

        {/* Inputs & Actions */}
        <div className="flex-1 w-full space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-gray-500">{label}</label>
            <input
              type="text"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder="Paste image link here (e.g. from Pexels/Unsplash)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 text-xs bg-white text-gray-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-bold rounded-lg hover:scale-105 transition-all shadow-sm flex items-center gap-1.5 text-white"
              style={{ backgroundColor: NAVY }}
            >
              <Plus size={14} /> Upload from Computer
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg transition-all"
              >
                Clear Image
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Site Settings</h2>
        <button onClick={saveSettings}
          className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg transition-all hover:scale-105"
          style={{ background: GOLD, color: NAVY }}>
          <Save size={16} /> Save All
        </button>
      </div>

      <div className="space-y-4">
        {[
          { group: 'General Settings & Website Logo', keys: ['site_logo'] },
          { group: 'Hero Section', keys: ['hero_title', 'hero_subtitle', 'hero_description', 'hero_badge_text', 'hero_image'] },
          { group: 'About Section', keys: ['about_title', 'about_description', 'about_extended', 'about_tagline', 'about_image', 'about_hero_image', 'team_image', 'about_cta_image'] },
          { group: 'Featured Programme', keys: ['featured_title', 'featured_subtitle'] },
          { group: 'CTA Section', keys: ['cta_title', 'cta_description', 'cta_image'] },
          { group: 'Contact Info & Pages', keys: ['contact_email', 'contact_phone', 'contact_location', 'contact_hero_image', 'programmes_hero_image'] },
        ].map(group => (
          <div key={group.group} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100" style={{ background: `${NAVY}05` }}>
              <h3 className="font-bold text-sm" style={{ color: NAVY }}>{group.group}</h3>
            </div>
            <div className="p-6 space-y-4">
              {group.keys.map(key => (
                <div key={key}>
                  {key.includes('_image') || key.includes('_logo') ? (
                    <ImageSettingField
                      label={key.replace(/_/g, ' ')}
                      value={editingSetting[key] || ''}
                      onChange={val => setEditingSetting(prev => ({ ...prev, [key]: val }))}
                    />
                  ) : (
                    <>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{key.replace(/_/g, ' ')}</label>
                      {key.includes('description') || key.includes('extended') || key.includes('subtitle') ? (
                        <textarea
                          rows={3}
                          value={editingSetting[key] || ''}
                          onChange={e => setEditingSetting(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 text-sm bg-gray-50"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editingSetting[key] || ''}
                          onChange={e => setEditingSetting(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 text-sm bg-gray-50"
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={saveSettings}
          className="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-lg transition-all hover:scale-105"
          style={{ background: GOLD, color: NAVY }}>
          <Save size={16} /> Save All Settings
        </button>
      </div>
    </div>
  );

  const ServiceForm = ({ svc, onSave, onCancel }: { svc: Partial<Service>; onSave: (s: Partial<Service>) => void; onCancel: () => void }) => {
    const [form, setForm] = useState(svc);
    return (
      <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-5 mb-4">
        <h4 className="font-bold text-sm mb-4" style={{ color: NAVY }}>{svc.id ? 'Edit Service' : 'New Service'}</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Code</label>
            <input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
            <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Short Description</label>
            <textarea rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Full Description</label>
            <textarea rows={3} value={form.full_description || ''} onChange={e => setForm({ ...form, full_description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Image URL</label>
            <input value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sort Order</label>
            <input type="number" value={form.sort_order || 0} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={() => onSave(form)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg text-white"
            style={{ background: NAVY }}>
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    );
  };

  const ServicesView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Services</h2>
        <button onClick={() => setShowNewService(true)}
          className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg transition-all hover:scale-105"
          style={{ background: GOLD, color: NAVY }}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      {showNewService && (
        <ServiceForm
          svc={{ code: '', title: '', description: '', full_description: '', image_url: '', sort_order: services.length + 1, is_active: true }}
          onSave={saveService}
          onCancel={() => setShowNewService(false)}
        />
      )}

      <div className="space-y-3">
        {services.map(svc => (
          <div key={svc.id}>
            {editingService?.id === svc.id ? (
              <ServiceForm svc={svc} onSave={saveService} onCancel={() => setEditingService(null)} />
            ) : (
              <div className={`bg-white rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${svc.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                {svc.image_url && (
                  <img src={svc.image_url} alt={svc.title} className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${NAVY}0d`, color: NAVY }}>{svc.code}</span>
                    <span className="font-semibold text-sm" style={{ color: NAVY }}>{svc.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{svc.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleServiceActive(svc.id, svc.is_active)} title={svc.is_active ? 'Deactivate' : 'Activate'}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    {svc.is_active ? <Eye size={16} className="text-green-600" /> : <EyeOff size={16} className="text-gray-400" />}
                  </button>
                  <button onClick={() => setEditingService(svc)} title="Edit"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Edit3 size={16} style={{ color: GOLD }} />
                  </button>
                  <button onClick={() => deleteService(svc.id)} title="Delete"
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const ProgrammeForm = ({ prog, onSave, onCancel }: { prog: Partial<Programme>; onSave: (p: Partial<Programme>) => void; onCancel: () => void }) => {
    const [form, setForm] = useState(prog);
    return (
      <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-5 mb-4">
        <h4 className="font-bold text-sm mb-4" style={{ color: NAVY }}>{prog.id ? 'Edit Programme' : 'New Programme'}</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Code</label>
            <input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
            <select value={form.category || 'General'} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500">
              {['Leadership', 'Customer Service', 'HSE', 'Finance', 'Digital', 'General'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
            <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Duration (days)</label>
            <input type="number" min={1} value={form.days || 1} onChange={e => setForm({ ...form, days: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
            <textarea rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={() => onSave(form)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg text-white"
            style={{ background: NAVY }}>
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    );
  };

  const ProgrammesView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Programmes</h2>
        <button onClick={() => setShowNewProgramme(true)}
          className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg transition-all hover:scale-105"
          style={{ background: GOLD, color: NAVY }}>
          <Plus size={16} /> Add Programme
        </button>
      </div>

      {showNewProgramme && (
        <ProgrammeForm
          prog={{ code: '', title: '', days: 2, category: 'General', is_active: true, is_featured: false, description: '' }}
          onSave={saveProgramme}
          onCancel={() => setShowNewProgramme(false)}
        />
      )}

      <div className="space-y-3">
        {programmes.map(prog => (
          <div key={prog.id}>
            {editingProgramme?.id === prog.id ? (
              <ProgrammeForm prog={prog} onSave={saveProgramme} onCancel={() => setEditingProgramme(null)} />
            ) : (
              <div className={`bg-white rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${prog.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${NAVY}0d`, color: NAVY }}>{prog.code}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: `${GOLD}22`, color: '#8a6b1e' }}>{prog.category}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{prog.days} {prog.days === 1 ? 'day' : 'days'}</span>
                    {prog.is_featured && <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${GOLD}44`, color: GOLD }}>Featured</span>}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: NAVY }}>{prog.title}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleProgrammeFeatured(prog.id, prog.is_featured)} title={prog.is_featured ? 'Unfeature' : 'Feature'}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Star size={16} className={prog.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} />
                  </button>
                  <button onClick={() => toggleProgrammeActive(prog.id, prog.is_active)} title={prog.is_active ? 'Deactivate' : 'Activate'}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    {prog.is_active ? <Eye size={16} className="text-green-600" /> : <EyeOff size={16} className="text-gray-400" />}
                  </button>
                  <button onClick={() => setEditingProgramme(prog)} title="Edit"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Edit3 size={16} style={{ color: GOLD }} />
                  </button>
                  <button onClick={() => deleteProgramme(prog.id)} title="Delete"
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const StatForm = ({ stat, onSave, onCancel }: { stat: Partial<Stat>; onSave: (s: Partial<Stat>) => void; onCancel: () => void }) => {
    const [form, setForm] = useState(stat);
    return (
      <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-5 mb-4">
        <h4 className="font-bold text-sm mb-4" style={{ color: NAVY }}>{stat.id ? 'Edit Stat' : 'New Stat'}</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Value</label>
            <input value={form.value || ''} onChange={e => setForm({ ...form, value: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" placeholder="500+" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Label</label>
            <input value={form.label || ''} onChange={e => setForm({ ...form, label: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" placeholder="Professionals Trained" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sort Order</label>
            <input type="number" value={form.sort_order || 0} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-yellow-500" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={() => onSave(form)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg text-white"
            style={{ background: NAVY }}>
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    );
  };

  const StatsView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Statistics</h2>
        <button onClick={() => setShowNewStat(true)}
          className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg transition-all hover:scale-105"
          style={{ background: GOLD, color: NAVY }}>
          <Plus size={16} /> Add Stat
        </button>
      </div>

      {showNewStat && (
        <StatForm
          stat={{ value: '', label: '', sort_order: stats.length + 1, is_active: true }}
          onSave={saveStat}
          onCancel={() => setShowNewStat(false)}
        />
      )}

      <div className="space-y-3">
        {stats.map(stat => (
          <div key={stat.id}>
            {editingStat?.id === stat.id ? (
              <StatForm stat={stat} onSave={saveStat} onCancel={() => setEditingStat(null)} />
            ) : (
              <div className={`bg-white rounded-xl border p-5 flex items-center gap-4 ${stat.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                <div className="text-2xl font-bold flex-shrink-0 min-w-[80px]" style={{ color: GOLD }}>{stat.value}</div>
                <div className="flex-1">
                  <span className="font-semibold text-sm" style={{ color: NAVY }}>{stat.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleStatActive(stat.id, stat.is_active)} title={stat.is_active ? 'Deactivate' : 'Activate'}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    {stat.is_active ? <Eye size={16} className="text-green-600" /> : <EyeOff size={16} className="text-gray-400" />}
                  </button>
                  <button onClick={() => setEditingStat(stat)} title="Edit"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Edit3 size={16} style={{ color: GOLD }} />
                  </button>
                  <button onClick={() => deleteStat(stat.id)} title="Delete"
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar />

      <div className="flex-1 min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold" style={{ color: NAVY }}>
              {TAB_CONFIG.find(t => t.key === activeTab)?.label || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => loadData()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Refresh data">
              <RefreshCw size={18} className="text-gray-500" />
            </button>
            <button onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors text-gray-600">
              <ArrowLeft size={14} /> View Site
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6 max-w-5xl">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'services' && <ServicesView />}
          {activeTab === 'programmes' && <ProgrammesView />}
          {activeTab === 'stats' && <StatsView />}
        </main>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold z-50 transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
