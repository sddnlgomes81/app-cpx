import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Client,
  Printer,
  ServiceOrder,
  Product,
  CashTransaction,
  AuditLog,
  CompanySettings,
} from '../types';
import {
  initialUsers,
  initialClients,
  initialPrinters,
  initialProducts,
  initialServiceOrders,
  initialCashTransactions,
  initialAuditLogs,
  initialCompanySettings,
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  clients: Client[];
  printers: Printer[];
  serviceOrders: ServiceOrder[];
  products: Product[];
  cashTransactions: CashTransaction[];
  auditLogs: AuditLog[];
  companySettings: CompanySettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  login: (emailOrUser: string, pass: string) => { success: boolean; error?: string; mustChangePassword?: boolean };
  logout: () => void;
  updateUserPassword: (userId: string, newPass: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  toggleUserStatus: (userId: string) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  addPrinter: (printer: Omit<Printer, 'id' | 'createdAt'>) => Printer;
  updatePrinter: (printer: Printer) => void;
  deletePrinter: (printerId: string) => void;
  addServiceOrder: (os: Omit<ServiceOrder, 'id' | 'osNumber' | 'createdAt' | 'updatedAt'>) => ServiceOrder;
  updateServiceOrder: (id: string, updates: Partial<ServiceOrder>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  addCashTransaction: (trx: Omit<CashTransaction, 'id' | 'date'>) => void;
  updateCompanySettings: (settings: CompanySettings) => void;
  addAuditLog: (operation: string, module: string, details: string) => void;
  restoreBackup: (data: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('compatix_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('compatix_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('compatix_clients_v2');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [printers, setPrinters] = useState<Printer[]>(() => {
    const saved = localStorage.getItem('compatix_printers_v2');
    return saved ? JSON.parse(saved) : initialPrinters;
  });

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('compatix_service_orders_v2');
    return saved ? JSON.parse(saved) : initialServiceOrders;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('compatix_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem('compatix_cash_v2');
    return saved ? JSON.parse(saved) : initialCashTransactions;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('compatix_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('compatix_settings');
    return saved ? JSON.parse(saved) : initialCompanySettings;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('compatix_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('compatix_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('compatix_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('compatix_clients_v2', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('compatix_printers_v2', JSON.stringify(printers));
  }, [printers]);

  useEffect(() => {
    localStorage.setItem('compatix_service_orders_v2', JSON.stringify(serviceOrders));
  }, [serviceOrders]);

  useEffect(() => {
    localStorage.setItem('compatix_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('compatix_cash_v2', JSON.stringify(cashTransactions));
  }, [cashTransactions]);

  useEffect(() => {
    localStorage.setItem('compatix_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('compatix_settings', JSON.stringify(companySettings));
  }, [companySettings]);

  // SLA de Prioridade (Dynamic Update)
  useEffect(() => {
    const checkPriorities = () => {
      setServiceOrders((prev) => {
        let hasChanges = false;
        const now = new Date().getTime();
        
        const updated = prev.map((os) => {
          // Atualiza prioridade apenas para OS que ainda não tiveram o orçamento finalizado/aprovado
          if (os.status === 'Aguardando Atendimento' || os.status === 'Aguardando Orçamento') {
            const createdTime = new Date(os.createdAt).getTime();
            const diffHours = (now - createdTime) / (1000 * 60 * 60);
            
            let newPriority: ServiceOrder['priority'] = 'Baixa';
            
            if (diffHours >= 24) {
              newPriority = 'Urgente';
            } else if (diffHours >= 12) {
              newPriority = 'Alta';
            } else if (diffHours >= 2) {
              newPriority = 'Média';
            } else {
              newPriority = 'Baixa';
            }
            
            if (newPriority !== os.priority) {
              hasChanges = true;
              return { ...os, priority: newPriority };
            }
          }
          return os;
        });
        
        return hasChanges ? updated : prev;
      });
    };

    checkPriorities();
    const interval = setInterval(checkPriorities, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const addAuditLog = (operation: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'Sistema',
      operation,
      module,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const login = (emailOrUser: string, pass: string) => {
    const found = users.find(
      (u) =>
        (u.email.toLowerCase() === emailOrUser.toLowerCase() ||
          u.name.toLowerCase().includes(emailOrUser.toLowerCase()) ||
          (emailOrUser === 'admin' && u.role === 'admin')) &&
        u.status === 'Ativo'
    );

    if (!found) {
      return { success: false, error: 'Usuário não encontrado ou inativo.' };
    }

    if (found.password !== pass) {
      return { success: false, error: 'Senha incorreta.' };
    }

    setCurrentUser(found);
    addAuditLog('Login no Sistema', 'Autenticação', `Usuário ${found.name} realizou login.`);
    return { success: true, mustChangePassword: found.mustChangePassword };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('Logout do Sistema', 'Autenticação', `Usuário ${currentUser.name} encerrou a sessão.`);
    }
    setCurrentUser(null);
  };

  const updateUserPassword = (userId: string, newPass: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, password: newPass, mustChangePassword: false };
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    addAuditLog('Alteração de Senha', 'Configurações', `Senha alterada para o usuário ID ${userId}.`);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'usr-' + Date.now(),
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog('Cadastro de Usuário', 'Usuários', `Novo usuário criado: ${newUser.name} (${newUser.role})`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'Ativo' ? 'Inativo' : 'Ativo';
          addAuditLog('Alteração Status Usuário', 'Usuários', `Usuário ${u.name} teve status alterado para ${newStatus}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const updateUser = (user: User) => {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    addAuditLog('Atualização de Usuário', 'Usuários', `Dados atualizados para o usuário: ${user.name}`);
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
    }
  };

  const deleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      addAuditLog('Exclusão de Usuário', 'Usuários', `Usuário excluído: ${userToDelete.name}`);
    }
  };

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: 'cli-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [...prev, newClient]);
    addAuditLog('Cadastro de Cliente', 'Atendimento', `Cliente cadastrado: ${newClient.name}`);
    return newClient;
  };

  const updateClient = (client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
    addAuditLog('Atualização de Cliente', 'Atendimento', `Dados atualizados para o cliente: ${client.name}`);
  };

  const deleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    setClients(prev => prev.filter(c => c.id !== clientId));
    setPrinters(prev => prev.filter(p => p.clientId !== clientId));
    setServiceOrders(prev => prev.filter(os => os.clientId !== clientId));
    addAuditLog('Exclusão de Cliente', 'Atendimento', `Cliente ${client.name} e suas impressoras/OS associadas foram excluídos.`);
  };

  const addPrinter = (printerData: Omit<Printer, 'id' | 'createdAt'>): Printer => {
    const newPrinter: Printer = {
      ...printerData,
      id: 'prt-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setPrinters((prev) => [...prev, newPrinter]);
    addAuditLog('Cadastro de Impressora', 'Atendimento', `Impressora cadastrada: ${newPrinter.brand} ${newPrinter.model} (S/N: ${newPrinter.serialNumber})`);
    return newPrinter;
  };

  const updatePrinter = (printer: Printer) => {
    setPrinters((prev) => prev.map((p) => (p.id === printer.id ? printer : p)));
    addAuditLog('Atualização de Impressora', 'Atendimento', `Impressora atualizada: ${printer.brand} ${printer.model}`);
  };

  const deletePrinter = (printerId: string) => {
    const printer = printers.find(p => p.id === printerId);
    if (!printer) return;
    setPrinters(prev => prev.filter(p => p.id !== printerId));
    setServiceOrders(prev => prev.filter(os => os.printerId !== printerId));
    addAuditLog('Exclusão de Impressora', 'Atendimento', `Impressora ${printer.brand} ${printer.model} excluída.`);
  };

  const addServiceOrder = (osData: Omit<ServiceOrder, 'id' | 'osNumber' | 'createdAt' | 'updatedAt'>): ServiceOrder => {
    const nextNum = serviceOrders.length + 1;
    const osNumber = `OS-2026-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newOs: ServiceOrder = {
      ...osData,
      id: 'os-' + Date.now(),
      osNumber,
      createdAt: now,
      updatedAt: now,
    };

    setServiceOrders((prev) => [newOs, ...prev]);
    addAuditLog('Abertura de Ordem de Serviço', 'Atendimento', `OS ${osNumber} aberta com sucesso.`);
    return newOs;
  };

  const updateServiceOrder = (id: string, updates: Partial<ServiceOrder>) => {
    setServiceOrders((prev) =>
      prev.map((os) => {
        if (os.id === id) {
          const updated = {
            ...os,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          // If parts were added and status is changing or parts updated, handle inventory deduction if needed
          if (updates.usedParts && updates.usedParts !== os.usedParts) {
            // Deduct parts from stock if status requires or quote approved
            // We can also calculate partsCost
            const pCost = updates.usedParts.reduce((acc, p) => acc + p.totalPrice, 0);
            updated.partsCost = pCost;
            updated.totalAmount = pCost + (updates.laborCost !== undefined ? updates.laborCost : os.laborCost);
          }

          if (updates.laborCost !== undefined) {
            updated.totalAmount = updated.partsCost + updates.laborCost;
          }

          addAuditLog(
            `Atualização OS (${os.osNumber})`,
            updates.status ? 'Área Técnica/Admin' : 'Atendimento',
            `Status alterado para: ${updates.status || os.status}`
          );

          return updated;
        }
        return os;
      })
    );
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
    };
    setProducts((prev) => [...prev, newProd]);
    addAuditLog('Cadastro de Produto', 'Estoque', `Produto/Peça cadastrado: ${newProd.name} (${newProd.code})`);
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    addAuditLog('Atualização de Produto', 'Estoque', `Produto atualizado: ${product.name}`);
  };

  const addCashTransaction = (trxData: Omit<CashTransaction, 'id' | 'date'>) => {
    const newTrx: CashTransaction = {
      ...trxData,
      id: 'trx-' + Date.now(),
      date: new Date().toISOString(),
    };
    setCashTransactions((prev) => [newTrx, ...prev]);
    addAuditLog(
      `Lançamento Caixa (${trxData.type})`,
      'Financeiro',
      `${trxData.type}: R$ ${trxData.amount.toFixed(2)} - ${trxData.description}`
    );
  };

  const updateCompanySettings = (settings: CompanySettings) => {
    setCompanySettings(settings);
    addAuditLog('Atualização Dados Empresa', 'Configurações', 'Dados cadastrais da empresa atualizados.');
  };

  const restoreBackup = (data: any) => {
    if (data.serviceOrders) setServiceOrders(data.serviceOrders);
    if (data.clients) setClients(data.clients);
    if (data.printers) setPrinters(data.printers);
    if (data.products) setProducts(data.products);
    if (data.cashTransactions) setCashTransactions(data.cashTransactions);
    if (data.auditLogs) setAuditLogs(data.auditLogs);
    if (data.users) setUsers(data.users);
    
    addAuditLog('Restauração de Backup', 'Sistema', 'Backup do banco de dados restaurado com sucesso.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        clients,
        printers,
        serviceOrders,
        products,
        cashTransactions,
        auditLogs,
        companySettings,
        activeTab,
        setActiveTab,
        login,
        logout,
        updateUserPassword,
        addUser,
        toggleUserStatus,
        updateUser,
        deleteUser,
        addClient,
        updateClient,
        deleteClient,
        addPrinter,
        updatePrinter,
        deletePrinter,
        addServiceOrder,
        updateServiceOrder,
        addProduct,
        updateProduct,
        addCashTransaction,
        updateCompanySettings,
        addAuditLog,
        restoreBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
