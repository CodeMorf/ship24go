import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  CheckCircle2,
  Clock,
  ExternalLink,
  Package,
  FileText,
  Truck,
  Send,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Eye,
  Lock
} from 'lucide-react';
import { api } from '../../lib/api';

interface PointManifestsProps {
  point: any;
  onRefreshNeeded?: () => void;
}

export const PointManifests: React.FC<PointManifestsProps> = ({ point, onRefreshNeeded }) => {
  const [currentSaca, setCurrentSaca] = useState<any>(null);
  const [sacaShipments, setSacaShipments] = useState<any[]>([]);
  const [manifestsHistory, setManifestsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [sacaRes, histRes] = await Promise.all([
        api.getCurrentSaca('documents'),
        api.getPointManifests()
      ]);
      setCurrentSaca(sacaRes.manifest);
      setSacaShipments(sacaRes.shipments || []);
      setManifestsHistory(histRes.manifests || []);
    } catch (err: any) {
      console.error('Error cargando manifiestos:', err);
      setMessage({ type: 'error', text: err.message || 'No se pudieron cargar las sacas.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCloseSaca = async () => {
    if (!currentSaca) return;
    const threshold = currentSaca.min_items_threshold || 10;
    const currentCount = sacaShipments.length;

    if (currentCount < threshold) {
      const ok = window.confirm(
        `Atención: La saca tiene ${currentCount} de los ${threshold} documentos requeridos para consolidación óptima.\n\n¿Estás seguro de que deseas cerrarla y enviarla al Hub ahora mismo?`
      );
      if (!ok) return;
    }

    setClosing(true);
    setMessage(null);
    try {
      const res = await api.closePointSaca({
        manifestId: currentSaca.id,
        notes: notes.trim() || undefined
      });
      if (res.success) {
        setMessage({
          type: 'success',
          text: `¡Saca cerrada exitosamente! Se generó el Master Tracking ${res.manifest.master_tracking_code} para el Manifiesto ${res.manifest.manifest_number}.`
        });
        setNotes('');
        await loadData();
        if (onRefreshNeeded) onRefreshNeeded();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'No se pudo cerrar la saca.' });
    } finally {
      setClosing(false);
    }
  };

  const threshold = currentSaca?.min_items_threshold || 10;
  const currentCount = sacaShipments.length;
  const progressPercent = Math.min(100, Math.round((currentCount / threshold) * 100));
  const isReady = currentCount >= threshold;

  return (
    <div className="space-y-7">
      {/* Banner Explicativo de la Regla Especial para RD */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-950 text-white rounded-[2rem] p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-cyan-300 mb-3">
              <FolderArchive className="w-3.5 h-3.5" />
              Regla de Consolidación Internacional · Destino República Dominicana
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Control de Sacas y Manifiestos
            </h2>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">
              Los sobres y documentos con destino a República Dominicana se reciben físicamente en este Point y se agrupan en una <strong>Saca Consolidada</strong>.
              Al alcanzar el mínimo de <strong>10 documentos</strong>, se cierra la saca y se genera el <strong>Master Tracking</strong> hacia el Hub Central de Santo Domingo (HUB-SDQ).
            </p>
          </div>

          <button
            onClick={loadData}
            className="self-start md:self-auto bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Saca
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-2xl p-4 text-sm font-semibold flex items-center gap-3 border ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* SACA ABIERTA ACTUAL */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Saca Abierta en Custodia
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {currentSaca?.manifest_number || 'MAN-DOC-ACTUAL'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ruta: Boston Distribution Hub (HUB-BOS) &rarr; Santo Domingo Central Logistics Hub (HUB-SDQ)
            </p>
          </div>

          <div className="text-right bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 px-5 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-400 uppercase">Documentos Acumulados</span>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="text-3xl font-black text-blue-600 dark:text-cyan-400">{currentCount}</span>
              <span className="text-sm font-bold text-slate-400">/ {threshold}</span>
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESO DE LA SACA */}
        <div className="py-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-600 dark:text-slate-300">Progreso de llenado de la saca:</span>
            <span className={isReady ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-blue-600 dark:text-cyan-400 font-black'}>
              {isReady
                ? '¡Objetivo alcanzado! (Listo para consolidar)'
                : `Faltan ${Math.max(0, threshold - currentCount)} documentos para consolidar`}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isReady
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${Math.max(8, progressPercent)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 text-[11px] text-slate-400 mt-2 font-medium">
            <span>0 documentos</span>
            <span className="text-center font-bold text-slate-600 dark:text-slate-300">5 documentos</span>
            <span className="text-right font-black text-emerald-600 dark:text-emerald-400">10 mínimo requerido</span>
          </div>
        </div>

        {/* ACCIÓN DE CIERRE DE SACA */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-2/3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notas del Manifiesto / Observaciones de Salida (Opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Saca precintada con marchamo de seguridad #7821. Salida en valija courier."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleCloseSaca}
            disabled={closing || currentCount === 0}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isReady
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.02]'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-40 disabled:hover:scale-100`}
          >
            {closing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cerrando y generando manifiesto...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Cerrar Saca y Generar Manifiesto
              </>
            )}
          </button>
        </div>

        {/* LISTADO DE DOCUMENTOS DENTRO DE LA SACA ACTUAL */}
        <div className="mt-8">
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Documentos Físicos dentro de esta Saca ({sacaShipments.length})
          </h4>

          {sacaShipments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              La saca está vacía. Emite documentos desde el Mostrador para acumularlos aquí.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Tracking Cliente</th>
                    <th className="p-3">Remitente</th>
                    <th className="p-3">Destinatario (RD)</th>
                    <th className="p-3">Cobrado</th>
                    <th className="p-3">Comisión</th>
                    <th className="p-3 text-right">Rastreo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sacaShipments.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-black text-blue-600 dark:text-cyan-400">{s.tracking_code}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{s.sender?.name || 'Cliente Mostrador'}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-white">{s.recipient?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[160px]">{s.recipient?.city}, RD</p>
                      </td>
                      <td className="p-3 font-bold">${Number(s.sale_amount || 8).toFixed(2)} USD</td>
                      <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">+${Number(s.commission_amount || 1.5).toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <a
                          href={`/tracking?code=${encodeURIComponent(s.tracking_code)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-cyan-400 font-bold hover:underline"
                        >
                          Ver <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* HISTORIAL DE SACAS Y MANIFIESTOS CERRADOS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xs">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          Historial de Manifiestos y Sacas Enviadas
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Sacas cerradas con su respectivo Master Tracking y estatus de transferencia a Hubs.
        </p>

        {manifestsHistory.filter((m) => m.status !== 'open').length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-bold">
            Aún no hay manifiestos históricos cerrados.
          </div>
        ) : (
          <div className="space-y-4">
            {manifestsHistory
              .filter((m) => m.status !== 'open')
              .map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                        {m.manifest_number}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {m.status}
                      </span>
                    </div>

                    <div className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <p>
                        <strong>Destino:</strong> {m.destination_hub_name || 'Hub Santo Domingo SDQ'}
                      </p>
                      <p>
                        <strong>Total Documentos:</strong> {m.current_items_count || m.total_items} piezas
                      </p>
                      <p>
                        <strong>Fecha Cierre:</strong> {m.closed_at ? new Date(m.closed_at).toLocaleString() : 'Reciente'}
                      </p>
                      <p>
                        <strong>Courier / Valija:</strong> {m.courier_name || 'Ship24Go Air Hub Express'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 px-4 text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Master Tracking Global</span>
                    <span className="font-mono font-black text-blue-700 dark:text-cyan-300 text-sm">
                      {m.master_tracking_code || 'En proceso'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};
