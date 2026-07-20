import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Headphones,
  Wrench,
  DollarSign,
  Package,
  FileText,
  Settings,
  Building,
  Users,
  Database,
  ScrollText,
  KeyRound,
  LogOut,
  Printer as PrinterIcon,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, logout, currentUser } = useApp();

  const menuSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'MÓDULO ATENDIMENTO',
      items: [
        { id: 'atendimento-os', label: 'Ordens de Serviço', icon: Headphones },
        { id: 'clientes', label: 'Clientes', icon: Users },
        { id: 'impressoras', label: 'Impressoras', icon: PrinterIcon },
      ],
    },
    {
      title: 'ÁREA TÉCNICA',
      items: [
        { id: 'tecnica-fila', label: 'Bancada & Fila', icon: Wrench },
      ],
    },
    {
      title: 'FINANCEIRO & ESTOQUE',
      items: [
        { id: 'financeiro', label: 'Fluxo de Caixa', icon: DollarSign },
        { id: 'estoque', label: 'Produtos & Peças', icon: Package },
      ],
    },
    {
      title: 'GESTÃO & ADMIN',
      items: [
        { id: 'relatorios', label: 'Relatórios & Export', icon: FileText },
        { id: 'config-empresa', label: 'Empresa', icon: Building },
        { id: 'usuarios', label: 'Usuários', icon: Users },
        { id: 'backup', label: 'Backup do Sistema', icon: Database },
        { id: 'logs', label: 'Logs de Auditoria', icon: ScrollText },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 bg-slate-950 border-b border-slate-800">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <PrinterIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-sm">Compatix OS</h1>
          <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">Service Edition</span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 tracking-wider">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isAdminOnly = section.title === 'GESTÃO & ADMIN';
                const disabled = isAdminOnly && currentUser?.role !== 'admin';

                return (
                  <button
                    key={item.id}
                    onClick={() => !disabled && setActiveTab(item.id)}
                    disabled={disabled}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      disabled
                        ? 'opacity-30 cursor-not-allowed'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive && !disabled ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && !disabled && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
              {currentUser?.name.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{currentUser?.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{currentUser?.role}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('config-senha')}
            className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            Senha
          </button>
          <button
            onClick={logout}
            className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            title="Sair do Sistema"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
};
