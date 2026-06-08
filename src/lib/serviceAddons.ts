export type CategoryId = 'manos' | 'pies' | 'spa' | 'extras';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
}

export const SERVICE_CATEGORIES: Category[] = [
  { id: 'manos', label: 'Manos', icon: 'HandMetal' },
  { id: 'pies', label: 'Pies', icon: 'Footprints' },
  { id: 'spa', label: 'Rituales Spa', icon: 'Sparkles' },
  { id: 'extras', label: 'Retoque / Extras', icon: 'PlusCircle' },
];

export interface AddonOption {
  id: string;
  label: string;
  price: number;
  duration_minutes: number;
}

export interface AddonCategory {
  id: string;
  title: string;
  options: AddonOption[];
}

export const ADDON_GROUPS: AddonCategory[] = [
  {
    id: 'length',
    title: 'Largo de Uñas',
    options: [
      { id: 'corto', label: 'Corto (S)', price: 0, duration_minutes: 0 },
      { id: 'medio', label: 'Medio (M)', price: 50, duration_minutes: 15 },
      { id: 'largo', label: 'Largo (L)', price: 100, duration_minutes: 30 },
      { id: 'xl', label: 'Extra Largo (XL)', price: 150, duration_minutes: 45 },
    ],
  },
  {
    id: 'design',
    title: 'Nivel de Diseño',
    options: [
      { id: 'liso', label: 'Liso (Color Sólido)', price: 0, duration_minutes: 0 },
      { id: 'frances', label: 'Francés Clásico', price: 60, duration_minutes: 15 },
      { id: 'basico', label: 'Nail Art Básico (2-4 uñas)', price: 120, duration_minutes: 30 },
      { id: 'complejo', label: 'Nail Art Complejo (Todas)', price: 250, duration_minutes: 60 },
    ],
  },
  {
    id: 'tones',
    title: 'Cantidad de Tonos',
    options: [
      { id: '1-2', label: '1 a 2 Tonos', price: 0, duration_minutes: 0 },
      { id: '3-plus', label: '3 o más Tonos', price: 40, duration_minutes: 15 },
    ],
  },
  {
    id: 'extras',
    title: 'Extras',
    options: [
      { id: 'pedreria', label: 'Pedrería / Cristales', price: 80, duration_minutes: 20 },
      { id: 'efecto', label: 'Efecto Espejo/Cromo', price: 60, duration_minutes: 15 },
      { id: 'retiro', label: 'Retiro de set anterior', price: 100, duration_minutes: 30 },
    ],
  }
];
