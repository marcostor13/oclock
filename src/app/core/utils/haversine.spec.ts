import { describe, expect, it } from 'vitest';
import { haversineMeters } from './haversine';

describe('haversineMeters', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineMeters(10.5, -66.9, 10.5, -66.9)).toBe(0);
  });

  it('returns ~111 km per degree of latitude', () => {
    const dist = haversineMeters(0, 0, 1, 0);
    expect(dist).toBeGreaterThan(110_000);
    expect(dist).toBeLessThan(112_000);
  });

  it('flags within 500 m radius', () => {
    // ~450 m north of origin
    const dist = haversineMeters(0, 0, 0.004, 0);
    expect(dist).toBeLessThan(500);
  });

  it('flags outside 500 m radius', () => {
    // ~1.1 km north of origin
    const dist = haversineMeters(0, 0, 0.01, 0);
    expect(dist).toBeGreaterThan(500);
  });
});
