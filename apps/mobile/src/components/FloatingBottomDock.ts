import { theme } from '../theme/tokens';

export type DockTab = 'ADD' | 'SALES' | 'STOCK' | 'REPORT';

export interface DockTabItem {
  id: DockTab;
  label: string;
  icon: string;
}

export const DOCK_TABS: DockTabItem[] = [
  { id: 'ADD', label: 'Add', icon: 'plus-box' },
  { id: 'SALES', label: 'Sales', icon: 'cart' },
  { id: 'STOCK', label: 'Stock', icon: 'cube' },
  { id: 'REPORT', label: 'Report', icon: 'chart-bar' },
];

export interface FloatingDockStyleDescriptor {
  dockContainer: Record<string, unknown>;
  tabButton: (isActive: boolean) => Record<string, unknown>;
  activeIndicator: Record<string, unknown>;
  tabIcon: (isActive: boolean) => Record<string, unknown>;
  tabLabel: (isActive: boolean) => Record<string, unknown>;
}

/**
 * Floating Bottom Dock Component Descriptor
 * Replicates the glowing aqua/teal floating pill dock navigation bar.
 */
export function getFloatingDockStyles(): FloatingDockStyleDescriptor {
  return {
    dockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: theme.colors.dock.background,
      borderRadius: theme.radii.pill,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.dockMarginBottom,
      height: theme.spacing.dockHeight,
      paddingHorizontal: theme.spacing.sm,
      ...theme.shadows.dock,
    },
    tabButton: (isActive: boolean) => ({
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.pill,
      backgroundColor: isActive ? theme.colors.dock.activePill : 'transparent',
      marginHorizontal: theme.spacing.xxs,
    }),
    activeIndicator: {
      backgroundColor: theme.colors.dock.activePill,
      borderRadius: theme.radii.pill,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    tabIcon: (isActive: boolean) => ({
      color: isActive ? theme.colors.dock.activeText : theme.colors.dock.inactiveText,
      marginBottom: 2,
    }),
    tabLabel: (isActive: boolean) => ({
      fontFamily: isActive
        ? theme.typography.fontFamily.semiBold
        : theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSize.caption,
      fontWeight: isActive
        ? theme.typography.fontWeight.semiBold
        : theme.typography.fontWeight.medium,
      color: isActive ? theme.colors.dock.activeText : theme.colors.dock.inactiveText,
    }),
  };
}
