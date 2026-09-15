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
  Lock,
  Warehouse,
  Barcode,
  Scale,
  Unlock,
  Layers,
  Plane,
  Plus,
  Minus,
  X,
  ChevronRight,
  Sparkles,
  MapPin,
  Check
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal 1: Entrada a Almacén Hub
  const [showInboundModal, setShowInboundModal] = useState(false);
  const [warehouseLocation, setWarehouseLocation] = useState('HUB-BOS · Estante A1 (Valijas RD)');
  const [warehouseTracking, setWarehouseTracking] = useState('');
  const [inboundWeight, setInboundWeight] = useState<number>(5.0);
  const [inboundNotes, setInboundNotes] = useState('');
  const [savingInbound, setSavingInbound] = useState(false);

  // Modal 2: Cotizador de Brokers para la Saca
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteWeight, setQuoteWeight] = useState<number>(5.0);
  const [extraUnits, setExtraUnits] = useState<number>(0);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<any | null>(null);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  // Reabrir Saco
  const [reopening, setReopening] = useState(false);

  // Generador de código de tracking de 6 dígitos numéricos
  const generate6DigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

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

      if (sacaRes.manifest?.total_weight) {
        setInboundWeight(Number(sacaRes.manifest.total_weight) || 5.0);
        setQuoteWeight(Number(sacaRes.manifest.total_weight) || 5.0);
      }
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

  // Abrir modal de Entrada a Almacén
  const handleOpenInboundModal = () => {
    if (!currentSaca) return;
    setWarehouseTracking(generate6DigitCode());
    setShowInboundModal(true);
  };

  // Confirmar Entrada a Almacén
  const handleConfirmInbound = async () => {
    if (!currentSaca) return;
    setSavingInbound(true);
    setMessage(null);
    try {
      const res = await api.warehouseInboundSaca({
        manifestId: currentSaca.id,
        warehouseLocation: warehouseLocation.trim() || 'HUB-BOS · Estante A1 (Valijas RD)',
        warehouseTracking: warehouseTracking.trim() || generate6DigitCode(),
        totalWeight: inboundWeight,
        notes: inboundNotes.trim() || undefined
      });

      if (res.success) {
        setShowInboundModal(false);
        setMessage({
          type: 'success',
          text: `¡Entrada a Almacén exitosa! Saca ubicada en [${warehouseLocation}] con Tracking de Almacén #${res.manifest?.warehouse_tracking || warehouseTracking}. Pasando a cotización de brokers.`
        });
        await loadData();
        if (onRefreshNeeded) onRefreshNeeded();

        // Abrir inmediatamente el cotizador de brokers
        setQuoteWeight(inboundWeight);
        setShowQuoteModal(true);
        fetchQuotes(inboundWeight, 0);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'No se pudo registrar la entrada en almacén.' });
    } finally {
      setSavingInbound(false);
    }
  };

  // Consultar Cotizaciones de Brokers
  const fetchQuotes = async (weight: number, units: number) => {
    setLoadingQuotes(true);
    try {
      const res = await api.quoteManifestBrokers({
        weightKg: weight,
        extraUnits: units
      });
      if (res.success && Array.isArray(res.quotes)) {
        setQuotes(res.quotes);
        const recommended = res.quotes.find((q: any) => q.is_recommended) || res.quotes[0];
        setSelectedBroker(recommended);
      }
    } catch (err: any) {
      console.error('Error calculando cotizaciones:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // Abrir Cotizador Directo
  const handleOpenQuoter = () => {
    const w = Number(currentSaca?.total_weight) || 5.0;
    setQuoteWeight(w);
    setExtraUnits(0);
    setShowQuoteModal(true);
    fetchQuotes(w, 0);
  };

  // Recalcular cotización al modificar peso o unidades
  const handleWeightChange = (newWeight: number) => {
    const validWeight = Math.max(0.5, Math.round(newWeight * 10) / 10);
    setQuoteWeight(validWeight);
    fetchQuotes(validWeight, extraUnits);
  };

  const handleUnitsChange = (newUnits: number) => {
    const validUnits = Math.max(0, newUnits);
    setExtraUnits(validUnits);
    // Cada unidad extra agrega aprox 0.5 kg
    const calculatedWeight = Math.max(0.5, Math.round((5.0 + validUnits * 0.5) * 10) / 10);
    setQuoteWeight(calculatedWeight);
    fetchQuotes(calculatedWeight, validUnits);
  };

  // Confirmar Broker y Despachar Saca
  const handleConfirmDispatch = async () => {
    if (!currentSaca || !selectedBroker) return;
    setDispatching(true);
    setMessage(null);
    try {
      const res = await api.confirmManifestDispatch({
        manifestId: currentSaca.id,
        providerCode: selectedBroker.provider_code,
        courierName: selectedBroker.courier_name,
        serviceName: selectedBroker.service_name,
        quoteAmount: selectedBroker.rate_amount,
        totalWeight: quoteWeight
      });

      if (res.success) {
        setShowQuoteModal(false);
        setMessage({
          type: 'success',
          text: `¡Lote despachado exitosamente con ${selectedBroker.courier_name}! Se generó el Master Tracking Oficial ${res.manifest?.master_tracking_code}.`
        });
        await loadData();
        if (onRefreshNeeded) onRefreshNeeded();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al confirmar despacho del lote.' });
    } finally {
      setDispatching(false);
    }
  };

  // Reabrir Saco para agregar más unidades o peso
  const handleReopenSaca = async () => {
    if (!currentSaca) return;
    const ok = window.confirm(
      '¿Deseas reabrir este saco? Volverá al estado "Abierto en Custodia" para que puedas seguir agregando más sobres físicos desde el mostrador antes de cotizar y despachar.'
    );
    if (!ok) return;

    setReopening(true);
    setMessage(null);
    try {
      const res = await api.reopenPointManifest({ manifestId: currentSaca.id });
      if (res.success) {
        setShowQuoteModal(false);
        setMessage({
          type: 'success',
          text: `El saco ${res.manifest?.manifest_number} ha sido reabierto exitosamente. Ahora puedes ingresar más documentos desde el mostrador.`
        });
        await loadData();
        if (onRefreshNeeded) onRefreshNeeded();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'No se pudo reabrir el saco.' });
    } finally {
      setReopening(false);
    }
  };

  const threshold = currentSaca?.min_items_threshold || 10;
  const currentCount = sacaShipments.length;
  const progressPercent = Math.min(100, Math.round((currentCount / threshold) * 100));
  const isReady = currentCount >= threshold;
  const isClosed = currentSaca?.status === 'closed';
  const isInTransit = currentSaca?.status === 'in_transit_hub';

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
              Control de Sacas, Almacén y Cotización de Brokers
            </h2>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">
              Los sobres y documentos a República Dominicana se agrupan hasta <strong>10 documentos</strong>. Al cerrar el lote, se da entrada en almacén con <strong>ubicación física y tracking de 6 dígitos</strong>, y se cotizan en vivo los <strong>brokers de envío</strong> con opción de reabrir o ajustar peso.
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

      {/* SACA ACTUAL: ABIERTA O EN ALMACÉN */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isClosed ? 'bg-amber-500' : isInTransit ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {isClosed
                  ? 'Saca en Almacén Hub (Cerrada para Despacho)'
                  : isInTransit
                  ? 'Saca Despachada en Vuelo Internacional'
                  : 'Saca Abierta en Custodia'}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {currentSaca?.manifest_number || 'MAN-DOC-ACTUAL'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ruta: Boston Distribution Hub (HUB-BOS) &rarr; Santo Domingo Central Logistics Hub (HUB-SDQ)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Si ya tiene tracking de almacén de 6 dígitos */}
            {currentSaca?.warehouse_tracking && (
              <div className="text-right bg-blue-50 dark:bg-blue-950/50 rounded-2xl p-3 px-4 border border-blue-200 dark:border-blue-800">
                <span className="text-[10px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1 justify-end">
                  <Barcode className="w-3 h-3" /> Tracking Almacén
                </span>
                <span className="text-xl font-black font-mono text-blue-800 dark:text-cyan-300">
                  #{currentSaca.warehouse_tracking}
                </span>
                <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                  {currentSaca.warehouse_location || 'Estante A1'}
                </p>
              </div>
            )}

            <div className="text-right bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 px-5 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-400 uppercase">Documentos</span>
              <div className="flex items-baseline justify-end gap-1 mt-0.5">
                <span className="text-3xl font-black text-blue-600 dark:text-cyan-400">{currentCount}</span>
                <span className="text-sm font-bold text-slate-400">/ {threshold}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESO DE LA SACA */}
        <div className="py-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-600 dark:text-slate-300">Progreso de llenado de la saca:</span>
            <span className={isReady ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-blue-600 dark:text-cyan-400 font-black'}>
              {isReady
                ? '¡Objetivo alcanzado! (Listo para entrada a almacén y cotización)'
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

        {/* BARRA DE ACCIÓN: ENTRADA EN ALMACÉN, COTIZAR BROKERS O REABRIR SACO */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto">
            {isClosed ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Saca en Almacén · #{currentSaca?.warehouse_tracking || '6 Dígitos'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ubicación: <strong>{currentSaca?.warehouse_location || 'Estante A1'}</strong> · Peso: <strong>{Number(currentSaca?.total_weight || 5).toFixed(2)} kg</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Estado operativo de la saca:
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Al completar los 10 documentos, da entrada en almacén, genera el tracking interno de 6 dígitos y cotiza en vivo los brokers de envío.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Si ya está en almacén / cerrada, permite reabrir o cotizar */}
            {isClosed ? (
              <>
                <button
                  onClick={handleReopenSaca}
                  disabled={reopening}
                  className="px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Unlock className="w-4 h-4 text-amber-500" />
                  {reopening ? 'Reabriendo...' : 'Abrir Saco (Modificar)'}
                </button>

                <button
                  onClick={handleOpenQuoter}
                  className="px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Plane className="w-4 h-4" />
                  Cotizar Brokers de Envío
                </button>
              </>
            ) : (
              <button
                onClick={handleOpenInboundModal}
                disabled={currentCount === 0}
                className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isReady
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.02]'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-40 disabled:hover:scale-100`}
              >
                <Warehouse className="w-4 h-4" />
                Cerrar Saca & Entrada en Almacén
              </button>
            )}
          </div>
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

      {/* HISTORIAL DE SACAS Y MANIFIESTOS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xs">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          Historial de Manifiestos y Sacas Enviadas
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Sacas consolidadas, entradas a almacén y cotizaciones de brokers hacia Hub SDQ.
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
                      {m.warehouse_tracking && (
                        <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          Almacén #{m.warehouse_tracking}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <p>
                        <strong>Destino:</strong> {m.destination_hub_name || 'Hub Santo Domingo SDQ'}
                      </p>
                      <p>
                        <strong>Documentos:</strong> {m.current_items_count || m.total_items} piezas ({Number(m.total_weight || 5).toFixed(1)} kg)
                      </p>
                      <p>
                        <strong>Ubicación Almacén:</strong> {m.warehouse_location || 'Estante A1'}
                      </p>
                      <p>
                        <strong>Courier / Broker:</strong> {m.courier_name || 'LogiHub Internacional'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 px-4 text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Master Tracking Global</span>
                    <span className="font-mono font-black text-blue-700 dark:text-cyan-300 text-sm">
                      {m.master_tracking_code || (m.warehouse_tracking ? `WH-${m.warehouse_tracking}` : 'En proceso')}
                    </span>
                    {m.broker_quote_amount && (
                      <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                        Cotizado: ${Number(m.broker_quote_amount).toFixed(2)} USD
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: ENTRADA EN ALMACÉN & CÓDIGO DE 6 DÍGITOS */}
      {/* ========================================================================= */}
      {showInboundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowInboundModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                <Warehouse className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Entrada a Almacén Hub
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consolidación de Saca <strong>{currentSaca?.manifest_number}</strong> ({currentCount} documentos)
                </p>
              </div>
            </div>

            {/* TRACKING DE 6 DÍGITOS GENERADO AUTOMÁTICAMENTE */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-slate-800/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400 tracking-wider flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5" /> Código de Entrada Almacén (6 Dígitos)
                  </span>
                  <div className="text-3xl font-black font-mono tracking-widest text-slate-900 dark:text-white mt-1">
                    {warehouseTracking}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWarehouseTracking(generate6DigitCode())}
                  className="bg-white dark:bg-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerar
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Código único de 6 dígitos generado para control interno, rotulado físico de la saca e inventario en el almacén Hub.
              </p>
            </div>

            <div className="space-y-4">
              {/* UBICACIÓN EN EL ALMACÉN */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
                  Ubicación Física en Almacén Hub:
                </label>
                <input
                  type="text"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  placeholder="Ej. HUB-BOS · Estante A1 (Valijas RD)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                {/* Sugerencias Rápidas de Ubicación */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'HUB-BOS · Estante A1 (Valijas RD)',
                    'HUB-BOS · Zona B (Consolidados SDQ)',
                    'HUB-BOS · Rack 3 (Express Caribe)',
                    'HUB-BOS · Muelle Central Despacho'
                  ].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setWarehouseLocation(loc)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        warehouseLocation === loc
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {loc.split('·')[1]?.trim() || loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* PESO DE LA SACA */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  <Scale className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
                  Peso Total Pesado en Báscula (kg):
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInboundWeight((prev) => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10))}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    -
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={inboundWeight}
                      onChange={(e) => setInboundWeight(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-center text-sm font-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">kg</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInboundWeight((prev) => Math.round((prev + 0.5) * 10) / 10)}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-white flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* OBSERVACIONES / MARCHAMO */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Observaciones / Precinto de Seguridad:
                </label>
                <input
                  type="text"
                  value={inboundNotes}
                  onChange={(e) => setInboundNotes(e.target.value)}
                  placeholder="Ej. Saca precintada con marchamo #7821. Lista para cotizar broker."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="mt-7 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowInboundModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmInbound}
                disabled={savingInbound}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-40"
              >
                {savingInbound ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando en Almacén...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Dar Entrada en Almacén y Cotizar Brokers
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: COTIZADOR DE BROKERS DE ENVÍO & AJUSTE DE PESO / UNIDADES */}
      {/* ========================================================================= */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Cotizador de Brokers para Saca Consolidada
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ruta: Boston (HUB-BOS) &rarr; Santo Domingo (HUB-SDQ) · Saca <strong>{currentSaca?.manifest_number}</strong>
                </p>
              </div>

              {currentSaca?.warehouse_tracking && (
                <div className="text-right">
                  <span className="text-[10px] font-mono font-black text-blue-600 dark:text-cyan-400 block">
                    Almacén #{currentSaca.warehouse_tracking}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentSaca.warehouse_location || 'Estante A1'}
                  </span>
                </div>
              )}
            </div>

            {/* PANEL DE CONTROL DE PESO Y UNIDADES (RECALCULA EN VIVO) */}
            <div className="my-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Ajustar Peso y Unidades de la Saca
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Cotización en tiempo real
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Control de Peso Total */}
                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    Peso Total Consolidado (kg):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleWeightChange(quoteWeight - 0.5)}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-slate-200"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={quoteWeight}
                      onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0.5)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1 px-2 text-center font-black text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleWeightChange(quoteWeight + 0.5)}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                    <span>Mín: 0.5 kg</span>
                    <span>Actual: {quoteWeight.toFixed(1)} kg</span>
                  </div>
                </div>

                {/* Control de Unidades Extras */}
                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    Piezas / Unidades Totales:
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black text-blue-600 dark:text-cyan-400">
                      {currentCount + extraUnits} <span className="text-xs font-normal text-slate-400">docs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 2, 5].map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => handleUnitsChange(u)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                            extraUnits === u
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          +{u}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {extraUnits > 0 ? `+${extraUnits} unidades agregadas a la cotización` : '10 unidades base en saca'}
                  </p>
                </div>
              </div>
            </div>

            {/* LISTA DE BROKERS COTIZADOS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Brokers Disponibles para Despacho:
                </span>
                {loadingQuotes && (
                  <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recalculando tarifas...
                  </span>
                )}
              </div>

              {quotes.map((broker, bIdx) => {
                const isSelected = selectedBroker && (
                  (broker.rate_id && selectedBroker.rate_id === broker.rate_id) ||
                  (!broker.rate_id && selectedBroker.provider_code === broker.provider_code && selectedBroker.service_name === broker.service_name)
                );
                return (
                  <div
                    key={broker.rate_id || `${broker.provider_code}-${bIdx}`}
                    onClick={() => setSelectedBroker(broker)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {broker.courier_name}
                          </span>
                          {broker.is_live_api && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              API en Vivo
                            </span>
                          )}
                          {broker.tag && (
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                broker.is_recommended
                                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {broker.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {broker.service_name} · <strong>{broker.transit_days}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {broker.per_kg_detail}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                        <span className="text-2xl font-black text-blue-600 dark:text-cyan-400">
                          ${broker.rate_amount.toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
                        </span>
                        <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-blue-600 font-black' : 'text-slate-400'}`}>
                          {isSelected ? '✓ Seleccionado' : 'Clic para seleccionar'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PIE DEL MODAL CON ACCIONES: DESPACHAR O REABRIR SACO */}
            <div className="mt-7 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReopenSaca}
                disabled={reopening || dispatching}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-500" />
                {reopening ? 'Reabriendo...' : 'Abrir Saco (Modificar Piezas)'}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  disabled={dispatching || !selectedBroker}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-40"
                >
                  {dispatching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando Guía Master...
                    </>
                  ) : (
                    <>
                      <Plane className="w-4 h-4" />
                      Generar Guía Master y Despachar con {selectedBroker?.courier_name || 'Broker'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

