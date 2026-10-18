import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { theme } from '../src/theme/tokens';
import { useSessionStore } from '../src/store/session.store';
import { checkServerHealth } from '../src/api/health.api';
import { formatMetricAmount } from '../src/components/MetricCard';
import { DOCK_TABS, DockTab } from '../src/components/FloatingBottomDock';

export default function DashboardScreen() {
  const [selectedPeriod] = useState('October 2026');
  const [trendTab, setTrendTab] = useState<'sales' | 'profit'>('sales');
  const [activeDockTab, setActiveDockTab] = useState<DockTab>('REPORT');
  const [serverStatus, setServerStatus] = useState<string>('Checking...');

  const shop = useSessionStore((state) => state.shop);
  const syncStatus = useSessionStore((state) => state.syncStatus);
  const setSyncStatus = useSessionStore((state) => state.setSyncStatus);
  const setOnlineStatus = useSessionStore((state) => state.setOnlineStatus);

  useEffect(() => {
    // Run health check on initial mount (§FE-01)
    checkServerHealth().then((res) => {
      if (res.ok) {
        setServerStatus(`Connected (v${res.data?.version}) · ${res.latencyMs}ms`);
        setOnlineStatus(true);
        setSyncStatus('ALL_SAVED');
      } else {
        setServerStatus('Offline (Local mode)');
        setOnlineStatus(false);
        setSyncStatus('OFFLINE');
      }
    });
  }, [setOnlineStatus, setSyncStatus]);

  const shopName = shop?.name || 'BusinessX';

  return (
    <View style={styles.container}>
      {/* Top Ocean Wave Header */}
      <View style={styles.header}>
        <SafeAreaView style={styles.headerContent}>
          <TouchableOpacity style={styles.avatarButton}>
            <Text style={styles.avatarText}>👤</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{shopName}</Text>

          <TouchableOpacity
            style={styles.cloudButton}
            onPress={() => {
              checkServerHealth().then((res) => {
                setSyncStatus(res.ok ? 'ALL_SAVED' : 'OFFLINE');
              });
            }}
          >
            <Text style={styles.cloudIcon}>
              {syncStatus === 'ALL_SAVED' ? '☁️' : syncStatus === 'SYNCING' ? '🔄' : '☁️⚠️'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Server Connectivity Banner */}
        <View style={styles.connectivityBanner}>
          <Text style={styles.connectivityText}>● {serverStatus}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector Card */}
        <View style={styles.periodRow}>
          <View style={styles.periodCard}>
            <TouchableOpacity style={styles.arrowButton}>
              <Text style={styles.arrowText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.periodCenter}>
              <Text style={styles.periodLabel}>PERIOD</Text>
              <Text style={styles.periodValue}>{selectedPeriod}</Text>
            </View>

            <TouchableOpacity style={styles.arrowButton}>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportIcon}>⬆</Text>
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Upgrade / Sync Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <Text style={styles.promoIcon}>🔒</Text>
            <View>
              <Text style={styles.promoTitle}>Offline-First Cloud Sync</Text>
              <Text style={styles.promoSubtitle}>Local SQLite · Commit-ordered push/pull</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.promoAction}>
            <Text style={styles.promoActionText}>Sync Now</Text>
          </TouchableOpacity>
        </View>

        {/* 2x2 Metric Cards Grid */}
        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Sales</Text>
            <Text style={[styles.metricValue, { color: theme.colors.financial.sales }]}>
              {formatMetricAmount(0)}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricLabel}>Net Profit</Text>
              <Text style={styles.infoIcon}>ⓘ</Text>
            </View>
            <Text style={[styles.metricValue, { color: theme.colors.financial.profit }]}>
              {formatMetricAmount(0)}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Expenses</Text>
            <Text style={[styles.metricValue, { color: theme.colors.financial.expense }]}>
              {formatMetricAmount(0)}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Avg / Day</Text>
            <Text style={styles.metricValue}>{formatMetricAmount(0)}</Text>
            <Text style={styles.metricSubtitle}>0 sales · 0 active days</Text>
          </View>
        </View>

        {/* Trends Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trends</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>View in detail ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trendsCard}>
          <View style={styles.trendsHeader}>
            <Text style={styles.trendsTitle}>Daily sales</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentPill, trendTab === 'sales' && styles.segmentPillActive]}
                onPress={() => setTrendTab('sales')}
              >
                <Text
                  style={[styles.segmentText, trendTab === 'sales' && styles.segmentTextActive]}
                >
                  Sales
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentPill, trendTab === 'profit' && styles.segmentPillActive]}
                onPress={() => setTrendTab('profit')}
              >
                <Text
                  style={[styles.segmentText, trendTab === 'profit' && styles.segmentTextActive]}
                >
                  Profit
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dateSliderRow}>
            <Text style={styles.sliderArrow}>‹</Text>
            <Text style={styles.dateSliderText}>Oct 16 – 31, 2026</Text>
            <Text style={styles.sliderArrow}>›</Text>
          </View>

          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBaseline} />
            <View style={styles.chartDates}>
              {['16', '18', '20', '22', '24', '26', '28', '30'].map((d) => (
                <Text key={d} style={styles.chartDateText}>
                  {d}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Sales History Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales history</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Show all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateIcon}>📊</Text>
          <Text style={styles.emptyStateTitle}>No data this month</Text>
          <Text style={styles.emptyStateSubtitle}>Sales you record will show up here.</Text>
        </View>
      </ScrollView>

      {/* Floating Cyan/Teal Bottom Dock Navigation */}
      <View style={styles.floatingDock}>
        {DOCK_TABS.map((tab) => {
          const isActive = activeDockTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.dockTab, isActive && styles.dockTabActive]}
              onPress={() => setActiveDockTab(tab.id)}
            >
              <Text style={[styles.dockIcon, isActive && styles.dockIconActive]}>
                {tab.id === 'ADD'
                  ? '➕'
                  : tab.id === 'SALES'
                    ? '🛒'
                    : tab.id === 'STOCK'
                      ? '📦'
                      : '📊'}
              </Text>
              <Text style={[styles.dockLabel, isActive && styles.dockLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.background,
  },
  header: {
    backgroundColor: theme.colors.brand.accent,
    paddingBottom: theme.spacing.md,
    borderBottomLeftRadius: theme.radii.card,
    borderBottomRightRadius: theme.radii.card,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.title,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    letterSpacing: 0.5,
  },
  cloudButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudIcon: {
    fontSize: 18,
  },
  connectivityBanner: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  connectivityText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.brand.accentLight,
    fontWeight: theme.typography.fontWeight.medium,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Space for floating bottom dock
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  periodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.card,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.card,
  },
  periodCenter: {
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: theme.typography.fontSize.overline,
    color: theme.colors.text.muted,
    letterSpacing: 1,
    fontWeight: theme.typography.fontWeight.bold,
  },
  periodValue: {
    fontSize: theme.typography.fontSize.callout,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  arrowButton: {
    padding: theme.spacing.xs,
  },
  arrowText: {
    fontSize: 20,
    color: theme.colors.brand.accent,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.card,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  exportIcon: {
    fontSize: 16,
    color: theme.colors.brand.accent,
  },
  exportText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.brand.accentLight,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  promoIcon: {
    fontSize: 18,
  },
  promoTitle: {
    fontSize: theme.typography.fontSize.callout,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.dock.activeText,
  },
  promoSubtitle: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.secondary,
  },
  promoAction: {
    backgroundColor: theme.colors.brand.accent,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.pill,
  },
  promoActionText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.bold,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.card,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  metricLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.callout,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  infoIcon: {
    fontSize: 14,
    color: theme.colors.text.muted,
  },
  metricValue: {
    fontSize: theme.typography.fontSize.title,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  metricSubtitle: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xxs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.subtitle,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  sectionLink: {
    fontSize: theme.typography.fontSize.callout,
    color: theme.colors.brand.accent,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  trendsCard: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.card,
  },
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  trendsTitle: {
    fontSize: theme.typography.fontSize.subtitle,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.tabTrack,
    borderRadius: theme.radii.pill,
    padding: 3,
  },
  segmentPill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.radii.pill,
  },
  segmentPillActive: {
    backgroundColor: theme.colors.surface.tabPill,
    ...theme.shadows.card,
  },
  segmentText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.secondary,
  },
  segmentTextActive: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  dateSliderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sliderArrow: {
    fontSize: 16,
    color: theme.colors.brand.accent,
  },
  dateSliderText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.muted,
  },
  chartPlaceholder: {
    height: 80,
    justifyContent: 'flex-end',
  },
  chartBaseline: {
    height: 1,
    backgroundColor: theme.colors.surface.divider,
    marginBottom: theme.spacing.xs,
  },
  chartDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartDateText: {
    fontSize: 10,
    color: theme.colors.text.muted,
  },
  emptyStateCard: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.card,
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.subtitle,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtitle: {
    fontSize: theme.typography.fontSize.callout,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
  floatingDock: {
    position: 'absolute',
    bottom: theme.spacing.dockMarginBottom,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    height: theme.spacing.dockHeight,
    backgroundColor: theme.colors.dock.background,
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.sm,
    ...theme.shadows.dock,
  },
  dockTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
  },
  dockTabActive: {
    backgroundColor: theme.colors.dock.activePill,
  },
  dockIcon: {
    fontSize: 18,
    color: theme.colors.dock.inactiveText,
  },
  dockIconActive: {
    color: theme.colors.dock.activeText,
  },
  dockLabel: {
    fontSize: 11,
    color: theme.colors.dock.inactiveText,
    marginTop: 2,
  },
  dockLabelActive: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.dock.activeText,
  },
});
