export type PointRegistrationInput = {
  email?: unknown;
  password?: unknown;
  contactName?: unknown;
  businessName?: unknown;
  phone?: unknown;
  country?: unknown;
  currency?: unknown;
  addressLine1?: unknown;
  civicNumber?: unknown;
  city?: unknown;
  province?: unknown;
  postalCode?: unknown;
  formattedAddress?: unknown;
  googlePlaceId?: unknown;
  latitude?: unknown;
  longitude?: unknown;
};

const clean = (value: unknown, max = 191) => String(value ?? '').trim().slice(0, max);

export function normalizePointRegistration(input: PointRegistrationInput) {
  return {
    email: clean(input.email, 191).toLowerCase(),
    password: String(input.password ?? ''),
    contactName: clean(input.contactName, 191),
    businessName: clean(input.businessName, 191),
    phone: clean(input.phone, 50),
    country: clean(input.country, 2).toUpperCase() || 'DO',
    currency: clean(input.currency, 3).toUpperCase() || 'DOP',
    addressLine1: clean(input.addressLine1, 255),
    civicNumber: clean(input.civicNumber, 30),
    city: clean(input.city, 120),
    province: clean(input.province, 120),
    postalCode: clean(input.postalCode, 30),
    formattedAddress: clean(input.formattedAddress, 255),
    googlePlaceId: clean(input.googlePlaceId, 191),
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
  };
}

export function validatePointRegistration(input: PointRegistrationInput) {
  const value = normalizePointRegistration(input);
  const errors: string[] = [];

  if (!/^\S+@\S+\.\S+$/.test(value.email)) errors.push('El correo del responsable no es válido.');
  if (value.password.length < 10) errors.push('La contraseña debe tener al menos 10 caracteres.');
  if (value.contactName.length < 2) errors.push('El nombre del responsable es obligatorio.');
  if (value.businessName.length < 2) errors.push('El nombre del comercio es obligatorio.');
  if (value.addressLine1.length < 3 || value.city.length < 2) errors.push('La dirección y la ciudad son obligatorias.');
  if (!value.formattedAddress) errors.push('Debes confirmar la dirección sugerida por Google Maps.');
  if (!value.googlePlaceId) errors.push('Debes seleccionar una dirección de Google Maps.');
  if (!Number.isFinite(value.latitude) || value.latitude < -90 || value.latitude > 90) errors.push('La latitud de Google Maps no es válida.');
  if (!Number.isFinite(value.longitude) || value.longitude < -180 || value.longitude > 180) errors.push('La longitud de Google Maps no es válida.');

  return { valid: errors.length === 0, errors, value };
}

export function validatePointOperation(input: { productCode?: unknown; saleAmount?: unknown; recipientName?: unknown; recipientAddress?: unknown; recipientCity?: unknown; recipientCountry?: unknown }) {
  const productCode = clean(input.productCode, 50).toLowerCase();
  const saleAmount = Number(input.saleAmount);
  const recipientName = clean(input.recipientName, 191);
  const recipientAddress = clean(input.recipientAddress, 255);
  const recipientCity = clean(input.recipientCity, 120);
  const recipientCountry = clean(input.recipientCountry, 2).toUpperCase();
  const errors: string[] = [];

  if (!productCode) errors.push('Selecciona un producto.');
  if (!Number.isFinite(saleAmount) || saleAmount <= 0) errors.push('El precio cobrado debe ser un importe mayor que cero.');
  if (recipientName.length < 2) errors.push('El nombre del destinatario es obligatorio.');
  if (recipientAddress.length < 3 || recipientCity.length < 2 || recipientCountry.length !== 2) errors.push('Completa la dirección del destinatario.');

  return {
    valid: errors.length === 0,
    errors,
    value: { productCode, saleAmount: Math.round(saleAmount * 100) / 100, recipientName, recipientAddress, recipientCity, recipientCountry }
  };
}
