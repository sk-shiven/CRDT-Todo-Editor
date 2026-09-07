import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, ArrowDownAZ, Calendar, Trash2 } from 'lucide-react';
import { TaskData, TaskItem } from './TaskItem';
import { TaskInput } from './TaskInput';
import { EmptyState } from './EmptyState';
import { CompletedSection } from './CompletedSection';

interface TaskCardProps {
  title: string;
  activeTasks: TaskData[];
  completedTasks: TaskData[];
  onAddTask: (text: string, details?: string, isStarred?: boolean) => void;
  onToggleDone: (id: string, currentDone: boolean) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onEditText: (id: string, newText: string, newDetails?: string) => void;
  onReorder: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
  onSortByTitle?: () => void;
  onSortByNewest?: () => void;
  onClearCompleted?: () => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  activeTasks,
  completedTasks,
  onAddTask,
  onToggleDone,
  onToggleStar,
  onDelete,
  onEditText,
  onReorder,
  onSortByTitle,
  onSortByNewest,
  onClearCompleted,
  isCreateOpen,
  onCloseCreate,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const isEmpty = activeTasks.length === 0 && completedTasks.length === 0;

  return (
    <div className="task-card">
      {/* Top Grab Handle */}
      <div className="card-top-handle" />

      {/* Card Header */}
      <div className="card-header">
        <div className="card-title-wrap">
          <h1 className="card-title">{title}</h1>
          {activeTasks.length > 0 && (
            <span className="card-item-counter">{activeTasks.length}</span>
          )}
        </div>

        <div className="dropdown-menu-anchor" ref={menuRef}>
          <button
            type="button"
            className="icon-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="List options"
          >
            <MoreVertical size={18} />
          </button>

          {isMenuOpen && (
            <div className="dropdown-menu animate-fade-in">
              {onSortByTitle && (
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    onSortByTitle();
                    setIsMenuOpen(false);
                  }}
                >
                  <ArrowDownAZ size={16} />
                  <span>Sort by name</span>
                </button>
              )}

              {onSortByNewest && (
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    onSortByNewest();
                    setIsMenuOpen(false);
                  }}
                >
                  <Calendar size={16} />
                  <span>Sort by newest</span>
                </button>
              )}

              {completedTasks.length > 0 && onClearCompleted && (
                <>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item danger"
                    onClick={() => {
                      onClearCompleted();
                      setIsMenuOpen(false);
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Clear completed tasks</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Input Row / Form */}
      <TaskInput
        onAddTask={onAddTask}
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
      />

      {/* Empty State or Task List */}
      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="task-list">
            {activeTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                onToggleDone={onToggleDone}
                onToggleStar={onToggleStar}
                onDelete={onDelete}
                onEditText={onEditText}
                onReorder={onReorder}
              />
            ))}
          </div>

          <CompletedSection
            completedTasks={completedTasks}
            onToggleDone={onToggleDone}
            onToggleStar={onToggleStar}
            onDelete={onDelete}
            onEditText={onEditText}
          />
        </>
      )}
    </div>
  );
};
