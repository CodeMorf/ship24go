import React, { useEffect, useState } from 'react';
import { 
  Calculator, 
  Truck, 
  MapPin, 
  Edit3, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  DollarSign, 
  Percent, 
  Layers, 
  Clock, 
  Save, 
  X,
  Building2,
  Navigation
} from 'lucide-react';
import { api } from '../lib/api';

export default function AdminTariffs() {
  const [tariffs, setTariffs] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<'us_do' | 'do_us' | 'hubs'>('us_do');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'branch' | 'home'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Editing Tariff
  const [editingTariff, setEditingTariff] = useState<any | null>(null);
  const [savingTariff, setSavingTariff] = useState(false);

  // Modal New Tariff
  const [isCreatingTariff, setIsCreatingTariff] = useState(false);
  const [newTariffData, setNewTariffData] = useState<any>({
    route_name: 'Republica Dominicana -> USA (Export)',
    origin_country: 'DO',
    dest_country: 'US',
    origin_hub_id: 'hub_sdq_luperon',
    dest_hub_id: 'hub_mia_01',
    product_type: 'box_s',
    delivery_type: 'branch',
    product_name: '',
    description: '',
    base_price: 30,
    point_commission: 4.5,
    hub_cost: 5,
    max_weight_kg: 2,
    extra_kg_price: 4,
    currency: 'USD',
    transit_days_min: 3,
    transit_days_max: 6,
    is_active: 1
  });

  // Modal Editing Hub
  const [editingHub, setEditingHub] = useState<any | null>(null);
  const [savingHub, setSavingHub] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await (api as any).getAdminTariffs();
      setTariffs(res.tariffs || []);
      setHubs(res.hubs || []);
    } catch (err: any) {
      console.error('Error loading admin tariffs:', err);
      setError(err.message || 'No se pudieron cargar las tarifas y hubs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter tariffs by tab and search
  const filteredTariffs = tariffs.filter((t: any) => {
    if (activeTab === 'us_do' && (t.origin_country !== 'US' || t.dest_country !== 'DO')) return false;
    if (activeTab === 'do_us' && (t.origin_country !== 'DO' || t.dest_country !== 'US')) return false;
    if (deliveryFilter !== 'all' && t.delivery_type !== deliveryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = String(t.product_name || '').toLowerCase().includes(q);
      const matchId = String(t.id || '').toLowerCase().includes(q);
      const matchType = String(t.product_type || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchType) return false;
    }
    return true;
  });

  // KPI Calculations
  const activeCount = filteredTariffs.filter(t => t.is_active === 1).length;
  const avgPrice = filteredTariffs.length > 0 
    ? filteredTariffs.reduce((acc, t) => acc + Number(t.base_price || 0), 0) / filteredTariffs.length 
    : 0;
  const avgCommission = filteredTariffs.length > 0 
    ? filteredTariffs.reduce((acc, t) => acc + Number(t.point_commission || 0), 0) / filteredTariffs.length 
    : 0;

  // Toggle Active Switch
  const handleToggleActive = async (t: any) => {
    try {
      const nextActive = t.is_active === 1 ? 0 : 1;
      await (api as any).updateAdminTariff(t.id, { is_active: nextActive });
      setTariffs(prev => prev.map(item => item.id === t.id ? { ...item, is_active: nextActive } : item));
      setNotice(`Tarifa ${t.id} ${nextActive === 1 ? 'activada' : 'desactivada'}.`);
      setTimeout(() => setNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'No se pudo cambiar el estado de la tarifa.');
    }
  };

  // Save Edited Tariff
  const handleSaveTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTariff) return;
    setSavingTariff(true);
    try {
      const updated = await (api as any).updateAdminTariff(editingTariff.id, {
        product_name: editingTariff.product_name,
        description: editingTariff.description,
        base_price: Number(editingTariff.base_price),
        point_commission: Number(editingTariff.point_commission),
        hub_cost: Number(editingTariff.hub_cost),
        max_weight_kg: Number(editingTariff.max_weight_kg),
        extra_kg_price: Number(editingTariff.extra_kg_price),
        transit_days_min: Number(editingTariff.transit_days_min),
        transit_days_max: Number(editingTariff.transit_days_max),
        origin_hub_id: editingTariff.origin_hub_id,
        dest_hub_id: editingTariff.dest_hub_id,
        is_active: editingTariff.is_active ? 1 : 0
      });
      setTariffs(prev => prev.map(item => item.id === editingTariff.id ? { ...item, ...updated.tariff } : item));
      setEditingTariff(null);
      setNotice('Tarifa actualizada con éxito.');
      setTimeout(() => setNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'No se pudo actualizar la tarifa.');
    } finally {
      setSavingTariff(false);
    }
  };

  // Create New Tariff
  const handleCreateTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTariff(true);
    try {
      const created = await (api as any).createAdminTariff(newTariffData);
      setTariffs(prev => [...prev, created.tariff]);
      setIsCreatingTariff(false);
      setNotice('Nueva tarifa registrada exitosamente.');
      setTimeout(() => setNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'No se pudo registrar la tarifa.');
    } finally {
      setSavingTariff(false);
    }
  };

  // Save Edited Hub
  const handleSaveHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHub) return;
    setSavingHub(true);
    try {
      const updated = await (api as any).saveAdminHub(editingHub);
      setHubs(prev => prev.map(item => item.id === editingHub.id ? { ...item, ...updated.hub } : item));
      setEditingHub(null);
      setNotice('Hub logístico actualizado correctamente.');
      setTimeout(() => setNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'No se pudo actualizar el Hub.');
    } finally {
      setSavingHub(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Tarifas Internacionales & Red de Hubs
              </h1>
              <p className="text-xs text-slate-500">
                Control simétrico de precios, comisión del 15% para Points y centros de consolidación Miami & Santo Domingo.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>

          <button
            onClick={() => setIsCreatingTariff(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nueva Tarifa</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-emerald-500 hover:text-emerald-700 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('us_do')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'us_do'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>🇺🇸 ➔ 🇩🇴</span>
            <span>USA a Rep. Dominicana</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
              {tariffs.filter(t => t.origin_country === 'US' && t.dest_country === 'DO').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('do_us')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'do_us'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>🇩🇴 ➔ 🇺🇸</span>
            <span>Rep. Dominicana a USA (Export)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
              {tariffs.filter(t => t.origin_country === 'DO' && t.dest_country === 'US').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hubs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'hubs'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Centros Logísticos / Hubs</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
              {hubs.length}
            </span>
          </button>
        </div>

        {activeTab !== 'hubs' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar tarifa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setDeliveryFilter('all')}
                className={`px-2.5 py-1 rounded-lg ${deliveryFilter === 'all' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 font-bold' : 'text-slate-500'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setDeliveryFilter('branch')}
                className={`px-2.5 py-1 rounded-lg ${deliveryFilter === 'branch' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 font-bold' : 'text-slate-500'}`}
              >
                Retiro
              </button>
              <button
                onClick={() => setDeliveryFilter('home')}
                className={`px-2.5 py-1 rounded-lg ${deliveryFilter === 'home' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 font-bold' : 'text-slate-500'}`}
              >
                Domicilio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards (when viewing tariffs) */}
      {activeTab !== 'hubs' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <span className="text-[10px] font-black uppercase text-slate-400">Tarifas Activas</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {activeCount} <span className="text-xs font-normal text-slate-400">de {filteredTariffs.length}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <span className="text-[10px] font-black uppercase text-slate-400">Precio Promedio</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              ${avgPrice.toFixed(2)} <span className="text-xs font-normal text-slate-400">USD</span>
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <span className="text-[10px] font-black uppercase text-slate-400">Comisión Point (15%)</span>
            <p className="text-xl font-black text-blue-600 dark:text-cyan-400 mt-0.5">
              ${avgCommission.toFixed(2)} <span className="text-xs font-normal text-slate-400">promedio</span>
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <span className="text-[10px] font-black uppercase text-slate-400">Corredor de Carga</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 truncate">
              {activeTab === 'us_do' ? 'Boston / Miami ➔ Santo Domingo' : 'Santo Domingo Luperón ➔ Miami Doral'}
            </p>
          </div>
        </div>
      )}

      {/* Content Area: Tariffs Table */}
      {activeTab !== 'hubs' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Producto / Tarifa</th>
                  <th className="px-4 py-3">Modalidad</th>
                  <th className="px-4 py-3">Ruta & Hubs</th>
                  <th className="px-4 py-3">Precio Venta</th>
                  <th className="px-4 py-3">Comisión Point (15%)</th>
                  <th className="px-4 py-3">Peso & Kg Extra</th>
                  <th className="px-4 py-3">Tránsito</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTariffs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      No se encontraron tarifas para este corredor o filtro.
                    </td>
                  </tr>
                ) : (
                  filteredTariffs.map((t: any) => {
                    const commissionPct = Number(t.base_price) > 0 
                      ? Math.round((Number(t.point_commission) / Number(t.base_price)) * 100)
                      : 15;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {t.product_name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {t.id} · {t.product_type}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            t.delivery_type === 'home'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          }`}>
                            {t.delivery_type === 'home' ? '🏠 Domicilio' : '🏪 Sucursal Point'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {t.origin_hub_code || t.origin_country} ➔ {t.dest_hub_code || t.dest_country}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {t.dest_hub_name || 'Hub Destino'}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            ${Number(t.base_price).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">{t.currency}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">
                            +${Number(t.point_commission).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {commissionPct}% del valor venta
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                            Hasta {t.max_weight_kg} kg
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Extra: +${Number(t.extra_kg_price).toFixed(2)}/kg
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {t.transit_days_min}-{t.transit_days_max} días
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleToggleActive(t)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              t.is_active === 1 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                            title={t.is_active === 1 ? 'Activa - Click para desactivar' : 'Inactiva - Click para activar'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                t.is_active === 1 ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setEditingTariff({ ...t })}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Editar parámetros de tarifa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Area: Hubs List */}
      {activeTab === 'hubs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hubs.map((hub: any) => (
            <div
              key={hub.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-mono">
                      {hub.code}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {hub.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {hub.city}, {hub.state_province ? `${hub.state_province}, ` : ''}{hub.country}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingHub({ ...hub })}
                    className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Editar Hub"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{hub.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <Navigation className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Lat: {hub.latitude} · Lng: {hub.longitude}</span>
                  </div>

                  {hub.manager_name && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px]">
                      <span className="text-slate-400">Responsable:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{hub.manager_name}</span>
                    </div>
                  )}

                  {hub.phone && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Teléfono:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{hub.phone}</span>
                    </div>
                  )}

                  {hub.operating_hours && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Horario:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{hub.operating_hours}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Capacidad Diaria: {hub.capacity_daily || 500} envíos</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Activo
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Edit Tariff */}
      {editingTariff && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Editar Tarifa [{editingTariff.id}]
                </h3>
                <p className="text-xs text-slate-400">{editingTariff.route_name}</p>
              </div>
              <button onClick={() => setEditingTariff(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTariff} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nombre Comercial del Producto</label>
                <input
                  type="text"
                  value={editingTariff.product_name}
                  onChange={e => setEditingTariff({ ...editingTariff, product_name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Descripción para Clientes</label>
                <textarea
                  rows={2}
                  value={editingTariff.description || ''}
                  onChange={e => setEditingTariff({ ...editingTariff, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Precio Venta ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTariff.base_price}
                    onChange={e => {
                      const val = Number(e.target.value) || 0;
                      setEditingTariff({
                        ...editingTariff,
                        base_price: val,
                        // Auto-suggest 15% commission
                        point_commission: Math.round((val * 0.15) * 100) / 100
                      });
                    }}
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Comisión Point ($)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const val = Number(editingTariff.base_price) || 0;
                        setEditingTariff({
                          ...editingTariff,
                          point_commission: Math.round((val * 0.15) * 100) / 100
                        });
                      }}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                    >
                      (Calcular 15%)
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTariff.point_commission}
                    onChange={e => setEditingTariff({ ...editingTariff, point_commission: Number(e.target.value) })}
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Peso Máx (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingTariff.max_weight_kg}
                    onChange={e => setEditingTariff({ ...editingTariff, max_weight_kg: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Precio Kg Extra ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTariff.extra_kg_price}
                    onChange={e => setEditingTariff({ ...editingTariff, extra_kg_price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Costo Hub ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTariff.hub_cost}
                    onChange={e => setEditingTariff({ ...editingTariff, hub_cost: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Días Mínimo</label>
                  <input
                    type="number"
                    value={editingTariff.transit_days_min}
                    onChange={e => setEditingTariff({ ...editingTariff, transit_days_min: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Días Máximo</label>
                  <input
                    type="number"
                    value={editingTariff.transit_days_max}
                    onChange={e => setEditingTariff({ ...editingTariff, transit_days_max: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tariffActiveCheck"
                  checked={editingTariff.is_active === 1 || Boolean(editingTariff.is_active)}
                  onChange={e => setEditingTariff({ ...editingTariff, is_active: e.target.checked ? 1 : 0 })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="tariffActiveCheck" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Tarifa Activa para emisión en mostrador
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTariff(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTariff}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingTariff ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Hub */}
      {editingHub && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Editar Centro Logístico [{editingHub.code}]
                </h3>
                <p className="text-xs text-slate-400">{editingHub.name}</p>
              </div>
              <button onClick={() => setEditingHub(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHub} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nombre Oficial</label>
                <input
                  type="text"
                  value={editingHub.name}
                  onChange={e => setEditingHub({ ...editingHub, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dirección Completa</label>
                <input
                  type="text"
                  value={editingHub.address}
                  onChange={e => setEditingHub({ ...editingHub, address: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Latitud GPS</label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={editingHub.latitude}
                    onChange={e => setEditingHub({ ...editingHub, latitude: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Longitud GPS</label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={editingHub.longitude}
                    onChange={e => setEditingHub({ ...editingHub, longitude: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Responsable / Gerente</label>
                  <input
                    type="text"
                    value={editingHub.manager_name || ''}
                    onChange={e => setEditingHub({ ...editingHub, manager_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Teléfono Contacto</label>
                  <input
                    type="text"
                    value={editingHub.phone || ''}
                    onChange={e => setEditingHub({ ...editingHub, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Horario de Operación</label>
                <input
                  type="text"
                  value={editingHub.operating_hours || ''}
                  onChange={e => setEditingHub({ ...editingHub, operating_hours: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingHub(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingHub}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingHub ? 'Guardando...' : 'Guardar Hub'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
