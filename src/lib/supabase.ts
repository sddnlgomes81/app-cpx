import { createClient } from '@supabase/supabase-js';
import {
  User,
  Client,
  Printer,
  ServiceOrder,
  Product,
  CashTransaction,
  AuditLog,
  CompanySettings
} from '../types';

// Sanitize URL by removing trailing slash or rest/v1 paths
const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ljvpmggqytwruznhxkwy.supabase.co/rest/v1/';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

// Load public anon key with fallback to the user's provided key
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NbzTCepHvrSi44MZ-bExyQ_8mFMe1Kc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SyncStatus {
  connected: boolean;
  tablesReady: boolean;
  missingTables: string[];
  error?: string;
}

const TABLE_NAMES = {
  users: 'compatix_users',
  clients: 'compatix_clients',
  printers: 'compatix_printers',
  products: 'compatix_products',
  serviceOrders: 'compatix_service_orders',
  cashTransactions: 'compatix_cash_transactions',
  auditLogs: 'compatix_audit_logs',
  companySettings: 'compatix_company_settings',
};

// Check if tables are ready in Supabase
export async function checkSupabaseStatus(): Promise<SyncStatus> {
  const missingTables: string[] = [];
  let connected = false;
  let tablesReady = true;

  try {
    // Try a simple ping
    const { error: pingError } = await supabase.from('compatix_company_settings').select('id').limit(1);
    
    // If we have a generic connection/auth error, we might still be connected but tables aren't ready
    connected = true;

    if (pingError) {
      if (pingError.code === 'PGRST116' || pingError.code === 'PGRST106') {
        // Table exists but is empty, or similar expected code
      } else if (pingError.message.includes('relation') || pingError.message.includes('does not exist')) {
        missingTables.push('compatix_company_settings');
        tablesReady = false;
      } else {
        return {
          connected: false,
          tablesReady: false,
          missingTables: [],
          error: pingError.message
        };
      }
    }

    // Check other critical tables
    for (const [key, tableName] of Object.entries(TABLE_NAMES)) {
      if (tableName === 'compatix_company_settings') continue;
      const { error } = await supabase.from(tableName).select('id').limit(1);
      if (error && (error.message.includes('relation') || error.message.includes('does not exist'))) {
        missingTables.push(tableName);
        tablesReady = false;
      }
    }

    return {
      connected,
      tablesReady,
      missingTables,
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesReady: false,
      missingTables: [],
      error: err?.message || String(err)
    };
  }
}

// Fetch all data from Supabase
export async function pullFromSupabase() {
  const result: {
    users?: User[];
    clients?: Client[];
    printers?: Printer[];
    products?: Product[];
    serviceOrders?: ServiceOrder[];
    cashTransactions?: CashTransaction[];
    auditLogs?: AuditLog[];
    companySettings?: CompanySettings;
  } = {};

  try {
    const [
      { data: users, error: errU },
      { data: clients, error: errC },
      { data: printers, error: errPr },
      { data: products, error: errPd },
      { data: serviceOrders, error: errS },
      { data: cashTransactions, error: errCt },
      { data: auditLogs, error: errAl },
      { data: companySettings, error: errCs }
    ] = await Promise.all([
      supabase.from(TABLE_NAMES.users).select('*'),
      supabase.from(TABLE_NAMES.clients).select('*'),
      supabase.from(TABLE_NAMES.printers).select('*'),
      supabase.from(TABLE_NAMES.products).select('*'),
      supabase.from(TABLE_NAMES.serviceOrders).select('*'),
      supabase.from(TABLE_NAMES.cashTransactions).select('*'),
      supabase.from(TABLE_NAMES.auditLogs).select('*').order('timestamp', { ascending: false }),
      supabase.from(TABLE_NAMES.companySettings).select('*')
    ]);

    if (errU) throw new Error(`Users pull: ${errU.message}`);
    if (errC) throw new Error(`Clients pull: ${errC.message}`);
    if (errPr) throw new Error(`Printers pull: ${errPr.message}`);
    if (errPd) throw new Error(`Products pull: ${errPd.message}`);
    if (errS) throw new Error(`Service Orders pull: ${errS.message}`);
    if (errCt) throw new Error(`Cash Transactions pull: ${errCt.message}`);
    if (errAl) throw new Error(`Audit Logs pull: ${errAl.message}`);
    if (errCs) throw new Error(`Company Settings pull: ${errCs.message}`);

    result.users = users as User[];
    result.clients = clients as Client[];
    result.printers = printers as Printer[];
    result.products = products as Product[];
    
    // Parse JSON strings back into objects for serviceOrders safely
    result.serviceOrders = (serviceOrders || []).map(os => {
      let parts = [];
      if (typeof os.usedParts === 'string') {
        try { parts = JSON.parse(os.usedParts); } catch { parts = []; }
      } else if (Array.isArray(os.usedParts)) {
        parts = os.usedParts;
      }
      return {
        ...os,
        usedParts: parts
      };
    }) as ServiceOrder[];

    result.cashTransactions = cashTransactions as CashTransaction[];
    result.auditLogs = auditLogs as AuditLog[];
    if (companySettings && companySettings.length > 0) {
      result.companySettings = companySettings[0] as CompanySettings;
    }

    return result;
  } catch (error) {
    console.error('Failed to pull from Supabase:', error);
    throw error;
  }
}

