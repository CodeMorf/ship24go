import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Clock, AlertTriangle, ArrowLeft, Package, Sparkles } from 'lucide-react';
import AdminBusinessPlan from '../components/AdminBusinessPlan';
import { BrandMark } from '../lib/brand';

export default function PublicBusinessPlan() {
  const { token: routeToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [expiresInFormatted, setExpiresInFormatted] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setLoading(false);
        setIsValid(false);
        setErrorMessage('No se ha proporcionado un token de acceso para este plan de negocio.');
        return;
      }

      // Check if it is a demo or fallback token with valid 24h expiration
      if (token.includes('.demo') || token.includes('.pubtoken')) {
        const expStr = token.split('.')[0];
        const exp = parseInt(expStr, 10);
        if (!isNaN(exp) && exp > Date.now()) {
          const diffMs = exp - Date.now();
          const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
          const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          setIsValid(true);
          setExpiresInFormatted(`${hoursLeft}h ${minutesLeft}m`);
          setLoading(false);
          return;
        }
      }

      try {
        const res = await fetch(`/api/public/plan/verify-token?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          setIsValid(true);
          setExpiresInFormatted(data.expiresInFormatted || 'menos de 24 horas');
        } else {
          setIsValid(false);
          setErrorMessage(data.message || 'Este enlace ha expirado o no es válido.');
        }
      } catch (err) {
        // En caso de modo offline o demo
        if (token.includes('.pubtoken') || token.includes('.demo')) {
          setIsValid(true);
          setExpiresInFormatted('24 horas');
        } else {
          setIsValid(false);
          setErrorMessage('Error de conexión al validar el enlace de seguridad.');
        }
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Verificando enlace seguro...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/40 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Enlace Expirado o No Válido
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {errorMessage || 'Los enlaces de presentación del Business Plan tienen una validez de 24 horas por motivos de confidencialidad comercial.'}
          </p>

          <div className="pt-2">
            <p className="text-xs text-slate-400 mb-4">
              Si necesitas revisar este análisis, por favor solicita un nuevo enlace temporal al Super Administrador de Ship24GO.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" /> Ir a la página principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark iconClassName="w-8 h-8 rounded-lg" textClassName="text-lg font-black" />
            <span className="hidden sm:inline-block h-4 w-px bg-slate-200 dark:bg-slate-700"></span>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-500 dark:text-slate-400">
              Presentación Ejecutiva
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Vence en: <strong className="font-mono font-black">{expiresInFormatted}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <AdminBusinessPlan isPublicView={true} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-900">
        <p>© 2026 Ship24GO Logistics Inc. Documento confidencial para socios y comercios autorizados.</p>
      </footer>
    </div>
  );
}
