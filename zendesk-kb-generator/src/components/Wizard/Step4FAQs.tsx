import React, { useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { KBArticle, FAQ } from '../../types/article';
import { createEmptyFAQ } from '../../types/article';
import { Button, MultiLangInput, Accordion } from '../Common';

interface Step4FAQsProps {
  article: KBArticle;
  onUpdate: (article: KBArticle) => void;
}

interface DraggableFAQItemProps {
  faq: FAQ;
  index: number;
  moveFAQ: (dragIndex: number, hoverIndex: number) => void;
  onUpdate: (faq: FAQ) => void;
  onDelete: () => void;
}

const ITEM_TYPE = 'FAQ';

/**
 * ドラッグ可能なFAQアイテム
 */
const DraggableFAQItem: React.FC<DraggableFAQItemProps> = ({
  faq,
  index,
  moveFAQ,
  onUpdate,
  onDelete,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveFAQ(item.index, index);
        item.index = index;
      }
    },
  });

  const combinedRef = (node: HTMLDivElement | null) => {
    drag(node);
    drop(node);
  };

  return (
    <div
      ref={combinedRef}
      className={`draggable-item ${isDragging ? 'dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="prada-label">FAQ {index + 1}</span>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500">Drag to reorder</span>
          <button
            type="button"
            onClick={onDelete}
            className="text-red-600 text-xs hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      <Accordion
        title={`FAQ ${index + 1}: ${faq.question.en || faq.question.ja || faq.question.pt || 'Untitled'}`}
        defaultOpen={false}
      >
        <MultiLangInput
          label="Question"
          value={faq.question}
          onChange={(value) => onUpdate({ ...faq, question: value })}
          type="textarea"
          placeholder={{
            en: 'Enter question in English',
            ja: '日本語で質問を入力',
            pt: 'Digite a pergunta em português',
          }}
          required
        />

        <MultiLangInput
          label="Answer"
          value={faq.answer}
          onChange={(value) => onUpdate({ ...faq, answer: value })}
          type="textarea"
          placeholder={{
            en: 'Enter answer in English',
            ja: '日本語で回答を入力',
            pt: 'Digite a resposta em português',
          }}
          required
        />
      </Accordion>
    </div>
  );
};

/**
 * ステップ4: FAQ
 * - 質問と回答のペアを追加・削除・並び替え可能
 * - ドラッグ&ドロップで順序変更
 */
export const Step4FAQs: React.FC<Step4FAQsProps> = ({
  article,
  onUpdate,
}) => {
  const addFAQ = () => {
    const newFAQ = createEmptyFAQ(article.faqs.length);
    onUpdate({
      ...article,
      faqs: [...article.faqs, newFAQ],
    });
  };

  const updateFAQ = (index: number, updatedFAQ: FAQ) => {
    const newFAQs = [...article.faqs];
    newFAQs[index] = updatedFAQ;
    onUpdate({
      ...article,
      faqs: newFAQs,
    });
  };

  const deleteFAQ = (index: number) => {
    const newFAQs = article.faqs.filter((_, i) => i !== index);
    // 順序を再設定
    const reorderedFAQs = newFAQs.map((f, i) => ({ ...f, order: i }));
    onUpdate({
      ...article,
      faqs: reorderedFAQs,
    });
  };

  const moveFAQ = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const draggedFAQ = article.faqs[dragIndex];
      const newFAQs = [...article.faqs];
      newFAQs.splice(dragIndex, 1);
      newFAQs.splice(hoverIndex, 0, draggedFAQ);
      // 順序を再設定
      const reorderedFAQs = newFAQs.map((f, i) => ({ ...f, order: i }));
      onUpdate({
        ...article,
        faqs: reorderedFAQs,
      });
    },
    [article.faqs, onUpdate]
  );

  return (
    <div className="wizard-step">
      <h2 className="prada-header">Step 4: Frequently Asked Questions</h2>
      <p className="text-prada mb-6">
        Add frequently asked questions and their answers. Drag and drop to reorder.
      </p>

      <div className="mb-6">
        {article.faqs.map((faq, index) => (
          <DraggableFAQItem
            key={faq.id}
            faq={faq}
            index={index}
            moveFAQ={moveFAQ}
            onUpdate={(updated) => updateFAQ(index, updated)}
            onDelete={() => deleteFAQ(index)}
          />
        ))}
      </div>

      {article.faqs.length === 0 && (
        <div className="text-center py-12 border border-prada-border bg-prada-light">
          <p className="text-gray-500 mb-4">No FAQs added yet</p>
        </div>
      )}

      <Button onClick={addFAQ}>
        + Add FAQ
      </Button>
    </div>
  );
};
