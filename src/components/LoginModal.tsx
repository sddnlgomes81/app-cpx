import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Shield, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login, currentUser, updateUserPassword } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = login(username, password);
    if (!res.success) {
      setError(res.error || 'Credenciais inválidas.');
    } else if (res.mustChangePassword) {
      setNeedsPasswordChange(true);
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 3) {
      setError('A nova senha deve ter pelo menos 3 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (currentUser) {
      updateUserPassword(currentUser.id, newPassword);
      setNeedsPasswordChange(false);
    }
  };

  if (currentUser && currentUser.mustChangePassword && !needsPasswordChange) {
    setNeedsPasswordChange(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-3 backdrop-blur-md border border-white/20">
            <Printer className="w-9 h-9 text-blue-200" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Compatix OS</h1>
          <p className="text-blue-200 text-sm mt-1">Sistema Integrado de Gestão e Manutenção</p>
        </div>

        <div className="p-8">
          {needsPasswordChange ? (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <span className="font-semibold block mb-1">Alteração de Senha Obrigatória</span>
                  Por motivos de segurança, você deve alterar a senha padrão (admin) no seu primeiro acesso.
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm mt-2"
                >
                  Salvar Nova Senha e Entrar
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-6 text-center">
                <h2 className="text-lg font-bold text-slate-800">Autenticação do Sistema</h2>
                <p className="text-slate-500 text-xs mt-1">Insira suas credenciais para acessar o painel</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Acesso Padrão:</span>
                  Usuário: <b>admin</b> | Senha: <b>admin</b>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin');
                  }}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700"
                >
                  Preencher
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Usuário ou E-mail
                  </label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin ou seu email"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm mt-2 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Entrar no Compatix OS
                </button>
              </form>
            </div>
          )}
        </div>
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Compatix OS v2.6 • Firebase Realtime Sync Ativo
        </div>
      </div>
    </div>
  );
};
