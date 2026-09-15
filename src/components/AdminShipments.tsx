import React, { useState, useEffect, useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, PlusCircle, Edit, Save, Eye, Trash2, Upload, Download, FileText, 
  CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Search, 
  Filter, PlayCircle, Clock, User, Phone, Mail, MapPin, X, ArrowRight, 
  ShieldCheck, Truck, Layers, FileCheck, Copy, Check, ChevronRight,
  ArrowUpRight, AlertCircle, FileSpreadsheet, Sparkles, Archive, ArchiveRestore,
  CheckSquare, Square, MinusSquare, ChevronDown
} from 'lucide-react';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';

// Error Boundary to prevent blank screens under any circumstances
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
export class AdminShipmentsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AdminShipments error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-3xl shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Error al cargar la vista de envíos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Ocurrió una excepción al procesar los datos. Puedes recargar la interfaz para reanudar la sesión de forma segura.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md"
          >
            Recargar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Carrier normalization & badge helpers
const normalizeAdminCarrierText = (value: any) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const displayAdminCarrierName = (value: any) => {
  const text = normalizeAdminCarrierText(value);
  if (!text) return 'Logihub';
  if (text.includes('ups')) return 'UPS';
  if (text.includes('inpost') || text.includes('in post')) return 'InPost';
  if (text.includes('poste italiane') || (text.includes('poste') && text.includes('ital'))) return 'Poste Italiane';
  if (text.includes('sda')) return 'SDA';
  if (text.includes('brt') || text.includes('bartolini')) return 'BRT';
  if (text.includes('dhl')) return 'DHL';
  if (text.includes('gls')) return 'GLS';
  if (text.includes('fedex')) return 'FedEx';
  if (text.includes('seur')) return 'SEUR';
  if (text.includes('correos express')) return 'Correos Express';
  if (text.includes('correos')) return 'Correos';
  if (['paccofacile','genei','parcelabc','parcel abc','spedirepro','spedire pro','spediamopro','spediamo pro','ship24go','logihub','red logistica'].some((name) => text.includes(name))) return 'Logihub';
  return String(value || 'Logihub').replace(/\s+/g, ' ').slice(0, 42);
};

const getCarrierBadgeStyle = (carrierName: string) => {
  const norm = normalizeAdminCarrierText(carrierName);
  if (norm.includes('ups')) {
    return 'bg-amber-900/10 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border-amber-800/20';
  }
  if (norm.includes('dhl')) {
    return 'bg-yellow-500/15 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 border-yellow-500/30';
  }
  if (norm.includes('fedex')) {
    return 'bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/30';
  }
  if (norm.includes('gls')) {
    return 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-500/30';
  }
  if (norm.includes('seur')) {
    return 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/30';
  }
  if (norm.includes('inpost')) {
    return 'bg-amber-400/20 text-amber-900 dark:bg-amber-400/25 dark:text-amber-200 border-amber-400/30';
  }
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
};

