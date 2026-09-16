import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, ChevronLeft, MapPin, Moon, ShieldCheck, Store, Sun, User, XCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, setAuthToken } from '../lib/api';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { CountrySelect } from '../components/CountrySelect';
import { BrandMark } from '../lib/brand';
import { useTheme } from '../lib/theme';
import { useI18n } from '../lib/i18n';
import { LanguageSelector } from '../components/LanguageSelector';
import { CurrencySelector } from '../components/CurrencySelector';
import { ONLY_USA_MODE } from '../lib/countries';

type PointForm = {
  contactName: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  currency: string;
  addressLine1: string;
  civicNumber: string;
  city: string;
  province: string;
  postalCode: string;
  formattedAddress: string;
  googlePlaceId: string;
  latitude: number | null;
  longitude: number | null;
};

const POINT_REGISTER_TEXTS: Record<string, Record<string, string>> = {
  es: {
    navLogin: 'Ya tengo una cuenta',
    badge: 'Red de Points Ship24Go',
    heroTitle: 'Convierte tu comercio en un punto logístico.',
    heroDesc: 'Registra tu ubicación, recibe operaciones y consulta el mismo tracking que verá el cliente final.',
    feat1Title: 'Ubicación verificada',
    feat1Desc: 'La dirección se confirma con Google Maps y queda guardada con coordenadas.',
    feat2Title: 'Aprobación controlada',
    feat2Desc: 'El equipo de Ship24Go revisa y habilita cada Point antes de emitir.',
    feat3Title: 'Trazabilidad compartida',
    feat3Desc: 'Cada operación genera un código público enlazado al tracking existente.',
    formBadge: 'Solicitud de afiliación',
    formTitle: 'Datos del Point',
    formSubtitle: 'Completa los datos reales del comercio.',
    businessName: 'Nombre del comercio *',
    businessPlaceholder: 'Ej. Punto Centro / Ship Center',
    contactName: 'Responsable *',
    contactPlaceholder: 'Nombre y apellido',
    phone: 'Teléfono',
    phonePlaceholder: '+1 305 000 0000',
    email: 'Correo *',
    emailPlaceholder: 'point@comercio.com',
    password: 'Contraseña *',
    passwordPlaceholder: 'Mínimo 10 caracteres',
    locationSection: 'Ubicación del comercio',
    locationSubtitle: 'Selecciona una sugerencia; escribir texto libre no genera coordenadas verificadas.',
    country: 'País *',
    currency: 'Moneda de operación *',
    mapsAddress: 'Dirección en Google Maps *',
    mapsPlaceholder: 'Busca el comercio y selecciona una dirección',
    city: 'Ciudad *',
    cityPlaceholder: 'Miami',
    province: 'Provincia / estado',
    provincePlaceholder: 'FL',
    postalCode: 'Código postal',
    postalPlaceholder: '33101',
    coordsVerified: 'Coordenadas verificadas',
    locationConfirmed: 'Ubicación confirmada por Google Maps',
    mapPlaceholderTitle: 'La ubicación aparecerá aquí',
    mapPlaceholderDesc: 'Selecciona una sugerencia de Google Maps para guardar la coordenada exacta del comercio.',
    normalizedAddress: 'Dirección normalizada',
    selectLocationToConfirm: 'Selecciona la ubicación para confirmar la dirección.',
    statusReady: 'Listo para revisión',
    statusPending: 'Falta seleccionar en Maps',
    btnSubmit: 'Solicitar afiliación Point',
    btnSubmitting: 'Enviando solicitud…',
    selectAddressAlert: 'Selecciona primero una dirección de Google Maps para continuar.',
    back: 'Volver',
    manualReviewNote: 'Revisión manual antes de operar',
  },
  en: {
    navLogin: 'Already have an account',
    badge: 'Ship24Go Points Network',
    heroTitle: 'Turn your store into a logistics point.',
    heroDesc: 'Register your location, receive packages and track operations in real time.',
    feat1Title: 'Verified Location',
    feat1Desc: 'Your address is verified through Google Maps and saved with exact coordinates.',
    feat2Title: 'Controlled Approval',
    feat2Desc: 'The Ship24Go team verifies and enables each Point before operations start.',
    feat3Title: 'Shared Tracking',
    feat3Desc: 'Every operation generates a public code linked to live tracking.',
    formBadge: 'Affiliate Application',
    formTitle: 'Point Details',
    formSubtitle: 'Enter the verified information of your store.',
    businessName: 'Store Name *',
    businessPlaceholder: 'E.g. Downtown Ship Center',
    contactName: 'Responsible Person *',
    contactPlaceholder: 'Full name',
    phone: 'Phone',
    phonePlaceholder: '+1 305 000 0000',
    email: 'Email *',
    emailPlaceholder: 'point@store.com',
    password: 'Password *',
    passwordPlaceholder: 'Minimum 10 characters',
    locationSection: 'Store Location',
    locationSubtitle: 'Select a Google Maps suggestion; free text does not produce verified coordinates.',
    country: 'Country *',
    currency: 'Operating Currency *',
    mapsAddress: 'Google Maps Address *',
    mapsPlaceholder: 'Search your store and select a suggested address',
    city: 'City *',
    cityPlaceholder: 'Miami',
    province: 'State / Province',
    provincePlaceholder: 'FL',
    postalCode: 'Zip Code',
    postalPlaceholder: '33101',
    coordsVerified: 'Verified Coordinates',
    locationConfirmed: 'Location confirmed by Google Maps',
    mapPlaceholderTitle: 'Location will appear here',
    mapPlaceholderDesc: 'Select a suggestion from Google Maps to save exact coordinates.',
    normalizedAddress: 'Normalized Address',
    selectLocationToConfirm: 'Select a location to confirm the address.',
    statusReady: 'Ready for review',
    statusPending: 'Pending Maps selection',
    btnSubmit: 'Apply as a Point Affiliate',
    btnSubmitting: 'Submitting application…',
    selectAddressAlert: 'Please select an address from Google Maps to continue.',
    back: 'Back',
    manualReviewNote: 'Manual review required before operating',
  },
  it: {
    navLogin: 'Ho già un account',
    badge: 'Rete di Punti Ship24Go',
    heroTitle: 'Trasforma la tua attività in un punto logistico.',
    heroDesc: 'Registra la tua posizione, ricevi pacchi e consulta lo stesso tracking del cliente finale.',
    feat1Title: 'Posizione verificata',
    feat1Desc: 'L\'indirizzo viene verificato con Google Maps e salvato con coordinate precise.',
    feat2Title: 'Approvazione controllata',
    feat2Desc: 'Il team Ship24Go esamina e abilita ogni Point prima di iniziare.',
    feat3Title: 'Tracciabilità condivisa',
    feat3Desc: 'Ogni operazione genera un codice pubblico collegato al tracking reale.',
    formBadge: 'Domanda di affiliazione',
    formTitle: 'Dati del Point',
    formSubtitle: 'Inserisci i dati reali della tua attività.',
    businessName: 'Nome attività *',
    businessPlaceholder: 'Es. Punto Logistico Centro',
    contactName: 'Responsabile *',
    contactPlaceholder: 'Nome e cognome',
    phone: 'Telefono',
    phonePlaceholder: '+1 305 000 0000',
    email: 'Email *',
    emailPlaceholder: 'point@commercio.com',
    password: 'Password *',
    passwordPlaceholder: 'Minimo 10 caratteri',
    locationSection: 'Posizione dell\'attività',
    locationSubtitle: 'Seleziona un suggerimento da Google Maps.',
    country: 'Paese *',
    currency: 'Valuta operativa *',
    mapsAddress: 'Indirizzo su Google Maps *',
    mapsPlaceholder: 'Cerca la tua attività e seleziona un indirizzo',
    city: 'Città *',
    cityPlaceholder: 'Miami',
    province: 'Provincia / Stato',
    provincePlaceholder: 'FL',
    postalCode: 'CAP',
    postalPlaceholder: '33101',
    coordsVerified: 'Coordinate verificate',
    locationConfirmed: 'Posizione confermata da Google Maps',
    mapPlaceholderTitle: 'La posizione apparirà qui',
    mapPlaceholderDesc: 'Seleziona un indirizzo da Google Maps per salvare le coordinate.',
    normalizedAddress: 'Indirizzo normalizzato',
    selectLocationToConfirm: 'Seleziona una posizione per confermare l\'indirizzo.',
    statusReady: 'Pronto per la revisione',
    statusPending: 'Manca selezione su Maps',
    btnSubmit: 'Richiedi affiliazione Point',
    btnSubmitting: 'Invio della richiesta…',
    selectAddressAlert: 'Seleziona prima un indirizzo da Google Maps per continuare.',
    back: 'Indietro',
    manualReviewNote: 'Revisione manuale prima di operare',
  },
  fr: {
    navLogin: 'J\'ai déjà un compte',
    badge: 'Réseau de Points Relais Ship24Go',
    heroTitle: 'Transformez votre commerce en point logistique.',
    heroDesc: 'Enregistrez votre adresse, recevez des colis et accédez au même suivi que le client final.',
    feat1Title: 'Emplacement vérifié',
    feat1Desc: 'L\'adresse est confirmée avec Google Maps et enregistrée avec ses coordonnées.',
    feat2Title: 'Validation contrôlée',
    feat2Desc: 'L\'équipe Ship24Go vérifie et active chaque Point avant toute opération.',
    feat3Title: 'Traçabilité partagée',
    feat3Desc: 'Chaque opération génère un code public lié au suivi en direct.',
    formBadge: 'Demande d\'affiliation',
    formTitle: 'Informations du Point',
    formSubtitle: 'Complétez les informations réelles de votre commerce.',
    businessName: 'Nom du commerce *',
    businessPlaceholder: 'Ex. Point Relais Centre',
    contactName: 'Responsable *',
    contactPlaceholder: 'Nom et prénom',
    phone: 'Téléphone',
    phonePlaceholder: '+1 305 000 0000',
    email: 'E-mail *',
    emailPlaceholder: 'point@commerce.com',
    password: 'Mot de passe *',
    passwordPlaceholder: 'Minimum 10 caractères',
    locationSection: 'Emplacement du commerce',
    locationSubtitle: 'Sélectionnez une suggestion Google Maps pour certifier l\'adresse.',
    country: 'Pays *',
    currency: 'Devise d\'opération *',
    mapsAddress: 'Adresse Google Maps *',
    mapsPlaceholder: 'Recherchez votre commerce et choisissez l\'adresse',
    city: 'Ville *',
    cityPlaceholder: 'Miami',
    province: 'Région / État',
    provincePlaceholder: 'FL',
    postalCode: 'Code postal',
    postalPlaceholder: '33101',
    coordsVerified: 'Coordonnées vérifiées',
    locationConfirmed: 'Emplacement confirmé par Google Maps',
    mapPlaceholderTitle: 'L\'emplacement s\'affichera ici',
    mapPlaceholderDesc: 'Choisissez une suggestion Google Maps pour enregistrer les coordonnées.',
    normalizedAddress: 'Adresse normalisée',
    selectLocationToConfirm: 'Sélectionnez l\'adresse pour confirmer.',
    statusReady: 'Prêt pour validation',
    statusPending: 'Sélection Maps requise',
    btnSubmit: 'Demander l\'affiliation Point',
    btnSubmitting: 'Envoi en cours…',
    selectAddressAlert: 'Veuillez sélectionner une adresse Google Maps pour continuer.',
    back: 'Retour',
    manualReviewNote: 'Validation manuelle avant exploitation',
  },
  de: {
    navLogin: 'Ich habe bereits ein Konto',
    badge: 'Ship24Go Point-Netzwerk',
    heroTitle: 'Verwandeln Sie Ihr Geschäft in einen Logistik-Point.',
    heroDesc: 'Registrieren Sie Ihren Standort, nehmen Sie Pakete an und verfolgen Sie Sendungen.',
    feat1Title: 'Verifizierter Standort',
    feat1Desc: 'Die Adresse wird mit Google Maps bestätigt und mit genauen Koordinaten gespeichert.',
    feat2Title: 'Kontrollierte Freigabe',
    feat2Desc: 'Das Ship24Go-Team prüft und aktiviert jeden Point vor dem Start.',
    feat3Title: 'Gemeinsame Sendungsverfolgung',
    feat3Desc: 'Jeder Vorgang generiert einen öffentlichen Tracking-Code.',
    formBadge: 'Partner-Antrag',
    formTitle: 'Point-Daten',
    formSubtitle: 'Geben Sie die offiziellen Geschäftsdaten ein.',
    businessName: 'Name des Geschäfts *',
    businessPlaceholder: 'Z.B. Paket-Point Stadtmitte',
    contactName: 'Ansprechpartner *',
    contactPlaceholder: 'Vor- und Nachname',
    phone: 'Telefon',
    phonePlaceholder: '+1 305 000 0000',
    email: 'E-Mail *',
    emailPlaceholder: 'point@geschaeft.com',
    password: 'Passwort *',
    passwordPlaceholder: 'Mindestens 10 Zeichen',
    locationSection: 'Standort des Geschäfts',
    locationSubtitle: 'Wählen Sie einen Google Maps Vorschlag.',
    country: 'Land *',
    currency: 'Betriebswährung *',
    mapsAddress: 'Google Maps Adresse *',
    mapsPlaceholder: 'Geschäft suchen und Adresse auswählen',
    city: 'Stadt *',
    cityPlaceholder: 'Miami',
    province: 'Bundesland / Staat',
    provincePlaceholder: 'FL',
    postalCode: 'Postleitzahl',
    postalPlaceholder: '33101',
    coordsVerified: 'Verifizierte Koordinaten',
    locationConfirmed: 'Standort von Google Maps bestätigt',
    mapPlaceholderTitle: 'Der Standort erscheint hier',
    mapPlaceholderDesc: 'Google Maps Vorschlag auswählen, um Koordinaten zu speichern.',
    normalizedAddress: 'Standardisierte Adresse',
    selectLocationToConfirm: 'Wählen Sie einen Standort zur Bestätigung.',
    statusReady: 'Bereit zur Prüfung',
    statusPending: 'Auswahl auf Maps erforderlich',
    btnSubmit: 'Point-Partnerschaft beantragen',
    btnSubmitting: 'Antrag wird gesendet…',
    selectAddressAlert: 'Wählen Sie zuerst eine Google Maps Adresse aus.',
    back: 'Zurück',
    manualReviewNote: 'Manuelle Prüfung vor Inbetriebnahme',
  },
  zh: {
    navLogin: '已有账号？登录',
    badge: 'Ship24Go 合作网点网络',
    heroTitle: '将您的店铺转变为物流自提网点。',
    heroDesc: '登记您的店铺位置，接收与交付包裹，并实时同步物流追踪状态。',
    feat1Title: '谷歌地图认证位置',
    feat1Desc: '地址通过谷歌地图精确验证并保存真实地理坐标。',
    feat2Title: '人工审核与保障',
    feat2Desc: 'Ship24Go 运营团队在开通前逐一核验网点资质。',
    feat3Title: '实时共享追踪',
    feat3Desc: '每笔操作自动生成客户可公开查验的追踪单号。',
    formBadge: '加盟申请',
    formTitle: '网点信息',
    formSubtitle: '请填写店铺真实工商与地址信息。',
    businessName: '店铺/商户名称 *',
    businessPlaceholder: '例如：中心便利店 / 快捷寄递点',
    contactName: '负责人姓名 *',
    contactPlaceholder: '姓名',
    phone: '联系电话',
    phonePlaceholder: '+1 305 000 0000',
    email: '电子邮箱 *',
    emailPlaceholder: 'point@store.com',
    password: '密码 *',
    passwordPlaceholder: '至少10位字符',
    locationSection: '商户所在位置',
    locationSubtitle: '请在谷歌地图搜索框中选取官方提示的地址。',
    country: '国家/地区 *',
    currency: '运营结算币种 *',
    mapsAddress: '谷歌地图精确定位 *',
    mapsPlaceholder: '搜索商户并从列表中选择具体地址',
    city: '城市 *',
    cityPlaceholder: 'Miami',
    province: '州 / 省',
    provincePlaceholder: 'FL',
    postalCode: '邮政编码',
    postalPlaceholder: '33101',
    coordsVerified: '已认证地理坐标',
    locationConfirmed: '谷歌地图位置确认无误',
    mapPlaceholderTitle: '地图位置将在此显示',
    mapPlaceholderDesc: '选择谷歌地图建议后即可查看并保存店铺精确定位。',
    normalizedAddress: '标准化地址',
    selectLocationToConfirm: '选择位置后在此显示格式化地址。',
    statusReady: '准备提交审核',
    statusPending: '等待选择地图地址',
    btnSubmit: '申请成为合作网点',
    btnSubmitting: '提交中…',
    selectAddressAlert: '请先选择谷歌地图建议地址再继续。',
    back: '返回',
    manualReviewNote: '正式运营前需人工审核确认',
  }
};

