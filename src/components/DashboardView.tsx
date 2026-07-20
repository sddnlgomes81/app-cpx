import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Clock,
  AlertCircle,
  Wrench,
  CheckCircle2,
  PackageCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Activity,
  ArrowUpRight,
  Printer,
  UserCheck,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DashboardView: React.FC = () => {
  const { serviceOrders, products, cashTransactions, auditLogs, clients, printers, setActiveTab } = useApp();

  // Calculations for KPI Cards
  const totalOS = serviceOrders.length;
  const aguardandoAtendimento = serviceOrders.filter((os) => os.status === 'Aguardando Atendimento').length;
  const aguardandoOrcamento = serviceOrders.filter((os) => os.status === 'Aguardando Orçamento').length;
  const aguardandoAprovacao = serviceOrders.filter((os) => os.status === 'Aguardando Aprovação').length;
  const orcamentoAprovado = serviceOrders.filter((os) => os.status === 'Orçamento Aprovado').length;
  const emManutencao = serviceOrders.filter((os) => os.status === 'Em Manutenção').length;
  const finalizadas = serviceOrders.filter((os) => os.status === 'Finalizada').length;
  const entregues = serviceOrders.filter((os) => os.status === 'Entregues').length;

  // Low stock products
  const lowStockProducts = products.filter((p) => p.stockQty <= p.minStock);

  // Cash / Revenue calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7);

  const todayTransactions = cashTransactions.filter((t) => t.date.startsWith(todayStr));
  const caixaDoDia = todayTransactions.reduce(
    (acc, t) => (t.type === 'Entrada' ? acc + t.amount : acc - t.amount),
    0
  );

  const faturamentoDiario = todayTransactions
    .filter((t) => t.type === 'Entrada')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthTransactions = cashTransactions.filter((t) => t.date.startsWith(currentMonthStr));
  const faturamentoMensal = monthTransactions
    .filter((t) => t.type === 'Entrada')
    .reduce((acc, t) => acc + t.amount, 0);

  // Chart data simulation (last 5 days)
  const chartData = [
    { dia: '10/07', faturamento: 850, os: 4 },
    { dia: '11/07', faturamento: 1250, os: 6 },
    { dia: '12/07', faturamento: 430, os: 3 },
    { dia: '13/07', faturamento: 920, os: 5 },
    { dia: '14/07', faturamento: faturamentoDiario || 335, os: 2 },
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit text-xs font-semibold text-blue-200 mb-3 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-blue-300" />
            Compatix OS • Módulo Centralizado em Tempo Real
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Painel de Controle Unificado</h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Acompanhe em tempo real o fluxo de atendimento, bancada técnica, faturamento e movimentações de estoque.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('atendimento-os')}
            className="px-5 py-3 bg-white text-blue-700 font-semibold rounded-2xl shadow-lg hover:bg-blue-50 transition-all text-xs flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Nova Ordem de Serviço
          </button>
          <button
            onClick={() => setActiveTab('tecnica-fila')}
            className="px-5 py-3 bg-blue-600/50 hover:bg-blue-600/70 border border-blue-400/30 text-white font-semibold rounded-2xl transition-all text-xs backdrop-blur-md flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            Ver Bancada Técnica
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total OS */}
        <div
          onClick={() => setActiveTab('atendimento-os')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Ordens</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800">{totalOS}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +2 hoje
            </span>
            <span>Cadastradas no sistema</span>
          </div>
        </div>

        {/* Aguardando Atendimento */}
        <div
          onClick={() => setActiveTab('atendimento-os')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aguard. Atendimento</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800">{aguardandoAtendimento}</div>
          <div className="mt-2 text-xs text-amber-600 font-medium">Equipamentos na recepção</div>
        </div>

        {/* Em Manutenção */}
        <div
          onClick={() => setActiveTab('tecnica-fila')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Em Manutenção</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800">{emManutencao}</div>
          <div className="mt-2 text-xs text-indigo-600 font-medium">Na bancada técnica</div>
        </div>

        {/* Aguardando Aprovação */}
        <div
          onClick={() => setActiveTab('atendimento-os')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aguard. Aprovação</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800">{aguardandoAprovacao + aguardandoOrcamento + orcamentoAprovado}</div>
          <div className="mt-2 text-xs text-purple-600 font-medium">Orçamentos pendentes</div>
        </div>
      </div>

      {/* Financial & Delivery Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Caixa do Dia</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">R$ {caixaDoDia.toFixed(2)}</div>
          <div className="mt-2 text-xs text-slate-500">Saldo das transações de hoje</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faturamento Diário</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">R$ {faturamentoDiario.toFixed(2)}</div>
          <div className="mt-2 text-xs text-slate-500">Entradas registradas hoje</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faturamento Mensal</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">R$ {faturamentoMensal.toFixed(2)}</div>
          <div className="mt-2 text-xs text-slate-500">Acumulado do mês atual</div>
        </div>

        <div
          onClick={() => setActiveTab('estoque')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estoque Baixo</span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${lowStockProducts.length > 0 ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{lowStockProducts.length} itens</div>
          <div className={`mt-2 text-xs font-medium ${lowStockProducts.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {lowStockProducts.length > 0 ? 'Atenção necessária' : 'Estoque regularizado'}
          </div>
        </div>
      </div>

      {/* Charts & Secondary Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Desempenho Financeiro (Últimos Dias)</h3>
              <p className="text-xs text-slate-500">Evolução do faturamento em tempo real</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-xs font-medium text-slate-600">Faturamento (R$)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  formatter={(value: any) => [`R$ ${value}`, 'Faturamento']}
                />
                <Bar dataKey="faturamento" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alert List & Schedule */}
        <div className="space-y-6">
          {/* Low Stock Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Alertas de Estoque Baixo
              </h3>
              <button
                onClick={() => setActiveTab('estoque')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Nenhum produto com estoque crítico.</p>
              ) : (
                lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-2xl">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Cód: {p.code}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-xl">
                        {p.stockQty} un. (Mín: {p.minStock})
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Agenda do Dia */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-600" />
              Agenda & Compromissos de Hoje
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  10h
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Retirada Impressora HP LaserJet</div>
                  <div className="text-[11px] text-slate-500">Cliente: Supermercado Bom Preço</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  14h
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Orçamento Técnico - Hospital São Lucas</div>
                  <div className="text-[11px] text-slate-500">Impressora Epson EcoTank L3250</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities & Audit Trail */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Atividades Recentes & Auditoria</h3>
            <p className="text-xs text-slate-500">Registro em tempo real das operações realizadas no sistema</p>
          </div>
          <button
            onClick={() => setActiveTab('logs')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Ver auditoria completa
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Módulo</th>
                <th className="py-3 px-4">Operação</th>
                <th className="py-3 px-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{log.userName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium text-[11px]">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{log.operation}</td>
                  <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
