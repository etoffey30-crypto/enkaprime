import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Menu, LogOut, Settings, Image as ImageIcon, LayoutGrid as Layout, FileText, Users, BarChart3, Save, Plus, Trash2, CreditCard as Edit3, ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Palette } from 'lucide-react';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

type Tab = 'dashboard' | 'hero' | 'sections' | 'media' | 'content-blocks' | 'team' | 'faqs' | 'footer' | 'settings';

interface AdminProps {
  onNavigate: (page: string) => void;
}

const TabConfig = [
  { key: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
  { key: 'hero' as Tab, label: 'Hero Banners', icon: Layout },
  { key: 'sections' as Tab, label: 'Page Sections', icon: FileText },
  { key: 'media' as Tab, label: 'Media Library', icon: ImageIcon },
  { key: 'content-blocks' as Tab, label: 'Content Blocks', icon: Palette },
  { key: 'team' as Tab, label: 'Team Members', icon: Users },
  { key: 'faqs' as Tab, label: 'FAQs', icon: FileText },
  { key: 'footer' as Tab, label: 'Footer', icon: Settings },
  { key: 'settings' as Tab, label: 'Site Settings', icon: Settings },
];

export default function AdminCMS({ onNavigate }: AdminProps) {
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
  const [heroes, setHeroes] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

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

  const loadAllData = useCallback(async () => {
    if (!session) return;
    const [
      heroRes, mediaRes, blocksRes, teamRes
    ] = await Promise.all([
      supabase.from('hero_banners').select('*').order('page_name'),
      supabase.from('media_library').select('*').order('category, name'),
      supabase.from('content_blocks').select('*').order('sort_order'),
      supabase.from('team_members').select('*').order('sort_order'),
    ]);

    if (heroRes.data) setHeroes(heroRes.data);
    if (mediaRes.data) setMedia(mediaRes.data);
    if (blocksRes.data) setContentBlocks(blocksRes.data);
    if (teamRes.data) setTeam(teamRes.data);
  }, [session]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/enkaprime/enkaprime-logo.png" alt="Enka Prime" className="h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-bold" style={{ color: NAVY }}>CMS Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all website content</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {authError}
              </div>
            )}
            {signUpSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> Account created! Sign in now.
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
              />
            </div>
            <button type="submit" className="w-full py-3.5 font-bold rounded-xl text-white transition-all hover:scale-[1.02]" style={{ background: NAVY }}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
              className="w-full mt-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              {isSignUp ? 'Already have account? Sign In' : "Don't have account? Create one"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Hero Editor
  const HeroEditor = () => {
    const [heroes, setHeroes] = useState<any[]>([]);
    const [editForm, setEditForm] = useState<any>(null);

    useEffect(() => {
      supabase.from('hero_banners').select('*').then(({ data }) => data && setHeroes(data));
    }, []);

    const saveHero = async (hero: any) => {
      if (hero.id) {
        await supabase.from('hero_banners').update({ ...hero, updated_at: new Date().toISOString() }).eq('id', hero.id);
      } else {
        await supabase.from('hero_banners').insert(hero);
      }
      await loadAllData();
      setEditForm(null);
      showToast('Hero banner saved');
    };

    const deleteHero = async (id: string) => {
      if (!confirm('Delete this hero banner?')) return;
      await supabase.from('hero_banners').delete().eq('id', id);
      await loadAllData();
      showToast('Hero banner deleted');
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Hero Banners</h2>
          <button
            onClick={() => setEditForm({ page_name: '', title: '', subtitle: '', description: '', cta_text: 'Learn More', cta_link: '#', image_url: '', overlay_color: NAVY, overlay_opacity: 0.85, text_color: '#ffffff', is_active: true })}
            className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg text-white"
            style={{ background: GOLD, color: NAVY }}
          >
            <Plus size={16} /> Add Hero
          </button>
        </div>

        {editForm && (
          <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 mb-6">
            <h3 className="font-bold mb-4" style={{ color: NAVY }}>Edit Hero Banner</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="Page Name" value={editForm.page_name || ''} onChange={e => setEditForm({ ...editForm, page_name: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <input placeholder="Title" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <input placeholder="Subtitle" value={editForm.subtitle || ''} onChange={e => setEditForm({ ...editForm, subtitle: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <input placeholder="Image URL" value={editForm.image_url || ''} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <textarea placeholder="Description" rows={3} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              <input placeholder="CTA Text" value={editForm.cta_text || ''} onChange={e => setEditForm({ ...editForm, cta_text: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <input placeholder="CTA Link" value={editForm.cta_link || ''} onChange={e => setEditForm({ ...editForm, cta_link: e.target.value })} className="px-4 py-2 rounded-lg border" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditForm(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={() => saveHero(editForm)} className="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg text-white" style={{ background: NAVY }}>
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {heroes.map(hero => (
            <div key={hero.id} className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-4">
              {hero.image_url && <img src={hero.image_url} alt={hero.title} className="w-20 h-14 rounded object-cover" />}
              <div className="flex-1">
                <div className="font-bold" style={{ color: NAVY }}>{hero.page_name}</div>
                <p className="text-sm text-gray-500">{hero.title}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditForm(hero)} className="p-2 hover:bg-gray-100 rounded"><Edit3 size={16} style={{ color: GOLD }} /></button>
                <button onClick={() => deleteHero(hero.id)} className="p-2 hover:bg-red-50 rounded"><Trash2 size={16} className="text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Media Library
  const MediaLibrary = () => {
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [editForm, setEditForm] = useState<any>(null);

    useEffect(() => {
      supabase.from('media_library').select('*').then(({ data }) => data && setMediaList(data));
    }, []);

    const saveMedia = async (item: any) => {
      if (item.id) {
        await supabase.from('media_library').update({ ...item, updated_at: new Date().toISOString() }).eq('id', item.id);
      } else {
        await supabase.from('media_library').insert(item);
      }
      await loadAllData();
      setEditForm(null);
      showToast('Media saved');
    };

    const deleteMedia = async (id: string) => {
      if (!confirm('Delete this image?')) return;
      await supabase.from('media_library').delete().eq('id', id);
      await loadAllData();
      showToast('Image deleted');
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Media Library</h2>
          <button
            onClick={() => setEditForm({ name: '', description: '', image_url: '', alt_text: '', category: 'General', is_featured: false, is_active: true })}
            className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg text-white"
            style={{ background: GOLD, color: NAVY }}
          >
            <Plus size={16} /> Add Image
          </button>
        </div>

        {editForm && (
          <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 mb-6">
            <h3 className="font-bold mb-4" style={{ color: NAVY }}>Add/Edit Image</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="Image Name" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              <input placeholder="Image URL" value={editForm.image_url || ''} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              {editForm.image_url && <img src={editForm.image_url} alt="preview" className="col-span-2 h-32 object-cover rounded-lg" />}
              <input placeholder="Alt Text" value={editForm.alt_text || ''} onChange={e => setEditForm({ ...editForm, alt_text: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <select value={editForm.category || 'General'} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="px-4 py-2 rounded-lg border">
                <option>General</option>
                <option>Hero</option>
                <option>Services</option>
                <option>Team</option>
                <option>About</option>
              </select>
              <textarea placeholder="Description" rows={2} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditForm(null)} className="px-4 py-2 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={() => saveMedia(editForm)} className="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg text-white" style={{ background: NAVY }}>
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map(item => (
            <div key={item.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
              <img src={item.image_url} alt={item.alt_text} className="w-full h-40 object-cover" />
              <div className="p-3">
                <p className="text-sm font-bold truncate" style={{ color: NAVY }}>{item.name}</p>
                <p className="text-xs text-gray-500">{item.category}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setEditForm(item)} className="flex-1 p-1 text-xs font-semibold bg-gray-100 rounded hover:bg-gray-200"><Edit3 size={12} className="inline mr-1" />Edit</button>
                  <button onClick={() => deleteMedia(item.id)} className="flex-1 p-1 text-xs font-semibold bg-red-100 rounded hover:bg-red-200 text-red-600"><Trash2 size={12} className="inline mr-1" />Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple Dashboard
  const DashboardView = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: NAVY }}>Dashboard</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Hero Banners', count: heroes.length, color: '#2563eb' },
          { label: 'Media Items', count: media.length, color: '#059669' },
          { label: 'Content Blocks', count: contentBlocks.length, color: '#d97706' },
          { label: 'Team Members', count: team.length, color: '#7c3aed' },
        ].map(item => (
          <div key={item.label} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-3xl font-bold mb-2" style={{ color: NAVY }}>{item.count}</div>
            <div className="text-sm text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: NAVY }}>
        <div className="p-5 border-b" style={{ borderColor: `${GOLD}30` }}>
          <img src="/enkaprime/enkaprime-logo.png" alt="Enka Prime" className="h-10 object-contain" />
          <div className="text-xs mt-2 font-semibold" style={{ color: GOLD }}>CMS Admin</div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {TabConfig.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'text-white' : 'text-blue-300 hover:text-white'}`}
                style={activeTab === tab.key ? { background: `${GOLD}20`, borderRight: `3px solid ${GOLD}` } : {}}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: `${GOLD}20` }}>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-900/30">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-h-screen">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold" style={{ color: NAVY }}>
              {TabConfig.find(t => t.key === activeTab)?.label || 'CMS'}
            </h1>
          </div>
          <button onClick={() => onNavigate('home')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100 text-gray-600">
            <ArrowLeft size={14} /> View Site
          </button>
        </header>

        <main className="p-6 max-w-6xl">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'hero' && <HeroEditor />}
          {activeTab === 'media' && <MediaLibrary />}
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold z-50 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
