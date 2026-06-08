/**
 * nail-menu-config.ts
 * ─────────────────────────────────────────────────────────────
 * Centralización de precios, tiempos y opciones del menú Zen.
 * Permite ajustes rápidos sin tocar la lógica de componentes.
 */

export const SISTEMAS = [
  { name: 'Acrílico', basePrice: 450, duration: 120 },
  { name: 'Builder Gel', basePrice: 480, duration: 120 },
  { name: 'Polygel', basePrice: 450, duration: 120 },
];

export const FORMAS = ['Cuadrada', 'Almendra', 'Stiletto', 'Coffin'];
export const LARGOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const DISENOS_COMPLETOS = [
  { name: 'Mano Alzada', price: 200, durationPerNail: 10 },
  { name: 'French', price: 120, durationPerNail: 8 },
  { name: 'Mano Alzada con Relieves', price: 250, durationPerNail: 12 },
  { name: 'Efecto completo / Ojo de gato', price: 100, durationPerNail: 5 },
  { name: 'Efecto + Diseño sencillo', price: 150, durationPerNail: 7 },
];

export const DECOS = [
  { name: 'Espejo', price: 15, durationPerNail: 3 },
  { name: 'Aurora', price: 15, durationPerNail: 3 },
  { name: 'Azúcar', price: 15, durationPerNail: 4 },
  { name: 'Suéter', price: 15, durationPerNail: 5 },
  { name: 'Perla', price: 15, durationPerNail: 2 },
  { name: 'Glitter', price: 15, durationPerNail: 2 },
  { name: 'Carey', price: 15, durationPerNail: 5 },
  { name: 'Blooming', price: 15, durationPerNail: 4 },
  { name: 'Ojo de gato', price: 15, durationPerNail: 3 },
  { name: 'Relieve', price: 15, durationPerNail: 5 },
  { name: '3D', price: 20, durationPerNail: 8 },
  { name: 'Francés', price: 15, durationPerNail: 6 },
  { name: 'Nail art simple', price: 15, durationPerNail: 5 },
  { name: 'Diseño complicado', price: 25, durationPerNail: 10 },
  { name: 'Encapsulado', price: 30, durationPerNail: 8 },
  { name: 'Naturaleza muerta', price: 20, durationPerNail: 5 },
  { name: 'Dijes', price: 25, durationPerNail: 3 },
  { name: 'Sticker', price: 10, durationPerNail: 2 },
  { name: 'Baby boomer', price: 15, durationPerNail: 5 },
  { name: 'Cristales Ch', price: 20, durationPerNail: 3 },
  { name: 'Cristales M', price: 30, durationPerNail: 4 },
  { name: 'Cristales G', price: 40, durationPerNail: 5 },
  { name: 'Uña completa cristal Ch (1-3)', price: 50, durationPerNail: 8 },
  { name: 'Uña completa cristal M (4-6)', price: 80, durationPerNail: 12 },
  { name: 'Uña completa cristal G (7-9)', price: 100, durationPerNail: 15 },
];

export const REPOS = [
  { name: 'Acrílico / Polygel', price: 50, durationPerNail: 15 },
  { name: 'Builder Gel', price: 60, durationPerNail: 15 },
  { name: 'Rubber', price: 40, durationPerNail: 10 },
];

export const GELS = [
  { name: 'Protección Polygel', price: 400, duration: 60 },
  { name: 'Protección Builder Gel', price: 400, duration: 60 },
  { name: 'Gel sobre uña natural', price: 350, duration: 45 },
  { name: 'Cambio de gel', price: 380, duration: 50 },
  { name: 'Nivelación con Rubber', price: 380, duration: 60 },
  { name: 'Relleno Rubber', price: 380, duration: 55 },
];

export const MANIS = [
  { name: 'Con gel', price: 400, duration: 50 },
  { name: 'Sin gel', price: 300, duration: 35 },
];

export const PEDIS = [
  { name: 'Pedicura spa', price: 480, duration: 60 },
  { name: 'Pedicura + Acripie', price: 800, duration: 90 },
  { name: 'Pedicura + French', price: 550, duration: 75 },
  { name: 'Pedicura, Acripie 2 dedos, French', price: 750, duration: 85 },
];
