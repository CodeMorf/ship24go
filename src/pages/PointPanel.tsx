import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FilePlus2, Search, Boxes, Wallet, LogOut, Menu, X,
  Building2, MapPin, DollarSign, Send, Printer, Clock, CheckCircle2,
  ArrowRight, CreditCard, Package, Receipt, User, Phone, Mail, Globe2,
  RefreshCw, FileText, ShieldCheck, ChevronRight
} from 'lucide-react';
import { api, getAuthToken, removeAuthToken, setAuthToken } from '../lib/api';
import { BrandMark } from '../lib/brand';

const itemLabels: Record<string, string> = {
  document: 'Documento',
  card: 'Tarjeta',
  envelope: 'Sobre',
  parcel: 'Paquete',
};

const statusLabels: Record<string, string> = {
  received: 'Recibido',
  queued: 'En preparación',
  consolidated: 'Consolidado',
  in_transit_to_hub: 'En tránsito al hub',
  at_hub: 'Recibido en hub',
  exported: 'Salida internacional',
  final_mile: 'Entrega final',
  delivered: 'Entregado',
  exception: 'Revisión necesaria',
  cancelled: 'Cancelado',
  ready: 'Listo para salida',
  open: 'Abierto',
  closed: 'Cerrado',
};

async function pointRequest(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const response = await fetch(`/api/point${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error: any = new Error(data.error || 'No se pudo completar la operación.');
    error.status = response.status;
    throw error;
  }
  return data;
}

function money(value: any, currency = 'EUR') {
  try {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency }).format(Number(value || 0));
  } catch {
    return `${Number(value || 0).toFixed(2)} ${currency}`;
  }
}

const EmptyState = ({ title, text }: { title: string; text: string }) => (
  <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center">
    <Boxes className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
    <h3 className="font-black text-slate-900 dark:text-white">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{text}</p>
  </div>
);

const TrackingSearch = ({ compact = false }: { compact?: boolean }) => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const searchTracking = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setMessage('');
    setResult(null);
    try {
      const response = await fetch(`/api/point/public/tracking/${encodeURIComponent(code.trim())}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'No encontramos información para ese tracking.');
      setResult(data);
    } catch (error: any) {
      setMessage(error.message || 'No se pudo consultar el seguimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? '' : 'rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm'}>
      {!compact && (
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.22em] font-black text-blue-600 dark:text-cyan-400">Seguimiento</p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Consultar envío</h2>
        </div>
      )}
      <form onSubmit={searchTracking} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Tracking del cliente"
            className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
          />
        </div>
        <button disabled={loading} className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm disabled:opacity-60">
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>
      {message && <p className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-400">{message}</p>}
      {result && (
        <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tracking</p>
              <p className="font-mono font-black text-blue-600 dark:text-cyan-400 mt-1">{result.tracking}</p>
            </div>
            <span className="inline-flex self-start rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-cyan-300 px-3 py-1.5 text-xs font-black">
              {result.statusLabel || statusLabels[result.status] || result.status}
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {(result.events || []).map((event: any, index: number) => (
              <div key={`${event.eventCode}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5" />
                  {index < result.events.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100">{event.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {event.location ? `${event.location} · ` : ''}{event.eventTime ? new Date(event.eventTime).toLocaleString('es-DO') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PointLogin = ({ onReady }: { onReady: () => void }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.login(form);
      if (response?.user?.role !== 'point_operator') {
        if (response?.user?.role === 'super_admin') {
          removeAuthToken();
          navigate('/admin/points');
          return;
        }
        throw new Error('Esta cuenta no está habilitada para operar un Point.');
      }
      setAuthToken(response.token);
      onReady();
    } catch (err: any) {
      removeAuthToken();
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto min-h-screen grid lg:grid-cols-2">
        <div className="p-6 sm:p-10 lg:p-14 flex flex-col">
          <Link to="/" className="inline-flex self-start"><BrandMark dark iconClassName="w-10 h-10 rounded-xl" textClassName="text-2xl text-white" /></Link>
          <div className="my-auto py-12 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 px-4 py-2 text-xs uppercase tracking-[0.22em] font-black">
              <Building2 className="w-4 h-4" /> Ship24Go Point
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-6">Tu negocio como punto de confianza para la comunidad.</h1>
            <p className="text-slate-400 text-lg leading-relaxed mt-5">Recibe documentos, tarjetas y sobres, entrega un tracking único al cliente y participa en una red logística conectada a hubs internacionales.</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              {[
                ['Tracking único', 'El cliente conserva el mismo código hasta la entrega.'],
                ['Comisiones', 'Cada emisión genera ingresos para tu negocio.'],
                ['Red de hubs', 'Las piezas se consolidan para optimizar la salida.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="font-black text-sm">{title}</p><p className="text-xs text-slate-400 mt-1 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-600">Ship24Go Point · Red de comercios asociados</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-6 sm:p-10 lg:p-14 flex items-center">
          <div className="w-full max-w-lg mx-auto space-y-6">
            <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 font-black">Acceso para comercios</p>
              <h2 className="text-3xl font-black mt-2">Administrar mi Point</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Ingresa con la cuenta asignada a tu establecimiento.</p>
              {error && <div className="mt-5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 px-4 py-3 text-sm font-bold">{error}</div>}
              <form onSubmit={login} className="space-y-4 mt-6">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Correo</span>
                  <div className="relative mt-2"><Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-11 pr-4 outline-none focus:border-blue-500" placeholder="correo@negocio.com" /></div>
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Contraseña</span>
                  <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-2 w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 outline-none focus:border-blue-500" />
                </label>
                <button disabled={loading} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black disabled:opacity-60">{loading ? 'Ingresando...' : 'Ingresar al Point'}</button>
              </form>
            </div>
            <div className="rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6">
              <p className="font-black text-sm mb-4">¿Quieres consultar un envío?</p>
              <TrackingSearch compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PointPanel = () => {
  const navigate = useNavigate();
  const [sessionKey, setSessionKey] = useState(0);
  const [me, setMe] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [manifests, setManifests] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueMessage, setIssueMessage] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [profile, setProfile] = useState<any>({ method: 'manual', details: {} });
  const [issue, setIssue] = useState<any>({
    itemType: 'document', destinationCountry: 'DO', description: '', declaredValue: '',
    sender: { name: '', phone: '', email: '' },
    recipient: { name: '', phone: '', email: '', country: 'DO', city: '', address: '' },
  });

  const loadAll = async () => {
    if (!getAuthToken()) { setLoading(false); setMe(null); return; }
    setLoading(true);
    setError('');
    try {
      const identity = await pointRequest('/me');
      const [dash, itemRes, manifestRes, payoutRes] = await Promise.all([
        pointRequest('/dashboard'), pointRequest('/items'), pointRequest('/manifests'), pointRequest('/payouts'),
      ]);
      setMe(identity);
      setDashboard(dash);
      setItems(itemRes.items || []);
      setManifests(manifestRes.manifests || []);
      setPayouts(payoutRes.payouts || []);
      setProfile(identity.payoutProfile || { method: 'manual', details: {} });
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        removeAuthToken();
        setMe(null);
      } else {
        setError(err.message || 'No se pudo cargar la información.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [sessionKey]);

  const point = me?.point;
  const currency = point?.currency || 'EUR';
  const queueRows = useMemo(() => ['document', 'card', 'envelope'].map((type) => ({ type, ...(dashboard?.queue?.[type] || {}) })), [dashboard]);

  if (!getAuthToken() || (!loading && !me)) return <PointLogin onReady={() => setSessionKey((v) => v + 1)} />;

  if (loading && !me) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black">Cargando tu Point...</div>;

  const logout = () => { removeAuthToken(); setMe(null); navigate('/point'); };

  const createIssue = async (event: React.FormEvent) => {
    event.preventDefault();
    setIssueLoading(true);
    setIssueMessage('');
    try {
      const response = await pointRequest('/items', { method: 'POST', body: JSON.stringify(issue) });
      setReceiptData(response.receipt);
      setIssueMessage(response.release?.released ? 'Emisión creada y añadida a una salida preparada.' : response.release?.recommended ? 'Emisión creada. La salida está lista para aprobación.' : 'Emisión creada correctamente.');
      setIssue((current: any) => ({ ...current, description: '', declaredValue: '', sender: { name: '', phone: '', email: '' }, recipient: { name: '', phone: '', email: '', country: 'DO', city: '', address: '' } }));
      await loadAll();
    } catch (err: any) {
      setIssueMessage(err.message || 'No se pudo crear la emisión.');
    } finally {
      setIssueLoading(false);
    }
  };

  const savePayoutProfile = async () => {
    try {
      await pointRequest('/payout-profile', { method: 'POST', body: JSON.stringify(profile) });
      setIssueMessage('Información de cobro guardada correctamente.');
      await loadAll();
    } catch (err: any) { setIssueMessage(err.message || 'No se pudo guardar la información de cobro.'); }
  };

  const requestPayout = async () => {
    try {
      const response = await pointRequest('/payouts', { method: 'POST', body: JSON.stringify({ amount: Number(payoutAmount) }) });
      setIssueMessage(response.message || 'Solicitud registrada correctamente.');
      setPayoutAmount('');
      await loadAll();
    } catch (err: any) { setIssueMessage(err.message || 'No se pudo registrar la solicitud.'); }
  };

  const nav = [
    ['dashboard', 'Resumen', LayoutDashboard], ['issue', 'Nueva emisión', FilePlus2], ['items', 'Envíos', Search],
    ['manifests', 'Manifiestos', Boxes], ['commissions', 'Comisiones', Wallet], ['tracking', 'Seguimiento', Globe2],
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white md:flex">
      {mobileOpen && <button aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-slate-950/70 z-40 md:hidden" />}
      <aside className={`fixed md:sticky top-0 z-50 h-screen w-72 bg-slate-950 text-white flex flex-col transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <BrandMark dark iconClassName="w-9 h-9 rounded-xl" textClassName="text-xl text-white" />
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="mx-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
            <div className="min-w-0"><p className="font-black truncate">{point?.name}</p><p className="text-xs text-slate-400 truncate">{point?.city || point?.country} · {point?.code}</p></div>
          </div>
          {point?.hubName && <p className="mt-3 text-xs text-slate-400 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Hub: {point.hubName}</p>}
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map(([key, label, Icon]) => (
            <button key={key} onClick={() => { setTab(key); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${tab === key ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}>
              <Icon className="w-5 h-5" /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"><LogOut className="w-5 h-5" /> Cerrar sesión</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sm:px-6 gap-3">
          <button onClick={() => setMobileOpen(true)} className="md:hidden"><Menu className="w-6 h-6" /></button>
          <div className="flex-1 min-w-0"><p className="font-black truncate">{point?.name}</p><p className="text-xs text-slate-500 truncate">Portal de comercio asociado</p></div>
          <button onClick={loadAll} className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"><RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Actualizar</span></button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {error && <div className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 p-4 text-rose-700 dark:text-rose-300 text-sm font-bold">{error}</div>}
          {issueMessage && <div className="mb-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-4 text-blue-700 dark:text-cyan-300 text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" /> {issueMessage}</div>}

          {tab === 'dashboard' && (
            <div>
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
                <div><p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 font-black">Operación del día</p><h1 className="text-3xl sm:text-4xl font-black mt-2">Resumen de tu Point</h1><p className="text-slate-500 dark:text-slate-400 mt-2">Controla emisiones, salidas y comisiones desde un solo lugar.</p></div>
                <button onClick={() => setTab('issue')} className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black"><FilePlus2 className="w-5 h-5" /> Nueva emisión</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
                {[
                  ['Hoy', dashboard?.summary?.today || 0, FileText], ['En preparación', dashboard?.summary?.queued || 0, Clock], ['En tránsito', dashboard?.summary?.transit || 0, Package], ['Entregados', dashboard?.summary?.delivered || 0, CheckCircle2], ['Comisión disponible', money(dashboard?.commission?.available, currency), DollarSign],
                ].map(([label, value, Icon]: any) => <div key={label} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5"><div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center"><Icon className="w-4 h-4" /></div><p className="text-xs text-slate-500 font-bold mt-4">{label}</p><p className="text-2xl font-black mt-1 truncate">{value}</p></div>)}
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mb-7">
                <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-center justify-between gap-3 mb-5"><div><h2 className="text-xl font-black">Consolidación para salida</h2><p className="text-sm text-slate-500 mt-1">El sistema prepara la salida al cumplir cantidad o tiempo mínimo.</p></div><Boxes className="w-6 h-6 text-blue-600" /></div>
                  <div className="space-y-3">{queueRows.map((row: any) => {
                    const pct = Math.min(100, Math.round((Number(row.qty || 0) / Math.max(1, Number(row.minItems || 1))) * 100));
                    return <div key={row.type} className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-black">{itemLabels[row.type]}</p><p className="text-xs text-slate-500 mt-1">{row.qty || 0} de {row.minItems || 1} piezas · {row.ageDays || 0} de {row.minDays || 0} días</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${row.eligible ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{row.eligible ? (row.approvalRequired ? 'Lista para aprobación' : 'Lista para salida') : 'Acumulando'}</span></div><div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 mt-3 overflow-hidden"><div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} /></div></div>;
                  })}</div>
                </div>
                <div className="rounded-3xl bg-slate-950 text-white p-6 relative overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-44 h-44 bg-blue-600/20 rounded-full blur-2xl" />
                  <ShieldCheck className="w-8 h-8 text-cyan-400 relative" /><h2 className="text-xl font-black mt-5 relative">Tracking continuo</h2><p className="text-sm text-slate-400 mt-2 leading-relaxed relative">El cliente recibe un código al momento de la emisión y conserva ese mismo tracking durante toda la operación hasta la entrega final.</p>
                  <button onClick={() => setTab('tracking')} className="relative mt-5 inline-flex items-center gap-2 text-sm font-black text-cyan-300">Consultar tracking <ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800"><h2 className="text-xl font-black">Emisiones recientes</h2><button onClick={() => setTab('items')} className="text-sm font-black text-blue-600 dark:text-cyan-400">Ver todas</button></div>
                {!dashboard?.recent?.length ? <div className="p-8 text-center text-sm text-slate-500">No hay registros todavía.</div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-4">Tracking</th><th className="p-4">Tipo</th><th className="p-4">Destinatario</th><th className="p-4">Estado</th><th className="p-4">Fecha</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{dashboard.recent.map((row: any) => <tr key={row.id}><td className="p-4 font-mono font-black text-blue-600 dark:text-cyan-400">{row.customerTracking}</td><td className="p-4 font-bold">{itemLabels[row.itemType] || row.itemType}</td><td className="p-4">{row.recipient?.name || '-'}</td><td className="p-4"><span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-black">{row.statusLabel || statusLabels[row.status] || row.status}</span></td><td className="p-4 text-slate-500 text-xs">{new Date(row.createdAt).toLocaleString('es-DO')}</td></tr>)}</tbody></table></div>}
              </div>
            </div>
          )}

          {tab === 'issue' && (
            <div className="max-w-5xl mx-auto">
              <div className="mb-7"><p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 font-black">Nueva operación</p><h1 className="text-3xl sm:text-4xl font-black mt-2">Emitir envío</h1><p className="text-slate-500 mt-2">Registra remitente y destinatario. El cliente recibe tracking y recibo en esta misma operación.</p></div>
              <form onSubmit={createIssue} className="space-y-6">
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                  <h2 className="text-xl font-black flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> Servicio</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                    {['document','card','envelope', ...(point?.parcelEnabled ? ['parcel'] : [])].map((type) => <button type="button" key={type} onClick={() => setIssue({ ...issue, itemType: type })} className={`rounded-2xl border p-4 text-left transition ${issue.itemType === type ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-700'}`}><p className="font-black">{itemLabels[type]}</p><p className="text-xs text-slate-500 mt-1">{money(point?.[`${type}Price`] || 0, currency)}</p></button>)}
                  </div>
                  {!point?.parcelEnabled && <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 flex gap-3"><Package className="w-5 h-5 text-slate-400 shrink-0" /><div><p className="font-black text-sm">Paquetes internacionales</p><p className="text-xs text-slate-500 mt-1">Disponible próximamente para este Point.</p></div></div>}
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6"><h2 className="text-xl font-black flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> Remitente</h2><div className="space-y-4 mt-5">
                    {[['name','Nombre completo',User,'text'],['phone','Teléfono',Phone,'tel'],['email','Correo',Mail,'email']].map(([key,label,Icon,type]: any) => <label key={key} className="block"><span className="text-xs uppercase tracking-wider font-black text-slate-500">{label}</span><div className="relative mt-2"><Icon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type={type} required={key === 'name'} value={issue.sender[key]} onChange={(e) => setIssue({ ...issue, sender: { ...issue.sender, [key]: e.target.value } })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-11 pr-4 outline-none focus:border-blue-500" /></div></label>)}
                  </div></div>
                  <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6"><h2 className="text-xl font-black flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Destinatario</h2><div className="space-y-4 mt-5">
                    {[['name','Nombre completo',User,'text'],['phone','Teléfono',Phone,'tel'],['email','Correo',Mail,'email'],['city','Ciudad',MapPin,'text'],['address','Dirección',MapPin,'text']].map(([key,label,Icon,type]: any) => <label key={key} className="block"><span className="text-xs uppercase tracking-wider font-black text-slate-500">{label}</span><div className="relative mt-2"><Icon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type={type} required={key === 'name' || key === 'phone'} value={issue.recipient[key]} onChange={(e) => setIssue({ ...issue, recipient: { ...issue.recipient, [key]: e.target.value } })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-11 pr-4 outline-none focus:border-blue-500" /></div></label>)}
                    <label className="block"><span className="text-xs uppercase tracking-wider font-black text-slate-500">País destino</span><select value={issue.destinationCountry} onChange={(e) => setIssue({ ...issue, destinationCountry: e.target.value, recipient: { ...issue.recipient, country: e.target.value } })} className="mt-2 w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 outline-none focus:border-blue-500"><option value="DO">República Dominicana</option><option value="US">Estados Unidos</option><option value="ES">España</option><option value="CH">Suiza</option></select></label>
                  </div></div>
                </div>
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6"><div className="grid sm:grid-cols-2 gap-4"><label><span className="text-xs uppercase tracking-wider font-black text-slate-500">Descripción</span><input value={issue.description} onChange={(e) => setIssue({ ...issue, description: e.target.value })} placeholder="Ej. documentos personales" className="mt-2 w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 outline-none focus:border-blue-500" /></label><label><span className="text-xs uppercase tracking-wider font-black text-slate-500">Valor declarado</span><input type="number" min="0" step="0.01" value={issue.declaredValue} onChange={(e) => setIssue({ ...issue, declaredValue: e.target.value })} className="mt-2 w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 outline-none focus:border-blue-500" /></label></div><button disabled={issueLoading} className="mt-6 w-full sm:w-auto h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black inline-flex items-center justify-center gap-2 disabled:opacity-60"><Send className="w-5 h-5" /> {issueLoading ? 'Creando emisión...' : 'Crear emisión y recibo'}</button></div>
              </form>
              {receiptData && <div className="mt-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 p-6 sm:p-8" id="point-receipt"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] font-black text-blue-600 dark:text-cyan-400">Recibo emitido</p><h2 className="text-2xl font-black mt-2">{receiptData.number}</h2><p className="font-mono text-lg font-black text-blue-600 dark:text-cyan-400 mt-3">{receiptData.tracking}</p></div><button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-sm"><Printer className="w-4 h-4" /> Imprimir</button></div><div className="grid sm:grid-cols-3 gap-3 mt-6"><div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4"><p className="text-xs text-slate-500 font-bold">Point</p><p className="font-black mt-1">{receiptData.pointName}</p></div><div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4"><p className="text-xs text-slate-500 font-bold">Importe</p><p className="font-black mt-1">{money(receiptData.price, receiptData.currency)}</p></div><div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4"><p className="text-xs text-slate-500 font-bold">Fecha</p><p className="font-black mt-1 text-sm">{receiptData.createdAt ? new Date(receiptData.createdAt).toLocaleString('es-DO') : 'Ahora'}</p></div></div></div>}
            </div>
          )}

          {tab === 'items' && <div><div className="flex items-end justify-between gap-3 mb-7"><div><p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 font-black">Historial</p><h1 className="text-3xl sm:text-4xl font-black mt-2">Envíos emitidos</h1></div><button onClick={() => setTab('issue')} className="h-11 px-4 rounded-xl bg-blue-600 text-white font-black text-sm">Nueva emisión</button></div>{!items.length ? <EmptyState title="No hay registros todavía" text="Crea tu primera emisión para comenzar." /> : <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-4">Tracking</th><th className="p-4">Recibo</th><th className="p-4">Tipo</th><th className="p-4">Remitente</th><th className="p-4">Destinatario</th><th className="p-4">Estado</th><th className="p-4">Importe</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{items.map((row) => <tr key={row.id}><td className="p-4 font-mono font-black text-blue-600 dark:text-cyan-400">{row.customerTracking}</td><td className="p-4 font-mono text-xs">{row.receiptNumber}</td><td className="p-4 font-bold">{itemLabels[row.itemType]}</td><td className="p-4">{row.sender?.name}</td><td className="p-4">{row.recipient?.name}</td><td className="p-4"><span className="rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-black">{row.statusLabel || statusLabels[row.status]}</span></td><td className="p-4 font-black">{money(row.servicePrice, row.currency)}</td></tr>)}</tbody></table></div></div>}</div>}

          {tab === 'manifests' && <div><div className="mb-7"><p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 font-black">Consolidación</p><h1 className="text-3xl sm:text-4xl font-black mt-2">Manifiestos</h1><p className="text-slate-500 mt-2">Cada manifiesto agrupa piezas que viajarán juntas desde tu Point hacia el hub asignado.</p></div>{!manifests.length ? <EmptyState title="No hay manifiestos todavía" text="Se crearán cuando las emisiones alcancen las condiciones de salida." /> : <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{manifests.map((row) => <div key={row.id} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5"><div className="flex items-start justify-between gap-3"><div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center"><Boxes className="w-5 h-5" /></div><span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-black">{statusLabels[row.status] || row.status}</span></div><p className="font-mono font-black text-blue-600 dark:text-cyan-400 mt-5">{row.manifest_tracking}</p><p className="text-lg font-black mt-2">{row.item_count} piezas</p><div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 space-y-1"><p>Tipo: <span className="font-bold text-slate-800 dark:text-slate-200">{itemLabels[row.item_type] || row.item_type}</span></p><p>Hub: <span className="font-bold text-slate-800 dark:text-slate-200">{row.hub_name}</span></p><p>Creado: <span className="font-bold text-slate-800 dark:text-slate-200">{new Date(row.created_at).toLocaleString('es-DO')}</span></p></div></div>)}</div>}</div>}

          {tab === 'commissions' && <div><div className="mb-7"><p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 font-black">Ingresos del comercio</p><h1 className="text-3xl sm:text-4xl font-black mt-2">Comisiones y cobros</h1><p className="text-slate-500 mt-2">Configura dónde recibir tus pagos y consulta el historial.</p></div><div className="grid md:grid-cols-3 gap-4 mb-6">{[['Generado', dashboard?.commission?.earned || 0],['Comprometido', dashboard?.commission?.committed || 0],['Disponible', dashboard?.commission?.available || 0]].map(([label,value]: any) => <div key={label} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5"><p className="text-xs text-slate-500 uppercase tracking-wider font-black">{label}</p><p className="text-3xl font-black mt-2">{money(value, currency)}</p></div>)}</div><div className="grid lg:grid-cols-2 gap-6 mb-6"><div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6"><h2 className="text-xl font-black flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" /> Forma de cobro</h2><select value={profile.method || 'manual'} onChange={(e) => setProfile({ ...profile, method: e.target.value })} className="mt-5 w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4"><option value="manual">Coordinado por Ship24Go</option><option value="paypal">PayPal</option><option value="bank">Cuenta bancaria</option></select>{profile.method === 'paypal' && <input value={profile.details?.paypalEmail || ''} onChange={(e) => setProfile({ ...profile, details: { ...profile.details, paypalEmail: e.target.value } })} placeholder="Correo de PayPal" className="mt-3 w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4" />}{profile.method === 'bank' && <div className="grid sm:grid-cols-2 gap-3 mt-3"><input value={profile.details?.accountName || ''} onChange={(e) => setProfile({ ...profile, details: { ...profile.details, accountName: e.target.value } })} placeholder="Titular" className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4" /><input value={profile.details?.bankName || ''} onChange={(e) => setProfile({ ...profile, details: { ...profile.details, bankName: e.target.value } })} placeholder="Banco" className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4" /><input value={profile.details?.accountReference || ''} onChange={(e) => setProfile({ ...profile, details: { ...profile.details, accountReference: e.target.value } })} placeholder="Cuenta / IBAN" className="sm:col-span-2 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4" /></div>}<button onClick={savePayoutProfile} className="mt-4 h-11 px-5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-sm">Guardar información</button></div><div className="rounded-3xl bg-slate-950 text-white p-6"><DollarSign className="w-8 h-8 text-cyan-400" /><h2 className="text-xl font-black mt-4">Solicitar pago</h2><p className="text-sm text-slate-400 mt-2">Disponible actualmente: {money(dashboard?.commission?.available || 0, currency)}</p><div className="flex gap-3 mt-5"><input type="number" min="0" step="0.01" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} placeholder="Monto" className="min-w-0 flex-1 h-12 rounded-xl bg-slate-900 border border-slate-700 px-4 text-white" /><button onClick={requestPayout} className="h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-sm">Solicitar</button></div><p className="text-xs text-slate-500 mt-3">Las solicitudes siguen la modalidad de aprobación configurada para tu Point.</p></div></div>{!payouts.length ? <EmptyState title="No hay pagos registrados" text="Cuando solicites tu primera comisión aparecerá aquí." /> : <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-4">Fecha</th><th className="p-4">Monto</th><th className="p-4">Método</th><th className="p-4">Estado</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{payouts.map((row) => <tr key={row.id}><td className="p-4 text-slate-500">{new Date(row.created_at).toLocaleString('es-DO')}</td><td className="p-4 font-black">{money(row.amount, row.currency)}</td><td className="p-4 font-bold uppercase">{row.method}</td><td className="p-4"><span className="rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-black">{row.status === 'pending' ? 'Pendiente' : row.status === 'approved' ? 'Aprobado' : row.status === 'paid' ? 'Pagado' : row.status === 'rejected' ? 'Rechazado' : row.status}</span></td></tr>)}</tbody></table></div></div>}</div>}

          {tab === 'tracking' && <div className="max-w-3xl mx-auto"><TrackingSearch /></div>}
        </main>
      </div>
    </div>
  );
};

export default PointPanel;
