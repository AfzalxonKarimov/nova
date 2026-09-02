/**
 * Theme type definitions.
 */

export type Theme = 'light' | 'dark' | 'amoled' | 'midnight' | 'minimal';

export interface ThemeMeta {
  id: Theme;
  name: string;
  description: string;
  icon: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean white/gray',
    icon: 'sun',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Deep neutral dark',
    icon: 'moon',
  },
  {
    id: 'amoled',
    name: 'AMOLED',
    description: 'True/near-black',
    icon: 'display',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark with subtle cool accent',
    icon: 'star',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Almost entirely monochrome',
    icon: 'filter',
  },
];
