import React, { useState, useRef, useEffect } from 'react';
import { Plus, Star } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (text: string, details?: string, isStarred?: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  onAddTask,
  isOpen = false,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsExpanded(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isExpanded) {
      titleInputRef.current?.focus();
    }
  }, [isExpanded]);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    onAddTask(trimmed, details.trim() || undefined, isStarred);
    setTitle('');
    setDetails('');
    setIsStarred(false);
    setIsExpanded(false);
    if (onClose) onClose();
  };

  const handleCancel = () => {
    setTitle('');
    setDetails('');
    setIsStarred(false);
    setIsExpanded(false);
    if (onClose) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isExpanded) {
    return (
      <div
        className="add-task-trigger"
        onClick={() => setIsExpanded(true)}
        role="button"
        tabIndex={0}
      >
        <div className="add-task-icon-circle">
          <Plus size={14} color="#8ab4f8" />
        </div>
        <span>Add a task</span>
      </div>
    );
  }

  return (
    <div className="task-input-form animate-fade-in">
      <input
        ref={titleInputRef}
        type="text"
        className="task-title-input"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <textarea
        className="task-details-input"
        placeholder="Details"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={2}
      />

      <div className="task-input-actions">
        <div className="task-input-tools">
          <button
            type="button"
            className={`tool-button ${isStarred ? 'starred' : ''}`}
            onClick={() => setIsStarred(!isStarred)}
            title={isStarred ? 'Unstar task' : 'Star task'}
          >
            <Star
              size={18}
              fill={isStarred ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        <div className="task-input-buttons">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="save-button"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
