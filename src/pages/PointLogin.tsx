import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api, setAuthToken } from '../lib/api';
import { BrandMark } from '../lib/brand';
import {
  Building,
  Key,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  User,
  ArrowRight,
  Delete,
  RefreshCw,
  AlertCircle,
  MapPin,
  Laptop,
  CheckCircle2,
  Unlink,
  Settings,
  X,
  Package,
  FileText,
  HeartHandshake,
  Truck,
  Plane,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

interface LinkedBranch {
  id: string;
  businessName: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  phone: string;
  deviceName?: string;
  deviceToken: string;
  distanceKm?: number;
  ownerEmail?: string;
}

// Diccionario bilingüe para el Terminal de Mostrador
const DICT = {
  es: {
    badge: 'Logística Internacional USA ⇄ República Dominicana',
    heroTitle: 'Terminal de Mostrador & Sucursales',
    heroSubtitle: 'Envíos directos de documentos prioritarios, sobres urgentes y cajas de ayuda familiar con despacho aéreo y marítimo garantizado.',
    pilarDocs: 'Documentos & Sobres',
    pilarDocsDesc: 'Tarifa plana económica para pasaportes, poderes notariales y correspondencia rápida.',
    pilarBoxes: 'Cajas a Familiares en RD',
    pilarBoxesDesc: 'Alimentos, ropa, tecnología y medicina entregados en sucursal o directamente a domicilio.',
    pilarPOS: 'Terminal POS Verificada',
    pilarPOSDesc: 'Auditoría de presencia física GPS, apertura de caja chica y recibos térmicos 80mm/58mm.',
    pilarTrack: 'Rastreo Integral en Vivo',
    pilarTrackDesc: 'Notificaciones por correo y comprobante digital inmediato para remitente y destinatario.',
    bannerFooter: 'Conectando la diáspora con sus familias',
    tabTerminal: 'Terminal Mostrador',
    tabMaster: 'Acceso Dueño',
    linkTitle: 'Vincular esta PC a tu Sucursal',
    linkDesc: 'Autoriza este equipo como terminal oficial mediante el correo del dueño, ubicación física y clave maestra.',
    ownerEmail: '1. Correo Electrónico del Dueño *',
    locationTitle: '2. Ubicación Física de la PC (GPS) *',
    locationPres: 'Presencia Física en el Local',
    detectLocation: 'Detectar Ubicación',
    updateLocation: 'Actualizar GPS',
    detectingLoc: 'Detectando…',
    locationHint: 'Haz clic en "Detectar Ubicación" para comprobar que esta terminal opera dentro del local.',
    ownerPin: '3. PIN o Contraseña Maestra del Dueño *',
    termName: '4. Nombre de esta Terminal (Opcional)',
    btnLink: 'Vincular y Guardar esta PC',
    linking: 'Vinculando y autorizando…',
    linkedTerminal: 'Terminal Autorizada',
    whoAttends: '1. ¿Quién atiende el mostrador? *',
    typePin: '2. Digita tu PIN de 4 dígitos',
    btnEnter: 'Entrar a Mostrador POS',
    verifyingPin: 'Verificando PIN de Cajero…',
    masterEmail: 'Correo del Administrador *',
    masterPass: 'Contraseña Maestra *',
    masterNoticeTitle: '👑 Acceso de Administrador / Dueño',
    masterNoticeDesc: 'Permite ver ganancias, balances de comisiones (15%), retiros bancarios y configuración de empleados.',
    btnMaster: 'Iniciar Sesión como Administrador',
    unlinkTitle: '¿Desvincular esta PC?',
    unlinkDesc: 'Esta computadora dejará de reconocer esta sucursal. Se requerirá vincular nuevamente.',
    unlinkPass: 'PIN o Contraseña del Dueño para Autorizar',
    btnCancel: 'Cancelar',
    btnUnlink: 'Desvincular',
    returnHome: 'Volver a Ship24GO →',
    verifyingDevice: 'Verificando autorización de esta PC…'
  },
  en: {
    badge: 'International Logistics USA ⇄ Dominican Republic',
    heroTitle: 'Counter POS Terminal & Branches',
    heroSubtitle: 'Direct shipping of priority documents, urgent envelopes, and family care packages with guaranteed air and ocean freight.',
    pilarDocs: 'Documents & Envelopes',
    pilarDocsDesc: 'Affordable flat rates for passports, legal powers of attorney, and express mail.',
    pilarBoxes: 'Family Boxes to DR',
    pilarBoxesDesc: 'Food, apparel, electronics, and medicines delivered to branches or directly to doorsteps.',
    pilarPOS: 'Verified POS Terminal',
    pilarPOSDesc: 'Physical GPS presence auditing, cash drawer opening, and 80mm/58mm thermal receipts.',
    pilarTrack: 'Real-Time Tracking',
    pilarTrackDesc: 'Instant email receipts and digital proof of shipment for sender and recipient.',
    bannerFooter: 'Connecting families with guaranteed care packages',
    tabTerminal: 'Counter Terminal',
    tabMaster: 'Owner Access',
    linkTitle: 'Link this PC to your Branch',
    linkDesc: 'Authorize this computer as an official terminal using the owner email, physical GPS location, and master PIN.',
    ownerEmail: '1. Branch Owner Email *',
    locationTitle: '2. PC Physical Location (GPS) *',
    locationPres: 'Physical Presence at Branch',
    detectLocation: 'Detect Location',
    updateLocation: 'Update GPS',
    detectingLoc: 'Detecting…',
    locationHint: 'Click "Detect Location" to verify this terminal is operating inside the branch.',
    ownerPin: '3. Owner PIN or Master Password *',
    termName: '4. Terminal Name (Optional)',
    btnLink: 'Link & Save this PC',
    linking: 'Linking and authorizing…',
    linkedTerminal: 'Authorized Terminal',
    whoAttends: '1. Who is at the counter? *',
    typePin: '2. Enter your 4-digit PIN',
    btnEnter: 'Enter POS Counter',
    verifyingPin: 'Verifying Cashier PIN…',
    masterEmail: 'Administrator Email *',
    masterPass: 'Master Password *',
    masterNoticeTitle: '👑 Branch Owner / Admin Access',
    masterNoticeDesc: 'Access profit margins, 15% commission ledger, bank payouts, and employee roster.',
    btnMaster: 'Log in as Administrator',
    unlinkTitle: 'Unlink this PC?',
    unlinkDesc: 'This computer will no longer recognize this branch. You will need to link it again.',
    unlinkPass: 'Owner PIN or Password to Authorize',
    btnCancel: 'Cancel',
    btnUnlink: 'Unlink',
    returnHome: 'Return to Ship24GO →',
    verifyingDevice: 'Verifying terminal authorization…'
  }
};

export default function PointLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'terminal' | 'master'>(
    searchParams.get('mode') === 'master' ? 'master' : 'terminal'
  );

  // Selector de idioma (Español / English)
  const [locale, setLocale] = useState<'es' | 'en'>(() => {
    return (localStorage.getItem('point_locale') as 'es' | 'en') || 'es';
  });

  const toggleLocale = () => {
    const next = locale === 'es' ? 'en' : 'es';
    setLocale(next);
    localStorage.setItem('point_locale', next);
  };

  const t = DICT[locale];

  // Selector de tema (Por defecto CLARO)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('point_login_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('point_login_theme', next);
  };

  // ==========================================
  // ESTADO DEL DISPOSITIVO VINCULADO
  // ==========================================
  const [checkingDevice, setCheckingDevice] = useState(true);
  const [linkedBranch, setLinkedBranch] = useState<LinkedBranch | null>(null);

  // Estados del Formulario de Vinculación
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPinOrPass, setOwnerPinOrPass] = useState('');
  const [deviceName, setDeviceName] = useState('PC Mostrador Principal');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [geoStatusText, setGeoStatusText] = useState<string>('');
  const [linkingDevice, setLinkingDevice] = useState(false);

  // Estados del Mostrador de Empleados (Dispositivo Vinculado)
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [submittingPin, setSubmittingPin] = useState(false);

  // Modal de desvinculación
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [unlinkPass, setUnlinkPass] = useState('');
  const [unlinking, setUnlinking] = useState(false);

  // Estados login maestro
  const [masterEmail, setMasterEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [submittingMaster, setSubmittingMaster] = useState(false);

  // Feedback y mensajes
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Al montar el componente: Verificar si esta PC ya está vinculada a una sucursal
  useEffect(() => {
    async function checkExistingBinding() {
      setCheckingDevice(true);
      try {
        const savedBindingStr = localStorage.getItem('point_linked_device');
        if (!savedBindingStr) {
          setCheckingDevice(false);
          return;
        }

        const savedBinding = JSON.parse(savedBindingStr);
        if (!savedBinding.deviceToken) {
          localStorage.removeItem('point_linked_device');
          setCheckingDevice(false);
          return;
        }

        // Validar token contra el backend
        const res = await (api as any).verifyPointDevice({
          deviceToken: savedBinding.deviceToken,
          pointId: savedBinding.id
        });

        if (res.valid && res.branch) {
          const verifiedBranch: LinkedBranch = {
            id: res.branch.id,
            businessName: res.branch.businessName,
            address: res.branch.address,
            city: res.branch.city,
            country: res.branch.country,
            currency: res.branch.currency || 'USD',
            phone: res.branch.phone,
            deviceName: res.branch.deviceName || savedBinding.deviceName,
            deviceToken: savedBinding.deviceToken,
            distanceKm: res.branch.distanceKm,
            ownerEmail: res.branch.ownerEmail || savedBinding.ownerEmail
          };
          setLinkedBranch(verifiedBranch);
          setEmployees(res.employees || []);
          if (res.employees && res.employees.length > 0) {
            setSelectedEmployeeId(res.employees[0].id);
          }
        } else {
          localStorage.removeItem('point_linked_device');
          setLinkedBranch(null);
        }
      } catch (err: any) {
        const savedBindingStr = localStorage.getItem('point_linked_device');
        if (savedBindingStr) {
          try {
            const saved = JSON.parse(savedBindingStr);
            setLinkedBranch(saved);
            const empRes = await (api as any).getPointBranchPublicEmployees(saved.id);
            if (empRes.employees) {
              setEmployees(empRes.employees);
              if (empRes.employees.length > 0) setSelectedEmployeeId(empRes.employees[0].id);
            }
          } catch {}
        }
      } finally {
        setCheckingDevice(false);
      }
    }

    checkExistingBinding();
  }, []);

  // 2. Capturar Ubicación GPS de la PC / Navegador
  const handleDetectLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setGeoStatusText(locale === 'en' ? 'Geolocation not supported. IP will be used.' : 'Tu navegador no soporta geolocalización. Se usará la IP del equipo.');
      return;
    }

    setGettingLocation(true);
    setGeoStatusText(locale === 'en' ? 'Detecting GPS coordinates...' : 'Detectando coordenadas GPS del equipo...');

    navigator.geolocation.getCurrentPosition(
      pos => {
        setGeoCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setGeoStatusText(`${locale === 'en' ? 'Location verified' : 'Ubicación confirmada'}: ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`);
        setGettingLocation(false);
      },
      err => {
        console.warn('Geolocation denied or error:', err);
        setGeoStatusText(locale === 'en' ? 'Permission skipped. Device IP recorded.' : 'Permiso omitido. Se registrará la IP del equipo.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 3. Vincular Dispositivo / PC
  const handleLinkDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerEmail || !ownerPinOrPass) {
      setError(locale === 'en' ? 'Please enter owner email and master authorization PIN/password.' : 'Por favor introduce el correo del dueño y su PIN o contraseña de autorización.');
      return;
    }

    setError('');
    setLinkingDevice(true);
    try {
      const res = await (api as any).linkPointDevice({
        ownerEmail: ownerEmail.trim(),
        pinOrPassword: ownerPinOrPass.trim(),
        latitude: geoCoords?.lat,
        longitude: geoCoords?.lng,
        deviceName: deviceName.trim() || 'PC Mostrador Principal',
        browserInfo: navigator.userAgent
      });

      if (!res.success || !res.deviceToken) {
        throw new Error(res.error || (locale === 'en' ? 'Could not link device.' : 'No se pudo vincular el dispositivo.'));
      }

      const newBinding: LinkedBranch = {
        id: res.branch.id,
        businessName: res.branch.businessName,
        address: res.branch.address,
        city: res.branch.city,
        country: res.branch.country,
        currency: res.branch.currency || 'USD',
        phone: res.branch.phone,
        deviceName: res.deviceName,
        deviceToken: res.deviceToken,
        distanceKm: res.distanceKm,
        ownerEmail: res.branch.ownerEmail
      };

      localStorage.setItem('point_linked_device', JSON.stringify(newBinding));
      setLinkedBranch(newBinding);

      const empRes = await (api as any).getPointBranchPublicEmployees(newBinding.id);
      const empList = empRes.employees || [];
      setEmployees(empList);
      if (empList.length > 0) {
        setSelectedEmployeeId(empList[0].id);
      }

      setSuccessMessage(locale === 'en' ? `Terminal linked to ${res.branch.businessName}!` : `¡Terminal vinculada exitosamente con ${res.branch.businessName}!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || (locale === 'en' ? 'Invalid credentials or location.' : 'Credenciales de dueño o ubicación inválidas.'));
    } finally {
      setLinkingDevice(false);
    }
  };

  // 4. Desvincular PC
  const handleUnlinkDevice = async () => {
    if (!linkedBranch) return;
    setError('');
    setUnlinking(true);
    try {
      await (api as any).unlinkPointDevice({
        deviceToken: linkedBranch.deviceToken,
        pinOrPassword: unlinkPass
      });

      localStorage.removeItem('point_linked_device');
      setLinkedBranch(null);
      setEmployees([]);
      setSelectedEmployeeId('');
      setPinCode('');
      setShowUnlinkModal(false);
      setUnlinkPass('');
      setSuccessMessage(locale === 'en' ? 'Device unlinked from branch.' : 'Esta PC ha sido desvinculada de la sucursal.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.message || (locale === 'en' ? 'Could not unlink device.' : 'No se pudo desvincular el dispositivo.'));
    } finally {
      setUnlinking(false);
    }
  };

  // 5. Manejar click en el keypad numérico
  const handleKeypadPress = (digit: string) => {
    setError('');
    if (pinCode.length < 4) {
      setPinCode(prev => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    setError('');
    setPinCode(prev => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setError('');
    setPinCode('');
  };

  // Soporte para teclado físico
  useEffect(() => {
    if (activeTab !== 'terminal' || !linkedBranch) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showUnlinkModal) return;
      if (/^[0-9]$/.test(e.key)) {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadBackspace();
      } else if (e.key === 'Escape') {
        handleKeypadClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handlePinLogin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, linkedBranch, pinCode, selectedEmployeeId, showUnlinkModal]);

  // 6. Iniciar Sesión de Empleado con PIN
  const handlePinLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkedBranch) {
      setError(locale === 'en' ? 'You must link this PC first.' : 'Debes vincular primero esta PC a tu sucursal.');
      return;
    }
    if (!selectedEmployeeId) {
      setError(locale === 'en' ? 'Select cashier name.' : 'Por favor selecciona tu nombre de cajero.');
      return;
    }
    if (!pinCode || pinCode.length !== 4) {
      setError(locale === 'en' ? 'Enter your 4-digit PIN.' : 'Digita tu PIN numérico de 4 dígitos.');
      return;
    }

    setError('');
    setSubmittingPin(true);
    try {
      const res = await (api as any).loginPointEmployee({
        pointId: linkedBranch.id,
        employeeId: selectedEmployeeId,
        pinCode,
        deviceToken: linkedBranch.deviceToken
      });

      if (res.token) {
        setAuthToken(res.token);
        localStorage.setItem('point_current_employee', JSON.stringify(res.employee));
        localStorage.setItem('point_view_mode', 'cashier');
        
        // Flujo automático: si no tiene turno abierto, marcar para apertura automática
        if (!res.hasActiveShift) {
          localStorage.setItem('point_auto_open_shift', 'true');
        } else {
          localStorage.removeItem('point_auto_open_shift');
        }

        navigate('/point?tab=pos');
      } else {
        throw new Error(locale === 'en' ? 'No authentication token received.' : 'No se recibió token de autenticación.');
      }
    } catch (err: any) {
      setError(err.message || (locale === 'en' ? 'Incorrect PIN. Verify your 4 digits.' : 'PIN incorrecto. Verifica tus 4 dígitos.'));
      setPinCode('');
    } finally {
      setSubmittingPin(false);
    }
  };

  // 7. Login Maestro Dueño
  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterEmail || !masterPassword) {
      setError(locale === 'en' ? 'Enter email and password.' : 'Ingresa tu correo y contraseña.');
      return;
    }

    setError('');
    setSubmittingMaster(true);
    try {
      const res = await api.login({ email: masterEmail, password: masterPassword });
      if (res.token) {
        setAuthToken(res.token);
        localStorage.removeItem('point_current_employee');
        localStorage.setItem('point_view_mode', 'owner');
        navigate('/point');
      } else {
        throw new Error(locale === 'en' ? 'Invalid credentials.' : 'Credenciales inválidas.');
      }
    } catch (err: any) {
      setError(err.message || (locale === 'en' ? 'Master credentials incorrect.' : 'Credenciales maestras incorrectas.'));
    } finally {
      setSubmittingMaster(false);
    }
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200 ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Header Superior Corporativo con Marca Personalizada de Sucursal */}
      <header className={`px-6 py-3.5 border-b transition-colors z-20 ${
        isLight ? 'bg-white/95 border-slate-200 shadow-xs backdrop-blur-md' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo oficial y Nombre Personalizado: "[Nombre Sucursal] by ship24go.com" */}
          <Link to="/" className="flex items-center gap-3">
            <BrandMark showText={false} iconClassName="w-10 h-10 rounded-xl shadow-xs" />
            <div className="flex flex-col text-left leading-tight">
              <span className={`text-sm sm:text-base font-black tracking-tight truncate max-w-[200px] sm:max-w-[320px] ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {linkedBranch?.businessName || 'Point & Branch POS'}
              </span>
              <span className="text-[10px] font-extrabold tracking-wider text-blue-600 dark:text-cyan-400 lowercase">
                by ship24go.com
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Conmutador Bilingüe ES / EN */}
            <button
              type="button"
              onClick={toggleLocale}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Cambiar idioma / Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>{locale === 'es' ? '🇺🇸 English' : '🇪🇸 Español'}</span>
            </button>

            {/* Botón de cambio de tema Claro / Oscuro */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <Link
              to="/"
              className={`text-xs font-bold transition-colors hidden sm:inline ${
                isLight ? 'text-slate-600 hover:text-blue-600' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.returnHome}
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal con Banner Logístico Dividido (Split Layout) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center z-10 my-auto">
        <div className={`w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border transition-all ${
          isLight 
            ? 'bg-white border-slate-200/90 shadow-2xl shadow-slate-300/60' 
            : 'bg-slate-900/95 border-slate-800 shadow-2xl shadow-black/80'
        }`}>
          
          {/* ========================================================
             BANNER IZQUIERDO: LOGÍSTICA SERIA, DOCUMENTOS Y CAJAS A FAMILIAS
             ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-7 relative flex flex-col justify-between p-8 sm:p-12 overflow-hidden text-white bg-slate-900 min-h-[420px] lg:min-h-[660px]">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80')`
              }}
            />
            <div className="absolute inset-0 bg-linear-to-tr from-slate-950/95 via-blue-950/85 to-indigo-900/75 backdrop-blur-[1.5px]" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-black tracking-wide uppercase shadow-sm">
                <Plane className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.badge}</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
                  {linkedBranch?.businessName || t.heroTitle}
                </h1>
                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-xl">
                  {t.heroSubtitle}
                </p>
              </div>

              {/* 4 Pilares Logísticos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                    <FileText className="w-4 h-4 text-cyan-300 shrink-0" />
                    <span>{t.pilarDocs}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    {t.pilarDocsDesc}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <Package className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>{t.pilarBoxes}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    {t.pilarBoxesDesc}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>{t.pilarPOS}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    {t.pilarPOSDesc}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <Truck className="w-4 h-4 text-indigo-300 shrink-0" />
                    <span>{t.pilarTrack}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    {t.pilarTrackDesc}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold">{t.bannerFooter}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">by ship24go.com</span>
            </div>
          </div>

          {/* ========================================================
             COLUMNA DERECHA: FORMULARIO EN MODO CLARO CORPORATIVO
             ======================================================== */}
          <div className={`lg:col-span-6 xl:col-span-5 p-6 sm:p-10 flex flex-col justify-center transition-colors ${
            isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'
          }`}>
            
            {/* Pestañas de Navegación */}
            <div className={`flex rounded-2xl p-1.5 border mb-6 transition-colors ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('terminal');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'terminal'
                    ? isLight
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>{t.tabTerminal}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('master');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'master'
                    ? isLight
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.tabMaster}</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{error}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{successMessage}</div>
              </div>
            )}

            {checkingDevice ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t.verifyingDevice}
                </p>
              </div>
            ) : activeTab === 'terminal' ? (
              /* ========================================================
                 SUB-TAB 1: TERMINAL MOSTRADOR POS
                 ======================================================== */
              linkedBranch ? (
                /* CASO A: TERMINAL VINCULADA ("RECONOCE LA SUCURSAL") */
                <div className="space-y-5">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                    isLight 
                      ? 'bg-emerald-50/80 border-emerald-200 shadow-xs' 
                      : 'bg-emerald-500/10 border-emerald-500/25'
                  }`}>
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isLight ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className={`text-[10px] font-black uppercase tracking-wider ${
                            isLight ? 'text-emerald-800' : 'text-emerald-400'
                          }`}>
                            {linkedBranch.deviceName || t.linkedTerminal}
                          </span>
                        </div>
                        <h2 className={`text-sm font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {linkedBranch.businessName}
                        </h2>
                        <p className={`text-xs truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          📍 {linkedBranch.address}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowUnlinkModal(true)}
                      className={`p-2.5 rounded-xl border transition-all shrink-0 ml-2 cursor-pointer ${
                        isLight 
                          ? 'bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200 shadow-2xs' 
                          : 'bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border-slate-800'
                      }`}
                      title="Desvincular esta PC"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {t.whoAttends}
                    </label>
                    <div className="relative">
                      <User className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                      <select
                        value={selectedEmployeeId}
                        onChange={e => setSelectedEmployeeId(e.target.value)}
                        className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition-colors ${
                          isLight
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600'
                            : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                        }`}
                      >
                        {employees.length === 0 && (
                          <option value="">No hay empleados registrados</option>
                        )}
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.role === 'manager' ? 'Supervisor' : 'Cajero'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <label className={`block text-xs font-bold mb-2.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                      {t.typePin}
                    </label>
                    <div className="flex justify-center gap-3 mb-2">
                      {[0, 1, 2, 3].map(i => {
                        const filled = pinCode.length > i;
                        return (
                          <div
                            key={i}
                            className={`w-12 h-14 rounded-2xl border flex items-center justify-center font-mono text-2xl font-black transition-all ${
                              filled
                                ? isLight
                                  ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                                  : 'bg-blue-600/20 border-blue-500 text-cyan-300 shadow-xs'
                                : isLight
                                  ? 'bg-slate-50 border-slate-300 text-slate-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-700'
                            }`}
                          >
                            {filled ? '•' : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 max-w-[270px] mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleKeypadPress(num)}
                        className={`h-12 rounded-2xl font-mono text-lg font-black transition-all border flex items-center justify-center cursor-pointer active:scale-95 ${
                          isLight
                            ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs hover:border-slate-300'
                            : 'bg-slate-800/70 hover:bg-slate-700 text-white border-slate-700/60'
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      className={`h-12 rounded-2xl text-xs font-black transition-all border flex items-center justify-center cursor-pointer active:scale-95 ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                          : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                      title="Borrar todo"
                    >
                      C
                    </button>

                    <button
                      type="button"
                      onClick={() => handleKeypadPress('0')}
                      className={`h-12 rounded-2xl font-mono text-lg font-black transition-all border flex items-center justify-center cursor-pointer active:scale-95 ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs hover:border-slate-300'
                          : 'bg-slate-800/70 hover:bg-slate-700 text-white border-slate-700/60'
                      }`}
                    >
                      0
                    </button>

                    <button
                      type="button"
                      onClick={handleKeypadBackspace}
                      className={`h-12 rounded-2xl transition-all border flex items-center justify-center cursor-pointer active:scale-95 ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                          : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                      title="Retroceso"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePinLogin()}
                    disabled={submittingPin || pinCode.length < 4}
                    className="w-full mt-3 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 active:scale-[0.99]"
                  >
                    {submittingPin ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.verifyingPin}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.btnEnter}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* CASO B: PC NO VINCULADA -> FORMULARIO DE VINCULACIÓN */
                <form onSubmit={handleLinkDevice} className="space-y-4">
                  <div className="text-center pb-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 ${
                      isLight ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      <Laptop className="w-6 h-6" />
                    </div>
                    <h2 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {t.linkTitle}
                    </h2>
                    <p className={`text-xs max-w-xs mx-auto mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t.linkDesc}
                    </p>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {t.ownerEmail}
                    </label>
                    <div className="relative">
                      <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input
                        type="email"
                        required
                        placeholder="dueño@sucursal.com"
                        value={ownerEmail}
                        onChange={e => setOwnerEmail(e.target.value)}
                        className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition-colors ${
                          isLight
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600'
                            : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {t.locationTitle}
                    </label>
                    <div className={`p-3 rounded-xl border space-y-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          <MapPin className="w-4 h-4 text-cyan-600" />
                          <span>{t.locationPres}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={gettingLocation}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-[11px] font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {gettingLocation ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>{t.detectingLoc}</span>
                            </>
                          ) : geoCoords ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                              <span>{t.updateLocation}</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3 h-3" />
                              <span>{t.detectLocation}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {geoStatusText ? (
                        <p className={`text-[11px] font-mono font-medium ${geoCoords ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {geoStatusText}
                        </p>
                      ) : (
                        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                          {t.locationHint}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {t.ownerPin}
                    </label>
                    <div className="relative">
                      <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input
                        type="password"
                        required
                        placeholder="Contraseña o PIN maestro"
                        value={ownerPinOrPass}
                        onChange={e => setOwnerPinOrPass(e.target.value)}
                        className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition-colors ${
                          isLight
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600'
                            : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {t.termName}
                    </label>
                    <div className="relative">
                      <Laptop className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input
                        type="text"
                        placeholder="Ej: Caja Mostrador 1 / PC Recepción"
                        value={deviceName}
                        onChange={e => setDeviceName(e.target.value)}
                        className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition-colors ${
                          isLight
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600'
                            : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={linkingDevice}
                    className="w-full py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
                  >
                    {linkingDevice ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.linking}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.btnLink}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )
            ) : (
              /* ========================================================
                 SUB-TAB 2: LOGIN MAESTRO DUEÑO DEL BRANCH
                 ======================================================== */
              <form onSubmit={handleMasterLogin} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {t.masterEmail}
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="email"
                      required
                      placeholder="dueño@branch.com"
                      value={masterEmail}
                      onChange={e => setMasterEmail(e.target.value)}
                      className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition-colors ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600'
                          : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {t.masterPass}
                  </label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={masterPassword}
                      onChange={e => setMasterPassword(e.target.value)}
                      className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition-colors ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600'
                          : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {t.masterNoticeTitle}
                  </p>
                  <p>{t.masterNoticeDesc}</p>
                </div>

                <button
                  type="submit"
                  disabled={submittingMaster}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  {submittingMaster ? 'Verificando…' : t.btnMaster}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Modal para Desvincular Dispositivo */}
      {showUnlinkModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <button
              type="button"
              onClick={() => setShowUnlinkModal(false)}
              className={`absolute top-4 right-4 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-white'}`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <Unlink className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black">{t.unlinkTitle}</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {t.unlinkDesc}
              </p>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {t.unlinkPass}
              </label>
              <input
                type="password"
                placeholder="Digita tu clave maestra"
                value={unlinkPass}
                onChange={e => setUnlinkPass(e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-500' 
                    : 'bg-slate-950 border-slate-800 text-white focus:border-rose-500'
                }`}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnlinkModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {t.btnCancel}
              </button>
              <button
                type="button"
                onClick={handleUnlinkDevice}
                disabled={unlinking}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {unlinking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                <span>{t.btnUnlink}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer con Marca Personalizada */}
      <footer className={`p-4 text-center text-xs border-t transition-colors z-10 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2 ${
        isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-900 text-slate-500'
      }`}>
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {linkedBranch?.businessName || 'Ship24GO Point'}
          </span>
          <span className="text-blue-600 dark:text-cyan-400 font-extrabold ml-1.5">
            by ship24go.com
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link to="/point/roadmap" className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
            <span>🗺️ Roadmap &amp; Rentabilidad</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <p className="text-[11px]">
            © {new Date().getFullYear()} · Terminal Oficial
          </p>
        </div>
      </footer>
    </div>
  );
}
