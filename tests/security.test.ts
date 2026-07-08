import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, validateAndSanitizeNodeId } from '../lib/security';

// ---------------------------------------------------------------------------
// We mock lib/data so the security module only sees a controlled set of NODES
// without depending on the full 30-node data set for node ID validation.
// ---------------------------------------------------------------------------
vi.mock('../lib/data', () => ({
  NODES: {
    gate_a: { id: 'gate_a', type: 'gate', name: { en: 'Gate A' } },
    gate_b: { id: 'gate_b', type: 'gate', name: { en: 'Gate B' } },
    sec_101: { id: 'sec_101', type: 'section', name: { en: 'Section 101' } },
    elevator_west: { id: 'elevator_west', type: 'elevator', name: { en: 'Elevator West' } },
  },
}));

// ---------------------------------------------------------------------------
// checkRateLimit
// ---------------------------------------------------------------------------
describe('checkRateLimit', () => {
  // We need fresh state for every test because checkRateLimit uses module-level state.
  // Re-importing between tests isn't easily possible in Vitest; instead we use
  // different IPs per test to ensure isolation.

  it('allows the first request from a new IP', () => {
    expect(checkRateLimit('10.0.0.1')).toBe(true);
  });

  it('allows up to 10 requests within the window', () => {
    const ip = '10.0.0.2';
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }
  });

  it('blocks the 11th request within the window', () => {
    const ip = '10.0.0.3';
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip)).toBe(false);
  });

  it('isolates rate limits per IP — one saturated IP does not affect another', () => {
    const saturatedIp = '10.0.0.4';
    const freshIp = '10.0.0.5';

    for (let i = 0; i < 10; i++) checkRateLimit(saturatedIp);
    expect(checkRateLimit(saturatedIp)).toBe(false);

    // Fresh IP should still be allowed
    expect(checkRateLimit(freshIp)).toBe(true);
  });

  it('treats different IP strings as distinct clients', () => {
    const ipA = '192.168.1.1';
    const ipB = '192.168.1.2';

    for (let i = 0; i < 10; i++) checkRateLimit(ipA);
    // ipA is saturated; ipB should still pass
    expect(checkRateLimit(ipB)).toBe(true);
  });

  it('handles the fallback IP "127.0.0.1" without throwing', () => {
    expect(() => checkRateLimit('127.0.0.1')).not.toThrow();
  });

  it('handles a very long (spoofed) IP string gracefully', () => {
    const longIp = 'x'.repeat(10_000);
    expect(() => checkRateLimit(longIp)).not.toThrow();
    expect(typeof checkRateLimit(longIp)).toBe('boolean');
  });
});

// ---------------------------------------------------------------------------
// validateAndSanitizeNodeId
// ---------------------------------------------------------------------------
describe('validateAndSanitizeNodeId', () => {
  it('returns the node ID for a valid node', () => {
    expect(validateAndSanitizeNodeId('gate_a')).toBe('gate_a');
  });

  it('trims leading/trailing whitespace before validating', () => {
    expect(validateAndSanitizeNodeId('  gate_a  ')).toBe('gate_a');
  });

  it('returns null for an unknown node ID', () => {
    expect(validateAndSanitizeNodeId('nonexistent_node')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(validateAndSanitizeNodeId('')).toBeNull();
  });

  it('returns null when given a number', () => {
    expect(validateAndSanitizeNodeId(42)).toBeNull();
  });

  it('returns null when given null', () => {
    expect(validateAndSanitizeNodeId(null)).toBeNull();
  });

  it('returns null when given undefined', () => {
    expect(validateAndSanitizeNodeId(undefined)).toBeNull();
  });

  it('returns null when given an object', () => {
    expect(validateAndSanitizeNodeId({ id: 'gate_a' })).toBeNull();
  });

  it('returns null when given an array', () => {
    expect(validateAndSanitizeNodeId(['gate_a'])).toBeNull();
  });

  it('returns null for a prototype pollution attempt (__proto__)', () => {
    expect(validateAndSanitizeNodeId('__proto__')).toBeNull();
  });

  it('returns null for a constructor injection attempt', () => {
    expect(validateAndSanitizeNodeId('constructor')).toBeNull();
  });

  it('returns null for path-traversal-style strings', () => {
    expect(validateAndSanitizeNodeId('../lib/data')).toBeNull();
  });

  it('returns null for a string with SQL injection characters', () => {
    expect(validateAndSanitizeNodeId("gate_a' OR '1'='1")).toBeNull();
  });

  it('returns the correct value for every valid node in the mocked NODES', () => {
    const validIds = ['gate_a', 'gate_b', 'sec_101', 'elevator_west'];
    for (const id of validIds) {
      expect(validateAndSanitizeNodeId(id)).toBe(id);
    }
  });

  it('is case-sensitive and rejects differently-cased valid IDs', () => {
    expect(validateAndSanitizeNodeId('Gate_A')).toBeNull();
    expect(validateAndSanitizeNodeId('GATE_A')).toBeNull();
  });
});
