import { useState } from 'react';
import { Plus } from 'lucide-react';

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onAdd(trimmed);
    setText('');
  };

  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      <div className="todo-input__wrapper">
        <input
          type="text"
          className="todo-input__field"
          placeholder="添加一个新的待办事项..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
        />
        <button type="submit" className="todo-input__button" aria-label="添加任务">
          <Plus size={20} />
          <span>添加</span>
        </button>
      </div>
    </form>
  );
}
