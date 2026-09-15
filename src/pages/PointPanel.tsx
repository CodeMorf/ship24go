import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileText,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  PackagePlus,
  RefreshCw,
  Send,
  ShieldAlert,
  Store,
  Sun,
  User,
  Wallet,
  X,
  XCircle,
  LayoutDashboard,
  FolderArchive,
  Layers,
  Clock,
  Printer,
  DollarSign,
  TrendingUp,
  Banknote,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getAuthToken, removeAuthToken } from '../lib/api';
import { BrandMark } from '../lib/brand';
import { useTheme } from '../lib/theme';
import { PointTerminal } from '../components/point/PointTerminal';
import { PointManifests } from '../components/point/PointManifests';
import { PointFinance } from '../components/point/PointFinance';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente de revisión',
  approved: 'Aprobado y Activo',
  suspended: 'Suspendido',
  rejected: 'Rechazado'
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  approved: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  suspended: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  rejected: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function PointPanel() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'terminal' | 'manifests' | 'finance'>('dashboard');
  const [point, setPoint] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [sacaSummary, setSacaSummary] = useState<any>(null);
  const [financeSummary, setFinanceSummary] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Estado del Chat con Ejecutivo
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    if (!getAuthToken()) {
      navigate('/auth/login', { replace: true });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [pointResponse, productResponse, operationResponse, sacaResponse, financeResponse] = await Promise.all([
        api.getPointMe(),
        api.getPointProducts().catch(() => ({ products: [] })),
        api.getPointOperations().catch(() => ({ operations: [] })),
        api.getCurrentSaca('documents').catch(() => ({ manifest: null, shipments: [] })),
        api.getPointFinanceSummary().catch(() => ({ summary: {} }))
      ]);

      setPoint(pointResponse.point);
      setProducts(productResponse.products || []);
      setOperations(operationResponse.operations || []);
      setSacaSummary({
        manifest: sacaResponse.manifest,
        count: sacaResponse.shipments?.length || 0,
        threshold: sacaResponse.manifest?.min_items_threshold || 10
      });
      setFinanceSummary(financeResponse.summary || {});
    } catch (err: any) {
      if (String(err.message || '').includes('no tiene un Point')) {
        navigate('/point/register', { replace: true });
      } else {
        setError(err.message || 'No se pudo cargar el panel Point.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  const totalCommission = useMemo(() => {
    return operations.reduce((sum, op) => sum + Number(op.commissionAmount || 0), 0);
  }, [operations]);

  const logout = () => {
    removeAuthToken();
    navigate('/auth/login');
  };

  if (loading && !point) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 grid place-items-center text-slate-900 dark:text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 font-bold">Cargando panel Point…</p>
        </div>
      </div>
    );
  }

  const sacaCount = sacaSummary?.count || 0;
  const sacaThreshold = sacaSummary?.threshold || 10;
  const sacaReady = sacaCount >= sacaThreshold;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors relative">
      {/* HEADER SUPERIOR */}
      <header className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <BrandMark iconClassName="w-8 h-8 rounded-xl" textClassName="text-lg font-black text-slate-900 dark:text-white" />
            </Link>
            <span className="hidden md:inline-block w-px h-5 bg-slate-200 dark:bg-slate-800" />
            <span className="hidden md:inline text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Point Logistics Partner
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openChatModal}
              className="relative rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3 py-2 text-xs font-bold text-blue-600 dark:text-cyan-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Ejecutivo de Cuenta</span>
              {Boolean(point?.unreadChatCount) && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 p-2 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={logout}
              className="rounded-xl border border-slate-200 dark:border-white/15 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL DE PESTAÑAS (TABS) */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard General
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'terminal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Store className="w-4 h-4" />
              Terminal Mostrador (POS)
            </button>

            <button
              onClick={() => setActiveTab('manifests')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'manifests'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              Sacas & Manifiestos (RD)
              <span
                className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                  sacaReady
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-cyan-300'
                }`}
              >
                {sacaCount}/{sacaThreshold}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'finance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Caja & Finanzas
              {Number(financeSummary?.cashInHandToday || 0) > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ${Number(financeSummary?.cashInHandToday).toFixed(0)} en caja
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-7">
        {error && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-3">
            <XCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {notice}
          </div>
        )}

        {/* ===================== TAB: DASHBOARD ===================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-7">
            {/* HERO DEL POINT */}
            <section className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden relative shadow-sm">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl" />
              <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 dark:text-cyan-300">
                      {point?.businessName || 'Boston Express Hub & Ship Point'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black mt-2">
                    Panel de Control Operativo
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-2xl">
                    Emite envíos en mostrador con tarifas oficiales Ship24Go, agrupa documentos para República Dominicana en sacas y concilia tu caja diaria.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer hover:scale-105"
                  >
                    <Store className="w-4 h-4" />
                    Abrir Mostrador POS
                  </button>
                  <StatusBadge status={point?.status || 'pending'} />
                </div>
              </div>
            </section>

            {/* RESUMEN DEL DÍA (MÓDULO A - KPIS REQUERIDOS) */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Envíos Creados Hoy */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-black uppercase">Envíos Hoy</span>
                  <PackagePlus className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">
                  {financeSummary?.operationsToday || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Emitidos en este mostrador hoy
                </p>
              </div>

              {/* Saca Abierta / Documentos Recibidos */}
              <div
                onClick={() => setActiveTab('manifests')}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 cursor-pointer hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-black uppercase">Saca Documentos RD</span>
                  <FolderArchive className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-blue-600 dark:text-cyan-400">{sacaCount}</span>
                  <span className="text-sm font-bold text-slate-400">/ {sacaThreshold}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {sacaReady ? '¡Lista para cerrar!' : `Faltan ${Math.max(0, sacaThreshold - sacaCount)} para consolidar`}
                </p>
              </div>

              {/* Efectivo en Caja Hoy */}
              <div
                onClick={() => setActiveTab('finance')}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 cursor-pointer hover:border-emerald-500 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-black uppercase">Efectivo en Caja</span>
                  <Banknote className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">
                  ${Number(financeSummary?.cashInHandToday || 0).toFixed(2)}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  Dinero en cajón físico
                </p>
              </div>

              {/* Comisiones Ganadas */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-black uppercase">Tus Comisiones</span>
                  <DollarSign className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-3xl font-black mt-2 text-purple-600 dark:text-purple-400">
                  ${totalCommission.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {point?.currency || 'USD'} acumulado
                </p>
              </div>
            </section>

            {/* SECCIÓN SECUNDARIA: HORARIOS, DIRECCIÓN Y EJECUTIVO */}
            <section className="grid md:grid-cols-3 gap-4">
              {/* Horario de Atención y Estado */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Horario y Atención
                  </div>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-2">
                    Lunes a Sábado
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    8:00 AM – 7:00 PM (Hora Este)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Domingos: 10:00 AM – 4:00 PM
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Recepción Habilitada</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* Ubicación y Hub de Enlace */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Ubicación Verificada
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-2 truncate">
                    {point?.formattedAddress || `${point?.addressLine1}, ${point?.city}`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enlace Logístico: Boston Express Hub (HUB-BOS)
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    className="text-xs text-blue-600 dark:text-cyan-300 font-bold inline-flex items-center gap-1"
                    href={`https://www.google.com/maps/search/?api=1&query=${point?.latitude},${point?.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir en Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Tarjeta del Ejecutivo Asignado */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-900 dark:to-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                      Ejecutivo Asignado
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    {point?.executive?.avatar_url ? (
                      <img
                        src={point.executive.avatar_url}
                        alt={point?.executive?.name || 'Ejecutivo'}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-base shadow-xs shrink-0">
                        {(point?.executive?.name || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 dark:text-white text-sm leading-snug truncate">
                        {point?.executive?.name || 'Equipo Central Ship24Go'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {point?.executive?.email || 'soporte@ship24go.com'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={openChatModal}
                  className="mt-3 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contactar en Chat</span>
                  {Boolean(point?.unreadChatCount) && (
                    <span className="bg-red-500 text-white rounded-full px-1.5 py-0.2 text-[10px] font-black">
                      {point.unreadChatCount}
                    </span>
                  )}
                </button>
              </div>
            </section>

            {/* TABLA DE OPERACIONES RECIENTES */}
            <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-6 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Últimos Envíos Emitidos</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Historial en tiempo real de operaciones de este mostrador.</p>
                </div>
                <button
                  onClick={load}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Actualizar"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {operations.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  <Clipboard className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-bold text-sm">Todavía no hay operaciones registradas.</p>
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className="mt-3 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    Crear el primer envío en el Mostrador &rarr;
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {operations.slice(0, 10).map((operation) => (
                    <div key={operation.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <div>
                        <p className="font-mono font-black text-blue-700 dark:text-cyan-300 text-sm">
                          {operation.trackingCode}
                        </p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                          {operation.productName} · Para: {operation.recipient?.name || 'Destinatario'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Destino: {operation.recipient?.city || 'República Dominicana'} · {new Date(operation.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-slate-400">Comisión</p>
                          <p className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                            +${Number(operation.commissionAmount || 0).toFixed(2)} {operation.currency}
                          </p>
                        </div>
                        <a
                          href={`/tracking?code=${encodeURIComponent(operation.trackingCode)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 text-xs font-black text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          Ver Tracking
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ===================== TAB: TERMINAL POS MOSTRADOR ===================== */}
        {activeTab === 'terminal' && (
          <PointTerminal point={point} onShipmentCreated={load} />
        )}

        {/* ===================== TAB: SACAS & MANIFIESTOS (RD) ===================== */}
        {activeTab === 'manifests' && (
          <PointManifests point={point} onRefreshNeeded={load} />
        )}

        {/* ===================== TAB: CAJA & FINANZAS ===================== */}
        {activeTab === 'finance' && (
          <PointFinance point={point} />
        )}
      </main>

      {/* BOTÓN FLOTANTE DE ASISTENCIA CHAT */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={openChatModal}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white p-4 shadow-xl flex items-center gap-2.5 transition-transform hover:scale-105 cursor-pointer"
          title="Chat con tu ejecutivo"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden md:inline font-bold text-xs">Chat con mi Ejecutivo</span>
          {Boolean(point?.unreadChatCount) && (
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white animate-ping" />
          )}
        </button>
      </div>

      {/* MODAL DEL CHAT CON EJECUTIVO */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl h-[600px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Chat */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                {point?.executive?.avatar_url ? (
                  <img
                    src={point.executive.avatar_url}
                    alt={point?.executive?.name || 'Ejecutivo'}
                    className="w-10 h-10 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    {(point?.executive?.name || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
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
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
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
                  Escribe un mensaje para contactar a tu ejecutivo asignado en tiempo real.
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.sender_role === 'point';
                  const avatarToShow = msg.sender_avatar_url || (!isMe ? point?.executive?.avatar_url : null);
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`flex items-center gap-1.5 mb-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isMe && (
                          avatarToShow ? (
                            <img
                              src={avatarToShow}
                              alt={msg.sender_name}
                              className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-600 shrink-0"
                            />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                              {(msg.sender_name || 'E').charAt(0).toUpperCase()}
                            </span>
                          )
                        )}
                        <span className="text-[10px] font-bold text-slate-400">
                          {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
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

            {/* Input Chat */}
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
                className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
