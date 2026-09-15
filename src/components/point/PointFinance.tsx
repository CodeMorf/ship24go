import React, { useState, useEffect } from 'react';
import {
  Wallet,
  DollarSign,
  CreditCard,
  Banknote,
  Receipt,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../../lib/api';

interface PointFinanceProps {
  point: any;
}

export const PointFinance: React.FC<PointFinanceProps> = ({ point }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadFinance = async () => {
    setLoading(true);
    try {
      const res = await api.getPointFinanceSummary();
      setData(res);
    } catch (err: any) {
      console.error('Error cargando finanzas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinance();
  }, []);

  const summary = data?.summary || {};
  const movements = data?.movements || [];

  return (
    <div className="space-y-7">
      {/* Título y Resumen */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[2rem] p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 mb-2">
              <Wallet className="w-3.5 h-3.5" />
              Arqueo de Caja y Finanzas del Mostrador
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Control de Caja & Ingresos
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Conciliación diaria del dinero en efectivo recibido de clientes en mostrador, pagos electrónicos y comisiones acumuladas.
            </p>
          </div>

          <button
            onClick={loadFinance}
            className="self-start sm:self-auto bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Arqueo
          </button>
        </div>
      </div>

      {/* TARJETAS DE ARQUEO DIARIO */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Efectivo en Mano Hoy */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400">Efectivo en Caja Hoy</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-slate-900 dark:text-white">
            ${Number(summary.cashInHandToday || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            Dinero físico a rendir en cajón
          </p>
        </div>

        {/* Ventas Tarjeta Hoy */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400">Ventas Tarjeta POS</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-slate-900 dark:text-white">
            ${Number(summary.cardSalesToday || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Procesado por terminal electrónico
          </p>
        </div>

        {/* Total Ingresos Cobrados Hoy */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400">Ingresos Totales Hoy</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-slate-900 dark:text-white">
            ${Number(summary.totalRevenueToday || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {summary.movementsCountToday || 0} operaciones cobradas
          </p>
        </div>

        {/* Comisiones Ganadas Hoy */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">Tus Comisiones Hoy</span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-emerald-700 dark:text-emerald-300">
            +${Number(summary.commissionsToday || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            Ganancia neta directa del Point
          </p>
        </div>
      </div>

      {/* TABLA DE MOVIMIENTOS RECIENTES DE CAJA */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xs">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          Libro de Caja y Cobros en Mostrador
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Registro de cada cobro físico y electrónico realizado en la terminal.
        </p>

        {movements.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Receipt className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            No hay movimientos de caja registrados hoy todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-black text-[10px]">
                <tr>
                  <th className="p-3.5">Fecha y Hora</th>
                  <th className="p-3.5">Tipo de Cobro</th>
                  <th className="p-3.5">Concepto / Detalle</th>
                  <th className="p-3.5">Moneda</th>
                  <th className="p-3.5 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {movements.map((m: any) => {
                  const isCash = m.movement_type === 'sale_cash';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 text-slate-500 font-medium">
                        {new Date(m.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black ${
                            isCash
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {isCash ? <Banknote className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                          {isCash ? 'Efectivo en Caja' : 'Tarjeta POS'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {m.notes || 'Cobro de envío'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 uppercase">
                        {m.currency || 'USD'}
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                        ${Number(m.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
