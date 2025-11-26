/**
 * Framer Motion アニメーション設定
 * すべてのコンポーネントで再利用可能なアニメーションVariants
 */

import { Variants } from 'framer-motion';
import { designTokens } from './design-tokens';

/**
 * フェードイン
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: designTokens.animations.duration.normal / 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * スライドアップ
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: designTokens.animations.duration.normal / 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * スライドイン（右から）
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: designTokens.animations.duration.slow / 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: designTokens.animations.duration.normal / 1000,
    },
  },
};

/**
 * スケール（拡大）
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: designTokens.animations.duration.normal / 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * スタッガー（順次表示）用のコンテナ
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/**
 * スタッガー用のアイテム
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: designTokens.animations.duration.normal / 1000,
    },
  },
};

/**
 * モーダル/ダイアログ
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: designTokens.animations.duration.slow / 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: designTokens.animations.duration.normal / 1000,
    },
  },
};

/**
 * サイドパネル（右から）
 */
export const sidePanelVariants: Variants = {
  hidden: {
    opacity: 0,
    x: '100%',
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: designTokens.animations.duration.slow / 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: designTokens.animations.duration.normal / 1000,
    },
  },
};

/**
 * 背景オーバーレイ
 */
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: designTokens.animations.duration.normal / 1000,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: designTokens.animations.duration.fast / 1000,
    },
  },
};

/**
 * ホバーアニメーション（カード）
 */
export const cardHover = {
  rest: {
    y: 0,
    scale: 1,
    transition: {
      duration: designTokens.animations.duration.normal / 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      duration: designTokens.animations.duration.normal / 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * パルスアニメーション
 */
export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * 数値カウントアップのトランジション設定
 */
export const countUpTransition = {
  duration: 0.8,
  ease: [0.4, 0, 0.2, 1],
};
