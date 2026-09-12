import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  Trash2, 
  Archive, 
  ArrowUpDown, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  User, 
  Globe, 
  Cpu, 
  Zap, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Info,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { api } from '../lib/api';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total_events_today: 0,
    active_actors_today: 0,
    deletions_today: 0,
    bulk_actions_today: 0
  });
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [flushingCache, setFlushingCache] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Filters
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterEmail, setFilterEmail] = useState<string>('');
  const [filterEntity, setFilterEntity] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsRes, summaryRes, cacheRes, queueRes] = await Promise.all([
        api.adminGetAuditLogs({
          page,
          limit,
          action: filterAction || undefined,
          userEmail: filterEmail || undefined,
          entityType: filterEntity || undefined,
        }).catch(() => ({ logs: [], pagination: { totalPages: 1, total: 0 } })),
        api.adminGetAuditSummary().catch(() => ({ summary: {} })),
        api.adminGetCacheStats().catch(() => null),
        api.adminGetQueueStats().catch(() => null),
      ]);

      if (logsRes && logsRes.logs) {
        setLogs(logsRes.logs);
        setTotalPages(logsRes.pagination?.totalPages || 1);
        setTotalRecords(logsRes.pagination?.total || 0);
      }
      if (summaryRes?.summary) {
        setSummary(summaryRes.summary);
      }
      if (cacheRes) setCacheStats(cacheRes);
      if (queueRes) setQueueStats(queueRes);
    } catch (err) {
      console.error('Error loading audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, filterAction, filterEntity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleFlushCache = async () => {
    if (!confirm('¿Seguro que deseas vaciar la memoria caché de cotizaciones y consultas?')) return;
    setFlushingCache(true);
    try {
      await api.adminFlushCache();
      const updated = await api.adminGetCacheStats().catch(() => null);
      if (updated) setCacheStats(updated);
      alert('Memoria caché vaciada correctamente.');
    } catch {
      alert('No se pudo vaciar la caché.');
    } finally {
      setFlushingCache(false);
    }
  };

  const getActionBadge = (action: string) => {
    const act = String(action || '').toUpperCase();
    if (act.includes('DELETE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
          <Trash2 className="w-3 h-3" /> {action}
        </span>
      );
    }
    if (act.includes('ARCHIVE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
          <Archive className="w-3 h-3" /> {action}
        </span>
      );
    }
    if (act.includes('STATUS')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
          <ArrowUpDown className="w-3 h-3" /> {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
        <Activity className="w-3 h-3" /> {action}
      </span>
    );
  };

  return (
    <div data-no-runtime-translate="true" className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Seguridad & Auditoría Forense
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Registro de Auditoría (Audit Trail)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Trazabilidad completa de eliminaciones, archivado, modificaciones en bloque y acciones críticas con actor, IP y timestamp.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refrescar registros
        </button>
      </div>

      {/* Tarjetas de Estadísticas de Hoy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Eventos Registrados Hoy</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary.total_events_today || 0}
            </span>
            <span className="text-xs font-bold text-slate-500">acciones</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Actividad general en la plataforma</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Usuarios / Actores Hoy</span>
            <User className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {summary.active_actors_today || 0}
            </span>
            <span className="text-xs font-bold text-emerald-600">cuentas</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Administradores u operadores</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Eliminaciones Hoy</span>
            <Trash2 className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {summary.deletions_today || 0}
            </span>
            <span className="text-xs font-bold text-rose-500">borrados</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Borrados individuales o por bloque</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Acciones Masivas</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
              {summary.bulk_actions_today || 0}
            </span>
            <span className="text-xs font-bold text-purple-500">lotes</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Operaciones masivas en envíos</p>
        </div>
      </div>

      {/* Monitor de Memoria Caché y Cola Asíncrona */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cacheStats && (
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-black text-sm">Caché en Memoria (In-Memory LRU)</span>
              </div>
              <button
                onClick={handleFlushCache}
                disabled={flushingCache}
                className="text-[11px] font-bold px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              >
                {flushingCache ? 'Vaciando...' : 'Vaciar Caché'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Entradas Activas</p>
                <p className="text-lg font-black text-white mt-0.5">{cacheStats.size || 0}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Aciertos (Hits)</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">{cacheStats.hits || 0}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Tasa de Acierto</p>
                <p className="text-lg font-black text-blue-400 mt-0.5">{cacheStats.hitRate || '0%'}</p>
              </div>
            </div>
          </div>
        )}

        {queueStats && (
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-black text-sm">Cola Asíncrona (Emails & WhatsApp)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Workers Activos: {queueStats.activeWorkers || 0}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-slate-400 text-[10px] uppercase font-bold">En Espera</p>
                <p className="text-lg font-black text-amber-400 mt-0.5">{queueStats.pending || 0}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Procesados</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">{queueStats.processed || 0}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Reintentos</p>
                <p className="text-lg font-black text-purple-400 mt-0.5">{queueStats.retried || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por email del usuario, admin o ID..."
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium outline-none"
            >
              <option value="">Todas las acciones</option>
              <option value="SHIPMENT_DELETE">Eliminación individual (SHIPMENT_DELETE)</option>
              <option value="SHIPMENT_BULK_DELETE">Eliminación masiva (SHIPMENT_BULK_DELETE)</option>
              <option value="SHIPMENT_ARCHIVE">Archivado individual (SHIPMENT_ARCHIVE)</option>
              <option value="SHIPMENT_UNARCHIVE">Desarchivado (SHIPMENT_UNARCHIVE)</option>
              <option value="SHIPMENT_BULK_ARCHIVE">Archivado masivo (SHIPMENT_BULK_ARCHIVE)</option>
              <option value="SHIPMENT_BULK_UNARCHIVE">Desarchivado masivo (SHIPMENT_BULK_UNARCHIVE)</option>
              <option value="SHIPMENT_BULK_STATUS_CHANGE">Cambio de estado masivo</option>
            </select>

            <select
              value={filterEntity}
              onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium outline-none"
            >
              <option value="">Todas las entidades</option>
              <option value="shipment">Envíos (shipment)</option>
              <option value="shipment_batch">Lotes (shipment_batch)</option>
              <option value="user">Usuarios (user)</option>
              <option value="wallet">Billetera (wallet)</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Logs de Auditoría */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Actor / Usuario</th>
                <th className="py-3.5 px-4">Acción Realizada</th>
                <th className="py-3.5 px-4">Entidad / ID</th>
                <th className="py-3.5 px-4">IP & Dispositivo</th>
                <th className="py-3.5 px-4 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Cargando registros de auditoría...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron registros de auditoría con los filtros actuales.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.user_email || 'Sistema'}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        {log.user_role || 'system'}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      <span className="font-bold uppercase text-[10px] text-slate-400 mr-1.5">
                        {log.entity_type}
                      </span>
                      {log.entity_id || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      <div className="font-mono text-[11px] flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        {log.ip_address || '127.0.0.1'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={log.user_agent}>
                        {log.user_agent || 'Browser'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors"
                      >
                        Ver JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Mostrando <strong>{logs.length}</strong> de <strong>{totalRecords}</strong> eventos registrados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Visor de JSON de Detalles */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" /> Detalle Forense del Evento
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Actor</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedLog.user_email || 'Sistema'}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Acción</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedLog.action}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase mb-1">Payload JSON de Detalles</span>
              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-64 border border-slate-800">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
