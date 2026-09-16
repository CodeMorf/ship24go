import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  Building,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Coins,
  Copy,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Globe,
  Home,
  Info,
  Key,
  Landmark,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Moon,
  Package,
  PackageCheck,
  PackagePlus,
  Plus,
  PlusCircle,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Store,
  Sun,
  Trash2,
  TrendingUp,
  Truck,
  Unlock,
  User,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Wallet,
  X,
  XCircle
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, getAuthToken, removeAuthToken } from '../lib/api';
import { CountrySelect } from '../components/CountrySelect';
import { BrandMark } from '../lib/brand';
import { useTheme } from '../lib/theme';
import { useCurrency } from '../lib/currency';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente de revisión',
  approved: 'Aprobado',
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
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// Tarifas y Tamaños oficiales para Corredor USA -> RD
const PACKAGES_US_TO_DO = [
  {
    id: 'document',
    name: 'Sobre / Documento',
    sub: 'Hasta 1.1 lb (0.5 kg)',
    icon: '✉️',
    branchPrice: 15.00,
    homePrice: 18.00,
    branchCommission: 2.25,
    homeCommission: 2.70,
    branchTariffId: 'trf_us_do_doc_branch',
    homeTariffId: 'trf_us_do_doc_home',
    weightKg: 0.5
  },
  {
    id: 'box_s',
    name: 'Caja Box S',
    sub: 'Hasta 4.4 lb (2.0 kg)',
    icon: '📦',
    branchPrice: 30.00,
    homePrice: 35.00,
    branchCommission: 4.50,
    homeCommission: 5.25,
    branchTariffId: 'trf_us_do_box_s_branch',
    homeTariffId: 'trf_us_do_box_s_home',
    weightKg: 2.0
  },
  {
    id: 'box_m',
    name: 'Caja Box M',
    sub: 'Hasta 11.0 lb (5.0 kg)',
    icon: '📦',
    branchPrice: 55.00,
    homePrice: 60.00,
    branchCommission: 8.25,
    homeCommission: 9.00,
    branchTariffId: 'trf_us_do_box_m_branch',
    homeTariffId: 'trf_us_do_box_m_home',
    weightKg: 5.0
  },
  {
    id: 'box_l',
    name: 'Caja Box L',
    sub: 'Hasta 22.0 lb (10.0 kg)',
    icon: '📦',
    branchPrice: 95.00,
    homePrice: 105.00,
    branchCommission: 14.25,
    homeCommission: 15.75,
    branchTariffId: 'trf_us_do_box_l_branch',
    homeTariffId: 'trf_us_do_box_l_home',
    weightKg: 10.0
  },
  {
    id: 'box_xl',
    name: 'Caja Box XL',
    sub: 'Hasta 33.0 lb (15.0 kg)',
    icon: '📦',
    branchPrice: 140.00,
    homePrice: 150.00,
    branchCommission: 21.00,
    homeCommission: 22.50,
    branchTariffId: 'trf_us_do_box_xl_branch',
    homeTariffId: 'trf_us_do_box_xl_home',
    weightKg: 15.0
  }
];

// Tarifas y Tamaños oficiales para Corredor RD -> USA (Exportación vía Miami Hub)
const PACKAGES_DO_TO_US = [
  {
    id: 'document',
    name: 'Sobre / Documento Express',
    sub: 'Hasta 1.1 lb (0.5 kg)',
    icon: '✉️',
    branchPrice: 20.00,
    homePrice: 25.00,
    branchCommission: 3.00,
    homeCommission: 3.75,
    branchTariffId: 'trf_do_us_doc_branch',
    homeTariffId: 'trf_do_us_doc_home',
    weightKg: 0.5
  },
  {
    id: 'box_s',
    name: 'Caja Pequeña Box S',
    sub: 'Hasta 4.4 lb (2.0 kg)',
    icon: '📦',
    branchPrice: 30.00,
    homePrice: 38.00,
    branchCommission: 4.50,
    homeCommission: 5.70,
    branchTariffId: 'trf_do_us_box_s_branch',
    homeTariffId: 'trf_do_us_box_s_home',
    weightKg: 2.0
  },
  {
    id: 'box_m',
    name: 'Caja Mediana Box M',
    sub: 'Hasta 11.0 lb (5.0 kg)',
    icon: '📦',
    branchPrice: 55.00,
    homePrice: 68.00,
    branchCommission: 8.25,
    homeCommission: 10.20,
    branchTariffId: 'trf_do_us_box_m_branch',
    homeTariffId: 'trf_do_us_box_m_home',
    weightKg: 5.0
  },
  {
    id: 'box_l',
    name: 'Caja Grande Box L',
    sub: 'Hasta 22.0 lb (10.0 kg)',
    icon: '📦',
    branchPrice: 95.00,
    homePrice: 115.00,
    branchCommission: 14.25,
    homeCommission: 17.25,
    branchTariffId: 'trf_do_us_box_l_branch',
    homeTariffId: 'trf_do_us_box_l_home',
    weightKg: 10.0
  },
  {
    id: 'box_xl',
    name: 'Caja Extra Grande Box XL',
    sub: 'Hasta 33.0 lb (15.0 kg)',
    icon: '📦',
    branchPrice: 140.00,
    homePrice: 165.00,
    branchCommission: 21.00,
    homeCommission: 24.75,
    branchTariffId: 'trf_do_us_box_xl_branch',
    homeTariffId: 'trf_do_us_box_xl_home',
    weightKg: 15.0
  }
];

const STANDARD_PACKAGES = PACKAGES_US_TO_DO;
const OLD_STANDARD_PACKAGES = [
  {
    id: 'document',
    name: 'Sobre / Documento',
    sub: 'Hasta 1.1 lb (0.5 kg)',
    icon: '✉️',
    branchPrice: 15.00,
    homePrice: 18.00,
    branchCommission: 2.25,
    homeCommission: 2.70,
    branchTariffId: 'trf_us_do_doc_branch',
    homeTariffId: 'trf_us_do_doc_home',
    weightKg: 0.5
  },
  {
    id: 'box_s',
    name: 'Caja Box S',
    sub: 'Hasta 4.4 lb (2.0 kg)',
    icon: '📦',
    branchPrice: 30.00,
    homePrice: 35.00,
    branchCommission: 4.50,
    homeCommission: 5.25,
    branchTariffId: 'trf_us_do_box_s_branch',
    homeTariffId: 'trf_us_do_box_s_home',
    weightKg: 2.0
  },
  {
    id: 'box_m',
    name: 'Caja Box M',
    sub: 'Hasta 11.0 lb (5.0 kg)',
    icon: '📦',
    branchPrice: 55.00,
    homePrice: 60.00,
    branchCommission: 8.25,
    homeCommission: 9.00,
    branchTariffId: 'trf_us_do_box_m_branch',
    homeTariffId: 'trf_us_do_box_m_home',
    weightKg: 5.0
  },
  {
    id: 'box_l',
    name: 'Caja Box L',
    sub: 'Hasta 22.0 lb (10.0 kg)',
    icon: '📦',
    branchPrice: 95.00,
    homePrice: 105.00,
    branchCommission: 14.25,
    homeCommission: 15.75,
    branchTariffId: 'trf_us_do_box_l_branch',
    homeTariffId: 'trf_us_do_box_l_home',
    weightKg: 10.0
  },
  {
    id: 'box_xl',
    name: 'Caja Box XL',
    sub: 'Hasta 33.0 lb (15.0 kg)',
    icon: '📦',
    branchPrice: 140.00,
    homePrice: 150.00,
    branchCommission: 21.00,
    homeCommission: 22.50,
    branchTariffId: 'trf_us_do_box_xl_branch',
    homeTariffId: 'trf_us_do_box_xl_home',
    weightKg: 15.0
  }
];