export const AdminShipmentsComponent = () => {
  const { t } = useI18n();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMap, setActionMap] = useState<Record<string, boolean>>({});
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [routeSheetFilter, setRouteSheetFilter] = useState('all');
  const [archiveFilter, setArchiveFilter] = useState<'active' | 'archived' | 'all'>('active');

  // Modal state
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'route_sheet' | 'audit'>('edit');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // Delete Confirmation Modal state (single or bulk)
  const [shipmentToDelete, setShipmentToDelete] = useState<any | null>(null);
  const [isBulkDeleteModal, setIsBulkDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Status dropdown state
  const [isBulkStatusMenuOpen, setIsBulkStatusMenuOpen] = useState(false);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: '',
    statusLabel: '',
    carrierName: '',
    providerTrackingCode: '',
    trackingCode: '',
    adminNotes: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientAddress: '',
    recipientCity: '',
    recipientZipCode: '',
    recipientCountry: ''
  });

  // Route sheet upload state
  const [routeSheetFile, setRouteSheetFile] = useState<{ fileData: string; fileName: string } | null>(null);
  const [uploadingSheet, setUploadingSheet] = useState(false);
  const [deletingSheet, setDeletingSheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = () => {
    setLoading(true);
    api.getAdminShipments().then(res => {
      setShipments(res.shipments || []);
      setLoading(false);
      if (selectedShipment) {
        const updated = (res.shipments || []).find((s: any) => s.id === selectedShipment.id);
        if (updated) setSelectedShipment(updated);
      }
    }).catch((err) => {
      console.error('Error fetching admin shipments:', err);
      setLoading(false);
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTracking(id);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateAdminShipmentStatus(id, newStatus);
      fetchShipments();
    } catch (error) {
      alert('Error al actualizar el estado del envío.');
    }
  };

  // Archive / Unarchive Handler (Single)
  const handleToggleArchive = async (shipment: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const willArchive = !Boolean(shipment.isArchived);
    const confirmMsg = willArchive 
      ? `¿Archivar el envío ${shipment.trackingCode}? Se moverá a la pestaña 'Archivados'.`
      : `¿Desarchivar y restaurar el envío ${shipment.trackingCode} a la lista activa?`;

    if (!confirm(confirmMsg)) return;

    setActionMap(prev => ({ ...prev, [shipment.id]: true }));
    try {
      const res = await api.archiveAdminShipment(shipment.id, willArchive);
      setEditSuccessMsg(res.message || (willArchive ? 'Envío archivado.' : 'Envío restaurado.'));
      setTimeout(() => setEditSuccessMsg(''), 4000);
      fetchShipments();
    } catch (err: any) {
      alert(err?.message || 'Error al cambiar estado de archivo.');
    } finally {
      setActionMap(prev => ({ ...prev, [shipment.id]: false }));
    }
  };

  // Delete Handler (Single)
  const handleConfirmDelete = async () => {
    if (!shipmentToDelete) return;
    setIsDeleting(true);

    try {
      await api.deleteAdminShipment(shipmentToDelete.id);
      if (selectedShipment && selectedShipment.id === shipmentToDelete.id) {
        setSelectedShipment(null);
      }
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(shipmentToDelete.id);
        return next;
      });
      setShipmentToDelete(null);
      fetchShipments();
      alert(`El envío ${shipmentToDelete.trackingCode} ha sido eliminado permanentemente.`);
    } catch (err: any) {
      alert(err?.message || 'No se pudo eliminar el envío.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedIds.size >= filteredShipments.length && filteredShipments.length > 0) {
      // Clear all
      setSelectedIds(new Set());
    } else {
      // Select all visible
      const next = new Set<string>();
      filteredShipments.forEach(s => next.add(s.id));
      setSelectedIds(next);
    }
  };

  // BULK ACTIONS
  // 1. Bulk Archive / Unarchive
  const handleBulkArchive = async (shouldArchive: boolean) => {
    if (selectedIds.size === 0) return;
    const actionName = shouldArchive ? 'archivar' : 'desarchivar y restaurar';
    if (!confirm(`¿Deseas ${actionName} los ${selectedIds.size} envíos seleccionados?`)) return;

    setIsProcessingBulk(true);
    try {
      const res = await api.adminBulkArchiveShipments(Array.from(selectedIds), shouldArchive);
      alert(res.message || 'Operación en lote completada con éxito.');
      setSelectedIds(new Set());
      fetchShipments();
    } catch (err: any) {
      alert(err?.message || 'Error al procesar la acción en lote.');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // 2. Bulk Delete
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const ids: string[] = Array.from(selectedIds);
      const res = await api.adminBulkDeleteShipments(ids);
      alert(res.message || `${ids.length} envíos eliminados.`);
      setSelectedIds(new Set());
      setIsBulkDeleteModal(false);
      fetchShipments();
    } catch (err: any) {
      alert(err?.message || 'Error al eliminar envíos en lote.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 3. Bulk Status Update
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    setIsBulkStatusMenuOpen(false);
    setIsProcessingBulk(true);
    try {
      const ids: string[] = Array.from(selectedIds);
      const res = await api.adminBulkUpdateStatus(ids, newStatus);
      alert(res.message || `Estado actualizado a '${newStatus}' para ${ids.length} envíos.`);
      setSelectedIds(new Set());
      fetchShipments();
    } catch (err: any) {
      alert(err?.message || 'Error al actualizar estado en lote.');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handlePrepareShipment = async (shipment: any) => {
    setActionMap(prev => ({ ...prev, [shipment.id]: true }));
    try {
      const res = await api.retryShipmentLabel(shipment.id);
      alert(res.message || 'Preparación en curso.');
      fetchShipments();
    } catch (error: any) {
      alert(error?.message || 'No se pudo completar la preparación.');
    } finally {
      setActionMap(prev => ({ ...prev, [shipment.id]: false }));
    }
  };

  // Open modal with shipment data
  const openShipmentModal = (shipment: any, initialTab: 'edit' | 'route_sheet' | 'audit' = 'edit') => {
    setSelectedShipment(shipment);
    setActiveTab(initialTab);
    setEditSuccessMsg('');
    setEditErrorMsg('');
    setRouteSheetFile(null);

    const rec = shipment.recipient || {};
    setEditForm({
      status: shipment.statusCode || shipment.status || 'created',
      statusLabel: shipment.status || 'Creado',
      carrierName: shipment.carrierName || '',
      providerTrackingCode: shipment.providerTracking || '',
      trackingCode: shipment.trackingCode || '',
      adminNotes: shipment.adminNotes || '',
      recipientName: rec.name || rec.fullName || '',
      recipientPhone: rec.phone || '',
      recipientEmail: rec.email || '',
      recipientAddress: rec.address || rec.street || '',
      recipientCity: rec.city || '',
      recipientZipCode: rec.zipCode || rec.postalCode || rec.zip_code || '',
      recipientCountry: rec.country || 'ES'
    });
  };

  // Save shipment edits
  const handleSaveShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setSavingEdit(true);
    setEditSuccessMsg('');
    setEditErrorMsg('');

    try {
      await api.updateAdminShipment(selectedShipment.id, {
        status: editForm.status,
        statusLabel: editForm.statusLabel,
        carrierName: editForm.carrierName,
        providerTrackingCode: editForm.providerTrackingCode,
        trackingCode: editForm.trackingCode,
        adminNotes: editForm.adminNotes,
        recipient: {
          name: editForm.recipientName,
          fullName: editForm.recipientName,
          phone: editForm.recipientPhone,
          email: editForm.recipientEmail,
          address: editForm.recipientAddress,
          city: editForm.recipientCity,
          zipCode: editForm.recipientZipCode,
          zip_code: editForm.recipientZipCode,
          country: editForm.recipientCountry
        }
      });
      setEditSuccessMsg('¡Cambios guardados con éxito y registrados en la auditoría!');
      fetchShipments();
      setTimeout(() => setEditSuccessMsg(''), 4000);
    } catch (err: any) {
      setEditErrorMsg(err?.message || 'Error al guardar los cambios.');
    } finally {
      setSavingEdit(false);
    }
  };

  // File selection for route sheet
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('El archivo supera el tamaño máximo permitido de 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRouteSheetFile({
          fileData: reader.result,
          fileName: file.name
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Route Sheet
  const handleUploadRouteSheet = async () => {
    if (!selectedShipment || !routeSheetFile) return;
    setUploadingSheet(true);
    setEditSuccessMsg('');
    setEditErrorMsg('');

    try {
      await api.uploadAdminRouteSheet(selectedShipment.id, routeSheetFile);
      setEditSuccessMsg('¡Hoja de ruta cargada exitosamente!');
      setRouteSheetFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchShipments();
      setTimeout(() => setEditSuccessMsg(''), 4000);
    } catch (err: any) {
      setEditErrorMsg(err?.message || 'Error al subir la hoja de ruta.');
    } finally {
      setUploadingSheet(false);
    }
  };

  // Delete Route Sheet
  const handleDeleteRouteSheet = async () => {
    if (!selectedShipment) return;
    if (!confirm('¿Estás seguro de eliminar la hoja de ruta asignada a este envío?')) return;
    setDeletingSheet(true);
    setEditSuccessMsg('');
    setEditErrorMsg('');

    try {
      await api.deleteAdminRouteSheet(selectedShipment.id);
      setEditSuccessMsg('Hoja de ruta eliminada.');
      fetchShipments();
      setTimeout(() => setEditSuccessMsg(''), 4000);
    } catch (err: any) {
      setEditErrorMsg(err?.message || 'Error al eliminar la hoja de ruta.');
    } finally {
      setDeletingSheet(false);
    }
  };

  // Export to CSV (Support full or selected only)
  const handleExportCSV = (onlySelected = false) => {
    const targetShipments = onlySelected
      ? shipments.filter(s => selectedIds.has(s.id))
      : filteredShipments;

    if (targetShipments.length === 0) {
      alert('No hay envíos para exportar.');
      return;
    }

    const headers = ['Tracking', 'Carrier', 'Creador_Nombre', 'Creador_Email', 'Creador_Rol', 'Destinatario_Nombre', 'Destinatario_Ciudad', 'Destinatario_Pais', 'Estado', 'Archivado', 'Hoja_de_Ruta', 'Fecha_Creacion'];
    const rows = targetShipments.map(s => [
      `"${s.trackingCode || ''}"`,
      `"${s.carrierName || ''}"`,
      `"${(s.creator?.name || '').replace(/"/g, '""')}"`,
      `"${s.creator?.email || ''}"`,
      `"${s.creator?.role || 'customer'}"`,
      `"${(s.recipient?.name || s.recipient?.fullName || '').replace(/"/g, '""')}"`,
      `"${(s.recipient?.city || '').replace(/"/g, '""')}"`,
      `"${s.recipient?.country || ''}"`,
      `"${s.status || ''}"`,
      `"${s.isArchived ? 'SI' : 'NO'}"`,
      `"${s.routeSheetUrl ? 'SI' : 'NO'}"`,
      `"${new Date(s.createdAt).toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ship24go-envios-${onlySelected ? 'seleccionados-' : ''}${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s: any) => {
      // Archive filter
      const isArchived = Boolean(s.isArchived);
      if (archiveFilter === 'active' && isArchived) return false;
      if (archiveFilter === 'archived' && !isArchived) return false;

      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tracking = String(s.trackingCode || '').toLowerCase();
        const providerTr = String(s.providerTracking || '').toLowerCase();
        const creatorName = String(s.creator?.name || '').toLowerCase();
        const creatorEmail = String(s.creator?.email || '').toLowerCase();
        const recipientName = String(s.recipient?.name || s.recipient?.fullName || '').toLowerCase();
        const carrier = String(s.carrierName || '').toLowerCase();
        const matches = tracking.includes(q) || providerTr.includes(q) || creatorName.includes(q) || creatorEmail.includes(q) || recipientName.includes(q) || carrier.includes(q);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const normStatus = String(s.status || '').toLowerCase();
        const normCode = String(s.statusCode || '').toLowerCase();
        const filterLower = statusFilter.toLowerCase();
        if (!normStatus.includes(filterLower) && !normCode.includes(filterLower)) {
          return false;
        }
      }

      // Route sheet filter
      if (routeSheetFilter === 'with' && !s.routeSheetUrl) return false;
      if (routeSheetFilter === 'without' && s.routeSheetUrl) return false;

      return true;
    });
  }, [shipments, searchQuery, statusFilter, routeSheetFilter, archiveFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = shipments.length;
    const activeCount = shipments.filter(s => !s.isArchived).length;
    const archivedCount = shipments.filter(s => Boolean(s.isArchived)).length;
    const inTransit = shipments.filter(s => !s.isArchived && ['en tránsito', 'en reparto', 'recogida programada', 'in_transit', 'out_for_delivery', 'scheduled_pickup'].some(st => String(s.status || '').toLowerCase().includes(st))).length;
    const delivered = shipments.filter(s => !s.isArchived && (String(s.status || '').toLowerCase().includes('entregado') || String(s.statusCode || '').toLowerCase() === 'delivered')).length;
    const withRouteSheet = shipments.filter(s => !s.isArchived && Boolean(s.routeSheetUrl)).length;
    const deliveryRate = activeCount > 0 ? Math.round((delivered / activeCount) * 100) : 0;
    return { total, activeCount, archivedCount, inTransit, delivered, withRouteSheet, deliveryRate };
  }, [shipments]);

  // Checkbox select-all state
  const isAllSelected = filteredShipments.length > 0 && selectedIds.size >= filteredShipments.length;
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1680px] mx-auto space-y-6 pb-28">
      {/* Modern Top Breadcrumbs & Aura Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            {/* Breadcrumb / Tag pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Super Admin</span>
              <span className="text-white/40">&bull;</span>
              <span>Operaciones Logísticas</span>
              <span className="text-white/40">&bull;</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Auditoría en Vivo
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{t('totalShipments') || 'Registro Global de Envíos'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supervisión de paquetería multirremitente, trazabilidad de creadores, edición operativa de envíos, archivo y eliminación segura en lote.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/quote"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Cotizar & Crear Envío</span>
            </Link>

            <button
              onClick={() => handleExportCSV(false)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/15 hover:border-white/25 transition-all cursor-pointer"
              title="Exportar registros visibles a CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Exportar</span>
            </button>

            <button 
              onClick={fetchShipments} 
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/15 hover:border-white/25 transition-all cursor-pointer"
              title="Actualizar listado"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-300' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (Interactive Filter Chips) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Shipments */}
        <div 
          onClick={() => { setStatusFilter('all'); setRouteSheetFilter('all'); setArchiveFilter('active'); }}
          className={`cursor-pointer group p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-sm hover:shadow-md ${
            statusFilter === 'all' && routeSheetFilter === 'all' && archiveFilter === 'active'
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-400/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Activos
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.activeCount}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Envíos operativos</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:underline text-[11px]">Ver activos &rarr;</span>
          </p>
        </div>

        {/* In Transit */}
        <div 
          onClick={() => { setStatusFilter('En Tránsito'); setArchiveFilter('active'); }}
          className={`cursor-pointer group p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-sm hover:shadow-md ${
            statusFilter === 'En Tránsito'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-amber-400/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Ruta
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics.inTransit}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>En tránsito o reparto</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:underline text-[11px]">Filtrar &rarr;</span>
          </p>
        </div>

        {/* Delivered */}
        <div 
          onClick={() => { setStatusFilter('Entregado'); setArchiveFilter('active'); }}
          className={`cursor-pointer group p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-sm hover:shadow-md ${
            statusFilter === 'Entregado'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              {metrics.deliveryRate}% Éxito
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.delivered}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Entregados con éxito</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline text-[11px]">Filtrar &rarr;</span>
          </p>
        </div>

        {/* Route Sheets */}
        <div 
          onClick={() => { setRouteSheetFilter(routeSheetFilter === 'with' ? 'all' : 'with'); setArchiveFilter('active'); }}
          className={`cursor-pointer group p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-sm hover:shadow-md ${
            routeSheetFilter === 'with'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
              Hojas
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {metrics.withRouteSheet}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Waybills cargados</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline text-[11px]">Solo con hoja &rarr;</span>
          </p>
        </div>
      </div>

      {/* Main Table Container with Modern Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Search and Segmented Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search input with 1-click clear */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por tracking, destinatario, creador, transportista..." 
                className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm" 
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick selectors (Archive Mode & Route Sheet) */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Archive Toggle Pill */}
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => { setArchiveFilter('active'); setSelectedIds(new Set()); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    archiveFilter === 'active'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Activos ({metrics.activeCount})
                </button>
                <button
                  onClick={() => { setArchiveFilter('archived'); setSelectedIds(new Set()); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    archiveFilter === 'archived'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Archive className="w-3 h-3" />
                  <span>Archivados ({metrics.archivedCount})</span>
                </button>
                <button
                  onClick={() => { setArchiveFilter('all'); setSelectedIds(new Set()); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    archiveFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Todos ({metrics.total})
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <Filter className="w-3.5 h-3.5 text-blue-500" />
                <span>Hoja:</span>
                <select 
                  value={routeSheetFilter}
                  onChange={(e) => setRouteSheetFilter(e.target.value)}
                  className="bg-transparent border-0 text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todas</option>
                  <option value="with">Con Hoja</option>
                  <option value="without">Sin Hoja</option>
                </select>
              </div>

              {(searchQuery || statusFilter !== 'all' || routeSheetFilter !== 'all' || archiveFilter !== 'active') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setRouteSheetFilter('all');
                    setArchiveFilter('active');
                    setSelectedIds(new Set());
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Quick status pill chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 overflow-x-auto">
            {[
              { label: 'Todos', value: 'all', count: filteredShipments.length },
              { label: 'En Tránsito', value: 'En Tránsito', count: shipments.filter(s => (archiveFilter === 'all' || (archiveFilter === 'active' ? !s.isArchived : s.isArchived)) && ['en tránsito', 'en reparto', 'recogida'].some(st => String(s.status || '').toLowerCase().includes(st))).length },
              { label: 'Pendiente', value: 'Pendiente', count: shipments.filter(s => (archiveFilter === 'all' || (archiveFilter === 'active' ? !s.isArchived : s.isArchived)) && String(s.status || '').toLowerCase().includes('pendiente')).length },
              { label: 'Entregado', value: 'Entregado', count: shipments.filter(s => (archiveFilter === 'all' || (archiveFilter === 'active' ? !s.isArchived : s.isArchived)) && String(s.status || '').toLowerCase().includes('entregado')).length },
              { label: 'Incidencia', value: 'Incidencia', count: shipments.filter(s => (archiveFilter === 'all' || (archiveFilter === 'active' ? !s.isArchived : s.isArchived)) && String(s.status || '').toLowerCase().includes('incidencia')).length },
              { label: 'Cancelado', value: 'Cancelado', count: shipments.filter(s => (archiveFilter === 'all' || (archiveFilter === 'active' ? !s.isArchived : s.isArchived)) && String(s.status || '').toLowerCase().includes('cancelado')).length },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.value
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === tab.value
                    ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Consultando registros logísticos...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-200">
              {archiveFilter === 'archived' ? 'No hay envíos archivados' : 'No hay envíos que coincidan'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros o el término de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {/* Select All Checkbox */}
                  <th className="py-4 px-4 pl-6 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title={isAllSelected ? "Deseleccionar todos" : "Seleccionar todos los visibles"}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : isSomeSelected ? (
                        <MinusSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-4">Envío / Courier</th>
                  <th className="py-4 px-6">Creador Registrado</th>
                  <th className="py-4 px-6">Destinatario</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6">Hoja de Ruta</th>
                  <th className="py-4 px-6">Fecha</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredShipments.map((s: any) => {
                  const creator = s.creator || {};
                  const recipient = s.recipient || {};
                  const isDelivered = String(s.status || '').toLowerCase().includes('entregado');
                  const isCancelled = String(s.status || '').toLowerCase().includes('cancelado');
                  const isIncident = String(s.status || '').toLowerCase().includes('incidencia');
                  const isInTransit = ['en tránsito', 'en reparto', 'recogida'].some(st => String(s.status || '').toLowerCase().includes(st));
                  const isPending = String(s.status || '').toLowerCase().includes('pendiente');
                  const isCopied = copiedTracking === s.id;
                  const isArchived = Boolean(s.isArchived);
                  const isSelected = selectedIds.has(s.id);

                  return (
                    <tr 
                      key={s.id} 
                      className={`transition-colors group ${
                        isSelected 
                          ? 'bg-blue-50/80 dark:bg-blue-950/30 border-l-4 border-l-blue-600' 
                          : isArchived 
                          ? 'bg-slate-50/50 dark:bg-slate-900/40 opacity-75 hover:opacity-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 pl-6 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(s.id)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                      </td>

                      {/* Tracking code & Carrier */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm tracking-tight">
                              {s.trackingCode}
                            </span>
                            <button
                              onClick={() => copyToClipboard(s.trackingCode, s.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                              title="Copiar código de tracking"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {isArchived && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase">
                                <Archive className="w-2.5 h-2.5" />
                                <span>Archivado</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getCarrierBadgeStyle(s.carrierName)}`}>
                              {displayAdminCarrierName(s.carrierName)}
                            </span>
                            {s.providerTracking && (
                              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                                Ref: {s.providerTracking}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Creator info (Audit) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${
                            creator.role === 'super_admin'
                              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                              : creator.role === 'admin'
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {(creator.name || 'U').slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[140px]">
                                {creator.name || 'Usuario'}
                              </p>
                              <span className={`inline-flex px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                creator.role === 'super_admin' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' :
                                creator.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {creator.roleName || creator.role || 'Cliente'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                              {creator.email || s.userId}
                            </p>
                            {creator.phone && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                📞 {creator.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="py-4 px-6">
                        <div className="text-xs">
                          <p className="font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                            {recipient.name || recipient.fullName || '—'}
                          </p>
                          <p className="text-slate-400 text-[11px] truncate max-w-[160px] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{recipient.city ? `${recipient.city}, ${recipient.country || ''}` : '—'}</span>
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5">
                          <select 
                            value={s.status} 
                            onChange={(e) => handleStatusChange(s.id, e.target.value)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold focus:outline-none appearance-none cursor-pointer border transition-all shadow-sm ${
                              isDelivered ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 
                              isCancelled ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : 
                              isIncident ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' : 
                              isInTransit ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' : 
                              isPending ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' : 
                              'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                          >
                            <option value="Creado">Creado</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Recogida Programada">Recogida Programada</option>
                            <option value="En Tránsito">En Tránsito</option>
                            <option value="En Reparto">En Reparto</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Devuelto">Devuelto</option>
                            <option value="Cancelado">Cancelado</option>
                            <option value="Incidencia">Incidencia</option>
                          </select>
                        </div>
                      </td>

                      {/* Route Sheet */}
                      <td className="py-4 px-6">
                        {s.routeSheetUrl ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={s.routeSheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-all shadow-sm"
                              title={s.routeSheetName || 'Ver hoja de ruta'}
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Hoja</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                            <button
                              onClick={() => openShipmentModal(s, 'route_sheet')}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Gestionar hoja de ruta"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openShipmentModal(s, 'route_sheet')}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-bold border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 transition-all cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            <span>+ Subir</span>
                          </button>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 pl-5 font-mono">
                          {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Actions Group (Archive, Delete, Manage) */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Prepare label button if pending */}
                          {s.canRetryLabel && !s.labelReady && (
                            <button
                              onClick={() => handlePrepareShipment(s)}
                              disabled={Boolean(actionMap[s.id])}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:bg-slate-100 disabled:text-slate-400 text-xs font-bold transition-colors shadow-sm cursor-pointer"
                              title="Preparar etiqueta oficial"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>{actionMap[s.id] ? '...' : 'Preparar'}</span>
                            </button>
                          )}

                          {/* Download Label if ready */}
                          {s.labelDownloadUrl && (
                            <a
                              href={s.labelDownloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition-colors shadow-sm"
                              title="Descargar Etiqueta Oficial"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Etiqueta</span>
                            </a>
                          )}

                          {/* Archive / Unarchive Button */}
                          <button
                            onClick={(e) => handleToggleArchive(s, e)}
                            disabled={Boolean(actionMap[s.id])}
                            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isArchived
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-transparent hover:border-amber-200'
                            }`}
                            title={isArchived ? "Desarchivar y restaurar a activos" : "Archivar envío"}
                          >
                            {isArchived ? (
                              <ArchiveRestore className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              setIsBulkDeleteModal(false);
                              setShipmentToDelete(s);
                            }}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 text-xs font-bold transition-all cursor-pointer"
                            title="Eliminar envío permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Primary Manage Button */}
                          <button
                            onClick={() => openShipmentModal(s, 'edit')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Gestionar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FLOATING BULK ACTIONS BAR (When 1 or more items are selected) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-3xl p-3 px-6 flex flex-wrap items-center gap-3 sm:gap-4 animate-slide-up max-w-[95vw]">
          {/* Selected count badge */}
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold text-slate-200 hidden sm:inline">
              envíos seleccionados
            </span>
          </div>

          {/* Bulk Archive */}
          {archiveFilter !== 'archived' && (
            <button
              onClick={() => handleBulkArchive(true)}
              disabled={isProcessingBulk}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-amber-950/50 hover:text-amber-300 text-xs font-bold border border-slate-700 hover:border-amber-500/50 transition-all cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>Archivar</span>
            </button>
          )}

          {/* Bulk Unarchive */}
          {archiveFilter !== 'active' && (
            <button
              onClick={() => handleBulkArchive(false)}
              disabled={isProcessingBulk}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-emerald-950/50 hover:text-emerald-300 text-xs font-bold border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer"
            >
              <ArchiveRestore className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restaurar</span>
            </button>
          )}

          {/* Bulk Status Menu */}
          <div className="relative">
            <button
              onClick={() => setIsBulkStatusMenuOpen(!isBulkStatusMenuOpen)}
              disabled={isProcessingBulk}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <span>Cambiar Estado</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isBulkStatusMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden py-1 z-50">
                {['Creado', 'Pendiente', 'Recogida Programada', 'En Tránsito', 'En Reparto', 'Entregado', 'Cancelado', 'Incidencia'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleBulkStatusChange(st)}
                    className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-blue-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bulk Export CSV */}
          <button
            onClick={() => handleExportCSV(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            title="Exportar sólo los envíos seleccionados"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {/* Bulk Delete */}
          <button
            onClick={() => {
              setIsBulkDeleteModal(true);
              setShipmentToDelete(null);
            }}
            disabled={isProcessingBulk}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold border border-red-500/40 hover:border-red-600 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>

          {/* Clear selection */}
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            title="Deseleccionar todo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal for Permanent Delete (Single or Bulk) */}
      {(shipmentToDelete || isBulkDeleteModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {isBulkDeleteModal
                  ? `¿Eliminar permanentemente ${selectedIds.size} envíos?`
                  : '¿Eliminar envío permanentemente?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBulkDeleteModal ? (
                  <>Esta acción borrará de forma definitiva los <strong className="text-red-600 dark:text-red-400 font-bold">{selectedIds.size} envíos seleccionados</strong>.</>
                ) : (
                  <>Estás a punto de borrar el envío con tracking <strong className="font-mono text-slate-900 dark:text-white font-black">{shipmentToDelete?.trackingCode}</strong>.</>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-800 dark:text-red-300">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>
                  Esta acción eliminará de forma irreversible los envíos, paquetes asociados, hojas de ruta y registros de auditoría de la base de datos.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShipmentToDelete(null);
                  setIsBulkDeleteModal(false);
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={isBulkDeleteModal ? handleBulkDeleteConfirm : handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Eliminando...' : isBulkDeleteModal ? `Eliminar ${selectedIds.size} envíos` : 'Sí, eliminar envío'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Tab Management Modal (Ultra-Modern Glassmorphism) */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-black text-blue-600 dark:text-blue-400">
                    {selectedShipment.trackingCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    {selectedShipment.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getCarrierBadgeStyle(selectedShipment.carrierName)}`}>
                    {displayAdminCarrierName(selectedShipment.carrierName)}
                  </span>
                  {Boolean(selectedShipment.isArchived) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      <Archive className="w-3 h-3" />
                      <span>Archivado</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Creado el {new Date(selectedShipment.createdAt).toLocaleString()} &bull; ID: {selectedShipment.id}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Archive Button in Modal */}
                <button
                  onClick={() => handleToggleArchive(selectedShipment)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedShipment.isArchived
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                  title={selectedShipment.isArchived ? "Restaurar a activos" : "Archivar este envío"}
                >
                  {selectedShipment.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  <span>{selectedShipment.isArchived ? 'Restaurar' : 'Archivar'}</span>
                </button>

                {/* Delete Button in Modal */}
                <button
                  onClick={() => {
                    setIsBulkDeleteModal(false);
                    setShipmentToDelete(selectedShipment);
                  }}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors cursor-pointer"
                  title="Eliminar permanentemente"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => setSelectedShipment(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Creator Audit Summary Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border-b border-blue-100 dark:border-blue-900/40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-blue-900 dark:text-blue-200">Creador Registrado:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedShipment.creator?.name || 'Usuario'}</span>
                <span className="text-blue-700 dark:text-blue-300 font-mono">({selectedShipment.creator?.email || selectedShipment.userId})</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                {selectedShipment.creator?.phone && (
                  <span>Tel: <strong className="text-slate-900 dark:text-white">{selectedShipment.creator.phone}</strong></span>
                )}
                <span>Rol: <strong className="text-blue-700 dark:text-blue-300 uppercase">{selectedShipment.creator?.roleName || selectedShipment.creator?.role || 'Cliente'}</strong></span>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 gap-2 pt-2">
              <button
                onClick={() => setActiveTab('edit')}
                className={`py-3 px-4 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Edit className="w-4 h-4" />
                <span>Detalles y Edición</span>
              </button>

              <button
                onClick={() => setActiveTab('route_sheet')}
                className={`py-3 px-4 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'route_sheet'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Hoja de Ruta (Waybill)</span>
                {selectedShipment.routeSheetUrl && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`py-3 px-4 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Auditoría & Logs</span>
                <span className="px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                  {selectedShipment.events?.length || 1}
                </span>
              </button>
            </div>

            {/* Notification messages */}
            {editSuccessMsg && (
              <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}
            {editErrorMsg && (
              <div className="mx-6 mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* TAB 1: EDIT DETAILS */}
              {activeTab === 'edit' && (
                <form onSubmit={handleSaveShipment} className="space-y-6">
                  {/* General / Logistics Information */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                      Estado Operativo y Transportista
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Estado Operativo
                        </label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value, statusLabel: e.target.options[e.target.selectedIndex].text })}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="created">Creado</option>
                          <option value="pending">Pendiente</option>
                          <option value="pending_provider">Validando Envío</option>
                          <option value="pending_label">Etiqueta en Preparación</option>
                          <option value="scheduled_pickup">Recogida Programada</option>
                          <option value="in_transit">En Tránsito</option>
                          <option value="out_for_delivery">En Reparto</option>
                          <option value="delivered">Entregado</option>
                          <option value="incident">Incidencia</option>
                          <option value="cancelled">Cancelado</option>
                          <option value="returned">Devuelto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Etiqueta de Estado (Texto Público)
                        </label>
                        <input
                          type="text"
                          value={editForm.statusLabel}
                          onChange={(e) => setEditForm({ ...editForm, statusLabel: e.target.value })}
                          placeholder="Ej: En Tránsito a Madrid"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Transportista / Courier
                        </label>
                        <input
                          type="text"
                          value={editForm.carrierName}
                          onChange={(e) => setEditForm({ ...editForm, carrierName: e.target.value })}
                          placeholder="Ej: UPS, DHL, GLS, SEUR..."
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tracking Codes */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                      Códigos de Seguimiento
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Tracking Interno Ship24Go
                        </label>
                        <input
                          type="text"
                          value={editForm.trackingCode}
                          onChange={(e) => setEditForm({ ...editForm, trackingCode: e.target.value })}
                          className="w-full font-mono px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Tracking del Courier / Proveedor
                        </label>
                        <input
                          type="text"
                          value={editForm.providerTrackingCode}
                          onChange={(e) => setEditForm({ ...editForm, providerTrackingCode: e.target.value })}
                          placeholder="Ej: 1Z9999999999999999"
                          className="w-full font-mono px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                      Datos de Destino y Destinatario
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Nombre Destinatario
                        </label>
                        <input
                          type="text"
                          value={editForm.recipientName}
                          onChange={(e) => setEditForm({ ...editForm, recipientName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={editForm.recipientPhone}
                          onChange={(e) => setEditForm({ ...editForm, recipientPhone: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editForm.recipientEmail}
                          onChange={(e) => setEditForm({ ...editForm, recipientEmail: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Dirección Completa
                        </label>
                        <input
                          type="text"
                          value={editForm.recipientAddress}
                          onChange={(e) => setEditForm({ ...editForm, recipientAddress: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={editForm.recipientCity}
                          onChange={(e) => setEditForm({ ...editForm, recipientCity: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          value={editForm.recipientZipCode}
                          onChange={(e) => setEditForm({ ...editForm, recipientZipCode: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          País (ISO)
                        </label>
                        <input
                          type="text"
                          value={editForm.recipientCountry}
                          onChange={(e) => setEditForm({ ...editForm, recipientCountry: e.target.value.toUpperCase() })}
                          maxLength={2}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Administrative Notes */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                      Notas Administrativas Internas
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Visible únicamente para el equipo Super Admin y operaciones.
                    </p>
                    <textarea
                      rows={3}
                      value={editForm.adminNotes}
                      onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                      placeholder="Escribe notas operativas internas..."
                      className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingEdit ? 'Guardando cambios...' : 'Guardar y Registrar en Auditoría'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: ROUTE SHEET (HOJA DE RUTA) */}
              {activeTab === 'route_sheet' && (
                <div className="space-y-6">
                  {/* Current Route Sheet Display */}
                  {selectedShipment.routeSheetUrl ? (
                    <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                              Hoja de Ruta Oficial
                            </span>
                            <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                              {selectedShipment.routeSheetName || 'Hoja_de_Ruta.pdf'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Disponible para descarga o visualización en la red logística.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={selectedShipment.routeSheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver Hoja</span>
                          </a>

                          <a
                            href={selectedShipment.routeSheetUrl}
                            download={selectedShipment.routeSheetName || `hoja-ruta-${selectedShipment.trackingCode}.pdf`}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold text-xs hover:bg-emerald-50 transition-all"
                          >
                            <Download className="w-4 h-4" />
                            <span>Descargar</span>
                          </a>

                          <button
                            onClick={handleDeleteRouteSheet}
                            disabled={deletingSheet}
                            className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-bold transition-colors cursor-pointer"
                            title="Eliminar hoja de ruta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Embedded Preview if image */}
                      {/\.(png|jpe?g|webp)$/i.test(selectedShipment.routeSheetUrl) && (
                        <div className="mt-4 pt-4 border-t border-emerald-200/60 flex justify-center">
                          <img 
                            src={selectedShipment.routeSheetUrl} 
                            alt="Vista previa hoja de ruta" 
                            className="max-h-80 rounded-2xl border border-slate-200 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                      <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <h4 className="text-base font-black text-slate-800 dark:text-white">
                        Sin Hoja de Ruta Asignada
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Carga el documento oficial de manifiesto, albarán o waybill emitido por el transportista o centro de distribución.
                      </p>
                    </div>
                  )}

                  {/* Upload Form */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>{selectedShipment.routeSheetUrl ? 'Reemplazar Hoja de Ruta' : 'Subir Nueva Hoja de Ruta'}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Soporta formato PDF e imágenes (PNG, JPG, WEBP) hasta 15MB. Quedará guardado en el servidor con registro de auditoría.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,image/png,image/jpeg,image/webp"
                        className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-blue-50 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
                      />

                      <button
                        onClick={handleUploadRouteSheet}
                        disabled={!routeSheetFile || uploadingSheet}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{uploadingSheet ? 'Subiendo archivo...' : 'Cargar Hoja'}</span>
                      </button>
                    </div>

                    {routeSheetFile && (
                      <div className="mt-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>Archivo seleccionado: {routeSheetFile.fileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT LOGS & TIMELINE */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Línea de Tiempo y Registro de Auditoría
                      </h4>
                      <p className="text-xs text-slate-400">
                        Historial inmutable de creación, cambios de estado y modificaciones del envío.
                      </p>
                    </div>
                  </div>

                  {/* Events timeline */}
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {(selectedShipment.events || []).length > 0 ? (
                      selectedShipment.events.map((ev: any, idx: number) => (
                        <div key={ev.id || idx} className="relative group">
                          <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                          </div>

                          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-black text-xs">
                                {ev.statusLabel || ev.statusCode || 'Evento Registrado'}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(ev.eventTime || ev.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                              {ev.description}
                            </p>
                            {ev.location && (
                              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {ev.location}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="relative">
                        <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-600 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-black text-xs">
                              Envío Creado
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {new Date(selectedShipment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                            Envío registrado en el sistema por <strong>{selectedShipment.creator?.name || 'Cliente'}</strong> ({selectedShipment.creator?.email || selectedShipment.userId}).
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Ship24Go Enterprise Next-Gen Logistics</span>
              </span>
              <button
                onClick={() => setSelectedShipment(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export const AdminShipments = () => {
  return (
    <AdminShipmentsErrorBoundary>
      <AdminShipmentsComponent />
    </AdminShipmentsErrorBoundary>
  );
};

export default AdminShipments;
