import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePointOperation, validatePointRegistration } from '../server/pointValidation.ts';

test('valida una operación Point completa y normaliza sus valores', () => {
  const result = validatePointOperation({
    productCode: ' BOX_M ',
    saleAmount: '32.456',
    recipientName: 'Ana Pérez',
    recipientAddress: 'Av. Independencia 10',
    recipientCity: 'Santo Domingo',
    recipientCountry: 'do'
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.value.productCode, 'box_m');
  assert.equal(result.value.saleAmount, 32.46);
  assert.equal(result.value.recipientCountry, 'DO');
});

test('rechaza una operación Point incompleta o con importe inválido', () => {
  const result = validatePointOperation({
    productCode: '',
    saleAmount: '-1',
    recipientName: 'A',
    recipientAddress: '',
    recipientCity: '',
    recipientCountry: 'DOM'
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 4);
  assert.match(result.errors.join(' '), /producto/i);
  assert.match(result.errors.join(' '), /importe/i);
  assert.match(result.errors.join(' '), /destinatario/i);
  assert.match(result.errors.join(' '), /dirección/i);
});

test('exige dirección confirmada por Google Maps en el alta del Point', () => {
  const result = validatePointRegistration({
    email: 'point@example.com',
    password: 'una-clave-segura',
    contactName: 'María López',
    businessName: 'Comercio Central',
    addressLine1: 'Calle Principal 1',
    city: 'Santo Domingo',
    latitude: '18.4861',
    longitude: '-69.9312'
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /Google Maps/i);
});

test('acepta un alta de Point con coordenadas dentro de rango', () => {
  const result = validatePointRegistration({
    email: 'point@example.com',
    password: 'una-clave-segura',
    contactName: 'María López',
    businessName: 'Comercio Central',
    addressLine1: 'Calle Principal 1',
    city: 'Santo Domingo',
    formattedAddress: 'Calle Principal 1, Santo Domingo, DO',
    googlePlaceId: 'place_123',
    latitude: 18.4861,
    longitude: -69.9312
  });

  assert.equal(result.valid, true);
  assert.equal(result.value.country, 'DO');
  assert.equal(result.value.currency, 'DOP');
});

test('rechaza coordenadas imposibles en el alta del Point', () => {
  const result = validatePointRegistration({
    email: 'point@example.com',
    password: 'una-clave-segura',
    contactName: 'María López',
    businessName: 'Comercio Central',
    addressLine1: 'Calle Principal 1',
    city: 'Santo Domingo',
    formattedAddress: 'Calle Principal 1, Santo Domingo, DO',
    googlePlaceId: 'place_123',
    latitude: 181,
    longitude: -181
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /latitud/i);
  assert.match(result.errors.join(' '), /longitud/i);
});
