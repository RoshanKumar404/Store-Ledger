import { theme } from '../theme/tokens';

export interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export interface SegmentedControlStyleDescriptor {
  track: Record<string, unknown>;
  pill: (isActive: boolean) => Record<string, unknown>;
  label: (isActive: boolean) => Record<string, unknown>;
}

/**
 * Segmented Control (Pill Slider)
 * Replicates the Add/Edit, Sale/Expense, and Sales/Profit tab toggles.
 */
export function getSegmentedControlStyles(): SegmentedControlStyleDescriptor {
  return {
    track: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface.tabTrack,
      borderRadius: theme.radii.pill,
      padding: theme.spacing.xxs,
      borderWidth: 1,
      borderColor: theme.colors.surface.border,
    },
    pill: (isActive: boolean) => ({
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.pill,
      backgroundColor: isActive ? theme.colors.surface.tabPill : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      ...(isActive ? theme.shadows.card : theme.shadows.none),
    }),
    label: (isActive: boolean) => ({
      fontFamily: isActive
        ? theme.typography.fontFamily.semiBold
        : theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSize.callout,
      fontWeight: isActive
        ? theme.typography.fontWeight.semiBold
        : theme.typography.fontWeight.medium,
      color: isActive ? theme.colors.text.primary : theme.colors.text.secondary,
    }),
  };
}
