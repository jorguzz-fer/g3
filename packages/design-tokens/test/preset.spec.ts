import { describe, expect, it } from 'vitest';
import { colors, g3Preset } from '../src/index';

describe('g3Preset', () => {
  it('mapeia as cores da marca no tema Tailwind', () => {
    expect(g3Preset.theme.extend.colors.navy[700]).toBe(colors.navy[700]);
    expect(g3Preset.theme.extend.colors.gold[500]).toBe(colors.gold[500]);
  });

  it('expõe as famílias tipográficas como arrays', () => {
    expect(Array.isArray(g3Preset.theme.extend.fontFamily.serif)).toBe(true);
    expect(g3Preset.theme.extend.fontFamily.sans.length).toBeGreaterThan(1);
  });
});
