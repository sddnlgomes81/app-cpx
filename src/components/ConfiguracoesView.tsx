import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building, Save } from 'lucide-react';
import { formatPhone } from '../utils';

export const ConfiguracoesView: React.FC = () => {
  const { companySettings, updateCompanySettings } = useApp();
  const [formData, setFormData] = useState(companySettings);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Configurações da Empresa & Impressão</h2>
          <p className="text-xs text-slate-500">Dados cadastrais exibidos nos comprovantes de Ordem de Serviço</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl">
          Configurações atualizadas com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Razão Social</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nome Fantasia</label>
            <input
              type="text"
              value={formData.tradeName}
              onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">CNPJ</label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Telefone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">E-mail</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Endereço Completo</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            required
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Logo da Empresa</label>
          <div className="flex items-center gap-4">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo da Empresa" className="h-16 w-auto object-contain p-2 bg-slate-100 rounded-lg border border-slate-200" />
            ) : (
              <div className="h-16 w-16 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                Sem logo
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({ ...formData, logoUrl: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-xs file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Cabeçalho da Impressão de OS</label>
            <input
              type="text"
              value={formData.printHeader}
              onChange={(e) => setFormData({ ...formData, printHeader: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Rodapé da Impressão de OS</label>
            <input
              type="text"
              value={formData.printFooter}
              onChange={(e) => setFormData({ ...formData, printFooter: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25"
          >
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};
