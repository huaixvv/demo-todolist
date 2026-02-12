import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      onEdit(todo.id, trimmed);
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div
      className={`todo-item ${todo.completed ? 'todo-item--completed' : ''} ${
        todo.aiGenerated ? 'todo-item--ai-generated' : ''
      } ${isEditing ? 'todo-item--editing' : ''}`}
    >
      <label className="todo-item__checkbox">
        <input
          type="checkbox"
          className="todo-item__checkbox-input"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className="todo-item__checkbox-custom">
          <Check size={14} className="todo-item__checkbox-icon" />
        </span>
      </label>

      {isEditing ? (
        <>
          <input
            type="text"
            className="todo-item__edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            maxLength={200}
          />
          <div className="todo-item__actions" style={{ opacity: 1 }}>
            <button
              className="todo-item__action-button"
              onClick={handleSave}
              aria-label="保存"
            >
              <Check size={16} />
            </button>
            <button
              className="todo-item__action-button todo-item__action-button--delete"
              onClick={handleCancel}
              aria-label="取消"
            >
              <X size={16} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="todo-item__content">
            <p className="todo-item__text">{todo.text}</p>
            <div className="todo-item__meta">
              <span className="todo-item__badge">{formatDate(todo.createdAt)}</span>
              {todo.aiGenerated && (
                <span className="todo-item__badge todo-item__badge--ai">AI 生成</span>
              )}
            </div>
          </div>
          <div className="todo-item__actions">
            <button
              className="todo-item__action-button"
              onClick={() => setIsEditing(true)}
              aria-label="编辑"
            >
              <Pencil size={16} />
            </button>
            <button
              className="todo-item__action-button todo-item__action-button--delete"
              onClick={() => onDelete(todo.id)}
              aria-label="删除"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
