import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, ChevronLeft, MapPin, Moon, ShieldCheck, Store, Sun, User, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setAuthToken } from '../lib/api';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { CountrySelect } from '../components/CountrySelect';
import { BrandMark } from '../lib/brand';
import { useTheme } from '../lib/theme';

type PointForm = {
  contactName: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  currency: string;
  addressLine1: string;
  civicNumber: string;
  city: string;
  province: string;
  postalCode: string;
  formattedAddress: string;
  googlePlaceId: string;
  latitude: number | null;
  longitude: number | null;
};

function MapPreview({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const ready = Number.isFinite(latitude) && Number.isFinite(longitude);

  useEffect(() => {
    if (!ready || !mapRef.current || !(window as any).google?.maps) return;
    const google = (window as any).google;
    const position = { lat: Number(latitude), lng: Number(longitude) };
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: position,
        zoom: 17,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      markerRef.current = new google.maps.Marker({ map: mapInstanceRef.current, position, title: 'Ubicación del Point' });
    } else {
      mapInstanceRef.current.setCenter(position);
      markerRef.current?.setPosition(position);
    }
  }, [ready, latitude, longitude]);

  if (!ready) {
    return (
      <div className="h-full min-h-[250px] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-center p-8">
        <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="font-bold text-slate-600 dark:text-slate-300">La ubicación aparecerá aquí</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">Selecciona una sugerencia de Google Maps para guardar la coordenada exacta del comercio.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[250px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
      <div ref={mapRef} className="absolute inset-0" />
      <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/95 dark:bg-slate-950/90 backdrop-blur px-4 py-3 shadow-lg border border-white dark:border-slate-700">
        <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">Coordenadas verificadas</p>
        <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1">{Number(latitude).toFixed(7)}, {Number(longitude).toFixed(7)}</p>
      </div>
    </div>
  );
}

const initialForm: PointForm = {
  contactName: '', businessName: '', email: '', phone: '', password: '', country: 'DO', currency: 'DOP',
  addressLine1: '', civicNumber: '', city: '', province: '', postalCode: '', formattedAddress: '', googlePlaceId: '', latitude: null, longitude: null
};

export default function PointRegister() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [form, setForm] = useState<PointForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const locationSelected = Boolean(form.googlePlaceId && Number.isFinite(form.latitude) && Number.isFinite(form.longitude));

  const update = (field: keyof PointForm, value: any) => setForm((current) => ({ ...current, [field]: value }));
  const updateCountry = (country: string) => setForm((current) => ({ ...current, country, currency: country === 'DO' ? 'DOP' : current.currency === 'DOP' ? 'EUR' : current.currency }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const response = await api.registerPoint(form);
      setAuthToken(response.token);
      setNotice('Registro recibido. Tu Point quedó pendiente de revisión.');
      window.setTimeout(() => navigate('/point'), 500);
    } catch (err: any) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link to="/"><BrandMark iconClassName="w-9 h-9 rounded-xl" textClassName="text-xl text-slate-900 dark:text-white" /></Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <button type="button" onClick={toggleTheme} className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors" title={isDark ? 'Usar modo claro' : 'Usar modo oscuro'} aria-label={isDark ? 'Usar modo claro' : 'Usar modo oscuro'}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/auth/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white">Ya tengo una cuenta</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-[0.86fr_1.14fr] gap-8 lg:gap-12 items-start">
          <section className="text-slate-900 dark:text-white lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-cyan-400/30 bg-blue-50 dark:bg-cyan-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-700 dark:text-cyan-300">
              <Store className="w-4 h-4" /> Red de Points Ship24Go
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] mt-6">Convierte tu comercio en un punto logístico.</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mt-6 max-w-xl">Registra tu ubicación, recibe operaciones y consulta el mismo tracking que verá el cliente final.</p>
            <div className="mt-10 space-y-4">
              {[
                { icon: MapPin, title: 'Ubicación verificada', text: 'La dirección se confirma con Google Maps y queda guardada con coordenadas.' },
                { icon: ShieldCheck, title: 'Aprobación controlada', text: 'El equipo de Ship24Go revisa y habilita cada Point antes de emitir.' },
                { icon: CheckCircle2, title: 'Trazabilidad compartida', text: 'Cada operación genera un código público enlazado al tracking existente.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-4 shadow-sm dark:shadow-none">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 dark:bg-cyan-400/10 text-blue-600 dark:text-cyan-300 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                  <div><p className="font-black">{title}</p><p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{text}</p></div>
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-[2rem] shadow-2xl dark:shadow-black/30 p-5 sm:p-8 space-y-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400">Solicitud de afiliación</p><h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Datos del Point</h2><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Completa los datos reales del comercio.</p></div>
              <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 items-center justify-center"><Building2 className="w-5 h-5" /></div>
            </div>

            {error && <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-semibold text-red-700 dark:text-red-300 flex gap-3"><XCircle className="w-5 h-5 shrink-0" />{error}</div>}
            {notice && <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex gap-3"><CheckCircle2 className="w-5 h-5 shrink-0" />{notice}</div>}

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block sm:col-span-2"><span className="label-dynamic">Nombre del comercio *</span><input required value={form.businessName} onChange={(e) => update('businessName', e.target.value)} className="input-dynamic" placeholder="Ej. Punto Centro" /></label>
              <label className="block"><span className="label-dynamic">Responsable *</span><span className="relative block"><User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" /><input required value={form.contactName} onChange={(e) => update('contactName', e.target.value)} className="input-dynamic pl-10" placeholder="Nombre y apellido" /></span></label>
              <label className="block"><span className="label-dynamic">Teléfono</span><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-dynamic" placeholder="+1 809 000 0000" /></label>
              <label className="block"><span className="label-dynamic">Correo *</span><input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-dynamic" placeholder="point@comercio.com" /></label>
              <label className="block"><span className="label-dynamic">Contraseña *</span><input required minLength={10} type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="input-dynamic" placeholder="Mínimo 10 caracteres" /></label>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <div><h3 className="font-black text-slate-900 dark:text-white">Ubicación del comercio</h3><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Selecciona una sugerencia; escribir texto libre no genera coordenadas verificadas.</p></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block"><span className="label-dynamic">País *</span><CountrySelect value={form.country} onChange={(code) => updateCountry(code)} lang="es" /></label>
                <label className="block"><span className="label-dynamic">Moneda de operación *</span><select required value={form.currency} onChange={(e) => update('currency', e.target.value)} className="input-dynamic"><option value="DOP">DOP — Peso dominicano</option><option value="USD">USD — Dólar</option><option value="EUR">EUR — Euro</option></select></label>
              </div>
              <div><span className="label-dynamic">Dirección en Google Maps *</span><AddressAutocomplete value={form.addressLine1} civicNumber={form.civicNumber} onChange={(value) => setForm((current) => ({ ...current, addressLine1: value, formattedAddress: '', googlePlaceId: '', latitude: null, longitude: null }))} onCivicNumberChange={(value) => update('civicNumber', value)} onSelectAddress={(parts) => setForm((current) => ({ ...current, addressLine1: parts.addressLine1, civicNumber: parts.civicNumber, city: parts.city, postalCode: parts.zipCode, country: parts.country || current.country, formattedAddress: parts.formattedAddress, googlePlaceId: parts.googlePlaceId, latitude: parts.latitude, longitude: parts.longitude }))} countryCode={form.country} required placeholder="Busca el comercio y selecciona una dirección" /></div>
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block"><span className="label-dynamic">Ciudad *</span><input required value={form.city} onChange={(e) => update('city', e.target.value)} className="input-dynamic" placeholder="Santo Domingo" /></label>
                <label className="block"><span className="label-dynamic">Provincia / estado</span><input value={form.province} onChange={(e) => update('province', e.target.value)} className="input-dynamic" placeholder="Distrito Nacional" /></label>
                <label className="block"><span className="label-dynamic">Código postal</span><input value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="input-dynamic" placeholder="10101" /></label>
              </div>
              {locationSelected && <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300"><p className="font-black flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Ubicación confirmada por Google Maps</p><p className="font-mono text-xs mt-1">{Number(form.latitude).toFixed(7)}, {Number(form.longitude).toFixed(7)}</p></div>}
            </div>

              <div className="grid md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
              <MapPreview latitude={form.latitude} longitude={form.longitude} />
              <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Dirección normalizada</p><p className="font-bold text-slate-800 dark:text-slate-200 mt-2 leading-relaxed">{form.formattedAddress || 'Selecciona la ubicación para confirmar la dirección.'}</p></div><div className="mt-6 text-xs text-slate-500 dark:text-slate-400 space-y-2"><p><span className="font-bold">Place ID:</span> {form.googlePlaceId ? `${form.googlePlaceId.slice(0, 18)}…` : 'pendiente'}</p><p><span className="font-bold">Estado:</span> {locationSelected ? 'Listo para revisión' : 'Falta seleccionar en Maps'}</p></div></div>
            </div>

            <button type="submit" disabled={loading || !locationSelected} className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-4 flex items-center justify-center gap-2 transition-colors">{loading ? 'Enviando solicitud…' : 'Solicitar afiliación Point'}{!loading && <ArrowRight className="w-5 h-5" />}</button>
            {!locationSelected && <p className="text-center text-xs font-semibold text-amber-700 dark:text-amber-300">Selecciona primero una dirección de Google Maps para continuar.</p>}
            <div className="flex items-center justify-between text-sm"><Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-bold"><ChevronLeft className="w-4 h-4" /> Volver</Link><span className="text-slate-400">Revisión manual antes de operar</span></div>
          </form>
        </div>
      </main>
    </div>
  );
}
