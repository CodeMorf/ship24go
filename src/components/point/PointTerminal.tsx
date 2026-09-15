import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Package,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Printer,
  DollarSign,
  CreditCard,
  Banknote,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { PointThermalLabel } from './PointThermalLabel';

const DR_PROVINCES = [
  'Distrito Nacional (Santo Domingo Centro)',
  'Santo Domingo Este',
  'Santo Domingo Oeste',
  'Santo Domingo Norte',
  'Santiago de los Caballeros',
  'La Vega',
  'Puerto Plata',
  'San Cristóbal',
  'San Pedro de Macorís',
  'La Romana',
  'Higüey / Punta Cana / Verón',
  'Duarte (San Francisco de Macorís)',
  'Espaillat (Moca)',
  'Bonao (Monseñor Nouel)',
  'Baní (Peravia)',
  'Azua',
  'Barahona',
  'San Juan de la Maguana',
  'Samaná',
  'Monte Plata',
  'Hato Mayor',
  'El Seibo',
  'Valverde (Mao)'
];

interface PointTerminalProps {
  point: any;
  onShipmentCreated: () => void;
}

export const PointTerminal: React.FC<PointTerminalProps> = ({ point, onShipmentCreated }) => {
  const [tariffs, setTariffs] = useState<any[]>([]);
  const [loadingTariffs, setLoadingTariffs] = useState(true);
  const [selectedTariffId, setSelectedTariffId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdShipment, setCreatedShipment] = useState<any | null>(null);

  // Formulario
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [weightKg, setWeightKg] = useState<string>('');
  
  // Remitente mostrador (prellenado con defaults)
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState(point?.address_line1 || '');
  const [senderCity, setSenderCity] = useState(point?.city || 'Boston');

  // Destinatario República Dominicana
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientProvince, setRecipientProvince] = useState(DR_PROVINCES[0]);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientIdNumber, setRecipientIdNumber] = useState('');
  const [packageDescription, setPackageDescription] = useState('Documentos familiares / personales');

  useEffect(() => {
    const fetchTariffs = async () => {
      setLoadingTariffs(true);
      try {
        const res = await api.getPointTariffs('US', 'DO');
        setTariffs(res.tariffs || []);
        if (res.tariffs?.length) {
          setSelectedTariffId(res.tariffs[0].id);
          setWeightKg(String(res.tariffs[0].max_weight_kg || '0.5'));
        }
      } catch (err: any) {
        console.error('Error cargando tarifas:', err);
      } finally {
        setLoadingTariffs(false);
      }
    };
    fetchTariffs();
  }, []);

  const selectedTariff = useMemo(() => {
    return tariffs.find((t) => t.id === selectedTariffId) || null;
  }, [tariffs, selectedTariffId]);

  // Manejo de cambio de tarifa
  const handleSelectTariff = (tariff: any) => {
    setSelectedTariffId(tariff.id);
    setWeightKg(String(tariff.max_weight_kg || '0.5'));
    if (tariff.product_type === 'document' || tariff.product_type === 'legal_document') {
      setPackageDescription(tariff.product_type === 'legal_document' ? 'Documentos legales notariales' : 'Documentos personales');
    } else {
      setPackageDescription('Ropa, calzado y artículos personales');
    }
  };

  // Cálculo en vivo
  const calculation = useMemo(() => {
    if (!selectedTariff) return { base: 0, extra: 0, total: 0, commission: 0 };
    const base = Number(selectedTariff.base_price || 0);
    const maxKg = Number(selectedTariff.max_weight_kg || 1);
    const actualKg = Math.max(0.1, Number(weightKg || maxKg));
    const extraKg = actualKg > maxKg ? Math.ceil(actualKg - maxKg) : 0;
    const extraPrice = extraKg * Number(selectedTariff.extra_kg_price || 0);
    const total = Math.round((base + extraPrice) * 100) / 100;
    const commission = Number(selectedTariff.point_commission || 0);
    return { base, extra: extraPrice, total, commission };
  }, [selectedTariff, weightKg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTariff) {
      setError('Por favor selecciona una tarifa.');
      return;
    }
    if (!recipientName.trim() || !recipientPhone.trim() || !recipientAddress.trim()) {
      setError('Por favor completa los campos del destinatario en República Dominicana.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        tariffId: selectedTariff.id,
        sender: {
          name: senderName.trim() || point.contact_name,
          phone: senderPhone.trim() || point.phone,
          address: senderAddress.trim() || point.address_line1,
          city: senderCity.trim() || point.city,
          state: point.province || 'MA',
          zipCode: point.postal_code || '02114',
          country: point.country || 'US'
        },
        recipient: {
          name: recipientName.trim(),
          phone: recipientPhone.trim(),
          province: recipientProvince,
          city: recipientProvince.split('(')[0].trim(),
          address: recipientAddress.trim(),
          idNumber: recipientIdNumber.trim(),
          country: 'DO'
        },
        package: {
          weightKg: Number(weightKg || selectedTariff.max_weight_kg || 0.5),
          description: packageDescription
        },
        paymentMethod
      };

      const res = await api.createPointTerminalShipment(payload);
      if (res.success && res.shipment) {
        setCreatedShipment(res.shipment);
        // Reset form
        setRecipientName('');
        setRecipientPhone('');
        setRecipientAddress('');
        setRecipientIdNumber('');
        setSenderName('');
        setSenderPhone('');
        onShipmentCreated();
      }
    } catch (err: any) {
      setError(err.message || 'Error al emitir el envío en mostrador.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Etiqueta térmica lista para imprimir */}
      {createdShipment && (
        <PointThermalLabel
          shipment={createdShipment}
          point={point}
          onClose={() => setCreatedShipment(null)}
        />
      )}

      {/* Título de la Terminal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 rounded-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-52 h-52 bg-cyan-400/20 rounded-full blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-cyan-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Mostrador Oficial Ship24Go · Salida directa a RD
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Terminal de Emisión de Envíos</h2>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Registra al cliente presencial, cobra en efectivo o tarjeta, genera su etiqueta térmica y asigna su tracking al instante.
          </p>
        </div>

        <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 text-right">
          <p className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">Tu Comisión en Mostrador</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-300">
            +${calculation.commission.toFixed(2)} USD
          </p>
          <p className="text-[10px] text-blue-200 mt-0.5">Acreditado a tu saldo por este envío</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        {/* COLUMNA 1: Selección de Tarifa y Datos del Envío */}
        <div className="space-y-6">
          {/* SELECCIÓN DE PRODUCTO / TARIFA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">1. Selecciona el Tipo de Envío</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tarifas preferenciales de la red Ship24Go (USA &rarr; República Dominicana)</p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">Tarifa Oficial</span>
            </div>

            {loadingTariffs ? (
              <div className="py-8 text-center text-slate-400 text-sm font-bold">Cargando tarifas...</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {tariffs.map((t) => {
                  const isSelected = t.id === selectedTariffId;
                  const isDoc = t.product_type === 'document' || t.product_type === 'legal_document';

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTariff(t)}
                      className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:border-cyan-400 shadow-xs ring-2 ring-blue-600/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                          {isDoc ? <FileText className="w-5 h-5 text-blue-600 dark:text-cyan-400" /> : <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            ${Number(t.base_price).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold block">{t.currency}</span>
                        </div>
                      </div>

                      <p className="font-black text-sm text-slate-900 dark:text-white mt-2 leading-tight">
                        {t.product_name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {t.description}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Hasta {t.max_weight_kg} kg</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Comisión: +${Number(t.point_commission).toFixed(2)}
                        </span>
                      </div>

                      {isDoc && (
                        <div className="mt-2 text-[10px] font-bold text-blue-700 dark:text-cyan-300 bg-blue-100/70 dark:bg-blue-900/40 px-2 py-0.5 rounded-md inline-block">
                          Acumulable en Saca RD (Min 10)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ajuste de peso opcional */}
            {selectedTariff && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Peso de la pieza (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0.5"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Incluido hasta {selectedTariff.max_weight_kg} kg. Extra: ${Number(selectedTariff.extra_kg_price).toFixed(2)}/kg
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Contenido Declarado
                  </label>
                  <input
                    type="text"
                    value={packageDescription}
                    onChange={(e) => setPackageDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ej. Cartas, acta notarial, ropa"
                  />
                </div>
              </div>
            )}
          </div>

          {/* DATOS DEL REMITENTE FÍSICO */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-7 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">2. Cliente Físico en Mostrador</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Datos del remitente que entrega en tu local</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Teléfono Móvil *</label>
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="Ej. +1 617-555-0123"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Dirección Local (Boston / USA)</label>
                <input
                  type="text"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder="Calle, número, apto"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: Destinatario en República Dominicana y Cobro */}
        <div className="space-y-6">
          {/* DATOS DEL DESTINATARIO EN RD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">3. Destinatario en República Dominicana</h3>
              <span className="text-[11px] font-black bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 px-2 py-0.5 rounded-md">
                DO 🇩🇴
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Entrega directa a domicilio en toda República Dominicana</p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nombre Completo del Receptor *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ej. María Antonia Almonte"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Ej. 809-555-0199"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Cédula / Documento (Opcional)
                  </label>
                  <input
                    type="text"
                    value={recipientIdNumber}
                    onChange={(e) => setRecipientIdNumber(e.target.value)}
                    placeholder="Ej. 001-XXXXXXX-X"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Provincia de Destino *
                </label>
                <select
                  value={recipientProvince}
                  onChange={(e) => setRecipientProvince(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {DR_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Dirección Exacta de Entrega *
                </label>
                <textarea
                  required
                  rows={2}
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Calle, Sector, Edificio o Punto de Referencia (ej. Frente al parque central)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* CAJA / FORMA DE PAGO Y RESUMEN */}
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-600/30 dark:border-cyan-400/30 rounded-[2rem] p-6 sm:p-7 shadow-lg">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">4. Cobro en Mostrador</h3>

            {/* Selector de Método de Pago */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-black text-xs transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                Efectivo en Caja
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-black text-xs transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                Tarjeta POS
              </button>
            </div>

            {/* Desglose de Cobro */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-2 border border-slate-100 dark:border-slate-700/60 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Tarifa Base ({selectedTariff?.product_name || 'Servicio'}):</span>
                <span className="font-bold">${calculation.base.toFixed(2)} USD</span>
              </div>
              {calculation.extra > 0 && (
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Exceso de peso:</span>
                  <span className="font-bold">+${calculation.extra.toFixed(2)} USD</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                <span className="font-bold">Tu comisión de ganancia (Point):</span>
                <span className="font-black">+${calculation.commission.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-300 dark:border-slate-600">
                <span className="text-base font-black text-slate-900 dark:text-white">TOTAL A COBRAR:</span>
                <span className="text-3xl font-black text-blue-700 dark:text-cyan-300">
                  ${calculation.total.toFixed(2)} <span className="text-xs font-bold text-slate-500">USD</span>
                </span>
              </div>
            </div>

            {/* Botón de Emisión */}
            <button
              type="submit"
              disabled={submitting || !selectedTariff}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm cursor-pointer hover:scale-[1.01]"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Emitiendo y cobrando...
                </>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  Cobrar ${calculation.total.toFixed(2)} USD y Generar Etiqueta
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
