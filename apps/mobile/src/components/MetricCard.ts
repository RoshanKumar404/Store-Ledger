import { theme } from '../theme/tokens';
import { formatPaiseToRupees } from '@kirana/shared';

export interface MetricCardProps {
  title: string;
  amountPaise: number;
  subtitle?: string;
  variant?: 'sales' | 'profit' | 'expense' | 'neutral' | 'stock';
  onPress?: () => void;
}

export interface MetricCardStyleDescriptor {
  container: Record<string, unknown>;
  titleText: Record<string, unknown>;
  amountText: Record<string, unknown>;
  subtitleText: Record<string, unknown>;
}

/**
 * Metric Card Component Descriptor
 * Inspired by the 2x2 summary metric grid in the screenshots.
 */
export function getMetricCardStyles(
  variant: MetricCardProps['variant'] = 'neutral',
): MetricCardStyleDescriptor {
  let amountColor: string = theme.colors.text.primary;
  if (variant === 'sales' || variant === 'profit') {
    amountColor = theme.colors.financial.sales;
  } else if (variant === 'expense') {
    amountColor = theme.colors.financial.expense;
  } else if (variant === 'stock') {
    amountColor = theme.colors.brand.accent;
  }

  return {
    container: {
      flex: 1,
      minWidth: 140,
      backgroundColor: theme.colors.surface.card,
      borderRadius: theme.radii.card,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.surface.border,
      ...theme.shadows.card,
    },
    titleText: {
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSize.callout,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    amountText: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.title,
      fontWeight: theme.typography.fontWeight.bold,
      color: amountColor,
      marginBottom: theme.spacing.xs,
    },
    subtitleText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.text.muted,
    },
  };
}

export function formatMetricAmount(amountPaise: number): string {
  return formatPaiseToRupees(amountPaise);
}
