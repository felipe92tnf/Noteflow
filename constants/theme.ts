import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
  type MD3Theme,
} from 'react-native-paper';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  fontFamily: {
    regular: undefined,
    medium: undefined,
    bold: undefined,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 20,
    normal: 24,
    relaxed: 28,
  },
} as const;

export type ThemeColors = {
  primary: string;
  onPrimary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
};

export const colorsLight: ThemeColors = {
  primary: '#2563eb',
  onPrimary: '#ffffff',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  error: '#dc2626',
};

export const colorsDark: ThemeColors = {
  primary: '#60a5fa',
  onPrimary: '#0f172a',
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#334155',
  error: '#f87171',
};
export type ColorScheme = 'light' | 'dark';

export function getThemeColors(scheme: ColorScheme | null | undefined): ThemeColors {
  return scheme === 'dark' ? colorsDark : colorsLight;
}

const paperFonts = configureFonts({
  config: {
    fontFamily: typography.fontFamily.regular,
  },
});

export function getPaperTheme(scheme: ColorScheme | null | undefined): MD3Theme {
  const isDark = scheme === 'dark';
  const palette = getThemeColors(scheme);
  const base = isDark ? MD3DarkTheme : MD3LightTheme;

  return {
    ...base,
    fonts: paperFonts,
    colors: {
      ...base.colors,
      primary: palette.primary,
      onPrimary: palette.onPrimary,
      background: palette.background,
      surface: palette.surface,
      surfaceVariant: palette.surfaceVariant,
      onSurface: palette.text,
      onSurfaceVariant: palette.textSecondary,
      outline: palette.border,
      error: palette.error,
    },
  };
}

export const theme = {
  spacing,
  typography,
  colorsLight,
  colorsDark,
  getThemeColors,
  getPaperTheme,
} as const;
