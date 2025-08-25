// iOS 风格样式配置文件
// 提供统一的 iOS 设计规范和样式常量

import { StyleSheet } from 'react-native';

// 定义样式类型
interface ButtonStyles {
  primary: any;
  secondary: any;
  destructive: any;
}

interface TextStyles {
  title: any;
  heading: any;
  body: any;
  caption: any;
}

interface AvatarStyles {
  small: any;
  medium: any;
  large: any;
}

interface BadgeStyles {
  primary: any;
  secondary: any;
  success: any;
  warning: any;
  error: any;
}

// iOS 颜色系统
const iOSColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  surface: '#FFFFFF',
  background: '#F2F2F7',
  text: {
    primary: '#000000',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
  },
  border: {
    primary: '#C6C6C8',
    secondary: '#E5E5EA',
  },
};

// iOS 字体系统
const iOSFonts = {
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// iOS 间距系统
const iOSSpacing = {
  xs: 4,
  sm: 8,
  base: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// iOS 圆角系统
const iOSBorderRadius = {
  xs: 4,
  sm: 8,
  base: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// iOS 阴影系统
const iOSShadows = {
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// 创建样式表
export const iOSStyles = StyleSheet.create({
  // 容器样式
  container: {
    flex: 1,
    backgroundColor: iOSColors.background,
  },
  
  // 安全区域样式
  safeArea: {
    flex: 1,
    backgroundColor: iOSColors.background,
  },
  
  // 卡片样式
  card: {
    backgroundColor: iOSColors.surface,
    borderRadius: iOSBorderRadius.base,
    padding: iOSSpacing.base,
    marginBottom: iOSSpacing.base,
    ...iOSShadows.base,
  },
  
  // 按钮样式
  button: {
    primary: {
      backgroundColor: iOSColors.primary,
      borderRadius: iOSBorderRadius.base,
      paddingVertical: iOSSpacing.base,
      paddingHorizontal: iOSSpacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      backgroundColor: iOSColors.surface,
      borderWidth: 1,
      borderColor: iOSColors.border.primary,
      borderRadius: iOSBorderRadius.base,
      paddingVertical: iOSSpacing.base,
      paddingHorizontal: iOSSpacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    destructive: {
      backgroundColor: iOSColors.error,
      borderRadius: iOSBorderRadius.base,
      paddingVertical: iOSSpacing.base,
      paddingHorizontal: iOSSpacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  } as any,
  
  // 输入框样式
  input: {
    backgroundColor: iOSColors.surface,
    borderWidth: 1,
    borderColor: iOSColors.border.primary,
    borderRadius: iOSBorderRadius.base,
    paddingHorizontal: iOSSpacing.base,
    paddingVertical: iOSSpacing.sm,
    fontSize: iOSFonts.size.base,
    color: iOSColors.text.primary,
  },
  
  // 文本样式
  text: {
    title: {
      fontSize: iOSFonts.size['3xl'],
      fontWeight: iOSFonts.weight.bold,
      color: iOSColors.text.primary,
      lineHeight: iOSFonts.size['3xl'] * iOSFonts.lineHeight.tight,
    },
    heading: {
      fontSize: iOSFonts.size.xl,
      fontWeight: iOSFonts.weight.semibold,
      color: iOSColors.text.primary,
      lineHeight: iOSFonts.size.xl * iOSFonts.lineHeight.normal,
    },
    body: {
      fontSize: iOSFonts.size.base,
      fontWeight: iOSFonts.weight.normal,
      color: iOSColors.text.primary,
      lineHeight: iOSFonts.size.base * iOSFonts.lineHeight.normal,
    },
    caption: {
      fontSize: iOSFonts.size.sm,
      fontWeight: iOSFonts.weight.normal,
      color: iOSColors.text.secondary,
      lineHeight: iOSFonts.size.sm * iOSFonts.lineHeight.normal,
    },
  } as any,
  
  // 列表项样式
  listItem: {
    backgroundColor: iOSColors.surface,
    paddingVertical: iOSSpacing.base,
    paddingHorizontal: iOSSpacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: iOSColors.border.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // 头像样式
  avatar: {
    small: {
      width: 32,
      height: 32,
      borderRadius: iOSBorderRadius.full,
    },
    medium: {
      width: 40,
      height: 40,
      borderRadius: iOSBorderRadius.full,
    },
    large: {
      width: 50,
      height: 50,
      borderRadius: iOSBorderRadius.full,
    },
  } as any,
  
  // 徽章样式
  badge: {
    primary: {
      backgroundColor: iOSColors.primary,
      borderRadius: iOSBorderRadius.full,
      paddingHorizontal: iOSSpacing.sm,
      paddingVertical: iOSSpacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      backgroundColor: iOSColors.secondary,
      borderRadius: iOSBorderRadius.full,
      paddingHorizontal: iOSSpacing.sm,
      paddingVertical: iOSSpacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
    success: {
      backgroundColor: iOSColors.success,
      borderRadius: iOSBorderRadius.full,
      paddingHorizontal: iOSSpacing.sm,
      paddingVertical: iOSSpacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
    warning: {
      backgroundColor: iOSColors.warning,
      borderRadius: iOSBorderRadius.full,
      paddingHorizontal: iOSSpacing.sm,
      paddingVertical: iOSSpacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
    error: {
      backgroundColor: iOSColors.error,
      borderRadius: iOSBorderRadius.full,
      paddingHorizontal: iOSSpacing.sm,
      paddingVertical: iOSSpacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
  } as any,
  
  // 间距工具类
  spacing: {
    xs: { marginBottom: iOSSpacing.xs },
    sm: { marginBottom: iOSSpacing.sm },
    base: { marginBottom: iOSSpacing.base },
    md: { marginBottom: iOSSpacing.md },
    lg: { marginBottom: iOSSpacing.lg },
    xl: { marginBottom: iOSSpacing.xl },
    '2xl': { marginBottom: iOSSpacing['2xl'] },
    '3xl': { marginBottom: iOSSpacing['3xl'] },
  } as any,
  
  // 文本对齐工具类
  textAlign: {
    left: { textAlign: 'left' as const },
    center: { textAlign: 'center' as const },
    right: { textAlign: 'right' as const },
  } as any,
  
  // 弹性布局工具类
  flex: {
    row: { flexDirection: 'row' as const },
    column: { flexDirection: 'column' as const },
    center: { alignItems: 'center', justifyContent: 'center' },
    start: { alignItems: 'flex-start' },
    end: { alignItems: 'flex-end' },
    between: { justifyContent: 'space-between' },
    around: { justifyContent: 'space-around' },
  } as any,
});

// 导出颜色和字体系统供其他地方使用
export { iOSColors, iOSFonts, iOSSpacing, iOSBorderRadius, iOSShadows };
