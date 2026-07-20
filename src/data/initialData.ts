import { User, Client, Printer, ServiceOrder, Product, CashTransaction, AuditLog, CompanySettings } from '../types';

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Administrador do Sistema',
    email: 'admin@compatix.com',
    phone: '(11) 99999-9999',
    password: 'admin',
    role: 'admin',
    status: 'Ativo',
    mustChangePassword: true,
  },
  {
    id: 'usr-2',
    name: 'Carlos Atendente',
    email: 'carlos@compatix.com',
    phone: '(11) 98888-8888',
    password: '123',
    role: 'atendente',
    status: 'Ativo',
  },
  {
    id: 'usr-3',
    name: 'Marcos Técnico',
    email: 'marcos@compatix.com',
    phone: '(11) 97777-7777',
    password: '123',
    role: 'tecnico',
    status: 'Ativo',
  },
];

export const initialClients: Client[] = [];

export const initialPrinters: Printer[] = [];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    code: 'TON-HP-01',
    name: 'Cartucho Toner HP 58A Compatível',
    category: 'Suprimento',
    costPrice: 85.00,
    salePrice: 160.00,
    stockQty: 4, // Estoque baixo (<5)
    minStock: 5,
  },
  {
    id: 'prod-2',
    code: 'PEC-FUS-02',
    name: 'Película de Fusão HP LaserJet M404',
    category: 'Peça',
    costPrice: 45.00,
    salePrice: 120.00,
    stockQty: 12,
    minStock: 3,
  },
  {
    id: 'prod-3',
    code: 'KIT-TINT-EPS',
    name: 'Kit Tintas Garrafa Epson 544 (4 Cores)',
    category: 'Suprimento',
    costPrice: 50.00,
    salePrice: 110.00,
    stockQty: 2, // Estoque baixo
    minStock: 4,
  },
  {
    id: 'prod-4',
    code: 'PEC-ROL-01',
    name: 'Kit Rolete de Tração / Pickup Roller',
    category: 'Peça',
    costPrice: 25.00,
    salePrice: 75.00,
    stockQty: 15,
    minStock: 5,
  },
];

export const initialServiceOrders: ServiceOrder[] = [];

export const initialCashTransactions: CashTransaction[] = [];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-14T08:00:00Z',
    userId: 'usr-2',
    userName: 'Carlos Atendente',
    operation: 'Abertura de Ordem de Serviço (OS-2026-003)',
    module: 'Atendimento',
    details: 'Cliente: Hospital São Lucas - Impressora Epson EcoTank L3250',
  },
  {
    id: 'log-2',
    timestamp: '2026-07-13T16:45:00Z',
    userId: 'usr-2',
    userName: 'Carlos Atendente',
    operation: 'Baixa de Pagamento OS-2026-004 (R$ 120,00 via PIX)',
    module: 'Financeiro',
    details: 'Pagamento efetuado e registrado no caixa do dia.',
  },
  {
    id: 'log-3',
    timestamp: '2026-07-12T11:00:00Z',
    userId: 'usr-3',
    userName: 'Marcos Técnico',
    operation: 'Conclusão de Manutenção (OS-2026-001)',
    module: 'Área Técnica',
    details: 'Peças aplicadas: Película de Fusão e Kit Rolete.',
  },
];

export const initialCompanySettings: CompanySettings = {
  companyName: 'Compatix Tecnologia e Assistência Técnica Ltda',
  tradeName: 'Compatix OS & Soluções em Impressão',
  cnpj: '18.999.888/0001-50',
  phone: '(11) 4004-8900',
  email: 'contato@compatix.com.br',
  address: 'Rua das Indústrias, 500 - Distrito Industrial - São Paulo, SP',
  logoUrl: '',
  printHeader: 'COMPATIX OS - COMPROVANTE DE ASSISTÊNCIA TÉCNICA',
  printFooter: 'Garantia legal de 90 dias sobre os serviços executados e peças substituídas.',
};
