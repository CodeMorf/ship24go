import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Package, 
  FileText, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  Store, 
  ArrowRight, 
  Sun, 
  Moon,
  Sparkles,
  Building2
} from 'lucide-react';
import { api, getAuthToken } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { useBrand } from '../lib/brand';
import { CurrencySelector } from '../components/CurrencySelector';
import { LanguageSelector } from '../components/LanguageSelector';

interface PointItem {
  id: string;
  business_name: string;
  contact_name: string;
  phone?: string;
  email?: string;
  country: string;
  currency: string;
  address_line1: string;
  civic_number?: string;
  city: string;
  province?: string;
  postal_code?: string;
  formatted_address: string;
  google_place_id?: string;
  latitude: number;
  longitude: number;
  hours?: string;
}

const LOCATOR_TEXTS: Record<string, Record<string, string>> = {
  es: {
    navQuoter: 'Cotizador',
    navTracking: 'Seguimiento',
    navPoints: 'Red Points',
    navRegister: 'Registrar Comercio',
    btnLogin: 'Ingresar',
    btnDashboard: 'Mi Panel',
    heroBadge: '📍 Red Oficial Ship24Go',
    heroTitle: 'Encuentra tu Point más cercano para realizar envíos',
    heroSubtitle: 'Acude a nuestros comercios y centros afiliados para despachar paquetes, enviar documentos, imprimir etiquetas térmicas y obtener trazabilidad con tracking oficial.',
    searchPlaceholder: 'Buscar por ciudad, código postal o dirección (ej: Boston, 02114, Cambridge...)',
    filterAll: 'Todos los Puntos',
    filterBoston: 'Boston, MA',
    verifiedBadge: 'Point Verificado Oficial',
    openToday: 'Abierto hoy',
    hoursVal: 'Lun-Vie: 8:00 AM - 7:00 PM · Sáb: 9:00 AM - 2:00 PM',
    getDirections: 'Cómo llegar en Google Maps',
    viewOnMap: 'Ver en Mapa',
    callStore: 'Llamar al local',
    servicesTitle: 'Servicios en este Point',
    service1: 'Recepción y Despacho de Paquetes',
    service2: 'Sobres y Documentos Exprés',
    service3: 'Impresión Térmica de Etiquetas Oficiales',
    service4: 'Trazabilidad y Comprobante Digital con QR',
    activePointsCount: 'puntos de atención disponibles',
    noResultsTitle: 'No encontramos puntos con ese criterio',
    noResultsDesc: 'Intenta buscando por ciudad como "Boston" o código postal "02114".',
    joinBadge: '🏪 Red de Comercios Afiliados',
    joinTitle: '¿Tienes un local comercial o tienda física?',
    joinSubtitle: 'Convierte tu negocio en un Ship24Go Point oficial. Atrae clientes diarios a tu local y genera comisiones en cada envío y paquete gestionado.',
    joinBtn: 'Registrar mi Comercio Ahora',
    mapDirectionsLabel: 'Abrir ruta en Google Maps',
    selectedPointHeading: 'Detalles del Punto Seleccionado'
  },
  en: {
    navQuoter: 'Rate Calculator',
    navTracking: 'Tracking',
    navPoints: 'Points Network',
    navRegister: 'Register Store',
    btnLogin: 'Log In',
    btnDashboard: 'My Dashboard',
    heroBadge: '📍 Official Ship24Go Network',
    heroTitle: 'Find your nearest Point to send and drop off packages',
    heroSubtitle: 'Visit our verified affiliate stores and hubs to dispatch packages, send documents, print official thermal labels, and get live tracking receipts.',
    searchPlaceholder: 'Search by city, zip code or address (e.g. Boston, 02114, Cambridge...)',
    filterAll: 'All Points',
    filterBoston: 'Boston, MA',
    verifiedBadge: 'Official Verified Point',
    openToday: 'Open today',
    hoursVal: 'Mon-Fri: 8:00 AM - 7:00 PM · Sat: 9:00 AM - 2:00 PM',
    getDirections: 'Get directions on Google Maps',
    viewOnMap: 'View on Map',
    callStore: 'Call Store',
    servicesTitle: 'Services available at this Point',
    service1: 'Parcel Drop-Off & Dispatch',
    service2: 'Express Documents & Envelopes',
    service3: 'Official Thermal Label Printing',
    service4: 'Unified Tracking & Digital QR Receipt',
    activePointsCount: 'service locations available',
    noResultsTitle: 'No points found matching your search',
    noResultsDesc: 'Try searching by city like "Boston" or zip code "02114".',
    joinBadge: '🏪 Affiliate Store Network',
    joinTitle: 'Do you own a physical store or commercial shop?',
    joinSubtitle: 'Turn your business into an official Ship24Go Point. Attract daily foot traffic to your shop and earn commissions on every parcel handled.',
    joinBtn: 'Register My Store Now',
    mapDirectionsLabel: 'Open route in Google Maps',
    selectedPointHeading: 'Selected Point Details'
  },
  it: {
    navQuoter: 'Preventivatore',
    navTracking: 'Tracciamento',
    navPoints: 'Rete Point',
    navRegister: 'Registra Negozio',
    btnLogin: 'Accedi',
    btnDashboard: 'Mio Pannello',
    heroBadge: '📍 Rete Ufficiale Ship24Go',
    heroTitle: 'Trova il Point più vicino per spedire e ritirare pacchi',
    heroSubtitle: 'Recati presso i nostri negozi affiliati per spedire pacchi, buste, stampare etichette termiche ufficiali e ottenere ricevute con tracciamento in tempo reale.',
    searchPlaceholder: 'Cerca per città, CAP o indirizzo (es: Boston, 02114...)',
    filterAll: 'Tutti i Punti',
    filterBoston: 'Boston, MA',
    verifiedBadge: 'Point Ufficiale Verificato',
    openToday: 'Aperto oggi',
    hoursVal: 'Lun-Ven: 8:00 - 19:00 · Sab: 9:00 - 14:00',
    getDirections: 'Indicazioni su Google Maps',
    viewOnMap: 'Vedi sulla Mappa',
    callStore: 'Chiama il punto',
    servicesTitle: 'Servizi disponibili in questo Point',
    service1: 'Deposito e Spedizione Pacchi',
    service2: 'Buste e Documenti Express',
    service3: 'Stampa Etichette Termiche',
    service4: 'Ricevuta Digitale con QR e Tracciamento',
    activePointsCount: 'punti di assistenza disponibili',
    noResultsTitle: 'Nessun punto trovato con questo criterio',
    noResultsDesc: 'Prova a cercare per città come "Boston" o CAP "02114".',
    joinBadge: '🏪 Rete Negozi Affiliati',
    joinTitle: 'Possiedi un negozio o un\'attività commerciale?',
    joinSubtitle: 'Diventa un Ship24Go Point ufficiale. Attira nuovi clienti e guadagna commissioni su ogni spedizione gestita.',
    joinBtn: 'Registra il tuo Negozio',
    mapDirectionsLabel: 'Apri percorso in Google Maps',
    selectedPointHeading: 'Dettagli del Punto Selezionato'
  },
  fr: {
    navQuoter: 'Calculateur',
    navTracking: 'Suivi',
    navPoints: 'Réseau Points',
    navRegister: 'Enregistrer Commerce',
    btnLogin: 'Connexion',
    btnDashboard: 'Mon Tableau de Bord',
    heroBadge: '📍 Réseau Officiel Ship24Go',
    heroTitle: 'Trouvez le Point le plus proche pour déposer vos colis',
    heroSubtitle: 'Rendez-vous dans nos commerces affiliés pour expédier colis et plis, imprimer vos étiquettes thermiques officielles et recevoir un reçu de suivi en direct.',
    searchPlaceholder: 'Rechercher par ville, code postal ou adresse (ex : Boston, 02114...)',
    filterAll: 'Tous les Points',
    filterBoston: 'Boston, MA',
    verifiedBadge: 'Point Officiel Vérifié',
    openToday: 'Ouvert aujourd\'hui',
    hoursVal: 'Lun-Ven : 8h00 - 19h00 · Sam : 9h00 - 14h00',
    getDirections: 'Itinéraire sur Google Maps',
    viewOnMap: 'Voir sur la Carte',
    callStore: 'Appeler le magasin',
    servicesTitle: 'Services disponibles à ce Point',
    service1: 'Dépôt et Expédition de Colis',
    service2: 'Plis et Documents Express',
    service3: 'Impression d\'Étiquettes Thermiques',
    service4: 'Reçu Numérique avec Suivi QR',
    activePointsCount: 'points de service disponibles',
    noResultsTitle: 'Aucun point trouvé pour cette recherche',
    noResultsDesc: 'Essayez de chercher par ville comme "Boston" ou code postal "02114".',
    joinBadge: '🏪 Réseau de Commerces Affiliés',
    joinTitle: 'Vous possédez un commerce ou un magasin physique ?',
    joinSubtitle: 'Devenez un Point Ship24Go officiel. Attirez de nouveaux clients et gagnez des commissions sur chaque colis.',
    joinBtn: 'Inscrire mon Commerce',
    mapDirectionsLabel: 'Ouvrir l\'itinéraire dans Google Maps',
    selectedPointHeading: 'Détails du Point Sélectionné'
  },
  de: {
    navQuoter: 'Versandrechner',
    navTracking: 'Sendungsverfolgung',
    navPoints: 'Point-Netzwerk',
    navRegister: 'Geschäft Registrieren',
    btnLogin: 'Anmelden',
    btnDashboard: 'Mein Dashboard',
    heroBadge: '📍 Offizielles Ship24Go Netzwerk',
    heroTitle: 'Finden Sie Ihren nächsten Point zum Versenden von Paketen',
    heroSubtitle: 'Besuchen Sie unsere Partnershops, um Pakete aufzugeben, Dokumente zu versenden, offizielle Etiketten zu drucken und Live-Tracking-Belege zu erhalten.',
    searchPlaceholder: 'Nach Stadt, PLZ oder Adresse suchen (z. B. Boston, 02114...)',
    filterAll: 'Alle Points',
    filterBoston: 'Boston, MA',
    verifiedBadge: 'Offiziell Verifizierter Point',
    openToday: 'Heute geöffnet',
    hoursVal: 'Mo-Fr: 8:00 - 19:00 · Sa: 9:00 - 14:00',
    getDirections: 'Route auf Google Maps planen',
    viewOnMap: 'Auf der Karte anzeigen',
    callStore: 'Standort anrufen',
    servicesTitle: 'Verfügbare Dienste an diesem Point',
    service1: 'Paketannahme & Versand',
    service2: 'Expressbriefe & Dokumente',
    service3: 'Thermodruck offizieller Versandetiketten',
    service4: 'Digitaler Beleg mit QR-Code und Live-Tracking',
    activePointsCount: 'verfügbare Standorte',
    noResultsTitle: 'Keine Points für diese Suche gefunden',
    noResultsDesc: 'Versuchen Sie es mit einer Stadt wie "Boston" oder der Postleitzahl "02114".',
    joinBadge: '🏪 Partnernetzwerk',
    joinTitle: 'Besitzen Sie ein lokales Geschäft oder Ladenlokal?',
    joinSubtitle: 'Werden Sie offizieller Ship24Go Point. Bringen Sie täglich Kunden in Ihr Geschäft und verdienen Sie Provisionen pro Paket.',
    joinBtn: 'Jetzt Geschäft Registrieren',
    mapDirectionsLabel: 'In Google Maps öffnen',
    selectedPointHeading: 'Details zum ausgewählten Point'
  },
  zh: {
    navQuoter: '运费计算',
    navTracking: '物流追踪',
    navPoints: '服务网点',
    navRegister: '商家入驻',
    btnLogin: '登录',
    btnDashboard: '我的控制台',
    heroBadge: '📍 Ship24Go 官方认证网点',
    heroTitle: '查找离您最近的 Ship24Go 物流服务网点',
    heroSubtitle: '前往我们官方认证的合作门店，现场寄送包裹、信件文件、打印专业热敏运单，并获取实时追踪凭证。',
    searchPlaceholder: '输入城市、邮编或详细地址进行搜索（例如：Boston, 02114...）',
    filterAll: '所有网点',
    filterBoston: '波士顿 (Boston, MA)',
    verifiedBadge: '官方认证网点',
    openToday: '今日营业',
    hoursVal: '周一至周五: 8:00 - 19:00 · 周六: 9:00 - 14:00',
    getDirections: '在 Google 地图查看路线',
    viewOnMap: '地图定位',
    callStore: '致电门店',
    servicesTitle: '该网点提供的服务',
    service1: '包裹现场寄存与寄递',
    service2: '文件信件极速快递',
    service3: '官方热敏面单现场打印',
    service4: '含防伪二维码的实时物流电子凭单',
    activePointsCount: '个已启用的官方服务网点',
    noResultsTitle: '未找到符合条件的网点',
    noResultsDesc: '请尝试输入城市名如 "Boston" 或邮政编码 "02114"。',
    joinBadge: '🏪 实体门店合作网络',
    joinTitle: '您是否拥有临街店铺、便利店或商贸门店？',
    joinSubtitle: '加入 Ship24Go 官方网点网络，为您的实体店吸引海量周边客流，每处理一票运单均可获得丰厚佣金。',
    joinBtn: '立即申请成为网点',
    mapDirectionsLabel: '在 Google Maps 中导航',
    selectedPointHeading: '已选网点详细信息'
  }
};

