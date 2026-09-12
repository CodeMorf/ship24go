import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calculator, Package, PlusCircle, Trash2, ArrowRight, CheckCircle2, 
  AlertTriangle, Truck, Clock, ShieldCheck, User, Users, MapPin, 
  FileText, ArrowLeft, RefreshCw, Send
} from 'lucide-react';
import { api } from '../lib/api';
import { useCurrency } from '../lib/currency';
import { useI18n } from '../lib/i18n';
import CountrySelect from './CountrySelect';
import { ZipCodeAutocomplete } from './ZipCodeAutocomplete';
import { resolveCityForCountry } from '../lib/postalCity';

// Helper to normalize and display carrier name
const normalizeCarrierName = (carrier: string) => {
  const c = String(carrier || '').toLowerCase();
  if (c.includes('ups')) return 'UPS';
  if (c.includes('dhl')) return 'DHL';
  if (c.includes('fedex')) return 'FedEx';
  if (c.includes('gls')) return 'GLS';
  if (c.includes('seur')) return 'SEUR';
  if (c.includes('correos express')) return 'Correos Express';
  if (c.includes('correos')) return 'Correos';
  if (c.includes('inpost')) return 'InPost';
  if (c.includes('brt')) return 'BRT';
  if (c.includes('sda')) return 'SDA';
  if (c.includes('poste')) return 'Poste Italiane';
  return carrier || 'Logihub Express';
};

// Smart placeholder for zip code according to country
const getZipPlaceholder = (countryCode: string) => {
  switch (String(countryCode || '').toUpperCase()) {
    case 'DO': return 'Ej: 10101 Santo Domingo';
    case 'ES': return 'Ej: 28001 Madrid';
    case 'US': return 'E.g.: 10001 New York';
    case 'DE': return 'Z.B.: 10115 Berlin';
    case 'FR': return 'Ex: 75001 Paris';
    case 'IT': return 'Es: 00185 Roma';
    case 'GB': return 'E.g.: SW1A 1AA London';
    case 'CO': return 'Ej: 110111 Bogotá';
    case 'MX': return 'Ej: 06600 CDMX';
    default: return 'Código Postal';
  }
};

