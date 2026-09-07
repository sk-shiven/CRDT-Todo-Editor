import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Star,
  ChevronUp,
  ChevronDown,
  CheckSquare,
} from 'lucide-react';

export type NavTab = 'all' | 'starred' | string; // string is list ID

interface SidebarProps {
  isOpen: boolean;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCreateTask: () => void;
  onOpenCreateList: () => void;
  lists: Array<{ id: string; name: string }>;
  allCount: number;
  starredCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeTab,
  onSelectTab,
  onOpenCreateTask,
  onOpenCreateList,
  lists,
  allCount,
  starredCount,
}) => {
  const [isListsExpanded, setIsListsExpanded] = useState(true);

  return (
    <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      {/* "+ Create" Button */}
      <button
        className="create-task-button"
        onClick={onOpenCreateTask}
        title="Create a new task"
      >
        <Plus size={20} />
        <span>Create</span>
      </button>

      {/* Main Navigation Views */}
      <nav className="sidebar-nav">
        {/* All tasks */}
        <div
          className={`nav-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => onSelectTab('all')}
        >
          <div className="nav-item-content">
            <CheckCircle2 size={18} />
            <span>All tasks</span>
          </div>
          {allCount > 0 && <span className="nav-badge-count">{allCount}</span>}
        </div>

        {/* Starred */}
        <div
          className={`nav-item ${activeTab === 'starred' ? 'active' : ''}`}
          onClick={() => onSelectTab('starred')}
        >
          <div className="nav-item-content">
            <Star
              size={18}
              fill={activeTab === 'starred' ? 'currentColor' : 'none'}
            />
            <span>Starred</span>
          </div>
          {starredCount > 0 && <span className="nav-badge-count">{starredCount}</span>}
        </div>

        {/* Lists Section */}
        <div
          className="lists-section-header"
          onClick={() => setIsListsExpanded(!isListsExpanded)}
        >
          <span>Lists</span>
          {isListsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {/* Lists Items */}
        {isListsExpanded && (
          <>
            {lists.map((list) => {
              const isActive = activeTab === list.id;
              return (
                <div
                  key={list.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(list.id)}
                >
                  <div className="nav-item-content">
                    <CheckSquare size={18} />
                    <span>{list.name}</span>
                  </div>
                </div>
              );
            })}

            {/* "+ Create new list" */}
            <div className="create-list-item" onClick={onOpenCreateList}>
              <Plus size={18} />
              <span>Create new list</span>
            </div>
          </>
        )}
      </nav>
    </aside>
  );
};
