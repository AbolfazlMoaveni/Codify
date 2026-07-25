import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { FONT_FAMILY, shadow } from '@/constants/ui';

type PrimaryButtonProps = {
  label: string;
  color: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconSize?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Full-width call-to-action button with an optional leading icon.
 * Extracted from the repeated upload/download button markup + styles.
 */
export function PrimaryButton({
  label,
  color,
  onPress,
  icon,
  iconSize = 20,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: color },
        shadow({ color, offsetY: 4, opacity: 0.25, radius: 8, elevation: 4 }),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && (
        <Ionicons name={icon} size={iconSize} color="#fff" style={styles.icon} />
      )}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  disabled: { opacity: 0.6 },
  icon: { marginLeft: 8 },
  label: { color: '#fff', fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: 'bold' },
});
