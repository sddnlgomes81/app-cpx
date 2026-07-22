import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Clock, Search, ShieldCheck, Sparkles, RefreshCw, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, serviceOrders, activeTab, setMobileMenuOpen } = useApp();
  const [timeStr, setTimeStr] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) +
          ' ' +
          now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 800);
  };

  const pendingCount = serviceOrders.filter((os) => os.status === 'Aguardando Atendimento').length;

  const getModuleTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Principal';
      case 'atendimento-os':
        return 'Módulo de Atendimento & Ordens de Serviço';
      case 'clientes':
        return 'Cadastro e Gestão de Clientes';
      case 'impressoras':
        return 'Parque de Impressoras';
      case 'tecnica-fila':
        return 'Bancada Técnica & Fila de Equipamentos';
      case 'financeiro':
        return 'Fluxo de Caixa & Financeiro';
      case 'estoque':
        return 'Controle de Estoque, Peças e Suprimentos';
      case 'relatorios':
        return 'Relatórios Gerenciais e Exportação';
      case 'config-empresa':
        return 'Configurações da Empresa';
      case 'usuarios':
        return 'Gerenciamento de Usuários do Sistema';
      case 'backup':
        return 'Backup e Restauração de Dados';
      case 'logs':
        return 'Logs de Auditoria e Rastreabilidade';
      case 'config-senha':
        return 'Alteração de Senha';
      default:
        return 'Compatix OS';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all shrink-0"
          title="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-slate-800 text-sm sm:text-base truncate">{getModuleTitle()}</h2>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[11px] font-medium shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Firestore Realtime Sync
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
        </div>

        <button
          onClick={handleSync}
          className={`p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all ${syncing ? 'animate-spin text-blue-600' : ''}`}
          title="Sincronizar dados"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="relative">
          <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-all">
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <div className="h-6 w-[1px] bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs shadow-sm">
            {currentUser?.name.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800">{currentUser?.name}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{currentUser?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
