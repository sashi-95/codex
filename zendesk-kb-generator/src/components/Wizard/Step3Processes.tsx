import React, { useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { KBArticle, Process } from '../../types/article';
import { createEmptyProcess } from '../../types/article';
import { Button, MultiLangInput, Accordion } from '../Common';

interface Step3ProcessesProps {
  article: KBArticle;
  onUpdate: (article: KBArticle) => void;
}

interface DraggableProcessItemProps {
  process: Process;
  index: number;
  moveProcess: (dragIndex: number, hoverIndex: number) => void;
  onUpdate: (process: Process) => void;
  onDelete: () => void;
}

const ITEM_TYPE = 'PROCESS';

/**
 * ドラッグ可能なプロセスアイテム
 */
const DraggableProcessItem: React.FC<DraggableProcessItemProps> = ({
  process,
  index,
  moveProcess,
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
        moveProcess(item.index, index);
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
        <span className="prada-label">Process {index + 1}</span>
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
        title={`Process ${index + 1}: ${process.title.en || process.title.ja || process.title.pt || 'Untitled'}`}
        defaultOpen={false}
      >
        <MultiLangInput
          label="Process Title"
          value={process.title}
          onChange={(value) => onUpdate({ ...process, title: value })}
          placeholder={{
            en: 'Enter process title in English',
            ja: '日本語でプロセスタイトルを入力',
            pt: 'Digite o título do processo em português',
          }}
          required
        />

        <MultiLangInput
          label="Process Content"
          value={process.content}
          onChange={(value) => onUpdate({ ...process, content: value })}
          type="textarea"
          placeholder={{
            en: 'Enter process details in English',
            ja: '日本語でプロセスの詳細を入力',
            pt: 'Digite os detalhes do processo em português',
          }}
          required
        />
      </Accordion>
    </div>
  );
};

/**
 * ステップ3: プロセス/手順
 * - アコーディオン形式の手順を追加・削除・並び替え可能
 * - ドラッグ&ドロップで順序変更
 */
export const Step3Processes: React.FC<Step3ProcessesProps> = ({
  article,
  onUpdate,
}) => {
  const addProcess = () => {
    const newProcess = createEmptyProcess(article.processes.length);
    onUpdate({
      ...article,
      processes: [...article.processes, newProcess],
    });
  };

  const updateProcess = (index: number, updatedProcess: Process) => {
    const newProcesses = [...article.processes];
    newProcesses[index] = updatedProcess;
    onUpdate({
      ...article,
      processes: newProcesses,
    });
  };

  const deleteProcess = (index: number) => {
    const newProcesses = article.processes.filter((_, i) => i !== index);
    // 順序を再設定
    const reorderedProcesses = newProcesses.map((p, i) => ({ ...p, order: i }));
    onUpdate({
      ...article,
      processes: reorderedProcesses,
    });
  };

  const moveProcess = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const draggedProcess = article.processes[dragIndex];
      const newProcesses = [...article.processes];
      newProcesses.splice(dragIndex, 1);
      newProcesses.splice(hoverIndex, 0, draggedProcess);
      // 順序を再設定
      const reorderedProcesses = newProcesses.map((p, i) => ({ ...p, order: i }));
      onUpdate({
        ...article,
        processes: reorderedProcesses,
      });
    },
    [article.processes, onUpdate]
  );

  return (
    <div className="wizard-step">
      <h2 className="prada-header">Step 3: Processes / Procedures</h2>
      <p className="text-prada mb-6">
        Add step-by-step processes or procedures. Drag and drop to reorder.
      </p>

      <div className="mb-6">
        {article.processes.map((process, index) => (
          <DraggableProcessItem
            key={process.id}
            process={process}
            index={index}
            moveProcess={moveProcess}
            onUpdate={(updated) => updateProcess(index, updated)}
            onDelete={() => deleteProcess(index)}
          />
        ))}
      </div>

      {article.processes.length === 0 && (
        <div className="text-center py-12 border border-prada-border bg-prada-light">
          <p className="text-gray-500 mb-4">No processes added yet</p>
        </div>
      )}

      <Button onClick={addProcess}>
        + Add Process
      </Button>
    </div>
  );
};
