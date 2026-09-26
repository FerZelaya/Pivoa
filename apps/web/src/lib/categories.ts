/** Maps stored (lucide-style) icon names to Material Symbols used by the Stitch design. */
const ICON_MAP: Record<string, string> = {
  utensils: 'restaurant',
  food: 'restaurant',
  car: 'directions_car',
  transport: 'directions_car',
  zap: 'bolt',
  utilities: 'bolt',
  tv: 'movie',
  entertainment: 'movie',
  'heart-pulse': 'health_and_safety',
  health: 'health_and_safety',
  'shopping-bag': 'shopping_bag',
  shopping: 'shopping_bag',
  home: 'apartment',
  housing: 'apartment',
  'more-horizontal': 'category',
  other: 'category',
  'piggy-bank': 'savings',
  plane: 'flight_takeoff',
  shield: 'shield',
  laptop: 'laptop_mac',
  graduation: 'school',
  gift: 'redeem',
  groceries: 'local_grocery_store',
}

export function categoryIcon(icon?: string | null, name?: string | null): string {
  if (icon && ICON_MAP[icon]) return ICON_MAP[icon]
  if (name && ICON_MAP[name.toLowerCase()]) return ICON_MAP[name.toLowerCase()]
  if (icon && /^[a-z_]+$/.test(icon)) return icon
  return 'category'
}

/** Stitch chart palette, in order of use. */
export const CHART_COLORS = ['#4f46e5', '#006c4a', '#c20038', '#3323cc', '#777587', '#68dba9', '#c3c0ff', '#ffb3b6']

export function chartColor(index: number) {
  return CHART_COLORS[index % CHART_COLORS.length]
}

/** Pill + icon tile styles cycling through the Stitch tonal palette. */
const TONES = [
  { pill: 'bg-primary-fixed text-on-primary-fixed-variant', dot: 'bg-primary-container', tile: 'bg-primary-fixed text-primary' },
  { pill: 'bg-secondary-fixed text-on-secondary-fixed-variant', dot: 'bg-secondary', tile: 'bg-secondary-container/60 text-on-secondary-container' },
  { pill: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', dot: 'bg-tertiary-container', tile: 'bg-tertiary-fixed text-tertiary' },
  { pill: 'bg-surface-container-high text-on-surface', dot: 'bg-outline', tile: 'bg-surface-container-high text-on-surface' },
  { pill: 'bg-primary-fixed-dim/40 text-on-primary-fixed', dot: 'bg-primary', tile: 'bg-primary-fixed-dim/40 text-on-primary-fixed' },
  { pill: 'bg-secondary-container/70 text-on-secondary-container', dot: 'bg-secondary-fixed-dim', tile: 'bg-secondary-fixed/40 text-on-secondary-fixed-variant' },
]

const NAME_TONE: Record<string, number> = {
  food: 0,
  transport: 4,
  utilities: 3,
  entertainment: 2,
  health: 1,
  shopping: 5,
  housing: 0,
  other: 3,
}

export function categoryTone(name?: string | null) {
  const key = (name ?? '').toLowerCase()
  if (key in NAME_TONE) return TONES[NAME_TONE[key]]
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return TONES[hash % TONES.length]
}

export const GOAL_ICONS = [
  { value: 'savings', label: 'Savings' },
  { value: 'shield', label: 'Emergency' },
  { value: 'flight_takeoff', label: 'Travel' },
  { value: 'home', label: 'Home' },
  { value: 'directions_car', label: 'Vehicle' },
  { value: 'school', label: 'Education' },
  { value: 'laptop_mac', label: 'Tech' },
  { value: 'redeem', label: 'Gift' },
]
