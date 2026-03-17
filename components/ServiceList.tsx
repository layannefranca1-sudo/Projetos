
import React from 'react';
import { Trash2, CalendarDays, Wallet } from 'lucide-react';
import { ServiceRecord, MonthlyGroup } from '../types';

interface ServiceListProps {
  services: ServiceRecord[];
  onDelete: (id: string) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, onDelete }) => {
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const grouped = services.reduce((acc: MonthlyGroup[], curr) => {
    const date = parseLocalDate(curr.date);
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    let group = acc.find(g => g.monthYear === monthYear);
    if (!group) {
      group = { monthYear, services: [], totalValue: 0 };
      acc.push(group);
    }
    group.services.push(curr);
    group.totalValue += curr.value;
    return acc;
  }, []);

  const sortedGroups = [...grouped].sort((a, b) => {
    const dateA = parseLocalDate(a.services[0].date).getTime();
    const dateB = parseLocalDate(b.services[0].date).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-12">
      {sortedGroups.map(group => (
        <div key={group.monthYear} className="space-y-4">
          <div className="flex items-center justify-between sticky top-[72px] bg-[#020617]/95 backdrop-blur-md py-3 z-30">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
              <CalendarDays size={14} className="opacity-50" />
              {group.monthYear}
            </h3>
            <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {group.services.map(service => (
              <div key={service.id} className="group relative bg-slate-900/40 border border-white/5 rounded-[32px] p-6 transition-all hover:bg-slate-900/60 active:bg-slate-800/60 overflow-hidden shadow-sm hover:shadow-blue-500/5">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-blue-500 text-[9px] font-black uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/10">
                        {parseLocalDate(service.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-slate-500 text-[9px] font-bold bg-white/5 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                        <Wallet size={10} />
                        {service.paymentMethod}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg truncate mb-1 pr-10">{service.clientName}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed opacity-70 italic">"{service.description}"</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end justify-between min-h-[85px] shrink-0">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(service.id);
                      }} 
                      className="p-3 text-slate-500 hover:text-red-400 transition-all bg-white/5 hover:bg-red-500/10 rounded-2xl border border-white/5 active:scale-75 shadow-lg group-hover:border-red-500/20"
                      aria-label="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <p className="text-xl font-black text-white tracking-tighter mt-auto">
                      {service.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500 p-5 rounded-r-[32px] flex items-center justify-between shadow-inner">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Total do Mês:</span>
            <span className="text-2xl font-black text-emerald-400 tracking-tighter">
              {group.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
