import { TextStyle } from 'react-native';

export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textSecondary: string;
    border: string;
    divider: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    info: string;
    featureBg: string;
    linkBg: string;
    shadow: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    title: number;
  };
  typography: {
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    body1: TextStyle;
    body2: TextStyle;
    button: TextStyle;
    caption: TextStyle;
  };
}

const common = {
  radius: { sm: 4, md: 8, lg: 12, xl: 16, round: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  fontSize: { xs: 11, sm: 13, md: 14, lg: 16, xl: 18, xxl: 22, title: 26 },
  typography: {
    h1: { fontSize: 26, fontWeight: '700', lineHeight: 32 } as TextStyle,
    h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 } as TextStyle,
    h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 } as TextStyle,
    body1: { fontSize: 14, fontWeight: '400', lineHeight: 20 } as TextStyle,
    body2: { fontSize: 13, fontWeight: '400', lineHeight: 18 } as TextStyle,
    button: { fontSize: 14, fontWeight: '600', lineHeight: 18 } as TextStyle,
    caption: { fontSize: 11, fontWeight: '400', lineHeight: 14 } as TextStyle,
  },
};

export const lightTheme: Theme = {
  ...common,
  colors: {
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    primaryLight: '#4CAF50',
    secondary: '#00897B',
    accent: '#4CAF50',
    background: '#F5F7F4',
    surface: '#FFFFFF',
    surfaceAlt: '#FAFBFA',
    text: '#1B1B1B',
    textSecondary: '#6B6B6B',
    border: '#E0E0E0',
    divider: '#EEEEEE',
    success: '#2E7D32',
    successLight: '#E8F5E9',
    warning: '#F57C00',
    warningLight: '#FFF3E0',
    error: '#D32F2F',
    errorLight: '#FFEBEE',
    info: '#1976D2',
    featureBg: '#E8F5E9',
    linkBg: '#E3F2FD',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
};

export const darkTheme: Theme = {
  ...common,
  colors: {
    primary: '#4CAF50',
    primaryDark: '#2E7D32',
    primaryLight: '#81C784',
    secondary: '#26A69A',
    accent: '#66BB6A',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceAlt: '#252525',
    text: '#F5F5F5',
    textSecondary: '#B0B0B0',
    border: '#333333',
    divider: '#2A2A2A',
    success: '#66BB6A',
    successLight: '#1B3A1F',
    warning: '#FFA726',
    warningLight: '#3A2A14',
    error: '#EF5350',
    errorLight: '#3A1A1A',
    info: '#42A5F5',
    featureBg: '#1B3A1F',
    linkBg: '#1A2A3A',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
};
