import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePointOperation, validatePointRegistration } from '../server/pointValidation';

test('Point registration accepts a Google Maps verified location and normalizes it', () => {
  const result = validatePointRegistration({
    email: ' POINT@COMERCIO.COM ',
    password: 'una-clave-segura',
    contactName: 'Ana Point',
    businessName: 'Punto Centro',
    country: 'do',
    currency: 'dop',
    addressLine1: 'Av. Central',
    city: 'Santo Domingo',
    formattedAddress: 'Av. Central 10, Santo Domingo, República Dominicana',
    googlePlaceId: 'ChIJ-real-place',
    latitude: 18.4861,
    longitude: -69.9312
  });

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.value.email, 'point@comercio.com');
  assert.equal(result.value.country, 'DO');
  assert.equal(result.value.currency, 'DOP');
  assert.equal(result.value.latitude, 18.4861);
});

test('Point registration rejects free text without Google coordinates', () => {
  const result = validatePointRegistration({
    email: 'point@example.com',
    password: 'una-clave-segura',
    contactName: 'Ana Point',
    businessName: 'Punto Centro',
    addressLine1: 'Av. Central 10',
    city: 'Santo Domingo',
    formattedAddress: 'Av. Central 10, Santo Domingo'
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('Google Maps')));
});

test('Point registration rejects coordinates outside the geographic range', () => {
  const result = validatePointRegistration({
    email: 'point@example.com',
    password: 'una-clave-segura',
    contactName: 'Ana Point',
    businessName: 'Punto Centro',
    addressLine1: 'Av. Central 10',
    city: 'Santo Domingo',
    formattedAddress: 'Av. Central 10, Santo Domingo',
    googlePlaceId: 'ChIJ-real-place',
    latitude: 181,
    longitude: -69.9312
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('latitud')));
});

test('Point operation requires product, sale amount and recipient address', () => {
  const result = validatePointOperation({ productCode: 'document', saleAmount: 125.5, recipientName: 'Cliente Final', recipientAddress: 'Calle 1', recipientCity: 'Santo Domingo', recipientCountry: 'do' });

  assert.equal(result.valid, true);
  assert.deepEqual(result.value, {
    productCode: 'document', saleAmount: 125.5, recipientName: 'Cliente Final', recipientAddress: 'Calle 1', recipientCity: 'Santo Domingo', recipientCountry: 'DO'
  });
});

test('Point operation rejects negative sale amounts', () => {
  const result = validatePointOperation({ productCode: 'document', saleAmount: -1, recipientName: 'Cliente Final', recipientAddress: 'Calle 1', recipientCity: 'Santo Domingo', recipientCountry: 'DO' });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes('precio')));
});
