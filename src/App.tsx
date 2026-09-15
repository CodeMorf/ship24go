import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { IntegrationCallback } from './pages/IntegrationCallback';
import { BrandProvider } from './lib/brand';

// Lazy-loaded route chunks to ensure initial load is under 80KB
const PublicPages = lazy(() => import('./pages/Public'));
const AuthPages = lazy(() => import('./pages/Auth'));
const CustomerPanel = lazy(() => import('./pages/CustomerPanel'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const PointPages = lazy(() => import('./pages/Point'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] font-mono tracking-widest text-slate-400">SHIP24GO</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrandProvider>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/*" element={<PublicPages />} />
          <Route path="/auth/*" element={<AuthPages />} />
          <Route path="/point/*" element={<PointPages />} />
          <Route path="/panel/*" element={<CustomerPanel />} />
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/es/customer/integeration" element={<IntegrationCallback />} />
          <Route path="/customer/integration" element={<IntegrationCallback />} />
        </Routes>
      </Suspense>
      <PwaInstallBanner />
    </BrandProvider>
  );
}
