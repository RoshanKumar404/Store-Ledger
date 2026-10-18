import { theme } from '../theme/tokens';

export interface StatusChipProps {
  label: string;
  count?: number;
  isActive?: boolean;
  variant?: 'neutral' | 'inStock' | 'lowStock' | 'outOfStock' | 'sync';
  onPress?: () => void;
}

export interface StatusChipStyleDescriptor {
  container: Record<string, unknown>;
  labelText: Record<string, unknown>;
}

/**
 * Filter Chip & Status Pill Component Descriptor
 * Inspired by screenshot 3 filter chips (All, In stock, Low, Out of stock).
 */
export function getStatusChipStyles(
  isActive = false,
  variant: StatusChipProps['variant'] = 'neutral',
): StatusChipStyleDescriptor {
  let backgroundColor: string = isActive ? theme.colors.brand.accent : theme.colors.surface.card;
  let textColor: string = isActive ? theme.colors.text.inverse : theme.colors.text.secondary;
  let borderColor: string = isActive ? theme.colors.brand.accent : theme.colors.surface.border;

  if (variant === 'inStock') {
    backgroundColor = isActive ? theme.colors.status.inStock : theme.colors.brand.primaryLight;
    textColor = isActive ? theme.colors.text.inverse : theme.colors.status.inStock;
    borderColor = theme.colors.status.inStock;
  } else if (variant === 'lowStock') {
    backgroundColor = isActive ? theme.colors.status.lowStock : theme.colors.brand.amberLight;
    textColor = isActive ? theme.colors.text.inverse : theme.colors.brand.amberDark;
    borderColor = theme.colors.brand.amber;
  } else if (variant === 'outOfStock') {
    backgroundColor = isActive ? theme.colors.status.outOfStock : '#FEE2E2';
    textColor = isActive ? theme.colors.text.inverse : theme.colors.status.outOfStock;
    borderColor = theme.colors.status.outOfStock;
  }

  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.pill,
      backgroundColor,
      borderWidth: 1,
      borderColor,
      marginRight: theme.spacing.sm,
      ...(isActive ? theme.shadows.card : theme.shadows.none),
    },
    labelText: {
      fontFamily: isActive
        ? theme.typography.fontFamily.semiBold
        : theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSize.callout,
      fontWeight: isActive
        ? theme.typography.fontWeight.semiBold
        : theme.typography.fontWeight.medium,
      color: textColor,
    },
  };
}
