
import React, { useState } from 'react';
import { Mail, Lock, UserPlus, LogIn, RefreshCw, Briefcase, AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        // Modo Demonstração/Fallback Local
        const mockUser = { id: 'local-user', email: email || 'demonstracao@local.com', username: email.split('@')[0] };
        localStorage.setItem('service_pro_auth_v1', JSON.stringify(mockUser));
        window.location.reload(); // Recarrega para o App capturar o usuário local
        return;
      }

      if (isRegistering) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert('Confirme seu e-mail para ativar a conta!');
        setIsRegistering(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900/40 border border-white/5 p-10 rounded-[48px] shadow-3xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full"></div>
        
        <div className="flex flex-col items-center mb-10 relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[28px] flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30 ring-1 ring-white/20">
            <Briefcase size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Service App</h1>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
            {isSupabaseConfigured ? 'Sincronizado com a Nuvem' : 'Modo Local (Demo)'}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="text-amber-500 shrink-0" size={18} />
            <p className="text-[9px] text-amber-200 uppercase font-black tracking-wider leading-relaxed">
              Serviços de Nuvem Desativados. Use qualquer e-mail para entrar localmente.
            </p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5 relative">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-3xl py-4.5 pl-14 pr-6 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600 text-sm"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required={isSupabaseConfigured}
                disabled={loading}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-3xl py-4.5 pl-14 pr-6 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-[10px] font-black text-center bg-red-500/10 py-3 rounded-2xl border border-red-500/10 uppercase tracking-widest leading-relaxed">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-5 rounded-[24px] font-black text-white shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? <RefreshCw size={20} className="animate-spin" /> : isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
            {loading ? 'PROCESSANDO...' : isRegistering ? 'CRIAR CONTA' : isSupabaseConfigured ? 'ENTRAR' : 'ENTRAR NO MODO LOCAL'}
          </button>
        </form>

        {isSupabaseConfigured && (
          <div className="mt-8 flex flex-col items-center gap-4 relative">
            <button 
              disabled={loading}
              onClick={() => setIsRegistering(!isRegistering)} 
              className="text-slate-500 hover:text-blue-400 text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              {isRegistering ? 'Já tem conta? Entrar' : 'Novo por aqui? Criar conta nuvem'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
