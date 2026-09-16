import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Globe, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  Package, 
  Store, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { SEO_PAGES, SeoPageData } from '../data/seoPagesData';
import { useI18n } from '../lib/i18n';
import { LanguageSelector } from '../components/LanguageSelector';
import { BrandMark } from '../lib/brand';

interface SeoLandingPageProps {
  pageKey?: string;
}

export default function SeoLandingPage({ pageKey: propPageKey }: SeoLandingPageProps) {
  const location = useLocation();
  const { t } = useI18n();

  // Resolve key from prop or path
  const pathKey = location.pathname.replace(/^\/(destinos\/)?/, '');
  const activeKey = propPageKey || pathKey;
  const page: SeoPageData = SEO_PAGES[activeKey] || SEO_PAGES['espana-union-europea'];

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER / NAVBAR INTEGRADO
      ───────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-semibold mr-1 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            <BrandMark iconClassName="w-8 h-8 rounded-xl" textClassName="text-lg font-black text-white" />
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <Link to="/#quote-section" className="hover:text-cyan-400 transition-colors">Cotizador</Link>
            <Link to="/tracking" className="hover:text-cyan-400 transition-colors">Rastreo</Link>
            <Link to="/sistema" className="hover:text-cyan-400 transition-colors">Cómo Funciona</Link>
            <Link to="/points" className="hover:text-cyan-400 transition-colors">Puntos Afiliados</Link>
            <Link to="/servicios" className="hover:text-cyan-400 transition-colors">Servicios</Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link
              to="/auth/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-2 py-1"
            >
              Ingresar
            </Link>
            <Link
              to="/auth/register"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ─────────────────────────────────────────────────────────────
            2. HERO SECTION CON ANIMACIÓN Y DESTACADO
        ───────────────────────────────────────────────────────────── */}
        <section className="relative pt-16 pb-20 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mb-4">
              <Link to="/" className="hover:text-slate-200">Inicio</Link>
              <span>/</span>
              <span className="text-slate-500">{page.category}</span>
              <span>/</span>
              <span className="text-cyan-400">{page.slug.split('/').pop()}</span>
            </div>

            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{page.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {page.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 mt-6 leading-relaxed max-w-3xl">
                {page.subtitle}
              </p>

              {/* Highlight Pill & CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{page.heroHighlight}</span>
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={page.primaryCtaLink}
                    className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-102"
                  >
                    <span>{page.primaryCtaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {page.secondaryCtaLink && (
                    <Link
                      to={page.secondaryCtaLink}
                      className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
                    >
                      <span>{page.secondaryCtaText}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {page.stats.map((st, i) => (
                <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                    {st.value}
                  </span>
                  <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. GALERÍA DE 4 IMÁGENES CON ANIMACIÓN Y ZOOM (REQUERIMIENTO)
        ───────────────────────────────────────────────────────────── */}
        <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                  GALERÍA OPERATIVA REAL
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Infraestructura, Rutas y Entregas en Acción
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                4 Fases visuales del servicio
              </span>
            </div>

            {/* 4 Images Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {page.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className="group relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl cursor-pointer hover:border-indigo-500/60 transition-all duration-500 flex flex-col justify-between"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Tag badge */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono font-bold text-cyan-300">
                      {img.tag}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950">
                    <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {img.alt}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {img.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. CARACTERÍSTICAS & BENEFICIOS CLAVE
        ───────────────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                VENTAJAS COMPETITIVAS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
                ¿Por qué Elegir Ship24Go para esta Ruta?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {page.features.map((feat, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/40 transition-all shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl mb-4">
                      {feat.icon}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                    <span>Verificado por SLA</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. FLUJO PASO A PASO
        ───────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
                PROCESO TRANSPARENTE
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
                {page.stepsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {page.steps.map((st, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative group hover:border-indigo-500/50 transition-all shadow-md">
                  <div className="text-3xl font-black text-indigo-500/40 font-mono mb-3 group-hover:text-indigo-400 transition-colors">
                    {st.step}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{st.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. PREGUNTAS FRECUENTES (SEO FAQ ACCORDION)
        ───────────────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                RESOLVEMOS TUS DUDAS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Preguntas Frecuentes
              </h2>
            </div>

            <div className="space-y-3">
              {page.faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                    >
                      <span className="text-xs sm:text-sm font-bold text-white">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            7. ENLACES RELACIONADOS & INTERNAL LINKING
        ───────────────────────────────────────────────────────────── */}
        <section className="py-12 bg-slate-900/60 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Páginas Relacionadas & Destinos Conectados
              </span>
              <Link to="/sistema" className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1">
                <span>Ver Arquitectura del Sistema</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {page.relatedLinks.map((rel, i) => (
                <Link
                  key={i}
                  to={rel.url}
                  className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {rel.title}
                    </span>
                    {rel.badge && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {rel.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            8. FINAL CTA
        ───────────────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Comienza a Enviar Hoy con Tarifas Preferenciales
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mt-3 mb-8">
                Accede a tarifas de mayoreo con hasta 40% de descuento, genera tu guía en segundos y rastrea tu paquete con geolocalización satelital.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={page.primaryCtaLink}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
                >
                  <span>{page.primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/point/register"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Afiliar mi Comercio (15% Comisión)</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          9. FOOTER INTEGRADO OFICIAL
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 pt-16 pb-10 border-t border-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <BrandMark iconClassName="w-8 h-8 rounded-xl" textClassName="text-xl font-black text-white" />
              <p className="text-slate-400 text-xs mt-3 max-w-sm leading-relaxed">
                Revolucionando la logística global con inteligencia artificial, transparencia total, red de sucursales barriales y conectividad multi-transportista.
              </p>
              <p className="text-[11px] text-slate-500 mt-4">
                © 2026 Ship24Go Technologies Inc. Todos los derechos reservados.
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3">Producto</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/cotizador" className="hover:text-white transition-colors">Cotizador en Línea</Link></li>
                <li><Link to="/tracking" className="hover:text-white transition-colors">Seguimiento en Vivo</Link></li>
                <li><Link to="/servicios" className="hover:text-white transition-colors">Servicios Logísticos</Link></li>
                <li><Link to="/red-points" className="hover:text-white transition-colors">🏪 Red Points</Link></li>
                <li><Link to="/tarifas" className="hover:text-white transition-colors">Planes &amp; Tarifas</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3">Destinos</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/destinos/espana-union-europea" className="hover:text-white transition-colors">España &amp; Unión Europea</Link></li>
                <li><Link to="/destinos/estados-unidos" className="hover:text-white transition-colors">Estados Unidos</Link></li>
                <li><Link to="/destinos/republica-dominicana" className="hover:text-white transition-colors">República Dominicana</Link></li>
                <li><Link to="/destinos/america-latina" className="hover:text-white transition-colors">América Latina</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3">Empresa &amp; Tech</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/seguridad" className="hover:text-white transition-colors">Seguridad &amp; Custodia</Link></li>
                <li><Link to="/api-docs" className="hover:text-white transition-colors">Documentación API</Link></li>
                <li><Link to="/sistema" className="hover:text-white transition-colors">Cómo Funciona</Link></li>
                <li><Link to="/auth/login" className="hover:text-white transition-colors">Ingresar al Portal</Link></li>
                <li><Link to="/point/register" className="text-cyan-400 font-bold hover:underline">Afiliar nuevo Point</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
