import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  ArrowRight, 
  Globe, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronDown, 
  Plus, 
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  Zap,
  Shield,
  LineChart,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Star,
  Check,
  Play,
  Trash2,
  Sparkles,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import { CurrencySelector } from '../components/CurrencySelector';
import { useI18n, Language } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { ZipCodeAutocomplete } from '../components/ZipCodeAutocomplete';
import { CountrySelect } from '../components/CountrySelect';
import { api, getAuthToken } from '../lib/api';
import { BrandMark, useBrand } from '../lib/brand';
import { useCurrency } from '../lib/currency';
import { CarrierLogo, resolveCarrierName } from '../lib/carrierBrand';
import { saveGuestQuoteSession } from '../lib/guestQuoteSession';

// Diccionario multilingüe dinámico para toda la Landing según IP
const LANDING_TEXTS: Record<string, Record<string, string>> = {
  es: {
    navQuoter: 'Cotizador',
    navTracking: 'Seguimiento',
    navServices: 'Servicios',
    navDestinations: 'Destinos Globales',
    navPricing: 'Planes & Tarifas',
    btnLogin: 'Ingresar',
    btnRegister: 'Registrarse',
    btnDashboard: 'Ir a Mi Panel',
    heroBadge: '✨ Logística Global Inteligente 2026',
    heroTitle1: 'La Plataforma Global de Logística impulsada por',
    heroTitle2: 'Inteligencia Artificial',
    heroDesc: 'Calcula tarifas en tiempo real con más de 50 transportistas líderes, automatiza tus envíos ecommerce y rastrea cada paquete con precisión milimétrica.',
    heroCtaQuote: 'Cotizar Envíos Ahora',
    heroCtaTrack: 'Rastrear Guía',
    heroStat1Val: '99.8%',
    heroStat1Lbl: 'Entregas a Tiempo',
    heroStat2Val: '+50',
    heroStat2Lbl: 'Couriers Conectados',
    heroStat3Val: '+180',
    heroStat3Lbl: 'Países Cubiertos',
    heroStat4Val: '4.9/5',
    heroStat4Lbl: 'Satisfacción Clientes',
    widgetTitle: 'Cotizador Multi-Courier Inteligente',
    widgetSubtitle: 'Compara al instante tarifas oficiales de DHL, FedEx, UPS, Correos y más.',
    tabQuote: '📦 Cotizar Envíos',
    tabTrack: '🔍 Rastrear Guía',
    origin: 'Origen',
    destination: 'Destino',
    country: 'País',
    zipcode: 'Código Postal',
    pkgDetails: 'Bultos / Paquetes',
    pkgNumber: 'Bulto',
    pkgWeight: 'Peso (kg)',
    pkgLength: 'Largo (cm)',
    pkgWidth: 'Ancho (cm)',
    pkgHeight: 'Alto (cm)',
    addPackage: '+ Añadir otro bulto',
    calcBtn: 'Calcular Tarifas en Tiempo Real',
    calcLoading: 'Consultando transportistas globales...',
    secureMsg: 'Búsqueda 100% segura · Tarifas oficiales negociadas sin costo oculto',
    resultsTitle: 'Tarifas Disponibles para tu Ruta',
    resultsSubtitle: 'Elige la mejor opción entre los transportistas disponibles para tu envío.',
    estimatedDelivery: 'Entrega estimada',
    buyLabel: 'Comprar Etiqueta',
    networkTitle: 'Red Logística Global en Tiempo Real',
    networkSubtitle: 'Monitoreo de tráfico aéreo, marítimo y terrestre en más de 180 países.',
    featBadge: 'Potencia Operativa',
    featTitle: 'Todo lo que necesitas para escalar tu logística',
    featDesc: 'Infraestructura tecnológica de vanguardia para automatizar cada fase de tus envíos internacionales.',
    feat1Title: 'IA de Rutas Inteligentes',
    feat1Desc: 'Nuestros algoritmos eligen automáticamente el transportista más rápido y económico para cada destino.',
    feat2Title: 'Rastreo Predictivo Multicanal',
    feat2Desc: 'Alertas automáticas vía WhatsApp y email con estimación predictiva de hora de entrega.',
    feat3Title: 'Integración E-commerce 1-Click',
    feat3Desc: 'Conecta Shopify, WooCommerce, Wix y APIs REST en minutos para sincronización automática de pedidos.',
    feat4Title: 'Despacho Aduanero Asistido',
    feat4Desc: 'Generación digital de facturas comerciales, códigos HS y documentación aduanera sin fricción.',
    feat5Title: 'Facturación y Wallet Multidivisa',
    feat5Desc: 'Paga en EUR, USD, DOP y más con saldo prepagado, recargas bancarias automáticas y PayPal.',
    feat6Title: 'SLA y Soporte Prioritario 24/7',
    feat6Desc: 'Atención personalizada con agentes dedicados y resolución rápida de incidencias logísticas.',
    pricingBadge: 'Tarifas Transparentes',
    pricingTitle: 'Planes Diseñados para tu Crecimiento',
    pricingSubtitle: 'Sin comisiones ocultas ni sorpresas. Elige el plan que mejor se adapte a tu volumen.',
    mostPopular: 'MÁS POPULAR',
    perMonth: '/mes',
    choosePlan: 'Comenzar Ahora',
    workflowBadge: 'Flujo Sencillo',
    workflowTitle: '¿Cómo funciona Ship24Go?',
    workflowSubtitle: 'En solo 3 pasos envía tus paquetes a cualquier parte del mundo.',
    step1Title: '1. Cotiza y Compara',
    step1Desc: 'Ingresa origen, destino y medidas. Nuestro motor compara al instante decenas de servicios.',
    step2Title: '2. Emite tu Etiqueta',
    step2Desc: 'Genera etiquetas térmicas estándar con código de barras listas para imprimir en un clic.',
    step3Title: '3. Despacha y Rastrea',
    step3Desc: 'El courier recolecta en tu puerta o entregas en punto de servicio. Rastrea en vivo 24/7.',
    destinationsBadge: 'Cobertura Mundial',
    destinationsTitle: 'Destinos Globales Populares',
    destinationsSubtitle: 'Envíos exprés y económicos diarios a los principales centros de comercio.',
    destEurope: 'Europa Central',
    destUSA: 'Estados Unidos y Canadá',
    destLatam: 'Latinoamérica y Caribe',
    destAsia: 'Asia Pacífico',
    destTimeDays: 'días hábiles',
    footerDesc: 'Revolucionando la logística global con inteligencia artificial, transparencia total y conectividad multi-transportista.',
    footerProduct: 'Producto',
    footerDestinations: 'Destinos',
    footerCompany: 'Empresa',
    footerRights: 'Todos los derechos reservados.',
    footerPrivacy: 'Política de Privacidad',
    footerTerms: 'Términos de Servicio',
    footerSecurity: 'Seguridad',
    seoTitle: 'Ship24Go | Logística global y envíos inteligentes',
    seoDescription: 'Cotiza envíos, compara transportistas, crea etiquetas y rastrea paquetes desde una plataforma logística global.',
    trackingPlaceholder: 'Ej: SP24-88492048',
    optionsFound: 'Opciones encontradas',
    networkHeroSuffix: '50+ transportistas',
    networkHubsLabel: 'Hubs exprés',
    networkHubsDesc: 'Aeropuertos y centros de distribución',
    networkInsuranceLabel: 'Seguro de carga',
    networkInsuranceDesc: 'Cobertura contra pérdidas o daños',
    networkCouriersLabel: 'Transportistas oficiales integrados',
    planStandardTitle: 'Plan Estándar',
    planBasicName: 'Ship24Go Básico',
    planProName: 'Ship24Go Pro',
    planEnterpriseName: 'Ship24Go Enterprise',
    planStandardDesc: 'Ideal para particulares y pequeños vendedores ecommerce.',
    planStandardFeature1: 'Tarifas estándar negociadas',
    planStandardFeature2: 'Cotizador multi-courier en vivo',
    planStandardFeature3: 'Descarga de etiquetas al instante',
    planStandardFeature4: 'Seguimiento automatizado de paquetes',
    planProOffer: '10% de descuento en todos los envíos',
    planProDesc: 'Para comercios en crecimiento que buscan el mayor ahorro.',
    planProFeature1: '10% de descuento directo en envíos',
    planProFeature2: 'Rastreo predictivo con IA',
    planProFeature3: 'Sincronización de tiendas Shopify/Woo',
    planProFeature4: 'Soporte prioritario 24/7',
    planEnterpriseOffer: '20% de descuento y máximo ahorro',
    planEnterpriseDesc: 'Para grandes empresas, almacenes y altos volúmenes.',
    planEnterpriseFeature1: '20% de descuento máximo en envíos',
    planEnterpriseFeature2: 'Despacho aduanero asistido y códigos HS',
    planEnterpriseFeature3: 'Account Manager dedicado y SLA',
    planEnterpriseFeature4: 'Webhooks y acceso API sin límite',
    postalDefault: 'Código Postal',
    quoteMissingPostal: 'Completa los códigos postales de origen y destino.',
    quoteNoOptions: 'No encontramos opciones para esta ruta.',
    quoteSuccess: 'Precios públicos oficiales con descuento. Inicia sesión para emitir la etiqueta.',
    quoteFailed: 'No se pudo cotizar ahora. Intenta de nuevo.',
    quoteLogin: 'Inicia sesión o regístrate para comprar la etiqueta con el precio cotizado.',
    footerDestEurope: 'España y Unión Europea',
    footerDestUSA: 'Estados Unidos',
    footerDestDO: 'República Dominicana',
    footerDestLatam: 'América Latina',
    footerApiDocs: 'Documentación API'
  },
  en: {
    navQuoter: 'Rate Calculator',
    navTracking: 'Tracking',
    navServices: 'Services',
    navDestinations: 'Global Destinations',
    navPricing: 'Plans & Pricing',
    btnLogin: 'Log In',
    btnRegister: 'Register',
    btnDashboard: 'Go to Dashboard',
    heroBadge: '✨ Next-Gen AI Global Logistics 2026',
    heroTitle1: 'The Global Logistics Platform powered by',
    heroTitle2: 'Artificial Intelligence',
    heroDesc: 'Calculate real-time rates with 50+ leading carriers, automate your ecommerce shipping, and track every package with pinpoint accuracy.',
    heroCtaQuote: 'Quote Shipments Now',
    heroCtaTrack: 'Track Shipment',
    heroStat1Val: '99.8%',
    heroStat1Lbl: 'On-Time Deliveries',
    heroStat2Val: '50+',
    heroStat2Lbl: 'Connected Couriers',
    heroStat3Val: '180+',
    heroStat3Lbl: 'Countries Covered',
    heroStat4Val: '4.9/5',
    heroStat4Lbl: 'Customer Satisfaction',
    widgetTitle: 'Smart Multi-Carrier Rate Calculator',
    widgetSubtitle: 'Instantly compare official rates from DHL, FedEx, UPS, Postal Services and more.',
    tabQuote: '📦 Quote Shipment',
    tabTrack: '🔍 Track Package',
    origin: 'Origin',
    destination: 'Destination',
    country: 'Country',
    zipcode: 'Zip Code',
    pkgDetails: 'Packages / Parcels',
    pkgNumber: 'Package',
    pkgWeight: 'Weight (kg)',
    pkgLength: 'Length (cm)',
    pkgWidth: 'Width (cm)',
    pkgHeight: 'Height (cm)',
    addPackage: '+ Add another package',
    calcBtn: 'Calculate Real-Time Rates',
    calcLoading: 'Querying global carriers...',
    secureMsg: '100% Secure search · Official negotiated rates with no hidden fees',
    resultsTitle: 'Available Rates for Your Route',
    resultsSubtitle: 'Choose the best option among available carriers for your parcel.',
    estimatedDelivery: 'Estimated delivery',
    buyLabel: 'Buy Shipping Label',
    networkTitle: 'Real-Time Global Logistics Network',
    networkSubtitle: 'Live air, sea, and ground traffic monitoring across 180+ countries.',
    featBadge: 'Operational Power',
    featTitle: 'Everything you need to scale your logistics',
    featDesc: 'Cutting-edge technology infrastructure to automate every stage of your international shipments.',
    feat1Title: 'AI Smart Routing',
    feat1Desc: 'Our algorithms automatically select the fastest and most cost-effective carrier for every route.',
    feat2Title: 'Predictive Multi-Channel Tracking',
    feat2Desc: 'Automated WhatsApp and email alerts with predictive delivery time windows.',
    feat3Title: '1-Click E-commerce Integration',
    feat3Desc: 'Connect Shopify, WooCommerce, Wix, and REST APIs in minutes for automated order sync.',
    feat4Title: 'Automated Customs Clearance',
    feat4Desc: 'Seamless digital commercial invoice generation, HS codes, and customs documents.',
    feat5Title: 'Multi-Currency Wallet & Invoicing',
    feat5Desc: 'Pay in EUR, USD, DOP, and more with prepaid balances, automated bank deposits, and PayPal.',
    feat6Title: '24/7 SLA & Priority Support',
    feat6Desc: 'Personalized support with dedicated account managers and rapid logistics resolution.',
    pricingBadge: 'Transparent Pricing',
    pricingTitle: 'Plans Designed for Your Growth',
    pricingSubtitle: 'No hidden fees or surprises. Choose the plan that fits your business volume.',
    mostPopular: 'MOST POPULAR',
    perMonth: '/mo',
    choosePlan: 'Get Started',
    workflowBadge: 'Simple Workflow',
    workflowTitle: 'How does Ship24Go work?',
    workflowSubtitle: 'Send your parcels worldwide in just 3 easy steps.',
    step1Title: '1. Quote & Compare',
    step1Desc: 'Enter origin, destination, and parcel dimensions. Our engine instantly compares dozens of services.',
    step2Title: '2. Generate Labels',
    step2Desc: 'Generate standard thermal barcode shipping labels ready to print in a single click.',
    step3Title: '3. Dispatch & Track',
    step3Desc: 'Courier pickup at your doorstep or drop-off at service points. Track live 24/7.',
    destinationsBadge: 'Worldwide Coverage',
    destinationsTitle: 'Popular Global Destinations',
    destinationsSubtitle: 'Daily express and economical shipments to major international commercial hubs.',
    destEurope: 'Central Europe',
    destUSA: 'United States & Canada',
    destLatam: 'Latin America & Caribbean',
    destAsia: 'Asia Pacific',
    destTimeDays: 'business days',
    footerDesc: 'Revolutionizing global logistics with artificial intelligence, full transparency, and multi-carrier connectivity.',
    footerProduct: 'Product',
    footerDestinations: 'Destinations',
    footerCompany: 'Company',
    footerRights: 'All rights reserved.',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',
    footerSecurity: 'Security',
    seoTitle: 'Ship24Go | Global shipping and logistics intelligence',
    seoDescription: 'Quote shipments, compare carriers, create labels, and track every package from one global logistics platform.',
    trackingPlaceholder: 'E.g. SP24-88492048',
    optionsFound: 'Options found',
    networkHeroSuffix: '50+ Couriers',
    networkHubsLabel: 'Express hubs',
    networkHubsDesc: 'Airports and distribution centers',
    networkInsuranceLabel: 'Cargo insurance',
    networkInsuranceDesc: 'Coverage against loss or damage',
    networkCouriersLabel: 'Official integrated couriers',
    planStandardTitle: 'Standard Plan',
    planBasicName: 'Ship24Go Basic',
    planProName: 'Ship24Go Pro',
    planEnterpriseName: 'Ship24Go Enterprise',
    planStandardDesc: 'Perfect for individuals and small online sellers.',
    planStandardFeature1: 'Negotiated carrier rates',
    planStandardFeature2: 'Real-time multi-carrier calculator',
    planStandardFeature3: 'Instant thermal label printing',
    planStandardFeature4: 'Automated tracking notifications',
    planProOffer: '10% off all shipments',
    planProDesc: 'For scaling online businesses with regular dispatches.',
    planProFeature1: '10% discount on every shipment',
    planProFeature2: 'AI predictive tracking alerts',
    planProFeature3: 'Shopify & WooCommerce live sync',
    planProFeature4: '24/7 priority customer support',
    planEnterpriseOffer: '20% off for maximum savings',
    planEnterpriseDesc: 'For large enterprises, marketplaces, and wholesalers.',
    planEnterpriseFeature1: '20% maximum discount on shipments',
    planEnterpriseFeature2: 'Assisted customs clearance & HS codes',
    planEnterpriseFeature3: 'Dedicated account manager & SLA',
    planEnterpriseFeature4: 'Unlimited REST API webhooks',
    postalDefault: 'Postal / Zip Code',
    quoteMissingPostal: 'Please fill in both origin and destination zip codes.',
    quoteNoOptions: 'No courier options found for this specific route.',
    quoteSuccess: 'Real-time quotes with official carrier discounts. Log in to complete dispatch.',
    quoteFailed: 'Could not calculate rates. Please try again.',
    quoteLogin: 'Log in or sign up to finalize your booking with the selected quote.',
    footerDestEurope: 'Spain & European Union',
    footerDestUSA: 'United States',
    footerDestDO: 'Dominican Republic',
    footerDestLatam: 'Latin America',
    footerApiDocs: 'API Documentation'
  },
  it: {
    navQuoter: 'Calcolatore',
    navTracking: 'Tracciamento',
    navServices: 'Servizi',
    navDestinations: 'Destinazioni',
    navPricing: 'Piani & Tariffe',
    btnLogin: 'Accedi',
    btnRegister: 'Registrati',
    btnDashboard: 'Vai al Pannello',
    heroBadge: '✨ Logistica Globale con IA 2026',
    heroTitle1: 'La Piattaforma Globale di Logistica con',
    heroTitle2: 'Intelligenza Artificiale',
    heroDesc: 'Calcola tariffe in tempo reale con oltre 50 corrieri leader, automatizza le spedizioni ecommerce e traccia ogni pacco con precisione.',
    heroCtaQuote: 'Calcola Spedizione Ora',
    heroCtaTrack: 'Traccia Pacco',
    heroStat1Val: '99.8%',
    heroStat1Lbl: 'Consegne Puntuali',
    heroStat2Val: '50+',
    heroStat2Lbl: 'Corrieri Connessi',
    heroStat3Val: '180+',
    heroStat3Lbl: 'Paesi Coperti',
    heroStat4Val: '4.9/5',
    heroStat4Lbl: 'Soddisfazione Clienti',
    widgetTitle: 'Calcolatore Multi-Corriere Intelligente',
    widgetSubtitle: 'Confronta istantaneamente le tariffe ufficiali di DHL, FedEx, UPS e Poste.',
    tabQuote: '📦 Calcola Spedizione',
    tabTrack: '🔍 Traccia Guida',
    origin: 'Origine',
    destination: 'Destinazione',
    country: 'Paese',
    zipcode: 'Codice Postale',
    pkgDetails: 'Colli / Pacchi',
    pkgNumber: 'Collo',
    pkgWeight: 'Peso (kg)',
    pkgLength: 'Lunghezza (cm)',
    pkgWidth: 'Larghezza (cm)',
    pkgHeight: 'Altezza (cm)',
    addPackage: '+ Aggiungi un altro pacco',
    calcBtn: 'Calcola Tariffe in Tempo Reale',
    calcLoading: 'Verifica corrieri globali in corso...',
    secureMsg: 'Ricerca sicura al 100% · Tariffe ufficiali negoziate senza costi nascosti',
    resultsTitle: 'Tariffe Disponibili per la tua Rotta',
    resultsSubtitle: 'Scegli la migliore opzione tra i corrieri disponibili.',
    estimatedDelivery: 'Consegna stimata',
    buyLabel: 'Acquista Etichetta',
    networkTitle: 'Rete Logistica Globale in Tempo Reale',
    networkSubtitle: 'Monitoraggio aereo, marittimo e terrestre in più di 180 paesi.',
    featBadge: 'Potenza Operativa',
    featTitle: 'Tutto ciò che serve per scalare la tua logistica',
    featDesc: 'Infrastruttura tecnologica all\'avanguardia per automatizzare ogni fase delle tue spedizioni.',
    feat1Title: 'IA per Rotte Intelligenti',
    feat1Desc: 'Algoritmi che scelgono automaticamente il corriere più veloce ed economico per ogni rotta.',
    feat2Title: 'Tracciamento Predittivo',
    feat2Desc: 'Notifiche automatiche via WhatsApp ed email con stima predittiva di consegna.',
    feat3Title: 'Integrazione E-commerce',
    feat3Desc: 'Collega Shopify, WooCommerce, Wix e API REST in pochi minuti.',
    feat4Title: 'Sdoganamento Assistito',
    feat4Desc: 'Generazione digitale di fatture commerciali e documentazione doganale.',
    feat5Title: 'Portafoglio Multivaluta',
    feat5Desc: 'Paga in EUR, USD e altre valute con saldo prepagato e PayPal.',
    feat6Title: 'SLA e Supporto 24/7',
    feat6Desc: 'Assistenza dedicata e risoluzione rapida di ogni problema logistico.',
    pricingBadge: 'Tariffe Trasparenti',
    pricingTitle: 'Piani su Misura per la tua Crescita',
    pricingSubtitle: 'Nessuna commissione nascosta. Scegli il piano ideale.',
    mostPopular: 'PIÙ POPOLARE',
    perMonth: '/mese',
    choosePlan: 'Inizia Ora',
    workflowBadge: 'Flusso Semplice',
    workflowTitle: 'Come funziona Ship24Go?',
    workflowSubtitle: 'Invia i tuoi pacchi in tutto il mondo in 3 semplici passaggi.',
    step1Title: '1. Calcola e Confronta',
    step1Desc: 'Inserisci origine, destinazione e misure. Il nostro motore confronta decine di corrieri.',
    step2Title: '2. Emetti l\'Etichetta',
    step2Desc: 'Genera etichette termiche pronte per la stampa in un clic.',
    step3Title: '3. Spedisci e Traccia',
    step3Desc: 'Ritiro a domicilio o consegna al punto di servizio. Traccia 24/7.',
    destinationsBadge: 'Copertura Mondiale',
    destinationsTitle: 'Destinazioni Globali Popolari',
    destinationsSubtitle: 'Spedizioni espresse ed economiche verso i principali hub.',
    destEurope: 'Europa Centrale',
    destUSA: 'Stati Uniti e Canada',
    destLatam: 'America Latina e Caraibi',
    destAsia: 'Asia Pacifico',
    destTimeDays: 'giorni lavorativi',
    footerDesc: 'Rivoluzionando la logistica globale con intelligenza artificiale e trasparenza totale.',
    footerProduct: 'Prodotto',
    footerDestinations: 'Destinazioni',
    footerCompany: 'Azienda',
    footerRights: 'Tutti i diritti riservati.',
    footerPrivacy: 'Privacy',
    footerTerms: 'Termini',
    footerSecurity: 'Sicurezza',
    seoTitle: 'Ship24Go | Logistica globale e spedizioni intelligenti',
    seoDescription: 'Calcola le spedizioni, confronta i corrieri, crea etichette e traccia ogni pacco da un’unica piattaforma globale.',
    trackingPlaceholder: 'Es: SP24-88492048',
    optionsFound: 'Opzioni trovate',
    networkHeroSuffix: '50+ corrieri',
    networkHubsLabel: 'Hub express',
    networkHubsDesc: 'Aeroporti e centri di distribuzione',
    networkInsuranceLabel: 'Assicurazione merci',
    networkInsuranceDesc: 'Copertura contro perdita o danni',
    networkCouriersLabel: 'Corrieri ufficiali integrati',
    planStandardTitle: 'Piano Standard',
    planBasicName: 'Ship24Go Base',
    planProName: 'Ship24Go Pro',
    planEnterpriseName: 'Ship24Go Enterprise',
    planStandardDesc: 'Perfetto per privati e piccoli venditori online.',
    planStandardFeature1: 'Tariffe corriere negoziate',
    planStandardFeature2: 'Calcolatore multi-corriere in tempo reale',
    planStandardFeature3: 'Stampa immediata delle etichette termiche',
    planStandardFeature4: 'Notifiche automatiche di tracciamento',
    planProOffer: '10% di sconto su tutte le spedizioni',
    planProDesc: 'Per attività online in crescita con spedizioni regolari.',
    planProFeature1: '10% di sconto su ogni spedizione',
    planProFeature2: 'Avvisi di tracciamento predittivo con IA',
    planProFeature3: 'Sincronizzazione live Shopify e WooCommerce',
    planProFeature4: 'Supporto prioritario 24/7',
    planEnterpriseOffer: '20% di sconto per il massimo risparmio',
    planEnterpriseDesc: 'Per grandi aziende, marketplace e grossisti.',
    planEnterpriseFeature1: 'Sconto massimo del 20% sulle spedizioni',
    planEnterpriseFeature2: 'Sdoganamento assistito e codici HS',
    planEnterpriseFeature3: 'Account manager dedicato e SLA',
    planEnterpriseFeature4: 'Webhook REST API illimitati',
    postalDefault: 'Codice postale',
    quoteMissingPostal: 'Inserisci i codici postali di origine e destinazione.',
    quoteNoOptions: 'Nessuna opzione disponibile per questa rotta.',
    quoteSuccess: 'Tariffe ufficiali in tempo reale con sconti. Accedi per completare la spedizione.',
    quoteFailed: 'Impossibile calcolare le tariffe. Riprova.',
    quoteLogin: 'Accedi o registrati per completare l’acquisto con il preventivo selezionato.',
    footerDestEurope: 'Spagna e Unione Europea',
    footerDestUSA: 'Stati Uniti',
    footerDestDO: 'Repubblica Dominicana',
    footerDestLatam: 'America Latina',
    footerApiDocs: 'Documentazione API'
  },
  fr: {
    navQuoter: 'Calculateur',
    navTracking: 'Suivi',
    navServices: 'Services',
    navDestinations: 'Destinations',
    navPricing: 'Forfaits & Tarifs',
    btnLogin: 'Connexion',
    btnRegister: 'S\'inscrire',
    btnDashboard: 'Tableau de bord',
    heroBadge: '✨ Logistique Mondiale par IA 2026',
    heroTitle1: 'La Plateforme Logistique Mondiale propulsée par',
    heroTitle2: 'l\'Intelligence Artificielle',
    heroDesc: 'Calculez des tarifs en temps réel avec plus de 50 transporteurs, automatisez vos envois et suivez chaque colis avec précision.',
    heroCtaQuote: 'Calculer un Envoi',
    heroCtaTrack: 'Suivre un Colis',
    heroStat1Val: '99.8%',
    heroStat1Lbl: 'Livraisons à Temps',
    heroStat2Val: '50+',
    heroStat2Lbl: 'Transporteurs Connectés',
    heroStat3Val: '180+',
    heroStat3Lbl: 'Pays Couverts',
    heroStat4Val: '4.9/5',
    heroStat4Lbl: 'Satisfaction Clients',
    widgetTitle: 'Calculateur Multi-Transporteurs Intelligent',
    widgetSubtitle: 'Comparez immédiatement les tarifs de DHL, FedEx, UPS et services postaux.',
    tabQuote: '📦 Devis Envoi',
    tabTrack: '🔍 Suivre Colis',
    origin: 'Origine',
    destination: 'Destination',
    country: 'Pays',
    zipcode: 'Code Postal',
    pkgDetails: 'Colis / Paquets',
    pkgNumber: 'Colis',
    pkgWeight: 'Poids (kg)',
    pkgLength: 'Longueur (cm)',
    pkgWidth: 'Largeur (cm)',
    pkgHeight: 'Hauteur (cm)',
    addPackage: '+ Ajouter un autre colis',
    calcBtn: 'Calculer les Tarifs en Temps Réel',
    calcLoading: 'Recherche des transporteurs...',
    secureMsg: 'Recherche 100% sécurisée · Tarifs officiels négociés sans frais cachés',
    resultsTitle: 'Tarifs Disponibles pour votre Trajet',
    resultsSubtitle: 'Sélectionnez la meilleure option pour votre expédition.',
    estimatedDelivery: 'Livraison estimée',
    buyLabel: 'Acheter l\'Étiquette',
    networkTitle: 'Réseau Logistique Mondial en Temps Réel',
    networkSubtitle: 'Surveillance du trafic aérien, maritime et routier dans 180+ pays.',
    featBadge: 'Puissance Opérationnelle',
    featTitle: 'Tout pour développer votre logistique',
    featDesc: 'Infrastructure technologique pour automatiser chaque étape de vos envois internationaux.',
    feat1Title: 'Routage Intelligent par IA',
    feat1Desc: 'Sélectionne automatiquement le transporteur le plus rapide et le plus avantageux.',
    feat2Title: 'Suivi Prédictif',
    feat2Desc: 'Alertes par WhatsApp et email avec prédiction de livraison.',
    feat3Title: 'Intégration E-commerce',
    feat3Desc: 'Synchronisez Shopify, WooCommerce et Wix en quelques minutes.',
    feat4Title: 'Dédouanement Automatisé',
    feat4Desc: 'Factures commerciales numériques et documents douaniers en toute conformité.',
    feat5Title: 'Portefeuille Multi-devises',
    feat5Desc: 'Réglez en EUR, USD et rechargez par virement ou PayPal.',
    feat6Title: 'Support Prioritaire 24/7',
    feat6Desc: 'Assistance dédiée pour résoudre rapidement tout problème.',
    pricingBadge: 'Tarifs Clairs',
    pricingTitle: 'Des Forfaits Adaptés à votre Croissance',
    pricingSubtitle: 'Aucun frais caché. Choisissez l\'offre idéale.',
    mostPopular: 'LE PLUS POPULAIRE',
    perMonth: '/mois',
    choosePlan: 'Commencer',
    workflowBadge: 'Processus Simple',
    workflowTitle: 'Comment fonctionne Ship24Go ?',
    workflowSubtitle: 'Expédiez vos colis partout dans le monde en 3 étapes.',
    step1Title: '1. Estimez et Comparez',
    step1Desc: 'Indiquez origine, destination et dimensions.',
    step2Title: '2. Imprimez l\'Étiquette',
    step2Desc: 'Générez des étiquettes thermiques en 1 clic.',
    step3Title: '3. Expédiez et Suivez',
    step3Desc: 'Enlèvement sur place ou dépôt en relais.',
    destinationsBadge: 'Couverture Mondiale',
    destinationsTitle: 'Destinations Populaires',
    destinationsSubtitle: 'Expéditions express quotidiennes vers les grands marchés.',
    destEurope: 'Europe Centrale',
    destUSA: 'États-Unis et Canada',
    destLatam: 'Amérique Latine & Caraïbes',
    destAsia: 'Asie Pacifique',
    destTimeDays: 'jours ouvrés',
    footerDesc: 'Révolutionner la logistique mondiale avec l\'intelligence artificielle et une transparence totale.',
    footerProduct: 'Produit',
    footerDestinations: 'Destinations',
    footerCompany: 'Entreprise',
    footerRights: 'Tous droits réservés.',
    footerPrivacy: 'Confidentialité',
    footerTerms: 'Conditions',
    footerSecurity: 'Sécurité',
    seoTitle: 'Ship24Go | Logistique mondiale et expéditions intelligentes',
    seoDescription: 'Calculez vos envois, comparez les transporteurs, créez des étiquettes et suivez chaque colis depuis une plateforme mondiale.',
    trackingPlaceholder: 'Ex : SP24-88492048',
    optionsFound: 'Options trouvées',
    networkHeroSuffix: '50+ transporteurs',
    networkHubsLabel: 'Hubs express',
    networkHubsDesc: 'Aéroports et centres de distribution',
    networkInsuranceLabel: 'Assurance cargo',
    networkInsuranceDesc: 'Couverture contre les pertes ou dommages',
    networkCouriersLabel: 'Transporteurs officiels intégrés',
    planStandardTitle: 'Forfait Standard',
    planBasicName: 'Ship24Go Essentiel',
    planProName: 'Ship24Go Pro',
    planEnterpriseName: 'Ship24Go Enterprise',
    planStandardDesc: 'Idéal pour les particuliers et les petits vendeurs en ligne.',
    planStandardFeature1: 'Tarifs transporteurs négociés',
    planStandardFeature2: 'Calculateur multi-transporteurs en temps réel',
    planStandardFeature3: 'Impression instantanée des étiquettes thermiques',
    planStandardFeature4: 'Notifications automatiques de suivi',
    planProOffer: '10 % de remise sur tous les envois',
    planProDesc: 'Pour les entreprises en croissance avec des expéditions régulières.',
    planProFeature1: '10 % de remise sur chaque envoi',
    planProFeature2: 'Alertes de suivi prédictif par IA',
    planProFeature3: 'Synchronisation Shopify et WooCommerce en direct',
    planProFeature4: 'Support prioritaire 24/7',
    planEnterpriseOffer: '20 % de remise pour un maximum d’économies',
    planEnterpriseDesc: 'Pour les grandes entreprises, marketplaces et grossistes.',
    planEnterpriseFeature1: 'Remise maximale de 20 % sur les envois',
    planEnterpriseFeature2: 'Dédouanement assisté et codes HS',
    planEnterpriseFeature3: 'Account manager dédié et SLA',
    planEnterpriseFeature4: 'Webhooks REST API illimités',
    postalDefault: 'Code postal',
    quoteMissingPostal: 'Saisissez les codes postaux de départ et de destination.',
    quoteNoOptions: 'Aucune option disponible pour ce trajet.',
    quoteSuccess: 'Tarifs officiels en temps réel avec remise. Connectez-vous pour finaliser l’envoi.',
    quoteFailed: 'Impossible de calculer les tarifs. Réessayez.',
    quoteLogin: 'Connectez-vous ou inscrivez-vous pour finaliser l’achat du devis sélectionné.',
    footerDestEurope: 'Espagne et Union européenne',
    footerDestUSA: 'États-Unis',
    footerDestDO: 'République dominicaine',
    footerDestLatam: 'Amérique latine',
    footerApiDocs: 'Documentation API'
  },
  de: {
    navQuoter: 'Versandrechner',
    navTracking: 'Sendungsverfolgung',
    navServices: 'Dienstleistungen',
    navDestinations: 'Globale Ziele',
    navPricing: 'Pläne & Tarife',
    btnLogin: 'Anmelden',
    btnRegister: 'Registrieren',
    btnDashboard: 'Zum Dashboard',
    heroBadge: '✨ KI-Gestützte Globale Logistik 2026',
    heroTitle1: 'Die Globale Logistikplattform mit',
    heroTitle2: 'Künstlicher Intelligenz',
    heroDesc: 'Berechnen Sie Echtzeittarife mit über 50 Spediteuren, automatisieren Sie den Versand und verfolgen Sie jedes Paket punktgenau.',
    heroCtaQuote: 'Jetzt Versand Berechnen',
    heroCtaTrack: 'Paket Verfolgen',
    heroStat1Val: '99.8%',
    heroStat1Lbl: 'Pünktliche Zustellung',
    heroStat2Val: '50+',
    heroStat2Lbl: 'Verbundene Spediteure',
    heroStat3Val: '180+',
    heroStat3Lbl: 'Abgedeckte Länder',
    heroStat4Val: '4.9/5',
    heroStat4Lbl: 'Kundenzufriedenheit',
    widgetTitle: 'Intelligenter Multi-Carrier-Rechner',
    widgetSubtitle: 'Vergleichen Sie sofort offizielle Tarife von DHL, FedEx, UPS und mehr.',
    tabQuote: '📦 Versand Berechnen',
    tabTrack: '🔍 Sendung Verfolgen',
    origin: 'Herkunft',
    destination: 'Zielort',
    country: 'Land',
    zipcode: 'Postleitzahl',
    pkgDetails: 'Pakete / Sendungen',
    pkgNumber: 'Paket',
    pkgWeight: 'Gewicht (kg)',
    pkgLength: 'Länge (cm)',
    pkgWidth: 'Breite (cm)',
    pkgHeight: 'Höhe (cm)',
    addPackage: '+ Weiteres Paket hinzufügen',
    calcBtn: 'Echtzeittarife Berechnen',
    calcLoading: 'Tarife werden abgefragt...',
    secureMsg: '100% Sichere Suche · Offiziell verhandelte Tarife ohne versteckte Kosten',
    resultsTitle: 'Verfügbare Tarife für Ihre Route',
    resultsSubtitle: 'Wählen Sie die beste Versandoption.',
    estimatedDelivery: 'Voraussichtliche Lieferung',
    buyLabel: 'Versandlabel Kaufen',
    networkTitle: 'Echtzeit-Globales Logistiknetzwerk',
    networkSubtitle: 'Überwachung von Luft-, See- und Landfracht in über 180 Ländern.',
    featBadge: 'Operative Stärke',
    featTitle: 'Alles, was Sie für Ihre Logistik benötigen',
    featDesc: 'Moderne Infrastruktur zur Automatisierung jedes Schrittes Ihrer Sendungen.',
    feat1Title: 'KI-Routenoptimierung',
    feat1Desc: 'Wählt automatisch den schnellsten und günstigsten Anbieter.',
    feat2Title: 'Prädiktive Sendungsverfolgung',
    feat2Desc: 'Automatisierte WhatsApp- und E-Mail-Benachrichtigungen.',
    feat3Title: '1-Klick E-Commerce Integration',
    feat3Desc: 'Shopify, WooCommerce und Wix in wenigen Minuten anbinden.',
    feat4Title: 'Digitale Zollabfertigung',
    feat4Desc: 'Handelsrechnungen und Zolldokumente digital erstellen.',
    feat5Title: 'Multi-Währungs-Wallet',
    feat5Desc: 'Bezahlen in EUR, USD und mehr mit automatischem Guthaben.',
    feat6Title: '24/7 Priority Support',
    feat6Desc: 'Engagierter Support für schnelle Lösungen.',
    pricingBadge: 'Faire Tarife',
    pricingTitle: 'Pläne für Ihr Wachstum',
    pricingSubtitle: 'Keine versteckten Gebühren. Wählen Sie das passende Paket.',
    mostPopular: 'BELIEBTESTE WAHL',
    perMonth: '/Monat',
    choosePlan: 'Jetzt Starten',
    workflowBadge: 'Einfacher Ablauf',
    workflowTitle: 'Wie funktioniert Ship24Go?',
    workflowSubtitle: 'In nur 3 Schritten weltweit versenden.',
    step1Title: '1. Berechnen & Vergleichen',
    step1Desc: 'Start, Ziel und Maße eingeben.',
    step2Title: '2. Label Erstellen',
    step2Desc: 'Standard-Versandetiketten mit einem Klick drucken.',
    step3Title: '3. Versenden & Verfolgen',
    step3Desc: 'Abholung an der Haustür oder Abgabe im Paketshop.',
    destinationsBadge: 'Weltweite Abdeckung',
    destinationsTitle: 'Beliebte Globale Ziele',
    destinationsSubtitle: 'Täglicher Express- und Standardversand in weltweite Wirtschaftszentren.',
    destEurope: 'Zentraleuropa',
    destUSA: 'USA & Kanada',
    destLatam: 'Lateinamerika & Karibik',
    destAsia: 'Asien-Pazifik',
    destTimeDays: 'Werktage',
    footerDesc: 'Globale Logistik neu gedacht mit KI, voller Transparenz und Multi-Carrier-Vernetzung.',
    footerProduct: 'Produkt',
    footerDestinations: 'Ziele',
    footerCompany: 'Unternehmen',
    footerRights: 'Alle Rechte vorbehalten.',
    footerPrivacy: 'Datenschutz',
    footerTerms: 'AGB',
    footerSecurity: 'Sicherheit',
    seoTitle: 'Ship24Go | Globale Logistik und intelligenter Versand',
    seoDescription: 'Versandpreise vergleichen, Etiketten erstellen und jedes Paket über eine globale Logistikplattform verfolgen.',
    trackingPlaceholder: 'Z. B. SP24-88492048',
    optionsFound: 'Optionen gefunden',
    networkHeroSuffix: '50+ Spediteure',
    networkHubsLabel: 'Express-Hubs',
    networkHubsDesc: 'Flughäfen und Verteilzentren',
    networkInsuranceLabel: 'Frachtversicherung',
    networkInsuranceDesc: 'Schutz vor Verlust oder Schäden',
    networkCouriersLabel: 'Offiziell integrierte Spediteure',
    planStandardTitle: 'Standardplan',
    planBasicName: 'Ship24Go Basic',
    planProName: 'Ship24Go Pro',
    planEnterpriseName: 'Ship24Go Enterprise',
    planStandardDesc: 'Ideal für Privatpersonen und kleine Online-Händler.',
    planStandardFeature1: 'Verhandelte Spediteurentarife',
    planStandardFeature2: 'Echtzeit-Multi-Carrier-Rechner',
    planStandardFeature3: 'Sofortiger Druck von Thermoetiketten',
    planStandardFeature4: 'Automatische Tracking-Benachrichtigungen',
    planProOffer: '10 % Rabatt auf alle Sendungen',
    planProDesc: 'Für wachsende Online-Unternehmen mit regelmäßigen Sendungen.',
    planProFeature1: '10 % Rabatt auf jede Sendung',
    planProFeature2: 'KI-gestützte prädiktive Tracking-Alarme',
    planProFeature3: 'Live-Synchronisierung mit Shopify und WooCommerce',
    planProFeature4: 'Priorisierter Support rund um die Uhr',
    planEnterpriseOffer: '20 % Rabatt für maximale Ersparnis',
    planEnterpriseDesc: 'Für große Unternehmen, Marktplätze und Großhändler.',
    planEnterpriseFeature1: 'Maximal 20 % Rabatt auf Sendungen',
    planEnterpriseFeature2: 'Unterstützte Zollabfertigung und HS-Codes',
    planEnterpriseFeature3: 'Dedizierter Account Manager und SLA',
    planEnterpriseFeature4: 'Unbegrenzte REST-API-Webhooks',
    postalDefault: 'Postleitzahl',
    quoteMissingPostal: 'Bitte geben Sie die Postleitzahlen für Start und Ziel ein.',
    quoteNoOptions: 'Für diese Route wurden keine Versandoptionen gefunden.',
    quoteSuccess: 'Echtzeit-Tarife mit offiziellen Rabatten. Melden Sie sich an, um den Versand abzuschließen.',
    quoteFailed: 'Tarife konnten nicht berechnet werden. Bitte versuchen Sie es erneut.',
    quoteLogin: 'Melden Sie sich an oder registrieren Sie sich, um den ausgewählten Tarif zu buchen.',
    footerDestEurope: 'Spanien und Europäische Union',
    footerDestUSA: 'Vereinigte Staaten',
    footerDestDO: 'Dominikanische Republik',
    footerDestLatam: 'Lateinamerika',
    footerApiDocs: 'API-Dokumentation'
  },
  zh: {
    navQuoter: '运费计算',
    navTracking: '包裹追踪',
    navServices: '物流服务',
    navDestinations: '全球目的地',
    navPricing: '方案与价格',
    btnLogin: '登录',
    btnRegister: '注册',
    btnDashboard: '进入控制台',
    heroBadge: '✨ 2026新一代AI全球智能物流',
    heroTitle1: '引领未来的全球智能物流平台 ·',
    heroTitle2: '人工智能驱动',
    heroDesc: '实时对比50+全球顶级快递运费，全自动对接电商平台，毫秒级全球包裹精准追踪。',
    heroCtaQuote: '立即估算运费',
    heroCtaTrack: '查询包裹',
    heroStat1Val: '99.8%',
    heroStat1Lbl: '准时交付率',
    heroStat2Val: '50+',
    heroStat2Lbl: '对接顶级快递',
    heroStat3Val: '180+',
    heroStat3Lbl: '覆盖国家及地区',
    heroStat4Val: '4.9/5',
    heroStat4Lbl: '客户满意度',
    widgetTitle: '智能多渠道运费比价器',
    widgetSubtitle: '即刻比对 DHL、FedEx、UPS 及各大邮政专线官方协议价。',
    tabQuote: '📦 运费比价',
    tabTrack: '🔍 查件追踪',
    origin: '始发地',
    destination: '目的地',
    country: '国家',
    zipcode: '邮政编码',
    pkgDetails: '包裹及尺寸',
    pkgNumber: '件包裹',
    pkgWeight: '重量 (kg)',
    pkgLength: '长 (cm)',
    pkgWidth: '宽 (cm)',
    pkgHeight: '高 (cm)',
    addPackage: '+ 添加另一个包裹',
    calcBtn: '实时计算全球运费',
    calcLoading: '正在查询各大航司与快递实时运价...',
    secureMsg: '100% 安全查询 · 官方直连折扣价 · 无隐藏附加费用',
    resultsTitle: '当前路线可用运费方案',
    resultsSubtitle: '选择最适合您时效和成本要求的优质渠道。',
    estimatedDelivery: '预计到达时间',
    buyLabel: '购买物流运单',
    networkTitle: '全球实时物流网络',
    networkSubtitle: '覆盖180+国家和地区的空运、海运和陆运实时轨迹。',
    featBadge: '核心优势',
    featTitle: '助力跨境电商全链路出海',
    featDesc: '专为现代跨国企业构建的尖端物流基础设施。',
    feat1Title: 'AI 智能最优路径',
    feat1Desc: '智能算法根据时效和成本毫秒级推荐最优快递线路。',
    feat2Title: '全链路预测性追踪',
    feat2Desc: '微信、短信及邮件多端主动推送物流节点与异常预警。',
    feat3Title: '1分钟无缝对接电商',
    feat3Desc: '自动同步 Shopify、WooCommerce、Wix 等主流平台订单。',
    feat4Title: '智能数字化报关',
    feat4Desc: '全自动生成商业发票、HS编码及清关申报文件。',
    feat5Title: '多币种电子钱包',
    feat5Desc: '支持美元、欧元等多币种结算，支持企业预充值。',
    feat6Title: '7x24小时专属服务',
    feat6Desc: '专业大客户经理全天候在线，极速响应并解决理赔与查验。',
    pricingBadge: '透明价格',
    pricingTitle: '为您的业务量身打造的价格方案',
    pricingSubtitle: '零隐形扣费，按需随选。',
    mostPopular: '最受欢迎',
    perMonth: '/月',
    choosePlan: '立即开通',
    workflowBadge: '极简流程',
    workflowTitle: 'Ship24Go 如何运作？',
    workflowSubtitle: '仅需3步，轻松寄达全球各地。',
    step1Title: '1. 比价与选择',
    step1Desc: '输入始发地、目的地及包装尺寸，多渠道即刻比对。',
    step2Title: '2. 一键出单',
    step2Desc: '快速生成符合国际标准的热敏面单并打印。',
    step3Title: '3. 上门揽收与追踪',
    step3Desc: '快递员上门取件或送至网点，24小时全球实时监控。',
    destinationsBadge: '全球覆盖',
    destinationsTitle: '热门国际路线',
    destinationsSubtitle: '每日直飞全球主要商业经济枢纽。',
    destEurope: '中欧主要国家',
    destUSA: '美国及加拿大',
    destLatam: '拉美及加勒比海',
    destAsia: '亚太地区',
    destTimeDays: '个工作日',
    footerDesc: '以人工智能与全球多渠道直连，重塑跨境电商国际物流新体验。',
    footerProduct: '产品与功能',
    footerDestinations: '热门航线',
    footerCompany: '关于我们',
    footerRights: '版权所有。',
    footerPrivacy: '隐私政策',
    footerTerms: '服务条款',
    footerSecurity: '安全中心',
    seoTitle: 'Ship24Go | 全球智能物流与国际运输',
    seoDescription: '在线比价、比较物流商、创建面单并从一个全球物流平台追踪每个包裹。',
    trackingPlaceholder: '例如：SP24-88492048',
    optionsFound: '找到可用方案',
    networkHeroSuffix: '50+ 家物流商',
    networkHubsLabel: '快速枢纽',
    networkHubsDesc: '机场与配送中心',
    networkInsuranceLabel: '货物保险',
    networkInsuranceDesc: '覆盖丢失或损坏风险',
    networkCouriersLabel: '官方集成物流商',
    planStandardTitle: '标准方案',
    planBasicName: 'Ship24Go 基础版',
    planProName: 'Ship24Go Pro',
    planEnterpriseName: 'Ship24Go 企业版',
    planStandardDesc: '适合个人用户和小型线上卖家。',
    planStandardFeature1: '已协商的承运商价格',
    planStandardFeature2: '实时多承运商运费计算',
    planStandardFeature3: '即时打印热敏面单',
    planStandardFeature4: '自动包裹追踪通知',
    planProOffer: '所有运单享受 10% 折扣',
    planProDesc: '适合拥有稳定发货量、正在成长的线上企业。',
    planProFeature1: '每票运单直享 10% 折扣',
    planProFeature2: 'AI 预测性追踪提醒',
    planProFeature3: 'Shopify 与 WooCommerce 实时同步',
    planProFeature4: '全天候优先客户支持',
    planEnterpriseOffer: '最高 20% 折扣，节省更多',
    planEnterpriseDesc: '适合大型企业、平台和批发商。',
    planEnterpriseFeature1: '运单最高享 20% 折扣',
    planEnterpriseFeature2: '协助清关与 HS 编码',
    planEnterpriseFeature3: '专属客户经理与 SLA',
    planEnterpriseFeature4: '不限量 REST API Webhooks',
    postalDefault: '邮政编码',
    quoteMissingPostal: '请填写始发地和目的地的邮政编码。',
    quoteNoOptions: '未找到适合此路线的物流方案。',
    quoteSuccess: '实时官方折扣报价。登录后即可完成发货。',
    quoteFailed: '暂时无法计算运费，请稍后重试。',
    quoteLogin: '登录或注册后即可使用所选报价完成下单。',
    footerDestEurope: '西班牙及欧盟',
    footerDestUSA: '美国',
    footerDestDO: '多米尼加共和国',
    footerDestLatam: '拉丁美洲',
    footerApiDocs: 'API 文档'
  }
};