export default function PointPanel() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark, toggleTheme } = useTheme();

  // Navigation tab
  const currentTab = searchParams.get('tab') || 'pos';
  const setTab = (tab: string) => {
    setSearchParams({ tab });
    setIsMobileSidebarOpen(false);
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core data states
  const [point, setPoint] = useState<any>(null);
  const [operations, setOperations] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [systemBanks, setSystemBanks] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>({ totalEarned: 0, totalWithdrawn: 0, totalPending: 0, availableBalance: 0 });
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);

  // Lotes & Valijas states
  const [currentSaca, setCurrentSaca] = useState<any>(null);
  const [sacaShipments, setSacaShipments] = useState<any[]>([]);
  const [manifestsHistory, setManifestsHistory] = useState<any[]>([]);
  const [closingSaca, setClosingSaca] = useState(false);

  // Caja & Arqueo states
  const [cashSummary, setCashSummary] = useState<any>(null);
  const [cashMovements, setCashMovements] = useState<any[]>([]);

  // Caja & Arqueo states adicionales
  const [shiftsHistory, setShiftsHistory] = useState<any[]>([]);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [shiftSubmitting, setShiftSubmitting] = useState(false);
  const [openShiftForm, setOpenShiftForm] = useState({
    employeeId: '',
    pinCode: '',
    openingAmount: '50.00',
    notes: ''
  });
  const [closeShiftForm, setCloseShiftForm] = useState({
    employeeId: '',
    pinCode: '',
    countedCash: '',
    notes: ''
  });
  const [showOpenShiftPin, setShowOpenShiftPin] = useState(false);
  const [showCloseShiftPin, setShowCloseShiftPin] = useState(false);

  // Empleados states
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModalPin, setShowModalPin] = useState(false);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeSaving, setEmployeeSaving] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'cashier',
    status: 'active',
    pinCode: '',
    permissions: ['pos.create', 'cash.view']
  });

  // Hoja de Ruta del Broker
  const [showDispatchSheetModal, setShowDispatchSheetModal] = useState(false);
  const [dispatchSheetData, setDispatchSheetData] = useState<any>(null);
  const [loadingDispatchSheet, setLoadingDispatchSheet] = useState(false);

  const handleOpenDispatchSheet = async (manifestId: string) => {
    try {
      setLoadingDispatchSheet(true);
      const res = await fetch(`/api/point/manifests/${manifestId}/dispatch-sheet`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('spedire_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setDispatchSheetData(data);
        setShowDispatchSheetModal(true);
      } else {
        alert(data.error || 'No se pudo generar la hoja de ruta.');
      }
    } catch (e: any) {
      alert('Error al obtener la hoja de ruta.');
    } finally {
      setLoadingDispatchSheet(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Modo Vista & Sesión de Empleado (Privacidad de Márgenes)
  const [currentEmployee, setCurrentEmployee] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('point_current_employee');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [viewMode, setViewMode] = useState<'cashier' | 'owner'>(() => {
    const saved = localStorage.getItem('point_view_mode');
    if (saved === 'owner' || saved === 'cashier') return saved;
    const emp = localStorage.getItem('point_current_employee');
    return emp ? 'cashier' : 'owner';
  });

  // Filtros avanzados y paginación en Envíos & Tracking
  const [shipmentDateFilter, setShipmentDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [shipmentProductFilter, setShipmentProductFilter] = useState<string>('all');
  const [shipmentDeliveryFilter, setShipmentDeliveryFilter] = useState<'all' | 'branch' | 'home'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Idioma de la terminal y POS (Bilingüe ES / EN)
  const [panelLocale, setPanelLocale] = useState<'es' | 'en'>(() => {
    return (localStorage.getItem('point_locale') as 'es' | 'en') || 'es';
  });

  const togglePanelLocale = () => {
    const next = panelLocale === 'es' ? 'en' : 'es';
    setPanelLocale(next);
    localStorage.setItem('point_locale', next);
  };

  // Estados de Personalización de Marca de Sucursal (Co-Branding: [Branch Name] by ship24go.com)
  const [customBranchName, setCustomBranchName] = useState('');
  const [customBranchPhone, setCustomBranchPhone] = useState('');
  const [customBranchAddress, setCustomBranchAddress] = useState('');
  const [savingBranchSettings, setSavingBranchSettings] = useState(false);

  // Modales de Impresión Térmica y Envío por Correo
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printShipment, setPrintShipment] = useState<any>(null);
  const [printFormat, setPrintFormat] = useState<'thermal_80' | 'thermal_58' | 'courier_label'>('thermal_80');

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailShipment, setEmailShipment] = useState<any>(null);
  const [emailTarget, setEmailTarget] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Checkbox de envío automático en POS
  const [autoEmailReceipt, setAutoEmailReceipt] = useState(true);

  // Corredor de Envíos: DO_US (RD -> USA vía Miami) o US_DO (USA -> RD)
  const [corridor, setCorridor] = useState<'DO_US' | 'US_DO'>('DO_US');

  const activePackages = corridor === 'DO_US' ? PACKAGES_DO_TO_US : PACKAGES_US_TO_DO;

  // Tasa de cambio oficial y conversión en tiempo real
  const { rates } = useCurrency();
  const usdToDopRate = useMemo(() => {
    if (rates?.DOP && rates?.USD) {
      const calc = rates.DOP / rates.USD;
      if (calc > 40 && calc < 100) return Number(calc.toFixed(2));
    }
    return 60.50;
  }, [rates]);

  const convertToDop = (usd: number) => {
    return Math.round(Number(usd || 0) * usdToDopRate * 100) / 100;
  };

  const formatDop = (dop: number) => {
    return `RD$ ${Number(dop || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Moneda de cobro al cliente en mostrador (DOP o USD)
  const [collectCurrency, setCollectCurrency] = useState<'DOP' | 'USD'>('DOP');

  // Función inteligente de selección de modalidad con auto-completado de dirección
  const handleSelectDeliveryType = (type: 'branch' | 'home') => {
    setDeliveryType(type);
    if (corridor === 'DO_US') {
      if (type === 'branch') {
        setRecipient(prev => ({
          ...prev,
          address: '8200 NW 27th St, Suite 102 (Hub Miami Doral)',
          city: 'Doral',
          province: 'FL',
          zipCode: '33122'
        }));
      } else {
        if (recipient.address.includes('8200 NW 27th St')) {
          setRecipient(prev => ({
            ...prev,
            address: '',
            city: 'Miami',
            province: 'FL',
            zipCode: '33122'
          }));
        }
      }
    }
  };

  // Estados del Mostrador POS
  const [selectedPackageId, setSelectedPackageId] = useState('document');
  const [deliveryType, setDeliveryType] = useState<'branch' | 'home'>('branch');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [selectedSystemBankId, setSelectedSystemBankId] = useState('');
  const [bankPaymentRef, setBankPaymentRef] = useState('');

  // Datos Destinatario en RD
  const [recipient, setRecipient] = useState({
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    address: '',
    city: 'Santo Domingo',
    province: 'Distrito Nacional',
    country: 'DO',
    zipCode: '10101',
    notes: ''
  });

  // Modal de Recibo / Éxito
  const [receiptModal, setReceiptModal] = useState<any>(null);

  // Modal de Cuenta Bancaria
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankForm, setBankForm] = useState({
    id: '',
    bankName: 'Banreservas',
    accountHolder: '',
    accountNumber: '',
    accountType: 'Ahorros',
    routingNumber: '',
    documentId: '',
    currency: 'USD',
    notes: ''
  });

  // Modal de Retiro de Fondos
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutAccountId, setPayoutAccountId] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Filtro de envíos en pestaña Historial
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('all');

  // Estado del Chat con Ejecutivo
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Helper Copiar
  const [copiedKey, setCopiedKey] = useState('');
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // Cálculo en vivo de paquete seleccionado según el corredor activo
  const currentPackage = useMemo(() => {
    return activePackages.find(p => p.id === selectedPackageId) || activePackages[0];
  }, [selectedPackageId, activePackages]);

  const currentPrice = useMemo(() => {
    return deliveryType === 'home' ? currentPackage.homePrice : currentPackage.branchPrice;
  }, [currentPackage, deliveryType]);

  const currentCommission = useMemo(() => {
    return deliveryType === 'home' ? currentPackage.homeCommission : currentPackage.branchCommission;
  }, [currentPackage, deliveryType]);

  // Carga general de datos
  const loadData = async () => {
    if (!getAuthToken()) {
      navigate('/auth/login', { replace: true });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [
        pointRes,
        opsRes,
        bankRes,
        payoutsRes,
        sacaRes,
        manifestsRes,
        financeRes,
        empRes
      ] = await Promise.all([
        api.getPointMe(),
        api.getPointOperations(),
        (api as any).getPointBankAccounts().catch(() => ({ accounts: [], systemBanks: [], finance: {} })),
        (api as any).getPointPayoutRequests().catch(() => ({ requests: [] })),
        (api as any).getPointCurrentSaca().catch(() => ({ manifest: null, shipments: [] })),
        (api as any).getPointManifests().catch(() => ({ manifests: [] })),
        (api as any).getPointFinanceSummary().catch(() => ({ summary: null, movements: [] })),
        (api as any).getPointEmployees().catch(() => ({ employees: [] }))
      ]);

      setPoint(pointRes.point);
      setOperations(opsRes.operations || []);

      const accounts = bankRes.accounts || [];
      const sysBanks = bankRes.systemBanks || [];
      setBankAccounts(accounts);
      setSystemBanks(sysBanks);
      if (sysBanks.length > 0 && !selectedSystemBankId) {
        setSelectedSystemBankId(sysBanks[0].id);
      }
      if (accounts.length > 0 && !payoutAccountId) {
        setPayoutAccountId(accounts[0].id);
      }

      if (bankRes.finance) {
        setFinance(bankRes.finance);
      } else {
        const total = (opsRes.operations || []).reduce((acc: number, op: any) => acc + Number(op.commissionAmount || 0), 0);
        setFinance({ totalEarned: total, totalWithdrawn: 0, totalPending: 0, availableBalance: total });
      }

      setPayoutRequests(payoutsRes.requests || []);
      setCurrentSaca(sacaRes.manifest || null);
      setSacaShipments(sacaRes.shipments || []);
      setManifestsHistory(manifestsRes.manifests || []);
      setCashSummary(financeRes.summary || null);
      setCashMovements(financeRes.movements || []);
      const shifts = financeRes.shifts || [];
      setShiftsHistory(shifts);
      setEmployees(empRes.employees || []);

      if (pointRes.point) {
        setBankForm(prev => ({
          ...prev,
          accountHolder: prev.accountHolder || pointRes.point.contact_name || pointRes.point.business_name,
          currency: pointRes.point.currency || 'USD'
        }));
        setCustomBranchName(pointRes.point.business_name || '');
        setCustomBranchPhone(pointRes.point.phone || '');
        setCustomBranchAddress(pointRes.point.formatted_address || pointRes.point.address_line1 || '');

        // Auto-selección de corredor según país del Point
        if (pointRes.point.country === 'DO') {
          setCorridor('DO_US');
          setRecipient(prev => ({
            ...prev,
            country: 'US',
            city: prev.city === 'Santo Domingo' ? 'Miami' : prev.city,
            province: prev.province === 'Distrito Nacional' ? 'FL' : prev.province,
            zipCode: prev.zipCode === '10101' ? '33122' : prev.zipCode
          }));
        } else {
          setCorridor('US_DO');
        }

        // Limpieza automática de empleado si no pertenece al equipo de este Point
        const validEmployees = empRes.employees || [];
        const isCurrentEmpValid = validEmployees.some((e: any) => e.id === currentEmployee?.id);
        if (currentEmployee && !isCurrentEmpValid) {
          localStorage.removeItem('point_current_employee');
          setCurrentEmployee(null);
        }
      }

      // FLUJO AUTOMÁTICO DE APERTURA DE TURNO PARA EMPLEADOS
      const activeShift = shifts.find((s: any) => s.status === 'open');
      const autoOpenFlag = localStorage.getItem('point_auto_open_shift');
      const isCashierSession = Boolean(currentEmployee || localStorage.getItem('point_view_mode') === 'cashier');

      if (!activeShift && (autoOpenFlag === 'true' || isCashierSession)) {
        localStorage.removeItem('point_auto_open_shift');
        if (currentEmployee?.id) {
          setOpenShiftForm(prev => ({
            ...prev,
            employeeId: currentEmployee.id,
            openingAmount: '50.00',
            notes: 'Apertura automática de turno de mostrador'
          }));
        }
        setShowOpenShiftModal(true);
      }
    } catch (err: any) {
      if (String(err.message || '').includes('no tiene un Point')) {
        navigate('/point/register', { replace: true });
      } else {
        setError(err.message || 'No se pudo cargar la información del Point.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  // Crear Envío de Mostrador POS
  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.name || !recipient.phone || !recipient.address) {
      setError('Por favor completa el nombre, teléfono y dirección del destinatario.');
      return;
    }

    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      const tariffId = deliveryType === 'home' ? currentPackage.homeTariffId : currentPackage.branchTariffId;

      const payload = {
        tariffId,
        paymentMethod,
        paymentCurrency: collectCurrency,
        exchangeRate: usdToDopRate,
        paidAmountDop: convertToDop(currentPrice),
        paymentReference: paymentMethod === 'bank_transfer' ? bankPaymentRef : undefined,
        bankAccountId: paymentMethod === 'bank_transfer' ? selectedSystemBankId : undefined,
        sender: {
          name: point.contact_name,
          company: point.business_name,
          phone: point.phone,
          email: point.email,
          address: point.address_line1,
          city: point.city,
          state: point.province || (corridor === 'DO_US' ? 'Distrito Nacional' : 'MA'),
          zipCode: point.postal_code || (corridor === 'DO_US' ? '10401' : '02114'),
          country: point.country || (corridor === 'DO_US' ? 'DO' : 'US')
        },
        recipient: {
          ...recipient,
          country: corridor === 'DO_US' ? 'US' : 'DO'
        },
        pkg: {
          weightKg: currentPackage.weightKg,
          widthCm: 20,
          heightCm: 10,
          lengthCm: 25
        },
        notes: `Mostrador POS - ${currentPackage.name} (${deliveryType === 'home' ? 'Entrega a Domicilio' : 'Retiro en Sucursal'})`
      };

      const res = await (api as any).createPointTerminalShipment(payload);

      setReceiptModal({
        trackingCode: res.shipment.trackingCode,
        price: res.shipment.price,
        priceDop: convertToDop(res.shipment.price),
        commission: res.shipment.commission,
        commissionDop: convertToDop(res.shipment.commission),
        exchangeRate: usdToDopRate,
        paymentCurrency: collectCurrency,
        currency: res.shipment.currency,
        tariffName: res.shipment.tariffName,
        paymentMethod: res.shipment.paymentMethod,
        deliveryType: corridor === 'DO_US'
          ? (deliveryType === 'home' ? 'Entrega a Domicilio USA' : 'Retiro en Hub Miami')
          : (deliveryType === 'home' ? 'Entrega a Domicilio RD' : 'Retiro en Sucursal RD'),
        recipientName: recipient.name,
        recipientPhone: recipient.phone,
        recipientAddress: recipient.address,
        isConsolidatedInSaca: res.shipment.isConsolidatedInSaca,
        createdAt: new Date().toLocaleString()
      });

      setNotice(`¡Envío creado! Código: ${res.shipment.trackingCode}. Ganancia +$${res.shipment.commission.toFixed(2)} USD (${formatDop(convertToDop(res.shipment.commission))}) acreditada a tu balance.`);

      setRecipient({
        name: '',
        phone: '',
        email: '',
        idNumber: '',
        address: '',
        city: 'Santo Domingo',
        province: 'Distrito Nacional',
        country: 'DO',
        zipCode: '10101',
        notes: ''
      });
      setBankPaymentRef('');

      await loadData();
    } catch (err: any) {
      console.error('Error creating terminal shipment:', err);
      setError(err.message || 'No se pudo crear el envío en el mostrador.');
    } finally {
      setSubmitting(false);
    }
  };

  // Cerrar Valija de Consolidación
  const handleCloseSaca = async () => {
    if (!currentSaca) return;
    if (!confirm(`¿Deseas cerrar la valija ${currentSaca.manifest_number || 'actual'} con ${currentSaca.current_items_count} documentos y generar su manifiesto oficial?`)) return;

    setClosingSaca(true);
    try {
      const res = await (api as any).closePointSaca({
        manifestId: currentSaca.id,
        notes: `Cierre de valija de documentos desde ${point.business_name}`
      });
      setNotice(`Valija cerrada con éxito. Manifiesto: ${res.manifest?.manifest_number || 'Generado'}. Lista para despacho a Hub.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo cerrar la valija.');
    } finally {
      setClosingSaca(false);
    }
  };

  // Guardar Cuenta Bancaria
  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountHolder || !bankForm.accountNumber) {
      alert('Banco, titular y número de cuenta son requeridos.');
      return;
    }

    setBankSaving(true);
    try {
      await (api as any).savePointBankAccount({
        ...bankForm,
        isDefault: true
      });
      setShowBankModal(false);
      setNotice('Cuenta bancaria guardada y configurada como predeterminada.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo guardar la cuenta bancaria.');
    } finally {
      setBankSaving(false);
    }
  };

  // Solicitar Retiro de Comisión
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      alert('Ingresa un monto válido mayor a 0.');
      return;
    }
    if (amount > Number(finance.availableBalance || 0)) {
      alert(`Saldo insuficiente. Tu balance disponible es de $${Number(finance.availableBalance || 0).toFixed(2)} ${finance.currency || 'USD'}.`);
      return;
    }

    setPayoutSubmitting(true);
    try {
      const res = await (api as any).requestPointPayout({
        amount,
        bankAccountId: payoutAccountId,
        notes: payoutNotes
      });
      setShowPayoutModal(false);
      setPayoutAmount('');
      setPayoutNotes('');
      setNotice(`Solicitud de retiro de $${amount.toFixed(2)} enviada con éxito (Ref: ${res.payout?.referenceNumber}).`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo procesar la solicitud de retiro.');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  // Iniciar Turno / Fondo de Caja Chica
  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(openShiftForm.openingAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Ingresa un monto válido para la caja chica.');
      return;
    }
    setShiftSubmitting(true);
    try {
      await (api as any).openPointCashShift({
        employeeId: openShiftForm.employeeId || undefined,
        pinCode: openShiftForm.pinCode,
        openingAmount: amount,
        notes: openShiftForm.notes
      });
      setShowOpenShiftModal(false);
      setOpenShiftForm({ employeeId: '', pinCode: '', openingAmount: '50.00', notes: '' });
      setNotice(`Turno de caja chica iniciado exitosamente con $${amount.toFixed(2)}.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo iniciar el turno de caja chica.');
    } finally {
      setShiftSubmitting(false);
    }
  };

  // Guardar Personalización de Marca de Sucursal
  const handleSaveBranchSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBranchName.trim()) {
      alert(panelLocale === 'en' ? 'Branch name cannot be empty.' : 'El nombre de la sucursal no puede estar vacío.');
      return;
    }
    setSavingBranchSettings(true);
    try {
      const res = await (api as any).updatePointSettings({
        businessName: customBranchName.trim(),
        phone: customBranchPhone.trim(),
        address: customBranchAddress.trim()
      });
      if (res.point) {
        setPoint((prev: any) => ({
          ...prev,
          business_name: res.point.business_name,
          phone: res.point.phone,
          formatted_address: res.point.formatted_address,
          address: res.point.formatted_address
        }));
      }
      setNotice(panelLocale === 'en' ? 'Branch branding updated successfully!' : '¡Marca y configuración de sucursal actualizada con éxito!');
      setTimeout(() => setNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar configuración.');
    } finally {
      setSavingBranchSettings(false);
    }
  };

  // Realizar Cierre de Caja
  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const counted = parseFloat(closeShiftForm.countedCash);
    if (isNaN(counted) || counted < 0) {
      alert('Ingresa el monto contado físicamente en caja.');
      return;
    }
    setShiftSubmitting(true);
    try {
      const res = await (api as any).closePointCashShift({
        employeeId: closeShiftForm.employeeId || undefined,
        pinCode: closeShiftForm.pinCode,
        countedCash: counted,
        closingNotes: closeShiftForm.notes
      });
      setShowCloseShiftModal(false);
      setCloseShiftForm({ employeeId: '', pinCode: '', countedCash: '', notes: '' });
      const diff = res.difference;
      const diffText = diff === 0 ? 'Cuadre exacto ($0.00)' : diff > 0 ? `Sobrante de +$${diff.toFixed(2)}` : `Faltante de -$${Math.abs(diff).toFixed(2)}`;
      setNotice(`Cierre de caja completado exitosamente: ${diffText}.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo realizar el cierre de caja.');
    } finally {
      setShiftSubmitting(false);
    }
  };

  // Guardar Empleado / Cajero
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.email) {
      alert('Nombre y correo electrónico son requeridos.');
      return;
    }

    setEmployeeSaving(true);
    try {
      await (api as any).savePointEmployee(employeeForm);
      setShowEmployeeModal(false);
      setNotice(`Empleado ${employeeForm.name} guardado con éxito.`);
      setEmployeeForm({
        id: '',
        name: '',
        email: '',
        phone: '',
        role: 'cashier',
        status: 'active',
        pinCode: '',
        permissions: ['pos.create', 'cash.view']
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo guardar el empleado.');
    } finally {
      setEmployeeSaving(false);
    }
  };

  const handleToggleEmployeeStatus = async (emp: any) => {
    const newStatus = emp.status === 'active' ? 'suspended' : 'active';
    try {
      await (api as any).updatePointEmployeeStatus(emp.id, newStatus);
      setNotice(`Acceso de ${emp.name} cambiado a ${newStatus === 'active' ? 'Activo' : 'Suspendido'}.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo actualizar el estado.');
    }
  };

  const handleDeleteEmployee = async (emp: any) => {
    if (!confirm(`¿Estás seguro de eliminar al empleado ${emp.name}? Ya no tendrá acceso al mostrador.`)) return;
    try {
      await (api as any).deletePointEmployee(emp.id);
      setNotice(`Empleado ${emp.name} eliminado.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar el empleado.');
    }
  };

  const logout = () => {
    removeAuthToken();
    navigate('/auth/login');
  };

  // Envíos con Filtros Avanzados
  const filteredOperations = useMemo(() => {
    return operations.filter(op => {
      // 1. Buscador texto
      const search = (shipmentSearch || '').toLowerCase().trim();
      const matchesSearch =
        !search ||
        op.trackingCode?.toLowerCase().includes(search) ||
        op.recipient?.name?.toLowerCase().includes(search) ||
        op.recipient?.city?.toLowerCase().includes(search) ||
        op.recipient?.phone?.toLowerCase().includes(search) ||
        op.sender?.name?.toLowerCase().includes(search);

      // 2. Estado
      const matchesStatus = shipmentStatusFilter === 'all' || op.status === shipmentStatusFilter;

      // 3. Producto
      const matchesProduct =
        shipmentProductFilter === 'all' ||
        (op.productCode && op.productCode.toLowerCase().includes(shipmentProductFilter.toLowerCase())) ||
        (op.productName && op.productName.toLowerCase().includes(shipmentProductFilter.toLowerCase()));

      // 4. Modalidad de entrega
      const isHome = op.recipient?.address && !op.recipient?.isBranchPickup;
      const matchesDelivery =
        shipmentDeliveryFilter === 'all' ||
        (shipmentDeliveryFilter === 'home' && isHome) ||
        (shipmentDeliveryFilter === 'branch' && !isHome);

      // 5. Rango de Fechas
      let matchesDate = true;
      if (shipmentDateFilter !== 'all' && op.createdAt) {
        const opDate = new Date(op.createdAt);
        const now = new Date();
        if (shipmentDateFilter === 'today') {
          matchesDate = opDate.toDateString() === now.toDateString();
        } else if (shipmentDateFilter === 'week') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = opDate >= sevenDaysAgo;
        } else if (shipmentDateFilter === 'month') {
          matchesDate = opDate.getMonth() === now.getMonth() && opDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesProduct && matchesDelivery && matchesDate;
    });
  }, [operations, shipmentSearch, shipmentStatusFilter, shipmentProductFilter, shipmentDeliveryFilter, shipmentDateFilter]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredOperations.length / pageSize));
  const paginatedOperations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOperations.slice(start, start + pageSize);
  }, [filteredOperations, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [shipmentSearch, shipmentStatusFilter, shipmentProductFilter, shipmentDeliveryFilter, shipmentDateFilter, pageSize]);

  // Handler para enviar recibo por correo
  const handleSendEmailReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailShipment || !emailTarget) {
      alert('Ingresa un correo electrónico de destino.');
      return;
    }

    setSendingEmail(true);
    try {
      await (api as any).sendPointShipmentReceipt(emailShipment.trackingCode, {
        toEmail: emailTarget
      });
      setEmailModalOpen(false);
      setNotice(`Recibo digital enviado con éxito a ${emailTarget}.`);
    } catch (err: any) {
      alert(err.message || 'No se pudo enviar el recibo por correo.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Abrir modal de impresión
  const openPrintModalForShipment = (shp: any, format: 'thermal_80' | 'thermal_58' | 'courier_label' = 'thermal_80') => {
    setPrintShipment(shp);
    setPrintFormat(format);
    setPrintModalOpen(true);
  };

  // Abrir modal de correo
  const openEmailModalForShipment = (shp: any) => {
    setEmailShipment(shp);
    setEmailTarget(shp.recipient?.email || shp.sender?.email || '');
    setEmailModalOpen(true);
  };

  if (loading && !point) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 grid place-items-center text-slate-900 dark:text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 font-bold text-sm">Cargando Panel Operativo Point…</p>
        </div>
      </div>
    );
  }

  const activeBankAccount = bankAccounts.find(a => a.is_default) || bankAccounts[0];

  const isCashierMode = viewMode === 'cashier';

  const ALL_SIDEBAR_ITEMS = [
    { id: 'pos', name: 'Mostrador POS', icon: PackagePlus, badge: viewMode === 'owner' ? '15%' : undefined },
    { id: 'shipments', name: 'Envíos & Tracking', icon: Package, count: operations.length },
    { id: 'manifests', name: 'Lotes & Valijas', icon: Layers, badge: currentSaca ? `${currentSaca.current_items_count || 0}/10` : 'Valijas' },
    { id: 'cash', name: 'Caja & Arqueo', icon: Coins, count: cashSummary?.movementsCountToday || cashSummary?.movements_count_today },
    { id: 'wallet', name: 'Billetera & Bancos', icon: Landmark, count: viewMode === 'owner' ? `$${Number(finance.availableBalance || 0).toFixed(0)}` : undefined, ownerOnly: true },
    { id: 'team', name: 'Equipo & Empleados', icon: Users, count: employees.length, ownerOnly: true },
    { id: 'profile', name: 'Local & Horario', icon: Store }
  ];

  // El Dueño siempre tiene acceso completo a todas las secciones
  const SIDEBAR_ITEMS = ALL_SIDEBAR_ITEMS.filter(item => viewMode === 'owner' || !item.ownerOnly);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors">
      {/* ==================== LEFT SIDEBAR (DESKTOP) ==================== */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 h-screen sticky top-0 z-40">
        {/* Header con Marca Personalizada: [Nombre Sucursal] by ship24go.com */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <BrandMark showText={false} iconClassName="w-9 h-9 rounded-xl shadow-xs shrink-0" />
            <div className="flex flex-col min-w-0 leading-tight text-left">
              <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[130px]">
                {point?.business_name || 'Mi Sucursal'}
              </span>
              <span className="text-[9px] font-extrabold text-blue-600 dark:text-cyan-400 lowercase">
                by ship24go.com
              </span>
            </div>
          </Link>
          <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-cyan-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 shrink-0">
            POS
          </span>
        </div>

        {/* Tarjeta del Local Point */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-blue-950/20 border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center justify-between gap-1 mb-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-cyan-400 truncate">
              {point?.business_name || point?.businessName || 'Tu Local'}
            </p>
            <StatusBadge status={point?.status || 'approved'} />
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
            {point?.city}, {point?.country}
          </p>
          <div className="mt-2 pt-2 border-t border-blue-100/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Saldo listo:</span>
            <div className="text-right">
              <strong className="text-emerald-600 dark:text-emerald-400 font-black block">
                ${Number(finance.availableBalance || 0).toFixed(2)} USD
              </strong>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                ≈ {formatDop(convertToDop(finance.availableBalance || 0))}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-blue-100/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-[10px] font-bold text-slate-500">Vista de Terminal:</span>
            <div className="inline-flex rounded-lg bg-white/90 dark:bg-slate-900/90 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setViewMode('owner');
                  localStorage.setItem('point_view_mode', 'owner');
                }}
                className={`px-2 py-0.5 rounded-md font-black text-[10px] transition-all cursor-pointer ${
                  viewMode === 'owner'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                }`}
              >
                👑 Dueño
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('cashier');
                  localStorage.setItem('point_view_mode', 'cashier');
                }}
                className={`px-2 py-0.5 rounded-md font-black text-[10px] transition-all cursor-pointer ${
                  viewMode === 'cashier'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
                }`}
              >
                👤 Cajero
              </button>
            </div>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map(item => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && !item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Chat con Ejecutivo & Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <a
            href="/point/roadmap"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 p-2 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>🗺️</span>
              <span>Roadmap & Operación</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </a>
          <button
            onClick={openChatModal}
            className="w-full rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 p-2.5 flex items-center gap-2.5 text-left cursor-pointer transition-colors"
          >
            {point?.executive?.avatar_url ? (
              <img
                src={point.executive.avatar_url}
                alt="Ejecutivo"
                className="w-8 h-8 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {(point?.executive?.name || 'S').charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black text-slate-900 dark:text-white truncate">
                  {point?.executive?.name || 'Ejecutivo de Cuenta'}
                </p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold">Chatear soporte</p>
            </div>
          </button>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== MOBILE TOP BAR ==================== */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <BrandMark showText={false} iconClassName="w-8 h-8 rounded-xl shrink-0" />
            <div className="flex flex-col min-w-0 leading-tight text-left">
              <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[140px]">
                {point?.business_name || 'Mi Sucursal'}
              </span>
              <span className="text-[9px] font-extrabold text-blue-600 dark:text-cyan-400 lowercase">
                by ship24go.com
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openChatModal}
            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-400"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
            ${Number(finance.availableBalance || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex">
          <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col animate-in slide-in-from-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <BrandMark iconClassName="w-8 h-8 rounded-xl" textClassName="text-base" />
              <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {SIDEBAR_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold ${
                    currentTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/20">{item.badge}</span>}
                </button>
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <button onClick={toggleTheme} className="p-2 text-slate-400">{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
              <button onClick={logout} className="text-red-500 font-bold text-xs flex items-center gap-1"><LogOut className="w-4 h-4" /> Salir</button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {error && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-3 shadow-xs">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* ========================================================
            TAB 1: MOSTRADOR POS (TERMINAL DE COBRO CON 15% COMISION)
            ======================================================== */}
        {currentTab === 'pos' && (
          <div className="space-y-6">
            {/* Banner Superior de Mostrador */}
            <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 relative overflow-hidden shadow-lg">
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {viewMode === 'owner' ? (
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        👑 Dueño de Sucursal ({point?.contact_name || point?.business_name || 'Administrador'})
                      </span>
                    ) : (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        👤 Cajero de Turno {currentEmployee ? `(${currentEmployee.name})` : ''}
                      </span>
                    )}
                    <span className="text-xs text-cyan-300 font-black">
                      {corridor === 'DO_US' ? '✈️ Exportación RD ➔ Hub Miami (Doral, FL)' : '📦 Importación USA ➔ RD'}
                    </span>
                    <span className="bg-white/10 text-cyan-200 border border-white/20 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-cyan-300" />
                      1 USD = {formatDop(usdToDopRate)} DOP
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-black">
                      {corridor === 'DO_US'
                        ? (panelLocale === 'en' ? 'Counter POS · Export to United States' : 'Mostrador POS · Exportación a Estados Unidos')
                        : (panelLocale === 'en' ? 'Counter POS Shipping Terminal' : 'Mostrador POS de Emisión de Envíos')}
                    </h1>
                  </div>
                  <p className="text-xs text-blue-200 mt-1 max-w-xl">
                    {corridor === 'DO_US'
                      ? 'Recepción de sobres y paquetes en República Dominicana con destino a USA. Despacho directo a Hub Miami y entrega por transportista en todo el territorio estadounidense.'
                      : 'Recepción y emisión de sobres y paquetes desde USA a República Dominicana con entrega en sucursal o a domicilio.'}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 shrink-0 text-right sm:text-left">
                  {viewMode === 'owner' ? (
                    <>
                      <p className="text-[10px] font-black uppercase text-blue-200">Saldo Disponible (Dueño)</p>
                      <p className="text-2xl font-black text-emerald-400">
                        ${Number(finance.availableBalance || 0).toFixed(2)} <span className="text-xs font-bold text-white">USD</span>
                      </p>
                      <p className="text-[11px] font-bold text-cyan-300">
                        ≈ {formatDop(convertToDop(finance.availableBalance || 0))} DOP
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => setTab('wallet')}
                          className="text-[11px] font-bold text-cyan-300 hover:underline cursor-pointer"
                        >
                          Ver Billetera →
                        </button>
                        <span className="text-blue-300">·</span>
                        <button
                          onClick={() => {
                            setViewMode('cashier');
                            localStorage.setItem('point_view_mode', 'cashier');
                          }}
                          className="text-[11px] font-bold text-amber-300 hover:underline cursor-pointer"
                          title="Ocultar comisiones en pantalla de mostrador"
                        >
                          🛡️ Modo Cajero
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-black uppercase text-blue-200">Sucursal Point</p>
                      <p className="text-lg font-black text-white truncate max-w-[200px]">
                        {point?.business_name || 'Mi Sucursal'}
                      </p>
                      <p className="text-[10px] font-extrabold text-cyan-300 lowercase mb-1.5">by ship24go.com</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={togglePanelLocale}
                          className="text-[11px] font-black text-white bg-blue-600/80 hover:bg-blue-600 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-blue-400/40"
                        >
                          <Globe className="w-3 h-3 text-cyan-300" />
                          <span>{panelLocale === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('owner');
                            localStorage.setItem('point_view_mode', 'owner');
                          }}
                          className="text-[11px] font-black text-emerald-300 hover:underline cursor-pointer"
                        >
                          👑 Activar Modo Dueño
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Selector Segmentado de Corredor Logístico */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 pl-1">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Ruta Activa:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-black text-xs border border-blue-200 dark:border-blue-900/50">
                  {corridor === 'DO_US'
                    ? 'Exportación: República Dominicana ➔ USA (Hub Miami)'
                    : 'Importación: Estados Unidos ➔ República Dominicana (Hub SDQ)'}
                </span>
              </div>

              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCorridor('DO_US');
                    setRecipient(prev => ({
                      ...prev,
                      country: 'US',
                      city: 'Doral',
                      province: 'FL',
                      zipCode: '33122',
                      address: deliveryType === 'branch' ? '8200 NW 27th St, Suite 102 (Hub Miami Doral)' : ''
                    }));
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    corridor === 'DO_US'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px]">RD</span>
                  <span>➔</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px]">USA</span>
                  <span className="text-[10px] opacity-80">(Hub Miami)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCorridor('US_DO');
                    setRecipient(prev => ({
                      ...prev,
                      country: 'DO',
                      city: 'Santo Domingo',
                      province: 'Distrito Nacional',
                      zipCode: '10101',
                      address: ''
                    }));
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    corridor === 'US_DO'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px]">USA</span>
                  <span>➔</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px]">RD</span>
                  <span className="text-[10px] opacity-80">(Hub SDQ)</span>
                </button>
              </div>
            </div>

            {/* Estado de Caja Chica y Arqueo (No invasivo) */}
            {!shiftsHistory.some((s: any) => s.status === 'open') ? (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Unlock className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-xs">
                    <strong className="font-black text-amber-600 dark:text-amber-400">Caja Chica:</strong> Turno sin arqueo inicial activo. Puedes emitir envíos directamente o abrir turno para cuadre diario.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (currentEmployee?.id) {
                      setOpenShiftForm(prev => ({ ...prev, employeeId: currentEmployee.id }));
                    }
                    setShowOpenShiftModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shrink-0 transition-colors cursor-pointer"
                >
                  Abrir Turno →
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs font-bold">
                    Turno de Caja Abierto · Registrando operaciones de mostrador
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('cash')}
                  className="text-xs font-bold text-emerald-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Ver Arqueo →
                </button>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6 items-start">
              {/* Formulario de Emisión POS */}
              <form onSubmit={handleCreateShipment} className="lg:col-span-2 space-y-6">
                {/* 1. Medidas de Paquetes */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs grid place-items-center">1</span>
                      <h2 className="text-base font-black text-slate-900 dark:text-white">Selecciona el tipo de bulto</h2>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      15% ganancia
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {activePackages.map(pkg => {
                      const isSelected = selectedPackageId === pkg.id;
                      const price = deliveryType === 'home' ? pkg.homePrice : pkg.branchPrice;
                      const comm = deliveryType === 'home' ? pkg.homeCommission : pkg.branchCommission;

                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[120px] ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-600/20'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white grid place-items-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          <div>
                            <div className="text-xl mb-1">{pkg.icon}</div>
                            <p className="font-black text-xs text-slate-900 dark:text-white leading-tight">{pkg.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{pkg.sub}</p>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                            <p className="text-sm font-black text-slate-900 dark:text-white">${price.toFixed(2)} USD</p>
                            <p className="text-[11px] font-black text-blue-600 dark:text-cyan-400">
                              ≈ {formatDop(convertToDop(price))}
                            </p>
                            {!isCashierMode && (
                              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                +${comm.toFixed(2)} ({formatDop(convertToDop(comm))})
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Modalidad de Entrega */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs grid place-items-center">2</span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      {corridor === 'DO_US' ? 'Modalidad de Entrega en Estados Unidos' : 'Modalidad en República Dominicana'}
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectDeliveryType('branch')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        deliveryType === 'branch'
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-600/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-cyan-300 grid place-items-center shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-sm text-slate-900 dark:text-white">
                            {corridor === 'DO_US' ? 'Retiro en Hub Miami (Doral, FL)' : 'Retiro en Sucursal / Point'}
                          </p>
                          <div className="text-right">
                            <span className="font-black text-sm text-blue-600 dark:text-cyan-400">${currentPackage.branchPrice.toFixed(2)} USD</span>
                            <span className="block text-[10px] font-bold text-slate-500">≈ {formatDop(convertToDop(currentPackage.branchPrice))}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {corridor === 'DO_US'
                            ? 'Retiro en Miami Hub (8200 NW 27th St, Doral, FL) o point aliado en Florida.'
                            : 'Retiro en Hub de Santo Domingo o Point afiliado en RD.'}
                        </p>
                        {!isCashierMode && (
                          <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
                            Tu Ganancia (15%): +${currentPackage.branchCommission.toFixed(2)} USD
                          </p>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectDeliveryType('home')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        deliveryType === 'home'
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-600/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 grid place-items-center shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-sm text-slate-900 dark:text-white">
                            {corridor === 'DO_US' ? 'Entrega a Domicilio USA (USPS / FedEx / UPS)' : 'Entrega a Domicilio RD'}
                          </p>
                          <div className="text-right">
                            <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">${currentPackage.homePrice.toFixed(2)} USD</span>
                            <span className="block text-[10px] font-bold text-slate-500">≈ {formatDop(convertToDop(currentPackage.homePrice))}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {corridor === 'DO_US'
                            ? 'Mensajería local y entrega en la puerta del destinatario en cualquier código postal de USA.'
                            : 'Mensajería directa hasta la puerta del cliente en cualquier provincia.'}
                        </p>
                        {!isCashierMode && (
                          <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
                            Tu Ganancia (15%): +${currentPackage.homeCommission.toFixed(2)} USD
                          </p>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Destinatario */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs grid place-items-center">3</span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      {corridor === 'DO_US' ? 'Destinatario en Estados Unidos' : 'Destinatario en República Dominicana'}
                    </h2>
                  </div>

                  {corridor === 'DO_US' && deliveryType === 'branch' && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="text-xs text-emerald-900 dark:text-emerald-200">
                        <strong className="block font-black">Retiro en Hub Miami (Doral, FL)</strong>
                        <span>Dirección oficial asignada: 8200 NW 27th St, Suite 102, Doral, FL 33122. El destinatario solo presenta su ID y tracking para retirar.</span>
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nombre y Apellido *</label>
                      <input
                        required
                        type="text"
                        placeholder={corridor === 'DO_US' ? 'Ej: John Smith / Manuel Rodríguez' : 'Ej: Manuel Peralta Gómez'}
                        value={recipient.name}
                        onChange={e => setRecipient({ ...recipient, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Teléfono móvil / WhatsApp *</label>
                      <input
                        required
                        type="tel"
                        placeholder={corridor === 'DO_US' ? 'Ej: +1 (305) 555-0199' : 'Ej: 809-555-0199'}
                        value={recipient.phone}
                        onChange={e => setRecipient({ ...recipient, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        {deliveryType === 'home'
                          ? (corridor === 'DO_US' ? 'Dirección en USA (Street Address, Suite / Apt) *' : 'Dirección de entrega a domicilio *')
                          : (corridor === 'DO_US' ? 'Dirección / Ciudad de retiro en Florida *' : 'Dirección / Sector de referencia *')}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder={corridor === 'DO_US' ? '8200 NW 27th St, Suite 102 (o dirección de entrega)' : 'Calle, número, edificio, sector o municipio'}
                        value={recipient.address}
                        onChange={e => setRecipient({ ...recipient, address: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        {corridor === 'DO_US' ? 'Ciudad en USA *' : 'Ciudad / Municipio *'}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder={corridor === 'DO_US' ? 'Miami, Orlando, Tampa, New York...' : 'Santo Domingo, Santiago, etc.'}
                        value={recipient.city}
                        onChange={e => setRecipient({ ...recipient, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    {corridor === 'DO_US' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Estado (State) *</label>
                          <input
                            required
                            type="text"
                            placeholder="FL, NY, MA, TX..."
                            value={recipient.province}
                            onChange={e => setRecipient({ ...recipient, province: e.target.value.toUpperCase() })}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Código Postal (ZIP) *</label>
                          <input
                            required
                            type="text"
                            placeholder="33122"
                            value={recipient.zipCode}
                            onChange={e => setRecipient({ ...recipient, zipCode: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Cédula de Identidad (Opcional)</label>
                        <input
                          type="text"
                          placeholder="001-XXXXXXX-X"
                          value={recipient.idNumber}
                          onChange={e => setRecipient({ ...recipient, idNumber: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Método de Cobro al Cliente */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs grid place-items-center">4</span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Método y Moneda de Cobro en Mostrador</h2>
                  </div>

                  {/* Selector de Moneda de Cobro con Conversión en Vivo */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white">Moneda de Pago del Cliente</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Tasa de cambio del día: <strong className="text-blue-600 dark:text-cyan-400">1 USD = {formatDop(usdToDopRate)} DOP</strong>
                          </p>
                        </div>
                      </div>
                      <div className="inline-flex rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setCollectCurrency('DOP')}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            collectCurrency === 'DOP'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          🇩🇴 Cobrar en Pesos (RD$)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCollectCurrency('USD')}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            collectCurrency === 'USD'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          🇺🇸 Cobrar en Dólares ($)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 dark:border-blue-900/60">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        {collectCurrency === 'DOP' ? 'Total en Pesos Dominicanos a recibir:' : 'Total en Dólares a recibir:'}
                      </span>
                      <span className="text-base font-black text-blue-700 dark:text-cyan-300">
                        {collectCurrency === 'DOP'
                          ? `${formatDop(convertToDop(currentPrice))} DOP`
                          : `$${currentPrice.toFixed(2)} USD (≈ ${formatDop(convertToDop(currentPrice))})`}
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'cash'
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <DollarSign className="w-5 h-5" />
                      <span>Efectivo en Caja</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Tarjeta / Datáfono</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Landmark className="w-5 h-5" />
                      <span>Transferencia Bancaria</span>
                    </button>
                  </div>

                  {paymentMethod === 'bank_transfer' && (
                    <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-3">
                      <p className="text-xs font-black uppercase text-purple-700 dark:text-purple-300">
                        Cuentas oficiales de cobro Ship24Go configuradas
                      </p>
                      <div className="space-y-2">
                        {systemBanks.map(b => (
                          <div key={b.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/60 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-black text-slate-900 dark:text-white">{b.bank_name} ({b.currency})</p>
                              <p className="text-slate-500 text-[11px]">Titular: {b.account_holder}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const accNum = b.details_json?.['Cuenta de ahorros RD$'] || b.details_json?.['Account number'] || b.details_json?.['IBAN'] || '';
                                copyToClipboard(accNum, b.id);
                              }}
                              className="px-2 py-1 rounded-lg border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 font-bold text-[10px]"
                            >
                              {copiedKey === b.id ? '¡Copiado!' : 'Copiar número'}
                            </button>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                          Número de referencia o comprobante de la transferencia *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Ej: BHD-TRF-984029"
                          value={bankPaymentRef}
                          onChange={e => setBankPaymentRef(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón Emitir */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 px-6 text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md"
                >
                  {submitting ? (
                    <span>Emitiendo envío y acreditando comisión…</span>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>
                        Cobrar ${currentPrice.toFixed(2)} USD · {formatDop(convertToDop(currentPrice))}
                      </span>
                      {!isCashierMode && (
                        <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full">
                          Ganas +${currentCommission.toFixed(2)} ({formatDop(convertToDop(currentCommission))})
                        </span>
                      )}
                    </>
                  )}
                </button>
              </form>

              {/* Resumen Ticket Lateral */}
              <div className="space-y-4 sticky top-6">
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                  <p className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">Resumen en Mostrador</p>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">Ticket Operativo</h3>

                  <div className="mt-4 space-y-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex justify-between"><span className="text-slate-500">Producto:</span><strong className="text-slate-900 dark:text-white">{currentPackage.name}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Peso límite:</span><span>{currentPackage.sub}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Ruta:</span><strong className="text-blue-600 dark:text-cyan-400">{corridor === 'DO_US' ? 'RD ➔ Hub Miami' : 'USA ➔ RD'}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Modalidad:</span><span>{corridor === 'DO_US' ? (deliveryType === 'home' ? '🏠 Domicilio USA' : '🏢 Hub Miami') : (deliveryType === 'home' ? '🏠 Domicilio' : '🏢 Sucursal RD')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Pago:</span><span className="capitalize">{paymentMethod}</span></div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-bold text-slate-500">Precio Oficial USD:</span>
                      <strong className="text-base font-black text-slate-900 dark:text-white">${currentPrice.toFixed(2)} USD</strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 flex items-center justify-between">
                      <div>
                        <span className="font-black text-blue-900 dark:text-blue-200 text-xs block">Total a Cobrar en RD$:</span>
                        <span className="text-[10px] text-slate-500">Tasa: 1 USD = {formatDop(usdToDopRate)}</span>
                      </div>
                      <strong className="text-xl font-black text-blue-600 dark:text-cyan-400">
                        {formatDop(convertToDop(currentPrice))}
                      </strong>
                    </div>

                    {!isCashierMode && (
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-black uppercase text-emerald-800 dark:text-emerald-300">Tu Ganancia (15%)</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Acreditada en tu saldo</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-emerald-600 dark:text-emerald-400">+${currentCommission.toFixed(2)} USD</p>
                          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">≈ {formatDop(convertToDop(currentCommission))}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Valija Widget Rápido */}
                {currentSaca && (
                  <div className="rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                          {corridor === 'DO_US' ? 'Valija a Miami Hub' : 'Valija a RD'}
                        </h4>
                      </div>
                      <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        {currentSaca.current_items_count}/10
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                      {corridor === 'DO_US'
                        ? `Consolidación activa hacia Hub Miami. ${Math.max(0, 10 - currentSaca.current_items_count)} piezas faltantes para despacho a USA.`
                        : `Consolidación activa hacia RD. ${Math.max(0, 10 - currentSaca.current_items_count)} piezas faltantes para despacho a Santo Domingo.`}
                    </p>
                    <button
                      onClick={() => setTab('manifests')}
                      className="mt-3 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Ver valija completa →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: ENVÍOS & TRACKING (FILTROS AVANZADOS, PAGINACIÓN, IMPRESIÓN Y EMAIL)
            ======================================================== */}
        {currentTab === 'shipments' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">Envíos Emitidos & Trazabilidad</h1>
                <p className="text-xs text-slate-500 mt-0.5">Control de todos los paquetes emitidos desde este Point</p>
              </div>
              <button onClick={() => setTab('pos')} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 flex items-center gap-1.5 cursor-pointer shadow-xs">
                <PackagePlus className="w-4 h-4" /> Nuevo Envío
              </button>
            </div>

            {/* Filtros Avanzados */}
            <div className="space-y-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por tracking, destinatario, teléfono o ciudad en RD..."
                    value={shipmentSearch}
                    onChange={e => setShipmentSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={shipmentDateFilter}
                    onChange={e => setShipmentDateFilter(e.target.value as any)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="all">📅 Todo el Historial</option>
                    <option value="today">Hoy</option>
                    <option value="week">Últimos 7 días</option>
                    <option value="month">Este mes</option>
                  </select>

                  <select
                    value={shipmentStatusFilter}
                    onChange={e => setShipmentStatusFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="all">📦 Todos los estados</option>
                    <option value="received">Recibido en Mostrador</option>
                    <option value="in_transit">En Tránsito a RD</option>
                    <option value="delivered">Entregado</option>
                  </select>

                  <select
                    value={shipmentDeliveryFilter}
                    onChange={e => setShipmentDeliveryFilter(e.target.value as any)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option value="all">🚚 Sucursal y Domicilio</option>
                    <option value="branch">Retiro en Sucursal RD</option>
                    <option value="home">Entrega a Domicilio</option>
                  </select>
                </div>
              </div>

              {/* Indicador de resultados activos */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>
                  Mostrando <strong>{filteredOperations.length}</strong> envíos encontrados
                </span>
                {(shipmentSearch || shipmentStatusFilter !== 'all' || shipmentDateFilter !== 'all' || shipmentDeliveryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setShipmentSearch('');
                      setShipmentStatusFilter('all');
                      setShipmentDateFilter('all');
                      setShipmentDeliveryFilter('all');
                    }}
                    className="text-blue-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Limpiar todos los filtros ✕
                  </button>
                )}
              </div>
            </div>

            {/* Listado de Envíos */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              {paginatedOperations.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">No se encontraron envíos</p>
                  <p className="text-xs mt-1">Modifica los filtros de búsqueda o realiza una nueva emisión en el POS.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedOperations.map(op => (
                    <div key={op.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-blue-600 dark:text-cyan-400 text-sm">{op.trackingCode}</span>
                          {!isCashierMode && (
                            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              +${Number(op.commissionAmount || 0).toFixed(2)} comisión (15%)
                            </span>
                          )}
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            {op.recipient?.address?.toLowerCase().includes('sucursal') ? '🏢 Sucursal RD' : '🏠 Domicilio'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                          {op.productName || op.productCode} · Destinatario: <strong>{op.recipient?.name || 'Cliente'}</strong> {op.recipient?.phone ? `(${op.recipient.phone})` : ''}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          📍 {op.recipient?.city || 'República Dominicana'} · {new Date(op.createdAt).toLocaleString()} · Pago: <span className="uppercase font-bold">{op.paymentMethod || 'Efectivo'}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end lg:self-center">
                        <div className="text-right mr-2">
                          <p className="text-[10px] font-black uppercase text-slate-400">Cobrado</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">${Number(op.saleAmount || 0).toFixed(2)} {op.currency}</p>
                        </div>

                        {/* Botón Imprimir Recibo Térmico */}
                        <button
                          onClick={() => openPrintModalForShipment(op, 'thermal_80')}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                          title="Imprimir ticket de 80mm o 58mm"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                          <span>Imprimir</span>
                        </button>

                        {/* Botón Enviar por Correo */}
                        <button
                          onClick={() => openEmailModalForShipment(op)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                          title="Enviar recibo por email al cliente"
                        >
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Email</span>
                        </button>

                        {/* Botón Tracking */}
                        <a
                          href={`/tracking?code=${encodeURIComponent(op.trackingCode)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-cyan-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold flex items-center gap-1"
                        >
                          <span>Rastrear</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paginación */}
              {filteredOperations.length > 0 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Filas por página:</span>
                    <select
                      value={pageSize}
                      onChange={e => setPageSize(Number(e.target.value))}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>
                      Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredOperations.length)} de {filteredOperations.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 font-bold cursor-pointer"
                    >
                      «
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 font-bold cursor-pointer"
                    >
                      Anterior
                    </button>

                    <span className="px-2 font-black text-slate-700 dark:text-slate-300">
                      Página {currentPage} de {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 font-bold cursor-pointer"
                    >
                      Siguiente
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 font-bold cursor-pointer"
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: LOTES & VALIJAS (CONSOLIDACIÓN A REPÚBLICA DOMINICANA)
            ======================================================== */}
        {currentTab === 'manifests' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">Lotes & Valijas de Consolidación (RD)</h1>
              <p className="text-xs text-slate-500 mt-0.5">Regla de agrupación de 10+ documentos hacia República Dominicana con Master Tracking</p>
            </div>

            {/* Valija Abierta Actual */}
            {currentSaca ? (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      Valija en Curso (Abierta)
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {currentSaca.manifest_number || 'Valija de Documentos Actual'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Destino: {currentSaca.destination_hub_name || (currentSaca.destination_hub_id === 'hub_mia_01' || point?.country === 'DO' ? 'Hub Miami Doral, FL (HUB-MIA)' : 'Hub Santo Domingo Central (HUB-SDQ)')}
                    </p>
                  </div>

                  <button
                    onClick={handleCloseSaca}
                    disabled={closingSaca || currentSaca.current_items_count === 0}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black px-4 py-2.5 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{closingSaca ? 'Cerrando valija…' : 'Cerrar Valija & Generar Manifiesto'}</span>
                  </button>
                </div>

                {/* Barra de progreso de la valija */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>Progreso de consolidación ({currentSaca.current_items_count} de {currentSaca.threshold || 10} documentos)</span>
                    <span className="text-blue-600 font-black">
                      {Math.min(100, Math.round((currentSaca.current_items_count / (currentSaca.threshold || 10)) * 100))}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, (currentSaca.current_items_count / (currentSaca.threshold || 10)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {currentSaca.current_items_count >= (currentSaca.threshold || 10)
                      ? '🎉 ¡Umbral alcanzado! Esta valija está lista para cerrarse y despacharse.'
                      : `Faltan ${Math.max(0, (currentSaca.threshold || 10) - currentSaca.current_items_count)} documentos para optimizar el despacho.`}
                  </p>
                </div>

                {/* Envíos dentro de la valija */}
                <div className="pt-2">
                  <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Piezas empacadas en esta valija ({sacaShipments.length})</h4>
                  {sacaShipments.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">No hay piezas consolidadas aún en esta valija.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                      {sacaShipments.map((s: any) => (
                        <div key={s.id} className="p-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">{s.tracking_code}</span>
                            <p className="text-slate-500 text-[11px]">Destino: {s.recipient_city || 'Santo Domingo'}</p>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Historial de Valijas / Manifiestos Despachados */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Historial de Valijas Despachadas</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manifiestos y master trackings de consolidación</p>
              </div>

              {manifestsHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No hay valijas previas cerradas.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {manifestsHistory.map((m: any) => (
                    <div key={m.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{m.manifest_number}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {m.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {m.items_count || 0} piezas · Master: <strong>{m.master_tracking_code || 'En asignación'}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDispatchSheet(m.id)}
                          className="rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold text-[11px] px-2.5 py-1 flex items-center gap-1 border border-blue-200 dark:border-blue-800/60 cursor-pointer"
                          title="Imprimir Hoja de Ruta Broker"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Hoja de Ruta</span>
                        </button>
                        <span className="text-[11px] text-slate-400">{new Date(m.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: CAJA & ARQUEO DIARIO (CAJA CHICA & CIERRE)
            ======================================================== */}
        {currentTab === 'cash' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">Caja & Arqueo Diario</h1>
                <p className="text-xs text-slate-500 mt-0.5">Gestión de fondo de caja chica, cobros de mostrador y cuadre/cierre de turno</p>
              </div>

              <div className="flex items-center gap-2.5">
                {cashSummary?.activeShift ? (
                  <button
                    onClick={() => {
                      setCloseShiftForm({
                        employeeId: cashSummary.activeShift.employee_id || (employees[0]?.id || ''),
                        pinCode: '',
                        countedCash: '',
                        notes: ''
                      });
                      setShowCloseShiftModal(true);
                    }}
                    className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Realizar Cierre de Caja</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setOpenShiftForm({
                        employeeId: employees[0]?.id || '',
                        pinCode: '',
                        openingAmount: '50.00',
                        notes: ''
                      });
                      setShowOpenShiftModal(true);
                    }}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Iniciar Turno / Abrir Caja Chica</span>
                  </button>
                )}
              </div>
            </div>

            {/* Banner de Estado del Turno de Caja Chica */}
            {cashSummary?.activeShift ? (
              <div className="p-5 rounded-3xl bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300 dark:border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white grid place-items-center shrink-0 shadow-md">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Turno de Caja Abierto
                      </span>
                      <span className="text-xs text-slate-500">
                        Iniciado a las {new Date(cashSummary.activeShift.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-black text-base text-slate-900 dark:text-white mt-1">
                      Cajero a cargo: <span className="text-emerald-600 dark:text-emerald-400">{cashSummary.activeShift.employee_name}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fondo Inicial de Caja Chica: <strong>${Number(cashSummary.activeShift.opening_cash_amount || 0).toFixed(2)} USD</strong> · Ventas en efectivo turno: <strong>${Number(cashSummary.shiftCashSalesToday || 0).toFixed(2)} USD</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400">Total Esperado en Gaveta</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      ${(Number(cashSummary.activeShift.opening_cash_amount || 0) + Number(cashSummary.shiftCashSalesToday || 0)).toFixed(2)} USD
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCloseShiftForm({
                        employeeId: cashSummary.activeShift.employee_id || (employees[0]?.id || ''),
                        pinCode: '',
                        countedCash: '',
                        notes: ''
                      });
                      setShowCloseShiftModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    Hacer Cierre
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-linear-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 grid place-items-center shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Turno de Caja Cerrado
                      </span>
                    </div>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1">
                      No hay ningún fondo de caja chica activo en este momento.
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Inicia un turno indicando el monto inicial de cambio y la clave o PIN del cajero responsable.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setOpenShiftForm({
                      employeeId: employees[0]?.id || '',
                      pinCode: '',
                      openingAmount: '50.00',
                      notes: ''
                    });
                    setShowOpenShiftModal(true);
                  }}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 flex items-center gap-2 cursor-pointer shadow-xs shrink-0 self-start md:self-center"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Abrir Caja Chica</span>
                </button>
              </div>
            )}

            {/* Tarjetas de Arqueo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="text-[10px] font-black uppercase text-slate-400">Fondo Caja Chica Inicial</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  ${Number(cashSummary?.openingCashToday || 0).toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Dinero base para cambio</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="text-[10px] font-black uppercase text-slate-400">Efectivo en Gaveta Hoy</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ${Number(cashSummary?.cashInHandToday || cashSummary?.cash_in_hand_today || 0).toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Fondo base + Ventas en mano</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="text-[10px] font-black uppercase text-slate-400">Tarjeta / Banco Hoy</p>
                <p className="text-xl font-black text-blue-600 dark:text-cyan-400 mt-1">
                  ${Number(cashSummary?.cardSalesToday || cashSummary?.card_sales_today || 0).toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Terminales / Transferencias</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <p className="text-[10px] font-black uppercase text-slate-400">Ventas en Mostrador</p>
                <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {cashSummary?.movementsCountToday || cashSummary?.movements_count_today || 0}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Operaciones de caja hoy</p>
              </div>
            </div>

            {/* Historial de Cierres & Arqueos de Caja Chica */}
            {shiftsHistory.length > 0 && (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Historial de Cuadres & Cierres de Caja</h3>
                    <p className="text-xs text-slate-500">Registro de aperturas de caja chica y cuadres de turnos anteriores</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {shiftsHistory.map((s: any) => {
                    const diff = Number(s.difference_amount || 0);
                    return (
                      <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              s.status === 'open'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {s.status === 'open' ? 'Turno Abierto' : 'Turno Cerrado'}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              Apertura: {new Date(s.opened_at).toLocaleString()} por <strong>{s.employee_name}</strong>
                            </span>
                          </div>

                          {s.status === 'closed' && (
                            <p className="text-slate-600 dark:text-slate-300 text-xs mt-1">
                              Cerrado por: <strong>{s.closed_by_name || 'Encargado'}</strong> · Esperado: <strong>${Number(s.system_cash_expected || 0).toFixed(2)}</strong> · Contado: <strong>${Number(s.counted_cash_amount || 0).toFixed(2)}</strong>
                              {s.closing_notes ? ` · Nota: "${s.closing_notes}"` : ''}
                            </p>
                          )}
                        </div>

                        {s.status === 'closed' ? (
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                              diff === 0
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200'
                                : diff > 0
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200'
                            }`}>
                              {diff === 0 ? 'Cuadre Exacto' : diff > 0 ? `+${diff.toFixed(2)} Sobrante` : `-${Math.abs(diff).toFixed(2)} Faltante`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600 shrink-0">Fondo: ${Number(s.opening_cash_amount).toFixed(2)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Movimientos de Caja */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Libro Diario de Caja</h3>
                  <p className="text-xs text-slate-500">Últimos movimientos registrados en el terminal</p>
                </div>
                <button onClick={loadData} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {cashMovements.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No hay movimientos de caja registrados hoy.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {cashMovements.map((c: any) => (
                    <div key={c.id} className="p-3.5 sm:p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            c.movement_type === 'sale_cash'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : c.movement_type === 'payout_commission'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          }`}>
                            {c.movement_type}
                          </span>
                          <span className="text-slate-400 text-[11px]">{new Date(c.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 font-semibold">{c.notes || 'Operación de mostrador'}</p>
                      </div>

                      <span className={`font-black text-sm ${Number(c.amount) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {Number(c.amount) >= 0 ? `+$${Number(c.amount).toFixed(2)}` : `-$${Math.abs(Number(c.amount)).toFixed(2)}`} {c.currency}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: BILLETERA & CUENTAS BANCARIAS
            ======================================================== */}
        {currentTab === 'wallet' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">Billetera & Cuentas Bancarias</h1>
              <p className="text-xs text-slate-500 mt-0.5">Control de tus comisiones del 15% y transferencias hacia tu cuenta bancaria</p>
            </div>

            {/* Tarjetas de Balance */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <p className="text-xs font-black uppercase text-slate-400">Total Comisiones Ganadas (15%)</p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ${Number(finance.totalEarned || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Por todas las piezas procesadas en mostrador</p>
              </div>

              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <p className="text-xs font-black uppercase text-slate-400">Saldo Disponible para Retiro</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  ${Number(finance.availableBalance || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Listo para transferir a tu cuenta</p>
              </div>

              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <p className="text-xs font-black uppercase text-slate-400">Retiros en Trámite</p>
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  ${Number(finance.totalPending || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-1">En proceso de transferencia bancaria</p>
              </div>
            </div>

            {/* Cuenta Bancaria Activa */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Cuenta Bancaria para Depósitos</h3>
                  <p className="text-xs text-slate-500">Aquí enviamos tus ganancias de comisiones</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (activeBankAccount) {
                        setBankForm({
                          id: activeBankAccount.id,
                          bankName: activeBankAccount.bank_name,
                          accountHolder: activeBankAccount.account_holder,
                          accountNumber: activeBankAccount.account_number,
                          accountType: activeBankAccount.account_type || 'Ahorros',
                          routingNumber: activeBankAccount.routing_number || '',
                          documentId: activeBankAccount.document_id || '',
                          currency: activeBankAccount.currency || 'USD',
                          notes: activeBankAccount.notes || ''
                        });
                      }
                      setShowBankModal(true);
                    }}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>{activeBankAccount ? 'Cambiar Cuenta' : 'Agregar Cuenta'}</span>
                  </button>

                  <button
                    disabled={Number(finance.availableBalance || 0) <= 0 || !activeBankAccount}
                    onClick={() => {
                      setPayoutAmount(String(Number(finance.availableBalance || 0).toFixed(2)));
                      setShowPayoutModal(true);
                    }}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-black text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Solicitar Retiro</span>
                  </button>
                </div>
              </div>

              {activeBankAccount ? (
                <div className="mt-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 relative overflow-hidden shadow-md">
                  <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                        Cuenta Activa
                      </span>
                      <h4 className="text-xl font-black mt-1">{activeBankAccount.bank_name}</h4>
                      <p className="text-xs text-blue-200 font-bold">Titular: {activeBankAccount.account_holder}</p>
                      <p className="font-mono text-base tracking-widest text-white mt-1">
                        •••• •••• •••• {String(activeBankAccount.account_number).slice(-4)}
                      </p>
                    </div>
                    <div className="text-xs text-blue-200 space-y-1 sm:text-right">
                      <p>Tipo: <strong>{activeBankAccount.account_type || 'Ahorros'}</strong></p>
                      {activeBankAccount.routing_number && <p>Routing/Swift: <strong>{activeBankAccount.routing_number}</strong></p>}
                      <p>Moneda: <strong>{activeBankAccount.currency || 'USD'}</strong></p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <Landmark className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No has registrado tu cuenta bancaria aún</p>
                  <button onClick={() => setShowBankModal(true)} className="mt-3 rounded-xl bg-blue-600 text-white text-xs font-bold px-4 py-2">
                    Configurar Cuenta Ahora
                  </button>
                </div>
              )}
            </div>

            {/* Historial de Retiros */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Historial de Solicitudes de Retiro</h3>
                <p className="text-xs text-slate-500">Comprobantes y estado de tus transferencias</p>
              </div>

              {payoutRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No hay retiros registrados aún.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {payoutRequests.map((req: any) => (
                    <div key={req.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">{req.reference_number || req.id.slice(0, 10)}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            req.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}>
                            {req.status === 'completed' ? 'Transferido' : 'En Proceso'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">Banco: {req.bank_name} · {new Date(req.created_at).toLocaleString()}</p>
                      </div>
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        ${Number(req.amount).toFixed(2)} {req.currency}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: EQUIPO & EMPLEADOS (CONTROL DE ACCESOS)
            ======================================================== */}
        {currentTab === 'team' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">Equipo & Control de Accesos</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestiona a los cajeros y empleados de tu local: decide a quién darle acceso al mostrador y qué permisos otorgar.
                </p>
              </div>

              <button
                onClick={() => {
                  setEmployeeForm({
                    id: '',
                    name: '',
                    email: '',
                    phone: '',
                    role: 'cashier',
                    status: 'active',
                    pinCode: '',
                    permissions: ['pos.create', 'cash.view']
                  });
                  setShowEmployeeModal(true);
                }}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Agregar Empleado / Cajero</span>
              </button>
            </div>

            {/* Roles explicados */}
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  Cajero / Mostrador
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 pt-1">Acceso a Emitir Envíos</p>
                <p className="text-[11px] text-slate-500">Puede atender clientes, cotizar las 5 medidas y registrar cobros en efectivo/tarjeta.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                  Supervisor de Turno
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 pt-1">Cierre de Valijas & Arqueo</p>
                <p className="text-[11px] text-slate-500">Puede operar el mostrador, consolidar valijas a RD y revisar el balance de caja diaria.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                  Administrador del Local
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 pt-1">Acceso Completo</p>
                <p className="text-[11px] text-slate-500">Gestión de cuentas bancarias, solicitudes de retiros y administración de empleados.</p>
              </div>
            </div>

            {/* Listado de Empleados */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Personal Registrado ({employees.length})</h3>
                  <p className="text-xs text-slate-500">Controla quién puede iniciar sesión y emitir operaciones</p>
                </div>
                <button onClick={loadData} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {employees.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  No tienes empleados adicionales registrados. Solo tú como dueño tienes acceso actualmente.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {employees.map(emp => {
                    const perms = Array.isArray(emp.permissions) ? emp.permissions : (typeof emp.permissions === 'string' ? JSON.parse(emp.permissions || '[]') : []);
                    return (
                      <div key={emp.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-300 font-black grid place-items-center shrink-0">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-black text-sm text-slate-900 dark:text-white">{emp.name}</p>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                emp.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                              }`}>
                                {emp.status === 'active' ? 'Acceso Habilitado' : 'Suspendido'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                {emp.role === 'manager' ? 'Supervisor' : 'Cajero'}
                              </span>
                            </div>
                            <p className="text-slate-500 text-xs mt-0.5">{emp.email} {emp.phone ? `· ${emp.phone}` : ''}</p>
                            
                            {/* PIN / Clave de Entrada y Caja Chica */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                <Key className="w-3 h-3 text-amber-500" />
                                Clave / PIN Caja:
                              </span>
                              <span className="font-mono text-xs font-black bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 tracking-widest">
                                {revealedPins[emp.id] ? (emp.pin_code || 'Sin PIN') : '••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRevealedPins(prev => ({ ...prev, [emp.id]: !prev[emp.id] }))}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title={revealedPins[emp.id] ? 'Ocultar PIN' : 'Ver PIN'}
                              >
                                {revealedPins[emp.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {perms.map((p: string) => (
                                <span key={p} className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                  {p === 'pos.create' ? 'Mostrador POS' : p === 'cash.view' ? 'Arqueo Caja' : p === 'manifests.manage' ? 'Cierre Valijas' : p}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleToggleEmployeeStatus(emp)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                              emp.status === 'active'
                                ? 'border border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            {emp.status === 'active' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            <span>{emp.status === 'active' ? 'Suspender Acceso' : 'Habilitar Acceso'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setEmployeeForm({
                                id: emp.id,
                                name: emp.name,
                                email: emp.email,
                                phone: emp.phone || '',
                                role: emp.role,
                                status: emp.status,
                                pinCode: emp.pin_code || '',
                                permissions: perms
                              });
                              setShowEmployeeModal(true);
                            }}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteEmployee(emp)}
                            className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: LOCAL & PERFIL
            ======================================================== */}
        {currentTab === 'profile' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">Datos de tu Point Afiliado</h1>
              <p className="text-xs text-slate-500 mt-0.5">Información operativa de tu establecimiento y ubicación en el mapa público</p>
            </div>

            {/* Card de Co-Branding y Personalización de Marca: [Nombre Sucursal] by ship24go.com */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 grid place-items-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Personalización de Marca (Co-Branding)</h3>
                    <p className="text-[11px] text-slate-500">Muestra el nombre de tu sucursal en el mostrador y recibos térmicos</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                  by ship24go.com
                </span>
              </div>

              {/* Vista previa en vivo */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Vista Previa en Mostrador &amp; Tickets:</p>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {customBranchName || point?.business_name || 'Nombre de tu Sucursal'}
                  </h4>
                  <p className="text-xs font-extrabold text-blue-600 dark:text-cyan-400 tracking-wider lowercase">
                    by ship24go.com
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white grid place-items-center shadow-xs">
                  <Store className="w-5 h-5" />
                </div>
              </div>

              <form onSubmit={handleSaveBranchSettings} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Nombre Oficial de tu Sucursal *
                  </label>
                  <input
                    type="text"
                    required
                    value={customBranchName}
                    onChange={e => setCustomBranchName(e.target.value)}
                    placeholder="Ej: Boston Express Hub & Ship Point"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 outline-none font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Teléfono de Atención en Mostrador
                    </label>
                    <input
                      type="text"
                      value={customBranchPhone}
                      onChange={e => setCustomBranchPhone(e.target.value)}
                      placeholder="+1 617-555-0198"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 outline-none font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Dirección Impresa en Recibos
                    </label>
                    <input
                      type="text"
                      value={customBranchAddress}
                      onChange={e => setCustomBranchAddress(e.target.value)}
                      placeholder="100 Cambridge St, Boston, MA 02114"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 outline-none font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingBranchSettings}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-md shadow-blue-900/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingBranchSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Guardar Marca de Sucursal</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 font-bold">Nombre del Establecimiento</p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{point?.business_name || point?.businessName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold">Titular / Contacto Responsable</p>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{point?.contact_name || point?.contactName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold">Correo Electrónico</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{point?.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold">Teléfono de Contacto</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{point?.phone || 'No registrado'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-slate-400 font-bold">Dirección Física Verificada</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{point?.formatted_address || point?.address_line1}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{point?.city}, {point?.province} {point?.postal_code}, {point?.country}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${point?.latitude},${point?.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-300 px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Ver ubicación en Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={openChatModal}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold"
                >
                  Contactar Soporte para Actualizar Datos
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================== MODAL DE RECIBO DE MOSTRADOR ==================== */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 grid place-items-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">¡Venta Registrada con Éxito!</h3>
              <p className="text-xs text-slate-500">Ticket oficial emitido en mostrador</p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2.5 text-xs border border-slate-200/80 dark:border-slate-700">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Tracking:</span>
                <span className="font-mono font-black text-sm text-blue-600 dark:text-cyan-400">{receiptModal.trackingCode}</span>
              </div>
              <div className="flex justify-between"><span className="text-slate-500">Producto:</span><strong>{receiptModal.tariffName || receiptModal.deliveryType}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Destinatario:</span><span>{receiptModal.recipientName} ({receiptModal.recipientPhone})</span></div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Cobrado al cliente:</span>
                <div className="text-right">
                  <strong className="text-sm font-black text-slate-900 dark:text-white">${Number(receiptModal.price).toFixed(2)} USD</strong>
                  <span className="block text-xs font-black text-blue-600 dark:text-cyan-400">
                    {formatDop(receiptModal.priceDop || convertToDop(receiptModal.price))} DOP
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Tasa oficial aplicada:</span>
                <span>1 USD = {formatDop(receiptModal.exchangeRate || usdToDopRate)} DOP</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Tu Ganancia (15%):</span>
                <div className="text-right">
                  <strong className="text-sm font-black">+${Number(receiptModal.commission).toFixed(2)} USD</strong>
                  <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    ≈ {formatDop(receiptModal.commissionDop || convertToDop(receiptModal.commission))}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                onClick={() => setReceiptModal(null)}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs font-black cursor-pointer"
              >
                Nuevo Envío
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE CUENTA BANCARIA ==================== */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveBankAccount} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Configurar Cuenta Bancaria</h3>
                <p className="text-xs text-slate-500">Para recibir el pago de tus comisiones del 15%</p>
              </div>
              <button type="button" onClick={() => setShowBankModal(false)} className="p-1.5 rounded-xl text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Entidad Bancaria *</label>
                <input
                  required
                  list="bank-suggestions-list"
                  type="text"
                  placeholder="Banco BHD, Banreservas, Bank of America, Chase..."
                  value={bankForm.bankName}
                  onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 outline-none focus:border-blue-500"
                />
                <datalist id="bank-suggestions-list">
                  <option value="Banco BHD" />
                  <option value="Banreservas" />
                  <option value="Banco Popular Dominicano" />
                  <option value="Scotiabank República Dominicana" />
                  <option value="Banco Santa Cruz" />
                  <option value="Bank of America" />
                  <option value="Chase / J.P. Morgan" />
                  <option value="Wells Fargo" />
                  <option value="Citibank" />
                </datalist>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Titular de la Cuenta *</label>
                <input
                  required
                  type="text"
                  placeholder="Nombre y Apellidos o Razón Social"
                  value={bankForm.accountHolder}
                  onChange={e => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Número de Cuenta *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: 33960360019"
                    value={bankForm.accountNumber}
                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Tipo</label>
                  <select
                    value={bankForm.accountType}
                    onChange={e => setBankForm({ ...bankForm, accountType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 outline-none"
                  >
                    <option value="Ahorros">Ahorros</option>
                    <option value="Corriente">Corriente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Routing / Swift</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={bankForm.routingNumber}
                    onChange={e => setBankForm({ ...bankForm, routingNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Cédula / RNC</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={bankForm.documentId}
                    onChange={e => setBankForm({ ...bankForm, documentId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button type="button" onClick={() => setShowBankModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                Cancelar
              </button>
              <button type="submit" disabled={bankSaving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black">
                {bankSaving ? 'Guardando…' : 'Guardar Cuenta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL DE RETIRO DE FONDOS ==================== */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRequestPayout} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Solicitar Retiro de Fondos</h3>
                <p className="text-xs text-slate-500">Transferencia hacia tu cuenta bancaria</p>
              </div>
              <button type="button" onClick={() => setShowPayoutModal(false)} className="p-1.5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Balance Disponible</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  ${Number(finance.availableBalance || 0).toFixed(2)} <span className="text-xs">{finance.currency || 'USD'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayoutAmount(String(Number(finance.availableBalance || 0).toFixed(2)))}
                className="text-xs font-black text-emerald-700 underline"
              >
                Retirar Todo
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Monto a Retirar (USD) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="1"
                  max={Number(finance.availableBalance || 0)}
                  placeholder="0.00"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-sm font-black outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Cuenta Bancaria de Destino</label>
                <select
                  value={payoutAccountId}
                  onChange={e => setPayoutAccountId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs outline-none"
                >
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bank_name} - ****{String(b.account_number).slice(-4)} ({b.account_holder})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button type="button" onClick={() => setShowPayoutModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                Cancelar
              </button>
              <button type="submit" disabled={payoutSubmitting || !Number(payoutAmount)} className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black">
                {payoutSubmitting ? 'Procesando…' : 'Confirmar Retiro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL INICIAR TURNO / ABRIR CAJA CHICA ==================== */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleOpenShift} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 grid place-items-center">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Abrir Turno / Caja Chica</h3>
                  <p className="text-xs text-slate-500">Ingreso del fondo inicial para cambio en mostrador</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowOpenShiftModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">¿Quién atiende el mostrador? *</label>
                <select
                  required
                  value={openShiftForm.employeeId}
                  onChange={e => setOpenShiftForm({ ...openShiftForm, employeeId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 outline-none font-medium"
                >
                  <option value="">-- Seleccionar Cajero / Empleado --</option>
                  {employees.filter(e => e.status === 'active').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role === 'manager' ? 'Supervisor' : 'Cajero'})
                    </option>
                  ))}
                  <option value="">{point?.business_name || 'Dueño / Administrador del Local'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Clave o PIN de Entrada *
                </label>
                <div className="relative">
                  <input
                    type={showOpenShiftPin ? 'text' : 'password'}
                    required
                    maxLength={8}
                    placeholder="Introduce el PIN de 4 dígitos"
                    value={openShiftForm.pinCode}
                    onChange={e => setOpenShiftForm({ ...openShiftForm, pinCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-3.5 pr-10 py-2 outline-none font-mono tracking-widest font-black text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenShiftPin(!showOpenShiftPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOpenShiftPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">El cajero debe confirmar su PIN registrado.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Fondo Inicial de Caja Chica ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="50.00"
                    value={openShiftForm.openingAmount}
                    onChange={e => setOpenShiftForm({ ...openShiftForm, openingAmount: e.target.value })}
                    className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 pl-8 pr-4 py-2 outline-none font-black text-base text-emerald-700 dark:text-emerald-300"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Monto en billetes pequeños y monedas entregado para cambio.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Notas de Apertura (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Billetes de $5 y monedas"
                  value={openShiftForm.notes}
                  onChange={e => setOpenShiftForm({ ...openShiftForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button type="button" onClick={() => setShowOpenShiftModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={shiftSubmitting} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer">
                {shiftSubmitting ? 'Iniciando…' : 'Confirmar Apertura'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL REALIZAR CIERRE DE CAJA ==================== */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCloseShift} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 grid place-items-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Cierre de Caja & Arqueo</h3>
                  <p className="text-xs text-slate-500">Cuadre del fondo de caja chica y cobros en efectivo</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowCloseShiftModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resumen de Sistema */}
            {(() => {
              const openAmt = Number(cashSummary?.activeShift?.opening_cash_amount || 0);
              const salesAmt = Number(cashSummary?.shiftCashSalesToday || 0);
              const expectedAmt = openAmt + salesAmt;
              const countedAmt = parseFloat(closeShiftForm.countedCash) || 0;
              const diff = closeShiftForm.countedCash !== '' ? countedAmt - expectedAmt : null;

              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Fondo Inicial de Caja Chica:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">${openAmt.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>+ Cobros en Efectivo de Mostrador:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+${salesAmt.toFixed(2)}</strong>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                      <span>Total Efectivo Esperado:</span>
                      <span className="font-mono text-blue-600 dark:text-cyan-400">${expectedAmt.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">¿Quién realiza el cierre? *</label>
                    <select
                      required
                      value={closeShiftForm.employeeId}
                      onChange={e => setCloseShiftForm({ ...closeShiftForm, employeeId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 outline-none font-medium"
                    >
                      <option value="">-- Seleccionar Responsable --</option>
                      {employees.filter(e => e.status === 'active').map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role === 'manager' ? 'Supervisor' : 'Cajero'})
                        </option>
                      ))}
                      <option value="">{point?.business_name || 'Dueño / Administrador del Local'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Clave o PIN de Autorización *
                    </label>
                    <div className="relative">
                      <input
                        type={showCloseShiftPin ? 'text' : 'password'}
                        required
                        maxLength={8}
                        placeholder="PIN del responsable"
                        value={closeShiftForm.pinCode}
                        onChange={e => setCloseShiftForm({ ...closeShiftForm, pinCode: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-3.5 pr-10 py-2 outline-none font-mono tracking-widest font-black text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCloseShiftPin(!showCloseShiftPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCloseShiftPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Efectivo Contado Físicamente en Gaveta ($ USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        value={closeShiftForm.countedCash}
                        onChange={e => setCloseShiftForm({ ...closeShiftForm, countedCash: e.target.value })}
                        className="w-full rounded-xl border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-900 pl-8 pr-4 py-2.5 outline-none font-black text-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Cuadre en tiempo real */}
                  {diff !== null && (
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      diff === 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : diff > 0
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                        : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
                    }`}>
                      <span className="font-bold">
                        {diff === 0 ? '✅ Cuadre Exacto' : diff > 0 ? 'ℹ️ Sobrante en Caja:' : '⚠️ Faltante en Caja:'}
                      </span>
                      <span className="font-mono font-black text-sm">
                        {diff === 0 ? '$0.00 USD' : `${diff > 0 ? '+' : ''}$${diff.toFixed(2)} USD`}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Notas del Cierre (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: Cuadre realizado sin novedades"
                      value={closeShiftForm.notes}
                      onChange={e => setCloseShiftForm({ ...closeShiftForm, notes: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 outline-none"
                    />
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-2.5 pt-2">
              <button type="button" onClick={() => setShowCloseShiftModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={shiftSubmitting || !closeShiftForm.countedCash} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black cursor-pointer">
                {shiftSubmitting ? 'Cerrando…' : 'Confirmar Cierre'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL DE GESTIÓN DE EMPLEADOS ==================== */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEmployee} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {employeeForm.id ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
                </h3>
                <p className="text-xs text-slate-500">Asigna permisos y nivel de acceso al mostrador</p>
              </div>
              <button type="button" onClick={() => setShowEmployeeModal(false)} className="p-1.5 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Laura Mercedes"
                  value={employeeForm.name}
                  onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Correo Electrónico *</label>
                <input
                  required
                  type="email"
                  placeholder="laura@ejemplo.com"
                  value={employeeForm.email}
                  onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="809-555-0100"
                    value={employeeForm.phone}
                    onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Rol</label>
                  <select
                    value={employeeForm.role}
                    onChange={e => {
                      const newRole = e.target.value;
                      setEmployeeForm({
                        ...employeeForm,
                        role: newRole,
                        permissions: newRole === 'manager'
                          ? ['pos.create', 'cash.view', 'manifests.manage', 'wallet.view']
                          : ['pos.create', 'cash.view']
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 outline-none"
                  >
                    <option value="cashier">Cajero / Mostrador</option>
                    <option value="manager">Supervisor / Encargado</option>
                  </select>
                </div>
              </div>

              {/* Clave / PIN de Acceso (Caja Chica y Turno) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 dark:text-amber-200 flex items-center gap-1.5 text-xs">
                    <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Clave / PIN de Entrada & Caja Chica *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
                      setEmployeeForm({ ...employeeForm, pinCode: randomPin });
                    }}
                    className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    Generar PIN aleatorio
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showModalPin ? 'text' : 'password'}
                    required
                    maxLength={8}
                    placeholder="Ej: 1234"
                    value={employeeForm.pinCode}
                    onChange={e => setEmployeeForm({ ...employeeForm, pinCode: e.target.value })}
                    className="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 pl-3.5 pr-10 py-2 outline-none focus:border-amber-500 font-mono tracking-widest text-sm font-black text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPin(!showModalPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showModalPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                  >
                    {showModalPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1.5">
                  Clave requerida para que el empleado abra su turno en el mostrador, reciba el fondo de caja chica y realice el arqueo/cierre de caja.
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-600 dark:text-slate-300 mb-1.5">Permisos Habilitados</p>
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={employeeForm.permissions.includes('pos.create')}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...employeeForm.permissions, 'pos.create']
                          : employeeForm.permissions.filter(p => p !== 'pos.create');
                        setEmployeeForm({ ...employeeForm, permissions: next });
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>Emitir envíos en Mostrador POS</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={employeeForm.permissions.includes('cash.view')}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...employeeForm.permissions, 'cash.view']
                          : employeeForm.permissions.filter(p => p !== 'cash.view');
                        setEmployeeForm({ ...employeeForm, permissions: next });
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>Ver arqueo y libro diario de caja</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={employeeForm.permissions.includes('manifests.manage')}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...employeeForm.permissions, 'manifests.manage']
                          : employeeForm.permissions.filter(p => p !== 'manifests.manage');
                        setEmployeeForm({ ...employeeForm, permissions: next });
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>Cerrar Valijas y Lotes a RD</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button type="button" onClick={() => setShowEmployeeModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                Cancelar
              </button>
              <button type="submit" disabled={employeeSaving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black">
                {employeeSaving ? 'Guardando…' : 'Guardar Empleado'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL DE IMPRESIÓN TÉRMICA & COURIER ==================== */}
      {printModalOpen && printShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-300 grid place-items-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Impresión de Recibo & Etiqueta</h3>
                  <p className="text-xs text-slate-500">Selecciona el formato para tu impresora térmica o estándar</p>
                </div>
              </div>
              <button onClick={() => setPrintModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Formato */}
            <div className="p-3 bg-slate-100/70 dark:bg-slate-950 flex gap-2 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPrintFormat('thermal_80')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  printFormat === 'thermal_80'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                🧾 Térmica 80 mm
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('thermal_58')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  printFormat === 'thermal_58'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                🧾 Térmica 50/58 mm
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('courier_label')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  printFormat === 'courier_label'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                🏷️ Etiqueta 4x6"
              </button>
            </div>

            {/* Preview del Ticket */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-200 dark:bg-slate-950/80 flex justify-center">
              <div
                id="receipt-print-area"
                className={`bg-white text-black p-5 shadow-lg border border-slate-300 font-mono text-[12px] leading-tight ${
                  printFormat === 'thermal_80'
                    ? 'w-[320px] max-w-full'
                    : printFormat === 'thermal_58'
                    ? 'w-[230px] max-w-full text-[10px]'
                    : 'w-[380px] max-w-full text-xs font-sans p-6'
                }`}
              >
                {printFormat === 'courier_label' ? (
                  /* Formato Etiqueta Courier 4x6 */
                  <div className="space-y-3 border-2 border-black p-3">
                    <div className="flex items-center justify-between border-b-2 border-black pb-2">
                      <div>
                        <strong className="text-base font-black tracking-tighter uppercase">{point?.business_name || 'SHIP24GO EXPRESS'}</strong>
                        <p className="text-[9px] font-extrabold lowercase text-gray-700">by ship24go.com</p>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-black text-white rounded">
                        USA ➡️ REP. DOM.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-black pb-2">
                      <div>
                        <p className="text-[9px] uppercase font-black text-gray-600">FROM (Origen):</p>
                        <p className="font-bold">{point.business_name}</p>
                        <p>{point.city}, {point.country}</p>
                        <p>{point.phone}</p>
                      </div>
                      <div className="border-l border-black pl-2">
                        <p className="text-[9px] uppercase font-black text-gray-600">HUB DESTINO:</p>
                        <p className="font-bold">HUB Santo Domingo (SDQ)</p>
                        <p className="text-[10px]">República Dominicana</p>
                      </div>
                    </div>

                    <div className="border-b-2 border-black pb-2">
                      <p className="text-[9px] uppercase font-black text-gray-600">TO (Destinatario en RD):</p>
                      <p className="text-sm font-black uppercase">{printShipment.recipient?.name || 'Cliente'}</p>
                      <p className="font-bold text-xs mt-0.5">📞 {printShipment.recipient?.phone}</p>
                      <p className="mt-1 text-[11px] leading-normal">{printShipment.recipient?.address}</p>
                      <p className="font-bold uppercase text-[11px]">{printShipment.recipient?.city}, Rep. Dominicana</p>
                      {printShipment.recipient?.idNumber && <p className="text-[10px]">Cédula: {printShipment.recipient?.idNumber}</p>}
                    </div>

                    <div className="text-center py-2 border-b-2 border-black">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Rastreo Internacional</p>
                      <p className="text-lg font-black tracking-widest">{printShipment.trackingCode}</p>
                      {/* Simulación Barcode SVG Code128 */}
                      <svg className="w-full h-12 mx-auto my-1" viewBox="0 0 200 40">
                        <rect x="0" y="0" width="200" height="40" fill="white" />
                        {[4,8,12,18,22,28,34,38,42,48,54,60,66,70,76,82,88,94,98,104,110,116,122,128,134,140,146,152,158,164,170,176,182,188,194].map(x => (
                          <line key={x} x1={x} y1="0" x2={x} y2="40" stroke="black" strokeWidth={x % 3 === 0 ? "3" : "1.5"} />
                        ))}
                      </svg>
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span>Servicio: <strong>{printShipment.productName || printShipment.productCode}</strong></span>
                      <span className="font-black uppercase bg-black text-white px-2 py-0.5">
                        {printShipment.recipient?.address?.toLowerCase().includes('sucursal') ? 'SUCURSAL RD' : 'DOMICILIO'}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Formato Recibo Térmico (80mm / 58mm) */
                  <div className="space-y-1 text-center">
                    <p className="text-base font-black tracking-tight uppercase">{point?.business_name || 'SUCURSAL'}</p>
                    <p className="text-[11px] font-extrabold tracking-wider text-slate-700 lowercase">by ship24go.com</p>
                    <p className="text-[10px]">{point.address || 'Local Afiliado'}</p>
                    <p className="text-[10px]">{point.city}, {point.country} · Tel: {point.phone}</p>
                    <div className="border-t border-dashed border-black my-1" />

                    <div className="flex justify-between text-[10px]">
                      <span>RECIBO: {printShipment.trackingCode?.slice(-6)}</span>
                      <span>{new Date(printShipment.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="border-t border-dashed border-black my-1" />

                    <div className="text-left space-y-1">
                      <p className="font-black uppercase text-center text-sm tracking-wider my-1">
                        {printShipment.trackingCode}
                      </p>
                      <p className="text-[10px]"><strong>REMITENTE:</strong> {printShipment.sender?.name || point.business_name}</p>
                      <p className="text-[10px]"><strong>DESTINATARIO RD:</strong> {printShipment.recipient?.name}</p>
                      <p className="text-[10px]"><strong>TELÉFONO RD:</strong> {printShipment.recipient?.phone}</p>
                      <p className="text-[10px]"><strong>CIUDAD:</strong> {printShipment.recipient?.city}, RD</p>
                      <p className="text-[10px]"><strong>ENTREGA:</strong> {printShipment.recipient?.address}</p>
                    </div>

                    <div className="border-t border-dashed border-black my-1" />

                    <div className="text-left space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span>Servicio:</span>
                        <strong className="text-right">{printShipment.productName || printShipment.productCode}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Modalidad:</span>
                        <span>{printShipment.recipient?.address?.toLowerCase().includes('sucursal') ? 'Sucursal RD' : 'Domicilio'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pago:</span>
                        <span className="uppercase font-bold">{printShipment.paymentMethod || 'Efectivo'}</span>
                      </div>
                    </div>

                    <div className="border-t-2 border-black my-1" />

                    <div className="flex justify-between items-center text-sm font-black py-0.5">
                      <span>TOTAL COBRADO:</span>
                      <span>${Number(printShipment.saleAmount || 0).toFixed(2)} USD</span>
                    </div>

                    <div className="border-t border-dashed border-black my-2" />

                    <div className="pt-1">
                      <p className="text-[10px] font-bold">Rastrea tu paquete 24/7 en:</p>
                      <p className="text-[11px] font-black text-blue-900 mt-0.5">ship24go.com/track</p>
                      <p className="text-[9px] text-gray-600 mt-2">
                        Conserve este comprobante. Para asistencia llame a su sucursal o escriba a soporte@ship24go.com
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal con Botón Imprimir */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 bg-slate-50/80 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL ENVIAR RECIBO POR CORREO ==================== */}
      {emailModalOpen && emailShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSendEmailReceipt} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 grid place-items-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Enviar Recibo por Correo</h3>
                  <p className="text-xs text-slate-500">Notificación digital oficial con enlace de rastreo</p>
                </div>
              </div>
              <button type="button" onClick={() => setEmailModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Código de Rastreo:</span>
                <strong className="font-mono text-blue-600 dark:text-cyan-400">{emailShipment.trackingCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destinatario en RD:</span>
                <strong className="text-slate-900 dark:text-white">{emailShipment.recipient?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Cobrado:</span>
                <strong className="text-emerald-600">${Number(emailShipment.saleAmount || 0).toFixed(2)} USD</strong>
              </div>
            </div>

            <div>
              <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico de Destino *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="cliente@ejemplo.com"
                  value={emailTarget}
                  onChange={e => setEmailTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {emailShipment.recipient?.email && (
                  <button
                    type="button"
                    onClick={() => setEmailTarget(emailShipment.recipient.email)}
                    className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    Usar correo destinatario
                  </button>
                )}
                {emailShipment.sender?.email && (
                  <button
                    type="button"
                    onClick={() => setEmailTarget(emailShipment.sender.email)}
                    className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    Usar correo remitente
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sendingEmail || !emailTarget}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando…</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Enviar Recibo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL CHAT CON EJECUTIVO ==================== */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl h-[600px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                {point?.executive?.avatar_url ? (
                  <img src={point.executive.avatar_url} alt="Ejecutivo" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    {(point?.executive?.name || 'S').charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">{point?.executive?.name || 'Soporte Central Point'}</h3>
                  <p className="text-[11px] text-slate-400">Account Executive asignado a tu local</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/30">
              {chatLoading ? (
                <div className="py-10 text-center text-slate-400 text-xs">Cargando chat…</div>
              ) : chatMessages.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">Escribe para iniciar conversación con tu ejecutivo.</div>
              ) : (
                chatMessages.map(msg => {
                  const isMe = msg.sender_role === 'point';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-400 mb-0.5 px-1">{msg.sender_name}</span>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs ${
                        isMe ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={sendChatMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Escribe tu consulta u operación a resolver…"
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={chatSending || !chatInput.trim()}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
