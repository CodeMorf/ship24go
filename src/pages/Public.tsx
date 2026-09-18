import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Truck, ArrowRight, Search, CheckCircle2, MapPin, Globe, ExternalLink, Building2, Navigation } from 'lucide-react';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { LanguageSelector } from '../components/LanguageSelector';
import { Landing } from './Landing';
import { PointsLocator } from './PointsLocator';
import { BrandMark, useBrand } from '../lib/brand';

const Navbar = () => {
  const { t } = useI18n();
  return (
    <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <Link to="/" className="cursor-pointer">
          <BrandMark iconClassName="w-8 h-8 rounded-lg" textClassName="text-lg sm:text-xl text-gray-900 dark:text-white" />
        </Link>
        <div className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-neon-cyan transition-colors">{t('home')}</Link>
          <Link to="/tracking" className="hover:text-blue-600 dark:hover:text-neon-cyan transition-colors">{t('tracking')}</Link>
          <Link to="/sistema" className="hover:text-blue-600 dark:hover:text-neon-cyan transition-colors">Sistema</Link>
          <Link to="/point/register" className="hover:text-blue-600 dark:hover:text-neon-cyan transition-colors">Afiliar mi comercio</Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSelector />
          <Link to="/auth/login" className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-neon-cyan px-2 py-1">
            {t('login')}
          </Link>
          <Link to="/auth/register" className="text-xs sm:text-sm font-bold bg-blue-600 dark:bg-neon-cyan text-white dark:text-gray-900 px-3.5 sm:px-5 py-2 rounded-full hover:bg-blue-700 transition-all">
            {t('register')}
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Home = () => {
  const { t } = useI18n();
  const { brand } = useBrand();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
          <Truck className="w-4 h-4" />
          {brand.siteName}
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight" dangerouslySetInnerHTML={{__html: t('heroTitle').replace('. ', '. <br/> ')}} />
        <p className="text-xl text-gray-600 mb-12 max-w-2xl">
          {t('heroDesc')}
        </p>
        <div className="flex gap-4">
          <Link to="/auth/register" className="bg-blue-600 text-white px-8 py-4 rounded-full font-medium hover:bg-blue-700 transition-all flex items-center gap-2">
            {t('createAccount')} <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/tracking" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-medium hover:border-gray-300 hover:bg-gray-50 transition-all">
            {t('trackPackage')}
          </Link>
        </div>

        <Link to="/point/register" className="mt-5 text-sm font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-2">
          <StorefrontIcon /> ¿Tienes un comercio? Solicita ser Point afiliado
        </Link>

        <div className="mt-24 grid md:grid-cols-3 gap-8 text-left w-full">
          {[
            { title: t('connectStore'), desc: t('connectStoreDesc') },
            { title: t('quoteAndChoose'), desc: t('quoteAndChooseDesc') },
            { title: t('notifyClients'), desc: t('notifyClientsDesc') }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const StorefrontIcon = () => <span aria-hidden="true" className="inline-block w-2 h-2 rounded-full bg-cyan-500" />;

const Tracking = () => {
  const { t, language, setLanguage } = useI18n();
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const lang = params.get('lang') as any;
    if (lang && ['es','en','it','fr'].includes(lang)) setLanguage(lang);
  }, [params, setLanguage]);

  React.useEffect(() => {
    const initialCode = params.get('code');
    if (!initialCode) return;
    setCode(initialCode);
    (async () => {
      setLoading(true);
      setError('');
      try { setData(await api.trackShipment(initialCode)); }
      catch (err: any) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, [params]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await api.trackShipment(code);
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex flex-col font-sans transition-colors">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-20 relative">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-300/10 dark:bg-neon-cyan/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-300/10 dark:bg-neon-pink/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] pointer-events-none"></div>

        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 text-center tracking-tight">{t('trackTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-lg mx-auto">{t('trackDesc')}</p>
        
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-16 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder={t('trackPlaceholder')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-white shadow-sm font-mono text-lg"
          />
          <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 dark:from-neon-cyan dark:to-neon-green text-white dark:text-gray-900 px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105">
            <Search className="w-5 h-5" />
            {loading ? t('searching') : t('search')}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-2xl text-center font-bold max-w-2xl mx-auto border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {data && (
          <div className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-xl max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-8 border-b border-gray-100 dark:border-gray-700 gap-4">
              <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('code')}</p>
                <p className="font-mono text-2xl font-black text-gray-900 dark:text-white">{data.trackingType === 'manifest' ? (data.requestedManifest?.manifestNumber || data.trackingCode) : data.trackingCode}</p>
                {data.destination && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{language === 'it' ? 'Destinazione' : language === 'en' ? 'Destination' : language === 'fr' ? 'Destination' : 'Destino'}: {data.destination}</p>}
                {data.courier && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Courier: <span className="font-black text-gray-800 dark:text-white">{data.courier}</span></p>}
              </div>
              <div className="sm:text-right">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('status')}</p>
                <p className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-neon-cyan/10 dark:text-neon-cyan font-bold text-sm border border-blue-100 dark:border-neon-cyan/20">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> {data.status}
                </p>
                {data.updatedAt && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{language === 'it' ? 'Aggiornato' : language === 'en' ? 'Updated' : language === 'fr' ? 'Mis à jour' : 'Actualizado'}: {new Date(data.updatedAt).toLocaleString()}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
              <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-4"><p className="text-xs font-black uppercase text-blue-600 dark:text-cyan-300 mb-1">Tracking del cliente</p><p className="font-mono font-black text-slate-900 dark:text-white break-all">{data.trackingLevels?.level1_client || data.trackingCode}</p></div>
              <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4"><p className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-300 mb-1">Tracking del manifiesto</p><p className="font-mono font-black text-slate-900 dark:text-white break-all">{data.trackingLevels?.level2_manifest || 'Sin manifiesto'}</p></div>
              <div className="rounded-2xl bg-violet-50/70 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 p-4"><p className="text-xs font-black uppercase text-violet-600 dark:text-violet-300 mb-1">Master del manifiesto</p><p className="font-mono font-black text-slate-900 dark:text-white break-all">{data.trackingLevels?.level3_master || 'Sin master'}</p></div>
              <div className="rounded-2xl bg-slate-50 dark:bg-dark-900/60 border border-slate-100 dark:border-gray-700 p-4"><p className="text-xs font-black uppercase text-slate-400 mb-1">Estado</p><p className="font-black text-slate-900 dark:text-white">{data.status}</p><p className={`text-xs font-bold mt-1 ${data.labelReady ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'}`}>{data.labelReady ? 'Etiqueta disponible' : 'Etiqueta en preparación'}</p></div>
            </div>

            {data.trackingType === 'manifest' && Array.isArray(data.manifestShipments) && data.manifestShipments.length > 0 && (
              <div className="mb-8 rounded-2xl border border-cyan-100 dark:border-cyan-900/40 bg-cyan-50/60 dark:bg-cyan-950/20 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Paquetes de este manifiesto</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">El cliente conserva su tracking; aquí ves el lote operativo asociado.</p>
                  </div>
                  <span className="text-xs font-black text-cyan-700 dark:text-cyan-300">{data.manifestShipments.length} paquetes</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {data.manifestShipments.map((item: any) => (
                    <a key={item.trackingCode} href={`/tracking?code=${encodeURIComponent(item.trackingCode)}`} className="flex items-center justify-between gap-3 rounded-xl border border-cyan-100 dark:border-cyan-900/40 bg-white/80 dark:bg-dark-900/40 px-3 py-2 hover:border-cyan-400 transition-colors">
                      <span className="font-mono text-xs font-black text-slate-800 dark:text-white break-all">{item.trackingCode}</span>
                      <span className="shrink-0 text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.status}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Trayecto Geográfico de Hubs y Distribución */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 mb-8 text-white shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-400" /> Red de Hubs & Trazabilidad Geográfica
                </span>
                {data.manifest?.manifestNumber && (
                  <span className="text-[11px] font-mono font-bold bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 rounded-full text-indigo-300">
                    Valija: {data.manifest.manifestNumber} {data.manifest.masterTrackingCode ? `· Master: ${data.manifest.masterTrackingCode}` : ''}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span>Punto de Origen</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{data.manifest?.pointName || 'Sucursal / Point'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{data.manifest?.pointCity || 'Origen'}</p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hub Tránsito</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{data.manifest?.originHub || 'Hub Internacional'}</p>
                  <p className="text-[11px] text-slate-400 truncate">Consolidación</p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hub Destino</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{data.manifest?.destinationHub || 'Hub Central'}</p>
                  <p className="text-[11px] text-slate-400 truncate">Desconsolidación</p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Última Milla</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{data.recipient || 'Destinatario'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{data.destination || 'Entrega en Destino'}</p>
                </div>
              </div>
            </div>

            {Array.isArray(data.manifestHistory) && data.manifestHistory.length > 1 && (
              <div className="mb-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/20 p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Historial de tramos</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">El tracking del cliente se mantiene; cambia el manifiesto operativo por cada Hub.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300">{data.manifestHistory.length} tramos</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {data.manifestHistory.map((leg: any) => (
                    <div key={`${leg.legNumber}-${leg.manifestNumber}`} className={`rounded-xl border p-3 ${leg.isCurrent ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/20' : 'border-indigo-100 bg-white/70 dark:border-indigo-900/40 dark:bg-dark-900/40'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-white">Tramo {leg.legNumber}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${leg.isCurrent ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {leg.isCurrent ? 'Actual' : 'Completado'}
                        </span>
                      </div>
                      <p className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-2">{leg.manifestNumber}</p>
                      <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400 mt-1">Master: {leg.masterTrackingCode || 'Pendiente'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{leg.originHub} → {leg.destinationHub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:to-gray-100 dark:before:from-neon-cyan/30 dark:before:to-gray-800">
              {data.events.map((ev: any, i: number) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8 last:mb-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-dark-800 bg-blue-500 dark:bg-neon-cyan text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <div className="w-2 h-2 rounded-full bg-white dark:bg-dark-900"></div>
                  </div>
                  
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-white/90 dark:bg-dark-900/70 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{ev.status}</p>
                      {ev.hub_id && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                          {ev.hub_id}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 leading-relaxed">{ev.description}</p>

                    {/* Ubicación Geográfica del Evento */}
                    {(ev.location || ev.city || ev.country_code) && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-medium truncate">{ev.location || [ev.city, ev.country_code].filter(Boolean).join(', ')}</span>
                        {ev.country_code && (
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {ev.country_code}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Coordenadas GPS y Enlace a Mapa */}
                    {ev.latitude != null && ev.longitude != null && (
                      <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700/60">
                          <Globe className="w-3 h-3 text-emerald-500" />
                          {Number(ev.latitude).toFixed(4)}, {Number(ev.longitude).toFixed(4)}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${ev.latitude},${ev.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                        >
                          <span>Ver en mapa</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    <p className="text-gray-400 dark:text-gray-500 text-[11px] mt-2 font-medium">{ev.date ? new Date(ev.date).toLocaleString() : 'Fecha pendiente de actualización'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

import PublicBusinessPlan from './PublicBusinessPlan';
import SystemPresentationPage from './SystemPresentationPage';
import SeoLandingPage from './SeoLandingPage';

export default function PublicPages() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/tracking" element={<Tracking />} />
      <Route path="/points" element={<PointsLocator />} />
      <Route path="/puntos" element={<PointsLocator />} />
      <Route path="/plan/share/:token" element={<PublicBusinessPlan />} />
      <Route path="/plan/share" element={<PublicBusinessPlan />} />
      <Route path="/sistema" element={<SystemPresentationPage />} />
      <Route path="/how-it-works" element={<SystemPresentationPage />} />
      <Route path="/ecosistema" element={<SystemPresentationPage />} />

      {/* RUTAS SEO DESTINOS INTERNACIONALES */}
      <Route path="/destinos/espana-union-europea" element={<SeoLandingPage pageKey="espana-union-europea" />} />
      <Route path="/destinos/estados-unidos" element={<SeoLandingPage pageKey="estados-unidos" />} />
      <Route path="/destinos/republica-dominicana" element={<SeoLandingPage pageKey="republica-dominicana" />} />
      <Route path="/destinos/america-latina" element={<SeoLandingPage pageKey="america-latina" />} />
      <Route path="/destinos/:slug" element={<SeoLandingPage />} />

      {/* RUTAS SEO PRODUCTOS, TARIFAS Y RED */}
      <Route path="/servicios" element={<SeoLandingPage pageKey="servicios" />} />
      <Route path="/cotizador" element={<SeoLandingPage pageKey="cotizador" />} />
      <Route path="/tarifas" element={<SeoLandingPage pageKey="tarifas" />} />
      <Route path="/red-points" element={<SeoLandingPage pageKey="red-points" />} />

      {/* RUTAS SEO EMPRESA, SEGURIDAD Y API */}
      <Route path="/seguridad" element={<SeoLandingPage pageKey="seguridad" />} />
      <Route path="/api-docs" element={<SeoLandingPage pageKey="api-docs" />} />
    </Routes>
  );
}