const EMPTY_POINT: PointItem = {
  id: '',
  business_name: '',
  contact_name: '',
  country: '',
  currency: '',
  address_line1: '',
  city: '',
  formatted_address: '',
  latitude: 0,
  longitude: 0
};

export const PointsLocator: React.FC = () => {
  const { language } = useI18n();
  const { brand } = useBrand();
  const { isDark, toggleTheme } = useTheme();

  const langKey = useMemo(() => {
    const raw = String(language || 'es').toLowerCase();
    const short = raw.split('-')[0];
    if (LOCATOR_TEXTS[short]) return short;
    return 'es';
  }, [language]);

  const pt = LOCATOR_TEXTS[langKey] || LOCATOR_TEXTS.es;

  const [points, setPoints] = useState<PointItem[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<PointItem>(EMPTY_POINT);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'boston'>('all');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthToken()));
    document.title = `${pt.heroTitle} | ${brand.siteName || 'Ship24Go'}`;
  }, [langKey, pt.heroTitle, brand.siteName]);

  // Cargar points aprobados del backend
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getPublicPoints()
      .then((res: any) => {
        if (cancelled) return;
        if (res?.success && Array.isArray(res?.points) && res.points.length > 0) {
          const list: PointItem[] = res.points.map((p: any) => ({
            ...p,
            latitude: Number(p.latitude) || 0,
            longitude: Number(p.longitude) || 0,
            hours: pt.hoursVal
          }));
          setPoints(list);
          setSelectedPoint(list[0]);
        } else {
          setPoints([]);
          setSelectedPoint(EMPTY_POINT);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPoints([]);
          setSelectedPoint(EMPTY_POINT);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pt.hoursVal]);

  // Filtrado reactivo en tiempo real
  const filteredPoints = useMemo(() => {
    let list = points;
    if (activeFilter === 'boston') {
      list = list.filter(p => p.city?.toLowerCase().includes('boston') || p.province?.toLowerCase().includes('ma') || p.postal_code?.includes('021'));
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(p => 
      p.business_name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.formatted_address.toLowerCase().includes(q) ||
      (p.postal_code && p.postal_code.toLowerCase().includes(q)) ||
      (p.province && p.province.toLowerCase().includes(q))
    );
  }, [points, searchQuery, activeFilter]);

  const mapEmbedUrl = useMemo(() => {
    const lat = selectedPoint.latitude;
    const lng = selectedPoint.longitude;
    return `https://maps.google.com/maps?q=${lat},${lng}&hl=${langKey}&z=16&output=embed`;
  }, [selectedPoint, langKey]);

  const googleMapsDirectionsUrl = useMemo(() => {
    const lat = selectedPoint.latitude;
    const lng = selectedPoint.longitude;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }, [selectedPoint]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* NAVBAR OFICIAL */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-20">
            
            {/* Logo y Enlaces Principales */}
            <div className="flex items-center gap-4 xl:gap-8 min-w-0">
              <Link to="/" className="flex items-center shrink-0 cursor-pointer group" title={brand.siteName || 'Ship24Go'}>
                <div className="relative flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={brand.logoUrl || '/brand/logo.png'} 
                    alt={brand.siteName || 'Ship24Go'} 
                    className="w-full h-full object-contain" 
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
                  />
                </div>
              </Link>

              <nav className="hidden xl:flex items-center gap-2 font-semibold text-[13px] 2xl:text-sm text-slate-600 dark:text-slate-300">
                <Link to="/#quote-section" className="px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors">
                  {pt.navQuoter}
                </Link>
                <Link to="/tracking" className="px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors">
                  {pt.navTracking}
                </Link>
                <Link to="/points" className="px-3.5 py-1.5 rounded-xl text-cyan-700 dark:text-cyan-300 font-bold bg-cyan-100/80 dark:bg-cyan-950/70 border border-cyan-500/40 shadow-xs flex items-center gap-1.5">
                  <span>🏪</span> {pt.navPoints}
                </Link>
                <Link to="/point/register" className="px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors">
                  {pt.navRegister}
                </Link>
              </nav>
            </div>

            {/* Acciones de Cabecera */}
            <div className="flex items-center gap-2.5 shrink-0">
              <CurrencySelector />
              <LanguageSelector />
              
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title={isDark ? 'Modo claro' : 'Modo oscuro'}
                aria-label="Cambiar tema"
              >
                {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              {isLoggedIn ? (
                <Link 
                  to="/panel"
                  className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <span>{pt.btnDashboard}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link 
                  to="/auth/login"
                  className="h-10 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:shadow-lg transition-all flex items-center whitespace-nowrap"
                >
                  {pt.btnLogin}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-[#030712] dark:to-[#030712] pt-12 pb-10 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold mb-4 shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            {pt.heroBadge}
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto mb-4 font-outfit">
            {pt.heroTitle}
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            {pt.heroSubtitle}
          </p>

          {/* BUSCADOR Y FILTROS INTELIGENTES */}
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={pt.searchPlaceholder}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-lg shadow-indigo-950/5 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium text-sm transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pills de Filtrado Rápido */}
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <button 
                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'all' && !searchQuery
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {pt.filterAll}
              </button>
              <button 
                onClick={() => { setActiveFilter('boston'); setSearchQuery('Boston'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === 'boston' || searchQuery.toLowerCase().includes('boston')
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>🇺🇸</span> {pt.filterBoston}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* CONTENEDOR PRINCIPAL: DIRECTORIO & MAPA INTERACTIVO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {filteredPoints.length} {pt.activePointsCount}
            </span>
          </div>
        </div>

        {filteredPoints.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{pt.noResultsTitle}</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">{pt.noResultsDesc}</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
            >
              {pt.filterAll}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* COLUMNA IZQUIERDA: TARJETAS DE PUNTOS */}
            <div className="lg:col-span-5 space-y-4">
              {filteredPoints.map((point) => {
                const isSelected = selectedPoint.id === point.id;
                return (
                  <div
                    key={point.id}
                    onClick={() => setSelectedPoint(point)}
                    className={`p-5 rounded-3xl cursor-pointer transition-all duration-300 border text-left relative ${
                      isSelected 
                        ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-cyan-400 shadow-xl shadow-indigo-950/10 ring-2 ring-indigo-500/20 dark:ring-cyan-400/20' 
                        : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                    }`}
                  >
                    {/* Badge Verificado */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {pt.verifiedBadge}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {pt.openToday}
                      </span>
                    </div>

                    {/* Nombre del Comercio */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 font-outfit">
                      {point.business_name}
                    </h3>

                    {/* Dirección Exacta */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-start gap-1.5 mb-3 leading-snug">
                      <MapPin className="w-4 h-4 text-indigo-500 dark:text-cyan-400 shrink-0 mt-0.5" />
                      <span>{point.formatted_address}</span>
                    </p>

                    {/* Teléfono */}
                    {point.phone && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${point.phone}`} className="hover:underline text-indigo-600 dark:text-cyan-400 font-semibold" onClick={e => e.stopPropagation()}>
                          {point.phone}
                        </a>
                      </div>
                    )}

                    {/* Horarios */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 mb-3 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      {point.hours || pt.hoursVal}
                    </div>

                    {/* Servicios Disponibles */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                        {pt.service1}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                        {pt.service2}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {pt.service3}
                      </span>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{pt.getDirections}</span>
                      </a>
                      {point.phone && (
                        <a
                          href={`tel:${point.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                          title={pt.callStore}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* COLUMNA DERECHA: MAPA INTERACTIVO GOOGLE MAPS */}
            <div className="lg:col-span-7 sticky top-24 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
                
                {/* Cabecera del Mapa */}
                <div className="flex items-center justify-between px-2 py-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {selectedPoint.business_name}
                    </span>
                  </div>
                  <a 
                    href={googleMapsDirectionsUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>{pt.mapDirectionsLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* IFRAME GOOGLE MAPS INTERACTIVO Y NATIVO */}
                <div className="relative w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                  <iframe
                    title={selectedPoint.business_name}
                    width="100%"
                    height="100%"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapEmbedUrl}
                    className="w-full h-full border-0"
                  />

                  {/* Superposición informativa del Point activo */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                        {selectedPoint.business_name}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {selectedPoint.formatted_address}
                      </span>
                    </div>
                    <a
                      href={googleMapsDirectionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{pt.getDirections}</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* CTA SECTION: AFILIAR UN COMERCIO (POINT) */}
      <section className="bg-white dark:bg-[#080e1e] border-t border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-4 shadow-xs">
            {pt.joinBadge}
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 font-outfit">
            {pt.joinTitle}
          </h2>
          
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            {pt.joinSubtitle}
          </p>

          <Link
            to="/point/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
          >
            <span>🏪</span>
            <span>{pt.joinBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER BÁSICO */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-slate-50 dark:bg-[#030712] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={brand.logoUrl || '/brand/logo.png'} alt="Ship24Go" className="w-6 h-6 object-contain" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Ship24Go</span>
            <span>· © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-4 font-semibold">
            <Link to="/" className="hover:underline">{pt.navQuoter}</Link>
            <Link to="/tracking" className="hover:underline">{pt.navTracking}</Link>
            <Link to="/points" className="hover:underline">{pt.navPoints}</Link>
            <Link to="/point/register" className="hover:underline">{pt.navRegister}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

