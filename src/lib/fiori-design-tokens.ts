/**
 * SAP Fiori Design Tokens for React
 * Based on SAP Fiori Design Guidelines and Horizon Theme
 * https://experience.sap.com/fiori-design/
 */

export const fioriDesignTokens = {
  colors: {
    // SAP Brand Colors (Horizon Theme)
    sapBrand: {
      primary: '#0070F2',      // SAP Blue (Horizon)
      primaryDark: '#0854A0',  // SAP Blue (Classic)
      primaryLight: '#5899DA',
      secondary: '#74B3CE',
      accent: '#427CAC',
    },

    // Semantic Colors (SAP Fiori Standard)
    semantic: {
      negative: '#BB0000',     // Error/Critical
      critical: '#E76500',     // Warning
      positive: '#2B7D2B',     // Success
      neutral: '#5B738B',      // Information
      information: '#0070F2',  // Info Blue
    },

    // Object Status Colors
    objectStatus: {
      error: '#BB0000',
      warning: '#E76500',
      success: '#2B7D2B',
      information: '#0070F2',
      none: '#6A6D70',
    },

    // Background Colors (Fiori Shell)
    shell: {
      background: '#EDEFF0',        // Shell Background
      headerBackground: '#354A5F',  // Shell Header
      toolbarBackground: '#FAFAFA',
    },

    // Content Colors
    content: {
      background: '#FFFFFF',
      backgroundShade: '#F7F7F7',
      backgroundDark: '#EDEFF0',
      foreground: '#32363A',
      foregroundLight: '#6A6D70',
      foregroundDark: '#000000',
    },

    // Interactive States
    interactive: {
      default: '#0070F2',
      hover: '#0854A0',
      pressed: '#053B70',
      selected: '#0070F2',
      focus: '#0070F2',
    },

    // Chart Colors (SAP Chart Palette)
    chart: {
      qualitative: [
        '#5899DA', // Blue
        '#E8743B', // Orange
        '#19A979', // Green
        '#ED4A7B', // Pink
        '#945ECF', // Purple
        '#13A4B4', // Teal
        '#525DF4', // Indigo
        '#BF399E', // Magenta
        '#6C8893', // Grey Blue
        '#EE6868', // Red
        '#2F6497', // Dark Blue
      ],
      sequential: {
        blue: ['#EBF5FF', '#C8E4FF', '#91C8F6', '#5899DA', '#2E6DA4'],
        green: ['#F1FAF5', '#C2E8D3', '#7FD9A7', '#19A979', '#0D7D56'],
        orange: ['#FFF0E6', '#FFD4B3', '#FFA866', '#E8743B', '#B85A1F'],
      },
    },

    // Border Colors
    border: {
      default: '#D9D9D9',
      strong: '#89919A',
      subtle: '#E5E5E5',
      focus: '#0070F2',
    },

    // Dark Mode (Optional - SAP Fiori Evening Horizon)
    darkMode: {
      background: '#1D2D3E',
      backgroundShade: '#283848',
      foreground: '#FAFAFA',
      foregroundLight: '#C0C0C0',
      shellHeader: '#0F1C2E',
    },
  },

  // Typography (SAP Font - 72)
  typography: {
    fontFamily: {
      primary: '"72", "72full", Arial, Helvetica, sans-serif',
      monospace: '"72 Monospace", "Courier New", monospace',
    },
    fontSize: {
      tiny: '0.625rem',     // 10px - Labels
      small: '0.75rem',     // 12px - Helper text
      medium: '0.875rem',   // 14px - Body
      large: '1rem',        // 16px - Default body
      xlarge: '1.125rem',   // 18px - Subtitle
      xxlarge: '1.5rem',    // 24px - Title
      xxxlarge: '2rem',     // 32px - Display
      display: '2.5rem',    // 40px - Hero
    },
    fontWeight: {
      normal: 400,
      bold: 700,
      semibold: 600,
      light: 300,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },

  // Spacing (SAP Grid - 1rem = 16px base)
  spacing: {
    tiny: '0.25rem',      // 4px
    small: '0.5rem',      // 8px
    medium: '1rem',       // 16px
    large: '2rem',        // 32px
    xlarge: '3rem',       // 48px
    xxlarge: '4rem',      // 64px
  },

  // Component Sizes
  sizes: {
    button: {
      cozy: {
        height: '2.75rem',  // 44px
        padding: '0.625rem 1rem',
      },
      compact: {
        height: '2rem',     // 32px
        padding: '0.25rem 0.5rem',
      },
    },
    input: {
      cozy: {
        height: '2.75rem',
      },
      compact: {
        height: '2rem',
      },
    },
  },

  // Border Radius
  borderRadius: {
    none: '0',
    small: '0.25rem',   // 4px
    medium: '0.5rem',   // 8px
    large: '0.75rem',   // 12px
  },

  // Shadows (SAP Elevation)
  shadows: {
    level0: 'none',
    level1: '0 0 0 1px rgba(0,0,0,0.1), 0 2px 6px 0 rgba(0,0,0,0.05)',
    level2: '0 0 0 1px rgba(0,0,0,0.1), 0 6px 20px 0 rgba(0,0,0,0.08)',
    level3: '0 0 0 1px rgba(0,0,0,0.1), 0 12px 40px 0 rgba(0,0,0,0.12)',
  },

  // Animations
  animations: {
    duration: {
      fast: '0.1s',
      medium: '0.2s',
      slow: '0.3s',
    },
    easing: {
      standard: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },

  // Z-Index Layers
  zIndex: {
    default: 0,
    dropdown: 10,
    popover: 20,
    dialog: 30,
    messageToast: 40,
    shellHeader: 50,
  },

  // Content Density
  contentDensity: {
    cozy: {
      fontSize: '1rem',
      lineHeight: '1.4',
      spacing: '1rem',
    },
    compact: {
      fontSize: '0.875rem',
      lineHeight: '1.2',
      spacing: '0.5rem',
    },
  },
} as const;

export type FioriDesignTokens = typeof fioriDesignTokens;

// Helper function to get semantic color
export const getSemanticColor = (state: 'error' | 'warning' | 'success' | 'information' | 'none') => {
  return fioriDesignTokens.colors.objectStatus[state];
};

// Helper function to get chart color by index
export const getChartColor = (index: number) => {
  const colors = fioriDesignTokens.colors.chart.qualitative;
  return colors[index % colors.length];
};
