import { Colors, Fonts } from '@/constants/theme';

describe('Colors', () => {
  it('exposes both light and dark palettes', () => {
    expect(Colors.light).toBeDefined();
    expect(Colors.dark).toBeDefined();
  });

  it('defines the same set of color keys for light and dark', () => {
    expect(Object.keys(Colors.light).sort()).toEqual(Object.keys(Colors.dark).sort());
  });

  it('uses the light tint color for the light selected tab and text tint', () => {
    expect(Colors.light.tint).toBe('#0a7ea4');
    expect(Colors.light.tabIconSelected).toBe(Colors.light.tint);
  });

  it('uses white as the dark tint color', () => {
    expect(Colors.dark.tint).toBe('#fff');
    expect(Colors.dark.tabIconSelected).toBe(Colors.dark.tint);
  });

  it('defines every color as a hex string', () => {
    const values = [...Object.values(Colors.light), ...Object.values(Colors.dark)];
    values.forEach((value) => {
      expect(typeof value).toBe('string');
      expect(value).toMatch(/^#[0-9a-fA-F]{3,6}$/);
    });
  });
});

describe('Fonts', () => {
  it('resolves a platform font map with the expected variants', () => {
    expect(Fonts).toBeDefined();
    expect(Fonts).toHaveProperty('sans');
    expect(Fonts).toHaveProperty('serif');
    expect(Fonts).toHaveProperty('rounded');
    expect(Fonts).toHaveProperty('mono');
  });
});
