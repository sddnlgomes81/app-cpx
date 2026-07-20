import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar, Filter } from 'lucide-react';

export const FinanceiroView: React.FC = () => {
  const { cashTransactions, addCashTransaction, currentUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trxType, setTrxType] = useState<'Entrada' | 'Saída'>('Entrada');
  const [category, setCategory] = useState<'Serviço' | 'Venda Peças' | 'Suprimento' | 'Despesa' | 'Outro'>('Serviço');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTransactions = cashTransactions.filter((t) => t.date.startsWith(todayStr));

  const totalEntradas = cashTransactions
    .filter((t) => t.type === 'Entrada')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidas = cashTransactions
    .filter((t) => t.type === 'Saída')
    .reduce((acc, t) => acc + t.amount, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  const handleCreateTrx = (e: React.FormEvent) => {
    e.preventDefault();
    addCashTransaction({
      type: trxType,
      category,
      description,
      amount,
      paymentMethod,
      userId: currentUser?.id || 'usr-1',
    });
    setDescription('');
    setAmount(0);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Fluxo de Caixa & Financeiro</h2>
          <p className="text-xs text-slate-500">Controle de entradas, saídas, faturamento e caixa do dia</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Entradas</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">R$ {totalEntradas.toFixed(2)}</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Saídas / Despesas</span>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">R$ {totalSaidas.toFixed(2)}</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Líquido</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black ${saldoLiquido >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
            R$ {saldoLiquido.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Histórico de Transações do Caixa</h3>
          <span className="text-xs text-slate-500">{cashTransactions.length} registros no total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Data / Hora</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Descrição</th>
                <th className="py-3.5 px-4">Forma Pgto</th>
                <th className="py-3.5 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-600">{new Date(trx.date).toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                        trx.type === 'Entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {trx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{trx.category}</td>
                  <td className="py-3.5 px-4 text-slate-800">{trx.description}</td>
                  <td className="py-3.5 px-4 text-slate-600">{trx.paymentMethod}</td>
                  <td
                    className={`py-3.5 px-4 text-right font-extrabold ${
                      trx.type === 'Entrada' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {trx.type === 'Entrada' ? '+ ' : '- '}R$ {trx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Novo Lançamento no Caixa</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-blue-700 rounded-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTrx} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tipo de Lançamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTrxType('Entrada')}
                    className={`p-2.5 rounded-xl text-xs font-bold border ${
                      trxType === 'Entrada' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrxType('Saída')}
                    className={`p-2.5 rounded-xl text-xs font-bold border ${
                      trxType === 'Saída' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Saída / Despesa
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="Serviço">Serviço</option>
                  <option value="Venda Peças">Venda Peças</option>
                  <option value="Suprimento">Suprimento</option>
                  <option value="Despesa">Despesa</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Compra de material..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Forma Pgto</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
