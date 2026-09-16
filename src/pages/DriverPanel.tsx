import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Camera, 
  PenTool, 
  X, 
  RotateCcw, 
  Search, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Package, 
  Calendar,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface StopItem {
  id: string;
  route_id: string;
  shipment_id: string;
  tracking_code: string;
  stop_number: number;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed' | 'rescheduled';
  failure_reason?: string;
  pod_signer_name?: string;
  pod_signer_id?: string;
  pod_signature_image?: string;
  pod_photo_url?: string;
  pod_notes?: string;
  delivered_at?: string;
}

interface ActiveRoute {
  id: string;
  route_code: string;
  hub_name?: string;
  hub_city?: string;
  vehicle_plate?: string;
  status: string;
  total_packages: number;
  completed_packages: number;
  completedCount?: number;
  pendingCount?: number;
  started_at?: string;
  notes?: string;
}

export default function DriverPanel() {
  const [token, setToken] = useState<string>(localStorage.getItem('spedire_token') || '');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState<string>('driver.rd@ship24go.com');
  const [loginPassword, setLoginPassword] = useState<string>('DriverRD2026!*');
  const [loginError, setLoginError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Ruta y paradas
  const [route, setRoute] = useState<ActiveRoute | null>(null);
  const [stops, setStops] = useState<StopItem[]>([]);
  const [selectedStop, setSelectedStop] = useState<StopItem | null>(null);

  // Modales
  const [showPodModal, setShowPodModal] = useState<boolean>(false);
  const [showFailModal, setShowFailModal] = useState<boolean>(false);
  const [submittingPod, setSubmittingPod] = useState<boolean>(false);

  // Formulario POD
  const [signerName, setSignerName] = useState<string>('');
  const [signerId, setSignerId] = useState<string>('');
  const [podNotes, setPodNotes] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [failReason, setFailReason] = useState<string>('Destinatario no se encuentra en el domicilio');
  const [failNotes, setFailNotes] = useState<string>('');

  // Canvas de Firma
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, [token]);

  const checkAuthAndLoad = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/driver/active-route', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('spedire_token');
        setToken('');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUser(data.driver);
        if (data.hasActiveRoute && data.route) {
          setRoute(data.route);
          setStops(data.stops || []);
        } else {
          setRoute(null);
          setStops([]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas');
      
      localStorage.setItem('spedire_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setLoginError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spedire_token');
    setToken('');
    setUser(null);
    setRoute(null);
    setStops([]);
  };

  // Canvas Drawing
  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openPodModal = (stop: StopItem) => {
    setSelectedStop(stop);
    setSignerName(stop.recipient_name);
    setSignerId('');
    setPodNotes('');
    setPhotoBase64('');
    setHasSignature(false);
    setShowPodModal(true);
    setTimeout(() => clearSignature(), 100);
  };

  const openFailModal = (stop: StopItem) => {
    setSelectedStop(stop);
    setFailReason('Destinatario no se encuentra en el domicilio');
    setFailNotes('');
    setShowFailModal(true);
  };

  const submitPod = async () => {
    if (!selectedStop) return;
    if (!signerName.trim()) {
      alert('Por favor indica el nombre de la persona que recibe.');
      return;
    }
    const canvas = canvasRef.current;
    const signatureImage = hasSignature && canvas ? canvas.toDataURL('image/png') : null;

    setSubmittingPod(true);
    try {
      const res = await fetch('/api/driver/stop/complete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stopId: selectedStop.id,
          signerName,
          signerId,
          signatureImage,
          photoUrl: photoBase64 || null,
          notes: podNotes,
          lat: 18.4861,
          lng: -69.9312
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar entrega');

      setShowPodModal(false);
      checkAuthAndLoad();
    } catch (err: any) {
      alert(err.message || 'Error al completar la entrega');
    } finally {
      setSubmittingPod(false);
    }
  };

  const submitFail = async () => {
    if (!selectedStop) return;
    try {
      const res = await fetch('/api/driver/stop/fail', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stopId: selectedStop.id,
          reason: failReason,
          notes: failNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar incidencia');

      setShowFailModal(false);
      checkAuthAndLoad();
    } catch (err: any) {
      alert(err.message || 'Error al registrar incidencia');
    }
  };

  // Vista de Login
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-8">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-400 shadow-lg shadow-blue-500/10">
              <Truck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Ship24GO · Driver App</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">Última Milla & Entregas POD</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loginLoading ? 'Iniciando turno...' : 'Iniciar Turno de Reparto →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <span className="text-xs text-slate-400">Acceso de prueba precargado:</span>
            <div className="text-[11px] font-mono text-blue-400 mt-1">driver.rd@ship24go.com</div>
          </div>
        </div>
      </div>
    );
  }

  // Vista Principal de Chofer (Mobile-First)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/20">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>{user?.name || 'Chofer'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {route?.hub_name || 'HUB Santo Domingo'} · En Turno
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-1"
          title="Cerrar Turno"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Salir</span>
        </button>
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-400 font-mono">Cargando hoja de ruta...</span>
          </div>
        ) : !route ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white">Sin Ruta Activa</h2>
            <p className="text-xs text-slate-400">No tienes una hoja de ruta asignada actualmente desde tu Hub. Consulta con tu supervisor de despacho.</p>
            <button
              onClick={checkAuthAndLoad}
              className="mt-2 text-xs text-blue-400 font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Actualizar estado</span>
            </button>
          </div>
        ) : (
          <>
            {/* Banner de Progreso de Ruta */}
            <div className="bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-900 border border-blue-500/20 rounded-3xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-semibold tracking-wider text-blue-400 uppercase">
                  {route.route_code}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {route.vehicle_plate || 'Unidad de Flota'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-3 mb-1.5">
                <span className="text-2xl font-black text-white">
                  {stops.filter(s => s.status === 'delivered').length}
                  <span className="text-sm font-normal text-slate-400"> / {stops.length} entregas</span>
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {Math.round((stops.filter(s => s.status === 'delivered').length / (stops.length || 1)) * 100)}% Completado
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(stops.filter(s => s.status === 'delivered').length / (stops.length || 1)) * 100}%` }}
                />
              </div>

              {route.notes && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{route.notes}</span>
                </div>
              )}
            </div>

            {/* Listado de Paradas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Paradas del Día</h2>
                <span className="text-[11px] text-slate-500">{stops.length} destinos ordenados</span>
              </div>

              {stops.map((stop, index) => {
                const isDelivered = stop.status === 'delivered';
                const isFailed = stop.status === 'failed';

                return (
                  <div
                    key={stop.id}
                    className={`rounded-2xl border transition-all p-4 ${
                      isDelivered 
                        ? 'bg-slate-900/60 border-emerald-900/40 opacity-80' 
                        : isFailed
                        ? 'bg-rose-950/20 border-rose-900/40'
                        : 'bg-slate-900 border-slate-800 shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isDelivered
                            ? 'bg-emerald-500 text-white'
                            : isFailed
                            ? 'bg-rose-500 text-white'
                            : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {isDelivered ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-white leading-tight">{stop.recipient_name}</h3>
                          <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span>{stop.recipient_address}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 ml-4 font-mono">{stop.recipient_city}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        {stop.tracking_code}
                      </span>
                    </div>

                    {/* Botones de Acción de Parada */}
                    {!isDelivered && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                        {/* Waze / Maps */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.recipient_address + ', ' + stop.recipient_city)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/60"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-400" />
                          <span>Mapa</span>
                        </a>

                        {/* Llamada */}
                        {stop.recipient_phone && (
                          <a
                            href={`tel:${stop.recipient_phone}`}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-1 border border-slate-700/60"
                            title="Llamar"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          </a>
                        )}

                        {/* WhatsApp */}
                        {stop.recipient_phone && (
                          <a
                            href={`https://wa.me/${stop.recipient_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${stop.recipient_name}, soy el chofer de Ship24GO. Tengo su paquete (${stop.tracking_code}) en ruta para entrega hoy.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-1 border border-slate-700/60"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          </a>
                        )}

                        {/* Entregar POD */}
                        <button
                          onClick={() => openPodModal(stop)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Entregar (POD)</span>
                        </button>

                        {/* Incidencia */}
                        <button
                          onClick={() => openFailModal(stop)}
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-xl bg-slate-800/40 border border-slate-700/40"
                          title="Reportar Problema"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {isDelivered && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-emerald-400 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Entregado a: {stop.pod_signer_name || stop.recipient_name}</span>
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {stop.delivered_at ? new Date(stop.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* MODAL DE ENTREGA (POD: FIRMA DIGITAL & FOTO) */}
      {showPodModal && selectedStop && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full mx-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Prueba de Entrega (POD)</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedStop.tracking_code}</p>
              </div>
              <button
                onClick={() => setShowPodModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Datos del Receptor */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre de quien recibe</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={e => setSignerName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cédula / Documento de Identidad (Opcional)</label>
                <input
                  type="text"
                  value={signerId}
                  onChange={e => setSignerId(e.target.value)}
                  placeholder="Ej: 001-1234567-8"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Canvas Firma Táctil */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <PenTool className="w-3.5 h-3.5 text-blue-400" />
                    <span>Firma Digital en Pantalla</span>
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpiar</span>
                  </button>
                </div>
                <div className="border border-slate-700 rounded-2xl overflow-hidden bg-white touch-none">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[140px] cursor-crosshair"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 text-center">El cliente puede firmar directamente con su dedo en la pantalla.</p>
              </div>

              {/* Foto de Evidencia */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>Foto de Entrega (Opcional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 border-dashed rounded-xl p-3 text-center text-xs text-slate-300 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span>{photoBase64 ? 'Cambiar Foto' : 'Tomar / Subir Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {photoBase64 && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500 shrink-0">
                      <img src={photoBase64} alt="Evidencia" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notas u Observaciones</label>
                <input
                  type="text"
                  value={podNotes}
                  onChange={e => setPodNotes(e.target.value)}
                  placeholder="Ej: Entregado en recepción / en mano del cliente"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowPodModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitPod}
                disabled={submittingPod}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                {submittingPod ? 'Confirmando...' : 'Confirmar Entrega ✅'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE INCIDENCIA / PROBLEMA */}
      {showFailModal && selectedStop && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full mx-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Reportar Incidencia</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedStop.tracking_code}</p>
              </div>
              <button
                onClick={() => setShowFailModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Motivo</label>
                <select
                  value={failReason}
                  onChange={e => setFailReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Destinatario no se encuentra en el domicilio">Destinatario ausente</option>
                  <option value="Dirección incorrecta o no localizada">Dirección incorrecta o incompleta</option>
                  <option value="Teléfono apagado o no contesta">Teléfono no contesta</option>
                  <option value="Rechazado por destinatario">Rechazado por destinatario</option>
                  <option value="Zona inaccesible o de riesgo">Zona inaccesible o de riesgo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Detalles adicionales</label>
                <textarea
                  value={failNotes}
                  onChange={e => setFailNotes(e.target.value)}
                  rows={3}
                  placeholder="Detalles del intento de entrega..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowFailModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-semibold"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={submitFail}
                className="flex-1 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Guardar Incidencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
