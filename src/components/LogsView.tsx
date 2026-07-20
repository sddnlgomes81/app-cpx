import React from 'react';
import { useApp } from '../context/AppContext';
import { ScrollText } from 'lucide-react';

export const LogsView: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Logs de Auditoria & Rastreabilidade</h2>
          <p className="text-xs text-slate-500">Registro histórico de todas as operações importantes realizadas por cada usuário</p>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">
          {auditLogs.length} eventos registrados
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Data / Hora</th>
                <th className="py-3.5 px-4">Usuário Responsável</th>
                <th className="py-3.5 px-4">Módulo</th>
                <th className="py-3.5 px-4">Operação</th>
                <th className="py-3.5 px-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-600">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{log.userName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium text-[11px]">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{log.operation}</td>
                  <td className="py-3.5 px-4 text-slate-500">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
