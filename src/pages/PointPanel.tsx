import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Clipboard, ExternalLink, FileText, LogOut, MapPin, MessageSquare, Moon, PackagePlus, RefreshCw, Send, ShieldAlert, Store, Sun, User, Wallet, X, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getAuthToken, removeAuthToken } from '../lib/api';
import { CountrySelect } from '../components/CountrySelect';
import { BrandMark } from '../lib/brand';
import { useTheme } from '../lib/theme';

const STATUS_LABELS: Record<string, string> = { pending: 'Pendiente de revisión', approved: 'Aprobado', suspended: 'Suspendido', rejected: 'Rechazado' };
const STATUS_STYLES: Record<string, string> = { pending: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', approved: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', suspended: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', rejected: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' };

function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{STATUS_LABELS[status] || status}</span>;
}

export default function PointPanel() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [point, setPoint] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ productCode: '', saleAmount: '', recipientName: '', recipientAddress: '', recipientCity: '', recipientCountry: 'DO', postalCode: '', recipientPhone: '', recipientEmail: '' });

  // Estado del Chat con Ejecutivo
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    if (!getAuthToken()) { navigate('/auth/login', { replace: true }); return; }
    setLoading(true); setError('');
    try {
      const [pointResponse, productResponse, operationResponse] = await Promise.all([api.getPointMe(), api.getPointProducts(), api.getPointOperations()]);
      setPoint(pointResponse.point);
      setProducts(productResponse.products || []);
      setOperations(operationResponse.operations || []);
      if (!form.productCode && productResponse.products?.[0]) setForm((current) => ({ ...current, productCode: productResponse.products[0].code }));
    } catch (err: any) {
      if (String(err.message || '').includes('no tiene un Point')) navigate('/point/register', { replace: true });
      else setError(err.message || 'No se pudo cargar el panel Point.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Lógica de Chat
  const loadChat = async () => {
    try {
      const res = await (api as any).getPointChat();
      setChatMessages(res.messages || []);
      if (point) setPoint((prev: any) => ({ ...prev, unreadChatCount: 0 }));
    } catch (e) {
      console.error('Error cargando chat:', e);
    }
  };

  const openChatModal = async () => {
    setShowChat(true);
    setChatLoading(true);
    try {
      await loadChat();
    } finally {
      setChatLoading(false);
    }
  };

  // Polling automático cuando el chat está abierto
  useEffect(() => {
    if (!showChat) return;
    const interval = setInterval(loadChat, 3500);
    return () => clearInterval(interval);
  }, [showChat]);

  useEffect(() => {
    if (showChat && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatSending) return;
    const text = chatInput.trim();
    setChatInput('');
    setChatSending(true);
    try {
      await (api as any).sendPointChat(text);
      await loadChat();
    } catch (err: any) {
      alert(err.message || 'No se pudo enviar el mensaje.');
    } finally {
      setChatSending(false);
    }
  };

  const totalCommission = useMemo(() => operations.reduce((sum, operation) => sum + Number(operation.commissionAmount || 0), 0), [operations]);
  const update = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submitOperation = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError(''); setNotice('');
    try {
      const response = await api.createPointOperation(form);
      setNotice(`Operación creada. Tracking: ${response.operation.trackingCode}`);
      setForm((current) => ({ ...current, saleAmount: '', recipientName: '', recipientAddress: '', recipientCity: '', postalCode: '', recipientPhone: '', recipientEmail: '' }));
      await load();
    } catch (err: any) { setError(err.message || 'No se pudo crear la operación.'); }
    finally { setSubmitting(false); }
  };

  const logout = () => { removeAuthToken(); navigate('/auth/login'); };

  if (loading && !point) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 grid place-items-center text-slate-900 dark:text-white"><div className="text-center"><div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" /><p className="mt-4 font-bold">Cargando panel Point…</p></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors relative">
      <header className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <Link to="/"><BrandMark iconClassName="w-9 h-9 rounded-xl" textClassName="text-xl text-slate-900 dark:text-white" /></Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-300">Panel Point</span>
            <button
              onClick={openChatModal}
              className="relative rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3 py-2 text-xs font-bold text-blue-600 dark:text-cyan-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat con Ejecutivo</span>
              {Boolean(point?.unreadChatCount) && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
            <button type="button" onClick={toggleTheme} className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 p-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors" title={isDark ? 'Usar modo claro' : 'Usar modo oscuro'} aria-label={isDark ? 'Usar modo claro' : 'Usar modo oscuro'}>{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
            <button onClick={logout} className="rounded-xl border border-slate-200 dark:border-white/15 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-2"><LogOut className="w-4 h-4" /> Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-7">
        {error && <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-semibold text-red-700 dark:text-red-300 flex gap-3"><XCircle className="w-5 h-5 shrink-0" />{error}</div>}
        {notice && <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex gap-3"><CheckCircle2 className="w-5 h-5 shrink-0" />{notice}</div>}

        <section className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-6 sm:p-8 overflow-hidden relative shadow-sm dark:shadow-none">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-cyan-300">{point?.businessName || 'Point'}</p>
              <h1 className="text-3xl sm:text-4xl font-black mt-2">Tu centro operativo local</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-2xl">Registra operaciones, entrega un tracking público y mantén la trazabilidad de cada pieza.</p>
            </div>
            <div className="shrink-0"><StatusBadge status={point?.status || 'pending'} /></div>
          </div>
        </section>

        {/* METRICAS Y TARJETA DEL EJECUTIVO DE CUENTA */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <p className="text-xs font-black uppercase text-slate-400">Operaciones</p>
            <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{operations.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Registradas en este Point</p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <p className="text-xs font-black uppercase text-slate-400">Comisiones</p>
            <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{totalCommission.toFixed(2)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{point?.currency || 'USD'} acumulado</p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <p className="text-xs font-black uppercase text-slate-400">Ubicación verificada</p>
            <p className="font-bold mt-2 flex items-center gap-2 text-sm text-slate-900 dark:text-white truncate">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
              {point?.city}, {point?.country}
            </p>
            <a className="text-xs text-blue-600 dark:text-cyan-300 font-bold mt-1 inline-flex items-center gap-1" href={`https://www.google.com/maps/search/?api=1&query=${point?.latitude},${point?.longitude}`} target="_blank" rel="noreferrer">
              Abrir en Maps <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* TARJETA EJECUTIVO ASIGNADO */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-900 dark:to-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">Ejecutivo Asignado</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Soporte activo" />
              </div>
              <p className="font-black text-slate-900 dark:text-white mt-2 text-base leading-snug">
                {point?.executive?.name || 'Equipo Central Ship24Go'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {point?.executive?.email || 'soporte@ship24go.com'}
              </p>
            </div>
            <button
              onClick={openChatModal}
              className="mt-3 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chatear ahora</span>
              {Boolean(point?.unreadChatCount) && (
                <span className="bg-red-500 text-white rounded-full px-1.5 py-0.2 text-[10px] font-black">
                  {point.unreadChatCount}
                </span>
              )}
            </button>
          </div>
        </section>

        {point?.status !== 'approved' ? (
          <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 sm:p-10">
            <div className="max-w-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 grid place-items-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black mt-5">Tu Point está {point?.status === 'pending' ? 'en revisión' : 'no habilitado'}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                Tu ejecutivo de cuenta está validando el local antes de activar la emisión de operaciones. Puedes escribirle por el chat interno en cualquier momento.
              </p>
              {point?.reviewNote && (
                <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 text-sm">
                  <p className="font-black">Nota del equipo</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{point.reviewNote}</p>
                </div>
              )}
              <div className="mt-6">
                <button
                  onClick={openChatModal}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-3 text-sm inline-flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Escribir a mi Ejecutivo
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid lg:grid-cols-[1fr_0.84fr] gap-6">
            <form onSubmit={submitOperation} className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">Nueva operación</p>
                  <h2 className="text-2xl font-black mt-1">Emitir pieza</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Genera tracking desde este Point.</p>
                </div>
                <PackagePlus className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <label className="block sm:col-span-2">
                  <span className="label-dynamic">Producto *</span>
                  <select required value={form.productCode} onChange={(e) => update('productCode', e.target.value)} className="input-dynamic">
                    {products.map((product) => (
                      <option key={product.code} value={product.code}>
                        {product.name} · {Number(product.commission_percent || 0).toFixed(2)}% comisión
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="label-dynamic">Precio cobrado *</span>
                  <input required min="0" step="0.01" type="number" value={form.saleAmount} onChange={(e) => update('saleAmount', e.target.value)} className="input-dynamic" placeholder="0.00" />
                </label>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold">Moneda</p>
                    <p className="font-black">{point?.currency || 'USD'}</p>
                  </div>
                </div>
                <label className="block sm:col-span-2">
                  <span className="label-dynamic">Nombre del destinatario *</span>
                  <input required value={form.recipientName} onChange={(e) => update('recipientName', e.target.value)} className="input-dynamic" placeholder="Nombre completo" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="label-dynamic">Dirección *</span>
                  <input required value={form.recipientAddress} onChange={(e) => update('recipientAddress', e.target.value)} className="input-dynamic" placeholder="Calle y número" />
                </label>
                <label className="block">
                  <span className="label-dynamic">Ciudad *</span>
                  <input required value={form.recipientCity} onChange={(e) => update('recipientCity', e.target.value)} className="input-dynamic" placeholder="Ciudad" />
                </label>
                <label className="block">
                  <span className="label-dynamic">País *</span>
                  <CountrySelect value={form.recipientCountry} onChange={(code) => update('recipientCountry', code)} lang="es" />
                </label>
                <label className="block">
                  <span className="label-dynamic">Código postal</span>
                  <input value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="input-dynamic" />
                </label>
                <label className="block">
                  <span className="label-dynamic">Teléfono</span>
                  <input value={form.recipientPhone} onChange={(e) => update('recipientPhone', e.target.value)} className="input-dynamic" />
                </label>
              </div>

              <button disabled={submitting} className="mt-6 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 flex items-center justify-center gap-2">
                {submitting ? 'Registrando…' : 'Registrar operación'}
                <FileText className="w-5 h-5" />
              </button>
            </form>

            <div className="rounded-[2rem] bg-blue-600 text-white p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <Store className="w-8 h-8 text-cyan-200" />
                <h2 className="text-2xl font-black mt-5">Regla operativa y soporte</h2>
                <p className="text-blue-100 leading-relaxed mt-3">
                  El tracking se crea en Ship24Go y el cliente puede consultarlo desde la página pública. Tu comisión se calcula automáticamente en base a las reglas comerciales.
                </p>
                <div className="mt-6 rounded-2xl bg-white/10 border border-white/15 p-4 text-sm text-blue-50">
                  <p className="font-black">¿Dudas con un paquete o liquidación?</p>
                  <p className="mt-1">
                    Cuentas con un Ejecutivo de Cuenta dedicado asignado directamente a tu Point para resolver cualquier inquietud en tiempo real.
                  </p>
                </div>
              </div>
              <button
                onClick={openChatModal}
                className="mt-6 w-full rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-black py-3 text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Contactar a mi Ejecutivo
              </button>
            </div>
          </section>
        )}

        <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-black">Operaciones recientes</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tracking y recibo de cada pieza emitida.</p>
            </div>
            <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" title="Actualizar">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {operations.length === 0 ? (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">
              <Clipboard className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="font-bold">Todavía no hay operaciones.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {operations.map((operation) => (
                <div key={operation.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <p className="font-mono font-black text-blue-700 dark:text-cyan-300">{operation.trackingCode}</p>
                    <p className="text-sm font-bold mt-1">{operation.productName} · {operation.recipient?.name || 'Destinatario'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{operation.recipient?.city || ''} · {new Date(operation.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-black uppercase text-slate-400">Comisión</p>
                      <p className="font-black">{Number(operation.commissionAmount || 0).toFixed(2)} {operation.currency}</p>
                    </div>
                    <a href={`/tracking?code=${encodeURIComponent(operation.trackingCode)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 text-xs font-black text-slate-700 dark:text-slate-200">
                      Ver tracking
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* BOTÓN FLOTANTE DE CHAT RÁPIDO */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={openChatModal}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white p-4 shadow-xl flex items-center gap-2.5 transition-transform hover:scale-105"
          title="Chat con tu ejecutivo"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="hidden md:inline font-bold text-sm">Asistencia con mi Ejecutivo</span>
          {Boolean(point?.unreadChatCount) && (
            <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-white animate-ping" />
          )}
        </button>
      </div>

      {/* MODAL DEL CHAT CON EJECUTIVO */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl h-[600px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  {(point?.executive?.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                      {point?.executive?.name || 'Equipo Central Ship24Go'}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> En línea
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tu Account Executive dedicado en Ship24Go
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/30 dark:bg-slate-950/30">
              {chatLoading ? (
                <div className="py-12 text-center text-slate-400 text-sm">Cargando conversación…</div>
              ) : chatMessages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  Escribe un mensaje para contactar a tu ejecutivo asignado.
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.sender_role === 'point';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                        {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendChatMessage} className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe tu consulta u operación a resolver…"
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={chatSending || !chatInput.trim()}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 text-sm font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

