import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Store, 
  Truck, 
  Globe, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  Cpu, 
  Printer, 
  DollarSign, 
  Smartphone,
  ChevronLeft
} from 'lucide-react';
import { SystemPresentationSection } from '../components/SystemPresentationSection';
import { BrandMark } from '../lib/brand';

export default function SystemPresentationPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold mr-2 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span>Volver a Inicio</span>
            </Link>
            <BrandMark iconClassName="w-8 h-8 rounded-lg" textClassName="text-lg font-black text-white" />
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/tracking"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all hidden sm:flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rastreador en Vivo</span>
            </Link>
            <Link
              to="/point/register"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Afiliar mi Comercio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Section Showcase */}
      <main>
        <SystemPresentationSection />

        {/* Technical Architecture Deep Dive */}
        <section className="py-20 bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
                ESPECIFICACIONES TÉCNICAS & ARQUITECTURA
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white mt-2">
                Pilar a Pilar: Tecnología Logística en Producción
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-3">
                Una arquitectura diseñada para ser robusta, escalable y tolerante a fallos entre diferentes países y monedas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition-all shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  <Printer className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Terminal POS de Sucursal</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Desarrollado para navegadores táctiles de escritorio y tabletas comerciales. Soporta impresoras térmicas ESC/POS estándar (80mm de mostrador y 50mm portátiles), lector de códigos de barras USB/Bluetooth y control de arqueo de caja diario con turnos independientes por empleado.
                </p>
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Apertura de turno obligatoria por PIN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Personalización de marca (Co-branding)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Liquidación automática de comisión (15%)</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition-all shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Hub-and-Spoke & Consolidación</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Algoritmo que agrupa automáticamente los paquetes por Hub de Destino en valijas virtuales y físicas. Genera un número de valija con código de barra maestro y hoja de ruta con manifiesto de custodia para brokers aéreos internacionales como LogiHub y EasyPost.
                </p>
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Master Tracking sincronizado con brokers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Desconsolidación asistida con alerta de faltantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Geolocalización fija de almacenes por GPS</span>
                  </div>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition-all shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Última Milla & Evidencia POD</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Los choferes disponen de una interfaz ligera instalable como PWA en smartphones iOS y Android. Dispone de botones directos para llamada telefónica y chat de WhatsApp con el destinatario, cálculo de ruta en Google Maps y canvas HTML5 para firma digital biométrica.
                </p>
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Firma digital táctil sobre pantalla</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Foto de entrega en la puerta del cliente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Captura automática de coordenadas GPS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hubs Active Grid */}
            <div className="mt-16 bg-slate-950 border border-slate-800 rounded-3xl p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-indigo-400">RED DE DISTRIBUCIÓN</span>
                  <h4 className="text-xl font-black text-white mt-1">Nodos Logísticos Operativos</h4>
                </div>
                <Link
                  to="/hubs"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Panel de Operaciones de Hubs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">HUB-BOS</span>
                    <span className="text-xs font-bold text-slate-400">🇺🇸 Estados Unidos</span>
                  </div>
                  <p className="text-sm font-bold text-white">Boston Express Distribution Hub</p>
                  <p className="text-xs text-slate-400 mt-1">100 Cambridge St, Boston, MA 02114</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <MapPin className="w-3 h-3" />
                    <span>GPS: 42.3601, -71.0589</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">HUB-MIA</span>
                    <span className="text-xs font-bold text-slate-400">🇺🇸 Estados Unidos</span>
                  </div>
                  <p className="text-sm font-bold text-white">Miami International Gateway Hub</p>
                  <p className="text-xs text-slate-400 mt-1">8200 NW 27th St, Doral, FL 33122</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <MapPin className="w-3 h-3" />
                    <span>GPS: 25.8124, -80.3397</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">HUB-SDQ</span>
                    <span className="text-xs font-bold text-slate-400">🇩🇴 Rep. Dominicana</span>
                  </div>
                  <p className="text-sm font-bold text-white">Santo Domingo Central Logistics Hub</p>
                  <p className="text-xs text-slate-400 mt-1">Av. Luperón 45, Santo Domingo, D.N.</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <MapPin className="w-3 h-3" />
                    <span>GPS: 18.4861, -69.9312</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-16 text-center bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl p-10 shadow-2xl">
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                ¿Listo para integrar la logística de Ship24Go en tu negocio?
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mt-3 mb-6">
                Afilia tu tienda de barrio para generar ingresos extra con el 15% de comisión, o envía paquetes con tarifas de mayoreo y rastreo internacional en tiempo real.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/point/register"
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Quiero ser Sucursal Afiliada</span>
                </Link>
                <Link
                  to="/tracking"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>Rastrear un Envío Ahora</span>
                </Link>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Ship24Go Technologies Inc. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <Link to="/tracking" className="hover:text-slate-300 transition-colors">Rastreo</Link>
            <Link to="/point/login" className="hover:text-slate-300 transition-colors">Point Login</Link>
            <Link to="/hubs" className="hover:text-slate-300 transition-colors">Hubs</Link>
            <Link to="/driver" className="hover:text-slate-300 transition-colors">Choferes</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
