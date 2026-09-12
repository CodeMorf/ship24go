# Ship24Go Point — Partner Network V1

## Objetivo

Ship24Go Point convierte comercios tradicionales y negocios de comunidad en puntos autorizados para recibir documentos, tarjetas y sobres de clientes que necesitan enviarlos hacia República Dominicana u otros destinos habilitados.

La primera expansión está pensada para zonas con fuerte concentración de migrantes y comercios de confianza en Estados Unidos, España, Suiza, Bangladesh, Pakistán y otros mercados. La red es internacional desde el diseño, aunque el lanzamiento operativo puede empezar con pocos países y pocos hubs.

## Principio de tracking

El cliente recibe **un tracking único en el momento de la emisión**. Ese código no cambia durante su experiencia.

Internamente, Ship24Go puede utilizar referencias adicionales para cada tramo:

1. **Tracking del cliente** — nace en el Point y permanece estable hasta entrega.
2. **Tracking de manifiesto** — identifica el grupo de piezas consolidado desde un Point hacia un hub.
3. **Referencia Point → hub** — opcional, utilizada por el transporte que mueve el manifiesto al almacén.
4. **Referencia internacional** — opcional, utilizada por el tramo hub → país destino.
5. **Referencia local / última milla** — opcional, asociada al courier que completa la entrega.
6. **Envío final Ship24Go** — puede vincularse al item original; el tracking público sigue siendo el tracking emitido por el Point.

El cliente no necesita conocer la estructura de referencias internas para seguir su envío.

## Flujo operativo

### 1. Emisión en el Point

El operador registra:

- tipo de pieza: documento, tarjeta, sobre o paquete cuando esté habilitado;
- remitente;
- destinatario;
- país destino;
- descripción;
- valor declarado cuando aplique.

En la misma transacción se crean:

- tracking único del cliente;
- número único de recibo;
- precio del servicio;
- comisión del Point;
- primer evento de tracking.

### 2. Cola de consolidación

Cada pieza queda en espera de consolidación. Super Admin configura reglas por:

- Point específico o regla general;
- país origen;
- país destino;
- tipo de pieza;
- cantidad mínima de piezas;
- cantidad máxima de días de espera;
- hub destino;
- prioridad.

La regla se considera elegible cuando se cumple **cantidad mínima O tiempo máximo de espera**.

El Point puede funcionar en dos modos:

- **Por reglas:** al cumplirse la condición, se genera el manifiesto.
- **Con aprobación:** el sistema marca la salida como lista y Super Admin decide cuándo liberarla.

### 3. Manifiesto Point → hub

Cuando una salida es liberada:

- se crea un manifiesto único;
- todas las piezas elegibles quedan asociadas al manifiesto;
- se asigna el hub;
- cada pieza conserva su tracking de cliente;
- el manifiesto recibe su propio tracking operativo.

Estados principales:

- listo para salida;
- en tránsito hacia el hub;
- recibido en hub;
- salida internacional;
- cerrado.

### 4. Hub → República Dominicana / destino

Al recibir el manifiesto en el hub se puede registrar:

- referencia internacional;
- referencia local;
- siguiente tramo logístico.

Cada item individual continúa enlazado con su tracking público original.

### 5. Entrega final

Super Admin puede buscar una emisión por tracking o recibo y asociarla con un envío final de Ship24Go. Si ese envío llega a entregado, el seguimiento público del Point refleja la entrega sin cambiar el tracking que recibió el cliente al inicio.

## Comisiones

Cada tipo de pieza tiene:

- precio de venta;
- comisión fija del Point.

La comisión se genera al emitir la pieza.

El Point ve:

- total generado;
- monto comprometido en solicitudes;
- saldo disponible;
- historial de solicitudes.

### Cobro del Point

Métodos preparados:

- PayPal;
- cuenta bancaria;
- coordinación manual.

Modos preparados:

- aprobación manual;
- aprobación inmediata según acuerdo comercial.

En V1, la confirmación de desembolso se realiza desde Super Admin. La ejecución automática del dinero debe conectarse en una fase posterior a un proveedor de payouts compatible con el país del Point; no debe reutilizarse un flujo de cobro de clientes como si fuera un payout.

## Paquetes internacionales

El modelo incluye `parcel` desde V1, pero cada Point tiene un interruptor independiente para habilitarlo.

Esto permite lanzar primero:

- documentos;
- tarjetas;
- sobres;

Y después habilitar:

- paquetes internacionales;
- reventa de servicios courier;
- transporte Point → hub;
- envíos directos globales;
- comisión específica por paquete.

## Super Admin

Ruta: `/admin/points`

Funciones V1:

- resumen de la red;
- alta y edición de Points;
- alta de hubs;
- alta de operador principal;
- precios y comisiones por producto;
- activación futura de paquetes;
- reglas de cantidad/días;
- decisión automática o por aprobación;
- preparación manual de consolidaciones;
- operación de manifiestos;
- aprobación de comisiones;
- búsqueda por tracking/recibo;
- asociación con última milla;
- reserva de licencia publicitaria por ubicación.

