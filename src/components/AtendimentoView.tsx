import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Printer as PrinterIcon,
  FileText,
  Search,
  Plus,
  DollarSign,
  CheckCircle,
  Truck,
  Eye,
  Printer,
  X,
  CreditCard,
  AlertCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import { ServiceOrder, Client, Printer as PrinterType } from '../types';
import { formatPhone } from '../utils';

export const AtendimentoView: React.FC = () => {
  const {
    clients,
    printers,
    serviceOrders,
    addClient,
    updateClient,
    deleteClient,
    addPrinter,
    updatePrinter,
    deletePrinter,
    addServiceOrder,
    updateServiceOrder,
    addCashTransaction,
    cashTransactions,
    companySettings,
    activeTab,
    setActiveTab,
    currentUser,
  } = useApp();

  const [subView, setSubView] = useState<'os' | 'clientes' | 'impressoras'>(() => {
    if (activeTab === 'impressoras') return 'impressoras';
    if (activeTab === 'clientes') return 'clientes';
    return 'os';
  });

  React.useEffect(() => {
    if (activeTab === 'impressoras') setSubView('impressoras');
    else if (activeTab === 'clientes') setSubView('clientes');
    else if (activeTab === 'atendimento-os') setSubView('os');
  }, [activeTab]);

  const handleSubViewChange = (view: 'os' | 'clientes' | 'impressoras') => {
    setSubView(view);
    if (view === 'os') setActiveTab('atendimento-os');
    else if (view === 'clientes') setActiveTab('clientes');
    else if (view === 'impressoras') setActiveTab('impressoras');
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isOsModalOpen, setIsOsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmPaymentModalOpen, setIsConfirmPaymentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isThermalPrint, setIsThermalPrint] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isOsDetailsModalOpen, setIsOsDetailsModalOpen] = useState(false);
  const [isConfirmOsModalOpen, setIsConfirmOsModalOpen] = useState(false);
  const [isDeleteClientModalOpen, setIsDeleteClientModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isDeletePrinterModalOpen, setIsDeletePrinterModalOpen] = useState(false);
  const [printerToEdit, setPrinterToEdit] = useState<PrinterType | null>(null);
  const [isEditingPrinter, setIsEditingPrinter] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Selected item for details/payment/print
  const [selectedOs, setSelectedOs] = useState<ServiceOrder | null>(null);
  const [osForDeliveryConfirmation, setOsForDeliveryConfirmation] = useState<ServiceOrder | null>(null);
  const [osForApproval, setOsForApproval] = useState<ServiceOrder | null>(null);
  const [selectedClientHistory, setSelectedClientHistory] = useState<Client | null>(null);
  const [selectedPrinterHistory, setSelectedPrinterHistory] = useState<PrinterType | null>(null);

  // Form states for new client
  const [clientForm, setClientForm] = useState({ name: '', document: '', phone: '', email: '', address: '' });
  // Form states for new printer
  const [printerForm, setPrinterForm] = useState({ clientId: '', brand: '', model: '', serialNumber: '', type: 'Laser' as any, observations: '' });
  // Form states for new OS
  const [osForm, setOsForm] = useState({ clientId: '', printerId: '', reportedDefect: '', priority: 'Baixa' as any });
  const [isNewClientInOs, setIsNewClientInOs] = useState(false);
  const [isNewPrinterInOs, setIsNewPrinterInOs] = useState(false);
  const [newClientInOsData, setNewClientInOsData] = useState({ name: '', document: '', phone: '', email: '', address: '' });
  const [newPrinterInOsData, setNewPrinterInOsData] = useState({ brand: '', model: '', serialNumber: '', type: 'Laser' as any, observations: '' });

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Boleto'>('PIX');

  // Filtered lists
  const filteredOs = serviceOrders.filter((os) => {
    const matchSearch = os.osNumber.toLowerCase().includes(searchTerm.toLowerCase()) || os.reportedDefect.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || os.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredClients = clients.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.document.includes(searchTerm)
  );

  const filteredPrinters = printers.filter(
    (p) => p.model.toLowerCase().includes(searchTerm.toLowerCase()) || p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingClient && clientToDelete) { // Using clientToDelete as a generic "selected client" for editing here since we don't have selectedClient state
      updateClient({ ...clientToDelete, ...clientForm } as Client);
      setSuccessMessage('Cadastro salvo com sucesso');
      setIsSuccessModalOpen(true);
      setTimeout(() => setIsSuccessModalOpen(false), 3000);
    } else {
      addClient(clientForm);
    }
    setClientForm({ name: '', document: '', phone: '', email: '', address: '' });
    setIsClientModalOpen(false);
    setIsEditingClient(false);
  };

  const handleEditClientClick = (client: Client) => {
    setClientToDelete(client); // re-using this state to hold the client being edited for simplicity
    setClientForm({ name: client.name, document: client.document, phone: client.phone, email: client.email, address: client.address });
    setIsEditingClient(true);
    setIsClientModalOpen(true);
  };

  const confirmDeleteClient = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      setIsDeleteClientModalOpen(false);
      setClientToDelete(null);
    }
  };

  const handleCreatePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingPrinter && printerToEdit) {
      updatePrinter({ ...printerToEdit, ...printerForm } as PrinterType);
      setSuccessMessage('Impressora salva com sucesso');
      setIsSuccessModalOpen(true);
      setTimeout(() => setIsSuccessModalOpen(false), 3000);
    } else {
      addPrinter(printerForm);
    }
    setPrinterForm({ clientId: '', brand: '', model: '', serialNumber: '', type: 'Laser', observations: '' });
    setIsPrinterModalOpen(false);
    setIsEditingPrinter(false);
  };

  const handleEditPrinterClick = (printer: PrinterType) => {
    setPrinterToEdit(printer);
    setPrinterForm({
      clientId: printer.clientId,
      brand: printer.brand,
      model: printer.model,
      serialNumber: printer.serialNumber,
      type: printer.type,
      observations: printer.observations || ''
    });
    setIsEditingPrinter(true);
    setIsPrinterModalOpen(true);
  };

  const confirmDeletePrinter = () => {
    if (printerToEdit) {
      deletePrinter(printerToEdit.id);
      setIsDeletePrinterModalOpen(false);
      setPrinterToEdit(null);
    }
  };

  const handleCreateOsRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOsModalOpen(true);
  };

  const handleCreateOsConfirm = () => {
    let finalClientId = osForm.clientId;
    if (isNewClientInOs) {
      const createdClient = addClient(newClientInOsData);
      finalClientId = createdClient.id;
    }

    let finalPrinterId = osForm.printerId;
    if (isNewPrinterInOs) {
      const createdPrinter = addPrinter({ ...newPrinterInOsData, clientId: finalClientId });
      finalPrinterId = createdPrinter.id;
    }

    const newOs = addServiceOrder({
      clientId: finalClientId,
      printerId: finalPrinterId,
      reportedDefect: osForm.reportedDefect,
      priority: osForm.priority,
      status: 'Aguardando Atendimento',
      attendantId: currentUser?.id || 'usr-2',
      usedParts: [],
      laborCost: 0,
      partsCost: 0,
      totalAmount: 0,
      paid: false,
    });
    setOsForm({ clientId: '', printerId: '', reportedDefect: '', priority: 'Baixa' });
    setIsNewClientInOs(false);
    setIsNewPrinterInOs(false);
    setNewClientInOsData({ name: '', document: '', phone: '', email: '', address: '' });
    setNewPrinterInOsData({ brand: '', model: '', serialNumber: '', type: 'Laser', observations: '' });
    setIsConfirmOsModalOpen(false);
    setIsOsModalOpen(false);

    // Open print modal with the new OS
    setSelectedOs(newOs);
    setIsThermalPrint(false);
    setIsPrintModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleProcessPayment = (shouldPrint: boolean = false) => {
    if (!selectedOs) return;
    updateServiceOrder(selectedOs.id, {
      paid: true,
      paidAt: new Date().toISOString(),
      paymentMethod,
      status: selectedOs.status === 'Finalizada' ? 'Entregues' : selectedOs.status,
    });
    addCashTransaction({
      type: 'Entrada',
      category: 'Serviço',
      description: `Recebimento OS ${selectedOs.osNumber}`,
      amount: selectedOs.totalAmount,
      paymentMethod,
      osId: selectedOs.id,
      userId: 'usr-2',
    });
    setIsPaymentModalOpen(false);
    setIsConfirmPaymentModalOpen(false);
    
    if (shouldPrint) {
      setIsThermalPrint(true);
      setIsPrintModalOpen(true);
      setTimeout(() => {
        window.print();
      }, 500);
    } else {
      setSelectedOs(null);
    }
  };

  const handleApproveQuote = (approved: boolean) => {
    if (!osForApproval) return;
    updateServiceOrder(osForApproval.id, {
      status: approved ? 'Orçamento Aprovado' : 'Orçamento Não Aprovado',
      quoteApproved: approved,
    });
    setIsApproveModalOpen(false);
    setOsForApproval(null);
  };

  const handleFinalDelivery = (os: ServiceOrder) => {
    updateServiceOrder(os.id, {
      status: 'Entregues',
      deliveredAt: new Date().toISOString(),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aguardando Atendimento':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Aguardando Orçamento':
      case 'Aguardando Aprovação':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Orçamento Aprovado':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Orçamento Não Aprovado':
      case 'Sem Conserto':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Em Manutenção':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Finalizada':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Entregues':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-slate-50 min-h-full">
      {/* Module Navigation Tabs */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 shrink-0 w-full lg:w-auto custom-scrollbar">
          <button
            onClick={() => handleSubViewChange('os')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              subView === 'os' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Ordens de Serviço ({serviceOrders.length})
          </button>
          <button
            onClick={() => handleSubViewChange('clientes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              subView === 'clientes' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Clientes ({clients.length})
          </button>
          <button
            onClick={() => handleSubViewChange('impressoras')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              subView === 'impressoras' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PrinterIcon className="w-4 h-4" />
            Impressoras ({printers.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          {subView === 'os' && (
            <button
              onClick={() => setIsOsModalOpen(true)}
              className="w-full lg:w-auto justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Abrir Nova OS
            </button>
          )}
          {subView === 'clientes' && (
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="w-full lg:w-auto justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Cliente
            </button>
          )}
          {subView === 'impressoras' && (
            <button
              onClick={() => setIsPrinterModalOpen(true)}
              className="w-full lg:w-auto justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Impressora
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por número OS, cliente, modelo ou série..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {subView === 'os' && (
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['todos', 'Aguardando Atendimento', 'Em Manutenção', 'Aguardando Aprovação', 'Orçamento Aprovado', 'Orçamento Não Aprovado', 'Sem Conserto', 'Finalizada', 'Entregues'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
                  statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SubView: Ordens de Serviço */}
      {subView === 'os' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Nº OS</th>
                  <th className="py-3.5 px-4">Data / Prioridade</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Impressora</th>
                  <th className="py-3.5 px-4">Defeito Relatado</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Valor Total</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Nenhuma Ordem de Serviço encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredOs.map((os) => {
                    const client = clients.find((c) => c.id === os.clientId);
                    const printer = printers.find((p) => p.id === os.printerId);
                    const isSuccess = os.status === 'Orçamento Aprovado' || os.status === 'Finalizada' || (os.status === 'Entregues' && os.paid);
                    const isFailed = os.status === 'Sem Conserto' || os.status === 'Orçamento Não Aprovado' || (os.status === 'Entregues' && !os.paid);
                    const rowClass = isSuccess 
                      ? 'bg-emerald-50/60 hover:bg-emerald-100 transition-colors' 
                      : isFailed 
                      ? 'bg-red-50/60 hover:bg-red-100 transition-colors' 
                      : 'hover:bg-slate-50/80 transition-colors';
                    return (
                      <tr 
                        key={os.id} 
                        className={rowClass}
                        onDoubleClick={() => {
                          setSelectedOs(os);
                          setIsOsDetailsModalOpen(true);
                        }}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{os.osNumber}</td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</div>
                          <span
                            className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                              os.priority === 'Urgente'
                                ? 'bg-red-100 text-red-700'
                                : os.priority === 'Alta'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {os.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{client?.name || 'Cliente não encontrado'}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {printer ? `${printer.brand} ${printer.model}` : 'Impressora não encontrada'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">{os.reportedDefect}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${getStatusBadge(os.status)}`}>
                            {os.status}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 font-bold ${isFailed ? 'text-red-600' : 'text-slate-800'}`}>
                          {isFailed ? 'R$ 0,00' : (os.totalAmount > 0 ? `R$ ${os.totalAmount.toFixed(2)}` : 'A definir')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedOs(os);
                                setIsThermalPrint(false);
                                setIsPrintModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                              title="Imprimir / Emitir OS"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            {os.status === 'Aguardando Aprovação' && currentUser?.role === 'admin' && (
                              <button
                                onClick={() => {
                                  setOsForApproval(os);
                                  setIsApproveModalOpen(true);
                                }}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-medium flex items-center gap-1"
                                title="Aprovar Orçamento"
                              >
                                <CheckCircle className="w-3 h-3" /> Aprovar Orçamento
                              </button>
                            )}
                            {os.status === 'Finalizada' && !os.paid && os.totalAmount > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedOs(os);
                                  setIsPaymentModalOpen(true);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-medium flex items-center gap-1"
                                title="Receber Pagamento"
                              >
                                <DollarSign className="w-3 h-3" /> Receber
                              </button>
                            )}
                            {os.paid && (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                                Pago ({os.paymentMethod})
                              </span>
                            )}
                            {((os.status === 'Finalizada' && (os.paid || os.totalAmount === 0)) || os.status === 'Sem Conserto' || os.status === 'Orçamento Não Aprovado') && (
                              <button
                                onClick={() => setOsForDeliveryConfirmation(os)}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-medium flex items-center gap-1"
                                title="Finalizar Entrega"
                              >
                                <Truck className="w-3 h-3" /> Entregar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubView: Clientes */}
      {subView === 'clientes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const clientPrinters = printers.filter((p) => p.clientId === client.id);
            const clientOs = serviceOrders.filter((os) => os.clientId === client.id);
            return (
              <div key={client.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{client.name}</h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{client.document}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onDoubleClick={() => {
                        setSelectedClientHistory(client);
                        setIsHistoryModalOpen(true);
                      }}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold flex items-center gap-1"
                      title="Dê um clique duplo para ver o histórico"
                    >
                      <Eye className="w-3.5 h-3.5" /> Histórico
                    </button>
                    <button
                      onClick={() => handleEditClientClick(client)}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl"
                      title="Editar Cliente"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setClientToDelete(client);
                        setIsDeleteClientModalOpen(true);
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl"
                      title="Excluir Cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div><b>Tel:</b> {client.phone}</div>
                  <div><b>E-mail:</b> {client.email}</div>
                  <div><b>Endereço:</b> {client.address}</div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Impressoras: <b>{clientPrinters.length}</b></span>
                  <span className="text-slate-500 font-medium">OS Registradas: <b>{clientOs.length}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SubView: Impressoras */}
      {subView === 'impressoras' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrinters.map((printer) => {
            const client = clients.find((c) => c.id === printer.clientId);
            const printerOs = serviceOrders.filter((os) => os.printerId === printer.id);
            const activeOs = printerOs.find((os) => !['Entregues', 'Cancelada'].includes(os.status));
            
            const printerStatus = activeOs ? 'Em Manutenção' : 'No Cliente / Ativa';
            const statusColor = activeOs ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';
            const borderIndicator = activeOs ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500';

            return (
              <div key={printer.id} className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 ${borderIndicator}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColor}`}>
                        {printerStatus}
                      </span>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold">
                        {printer.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">{printer.brand} {printer.model}</h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">S/N: {printer.serialNumber}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div><b>Cliente:</b> {client?.name || 'Não vinculado'}</div>
                  {printer.observations && <div><b>Obs:</b> {printer.observations}</div>}
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                  <span>Histórico: <b>{printerOs.length} OS</b></span>
                  {activeOs && (
                    <span className="text-amber-600 font-medium">OS Aberta: #{activeOs.osNumber}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Detalhes da OS */}
      {isOsDetailsModalOpen && selectedOs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h3 className="font-bold text-base">Detalhes da Ordem de Serviço • {selectedOs.osNumber}</h3>
              <button onClick={() => setIsOsDetailsModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
              {(() => {
                const client = clients.find(c => c.id === selectedOs.clientId);
                const printer = printers.find(p => p.id === selectedOs.printerId);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 text-xs uppercase tracking-wider">Cliente</h4>
                      {client ? (
                        <>
                          <div className="font-semibold text-slate-800">{client.name}</div>
                          <div className="text-xs"><b>Doc:</b> {client.document || 'Não informado'}</div>
                          <div className="text-xs"><b>Tel:</b> {client.phone}</div>
                          <div className="text-xs"><b>E-mail:</b> {client.email || 'Não informado'}</div>
                          <div className="text-xs"><b>End:</b> {client.address}</div>
                        </>
                      ) : (
                        <div className="text-slate-500">Cliente não encontrado.</div>
                      )}
                    </div>
                    <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 text-xs uppercase tracking-wider">Equipamento</h4>
                      {printer ? (
                        <>
                          <div className="font-semibold text-slate-800">{printer.brand} {printer.model}</div>
                          <div className="text-xs font-mono"><b>S/N:</b> {printer.serialNumber}</div>
                          <div className="text-xs"><b>Tipo:</b> {printer.type}</div>
                          {printer.observations && <div className="text-xs mt-2 text-slate-500 italic">{printer.observations}</div>}
                        </>
                      ) : (
                        <div className="text-slate-500">Equipamento não encontrado.</div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div>
                <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">Problema Relatado (Cliente)</h4>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedOs.reportedDefect}</p>
              </div>

              {(selectedOs.diagnosis || selectedOs.solution) && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">Análise Técnica</h4>
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-3">
                    {selectedOs.diagnosis && (
                      <div>
                        <span className="font-semibold text-blue-900 block text-xs uppercase tracking-wider mb-1">O que está provocando o problema (Diagnóstico):</span>
                        <p className="text-blue-800">{selectedOs.diagnosis}</p>
                      </div>
                    )}
                    {selectedOs.solution && (
                      <div>
                        <span className="font-semibold text-blue-900 block text-xs uppercase tracking-wider mb-1">Solução Proposta/Aplicada:</span>
                        <p className="text-blue-800">{selectedOs.solution}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedOs.usedParts && selectedOs.usedParts.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">Peças e Componentes (Trocas)</h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 text-xs">
                        <tr>
                          <th className="p-2 px-3 font-semibold">Peça</th>
                          <th className="p-2 px-3 font-semibold text-center">Qtd</th>
                          <th className="p-2 px-3 font-semibold text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {selectedOs.usedParts.map((part, idx) => (
                          <tr key={idx}>
                            <td className="p-2 px-3">{part.productName}</td>
                            <td className="p-2 px-3 text-center">{part.quantity}</td>
                            <td className="p-2 px-3 text-right font-medium text-slate-800">R$ {part.totalPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-200">
                {(() => {
                  const isFailed = selectedOs.status === 'Sem Conserto' || selectedOs.status === 'Orçamento Não Aprovado' || (selectedOs.status === 'Entregues' && !selectedOs.paid);
                  return (
                    <div className="w-64 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Valor de Peças:</span>
                        <span className="font-semibold text-slate-800">{isFailed ? 'R$ 0,00' : `R$ ${selectedOs.partsCost.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Mão de Obra:</span>
                        <span className="font-semibold text-slate-800">{isFailed ? 'R$ 0,00' : `R$ ${selectedOs.laborCost.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base text-emerald-700 pt-2 border-t border-slate-200 mt-2">
                        <span>Valor do Serviço:</span>
                        <span>{isFailed ? 'R$ 0,00' : `R$ ${selectedOs.totalAmount.toFixed(2)}`}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova OS */}
      {isOsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Abrir Nova Ordem de Serviço</h3>
              <button onClick={() => setIsOsModalOpen(false)} className="p-1 hover:bg-blue-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOsRequest} className="p-6 space-y-4">
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Cliente</label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer hover:text-blue-600">
                    <input type="checkbox" checked={isNewClientInOs} onChange={(e) => setIsNewClientInOs(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                    Cadastrar Novo Cliente
                  </label>
                </div>
                {!isNewClientInOs ? (
                  <select
                    value={osForm.clientId}
                    onChange={(e) => setOsForm({ ...osForm, clientId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600"
                    required={!isNewClientInOs}
                  >
                    <option value="">Selecione o Cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.document})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Nome / Razão Social *" required={isNewClientInOs} value={newClientInOsData.name} onChange={(e) => setNewClientInOsData({...newClientInOsData, name: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800" />
                    <input type="text" placeholder="CPF / CNPJ" value={newClientInOsData.document} onChange={(e) => setNewClientInOsData({...newClientInOsData, document: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800" />
                    <input type="text" placeholder="Telefone *" required={isNewClientInOs} value={newClientInOsData.phone} onChange={(e) => setNewClientInOsData({...newClientInOsData, phone: formatPhone(e.target.value)})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800" />
                    <input type="email" placeholder="E-mail" value={newClientInOsData.email} onChange={(e) => setNewClientInOsData({...newClientInOsData, email: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800" />
                  </div>
                )}
              </div>

              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Impressora do Cliente</label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer hover:text-blue-600">
                    <input type="checkbox" checked={isNewPrinterInOs} onChange={(e) => setIsNewPrinterInOs(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                    Cadastrar Nova Impressora
                  </label>
                </div>
                {!isNewPrinterInOs ? (
                  <select
                    value={osForm.printerId}
                    onChange={(e) => setOsForm({ ...osForm, printerId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600"
                    required={!isNewPrinterInOs}
                  >
                    <option value="">Selecione a Impressora</option>
                    {printers
                      .filter((p) => (!osForm.clientId || p.clientId === osForm.clientId) && !isNewClientInOs)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.brand} {p.model} (S/N: {p.serialNumber})
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Marca *" required={isNewPrinterInOs} value={newPrinterInOsData.brand} onChange={(e) => setNewPrinterInOsData({...newPrinterInOsData, brand: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800" />
                    <input type="text" placeholder="Modelo *" required={isNewPrinterInOs} value={newPrinterInOsData.model} onChange={(e) => setNewPrinterInOsData({...newPrinterInOsData, model: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800" />
                    <input type="text" placeholder="Nº de Série *" required={isNewPrinterInOs} value={newPrinterInOsData.serialNumber} onChange={(e) => setNewPrinterInOsData({...newPrinterInOsData, serialNumber: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800" />
                    <select value={newPrinterInOsData.type} onChange={(e) => setNewPrinterInOsData({...newPrinterInOsData, type: e.target.value as any})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800" required={isNewPrinterInOs}>
                      <option value="Laser">Laser</option>
                      <option value="Jato de Tinta">Jato de Tinta</option>
                      <option value="Térmica">Térmica</option>
                      <option value="Matricial">Matricial</option>
                      <option value="Outra">Outra</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Prioridade</label>
                <input
                  type="text"
                  value="Baixa (Definida automaticamente pela fila)"
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Defeito Relatado pelo Cliente</label>
                <textarea
                  rows={3}
                  value={osForm.reportedDefect}
                  onChange={(e) => setOsForm({ ...osForm, reportedDefect: e.target.value })}
                  placeholder="Descreva detalhadamente o problema relatado..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs shadow-lg shadow-blue-600/25"
                >
                  Abrir Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Nova OS */}
      {isConfirmOsModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Confirmar Abertura</h3>
              <button onClick={() => setIsConfirmOsModalOpen(false)} className="p-1 hover:bg-blue-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 text-center mb-6">
                Tem certeza que deseja abrir uma nova Ordem de Serviço?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsConfirmOsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Não
                </button>
                <button
                  onClick={handleCreateOsConfirm}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Sim, Abrir OS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Excluir Cliente */}
      {isDeleteClientModalOpen && clientToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Excluir Cliente</h3>
              <button onClick={() => setIsDeleteClientModalOpen(false)} className="p-1 hover:bg-red-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 text-center mb-6">
                Tem certeza que deseja excluir o cliente <strong>{clientToDelete.name}</strong>? Essa ação apagará todo o cadastro do cliente e suas impressoras vinculadas.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsDeleteClientModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Não
                </button>
                <button
                  onClick={confirmDeleteClient}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/25 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Excluir Impressora */}
      {isDeletePrinterModalOpen && printerToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Excluir Impressora</h3>
              <button onClick={() => setIsDeletePrinterModalOpen(false)} className="p-1 hover:bg-red-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 text-center mb-6">
                Tem certeza que deseja excluir a impressora <strong>{printerToEdit.brand} {printerToEdit.model}</strong>? Essa ação apagará as OS associadas.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsDeletePrinterModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Não
                </button>
                <button
                  onClick={confirmDeletePrinter}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/25 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mensagem de Sucesso */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl shadow-xl flex items-center gap-4 animate-in fade-in zoom-in duration-200">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-800 text-lg">Sucesso!</h3>
              <p className="text-emerald-700 text-sm mt-0.5">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar / Editar Cliente */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">{isEditingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>
              <button onClick={() => setIsClientModalOpen(false)} className="p-1 hover:bg-blue-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nome / Razão Social *</label>
                <input
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  value={clientForm.document}
                  onChange={(e) => setClientForm({ ...clientForm, document: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Telefone *</label>
                  <input
                    type="text"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: formatPhone(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">E-mail</label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              {isEditingClient && clientToDelete && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-800 mb-3 uppercase tracking-wider">Impressoras Vinculadas</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                    {printers.filter(p => p.clientId === clientToDelete.id).length === 0 ? (
                      <p className="text-xs text-slate-500">Nenhuma impressora vinculada.</p>
                    ) : (
                      printers.filter(p => p.clientId === clientToDelete.id).map(printer => (
                        <div key={printer.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                          <div>
                            <div className="font-semibold text-slate-800">{printer.brand} {printer.model}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">S/N: {printer.serialNumber}</div>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditPrinterClick(printer)}
                              className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                              title="Editar Impressora"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPrinterToEdit(printer);
                                setIsDeletePrinterModalOpen(true);
                              }}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                              title="Excluir Impressora"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs"
                >
                  {isEditingClient ? 'Salvar Alterações' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Impressora */}
      {isPrinterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">{isEditingPrinter ? 'Editar Impressora' : 'Cadastrar Nova Impressora'}</h3>
              <button onClick={() => setIsPrinterModalOpen(false)} className="p-1 hover:bg-blue-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePrinter} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Proprietário (Cliente)</label>
                <select
                  value={printerForm.clientId}
                  onChange={(e) => setPrinterForm({ ...printerForm, clientId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                >
                  <option value="">Selecione o Cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Marca</label>
                  <input
                    type="text"
                    value={printerForm.brand}
                    onChange={(e) => setPrinterForm({ ...printerForm, brand: e.target.value })}
                    placeholder="Ex: HP, Epson, Brother"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Modelo</label>
                  <input
                    type="text"
                    value={printerForm.model}
                    onChange={(e) => setPrinterForm({ ...printerForm, model: e.target.value })}
                    placeholder="Ex: LaserJet M404"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Número de Série</label>
                  <input
                    type="text"
                    value={printerForm.serialNumber}
                    onChange={(e) => setPrinterForm({ ...printerForm, serialNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tipo de Impressora</label>
                  <select
                    value={printerForm.type}
                    onChange={(e) => setPrinterForm({ ...printerForm, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Laser">Laser</option>
                    <option value="Jato de Tinta">Jato de Tinta</option>
                    <option value="Térmica">Térmica</option>
                    <option value="Matricial">Matricial</option>
                    <option value="Outra">Outra</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Observações / Acessórios Deixados</label>
                <textarea
                  rows={2}
                  value={printerForm.observations}
                  onChange={(e) => setPrinterForm({ ...printerForm, observations: e.target.value })}
                  placeholder="Ex: Veio com cabo de força e toner..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPrinterModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs"
                >
                  {isEditingPrinter ? 'Salvar Alterações' : 'Salvar Impressora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Aprovar Orçamento */}
      {isApproveModalOpen && osForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-amber-500 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Aprovar Orçamento</h3>
              <button onClick={() => setIsApproveModalOpen(false)} className="p-1 hover:bg-amber-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 text-center mb-6">
                Como deseja proceder com o orçamento da OS <strong>{osForApproval.osNumber}</strong> no valor de <strong>R$ {osForApproval.totalAmount.toFixed(2)}</strong>?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsApproveModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleApproveQuote(false)}
                  className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl text-xs shadow-lg shadow-red-500/25 flex-1 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Reprovar
                </button>
                <button
                  onClick={() => handleApproveQuote(true)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-xs shadow-lg shadow-amber-500/25 flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Aprovar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Receber Pagamento */}
      {isPaymentModalOpen && selectedOs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">Receber Pagamento • {selectedOs.osNumber}</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 hover:bg-emerald-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Valor de Peças:</span>
                  <span className="font-semibold">R$ {selectedOs.partsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Mão de Obra:</span>
                  <span className="font-semibold">R$ {selectedOs.laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Valor Total:</span>
                  <span className="text-emerald-600">R$ {selectedOs.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m as any)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        paymentMethod === m
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIsConfirmPaymentModalOpen(true)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Confirmar Pagamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Pagamento */}
      {isConfirmPaymentModalOpen && selectedOs && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-8">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Finalizar Pagamento</h3>
            <p className="text-sm text-slate-600 mb-8">
              Tem certeza que quer finalizar o pagamento da OS <strong>{selectedOs.osNumber}</strong>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsConfirmPaymentModalOpen(false)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs flex-1"
              >
                Não
              </button>
              <button
                onClick={() => handleProcessPayment(true)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex-1 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Comprovante / Impressão OS */}
      {isPrintModalOpen && selectedOs && (
        <>
          {/* Tela (no-print) */}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 no-print">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-base">Comprovante de OS</h3>
                  <div className="flex items-center bg-slate-800 rounded-lg p-1">
                    <button
                      onClick={() => setIsThermalPrint(false)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${!isThermalPrint ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      A4
                    </button>
                    <button
                      onClick={() => setIsThermalPrint(true)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${isThermalPrint ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      Térmica
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Imprimir
                  </button>
                  <button onClick={() => setIsPrintModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
                {isThermalPrint ? (
                  <ThermalReceiptContent selectedOs={selectedOs} companySettings={companySettings} clients={clients} printers={printers} />
                ) : (
                  <ReceiptContent selectedOs={selectedOs} companySettings={companySettings} clients={clients} printers={printers} />
                )}
              </div>
            </div>
          </div>

          {/* Versão de Impressão (print-only) - 2 Vias */}
          <div className={`print-only print-content bg-white ${isThermalPrint ? 'thermal-print-container' : ''}`}>
            {isThermalPrint && (
              <style>{`
                @media print {
                  @page {
                    margin: 0;
                    size: 80mm auto;
                  }
                  body {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 80mm !important;
                  }
                  .print-content {
                    width: 80mm !important;
                    height: auto !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    padding: 2mm !important;
                  }
                }
              `}</style>
            )}
            
            {isThermalPrint ? (
              <div className="flex flex-col gap-2 pb-4">
                <div className="px-1 pt-1">
                  <ThermalReceiptContent selectedOs={selectedOs} companySettings={companySettings} clients={clients} printers={printers} viaLabel="1ª VIA - EMPRESA" />
                </div>
                <div className="text-center font-bold text-[11px] my-4 border-t-2 border-b-2 border-black border-dashed py-1 tracking-wider">
                  ----- CORTE AQUI -----
                </div>
                <div className="px-1 pt-1">
                  <ThermalReceiptContent selectedOs={selectedOs} companySettings={companySettings} clients={clients} printers={printers} viaLabel="2ª VIA - CLIENTE" />
                </div>
              </div>
            ) : (
              <>
                <div className="h-[50vh] overflow-hidden p-6 border-b border-dashed border-slate-300 box-border flex flex-col justify-center">
                  <ReceiptContent selectedOs={selectedOs} companySettings={companySettings} clients={clients} printers={printers} isPrintView />
                </div>
                <div className="h-[50vh] overflow-hidden p-6 box-border flex flex-col justify-center">
                  <ReceiptContent selectedOs={selectedOs} companySettings={companySettings} clients={clients} printers={printers} isPrintView />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Modal: Histórico */}
      {isHistoryModalOpen && selectedClientHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h3 className="font-bold text-base">Histórico de Atendimentos • {selectedClientHistory.name}</h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center">
                  <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Total de Máquinas</span>
                  <span className="text-2xl font-black text-blue-900">{printers.filter(p => p.clientId === selectedClientHistory.id).length}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">OS Registradas</span>
                  <span className="text-2xl font-black text-slate-800">{serviceOrders.filter(os => os.clientId === selectedClientHistory.id).length}</span>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-center">
                  <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Total Investido (Aprox)</span>
                  <span className="text-2xl font-black text-emerald-900">
                    R$ {serviceOrders.filter(os => os.clientId === selectedClientHistory.id && os.paid).reduce((acc, os) => acc + os.totalAmount, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Registro de Ordens de Serviço</h4>
                {serviceOrders.filter(os => os.clientId === selectedClientHistory.id).length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">Nenhuma OS registrada para este cliente.</div>
                ) : (
                  <div className="space-y-4">
                    {serviceOrders.filter(os => os.clientId === selectedClientHistory.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(os => {
                      const printer = printers.find(p => p.id === os.printerId);
                      const isFailed = os.status === 'Sem Conserto' || os.status === 'Orçamento Não Aprovado' || (os.status === 'Entregues' && !os.paid);
                      return (
                        <div key={os.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="md:w-1/4 shrink-0 space-y-2">
                            <div className="font-mono font-bold text-blue-600">{os.osNumber}</div>
                            <div className="text-xs text-slate-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</div>
                            <div className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ['Entregues', 'Finalizada'].includes(os.status) ? 'bg-emerald-100 text-emerald-700' :
                              isFailed ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {os.status}
                            </div>
                          </div>
                          
                          <div className="md:w-2/4 flex flex-col justify-center space-y-2">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Equipamento</span>
                              <span className="text-sm font-semibold text-slate-800">{printer ? `${printer.brand} ${printer.model}` : 'Desconhecido'}</span>
                              {printer && <span className="text-[10px] text-slate-400 font-mono ml-2">S/N: {printer.serialNumber}</span>}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Defeito Relatado</span>
                              <span className="text-xs text-slate-700">{os.reportedDefect}</span>
                            </div>
                          </div>

                          <div className="md:w-1/4 shrink-0 flex flex-col items-end justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 pl-0 md:pl-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Valor do Serviço</span>
                            <span className={`text-lg font-black ${isFailed ? 'text-red-600' : 'text-slate-800'}`}>
                              {isFailed ? 'R$ 0,00' : (os.totalAmount > 0 ? `R$ ${os.totalAmount.toFixed(2)}` : 'A definir')}
                            </span>
                            {os.paid && !isFailed && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">PAGO</span>}
                            {!os.paid && !isFailed && os.totalAmount > 0 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">PENDENTE</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de Entrega */}
      {osForDeliveryConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 text-center space-y-6">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Confirmação de Entrega</h3>
              <p className="text-xs text-slate-600">Tem certeza?</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setOsForDeliveryConfirmation(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => {
                  handleFinalDelivery(osForDeliveryConfirmation);
                  setOsForDeliveryConfirmation(null);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ReceiptContent({ selectedOs, companySettings, clients, printers, isPrintView = false }: any) {
  const c = clients.find((x: any) => x.id === selectedOs.clientId);
  const p = printers.find((x: any) => x.id === selectedOs.printerId);
  const isFailed = selectedOs.status === 'Sem Conserto' || selectedOs.status === 'Orçamento Não Aprovado' || (selectedOs.status === 'Entregues' && !selectedOs.paid);

  return (
    <div className={`space-y-${isPrintView ? '4' : '6'} text-xs text-slate-700`}>
      <div className={`text-center pb-${isPrintView ? '4' : '6'} border-b border-slate-200`}>
        {companySettings.logoUrl && (
          <img src={companySettings.logoUrl} alt="Logo" className={`${isPrintView ? 'h-10' : 'h-16'} w-auto mx-auto mb-2 object-contain`} />
        )}
        <h1 className={`font-extrabold text-slate-900 ${isPrintView ? 'text-base' : 'text-lg'} uppercase`}>{companySettings.tradeName}</h1>
        <p className="text-slate-500 text-[10px]">{companySettings.address} | CNPJ: {companySettings.cnpj}</p>
        <p className="text-slate-500 text-[10px]">Tel: {companySettings.phone} - E-mail: {companySettings.email}</p>
      </div>

      <div className={`bg-slate-50 ${isPrintView ? 'p-3' : 'p-4'} rounded-xl border border-slate-200 flex justify-between items-center`}>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Documento</span>
          <span className="font-mono font-bold text-sm text-blue-600">{selectedOs.osNumber}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Data de Abertura</span>
          <span className="font-semibold text-slate-800">{new Date(selectedOs.createdAt).toLocaleString('pt-BR')}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Status Atual</span>
          <span className="font-bold text-slate-900">{selectedOs.status}</span>
        </div>
      </div>

      {/* Client & Printer Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]`}>
          <h4 className="font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[9px]">Dados do Cliente</h4>
          {c ? (
            <div className="space-y-0.5">
              <div><b>Nome:</b> {c.name}</div>
              <div><b>CPF/CNPJ:</b> {c.document || 'N/A'}</div>
              <div><b>Telefone:</b> {c.phone}</div>
              <div><b>Endereço:</b> {c.address}</div>
            </div>
          ) : (
            <div>Cliente não encontrado</div>
          )}
        </div>
        <div className={`p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]`}>
          <h4 className="font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[9px]">Equipamento</h4>
          {p ? (
            <div className="space-y-0.5">
              <div><b>Equipamento:</b> {p.brand} {p.model}</div>
              <div><b>Tipo:</b> {p.type}</div>
              <div><b>S/N:</b> {p.serialNumber}</div>
              {p.observations && <div><b>Obs:</b> {p.observations}</div>}
            </div>
          ) : (
            <div>Impressora não encontrada</div>
          )}
        </div>
      </div>

      {/* Defect & Diagnosis */}
      <div className="space-y-3">
        <div className={`p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]`}>
          <h4 className="font-bold text-slate-800 mb-1 uppercase tracking-wider text-[9px]">Defeito Relatado</h4>
          <p>{selectedOs.reportedDefect}</p>
        </div>
        {selectedOs.diagnosis && (
          <div className={`p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px]`}>
            <h4 className="font-bold text-blue-900 mb-1 uppercase tracking-wider text-[9px]">Diagnóstico Técnico & Solução</h4>
            <p className="mb-1"><b>Diagnóstico:</b> {selectedOs.diagnosis}</p>
            <p><b>Solução:</b> {selectedOs.solution}</p>
          </div>
        )}
      </div>

      {/* Parts & Totals */}
      {selectedOs.usedParts.length > 0 && (
        <div className="space-y-2 text-[11px]">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[9px]">Peças e Componentes Aplicados</h4>
          <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-1.5 px-2">Item</th>
                <th className="p-1.5 px-2 text-center">Qtd</th>
                <th className="p-1.5 px-2 text-right">Unitário</th>
                <th className="p-1.5 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedOs.usedParts.map((part: any, idx: number) => (
                <tr key={idx}>
                  <td className="p-1.5 px-2">{part.productName}</td>
                  <td className="p-1.5 px-2 text-center">{part.quantity}</td>
                  <td className="p-1.5 px-2 text-right">R$ {part.unitPrice.toFixed(2)}</td>
                  <td className="p-1.5 px-2 text-right font-bold">R$ {part.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={`flex justify-end pt-3 border-t border-slate-200 text-[11px]`}>
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between">
            <span>Peças:</span>
            <span>{isFailed ? 'R$ 0,00' : `R$ ${selectedOs.partsCost.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between">
            <span>Mão de Obra:</span>
            <span>{isFailed ? 'R$ 0,00' : `R$ ${selectedOs.laborCost.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
            <span>Total Geral:</span>
            <span>{isFailed ? 'R$ 0,00' : `R$ ${selectedOs.totalAmount.toFixed(2)}`}</span>
          </div>
          {selectedOs.paid && (
            <div className="text-center font-bold text-emerald-600 pt-1.5 text-[10px]">
              PAGO VIA {selectedOs.paymentMethod?.toUpperCase()} em {new Date(selectedOs.paidAt || selectedOs.createdAt).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-4 text-[9px] text-slate-500 border-t border-slate-200 leading-tight">
        {companySettings.printFooter}
        <div className="mt-2 font-semibold text-slate-700">ASSINATURA DO CLIENTE: _____________________________________________________</div>
      </div>
    </div>
  );
}

function ThermalReceiptContent({ selectedOs, companySettings, clients, printers, viaLabel }: any) {
  const c = clients.find((x: any) => x.id === selectedOs.clientId);
  const p = printers.find((x: any) => x.id === selectedOs.printerId);
  const isFailed = selectedOs.status === 'Sem Conserto' || selectedOs.status === 'Orçamento Não Aprovado' || (selectedOs.status === 'Entregues' && !selectedOs.paid);
  const emissionDate = selectedOs.paidAt
    ? new Date(selectedOs.paidAt).toLocaleString('pt-BR')
    : new Date().toLocaleString('pt-BR');

  return (
    <div className="text-black bg-white mx-auto p-1" style={{ width: '74mm', fontFamily: "'Courier New', Courier, monospace", fontSize: '11px', lineHeight: '1.3' }}>
      {viaLabel && (
        <div className="text-center font-bold text-[10px] uppercase mb-1.5 tracking-wider border-b border-black pb-0.5">
          [ {viaLabel} ]
        </div>
      )}

      {/* 1. Cabeçalho */}
      <div className="text-center pb-2 border-b border-black border-dashed mb-2">
        {companySettings.logoUrl && (
          <img
            src={companySettings.logoUrl}
            alt="Logo"
            className="max-w-[110px] max-h-[50px] mx-auto mb-1 object-contain grayscale"
            style={{ filter: 'grayscale(100%) brightness(0.8)' }}
          />
        )}
        <h1 className="font-bold text-xs uppercase">{companySettings.tradeName}</h1>
        {companySettings.address && <p className="text-[10px]">{companySettings.address}</p>}
        {companySettings.cnpj && <p className="text-[10px]">CNPJ: {companySettings.cnpj}</p>}
        {companySettings.phone && <p className="text-[10px]">Tel: {companySettings.phone}</p>}
        <p className="text-[10px] mt-1 font-semibold">Data/Hora: {emissionDate}</p>
      </div>

      {/* 2. Dados da Ordem de Serviço */}
      <div className="mb-2 pb-1 border-b border-black border-dashed">
        <div className="font-bold text-xs">OS N°: {selectedOs.osNumber}</div>
      </div>

      {/* 3. Dados do Cliente */}
      <div className="mb-2 pb-1 border-b border-black border-dashed">
        <h2 className="font-bold uppercase text-[10px] mb-0.5">Dados do Cliente</h2>
        <div><span className="font-semibold">Nome:</span> {c ? c.name : 'N/A'}</div>
        <div><span className="font-semibold">Tel:</span> {c ? c.phone : 'N/A'}</div>
        {c?.document && <div><span className="font-semibold">CPF/CNPJ:</span> {c.document}</div>}
      </div>

      {/* 4. Dados do Equipamento */}
      <div className="mb-2 pb-1 border-b border-black border-dashed">
        <h2 className="font-bold uppercase text-[10px] mb-0.5">Equipamento</h2>
        <div><span className="font-semibold">Modelo:</span> {p ? `${p.brand} ${p.model}` : 'N/A'}</div>
        <div><span className="font-semibold">N° de Série:</span> {p ? p.serialNumber : 'N/A'}</div>
      </div>

      {/* 5. Serviço Realizado & Valores */}
      <div className="mb-2 pb-1 border-b border-black border-dashed">
        <h2 className="font-bold uppercase text-[10px] mb-0.5">Serviço / Valores</h2>
        <div className="mb-1">
          <span className="font-semibold">Serviço:</span> {selectedOs.reportedDefect || 'Manutenção e Reparo'}
        </div>

        {selectedOs.usedParts && selectedOs.usedParts.length > 0 && (
          <div className="my-1.5 pt-1 border-t border-black border-dotted">
            <div className="font-semibold text-[10px] mb-0.5">Peças Trocadas:</div>
            {selectedOs.usedParts.map((part: any, idx: number) => (
              <div key={idx} className="flex justify-between text-[10px] pl-1">
                <span>{part.quantity}x {part.productName}</span>
                <span>R$ {part.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between text-[10px] mt-1 pt-1 border-t border-black border-dotted">
          <span>Mão de Obra:</span>
          <span>{isFailed ? 'R$ 0,00' : `R$ ${selectedOs.laborCost.toFixed(2)}`}</span>
        </div>

        <div className="flex justify-between font-bold text-xs mt-1 pt-1 border-t border-black">
          <span>VALOR TOTAL:</span>
          <span>{isFailed ? 'R$ 0,00' : `R$ ${selectedOs.totalAmount.toFixed(2)}`}</span>
        </div>

        {selectedOs.paid && (
          <div className="text-center font-bold mt-1.5 text-[10px] bg-slate-100 py-0.5 border border-black">
            PAGO VIA {selectedOs.paymentMethod?.toUpperCase() || 'DINHEIRO'}
          </div>
        )}
      </div>

      {/* 6. Texto Padrão de Garantia */}
      <div className="mb-3 pt-1 border-b border-black border-dashed pb-2 text-[10px] leading-tight text-justify">
        <div className="font-bold text-center mb-1">GARANTIA</div>
        <p>
          Este serviço possui garantia de 90 (noventa) dias, contados a partir da data de emissão deste comprovante, cobrindo exclusivamente o serviço e as peças aqui descritas.
        </p>
      </div>

      {/* 7. Texto Padrão de Assinatura */}
      <div className="pt-1 text-[10px] text-center pb-2">
        <p className="leading-tight mb-6 text-justify">
          Declaro que recebi o equipamento acima descrito, em perfeitas condições de funcionamento.
        </p>
        <div className="border-t border-black w-4/5 mx-auto mb-1"></div>
        <div className="font-semibold">Assinatura do Cliente</div>
      </div>
    </div>
  );
}
