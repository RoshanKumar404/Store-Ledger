import { PROTOCOL_VERSION } from '@kirana/shared';
import { useSessionStore } from '../store/session.store';

export interface HealthResponse {
  status: 'ok';
  timestamp: number;
  uptime: number;
  version: number;
}

export interface HealthCheckResult {
  ok: boolean;
  latencyMs: number;
  data?: HealthResponse;
  error?: string;
  isVersionCompatible: boolean;
}

/**
 * Pings backend /health endpoint to verify network availability and protocol compatibility.
 * Consumed by app bootstrap (§FE-01) and Sync Health diagnostics (§FE-19).
 */
export async function checkServerHealth(
  overrideUrl?: string,
  timeoutMs = 5000,
): Promise<HealthCheckResult> {
  const baseUrl = overrideUrl || useSessionStore.getState().serverUrl;
  const targetUrl = `${baseUrl.replace(/\/+$/, '')}/health`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startTime = Date.now();

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    const latencyMs = Date.now() - startTime;
    clearTimeout(timer);

    if (!response.ok) {
      return {
        ok: false,
        latencyMs,
        isVersionCompatible: false,
        error: `Server returned HTTP ${response.status} ${response.statusText}`,
      };
    }

    const data = (await response.json()) as HealthResponse;
    const isVersionCompatible = data.version === PROTOCOL_VERSION;

    return {
      ok: true,
      latencyMs,
      data,
      isVersionCompatible,
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const latencyMs = Date.now() - startTime;
    const message = err instanceof Error ? err.message : 'Unknown network failure';

    return {
      ok: false,
      latencyMs,
      isVersionCompatible: false,
      error: message,
    };
  }
}
