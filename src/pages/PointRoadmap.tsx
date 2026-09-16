import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BarChart3,
  Boxes,
  Building,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Cpu,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Globe,
  HelpCircle,
  Home,
  Info,
  Key,
  Landmark,
  Layers,
  Lock,
  MapPin,
  Package,
  PackageCheck,
  PackagePlus,
  Plane,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Store,
  Terminal,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Zap
} from 'lucide-react';
import { BrandMark } from '../lib/brand';
import { useCurrency } from '../lib/currency';

export default function PointRoadmap() {
  const [activeSection, setActiveSection] = useState<'roadmap' | 'flow' | 'pricing' | 'roles' | 'security' | 'faq'>('roadmap');
  const [packagesPerDay, setPackagesPerDay] = useState(10);
  const { rates } = useCurrency();

  const usdToDopRate = rates?.DOP && rates?.USD ? Number((rates.DOP / rates.USD).toFixed(2)) : 58.91;
  const formatDop = (val: number) => `RD$ ${Number(val || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Simulación de rentabilidad
  const avgCommissionUsd = 6.00; // promedio ponderado de comisiones (doc + cajas)
  const monthlyEarningsUsd = packagesPerDay * avgCommissionUsd * 26; // 26 días laborables
  const monthlyEarningsDop = monthlyEarningsUsd * usdToDopRate;
  const yearlyEarningsUsd = monthlyEarningsUsd * 12;
  const yearlyEarningsDop = monthlyEarningsDop * 12;

  const scrollToSection = (id: 'roadmap' | 'flow' | 'pricing' | 'roles' | 'security' | 'faq') => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -140;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-blue-600 selection:text-white">
      {/* ========================================================
          TOP NAVBAR
          ======================================================== */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <BrandMark showText={false} iconClassName="w-9 h-9 rounded-xl shadow-xs" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  Red Points
                </span>
                <span className="text-[10px] font-extrabold text-blue-600 dark:text-cyan-400 lowercase">
                  by ship24go.com
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-cyan-300 border border-blue-200 dark:border-blue-900/40">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Roadmap Oficial & Guía Operativa
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer print:hidden"
              title="Imprimir Guía o Guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <Link
              to="/point"
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Terminal POS</span>
            </Link>
            <Link
              to="/point/register"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>Afiliar mi Negocio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================
          HERO BANNER
          ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white py-16 sm:py-20 border-b border-indigo-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                15% Comisión Neta Garantizada
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                Corredor Bidireccional USA ⇄ RD
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Inversión \$0 en Vehículos
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Roadmap Oficial & Manual Operativo de la Red Point
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Descubre la arquitectura logística completa, el flujo de emisión en mostrador, el sistema de valijas inteligentes, la conexión aérea con Miami y la evolución tecnológica prevista para 2026–2027.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>Hub Miami: Doral, FL 33122</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>Hub SDQ: Ensanche Luperón 10401</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Tasa en vivo: 1 USD = {formatDop(usdToDopRate)} DOP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          STICKY NAVIGATION SUB-BAR
          ======================================================== */}
      <div className="sticky top-16 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar text-xs font-bold">
            <button
              onClick={() => scrollToSection('roadmap')}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'roadmap'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>1. Roadmap (2026 - 2027)</span>
            </button>

            <button
              onClick={() => scrollToSection('flow')}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'flow'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>2. Flujo Operativo End-to-End</span>
            </button>

            <button
              onClick={() => scrollToSection('pricing')}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'pricing'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>3. Tarifas & Rentabilidad (15%)</span>
            </button>

            <button
              onClick={() => scrollToSection('roles')}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'roles'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>4. Roles: Dueño vs Cajero</span>
            </button>

            <button
              onClick={() => scrollToSection('security')}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'security'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>5. Valijas, Aduanas & Manifiestos</span>
            </button>

            <button
              onClick={() => scrollToSection('faq')}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'faq'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>6. Preguntas Frecuentes</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MAIN CONTENT CONTAINER
          ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">

        {/* ========================================================
            SECTION 1: ROADMAP TECNOLÓGICO
            ======================================================== */}
        <section id="roadmap" className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-cyan-300 mb-2">
                  <Cpu className="w-3.5 h-3.5" />
                  Evolución Tecnológica
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Roadmap Oficial Ship24Go Point (2026 – 2027)
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Cronograma estratégico de despliegue de funcionalidades, automatizaciones y expansión de cobertura.
                </p>
              </div>

              <span className="text-xs font-bold text-slate-400">
                Versión actual: <strong className="text-blue-600 dark:text-cyan-400">v1.4.38 (Q1 2026)</strong>
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Q1 2026 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/50 shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                  Completado ✅
                </div>
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 grid place-items-center font-black text-sm mb-4">
                    Q1
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Lanzamiento Base & Flujo Inverso</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Enero – Marzo 2026</p>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Mostrador POS con 15% de comisión garantizada acreditada en vivo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Corredor RD ➔ USA con conexión a Hub Miami (Doral, FL).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Conversión en tiempo real USD ➔ RD$ DOP con tasa de cambio viva.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Valijas inteligentes numeradas con manifiestos QR.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Operando en producción
                </div>
              </div>

              {/* Q2 2026 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                  En Curso 🚀
                </div>
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-cyan-300 grid place-items-center font-black text-sm mb-4">
                    Q2
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Hardware & Terminal Offline</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Abril – Junio 2026</p>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>Modo PWA Offline: venta de envíos incluso sin conexión a internet.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>Integración Bluetooth con básculas digitales (lectura automática de peso).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>Impresión directa por WebUSB y red a térmicas Zebra / Munbyn (4x6").</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>Escáner de mano 2D para recepción ultra-rápida de paquetes.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-blue-600 dark:text-cyan-400">
                  Lanzamiento programado Mayo 2026
                </div>
              </div>

              {/* Q3 2026 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 grid place-items-center font-black text-sm mb-4">
                    Q3
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Europa & Smart Lockers</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Julio – Septiembre 2026</p>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <span>Apertura de red Points en España (Madrid / Barcelona / Valencia).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <span>Conexión de casilleros inteligentes (Smart Lockers 24/7) para retiro autónomo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <span>Notificaciones automáticas por WhatsApp Business API con botón de retiro.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  Expansión Internacional
                </div>
              </div>

              {/* Q4 2026 - Q1 2027 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300 grid place-items-center font-black text-sm mb-4">
                    Q4+
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">API Corporativa & Franquicias</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Octubre 2026 – Marzo 2027</p>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>API para cadenas de retail (farmacias, supermercados) integrando en sus POS.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>IA predictiva de volumen para pre-ordenar valijas y despachos aéreos.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Línea de crédito comercial y anticipos de comisiones para sucursales top.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  Escalabilidad Global
                </div>
              </div>
            </div>
          </section>

        {/* ========================================================
            SECTION 2: FLUJO OPERATIVO END-TO-END
            ======================================================== */}
        <section id="flow" className="space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 mb-2">
              <Truck className="w-3.5 h-3.5" />
              Arquitectura Logística
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Flujo Operativo Paso a Paso: Del Mostrador al Destino
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cómo viaja un sobre o caja desde que un cliente entra a tu local comercial hasta que se entrega en EE.UU. o República Dominicana.
            </p>
          </div>

          <div className="space-y-4">
            {/* Paso 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg grid place-items-center shrink-0 shadow-sm">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Recepción y Venta en Mostrador POS</h3>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-cyan-300">
                    Tu Local Point
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  El cliente acude a tu sucursal. El cajero selecciona el tipo de bulto (ej: Sobre Express \$20 USD), la modalidad (Retiro en Hub Miami o Entrega a Domicilio USA), e introduce los datos del destinatario. Cobra en <strong>Pesos Dominicanos (RD$)</strong> o <strong>Dólares (USD)</strong> en efectivo, tarjeta o transferencia.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
                  <Coins className="w-4 h-4" />
                  <span>Tu ganancia del 15% se acredita de forma inmediata en tu Billetera digital.</span>
                </div>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg grid place-items-center shrink-0 shadow-sm">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Consolidación en Valija Inteligente con Manifiesto</h3>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                    Valijas Precintadas
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  El sistema consolida automáticamente las piezas en una valija asignada al corredor activo (ej: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-400">MAN-EXP-2026-6065</code>). Al llegar al umbral de 10 piezas o al final del día, el encargado pulsa "Cerrar Valija", coloca el precinto de seguridad e imprime el Manifiesto Oficial de Carga con QR.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-lg grid place-items-center shrink-0 shadow-sm">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Recolección por Chofer & Entrada a Hub Local</h3>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                    Hub Luperón (Santo Domingo)
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Un chofer verificado Ship24Go escanea el precinto de la valija en tu mostrador (POD de recogida digital) y traslada las valijas al Hub Central de clasificación en Santo Domingo (Av. Albert Thomas #254, Ensanche Luperón), donde se pesan en báscula certificada y se preparan para aduanas.
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white font-black text-lg grid place-items-center shrink-0 shadow-sm">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Vuelo de Carga Internacional (Multi-Broker Aéreo)</h3>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
                    SDQ ➔ MIA Direct Flight
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Las valijas se despachan por vía aérea en vuelo regular de carga hacia el Aeropuerto Internacional de Miami (MIA). Se realiza el trámite aduanal automatizado bajo la reglamentación US CBP (Sección 321 de minimis para paquetería exenta).
                </p>
              </div>
            </div>

            {/* Paso 5 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg grid place-items-center shrink-0 shadow-sm">
                5
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Distribución & Entrega Milla Final en USA</h3>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    Hub Miami (Doral, FL) / Domicilio
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Al llegar al Hub de Miami (8200 NW 27th St, Doral, FL):
                  <br />• <strong>Modalidad Retiro:</strong> El destinatario recibe un aviso por SMS/WhatsApp y retira directamente en el Hub de Doral con su ID.
                  <br />• <strong>Modalidad Domicilio:</strong> Se inyecta a transportistas nacionales de EE.UU. (USPS Ground Advantage, FedEx o UPS) con entrega en la puerta del cliente en 24–48h.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: TARIFAS & CALCULADORA DE RENTABILIDAD
            ======================================================== */}
        <section id="pricing" className="space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 mb-2">
              <DollarSign className="w-3.5 h-3.5" />
              Ingresos del Negocio
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Tarifario Oficial & Ganancia Neta del 15%
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sin cuotas de franquicia ni costes ocultos. Tu negocio gana el 15% de cada venta, disponible para retiro en tu banco local.
            </p>
          </div>

          {/* Tabla de Tarifas Oficiales */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Tipo de Bulto</th>
                  <th className="py-3.5 px-4">Peso Máximo</th>
                  <th className="py-3.5 px-4">Precio Retiro Hub</th>
                  <th className="py-3.5 px-4">Precio Domicilio</th>
                  <th className="py-3.5 px-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    Tu Ganancia Point (15%)
                  </th>
                  <th className="py-3.5 px-4">Equivalente RD$</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>✉️</span> Sobre / Documentos Express
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Hasta 1.1 lb (0.5 kg)</td>
                  <td className="py-3.5 px-4 font-bold">$20.00 USD</td>
                  <td className="py-3.5 px-4 font-bold">$25.00 USD</td>
                  <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                    +$3.00 – $3.75 USD
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-cyan-400">
                    RD$ 176.73 – 220.91
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📦</span> Caja Pequeña Box S
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Hasta 4.4 lb (2.0 kg)</td>
                  <td className="py-3.5 px-4 font-bold">$30.00 USD</td>
                  <td className="py-3.5 px-4 font-bold">$38.00 USD</td>
                  <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                    +$4.50 – $5.70 USD
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-cyan-400">
                    RD$ 265.10 – 335.79
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📦</span> Caja Mediana Box M
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Hasta 11.0 lb (5.0 kg)</td>
                  <td className="py-3.5 px-4 font-bold">$55.00 USD</td>
                  <td className="py-3.5 px-4 font-bold">$68.00 USD</td>
                  <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                    +$8.25 – $10.20 USD
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-cyan-400">
                    RD$ 486.01 – 600.88
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📦</span> Caja Grande Box L
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Hasta 22.0 lb (10.0 kg)</td>
                  <td className="py-3.5 px-4 font-bold">$95.00 USD</td>
                  <td className="py-3.5 px-4 font-bold">$115.00 USD</td>
                  <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                    +$14.25 – $17.25 USD
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-cyan-400">
                    RD$ 839.47 – 1,016.20
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📦</span> Caja Extra Grande Box XL
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Hasta 33.0 lb (15.0 kg)</td>
                  <td className="py-3.5 px-4 font-bold">$140.00 USD</td>
                  <td className="py-3.5 px-4 font-bold">$165.00 USD</td>
                  <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                    +$21.00 – $24.75 USD
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-cyan-400">
                    RD$ 1,237.11 – 1,458.02
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculadora Interactiva de Ganancias para el Dueño */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2.5 py-0.5 rounded-full">
                  Simulador de Rentabilidad
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1">¿Cuánto ganará tu negocio al mes?</h3>
                <p className="text-xs text-blue-200 mt-0.5">Calculado con una comisión promedio de \$6.00 USD por paquete.</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-blue-200">Ganancia Mensual Estimada:</span>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">
                  ${monthlyEarningsUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
                </p>
                <p className="text-sm font-black text-cyan-300">
                  ≈ {formatDop(monthlyEarningsDop)} DOP al mes
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Envíos recibidos al día en tu mostrador:</span>
                <span className="text-lg font-black text-cyan-300">{packagesPerDay} paquetes / día</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                value={packagesPerDay}
                onChange={e => setPackagesPerDay(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-white/20 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-blue-300">
                <span>2 paquetes/día (\$312 USD)</span>
                <span>10 paquetes/día (\$1,560 USD)</span>
                <span>25 paquetes/día (\$3,900 USD)</span>
                <span>50 paquetes/día (\$7,800 USD)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <p className="text-blue-200">
                💡 Los fondos se acumulan de inmediato y puedes transferirlos directamente a tus cuentas bancarias en <strong>Banreservas, Banco BHD o Banco Popular</strong>.
              </p>
              <Link
                to="/point/register"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shrink-0 transition-all cursor-pointer shadow-md"
              >
                Comenzar a Afiliarme →
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 4: ROLES DUEÑO VS CAJERO PIN
            ======================================================== */}
        <section id="roles" className="space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 mb-2">
              <Users className="w-3.5 h-3.5" />
              Gestión de Accesos
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Privacidad y Roles: Modo Dueño vs Modo Cajero (PIN)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Diseñado para proteger la información financiera del dueño mientras los empleados operan la terminal con agilidad.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Modo Dueño */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 grid place-items-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Control Absoluto
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Perfil Dueño / Propietario</h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                El propietario ingresa con su correo y contraseña en el portal maestro. Dispone de acceso ilimitado a las 7 herramientas operativas y financieras del negocio.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Visualización del 15% de ganancia neta en cada envío</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Pestaña "Billetera & Bancos" (Saldo, cuentas y transferencias)</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Pestaña "Equipo & Empleados" (Creación de cajeros y asignación de PIN)</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Conmutador rápido para activar Modo Cajero cuando esté frente a clientes</span>
                </div>
              </div>
            </div>

            {/* Modo Cajero */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300 grid place-items-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                    Operación de Turno
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Perfil Cajero de Mostrador (PIN)</h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Los empleados inician turno en <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-400">/branch/login</code> seleccionando su nombre e introduciendo su PIN numérico de 4 dígitos.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Márgenes de ganancia ocultos automáticamente en la pantalla</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Pestañas "Billetera" y "Equipo" ocultas para proteger privacidad financiera</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Control de apertura y cierre de caja chica para cuadre al final de turno</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Emisión, consolidación de valijas e impresión térmica de tickets</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 5: VALIJAS, ADUANAS Y PROTOCOLOS
            ======================================================== */}
        <section id="security" className="space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Seguridad & Cumplimiento
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Valijas Precintadas, Manifiestos y Normativa Aduanal
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Todos los paquetes se mueven bajo estricto control de precintos inviolables y trazabilidad satelital QR.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-cyan-300 grid place-items-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Umbral de Consolidación (10 piezas)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                El sistema optimiza el flete agrupando hasta 10 piezas por valija oficial. Cuando el contador llega a 10, la interfaz alerta al cajero para colocar el precinto físico y generar el manifiesto de vuelo.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 grid place-items-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Artículos Permitidos & Restringidos</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Permitidos:</strong> Documentos legales, ropa, calzado, electrónicos menores, café empaquetado, artesanías.
                <br />
                <strong>Prohibidos:</strong> Dinero en efectivo, armas, sustancias inflamables, alimentos perecederos sin certificación, réplicas no autorizadas.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 grid place-items-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Trazabilidad en Cadena QR</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Cada evento (Recepción en Point ➔ Valija ➔ Recogida Chofer ➔ Vuelo ➔ Hub Miami ➔ Chofer Milla Final) genera un evento inmutable registrado en el tracking de cara al cliente y en el panel del Point.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 6: PREGUNTAS FRECUENTES (FAQ)
            ======================================================== */}
        <section id="faq" className="space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              Dudas Frecuentes
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Preguntas Frecuentes de la Red Point
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Respuestas directas a las preguntas operativas y comerciales más comunes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">¿Cuánto dinero necesito para abrir un Point?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>\$0 de inversión inicial.</strong> Solo necesitas un local comercial en funcionamiento (farmacia, papelería, tienda de tecnología, etc.), una computadora o tablet con internet y una impresora. Nosotros te proveemos la plataforma, el material gráfico y la red de hubs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">¿Cómo y cuándo cobro mis comisiones?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tus comisiones del 15% se acreditan en tu saldo inmediatamente tras cada venta. Puedes solicitar la transferencia a tu cuenta bancaria (Banreservas, BHD, Banco Popular o banco en USA) desde la pestaña "Billetera & Bancos" en cualquier momento.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">¿Quién se encarga de recoger los paquetes en mi local?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                La flota de choferes verificados de Ship24Go acude directamente a tu local en rutas programadas para retirar las valijas precintadas con su manifiesto QR. Tú no tienes que trasladar paquetes a ningún almacén.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">¿Qué pasa si el cliente paga en Pesos Dominicanos?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                El sistema hace la conversión automática con la tasa oficial del día (1 USD = RD$ 58.91 DOP). En pantalla se desglosa el monto exacto en pesos que el cajero debe cobrar y se registra en el arqueo de caja chica de la sucursal.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">¿Qué responsabilidad tiene mi negocio si un paquete se extravía?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Una vez que el paquete es escaneado y precintado en la valija y entregado al chofer Ship24Go con el POD digital, la responsabilidad logística y el seguro de carga corren 100% por cuenta de Ship24Go.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">¿Puedo crear usuarios individuales para mis empleados?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Sí. En la pestaña "Equipo & Empleados" puedes registrar a todos tus cajeros con su PIN de 4 dígitos. Cada empleado opera con su nombre y puedes auditar las ventas y turnos de cada uno.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            CTA FOOTER BANNER
            ======================================================== */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">
              ¿Listo para convertir tu local comercial en un Ship24Go Point?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100">
              Afilia tu sucursal en 3 minutos. Comienza a emitir sobres y cajas a Estados Unidos y gana el 15% de comisión neta desde el primer día.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              to="/point/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-blue-700 font-black text-sm text-center transition-all shadow-md cursor-pointer"
            >
              Afiliar mi Negocio Ahora
            </Link>
            <Link
              to="/point"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-800/80 hover:bg-blue-800 text-white font-bold text-sm text-center transition-all border border-white/20 cursor-pointer"
            >
              Entrar al Terminal POS
            </Link>
          </div>
        </section>
      </main>

      {/* ========================================================
          FOOTER
          ======================================================== */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandMark showText={false} iconClassName="w-6 h-6 rounded-lg" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Ship24Go Red Points</span>
            <span>© 2026. Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Link to="/point/roadmap" className="hover:text-blue-600">Roadmap</Link>
            <Link to="/point/register" className="hover:text-blue-600">Afiliación</Link>
            <Link to="/point" className="hover:text-blue-600">Portal Dueño</Link>
            <Link to="/branch/login" className="hover:text-blue-600">Login Cajero</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
