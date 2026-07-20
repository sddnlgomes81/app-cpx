export type UserRole = 'admin' | 'atendente' | 'tecnico';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  status: 'Ativo' | 'Inativo';
  mustChangePassword?: boolean;
}

export interface Client {
  id: string;
  name: string;
  document: string; // CPF ou CNPJ
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Printer {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  serialNumber: string;
  type: 'Laser' | 'Jato de Tinta' | 'Térmica' | 'Matricial' | 'Outra';
  observations?: string;
  createdAt: string;
}

export type OsStatus =
  | 'Aguardando Atendimento'
  | 'Aguardando Orçamento'
  | 'Aguardando Aprovação'
  | 'Orçamento Aprovado'
  | 'Orçamento Não Aprovado'
  | 'Em Manutenção'
  | 'Finalizada'
  | 'Entregues'
  | 'Sem Conserto'
  | 'Cancelada';

export type OsPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface UsedPart {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceOrder {
  id: string;
  osNumber: string;
  clientId: string;
  printerId: string;
  reportedDefect: string;
  priority: OsPriority;
  status: OsStatus;
  attendantId: string;
  technicianId?: string;
  diagnosis?: string;
  solution?: string;
  usedParts: UsedPart[];
  laborCost: number;
  partsCost: number;
  totalAmount: number;
  quoteApproved?: boolean | null;
  warrantyDays?: number;
  paymentMethod?: 'Dinheiro' | 'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Boleto' | '';
  paid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'Peça' | 'Suprimento' | 'Acessório' | 'Outro';
  costPrice: number;
  salePrice: number;
  stockQty: number;
  minStock: number;
}

export interface CashTransaction {
  id: string;
  date: string;
  type: 'Entrada' | 'Saída';
  category: 'Serviço' | 'Venda Peças' | 'Suprimento' | 'Despesa' | 'Outro';
  description: string;
  amount: number;
  paymentMethod: string;
  osId?: string;
  userId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  operation: string;
  module: string;
  details: string;
}

export interface CompanySettings {
  companyName: string;
  tradeName: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  printHeader: string;
  printFooter: string;
}
