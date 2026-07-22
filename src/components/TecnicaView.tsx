import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceOrder } from '../types';
import { Wrench, CheckCircle, Clock, AlertTriangle, Plus, Trash2, Printer, Shield, ArrowRight, X } from 'lucide-react';

type StatusFilter = 'TODOS' | 'Aguardando Atendimento' | 'Orçamento Enviado' | 'Orçamento Aprovado' | 'Orçamento Reprovado';

export const TecnicaView: React.FC = () => {
  const { serviceOrders, updateServiceOrder, clients, printers, products, updateProduct } = useApp();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('TODOS');
  const [selectedOsForBench, setSelectedOsForBench] = useState<ServiceOrder | null>(null);

  // Bench form state
  const [diagnosis, setDiagnosis] = useState('');
  const [solution, setSolution] = useState('');
  const [selectedParts, setSelectedParts] = useState<{ productId: string; quantity: number }[]>([]);
  const [laborCost, setLaborCost] = useState<number>(0);
  const [warrantyDays, setWarrantyDays] = useState<number>(90);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductQty, setSelectedProductQty] = useState(1);
  const [productSearch, setProductSearch] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const productSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.code.toLowerCase().includes(productSearch.toLowerCase())
  );
  const [isSendApprovalModalOpen, setIsSendApprovalModalOpen] = useState(false);
  const [isSaveSuccessModalOpen, setIsSaveSuccessModalOpen] = useState(false);
  const [isFinishMaintenanceModalOpen, setIsFinishMaintenanceModalOpen] = useState(false);
  const [isSemConsertoModalOpen, setIsSemConsertoModalOpen] = useState(false);

  // Auto-sort by priority
  const priorityWeight: Record<string, number> = {
    Urgente: 4,
    Alta: 3,
    Média: 2,
    Baixa: 1,
  };

  const queueOs = serviceOrders
    .filter((os) => !['Entregues', 'Cancelada', 'Finalizada'].includes(os.status))
    .filter((os) => {
      if (statusFilter === 'TODOS') return true;
      if (statusFilter === 'Aguardando Atendimento') return os.status === 'Aguardando Atendimento';
      if (statusFilter === 'Orçamento Enviado') return os.status === 'Aguardando Aprovação';
      if (statusFilter === 'Orçamento Aprovado') return os.status === 'Orçamento Aprovado' || os.status === 'Em Manutenção';
      if (statusFilter === 'Orçamento Reprovado') return ['Orçamento Não Aprovado', 'Sem Conserto'].includes(os.status);
      return true;
    })
    .sort((a, b) => {
      const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const finishedOs = serviceOrders
    .filter(os => os.status === 'Finalizada')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10); // Show last 10

  const getCardStyle = (status: string) => {
    switch (status) {
      case 'Aguardando Atendimento':
        return 'bg-blue-100 border-blue-400';
      case 'Aguardando Aprovação':
        return 'bg-purple-100 border-purple-400';
      case 'Orçamento Aprovado':
        return 'bg-emerald-100 border-emerald-400';
      case 'Orçamento Não Aprovado':
      case 'Sem Conserto':
        return 'bg-red-100 border-red-400';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const handleOpenBench = (os: ServiceOrder) => {
    setSelectedOsForBench(os);
    setDiagnosis(os.diagnosis || '');
    setSolution(os.solution || '');
    setSelectedParts(
      os.usedParts.map((p) => ({ productId: p.productId, quantity: p.quantity }))
    );
    setLaborCost(os.laborCost || 0);
    setWarrantyDays(os.warrantyDays || 90);
  };

  const handleAddPartToOs = () => {
    if (!selectedProductId) return;
    const existing = selectedParts.find((p) => p.productId === selectedProductId);
    if (existing) {
      setSelectedParts(
        selectedParts.map((p) => (p.productId === selectedProductId ? { ...p, quantity: p.quantity + selectedProductQty } : p))
      );
    } else {
      setSelectedParts([...selectedParts, { productId: selectedProductId, quantity: selectedProductQty }]);
    }
    setSelectedProductId('');
    setProductSearch('');
    setSelectedProductQty(1);
  };

  const handleRemovePart = (productId: string) => {
    setSelectedParts(selectedParts.filter((p) => p.productId !== productId));
  };

  const handleSaveOrBudget = (statusToSet: ServiceOrder['status']) => {
    if (!selectedOsForBench) return;

    // Calculate parts list & cost
    const usedPartsFormatted = selectedParts.map((sp) => {
      const prod = products.find((p) => p.id === sp.productId);
      const unitPrice = prod ? prod.salePrice : 0;
      return {
        productId: sp.productId,
        productName: prod ? prod.name : 'Peça',
        quantity: sp.quantity,
        unitPrice,
        totalPrice: unitPrice * sp.quantity,
      };
    });

    const partsCost = usedPartsFormatted.reduce((acc, p) => acc + p.totalPrice, 0);
    const totalAmount = partsCost + laborCost;

    // If finalizing or saving parts, deduct from product stock if status is Em Manutenção -> Finalizada
    if (statusToSet === 'Finalizada' && selectedOsForBench.status !== 'Finalizada') {
      selectedParts.forEach((sp) => {
        const prod = products.find((p) => p.id === sp.productId);
        if (prod) {
          const newQty = Math.max(0, prod.stockQty - sp.quantity);
          updateProduct({ ...prod, stockQty: newQty });
        }
      });
    }

    updateServiceOrder(selectedOsForBench.id, {
      diagnosis,
      solution,
      usedParts: usedPartsFormatted,
      laborCost,
      partsCost,
      totalAmount,
      warrantyDays,
      status: statusToSet,
      quoteApproved: statusToSet === 'Aguardando Aprovação' ? null : selectedOsForBench.quoteApproved,
    });

    setSelectedOsForBench(null);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-slate-50 min-h-full">
      {/* Top Banner & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Bancada Técnica & Fila de Equipamentos</h2>
          <p className="text-xs text-slate-500">Ordenação inteligente automática por prioridade de atendimento</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['TODOS', 'Aguardando Atendimento', 'Orçamento Enviado', 'Orçamento Aprovado', 'Orçamento Reprovado'] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === filter
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Queue Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {queueOs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
                Nenhum equipamento na fila técnica no momento.
              </div>
            ) : (
              queueOs.map((os) => {
                const client = clients.find((c) => c.id === os.clientId);
                const printer = printers.find((p) => p.id === os.printerId);
                return (
                  <div
                    key={os.id}
                    className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${getCardStyle(os.status)}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600 text-sm">{os.osNumber}</span>
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                            os.priority === 'Urgente'
                              ? 'bg-red-100 text-red-700'
                              : os.priority === 'Alta'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Prioridade: {os.priority}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{client?.name || 'Cliente'}</h3>
                        <p className="text-xs text-slate-600 font-medium">
                          {printer ? `${printer.brand} ${printer.model}` : 'Impressora'}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
                        <span className="font-bold text-slate-700 block mb-0.5">Defeito Relatado:</span>
                        {os.reportedDefect}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">{os.status}</span>
                        <span className="text-slate-400 font-mono">
                          {new Date(os.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBench(os)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <Wrench className="w-4 h-4" /> Atender na Bancada
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Finished Sidebar */}
        <div className="w-full xl:w-80 shrink-0 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Últimas Consertadas
            </h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{finishedOs.length}</span>
          </div>
          <div className="space-y-3">
             {finishedOs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 text-sm">Nenhuma impressora finalizada recentemente.</div>
             ) : (
                finishedOs.map(os => {
                   const client = clients.find((c) => c.id === os.clientId);
                   const printer = printers.find((p) => p.id === os.printerId);
                   return (
                     <div key={os.id} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                       <div className="flex justify-between items-start mb-2 pl-2">
                         <div className="font-mono font-bold text-blue-600 text-xs">{os.osNumber}</div>
                         <div className="text-[10px] text-slate-400 font-mono">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</div>
                       </div>
                       <div className="pl-2">
                         <div className="font-bold text-slate-800 text-xs truncate" title={client?.name}>{client?.name || 'Cliente'}</div>
                         <div className="text-[11px] text-slate-500 truncate" title={printer ? `${printer.brand} ${printer.model}` : 'Impressora'}>{printer ? `${printer.brand} ${printer.model}` : 'Impressora'}</div>
                       </div>
                     </div>
                   )
                })
             )}
          </div>
        </div>
      </div>

      {/* Modal: Bancada Técnica Detalhada */}
      {selectedOsForBench && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 px-6 py-4 flex items-start justify-between text-white">
              <div className="pr-4">
                <h3 className="font-bold text-base flex flex-col sm:flex-row sm:items-center gap-2">
                  <span>Bancada Técnica • {selectedOsForBench.osNumber}</span>
                  {(() => {
                    const client = clients.find((c) => c.id === selectedOsForBench.clientId);
                    return client ? (
                      <span className="text-slate-300 text-[11px] font-medium bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        {client.name} • {client.phone}
                      </span>
                    ) : null;
                  })()}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Diagnóstico, aplicação de peças e fechamento de orçamento</p>
              </div>
              <button
                onClick={() => setSelectedOsForBench(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Defeito Relatado */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Defeito Relatado</span>
                <p className="text-xs text-slate-800">{selectedOsForBench.reportedDefect}</p>
              </div>

              {/* Diagnóstico & Solução */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Diagnóstico Técnico
                  </label>
                  <textarea
                    rows={3}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Descreva o problema constatado na bancada..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Solução Aplicada
                  </label>
                  <textarea
                    rows={3}
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Descreva o procedimento realizado..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Peças Utilizadas */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Peças e Componentes Utilizados</h4>
                <div className="flex items-start gap-3">
                  <div className="relative flex-1" ref={productSearchRef}>
                    <input
                      type="text"
                      placeholder="Pesquisar peça/produto por nome ou código..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setSelectedProductId('');
                        setIsProductDropdownOpen(true);
                      }}
                      onFocus={() => setIsProductDropdownOpen(true)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    {isProductDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setProductSearch(p.name);
                                setIsProductDropdownOpen(false);
                              }}
                              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-center border-b border-slate-100 last:border-0"
                            >
                              <span className="font-medium text-slate-800">{p.name} <span className="text-slate-500 font-normal">({p.code})</span></span>
                              <span className="text-slate-600">R$ {p.salePrice.toFixed(2)} (Estoque: {p.stockQty})</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-500 text-center">Nenhum produto encontrado.</div>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={selectedProductQty}
                    onChange={(e) => setSelectedProductQty(Number(e.target.value))}
                    className="w-20 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddPartToOs}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {selectedParts.length > 0 && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden mt-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold">
                        <tr>
                          <th className="p-3">Peça / Produto</th>
                          <th className="p-3 text-center">Qtd</th>
                          <th className="p-3 text-right">Unitário</th>
                          <th className="p-3 text-right">Subtotal</th>
                          <th className="p-3 text-center">Remover</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedParts.map((sp) => {
                          const prod = products.find((p) => p.id === sp.productId);
                          const subtotal = prod ? prod.salePrice * sp.quantity : 0;
                          return (
                            <tr key={sp.productId}>
                              <td className="p-3 font-semibold text-slate-800">{prod?.name}</td>
                              <td className="p-3 text-center">{sp.quantity}</td>
                              <td className="p-3 text-right">R$ {prod?.salePrice.toFixed(2)}</td>
                              <td className="p-3 text-right font-bold text-slate-900">R$ {subtotal.toFixed(2)}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleRemovePart(sp.productId)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Labor Cost & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Valor da Mão de Obra (R$)
                  </label>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Garantia do Serviço (Dias)
                  </label>
                  <input
                    type="number"
                    value={warrantyDays}
                    onChange={(e) => setWarrantyDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-slate-200">
                {selectedOsForBench.status !== 'Sem Conserto' && (
                  <>
                    <button
                      onClick={() => {
                        setIsSemConsertoModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" /> Sem Conserto
                    </button>
                    <button
                      onClick={() => {
                        handleSaveOrBudget('Aguardando Orçamento');
                        setIsSaveSuccessModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-xs"
                    >
                      Salvar Orçamento
                    </button>
                  </>
                )}
                
                {selectedOsForBench.status === 'Sem Conserto' ? (
                  <button
                    disabled
                    className="px-4 py-2.5 bg-red-100 text-red-700 font-medium rounded-xl text-xs cursor-not-allowed flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4" /> Sem Conserto
                  </button>
                ) : selectedOsForBench.status === 'Orçamento Não Aprovado' ? (
                  <button
                    disabled
                    className="px-4 py-2.5 bg-red-100 text-red-700 font-medium rounded-xl text-xs cursor-not-allowed"
                  >
                    Orçamento Não Aprovado
                  </button>
                ) : selectedOsForBench.status === 'Orçamento Aprovado' ? (
                  <button
                    disabled
                    className="px-4 py-2.5 bg-indigo-100 text-indigo-700 font-medium rounded-xl text-xs cursor-not-allowed"
                  >
                    Orçamento Aprovado
                  </button>
                ) : selectedOsForBench.status === 'Aguardando Aprovação' ? (
                  <button
                    disabled
                    className="px-4 py-2.5 bg-purple-100 text-purple-700 font-medium rounded-xl text-xs cursor-not-allowed"
                  >
                    Aguardando Aprovação
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSendApprovalModalOpen(true)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl text-xs"
                  >
                    Enviar para Aprovação
                  </button>
                )}
                {(selectedOsForBench.status === 'Orçamento Aprovado' || selectedOsForBench.status === 'Em Manutenção') && (
                  <button
                    onClick={() => setIsFinishMaintenanceModalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Concluir Manutenção
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enviar para Aprovação */}
      {isSendApprovalModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-purple-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Enviar para Aprovação</h3>
              <button onClick={() => setIsSendApprovalModalOpen(false)} className="p-1 hover:bg-purple-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 text-center mb-6">
                Tem certeza que deseja enviar o orçamento desta OS para aprovação?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsSendApprovalModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs flex-1"
                >
                  Não
                </button>
                <button
                  onClick={() => {
                    handleSaveOrBudget('Aguardando Aprovação');
                    setIsSendApprovalModalOpen(false);
                  }}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl text-xs shadow-lg shadow-purple-600/25 flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Sim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Salvo com sucesso */}
      {isSaveSuccessModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Sucesso!</h3>
            <p className="text-sm text-slate-600 mb-8">
              Documento salvo com sucesso.
            </p>
            <button
              onClick={() => setIsSaveSuccessModalOpen(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Conclusão */}
      {isFinishMaintenanceModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Concluir Manutenção</h3>
              <button onClick={() => setIsFinishMaintenanceModalOpen(false)} className="p-1 hover:bg-emerald-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 text-center mb-6">
                Tem certeza que deseja concluir a manutenção desta OS?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsFinishMaintenanceModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs flex-1"
                >
                  Não
                </button>
                <button
                  onClick={() => {
                    handleSaveOrBudget('Finalizada');
                    setIsFinishMaintenanceModalOpen(false);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Sim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Confirmar Sem Conserto */}
      {isSemConsertoModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Sem Conserto</h3>
              <button onClick={() => setIsSemConsertoModalOpen(false)} className="p-1 hover:bg-red-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 text-center mb-6">
                Tem certeza que deseja marcar esta OS como sem conserto?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsSemConsertoModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs flex-1"
                >
                  Não
                </button>
                <button
                  onClick={() => {
                    handleSaveOrBudget('Sem Conserto');
                    setIsSemConsertoModalOpen(false);
                    setIsSaveSuccessModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-xs shadow-lg shadow-red-600/25 flex-1 flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" /> Sim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
