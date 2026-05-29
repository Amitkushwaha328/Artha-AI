export const typography = {
  header: 'Syne',       // Requires loading custom font
  body: 'DM Sans',      // Requires loading custom font
  
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
    hero: 44,
  },
  
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '800',
  } as const
};
