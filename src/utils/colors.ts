export interface ColorPaletteItem {
  id: string;
  name: string;
  value: string;
  bgRgba: string;
  borderRgba: string;
  textDark: boolean;
}

export const COLOR_PALETTE: ColorPaletteItem[] = [
  {
    id: 'blue',
    name: 'Ocean Blue',
    value: '#3B82F6',
    bgRgba: 'rgba(59, 130, 246, 0.15)',
    borderRgba: 'rgba(59, 130, 246, 0.4)',
    textDark: false,
  },
  {
    id: 'purple',
    name: 'Electric Purple',
    value: '#8B5CF6',
    bgRgba: 'rgba(139, 92, 246, 0.15)',
    borderRgba: 'rgba(139, 92, 246, 0.4)',
    textDark: false,
  },
  {
    id: 'pink',
    name: 'Vibrant Pink',
    value: '#EC4899',
    bgRgba: 'rgba(236, 72, 153, 0.15)',
    borderRgba: 'rgba(236, 72, 153, 0.4)',
    textDark: false,
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    value: '#F59E0B',
    bgRgba: 'rgba(245, 158, 11, 0.15)',
    borderRgba: 'rgba(245, 158, 11, 0.4)',
    textDark: false,
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    value: '#10B981',
    bgRgba: 'rgba(16, 185, 129, 0.15)',
    borderRgba: 'rgba(16, 185, 129, 0.4)',
    textDark: false,
  },
  {
    id: 'cyan',
    name: 'Sky Cyan',
    value: '#06B6D4',
    bgRgba: 'rgba(6, 182, 212, 0.15)',
    borderRgba: 'rgba(6, 182, 212, 0.4)',
    textDark: false,
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    value: '#6366F1',
    bgRgba: 'rgba(99, 102, 241, 0.15)',
    borderRgba: 'rgba(99, 102, 241, 0.4)',
    textDark: false,
  },
  {
    id: 'rose',
    name: 'Ruby Rose',
    value: '#F43F5E',
    bgRgba: 'rgba(244, 63, 94, 0.15)',
    borderRgba: 'rgba(244, 63, 94, 0.4)',
    textDark: false,
  },
  {
    id: 'teal',
    name: 'Teal Mint',
    value: '#14B8A6',
    bgRgba: 'rgba(20, 184, 166, 0.15)',
    borderRgba: 'rgba(20, 184, 166, 0.4)',
    textDark: false,
  },
  {
    id: 'orange',
    name: 'Coral Orange',
    value: '#F97316',
    bgRgba: 'rgba(249, 115, 22, 0.15)',
    borderRgba: 'rgba(249, 115, 22, 0.4)',
    textDark: false,
  },
  {
    id: 'violet',
    name: 'Cosmic Violet',
    value: '#A855F7',
    bgRgba: 'rgba(168, 85, 247, 0.15)',
    borderRgba: 'rgba(168, 85, 247, 0.4)',
    textDark: false,
  },
  {
    id: 'slate',
    name: 'Graphite Slate',
    value: '#64748B',
    bgRgba: 'rgba(100, 116, 139, 0.15)',
    borderRgba: 'rgba(100, 116, 139, 0.4)',
    textDark: false,
  },
];

export function getColorByIndex(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length].value;
}

export function getColorItem(hexColor: string): ColorPaletteItem {
  const found = COLOR_PALETTE.find(
    (c) => c.value.toLowerCase() === hexColor.toLowerCase()
  );
  if (found) return found;
  return {
    id: 'custom',
    name: 'Custom',
    value: hexColor,
    bgRgba: `${hexColor}26`,
    borderRgba: `${hexColor}66`,
    textDark: false,
  };
}
