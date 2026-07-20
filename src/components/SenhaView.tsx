import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, Lock, CheckCircle } from 'lucide-react';

export const SenhaView: React.FC = () => {
  const { currentUser, updateUserPassword } = useApp();
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPass || newPass.length < 3) {
      setError('A senha deve ter pelo menos 3 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('As senhas não coincidem.');
      return;
    }
    if (currentUser) {
      updateUserPassword(currentUser.id, newPass);
      setSuccess(true);
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Alteração de Senha</h2>
        <p className="text-xs text-slate-500">Atualize sua senha de acesso ao Compatix OS</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> Senha alterada com sucesso!
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nova Senha</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Digite a nova senha"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Confirmar Nova Senha</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Confirme a nova senha"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4" /> Alterar Senha
        </button>
      </form>
    </div>
  );
};