export const Landing = () => {
  const { language } = useI18n();
  const navigate = useNavigate();
  const { brand } = useBrand();
  const { format, currency } = useCurrency();
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Normalización del idioma actual para seleccionar textos
  const langKey = useMemo(() => {
    const raw = String(language || 'es').toLowerCase();
    const short = raw.split('-')[0];
    if (LANDING_TEXTS[short]) return short;
    return 'es';
  }, [language]);

  const lt = LANDING_TEXTS[langKey] || LANDING_TEXTS.es;

  useEffect(() => {
    document.title = lt.seoTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', lt.seoDescription);
  }, [langKey]);

  // Tema global sincronizado
  const { isDark: isDarkMode, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthToken()));
  }, []);

  // Formulario de Cotización
  const [form, setForm] = useState({
    originCountry: 'ES',
    originZip: '',
    destCountry: 'DE',
    destZip: ''
  });

  // Detección geográfica inicial por IP de origen
  useEffect(() => {
    let cancelled = false;
    const applyCountry = (cc: string) => {
      const code = String(cc || '').toUpperCase().slice(0, 2);
      if (!code || cancelled) return;
      setForm(prev => (prev.originZip ? prev : { ...prev, originCountry: code }));
    };
    const cached = sessionStorage.getItem('ship24go_geo_country') || localStorage.getItem('ship24go_country');
    if (cached) applyCountry(cached);
    fetch('/api/public/locale', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.country) applyCountry(data.country); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Placeholder inteligente de código postal según país
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
       default: return lt.postalDefault;
    }
  };

  const [packages, setPackages] = useState([
    { width: 20, height: 15, length: 30, weight: 2.5, qty: 1 }
  ]);

  const [activeTab, setActiveTab] = useState<'quote' | 'track'>('quote');
  const [trackingCode, setTrackingCode] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [quoteError, setQuoteError] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');

  const addPackage = () => {
    setPackages(prev => [...prev, { width: 10, height: 10, length: 10, weight: 1, qty: 1 }]);
  };

  const removePackage = (index: number) => {
    if (packages.length <= 1) return;
    setPackages(prev => prev.filter((_, i) => i !== index));
  };

  const updatePackage = (index: number, field: string, val: number) => {
    setPackages(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const originZip = String(form.originZip || '').trim();
    const destZip = String(form.destZip || '').trim();
    if (!originZip || !destZip) {
      setQuoteError(lt.quoteMissingPostal);
      setQuotes([]);
      return;
    }
    setLoadingQuote(true);
    setQuoteError('');
    setQuoteMessage('');
    setQuotes([]);
    try {
      const res = await api.quoteShipment({
        originCountry: String(form.originCountry || 'ES').toUpperCase().slice(0, 2),
        destCountry: String(form.destCountry || 'DE').toUpperCase().slice(0, 2),
        originZip,
        destZip,
        packages: packages.map(pkg => ({
          width: Math.max(1, Number(pkg.width) || 10),
          height: Math.max(1, Number(pkg.height) || 10),
          length: Math.max(1, Number(pkg.length) || 10),
          weight: Math.max(0.1, Number(pkg.weight) || 1),
          qty: Math.max(1, Number(pkg.qty) || 1),
        })),
        currency: currency || 'EUR',
      });
      const next = Array.isArray(res?.quotes) ? res.quotes : [];
      setQuotes(next);
      if (!next.length) {
        setQuoteError(res?.message || res?.error || lt.quoteNoOptions);
      } else {
        setQuoteMessage(lt.quoteSuccess);
      }
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } catch (err: any) {
      setQuotes([]);
      setQuoteError(err?.message || lt.quoteFailed);
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = trackingCode.trim();
    if (!code) return;
    navigate(`/tracking?q=${encodeURIComponent(code)}`);
  };

  const goShipWithQuote = (quote: any) => {
    if (!quote?.id) return;
    const session = saveGuestQuoteSession({
      form: {
        originCountry: form.originCountry,
        originZip: form.originZip,
        destCountry: form.destCountry,
        destZip: form.destZip,
        packages,
        currency: quote.currency || currency || 'EUR',
      },
      quote,
    });
    navigate('/auth/login', {
      state: {
        from: '/panel/quote',
        prefill: {
          ...form,
          packages,
          selectedQuoteId: quote.id,
        },
        guestQuote: quote,
        guestToken: session.token,
        message: lt.quoteLogin,
      },
    });
  };

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-300">
      
      {/* NAVBAR SUPERIOR ELEGANTE */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm shadow-slate-200/30 dark:shadow-black/20 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-4 h-20 md:h-22">
            
            {/* LOGO OFICIAL SHIP24GO - PROPORCIONADO Y SIN TEXTO SECUNDARIO */}
            <Link to="/" className="flex items-center gap-3.5 cursor-pointer group shrink-0">
              <div className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={brand.logoUrl || '/brand/logo.png'} 
                  alt={brand.siteName || 'Ship24Go'} 
                  className="w-full h-full object-contain" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
                />
              </div>
              <span className="hidden sm:inline text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-outfit leading-none">
                SHIP<span className="text-cyan-500 dark:text-cyan-400">24</span>GO
              </span>
            </Link>

            {/* Desktop Nav Links - Con separación visual garantizada, sin solapar el logo ni las acciones */}
            <div className="hidden xl:flex flex-1 min-w-0 items-center justify-center mx-4 2xl:mx-8 gap-2.5 xl:gap-3.5 2xl:gap-5 font-semibold text-[13px] 2xl:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
              <a href="#quote-section" className="px-2.5 py-1 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap">{lt.navQuoter}</a>
              <Link to="/tracking" className="px-2.5 py-1 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap">{lt.navTracking}</Link>
              <a href="#features-section" className="px-2.5 py-1 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap">{lt.navServices}</a>
              <a href="#destinations-section" className="px-2.5 py-1 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap">{lt.navDestinations}</a>
              <a href="#pricing-section" className="px-2.5 py-1 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap">{lt.navPricing}</a>
            </div>

            {/* Desktop Nav Actions */}
            <div className="hidden xl:flex items-center gap-2 shrink-0">
              <CurrencySelector />
              <LanguageSelector />

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
                aria-label="Cambiar tema"
                title="Cambiar tema"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              {isLoggedIn ? (
                <Link 
                  to="/panel"
                  className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <span>{lt.btnDashboard}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <Link 
                    to="/auth/login"
                    className="h-10 px-3.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition-colors flex items-center whitespace-nowrap"
                  >
                    {lt.btnLogin}
                  </Link>
                  <Link 
                    to="/auth/register"
                    className="h-10 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:shadow-xl transition-all flex items-center whitespace-nowrap"
                  >
                    {lt.btnRegister}
                  </Link>
                </div>
              )}
            </div>

            {/* Botón Móvil */}
            <div className="flex items-center gap-2 xl:hidden">
              <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
              <Link 
                to="/auth/login"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs whitespace-nowrap"
              >
                {lt.btnLogin}
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                aria-label="Menú"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white/95 dark:bg-[#020617]/95 border-b border-slate-200 dark:border-slate-800 px-5 py-4 space-y-3 animate-fade-in shadow-2xl">
            
            {/* Header del menú móvil con logo oficial */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                <img 
                  src={brand.logoUrl || '/brand/logo.png'} 
                  alt={brand.siteName || 'Ship24Go'} 
                  className="w-full h-full object-contain" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-outfit leading-none">
                SHIP<span className="text-cyan-500 dark:text-cyan-400">24</span>GO
              </span>
            </div>

            {/* Selectores de moneda e idioma en móvil */}
            <div className="flex items-center gap-2 py-2">
              <CurrencySelector />
              <LanguageSelector />
            </div>

            <div className="flex flex-col space-y-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <a 
                href="#quote-section" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>📦 {lt.navQuoter}</span>
              </a>
              <Link 
                to="/tracking" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>🔍 {lt.navTracking}</span>
              </Link>
              <a 
                href="#features-section" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>⚡ {lt.navServices}</span>
              </a>
              <a 
                href="#pricing-section" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>💳 {lt.navPricing}</span>
              </a>
            </div>

            <div className="pt-2">
              <Link 
                to="/auth/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-center block shadow-lg shadow-indigo-600/30"
              >
                {lt.btnRegister}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION 2026 */}
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-28 overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/15 to-purple-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12 items-center min-w-0">
            
            {/* Columna Izquierda: Mensaje y CTA */}
            <div className="lg:col-span-6 min-w-0 text-center lg:text-left space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/40 backdrop-blur-md text-indigo-700 dark:text-cyan-300 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>{lt.heroBadge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                {lt.heroTitle1}{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400">
                  {lt.heroTitle2}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {lt.heroDesc}
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a 
                  href="#quote-section"
                  className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  <span>{lt.heroCtaQuote}</span>
                </a>
                <Link 
                  to="/tracking"
                  className="w-full sm:w-auto h-13 px-7 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base border border-slate-300 dark:border-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{lt.heroCtaTrack}</span>
                </Link>
              </div>

              {/* Estadísticas de Confianza */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 text-center lg:text-left">
                <div>
                  <span className="block text-2xl font-black text-slate-900 dark:text-white">{lt.heroStat1Val}</span>
                  <span className="text-xs text-slate-500">{lt.heroStat1Lbl}</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-slate-900 dark:text-white">{lt.heroStat2Val}</span>
                  <span className="text-xs text-slate-500">{lt.heroStat2Lbl}</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-slate-900 dark:text-white">{lt.heroStat3Val}</span>
                  <span className="text-xs text-slate-500">{lt.heroStat3Lbl}</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-slate-900 dark:text-white">{lt.heroStat4Val}</span>
                  <span className="text-xs text-slate-500">{lt.heroStat4Lbl}</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Widget Interactivo de Cotización y Tracking */}
            <div id="quote-section" className="lg:col-span-6 min-w-0">
              <div className="bg-white dark:bg-[#0c1222] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/10 border border-slate-200/80 dark:border-slate-800 relative">
                
                {/* Pestañas Cotizar vs Rastrear */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('quote')}
                    className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'quote' 
                        ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-md shadow-slate-300 dark:shadow-indigo-600/30' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{lt.tabQuote}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('track')}
                    className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'track' 
                        ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-md shadow-slate-300 dark:shadow-indigo-600/30' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{lt.tabTrack}</span>
                  </button>
                </div>

                {activeTab === 'quote' ? (
                  /* Formulario de Cotización */
                  <form onSubmit={handleCalculate} className="space-y-4">
                    
                    {/* Origen y Destino */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* ORIGEN */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {lt.origin}
                        </label>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold mb-1">{lt.country}</span>
                          <CountrySelect 
                            value={form.originCountry} 
                            onChange={(val) => setForm({ ...form, originCountry: val })} 
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold mb-1">{lt.zipcode}</span>
                          <ZipCodeAutocomplete
                            countryCode={form.originCountry}
                            value={form.originZip}
                            placeholder={getZipPlaceholder(form.originCountry)}
                            onChange={(val) => setForm({ ...form, originZip: val })}
                          />
                        </div>
                      </div>

                      {/* DESTINO */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-500" /> {lt.destination}
                        </label>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold mb-1">{lt.country}</span>
                          <CountrySelect 
                            value={form.destCountry} 
                            onChange={(val) => setForm({ ...form, destCountry: val })} 
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-semibold mb-1">{lt.zipcode}</span>
                          <ZipCodeAutocomplete
                            countryCode={form.destCountry}
                            value={form.destZip}
                            placeholder={getZipPlaceholder(form.destCountry)}
                            onChange={(val) => setForm({ ...form, destZip: val })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Detalles del Bulto */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-indigo-500" /> {lt.pkgDetails} ({packages.length})
                        </label>
                      </div>

                      {packages.map((pkg, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{lt.pkgNumber} #{idx + 1}</span>
                            {packages.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removePackage(idx)}
                                className="text-red-500 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">{lt.pkgWeight}</span>
                              <input 
                                type="number" 
                                min="0.1" 
                                step="0.1" 
                                value={pkg.weight} 
                                onChange={e => updatePackage(idx, 'weight', Number(e.target.value))}
                                className="w-full h-9 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold dark:text-white"
                              />
                            </div>
                            <div>
                              <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">{lt.pkgLength}</span>
                              <input 
                                type="number" 
                                min="1" 
                                value={pkg.length} 
                                onChange={e => updatePackage(idx, 'length', Number(e.target.value))}
                                className="w-full h-9 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold dark:text-white"
                              />
                            </div>
                            <div>
                              <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">{lt.pkgWidth}</span>
                              <input 
                                type="number" 
                                min="1" 
                                value={pkg.width} 
                                onChange={e => updatePackage(idx, 'width', Number(e.target.value))}
                                className="w-full h-9 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold dark:text-white"
                              />
                            </div>
                            <div>
                              <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">{lt.pkgHeight}</span>
                              <input 
                                type="number" 
                                min="1" 
                                value={pkg.height} 
                                onChange={e => updatePackage(idx, 'height', Number(e.target.value))}
                                className="w-full h-9 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addPackage}
                        className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lt.addPackage}</span>
                      </button>
                    </div>

                    {/* Botón de Cotización */}
                    <button
                      type="submit"
                      disabled={loadingQuote}
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:opacity-95 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loadingQuote ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{lt.calcLoading}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 text-yellow-300" />
                          <span>{lt.calcBtn}</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-slate-400">
                      {lt.secureMsg}
                    </p>

                    {quoteError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{quoteError}</span>
                      </div>
                    )}
                  </form>
                ) : (
                  /* Formulario de Rastrear Envío */
                  <form onSubmit={handleTrackSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {lt.tabTrack}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                          placeholder={lt.trackingPlaceholder}
                          className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white outline-none focus:border-indigo-500"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>{lt.heroCtaTrack}</span>
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* RESULTADOS DE COTIZACIÓN EN VIVO */}
      {quotes.length > 0 && (
        <section ref={resultsRef} className="py-12 bg-indigo-50/50 dark:bg-indigo-950/20 border-y border-indigo-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-cyan-400">
                {quotes.length} {lt.optionsFound}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {lt.resultsTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                {lt.resultsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotes.map((q, idx) => {
                const carrier = resolveCarrierName(q.providerName || q.carrier);
                const price = Number(q.customerPrice || q.total || q.price || 0);
                const days = q.estimatedDays || q.transitDays || '2-4';

                return (
                  <div 
                    key={q.id || idx}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-cyan-400 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <CarrierLogo name={carrier} logoUrl={q.providerLogo || q.carrierLogo} size="md" />
                          <div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">{carrier}</h3>
                            <span className="text-xs text-slate-400">{q.serviceName || 'Express Parcel'}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          {lt.estimatedDelivery}: {days} {lt.destTimeDays}
                        </span>
                      </div>

                      <div className="my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                        <span className="text-xs text-slate-500 font-semibold">{lt.widgetTitle}:</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-cyan-400">
                          {format(price, q.currency || currency || 'EUR')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => goShipWithQuote(q)}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>{lt.buyLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* GLOBO 3D INTERACTIVO CON RED LOGÍSTICA MUNDIAL */}
      <section className="py-16 md:py-24 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white border-y border-slate-200 dark:border-slate-900 relative overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Globe className="w-3.5 h-3.5" />
              <span>{lt.networkTitle}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              {lt.heroTitle1}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                 {lt.networkHeroSuffix}
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mt-4 max-w-xl mx-auto">
              {lt.networkSubtitle}
            </p>
          </div>

          <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] overflow-hidden p-6 md:p-12 shadow-xl shadow-slate-300/40 dark:shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 transition-colors">
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Truck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">{lt.networkHubsLabel}</span>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">450+</p>
                   <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">{lt.networkHubsDesc}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-400 mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">{lt.networkInsuranceLabel}</span>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">100%</p>
                   <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">{lt.networkInsuranceDesc}</p>
                </div>
              </div>

              {/* Badges de Transportistas Conectados */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{lt.networkCouriersLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {['DHL Express', 'FedEx', 'UPS Global', 'Correos España', 'SEUR', 'GLS', 'TNT', 'MRW'].map(c => (
                    <span key={c} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas 3D Globe Visualizer */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <GlobeCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE SERVICIOS Y CARACTERÍSTICAS */}
      <section id="features-section" className="py-20 bg-slate-100/50 dark:bg-[#030712] border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-cyan-400">
              {lt.featBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              {lt.featTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
              {lt.featDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title={lt.feat1Title}
              description={lt.feat1Desc}
            />
            <FeatureCard 
              icon={<LineChart className="w-6 h-6 text-cyan-500" />}
              title={lt.feat2Title}
              description={lt.feat2Desc}
            />
            <FeatureCard 
              icon={<Layers className="w-6 h-6 text-indigo-500" />}
              title={lt.feat3Title}
              description={lt.feat3Desc}
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-emerald-500" />}
              title={lt.feat4Title}
              description={lt.feat4Desc}
            />
            <FeatureCard 
              icon={<Truck className="w-6 h-6 text-blue-500" />}
              title={lt.feat5Title}
              description={lt.feat5Desc}
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6 text-purple-500" />}
              title={lt.feat6Title}
              description={lt.feat6Desc}
            />
          </div>
        </div>
      </section>

      {/* PLANES Y PRECIOS REALES (BD MYSQL) */}
      <section id="pricing-section" className="py-20 bg-white dark:bg-[#070d1d] border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-cyan-400">
              {lt.pricingBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              {lt.pricingTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
              {lt.pricingSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* PLAN BÁSICO (REAL BD: €0.00) */}
            <div className="rounded-3xl p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-400 transition-all">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase mb-4">
                  {lt.planStandardTitle}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{lt.planBasicName}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  {lt.planStandardDesc}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{format(0, 'EUR')}</span>
                  <span className="text-sm text-slate-500">{lt.perMonth}</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-8">
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {lt.planStandardFeature1}</li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {lt.planStandardFeature2}</li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {lt.planStandardFeature3}</li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {lt.planStandardFeature4}</li>
                </ul>
              </div>

              <Link 
                to="/auth/register"
                className="w-full py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-center block transition-all"
              >
                {lt.choosePlan}
              </Link>
            </div>

            {/* PLAN PRO (REAL BD: €29.99 - 10% DESCUENTO) */}
            <div className="rounded-3xl p-8 bg-gradient-to-b from-indigo-900/10 via-white to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-indigo-600 dark:border-cyan-400 shadow-2xl relative flex flex-col justify-between md:scale-105 md:z-10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
                {lt.mostPopular}
              </div>

              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 text-xs font-bold uppercase mb-4">
                   {lt.planProOffer}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{lt.planProName}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                   {lt.planProDesc}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-indigo-600 dark:text-cyan-400">{format(29.99, 'EUR')}</span>
                  <span className="text-sm text-slate-500">{lt.perMonth}</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-8">
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> <strong className="text-indigo-600 dark:text-cyan-400">{lt.planProFeature1}</strong></li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {lt.planProFeature2}</li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {lt.planProFeature3}</li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {lt.planProFeature4}</li>
                </ul>
              </div>

              <Link 
                to="/auth/register"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-extrabold text-center block shadow-lg shadow-indigo-600/30 transition-all"
              >
                {lt.choosePlan}
              </Link>
            </div>

            {/* PLAN ENTERPRISE (REAL BD: €50.00 - 20% DESCUENTO) */}
            <div className="rounded-3xl p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-400 transition-all">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase mb-4">
                   {lt.planEnterpriseOffer}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{lt.planEnterpriseName}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                   {lt.planEnterpriseDesc}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{format(50.0, 'EUR')}</span>
                  <span className="text-sm text-slate-500">{lt.perMonth}</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-8">
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> <strong className="text-cyan-500">{lt.planEnterpriseFeature1}</strong></li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {lt.planEnterpriseFeature2}</li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {lt.planEnterpriseFeature3}</li>
                   <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {lt.planEnterpriseFeature4}</li>
                </ul>
              </div>

              <Link 
                to="/auth/register"
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-center block transition-all"
              >
                {lt.choosePlan}
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FLUJO DE TRABAJO SENCILLO */}
      <section className="py-20 bg-slate-50 dark:bg-[#030712] border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-cyan-400">
              {lt.workflowBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              {lt.workflowTitle}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3">
              {lt.workflowSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-black text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{lt.step1Title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {lt.step1Desc}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{lt.step2Title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {lt.step2Desc}
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{lt.step3Title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {lt.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINOS GLOBALES POPULARES */}
      <section id="destinations-section" className="py-20 bg-white dark:bg-[#070d1d] border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-cyan-400">
              {lt.destinationsBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              {lt.destinationsTitle}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3">
              {lt.destinationsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DestinationCard 
              region={lt.destEurope}
              time={`24-48h ${lt.destTimeDays}`}
              countries={['España', 'Alemania', 'Francia', 'Italia']}
            />
            <DestinationCard 
              region={lt.destUSA}
              time={`48-72h ${lt.destTimeDays}`}
              countries={['Miami', 'New York', 'Los Angeles', 'Toronto']}
            />
            <DestinationCard 
              region={lt.destLatam}
              time={`3-5 ${lt.destTimeDays}`}
              countries={['Rep. Dominicana', 'Colombia', 'México', 'Panamá']}
            />
            <DestinationCard 
              region={lt.destAsia}
              time={`4-6 ${lt.destTimeDays}`}
              countries={['China', 'Japón', 'Corea del Sur', 'Singapur']}
            />
          </div>
        </div>
      </section>

      {/* FOOTER CON EL LOGO VERDADERO */}
      <Footer brandName={brand.siteName || 'Ship24Go'} lt={lt} brand={brand} />
    </div>
  );
};

// Componentes Auxiliares
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-cyan-400 transition-all shadow-sm hover:shadow-xl space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function DestinationCard({ region, time, countries }: { region: string; time: string; countries: string[] }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
      <span className="text-xs font-extrabold text-indigo-600 dark:text-cyan-400">{time}</span>
      <h4 className="font-bold text-base text-slate-900 dark:text-white">{region}</h4>
      <div className="flex flex-wrap gap-1.5 pt-2">
        {countries.map(c => (
          <span key={c} className="text-[11px] px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Footer({ brandName, lt, brand }: { brandName: string; lt: Record<string, string>; brand: any }) {
  return (
    <footer className="bg-slate-950 pt-16 pb-10 border-t border-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Logo oficial y descripción */}
          <div className="col-span-2 pr-4 sm:pr-8">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                <img 
                  src={brand.logoUrl || '/brand/logo.png'} 
                  alt={brandName} 
                  className="w-full h-full object-contain" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-outfit leading-none">
                SHIP<span className="text-cyan-400">24</span>GO
              </span>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm">
              {lt.footerDesc}
            </p>
            <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3">{lt.footerProduct}</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#quote-section" className="hover:text-white transition-colors">{lt.navQuoter}</a></li>
              <li><Link to="/tracking" className="hover:text-white transition-colors">{lt.navTracking}</Link></li>
              <li><a href="#features-section" className="hover:text-white transition-colors">{lt.navServices}</a></li>
              <li><a href="#pricing-section" className="hover:text-white transition-colors">{lt.navPricing}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3">{lt.footerDestinations}</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><span className="text-slate-400">{lt.footerDestEurope}</span></li>
              <li><span className="text-slate-400">{lt.footerDestUSA}</span></li>
              <li><span className="text-slate-400">{lt.footerDestDO}</span></li>
              <li><span className="text-slate-400">{lt.footerDestLatam}</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3">{lt.footerCompany}</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/auth/login" className="hover:text-white transition-colors">{lt.btnLogin}</Link></li>
              <li><Link to="/auth/register" className="hover:text-white transition-colors">{lt.btnRegister}</Link></li>
              <li><span className="text-slate-400">{lt.footerSecurity}</span></li>
              <li><span className="text-slate-400">{lt.footerApiDocs}</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 {brandName}. {lt.footerRights}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">{lt.footerPrivacy}</a>
            <a href="#" className="hover:text-slate-400">{lt.footerTerms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// 3D Canvas Globe Component
function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = 130;

      // Glow behind
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.3);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      grad.addColorStop(0.6, 'rgba(6, 182, 212, 0.1)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Globe sphere edge
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(102, 252, 241, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Meridians (Rotating)
      rotation += 0.008;
      for (let i = 0; i < 6; i++) {
        const angle = rotation + (i * Math.PI) / 6;
        const rx = Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(rx), radius, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 + 0.15 * Math.cos(angle)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Parallels (Latitudes)
      for (let j = -2; j <= 2; j++) {
        const y = cy + (j * radius) / 3;
        const rParallel = Math.sqrt(Math.max(0, radius * radius - ((j * radius) / 3) ** 2));
        ctx.beginPath();
        ctx.ellipse(cx, y, rParallel, rParallel * 0.25, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Flight route arc from Madrid (EU) to Santo Domingo / New York
      const t = (Date.now() * 0.001) % 2;
      const p1x = cx - 40;
      const p1y = cy - 20;
      const p2x = cx + 50;
      const p2y = cy + 30;

      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.quadraticCurveTo(cx, cy - 70, p2x, p2y);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Flight package pulse
      const progress = t / 2;
      const qx = (1 - progress) ** 2 * p1x + 2 * (1 - progress) * progress * cx + progress ** 2 * p2x;
      const qy = (1 - progress) ** 2 * p1y + 2 * (1 - progress) * progress * (cy - 70) + progress ** 2 * p2y;

      ctx.beginPath();
      ctx.arc(qx, qy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={360} 
      height={360} 
      className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] max-w-full"
    />
  );
}
