import React, { useState } from 'react';
import { DatabaseHelper } from '../utils/database';
import { IntentLog } from '../types';
import { 
  Activity, 
  Terminal, 
  Database, 
  Radio, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface ArchitectureInspectorProps {
  currentActivity: string;
  lifecycleState: 'onCreate' | 'onStart' | 'onResume' | 'onPause' | 'onStop' | 'onDestroy';
  intentLogs: IntentLog[];
  onClearIntentLogs: () => void;
}

export const ArchitectureInspector: React.FC<ArchitectureInspectorProps> = ({
  currentActivity,
  lifecycleState,
  intentLogs,
  onClearIntentLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'intents' | 'database'>('lifecycle');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM pantry_items;');
  const [queryResult, setQueryResult] = useState<any>(null);

  const db = DatabaseHelper.getInstance();

  const handleRunSQL = (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    const result = db.executeRawSQL(q);
    setQueryResult(result);
  };

  const sampleQueries = [
    { label: 'All Pantry Items', query: 'SELECT * FROM pantry_items;' },
    { label: 'All Pre-seeded Recipes', query: 'SELECT * FROM recipes;' },
    { label: 'Produce Category Only', query: "SELECT * FROM pantry_items WHERE category = 'Produce';" },
    { label: 'Database Schema DDL', query: 'SELECT sql FROM sqlite_master;' },
  ];

  const lifecycleStages = [
    { name: 'onCreate', desc: 'Activity created, layouts inflated, database connection opened' },
    { name: 'onStart', desc: 'Activity becomes visible to user' },
    { name: 'onResume', desc: 'Activity in foreground; RecyclerView re-queries SQLite database' },
    { name: 'onPause', desc: 'Another Activity comes into foreground; unsaved state committed' },
    { name: 'onStop', desc: 'Activity no longer visible' },
    { name: 'onDestroy', desc: 'Activity finishing; resources and database cursor closed' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Header & Tabs */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Android Studio Architecture Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Live lifecycle, intent bus & SQLite persistent engine
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'lifecycle' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Activity Lifecycle
          </button>
          <button
            onClick={() => setActiveTab('intents')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'intents' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Intent Monitor</span>
            {intentLogs.length > 0 && (
              <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.2 rounded-full font-mono">
                {intentLogs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('database');
              if (!queryResult) handleRunSQL();
            }}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'database' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            SQLite Terminal
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-950/70">
        {/* TAB 1: ACTIVITY LIFECYCLE */}
        {activeTab === 'lifecycle' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-mono">CURRENT FOREGROUND ACTIVITY:</span>
                <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                  {currentActivity}
                </span>
              </div>

              {/* Lifecycle Flowchart */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lifecycleStages.map((stage) => {
                  const isCurrent = lifecycleState === stage.name;
                  return (
                    <div
                      key={stage.name}
                      className={`p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-emerald-950/90 border-emerald-500 shadow-md ring-1 ring-emerald-400/50'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-mono text-xs font-bold ${isCurrent ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {stage.name}()
                        </span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </div>
                      <p className="text-[11px] leading-tight text-slate-400">{stage.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <h4 className="text-white font-bold mb-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Technical Lifecycle Design (Section 3.1 & 5.1 of Brief)
              </h4>
              <p>
                In the Smart Pantry Manager, database re-queries are deliberately attached to{' '}
                <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">onResume()</code>. When returning from{' '}
                <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">AddEditIngredientActivity</code>, the Android back stack invokes{' '}
                <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">onResume()</code> on the host Fragment. This automatically refreshes the{' '}
                <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">RecyclerView.Adapter</code> without requiring manual broadcast receivers or causing state discrepancies.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: INTENT MONITOR */}
        {activeTab === 'intents' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                DISPATCHED INTENT BUS (Real-time Android Intent Logging)
              </span>
              <button
                onClick={onClearIntentLogs}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Clear Log
              </button>
            </div>

            {intentLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-900 rounded-xl border border-slate-800">
                No Intents dispatched yet. Navigate between screens or tap an ingredient in the phone emulator to record explicit Intent transmissions.
              </div>
            ) : (
              <div className="flex flex-col gap-2 font-mono text-xs">
                {intentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>{log.timestamp}</span>
                      <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                        {log.action}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-white">
                      <span className="text-slate-400">{log.fromActivity}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">{log.toActivity}</span>
                    </div>

                    {Object.keys(log.extras).length > 0 && (
                      <div className="mt-1 p-2 bg-slate-950 rounded-lg text-[11px] text-slate-400 border border-slate-800/80">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-0.5">
                          Bundle Extras:
                        </span>
                        <pre className="text-emerald-400 whitespace-pre-wrap">
                          {JSON.stringify(log.extras, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SQLITE DATABASE INSPECTOR & CONSOLE */}
        {activeTab === 'database' && (
          <div className="flex flex-col gap-3">
            {/* Sample Queries Bar */}
            <div className="flex flex-wrap gap-1.5">
              {sampleQueries.map((sq) => (
                <button
                  key={sq.label}
                  onClick={() => {
                    setSqlQuery(sq.query);
                    handleRunSQL(sq.query);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300 transition-colors cursor-pointer border border-slate-700/60"
                >
                  {sq.label}
                </button>
              ))}
            </div>

            {/* SQL Input Terminal */}
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
              <input
                type="text"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSQL()}
                placeholder="Type SQL query (e.g. SELECT * FROM pantry_items)..."
                className="flex-1 bg-transparent text-xs font-mono text-emerald-300 focus:outline-none placeholder-slate-600"
              />
              <button
                onClick={() => handleRunSQL()}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>Execute</span>
              </button>
            </div>

            {/* Query Results Table */}
            {queryResult && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                  <span>SQLite Query Output</span>
                  <span>{queryResult.rowCount} rows returned</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 border-b border-slate-800 text-emerald-400">
                      <tr>
                        {queryResult.columns.map((col: string) => (
                          <th key={col} className="p-2.5 font-semibold text-[11px]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {queryResult.rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                          {queryResult.columns.map((col: string) => (
                            <td key={col} className="p-2.5 truncate max-w-[200px]">
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
