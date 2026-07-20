import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, CheckCircle, XCircle, Bell, Shield, Settings, Sliders, Users, Building, Database, ScrollText } from 'lucide-react';
import { ServiceOrder } from '../types';

export const AdministracaoView: React.FC = () => {
  const { serviceOrders, updateServiceOrder, clients, printers, users, companySettings, updateCompanySettings, auditLogs } = useApp();

  const [statusFilter, setStatusFilter] = useState('todos');
  const [notificationMsg, setNotificationMsg] = useState<{ osId: string; msg: string } | null>(null);

  const filteredOs = serviceOrders.filter((os) => statusFilter === 'todos' || os.status === statusFilter);

  const handleApproveBudget = (os: ServiceOrder, approved: boolean) => {
    updateServiceOrder(os.id, {
      quoteApproved: approved,
      status: approved ? 'Orçamento Aprovado' : 'Orçamento Não Aprovado',
    });
  };

  const handleSendNotification = (os: ServiceOrder) => {
    const client = clients.find((c) => c.id === os.clientId);
    alert(`Notificação enviada com sucesso para ${client?.name || 'Cliente'} (${client?.email || client?.phone}): Sua OS ${os.osNumber} está com status: ${os.status}`);
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Painel Administrativo Geral</h2>
          <p className="text-xs text-slate-500">Controle completo de todas as Ordens de Serviço, aprovações e parâmetros</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {['todos', 'Aguardando Aprovação', 'Orçamento Aprovado', 'Orçamento Não Aprovado', 'Em Manutenção', 'Finalizada', 'Entregues'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === st ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Nº OS</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Impressora</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Aprovação Orçamento</th>
                <th className="py-3.5 px-4">Valor Total</th>
                <th className="py-3.5 px-4 text-center">Ações Administrativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOs.map((os) => {
                const client = clients.find((c) => c.id === os.clientId);
                const printer = printers.find((p) => p.id === os.printerId);
                return (
                  <tr key={os.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{os.osNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{client?.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{printer ? `${printer.brand} ${printer.model}` : 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={os.status}
                        onChange={(e) => updateServiceOrder(os.id, { status: e.target.value as any })}
                        className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="Aguardando Atendimento">Aguardando Atendimento</option>
                        <option value="Aguardando Orçamento">Aguardando Orçamento</option>
                        <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                        <option value="Orçamento Aprovado">Orçamento Aprovado</option>
                        <option value="Orçamento Não Aprovado">Orçamento Não Aprovado</option>
                        <option value="Em Manutenção">Em Manutenção</option>
                        <option value="Finalizada">Finalizada</option>
                        <option value="Entregues">Entregues</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      {os.status === 'Aguardando Aprovação' || os.quoteApproved !== null ? (
                        <div className="flex items-center gap-1.5">
                          {os.quoteApproved === true ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px]">
                              Aprovado
                            </span>
                          ) : os.quoteApproved === false ? (
                            <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg font-bold text-[10px]">
                              Reprovado
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleApproveBudget(os, true)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" /> Aprovar
                              </button>
                              <button
                                onClick={() => handleApproveBudget(os, false)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" /> Reprovar
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {os.totalAmount > 0 ? `R$ ${os.totalAmount.toFixed(2)}` : 'R$ 0,00'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleSendNotification(os)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-medium flex items-center gap-1.5 mx-auto"
                        title="Notificar Cliente via WhatsApp / E-mail"
                      >
                        <Bell className="w-3.5 h-3.5" /> Notificar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