## Portal del comercio

Ruta: `/point`

Funciones V1:

- acceso exclusivo del operador;
- dashboard del Point;
- nueva emisión;
- recibo imprimible;
- tracking del cliente;
- historial de emisiones;
- progreso de consolidación;
- manifiestos;
- comisiones;
- método de cobro;
- solicitud de pago;
- consulta pública de tracking.

## Seguridad y separación de roles

El operador de Point usa un rol dedicado. No hereda privilegios de Super Admin.

Las operaciones del comercio siempre se filtran por la asociación entre usuario y Point. El operador no recibe acceso a información de otros Points.

Las operaciones globales de red se reservan a Super Admin o al permiso administrativo `points.manage`.

## Datos V1

La implementación agrega entidades para:

- hubs;
- Points;
- operadores;
- reglas de salida;
- manifiestos;
- piezas emitidas;
- eventos de tracking;
- comisiones;
- solicitudes de pago.

El archivo de creación se encuentra en `migrations/V26__point_partner_network.sql`. El módulo también verifica la disponibilidad de estas estructuras al abrir la función por primera vez.

## Evolución del algoritmo de routing

V1 utiliza un motor determinista porque permite auditar por qué una salida fue creada:

- cantidad;
- antigüedad;
- origen;
- destino;
- tipo;
- hub;
- prioridad;
- modo de aprobación.

Una capa AI/vLLM puede añadirse posteriormente para recomendar ajustes de frecuencia, predecir volumen o sugerir hubs. No debería sustituir las reglas operativas sin una política explícita y auditable.

## Plan de expansión comercial

### Fase 1 — piloto

- 1–2 países origen;
- 5–20 Points;
- 1 hub por zona piloto;
- documentos/tarjetas/sobres;
- pagos de comisión con revisión;
- medición de volumen por Point y coste por pieza.

### Fase 2 — densidad local

- ampliar barrios y ciudades de alta concentración;
- activar campañas de captación B2B;
- medir conversión por origen de lead;
- activar paquetes solo en Points con capacidad operativa;
- introducir planes de publicidad local.

### Fase 3 — licencia local

La entidad Point ya incluye campos para una futura licencia publicitaria por ubicación. Un plan posible:

- cuota fija o porcentaje por zona;
- exclusividad definida por radio/territorio y duración;
- objetivos mínimos de servicio;
- renovación condicionada a calidad y volumen;
- promoción destacada en búsquedas locales de Ship24Go.

## Marketing y contacto comercial

La estrategia propuesta puede combinar email B2B, seguimiento humano y llamadas comerciales. Debe ejecutarse de forma compatible con las reglas de privacidad, consentimiento, identificación del remitente, listas de exclusión y telemarketing de cada país.

Recomendaciones para el lanzamiento:

- usar listas B2B obtenidas legalmente y documentar su procedencia;
- segmentar por país, ciudad, tipo de comercio e idioma;
- incluir mecanismo claro para dejar de recibir comunicaciones;
- respetar listas de no llamada y horarios permitidos;
- evitar llamadas automatizadas a números sin una base legal válida;
- utilizar voz sintética solo donde esté permitido y con las divulgaciones exigidas;
- derivar los leads interesados a una persona entrenada para seguimiento;
- medir contactos, interesados, demos, Points activados y volumen generado.

Un volumen inicial de ~40.000 correos debe tratarse como capacidad máxima de campaña, no como obligación de enviar a contactos no calificados.

## Métricas recomendadas

- Points activos;
- emisiones por Point/día;
- piezas por manifiesto;
- días medios hasta consolidación;
- coste Point → hub por pieza;
- coste hub → destino por pieza;
- comisión media por Point;
- ingreso neto por pieza;
- tasa de entrega;
- incidencias por 1.000 piezas;
- tiempo medio hasta entrega;
- retención mensual de Points;
- leads → Point activo;
- volumen generado por campaña y por territorio.

## Casos de prueba de aceptación

1. Crear un hub y un Point con operador.
2. Acceder a `/point` con el operador.
3. Emitir un documento y recibir tracking + recibo únicos.
4. Consultar ese tracking en la búsqueda pública.
5. Emitir piezas hasta alcanzar el mínimo configurado.
6. Confirmar que se crea un manifiesto sin cambiar el tracking del cliente.
7. Marcar el manifiesto enviado al hub y recibido.
8. Registrar salida internacional.
9. Buscar una pieza desde Super Admin y asociar la entrega final.
10. Confirmar que el cliente sigue consultando el tracking original.
11. Verificar la comisión del Point.
12. Solicitar pago y confirmarlo desde Super Admin.
13. Verificar que un Point no puede consultar datos de otro Point.
14. Verificar que paquetes no aparecen en el portal cuando están deshabilitados.
