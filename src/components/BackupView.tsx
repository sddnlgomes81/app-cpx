import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  Download,
  Upload,
  CheckCircle,
  Cloud,
  CloudLightning,
  CloudOff,
  RefreshCw,
  Copy,
  Check,
  Info,
  AlertTriangle,
  Play
} from 'lucide-react';

export const BackupView: React.FC = () => {
  const {
    serviceOrders,
    clients,
    printers,
    products,
    cashTransactions,
    auditLogs,
    restoreBackup,
    supabaseStatus,
    isSyncing,
    lastSyncTime,
    syncError,
    autoSync,
    setAutoSync,
    pushDataToCloud,
    pullDataFromCloud,
    checkSupabaseReady,
  } = useApp();

  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [localMessage, setLocalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportBackup = () => {
    const backupData = {
      version: '2.6',
      exportDate: new Date().toISOString(),
      serviceOrders,
      clients,
      printers,
      products,
      cashTransactions,
      auditLogs,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `compatix_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.version) {
          restoreBackup(json);
          setLocalMessage({ type: 'success', text: 'Backup local validado e restaurado com sucesso!' });
        } else {
          setLocalMessage({ type: 'error', text: 'Arquivo de backup local inválido.' });
        }
      } catch (err) {
        setLocalMessage({ type: 'error', text: 'Erro ao processar o arquivo de backup local.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePush = async () => {
    setLocalMessage(null);
    const success = await pushDataToCloud();
    if (success) {
      setLocalMessage({ type: 'success', text: 'Dados locais enviados para o Supabase com sucesso!' });
    } else {
      setLocalMessage({ type: 'error', text: 'Erro ao enviar dados para a nuvem.' });
    }
  };

  const handlePull = async () => {
    if (!window.confirm('Atenção: Baixar os dados do Supabase irá substituir os dados locais atuais. Deseja continuar?')) {
      return;
    }
    setLocalMessage(null);
    const success = await pullDataFromCloud();
    if (success) {
      setLocalMessage({ type: 'success', text: 'Dados importados do Supabase com sucesso!' });
    } else {
      setLocalMessage({ type: 'error', text: 'Erro ao baixar dados da nuvem.' });
    }
  };

  const handleCheckConnection = async () => {
    setLocalMessage(null);
    await checkSupabaseReady();
    setLocalMessage({ type: 'success', text: 'Status da conexão atualizado.' });
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Nunca';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR');
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full max-w-4xl mx-auto pb-16">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Gerenciamento de Dados & Banco de Dados</h2>
          <p className="text-xs text-slate-500 mt-1">Efetue backups locais ou sincronize diretamente com seu banco de dados Supabase em tempo real.</p>
        </div>
        
        {/* Connection status badge */}
        <div className="flex items-center gap-2">
          {supabaseStatus?.connected ? (
            supabaseStatus.tablesReady ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                <Cloud className="w-3.5 h-3.5" />
                Supabase Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                Tabelas Ausentes
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
              <CloudOff className="w-3.5 h-3.5" />
              Supabase Desconectado
            </span>
          )}
        </div>
      </div>

      {localMessage && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 animate-fade-in ${
          localMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <Info className="w-4 h-4 shrink-0" />
          <span className="flex-1 font-medium">{localMessage.text}</span>
          {syncError && <span className="font-mono text-[10px] bg-white px-2 py-1 rounded border border-rose-100">{syncError}</span>}
          <button onClick={() => setLocalMessage(null)} className="hover:opacity-70 font-bold px-1">✕</button>
        </div>
      )}

      {/* Supabase Sync Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <CloudLightning className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Sincronização em Nuvem (Supabase)</h3>
              <p className="text-xs text-slate-500">Mantenha seu Compatix OS sincronizado em múltiplos computadores.</p>
            </div>
          </div>
          <button
            onClick={handleCheckConnection}
            className="self-start sm:self-center px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Recarregar Conexão
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Última Sincronização</span>
              <p className="text-xs font-semibold text-slate-700">{formatDate(lastSyncTime)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modo Sincronismo</span>
              <p className="text-xs font-semibold text-slate-700">{autoSync ? 'Automático (Debounced)' : 'Manual'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Projeto Supabase</span>
              <p className="text-xs font-mono text-blue-600 font-semibold truncate" title="ljvpmggqytwruznhxkwy">ljvpmggqytwruznhxkwy</p>
            </div>
          </div>

          {/* Sync operations */}
          {supabaseStatus?.tablesReady ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handlePush}
                  disabled={isSyncing}
                  className="w-full sm:flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/15 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Enviar Dados Locais para Nuvem (Push)
                </button>
                <button
                  onClick={handlePull}
                  disabled={isSyncing}
                  className="w-full sm:flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-950 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Baixar Dados da Nuvem para Local (Pull)
                </button>
              </div>

              {/* Auto sync toggle */}
              <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800">Sincronização em Tempo Real</h4>
                  <p className="text-[11px] text-slate-500">Salva automaticamente todas as alterações locais no Supabase em segundo plano de forma inteligente.</p>
                </div>
                <button
                  onClick={() => setAutoSync(!autoSync)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoSync ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoSync ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ) : supabaseStatus?.connected ? (
            /* Tables Missing State */
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-4">
              <div className="flex gap-3 text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold">Configuração Inicial Necessária</h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    A conexão com o Supabase foi estabelecida com sucesso, mas as tabelas do Compatix OS ainda não existem no seu banco de dados. 
                    Por favor, copie o script SQL abaixo e execute-o no <strong>SQL Editor</strong> dentro do painel do seu Supabase.
                  </p>
                </div>
              </div>

              {/* SQL script area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Script SQL de Instalação (PostgreSQL)</span>
                  <button
                    onClick={copySqlToClipboard}
                    className="flex items-center gap-1.5 py-1 px-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-xl overflow-x-auto max-h-48 custom-scrollbar">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          ) : (
            /* Disconnected State info */
            <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200">
              <div className="flex gap-3 text-rose-800">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold">Sem Comunicação com o Supabase</h4>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    Não foi possível conectar ao projeto do Supabase. Verifique se o seu URL e sua Chave de API anônima estão devidamente configurados nas configurações de variáveis de ambiente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Local backup controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 bg-blue-50/50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center font-bold">
            <Download className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-xs">Exportar Backup Local (JSON)</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Baixe instantaneamente um backup consolidado de todas as OS, clientes e logs em arquivo local.</p>
          </div>
          <button
            onClick={handleExportBackup}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Exportar Arquivo Local
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 bg-emerald-50/50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center font-bold">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-xs">Restaurar de Backup Local</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Selecione e envie um arquivo JSON exportado previamente para recuperar seu banco de dados local.</p>
          </div>
          <label className="block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer text-center transition-colors">
            Selecionar Arquivo JSON
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Accordion always available to view/copy SQL script */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowSqlSchema(!showSqlSchema)}
          className="w-full p-6 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Script de Instalação SQL (Caso precise rodar manualmente)</h4>
              <p className="text-[11px] text-slate-500">Veja ou copie o script completo de criação das tabelas para o SQL Editor do Supabase.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 hover:underline">
            {showSqlSchema ? 'Ocultar Código SQL' : 'Mostrar Código SQL'}
          </span>
        </button>

        {showSqlSchema && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4 animate-fade-in">
            <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-2xl space-y-1.5 leading-relaxed">
              <h5 className="font-bold">Como Executar no Supabase:</h5>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Acesse o painel do seu projeto no <strong>Supabase</strong> (https://supabase.com).</li>
                <li>No menu lateral esquerdo, clique em <strong>SQL Editor</strong> (ícone de terminal/código).</li>
                <li>Clique em <strong>New Query</strong> (Nova Consulta) no topo.</li>
                <li>Cole o código SQL abaixo no editor de texto grande.</li>
                <li>Clique no botão <strong>Run</strong> (Executar) no canto inferior direito do editor.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Código SQL do Banco de Dados</span>
                <button
                  onClick={copySqlToClipboard}
                  className="flex items-center gap-1.5 py-1 px-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-xl overflow-x-auto max-h-72 custom-scrollbar">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Complete schema generator script
const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- SCRIPT DE INSTALAÇÃO DO COMPATIX OS
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- 1. Criação das Tabelas Principais

CREATE TABLE IF NOT EXISTS compatix_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  password TEXT,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  "mustChangePassword" BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS compatix_clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS compatix_printers (
  id TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  "serialNumber" TEXT NOT NULL,
  type TEXT NOT NULL,
  observations TEXT,
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS compatix_products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  "costPrice" NUMERIC NOT NULL,
  "salePrice" NUMERIC NOT NULL,
  "stockQty" INTEGER NOT NULL,
  "minStock" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS compatix_service_orders (
  id TEXT PRIMARY KEY,
  "osNumber" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "printerId" TEXT NOT NULL,
  "reportedDefect" TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  "attendantId" TEXT NOT NULL,
  "technicianId" TEXT,
  diagnosis TEXT,
  solution TEXT,
  "usedParts" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "laborCost" NUMERIC NOT NULL,
  "partsCost" NUMERIC NOT NULL,
  "totalAmount" NUMERIC NOT NULL,
  "quoteApproved" BOOLEAN,
  "warrantyDays" INTEGER,
  "paymentMethod" TEXT,
  paid BOOLEAN NOT NULL DEFAULT false,
  "paidAt" TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  "deliveredAt" TEXT
);

CREATE TABLE IF NOT EXISTS compatix_cash_transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "osId" TEXT,
  "userId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS compatix_audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  operation TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS compatix_company_settings (
  id TEXT PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "tradeName" TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  "logoUrl" TEXT NOT NULL,
  "printHeader" TEXT NOT NULL,
  "printFooter" TEXT NOT NULL
);

-- 2. Habilitação de Segurança e Criação de Políticas Públicas de Acesso (RLS)

ALTER TABLE compatix_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatix_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatix_printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatix_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatix_service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatix_cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatix_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatix_company_settings ENABLE ROW LEVEL SECURITY;

-- Usuários
DROP POLICY IF EXISTS "Acesso Publico Users" ON compatix_users;
CREATE POLICY "Acesso Publico Users" ON compatix_users FOR ALL USING (true) WITH CHECK (true);

-- Clientes
DROP POLICY IF EXISTS "Acesso Publico Clients" ON compatix_clients;
CREATE POLICY "Acesso Publico Clients" ON compatix_clients FOR ALL USING (true) WITH CHECK (true);

-- Impressoras
DROP POLICY IF EXISTS "Acesso Publico Printers" ON compatix_printers;
CREATE POLICY "Acesso Publico Printers" ON compatix_printers FOR ALL USING (true) WITH CHECK (true);

-- Produtos
DROP POLICY IF EXISTS "Acesso Publico Products" ON compatix_products;
CREATE POLICY "Acesso Publico Products" ON compatix_products FOR ALL USING (true) WITH CHECK (true);

-- Ordens de Serviço
DROP POLICY IF EXISTS "Acesso Publico OS" ON compatix_service_orders;
CREATE POLICY "Acesso Publico OS" ON compatix_service_orders FOR ALL USING (true) WITH CHECK (true);

-- Caixa / Transações
DROP POLICY IF EXISTS "Acesso Publico Caixa" ON compatix_cash_transactions;
CREATE POLICY "Acesso Publico Caixa" ON compatix_cash_transactions FOR ALL USING (true) WITH CHECK (true);

-- Logs de Auditoria
DROP POLICY IF EXISTS "Acesso Publico Logs" ON compatix_audit_logs;
CREATE POLICY "Acesso Publico Logs" ON compatix_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Configurações da Empresa
DROP POLICY IF EXISTS "Acesso Publico Config" ON compatix_company_settings;
CREATE POLICY "Acesso Publico Config" ON compatix_company_settings FOR ALL USING (true) WITH CHECK (true);
`;