function MapPreview({ latitude, longitude, pt }: { latitude: number | null; longitude: number | null; pt: Record<string, string> }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const ready = Number.isFinite(latitude) && Number.isFinite(longitude);

  useEffect(() => {
    if (!ready || !mapRef.current || !(window as any).google?.maps) return;
    const google = (window as any).google;
    const position = { lat: Number(latitude), lng: Number(longitude) };
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: position,
        zoom: 17,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      markerRef.current = new google.maps.Marker({ map: mapInstanceRef.current, position, title: 'Ubicación del Point' });
    } else {
      mapInstanceRef.current.setCenter(position);
      markerRef.current?.setPosition(position);
    }
  }, [ready, latitude, longitude]);

  if (!ready) {
    return (
      <div className="h-full min-h-[250px] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-center p-8">
        <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="font-bold text-slate-600 dark:text-slate-300">{pt.mapPlaceholderTitle}</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{pt.mapPlaceholderDesc}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[250px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
      <div ref={mapRef} className="absolute inset-0" />
      <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/95 dark:bg-slate-950/90 backdrop-blur px-4 py-3 shadow-lg border border-white dark:border-slate-700">
        <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">{pt.coordsVerified}</p>
        <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1">{Number(latitude).toFixed(7)}, {Number(longitude).toFixed(7)}</p>
      </div>
    </div>
  );
}

const initialForm: PointForm = {
  contactName: '',
  businessName: '',
  email: '',
  phone: '',
  password: '',
  country: 'US',
  currency: 'USD',
  addressLine1: '',
  civicNumber: '',
  city: 'Miami',
  province: 'FL',
  postalCode: '33101',
  formattedAddress: '',
  googlePlaceId: '',
  latitude: null,
  longitude: null
};

export default function PointRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = (searchParams.get('ref') || searchParams.get('exec') || '').trim();
  const [executive, setExecutive] = useState<any>(null);

  const { isDark, toggleTheme } = useTheme();
  const { language } = useI18n();
  const langKey = String(language || 'en').slice(0, 2).toLowerCase();
  const pt = POINT_REGISTER_TEXTS[langKey] || POINT_REGISTER_TEXTS.es;

  const [form, setForm] = useState<PointForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const locationSelected = Boolean(form.googlePlaceId && Number.isFinite(form.latitude) && Number.isFinite(form.longitude));

  useEffect(() => {
    if (refCode) {
      api.getPublicPointExecutive(refCode)
        .then((res: any) => {
          if (res?.success && res?.executive) {
            setExecutive(res.executive);
          }
        })
        .catch(() => {});
    }
  }, [refCode]);

  const update = (field: keyof PointForm, value: any) => setForm((current) => ({ ...current, [field]: value }));
  const updateCountry = (country: string) => setForm((current) => ({
    ...current,
    country,
    currency: country === 'US' ? 'USD' : country === 'DO' ? 'DOP' : 'USD'
  }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const payload: any = { ...form };
      if (refCode) {
        payload.ref = refCode;
      }
      const response = await api.registerPoint(payload);
      setAuthToken(response.token);
      setNotice('Registro recibido. Tu Point quedó registrado con éxito.');
      window.setTimeout(() => navigate('/point'), 500);
    } catch (err: any) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <Link to="/" title="Ship24Go" className="shrink-0 flex items-center">
            <BrandMark showText={false} iconClassName="w-10 h-10 md:w-11 md:h-11 rounded-xl" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/point/roadmap"
              className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline whitespace-nowrap px-2 py-1 flex items-center gap-1"
            >
              <span>🗺️ Roadmap &amp; Tarifas</span>
            </Link>
            <CurrencySelector />
            <LanguageSelector />
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 p-2 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
              aria-label="Cambiar tema"
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <Link
              to="/auth/login"
              className="hidden sm:inline-block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-cyan-400 whitespace-nowrap px-2 py-1 transition-colors"
            >
              {pt.navLogin}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-[0.86fr_1.14fr] gap-8 lg:gap-12 items-start">
          <section className="text-slate-900 dark:text-white lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-cyan-400/30 bg-blue-50 dark:bg-cyan-400/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-blue-700 dark:text-cyan-300">
              <Store className="w-4 h-4" /> {pt.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] mt-5">{pt.heroTitle}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed mt-5 max-w-xl">{pt.heroDesc}</p>
            <div className="mt-8 space-y-4">
              {[
                { icon: MapPin, title: pt.feat1Title, text: pt.feat1Desc },
                { icon: ShieldCheck, title: pt.feat2Title, text: pt.feat2Desc },
                { icon: CheckCircle2, title: pt.feat3Title, text: pt.feat3Desc },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-4 shadow-sm dark:shadow-none">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 dark:bg-cyan-400/10 text-blue-600 dark:text-cyan-300 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                  <div><p className="font-black text-slate-900 dark:text-white">{title}</p><p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{text}</p></div>
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2rem] shadow-xl dark:shadow-black/30 p-5 sm:p-8 space-y-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">{pt.formBadge}</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{pt.formTitle}</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{pt.formSubtitle}</p>
              </div>
              <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 items-center justify-center"><Building2 className="w-5 h-5" /></div>
            </div>

            {executive && (
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 p-4 flex items-center gap-3.5 shadow-sm">
                {executive.avatar_url ? (
                  <img
                    src={executive.avatar_url}
                    alt={executive.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                    {executive.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">Ejecutivo de Cuenta Asignado</span>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">Asesoría directa</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{executive.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Te acompañará en la verificación de tu local, tarifas y dudas operativas.</p>
                </div>
              </div>
            )}

            {error && <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-semibold text-red-700 dark:text-red-300 flex gap-3"><XCircle className="w-5 h-5 shrink-0" />{error}</div>}
            {notice && <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex gap-3"><CheckCircle2 className="w-5 h-5 shrink-0" />{notice}</div>}

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block sm:col-span-2">
                <span className="label-dynamic">{pt.businessName}</span>
                <input required value={form.businessName} onChange={(e) => update('businessName', e.target.value)} className="input-dynamic" placeholder={pt.businessPlaceholder} />
              </label>
              <label className="block">
                <span className="label-dynamic">{pt.contactName}</span>
                <span className="relative block">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input required value={form.contactName} onChange={(e) => update('contactName', e.target.value)} className="input-dynamic pl-10" placeholder={pt.contactPlaceholder} />
                </span>
              </label>
              <label className="block">
                <span className="label-dynamic">{pt.phone}</span>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-dynamic" placeholder={pt.phonePlaceholder} />
              </label>
              <label className="block">
                <span className="label-dynamic">{pt.email}</span>
                <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-dynamic" placeholder={pt.emailPlaceholder} />
              </label>
              <label className="block">
                <span className="label-dynamic">{pt.password}</span>
                <input required minLength={10} type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="input-dynamic" placeholder={pt.passwordPlaceholder} />
              </label>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">{pt.locationSection}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pt.locationSubtitle}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="label-dynamic">{pt.country}</span>
                  <CountrySelect value={form.country} onChange={(code) => updateCountry(code)} lang={langKey} />
                </label>
                <label className="block">
                  <span className="label-dynamic">{pt.currency}</span>
                  <select required value={form.currency} onChange={(e) => update('currency', e.target.value)} className="input-dynamic">
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                    <option value="DOP">DOP — Peso dominicano (RD$)</option>
                  </select>
                </label>
              </div>
              <div>
                <span className="label-dynamic">{pt.mapsAddress}</span>
                <AddressAutocomplete
                  value={form.addressLine1}
                  civicNumber={form.civicNumber}
                  onChange={(value) => setForm((current) => ({ ...current, addressLine1: value, formattedAddress: '', googlePlaceId: '', latitude: null, longitude: null }))}
                  onCivicNumberChange={(value) => update('civicNumber', value)}
                  onSelectAddress={(parts) => setForm((current) => ({
                    ...current,
                    addressLine1: parts.addressLine1,
                    civicNumber: parts.civicNumber,
                    city: parts.city,
                    postalCode: parts.zipCode,
                    country: parts.country || current.country,
                    formattedAddress: parts.formattedAddress,
                    googlePlaceId: parts.googlePlaceId,
                    latitude: parts.latitude,
                    longitude: parts.longitude
                  }))}
                  countryCode={form.country}
                  required
                  placeholder={pt.mapsPlaceholder}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block">
                  <span className="label-dynamic">{pt.city}</span>
                  <input required value={form.city} onChange={(e) => update('city', e.target.value)} className="input-dynamic" placeholder={pt.cityPlaceholder} />
                </label>
                <label className="block">
                  <span className="label-dynamic">{pt.province}</span>
                  <input value={form.province} onChange={(e) => update('province', e.target.value)} className="input-dynamic" placeholder={pt.provincePlaceholder} />
                </label>
                <label className="block">
                  <span className="label-dynamic">{pt.postalCode}</span>
                  <input value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="input-dynamic" placeholder={pt.postalPlaceholder} />
                </label>
              </div>
              {locationSelected && (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
                  <p className="font-black flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {pt.locationConfirmed}</p>
                  <p className="font-mono text-xs mt-1">{Number(form.latitude).toFixed(7)}, {Number(form.longitude).toFixed(7)}</p>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
              <MapPreview latitude={form.latitude} longitude={form.longitude} pt={pt} />
              <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">{pt.normalizedAddress}</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-2 leading-relaxed">{form.formattedAddress || pt.selectLocationToConfirm}</p>
                </div>
                <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <p><span className="font-bold">Place ID:</span> {form.googlePlaceId ? `${form.googlePlaceId.slice(0, 18)}…` : 'pendiente'}</p>
                  <p><span className="font-bold">Estado:</span> {locationSelected ? pt.statusReady : pt.statusPending}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !locationSelected}
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-black py-4 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              {loading ? pt.btnSubmitting : pt.btnSubmit}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
            {!locationSelected && <p className="text-center text-xs font-semibold text-amber-700 dark:text-amber-300">{pt.selectAddressAlert}</p>}
            <div className="flex items-center justify-between text-sm pt-2">
              <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-bold">
                <ChevronLeft className="w-4 h-4" /> {pt.back}
              </Link>
              <span className="text-xs text-slate-400">{pt.manualReviewNote}</span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