export const AdminQuote = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { format, currency } = useCurrency();

  // Step state: 'quote' | 'details' | 'success'
  const [step, setStep] = useState<'quote' | 'details' | 'success'>('quote');

  // Client assignment state
  const [assignMode, setAssignMode] = useState<'admin' | 'client'>('admin');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);

  // Quote Form state
  const [form, setForm] = useState({
    originCountry: 'ES',
    originZip: '',
    originCity: '',
    destCountry: 'ES',
    destZip: '',
    destCity: ''
  });

  const [packages, setPackages] = useState([
    { width: 15, height: 15, length: 20, weight: 2, qty: 1 }
  ]);

  // Quotes result state
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [quotesList, setQuotesList] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [serviceFilter, setServiceFilter] = useState<'all' | 'economic' | 'express'>('all');

  // Shipment Details Form state
  const [sender, setSender] = useState({
    name: 'Ship24Go Central',
    company: 'Ship24Go Logistics',
    email: 'admin@ship24go.com',
    phone: '+34 910 000 000',
    address: '',
    city: '',
    zipCode: '',
    country: 'ES'
  });

  const [recipient, setRecipient] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'ES'
  });

  const [contentDescription, setContentDescription] = useState('Mercancía general / Paquetería comercial');
  const [declaredValue, setDeclaredValue] = useState(50);
  const [reference, setReference] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Creation submission state
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdShipment, setCreatedShipment] = useState<any | null>(null);

  // Load clients for assignment
  useEffect(() => {
    setLoadingClients(true);
    api.getAdminClients()
      .then(res => {
        setClients(res.clients || []);
      })
      .catch(err => console.error('Error fetching clients for quote:', err))
      .finally(() => setLoadingClients(false));
  }, []);

  // Selected client entity
  const selectedClient = useMemo(() => {
    if (assignMode !== 'client' || !selectedClientId) return null;
    return clients.find(c => c.id === selectedClientId);
  }, [assignMode, selectedClientId, clients]);

  // Auto-fill sender if client is selected
  useEffect(() => {
    if (selectedClient) {
      setSender(prev => ({
        ...prev,
        name: selectedClient.name || prev.name,
        company: selectedClient.business_type || prev.company,
        email: selectedClient.email || prev.email,
        phone: selectedClient.phone || prev.phone,
        country: selectedClient.country || prev.country
      }));
    }
  }, [selectedClient]);

  // Filtered clients for dropdown
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(c => 
      String(c.name || '').toLowerCase().includes(q) || 
      String(c.email || '').toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  // Packages management
  const addPackage = () => {
    setPackages([...packages, { width: 10, height: 10, length: 10, weight: 1, qty: 1 }]);
  };

  const removePackage = (idx: number) => {
    if (packages.length <= 1) return;
    setPackages(packages.filter((_, i) => i !== idx));
  };

  const updatePackage = (idx: number, field: string, val: number) => {
    const next = [...packages];
    next[idx] = { ...next[idx], [field]: val };
    setPackages(next);
  };

  // Perform multi-carrier quoting
  const handleQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteError('');
    setQuotesList([]);
    setSelectedQuote(null);

    if (!form.originZip || !form.destZip) {
      setQuoteError('Por favor completa los códigos postales de origen y destino.');
      return;
    }

    setQuoting(true);
    try {
      const payload: any = {
        originCountry: form.originCountry,
        originZip: form.originZip,
        originCity: form.originCity,
        destCountry: form.destCountry,
        destZip: form.destZip,
        destCity: form.destCity,
        packages: packages.map(p => ({
          width: Number(p.width) || 10,
          height: Number(p.height) || 10,
          length: Number(p.length) || 10,
          weight: Number(p.weight) || 1,
          qty: Number(p.qty) || 1
        })),
        currency: currency || 'EUR'
      };

      const res = await api.quoteShipment(payload);
      const quotes = res.quotes || [];
      if (quotes.length === 0) {
        setQuoteError('No encontramos transportistas disponibles para esta ruta. Revisa los códigos postales.');
      } else {
        setQuotesList(quotes);
      }
    } catch (err: any) {
      setQuoteError(err?.message || 'Error al cotizar. Verifica la conexión con los proveedores.');
    } finally {
      setQuoting(false);
    }
  };

  // Filtered quotes list
  const filteredQuotes = useMemo(() => {
    return quotesList.filter(q => {
      if (serviceFilter === 'economic') {
        return Number(q.total_amount || q.total) < 30 || String(q.service_name || '').toLowerCase().includes('econ');
      }
      if (serviceFilter === 'express') {
        return String(q.service_name || '').toLowerCase().includes('express') || String(q.service_name || '').toLowerCase().includes('24');
      }
      return true;
    });
  }, [quotesList, serviceFilter]);

  // Proceed to Step 2 with prefilled sender and recipient
  const selectQuoteAndProceed = (quote: any) => {
    setSelectedQuote(quote);
    setSender(prev => ({
      ...prev,
      country: form.originCountry,
      city: form.originCity || prev.city,
      zipCode: form.originZip || prev.zipCode
    }));
    setRecipient(prev => ({
      ...prev,
      country: form.destCountry,
      city: form.destCity || prev.city,
      zipCode: form.destZip || prev.zipCode
    }));
    setStep('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit and Create Shipment
  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    setCreateError('');
    setCreating(true);

    try {
      const isInternational = form.originCountry !== form.destCountry;
      const customsItems = isInternational ? [{
        description: contentDescription,
        origin: form.originCountry,
        quantity: 1,
        weight: Number(packages[0]?.weight || 1),
        value: Number(declaredValue || 20),
        hsCode: '',
        sku: ''
      }] : [];

      const payload = {
        quoteId: selectedQuote.id,
        clientId: assignMode === 'client' ? selectedClientId : undefined,
        sender: {
          name: sender.name,
          company: sender.company,
          email: sender.email,
          phone: sender.phone,
          address: sender.address,
          city: sender.city || form.originCity,
          zipCode: sender.zipCode || form.originZip,
          country: sender.country || form.originCountry
        },
        recipient: {
          name: recipient.name,
          company: recipient.company,
          email: recipient.email,
          phone: recipient.phone,
          address: recipient.address,
          city: recipient.city || form.destCity,
          zipCode: recipient.zipCode || form.destZip,
          country: recipient.country || form.destCountry
        },
        packages: packages.map(p => ({
          width: Number(p.width) || 10,
          height: Number(p.height) || 10,
          length: Number(p.length) || 10,
          weight: Number(p.weight) || 1,
          qty: Number(p.qty) || 1
        })),
        customs: customsItems,
        content: contentDescription,
        reference: reference || `ADMIN-${Date.now().toString().slice(-6)}`,
        declaredValue: Number(declaredValue || 20),
        adminNotes: adminNotes,
        manifest: 1
      };

      const res = await api.createShipment(payload);
      setCreatedShipment(res.shipment || { trackingCode: 'S24G-' + Date.now() });
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error creating shipment as super admin:', err);
      setCreateError(err?.message || 'Error al generar la orden en el proveedor.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Cotizador & Creador de Envíos
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Emite órdenes con transportistas integrados, audita al creador y gestiona hojas de ruta.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/admin/shipments"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 shadow-sm transition-all self-start sm:self-auto"
        >
          <Package className="w-4 h-4 text-blue-600" />
          <span>Ver Registro de Envíos</span>
        </Link>
      </div>

      {/* STEP PROGRESS INDICATOR */}
      <div className="mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between">
        <div className={`flex items-center gap-2 text-xs sm:text-sm font-black ${step === 'quote' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'quote' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>1</span>
          <span>1. Cotizar Tarifas</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-gray-200 dark:bg-slate-700"></div>
        <div className={`flex items-center gap-2 text-xs sm:text-sm font-black ${step === 'details' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>2</span>
          <span>2. Datos de Remitente & Entrega</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-gray-200 dark:bg-slate-700"></div>
        <div className={`flex items-center gap-2 text-xs sm:text-sm font-black ${step === 'success' ? 'text-emerald-600' : 'text-gray-400'}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === 'success' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>3</span>
          <span>3. Orden Generada</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: COTIZAR TARIFAS */}
      {/* ========================================================================= */}
      {step === 'quote' && (
        <div className="space-y-8">
          {/* Client Assignment Selector */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-200 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  ¿Para quién es este envío?
                </h3>
              </div>
              <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-full">
                Control Super Admin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAssignMode('admin')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  assignMode === 'admin'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-gray-900 dark:text-white">Envío Institucional (Super Admin)</span>
                  <ShieldCheck className={`w-5 h-5 ${assignMode === 'admin' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  El envío queda registrado a nombre de la administración con auditoría de tu usuario.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAssignMode('client')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  assignMode === 'client'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-gray-900 dark:text-white">Asignar a un Cliente Registrado</span>
                  <User className={`w-5 h-5 ${assignMode === 'client' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  El envío se vinculará a la cuenta del cliente seleccionado, pero con log de creación de Super Admin.
                </p>
              </button>
            </div>

            {assignMode === 'client' && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Seleccionar Cliente:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Filtrar por nombre o email..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full flex-1 px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white"
                  >
                    <option value="">-- Elige un cliente ({filteredClients.length} disponibles) --</option>
                    {filteredClients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email}) - Rol: {c.role}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedClient && (
                  <div className="mt-2 text-xs text-blue-600 font-bold">
                    ✓ Asignado a: {selectedClient.name} ({selectedClient.email})
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulario de Cotización */}
          <form onSubmit={handleQuote} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-slate-700/80 shadow-sm space-y-6">
            <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Ruta del Envío</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origen */}
              <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-blue-600 tracking-wider">Punto de Origen (Remitente)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">País</label>
                  <CountrySelect
                    value={form.originCountry}
                    onChange={(code) => setForm({ ...form, originCountry: code })}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">Código Postal *</label>
                    <ZipCodeAutocomplete
                      required
                      countryCode={form.originCountry}
                      value={form.originZip}
                      placeholder={getZipPlaceholder(form.originCountry)}
                      onChange={(val) => {
                        const inferredCity = resolveCityForCountry(form.originCountry, val);
                        setForm(prev => ({
                          ...prev,
                          originZip: val,
                          originCity: inferredCity || prev.originCity
                        }));
                      }}
                      onResolved={(data) => {
                        setForm(prev => ({
                          ...prev,
                          originZip: data.postalCode || prev.originZip,
                          originCity: data.city || prev.originCity
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">Ciudad / Localidad</label>
                    <input
                      type="text"
                      value={form.originCity}
                      onChange={(e) => setForm({ ...form, originCity: e.target.value })}
                      placeholder="Ciudad autocompletada"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Destino */}
              <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">Punto de Destino (Destinatario)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">País</label>
                  <CountrySelect
                    value={form.destCountry}
                    onChange={(code) => setForm({ ...form, destCountry: code })}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">Código Postal *</label>
                    <ZipCodeAutocomplete
                      required
                      countryCode={form.destCountry}
                      value={form.destZip}
                      placeholder={getZipPlaceholder(form.destCountry)}
                      onChange={(val) => {
                        const inferredCity = resolveCityForCountry(form.destCountry, val);
                        setForm(prev => ({
                          ...prev,
                          destZip: val,
                          destCity: inferredCity || prev.destCity
                        }));
                      }}
                      onResolved={(data) => {
                        setForm(prev => ({
                          ...prev,
                          destZip: data.postalCode || prev.destZip,
                          destCity: data.city || prev.destCity
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">Ciudad / Localidad</label>
                    <input
                      type="text"
                      value={form.destCity}
                      onChange={(e) => setForm({ ...form, destCity: e.target.value })}
                      placeholder="Ciudad autocompletada"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bultos y Paquetes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Bultos / Paquetes a Enviar
                </h4>
                <button
                  type="button"
                  onClick={addPackage}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Añadir otro paquete</span>
                </button>
              </div>

              <div className="space-y-3">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      #{idx + 1}
                    </span>

                    <div className="flex-1 min-w-[100px]">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Peso (kg)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={pkg.weight}
                        onChange={(e) => updatePackage(idx, 'weight', parseFloat(e.target.value) || 1)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                      />
                    </div>

                    <div className="flex-1 min-w-[90px]">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Largo (cm)</label>
                      <input
                        type="number"
                        min="1"
                        value={pkg.length}
                        onChange={(e) => updatePackage(idx, 'length', parseInt(e.target.value) || 10)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex-1 min-w-[90px]">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Ancho (cm)</label>
                      <input
                        type="number"
                        min="1"
                        value={pkg.width}
                        onChange={(e) => updatePackage(idx, 'width', parseInt(e.target.value) || 10)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex-1 min-w-[90px]">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Alto (cm)</label>
                      <input
                        type="number"
                        min="1"
                        value={pkg.height}
                        onChange={(e) => updatePackage(idx, 'height', parseInt(e.target.value) || 10)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    {packages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePackage(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar bulto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {quoteError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{quoteError}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={quoting}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {quoting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Consultando brokers y transportistas...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>Cotizar Tarifas en Vivo</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* RESULTADOS DE COTIZACIÓN */}
          {quotesList.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Opciones Disponibles ({filteredQuotes.length})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setServiceFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${serviceFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceFilter('economic')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${serviceFilter === 'economic' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Más Económicas
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceFilter('express')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${serviceFilter === 'express' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Express 24h
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuotes.map((q: any) => {
                  const carrier = normalizeCarrierName(q.carrier_name || q.carrierName || q.service_name);
                  const price = Number(q.total_amount || q.total || 0);

                  return (
                    <div
                      key={q.id}
                      className="bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-gray-100 dark:border-slate-700/70 hover:border-blue-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-black text-xs uppercase">
                              {carrier}
                            </span>
                            <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                              {q.service_name || `${carrier} Standard`}
                            </h4>
                          </div>
                          <Truck className="w-5 h-5 text-gray-400 shrink-0" />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{q.delivery_time || '24-72 horas'}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Total Tarifa</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">
                            {format ? format(price) : `${price.toFixed(2)} EUR`}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => selectQuoteAndProceed(q)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          <span>Seleccionar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: COMPLETAR DATOS DEL ENVÍO */}
      {/* ========================================================================= */}
      {step === 'details' && selectedQuote && (
        <form onSubmit={handleCreateShipment} className="space-y-6">
          {/* Selected Quote Banner */}
          <div className="p-5 rounded-2xl bg-blue-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-200 font-bold">Tarifa Seleccionada</span>
                <h4 className="text-lg font-black">
                  {normalizeCarrierName(selectedQuote.carrier_name || selectedQuote.carrierName)} &bull; {selectedQuote.service_name || 'Standard'}
                </h4>
                <p className="text-xs text-blue-100">
                  {form.originCountry} ({form.originZip} {form.originCity ? `- ${form.originCity}` : ''}) &rarr; {form.destCountry} ({form.destZip} {form.destCity ? `- ${form.destCity}` : ''})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-blue-200 font-bold">Total a facturar</p>
                <p className="text-2xl font-black">
                  {format ? format(selectedQuote.total_amount || selectedQuote.total) : `${selectedQuote.total_amount || selectedQuote.total} EUR`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('quote')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer"
              >
                Cambiar
              </button>
            </div>
          </div>

          {/* Formulario Remitente y Destinatario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Remitente */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
              <h4 className="text-sm font-black uppercase text-blue-600 tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Datos del Remitente</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={sender.name}
                  onChange={(e) => setSender({ ...sender, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={sender.phone}
                    onChange={(e) => setSender({ ...sender, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={sender.email}
                    onChange={(e) => setSender({ ...sender, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Dirección Completa *</label>
                <input
                  type="text"
                  required
                  placeholder="Calle, número, piso..."
                  value={sender.address}
                  onChange={(e) => setSender({ ...sender, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">CP *</label>
                  <ZipCodeAutocomplete
                    required
                    countryCode={sender.country}
                    value={sender.zipCode}
                    placeholder={getZipPlaceholder(sender.country)}
                    onChange={(val) => {
                      const city = resolveCityForCountry(sender.country, val);
                      setSender(prev => ({ ...prev, zipCode: val, city: city || prev.city }));
                    }}
                    onResolved={(data) => {
                      setSender(prev => ({
                        ...prev,
                        zipCode: data.postalCode || prev.zipCode,
                        city: data.city || prev.city
                      }));
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    required
                    value={sender.city}
                    onChange={(e) => setSender({ ...sender, city: e.target.value })}
                    className="w-full px-2.5 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">País</label>
                  <input
                    type="text"
                    readOnly
                    value={sender.country}
                    className="w-full px-2.5 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Destinatario */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
              <h4 className="text-sm font-black uppercase text-indigo-600 tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Datos del Destinatario</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Persona o empresa de recepción"
                  value={recipient.name}
                  onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Teléfono *</label>
                  <input
                    type="text"
                    required
                    placeholder="+34 600..."
                    value={recipient.phone}
                    onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="destinatario@correo.com"
                    value={recipient.email}
                    onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Dirección de Entrega *</label>
                <input
                  type="text"
                  required
                  placeholder="Calle, portal, piso, puerta..."
                  value={recipient.address}
                  onChange={(e) => setRecipient({ ...recipient, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">CP *</label>
                  <ZipCodeAutocomplete
                    required
                    countryCode={recipient.country}
                    value={recipient.zipCode}
                    placeholder={getZipPlaceholder(recipient.country)}
                    onChange={(val) => {
                      const city = resolveCityForCountry(recipient.country, val);
                      setRecipient(prev => ({ ...prev, zipCode: val, city: city || prev.city }));
                    }}
                    onResolved={(data) => {
                      setRecipient(prev => ({
                        ...prev,
                        zipCode: data.postalCode || prev.zipCode,
                        city: data.city || prev.city
                      }));
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    required
                    value={recipient.city}
                    onChange={(e) => setRecipient({ ...recipient, city: e.target.value })}
                    className="w-full px-2.5 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">País</label>
                  <input
                    type="text"
                    readOnly
                    value={recipient.country}
                    className="w-full px-2.5 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del Paquete y Auditoría */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Contenido & Notas de Auditoría
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Descripción del Contenido</label>
                <input
                  type="text"
                  value={contentDescription}
                  onChange={(e) => setContentDescription(e.target.value)}
                  placeholder="Ej: Documentos, ropa, muestras..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Valor Declarado (EUR)</label>
                <input
                  type="number"
                  min="1"
                  value={declaredValue}
                  onChange={(e) => setDeclaredValue(parseFloat(e.target.value) || 15)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Notas Administrativas Internas</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Anotación interna visible para el equipo Super Admin..."
                  className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {createError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep('quote')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-200 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Tarifas</span>
            </button>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando Envío Oficial...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Crear Envío Inmediatamente</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: ENVÍO CREADO CON ÉXITO */}
      {/* ========================================================================= */}
      {step === 'success' && (
        <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-xl text-center max-w-2xl mx-auto space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs uppercase">
              Orden Creada Exitosamente
            </span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-3">
              Envío Registrado en el Sistema
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              El envío ha sido emitido con log de auditoría asignado a Super Admin.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 inline-block text-left w-full">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3 mb-3">
              <span className="text-xs text-gray-400 font-bold uppercase">Código de Seguimiento Ship24Go</span>
              <span className="font-mono text-lg font-black text-blue-600 dark:text-blue-400">
                {createdShipment?.trackingCode || 'S24G-...' }
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <p><strong>Destinatario:</strong> {recipient.name} ({recipient.city}, {recipient.country})</p>
              <p><strong>Transportista:</strong> {normalizeCarrierName(selectedQuote?.carrier_name || selectedQuote?.carrierName)}</p>
              <p><strong>Creador Auditado:</strong> Super Admin {assignMode === 'client' && selectedClient ? `(en nombre de ${selectedClient.name})` : ''}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/admin/shipments"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Ver en Envíos & Subir Hoja de Ruta</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setStep('quote');
                setQuotesList([]);
                setSelectedQuote(null);
                setCreatedShipment(null);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold text-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cotizar Otro Envío</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
