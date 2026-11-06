import type { BadgeVariant } from '@/components/ui/badge';

export interface SmartHubThemeConfig {
  id: string;
  avatarGradient: string;
  avatarShadow: string;
  avatarBorder: string;
  categoryBadgeVariant: BadgeVariant;
  reviewCtaGradient: string;
  reviewCtaShadow: string;
  reviewCtaBorder: string;
  accentText: string;
}

export const SMARTHUB_THEMES: Record<string, SmartHubThemeConfig> = {
  default: {
    id: 'default',
    avatarGradient: 'from-blue-600 to-indigo-600',
    avatarShadow: 'shadow-blue-500/25',
    avatarBorder: 'border-blue-400/35',
    categoryBadgeVariant: 'blue',
    reviewCtaGradient: 'from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
    reviewCtaShadow: 'shadow-indigo-600/25',
    reviewCtaBorder: 'border-blue-400/35',
    accentText: 'text-blue-400',
  },
  emerald: {
    id: 'emerald',
    avatarGradient: 'from-blue-600 to-indigo-600',
    avatarShadow: 'shadow-blue-500/25',
    avatarBorder: 'border-blue-400/35',
    categoryBadgeVariant: 'blue',
    reviewCtaGradient: 'from-blue-600 via-indigo-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
    reviewCtaShadow: 'shadow-indigo-600/25',
    reviewCtaBorder: 'border-blue-400/35',
    accentText: 'text-blue-400',
  },
  amber: {
    id: 'amber',
    avatarGradient: 'from-amber-500 to-orange-600',
    avatarShadow: 'shadow-amber-500/25',
    avatarBorder: 'border-amber-400/35',
    categoryBadgeVariant: 'amber',
    reviewCtaGradient: 'from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600',
    reviewCtaShadow: 'shadow-indigo-600/25',
    reviewCtaBorder: 'border-blue-400/35',
    accentText: 'text-amber-400',
  },
  rose: {
    id: 'rose',
    avatarGradient: 'from-rose-500 to-pink-600',
    avatarShadow: 'shadow-rose-500/25',
    avatarBorder: 'border-rose-400/35',
    categoryBadgeVariant: 'rose',
    reviewCtaGradient: 'from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500',
    reviewCtaShadow: 'shadow-indigo-600/25',
    reviewCtaBorder: 'border-blue-400/35',
    accentText: 'text-rose-400',
  },
};

export function getSmartHubTheme(preset?: string | null): SmartHubThemeConfig {
  if (!preset) return SMARTHUB_THEMES.default;
  return SMARTHUB_THEMES[preset] || SMARTHUB_THEMES.default;
}

