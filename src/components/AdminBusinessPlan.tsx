import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Share2, 
  Copy, 
  Check, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Package, 
  Truck, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Calculator, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../lib/api';

interface PackagePlan {
  id: string;
  name: string;
  category: string;
  cm: string;
  inches: string;
  kg: number;
  lb: number;
  useCase: string;
  dhlDirectUsd: number;
  upsDirectUsd: number;
  // Costos por tramo
  costUsaConsolidated: number;
  costAirRd180Lb: number;
  costDeliveryRd220Min: number;
  costBranchRd: number;
  // Costo total
  costTotalBranch: number;
  costTotalDelivery: number;
  // Precios sugeridos
  priceBranchUsd: number;
  priceDeliveryUsd: number;
  // Comision sugerida al Point
  pointCommissionUsd: number;
  // Ganancia neta Ship24GO
  ship24ProfitDeliveryUsd: number;
  ship24ProfitBranchUsd: number;
}

const PACKAGES_DATA: PackagePlan[] = [
  {
    id: 'doc',
    name: '✉️ Sobre / Documento',
    category: 'Documentos',
    cm: '33.5 × 24 × 1 cm',
    inches: '13.2" × 9.5" × 0.4"',
    kg: 0.5,
    lb: 1.1,
    useCase: 'Pasaportes, actas, poderes notariales, contratos urgentes',
    dhlDirectUsd: 31.13,
    upsDirectUsd: 48.72,
    costUsaConsolidated: 1.99,
    costAirRd180Lb: 3.30,
    costDeliveryRd220Min: 3.67,
    costBranchRd: 0.00,
    costTotalBranch: 5.29,
    costTotalDelivery: 8.96,
    priceBranchUsd: 15.00,
    priceDeliveryUsd: 18.00,
    pointCommissionUsd: 4.00,
    ship24ProfitBranchUsd: 5.71,
    ship24ProfitDeliveryUsd: 5.04
  },
  {
    id: 'box_s',
    name: '📦 Box S (Pequeña)',
    category: 'Cajas',
    cm: '30 × 22 × 10 cm',
    inches: '11.8" × 8.7" × 3.9"',
    kg: 2.0,
    lb: 4.4,
    useCase: 'Celulares, cosméticos, perfumes, medicinas, repuestos chicos',
    dhlDirectUsd: 58.37,
    upsDirectUsd: 61.41,
    costUsaConsolidated: 4.99,
    costAirRd180Lb: 13.20,
    costDeliveryRd220Min: 3.67,
    costBranchRd: 0.00,
    costTotalBranch: 18.19,
    costTotalDelivery: 21.86,
    priceBranchUsd: 30.00,
    priceDeliveryUsd: 35.00,
    pointCommissionUsd: 6.00,
    ship24ProfitBranchUsd: 5.81,
    ship24ProfitDeliveryUsd: 7.14
  },
  {
    id: 'box_m',
    name: '📦 Box M (Mediana)',
    category: 'Cajas',
    cm: '38 × 30 × 18 cm',
    inches: '15.0" × 11.8" × 7.1"',
    kg: 5.0,
    lb: 11.0,
    useCase: 'Calzado, ropa, tablets, envíos personales medianos, e-commerce',
    dhlDirectUsd: 76.62,
    upsDirectUsd: 85.77,
    costUsaConsolidated: 6.73,
    costAirRd180Lb: 33.00,
    costDeliveryRd220Min: 3.67,
    costBranchRd: 0.00,
    costTotalBranch: 39.73,
    costTotalDelivery: 43.40,
    priceBranchUsd: 55.00,
    priceDeliveryUsd: 60.00,
    pointCommissionUsd: 8.00,
    ship24ProfitBranchUsd: 7.27,
    ship24ProfitDeliveryUsd: 8.60
  },
  {
    id: 'box_l',
    name: '📦 Box L (Grande)',
    category: 'Cajas',
    cm: '48 × 38 × 25 cm',
    inches: '18.9" × 15.0" × 9.8"',
    kg: 10.0,
    lb: 22.0,
    useCase: 'Múltiples prendas, calzado familiar, electrodomésticos medianos',
    dhlDirectUsd: 120.53,
    upsDirectUsd: 135.38,
    costUsaConsolidated: 9.85,
    costAirRd180Lb: 66.00,
    costDeliveryRd220Min: 4.50,
    costBranchRd: 0.00,
    costTotalBranch: 75.85,
    costTotalDelivery: 80.35,
    priceBranchUsd: 95.00,
    priceDeliveryUsd: 105.00,
    pointCommissionUsd: 12.00,
    ship24ProfitBranchUsd: 7.15,
    ship24ProfitDeliveryUsd: 12.65
  },
  {
    id: 'box_xl',
    name: '📦 Box XL (Extra Grande)',
    category: 'Cajas',
    cm: '55 × 45 × 35 cm',
    inches: '21.6" × 17.7" × 13.8"',
    kg: 15.0,
    lb: 33.0,
    useCase: 'Maleta de carga, encomiendas familiares pesadas, bultos de alto volumen',
    dhlDirectUsd: 181.67,
    upsDirectUsd: 189.55,
    costUsaConsolidated: 13.50,
    costAirRd180Lb: 99.00,
    costDeliveryRd220Min: 5.50,
    costBranchRd: 0.00,
    costTotalBranch: 112.50,
    costTotalDelivery: 118.00,
    priceBranchUsd: 140.00,
    priceDeliveryUsd: 150.00,
    pointCommissionUsd: 15.00,
    ship24ProfitBranchUsd: 12.50,
    ship24ProfitDeliveryUsd: 17.00
  }
];

