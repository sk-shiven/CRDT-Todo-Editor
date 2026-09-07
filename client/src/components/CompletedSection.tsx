import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TaskData, TaskItem } from './TaskItem';

interface CompletedSectionProps {
  completedTasks: TaskData[];
  onToggleDone: (id: string, currentDone: boolean) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onEditText: (id: string, newText: string, newDetails?: string) => void;
}

export const CompletedSection: React.FC<CompletedSectionProps> = ({
  completedTasks,
  onToggleDone,
  onToggleStar,
  onDelete,
  onEditText,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (completedTasks.length === 0) return null;

  return (
    <div className="completed-section">
      <button
        type="button"
        className="completed-header-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Collapse completed' : 'Expand completed'}
      >
        <div className="completed-toggle-left">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>Completed ({completedTasks.length})</span>
        </div>
      </button>

      {isExpanded && (
        <div className="task-list animate-fade-in">
          {completedTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              index={index}
              onToggleDone={onToggleDone}
              onToggleStar={onToggleStar}
              onDelete={onDelete}
              onEditText={onEditText}
            />
          ))}
        </div>
      )}
    </div>
  );
};
