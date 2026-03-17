
import React, { useState } from 'react';
import { X, Calendar, User, Wrench, CreditCard, ChevronRight } from 'lucide-react';
import { ServiceRecord, PaymentMethod } from '../types';

interface ServiceFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<ServiceRecord, 'id'>) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return {
      clientName: '',
      description: '',
      value: '',
      paymentMethod: '' as PaymentMethod,
      date: `${year}-${month}-${day}`
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      value: parseFloat(formData.value) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold">Novo Serviço</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <User size={14} /> Cliente
            </label>
            <input
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Nome do cliente"
              value={formData.clientName}
              onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Wrench size={14} /> Descrição do Serviço
            </label>
            <textarea
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all"
              placeholder="Ex: Manutenção preventiva"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                R$ Valor
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="0,00"
                value={formData.value}
                onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Calendar size={14} /> Data
              </label>
              <input
                type="date"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <CreditCard size={14} /> Forma de Pagamento
            </label>
            <input
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ex: Pix, Dinheiro, Cartão..."
              value={formData.paymentMethod}
              onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            Cadastrar Serviço
            <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
