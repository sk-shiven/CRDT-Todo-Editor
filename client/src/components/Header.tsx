import React, { useState } from 'react';
import { Menu, Check, HelpCircle, Grip, Copy, CheckCheck } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  replicaId: string;
  isOnline: boolean;
  onToggleOnline: () => void;
  pendingOpsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  replicaId,
  isOnline,
  onToggleOnline,
  pendingOpsCount = 0,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReplica = () => {
    navigator.clipboard.writeText(replicaId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="icon-button"
          onClick={onToggleSidebar}
          aria-label="Main menu"
          title="Main menu"
        >
          <Menu size={20} />
        </button>

        <div className="brand-logo-container" title="Tasks">
          <div className="tasks-logo-badge">
            <Check size={20} strokeWidth={3} />
          </div>
          <span className="brand-title">Tasks</span>
        </div>
      </div>

      <div className="header-center">
        {/* Replica ID Badge */}
        <div
          className="replica-badge"
          onClick={handleCopyReplica}
          title={`Replica ID: ${replicaId} (Click to copy)`}
        >
          <span className="replica-dot" />
          <span>{replicaId}</span>
          {copied ? <CheckCheck size={13} color="#81c995" /> : <Copy size={13} />}
        </div>

        {/* Online / Offline Status Badge */}
        <button
          className={`status-badge ${isOnline ? 'online' : 'offline'}`}
          onClick={onToggleOnline}
          title={
            isOnline
              ? 'Status: Online (Click to toggle offline simulation)'
              : `Status: Offline (${pendingOpsCount} pending changes) - Click to reconnect`
          }
        >
          <span className="status-indicator-dot" />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
          {!isOnline && pendingOpsCount > 0 && (
            <span style={{ fontSize: '11px', opacity: 0.85 }}>({pendingOpsCount})</span>
          )}
        </button>
      </div>

      <div className="header-right">
        <button className="icon-button" aria-label="Support & Help" title="Support & Help">
          <HelpCircle size={20} />
        </button>

        <button className="icon-button" aria-label="Google apps" title="Google apps">
          <Grip size={20} />
        </button>

        <div
          className="user-avatar-button"
          aria-label="Google Account"
          title={`Logged in as ${replicaId}`}
        >
          <span>S</span>
        </div>
      </div>
    </header>
  );
};
