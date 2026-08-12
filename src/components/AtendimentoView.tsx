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
  GripVertical,
  Clock,
  CheckSquare,
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

  const [subView, setSubView] = useState<'os' | 'concluidos' | 'clientes' | 'impressoras'>(() => {
    if (activeTab === 'impressoras') return 'impressoras';
    if (activeTab === 'clientes') return 'clientes';
    if (activeTab === 'servicos-concluidos') return 'concluidos';
    return 'os';
  });

  React.useEffect(() => {
    if (activeTab === 'impressoras') setSubView('impressoras');
    else if (activeTab === 'clientes') setSubView('clientes');
    else if (activeTab === 'servicos-concluidos') setSubView('concluidos');
    else if (activeTab === 'atendimento-os') setSubView('os');
  }, [activeTab]);

  const handleSubViewChange = (view: 'os' | 'concluidos' | 'clientes' | 'impressoras') => {
    setSubView(view);
    if (view === 'os') setActiveTab('atendimento-os');
    else if (view === 'concluidos') setActiveTab('servicos-concluidos');
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
  const [isThermalPrintModalOpen, setIsThermalPrintModalOpen] = useState(false);
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

  // Drag and drop states for Kanban
  const [draggedOsId, setDraggedOsId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const KANBAN_COLUMNS: {
    id: string;
    title: string;
    headerBg: string;
    borderCol: string;
    badgeBg: string;
    badgeText: string;
    targetStatus: ServiceOrder['status'];
    matchingStatuses: ServiceOrder['status'][];
  }[] = [
    {
      id: 'aguardando-atendimento',
      title: 'Aguardando Atendimento',
      headerBg: 'bg-amber-500 text-white',
      borderCol: 'border-amber-200 bg-amber-50/20',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-900',
      targetStatus: 'Aguardando Atendimento',
      matchingStatuses: ['Aguardando Atendimento'],
    },
    {
      id: 'aguardando-orcamento',
      title: 'Aguardando Orçamento',
      headerBg: 'bg-purple-600 text-white',
      borderCol: 'border-purple-200 bg-purple-50/20',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-900',
      targetStatus: 'Aguardando Orçamento',
      matchingStatuses: ['Aguardando Orçamento', 'Aguardando Aprovação', 'Em Manutenção'],
    },
    {
      id: 'orcamento-aprovado',
      title: 'Orçamento Aprovado',
      headerBg: 'bg-indigo-600 text-white',
      borderCol: 'border-indigo-200 bg-indigo-50/20',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-900',
      targetStatus: 'Orçamento Aprovado',
      matchingStatuses: ['Orçamento Aprovado', 'Finalizada'],
    },
    {
      id: 'orcamento-reprovado',
      title: 'Orçamento Reprovado',
      headerBg: 'bg-red-600 text-white',
      borderCol: 'border-red-200 bg-red-50/20',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-900',
      targetStatus: 'Orçamento Não Aprovado',
      matchingStatuses: ['Orçamento Não Aprovado', 'Sem Conserto', 'Cancelada'],
    },
    {
      id: 'concluido',
      title: 'Concluído',
      headerBg: 'bg-emerald-600 text-white',
      borderCol: 'border-emerald-200 bg-emerald-50/20',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-900',
      targetStatus: 'Entregues',
      matchingStatuses: ['Concluído', 'Entregues'],
    },
  ];

  const handleDragStart = (e: React.DragEvent, osId: string) => {
    e.dataTransfer.setData('text/plain', osId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedOsId(osId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverColumnId(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ServiceOrder['status']) => {
    e.preventDefault();
    const osId = e.dataTransfer.getData('text/plain') || draggedOsId;
    if (osId) {
      updateServiceOrder(osId, { status: targetStatus });
    }
    setDraggedOsId(null);
    setDragOverColumnId(null);
  };

  // Filtered lists
  const activeOsList = serviceOrders.filter((os) => !['Entregues', 'Concluído'].includes(os.status));
  const concludedOsList = serviceOrders.filter((os) => {
    const isConcluded = ['Entregues', 'Concluído'].includes(os.status);
    if (!isConcluded) return false;
    if (!searchTerm.trim()) return true;

    const client = clients.find((c) => c.id === os.clientId);
    const printer = printers.find((p) => p.id === os.printerId);
    const query = searchTerm.toLowerCase();

    return (
      os.osNumber.toLowerCase().includes(query) ||
      (client && client.name.toLowerCase().includes(query)) ||
      (printer && (printer.model.toLowerCase().includes(query) || printer.brand.toLowerCase().includes(query))) ||
      os.reportedDefect.toLowerCase().includes(query)
    );
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
      setIsThermalPrintModalOpen(true);
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
    <div className="p-4 sm:p-8 bg-slate-50 min-h-full print:p-0 print:bg-transparent">
      <div className="space-y-6 print:hidden">
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
            Ordens de Serviço ({activeOsList.length})
          </button>
          <button
            onClick={() => handleSubViewChange('concluidos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              subView === 'concluidos' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Serviços Concluídos ({concludedOsList.length})
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por número OS, cliente, modelo de impressora ou defeito..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* SubView: Ordens de Serviço (Kanban Flowchart) */}
      {subView === 'os' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-6 custom-scrollbar">
          {KANBAN_COLUMNS.map((col) => {
            const colOs = serviceOrders.filter((os) => {
              const matchesStatus = col.matchingStatuses.includes(os.status);
              if (!matchesStatus) return false;

              if (!searchTerm.trim()) return true;

              const client = clients.find((c) => c.id === os.clientId);
              const printer = printers.find((p) => p.id === os.printerId);
              const query = searchTerm.toLowerCase();

              return (
                os.osNumber.toLowerCase().includes(query) ||
                (client && client.name.toLowerCase().includes(query)) ||
                (printer && (printer.model.toLowerCase().includes(query) || printer.brand.toLowerCase().includes(query))) ||
                os.reportedDefect.toLowerCase().includes(query)
              );
            });

            const isDragOver = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.targetStatus)}
                className={`flex flex-col rounded-2xl border transition-all min-w-[250px] bg-slate-100/70 shadow-2xs ${
                  isDragOver ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/50' : 'border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className={`p-3 rounded-t-2xl border-b font-bold text-xs flex items-center justify-between ${col.headerBg}`}>
                  <span className="truncate pr-2">{col.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${col.badgeBg} ${col.badgeText}`}>
                    {colOs.length}
                  </span>
                </div>

                {/* Cards Dropzone */}
                <div className="p-3 space-y-3 min-h-[460px] flex-1 flex flex-col">
                  {colOs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white/40">
                      <FileText className="w-6 h-6 mb-1 opacity-40" />
                      <span className="text-[11px] font-medium">Nenhuma OS</span>
                    </div>
                  ) : (
                    colOs.map((os) => {
                      const client = clients.find((c) => c.id === os.clientId);
                      const printer = printers.find((p) => p.id === os.printerId);
                      const isDraggingThis = draggedOsId === os.id;

                      return (
                        <div
                          key={os.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, os.id)}
                          onDragEnd={() => {
                            setDraggedOsId(null);
                            setDragOverColumnId(null);
                          }}
                          onClick={() => {
                            setSelectedOs(os);
                            setIsOsDetailsModalOpen(true);
                          }}
                          className={`p-3.5 bg-white hover:bg-slate-50/90 border rounded-xl shadow-2xs cursor-grab active:cursor-grabbing transition-all space-y-2.5 hover:shadow-md hover:border-blue-400 ${
                            isDraggingThis ? 'opacity-40 border-dashed border-blue-400' : 'border-slate-200'
                          }`}
                        >
                          {/* Top Row: OS Number & Priority */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-extrabold text-xs text-blue-600 flex items-center gap-1">
                              <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              {os.osNumber}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                os.priority === 'Urgente'
                                  ? 'bg-red-100 text-red-700'
                                  : os.priority === 'Alta'
                                  ? 'bg-amber-100 text-amber-700'
                                  : os.priority === 'Média'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {os.priority}
                            </span>
                          </div>

                          {/* Middle Info */}
                          <div className="space-y-1 text-xs">
                            <div className="font-bold text-slate-800 line-clamp-1" title={client?.name}>
                              {client?.name || 'Cliente N/D'}
                            </div>
                            <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium line-clamp-1">
                              <PrinterIcon className="w-3 h-3 text-slate-400 shrink-0" />
                              {printer ? `${printer.brand} ${printer.model}` : 'Impressora N/D'}
                            </div>
                          </div>

                          {/* Bottom Info: Date & Amount */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 text-[10px]">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              {new Date(os.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="font-extrabold text-xs text-slate-900">
                              {os.totalAmount > 0 ? `R$ ${os.totalAmount.toFixed(2)}` : 'A definir'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SubView: Serviços Concluídos (Lista) */}
      {subView === 'concluidos' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-sm">Serviços Concluídos</h2>
            </div>
            <span className="text-xs text-slate-300 font-medium bg-slate-800 px-3 py-1 rounded-full">
              Total de concluídos: {concludedOsList.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Nº OS</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Impressora</th>
                  <th className="py-3.5 px-4">Data Entrada / Conclusão</th>
                  <th className="py-3.5 px-4">Valor Total</th>
                  <th className="py-3.5 px-4">Status Pagamento</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {concludedOsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nenhum serviço concluído encontrado.
                    </td>
                  </tr>
                ) : (
                  concludedOsList.map((os) => {
                    const client = clients.find((c) => c.id === os.clientId);
                    const printer = printers.find((p) => p.id === os.printerId);
                    const dateVal = os.deliveredAt || os.paidAt || os.updatedAt || os.createdAt;

                    return (
                      <tr key={os.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{os.osNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{client?.name || 'Cliente N/D'}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {printer ? `${printer.brand} ${printer.model}` : 'Impressora N/D'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div>Entrada: {new Date(os.createdAt).toLocaleDateString('pt-BR')}</div>
                          <div className="text-[10px] text-slate-400">Conclusão: {new Date(dateVal).toLocaleDateString('pt-BR')}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          R$ {os.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          {os.paid ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                              Pago ({os.paymentMethod || 'Sim'})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold">
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedOs(os);
                                setIsOsDetailsModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                              title="Ver Detalhes da OS"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOs(os);
                                setIsPrintModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                              title="Imprimir Comprovante A4"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
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
      </div>

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

            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-2"
                  title="Imprimir Comprovante A4"
                >
                  <Printer className="w-4 h-4" /> Comprovante OS
                </button>
                {selectedOs.paid && (
                  <button
                    onClick={() => setIsThermalPrintModalOpen(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-slate-900/20"
                    title="Imprimir Cupom Térmico"
                  >
                    <Printer className="w-4 h-4" /> Cupom de Pagamento
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {selectedOs.status === 'Aguardando Aprovação' && currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setOsForApproval(selectedOs);
                      setIsApproveModalOpen(true);
                      setIsOsDetailsModalOpen(false);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                    title="Aprovar Orçamento"
                  >
                    <CheckCircle className="w-4 h-4" /> Aprovar Orçamento
                  </button>
                )}
                {selectedOs.status === 'Finalizada' && !selectedOs.paid && selectedOs.totalAmount > 0 && (
                  <button
                    onClick={() => {
                      setIsPaymentModalOpen(true);
                      setIsOsDetailsModalOpen(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                    title="Receber Pagamento"
                  >
                    <DollarSign className="w-4 h-4" /> Receber Pagamento
                  </button>
                )}
                {selectedOs.paid && (
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-bold">
                    Pago ({selectedOs.paymentMethod})
                  </span>
                )}
                {((selectedOs.status === 'Finalizada' && (selectedOs.paid || selectedOs.totalAmount === 0)) || selectedOs.status === 'Sem Conserto' || selectedOs.status === 'Orçamento Não Aprovado') && (
                  <button
                    onClick={() => {
                      setOsForDeliveryConfirmation(selectedOs);
                      setIsOsDetailsModalOpen(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                    title="Finalizar Entrega"
                  >
                    <Truck className="w-4 h-4" /> Finalizar Entrega
                  </button>
                )}
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
                <ReceiptContent selectedOs={selectedOs} companySettings={companySettings} clients={clients} printers={printers} />
              </div>
            </div>
          </div>

          {/* Versão de Impressão (print-only) - 1 Via A4 */}
          <div className="print-only print-content bg-white">
            <style>{`
              @media print {
                @page {
                  size: A4;
                  margin: 15mm;
                }
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .print-content {
                  width: 100% !important;
                  height: auto !important;
                  position: relative !important;
                }
              }
            `}</style>
            
            <div className="p-6">
              <ReceiptContent selectedOs={selectedOs} companySettings={companySettings} clients={clients} printers={printers} isPrintView />
            </div>
          </div>
        </>
      )}

      {/* Modal: Comprovante de Pagamento (Térmico 80mm) */}
      {isThermalPrintModalOpen && selectedOs && (
        <>
          {/* Tela (no-print) */}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 no-print">
            <div className="w-full max-w-sm bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-base">Comprovante de Pagamento</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Imprimir
                  </button>
                  <button onClick={() => setIsThermalPrintModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto flex-1 flex justify-center">
                <div className="bg-white shadow-md border border-slate-200">
                  <ThermalReceiptContent selectedOs={selectedOs} companySettings={companySettings} clients={clients} printers={printers} />
                </div>
              </div>
            </div>
          </div>

          {/* Versão de Impressão (print-only) - Térmica 80mm */}
          <div className="print-only thermal-print-content bg-white">
            <style>{`
              @media print {
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 80mm !important;
                }
                .thermal-print-content {
                  width: 80mm !important;
                }
              }
            `}</style>
            <ThermalReceiptContent selectedOs={selectedOs} companySettings={companySettings} clients={clients} printers={printers} />
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

      <div className="text-center pt-4 text-[10px] text-slate-600 border-t border-slate-200 leading-relaxed max-w-4xl mx-auto space-y-4">
        {companySettings.printFooter && <div className="mb-2">{companySettings.printFooter}</div>}
        
        <div className="text-justify font-medium space-y-2">
          <div className="font-bold text-center mb-1 uppercase tracking-wider text-slate-800">Garantia</div>
          <p>
            O serviço prestado possui garantia de 90 (noventa) dias corridos,
            contados a partir da data de emissão deste comprovante.
          </p>
          <p>
            A garantia cobre exclusivamente o serviço executado e as peças
            substituídas, descritos neste documento, e é válida somente em
            caso de defeito relacionado ao serviço realizado.
          </p>
          <p>
            A garantia não cobre danos causados por mau uso, quedas, contato
            com líquidos, oscilação de energia elétrica, uso de suprimentos
            não recomendados ou intervenção técnica de terceiros após a
            realização deste serviço.
          </p>
          <p>
            Para acionar a garantia, o cliente deve apresentar este comprovante.
          </p>
        </div>

        <div className="text-justify font-medium mt-6 border-t border-slate-200 pt-4">
          <div className="font-bold text-center mb-2 uppercase tracking-wider text-slate-800">Aviso Sobre Retirada do Equipamento</div>
          <p className="mb-2">
            Após a comunicação do orçamento, o cliente terá o prazo de 10 (dez) dias corridos para retirar a impressora, 
            caso o orçamento não seja aprovado.
          </p>
          <p className="mb-2">
            Após esse prazo, será cobrada uma taxa de R$ 10,00 (dez reais) por dia de permanência do equipamento em nossas dependências.
          </p>
          <p className="mb-2">
            Caso o equipamento não seja retirado no prazo máximo de 90 (noventa) dias, contados a partir da data de comunicação do orçamento, 
            a impressora poderá ser descartada, sem direito a reclamação ou devolução de valores.
          </p>
          <p>
            Ao deixar o equipamento para avaliação, o cliente declara estar ciente e de acordo com estas condições.
          </p>
        </div>
        <div className="mt-8 pb-4 flex justify-center">
          <div className="w-80 border-t border-slate-800 pt-1 text-center font-bold text-slate-800">
            Assinatura do Cliente
          </div>
        </div>
      </div>
    </div>
  );
}

function ThermalReceiptContent({ selectedOs, companySettings, clients, printers }: any) {
  const c = clients.find((x: any) => x.id === selectedOs.clientId);
  const p = printers.find((x: any) => x.id === selectedOs.printerId);

  return (
    <div className="w-[80mm] bg-white text-black font-mono text-[11px] leading-tight p-2 mx-auto">
      {/* 1. Cabeçalho */}
      <div className="text-center mb-4">
        {companySettings.logoUrl && (
          <img src={companySettings.logoUrl} alt="Logo" className="max-w-[120px] max-h-[60px] mx-auto mb-2 object-contain grayscale" />
        )}
        <div className="font-bold text-[13px]">{companySettings.tradeName}</div>
        <div>{companySettings.address}</div>
        <div>CNPJ: {companySettings.cnpj}</div>
        <div>Tel: {companySettings.phone}</div>
        <div className="mt-2 text-[10px]">Emissão: {new Date().toLocaleString('pt-BR')}</div>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      <div className="text-center font-bold text-[13px] mb-2 uppercase">
        Comprovante de Pagamento
        <br />
        OS Nº {selectedOs.osNumber}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* 2. Dados do cliente */}
      <div className="mb-2">
        <div className="font-bold">CLIENTE:</div>
        <div>{c?.name || 'Não informado'}</div>
        <div>Tel: {c?.phone || 'Não informado'}</div>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* 3. Dados do equipamento */}
      <div className="mb-2">
        <div className="font-bold">EQUIPAMENTO:</div>
        <div>{p?.brand} {p?.model}</div>
        <div>S/N: {p?.serialNumber || 'N/A'}</div>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* 4. Valores */}
      <div className="mb-2">
        <div className="font-bold mb-1">VALORES:</div>
        {selectedOs.usedParts && selectedOs.usedParts.length > 0 && (
          <div className="mb-1">
            <div className="underline mb-0.5">Peças/Componentes:</div>
            {selectedOs.usedParts.map((part: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span className="truncate pr-1">{part.quantity}x {part.productName}</span>
                <span>R${part.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between mt-1 pt-1 border-t border-dotted border-black">
          <span>Mão de Obra:</span>
          <span>R${selectedOs.laborCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-extrabold text-[15px] mt-2 pt-1 border-t border-black">
          <span>TOTAL:</span>
          <span>R${selectedOs.totalAmount.toFixed(2)}</span>
        </div>
        {selectedOs.paid && (
          <div className="text-center font-bold text-[11px] mt-2">
            PAGO VIA {selectedOs.paymentMethod?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-3"></div>

      {/* 5. Termo de garantia */}
      <div className="mt-4 p-2 border-2 border-black text-center font-bold">
        <div className="text-[13px] mb-2 uppercase">Garantia</div>
        <div className="text-[11px] uppercase text-justify leading-tight">
          O serviço prestado possui garantia de 90 (noventa) dias
          corridos, contados a partir da data de emissão deste
          comprovante.
          <br /><br />
          A garantia cobre exclusivamente o serviço executado e as
          peças substituídas, descritos neste documento.
        </div>
      </div>
      
      <div className="text-center text-[9px] mt-4">
        Obrigado pela preferência!
      </div>
    </div>
  );
}

