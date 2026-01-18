import type { KBArticle } from '../types/article';

const STORAGE_KEY = 'kb-article-draft';

/**
 * 下書きをlocalStorageに保存
 */
export const saveDraft = (article: KBArticle): void => {
  try {
    const json = JSON.stringify(article);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
};

/**
 * localStorageから下書きを取得
 */
export const loadDraft = (): KBArticle | null => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json) as KBArticle;
    }
    return null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
};

/**
 * 下書きをクリア
 */
export const clearDraft = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
};

/**
 * 下書きが存在するかチェック
 */
export const hasDraft = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check draft:', error);
    return false;
  }
};
