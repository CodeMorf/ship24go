import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Package, 
  Truck, 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  ChevronRight, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Calendar, 
  MapPin, 
  UserCheck, 
  X,
  Send,
  Plus,
  ArrowDownLeft,
  Check,
  AlertTriangle
} from 'lucide-react';

interface HubItem {
  id: string;
  code: string;
  name: string;
  hub_type: string;
  country: string;
  city: string;
  state_province?: string;
  postal_code?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  manager_name?: string;
  phone?: string;
  email?: string;
  operating_hours?: string;
  capacity_daily?: number;
  inboundManifests: number;
  receivedManifests: number;
  inventoryPackages: number;
  activeDrivers: number;
}

interface ManifestItem {
  id: string;
  manifest_number: string;
  point_id: string;
  point_name?: string;
  point_city?: string;
  origin_hub_id: string;
  destination_hub_id: string;
  category: string;
  total_items: number;
  current_items_count: number;
  total_weight: number;
  status: string;
  master_tracking_code?: string;
  courier_name?: string;
  provider_code?: string;
  broker_quote_service?: string;
  broker_quote_amount?: number;
  created_at: string;
  dispatched_at?: string;
  received_at?: string;
}

interface PackageItem {
  id: string;
  tracking_code: string;
  status: string;
  status_label: string;
  manifest_id?: string;
  manifest_number?: string;
  sender?: any;
  recipient?: any;
  created_at: string;
}

interface DriverItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface RouteItem {
  id: string;
  route_code: string;
  driver_name: string;
  driver_phone?: string;
  vehicle_plate?: string;
  status: string;
  total_packages: number;
  completed_packages: number;
  created_at: string;
}

