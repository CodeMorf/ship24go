export interface SeoImage {
  src: string;
  alt: string;
  caption: string;
  tag: string;
}

export interface SeoFeature {
  icon: string;
  title: string;
  desc: string;
}

export interface SeoStep {
  step: string;
  title: string;
  desc: string;
}

export interface SeoFaq {
  q: string;
  a: string;
}

export interface SeoPageData {
  slug: string;
  category: string;
  badge: string;
  title: string;
  subtitle: string;
  heroHighlight: string;
  metaDescription: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  images: [SeoImage, SeoImage, SeoImage, SeoImage];
  stats: { value: string; label: string }[];
  features: SeoFeature[];
  stepsTitle: string;
  steps: SeoStep[];
  faqs: SeoFaq[];
  relatedLinks: { title: string; url: string; badge?: string }[];
}

export const SEO_PAGES: Record<string, SeoPageData> = {
  // ─────────────────────────────────────────────────────────────
  // 1. ESPAÑA Y UNIÓN EUROPEA
  // ─────────────────────────────────────────────────────────────
  'espana-union-europea': {
    slug: 'destinos/espana-union-europea',
    category: 'Destinos Internacionales',
    badge: '🇪🇺 CORREDOR LOGÍSTICO EUROPA · ESPAÑA',
    title: 'Envíos a España y Toda la Unión Europea con Gestión Aduanera IOSS',
    subtitle: 'Conexión aérea exprés desde el Caribe y EE.UU. hacia Madrid, Barcelona, Milán, París y más de 27 países comunitarios.',
    heroHighlight: '48 a 72 Horas en Puerta',
    metaDescription: 'Envíos internacionales a España y Europa con Ship24Go. Despacho aduanero comunitario, cotización multi-transportista y rastreo satelital con GPS.',
    primaryCtaText: 'Cotizar Envío a Europa',
    primaryCtaLink: '/#quote-section',
    secondaryCtaText: 'Localizar Puntos de Envío',
    secondaryCtaLink: '/points',
    images: [
      {
        src: '/images/seo/dest-europe.jpg',
        alt: 'Reparto courier en Madrid y ciudades de España',
        caption: 'Flotas de reparto de última milla operando en Madrid y principales capitales europeas.',
        tag: 'Última Milla UE'
      },
      {
        src: '/images/system/step2-hub-transit.jpg',
        alt: 'Consolidación de carga aérea en hub internacional',
        caption: 'Conexión diaria de vuelos cargueros transatlánticos con despacho aduanero.',
        tag: 'Carga Aérea'
      },
      {
        src: '/images/system/step3-hub-sorting.jpg',
        alt: 'Clasificación de paquetería aduanera',
        caption: 'Desconsolidación y verificación de paquetes con código arancelario comunitario.',
        tag: 'Aduanas & DUA'
      },
      {
        src: '/images/system/step5-global-tracking.jpg',
        alt: 'Trazabilidad satelital en tiempo real',
        caption: 'Monitoreo GPS continuo desde la recogida hasta la entrega en domicilio en Europa.',
        tag: 'Rastreo GPS'
      }
    ],
    stats: [
      { value: '27+', label: 'Países de la UE' },
      { value: '48-72h', label: 'Tiempos de Tránsito' },
      { value: '100%', label: 'Despacho Aduanero' },
      { value: '-35%', label: 'Ahorro vs Courier Tradicional' }
    ],
    features: [
      {
        icon: '🇪🇺',
        title: 'Gestión Aduanera IOSS e IVA Comunitario',
        desc: 'Tramitación digital anticipada de impuestos y aranceles de aduana para evitar retenciones o pagos sorpresivos al destinatario.'
      },
      {
        icon: '✈️',
        title: 'Vuelos Diarios de Enlace Directo',
        desc: 'Salidas de carga aérea los 7 días de la semana con los principales brokers logísticos hacia aeropuertos de Madrid (MAD) y Frankfurt (FRA).'
      },
      {
        icon: '📦',
        title: 'Documentos y Carga Comercial B2B/B2C',
        desc: 'Soluciones optimizadas para remesas familiares, correspondencia oficial, muestras comerciales y pedidos de comercio electrónico.'
      },
      {
        icon: '📍',
        title: 'Rastreo Satelital con Coordenadas GPS',
        desc: 'Visibilidad completa en tiempo real de cada escala: salida de sucursal, vuelo internacional, aduana y entrega en puerta.'
      }
    ],
    stepsTitle: 'Flujo de Despacho hacia Europa',
    steps: [
      { step: '01', title: 'Recepción en Point Afiliado', desc: 'Entrega tu paquete en cualquier sucursal Ship24Go o solicita recogida a domicilio.' },
      { step: '02', title: 'Consolidación & DUA Digital', desc: 'Tu paquete se integra en valija segura y se genera la documentación aduanera comunitaria.' },
      { step: '03', title: 'Vuelo Transatlántico Express', desc: 'Traslado aéreo directo hacia el Hub Gateway en Europa con seguimiento de telemetría.' },
      { step: '04', title: 'Entrega Final con Firma', desc: 'Distribución capilar a domicilio en España y la UE con confirmación digital de recibo.' }
    ],
    faqs: [
      { q: '¿Qué documentos necesito para enviar a España o la Unión Europea?', a: 'Solo requieres la factura proforma comercial o declaración de contenido descriptiva, los datos completos del destinatario (nombre, DNI/NIE o teléfono) y el comprobante generado por nuestra plataforma.' },
      { q: '¿Cómo se pagan los impuestos aduaneros en Europa?', a: 'Nuestro cotizador permite calcular y prepagar los derechos aduaneros e IVA mediante el sistema IOSS, garantizando que el paquete no se detenga en aduana.' },
      { q: '¿Hacen entregas en islas como Baleares o Canarias?', a: 'Sí, disponemos de cobertura total en Península, Baleares, Canarias, Ceuta y Melilla con conexión marítima y aérea programada.' }
    ],
    relatedLinks: [
      { title: 'Envíos a Estados Unidos', url: '/destinos/estados-unidos', badge: 'Popular' },
      { title: 'Envíos a República Dominicana', url: '/destinos/republica-dominicana' },
      { title: 'Planes y Tarifas de Envíos', url: '/tarifas' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 2. ESTADOS UNIDOS
  // ─────────────────────────────────────────────────────────────
  'estados-unidos': {
    slug: 'destinos/estados-unidos',
    category: 'Destinos Internacionales',
    badge: '🇺🇸 PUENTE LOGÍSTICO ESTADOS UNIDOS',
    title: 'Envíos Express a Estados Unidos: Miami, Boston, New York & Todo el País',
    subtitle: 'Nuestros hubs propios HUB-BOS y HUB-MIA Gateway garantizan la máxima velocidad y los fletes más económicos del mercado.',
    heroHighlight: 'Conexión Directa en 24 a 48 Horas',
    metaDescription: 'Envíos rápidos y económicos a Estados Unidos con Ship24Go. Hubs en Miami y Boston, conexión con USPS, FedEx y UPS, y tarifas con hasta 40% de descuento.',
    primaryCtaText: 'Cotizar Envío a EE.UU.',
    primaryCtaLink: '/#quote-section',
    secondaryCtaText: 'Conocer Nuestros Hubs',
    secondaryCtaLink: '/hubs',
    images: [
      {
        src: '/images/seo/dest-usa.jpg',
        alt: 'Terminal de carga aérea en Miami International Airport',
        caption: 'HUB-MIA Gateway: Operaciones de transferencia aérea intercontinental en Florida.',
        tag: 'Hub Miami'
      },
      {
        src: '/images/system/step1-point-pos.jpg',
        alt: 'Sucursal de recepción de paquetería',
        caption: 'Sucursales autorizadas en Boston y costa este recibiendo paquetería comercial.',
        tag: 'Puntos de Recepción'
      },
      {
        src: '/images/system/step2-hub-transit.jpg',
        alt: 'Clasificación de carga masiva en almacén',
        caption: 'Cintas de clasificación y consolidación de valijas de alta densidad.',
        tag: 'Consolidación'
      },
      {
        src: '/images/system/step4-driver-delivery.jpg',
        alt: 'Reparto a domicilio en Estados Unidos',
        caption: 'Entrega capilar en los 50 estados con prueba de entrega electrónica POD.',
        tag: 'Entrega Puerta a Puerta'
      }
    ],
    stats: [
      { value: '50', label: 'Estados con Cobertura' },
      { value: '24-48h', label: 'Tiempos Express' },
      { value: '2 Hubs', label: 'Propios (BOS & MIA)' },
      { value: '-40%', label: 'Tarifa Corporativa' }
    ],
    features: [
      {
        icon: '🏢',
        title: 'Hubs Propios en Miami y Boston',
        desc: 'Infraestructura física en Doral, FL y Cambridge St, Boston con escáneres láser y procesamiento ininterrumpido.'
      },
      {
        icon: '📦',
        title: 'Integración Multicarrier (USPS, FedEx, UPS)',
        desc: 'Algoritmo inteligente de enrutamiento que selecciona la opción más rápida y económica para cada código postal estadounidense.'
      },
      {
        icon: '⚡',
        title: 'Despacho Aduanero Rápido en Entrada',
        desc: 'Cumplimiento normativo CBP y pre-alerta electrónica para liberación aduanal inmediata sin demoras.'
      },
      {
        icon: '📱',
        title: 'Notificaciones SMS y Correo al Destinatario',
        desc: 'Actualizaciones automáticas con enlace de seguimiento en vivo y comprobante de entrega en tiempo real.'
      }
    ],
    stepsTitle: 'Cómo Funciona el Envío a Estados Unidos',
    steps: [
      { step: '01', title: 'Etiquetado en Origen', desc: 'Emite la etiqueta oficial con código de barras en el Point o desde la web.' },
      { step: '02', title: 'Carga en HUB-MIA o HUB-BOS', desc: 'El paquete ingresa a nuestro centro de clasificación internacional con coordenadas GPS.' },
      { step: '03', title: 'Conexión de Tránsito Aéreo', desc: 'Vuelo directo hacia el centro de distribución del estado de destino.' },
      { step: '04', title: 'Entrega Residencial o Comercial', desc: 'Reparto a domicilio o casillero postal con confirmación fotográfica y firma digital.' }
    ],
    faqs: [
      { q: '¿Qué peso y dimensiones máximas puedo enviar a Estados Unidos?', a: 'Aceptamos desde sobres de documentos de 0.5 kg hasta bultos de carga pesada de 70 kg por paquete, con soporte para pallets industriales en nuestro servicio de carga.' },
      { q: '¿Puedo enviar paquetes a apartados postales (PO Box)?', a: 'Sí, mediante nuestra integración con el servicio postal USPS cubrimos todos los PO Box y bases militares APO/FPO de Estados Unidos.' },
      { q: '¿Cuánto tiempo tarda un paquete en llegar a Miami o New York?', a: 'Con el servicio Express llega en 24 a 48 horas hábiles, y con el servicio Estándar Consolidado entre 3 y 5 días laborables.' }
    ],
    relatedLinks: [
      { title: 'Envíos a República Dominicana', url: '/destinos/republica-dominicana', badge: 'Alta Demanda' },
      { title: 'Envíos a América Latina', url: '/destinos/america-latina' },
      { title: 'Documentación de la API', url: '/api-docs' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 3. REPÚBLICA DOMINICANA
  // ─────────────────────────────────────────────────────────────
  'republica-dominicana': {
    slug: 'destinos/republica-dominicana',
    category: 'Destinos Internacionales',
    badge: '🇩🇴 LÍDER EN PAQUETERÍA REPÚBLICA DOMINICANA',
    title: 'Envíos Puerta a Puerta a Toda la República Dominicana con Entrega en 24h',
    subtitle: 'Santo Domingo, Santiago, San Cristóbal, La Vega, Puerto Plata, Higüey y todas las provincias nacionales.',
    heroHighlight: 'Flota Propia de Choferes con Firma & Foto POD',
    metaDescription: 'Envíos de paquetes y documentos a República Dominicana con Ship24Go. HUB-SDQ Central, entrega a domicilio con choferes equipados con GPS y prueba de entrega digital.',
    primaryCtaText: 'Cotizar Envío a Dominicana',
    primaryCtaLink: '/#quote-section',
    secondaryCtaText: 'Ver Red de Choferes',
    secondaryCtaLink: '/driver',
    images: [
      {
        src: '/images/seo/dest-dominican.jpg',
        alt: 'Reparto de paquetes en Santo Domingo República Dominicana',
        caption: 'Choferes de última milla recorriendo las avenidas y sectores de Santo Domingo.',
        tag: 'Reparto Nacional'
      },
      {
        src: '/images/system/step3-hub-sorting.jpg',
        alt: 'Centro logístico Santo Domingo HUB-SDQ',
        caption: 'HUB-SDQ: Almacén central de clasificación y racks de distribución en Santo Domingo.',
        tag: 'HUB-SDQ Central'
      },
      {
        src: '/images/system/step4-driver-delivery.jpg',
        alt: 'Entrega con firma digital al destinatario',
        caption: 'Clientes dominicanos recibiendo paquetes en la puerta de su hogar con firma en pantalla.',
        tag: 'Prueba de Entrega POD'
      },
      {
        src: '/images/system/step1-point-pos.jpg',
        alt: 'Comercio afiliado Point dominicano',
        caption: 'Red de colmados, papelerías y comercios afiliados como puntos de retiro y entrega.',
        tag: 'Puntos en Barrios'
      }
    ],
    stats: [
      { value: '32', label: 'Provincias Cubiertas' },
      { value: '24-48h', label: 'Entrega a Domicilio' },
      { value: 'HUB-SDQ', label: 'Centro de Clasificación' },
      { value: '100% POD', label: 'Firma y Cédula en Puerta' }
    ],
    features: [
      {
        icon: '🛵',
        title: 'Flota de Choferes y Motorizados Propios',
        desc: 'Conductores locales equipados con nuestra App Driver PWA para entregas puntuales en casas, apartamentos y negocios.'
      },
      {
        icon: '🏢',
        title: 'HUB-SDQ Central en Santo Domingo',
        desc: 'Almacén moderno en Av. Luperón equipado con sistemas de clasificación rápida y despacho a provincias.'
      },
      {
        icon: '✍️',
        title: 'Prueba de Entrega con Cédula y Foto',
        desc: 'El destinatario firma en pantalla con verificación de documento de identidad y foto del paquete entregado.'
      },
      {
        icon: '💵',
        title: 'Cobro Contra Entrega (COD) y Moneda Dual',
        desc: 'Flexibilidad de pago en Pesos Dominicanos (DOP) o Dólares (USD), en efectivo o tarjeta de crédito/débito.'
      }
    ],
    stepsTitle: 'Trayecto de tu Envío a Dominicana',
    steps: [
      { step: '01', title: 'Depósito en Sucursal', desc: 'Entrega tu paquete en cualquier sucursal de EE.UU., Europa o Point afiliado.' },
      { step: '02', title: 'Arribo a HUB-SDQ', desc: 'Recepción por vuelo chárter/comercial en Santo Domingo y desconsolidación asistida.' },
      { step: '03', title: 'Ruta de Chofer Asignada', desc: 'Tu paquete se carga en el vehículo de ruta optimizada con geolocalización satelital.' },
      { step: '04', title: 'Entrega en Mano en Puerta', desc: 'El chofer timbra en tu dirección, solicita la firma y recibes tu envío al instante.' }
    ],
    faqs: [
      { q: '¿Llegan a parajes y pueblos fuera de las ciudades principales?', a: 'Sí, a través de nuestra red de enlaces interprovinciales llegamos a todos los municipios, pueblos y parajes de las 32 provincias dominicanas.' },
      { q: '¿Qué requisitos aduanales aplican para envíos menores a 200 dólares?', a: 'Los envíos personales y compras bajo la categoría B (menores de US$200) ingresan exentos de aranceles de importación según la normativa aduanera de DGA.' },
      { q: '¿Cómo puedo verificar la firma de quien recibió mi paquete en Santo Domingo?', a: 'En nuestra sección de rastreo público (/tracking) puedes ver la firma digitalizada, nombre de quien recibió, número de cédula y la hora exacta de entrega.' }
    ],
    relatedLinks: [
      { title: 'Envíos a Estados Unidos', url: '/destinos/estados-unidos' },
      { title: 'Red de Puntos Afiliados', url: '/red-points', badge: 'Comisiones' },
      { title: 'Seguridad y Seguro de Envíos', url: '/seguridad' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 4. AMÉRICA LATINA
  // ─────────────────────────────────────────────────────────────
  'america-latina': {
    slug: 'destinos/america-latina',
    category: 'Destinos Internacionales',
    badge: '🌎 RED REGIONAL AMÉRICA LATINA & CARIBE',
    title: 'Soluciones Logísticas Transfronterizas para América Latina',
    subtitle: 'México, Colombia, Panamá, Costa Rica, Guatemala, Perú, Chile y los principales mercados latinoamericanos.',
    heroHighlight: 'Conectividad Multi-Transportista Regional',
    metaDescription: 'Envíos internacionales a toda América Latina con Ship24Go. Red de transporte aéreo, despacho aduanero local y seguimiento satelital de mercancías.',
    primaryCtaText: 'Cotizar Envío a Latinoamérica',
    primaryCtaLink: '/#quote-section',
    secondaryCtaText: 'Ver Todos los Servicios',
    secondaryCtaLink: '/servicios',
    images: [
      {
        src: '/images/seo/dest-latam.jpg',
        alt: 'Hub logístico continental de América Latina',
        caption: 'Conexión de rutas aéreas y marítimas conectando Norte, Centro y Sudamérica.',
        tag: 'Red Continental'
      },
      {
        src: '/images/system/step2-hub-transit.jpg',
        alt: 'Carga de fletes aéreos internacionales',
        caption: 'Salidas periódicas hacia aeropuertos principales de Bogotá, CDMX, Panamá y Lima.',
        tag: 'Fletes Aéreos'
      },
      {
        src: '/images/system/step5-global-tracking.jpg',
        alt: 'Monitoreo de telemetría de envíos',
        caption: 'Control de tráfico aéreo y trazabilidad satelital en tiempo real sobre la región.',
        tag: 'Telemetría GPS'
      },
      {
        src: '/images/seo/dest-dominican.jpg',
        alt: 'Entrega urbana en ciudades de América Latina',
        caption: 'Entrega eficiente en centros urbanos y áreas metropolitanas de la región.',
        tag: 'Cobertura Urbana'
      }
    ],
    stats: [
      { value: '18+', label: 'Países de la Región' },
      { value: '3-5 días', label: 'Tiempos Promedio' },
      { value: '100%', label: 'Conexión API' },
      { value: 'Cero', label: 'Costos Ocultos' }
    ],
    features: [
      {
        icon: '🌎',
        title: 'Red Consolidada Panamericana',
        desc: 'Alianzas con los principales operadores aéreos y de transporte terrestre en cada país de la región.'
      },
      {
        icon: '📑',
        title: 'Asesoría Arancelaria y Declaración Aduanal',
        desc: 'Validación de normativas específicas de importación para evitar demoras tributarias en destino.'
      },
      {
        icon: '💻',
        title: 'Plataforma para E-commerce Transfronterizo',
        desc: 'Ideal para tiendas que venden a clientes en múltiples países latinoamericanos desde un solo inventario.'
      },
      {
        icon: '🛡️',
        title: 'Seguro de Carga y Cobertura Integral',
        desc: 'Pólizas de seguro que protegen tu mercancía contra pérdida, daño o robo durante todo el trayecto.'
      }
    ],
    stepsTitle: 'Proceso de Envío a Países de América Latina',
    steps: [
      { step: '01', title: 'Cotización Multicarrier', desc: 'Compara tarifas entre los principales couriers de la región con descuento garantizado.' },
      { step: '02', title: 'Consolidación en Hub', desc: 'Tu paquete se procesa en nuestro centro logístico y se asigna al vuelo regional idóneo.' },
      { step: '03', title: 'Liberación Aduanal en Destino', desc: 'Gestión ágil con las autoridades de aduanas del país de llegada.' },
      { step: '04', title: 'Reparto a Domicilio', desc: 'Entrega en la dirección final del destinatario con confirmación digital inmediata.' }
    ],
    faqs: [
      { q: '¿A qué países de América Latina puedo enviar con Ship24Go?', a: 'Cubrimos México, Colombia, Panamá, Costa Rica, Guatemala, Honduras, El Salvador, Nicaragua, Perú, Ecuador, Chile, Argentina, Brasil, Uruguay, Paraguay y Bolivia.' },
      { q: '¿Puedo enviar paquetes comerciales y muestras de negocio?', a: 'Sí, manejamos paquetería B2B comercial con factura formal, así como envíos personales de ayuda familiar.' }
    ],
    relatedLinks: [
      { title: 'Envíos a Estados Unidos', url: '/destinos/estados-unidos' },
      { title: 'Envíos a España y Europa', url: '/destinos/espana-union-europea' },
      { title: 'Cotizador en Línea', url: '/cotizador' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 5. SERVICIOS LOGÍSTICOS
  // ─────────────────────────────────────────────────────────────
  'servicios': {
    slug: 'servicios',
    category: 'Soluciones Logísticas',
    badge: '⚡ PORTAFOLIO COMPLETO DE SERVICIOS',
    title: 'Servicios Logísticos Integrales de Transporte Internacional y Última Milla',
    subtitle: 'Desde mensajería express de documentos hasta fletes aéreos comerciales, valijas de consolidación y logística inversa.',
    heroHighlight: 'Tecnología Inteligente Multi-Transportista',
    metaDescription: 'Conoce todos los servicios logísticos de Ship24Go: Paquetería express aérea, carga consolidada, sucursales Point POS, despacho aduanero y última milla.',
    primaryCtaText: 'Comenzar a Enviar',
    primaryCtaLink: '/auth/register',
    secondaryCtaText: 'Ver Cómo Funciona',
    secondaryCtaLink: '/sistema',
    images: [
      {
        src: '/images/system/step1-point-pos.jpg',
        alt: 'Recepción y pesaje en terminal POS',
        caption: 'Recepción de paquetería express con impresión de etiquetas térmicas y recibo.',
        tag: 'Paquetería Express'
      },
      {
        src: '/images/system/step2-hub-transit.jpg',
        alt: 'Carga aérea internacional de valijas',
        caption: 'Consolidación de carga en valijas y pallets para optimización de tarifas.',
        tag: 'Carga Consolidada'
      },
      {
        src: '/images/system/step4-driver-delivery.jpg',
        alt: 'Entrega de última milla con firma',
        caption: 'Red capilar de choferes para entregas a domicilio con verificación en pantalla.',
        tag: 'Última Milla'
      },
      {
        src: '/images/system/step5-global-tracking.jpg',
        alt: 'Centro de control logístico global',
        caption: 'Plataforma en la nube para control de flotas, inventario de hubs y rastreo.',
        tag: 'Software Cloud'
      }
    ],
    stats: [
      { value: '5+', label: 'Modalidades de Envío' },
      { value: '15%', label: 'Comisión en Sucursales' },
      { value: '3 Niveles', label: 'Trazabilidad Satelital' },
      { value: '24/7', label: 'Plataforma en la Nube' }
    ],
    features: [
      {
        icon: '✈️',
        title: 'Mensajería Express Internacional',
        desc: 'Servicio prioritario para sobres, documentos legales, pasaportes y paquetes urgentes con entrega de 24 a 72 horas.'
      },
      {
        icon: '📦',
        title: 'Carga Aérea Consolidada en Valijas',
        desc: 'Agrupación inteligente de paquetes pequeños en valijas maestras para reducir las tarifas por libra o kilo hasta en un 40%.'
      },
      {
        icon: '🏪',
        title: 'Red de Puntos Afiliados (Point POS)',
        desc: 'Convierte cualquier tienda física en una agencia de envíos oficial con hardware de impresión y gestión de turnos.'
      },
      {
        icon: '📱',
        title: 'Distribución de Última Milla con POD',
        desc: 'Conductores locales equipados con nuestra aplicación móvil para entrega con firma biométrica y geolocalización satelital.'
      }
    ],
    stepsTitle: 'Ecosistema de Servicios Interconectados',
    steps: [
      { step: '01', title: 'Cotización y Reserva', desc: 'Compara precios entre operadores y genera la guía oficial con un clic.' },
      { step: '02', title: 'Depósito o Recogida', desc: 'Entrega tu paquete en un Point o solicita retiro directo en tu empresa.' },
      { step: '03', title: 'Consolidación & Hub Transit', desc: 'Procesamiento en centros logísticos con verificación de peso y escaneo.' },
      { step: '04', title: 'Entrega Certificada', desc: 'Llegada al destinatario con notificación inmediata y comprobante digital.' }
    ],
    faqs: [
      { q: '¿Ship24Go ofrece servicios tanto para particulares como empresas?', a: 'Sí, atendemos a personas que envían remesas familiares y regalos, así como a empresas de e-commerce e importadores que mueven volumen comercial constante.' },
      { q: '¿Puedo integrar Ship24Go con mi tienda online de Shopify o WooCommerce?', a: 'Totalmente. Disponemos de API REST completa y webhooks para cotización automática en el carrito de compras y generación masiva de guías.' }
    ],
    relatedLinks: [
      { title: 'Cotizador en Tiempo Real', url: '/cotizador', badge: 'En Vivo' },
      { title: 'Planes y Tarifas', url: '/tarifas' },
      { title: 'Red de Puntos Afiliados', url: '/red-points' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 6. COTIZADOR INTERNACIONAL
  // ─────────────────────────────────────────────────────────────
  'cotizador': {
    slug: 'cotizador',
    category: 'Herramientas Digitales',
    badge: '📊 MOTOR DE COTIZACIÓN MULTICARRIER',
    title: 'Cotizador de Envíos Internacionales con Tarifas con Descuento en Vivo',
    subtitle: 'Compara tarifas de los principales transportistas globales y brokers aéreos en tiempo real con un solo clic.',
    heroHighlight: 'Hasta 40% de Descuento Garantizado',
    metaDescription: 'Cotiza tus envíos nacionales e internacionales con Ship24Go. Compara precios en vivo, selecciona el mejor tiempo de entrega y genera tu etiqueta al instante.',
    primaryCtaText: 'Abrir Cotizador en Vivo',
    primaryCtaLink: '/#quote-section',
    secondaryCtaText: 'Ver Planes y Tarifas',
    secondaryCtaLink: '/tarifas',
    images: [
      {
        src: '/images/system/step1-point-pos.jpg',
        alt: 'Terminal POS cotizando envío',
        caption: 'Cálculo de peso real y volumétrico con tarifas automáticas multimoneda.',
        tag: 'Cálculo Automático'
      },
      {
        src: '/images/seo/api-developer.jpg',
        alt: 'Motor de cotización con API en tiempo real',
        caption: 'Algoritmo que consulta múltiples transportistas simultáneamente en milisegundos.',
        tag: 'Motor Algorítmico'
      },
      {
        src: '/images/system/step2-hub-transit.jpg',
        alt: 'Fletes aéreos negociados con brokers',
        caption: 'Tarifas corporativas de mayoreo trasladadas directamente al usuario final.',
        tag: 'Tarifa Mayoreo'
      },
      {
        src: '/images/system/step5-global-tracking.jpg',
        alt: 'Pantalla de cotización con mapas interactivos',
        caption: 'Rutas proyectadas y tiempos estimados de entrega calculados por inteligencia artificial.',
        tag: 'Tiempos Precisos'
      }
    ],
    stats: [
      { value: '5+ Couriers', label: 'Comparados en Segundos' },
      { value: '0 Costos', label: 'Ocultos o Letra Chica' },
      { value: '-40%', label: 'Ahorro Promedio' },
      { value: 'Instantáneo', label: 'Generación de Etiqueta' }
    ],
    features: [
      {
        icon: '⚡',
        title: 'Comparación Multicarrier en Tiempo Real',
        desc: 'Compara tarifas de DHL, FedEx, UPS, LogiHub y EasyPost en una sola pantalla sin necesidad de cotizar por separado.'
      },
      {
        icon: '⚖️',
        title: 'Cálculo Inteligente de Peso Volumétrico',
        desc: 'Nuestra calculadora calcula el peso real y volumétrico (largo x ancho x alto / factor) para asegurar la tarifa más justa.'
      },
      {
        icon: '💵',
        title: 'Moneda Dual Automática (USD y DOP)',
        desc: 'Cotiza y cobra en la moneda de tu preferencia con tasa de cambio oficial actualizada en tiempo real.'
      },
      {
        icon: '🏷️',
        title: 'Etiquetas y Códigos de Barra Listos para Imprimir',
        desc: 'Descarga tu etiqueta en PDF lista para imprimir en hojas estándar o rollos térmicos de 4x6 pulgadas o 80mm.'
      }
    ],
    stepsTitle: 'Cómo Cotizar en 3 Pasos Simples',
    steps: [
      { step: '01', title: 'Ingresa Origen y Destino', desc: 'Indica los códigos postales o ciudades de recogida y entrega.' },
      { step: '02', title: 'Añade Peso y Medidas', desc: 'Especifica las dimensiones y peso del paquete o sobre.' },
      { step: '03', title: 'Elige tu Opción Favorita', desc: 'Selecciona la tarifa más económica o la más rápida y genera tu guía al instante.' }
    ],
    faqs: [
      { q: '¿El precio cotizado incluye todos los cargos?', a: 'Sí, todas nuestras cotizaciones muestran el importe final con combustible y cargos de transporte incluidos, sin sorpresas al momento del pago.' },
      { q: '¿Necesito registrarme para cotizar?', a: 'No, puedes utilizar nuestro cotizador de forma libre en cualquier momento. El registro solo es requerido cuando decides pagar y generar tu etiqueta.' }
    ],
    relatedLinks: [
      { title: 'Planes y Tarifas', url: '/tarifas' },
      { title: 'Rastreo de Paquetes', url: '/tracking' },
      { title: 'Red de Puntos Afiliados', url: '/red-points' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 7. PLANES Y TARIFAS
  // ─────────────────────────────────────────────────────────────
  'tarifas': {
    slug: 'tarifas',
    category: 'Precios & Suscripciones',
    badge: '💎 TARIFAS TRANSPARENTES SIN SORPRESAS',
    title: 'Planes Flexibles para Particulares, Tiendas Online y Cuentas Corporativas',
    subtitle: 'Desde envíos ocasionales sin mensualidad hasta planes empresariales con descuentos masivos y soporte prioritario.',
    heroHighlight: 'Sin Cargos Ocultos ni Contratos Forzosos',
    metaDescription: 'Conoce los planes y tarifas de Ship24Go: Plan Básico gratuito, Plan Pro con descuentos y Plan Enterprise para grandes volúmenes con API dedicada.',
    primaryCtaText: 'Crear Cuenta Gratis',
    primaryCtaLink: '/auth/register',
    secondaryCtaText: 'Ver Servicios',
    secondaryCtaLink: '/servicios',
    images: [
      {
        src: '/images/seo/api-developer.jpg',
        alt: 'Gestión empresarial de envíos masivos',
        caption: 'Paneles de control y analítica de costos para empresas con alto volumen de despachos.',
        tag: 'Cuentas Empresa'
      },
      {
        src: '/images/system/step1-point-pos.jpg',
        alt: 'Comisiones para sucursales Point',
        caption: 'Modelo comercial transparente con 15% de comisión asegurada por cada paquete.',
        tag: 'Puntos de Venta'
      },
      {
        src: '/images/system/step2-hub-transit.jpg',
        alt: 'Fletes consolidados a precio de mayoreo',
        caption: 'Acceso a tarifas de consolidación aérea que bajan el coste por libra o kilogramo.',
        tag: 'Economía de Escala'
      },
      {
        src: '/images/system/step5-global-tracking.jpg',
        alt: 'Métricas de rendimiento logístico',
        caption: 'Reportes en tiempo real de gastos, despachos y estado financiero de tu cuenta.',
        tag: 'Control Financiero'
      }
    ],
    stats: [
      { value: '€0 / mes', label: 'Plan Básico de Inicio' },
      { value: 'Hasta 20%', label: 'Descuento en Plan Pro' },
      { value: '15%', label: 'Comisión para Puntos' },
      { value: 'Monedero', label: 'Recargas con Bonificación' }
    ],
    features: [
      {
        icon: '🌱',
        title: 'Plan Básico: Paga solo lo que envías',
        desc: 'Sin mensualidades, sin cuotas de mantenimiento y sin permanencia. Ideal para personas y pequeños comercios.'
      },
      {
        icon: '🚀',
        title: 'Plan Pro: Descuentos por volumen',
        desc: 'Para tiendas online y marcas que envían más de 30 paquetes al mes. Tarifas reducidas y soporte técnico dedicado.'
      },
      {
        icon: '👑',
        title: 'Plan Enterprise: API & Facturación Consolidada',
        desc: 'Solución a medida para operadores logísticos e importadores con crédito comercial, ejecutivos asignados y SLA garantizado.'
      },
      {
        icon: '💳',
        title: 'Múltiples Métodos de Pago y Monedero Digital',
        desc: 'Paga con tarjeta de crédito/débito, PayPal, transferencia bancaria o saldo prepagado en monedero con bonificaciones.'
      }
    ],
    stepsTitle: 'Comienza en Minutos',
    steps: [
      { step: '01', title: 'Regístrate Gratis', desc: 'Crea tu cuenta en menos de 1 minuto sin tarjeta de crédito obligatoria.' },
      { step: '02', title: 'Elige tu Modalidad', desc: 'Comienza en el Plan Básico o activa tu suscripción Pro para mayores ahorros.' },
      { step: '03', title: 'Disfruta de Tarifas de Mayoreo', desc: 'Empieza a generar etiquetas de envío con tarifas preferenciales de inmediato.' }
    ],
    faqs: [
      { q: '¿Hay algún costo por crear una cuenta en Ship24Go?', a: 'No, el registro y acceso a la plataforma es 100% gratuito. Solo pagas por las etiquetas que generas en el Plan Básico.' },
      { q: '¿Cómo funciona la comisión para los comercios afiliados como Point?', a: 'Los Puntos ganan el 15% sobre las operaciones de mostrador cobradas en su local, acumulando saldo que pueden retirar a su cuenta bancaria en cualquier momento.' }
    ],
    relatedLinks: [
      { title: 'Cotizador en Vivo', url: '/cotizador' },
      { title: 'Red de Puntos Afiliados', url: '/red-points' },
      { title: 'Documentación API', url: '/api-docs' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 8. RED DE POINTS AFILIADOS
  // ─────────────────────────────────────────────────────────────
  'red-points': {
    slug: 'red-points',
    category: 'Red Comercial',
    badge: '🏪 RED OFICIAL DE COMERCIOS ASOCIADOS',
    title: 'Convierte tu Comercio en un Punto Ship24Go y Gana 15% de Comisión',
    subtitle: 'Monetiza tu local comercial, atrae nuevos clientes todos los días y opera como agencia de envíos oficial con nuestra terminal POS.',
    heroHighlight: '15% de Comisión por Cada Paquete Gestionado',
    metaDescription: 'Únete a la Red de Puntos Afiliados Ship24Go. Gana comisiones del 15%, recibe clientes en tu tienda y gestiona turnos con terminal POS táctil.',
    primaryCtaText: 'Afiliar mi Negocio Ahora',
    primaryCtaLink: '/point/register',
    secondaryCtaText: 'Ver Mapa de Puntos',
    secondaryCtaLink: '/points',
    images: [
      {
        src: '/images/system/step1-point-pos.jpg',
        alt: 'Mostrador de punto afiliado con cajera sonriente',
        caption: 'Mostrador de atención de sucursal afiliada con terminal POS e impresora térmica.',
        tag: 'Terminal POS'
      },
      {
        src: '/images/seo/dest-dominican.jpg',
        alt: 'Comercio de barrio recibiendo paquetes',
        caption: 'Tiendas de conveniencia y minimarkets operando como centro de recepción barrial.',
        tag: 'Comercio Local'
      },
      {
        src: '/images/system/step3-hub-sorting.jpg',
        alt: 'Consolidación de valijas en el punto',
        caption: 'Agrupación de envíos en valijas precintadas para recogida programada por el chofer.',
        tag: 'Valijas de Envío'
      },
      {
        src: '/images/system/step4-driver-delivery.jpg',
        alt: 'Chofer recogiendo valija en el punto',
        caption: 'Nuestros choferes retiran las valijas del punto para su traslado al Hub Central.',
        tag: 'Recogida Diaria'
      }
    ],
    stats: [
      { value: '15%', label: 'Comisión Garantizada' },
      { value: '2 min', label: 'Tiempo de Registro' },
      { value: '€0 / $0', label: 'Costo de Afiliación' },
      { value: 'Google Maps', label: 'Geolocalización Oficial' }
    ],
    features: [
      {
        icon: '💵',
        title: 'Ingresos Extra Sin Inversión Previa',
        desc: 'Gana un 15% limpio de comisión por cada envío cobrado o paquete custodiado en tu local comercial.'
      },
      {
        icon: '👥',
        title: 'Aumento de Tráfico y Nuevos Clientes',
        desc: 'Los vecinos de tu zona visitarán tu tienda para enviar o recoger paquetes, comprando también tus productos habituales.'
      },
      {
        icon: '💻',
        title: 'Terminal Web POS con Control de Turnos',
        desc: 'Funciona en cualquier laptop, tablet o PC. Permite abrir turnos de caja con PIN de empleado y arqueo diario.'
      },
      {
        icon: '🏷️',
        title: 'Compatible con Impresoras Térmicas Estándar',
        desc: 'Imprime tickets oficiales de 80mm o 50mm con código de barras y personalización de marca con el nombre de tu local.'
      }
    ],
    stepsTitle: 'Cómo Afiliar tu Local en 3 Pasos',
    steps: [
      { step: '01', title: 'Completa el Formulario', desc: 'Indica el nombre de tu comercio, dirección física y horario de atención al público.' },
      { step: '02', title: 'Verificación Instantánea', desc: 'Nuestro equipo valida tu ubicación y apareces de inmediato en el Localizador de Google Maps.' },
      { step: '03', title: 'Comienza a Cobrar Comisiones', desc: 'Abre turno con tu PIN de empleado y empieza a recibir paquetes ganando el 15%.' }
    ],
    faqs: [
      { q: '¿Qué tipo de negocios pueden ser un Point Ship24Go?', a: 'Farmacias, papelerías, tiendas de conveniencia, minimarkets, colmados, locutorios, librerías, oficinas de envíos de dinero y cualquier local con atención al público.' },
      { q: '¿Cómo retiro mis comisiones acumuladas?', a: 'Desde tu panel de dueño de sucursal (/point) puedes solicitar la liquidación de tu saldo hacia tu cuenta bancaria en cualquier momento.' },
      { q: '¿Necesito comprar un equipo especial?', a: 'No, puedes utilizar cualquier computadora, laptop o tableta con conexión a internet y navegador web.' }
    ],
    relatedLinks: [
      { title: 'Localizador de Puntos en el Mapa', url: '/points', badge: 'Mapa en Vivo' },
      { title: 'Terminal POS de Mostrador', url: '/point/login' },
      { title: 'Login de Empleados por PIN', url: '/branch/login' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 9. SEGURIDAD Y PROTECCIÓN DE CARGA
  // ─────────────────────────────────────────────────────────────
  'seguridad': {
    slug: 'seguridad',
    category: 'Garantía & Confianza',
    badge: '🛡️ ESTÁNDARES DE SEGURIDAD INTERNACIONAL',
    title: 'Custodia Blindada, Seguro de Carga y Cumplimiento Normativo Global',
    subtitle: 'Protegemos cada paquete con trazabilidad inmutable, precintos de seguridad de grado bancario y pólizas de cobertura total.',
    heroHighlight: '100% de Cobertura y Protección de Envíos',
    metaDescription: 'Seguridad y custodia de paquetería en Ship24Go. Seguro de carga contra pérdidas y daños, sellos de seguridad inviolables, cifrado SSL y compliance aduanal.',
    primaryCtaText: 'Conocer Pólizas de Envío',
    primaryCtaLink: '/#quote-section',
    secondaryCtaText: 'Ver Rastreador Satelital',
    secondaryCtaLink: '/tracking',
    images: [
      {
        src: '/images/seo/security-vault.jpg',
        alt: 'Bóveda de alta seguridad en almacén logístico',
        caption: 'Almacenes con jaulas de seguridad reforzadas y control de acceso biométrico.',
        tag: 'Custodia Blindada'
      },
      {
        src: '/images/system/step3-hub-sorting.jpg',
        alt: 'Inspección física de valijas y precintos',
        caption: 'Verificación de precintos inviolables en valijas y control de integridad de bultos.',
        tag: 'Precintos Inviolables'
      },
      {
        src: '/images/system/step4-driver-delivery.jpg',
        alt: 'Entrega con verificación de identidad',
        caption: 'Verificación estricta de cédula o documento de identidad en la entrega final.',
        tag: 'Verificación de Identidad'
      },
      {
        src: '/images/seo/api-developer.jpg',
        alt: 'Cifrado de datos en la nube',
        caption: 'Comunicaciones cifradas con tecnología SSL/TLS y almacenamiento seguro de datos.',
        tag: 'Cifrado Bancario'
      }
    ],
    stats: [
      { value: '100%', label: 'Póliza de Cobertura' },
      { value: '256-bit', label: 'Cifrado SSL / TLS' },
      { value: '0%', label: 'Tolerancia a Pérdidas' },
      { value: '24/7', label: 'Cámaras de Vigilancia' }
    ],
    features: [
      {
        icon: '🔒',
        title: 'Seguro de Carga con Cobertura Total',
        desc: 'Protección integral que indemniza el valor declarado de tus mercancías contra extravío, rotura, robo o daño fortuito.'
      },
      {
        icon: '🛡️',
        title: 'Precintos de Seguridad Inviolables',
        desc: 'Cada valija o valija consolidada es sellada con un precinto numerado único que solo se abre en presencia de operadores de Hub autorizados.'
      },
      {
        icon: '✍️',
        title: 'Prueba de Entrega (POD) con Firma y Cédula',
        desc: 'Ningún paquete se entrega sin firma táctil digitalizada, comprobación de identidad y fotografía del estado de la caja.'
      },
      {
        icon: '🌐',
        title: 'Trazabilidad Inmutable con Coordenadas GPS',
        desc: 'Historial transparente donde cada movimiento queda sellado con hora UTC, latitud, longitud y responsable del turno.'
      }
    ],
    stepsTitle: 'Cadena de Custodia Segura',
    steps: [
      { step: '01', title: 'Inspección de Contenido', desc: 'Verificación física y pesaje exacto al momento de la admisión del bulto.' },
      { step: '02', title: 'Embalaje y Sellado Seguro', desc: 'Colocación de etiquetas térmicas resistentes y precinto de valija inviolable.' },
      { step: '03', title: 'Custodia en Tránsito', desc: 'Traslado seguro con monitoreo por telemetría GPS y escolta logística.' },
      { step: '04', title: 'Entrega con Cédula', desc: 'Comprobación presencial de identidad antes de la entrega final.' }
    ],
    faqs: [
      { q: '¿Qué cubre el seguro de envíos de Ship24Go?', a: 'Cubre el valor comercial declarado del envío contra pérdida total, robo comprobado y daños físicos derivados del transporte.' },
      { q: '¿Qué artículos están prohibidos enviar por razones de seguridad?', a: 'Armas de fuego, explosivos, sustancias inflamables, narcóticos, perecederos sin refrigeración y dinero en efectivo en billetes.' }
    ],
    relatedLinks: [
      { title: 'Trazabilidad en Vivo', url: '/tracking' },
      { title: 'Todos los Servicios', url: '/servicios' },
      { title: 'Documentación API', url: '/api-docs' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // 10. DOCUMENTACIÓN API PARA DESARROLLADORES
  // ─────────────────────────────────────────────────────────────
  'api-docs': {
    slug: 'api-docs',
    category: 'Desarrolladores & Tech',
    badge: '💻 SHIP24GO DEVELOPER PLATFORM',
    title: 'API REST Logística para E-commerce, Marketplaces y Sistemas ERP',
    subtitle: 'Integra cotización de fletes en tiempo real, generación automatizada de etiquetas en PDF/ZPL y webhooks de trazabilidad.',
    heroHighlight: 'Tiempo de Respuesta Menor a 120ms',
    metaDescription: 'Documentación oficial de la API REST de Ship24Go. Endpoints para cotizaciones, creación de envíos, tracking en tiempo real, webhooks y SDKs.',
    primaryCtaText: 'Obtener Credenciales API',
    primaryCtaLink: '/auth/register',
    secondaryCtaText: 'Ver Rastreador en Vivo',
    secondaryCtaLink: '/tracking',
    images: [
      {
        src: '/images/seo/api-developer.jpg',
        alt: 'Desarrolladora integrando API de envíos',
        caption: 'Plataforma para desarrolladores con soporte para Node.js, Python, PHP y cURL.',
        tag: 'REST API v1'
      },
      {
        src: '/images/system/step5-global-tracking.jpg',
        alt: 'Telemetría y webhooks de seguimiento',
        caption: 'Webhooks en tiempo real que notifican a tu servidor cada cambio de estado.',
        tag: 'Webhooks'
      },
      {
        src: '/images/system/step1-point-pos.jpg',
        alt: 'Integración en terminales de venta',
        caption: 'Conexión de sistemas ERP y cajas registradoras con nuestro backend cloud.',
        tag: 'POS Integrations'
      },
      {
        src: '/images/seo/security-vault.jpg',
        alt: 'Seguridad en autenticación con Bearer Token',
        caption: 'Autenticación segura basada en tokens JWT y firma HMAC para webhooks.',
        tag: 'Auth & Tokens'
      }
    ],
    stats: [
      { value: '< 120ms', label: 'Latencia Promedio' },
      { value: '99.9%', label: 'Uptime Garantizado' },
      { value: 'JSON', label: 'Formato Estándar' },
      { value: 'Webhooks', label: 'Eventos en Tiempo Real' }
    ],
    features: [
      {
        icon: '🔌',
        title: 'Endpoints RESTful Claros y Estandarizados',
        desc: 'Rutas intuitivas como /api/quote, /api/shipments, /api/tracking y /api/manifests con documentación interactiva Swagger.'
      },
      {
        icon: '⚡',
        title: 'Generación Automática de Etiquetas PDF y ZPL',
        desc: 'Descarga etiquetas listas para imprimir en impresoras térmicas Zebra o láser sin intervención humana.'
      },
      {
        icon: '🔔',
        title: 'Webhooks con Reintentos Automáticos',
        desc: 'Recibe eventos cuando un paquete cambie a in_transit, at_hub, in_route o delivered con firma y foto.'
      },
      {
        icon: '🛡️',
        title: 'Modo Sandbox y Entorno de Pruebas',
        desc: 'Prueba todas las llamadas sin costo con credenciales de prueba antes de pasar a producción.'
      }
    ],
    stepsTitle: 'Integra en 4 Pasos Simples',
    steps: [
      { step: '01', title: 'Crea tu Cuenta Developer', desc: 'Regístrate y obtén tu API Key y Secret en el panel de configuración.' },
      { step: '02', title: 'Prueba en Sandbox', desc: 'Realiza llamadas de prueba simulando envíos y cotizaciones en vivo.' },
      { step: '03', title: 'Configura tus Webhooks', desc: 'Registra tu URL de escucha para recibir eventos de trazabilidad automáticos.' },
      { step: '04', title: 'Pasa a Producción', desc: 'Cambia a tu clave productiva y automatiza la logística de tu negocio.' }
    ],
    faqs: [
      { q: '¿Qué límites de tasa (rate limits) tiene la API?', a: 'El plan estándar incluye hasta 120 peticiones por minuto, ampliable a miles de peticiones por segundo en el plan Enterprise.' },
      { q: '¿Disponen de plugins listos para Shopify o WooCommerce?', a: 'Sí, contamos con módulos oficiales para conectar tiendas e-commerce sin necesidad de programar una sola línea de código.' }
    ],
    relatedLinks: [
      { title: 'Cotizador en Vivo', url: '/cotizador' },
      { title: 'Seguridad y Privacidad', url: '/seguridad' },
      { title: 'Planes y Tarifas', url: '/tarifas' }
    ]
  }
};
