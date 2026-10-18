import { theme } from '../theme/tokens';
import { SyncChipState } from '../store/session.store';

export interface HeaderProps {
  shopName: string;
  userName?: string;
  syncStatus: SyncChipState;
  onProfilePress?: () => void;
  onSyncPress?: () => void;
}

export interface HeaderStyleDescriptor {
  container: Record<string, unknown>;
  profileButton: Record<string, unknown>;
  shopTitle: Record<string, unknown>;
  cloudIndicator: Record<string, unknown>;
}

/**
 * Header Model & Style Generator
 * Replicates the wave header layout with profile avatar and top-right cloud sync indicator.
 */
export function getHeaderStyles(): HeaderStyleDescriptor {
  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.brand.accent,
      borderBottomLeftRadius: theme.radii.card,
      borderBottomRightRadius: theme.radii.card,
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.pill,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    shopTitle: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.title,
      color: theme.colors.text.inverse,
      fontWeight: theme.typography.fontWeight.bold,
      letterSpacing: 0.3,
    },
    cloudIndicator: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.pill,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };
}

/**
 * Returns icon name and tint color matching the cloud sync status
 */
export function getCloudIconProps(status: SyncChipState): {
  icon: string;
  color: string;
  label: string;
} {
  switch (status) {
    case 'ALL_SAVED':
      return { icon: 'cloud-done', color: theme.colors.text.inverse, label: 'All saved to cloud' };
    case 'SYNCING':
      return {
        icon: 'cloud-sync',
        color: theme.colors.brand.accentLight,
        label: 'Syncing changes...',
      };
    case 'WAITING':
      return { icon: 'cloud-upload', color: theme.colors.brand.amber, label: 'Waiting to sync' };
    case 'NEEDS_ATTENTION':
      return {
        icon: 'cloud-alert',
        color: theme.colors.brand.amber,
        label: 'Conflict / Attention needed',
      };
    case 'OFFLINE':
    default:
      return { icon: 'cloud-off', color: 'rgba(255, 255, 255, 0.6)', label: 'Operating offline' };
  }
}
