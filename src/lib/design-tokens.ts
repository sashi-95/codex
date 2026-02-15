/**
 * デザイントークン - 完全版
 * Power BI を超えるビジュアルシステムの基盤
 */

export const designTokens = {
  colors: {
    // Background Layers
    background: {
      primary: '#0D0E12',
      secondary: '#14151C',
      tertiary: '#1A1B24',
    },

    // Glass Morphism
    glass: {
      card: 'rgba(255, 255, 255, 0.08)',
      cardHover: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.15)',
      borderHover: 'rgba(255, 255, 255, 0.25)',
    },

    // Accent Colors
    accent: {
      primary: '#4A96FF',
      secondary: '#00D1B2',
      tertiary: '#A78BFA',
    },

    // Semantic Colors
    status: {
      success: '#41E1A2',
      warning: '#FFB84D',
      error: '#FF5C5C',
      info: '#6EC5FF',
    },

    // Text
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.5)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },

    // Chart Colors
    chart: {
      line1: '#4A96FF',
      line2: '#00D1B2',
      line3: '#A78BFA',
      line4: '#FF6B9D',
      line5: '#FFB84D',
      area: 'rgba(74, 150, 255, 0.2)',
      grid: 'rgba(255, 255, 255, 0.1)',
    },
  },

  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      secondary: 'IBM Plex Sans, sans-serif',
      mono: 'Roboto Mono, monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  shadows: {
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    cardHover: '0 12px 48px 0 rgba(74, 150, 255, 0.15)',
    neumorphism: '8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.05)',
  },

  animations: {
    duration: {
      fast: 150,    // ms
      normal: 250,  // ms
      slow: 350,    // ms
      verySlow: 500, // ms
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.45, 0, 0.15, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  breakpoints: {
    sm: 640,   // Mobile
    md: 768,   // Tablet
    lg: 1024,  // Desktop
    xl: 1280,  // Large Desktop
    '2xl': 1536, // Extra Large
  },

  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    toast: 1400,
  },
} as const;

export type DesignTokens = typeof designTokens;

/**
 * トレーディング専用カラーパレット
 * Judas Swing Sniper / ICT Smart Money Concepts
 * designTokens との統合ブリッジ
 */
export const tradingColors = {
  // Primary Trading Colors
  green: '#00C805',       // Bullish / Success
  pink: '#FF6AC1',        // Bearish / Sell-side
  gold: '#D4AF37',        // Execution / Key levels
  cyan: '#00f2ff',        // Reversal signals
  blue: '#3b82f6',        // ES / Secondary line

  // Mapped from designTokens (semantic aliases)
  bullish: designTokens.colors.status.success,
  bearish: designTokens.colors.status.error,
  warning: designTokens.colors.status.warning,
  info: designTokens.colors.status.info,

  // Pattern Diagram (JudasPatternRef)
  long: '#00C805',                     // Long model expansion
  short: '#FF6AC1',                    // Short model expansion
  manipulation: '#666666',             // Fakeout / manipulation phase
  pdl: '#FF5C5C',                      // PDL reference line
  bsl: '#FF5C5C',                      // BSL reference line
  entryZoneFill: 'rgba(0,200,5,0.12)', // FVG zone fill (long)
  entryZoneStroke: 'rgba(0,200,5,0.4)',// FVG zone border
  entryZoneFillShort: 'rgba(255,106,193,0.12)',
  entryZoneStrokeShort: 'rgba(255,106,193,0.4)',
  grid: 'rgba(255,255,255,0.06)',      // Chart grid
  axis: '#555555',                     // Axis text
  tpLine: '#00C805',                   // Take profit
  slLine: '#FF5C5C',                   // Stop loss

  // Surface
  bgDeep: '#0a0c10',
  bgPanel: '#0E1116',
  bgHeader: '#151921',
} as const;

export type TradingColors = typeof tradingColors;
