import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type BrandSettings = {
  siteName: string;
  shortName: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  themeColor: string;
};

export const DEFAULT_BRAND: BrandSettings = {
  siteName: 'Ship24go',
  shortName: 'Ship24go',
  tagline: 'Inteligencia en Envíos',
  seoTitle: 'Ship24go - Inteligencia en Envíos',
  seoDescription: 'La plataforma inteligente definitiva de envíos ecommerce.',
  seoKeywords: 'envíos ecommerce, logística, tracking, paquetería, cotizador de envíos',
  logoUrl: '/brand/logo.png',
  faviconUrl: '/brand/favicon-32.png',
  ogImageUrl: '/brand/og-image.jpg',
  themeColor: '#2563eb'
};

const BrandContext = createContext<{
  brand: BrandSettings;
  loading: boolean;
  refreshBrand: () => Promise<void>;
}>({
  brand: DEFAULT_BRAND,
  loading: true,
  refreshBrand: async () => {}
});

const mergeBrand = (incoming: Partial<BrandSettings> = {}): BrandSettings => ({
  ...DEFAULT_BRAND,
  ...Object.fromEntries(
    Object.entries(incoming || {}).filter(([, value]) => value !== undefined && value !== null)
  )
});

const upsertMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
};

export const applyBrandToDocument = (brand: BrandSettings) => {
  if (typeof document === 'undefined') return;
  const title = brand.seoTitle || `${brand.siteName} - ${brand.tagline}`;
  document.title = title;
  upsertMeta('description', brand.seoDescription || DEFAULT_BRAND.seoDescription);
  upsertMeta('keywords', brand.seoKeywords || DEFAULT_BRAND.seoKeywords);
  upsertMeta('theme-color', brand.themeColor || DEFAULT_BRAND.themeColor);
  upsertMeta('og:title', title, 'property');
  upsertMeta('og:description', brand.seoDescription || DEFAULT_BRAND.seoDescription, 'property');
  upsertMeta('og:site_name', brand.siteName || DEFAULT_BRAND.siteName, 'property');
  if (brand.ogImageUrl || brand.logoUrl) upsertMeta('og:image', brand.ogImageUrl || brand.logoUrl, 'property');
  upsertLink('icon', brand.faviconUrl || DEFAULT_BRAND.faviconUrl);
  upsertLink('apple-touch-icon', brand.faviconUrl || brand.logoUrl || DEFAULT_BRAND.faviconUrl);
};

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);
  const [loading, setLoading] = useState(true);

  const refreshBrand = async () => {
    try {
      const response = await fetch('/api/public/brand', { credentials: 'same-origin' });
      const data = await response.json();
      const next = mergeBrand(data?.brand || {});
      setBrand(next);
      applyBrandToDocument(next);
    } catch {
      applyBrandToDocument(DEFAULT_BRAND);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBrand();
  }, []);

  const value = useMemo(() => ({ brand, loading, refreshBrand }), [brand, loading]);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export const useBrand = () => useContext(BrandContext);

export function BrandMark({ 
  className = '', 
  iconClassName = '', 
  textClassName = '', 
  dark = false,
  showTagline = false 
}: { 
  className?: string; 
  iconClassName?: string; 
  textClassName?: string; 
  dark?: boolean;
  showTagline?: boolean;
}) {
  const { brand } = useBrand();
  const name = brand.shortName || brand.siteName || DEFAULT_BRAND.shortName;
  const logo = brand.logoUrl || '/brand/logo.png';

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
        <img 
          src={logo} 
          alt={name} 
          className={`object-contain w-full h-full ${iconClassName}`} 
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }} 
        />
      </div>
      <div className="flex flex-col text-left">
        <span className={`${textClassName || (dark ? 'text-white' : 'text-gray-900 dark:text-white')} font-black tracking-tight font-outfit text-2xl leading-none`}>
          SHIP<span className="text-cyan-500 dark:text-cyan-400">24</span>GO
        </span>
        {showTagline && (
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
            {brand.tagline || 'Inteligencia en Envíos'}
          </span>
        )}
      </div>
    </div>
  );
}
