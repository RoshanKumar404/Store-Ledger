/**
 * Kirana Ledger Theme: Colors & Semantic Tokens
 * Harmonizes the core Kirana Green & Amber specification with the
 * vibrant Teal / Ocean Blue aesthetic and floating pill dock navigation.
 */

export const colors = {
  // Brand & Accent Colors (Kirana Spec + Ocean Wave)
  brand: {
    primary: '#1F7A4D', // Kirana Signature Green (Ledger & Trust)
    primaryDark: '#14532D',
    primaryLight: '#E8F5E9',
    accent: '#00838F', // Ocean Teal (Header waves, badges, dock highlight)
    accentLight: '#E0F7FA', // Aqua tint for active dock pills and highlights
    accentDark: '#006064',
    amber: '#E8A317', // Spec Amber (Low stock, Udhaar alerts)
    amberDark: '#7A4B00',
    amberLight: '#FEF3C7',
  },

  // Financial & Operational Semantics
  financial: {
    sales: '#1F7A4D', // Green for incoming sales
    profit: '#16A34A', // Green for positive margin
    expense: '#DC2626', // Red for expenses
    debt: '#B45309', // Amber-Brown for Udhaar balance
    creditGiven: '#D97706',
    paymentReceived: '#1F7A4D',
  },

  // Status & Sync State Badges
  status: {
    synced: '#1F7A4D',
    syncing: '#0284C7',
    offline: '#64748B',
    attention: '#E8A317',
    error: '#DC2626',
    inStock: '#16A34A',
    lowStock: '#E8A317',
    outOfStock: '#DC2626',
  },

  // Surfaces & Backgrounds
  surface: {
    background: '#F1F5F9', // Crisp Slate-100 canvas
    card: '#FFFFFF', // Pure white card surfaces
    cardElevated: '#FFFFFF',
    input: '#F8FAFC', // Slate-50 input backgrounds
    border: '#E2E8F0', // Slate-200 subtle card borders
    borderLight: '#F1F5F9',
    divider: '#E2E8F0',
    overlay: 'rgba(15, 23, 42, 0.4)',
    tabTrack: '#F1F5F9', // Segmented control track background
    tabPill: '#FFFFFF', // Segmented control active pill
  },

  // Floating Navigation Dock (Cyan/Teal Pill Dock)
  dock: {
    background: '#00838F', // Deep Teal floating bar background
    backgroundGradientEnd: '#0097A7',
    activePill: '#E0F7FA', // Soft aqua glowing pill for selected tab
    activeText: '#006064',
    inactiveText: '#B2EBF2',
  },

  // Text & Typography Contrast
  text: {
    primary: '#0F172A', // Slate-900 high contrast
    secondary: '#475569', // Slate-600 readable subtext
    muted: '#94A3B8', // Slate-400 footnotes, placeholders
    inverse: '#FFFFFF',
    brand: '#1F7A4D',
    accent: '#00838F',
  },
} as const;

export type Colors = typeof colors;
