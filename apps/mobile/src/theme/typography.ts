/**
 * Kirana Ledger Theme: Typography System
 * Features clean DM Sans styling, high legibility for low-end Android screens,
 * and bold, unambiguous Indian Rupee amount displays.
 */

export const typography = {
  fontFamily: {
    regular: 'DMSans-Regular, Inter, system-ui, sans-serif',
    medium: 'DMSans-Medium, Inter-Medium, system-ui, sans-serif',
    semiBold: 'DMSans-SemiBold, Inter-SemiBold, system-ui, sans-serif',
    bold: 'DMSans-Bold, Inter-Bold, system-ui, sans-serif',
  },

  fontSize: {
    hero: 32, // Large metric card numbers (e.g. ₹2,525)
    title: 22, // Screen titles, section headers
    subtitle: 17, // Card titles, modal headers
    body: 15, // Standard input text, list rows
    callout: 14, // Secondary details, button text
    caption: 12, // Subtitles, timestamps, unit labels
    overline: 10, // Uppercase categories, badges
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },

  lineHeight: {
    hero: 40,
    title: 28,
    subtitle: 24,
    body: 22,
    callout: 20,
    caption: 16,
    overline: 14,
  },
} as const;

export type Typography = typeof typography;
