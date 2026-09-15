import React, { useEffect, useState, useRef } from 'react';
import { Check, ExternalLink, MapPin, MessageSquare, RefreshCw, Search, Send, Store, User, X } from 'lucide-react';
import { api } from '../lib/api';

const STATUS_LABELS: Record<string, string> = { pending: 'Pendiente', approved: 'Aprobado', suspended: 'Suspendido', rejected: 'Rechazado' };
const STATUS_STYLES: Record<string, string> = { pending: 'bg-amber-50 text-amber-700 border-amber-200', approved: 'bg-emerald-50 text-emerald-700 border-emerald-200', suspended: 'bg-slate-100 text-slate-700 border-slate-200', rejected: 'bg-red-50 text-red-700 border-red-200' };

export default function AdminPoints() {
  const [points, setPoints] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [busyProductId, setBusyProductId] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Estado del Chat Modal
  const [activeChatPoint, setActiveChatPoint] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [pointResponse, productResponse, teamResponse] = await Promise.all([
        api.getAdminPoints(),
        api.getAdminPointProducts(),
        (api as any).getAdminTeam().catch(() => ({ members: [] }))
      ]);
      setPoints(pointResponse.points || []);
      setProducts(productResponse.products || []);
      setTeamMembers(teamResponse.members || []);
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

  const assignExecutive = async (pointId: string, executiveUserId: string | null) => {
    setBusyId(pointId); setError('');
    try {
      await (api as any).assignAdminPointExecutive(pointId, executiveUserId);
      await load();
    } catch (err: any) {
      setError(err.message || 'No se pudo asignar el ejecutivo.');
    } finally {
      setBusyId('');
    }
  };

  const saveProduct = async (product: any) => {
    setBusyProductId(product.id); setError('');
    try {
      const response = await api.updateAdminPointProduct(product.id, { basePrice: Number(product.base_price), commissionPercent: Number(product.commission_percent), currency: product.currency, isActive: Boolean(product.is_active) });
      setProducts((current) => current.map((item) => item.id === product.id ? response.product : item));
    } catch (err: any) { setError(err.message || 'No se pudo guardar el producto.'); }
    finally { setBusyProductId(''); }
  };

  // Lógica del Chat
  const openChat = async (point: any) => {
    setActiveChatPoint(point);
    setChatLoading(true);
    try {
      const res = await (api as any).getAdminPointChat(point.id);
      setChatMessages(res.messages || []);
    } catch (err: any) {
      console.error('Error cargando chat:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const refreshChat = async () => {
    if (!activeChatPoint) return;
    try {
      const res = await (api as any).getAdminPointChat(activeChatPoint.id);
      setChatMessages(res.messages || []);
    } catch (e) {}
  };

  // Polling del chat activo cada 3.5 segundos
  useEffect(() => {
    if (!activeChatPoint) return;
    const interval = setInterval(refreshChat, 3500);
    return () => clearInterval(interval);
  }, [activeChatPoint]);

  useEffect(() => {
    if (activeChatPoint && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatPoint]);

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatPoint || chatSending) return;
    const text = chatInput.trim();
    setChatInput('');
    setChatSending(true);
    try {
      await (api as any).sendAdminPointChat(activeChatPoint.id, text);
      await refreshChat();
    } catch (err: any) {
      alert(err.message || 'Error al enviar mensaje.');
    } finally {
      setChatSending(false);
    }
  };

  const visible = points.filter((point) => `${point.businessName} ${point.contactName} ${point.email} ${point.city} ${point.executiveName || ''}`.toLowerCase().includes(search.toLowerCase()));
  const pendingCount = points.filter((point) => point.status === 'pending').length;

  return (
    <div className="p-5 md:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-blue-600">Red logística</p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">Points afiliados</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Revisa la ubicación, asigna un ejecutivo de cuenta y habilita comercios para operar.</p>
        </div>
        <button onClick={load} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 bg-white dark:bg-slate-800 font-bold text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-semibold">{error}</div>}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-xs font-black uppercase text-slate-400">Total Points</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{points.length}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <p className="text-xs font-black uppercase text-amber-600">Pendientes</p>
          <p className="text-3xl font-black text-amber-800 mt-2">{pendingCount}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
          <p className="text-xs font-black uppercase text-emerald-600">Aprobados</p>
          <p className="text-3xl font-black text-emerald-800 mt-2">{points.filter((point) => point.status === 'approved').length}</p>
        </div>
      </div>

      <section className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-black text-slate-900 dark:text-white">Productos y reglas comerciales</h2>
            <p className="text-sm text-slate-500 mt-1">Configura precio base y comisión; la comisión se calcula en el servidor.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-4">
              <p className="font-black text-slate-900 dark:text-white">{product.name}</p>
              <p className="text-xs text-slate-500 mt-1">{product.code}</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <label className="block">
                  <span className="text-[10px] font-black uppercase text-slate-400">Precio base</span>
                  <input type="number" min="0" step="0.01" value={product.base_price} onChange={(e) => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, base_price: e.target.value } : item))} className="input-dynamic mt-1" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase text-slate-400">Comisión %</span>
                  <input type="number" min="0" max="100" step="0.001" value={product.commission_percent} onChange={(e) => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, commission_percent: e.target.value } : item))} className="input-dynamic mt-1" />
                </label>
              </div>
              <button disabled={busyProductId === product.id} onClick={() => saveProduct(product)} className="mt-3 w-full rounded-xl bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white py-2 text-xs font-black">
                {busyProductId === product.id ? 'Guardando…' : 'Guardar regla'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white" placeholder="Buscar por comercio, responsable, correo, ejecutivo o ciudad…" />
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">Comercio</th>
                <th className="px-5 py-4">Contacto</th>
                <th className="px-5 py-4">Ejecutivo Asignado</th>
                <th className="px-5 py-4">Ubicación</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Cargando Points…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No hay Points que mostrar.</td></tr>
              ) : (
                visible.map((point) => (
                  <tr key={point.id} className="align-top">
                    <td className="px-5 py-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{point.businessName}</p>
                          <p className="text-xs text-slate-500 mt-1">Creado {new Date(point.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{point.contactName}</p>
                      <p className="text-xs text-slate-500 mt-1">{point.email}</p>
                      <p className="text-xs text-slate-500">{point.phone || 'Sin teléfono'}</p>
                    </td>
                    <td className="px-5 py-5">
                      <select
                        disabled={busyId === point.id}
                        value={point.executiveUserId || ''}
                        onChange={(e) => assignExecutive(point.id, e.target.value || null)}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold px-3 py-2 text-slate-800 dark:text-slate-200 outline-none w-full max-w-[200px]"
                      >
                        <option value="">(Sin ejecutivo asignado)</option>
                        {teamMembers.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role_name || m.role})
                          </option>
                        ))}
                      </select>
                      {point.executiveName ? (
                        <p className="text-[11px] text-blue-600 dark:text-cyan-400 font-bold mt-1">
                          {point.executiveName}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-1">Sin manager asignado</p>
                      )}
                    </td>
                    <td className="px-5 py-5">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />{point.formattedAddress}
                      </p>
                      <p className="font-mono text-[11px] text-slate-500 mt-1">{Number(point.latitude).toFixed(7)}, {Number(point.longitude).toFixed(7)}</p>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 mt-2">
                        Ver mapa <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-5 py-5">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${STATUS_STYLES[point.status] || STATUS_STYLES.pending}`}>
                        {STATUS_LABELS[point.status] || point.status}
                      </span>
                      {point.reviewNote && <p className="text-xs text-slate-500 mt-2 max-w-[180px]">{point.reviewNote}</p>}
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => openChat(point)}
                          className="rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-300 px-3 py-2 text-xs font-black flex items-center gap-1.5"
                          title="Abrir chat con el Point"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </button>
                        {point.status !== 'approved' && (
                          <button disabled={busyId === point.id} onClick={() => changeStatus(point, 'approved')} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-2 text-xs font-black flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Aprobar
                          </button>
                        )}
                        {point.status !== 'rejected' && (
                          <button disabled={busyId === point.id} onClick={() => changeStatus(point, 'rejected')} className="rounded-xl bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 text-xs font-black flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Rechazar
                          </button>
                        )}
                        {point.status === 'approved' && (
                          <button disabled={busyId === point.id} onClick={() => changeStatus(point, 'suspended')} className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-black">
                            Suspender
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CHAT DIRECTO CON EL POINT */}
      {activeChatPoint && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl h-[600px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header del Chat */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                    {activeChatPoint.businessName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeChatPoint.contactName} · {activeChatPoint.city} · {activeChatPoint.phone || activeChatPoint.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveChatPoint(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mensajes del Chat */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/30 dark:bg-slate-950/30">
              {chatLoading ? (
                <div className="py-12 text-center text-slate-400 text-sm">Cargando mensajes…</div>
              ) : chatMessages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  No hay mensajes aún con este Point. Escribe para iniciar la asistencia.
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isStaff = msg.sender_role === 'super_admin' || msg.sender_role === 'executive';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                        {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                          isStaff
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

            {/* Input del Chat */}
            <form onSubmit={sendChatMessage} className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe una respuesta o mensaje de asistencia…"
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

