import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  Package, 
  Plane, 
  Building2, 
  Truck, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Globe, 
  Smartphone,
  ChevronRight
} from 'lucide-react';

interface StepData {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  stats: { label: string; value: string }[];
  features: string[];
  ctaText: string;
  ctaLink: string;
  icon: React.ReactNode;
  accentColor: string;
}

const STEPS: StepData[] = [
  {
    id: 1,
    badge: 'FASE 01 · RECEPCIÓN EN SUCURSAL',
    title: 'Puntos Afiliados (Point POS) & Recepción Local',
    subtitle: 'Comercios de barrio operando como agencias oficiales de courier',
    description: 'Comercios locales, papelerías y minimarkets utilizan la terminal web Point POS para recibir paquetería de clientes. El sistema automatiza el pesaje, tarificación internacional con cotizaciones en vivo, cobro en USD o DOP, e imprime recibos térmicos oficiales de 80mm/50mm con código de barras.',
    image: '/images/system/step1-point-pos.jpg',
    stats: [
      { label: 'Comisión del Punto', value: '15%' },
      { label: 'Tickets Térmicos', value: '80 / 50mm' },
      { label: 'Apertura de Turno', value: 'Con PIN' }
    ],
    features: [
      'Terminal POS con control de caja y turnos automáticos',
      'Etiquetado y recibo térmico con código de barras individual',
      'Generación inmediata de tracking internacional por paquete',
      'Liquidación de comisiones acumuladas y retiro bancario'
    ],
    ctaText: 'Afiliar mi Comercio como Point',
    ctaLink: '/point/register',
    icon: <Store className="w-5 h-5" />,
    accentColor: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    badge: 'FASE 02 · CONSOLIDACIÓN INTELIGENTE',
    title: 'Agrupación en Valijas & Master Tracking Broker',
    subtitle: 'Consolidación de envíos en valijas seguras con fletes aéreos',
    description: 'Para abaratar los costos de transporte internacional, los envíos individuales de la sucursal se agrupan en valijas precintadas. El sistema genera la Hoja de Ruta oficial para el transportista y asigna un Master Tracking internacional conectado a brokers de carga aérea (LogiHub / EasyPost).',
    image: '/images/system/step2-hub-transit.jpg',
    stats: [
      { label: 'Ahorro Logístico', value: 'Hasta 40%' },
      { label: 'Tracking Multinivel', value: '3 Niveles' },
      { label: 'Hoja de Ruta', value: 'Imprimible' }
    ],
    features: [
      'Agrupación física y digital de paquetes en una sola valija',
      'Emisión de Hoja de Ruta con firmas de entrega y custodia',
      'Cotización directa de fletes aéreos de consolidación',
      'Master Tracking que rastrea el lote completo en vuelo'
    ],
    ctaText: 'Ver Rastreo Multinivel',
    ctaLink: '/tracking',
    icon: <Plane className="w-5 h-5" />,
    accentColor: 'from-cyan-500 to-teal-500'
  },
  {
    id: 3,
    badge: 'FASE 03 · RED DE HUBS INTERNACIONALES',
    title: 'Inbound, Desconsolidación Asistida & Inventario en Hubs',
    subtitle: 'Centros logísticos estratégicos en Boston, Miami y Santo Domingo',
    description: 'En los almacenes Hub de Ship24Go (HUB-BOS, HUB-MIA Gateway y HUB-SDQ Central), las valijas se reciben mediante escaneo láser de Master Tracking. El personal ejecuta la desconsolidación asistida, verificando paquete por paquete y reportando automáticamente cualquier discrepancia.',
    image: '/images/system/step3-hub-sorting.jpg',
    stats: [
      { label: 'Hubs Activos', value: 'BOS, MIA, SDQ' },
      { label: 'Control GPS', value: '100% Ubicado' },
      { label: 'Verificación', value: 'Ítem por Ítem' }
    ],
    features: [
      'Recepción inmediata de valijas con escaneo de Master Tracking',
      'Desconsolidación asistida con detección de paquetes faltantes',
      'Ficha técnica de oficina con coordenadas GPS y horario de operaciones',
      'Almacén y racks clasificados por zonas de última milla'
    ],
    ctaText: 'Acceder a Hub Panel',
    ctaLink: '/hubs',
    icon: <Building2 className="w-5 h-5" />,
    accentColor: 'from-indigo-500 to-purple-500'
  },
  {
    id: 4,
    badge: 'FASE 04 · REPARTO DE ÚLTIMA MILLA',
    title: 'App de Choferes & Prueba de Entrega Digital (POD)',
    subtitle: 'Conductores locales equipados con trazabilidad móvil en tiempo real',
    description: 'Desde el Hub se crean las rutas de entrega y se asignan a choferes con furgonetas o motores. El chofer usa la WebApp móvil de conductor para navegar con GPS hasta la dirección del cliente, cobrar saldos pendientes y registrar la entrega con firma en pantalla, documento de identidad y fotografía del paquete.',
    image: '/images/system/step4-driver-delivery.jpg',
    stats: [
      { label: 'Prueba de Entrega', value: 'Firma + Foto' },
      { label: 'GPS en Entrega', value: 'En Puerta' },
      { label: 'Gestión de Fallos', value: 'Reagendado' }
    ],
    features: [
      'App móvil optimizada para choferes con navegación por mapa y WhatsApp',
      'Captura de firma táctil digitalizada directamente en pantalla',
      'Registro fotográfico de evidencia de entrega',
      'Actualización instantánea a estado "Entregado con Éxito"'
    ],
    ctaText: 'Ver Panel del Conductor',
    ctaLink: '/driver',
    icon: <Truck className="w-5 h-5" />,
    accentColor: 'from-emerald-500 to-teal-500'
  },
  {
    id: 5,
    badge: 'FASE 05 · TRAZABILIDAD SATELITAL',
    title: 'Centro de Control Global & Trazabilidad Geográfica 3D',
    subtitle: 'Visibilidad completa en tiempo real para clientes y administradores',
    description: 'Toda la red logística opera sincronizada en una única plataforma en la nube. Clientes y destinatarios pueden consultar el estado exacto de su envío, visualizar la ruta entre sucursales y hubs con coordenadas geográficas en Google Maps y consultar la prueba de entrega digital en cualquier momento.',
    image: '/images/system/step5-global-tracking.jpg',
    stats: [
      { label: 'Trazabilidad', value: 'Tiempo Real' },
      { label: 'Mapas', value: 'Google Maps' },
      { label: 'Seguridad', value: 'Cifrado SSL' }
    ],
    features: [
      'Trazabilidad geográfica con coordenadas de latitud y longitud',
      'Visualizador interactivo de trayecto (Punto ➔ Hub ➔ Chofer ➔ Cliente)',
      'Historial inmutable de eventos con estampa temporal precisa',
      'Consulta pública multidispositivo sin necesidad de registro'
    ],
    ctaText: 'Probar Rastreador en Vivo',
    ctaLink: '/tracking',
    icon: <Globe className="w-5 h-5" />,
    accentColor: 'from-pink-500 to-rose-500'
  }
];

