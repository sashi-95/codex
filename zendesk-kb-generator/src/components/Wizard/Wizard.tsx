import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { KBArticle } from '../../types/article';
import { createEmptyKBArticle } from '../../types/article';
import { Button } from '../Common';
import { saveDraft, loadDraft, hasDraft, clearDraft } from '../../utils/localStorage';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Summary } from './Step2Summary';
import { Step3Processes } from './Step3Processes';
import { Step4FAQs } from './Step4FAQs';
import { Step5Resources } from './Step5Resources';
import { Step6Preview } from './Step6Preview';

const TOTAL_STEPS = 6;

/**
 * メインウィザードコンポーネント
 * 6ステップのナビゲーションと状態管理を担当
 */
export const Wizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [article, setArticle] = useState<KBArticle>(createEmptyKBArticle());
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // コンポーネントマウント時に下書きをチェック
  useEffect(() => {
    if (hasDraft()) {
      setShowDraftDialog(true);
    }
  }, []);

  // 記事が更新されたら下書きを自動保存
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(article);
    }, 1000); // 1秒のデバウンス

    return () => clearTimeout(timer);
  }, [article]);

  /**
   * 下書きを読み込む
   */
  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setArticle(draft);
    }
    setShowDraftDialog(false);
  };

  /**
   * 下書きを破棄して新規作成
   */
  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
  };

  /**
   * 次のステップへ
   */
  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * 前のステップへ
   */
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * 記事をリセット
   */
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setArticle(createEmptyKBArticle());
      setCurrentStep(1);
      clearDraft();
    }
  };

  /**
   * 現在のステップコンポーネントを取得
   */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo article={article} onUpdate={setArticle} />;
      case 2:
        return <Step2Summary article={article} onUpdate={setArticle} />;
      case 3:
        return (
          <DndProvider backend={HTML5Backend}>
            <Step3Processes article={article} onUpdate={setArticle} />
          </DndProvider>
        );
      case 4:
        return (
          <DndProvider backend={HTML5Backend}>
            <Step4FAQs article={article} onUpdate={setArticle} />
          </DndProvider>
        );
      case 5:
        return <Step5Resources article={article} onUpdate={setArticle} />;
      case 6:
        return <Step6Preview article={article} />;
      default:
        return null;
    }
  };

  return (
    <div className="container-prada min-h-screen py-8">
      {/* 下書き読み込みダイアログ */}
      {showDraftDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-prada-black p-8 max-w-md">
            <h2 className="prada-subheader mb-4">Draft Found</h2>
            <p className="text-prada mb-6">
              We found a saved draft. Would you like to continue where you left off?
            </p>
            <div className="flex gap-4">
              <Button onClick={handleLoadDraft} variant="primary">
                Load Draft
              </Button>
              <Button onClick={handleDiscardDraft}>
                Start Fresh
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="prada-header">Zendesk Knowledge Base Article Generator</h1>
        <p className="text-prada mb-4">
          Create professional, multilingual Knowledge Base articles with PRADAスタイル design.
        </p>

        {/* ステップインジケーター */}
        <div className="flex items-center gap-2 mb-4">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 ${
                step <= currentStep ? 'bg-prada-black' : 'bg-prada-border'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs uppercase tracking-prada-header">
          <span className={currentStep === 1 ? 'font-bold' : ''}>1. Basic Info</span>
          <span className={currentStep === 2 ? 'font-bold' : ''}>2. Summary</span>
          <span className={currentStep === 3 ? 'font-bold' : ''}>3. Processes</span>
          <span className={currentStep === 4 ? 'font-bold' : ''}>4. FAQ</span>
          <span className={currentStep === 5 ? 'font-bold' : ''}>5. Resources</span>
          <span className={currentStep === 6 ? 'font-bold' : ''}>6. Export</span>
        </div>
      </div>

      {/* ステップコンテンツ */}
      <div className="bg-white border border-prada-border mb-8">
        {renderStep()}

        {/* ナビゲーション */}
        <div className="wizard-navigation px-prada-padding pb-prada-padding">
          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button onClick={handlePrevious}>
                ← Previous
              </Button>
            )}
            <Button onClick={handleReset} className="text-red-600 border-red-600">
              Reset All
            </Button>
          </div>
          <div>
            {currentStep < TOTAL_STEPS && (
              <Button onClick={handleNext} variant="primary">
                Next →
              </Button>
            )}
            {currentStep === TOTAL_STEPS && (
              <Button variant="primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Scroll to Top
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="text-center text-xs text-gray-500">
        <p>Auto-saving draft to localStorage...</p>
        <p className="mt-2">Article ID: {article.id}</p>
      </div>
    </div>
  );
};
