import React, { useState } from 'react';
import {
  Check,
  Star,
  Trash2,
  Edit2,
  GripVertical,
} from 'lucide-react';

export interface TaskData {
  id: string;
  text: string;
  details?: string;
  done: boolean;
  starred: boolean;
  listId?: string;
  clock?: {
    counter: number;
    replicaId: string;
  };
  createdAt?: number;
}

interface TaskItemProps {
  task: TaskData;
  index: number;
  onToggleDone: (id: string, currentDone: boolean) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onEditText: (id: string, newText: string, newDetails?: string) => void;
  onReorder?: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleDone,
  onToggleStar,
  onDelete,
  onEditText,
  onReorder,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [isDragging, setIsDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.text) {
      onEditText(task.id, trimmed, task.details);
    } else {
      setEditText(task.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (task.done) return;
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (task.done) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isTop = e.clientY < midY;
    setDropPosition(isTop ? 'top' : 'bottom');
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (task.done) return;
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== task.id && onReorder) {
      const position = dropPosition === 'top' ? 'before' : 'after';
      onReorder(draggedId, task.id, position);
    }
    setDropPosition(null);
    setIsDragging(false);
  };

  const dragOverClass =
    dropPosition === 'top'
      ? 'drag-over-top'
      : dropPosition === 'bottom'
      ? 'drag-over-bottom'
      : '';

  return (
    <div
      className={`task-item-row ${task.done ? 'completed' : ''} ${
        isDragging ? 'dragging' : ''
      } ${dragOverClass}`}
      draggable={!task.done && !isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Handle (Active tasks only) */}
      {!task.done && (
        <div
          className="drag-handle"
          title="Drag to reorder"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>
      )}

      {/* Round Checkbox Button */}
      <button
        type="button"
        className={`task-checkbox-btn ${task.done ? 'checked' : ''}`}
        onClick={() => onToggleDone(task.id, task.done)}
        title={task.done ? 'Mark uncompleted' : 'Mark completed'}
      >
        {task.done && <Check size={14} />}
      </button>

      {/* Task Content Area */}
      <div className="task-content-area" onClick={() => !isEditing && setIsEditing(true)}>
        {isEditing ? (
          <input
            type="text"
            className="inline-edit-input"
            value={editText}
            autoFocus
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <>
            <span className="task-text-title">{task.text}</span>
            {task.details && (
              <span className="task-details-snippet">{task.details}</span>
            )}
            {task.clock && (
              <div className="task-meta-tags">
                <span
                  className="crdt-pill-tag"
                  title={`Lamport Clock: ${task.clock.counter}, Replica: ${task.clock.replicaId}`}
                >
                  {task.clock.replicaId}:{task.clock.counter}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Controls: Star & Delete */}
      <div className="task-right-actions">
        {!isEditing && (
          <button
            type="button"
            className="task-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            title="Edit task"
          >
            <Edit2 size={15} />
          </button>
        )}

        <button
          type="button"
          className={`task-action-btn star-btn ${task.starred ? 'is-starred' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(task.id);
          }}
          title={task.starred ? 'Unstar' : 'Star'}
        >
          <Star size={16} fill={task.starred ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          className="task-action-btn delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          title="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
