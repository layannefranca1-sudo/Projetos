
import React from 'react';

interface DashboardStatsProps {
  total: number;
  count: number;
  subtitle?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ total, count, subtitle }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[36px] shadow-2xl shadow-blue-600/20 border border-blue-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <div className="w-24 h-24 bg-white rounded-full"></div>
        </div>
        <h3 className="text-blue-100/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
          {subtitle || "Valor Acumulado"}
        </h3>
        <p className="text-4xl font-black text-white tracking-tight">
          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>

      <div className="bg-slate-900 p-8 rounded-[36px] border border-slate-800/50 shadow-xl flex flex-col justify-center">
        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Serviços</h3>
        <p className="text-4xl font-black text-white">{count}</p>
      </div>
    </div>
  );
};

export default DashboardStats;
