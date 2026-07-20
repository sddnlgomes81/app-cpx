import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Plus, Shield, UserCheck, UserX, Edit, Trash2 } from 'lucide-react';
import { UserRole, User } from '../types';
import { formatPhone } from '../utils';

export const UsuariosView: React.FC = () => {
  const { users, addUser, toggleUserStatus, updateUser, deleteUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '123',
    role: 'atendente' as UserRole,
    status: 'Ativo' as 'Ativo' | 'Inativo',
  });

  const openNewModal = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      phone: '',
      password: '123',
      role: 'atendente',
      status: 'Ativo',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setUserForm({
      name: u.name,
      email: u.email,
      phone: u.phone,
      password: u.password,
      role: u.role,
      status: u.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser({
        ...editingUser,
        ...userForm,
      });
    } else {
      addUser({
        ...userForm,
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-full">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Gerenciamento de Usuários</h2>
          <p className="text-xs text-slate-500">Cadastro de operadores do sistema, perfis e controle de acesso</p>
        </div>
        <button
          onClick={openNewModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Cadastrar Usuário
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Nome</th>
                <th className="py-3.5 px-4">E-mail</th>
                <th className="py-3.5 px-4">Telefone</th>
                <th className="py-3.5 px-4">Perfil / Função</th>
                <th className="py-3.5 px-4 text-center">Situação</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{u.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-4 text-slate-600">{u.phone}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-[10px] capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 mx-auto w-fit ${
                        u.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.status === 'Ativo' ? (
                        <>
                          <UserCheck className="w-3 h-3" /> Ativado
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3" /> Inativo
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar Usuário"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">{editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-blue-700 rounded-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">E-mail</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Telefone</label>
                <input
                  type="text"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: formatPhone(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Senha Inicial</label>
                <input
                  type="text"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Perfil</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="atendente">Atendente</option>
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Excluir Usuário */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Excluir Usuário</h3>
            <p className="text-sm text-slate-600 mb-8">
              Tem certeza que deseja excluir o usuário <strong>{userToDelete.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-xs shadow-lg shadow-red-600/25 flex-1"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
