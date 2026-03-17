
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, LogOut, Briefcase, RefreshCw, Smartphone, Trash2, CalendarDays, Share2, Cloud, CloudOff, AlertTriangle, Zap, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ServiceRecord, User } from './types';
import Login from './components/Login';
import ServiceForm from './components/ServiceForm';
import ServiceList from './components/ServiceList';
import DashboardStats from './components/DashboardStats';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const BASE_STORAGE_KEY = 'service_pro_v2_';

const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  // Monitorar estado da rede
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Gerenciar sessão e usuário
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      const localUser = localStorage.getItem('service_pro_auth_v1');
      if (localUser) setUser(JSON.parse(localUser));
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setServices([]); 
    });

    return () => authListener.unsubscribe();
  }, []);

  // 2. Carregar Cache Local e Realtime
  useEffect(() => {
    if (!user) return;

    const userStorageKey = `${BASE_STORAGE_KEY}${user.id}`;
    const saved = localStorage.getItem(userStorageKey);
    if (saved) {
      setServices(JSON.parse(saved));
    }

    if (!supabase || !isSupabaseConfigured || !online) return;

    fetchServices();

    const channel = supabase
      .channel(`sync-user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchServices();
        }
      )
      .subscribe((status) => {
        setIsRealtimeActive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, online]);

  // 3. Persistir Cache Local
  useEffect(() => {
    if (user && services.length >= 0) {
      const userStorageKey = `${BASE_STORAGE_KEY}${user.id}`;
      localStorage.setItem(userStorageKey, JSON.stringify(services));
    }
  }, [services, user]);

  const fetchServices = async () => {
    if (!user || !supabase || !isSupabaseConfigured) return;
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const mappedData: ServiceRecord[] = data.map(item => ({
          id: item.id,
          clientName: item.client_name,
          description: item.description,
          value: item.value,
          paymentMethod: item.payment_method,
          date: item.date
        }));
        setServices(mappedData);
      }
    } catch (err) {
      console.error('Erro de sincronização:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const exportToExcel = () => {
    if (services.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const dataToExport = services.map(s => ({
      'Data': parseLocalDate(s.date).toLocaleDateString('pt-BR'),
      'Cliente': s.clientName,
      'Descrição': s.description,
      'Valor (R$)': s.value,
      'Forma de Pagamento': s.paymentMethod
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Serviços");
    
    // Gerar arquivo
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `servicos_wilker_${dateStr}.xlsx`);
  };

  const addService = async (data: Omit<ServiceRecord, 'id'>) => {
    const newId = crypto.randomUUID();
    const newService = { ...data, id: newId };
    
    setServices(prev => [newService, ...prev]);
    setIsFormOpen(false);

    if (user && online && supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('services').insert([{
          id: newId,
          client_name: data.clientName,
          description: data.description,
          value: data.value,
          payment_method: data.paymentMethod,
          date: data.date,
          user_id: user.id
        }]);
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao enviar para nuvem:', err);
      }
    }
  };

  const deleteService = async (id: string) => {
    const serviceToDelete = services.find(s => s.id === id);
    if (!window.confirm(`Excluir serviço de "${serviceToDelete?.clientName}"?`)) return;

    setServices(prev => prev.filter(s => s.id !== id));

    if (user && online && supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Falha ao excluir na nuvem:', err);
        fetchServices();
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Deseja sair da conta? Os dados salvos na nuvem permanecerão seguros.')) {
      if (supabase && isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setServices([]);
      localStorage.removeItem('service_pro_auth_v1');
    }
  };

  const totalAccumulated = useMemo(() => 
    services.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0), 
    [services]
  );

  if (!user) return <Login onLogin={() => {}} />;

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-32 font-sans selection:bg-blue-500/30">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20 flex items-center justify-center ring-1 ring-white/10">
              <Briefcase size={22} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase leading-none">Service App</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center gap-1">
                  {online ? (
                    <Cloud size={10} className={isSyncing ? "text-blue-400 animate-pulse" : "text-emerald-500"} />
                  ) : (
                    <CloudOff size={10} className="text-red-500" />
                  )}
                  {isRealtimeActive && online && (
                    <Zap size={10} className="text-amber-400 fill-amber-400" />
                  )}
                </div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[120px]">
                  {user.email || 'Modo Offline'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={exportToExcel}
              className="p-3 rounded-xl border border-white/5 bg-emerald-500/10 text-emerald-400 active:scale-90 transition-all hover:bg-emerald-500/20"
              title="Exportar Excel"
            >
              <FileSpreadsheet size={18} />
            </button>

            <button 
              onClick={fetchServices}
              disabled={isSyncing || !online}
              className={`p-3 rounded-xl border border-white/5 active:scale-90 transition-all ${isSyncing ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/50 text-slate-400'}`}
              title="Sincronizar"
            >
              <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            </button>

            <button onClick={handleLogout} className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/10 active:scale-90 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 pt-6 animate-in fade-in duration-700">
        <DashboardStats total={totalAccumulated} count={services.length} />
        
        {isRealtimeActive && online && (
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-3 flex items-center justify-center gap-2">
             <Zap size={12} className="text-blue-400 fill-blue-400 animate-pulse" />
             <p className="text-[9px] text-blue-400/80 font-black uppercase tracking-[0.2em]">
               Sincronização em tempo real ativa
             </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              Histórico de Serviços
            </h2>
            {isSyncing && <span className="text-[8px] text-blue-500 animate-pulse font-bold uppercase">Sincronizando...</span>}
          </div>

          {services.length === 0 && !isSyncing ? (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-900/20 border border-white/5 border-dashed rounded-[48px] text-slate-700">
              <Briefcase size={40} className="mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Lista vazia</p>
            </div>
          ) : (
            <ServiceList services={services} onDelete={deleteService} />
          )}
        </div>
      </main>

      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-8 right-6 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-500/40 active:scale-90 hover:scale-110 transition-all z-50 ring-4 ring-[#020617]"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      {isFormOpen && <ServiceForm onClose={() => setIsFormOpen(false)} onSubmit={addService} />}
    </div>
  );
};

export default App;
