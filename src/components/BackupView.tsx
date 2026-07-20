import React from 'react';
import { useApp } from '../context/AppContext';
import { Database, Download, Upload, CheckCircle } from 'lucide-react';

export const BackupView: React.FC = () => {
  const { serviceOrders, clients, printers, products, cashTransactions, auditLogs, restoreBackup } = useApp();

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
          alert('Backup validado e restaurado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao processar o arquivo de backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Backup & Restauração do Sistema</h2>
        <p className="text-xs text-slate-500">Exporte ou importe todos os dados do banco de dados Firestore simulado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center font-bold">
            <Download className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Exportar Backup Completo</h3>
          <p className="text-xs text-slate-500">Baixe um arquivo JSON contendo todas as OS, clientes, produtos e logs de auditoria.</p>
          <button
            onClick={handleExportBackup}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-600/20"
          >
            Baixar Arquivo de Backup
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-center">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center font-bold">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Restaurar Dados</h3>
          <p className="text-xs text-slate-500">Selecione um arquivo JSON de backup válido para restaurar o banco de dados.</p>
          <label className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer text-center">
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
    </div>
  );
};
