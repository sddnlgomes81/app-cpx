import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Printer, Download, BarChart2 } from 'lucide-react';

export const RelatoriosView: React.FC = () => {
  const { serviceOrders, cashTransactions, clients, products } = useApp();

  const totalRevenue = cashTransactions
    .filter((t) => t.type === 'Entrada')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleExportCsv = (filename: string, data: any[]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + data.map((e) => Object.values(e).join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-slate-50 min-h-full">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Relatórios Gerenciais & Exportação</h2>
          <p className="text-xs text-slate-500">Emissão de relatórios consolidados em PDF e Excel</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20"
        >
          <Printer className="w-4 h-4" /> Imprimir Relatório Geral
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Relatório de Ordens de Serviço */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Relatório de Ordens de Serviço</h3>
            <p className="text-xs text-slate-500 mt-1">Lista completa de OS por período, cliente e status.</p>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleExportCsv('ordens_servico.csv', serviceOrders)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Excel
            </button>
          </div>
        </div>

        {/* Relatório Financeiro */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Relatório Financeiro & Faturamento</h3>
            <p className="text-xs text-slate-500 mt-1">Fluxo de caixa detalhado e entradas de faturamento.</p>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleExportCsv('fluxo_caixa.csv', cashTransactions)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Excel
            </button>
          </div>
        </div>

        {/* Relatório de Clientes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Relatório de Clientes & Contatos</h3>
            <p className="text-xs text-slate-500 mt-1">Base completa de clientes cadastrados no Compatix OS.</p>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleExportCsv('clientes.csv', clients)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
