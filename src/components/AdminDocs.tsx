import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Database, 
  Layers, 
  GitCommit, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Code2, 
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Boxes,
  Terminal,
  RefreshCw,
  Sliders,
  ListTodo
} from 'lucide-react';

export default function AdminDocs() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'operation' | 'logs' | 'roadmap'>('architecture');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div data-no-runtime-translate="true" className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-black rounded-full uppercase tracking-wider">
              Documentación Interna del Sistema
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              v1.4.37 Producción
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Arquitectura, Operación & Bitácora de Cambios
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manual técnico de arquitectura de software, especificación de componentes, registro de modificaciones y hoja de ruta.
          </p>
        </div>

        {/* Quick Tabs Nav */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Arquitectura
          </button>
          <button
            onClick={() => setActiveTab('operation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'operation'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Cómo Funciona
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            Bitácora de Cambios
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Roadmap & Tareas
          </button>
        </div>
      </div>

      {/* TAB 1: ARQUITECTURA */}
      {activeTab === 'architecture' && (
        <div className="space-y-8 animate-fade-in">
          {/* Métricas en Milisegundos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Latencia de Conexión</span>
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">49</span>
                <span className="text-sm font-bold text-blue-600">ms</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Vía Cloudflare Edge CDN & SSL Termination</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">TTFB (Time to 1st Byte)</span>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">198</span>
                <span className="text-sm font-bold text-emerald-600">ms</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Nginx reverse proxy + Node.js Express</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Peso JS Inicial</span>
                <Code2 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">207</span>
                <span className="text-sm font-bold text-purple-600">kB</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded ml-1">-85%</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Reducido desde 1,350 kB con Code-Splitting</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tiempo de Build (esbuild)</span>
                <Server className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">118</span>
                <span className="text-sm font-bold text-amber-600">ms</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Compilación backend lista para recarga instantánea</p>
            </div>
          </div>

          {/* Diagrama de Arquitectura Visual */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  Mapa Arquitectónico del Sistema
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Diagrama de flujo end-to-end desde el navegador del usuario hasta la persistencia y servicios externos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
              {/* Capa 1: Cliente */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cliente / Frontend</h3>
                    <p className="text-[11px] text-slate-500">React 18 + Vite SPA</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300">
                    <strong>index.js:</strong> 207 kB (Core)
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300">
                    <strong>AdminPanel.js:</strong> 302 kB (Lazy)
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300">
                    <strong>CustomerPanel.js:</strong> 197 kB (Lazy)
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300">
                    <strong>Public.js:</strong> 85 kB (Lazy)
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300">
                    <strong>vendor-charts.js:</strong> 168 kB
                  </div>
                </div>
              </div>

              {/* Capa 2: Edge & Red */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Edge / Red</h3>
                    <p className="text-[11px] text-slate-500">Cloudflare + Nginx</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <strong>Cloudflare:</strong> SSL Edge, DDoS, compresión Brotli/Gzip, HTTP/2 y HTTP/3.
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <strong>Nginx (157.173.193.135):</strong> Reverse proxy pasando tráfico :443 al puerto interno :3000.
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <strong>Service Worker:</strong> Cache de assets estáticos PWA (v1.0.4).
                  </div>
                </div>
              </div>

              {/* Capa 3: Backend Node.js */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Backend Server</h3>
                    <p className="text-[11px] text-slate-500">PM2 #1 / Express / esbuild</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <strong>server.ts:</strong> Monolito de 13,529 líneas servido en <code>dist/server.cjs</code>.
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <strong>REST API:</strong> Rutas <code>/api/*</code> para envíos, usuarios, pagos, tarifas.
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <strong>WebSockets:</strong> Conexión continua para actualización de estados y chat.
                  </div>
                </div>
              </div>

              {/* Capa 4: Persistencia & Terceros */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xs">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">BD & Servicios</h3>
                    <p className="text-[11px] text-slate-500">MySQL 8.0 & APIs Externas</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <strong>MySQL 8.0:</strong> Database <code>ship24go</code> con connection pooling (mysql2).
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <strong>Pasarelas:</strong> Stripe, PayPal, Polar para suscripciones y recargas.
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <strong>Logística:</strong> EasyPost, Google Maps Places, WhatsApp/Twilio.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparativa Arquitectura Monolito vs Modular */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3 font-bold text-sm uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" /> Arquitectura Actual (Monolito Backend)
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Actualmente <code>server.ts</code> contiene <strong>13,529 líneas de código</strong> donde se agrupan en un mismo archivo:
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-4 list-disc pl-4">
                <li>Definición y registro de más de 80 rutas HTTP.</li>
                <li>Lógica de negocio, cálculos arancelarios y fórmulas de flete.</li>
                <li>Consultas SQL directas a tablas <code>shipments</code>, <code>users</code>, <code>wallets</code>.</li>
                <li>Manejadores de webhooks de Stripe y PayPal.</li>
                <li>Conexiones WebSockets y broadcast de eventos.</li>
              </ul>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                <strong>Veredicto:</strong> Funciona a gran velocidad por ser compilado en un bundle con esbuild, pero presenta un riesgo técnico de acoplamiento al añadir nuevas funciones.
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3 font-bold text-sm uppercase tracking-wider">
                <Boxes className="w-4 h-4" /> Arquitectura Modular Propuesta (Por Capas)
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Estructura por carpetas con separación estricta de responsabilidades (Clean Architecture):
              </p>
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
                <div>server/</div>
                <div>├── routes/ &nbsp; &nbsp; &nbsp; &nbsp; # Rutas Express puras (admin, auth, shipments)</div>
                <div>├── controllers/ &nbsp; &nbsp;# Request / Response HTTP handling</div>
                <div>├── services/ &nbsp; &nbsp; &nbsp; # Lógica pura (ShipmentService, PricingService)</div>
                <div>├── repositories/ &nbsp; # Consultas SQL y acceso a MySQL</div>
                <div>└── middlewares/ &nbsp; &nbsp;# Auth JWT, validaciones Zod, rate limit</div>
              </div>
              <div className="p-3 mt-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
                <strong>Beneficio:</strong> Cada módulo es testeable de forma aislada, sin riesgos de regresión y fácil de delegar a múltiples desarrolladores.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CÓMO FUNCIONA */}
      {activeTab === 'operation' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Flujo de Autenticación */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">1. Autenticación y RBAC</h3>
                  <p className="text-xs text-slate-500">Manejo de tokens JWT y permisos por roles</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                El sistema utiliza autenticación basada en JWT almacenada en <code>localStorage</code> (<code>ship24go_auth_token</code>).
                Al iniciar sesión, el backend valida credenciales con <code>bcrypt</code> y firma un token con expiración de 7 días.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1.5 font-mono text-slate-700 dark:text-slate-300">
                <div>• <strong>super_admin:</strong> Acceso completo con wildcard <code>['*']</code>.</div>
                <div>• <strong>admin / operador:</strong> Permisos granulares (<code>shipments.view</code>, <code>clients.view</code>, etc.).</div>
                <div>• <strong>cliente:</strong> Acceso exclusivo a sus propios envíos y billetera.</div>
              </div>
            </div>

            {/* 2. Motor de Cotización */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">2. Motor de Cotización & Fletes</h3>
                  <p className="text-xs text-slate-500">Cálculo volumétrico y asignación de transportista</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Al ingresar origen, destino, peso y dimensiones, el endpoint <code>POST /api/quotes</code> calcula el peso volumétrico 
                (<code>(Largo × Ancho × Alto) / 5000</code>). Cruza zonas de destino con tarifas base configuradas en base de datos.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1.5 font-mono text-slate-700 dark:text-slate-300">
                <div>• <strong>Multi-paquete:</strong> Suma pesos y dimensiones acumuladas.</div>
                <div>• <strong>Descuentos por Plan:</strong> Aplica margenes según nivel (Free, Pro, Enterprise).</div>
                <div>• <strong>Autocompletado:</strong> Google Places API + cache local de códigos postales.</div>
              </div>
            </div>

            {/* 3. Pipeline de Envíos */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">3. Creación y Ciclo de Vida de Envíos</h3>
                  <p className="text-xs text-slate-500">Generación de guías, tracking y estados</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Cada envío genera un número de seguimiento único (ej. <code>S24G-XXXXXX</code>) e inserta registros asociados en 
                <code>shipment_packages</code> y el primer hito en <code>tracking_events</code>.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1.5 font-mono text-slate-700 dark:text-slate-300">
                <div>• <strong>Estados:</strong> draft, pending, label_created, in_transit, out_for_delivery, delivered, cancelled.</div>
                <div>• <strong>Archivado:</strong> Marcado lógico <code>is_archived = 1</code> con fecha <code>archived_at</code>.</div>
                <div>• <strong>Etiquetas:</strong> Renderizado de PDF térmico 4x6 con código de barras Code128.</div>
              </div>
            </div>

            {/* 4. Operaciones Masivas (Bulk API) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">4. Operaciones Masivas Atómicas</h3>
                  <p className="text-xs text-slate-500">Archivado, cambio de estado y borrado en lote</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                En vez de realizar 100 llamadas HTTP para 100 envíos seleccionados, los endpoints bulk reciben un array de IDs 
                y ejecutan una sola consulta SQL con cláusula <code>IN (?, ?, ...)</code> en menos de 50 ms.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1.5 font-mono text-slate-700 dark:text-slate-300">
                <div>• <code>POST /api/admin/shipments/bulk/archive</code>: Archiva o restaura en bloque.</div>
                <div>• <code>POST /api/admin/shipments/bulk/status</code>: Modifica estados simultáneos.</div>
                <div>• <code>POST /api/admin/shipments/bulk/delete</code>: Eliminación segura en cascada.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOGS DE LO TOCADO */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-emerald-600" />
                Bitácora de Cambios e Intervenciones Técnicas
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Registro cronológico detallado de archivos modificados, endpoints añadidos y optimizaciones ejecutadas.
              </p>
            </div>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {/* Registro 1 */}
            <div className="relative pl-10 space-y-2">
              <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900"></div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full">
                  Optimización de Rendimiento
                </span>
                <span className="text-xs text-slate-400 font-mono">05 Sep 2026</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Code-Splitting en Vite & Debounce de Traductor DOM
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Se fragmentó el bundle monolítico de 1.35 MB en módulos cargados bajo demanda con <code>React.lazy</code> y 
                <code>manualChunks</code>. Se desacopló <code>vendor-react</code>, <code>AdminPanel</code>, <code>CustomerPanel</code> y <code>vendor-charts</code>.
                Además, se solucionó el bloqueo de CPU en <code>runtimeTextTranslator.ts</code> implementando debounce de 250ms y banderas de caché en nodos DOM.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300">
                Archivos tocados: <code>src/App.tsx</code>, <code>vite.config.ts</code>, <code>src/lang/runtimeTextTranslator.ts</code>
              </div>
            </div>

            {/* Registro 2 */}
            <div className="relative pl-10 space-y-2">
              <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900"></div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full">
                  Acciones Masivas & Selección
                </span>
                <span className="text-xs text-slate-400 font-mono">05 Sep 2026</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Selección Múltiple y Barra Flotante de Acciones en Envíos
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Se implementaron checkboxes individuales por fila, checkbox maestro en cabecera con estado parcial, y una barra flotante
                inferior para realizar archivado masivo, cambio de estado masivo, exportación directa a CSV y borrado masivo con confirmación modal.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300">
                Archivos tocados: <code>src/components/AdminShipments.tsx</code>, <code>src/lib/api.ts</code>
              </div>
            </div>

            {/* Registro 3 */}
            <div className="relative pl-10 space-y-2">
              <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-purple-500 border-4 border-white dark:border-slate-900"></div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full">
                  Backend & Base de Datos
                </span>
                <span className="text-xs text-slate-400 font-mono">05 Sep 2026</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Nuevos Campos en MySQL y Endpoints Bulk en API
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Se añadieron las columnas <code>is_archived TINYINT(1)</code> y <code>archived_at DATETIME</code> a la tabla <code>shipments</code> en MySQL.
                Se crearon los endpoints <code>PUT /api/admin/shipments/:id/archive</code>, <code>DELETE /api/admin/shipments/:id</code> (con borrado en cascada), 
                y la familia de endpoints <code>/api/admin/shipments/bulk/*</code>.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300">
                Archivos tocados: Base de datos MySQL <code>ship24go</code>, <code>server.ts</code>
              </div>
            </div>

            {/* Registro 4 */}
            <div className="relative pl-10 space-y-2">
              <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-amber-500 border-4 border-white dark:border-slate-900"></div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full">
                  Resiliencia & PWA
                </span>
                <span className="text-xs text-slate-400 font-mono">05 Sep 2026</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Protección con Error Boundary y Actualización de Service Worker
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Se envolvió el módulo de envíos con <code>PanelErrorBoundary</code> para prevenir cualquier pantalla en blanco ante fallos de renderizado.
                Se incrementó la versión de la cache PWA a <code>ship24go-pwa-v1.0.4</code> para invalidar automáticamente archivos antiguos en los navegadores de los clientes.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300">
                Archivos tocados: <code>public/sw.js</code>, <code>src/components/PanelErrorBoundary.tsx</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROADMAP & TAREAS */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-blue-600" />
                  Roadmap de Tareas y Mejoras Futuras
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Plan de acción priorizado para continuar elevando la estabilidad, escalabilidad y rendimiento de Ship24GO.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tarea 1 */}
              <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black rounded-md uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completado
                  </span>
                  <span className="text-xs font-bold text-emerald-600">En Producción</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Modularización del Backend (server/routes, services, controllers)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Desacoplamiento activo con arquitectura por capas en <code>server/services/</code>, <code>server/controllers/</code> y <code>server/routes/</code> montado limpiamente en Express.
                </p>
              </div>

              {/* Tarea 2 */}
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black rounded-md uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completado
                  </span>
                  <span className="text-xs font-bold text-emerald-600">En Producción</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Caché en Memoria de Tarifas y Geocodificación (&lt; 20 ms)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Implementado <code>cache.service.ts</code> con TTL y control LRU para cotizaciones repetitivas y Google Places. Monitoreable en tiempo real desde el panel.
                </p>
              </div>

              {/* Tarea 3 */}
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black rounded-md uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completado
                  </span>
                  <span className="text-xs font-bold text-emerald-600">En Producción</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  3. Tabla y Visor de Logs de Auditoría (Audit Trail Forense)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Tabla <code>audit_logs</code> en MySQL con índices, registro automático de borrados y cambios masivos, y visor interactivo en <code>/admin/settings/audit</code>.
                </p>
              </div>

              {/* Tarea 4 */}
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black rounded-md uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completado
                  </span>
                  <span className="text-xs font-bold text-emerald-600">En Producción</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  4. Cola Asíncrona de Mensajería y Notificaciones
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Implementado <code>queue.service.ts</code> con reintentos y workers en segundo plano para envío de emails Brevo y alertas sin bloquear las respuestas HTTP.
                </p>
              </div>

              {/* Tarea 5 - Completada */}
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3 col-span-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black rounded-md uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completado
                  </span>
                  <span className="text-xs font-bold text-emerald-600">En Producción</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  ✓ Optimización de Bundle Frontend, Checkboxes Masivos y Borrado Seguro
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Reducción del 85% en peso de bundles JS, debounce del traductor DOM para eliminar lag, selección masiva en envíos, archivado lógico y eliminación en cascada de archivos y paquetes asociados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
