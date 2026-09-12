import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, MapPin, Network, Plus, RefreshCw, Boxes, Wallet,
  Settings2, CheckCircle2, Clock, Truck, Plane, Search, Package, Users,
  DollarSign, Save, ShieldCheck, Megaphone, Globe2, ChevronRight, XCircle,
  FileText, Send, Eye, ToggleLeft, ToggleRight
} from 'lucide-react';
import { BrandMark } from '../lib/brand';
import { getAuthToken, removeAuthToken } from '../lib/api';

async function adminPointRequest(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const response = await fetch(`/api/admin/points${path}`, {
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
  try { return new Intl.NumberFormat('es-DO', { style: 'currency', currency }).format(Number(value || 0)); }
  catch { return `${Number(value || 0).toFixed(2)} ${currency}`; }
}

const itemNames: Record<string, string> = { document: 'Documento', card: 'Tarjeta', envelope: 'Sobre', parcel: 'Paquete', mixed: 'Mixto' };
const manifestStatus: Record<string, string> = { ready: 'Listo', in_transit_to_hub: 'Hacia el hub', at_hub: 'En hub', exported: 'Salida internacional', closed: 'Cerrado', cancelled: 'Cancelado' };

const Panel = ({ children, className = '' }: any) => <div className={`rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${className}`}>{children}</div>;
const Field = ({ label, children }: any) => <label className="block"><span className="block text-[11px] uppercase tracking-wider font-black text-slate-500 mb-2">{label}</span>{children}</label>;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={`w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-sm outline-none focus:border-blue-500 ${props.className || ''}`} />;
const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className={`w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-sm outline-none focus:border-blue-500 ${props.className || ''}`} />;

const AdminPoints = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>({ summary: {}, points: [], hubs: [], rules: [], manifests: [], payouts: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('network');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [selectedPointId, setSelectedPointId] = useState('');
  const [editPoint, setEditPoint] = useState<any>(null);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [finalLink, setFinalLink] = useState({ finalShipmentId: '', finalShipmentTracking: '', localTracking: '', location: '' });
  const [manifestRefs, setManifestRefs] = useState<Record<string, { originTracking?: string; exportTracking?: string; localTracking?: string }>>({});

  const [hubForm, setHubForm] = useState({ name: '', code: '', country: 'US', city: '', address: '', postalCode: '' });
  const [pointForm, setPointForm] = useState<any>({
    name: '', legalName: '', code: '', country: 'US', currency: 'USD', city: '', address: '', postalCode: '', phone: '', email: '', hubId: '',
    operatorName: '', operatorEmail: '', operatorPassword: '', decisionMode: 'rules', payoutMethod: 'manual', payoutApprovalMode: 'manual',
    documentPrice: 0, cardPrice: 0, envelopePrice: 0, parcelPrice: 0,
    documentCommission: 0, cardCommission: 0, envelopeCommission: 0, parcelCommission: 0, parcelEnabled: false,
  });
  const [ruleForm, setRuleForm] = useState({ pointId: '', originCountry: '', destinationCountry: 'DO', itemType: 'document', minItems: 10, minDays: 2, hubId: '', priority: 100 });
  const [releaseForm, setReleaseForm] = useState({ pointId: '', itemType: 'document', destinationCountry: 'DO' });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const next = await adminPointRequest('/bootstrap');
      setData(next);
      if (!selectedPointId && next.points?.length) setSelectedPointId(next.points[0].id);
    } catch (err: any) {
      if (err.status === 401) { removeAuthToken(); navigate('/auth/login'); return; }
      setError(err.message || 'No se pudo cargar la red de Points.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const selectedPoint = useMemo(() => data.points?.find((p: any) => p.id === selectedPointId) || null, [data.points, selectedPointId]);
  useEffect(() => { if (selectedPoint) setEditPoint({ ...selectedPoint }); }, [selectedPoint?.id]);

  const act = async (promise: Promise<any>, successFallback = 'Cambios guardados correctamente.') => {
    setNotice(''); setError('');
    try {
      const response = await promise;
      setNotice(response?.message || successFallback);
      await load();
      return response;
    } catch (err: any) {
      setError(err.message || 'No se pudo completar la operación.');
      return null;
    }
  };

  const createHub = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await act(adminPointRequest('/hubs', { method: 'POST', body: JSON.stringify(hubForm) }), 'Hub creado correctamente.');
    if (response) setHubForm({ name: '', code: '', country: 'US', city: '', address: '', postalCode: '' });
  };

  const createPoint = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await act(adminPointRequest('/points', { method: 'POST', body: JSON.stringify(pointForm) }), 'Point creado correctamente.');
    if (response?.pointId) { setSelectedPointId(response.pointId); setTab('network'); }
  };

  const createRule = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await act(adminPointRequest('/rules', { method: 'POST', body: JSON.stringify(ruleForm) }), 'Regla de salida creada correctamente.');
    if (response) setRuleForm((current) => ({ ...current, minItems: 10, minDays: 2, priority: 100 }));
  };

  const savePoint = async () => {
    if (!editPoint?.id) return;
    await act(adminPointRequest(`/points/${editPoint.id}`, { method: 'PUT', body: JSON.stringify(editPoint) }), 'Point actualizado correctamente.');
  };

  const lookup = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setLookupResult(null); setError('');
    if (!lookupCode.trim()) return;
    try { setLookupResult(await adminPointRequest(`/tracking/${encodeURIComponent(lookupCode.trim())}`)); }
    catch (err: any) { setError(err.message || 'No encontramos esa emisión.'); }
  };

  const linkFinal = async () => {
    if (!lookupResult?.item?.id) return;
    const response = await act(adminPointRequest(`/items/${lookupResult.item.id}/final-delivery`, { method: 'POST', body: JSON.stringify(finalLink) }), 'Entrega final asociada correctamente.');
    if (response) await lookup();
  };

  const nav = [
    ['network', 'Red de Points', Network], ['create', 'Nuevo Point', Plus], ['hubs', 'Hubs', MapPin], ['rules', 'Reglas de salida', Settings2],
    ['operations', 'Operación', Boxes], ['payouts', 'Comisiones', Wallet], ['tracking', 'Vincular entrega', Search],
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto h-16 px-4 sm:px-6 flex items-center gap-4">
          <Link to="/admin" className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm font-bold"><ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Volver al panel</span></Link>
          <div className="w-px h-6 bg-slate-800" />
          <BrandMark dark iconClassName="w-8 h-8 rounded-lg" textClassName="text-lg text-white" />
          <div className="ml-auto flex items-center gap-2"><span className="hidden md:inline-flex rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 text-xs font-black">Super Admin · Points</span><button onClick={load} className="w-10 h-10 rounded-xl border border-slate-700 flex items-center justify-center hover:bg-slate-900"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-7">
          <div><p className="text-xs uppercase tracking-[0.24em] text-blue-600 dark:text-cyan-400 font-black">Red comercial internacional</p><h1 className="text-3xl sm:text-4xl font-black mt-2">Ship24Go Points</h1><p className="text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">Administra comercios asociados, hubs, consolidación, manifiestos y comisiones desde una operación central.</p></div>
          <button onClick={() => setTab('create')} className="h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black inline-flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> Crear Point</button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {nav.map(([key, label, Icon]) => <button key={key} onClick={() => setTab(key)} className={`shrink-0 h-11 px-4 rounded-xl inline-flex items-center gap-2 text-sm font-black border transition ${tab === key ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'}`}><Icon className="w-4 h-4" />{label}</button>)}
        </div>

        {notice && <div className="mb-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-sm font-bold text-emerald-700 dark:text-emerald-300 flex gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" />{notice}</div>}
        {error && <div className="mb-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm font-bold text-rose-700 dark:text-rose-300 flex gap-2"><XCircle className="w-5 h-5 shrink-0" />{error}</div>}

        {tab === 'network' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              {[
                ['Points activos', Number(data.summary?.active_points || 0), Building2], ['Emisiones', Number(data.summary?.items || 0), FileText], ['En preparación', Number(data.summary?.queued || 0), Clock], ['Manifiestos activos', Number(data.summary?.active_manifests || 0), Boxes], ['Comisiones generadas', money(data.summary?.commissions || 0, selectedPoint?.currency || 'EUR'), DollarSign],
              ].map(([label, value, Icon]: any) => <Panel key={label} className="p-4 sm:p-5"><div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center"><Icon className="w-4 h-4" /></div><p className="text-xs text-slate-500 font-bold mt-4">{label}</p><p className="text-2xl font-black mt-1 truncate">{value}</p></Panel>)}
            </div>

            {!data.points?.length ? (
              <Panel className="p-12 text-center"><Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" /><h2 className="text-2xl font-black mt-4">No hay registros todavía</h2><p className="text-slate-500 mt-2">Crea tu primer Point para comenzar la red de comercios asociados.</p><button onClick={() => setTab('create')} className="mt-5 h-11 px-5 rounded-xl bg-blue-600 text-white font-black">Crear primer Point</button></Panel>
            ) : (
              <div className="grid xl:grid-cols-[1.05fr_1.4fr] gap-6">
                <Panel className="overflow-hidden">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800"><h2 className="font-black text-xl">Comercios asociados</h2><p className="text-sm text-slate-500 mt-1">Selecciona un Point para revisar su configuración.</p></div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[680px] overflow-y-auto">{data.points.map((point: any) => <button key={point.id} onClick={() => setSelectedPointId(point.id)} className={`w-full text-left p-5 transition ${selectedPointId === point.id ? 'bg-blue-50 dark:bg-blue-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-950'}`}><div className="flex items-start gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedPointId === point.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}><Building2 className="w-5 h-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="font-black truncate">{point.name}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${point.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{point.status === 'active' ? 'Activo' : point.status}</span></div><p className="text-xs text-slate-500 mt-1 truncate">{point.city || 'Ubicación por completar'} · {point.country} · {point.code}</p><div className="flex gap-3 mt-2 text-xs text-slate-500"><span>{point.itemCount || 0} emisiones</span><span>{point.operators || 0} operadores</span></div></div><ChevronRight className="w-4 h-4 text-slate-300 mt-3" /></div></button>)}</div>
                </Panel>

                {editPoint && <Panel className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5"><div><p className="text-xs uppercase tracking-wider font-black text-blue-600 dark:text-cyan-400">{editPoint.code}</p><h2 className="text-2xl font-black mt-1">{editPoint.name}</h2><p className="text-sm text-slate-500 mt-1">{editPoint.city || 'Configura la ubicación'} · {editPoint.country}</p></div><button onClick={savePoint} className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm inline-flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Guardar cambios</button></div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Nombre"><Input value={editPoint.name || ''} onChange={(e) => setEditPoint({ ...editPoint, name: e.target.value })} /></Field>
                    <Field label="Estado"><Select value={editPoint.status || 'active'} onChange={(e) => setEditPoint({ ...editPoint, status: e.target.value })}><option value="active">Activo</option><option value="suspended">Suspendido</option><option value="closed">Cerrado</option></Select></Field>
                    <Field label="Hub asignado"><Select value={editPoint.hubId || ''} onChange={(e) => setEditPoint({ ...editPoint, hubId: e.target.value })}><option value="">Sin asignar</option>{data.hubs.map((hub: any) => <option key={hub.id} value={hub.id}>{hub.name} · {hub.country}</option>)}</Select></Field>
                    <Field label="Ciudad"><Input value={editPoint.city || ''} onChange={(e) => setEditPoint({ ...editPoint, city: e.target.value })} /></Field>
                    <Field label="Dirección"><Input value={editPoint.address || ''} onChange={(e) => setEditPoint({ ...editPoint, address: e.target.value })} /></Field>
                    <Field label="Salida de consolidación"><Select value={editPoint.decisionMode || 'rules'} onChange={(e) => setEditPoint({ ...editPoint, decisionMode: e.target.value })}><option value="rules">Por reglas</option><option value="approval">Con aprobación</option></Select></Field>
                  </div>

                  <div className="mt-7"><h3 className="font-black flex items-center gap-2"><DollarSign className="w-4 h-4 text-blue-600" /> Tarifas y comisión por emisión</h3><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">{['document','card','envelope','parcel'].map((type) => <div key={type} className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4"><p className="font-black text-sm">{itemNames[type]}</p><div className="grid grid-cols-2 gap-2 mt-3"><Field label="Precio"><Input type="number" step="0.01" value={editPoint[`${type}Price`] ?? 0} onChange={(e) => setEditPoint({ ...editPoint, [`${type}Price`]: Number(e.target.value) })} /></Field><Field label="Comisión"><Input type="number" step="0.01" value={editPoint[`${type}Commission`] ?? 0} onChange={(e) => setEditPoint({ ...editPoint, [`${type}Commission`]: Number(e.target.value) })} /></Field></div></div>)}</div></div>

                  <div className="grid lg:grid-cols-2 gap-4 mt-7">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black flex items-center gap-2"><Package className="w-4 h-4 text-blue-600" /> Paquetes internacionales</h3><p className="text-xs text-slate-500 mt-1">Activa la reventa de paquetes cuando el servicio esté listo para este comercio.</p></div><button onClick={() => setEditPoint({ ...editPoint, parcelEnabled: !editPoint.parcelEnabled })} className="text-blue-600">{editPoint.parcelEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}</button></div></div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black flex items-center gap-2"><Megaphone className="w-4 h-4 text-blue-600" /> Licencia publicitaria local</h3><p className="text-xs text-slate-500 mt-1">Reserva esta función para planes de promoción exclusiva por ubicación.</p></div><button onClick={() => setEditPoint({ ...editPoint, marketingLicenseEnabled: !editPoint.marketingLicenseEnabled })} className="text-blue-600">{editPoint.marketingLicenseEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}</button></div>{editPoint.marketingLicenseEnabled && <Field label="Cuota de licencia"><Input type="number" step="0.01" value={editPoint.marketingLicenseFee || 0} onChange={(e) => setEditPoint({ ...editPoint, marketingLicenseFee: Number(e.target.value) })} /></Field>}</div>
                  </div>

                  <div className="mt-7 rounded-2xl bg-slate-950 text-white p-5"><div className="flex items-start gap-3"><ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0" /><div><h3 className="font-black">Pagos al comercio</h3><p className="text-sm text-slate-400 mt-1">Define si las solicitudes requieren revisión o pasan a aprobación inmediata según el acuerdo comercial.</p><div className="grid sm:grid-cols-2 gap-3 mt-4"><Select value={editPoint.payoutMethod || 'manual'} onChange={(e) => setEditPoint({ ...editPoint, payoutMethod: e.target.value })}><option value="manual">Coordinado</option><option value="bank">Cuenta bancaria</option><option value="paypal">PayPal</option></Select><Select value={editPoint.payoutApprovalMode || 'manual'} onChange={(e) => setEditPoint({ ...editPoint, payoutApprovalMode: e.target.value })}><option value="manual">Requiere aprobación</option><option value="automatic">Aprobación inmediata</option></Select></div></div></div></div>
                </Panel>}
              </div>
            )}
          </div>
        )}

        {tab === 'create' && (
          <form onSubmit={createPoint} className="max-w-6xl mx-auto space-y-6">
            <Panel className="p-6"><div className="mb-5"><p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 font-black">Alta comercial</p><h2 className="text-2xl font-black mt-2">Crear nuevo Point</h2><p className="text-sm text-slate-500 mt-1">Registra el comercio, su operador principal y la configuración inicial.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Nombre del comercio"><Input required value={pointForm.name} onChange={(e) => setPointForm({ ...pointForm, name: e.target.value })} /></Field>
              <Field label="Razón social"><Input value={pointForm.legalName} onChange={(e) => setPointForm({ ...pointForm, legalName: e.target.value })} /></Field>
              <Field label="Código opcional"><Input value={pointForm.code} onChange={(e) => setPointForm({ ...pointForm, code: e.target.value.toUpperCase() })} placeholder="Ej. NYC-001" /></Field>
              <Field label="País"><Input required maxLength={2} value={pointForm.country} onChange={(e) => setPointForm({ ...pointForm, country: e.target.value.toUpperCase() })} placeholder="US" /></Field>
              <Field label="Moneda"><Input required maxLength={3} value={pointForm.currency} onChange={(e) => setPointForm({ ...pointForm, currency: e.target.value.toUpperCase() })} placeholder="USD" /></Field>
              <Field label="Ciudad"><Input value={pointForm.city} onChange={(e) => setPointForm({ ...pointForm, city: e.target.value })} /></Field>
              <Field label="Dirección"><Input value={pointForm.address} onChange={(e) => setPointForm({ ...pointForm, address: e.target.value })} /></Field>
              <Field label="Código postal"><Input value={pointForm.postalCode} onChange={(e) => setPointForm({ ...pointForm, postalCode: e.target.value })} /></Field>
              <Field label="Teléfono"><Input value={pointForm.phone} onChange={(e) => setPointForm({ ...pointForm, phone: e.target.value })} /></Field>
              <Field label="Correo del comercio"><Input type="email" value={pointForm.email} onChange={(e) => setPointForm({ ...pointForm, email: e.target.value })} /></Field>
              <Field label="Hub inicial"><Select value={pointForm.hubId} onChange={(e) => setPointForm({ ...pointForm, hubId: e.target.value })}><option value="">Asignar después</option>{data.hubs.map((hub: any) => <option key={hub.id} value={hub.id}>{hub.name} · {hub.country}</option>)}</Select></Field>
              <Field label="Modo de salida"><Select value={pointForm.decisionMode} onChange={(e) => setPointForm({ ...pointForm, decisionMode: e.target.value })}><option value="rules">Por reglas</option><option value="approval">Con aprobación</option></Select></Field>
            </div></Panel>

            <Panel className="p-6"><h3 className="text-xl font-black flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" /> Operador principal</h3><p className="text-sm text-slate-500 mt-1">La cuenta se utilizará exclusivamente para administrar este Point.</p><div className="grid sm:grid-cols-3 gap-4 mt-5"><Field label="Nombre"><Input value={pointForm.operatorName} onChange={(e) => setPointForm({ ...pointForm, operatorName: e.target.value })} /></Field><Field label="Correo"><Input type="email" value={pointForm.operatorEmail} onChange={(e) => setPointForm({ ...pointForm, operatorEmail: e.target.value })} /></Field><Field label="Contraseña inicial"><Input type="password" value={pointForm.operatorPassword} onChange={(e) => setPointForm({ ...pointForm, operatorPassword: e.target.value })} /></Field></div></Panel>

            <Panel className="p-6"><h3 className="text-xl font-black flex items-center gap-2"><DollarSign className="w-5 h-5 text-blue-600" /> Tarifas y comisiones iniciales</h3><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">{['document','card','envelope','parcel'].map((type) => <div key={type} className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4"><p className="font-black">{itemNames[type]}</p><div className="grid grid-cols-2 gap-2 mt-3"><Field label="Precio"><Input type="number" min="0" step="0.01" value={pointForm[`${type}Price`]} onChange={(e) => setPointForm({ ...pointForm, [`${type}Price`]: Number(e.target.value) })} /></Field><Field label="Comisión"><Input type="number" min="0" step="0.01" value={pointForm[`${type}Commission`]} onChange={(e) => setPointForm({ ...pointForm, [`${type}Commission`]: Number(e.target.value) })} /></Field></div></div>)}</div><label className="mt-5 inline-flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={pointForm.parcelEnabled} onChange={(e) => setPointForm({ ...pointForm, parcelEnabled: e.target.checked })} className="w-4 h-4" /> Habilitar paquetes internacionales desde el inicio</label></Panel>
            <div className="flex justify-end"><button className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black inline-flex items-center gap-2"><Plus className="w-5 h-5" /> Crear Point</button></div>
          </form>
        )}

        {tab === 'hubs' && (
          <div className="grid xl:grid-cols-[0.8fr_1.2fr] gap-6">
            <Panel className="p-6"><h2 className="text-2xl font-black">Crear hub</h2><p className="text-sm text-slate-500 mt-1">Define el centro que recibirá las consolidaciones de los Points.</p><form onSubmit={createHub} className="space-y-4 mt-6"><Field label="Nombre"><Input required value={hubForm.name} onChange={(e) => setHubForm({ ...hubForm, name: e.target.value })} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Código"><Input value={hubForm.code} onChange={(e) => setHubForm({ ...hubForm, code: e.target.value.toUpperCase() })} /></Field><Field label="País"><Input required maxLength={2} value={hubForm.country} onChange={(e) => setHubForm({ ...hubForm, country: e.target.value.toUpperCase() })} /></Field></div><Field label="Ciudad"><Input value={hubForm.city} onChange={(e) => setHubForm({ ...hubForm, city: e.target.value })} /></Field><Field label="Dirección"><Input value={hubForm.address} onChange={(e) => setHubForm({ ...hubForm, address: e.target.value })} /></Field><Field label="Código postal"><Input value={hubForm.postalCode} onChange={(e) => setHubForm({ ...hubForm, postalCode: e.target.value })} /></Field><button className="w-full h-11 rounded-xl bg-blue-600 text-white font-black">Crear hub</button></form></Panel>
            <Panel className="overflow-hidden"><div className="p-6 border-b border-slate-100 dark:border-slate-800"><h2 className="text-2xl font-black">Hubs configurados</h2><p className="text-sm text-slate-500 mt-1">Centros disponibles para recibir y despachar consolidaciones.</p></div>{!data.hubs.length ? <div className="p-10 text-center text-slate-500">No hay registros todavía.</div> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{data.hubs.map((hub: any) => <div key={hub.id} className="p-5 flex items-start gap-4"><div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center"><MapPin className="w-5 h-5" /></div><div className="flex-1"><div className="flex items-center justify-between gap-3"><p className="font-black text-lg">{hub.name}</p><span className="font-mono text-xs font-black text-slate-500">{hub.code}</span></div><p className="text-sm text-slate-500 mt-1">{[hub.address, hub.city, hub.postal_code, hub.country].filter(Boolean).join(' · ') || 'Configura la ubicación'}</p></div></div>)}</div>}</Panel>
          </div>
        )}

        {tab === 'rules' && (
          <div className="grid xl:grid-cols-[0.8fr_1.2fr] gap-6">
            <Panel className="p-6"><h2 className="text-2xl font-black">Nueva regla de salida</h2><p className="text-sm text-slate-500 mt-1">Una consolidación queda lista cuando alcanza la cantidad mínima o el tiempo máximo de espera.</p><form onSubmit={createRule} className="space-y-4 mt-6"><Field label="Aplicar a"><Select value={ruleForm.pointId} onChange={(e) => setRuleForm({ ...ruleForm, pointId: e.target.value })}><option value="">Todos los Points que coincidan</option>{data.points.map((point: any) => <option key={point.id} value={point.id}>{point.name}</option>)}</Select></Field><div className="grid grid-cols-2 gap-3"><Field label="País origen"><Input maxLength={2} value={ruleForm.originCountry} onChange={(e) => setRuleForm({ ...ruleForm, originCountry: e.target.value.toUpperCase() })} placeholder="Todos" /></Field><Field label="País destino"><Input required maxLength={2} value={ruleForm.destinationCountry} onChange={(e) => setRuleForm({ ...ruleForm, destinationCountry: e.target.value.toUpperCase() })} /></Field></div><Field label="Tipo"><Select value={ruleForm.itemType} onChange={(e) => setRuleForm({ ...ruleForm, itemType: e.target.value })}>{Object.entries(itemNames).filter(([key]) => key !== 'mixed').map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select></Field><div className="grid grid-cols-2 gap-3"><Field label="Piezas mínimas"><Input type="number" min="1" value={ruleForm.minItems} onChange={(e) => setRuleForm({ ...ruleForm, minItems: Number(e.target.value) })} /></Field><Field label="Días máximos"><Input type="number" min="0" value={ruleForm.minDays} onChange={(e) => setRuleForm({ ...ruleForm, minDays: Number(e.target.value) })} /></Field></div><Field label="Hub"><Select required value={ruleForm.hubId} onChange={(e) => setRuleForm({ ...ruleForm, hubId: e.target.value })}><option value="">Selecciona un hub</option>{data.hubs.map((hub: any) => <option key={hub.id} value={hub.id}>{hub.name} · {hub.country}</option>)}</Select></Field><Field label="Prioridad"><Input type="number" min="1" value={ruleForm.priority} onChange={(e) => setRuleForm({ ...ruleForm, priority: Number(e.target.value) })} /></Field><button className="w-full h-11 rounded-xl bg-blue-600 text-white font-black">Guardar regla</button></form></Panel>
            <Panel className="overflow-hidden"><div className="p-6 border-b border-slate-100 dark:border-slate-800"><h2 className="text-2xl font-black">Reglas configuradas</h2><p className="text-sm text-slate-500 mt-1">El sistema evalúa primero las reglas específicas del Point y después las generales.</p></div>{!data.rules.length ? <div className="p-10 text-center text-slate-500">No hay registros todavía.</div> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{data.rules.map((rule: any) => <div key={rule.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-black">{itemNames[rule.item_type]} · {rule.origin_country || 'Cualquier origen'} → {rule.destination_country}</p><p className="text-sm text-slate-500 mt-1">{rule.point_name || 'Regla general'} · Hub {rule.hub_name}</p></div><span className="rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-300 px-3 py-1 text-xs font-black">Prioridad {rule.priority}</span></div><div className="grid grid-cols-2 gap-3 mt-4"><div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3"><p className="text-xs text-slate-500 font-bold">Cantidad mínima</p><p className="font-black mt-1">{rule.min_items} piezas</p></div><div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3"><p className="text-xs text-slate-500 font-bold">Tiempo máximo</p><p className="font-black mt-1">{rule.min_days} días</p></div></div></div>)}</div>}</Panel>
          </div>
        )}

        {tab === 'operations' && (
          <div className="space-y-6">
            <Panel className="p-6"><div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5"><div><p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 font-black">Control de consolidación</p><h2 className="text-2xl font-black mt-2">Preparar salida manual</h2><p className="text-sm text-slate-500 mt-1">Úsalo para Points que requieren aprobación o para una salida extraordinaria.</p></div><div className="grid sm:grid-cols-4 gap-3 flex-1 max-w-3xl"><Select value={releaseForm.pointId} onChange={(e) => setReleaseForm({ ...releaseForm, pointId: e.target.value })}><option value="">Selecciona Point</option>{data.points.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select><Select value={releaseForm.itemType} onChange={(e) => setReleaseForm({ ...releaseForm, itemType: e.target.value })}>{['document','card','envelope','parcel'].map((t) => <option key={t} value={t}>{itemNames[t]}</option>)}</Select><Input maxLength={2} value={releaseForm.destinationCountry} onChange={(e) => setReleaseForm({ ...releaseForm, destinationCountry: e.target.value.toUpperCase() })} /><button onClick={() => act(adminPointRequest('/queue/release', { method: 'POST', body: JSON.stringify(releaseForm) }), 'Salida preparada correctamente.')} className="h-11 rounded-xl bg-blue-600 text-white font-black text-sm">Preparar salida</button></div></div></Panel>
            <Panel className="overflow-hidden"><div className="p-6 border-b border-slate-100 dark:border-slate-800"><h2 className="text-2xl font-black">Manifiestos recientes</h2><p className="text-sm text-slate-500 mt-1">Controla el trayecto Point → hub → salida internacional.</p></div>{!data.manifests.length ? <div className="p-10 text-center text-slate-500">No hay datos para mostrar.</div> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{data.manifests.map((manifest: any) => {
              const refs = manifestRefs[manifest.id] || {};
              return <div key={manifest.id} className="p-5"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><p className="font-mono font-black text-blue-600 dark:text-cyan-400">{manifest.manifest_tracking}</p><span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-black">{manifestStatus[manifest.status] || manifest.status}</span></div><p className="font-black text-lg mt-2">{manifest.point_name}</p><p className="text-sm text-slate-500 mt-1">{manifest.item_count} piezas · {itemNames[manifest.item_type] || manifest.item_type} · Hub {manifest.hub_name}</p></div><div className="flex flex-wrap gap-2">{manifest.status === 'ready' && <button onClick={() => act(adminPointRequest(`/manifests/${manifest.id}/dispatch`, { method: 'POST', body: JSON.stringify({ originTracking: refs.originTracking || '' }) }))} className="h-10 px-3 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xs inline-flex items-center gap-2"><Truck className="w-4 h-4" /> Enviado al hub</button>}{manifest.status === 'in_transit_to_hub' && <button onClick={() => act(adminPointRequest(`/manifests/${manifest.id}/receive`, { method: 'POST', body: '{}' }))} className="h-10 px-3 rounded-xl bg-blue-600 text-white font-black text-xs inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> Recibido en hub</button>}{manifest.status === 'at_hub' && <button onClick={() => act(adminPointRequest(`/manifests/${manifest.id}/export`, { method: 'POST', body: JSON.stringify({ exportTracking: refs.exportTracking || '', localTracking: refs.localTracking || '' }) }))} className="h-10 px-3 rounded-xl bg-emerald-600 text-white font-black text-xs inline-flex items-center gap-2"><Plane className="w-4 h-4" /> Salida internacional</button>}</div></div>{manifest.status === 'ready' && <div className="mt-4 max-w-md"><Field label="Referencia de traslado al hub"><Input value={refs.originTracking || ''} onChange={(e) => setManifestRefs({ ...manifestRefs, [manifest.id]: { ...refs, originTracking: e.target.value } })} placeholder="Opcional" /></Field></div>}{manifest.status === 'at_hub' && <div className="grid sm:grid-cols-2 gap-3 mt-4 max-w-2xl"><Field label="Referencia internacional"><Input value={refs.exportTracking || ''} onChange={(e) => setManifestRefs({ ...manifestRefs, [manifest.id]: { ...refs, exportTracking: e.target.value } })} /></Field><Field label="Referencia local"><Input value={refs.localTracking || ''} onChange={(e) => setManifestRefs({ ...manifestRefs, [manifest.id]: { ...refs, localTracking: e.target.value } })} /></Field></div>}</div>;
            })}</div>}</Panel>
          </div>
        )}

        {tab === 'payouts' && (
          <div>
            <div className="mb-6"><p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 font-black">Pagos a comercios</p><h2 className="text-3xl font-black mt-2">Comisiones</h2><p className="text-slate-500 mt-1">Revisa y confirma solicitudes de pago de los Points.</p></div>
            {!data.payouts.length ? <Panel className="p-10 text-center"><Wallet className="w-10 h-10 mx-auto text-slate-300" /><h3 className="font-black mt-3">No hay pagos pendientes</h3><p className="text-sm text-slate-500 mt-1">Las solicitudes aparecerán aquí cuando un comercio solicite sus comisiones.</p></Panel> : <Panel className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-4">Point</th><th className="p-4">Fecha</th><th className="p-4">Monto</th><th className="p-4">Método</th><th className="p-4">Estado</th><th className="p-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{data.payouts.map((row: any) => <tr key={row.id}><td className="p-4 font-black">{row.point_name}</td><td className="p-4 text-slate-500">{new Date(row.created_at).toLocaleString('es-DO')}</td><td className="p-4 font-black">{money(row.amount, row.currency)}</td><td className="p-4 uppercase font-bold">{row.method}</td><td className="p-4"><span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-black">{row.status === 'pending' ? 'Pendiente' : row.status === 'approved' ? 'Aprobado' : row.status === 'paid' ? 'Pagado' : row.status === 'rejected' ? 'Rechazado' : row.status}</span></td><td className="p-4"><div className="flex justify-end gap-2">{['pending','approved'].includes(row.status) && <><button onClick={() => act(adminPointRequest(`/payouts/${row.id}/approve`, { method: 'POST', body: '{}' }))} className="h-9 px-3 rounded-lg bg-emerald-600 text-white font-black text-xs">Confirmar pago</button><button onClick={() => act(adminPointRequest(`/payouts/${row.id}/reject`, { method: 'POST', body: '{}' }))} className="h-9 px-3 rounded-lg border border-rose-200 text-rose-600 font-black text-xs">Rechazar</button></>}</div></td></tr>)}</tbody></table></div></Panel>}
          </div>
        )}

        {tab === 'tracking' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <Panel className="p-6"><p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 font-black">Continuidad de tracking</p><h2 className="text-2xl font-black mt-2">Asociar entrega final</h2><p className="text-sm text-slate-500 mt-1">Busca una emisión por tracking del cliente o número de recibo y vincúlala con el envío de última etapa.</p><form onSubmit={lookup} className="flex flex-col sm:flex-row gap-3 mt-5"><Input value={lookupCode} onChange={(e) => setLookupCode(e.target.value.toUpperCase())} placeholder="Tracking o recibo" className="flex-1" /><button className="h-11 px-5 rounded-xl bg-blue-600 text-white font-black inline-flex items-center justify-center gap-2"><Search className="w-4 h-4" /> Buscar</button></form></Panel>
            {lookupResult && <Panel className="p-6"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5"><div><p className="font-mono font-black text-blue-600 dark:text-cyan-400">{lookupResult.item.customerTracking}</p><h3 className="text-xl font-black mt-2">{lookupResult.item.sender?.name} → {lookupResult.item.recipient?.name}</h3><p className="text-sm text-slate-500 mt-1">{lookupResult.operation?.pointName} · {lookupResult.item.statusLabel}</p></div>{lookupResult.operation?.manifestTracking && <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3"><p className="text-xs text-slate-500 font-bold">Manifiesto</p><p className="font-mono font-black mt-1">{lookupResult.operation.manifestTracking}</p></div>}</div><div className="grid sm:grid-cols-2 gap-4 mt-6"><Field label="ID del envío final"><Input value={finalLink.finalShipmentId} onChange={(e) => setFinalLink({ ...finalLink, finalShipmentId: e.target.value })} /></Field><Field label="Referencia del envío final"><Input value={finalLink.finalShipmentTracking} onChange={(e) => setFinalLink({ ...finalLink, finalShipmentTracking: e.target.value })} /></Field><Field label="Referencia local"><Input value={finalLink.localTracking} onChange={(e) => setFinalLink({ ...finalLink, localTracking: e.target.value })} /></Field><Field label="Ubicación"><Input value={finalLink.location} onChange={(e) => setFinalLink({ ...finalLink, location: e.target.value })} placeholder="Ej. Santo Domingo" /></Field></div><button onClick={linkFinal} className="mt-5 h-11 px-5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black inline-flex items-center gap-2"><Send className="w-4 h-4" /> Asociar entrega final</button>{lookupResult.events?.length > 0 && <div className="mt-7"><h4 className="font-black">Historial operativo</h4><div className="space-y-3 mt-4">{lookupResult.events.map((event: any) => <div key={event.id} className="flex gap-3"><div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-600 shrink-0" /><div><p className="text-sm font-black">{event.label}</p><p className="text-xs text-slate-500 mt-0.5">{event.location ? `${event.location} · ` : ''}{new Date(event.event_time).toLocaleString('es-DO')}</p></div></div>)}</div></div>}</Panel>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPoints;
