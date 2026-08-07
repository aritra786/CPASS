import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Play,
  Copy,
  Download,
  RotateCcw,
  Table,
  Terminal,
  Plus,
  Trash2,
  Key,
  Check,
  Search,
  Code,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronDown,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Globe,
  Sliders,
  X
} from 'lucide-react';

interface CustomTable {
  name: string;
  columns: { name: string; type: string }[];
  rows: Record<string, any>[];
}

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  status: 'success' | 'error';
  durationMs: number;
  rowCount: number;
  errorMsg?: string;
}

export const SupabaseSqlEditor: React.FC = () => {
  const { tenants, templates, campaigns, rateCards, messageLogs, transactions } = useApp();

  // Active Tab in Editor
  const [activeQueryTab, setActiveQueryTab] = useState<number>(1);
  const [queryTabs, setQueryTabs] = useState<{ id: number; title: string; sql: string }[]>([
    {
      id: 1,
      title: 'Active Tenants Query',
      sql: `-- Supabase SQL Studio: Query Active Tenants\nSELECT id, "companyName", "accountId", email, "walletBalance", status \nFROM tenants \nWHERE status = 'Active' \nORDER BY "walletBalance" DESC \nLIMIT 50;`
    },
    {
      id: 2,
      title: 'Campaign Analytics',
      sql: `-- Supabase SQL Analytics: Message Volume & Cost Summary\nSELECT id, name, channel, "sentCount", "deliveredCount", "totalCost", status \nFROM campaigns \nORDER BY "sentCount" DESC;`
    }
  ]);

  // Supabase Connection Settings
  const [supabaseUrl, setSupabaseUrl] = useState('https://connex-platform.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.supabase_service_role_key_prod');
  const [dbName, setDbName] = useState('postgres (PostgreSQL 15.1)');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Custom User Created Tables (In-Memory SQL Execution state)
  const [customTables, setCustomTables] = useState<Record<string, CustomTable>>({
    audit_logs: {
      name: 'audit_logs',
      columns: [
        { name: 'id', type: 'UUID' },
        { name: 'event', type: 'TEXT' },
        { name: 'actor', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMP' }
      ],
      rows: [
        { id: 'log_001', event: 'ADMIN_LOGIN', actor: 'aritra.sardar2805@gmail.com', created_at: new Date().toISOString() },
        { id: 'log_002', event: 'WALLET_TOPUP', actor: 'ACT90821', created_at: new Date(Date.now() - 3600000).toISOString() }
      ]
    }
  });

  // UI States
  const [tableSearch, setTableSearch] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({ tenants: true, campaigns: true });
  const [activeBottomTab, setActiveBottomTab] = useState<'results' | 'messages' | 'schema' | 'history'>('results');
  const [copied, setCopied] = useState(false);

  // Query Execution States
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    columns: string[];
    rows: any[];
    executionTimeMs: number;
    rowCount: number;
    status: 'success' | 'error';
    message: string;
  } | null>(null);

  // History Log
  const [history, setHistory] = useState<QueryHistoryItem[]>([
    {
      id: 'h_1',
      query: 'SELECT id, "companyName", "walletBalance" FROM tenants;',
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
      durationMs: 14,
      rowCount: tenants.length
    }
  ]);

  // Current SQL Text in active editor tab
  const currentSql = useMemo(() => {
    const found = queryTabs.find(t => t.id === activeQueryTab);
    return found ? found.sql : '';
  }, [queryTabs, activeQueryTab]);

  const updateCurrentSql = (val: string) => {
    setQueryTabs(prev =>
      prev.map(tab => (tab.id === activeQueryTab ? { ...tab, sql: val } : tab))
    );
  };

  // Pre-defined System Schema Map
  const systemSchemas = useMemo(() => {
    return [
      {
        name: 'tenants',
        description: 'Tenant Accounts & Wallet Balances',
        count: tenants.length,
        columns: [
          { name: 'id', type: 'TEXT' },
          { name: 'companyName', type: 'TEXT' },
          { name: 'accountId', type: 'TEXT' },
          { name: 'adminName', type: 'TEXT' },
          { name: 'email', type: 'TEXT' },
          { name: 'walletBalance', type: 'NUMERIC' },
          { name: 'status', type: 'TEXT' },
          { name: 'userType', type: 'TEXT' }
        ],
        rows: tenants
      },
      {
        name: 'templates',
        description: 'RCS / WhatsApp Message Templates',
        count: templates.length,
        columns: [
          { name: 'id', type: 'TEXT' },
          { name: 'name', type: 'TEXT' },
          { name: 'channel', type: 'TEXT' },
          { name: 'type', type: 'TEXT' },
          { name: 'category', type: 'TEXT' },
          { name: 'status', type: 'TEXT' },
          { name: 'bodyText', type: 'TEXT' }
        ],
        rows: templates
      },
      {
        name: 'campaigns',
        description: 'Bulk Campaign Dispatch Metrics',
        count: campaigns.length,
        columns: [
          { name: 'id', type: 'TEXT' },
          { name: 'name', type: 'TEXT' },
          { name: 'channel', type: 'TEXT' },
          { name: 'sentCount', type: 'INTEGER' },
          { name: 'deliveredCount', type: 'INTEGER' },
          { name: 'totalCost', type: 'NUMERIC' },
          { name: 'status', type: 'TEXT' }
        ],
        rows: campaigns
      },
      {
        name: 'rate_cards',
        description: 'Billing Rates & Profit Margins',
        count: rateCards.length,
        columns: [
          { name: 'id', type: 'TEXT' },
          { name: 'country', type: 'TEXT' },
          { name: 'channel', type: 'TEXT' },
          { name: 'category', type: 'TEXT' },
          { name: 'ratePerMsg', type: 'NUMERIC' },
          { name: 'marginPercent', type: 'NUMERIC' }
        ],
        rows: rateCards
      },
      {
        name: 'messages',
        description: 'Message Delivery Logs',
        count: messageLogs.length,
        columns: [
          { name: 'id', type: 'TEXT' },
          { name: 'recipientPhone', type: 'TEXT' },
          { name: 'channel', type: 'TEXT' },
          { name: 'templateName', type: 'TEXT' },
          { name: 'status', type: 'TEXT' },
          { name: 'cost', type: 'NUMERIC' },
          { name: 'timestamp', type: 'TIMESTAMP' }
        ],
        rows: messageLogs
      },
      {
        name: 'transactions',
        description: 'Wallet Transactions History',
        count: transactions.length,
        columns: [
          { name: 'id', type: 'TEXT' },
          { name: 'amount', type: 'NUMERIC' },
          { name: 'type', type: 'TEXT' },
          { name: 'description', type: 'TEXT' },
          { name: 'date', type: 'TIMESTAMP' }
        ],
        rows: transactions
      }
    ];
  }, [tenants, templates, campaigns, rateCards, messageLogs, transactions]);

  // Combine system schemas and custom in-memory tables
  const allTables = useMemo(() => {
    const customList = Object.values(customTables).map(ct => ({
      name: ct.name,
      description: 'Custom User Table',
      count: ct.rows.length,
      columns: ct.columns,
      rows: ct.rows,
      isCustom: true
    }));
    return [...systemSchemas, ...customList];
  }, [systemSchemas, customTables]);

  const filteredTables = useMemo(() => {
    if (!tableSearch) return allTables;
    const q = tableSearch.toLowerCase();
    return allTables.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        t.columns.some(c => c.name.toLowerCase().includes(q))
    );
  }, [allTables, tableSearch]);

  const toggleExpandTable = (name: string) => {
    setExpandedTables(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // SQL Interpreter & Execution Logic
  const handleExecuteSql = () => {
    if (!currentSql.trim()) return;

    setIsExecuting(true);
    const startMs = performance.now();

    setTimeout(() => {
      try {
        const rawSql = currentSql.replace(/--.*$/gm, '').trim(); // strip comments
        const cleanSql = rawSql.trim();
        const upper = cleanSql.toUpperCase();

        let resRows: any[] = [];
        let resCols: string[] = [];
        let msg = 'Query executed successfully';

        // 1. CREATE TABLE
        if (upper.startsWith('CREATE TABLE')) {
          const match = cleanSql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_"]+)/i);
          if (match && match[1]) {
            const tableName = match[1].replace(/"/g, '').toLowerCase();
            setCustomTables(prev => ({
              ...prev,
              [tableName]: {
                name: tableName,
                columns: [
                  { name: 'id', type: 'UUID' },
                  { name: 'name', type: 'TEXT' },
                  { name: 'data', type: 'JSONB' },
                  { name: 'created_at', type: 'TIMESTAMP' }
                ],
                rows: []
              }
            }));
            msg = `Table '${tableName}' created successfully with Row Level Security (RLS) enabled.`;
            resCols = ['status', 'table_name', 'engine'];
            resRows = [{ status: 'CREATED', table_name: tableName, engine: 'Supabase PostgreSQL 15.1' }];
          } else {
            throw new Error('Syntax error near CREATE TABLE. Could not parse table name.');
          }
        }
        // 2. INSERT INTO
        else if (upper.startsWith('INSERT INTO')) {
          const match = cleanSql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_"]+)/i);
          if (match && match[1]) {
            const tableName = match[1].replace(/"/g, '').toLowerCase();
            const targetTable = allTables.find(t => t.name.toLowerCase() === tableName);
            
            if (!targetTable) {
              throw new Error(`Table '${tableName}' does not exist in public schema.`);
            }

            msg = `INSERT 0 1 into table '${tableName}'.`;
            resCols = ['status', 'inserted_rows', 'table'];
            resRows = [{ status: 'SUCCESS', inserted_rows: 1, table: tableName }];
          } else {
            throw new Error('Syntax error near INSERT INTO statement.');
          }
        }
        // 3. DROP TABLE
        else if (upper.startsWith('DROP TABLE')) {
          const match = cleanSql.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?([a-zA-Z0-9_"]+)/i);
          if (match && match[1]) {
            const tableName = match[1].replace(/"/g, '').toLowerCase();
            if (customTables[tableName]) {
              setCustomTables(prev => {
                const next = { ...prev };
                delete next[tableName];
                return next;
              });
              msg = `Table '${tableName}' dropped successfully.`;
            } else {
              msg = `Table '${tableName}' is part of system schema (protected read-only). Mock reset applied.`;
            }
            resCols = ['status', 'action'];
            resRows = [{ status: 'SUCCESS', action: `DROPPED ${tableName}` }];
          }
        }
        // 4. SELECT Query Handling
        else if (upper.startsWith('SELECT') || upper.startsWith('WITH') || upper.startsWith('SHOW') || upper.startsWith('\\D')) {
          // Identify targeted table
          let matchedTable = allTables[0]; // fallback
          for (const tbl of allTables) {
            const regex = new RegExp(`FROM\\s+"?${tbl.name}"?`, 'i');
            if (regex.test(cleanSql)) {
              matchedTable = tbl;
              break;
            }
          }

          let data = [...matchedTable.rows];

          // WHERE filtering
          const whereMatch = cleanSql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|GROUP|;|$)/i);
          if (whereMatch && whereMatch[1]) {
            const whereClause = whereMatch[1].trim();
            // simple equality or status checks
            if (whereClause.includes('=')) {
              const [colRaw, valRaw] = whereClause.split('=').map(s => s.trim().replace(/['"]/g, ''));
              data = data.filter(r => {
                const val = r[colRaw] !== undefined ? String(r[colRaw]) : '';
                return val.toLowerCase() === valRaw.toLowerCase();
              });
            } else if (whereClause.toLowerCase().includes('like')) {
              const [colRaw, valRaw] = whereClause.split(/like/i).map(s => s.trim().replace(/['"%]/g, ''));
              data = data.filter(r => {
                const val = r[colRaw] !== undefined ? String(r[colRaw]) : '';
                return val.toLowerCase().includes(valRaw.toLowerCase());
              });
            }
          }

          // ORDER BY
          const orderMatch = cleanSql.match(/ORDER\s+BY\s+([a-zA-Z0-9_"]+)(?:\s+(ASC|DESC))?/i);
          if (orderMatch && orderMatch[1]) {
            const colName = orderMatch[1].replace(/"/g, '');
            const isDesc = orderMatch[2] ? orderMatch[2].toUpperCase() === 'DESC' : false;
            data.sort((a, b) => {
              const valA = a[colName] ?? '';
              const valB = b[colName] ?? '';
              if (typeof valA === 'number' && typeof valB === 'number') {
                return isDesc ? valB - valA : valA - valB;
              }
              return isDesc ? String(valB).localeCompare(String(valA)) : String(valA).localeCompare(String(valB));
            });
          }

          // LIMIT
          const limitMatch = cleanSql.match(/LIMIT\s+(\d+)/i);
          if (limitMatch && limitMatch[1]) {
            const limit = parseInt(limitMatch[1], 10);
            data = data.slice(0, limit);
          }

          resRows = data;
          if (data.length > 0) {
            resCols = Object.keys(data[0]);
          } else if (matchedTable.columns) {
            resCols = matchedTable.columns.map(c => c.name);
          } else {
            resCols = ['id', 'status', 'created_at'];
          }

          msg = `Fetched ${resRows.length} rows from table '${matchedTable.name}'.`;
        }
        // Generic SQL Statement (ALTER, UPDATE, DELETE, GRANT, CREATE POLICY)
        else {
          msg = `Statement executed successfully on Supabase PostgreSQL Cluster.`;
          resCols = ['status', 'query_type', 'affected_rows'];
          resRows = [{ status: 'OK', query_type: upper.split(' ')[0], affected_rows: 1 }];
        }

        const duration = Math.round(performance.now() - startMs);

        setQueryResult({
          columns: resCols,
          rows: resRows,
          executionTimeMs: duration,
          rowCount: resRows.length,
          status: 'success',
          message: msg
        });

        setActiveBottomTab('results');

        // Add to history
        setHistory(prev => [
          {
            id: `h_${Date.now()}`,
            query: currentSql.slice(0, 100),
            timestamp: new Date().toLocaleTimeString(),
            status: 'success',
            durationMs: duration,
            rowCount: resRows.length
          },
          ...prev.slice(0, 20)
        ]);
      } catch (err: any) {
        const duration = Math.round(performance.now() - startMs);
        const errMsg = err.message || 'Error executing SQL statement';

        setQueryResult({
          columns: [],
          rows: [],
          executionTimeMs: duration,
          rowCount: 0,
          status: 'error',
          message: errMsg
        });

        setActiveBottomTab('messages');

        setHistory(prev => [
          {
            id: `h_${Date.now()}`,
            query: currentSql.slice(0, 100),
            timestamp: new Date().toLocaleTimeString(),
            status: 'error',
            durationMs: duration,
            rowCount: 0,
            errorMsg: errMsg
          },
          ...prev.slice(0, 20)
        ]);
      } finally {
        setIsExecuting(false);
      }
    }, 250);
  };

  // Helper Snippets
  const insertSnippet = (sqlSnippet: string, title?: string) => {
    if (title) {
      setQueryTabs(prev => [
        ...prev,
        { id: Date.now(), title: title, sql: sqlSnippet }
      ]);
      setActiveQueryTab(Date.now());
    } else {
      updateCurrentSql(sqlSnippet);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const headers = queryResult.columns.join(',');
    const rows = queryResult.rows
      .map(r =>
        queryResult.columns
          .map(col => {
            const val = r[col];
            if (val === null || val === undefined) return '""';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to JSON
  const exportToJSON = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const blob = new Blob([JSON.stringify(queryResult.rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format SQL Helper
  const formatSql = () => {
    const formatted = currentSql
      .replace(/\bselect\b/gi, 'SELECT')
      .replace(/\bfrom\b/gi, 'FROM')
      .replace(/\bwhere\b/gi, 'WHERE')
      .replace(/\border by\b/gi, 'ORDER BY')
      .replace(/\blimit\b/gi, 'LIMIT')
      .replace(/\binsert into\b/gi, 'INSERT INTO')
      .replace(/\bvalues\b/gi, 'VALUES')
      .replace(/\bcreate table\b/gi, 'CREATE TABLE')
      .replace(/\balter table\b/gi, 'ALTER TABLE')
      .replace(/\bdrop table\b/gi, 'DROP TABLE');
    updateCurrentSql(formatted);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-lg shadow-emerald-900/40 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Supabase SQL Studio
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PostgreSQL 15.1
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>Project: <strong className="text-emerald-300 font-mono">connex-platform</strong></span>
                <span className="text-slate-600">•</span>
                <span className="truncate max-w-xs text-slate-400 font-mono">{supabaseUrl}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>API Credentials</span>
            </button>

            <button
              type="button"
              onClick={() => insertSnippet(`-- Create New RLS Policy Example\nALTER TABLE tenants ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY "Tenant Data Isolation Policy" ON tenants\n  FOR ALL\n  USING (auth.uid() = id)\n  WITH CHECK (auth.uid() = id);`, 'New RLS Policy')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ New Policy Snippet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Sidebar (Tables) + Right Area (Tabs, Editor, Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Schema & Table Inspector */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-emerald-600" />
                <span>Database Tables ({allTables.length})</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                public
              </span>
            </div>

            {/* Search Tables Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                placeholder="Search tables & columns..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tables List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredTables.map(tbl => {
              const isExpanded = !!expandedTables[tbl.name];

              return (
                <div key={tbl.name} className="rounded-xl border border-slate-100 bg-slate-50/40 overflow-hidden">
                  
                  {/* Table Header Row */}
                  <div className="p-2 flex items-center justify-between hover:bg-slate-100/80 transition-colors group">
                    <button
                      type="button"
                      onClick={() => toggleExpandTable(tbl.name)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <Table className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-xs font-extrabold text-slate-800 truncate font-mono">
                        {tbl.name}
                      </span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono font-bold text-slate-400 px-1">
                        {tbl.count} rows
                      </span>
                      <button
                        type="button"
                        title="Query SELECT * FROM table"
                        onClick={() => insertSnippet(`SELECT * FROM "${tbl.name}" LIMIT 50;`, `Query ${tbl.name}`)}
                        className="px-1.5 py-1 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded font-bold transition-all cursor-pointer"
                      >
                        SELECT
                      </button>
                    </div>
                  </div>

                  {/* Expanded Columns List */}
                  {isExpanded && (
                    <div className="px-3 py-2 bg-white border-t border-slate-100 space-y-1 text-[11px] font-mono text-slate-600">
                      {tbl.columns.map(col => (
                        <div key={col.name} className="flex items-center justify-between py-0.5 hover:text-slate-900">
                          <span className="truncate flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            {col.name}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">
                            {col.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Quick Preset Queries Bar */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/90 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              QUICK TEMPLATES
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => insertSnippet(`SELECT channel, COUNT(*) as total_templates FROM templates GROUP BY channel;`, 'Templates Summary')}
                className="px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 rounded text-[10px] font-bold transition-colors cursor-pointer"
              >
                📊 Template Stats
              </button>
              <button
                type="button"
                onClick={() => insertSnippet(`SELECT * FROM rate_cards WHERE channel = 'WhatsApp';`, 'WhatsApp Rates')}
                className="px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 rounded text-[10px] font-bold transition-colors cursor-pointer"
              >
                💵 WhatsApp Rates
              </button>
              <button
                type="button"
                onClick={() => insertSnippet(`CREATE TABLE IF NOT EXISTS customer_feedback (\n  id UUID PRIMARY KEY,\n  user_email TEXT,\n  rating INT,\n  comments TEXT,\n  created_at TIMESTAMP\n);`, 'Create Feedback Table')}
                className="px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 rounded text-[10px] font-bold transition-colors cursor-pointer"
              >
                ⚡ Create Table
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: SQL Tabs, Code Editor & Results */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Editor Header & Tab Selector */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[700px]">
            
            {/* Tab Bar */}
            <div className="bg-slate-950 px-3 pt-2.5 flex items-center justify-between border-b border-slate-800 overflow-x-auto">
              <div className="flex items-center gap-1">
                {queryTabs.map(tab => (
                  <div
                    key={tab.id}
                    className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      activeQueryTab === tab.id
                        ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                    onClick={() => setActiveQueryTab(tab.id)}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{tab.title}</span>
                    {queryTabs.length > 1 && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setQueryTabs(prev => prev.filter(t => t.id !== tab.id));
                          if (activeQueryTab === tab.id) {
                            const remaining = queryTabs.filter(t => t.id !== tab.id);
                            setActiveQueryTab(remaining[0].id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const newId = Date.now();
                    setQueryTabs(prev => [
                      ...prev,
                      { id: newId, title: `Query ${prev.length + 1}`, sql: `SELECT * FROM tenants LIMIT 10;` }
                    ]);
                    setActiveQueryTab(newId);
                  }}
                  className="px-2.5 py-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-900/60 rounded-t-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Query</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pb-2">
                <span className="text-[10px] font-mono text-slate-500">
                  Ctrl + Enter to run
                </span>
              </div>
            </div>

            {/* Action Bar (Run, Format, Reset) */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExecuteSql}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  id="supabase-sql-run-btn"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{isExecuting ? 'Executing...' : 'Run Query'}</span>
                </button>

                <button
                  type="button"
                  onClick={formatSql}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-blue-400" />
                  <span>Format SQL</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateCurrentSql('')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3">
                {queryResult && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={queryResult.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                      {queryResult.status === 'success' ? '✓ OK' : '✕ ERROR'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{queryResult.executionTimeMs}ms</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{queryResult.rowCount} rows</span>
                  </div>
                )}
              </div>
            </div>

            {/* Code Textarea Query Editor */}
            <div className="relative flex-1 bg-slate-950 p-4 font-mono text-sm text-emerald-300 overflow-hidden">
              <textarea
                value={currentSql}
                onChange={e => updateCurrentSql(e.target.value)}
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleExecuteSql();
                  }
                }}
                placeholder="Write Supabase SQL queries here..."
                spellCheck={false}
                className="w-full h-full bg-transparent text-emerald-300 placeholder:text-slate-600 focus:outline-none resize-none font-mono text-sm leading-relaxed"
              />
            </div>

            {/* Bottom Results Panel Navigation */}
            <div className="bg-slate-950 border-t border-slate-800 flex flex-col h-[320px]">
              
              {/* Results Tab Header */}
              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveBottomTab('results')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      activeBottomTab === 'results'
                        ? 'bg-slate-800 text-emerald-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Data Results ({queryResult?.rowCount || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBottomTab('messages')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      activeBottomTab === 'messages'
                        ? 'bg-slate-800 text-emerald-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Console Output
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBottomTab('history')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                      activeBottomTab === 'history'
                        ? 'bg-slate-800 text-emerald-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Execution History ({history.length})
                  </button>
                </div>

                {/* Export Options */}
                {queryResult && queryResult.rows.length > 0 && activeBottomTab === 'results' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={exportToCSV}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold font-mono rounded flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportToJSON}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold font-mono rounded flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-blue-400" />
                      <span>JSON</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Tab Content Area */}
              <div className="flex-1 overflow-auto bg-slate-950 p-3">
                
                {/* 1. Results Data Grid */}
                {activeBottomTab === 'results' && (
                  <>
                    {!queryResult ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                        <Terminal className="w-8 h-8 stroke-1 text-slate-700" />
                        <p className="text-xs font-mono">No query executed yet. Click 'Run Query' or press Ctrl + Enter.</p>
                      </div>
                    ) : queryResult.status === 'error' ? (
                      <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 font-mono text-xs space-y-2">
                        <div className="flex items-center gap-2 font-bold text-rose-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span>SQL Execution Failed</span>
                        </div>
                        <p className="pl-6 text-slate-300">{queryResult.message}</p>
                      </div>
                    ) : queryResult.rows.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                        Query returned 0 rows. (Empty result set)
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs text-slate-300 border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/60 text-emerald-400 font-bold sticky top-0">
                              <th className="py-2 px-3 text-slate-600 w-10 text-center">#</th>
                              {queryResult.columns.map(col => (
                                <th key={col} className="py-2 px-3 whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {queryResult.rows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/80 transition-colors">
                                <td className="py-2 px-3 text-slate-600 text-center text-[10px]">{idx + 1}</td>
                                {queryResult.columns.map(col => {
                                  const val = row[col];
                                  const formattedVal =
                                    typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'NULL');

                                  return (
                                    <td key={col} className="py-2 px-3 whitespace-nowrap max-w-xs truncate text-slate-200">
                                      {val === null || val === undefined ? (
                                        <span className="text-slate-600 italic">NULL</span>
                                      ) : typeof val === 'number' ? (
                                        <span className="text-amber-300">{formattedVal}</span>
                                      ) : typeof val === 'boolean' ? (
                                        <span className="text-purple-300">{formattedVal}</span>
                                      ) : (
                                        <span>{formattedVal}</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {/* 2. Console Output Tab */}
                {activeBottomTab === 'messages' && (
                  <div className="font-mono text-xs space-y-2 p-2">
                    {queryResult ? (
                      <div className="space-y-1">
                        <div className="text-emerald-400 font-bold">
                          [Supabase Postgres Engine] {queryResult.message}
                        </div>
                        <div className="text-slate-400">
                          Query Duration: <span className="text-amber-300">{queryResult.executionTimeMs} ms</span>
                        </div>
                        <div className="text-slate-400">
                          Rows Affected / Returned: <span className="text-blue-300">{queryResult.rowCount}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] pt-2 border-t border-slate-800">
                          Transaction Status: COMMIT (Auto-commit mode)
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-600">Console ready. Awaiting query dispatch.</div>
                    )}
                  </div>
                )}

                {/* 3. History Tab */}
                {activeBottomTab === 'history' && (
                  <div className="space-y-2">
                    {history.map(item => (
                      <div
                        key={item.id}
                        onClick={() => insertSnippet(item.query)}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                      >
                        <div className="min-w-0 flex-1 font-mono text-xs truncate">
                          <span className={item.status === 'success' ? 'text-emerald-400 font-bold mr-2' : 'text-rose-400 font-bold mr-2'}>
                            {item.status === 'success' ? '✓' : '✕'}
                          </span>
                          <span className="text-slate-200 group-hover:text-emerald-300">{item.query}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 font-mono text-[10px] text-slate-500">
                          <span>{item.durationMs}ms</span>
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Supabase Connection Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">Supabase Connection Config</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Service Role / Anon Key</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Database Engine Name</label>
                <input
                  type="text"
                  value={dbName}
                  onChange={e => setDbName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
