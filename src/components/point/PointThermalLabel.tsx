import React, { useRef } from 'react';
import { Printer, X, Check, Copy } from 'lucide-react';

interface PointThermalLabelProps {
  shipment: any;
  point: any;
  onClose: () => void;
}

export const PointThermalLabel: React.FC<PointThermalLabelProps> = ({ shipment, point, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const copyTracking = () => {
    navigator.clipboard.writeText(shipment.trackingCode || shipment.tracking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trackingCode = shipment.trackingCode || shipment.tracking_code || 'S24RD-SAMPLE';
  const sender = shipment.sender || {};
  const recipient = shipment.recipient || {};
  const tariffName = shipment.tariffName || shipment.productName || 'Documento Estándar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Header no imprimible */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-black text-sm uppercase tracking-wider">Etiqueta Térmica Mostrador (4x6")</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ETIQUETA FORMATO TÉRMICO ESTÁNDAR 4x6 PULGADAS */}
        <div className="p-6 bg-slate-100 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-[380px] bg-white border-2 border-black p-5 font-mono text-xs shadow-md text-black"
            style={{ minHeight: '520px' }}
          >
            {/* Header Etiqueta */}
            <div className="border-b-2 border-black pb-3 flex items-start justify-between">
              <div>
                <p className="text-xl font-black tracking-tighter uppercase font-sans">SHIP24GO</p>
                <p className="text-[10px] font-bold tracking-widest text-slate-700 uppercase">Express Logistics Hub</p>
              </div>
              <div className="text-right">
                <span className="inline-block border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                  {recipient.country === 'DO' ? 'REP. DOM' : recipient.country || 'INTL'}
                </span>
                <p className="text-[9px] mt-0.5 font-bold">HUB-SDQ</p>
              </div>
            </div>

            {/* Ruta y Producto */}
            <div className="border-b-2 border-black py-2 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Origen:</span>
                <span className="font-bold">{sender.city || point?.city || 'Boston'}, {sender.state || 'MA'} (US)</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 uppercase block">Servicio:</span>
                <span className="font-black">{tariffName}</span>
              </div>
            </div>

            {/* REMITENTE */}
            <div className="border-b border-black py-2">
              <p className="text-[9px] text-slate-500 uppercase font-sans font-bold">De (Remitente en mostrador):</p>
              <p className="font-bold truncate">{sender.name || point?.contact_name}</p>
              <p className="text-[10px] text-slate-700 truncate">{sender.address || point?.address_line1}</p>
              <p className="text-[10px] text-slate-700">{sender.city || point?.city}, {sender.zipCode || point?.postal_code} - Tel: {sender.phone || point?.phone}</p>
              <p className="text-[9px] font-bold text-slate-600 mt-0.5">Point Emisor: {point?.business_name || 'Point Verificado'}</p>
            </div>

            {/* DESTINATARIO DESTACADO */}
            <div className="border-b-2 border-black py-3 bg-slate-50/70 -mx-1 px-1">
              <p className="text-[10px] font-black uppercase text-slate-600 font-sans">Entregar a (Destinatario):</p>
              <p className="text-base font-black uppercase tracking-tight mt-0.5">{recipient.name}</p>
              <p className="font-bold text-[12px] leading-tight mt-1">{recipient.address}</p>
              <p className="text-[12px] font-bold uppercase mt-0.5">
                {recipient.city}{recipient.province ? `, ${recipient.province}` : ''}
              </p>
              <div className="flex justify-between items-center mt-2 pt-1 border-t border-dashed border-slate-400">
                <span className="font-bold text-[11px]">Tel: {recipient.phone}</span>
                {recipient.idNumber && (
                  <span className="text-[10px] font-bold text-slate-700">Cédula: {recipient.idNumber}</span>
                )}
              </div>
            </div>

            {/* CÓDIGO DE BARRAS / TRACKING INTERNO */}
            <div className="py-4 text-center border-b-2 border-black">
              <p className="text-[9px] uppercase font-bold text-slate-600 mb-1">Código de Rastreo Oficial Ship24Go</p>
              
              {/* Código de barras simulado en SVG vectorizado ultra nítido */}
              <div className="flex justify-center my-1.5">
                <svg className="w-56 h-12" viewBox="0 0 220 50">
                  <rect x="0" y="0" width="3" height="50" fill="#000" />
                  <rect x="5" y="0" width="2" height="50" fill="#000" />
                  <rect x="10" y="0" width="4" height="50" fill="#000" />
                  <rect x="17" y="0" width="1" height="50" fill="#000" />
                  <rect x="21" y="0" width="3" height="50" fill="#000" />
                  <rect x="27" y="0" width="5" height="50" fill="#000" />
                  <rect x="35" y="0" width="2" height="50" fill="#000" />
                  <rect x="40" y="0" width="4" height="50" fill="#000" />
                  <rect x="47" y="0" width="2" height="50" fill="#000" />
                  <rect x="52" y="0" width="3" height="50" fill="#000" />
                  <rect x="58" y="0" width="5" height="50" fill="#000" />
                  <rect x="66" y="0" width="1" height="50" fill="#000" />
                  <rect x="70" y="0" width="4" height="50" fill="#000" />
                  <rect x="77" y="0" width="2" height="50" fill="#000" />
                  <rect x="82" y="0" width="4" height="50" fill="#000" />
                  <rect x="89" y="0" width="3" height="50" fill="#000" />
                  <rect x="95" y="0" width="1" height="50" fill="#000" />
                  <rect x="99" y="0" width="5" height="50" fill="#000" />
                  <rect x="107" y="0" width="2" height="50" fill="#000" />
                  <rect x="112" y="0" width="4" height="50" fill="#000" />
                  <rect x="119" y="0" width="3" height="50" fill="#000" />
                  <rect x="125" y="0" width="2" height="50" fill="#000" />
                  <rect x="130" y="0" width="5" height="50" fill="#000" />
                  <rect x="138" y="0" width="2" height="50" fill="#000" />
                  <rect x="143" y="0" width="4" height="50" fill="#000" />
                  <rect x="150" y="0" width="1" height="50" fill="#000" />
                  <rect x="154" y="0" width="3" height="50" fill="#000" />
                  <rect x="160" y="0" width="5" height="50" fill="#000" />
                  <rect x="168" y="0" width="2" height="50" fill="#000" />
                  <rect x="173" y="0" width="4" height="50" fill="#000" />
                  <rect x="180" y="0" width="3" height="50" fill="#000" />
                  <rect x="186" y="0" width="2" height="50" fill="#000" />
                  <rect x="191" y="0" width="4" height="50" fill="#000" />
                  <rect x="198" y="0" width="2" height="50" fill="#000" />
                  <rect x="203" y="0" width="4" height="50" fill="#000" />
                  <rect x="210" y="0" width="2" height="50" fill="#000" />
                  <rect x="215" y="0" width="3" height="50" fill="#000" />
                </svg>
              </div>
              <p className="font-black text-sm tracking-widest uppercase">{trackingCode}</p>
            </div>

            {/* PIE DE ETIQUETA / INFO CONSOLIDACIÓN */}
            <div className="pt-2.5 flex items-center justify-between text-[10px]">
              <div>
                <p className="font-bold">Pago: <span className="uppercase">{shipment.paymentMethod || 'Efectivo'}</span></p>
                <p className="text-slate-600">Total: ${Number(shipment.price || 8).toFixed(2)} {shipment.currency || 'USD'}</p>
              </div>
              <div className="text-right">
                {shipment.isConsolidatedInSaca ? (
                  <span className="inline-block bg-black text-white px-2 py-0.5 font-bold uppercase text-[9px]">
                    Saca Consolidada RD
                  </span>
                ) : (
                  <span className="inline-block border border-black px-1.5 py-0.5 font-bold uppercase text-[9px]">
                    Envío Directo
                  </span>
                )}
                <p className="text-[9px] text-slate-500 mt-0.5">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="print:hidden p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="text-xs text-slate-500">
            Pega esta etiqueta sobre el sobre o paquete antes de colocarlo en la saca.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={copyTracking}
              className="flex-1 sm:flex-none border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar Código'}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir Etiqueta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
