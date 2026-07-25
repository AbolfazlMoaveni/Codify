/**
 * Shared UI primitives for the app's custom screens.
 *
 * These centralize values that were previously duplicated across screens:
 * the app font, the platform monospace font, and the elevation/shadow blocks.
 */

import { Platform, type ViewStyle } from 'react-native';

/** Primary font bundled with the app (see assets/fonts/Vazir.ttf). */
export const FONT_FAMILY = 'Vazir';

/** Platform-appropriate monospace font for code blocks. */
export const MONOSPACE_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';

type ShadowOptions = {
  color?: string;
  offsetY?: number;
  opacity: number;
  radius: number;
  elevation: number;
};

/**
 * Builds a cross-platform elevation/shadow style. Replaces the repeated
 * `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius`/`elevation`
 * blocks that were copied across the screens.
 */
export function shadow({
  color = '#000',
  offsetY = 2,
  opacity,
  radius,
  elevation,
}: ShadowOptions): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}
