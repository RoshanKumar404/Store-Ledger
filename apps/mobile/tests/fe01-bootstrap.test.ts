import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { colors, typography, spacing } from '../src/theme/tokens';
import { useSessionStore } from '../src/store/session.store';
import { initI18n } from '../src/i18n/i18n';
import { checkServerHealth } from '../src/api/health.api';
import {
  getHeaderStyles,
  getCloudIconProps,
  getMetricCardStyles,
  formatMetricAmount,
  getSegmentedControlStyles,
  getFloatingDockStyles,
  getStatusChipStyles,
  DOCK_TABS,
} from '../src/components/index';
import { PROTOCOL_VERSION } from '@kirana/shared';
import { buildApp } from '../../server/src/app.js';

describe('FE-01: Mobile App Bootstrap & Design System Tests', () => {
  // 1. Theme Tokens & Design System Integrity
  describe('Theme Tokens & Screen Design Specifications', () => {
    it('should declare correct primary brand and accent colors', () => {
      // Core Kirana Spec Colors
      assert.equal(colors.brand.primary, '#1F7A4D');
      assert.equal(colors.brand.primaryDark, '#14532D');
      assert.equal(colors.brand.amber, '#E8A317');
      assert.equal(colors.brand.amberDark, '#7A4B00');

      // Screenshot UI Inspired Ocean Teal & Dock Accent Colors
      assert.equal(colors.brand.accent, '#00838F');
      assert.equal(colors.brand.accentLight, '#E0F7FA');
      assert.equal(colors.dock.background, '#00838F');
      assert.equal(colors.dock.activePill, '#E0F7FA');
    });

    it('should define DM Sans typography scale', () => {
      assert.ok(typography.fontFamily.regular.includes('DMSans'));
      assert.ok(typography.fontFamily.bold.includes('DMSans'));
      assert.equal(typography.fontSize.hero, 32);
      assert.equal(typography.fontSize.title, 22);
      assert.equal(typography.fontSize.body, 15);
    });

    it('should define spacing grid and floating dock dimensions', () => {
      assert.equal(spacing.xs, 4);
      assert.equal(spacing.sm, 8);
      assert.equal(spacing.md, 12);
      assert.equal(spacing.lg, 16);
      assert.equal(spacing.dockHeight, 64);
    });
  });

  // 2. Component Style Generators & UI Elements
  describe('Component Style Models (Inspired by Screenshots)', () => {
    it('should generate header styles with wave accent background and profile button', () => {
      const headerStyles = getHeaderStyles();
      assert.equal(headerStyles.container.backgroundColor, '#00838F');
      assert.equal(headerStyles.profileButton.width, 40);

      const savedIcon = getCloudIconProps('ALL_SAVED');
      assert.equal(savedIcon.icon, 'cloud-done');

      const syncingIcon = getCloudIconProps('SYNCING');
      assert.equal(syncingIcon.icon, 'cloud-sync');
    });

    it('should generate metric card styles and format Indian Rupee currency correctly', () => {
      const salesCard = getMetricCardStyles('sales');
      assert.equal(salesCard.amountText.color, colors.financial.sales);

      const formatted = formatMetricAmount(252500); // 2525 rupees = 252500 paise
      assert.equal(formatted, '₹2,525.00');
    });

    it('should generate segmented control pill slider styles for Add/Edit and Sale/Expense', () => {
      const styles = getSegmentedControlStyles();
      const activePill = styles.pill(true);
      const inactivePill = styles.pill(false);

      assert.equal(activePill.backgroundColor, colors.surface.tabPill);
      assert.equal(inactivePill.backgroundColor, 'transparent');
    });

    it('should generate floating dock navigation bar with 4 tabs and aqua active indicator', () => {
      assert.equal(DOCK_TABS.length, 4);
      assert.deepEqual(
        DOCK_TABS.map((t) => t.id),
        ['ADD', 'SALES', 'STOCK', 'REPORT'],
      );

      const dockStyles = getFloatingDockStyles();
      assert.equal(dockStyles.dockContainer.backgroundColor, colors.dock.background);

      const activeTab = dockStyles.tabButton(true);
      assert.equal(activeTab.backgroundColor, colors.dock.activePill);
    });

    it('should generate status chips with in-stock and out-of-stock color variants', () => {
      const inStock = getStatusChipStyles(false, 'inStock');
      assert.equal(inStock.container.borderColor, colors.status.inStock);

      const outOfStock = getStatusChipStyles(true, 'outOfStock');
      assert.equal(outOfStock.container.backgroundColor, colors.status.outOfStock);
    });
  });

  // 3. Zustand Session Store
  describe('Zustand Session Store (§FE-01)', () => {
    it('should initialize with default state and offline/online handling', () => {
      const store = useSessionStore.getState();
      assert.equal(typeof store.serverUrl, 'string');
      assert.equal(store.isAuthenticated, false);
      assert.equal(store.user, null);

      store.setOnlineStatus(false);
      assert.equal(useSessionStore.getState().isOnline, false);
      assert.equal(useSessionStore.getState().syncStatus, 'OFFLINE');

      store.setOnlineStatus(true);
      assert.equal(useSessionStore.getState().isOnline, true);
    });

    it('should transition to authenticated state and clear on logout', () => {
      const store = useSessionStore.getState();

      store.setSession({
        accessToken: 'mock_jwt_access_token',
        refreshToken: 'mock_refresh_token_123',
        user: {
          id: '11111111-1111-4111-8111-111111111111',
          shopId: '22222222-2222-4222-8222-222222222222',
          email: 'shopkeeper@kirana.store',
          role: 'OWNER',
        },
        shop: {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Gupta Kirana Store',
        },
      });

      const loggedInState = useSessionStore.getState();
      assert.equal(loggedInState.isAuthenticated, true);
      assert.equal(loggedInState.user?.email, 'shopkeeper@kirana.store');
      assert.equal(loggedInState.shop?.name, 'Gupta Kirana Store');

      // Logout
      store.clearSession();
      const loggedOutState = useSessionStore.getState();
      assert.equal(loggedOutState.isAuthenticated, false);
      assert.equal(loggedOutState.accessToken, null);
      assert.equal(loggedOutState.user, null);
    });
  });

  // 4. i18n Localization Skeleton
  describe('i18next Localization Skeleton (§FE-01, §FE-20)', () => {
    it('should initialize and support translations in en, hi, and kn', () => {
      const i18n = initI18n('en');
      assert.equal(i18n.t('appName'), 'Kirana Ledger');
      assert.equal(i18n.t('nav.sales'), 'Sales');

      i18n.changeLanguage('hi');
      assert.equal(i18n.t('appName'), 'किराना लेजर');
      assert.equal(i18n.t('nav.sales'), 'बिक्री');

      i18n.changeLanguage('kn');
      assert.equal(i18n.t('appName'), 'ಕಿರಾಣಿ ಲೆಡ್ಜರ್');
      assert.equal(i18n.t('nav.sales'), 'ಮಾರಾಟ');

      // Reset to en
      i18n.changeLanguage('en');
    });
  });

  // 5. Backend Health Connection Check (A call to /health works)
  describe('Backend /health Integration Check', () => {
    it('should successfully execute checkServerHealth against running Fastify server instance', async () => {
      // Start an ephemeral Fastify server instance from BE-01
      const serverApp = buildApp({
        logger: false,
        envConfig: {
          NODE_ENV: 'test',
          PORT: 3099,
          HOST: '127.0.0.1',
          JWT_SECRET: 'test_jwt_secret_must_be_at_least_32_characters_long!',
          JWT_REFRESH_SECRET: 'test_jwt_refresh_secret_at_least_32_chars_long!',
          MAX_PAYLOAD_BYTES: 1024 * 1024,
          REQUEST_TIMEOUT_MS: 5000,
          CONNECTION_TIMEOUT_MS: 5000,
          KEEP_ALIVE_TIMEOUT_MS: 5000,
        },
      });

      const serverAddress = await serverApp.listen({ port: 0, host: '127.0.0.1' });

      try {
        const result = await checkServerHealth(serverAddress);

        assert.equal(
          result.ok,
          true,
          `Expected health check to succeed, got error: ${result.error}`,
        );
        assert.ok(result.latencyMs >= 0);
        assert.equal(result.data?.status, 'ok');
        assert.equal(result.data?.version, PROTOCOL_VERSION);
        assert.equal(result.isVersionCompatible, true);
      } finally {
        await serverApp.close();
      }
    });

    it('should gracefully handle connection failure when server is unreachable', async () => {
      const unreachableUrl = 'http://127.0.0.1:59999';
      const result = await checkServerHealth(unreachableUrl, 1000);

      assert.equal(result.ok, false);
      assert.equal(result.isVersionCompatible, false);
      assert.ok(result.error !== undefined);
    });
  });
});
