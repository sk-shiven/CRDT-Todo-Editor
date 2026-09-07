import React, { useState } from 'react';

interface NewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (name: string) => void;
}

export const NewListModal: React.FC<NewListModalProps> = ({
  isOpen,
  onClose,
  onCreateList,
}) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateList(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Create new list</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            className="modal-input"
            placeholder="Enter name"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={!name.trim()}
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