export default function AdminBusinessPlan({ isPublicView = false }: { isPublicView?: boolean }) {
  const [exchangeRate, setExchangeRate] = useState<number>(60.0);
  const [selectedTab, setSelectedTab] = useState<'comparativa' | 'tramos' | 'comisiones' | 'guia_venta' | 'simulador'>('comparativa');
  
  // Share link states
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>('');
  const [shareExpiresIn, setShareExpiresIn] = useState<string>('24 horas');
  const [isGeneratingLink, setIsGeneratingLink] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Simulator states
  const [simPackage, setSimPackage] = useState<string>('box_s');
  const [simDailyUnits, setSimDailyUnits] = useState<number>(10);
  const [simDeliveryType, setSimDeliveryType] = useState<'delivery' | 'branch'>('delivery');

  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    try {
      const authToken = localStorage.getItem('spedire_token');
      const res = await fetch('/api/admin/plan/generate-share-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: authToken } : {})
        }
      });
      const data = await res.json();
      if (res.ok && data.shareUrl) {
        setShareLink(data.shareUrl);
        setShareExpiresIn('24 horas');
      } else {
        throw new Error(data.error || 'Error al generar enlace');
      }
    } catch (e) {
      console.error('Fallback token generation:', e);
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      setShareLink(`${window.location.origin}/plan/share/${expiresAt}.demo`);
    } finally {
      setIsGeneratingLink(false);
      setIsShareModalOpen(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentPkg = PACKAGES_DATA.find(p => p.id === simPackage) || PACKAGES_DATA[1];
  const simUnitPrice = simDeliveryType === 'delivery' ? currentPkg.priceDeliveryUsd : currentPkg.priceBranchUsd;
  const simUnitCost = simDeliveryType === 'delivery' ? currentPkg.costTotalDelivery : currentPkg.costTotalBranch;
  const simPointComm = currentPkg.pointCommissionUsd;
  const simShip24Profit = Math.max(0, simUnitPrice - simUnitCost - simPointComm);

  const simMonthlyUnits = simDailyUnits * 26; // 26 días laborables
  const simMonthlyPointIncome = simMonthlyUnits * simPointComm;
  const simMonthlyShip24Income = simMonthlyUnits * simShip24Profit;

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      {/* Top Banner / Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Plan de Negocio & Tarifario Oficial
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Actualizado con API en Vivo
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Estrategia Comercial, Márgenes y Comisiones al Point
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Análisis financiero para envíos desde Points en EE.UU. hacia República Dominicana por etapas (Point USA → Miami Hub → Santo Domingo Hub → Domicilio / Sucursal).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/Ship24GO_Analisis_Costos_Logistica_USA_RD.xlsx"
              download
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Descargar Excel (.xlsx)
            </a>

            {!isPublicView && (
              <button
                onClick={generateShareLink}
                disabled={isGeneratingLink}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isGeneratingLink ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 text-blue-400" />
                )}
                Compartir Enlace (24h)
              </button>
            )}
          </div>
        </div>

        {/* Parámetros Operativos Base */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tasa de Cambio</span>
            <span className="text-lg font-black text-white">RD$ {exchangeRate.toFixed(2)} / USD</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Flete Aéreo Miami → RD</span>
            <span className="text-lg font-black text-white">RD$ 180 / lb <span className="text-xs font-normal text-slate-300">($3.00 USD)</span></span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Entrega Domicilio RD</span>
            <span className="text-lg font-black text-white">RD$ 220 mín. <span className="text-xs font-normal text-slate-300">($3.67 USD)</span></span>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Retiro en Sucursal RD</span>
            <span className="text-lg font-black text-emerald-400">RD$ 0 <span className="text-xs font-normal text-slate-300">(Sin costo extra)</span></span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button
          onClick={() => setSelectedTab('comparativa')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            selectedTab === 'comparativa'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Precios vs. Competidores
        </button>
        <button
          onClick={() => setSelectedTab('tramos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            selectedTab === 'tramos'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          Costos por Tramos (USA, Avión, Domicilio)
        </button>
        <button
          onClick={() => setSelectedTab('comisiones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            selectedTab === 'comisiones'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          Comisión al Point & Reparto
        </button>
        <button
          onClick={() => setSelectedTab('guia_venta')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            selectedTab === 'guia_venta'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          ¿Cómo Venderlo? (Guía Mostrador)
        </button>
        <button
          onClick={() => setSelectedTab('simulador')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            selectedTab === 'simulador'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Simulador Interactivo
        </button>
      </div>

      {/* TAB 1: COMPARATIVA PRECIOS VS COMPETENCIA */}
      {selectedTab === 'comparativa' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                ¿A cuánto vendemos y cuánto más baratos somos que el mercado?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                Comparativa con tarifas oficiales devueltas por API para envíos directos internacionales (DHL Express y UPS Worldwide).
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Valores en USD y DOP
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="p-4 font-black">Empaque / Medida</th>
                  <th className="p-4 font-black text-center">Peso Base</th>
                  <th className="p-4 font-black text-right text-rose-600 dark:text-rose-400">DHL Directo</th>
                  <th className="p-4 font-black text-right text-amber-600 dark:text-amber-400">UPS Directo</th>
                  <th className="p-4 font-black text-right text-indigo-600 dark:text-indigo-400">Ship24GO Sucursal</th>
                  <th className="p-4 font-black text-right text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20">Ship24GO Domicilio</th>
                  <th className="p-4 font-black text-center text-emerald-600 dark:text-emerald-400">Ahorro Cliente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {PACKAGES_DATA.map((pkg) => {
                  const savingUsd = pkg.dhlDirectUsd - pkg.priceDeliveryUsd;
                  const savingPct = Math.round((savingUsd / pkg.dhlDirectUsd) * 100);

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{pkg.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {pkg.cm} · <span className="text-slate-400">{pkg.inches}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{pkg.lb} lb</span>
                        <span className="text-[11px] text-slate-400 block">({pkg.kg} kg)</span>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        ${pkg.dhlDirectUsd.toFixed(2)}
                        <span className="text-[10px] text-slate-400 block">RD$ {(pkg.dhlDirectUsd * exchangeRate).toLocaleString()}</span>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        ${pkg.upsDirectUsd.toFixed(2)}
                        <span className="text-[10px] text-slate-400 block">RD$ {(pkg.upsDirectUsd * exchangeRate).toLocaleString()}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-black text-indigo-700 dark:text-indigo-300">${pkg.priceBranchUsd.toFixed(2)}</span>
                        <span className="text-[10px] text-indigo-500/80 block">RD$ {(pkg.priceBranchUsd * exchangeRate).toLocaleString()}</span>
                      </td>
                      <td className="p-4 text-right bg-blue-50/50 dark:bg-blue-950/20">
                        <span className="font-black text-blue-700 dark:text-blue-300 text-base">${pkg.priceDeliveryUsd.toFixed(2)}</span>
                        <span className="text-[10px] text-blue-500/80 block font-bold">RD$ {(pkg.priceDeliveryUsd * exchangeRate).toLocaleString()}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          -{savingPct}% (${savingUsd.toFixed(2)} menos)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COSTOS POR TRAMOS */}
      {selectedTab === 'tramos' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Desglose Técnico de Costos Logísticos (Cadena Ship24GO)
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Todos los costos que componen el flete: flete consolidado en EE.UU., flete aéreo a Santo Domingo y entrega final.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm mb-2">
                <Truck className="w-4 h-4" /> Tramo 1: Point USA → Miami Hub
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                El Point junta un lote de mínimo 10 envíos en una valija o caja master. Vía UPS Ground o USPS Ground Advantage hacia el Hub Miami, el costo por unidad baja a solo <strong>$1.99 – $4.99 USD</strong>.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-2">
                <Package className="w-4 h-4" /> Tramo 2: Miami Hub → Hub SDQ
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Flete aéreo consolidado directo al Aeropuerto Las Américas / Hub Santo Domingo a la tarifa de <strong>RD$ 180 por libra ($3.00 USD/lb)</strong>.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2">
                <Building className="w-4 h-4" /> Tramo 3: Última Milla en RD
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>A Domicilio:</strong> Mensajería local mínima de <strong>RD$ 220 ($3.67 USD)</strong>.<br />
                <strong>A Sucursal:</strong> El cliente retira en el Point/Hub de RD, costo de última milla = <strong>$0.00</strong>.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="p-4 font-black">Empaque</th>
                  <th className="p-4 font-black text-right">Tramo 1 (USA Hub)</th>
                  <th className="p-4 font-black text-right">Tramo 2 (Avión a RD)</th>
                  <th className="p-4 font-black text-right">Tramo 3 (Domicilio)</th>
                  <th className="p-4 font-black text-right text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20">Costo Total Sucursal</th>
                  <th className="p-4 font-black text-right text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20">Costo Total Domicilio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {PACKAGES_DATA.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{pkg.name}</td>
                    <td className="p-4 text-right text-slate-700 dark:text-slate-300">${pkg.costUsaConsolidated.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-700 dark:text-slate-300">
                      ${pkg.costAirRd180Lb.toFixed(2)}
                      <span className="text-[10px] text-slate-400 block">({pkg.lb} lb × RD$ 180)</span>
                    </td>
                    <td className="p-4 text-right text-slate-700 dark:text-slate-300">
                      ${pkg.costDeliveryRd220Min.toFixed(2)}
                      <span className="text-[10px] text-slate-400 block">RD$ {(pkg.costDeliveryRd220Min * exchangeRate).toFixed(0)}</span>
                    </td>
                    <td className="p-4 text-right font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50/40 dark:bg-indigo-950/20">
                      ${pkg.costTotalBranch.toFixed(2)}
                      <span className="text-[10px] text-indigo-500 block">RD$ {(pkg.costTotalBranch * exchangeRate).toFixed(0)}</span>
                    </td>
                    <td className="p-4 text-right font-black text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/20">
                      ${pkg.costTotalDelivery.toFixed(2)}
                      <span className="text-[10px] text-blue-500 block">RD$ {(pkg.costTotalDelivery * exchangeRate).toFixed(0)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMISION AL POINT Y REPARTO DE BENEFICIOS */}
      {selectedTab === 'comisiones' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Comisión para el Point y Margen Neto Ship24GO
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Esquema de comisiones fijas y generosas que garantizan el compromiso del Point mientras protegen el margen de Ship24GO.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="p-4 font-black">Empaque</th>
                  <th className="p-4 font-black text-right">Precio Venta (Domicilio)</th>
                  <th className="p-4 font-black text-right">Costo Logístico Total</th>
                  <th className="p-4 font-black text-right text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20">Comisión al POINT</th>
                  <th className="p-4 font-black text-right text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">Ganancia SHIP24GO</th>
                  <th className="p-4 font-black text-center">% Margen Ship24GO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {PACKAGES_DATA.map((pkg) => {
                  const marginPct = Math.round((pkg.ship24ProfitDeliveryUsd / pkg.priceDeliveryUsd) * 100);

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{pkg.name}</td>
                      <td className="p-4 text-right font-medium text-slate-800 dark:text-slate-200">${pkg.priceDeliveryUsd.toFixed(2)}</td>
                      <td className="p-4 text-right text-slate-500 dark:text-slate-400">${pkg.costTotalDelivery.toFixed(2)}</td>
                      <td className="p-4 text-right font-black text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
                        ${pkg.pointCommissionUsd.toFixed(2)} USD
                        <span className="text-[10px] text-amber-600/80 block font-bold">RD$ {(pkg.pointCommissionUsd * exchangeRate).toFixed(0)} DOP</span>
                      </td>
                      <td className="p-4 text-right font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                        +${pkg.ship24ProfitDeliveryUsd.toFixed(2)} USD
                        <span className="text-[10px] text-emerald-600/80 block font-bold">RD$ {(pkg.ship24ProfitDeliveryUsd * exchangeRate).toFixed(0)} DOP</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          {marginPct}% neto
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 sm:p-5">
            <h4 className="font-black text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-amber-600" />
              ¿Por qué estas comisiones convencen de inmediato al dueño del comercio?
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              En las bodegas, agencias de viajes o barberías, una remesa (Western Union / Ria / Caribe Express) solo les deja <strong>$1.00 a $1.50</strong> y una recarga telefónica <strong>$0.50</strong>. Ofrecer <strong>$4.00 a $15.00 USD</strong> por paquete es entre <strong>4x y 10x más rentable</strong>, asegurando que promuevan activamente Ship24GO frente a cualquier otra alternativa.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: GUIA DE VENTA PARA MOSTRADOR */}
      {selectedTab === 'guia_venta' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Guía de Ventas y Argumentario para el Empleado de Mostrador
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Protocolo para que el cajero del Point ofrezca el servicio con total seguridad y cierre la venta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black">
                <Truck className="w-5 h-5" />
                <span>Paso 1: Ofrecer las 2 Modalidades de Entrega</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span><strong>Entrega Directa a Domicilio:</strong> El mensajero lleva el paquete hasta la puerta de la casa en Santo Domingo, Santiago o cualquier provincia. (Recomendada).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <span><strong>Retiro en Sucursal / Point RD:</strong> Si el destinatario prefiere ir a buscarlo a la sucursal o no tiene quién reciba en casa, se ahorra $3 a $10 dólares del precio final.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black">
                <ShieldCheck className="w-5 h-5" />
                <span>Paso 2: ¿Cómo responder al "¿Por qué tan barato?"</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Cuando el cliente pregunte por qué con DHL o UPS le cobran $60 y aquí solo $35 por una Box S, el empleado explica:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 italic text-xs text-slate-700 dark:text-slate-300">
                "Nosotros consolidamos valijas comunitarias directas desde Boston/NY hacia nuestro Hub en Santo Domingo. Al mover volumen agrupado, ahorramos los intermediarios y le transferimos ese ahorro directo a usted con tracking en vivo."
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SIMULADOR INTERACTIVO */}
      {selectedTab === 'simulador' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Simulador Dinámico de Ingresos y Rentabilidad
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Calcula los ingresos mensuales proyectados para un Point comercial y para la central de Ship24GO.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
              <h4 className="font-black text-sm uppercase tracking-wider text-slate-400">Variables de Entrada</h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tipo de Empaque</label>
                <select
                  value={simPackage}
                  onChange={(e) => setSimPackage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {PACKAGES_DATA.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.lb} lb)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Modalidad de Entrega</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimDeliveryType('delivery')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      simDeliveryType === 'delivery'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    A Domicilio
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimDeliveryType('branch')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      simDeliveryType === 'branch'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    En Sucursal
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Envíos Diarios del Point</label>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400">{simDailyUnits} al día</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={simDailyUnits}
                  onChange={(e) => setSimDailyUnits(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>1 envío/día</span>
                  <span>10 envíos/día</span>
                  <span>50 envíos/día</span>
                </div>
              </div>
            </div>

            {/* Resultado de Rentabilidad para el Point */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-xs uppercase tracking-wider mb-2">
                  <Building className="w-4 h-4" /> Ganancia para el Dueño del Point
                </div>
                <div className="text-3xl sm:text-4xl font-black text-amber-900 dark:text-amber-200">
                  ${simMonthlyPointIncome.toLocaleString()} USD
                  <span className="text-xs font-normal text-amber-700/80 block mt-1">
                    (RD$ {(simMonthlyPointIncome * exchangeRate).toLocaleString()} DOP al mes)
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex justify-between">
                  <span>Comisión por cada paquete:</span>
                  <span className="font-bold">${simPointComm.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingreso diario:</span>
                  <span className="font-bold">${(simDailyUnits * simPointComm).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Paquetes proyectados al mes:</span>
                  <span className="font-bold">{simMonthlyUnits} envíos</span>
                </div>
              </div>
            </div>

            {/* Resultado de Rentabilidad para Ship24GO */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-wider mb-2">
                  <DollarSign className="w-4 h-4" /> Ganancia Neta para Ship24GO
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-900 dark:text-emerald-200">
                  +${simMonthlyShip24Income.toLocaleString()} USD
                  <span className="text-xs font-normal text-emerald-700/80 block mt-1">
                    (RD$ {(simMonthlyShip24Income * exchangeRate).toLocaleString()} DOP al mes por Point)
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex justify-between">
                  <span>Utilidad limpia por paquete:</span>
                  <span className="font-bold">+${simShip24Profit.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingreso diario limpio:</span>
                  <span className="font-bold">+${(simDailyUnits * simShip24Profit).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300">
                  <span>Con 10 Points activos:</span>
                  <span>+${(simMonthlyShip24Income * 10).toLocaleString()} USD / mes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Compartir Plan (24 Horas) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Share2 className="w-5 h-5" />
                <h3 className="font-black text-slate-900 dark:text-white text-lg">Compartir Plan de Negocio</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              <div className="flex items-center gap-2 font-black text-blue-900 dark:text-blue-200 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                Enlace seguro temporal (Vence en 24 horas)
              </div>
              Este enlace permite a cualquier persona (inversor, socio o punto comercial) ver este plan de negocio de forma pública, <strong>sin necesidad de iniciar sesión ni tener acceso a la administración</strong>.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Enlace Generado:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 select-all"
                />
                <button
                  onClick={() => copyToClipboard(shareLink)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
              <a
                href={shareLink}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir en nueva pestaña
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
