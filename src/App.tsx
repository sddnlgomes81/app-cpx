/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginModal } from './components/LoginModal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AtendimentoView } from './components/AtendimentoView';
import { TecnicaView } from './components/TecnicaView';
import { AdministracaoView } from './components/AdministracaoView';
import { FinanceiroView } from './components/FinanceiroView';
import { EstoqueView } from './components/EstoqueView';
import { RelatoriosView } from './components/RelatoriosView';
import { ConfiguracoesView } from './components/ConfiguracoesView';
import { UsuariosView } from './components/UsuariosView';
import { LogsView } from './components/LogsView';
import { BackupView } from './components/BackupView';
import { SenhaView } from './components/SenhaView';

const MainContent: React.FC = () => {
  const { currentUser, activeTab, logout } = useApp();

  React.useEffect(() => {
    if (!currentUser) return;

    let timeoutId: number;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      // 120 minutes in milliseconds
      timeoutId = window.setTimeout(() => {
        logout();
      }, 120 * 60 * 1000);
    };

    resetTimer();

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleActivity = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [currentUser, logout]);

  if (!currentUser) {
    return <LoginModal />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'atendimento-os':
      case 'clientes':
      case 'impressoras':
        return <AtendimentoView />;
      case 'tecnica-fila':
        return <TecnicaView />;
      case 'financeiro':
        return <FinanceiroView />;
      case 'estoque':
        return <EstoqueView />;
      case 'relatorios':
        return <RelatoriosView />;
      case 'config-empresa':
        return <ConfiguracoesView />;
      case 'usuarios':
        return <UsuariosView />;
      case 'backup':
        return <BackupView />;
      case 'logs':
        return <LogsView />;
      case 'config-senha':
        return <SenhaView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen print:h-auto bg-slate-100 overflow-hidden print:overflow-visible font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">{renderActiveView()}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