export function SystemPresentationSection() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const current = STEPS.find(s => s.id === activeStep) || STEPS[0];

  return (
    <section id="how-it-works-section" className="py-24 bg-slate-950 text-slate-100 relative overflow-hidden border-t border-slate-800">
      {/* Glow ambient background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ecosistema Logístico Integral</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            ¿Cómo Funciona <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Ship24Go</span>?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
            Descubre la cadena logística inteligente que conecta puntos de recepción en vecindarios, centros de consolidación internacional, hubs con geolocalización GPS y choferes de última milla con firma digital.
          </p>
        </div>

        {/* Step Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none justify-start lg:justify-center">
          {STEPS.map(step => {
            const isActive = step.id === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-500 shadow-lg shadow-indigo-600/30 scale-102'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  0{step.id}
                </div>
                <span className="hidden sm:inline">{step.title.split('&')[0].trim()}</span>
                <span className="sm:hidden">Paso 0{step.id}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Feature Showcase Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Image with zoom and badges */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative group rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-[280px] sm:h-[380px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Floating Metric Pills */}
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                  {current.stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 text-center">
                      <span className="block text-[10px] text-slate-400 font-medium uppercase truncate">{stat.label}</span>
                      <span className="block text-sm sm:text-base font-black text-white font-mono">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Explanation & Features */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono font-bold uppercase mb-3">
                  {current.badge}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {current.title}
                </h3>
                <p className="text-indigo-400 text-xs sm:text-sm font-semibold mt-1">
                  {current.subtitle}
                </p>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {current.description}
              </p>

              {/* Feature Checklist */}
              <div className="space-y-2.5 pt-2">
                {current.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Button & Next Step */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to={current.ctaLink}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all group"
                >
                  <span>{current.ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {current.id < STEPS.length && (
                  <button
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="w-full sm:w-auto px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/60 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Siguiente Fase: 0{current.id + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Global Architecture Diagram Card */}
        <div className="mt-16 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                FLUJO OPERATIVO COMPLETO
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">
                De la Puerta del Emisor a las Manos del Destinatario
              </h4>
            </div>
            <Link
              to="/tracking"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
            >
              <span>Consultar Rastreo en Vivo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { num: '01', title: 'Point POS', desc: 'Recepción y ticket térmico en comercio', icon: '🏪' },
              { num: '02', title: 'Valija & Broker', desc: 'Consolidación con Master Tracking', icon: '📦' },
              { num: '03', title: 'Hubs con GPS', desc: 'Clasificación en BOS, MIA y SDQ', icon: '🏢' },
              { num: '04', title: 'Última Milla', desc: 'Reparto con firma y foto digital', icon: '🛵' },
              { num: '05', title: 'Entregado', desc: 'Trazabilidad y confirmación al cliente', icon: '✅' }
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 relative group hover:border-indigo-500/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-xs font-mono font-bold text-slate-500">{step.num}</span>
                </div>
                <p className="text-xs font-bold text-white mb-1">{step.title}</p>
                <p className="text-[11px] text-slate-400 leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
