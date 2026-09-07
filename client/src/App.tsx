import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { TaskCard } from './components/TaskCard';
import { TaskData } from './components/TaskItem';
import { NewListModal } from './components/NewListModal';

const STORAGE_KEY_TASKS = 'crdt_todo_tasks';
const STORAGE_KEY_REPLICA = 'crdt_todo_replica_id';
const STORAGE_KEY_LISTS = 'crdt_todo_lists';
const STORAGE_KEY_CLOCK = 'crdt_todo_lamport_clock';

export default function App() {
  // 1. Initialize replica ID state (persisted)
  const [replicaId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_REPLICA);
    if (saved) return saved;
    const generated = `client-${Math.random().toString(36).substring(2, 6)}`;
    localStorage.setItem(STORAGE_KEY_REPLICA, generated);
    return generated;
  });

  // 2. Initialize Lamport Clock counter state
  const [lamportClock, setLamportClock] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLOCK);
    return saved ? parseInt(saved, 10) : 0;
  });

  // 3. Initialize online/offline status listener state (with manual toggle option)
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [pendingOpsCount, setPendingOpsCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Simulate auto-sync on reconnect
      setPendingOpsCount(0);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleOnline = () => {
    setIsOnline((prev) => {
      const next = !prev;
      if (next) {
        // Reconnected
        setPendingOpsCount(0);
      }
      return next;
    });
  };

  // 4. Initialize Lists state
  const [lists, setLists] = useState<Array<{ id: string; name: string }>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LISTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [{ id: 'my-tasks', name: 'My Tasks' }];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LISTS, JSON.stringify(lists));
  }, [lists]);

  // 5. Initialize active navigation tab / list
  const [activeTab, setActiveTab] = useState<NavTab>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [isNewListModalOpen, setIsNewListModalOpen] = useState<boolean>(false);

  // 6. Initialize todo items list state
  const [tasks, setTasks] = useState<TaskData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLOCK, lamportClock.toString());
  }, [lamportClock]);

  // Helper to advance Lamport clock
  const tickClock = () => {
    const nextClock = lamportClock + 1;
    setLamportClock(nextClock);
    if (!isOnline) {
      setPendingOpsCount((c) => c + 1);
    }
    return { counter: nextClock, replicaId };
  };

  // Event Handlers
  const handleAddTodo = (text: string, details?: string, isStarred = false) => {
    const clock = tickClock();
    const newTask: TaskData = {
      id: `${replicaId}:${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      text,
      details,
      done: false,
      starred: isStarred || activeTab === 'starred',
      listId: activeTab === 'all' || activeTab === 'starred' ? 'my-tasks' : activeTab,
      clock,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleDone = (id: string, currentDone: boolean) => {
    const clock = tickClock();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !currentDone, clock } : t))
    );
  };

  const handleToggleStar = (id: string) => {
    const clock = tickClock();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, starred: !t.starred, clock } : t))
    );
  };

  const handleDelete = (id: string) => {
    tickClock();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEditText = (id: string, newText: string, newDetails?: string) => {
    const clock = tickClock();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, text: newText, details: newDetails, clock } : t
      )
    );
  };

  // Drag and Drop Reordering Handler
  const handleReorder = (
    draggedId: string,
    targetId: string,
    position: 'before' | 'after'
  ) => {
    setTasks((prev) => {
      const draggedIndex = prev.findIndex((t) => t.id === draggedId);
      const targetIndex = prev.findIndex((t) => t.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        return prev;
      }

      const updated = [...prev];
      const [draggedItem] = updated.splice(draggedIndex, 1);

      // Re-calculate target index after removal
      const newTargetIndex = updated.findIndex((t) => t.id === targetId);
      const insertAt = position === 'before' ? newTargetIndex : newTargetIndex + 1;

      updated.splice(insertAt, 0, draggedItem);
      return updated;
    });
  };

  const handleSortByTitle = () => {
    setTasks((prev) => {
      const active = prev.filter((t) => !t.done);
      const done = prev.filter((t) => t.done);
      active.sort((a, b) => a.text.localeCompare(b.text));
      return [...active, ...done];
    });
  };

  const handleSortByNewest = () => {
    setTasks((prev) => {
      const active = prev.filter((t) => !t.done);
      const done = prev.filter((t) => t.done);
      active.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return [...active, ...done];
    });
  };

  const handleClearCompleted = () => {
    tickClock();
    setTasks((prev) => {
      if (activeTab === 'all') return prev.filter((t) => !t.done);
      if (activeTab === 'starred') return prev.filter((t) => !(t.done && t.starred));
      return prev.filter((t) => !(t.done && t.listId === activeTab));
    });
  };

  const handleCreateList = (name: string) => {
    const newListId = `list-${Date.now()}`;
    setLists((prev) => [...prev, { id: newListId, name }]);
    setActiveTab(newListId);
  };

  // Filter tasks for current view
  const currentViewTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'starred') return task.starred;
    return task.listId === activeTab;
  });

  const activeTasks = currentViewTasks.filter((t) => !t.done);
  const completedTasks = currentViewTasks.filter((t) => t.done);

  // Compute title for current card
  let currentTitle = 'My Tasks';
  if (activeTab === 'all') {
    currentTitle = 'All tasks';
  } else if (activeTab === 'starred') {
    currentTitle = 'Starred';
  } else {
    const listObj = lists.find((l) => l.id === activeTab);
    if (listObj) currentTitle = listObj.name;
  }

  const allCount = tasks.filter((t) => !t.done).length;
  const starredCount = tasks.filter((t) => !t.done && t.starred).length;

  return (
    <div className="app-container">
      {/* App Header with Replica ID and Online/Offline Badge */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        replicaId={replicaId}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        pendingOpsCount={pendingOpsCount}
      />

      {/* Main Workspace Layout (Sidebar + Task Board) */}
      <div className="main-workspace">
        <Sidebar
          isOpen={isSidebarOpen}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          onOpenCreateList={() => setIsNewListModalOpen(true)}
          lists={lists}
          allCount={allCount}
          starredCount={starredCount}
        />

        {/* Center Board Container */}
        <main className="board-container">
          <TaskCard
            title={currentTitle}
            activeTasks={activeTasks}
            completedTasks={completedTasks}
            onAddTask={handleAddTodo}
            onToggleDone={handleToggleDone}
            onToggleStar={handleToggleStar}
            onDelete={handleDelete}
            onEditText={handleEditText}
            onReorder={handleReorder}
            onSortByTitle={handleSortByTitle}
            onSortByNewest={handleSortByNewest}
            onClearCompleted={handleClearCompleted}
            isCreateOpen={isCreateTaskOpen}
            onCloseCreate={() => setIsCreateTaskOpen(false)}
          />
        </main>
      </div>

      {/* Create New List Modal */}
      <NewListModal
        isOpen={isNewListModalOpen}
        onClose={() => setIsNewListModalOpen(false)}
        onCreateList={handleCreateList}
      />
    </div>
  );
}
