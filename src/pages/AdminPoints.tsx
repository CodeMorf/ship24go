import React, { useEffect, useState } from 'react';
import { Check, ExternalLink, MapPin, RefreshCw, Search, Store, X } from 'lucide-react';
import { api } from '../lib/api';

const STATUS_LABELS: Record<string, string> = { pending: 'Pendiente', approved: 'Aprobado', suspended: 'Suspendido', rejected: 'Rechazado' };
const STATUS_STYLES: Record<string, string> = { pending: 'bg-amber-50 text-amber-700 border-amber-200', approved: 'bg-emerald-50 text-emerald-700 border-emerald-200', suspended: 'bg-slate-100 text-slate-700 border-slate-200', rejected: 'bg-red-50 text-red-700 border-red-200' };

export default function AdminPoints() {
  const [points, setPoints] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [busyProductId, setBusyProductId] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [pointResponse, productResponse] = await Promise.all([api.getAdminPoints(), api.getAdminPointProducts()]);
      setPoints(pointResponse.points || []);
      setProducts(productResponse.products || []);
    }
    catch (err: any) { setError(err.message || 'No se pudieron cargar los Points.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const changeStatus = async (point: any, status: string) => {
    const reviewNote = status === 'rejected' ? window.prompt('Motivo del rechazo (opcional):', point.reviewNote || '') || '' : '';
    setBusyId(point.id); setError('');
    try { await api.updateAdminPointStatus(point.id, status, reviewNote); await load(); }
    catch (err: any) { setError(err.message || 'No se pudo actualizar el Point.'); }
    finally { setBusyId(''); }
  };

  const saveProduct = async (product: any) => {
    setBusyProductId(product.id); setError('');
    try {
      const response = await api.updateAdminPointProduct(product.id, { basePrice: Number(product.base_price), commissionPercent: Number(product.commission_percent), currency: product.currency, isActive: Boolean(product.is_active) });
      setProducts((current) => current.map((item) => item.id === product.id ? response.product : item));
    } catch (err: any) { setError(err.message || 'No se pudo guardar el producto.'); }
    finally { setBusyProductId(''); }
  };

  const visible = points.filter((point) => `${point.businessName} ${point.contactName} ${point.email} ${point.city}`.toLowerCase().includes(search.toLowerCase()));
  const pendingCount = points.filter((point) => point.status === 'pending').length;

  return (
    <div className="p-5 md:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-blue-600">Red logística</p><h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">Points afiliados</h1><p className="text-slate-500 dark:text-slate-400 mt-2">Revisa la ubicación y habilita comercios antes de que puedan emitir.</p></div><button onClick={load} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 bg-white dark:bg-slate-800 font-bold text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Actualizar</button></div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-semibold">{error}</div>}
      <div className="grid sm:grid-cols-3 gap-4"><div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5"><p className="text-xs font-black uppercase text-slate-400">Total Points</p><p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{points.length}</p></div><div className="rounded-2xl bg-amber-50 border border-amber-200 p-5"><p className="text-xs font-black uppercase text-amber-600">Pendientes</p><p className="text-3xl font-black text-amber-800 mt-2">{pendingCount}</p></div><div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5"><p className="text-xs font-black uppercase text-emerald-600">Aprobados</p><p className="text-3xl font-black text-emerald-800 mt-2">{points.filter((point) => point.status === 'approved').length}</p></div></div>
      <section className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5"><div className="flex items-center justify-between gap-3 mb-4"><div><h2 className="font-black text-slate-900 dark:text-white">Productos y reglas comerciales</h2><p className="text-sm text-slate-500 mt-1">Configura precio base y comisión; la comisión se calcula en el servidor.</p></div></div><div className="grid md:grid-cols-3 gap-4">{products.map((product) => <div key={product.id} className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-4"><p className="font-black text-slate-900 dark:text-white">{product.name}</p><p className="text-xs text-slate-500 mt-1">{product.code}</p><div className="grid grid-cols-2 gap-2 mt-4"><label className="block"><span className="text-[10px] font-black uppercase text-slate-400">Precio base</span><input type="number" min="0" step="0.01" value={product.base_price} onChange={(e) => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, base_price: e.target.value } : item))} className="input-dynamic mt-1" /></label><label className="block"><span className="text-[10px] font-black uppercase text-slate-400">Comisión %</span><input type="number" min="0" max="100" step="0.001" value={product.commission_percent} onChange={(e) => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, commission_percent: e.target.value } : item))} className="input-dynamic mt-1" /></label></div><button disabled={busyProductId === product.id} onClick={() => saveProduct(product)} className="mt-3 w-full rounded-xl bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white py-2 text-xs font-black">{busyProductId === product.id ? 'Guardando…' : 'Guardar regla'}</button></div>)}</div></section>
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3"><Search className="w-5 h-5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white" placeholder="Buscar por comercio, responsable, correo o ciudad…" /></div>
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-slate-50 dark:bg-slate-900/60"><tr className="text-[11px] uppercase tracking-wider text-slate-500"><th className="px-5 py-4">Comercio</th><th className="px-5 py-4">Contacto</th><th className="px-5 py-4">Ubicación</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{loading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Cargando Points…</td></tr> : visible.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">No hay Points que mostrar.</td></tr> : visible.map((point) => <tr key={point.id} className="align-top"><td className="px-5 py-5"><div className="flex items-start gap-3"><div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 grid place-items-center"><Store className="w-4 h-4" /></div><div><p className="font-black text-slate-900 dark:text-white">{point.businessName}</p><p className="text-xs text-slate-500 mt-1">Creado {new Date(point.createdAt).toLocaleDateString()}</p></div></div></td><td className="px-5 py-5"><p className="font-bold text-sm text-slate-800 dark:text-slate-200">{point.contactName}</p><p className="text-xs text-slate-500 mt-1">{point.email}</p><p className="text-xs text-slate-500">{point.phone || 'Sin teléfono'}</p></td><td className="px-5 py-5"><p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-600" />{point.formattedAddress}</p><p className="font-mono text-[11px] text-slate-500 mt-1">{Number(point.latitude).toFixed(7)}, {Number(point.longitude).toFixed(7)}</p><a href={`https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 mt-2">Ver mapa <ExternalLink className="w-3 h-3" /></a></td><td className="px-5 py-5"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${STATUS_STYLES[point.status] || STATUS_STYLES.pending}`}>{STATUS_LABELS[point.status] || point.status}</span>{point.reviewNote && <p className="text-xs text-slate-500 mt-2 max-w-[180px]">{point.reviewNote}</p>}</td><td className="px-5 py-5"><div className="flex justify-end gap-2">{point.status !== 'approved' && <button disabled={busyId === point.id} onClick={() => changeStatus(point, 'approved')} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-2 text-xs font-black flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Aprobar</button>}{point.status !== 'rejected' && <button disabled={busyId === point.id} onClick={() => changeStatus(point, 'rejected')} className="rounded-xl bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 text-xs font-black flex items-center gap-1"><X className="w-3.5 h-3.5" /> Rechazar</button>}{point.status === 'approved' && <button disabled={busyId === point.id} onClick={() => changeStatus(point, 'suspended')} className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-black">Suspender</button>}</div></td></tr>)}</tbody></table></div></div>
    </div>
  );
}