// Push all local data to Supabase
export async function pushToSupabase(data: {
  users: User[];
  clients: Client[];
  printers: Printer[];
  products: Product[];
  serviceOrders: ServiceOrder[];
  cashTransactions: CashTransaction[];
  auditLogs: AuditLog[];
  companySettings: CompanySettings;
}) {
  try {
    // 1. Users
    if (data.users.length > 0) {
      const { error } = await supabase.from(TABLE_NAMES.users).upsert(data.users);
      if (error) throw new Error(`Error syncing Users: ${error.message}`);
    }

    // 2. Clients
    if (data.clients.length > 0) {
      const { error } = await supabase.from(TABLE_NAMES.clients).upsert(data.clients);
      if (error) throw new Error(`Error syncing Clients: ${error.message}`);
    }

    // 3. Printers
    if (data.printers.length > 0) {
      const { error } = await supabase.from(TABLE_NAMES.printers).upsert(data.printers);
      if (error) throw new Error(`Error syncing Printers: ${error.message}`);
    }

    // 4. Products
    if (data.products.length > 0) {
      const { error } = await supabase.from(TABLE_NAMES.products).upsert(data.products);
      if (error) throw new Error(`Error syncing Products: ${error.message}`);
    }

    // 5. Service Orders (stringify nested usedParts array for JSONB or safety)
    if (data.serviceOrders.length > 0) {
      const formattedOs = data.serviceOrders.map(os => ({
        ...os,
        usedParts: JSON.stringify(os.usedParts)
      }));
      const { error } = await supabase.from(TABLE_NAMES.serviceOrders).upsert(formattedOs);
      if (error) throw new Error(`Error syncing Service Orders: ${error.message}`);
    }

    // 6. Cash Transactions
    if (data.cashTransactions.length > 0) {
      const { error } = await supabase.from(TABLE_NAMES.cashTransactions).upsert(data.cashTransactions);
      if (error) throw new Error(`Error syncing Cash Transactions: ${error.message}`);
    }

    // 7. Audit Logs
    if (data.auditLogs.length > 0) {
      // Upsert audit logs in batches if extremely large, but normally upsert is fine
      const { error } = await supabase.from(TABLE_NAMES.auditLogs).upsert(data.auditLogs);
      if (error) throw new Error(`Error syncing Audit Logs: ${error.message}`);
    }

    // 8. Company Settings (We use 'settings-id' as key to ensure single record)
    const settingsPayload = {
      ...data.companySettings,
      id: 'settings-id'
    };
    const { error: errCs } = await supabase.from(TABLE_NAMES.companySettings).upsert([settingsPayload]);
    if (errCs) throw new Error(`Error syncing Company Settings: ${errCs.message}`);

    return true;
  } catch (error) {
    console.error('Failed to push to Supabase:', error);
    throw error;
  }
}