export default function HubPanel() {
  const [token] = useState<string>(localStorage.getItem('spedire_token') || '');
  const [hubs, setHubs] = useState<HubItem[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string>('hub_sdq_01');
  const [selectedHub, setSelectedHub] = useState<HubItem | null>(null);
  const [activeTab, setActiveTab] = useState<'inbound' | 'deconsolidate' | 'dispatch' | 'routes' | 'office'>('inbound');
  const [officeForm, setOfficeForm] = useState<any>({});
  const [savingOffice, setSavingOffice] = useState<boolean>(false);
  const [officeSaveMsg, setOfficeSaveMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Datos del Hub
  const [manifests, setManifests] = useState<ManifestItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);

  // Escaneo Inbound
  const [inboundScanCode, setInboundScanCode] = useState<string>('');
  const [inboundLoading, setInboundLoading] = useState<boolean>(false);
  const [inboundMessage, setInboundMessage] = useState<string>('');

  // Desconsolidación
  const [selectedManifestForDecon, setSelectedManifestForDecon] = useState<ManifestItem | null>(null);
  const [manifestShipments, setManifestShipments] = useState<any[]>([]);
  const [scannedTrackings, setScannedTrackings] = useState<string[]>([]);
  const [currentScanInput, setCurrentScanInput] = useState<string>('');
  const [deconLoading, setDeconLoading] = useState<boolean>(false);

  // Asignación de Ruta a Chofer
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [vehiclePlate, setVehiclePlate] = useState<string>('L-394821 (Furgoneta Blanca)');
  const [routeNotes, setRouteNotes] = useState<string>('Polígono Central Santo Domingo');
  const [creatingRoute, setCreatingRoute] = useState<boolean>(false);

  // Modal Hoja de Ruta
  const [showDispatchSheet, setShowDispatchSheet] = useState<boolean>(false);
  const [dispatchSheetData, setDispatchSheetData] = useState<any>(null);

  useEffect(() => {
    loadHubs();
  }, []);

  useEffect(() => {
    if (selectedHubId) {
      loadHubData(selectedHubId);
    }
  }, [selectedHubId]);

  const loadHubs = async () => {
    try {
      const res = await fetch('/api/hubs/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.hubs?.length) {
        setHubs(data.hubs);
        const current = data.hubs.find((h: any) => h.id === selectedHubId) || data.hubs[0];
        setSelectedHub(current);
        setSelectedHubId(current.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadHubData = async (hubId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hubs/${hubId}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedHub(data.hub);
        setOfficeForm(data.hub || {});
        setManifests(data.manifests || []);
        setPackages(data.packages || []);
        setDrivers(data.drivers || []);
        setRoutes(data.routes || []);
        if (data.drivers?.length && !selectedDriverId) {
          setSelectedDriverId(data.drivers[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Inbound Valija
  const handleInboundScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboundScanCode.trim()) return;
    setInboundLoading(true);
    setInboundMessage('');
    try {
      const res = await fetch('/api/hubs/manifests/inbound', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hubId: selectedHubId,
          masterTrackingOrCode: inboundScanCode.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al recibir la valija');

      setInboundMessage(data.message || 'Valija recibida con éxito.');
      setInboundScanCode('');
      loadHubData(selectedHubId);
    } catch (err: any) {
      alert(err.message || 'Error en recepción');
    } finally {
      setInboundLoading(false);
    }
  };

  // Cargar valija para desconsolidar
  const startDeconsolidation = async (manifest: ManifestItem) => {
    setSelectedManifestForDecon(manifest);
    setScannedTrackings([]);
    try {
      const res = await fetch(`/api/point/manifests/${manifest.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.shipments) {
        setManifestShipments(data.shipments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Escaneo individual de paquete
  const handleScanPackage = (e: React.FormEvent) => {
    e.preventDefault();
    const code = currentScanInput.trim().toUpperCase();
    if (!code) return;
    if (!scannedTrackings.includes(code)) {
      setScannedTrackings(prev => [...prev, code]);
    }
    setCurrentScanInput('');
  };

  // Finalizar desconsolidación
  const finalizeDeconsolidation = async () => {
    if (!selectedManifestForDecon) return;
    setDeconLoading(true);
    try {
      const res = await fetch('/api/hubs/manifests/deconsolidate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          manifestId: selectedManifestForDecon.id,
          scannedTrackings
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar desconsolidación');

      alert(data.message);
      setSelectedManifestForDecon(null);
      setManifestShipments([]);
      setScannedTrackings([]);
      loadHubData(selectedHubId);
      setActiveTab('dispatch');
    } catch (err: any) {
      alert(err.message || 'Error');
    } finally {
      setDeconLoading(false);
    }
  };

  // Crear ruta para chofer
  const handleCreateRoute = async () => {
    if (!selectedPackageIds.length) {
      alert('Selecciona al menos un paquete para armar la ruta.');
      return;
    }
    if (!selectedDriverId) {
      alert('Selecciona un chofer para la ruta.');
      return;
    }
    setCreatingRoute(true);
    try {
      const selectedTrackings = packages
        .filter(p => selectedPackageIds.includes(p.id))
        .map(p => p.tracking_code);

      const res = await fetch('/api/hubs/routes/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hubId: selectedHubId,
          driverId: selectedDriverId,
          vehiclePlate,
          trackingCodes: selectedTrackings,
          notes: routeNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la ruta');

      alert(data.message);
      setSelectedPackageIds([]);
      loadHubData(selectedHubId);
      setActiveTab('routes');
    } catch (err: any) {
      alert(err.message || 'Error al crear ruta');
    } finally {
      setCreatingRoute(false);
    }
  };

  // Guardar Cambios de Oficina & GPS
  const handleSaveOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOffice(true);
    setOfficeSaveMsg('');
    try {
      const res = await fetch(`/api/hubs/${selectedHubId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(officeForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar oficina');
      setOfficeSaveMsg(data.message || 'Datos de oficina guardados correctamente.');
      loadHubData(selectedHubId);
      loadHubs();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar');
    } finally {
      setSavingOffice(false);
    }
  };

  // Detectar GPS del dispositivo
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setOfficeForm((prev: any) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(7)),
          longitude: Number(pos.coords.longitude.toFixed(7))
        }));
        alert(`Coordenadas detectadas: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
      },
      err => alert(`Error al detectar GPS: ${err.message}`)
    );
  };

  // Ver Hoja de Ruta
  const openDispatchSheet = async (manifestId: string) => {
    try {
      const res = await fetch(`/api/point/manifests/${manifestId}/dispatch-sheet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDispatchSheetData(data);
        setShowDispatchSheet(true);
      }
    } catch (e) {
      alert('No se pudo cargar la hoja de ruta');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Centro Logístico & Hub</h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {selectedHub?.code || 'HUB'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{selectedHub?.name} · {selectedHub?.city}, {selectedHub?.country}</p>
            </div>
          </div>

          {/* Selector de Hub Activo */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Cambiar Hub:</span>
            <select
              value={selectedHubId}
              onChange={e => setSelectedHubId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              {hubs.map(h => (
                <option key={h.id} value={h.id}>
                  {h.code} · {h.city}, {h.country} ({h.hub_type.toUpperCase()})
                </option>
              ))}
            </select>
            <button
              onClick={() => loadHubData(selectedHubId)}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white border border-slate-700/60"
              title="Recargar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Valijas en Tránsito</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {manifests.filter(m => ['in_transit_hub', 'dispatched_intl'].includes(m.status)).length}
            </div>
            <span className="text-[11px] text-amber-400 font-mono mt-0.5 block">Vuelos / Brokers en camino</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Valijas Arribadas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {manifests.filter(m => m.status === 'received_hub').length}
            </div>
            <span className="text-[11px] text-emerald-400 font-mono mt-0.5 block">Listas para desconsolidar</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Paquetes en Bodega</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{packages.length}</div>
            <span className="text-[11px] text-indigo-400 font-mono mt-0.5 block">Para reparto última milla</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Choferes Activos</span>
              <Truck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{drivers.length}</div>
            <span className="text-[11px] text-blue-400 font-mono mt-0.5 block">Equipo de distribución</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('inbound')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'inbound'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>1. Recepción de Valijas (Inbound)</span>
          </button>

          <button
            onClick={() => setActiveTab('deconsolidate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'deconsolidate'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Desconsolidación & Conteo</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'dispatch'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>3. Asignación a Choferes</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'routes'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>4. Rutas en Calle</span>
          </button>

          <button
            onClick={() => setActiveTab('office')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'office'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>5. Oficina & GPS</span>
          </button>
        </div>

        {/* TAB 1: INBOUND VALIJAS */}
        {activeTab === 'inbound' && (
          <div className="space-y-6">
            {/* Escáner de Llegada */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/20 rounded-3xl p-6 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <QrCode className="w-5 h-5 text-indigo-400" />
                <span>Escáner de Arribo de Valijas / Master Tracking</span>
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Escanea el código de barras o Master Tracking (`MST-...` / `MAN-...`) que viene en la valija entregada por el broker para registrar su entrada física al Hub.
              </p>

              {inboundMessage && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{inboundMessage}</span>
                </div>
              )}

              <form onSubmit={handleInboundScan} className="flex gap-2 max-w-xl">
                <input
                  type="text"
                  value={inboundScanCode}
                  onChange={e => setInboundScanCode(e.target.value)}
                  placeholder="Ej: MST-DOC-94819281 o MAN-DOC-2026-8491"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={inboundLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{inboundLoading ? 'Verificando...' : 'Confirmar Llegada'}</span>
                </button>
              </form>
            </div>

            {/* Listado de Valijas */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Valijas y Manifiestos Hacia este Hub</h3>
                <span className="text-xs text-slate-400 font-mono">{manifests.length} valijas registradas</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-700/60 font-mono">
                    <tr>
                      <th className="py-3 px-4">Manifiesto / Master Tracking</th>
                      <th className="py-3 px-4">Origen</th>
                      <th className="py-3 px-4">Bultos / Peso</th>
                      <th className="py-3 px-4">Broker / Servicio</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {manifests.map(m => (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white font-mono">{m.manifest_number}</div>
                          <div className="text-[11px] text-indigo-400 font-mono">{m.master_tracking_code || 'Sin Master'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200">{m.point_name || 'Point Afiliado'}</div>
                          <div className="text-[11px] text-slate-400">{m.point_city || 'Boston, US'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-white">{m.current_items_count || m.total_items} bultos</span>
                          <div className="text-[11px] text-slate-400">{m.total_weight} kg</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200">{m.courier_name || 'Direct Air Corridor'}</div>
                          <div className="text-[11px] text-slate-400">{m.broker_quote_service || 'LogiHub Express'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            m.status === 'received_hub'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : m.status === 'completed'
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {m.status === 'received_hub' ? 'Arribado al Hub' : m.status === 'completed' ? 'Desconsolidado' : 'En Tránsito'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => openDispatchSheet(m.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                            title="Ver Hoja de Ruta"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {m.status === 'received_hub' && (
                            <button
                              onClick={() => {
                                startDeconsolidation(m);
                                setActiveTab('deconsolidate');
                              }}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                            >
                              Desconsolidar →
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DESCONSOLIDACIÓN */}
        {activeTab === 'deconsolidate' && (
          <div className="space-y-6">
            {!selectedManifestForDecon ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <Layers className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">Selecciona una valija para desconsolidar</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Ve a la pestaña de Inbound y haz clic en "Desconsolidar" en cualquiera de las valijas que ya arribaron al Hub.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-indigo-400 font-mono font-bold uppercase">Desconsolidando Manifiesto</span>
                    <h2 className="text-xl font-black text-white font-mono">{selectedManifestForDecon.manifest_number}</h2>
                    <p className="text-xs text-slate-400">Master Tracking: {selectedManifestForDecon.master_tracking_code}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Progreso de Apertura</span>
                      <div className="text-lg font-black text-emerald-400">
                        {scannedTrackings.length} / {manifestShipments.length} verificados
                      </div>
                    </div>
                    <button
                      onClick={finalizeDeconsolidation}
                      disabled={deconLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30"
                    >
                      {deconLoading ? 'Guardando...' : 'Finalizar Ingreso a Almacén ✅'}
                    </button>
                  </div>
                </div>

                {/* Caja de Escaneo Individual */}
                <form onSubmit={handleScanPackage} className="flex gap-2 max-w-lg">
                  <input
                    type="text"
                    value={currentScanInput}
                    onChange={e => setCurrentScanInput(e.target.value)}
                    placeholder="Escanear tracking de paquete (ej: S24-...)"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Escanear
                  </button>
                </form>

                {/* Lista de bultos con verificación visual */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {manifestShipments.map(s => {
                    const isScanned = scannedTrackings.includes(String(s.tracking_code).trim().toUpperCase());
                    const rec = s.recipient || {};

                    return (
                      <div
                        key={s.id}
                        className={`border rounded-2xl p-3.5 transition-all ${
                          isScanned
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-white">{s.tracking_code}</span>
                          {isScanned ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Verificado
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-medium text-slate-200">{rec.name || 'Destinatario'}</div>
                        <div className="text-[11px] text-slate-400">{rec.city || 'Santo Domingo'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASIGNACIÓN A CHOFERES */}
        {activeTab === 'dispatch' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Paquetes en Bodega Listos para Reparto</h3>
                  <p className="text-xs text-slate-400">Selecciona los paquetes y asígnalos al chofer correspondiente para generar su ruta.</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedDriverId}
                    onChange={e => setSelectedDriverId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold"
                  >
                    <option value="">-- Seleccionar Chofer --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.phone || 'Sin tel'})</option>
                    ))}
                  </select>

                  <button
                    onClick={handleCreateRoute}
                    disabled={creatingRoute || !selectedPackageIds.length}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>{creatingRoute ? 'Creando...' : `Despachar (${selectedPackageIds.length})`}</span>
                  </button>
                </div>
              </div>

              {/* Parámetros de Ruta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Placa / Vehículo</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={e => setVehiclePlate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Zona / Notas de Ruta</label>
                  <input
                    type="text"
                    value={routeNotes}
                    onChange={e => setRouteNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Tabla de paquetes para selección */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-700/60 font-mono">
                    <tr>
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedPackageIds.length === packages.length && packages.length > 0}
                          onChange={e => {
                            if (e.target.checked) setSelectedPackageIds(packages.map(p => p.id));
                            else setSelectedPackageIds([]);
                          }}
                        />
                      </th>
                      <th className="py-2.5 px-3">Tracking</th>
                      <th className="py-2.5 px-3">Destinatario</th>
                      <th className="py-2.5 px-3">Dirección</th>
                      <th className="py-2.5 px-3">Teléfono</th>
                      <th className="py-2.5 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {packages.map(p => {
                      const rec = p.recipient || {};
                      const isSelected = selectedPackageIds.includes(p.id);

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) setSelectedPackageIds(prev => [...prev, p.id]);
                                else setSelectedPackageIds(prev => prev.filter(id => id !== p.id));
                              }}
                            />
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-white">{p.tracking_code}</td>
                          <td className="py-3 px-3 font-semibold text-slate-200">{rec.name || 'Destinatario'}</td>
                          <td className="py-3 px-3 text-slate-400">{rec.address || rec.city}</td>
                          <td className="py-3 px-3 text-slate-400 font-mono">{rec.phone || 'N/A'}</td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {p.status_label || p.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RUTAS EN CALLE */}
        {activeTab === 'routes' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4">Rutas de Última Milla Despachadas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-700/60 font-mono">
                  <tr>
                    <th className="py-3 px-4">Código de Ruta</th>
                    <th className="py-3 px-4">Chofer Asignado</th>
                    <th className="py-3 px-4">Vehículo</th>
                    <th className="py-3 px-4">Progreso de Entregas</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {routes.map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{r.route_code}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {r.driver_name}
                        <div className="text-[11px] text-slate-400 font-mono">{r.driver_phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{r.vehicle_plate || 'Flota'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono">{r.completed_packages} / {r.total_packages}</span>
                          <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${Math.round((r.completed_packages / (r.total_packages || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {r.status === 'completed' ? 'Completada' : 'En Ruta'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* TAB 5: OFICINA Y COORDENADAS GPS */}
        {activeTab === 'office' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" /> Ficha Técnica de Oficina & Geolocalización
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedHub?.code}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white">{selectedHub?.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedHub?.address} · {selectedHub?.city}, {selectedHub?.state_province || ''} ({selectedHub?.country})
                  </p>
                </div>

                {selectedHub?.latitude != null && selectedHub?.longitude != null && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${selectedHub.latitude},${selectedHub.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Abrir en Google Maps ↗</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Coordenadas actuales pill */}
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Latitud</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {selectedHub?.latitude != null ? Number(selectedHub.latitude).toFixed(6) : 'No fijada'}
                  </span>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Longitud</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {selectedHub?.longitude != null ? Number(selectedHub.longitude).toFixed(6) : 'No fijada'}
                  </span>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Zona Horaria</span>
                  <span className="font-mono text-xs font-semibold text-slate-200 truncate block">
                    {selectedHub?.timezone || 'America/Santo_Domingo'}
                  </span>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Capacidad Diaria</span>
                  <span className="font-mono text-sm font-bold text-indigo-400">
                    {selectedHub?.capacity_daily || 500} paquetes/día
                  </span>
                </div>
              </div>
            </div>

            {/* Formulario de Edición */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Editar Ubicación y Datos Operativos</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Estos datos son utilizados automáticamente por el sistema para enriquecer los eventos de trazabilidad del cliente con coordenadas GPS reales.
              </p>

              {officeSaveMsg && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{officeSaveMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveOffice} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Nombre del Hub</label>
                    <input
                      type="text"
                      value={officeForm.name || ''}
                      onChange={e => setOfficeForm({ ...officeForm, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Código de Hub</label>
                    <input
                      type="text"
                      value={officeForm.code || ''}
                      onChange={e => setOfficeForm({ ...officeForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Tipo de Instalación</label>
                    <select
                      value={officeForm.hub_type || 'transit'}
                      onChange={e => setOfficeForm({ ...officeForm, hub_type: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="origin">Hub de Origen (Recepción y Consolidación)</option>
                      <option value="transit">Hub de Tránsito Internacional / Gateway</option>
                      <option value="destination">Hub de Destino (Desconsolidación y Última Milla)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Dirección Física Completa</label>
                    <input
                      type="text"
                      value={officeForm.address || ''}
                      onChange={e => setOfficeForm({ ...officeForm, address: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Ej: Av. Luperón 45, Zona Industrial de Herrera"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Ciudad</label>
                    <input
                      type="text"
                      value={officeForm.city || ''}
                      onChange={e => setOfficeForm({ ...officeForm, city: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Estado / Provincia</label>
                    <input
                      type="text"
                      value={officeForm.state_province || ''}
                      onChange={e => setOfficeForm({ ...officeForm, state_province: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">País (ISO 2)</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={officeForm.country || ''}
                      onChange={e => setOfficeForm({ ...officeForm, country: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                      placeholder="US, DO..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Código Postal</label>
                    <input
                      type="text"
                      value={officeForm.postal_code || ''}
                      onChange={e => setOfficeForm({ ...officeForm, postal_code: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Zona Horaria</label>
                    <input
                      type="text"
                      value={officeForm.timezone || ''}
                      onChange={e => setOfficeForm({ ...officeForm, timezone: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="America/Santo_Domingo"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Capacidad Máx. Diaria</label>
                    <input
                      type="number"
                      value={officeForm.capacity_daily || ''}
                      onChange={e => setOfficeForm({ ...officeForm, capacity_daily: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="500"
                    />
                  </div>
                </div>

                {/* Sección Coordenadas GPS */}
                <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Coordenadas GPS de la Oficina (Lat/Lng)
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>📍 Detectar mi GPS Actual</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 mb-1 block">Latitud Decimal (Ej: 18.4861)</label>
                      <input
                        type="number"
                        step="any"
                        value={officeForm.latitude ?? ''}
                        onChange={e => setOfficeForm({ ...officeForm, latitude: e.target.value ? Number(e.target.value) : null })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 mb-1 block">Longitud Decimal (Ej: -69.9312)</label>
                      <input
                        type="number"
                        step="any"
                        value={officeForm.longitude ?? ''}
                        onChange={e => setOfficeForm({ ...officeForm, longitude: e.target.value ? Number(e.target.value) : null })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contacto y Horarios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Gerente / Encargado</label>
                    <input
                      type="text"
                      value={officeForm.manager_name || ''}
                      onChange={e => setOfficeForm({ ...officeForm, manager_name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Teléfono de Oficina</label>
                    <input
                      type="text"
                      value={officeForm.phone || ''}
                      onChange={e => setOfficeForm({ ...officeForm, phone: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Horario Operativo</label>
                    <input
                      type="text"
                      value={officeForm.operating_hours || ''}
                      onChange={e => setOfficeForm({ ...officeForm, operating_hours: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Lun-Sáb 7:00-20:00"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={savingOffice}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingOffice ? 'Guardando...' : 'Guardar Datos de Oficina & GPS'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* MODAL HOJA DE RUTA BROKER (DISPATCH SHEET) */}
      {showDispatchSheet && dispatchSheetData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl max-w-3xl w-full p-8 space-y-6 shadow-2xl print:p-0 print:shadow-none">
            {/* Cabecera para Imprimir */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-200">
              <div>
                <div className="text-xl font-black tracking-tight text-blue-600">SHIP24GO</div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Hoja de Ruta / Manifiesto de Despacho Broker</div>
                <div className="text-xs text-slate-600 mt-1">
                  Sucursal de Origen: <span className="font-bold">{dispatchSheetData.originPoint?.businessName}</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-sm font-black">{dispatchSheetData.manifest?.manifest_number}</div>
                <div className="text-xs text-blue-600 font-bold">MASTER: {dispatchSheetData.manifest?.master_tracking_code || 'N/A'}</div>
                <div className="text-[10px] text-slate-400">{new Date().toLocaleString()}</div>
              </div>
            </div>

            {/* Metadatos de Ruta */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Transportista / Broker:</span>
                <span className="font-bold">{dispatchSheetData.manifest?.courier_name || 'Corredor LogiHub Directo'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Hub de Destino:</span>
                <span className="font-bold">{dispatchSheetData.manifest?.destination_hub_name || 'HUB Santo Domingo (SDQ)'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Bultos / Peso:</span>
                <span className="font-bold font-mono">{dispatchSheetData.shipments?.length} bultos · {dispatchSheetData.manifest?.total_weight} kg</span>
              </div>
            </div>

            {/* Tabla de Envíos Consolidados */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-mono text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Tracking Cliente</th>
                    <th className="py-2 px-3">Destinatario</th>
                    <th className="py-2 px-3">Ciudad Destino</th>
                    <th className="py-2 px-3 text-right">Monto / Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dispatchSheetData.shipments?.map((s: any, idx: number) => (
                    <tr key={s.id}>
                      <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{s.tracking_code}</td>
                      <td className="py-2 px-3 font-medium">{s.recipient?.name || 'Cliente'}</td>
                      <td className="py-2 px-3 text-slate-500">{s.recipient?.city || 'Santo Domingo'}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">${Number(s.sale_amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Firmas de Custodia */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
              <div className="border-t border-dashed border-slate-400 pt-2 text-center">
                <span className="block text-xs font-bold">Entregado por: Operador de Sucursal</span>
                <span className="text-[11px] text-slate-500">{dispatchSheetData.originPoint?.businessName}</span>
                <div className="h-10"></div>
                <span className="block text-[10px] text-slate-400">Firma y Sello</span>
              </div>

              <div className="border-t border-dashed border-slate-400 pt-2 text-center">
                <span className="block text-xs font-bold">Recibido en Custodia: Courier / Broker</span>
                <span className="text-[11px] text-slate-500">{dispatchSheetData.manifest?.courier_name || 'Transportista'}</span>
                <div className="h-10"></div>
                <span className="block text-[10px] text-slate-400">Firma, Nombre y Cédula</span>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
              <button
                onClick={() => setShowDispatchSheet(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Hoja de Ruta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
