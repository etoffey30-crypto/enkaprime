import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Menu, LogOut, Settings, Users, BookOpen, BarChart3, Briefcase, 
  Save, Plus, Trash2, CreditCard as Edit3, Eye, EyeOff, 
  ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Star, 
  Image as ImageIcon, Palette, Compass, Layout, 
  ArrowUp, ArrowDown, FileText, Link, HelpCircle, Layers
} from 'lucide-react';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

type AdminTab = 'dashboard' | 'pages' | 'services' | 'programmes' | 'design_system' | 'navigation' | 'homepage_builder' | 'footer' | 'settings';

interface SiteSetting { id: string; key: string; value: string; updated_at: string }
interface Service { 
  id: string; 
  code: string; 
  title: string; 
  description: string; 
  full_description: string; 
  image_url: string; 
  sort_order: number; 
  is_active: boolean; 
  tagline?: string;
  components?: string[];
  pain_points?: string[];
  solutions?: string[];
  benefits?: string[];
  created_at: string; 
  updated_at: string; 
}
interface Programme { id: string; code: string; title: string; days: number; category: string; is_active: boolean; is_featured: boolean; description: string; created_at: string; updated_at: string }
interface CourseModule { id: string; code: string; title: string; description: string; duration: string }

export default function Admin({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Core Data States
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);

  // Settings Mapping
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});

  // Active editors
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProgramme, setEditingProgramme] = useState<any | null>(null);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);

  const [showNewService, setShowNewService] = useState(false);
  const [showNewProgramme, setShowNewProgramme] = useState(false);
  const [showNewModule, setShowNewModule] = useState(false);

  // Content Management - Selected Page editor
  const [selectedPage, setSelectedPage] = useState<'home' | 'about' | 'contact' | 'services'>('home');

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

  const loadAllData = useCallback(async () => {
    if (!session) return;
    const [settingsRes, servicesRes, programmesRes] = await Promise.all([
      supabase.from('site_settings').select('*').order('key'),
      supabase.from('services').select('*').order('sort_order'),
      supabase.from('programmes').select('*').order('category, code'),
    ]);

    if (settingsRes.data) {
      setSettings(settingsRes.data);
      const map: Record<string, string> = {};
      settingsRes.data.forEach((s: SiteSetting) => { map[s.key] = s.value; });
      setEditingSettings(map);
      setOriginalSettings(map);

      // Parse reusable course modules
      if (map.course_modules) {
        try {
          setCourseModules(JSON.parse(map.course_modules));
        } catch (e) {
          console.error('Failed to parse course modules:', e);
        }
      } else {
        setCourseModules([]);
      }
    }
    if (servicesRes.data) setServices(servicesRes.data);
    if (programmesRes.data) setProgrammes(programmesRes.data);
  }, [session]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

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

  // Helper: Central Save for Key/Value settings in Supabase
  const saveSettingKey = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      showToast(`Saved ${key.replace(/_/g, ' ')} successfully`);
      loadAllData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const saveMultipleSettings = async (updates: Record<string, string>) => {
    try {
      const payload = Object.entries(updates).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));
      const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'key' });
      if (error) throw error;
      showToast('Settings saved successfully');
      loadAllData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Save failed', 'error');
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
    await loadAllData();
    showToast('Service saved');
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await supabase.from('services').delete().eq('id', id);
    await loadAllData();
    showToast('Service deleted');
  };

  const toggleServiceActive = async (id: string, is_active: boolean) => {
    await supabase.from('services').update({ is_active: !is_active, updated_at: new Date().toISOString() }).eq('id', id);
    await loadAllData();
    showToast(`Service ${!is_active ? 'activated' : 'deactivated'}`);
  };

  // ─── Programme CRUD ───
  const saveProgramme = async (prog: any) => {
    // stringify modules array inside metadata if needed
    const { id, ...data } = prog;
    if (id) {
      const { error } = await supabase.from('programmes').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) { showToast(error.message, 'error'); return; }
    } else {
      const { error } = await supabase.from('programmes').insert(data);
      if (error) { showToast(error.message, 'error'); return; }
    }
    setEditingProgramme(null);
    setShowNewProgramme(false);
    await loadAllData();
    showToast('Programme saved');
  };

  const deleteProgramme = async (id: string) => {
    if (!confirm('Delete this programme?')) return;
    await supabase.from('programmes').delete().eq('id', id);
    await loadAllData();
    showToast('Programme deleted');
  };

  const toggleProgrammeActive = async (id: string, is_active: boolean) => {
    await supabase.from('programmes').update({ is_active: !is_active, updated_at: new Date().toISOString() }).eq('id', id);
    await loadAllData();
  };

  const toggleProgrammeFeatured = async (id: string, is_featured: boolean) => {
    await supabase.from('programmes').update({ is_featured: !is_featured, updated_at: new Date().toISOString() }).eq('id', id);
    await loadAllData();
  };

  // ─── Reusable Modules CRUD ───
  const saveCourseModule = async (mod: CourseModule) => {
    let updated = [...courseModules];
    const idx = updated.findIndex(m => m.id === mod.id);
    if (idx >= 0) {
      updated[idx] = mod;
    } else {
      updated.push(mod);
    }
    setCourseModules(updated);
    setEditingModule(null);
    setShowNewModule(false);
    // save to Supabase site_settings
    await saveSettingKey('course_modules', JSON.stringify(updated));
  };

  const deleteCourseModule = async (id: string) => {
    if (!confirm('Delete this reusable course module?')) return;
    const updated = courseModules.filter(m => m.id !== id);
    setCourseModules(updated);
    await saveSettingKey('course_modules', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900" style={{ background: NAVY }}>
        <RefreshCw size={32} className="animate-spin text-custom-secondary" style={{ color: GOLD }} />
      </div>
    );
  }

  // Login View
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/enkaprime/enkaprime-logo.png" alt="Enka Prime" className="h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-bold text-slate-800">Admin Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to manage consulting content</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {authError}
              </div>
            )}
            {signUpSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> Account created! Log in below.
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-slate-800">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 bg-gray-50 text-slate-800"
                placeholder="admin@enkaprime.com"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-slate-800">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 bg-gray-50 text-slate-800"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 font-bold rounded-xl text-white transition-all hover:scale-[1.02] bg-slate-900 hover:bg-slate-850"
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

  // Sidebar components config
  const TAB_CONFIG: { key: AdminTab; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'pages', label: 'Pages (Content)', icon: FileText },
    { key: 'services', label: 'Services Manager', icon: Briefcase },
    { key: 'programmes', label: 'Programmes & Modules', icon: BookOpen },
    { key: 'design_system', label: 'Design System', icon: Palette },
    { key: 'navigation', label: 'Navigation Manager', icon: Compass },
    { key: 'homepage_builder', label: 'Homepage Builder', icon: Layout },
    { key: 'footer', label: 'Footer Settings', icon: Layers },
    { key: 'settings', label: 'General Settings', icon: Settings },
  ];

  // 1. DASHBOARD VIEW
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome to Enka Prime CMS</h2>
          <p className="text-gray-500 text-sm">Control training parameters, modular configurations, and visual themes instantly.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          Supabase Connected
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Services', count: services.length, icon: Users, color: '#3b82f6' },
          { label: 'Catalogued Programmes', count: programmes.length, icon: BookOpen, color: '#10b981' },
          { label: 'Reusable Modules', count: courseModules.length, icon: Layers, color: '#f59e0b' },
          { label: 'Site Settings Saved', count: settings.length, icon: Settings, color: '#8b5cf6' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">{item.label}</span>
                <Icon size={18} style={{ color: item.color }} />
              </div>
              <div className="text-3xl font-extrabold text-slate-800">{item.count}</div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Quick Page Builders</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Edit Design System', tab: 'design_system' as AdminTab, icon: Palette },
              { label: 'Manage Navigation', tab: 'navigation' as AdminTab, icon: Compass },
              { label: 'Homepage Modules', tab: 'homepage_builder' as AdminTab, icon: Layout },
              { label: 'Footer Brand Settings', tab: 'footer' as AdminTab, icon: Settings },
            ].map(link => (
              <button
                key={link.label}
                onClick={() => setActiveTab(link.tab)}
                className="p-4 border border-gray-100 hover:border-yellow-500 rounded-xl flex flex-col gap-2 items-center text-center transition-colors group"
              >
                <link.icon size={22} className="text-gray-400 group-hover:text-custom-secondary" style={{ color: GOLD }} />
                <span className="text-xs font-semibold text-slate-700">{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured list */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Featured Catalogue Highlights</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {programmes.filter(p => p.is_featured).length === 0 ? (
              <p className="text-xs text-gray-400">No featured training programmes catalogued. Mark a programme as featured below.</p>
            ) : (
              programmes.filter(p => p.is_featured).map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-yellow-50/50 border border-yellow-100">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">{p.code}</span>
                    <span className="text-xs font-bold text-slate-700">{p.title}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{p.days} Days</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Image Upload Field helper
  const ImageUploadField = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => {
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX = 800;
              let w = img.width, h = img.height;
              if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
              else if (h > w && h > MAX) { w *= MAX / h; h = MAX; }
              canvas.width = w; canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, w, h);
                onChange(canvas.toDataURL('image/jpeg', 0.75));
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
      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col md:flex-row gap-5 items-start md:items-center">
        <div 
          onClick={() => fileRef.current?.click()}
          className="w-full md:w-36 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center cursor-pointer hover:border-yellow-500 transition-all relative group flex-shrink-0"
        >
          {value ? (
            <>
              <img src={value} alt={label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                Change Image
              </div>
            </>
          ) : (
            <div className="text-gray-400 flex flex-col items-center gap-0.5">
              <ImageIcon size={18} />
              <span className="text-[9px] font-bold">Upload Image</span>
            </div>
          )}
        </div>

        <div className="flex-1 w-full space-y-2">
          <div>
            <label className="block text-[10px] font-bold mb-1 uppercase text-gray-400">{label}</label>
            <input
              type="text"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder="Paste custom image URL or upload file"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="file" ref={fileRef} onChange={handleFile} accept="image/*" className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 text-[10px] font-bold rounded bg-slate-800 text-white hover:bg-slate-700 transition-all"
            >
              Upload Local File
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-1.5 text-[10px] text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── SERVICES MANAGER VIEW ───
  const ServicesManagerView = () => {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tagline, setTagline] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [components, setComponents] = useState<string[]>([]);
    const [painPoints, setPainPoints] = useState<string[]>([]);
    const [solutions, setSolutions] = useState<string[]>([]);
    const [benefits, setBenefits] = useState<string[]>([]);
    const [isActive, setIsActive] = useState(true);

    const [newComp, setNewComp] = useState('');
    const [newPain, setNewPain] = useState('');
    const [newSol, setNewSol] = useState('');
    const [newBen, setNewBen] = useState('');

    useEffect(() => {
      if (selectedService) {
        setTitle(selectedService.title || '');
        setDescription(selectedService.description || '');
        setTagline(selectedService.tagline || '');
        setImageUrl(selectedService.image_url || '');
        setComponents(selectedService.components || []);
        setPainPoints(selectedService.pain_points || []);
        setSolutions(selectedService.solutions || []);
        setBenefits(selectedService.benefits || []);
        setIsActive(selectedService.is_active);
      } else if (services.length > 0) {
        setSelectedService(services[0]);
      }
    }, [selectedService, services]);

    const handleSave = async () => {
      if (!selectedService) return;
      
      const payload: Partial<Service> = {
        id: selectedService.id,
        title,
        description,
        tagline,
        image_url: imageUrl,
        components,
        pain_points: painPoints,
        solutions,
        benefits,
        is_active: isActive,
      };

      await saveService(payload);
    };

    const addToArray = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, val: string, setVal: React.Dispatch<React.SetStateAction<string>>) => {
      if (!val.trim()) return;
      setArr([...arr, val.trim()]);
      setVal('');
    };

    const removeFromArray = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
      setArr(arr.filter((_, i) => i !== idx));
    };

    return (
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Services Sidebar List */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-2 mb-2">Service Pillars</h3>
          <div className="space-y-2">
            {services.map(svc => (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedService?.id === svc.id
                    ? 'border-yellow-500 bg-yellow-50/30 shadow-sm'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-800">{svc.title.split(' & ')[0]}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{svc.code}</div>
                </div>
                <div className={`text-[10px] px-2 py-0.5 rounded font-bold ${svc.is_active ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {svc.is_active ? 'Active' : 'Inactive'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Service Form */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          {selectedService ? (
            <>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Edit Service: {selectedService.title.split(' & ')[0]}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Code: {selectedService.code.toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold">Active Status:</span>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`w-10 h-6 rounded-full transition-all relative ${isActive ? 'bg-yellow-500' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Service Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:border-yellow-500 outline-none font-custom"
                  />
                </div>

                {/* Tagline / Subtitle */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Hero Subtitle / Tagline (Details Page)</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:border-yellow-500 outline-none font-custom"
                    placeholder="e.g. Turning paper trails into structured digital intelligence"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Short Description (Overview Cards)</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:border-yellow-500 outline-none font-custom"
                  />
                </div>

                {/* Image */}
                <ImageUploadField label="Service Header / Banner Image" value={imageUrl} onChange={setImageUrl} />

                {/* Consulting Fields (Components, Pain Points, Solutions, Benefits) */}
                {selectedService.code !== 'training' && (
                  <div className="space-y-6 pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-slate-800 text-sm">Detailed Consulting Configuration</h4>

                    {/* Scope of Service Components */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-500">Scope of Service / Components</label>
                      <div className="space-y-1">
                        {components.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg text-xs gap-3">
                            <span className="text-gray-700 font-medium">{item}</span>
                            <button onClick={() => removeFromArray(components, setComponents, idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComp}
                          onChange={e => setNewComp(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray(components, setComponents, newComp, setNewComp); } }}
                          placeholder="Add new scope item..."
                          className="flex-1 px-3 py-1.5 rounded-lg border text-xs outline-none focus:border-yellow-500"
                        />
                        <button
                          onClick={() => addToArray(components, setComponents, newComp, setNewComp)}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Pain Points */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-500">Pain Points (Current Problem)</label>
                      <div className="space-y-1">
                        {painPoints.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded-lg text-xs gap-3">
                            <span className="text-gray-700 font-medium">{item}</span>
                            <button onClick={() => removeFromArray(painPoints, setPainPoints, idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPain}
                          onChange={e => setNewPain(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray(painPoints, setPainPoints, newPain, setNewPain); } }}
                          placeholder="Add new pain point..."
                          className="flex-1 px-3 py-1.5 rounded-lg border text-xs outline-none focus:border-yellow-500"
                        />
                        <button
                          onClick={() => addToArray(painPoints, setPainPoints, newPain, setNewPain)}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Intervention / Solutions */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-500">How We Intervene / Solutions</label>
                      <div className="space-y-1">
                        {solutions.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-lg text-xs gap-3">
                            <span className="text-gray-700 font-medium">{item}</span>
                            <button onClick={() => removeFromArray(solutions, setSolutions, idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSol}
                          onChange={e => setNewSol(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray(solutions, setSolutions, newSol, setNewSol); } }}
                          placeholder="Add new solution step..."
                          className="flex-1 px-3 py-1.5 rounded-lg border text-xs outline-none focus:border-yellow-500"
                        />
                        <button
                          onClick={() => addToArray(solutions, setSolutions, newSol, setNewSol)}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Benefits & Outcomes */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-gray-500">Outcomes & Benefits</label>
                      <div className="space-y-1">
                        {benefits.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-100 rounded-lg text-xs gap-3">
                            <span className="text-gray-700 font-medium">{item}</span>
                            <button onClick={() => removeFromArray(benefits, setBenefits, idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBen}
                          onChange={e => setNewBen(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToArray(benefits, setBenefits, newBen, setNewBen); } }}
                          placeholder="Add new benefit..."
                          className="flex-1 px-3 py-1.5 rounded-lg border text-xs outline-none focus:border-yellow-500"
                        />
                        <button
                          onClick={() => addToArray(benefits, setBenefits, newBen, setNewBen)}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors font-custom"
                >
                  <Save size={14} /> Save Service Changes
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-400 text-sm">
              Select a service from the left to start editing.
            </div>
          )}
        </div>
      </div>
    );
  };

  // 2. PAGES EDIT TAB
  const PagesView = () => {
    const handleFieldChange = (key: string, val: string) => {
      setEditingSettings(prev => ({ ...prev, [key]: val }));
    };

    const renderPageFields = () => {
      switch (selectedPage) {
        case 'home':
          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm border-b pb-2 mb-2">Hero Section Content</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Hero Title</label>
                  <input type="text" value={editingSettings.hero_title || ''} onChange={e => handleFieldChange('hero_title', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Badge Rotator / Text</label>
                  <input type="text" value={editingSettings.hero_badge_text || ''} onChange={e => handleFieldChange('hero_badge_text', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Hero Description</label>
                  <textarea rows={3} value={editingSettings.hero_description || ''} onChange={e => handleFieldChange('hero_description', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Hero Dynamic Word Rotator (Comma separated)</label>
                  <input type="text" value={editingSettings.hero_rotator_words || ''} onChange={e => handleFieldChange('hero_rotator_words', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="Performance, Systems, Compliance" />
                </div>
                <div className="md:col-span-2">
                  <ImageUploadField label="Hero Banner Background Image" value={editingSettings.hero_image || ''} onChange={val => handleFieldChange('hero_image', val)} />
                </div>
              </div>

              <h4 className="font-bold text-slate-800 text-sm border-b pb-2 pt-4 mb-2">Glassmorphic Console Widget Data</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Widget Left Title</label>
                  <input type="text" value={editingSettings.hero_widget_left_title || ''} onChange={e => handleFieldChange('hero_widget_left_title', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Widget Right Title</label>
                  <input type="text" value={editingSettings.hero_widget_right_title || ''} onChange={e => handleFieldChange('hero_widget_right_title', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Widget Right Description</label>
                  <input type="text" value={editingSettings.hero_widget_right_desc || ''} onChange={e => handleFieldChange('hero_widget_right_desc', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
              </div>
            </div>
          );
        case 'about':
          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm border-b pb-2 mb-2">Who We Are Story block</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Story Title</label>
                  <input type="text" value={editingSettings.about_title || ''} onChange={e => handleFieldChange('about_title', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Story Tagline / Mission</label>
                  <input type="text" value={editingSettings.about_tagline || ''} onChange={e => handleFieldChange('about_tagline', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Primary Summary Description</label>
                  <textarea rows={3} value={editingSettings.about_description || ''} onChange={e => handleFieldChange('about_description', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Extended Description (Secondary Paragraph)</label>
                  <textarea rows={4} value={editingSettings.about_extended || ''} onChange={e => handleFieldChange('about_extended', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Dynamic About Bullets (Comma separated list)</label>
                  <textarea rows={2} value={editingSettings.about_bullets || ''} onChange={e => handleFieldChange('about_bullets', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Pull Quote</label>
                  <textarea rows={2} value={editingSettings.about_pull_quote || ''} onChange={e => handleFieldChange('about_pull_quote', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
              </div>

              <h4 className="font-bold text-slate-800 text-sm border-b pb-2 pt-4 mb-2">Story Visual Elements</h4>
              <div className="space-y-4">
                <ImageUploadField label="Primary Story Image" value={editingSettings.about_image || ''} onChange={val => handleFieldChange('about_image', val)} />
                <ImageUploadField label="Secondary Team Image" value={editingSettings.team_image || ''} onChange={val => handleFieldChange('team_image', val)} />
                <ImageUploadField label="Partnership CTA banner" value={editingSettings.about_cta_image || ''} onChange={val => handleFieldChange('about_cta_image', val)} />
              </div>
            </div>
          );
        case 'services':
          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm border-b pb-2 mb-2">Disciplines Header & Highlights</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">CTA Headline</label>
                  <input type="text" value={editingSettings.cta_title || ''} onChange={e => handleFieldChange('cta_title', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Highlight Word</label>
                  <input type="text" value={editingSettings.cta_discipline_highlight || ''} onChange={e => handleFieldChange('cta_discipline_highlight', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">CTA Description</label>
                  <textarea rows={2} value={editingSettings.cta_description || ''} onChange={e => handleFieldChange('cta_description', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <ImageUploadField label="CTA Background Image" value={editingSettings.cta_image || ''} onChange={val => handleFieldChange('cta_image', val)} />
                </div>
              </div>
            </div>
          );
        case 'contact':
          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm border-b pb-2 mb-2">Contact Channels & Hero Backgrounds</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Contact Email Address</label>
                  <input type="email" value={editingSettings.contact_email || ''} onChange={e => handleFieldChange('contact_email', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Contact Phone Number</label>
                  <input type="text" value={editingSettings.contact_phone || ''} onChange={e => handleFieldChange('contact_phone', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Contact Location</label>
                  <input type="text" value={editingSettings.contact_location || ''} onChange={e => handleFieldChange('contact_location', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <ImageUploadField label="Contact Page Banner Image" value={editingSettings.contact_hero_image || ''} onChange={val => handleFieldChange('contact_hero_image', val)} />
                <ImageUploadField label="Training Catalog Banner Image" value={editingSettings.programmes_hero_image || ''} onChange={val => handleFieldChange('programmes_hero_image', val)} />
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    const handleSavePage = async () => {
      // Find what page settings we should save
      const homeKeys = ['hero_title', 'hero_badge_text', 'hero_description', 'hero_rotator_words', 'hero_image', 'hero_widget_left_title', 'hero_widget_right_title', 'hero_widget_right_desc'];
      const aboutKeys = ['about_title', 'about_tagline', 'about_description', 'about_extended', 'about_bullets', 'about_pull_quote', 'about_image', 'team_image', 'about_cta_image'];
      const servicesKeys = ['cta_title', 'cta_discipline_highlight', 'cta_description', 'cta_image'];
      const contactKeys = ['contact_email', 'contact_phone', 'contact_location', 'contact_hero_image', 'programmes_hero_image'];

      let targetKeys: string[] = [];
      if (selectedPage === 'home') targetKeys = homeKeys;
      if (selectedPage === 'about') targetKeys = aboutKeys;
      if (selectedPage === 'services') targetKeys = servicesKeys;
      if (selectedPage === 'contact') targetKeys = contactKeys;

      const payload: Record<string, string> = {};
      targetKeys.forEach(k => {
        payload[k] = editingSettings[k] || '';
      });

      await saveMultipleSettings(payload);
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Page Content Management</h2>
            <p className="text-slate-500 text-xs">Edit layout texts, visuals, rotator phrases, and bullets across your site.</p>
          </div>
          <button
            onClick={handleSavePage}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-yellow-500 text-slate-900 font-bold text-xs rounded-xl hover:scale-105 transition-all shadow-md"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            <Save size={14} /> Save Page Content
          </button>
        </div>

        {/* Page selector buttons */}
        <div className="flex border-b border-gray-200">
          {(['home', 'about', 'services', 'contact'] as const).map(p => (
            <button
              key={p}
              onClick={() => setSelectedPage(p)}
              className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors ${selectedPage === p ? 'border-yellow-600 text-yellow-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              style={selectedPage === p ? { borderColor: GOLD, color: GOLD } : {}}
            >
              {p} Page
            </button>
          ))}
        </div>

        {/* Render Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          {renderPageFields()}
        </div>
      </div>
    );
  };

  // 3. PROGRAMMES & REUSABLE MODULES VIEW
  const ProgrammesView = () => {
    // Helper to generate UUID for course modules
    const generateUUID = () => {
      return 'mod-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9);
    };

    return (
      <div className="space-y-8">
        {/* programmes crud catalogue */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Training Programmes</h2>
              <p className="text-xs text-gray-500">Edit core training subjects visible in the training catalogue.</p>
            </div>
            <button
              onClick={() => setEditingProgramme({ code: '', title: '', days: 2, category: 'General', is_active: true, is_featured: false, description: '' })}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:scale-105 transition-all"
              style={{ backgroundColor: NAVY }}
            >
              <Plus size={14} /> Add Programme
            </button>
          </div>

          {editingProgramme && (
            <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl mb-4">
              <h3 className="font-bold text-sm text-slate-800 mb-3">{editingProgramme.id ? 'Edit Programme Details' : 'Add New Programme to Catalogue'}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Code</label>
                  <input type="text" value={editingProgramme.code || ''} onChange={e => setEditingProgramme({ ...editingProgramme, code: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="e.g. LMT 101" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                  <select value={editingProgramme.category || 'General'} onChange={e => setEditingProgramme({ ...editingProgramme, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm">
                    {['Leadership', 'Customer Service', 'HSE', 'Finance', 'Digital', 'General'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Programme Title</label>
                  <input type="text" value={editingProgramme.title || ''} onChange={e => setEditingProgramme({ ...editingProgramme, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Duration (Days)</label>
                  <input type="number" min={1} value={editingProgramme.days || 1} onChange={e => setEditingProgramme({ ...editingProgramme, days: parseInt(e.target.value) })} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Brief Description</label>
                  <textarea rows={2} value={editingProgramme.description || ''} onChange={e => setEditingProgramme({ ...editingProgramme, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setEditingProgramme(null)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                <button onClick={() => saveProgramme(editingProgramme)} className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg" style={{ backgroundColor: NAVY }}>Save</button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto bg-white p-4 rounded-xl border border-gray-100">
            {programmes.map(prog => (
              <div key={prog.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-150 hover:bg-slate-50">
                <div className="text-left">
                  <div className="flex gap-2 items-center mb-1 flex-wrap">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">{prog.code}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800" style={{ color: '#8a6b1e', background: `${GOLD}22` }}>{prog.category}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{prog.days} Days</span>
                    {prog.is_featured && <span className="text-[9px] font-extrabold text-yellow-600 uppercase">★ Featured</span>}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{prog.title}</h4>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => toggleProgrammeFeatured(prog.id, prog.is_featured)} className="p-1.5 hover:bg-gray-100 rounded text-slate-500" title="Toggle Featured status">
                    <Star size={14} className={prog.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} />
                  </button>
                  <button onClick={() => toggleProgrammeActive(prog.id, prog.is_active)} className="p-1.5 hover:bg-gray-100 rounded" title="Toggle Visibility">
                    {prog.is_active ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-gray-400" />}
                  </button>
                  <button onClick={() => setEditingProgramme(prog)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit text">
                    <Edit3 size={14} className="text-yellow-600" />
                  </button>
                  <button onClick={() => deleteProgramme(prog.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reusable modules section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Reusable Course Modules</h2>
              <p className="text-xs text-gray-500">Manage fine-grained training blocks that can be shared across classes.</p>
            </div>
            <button
              onClick={() => setEditingModule({ id: generateUUID(), code: '', title: '', description: '', duration: '3 Hours' })}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg text-xs font-bold hover:scale-105 transition-all"
              style={{ backgroundColor: GOLD, color: NAVY }}
            >
              <Plus size={14} /> Add Course Module
            </button>
          </div>

          {editingModule && (
            <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl mb-4">
              <h3 className="font-bold text-sm text-slate-800 mb-3">{editingModule.title ? 'Edit Course Module' : 'Create Course Module'}</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Module Code</label>
                  <input type="text" value={editingModule.code || ''} onChange={e => setEditingModule({ ...editingModule, code: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="e.g. MOD-LMT-01" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Module Title</label>
                  <input type="text" value={editingModule.title || ''} onChange={e => setEditingModule({ ...editingModule, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Average Duration</label>
                  <input type="text" value={editingModule.duration || ''} onChange={e => setEditingModule({ ...editingModule, duration: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="e.g. 3 Hours or 1 Day" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Detailed Syllabus / Focus Description</label>
                  <textarea rows={2} value={editingModule.description || ''} onChange={e => setEditingModule({ ...editingModule, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setEditingModule(null)} className="px-4 py-2 text-xs font-bold text-gray-500">Cancel</button>
                <button onClick={() => saveCourseModule(editingModule)} className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg" style={{ backgroundColor: NAVY }}>Save Module</button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {courseModules.length === 0 ? (
              <div className="md:col-span-2 text-center py-8 bg-white rounded-xl border text-xs text-gray-400">
                No course modules catalogued. Create a new module using the button above.
              </div>
            ) : (
              courseModules.map(mod => (
                <div key={mod.id} className="bg-white p-5 rounded-2xl border border-gray-150 hover:shadow-md transition-shadow relative text-left">
                  <span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded bg-gray-150 text-gray-600">{mod.duration}</span>
                  <div className="text-[10px] font-bold text-custom-secondary mb-1 uppercase tracking-wider">{mod.code || 'NO CODE'}</div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2">{mod.title || 'Untitled Module'}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">{mod.description || 'No syllabus provided.'}</p>
                  
                  <div className="flex justify-end gap-2 border-t pt-3">
                    <button onClick={() => setEditingModule(mod)} className="text-xs font-bold text-custom-secondary hover:underline flex items-center gap-0.5"><Edit3 size={12} /> Edit</button>
                    <button onClick={() => deleteCourseModule(mod.id)} className="text-xs font-bold text-red-500 hover:underline flex items-center gap-0.5"><Trash2 size={12} /> Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // 4. DESIGN SYSTEM EDIT TAB
  const DesignSystemView = () => {
    // Current design settings
    const ds = editingSettings.design_system ? JSON.parse(editingSettings.design_system) : {
      primary_color: '#0F2044',
      secondary_color: '#C9A84C',
      accent_color: '#F3F4F6',
      font_family: 'Inter',
      base_font_size: '16px',
      spacing_density: 'comfortable',
      button_preset: 'rounded'
    };

    const handleDSChange = (key: string, val: string) => {
      const updatedDS = { ...ds, [key]: val };
      setEditingSettings(prev => ({ ...prev, design_system: JSON.stringify(updatedDS) }));
    };

    const saveDSTokens = async () => {
      await saveSettingKey('design_system', JSON.stringify(ds));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Dynamic Design System Controls</h2>
            <p className="text-xs text-gray-500">Inject dynamic CSS variables to alter colors, buttons, fonts, and space densities across Enka Prime.</p>
          </div>
          <button
            onClick={saveDSTokens}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-yellow-500 text-slate-900 font-bold text-xs rounded-xl hover:scale-105 transition-all shadow-md"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            <Palette size={14} /> Inject CSS Design Tokens
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left">
          {/* Color palette */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2 mb-3">Color Palette System</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Primary Color (Nav, Footer, Strong Headers)</label>
              <div className="flex gap-2">
                <input type="color" value={ds.primary_color || '#0F2044'} onChange={e => handleDSChange('primary_color', e.target.value)} className="w-10 h-10 border rounded cursor-pointer" />
                <input type="text" value={ds.primary_color || ''} onChange={e => handleDSChange('primary_color', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Secondary Brand Color (Gold Accent, Buttons, Active Highlights)</label>
              <div className="flex gap-2">
                <input type="color" value={ds.secondary_color || '#C9A84C'} onChange={e => handleDSChange('secondary_color', e.target.value)} className="w-10 h-10 border rounded cursor-pointer" />
                <input type="text" value={ds.secondary_color || ''} onChange={e => handleDSChange('secondary_color', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Light Accent Color (Cards, Section backgrounds)</label>
              <div className="flex gap-2">
                <input type="color" value={ds.accent_color || '#F3F4F6'} onChange={e => handleDSChange('accent_color', e.target.value)} className="w-10 h-10 border rounded cursor-pointer" />
                <input type="text" value={ds.accent_color || ''} onChange={e => handleDSChange('accent_color', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase" />
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2 mb-3">Typography & Font Scales</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Font Family</label>
              <select value={ds.font_family || 'Inter'} onChange={e => handleDSChange('font_family', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm">
                {['Inter', 'Roboto', 'Outfit', 'Playfair Display', 'Montserrat', 'Syne'].map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Base Font Size</label>
              <select value={ds.base_font_size || '16px'} onChange={e => handleDSChange('base_font_size', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm">
                {['14px', '15px', '16px', '17px', '18px'].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sizing, spacing & button styles */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2 mb-3">Interface Density & Shape Presets</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Spacing Density</label>
                <div className="flex gap-2">
                  {(['compact', 'comfortable', 'loose'] as const).map(density => (
                    <button
                      key={density}
                      onClick={() => handleDSChange('spacing_density', density)}
                      className={`flex-1 py-2 font-bold text-xs uppercase tracking-wide border rounded-xl capitalize ${ds.spacing_density === density ? 'bg-slate-900 border-slate-900 text-white' : 'bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100'}`}
                      style={ds.spacing_density === density ? { background: NAVY } : {}}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Button Style Shape Preset</label>
                <div className="flex gap-2">
                  {(['square', 'rounded', 'rounded-lg', 'pill'] as const).map(preset => (
                    <button
                      key={preset}
                      onClick={() => handleDSChange('button_preset', preset)}
                      className={`flex-1 py-2 font-bold text-xs uppercase tracking-wide border rounded-xl capitalize ${ds.button_preset === preset ? 'bg-slate-900 border-slate-900 text-white' : 'bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100'}`}
                      style={ds.button_preset === preset ? { background: NAVY } : {}}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 5. NAVIGATION MANAGER TAB
  const NavigationManagerView = () => {
    // Current navigation state
    const currentMenu: any[] = editingSettings.navigation_menu ? JSON.parse(editingSettings.navigation_menu) : [
      { id: '1', label: 'Home', href: 'home', link_type: 'page', is_active: true },
      { id: '2', label: 'Services', href: 'services', link_type: 'page', is_active: true },
      { id: '3', label: 'Programmes', href: 'programmes', link_type: 'page', is_active: true },
      { id: '4', label: 'About', href: 'about', link_type: 'page', is_active: true },
      { id: '5', label: 'Contact', href: 'contact', link_type: 'page', is_active: true },
    ];

    const [editingLink, setEditingLink] = useState<any | null>(null);

    const saveNavigationMenu = async (updatedMenu: any[]) => {
      setEditingSettings(prev => ({ ...prev, navigation_menu: JSON.stringify(updatedMenu) }));
      await saveSettingKey('navigation_menu', JSON.stringify(updatedMenu));
    };

    const handleMove = async (idx: number, direction: 'up' | 'down') => {
      const updated = [...currentMenu];
      if (direction === 'up' && idx > 0) {
        [updated[idx], updated[idx - 1]] = [updated[idx - 1], updated[idx]];
      } else if (direction === 'down' && idx < updated.length - 1) {
        [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
      }
      await saveNavigationMenu(updated);
    };

    const handleSaveLink = async (link: any) => {
      let updated = [...currentMenu];
      const idx = updated.findIndex(l => l.id === link.id);
      if (idx >= 0) {
        updated[idx] = link;
      } else {
        updated.push(link);
      }
      setEditingLink(null);
      await saveNavigationMenu(updated);
    };

    const handleDeleteLink = async (id: string) => {
      if (!confirm('Remove this navigation item?')) return;
      const updated = currentMenu.filter(l => l.id !== id);
      await saveNavigationMenu(updated);
    };

    const toggleLinkActive = async (link: any) => {
      const updated = currentMenu.map(l => l.id === link.id ? { ...l, is_active: !l.is_active } : l);
      await saveNavigationMenu(updated);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Navigation Menu Manager</h2>
            <p className="text-xs text-gray-500">Reorder, add, or toggle page, section anchor, or external links globally.</p>
          </div>
          <button
            onClick={() => setEditingLink({ id: 'nav-' + Math.random().toString(36).substr(2, 9), label: '', href: '', link_type: 'page', is_active: true })}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:scale-105 transition-all animate-glow"
            style={{ backgroundColor: NAVY }}
          >
            <Plus size={14} /> Add Menu Link
          </button>
        </div>

        {editingLink && (
          <div className="bg-yellow-50 border border-yellow-250 p-5 rounded-2xl text-left">
            <h3 className="font-bold text-sm text-slate-800 mb-3">Navigation Menu Item Form</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Display Label</label>
                <input type="text" value={editingLink.label || ''} onChange={e => setEditingLink({ ...editingLink, label: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="e.g. Courses" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Link Target (href)</label>
                <input type="text" value={editingLink.href || ''} onChange={e => setEditingLink({ ...editingLink, href: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="e.g. programmes or #services" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Link Destination Type</label>
                <select value={editingLink.link_type || 'page'} onChange={e => setEditingLink({ ...editingLink, link_type: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border text-sm">
                  <option value="page">Standard page</option>
                  <option value="section">Homepage Anchor (#id)</option>
                  <option value="external">External Website (opens in new tab)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditingLink(null)} className="px-4 py-2 text-xs font-bold text-gray-500">Cancel</button>
              <button onClick={() => handleSaveLink(editingLink)} className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg" style={{ backgroundColor: NAVY }}>Save Link</button>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl border border-gray-150 space-y-2">
          {currentMenu.map((link, idx) => (
            <div key={link.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-slate-50">
              <div className="flex items-center gap-4 text-left">
                <span className="text-[10px] font-bold text-gray-400 w-4">#{idx + 1}</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{link.label}</h4>
                  <p className="text-[10px] text-gray-400 font-medium font-mono truncate max-w-sm">
                    {link.link_type === 'external' ? '🌐 External' : link.link_type === 'section' ? '⚓ Anchor' : '📄 Page'} • href: {link.href}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-1.5 hover:bg-gray-100 rounded text-slate-500 disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => handleMove(idx, 'down')} disabled={idx === currentMenu.length - 1} className="p-1.5 hover:bg-gray-100 rounded text-slate-500 disabled:opacity-30">
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => toggleLinkActive(link)} className="p-1.5 hover:bg-gray-100 rounded">
                  {link.is_active !== false ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-gray-400" />}
                </button>
                <button onClick={() => setEditingLink(link)} className="p-1.5 hover:bg-gray-100 rounded text-yellow-600">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDeleteLink(link.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 6. HOMEPAGE BUILDER TAB
  const HomepageBuilderView = () => {
    // Current layout structure
    const currentModules: any[] = editingSettings.homepage_modules ? JSON.parse(editingSettings.homepage_modules) : [
      { id: 'hero', type: 'hero', is_visible: true },
      { id: 'cta', type: 'cta', is_visible: true },
      { id: 'about_preview', type: 'about_preview', is_visible: true },
      { id: 'services', type: 'services', is_visible: true },
      { id: 'industries', type: 'industries', is_visible: true },
      { id: 'why_choose_us', type: 'why_choose_us', is_visible: true }
    ];

    const saveModulesLayout = async (updated: any[]) => {
      setEditingSettings(prev => ({ ...prev, homepage_modules: JSON.stringify(updated) }));
      await saveSettingKey('homepage_modules', JSON.stringify(updated));
    };

    const handleMove = async (idx: number, direction: 'up' | 'down') => {
      const updated = [...currentModules];
      if (direction === 'up' && idx > 0) {
        [updated[idx], updated[idx - 1]] = [updated[idx - 1], updated[idx]];
      } else if (direction === 'down' && idx < updated.length - 1) {
        [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
      }
      await saveModulesLayout(updated);
    };

    const toggleVisibility = async (idx: number) => {
      const updated = [...currentModules];
      updated[idx].is_visible = !updated[idx].is_visible;
      await saveModulesLayout(updated);
    };

    const getModuleName = (type: string) => {
      const map: Record<string, string> = {
        hero: 'Hero Rotator & Visual Dashboard',
        cta: 'Subject Catalog / Discipline Action CTA',
        about_preview: 'About preview & Pull quotes',
        services: 'Interactive Capabilities Grid',
        industries: 'Premium Industries grid',
        why_choose_us: 'Advantage & Commitment grid'
      };
      return map[type] || type.toUpperCase();
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Homepage Module Builder</h2>
          <p className="text-xs text-gray-500">Reorder visual sections, toggle block visibilities, and edit content instantly.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-150 space-y-2">
          {currentModules.map((mod, idx) => (
            <div key={mod.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-slate-50">
              <div className="flex items-center gap-4 text-left">
                <span className="text-[10px] font-bold text-gray-400 w-4">#{idx + 1}</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 capitalize">{mod.type.replace(/_/g, ' ')}</h4>
                  <p className="text-[10px] text-gray-500 font-medium font-mono">{getModuleName(mod.type)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-1.5 hover:bg-gray-100 rounded text-slate-500 disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => handleMove(idx, 'down')} disabled={idx === currentModules.length - 1} className="p-1.5 hover:bg-gray-100 rounded text-slate-500 disabled:opacity-30">
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => toggleVisibility(idx)} className="p-1.5 hover:bg-gray-100 rounded text-slate-500">
                  {mod.is_visible !== false ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-gray-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 7. FOOTER EDIT TAB
  const FooterEditView = () => {
    // Current state
    const footerConfig = editingSettings.footer_config ? JSON.parse(editingSettings.footer_config) : {
      description: 'Professional corporate training that transforms people and organisations.',
      contact_email: editingSettings.contact_email || 'info@enkaprime.com',
      contact_phone: editingSettings.contact_phone || '0200 769 146',
      linkedin_url: 'https://linkedin.com/company/enkaprime',
      copyright_text: '© 2026 Enka Prime Consulting Ltd. All rights reserved.',
      tagline: editingSettings.about_tagline || 'Empowering People. Enhancing Performance. Delivering Excellence.'
    };

    const handleFooterChange = (key: string, val: string) => {
      const updated = { ...footerConfig, [key]: val };
      setEditingSettings(prev => ({ ...prev, footer_config: JSON.stringify(updated) }));
    };

    const saveFooterSettings = async () => {
      // Save footer_config JSON
      await saveSettingKey('footer_config', JSON.stringify(footerConfig));

      // Also save social links as top-level keys for compatibility
      if (footerConfig.facebook_url) await saveSettingKey('facebook_url', footerConfig.facebook_url);
      if (footerConfig.whatsapp_url) await saveSettingKey('whatsapp_url', footerConfig.whatsapp_url);

      // Save service pillars and target industries as JSON arrays (comma-separated input)
      if (footerConfig.service_pillars) {
        const pillarsArr = footerConfig.service_pillars.split(',').map((s: string) => s.trim()).filter(Boolean);
        await saveSettingKey('service_pillars', JSON.stringify(pillarsArr));
      }
      if (footerConfig.target_industries) {
        const indsArr = footerConfig.target_industries.split(',').map((s: string) => s.trim()).filter(Boolean);
        await saveSettingKey('target_industries', JSON.stringify(indsArr));
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Footer Settings</h2>
            <p className="text-xs text-gray-500">Edit contact details, copyright notices, and LinkedIn company URLs globally.</p>
          </div>
          <button
            onClick={saveFooterSettings}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-yellow-500 text-slate-900 font-bold text-xs rounded-xl hover:scale-105 transition-all shadow-md"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            <Layers size={14} /> Save Footer Config
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Company Description (Appears bottom left)</label>
            <textarea rows={2} value={footerConfig.description || ''} onChange={e => handleFooterChange('description', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Footer Email</label>
            <input type="email" value={footerConfig.contact_email || ''} onChange={e => handleFooterChange('contact_email', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Footer Phone</label>
            <input type="text" value={footerConfig.contact_phone || ''} onChange={e => handleFooterChange('contact_phone', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">LinkedIn URL</label>
            <input type="text" value={footerConfig.linkedin_url || ''} onChange={e => handleFooterChange('linkedin_url', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="https://linkedin.com/company/..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Facebook URL</label>
            <input type="text" value={footerConfig.facebook_url || ''} onChange={e => handleFooterChange('facebook_url', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="https://facebook.com/yourpage" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">WhatsApp URL / wa.me</label>
            <input type="text" value={footerConfig.whatsapp_url || ''} onChange={e => handleFooterChange('whatsapp_url', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="https://wa.me/233..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Footer Tagline</label>
            <input type="text" value={footerConfig.tagline || ''} onChange={e => handleFooterChange('tagline', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Copyright Notice text</label>
            <input type="text" value={footerConfig.copyright_text || ''} onChange={e => handleFooterChange('copyright_text', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Service Pillars (comma separated)</label>
            <textarea rows={2} value={footerConfig.service_pillars || ''} onChange={e => handleFooterChange('service_pillars', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="Records Digitalisation, Asset Tagging, ISO Implementation, Training" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Target Industries (comma separated)</label>
            <textarea rows={2} value={footerConfig.target_industries || ''} onChange={e => handleFooterChange('target_industries', e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="SMEs,Financial Services,Construction,Public Sector" />
          </div>
        </div>
      </div>
    );
  };

  // 8. GENERAL SETTINGS TAB (Central Key-Value Fallback)
  const GeneralSettingsView = () => {
    const handleFieldChange = (key: string, val: string) => {
      setEditingSettings(prev => ({ ...prev, [key]: val }));
    };

    const handleSaveAllGeneral = async () => {
      const changed: Record<string, string> = {};
      Object.keys(editingSettings).forEach(k => {
        if (editingSettings[k] !== originalSettings[k]) {
          changed[k] = editingSettings[k];
        }
      });
      if (Object.keys(changed).length === 0) {
        showToast('No changed fields to save');
        return;
      }
      await saveMultipleSettings(changed);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">General Key-Value Store</h2>
            <p className="text-xs text-gray-500">Edit raw site configuration fallback strings directly.</p>
          </div>
          <button
            onClick={handleSaveAllGeneral}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-yellow-500 text-slate-900 font-bold text-xs rounded-xl hover:scale-105 transition-all shadow-md"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            <Save size={14} /> Save Fallback Settings
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 max-h-[500px] overflow-y-auto">
          {Object.keys(editingSettings).filter(k => !['design_system', 'navigation_menu', 'homepage_modules', 'footer_config', 'course_modules'].includes(k)).map(key => (
            <div key={key} className="text-left">
              <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">{key.replace(/_/g, ' ')}</label>
              {key.includes('image') || key.includes('logo') ? (
                <ImageUploadField label={key.replace(/_/g, ' ')} value={editingSettings[key] || ''} onChange={val => handleFieldChange(key, val)} />
              ) : key.includes('description') || key.includes('extended') || key.includes('pull_quote') || key.includes('bullets') ? (
                <textarea rows={3} value={editingSettings[key] || ''} onChange={e => handleFieldChange(key, e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
              ) : (
                <input type="text" value={editingSettings[key] || ''} onChange={e => handleFieldChange(key, e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: NAVY }}>
        <div className="p-5 border-b border-white/10">
          <img src="/enkaprime/enkaprime-logo.png" alt="Enka Prime" className="h-10 object-contain" />
          <div className="text-[10px] mt-2 font-bold text-custom-secondary uppercase tracking-wider" style={{ color: GOLD }}>CMS Admin System</div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab.key ? 'text-white' : 'text-blue-300 hover:text-white'}`}
                style={activeTab === tab.key ? { background: `${GOLD}20`, borderRight: `3px solid ${GOLD}` } : {}}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 text-left">
          <div className="text-blue-300 text-xs mb-3 truncate font-medium">{session.user.email}</div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-red-950/30 transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Body content */}
      <div className="flex-1 min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-150 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
              {TAB_CONFIG.find(t => t.key === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={loadAllData} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Sync database stats">
              <RefreshCw size={16} className="text-gray-500" />
            </button>
            <button onClick={() => onNavigate('home')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 text-slate-600 border border-gray-200 shadow-sm">
              <ArrowLeft size={13} /> View Site
            </button>
          </div>
        </header>

        <main className="p-6 flex-1 max-w-6xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'pages' && <PagesView />}
          {activeTab === 'services' && <ServicesManagerView />}
          {activeTab === 'programmes' && <ProgrammesView />}
          {activeTab === 'design_system' && <DesignSystemView />}
          {activeTab === 'navigation' && <NavigationManagerView />}
          {activeTab === 'homepage_builder' && <HomepageBuilderView />}
          {activeTab === 'footer' && <FooterEditView />}
          {activeTab === 'settings' && <GeneralSettingsView />}
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-xs font-bold z-50 transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.message.toUpperCase()}
        </div>
      )}
    </div>
  );
}
