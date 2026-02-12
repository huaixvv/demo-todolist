import { FilterType, Todo } from '../types/todo';
import { TodoItem } from './TodoItem';
import { Inbox } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  filter: FilterType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export function TodoList({ todos, filter, onToggle, onDelete, onEdit }: TodoListProps) {
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // 未完成的在前
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // 按创建时间倒序
    return b.createdAt - a.createdAt;
  });

  if (sortedTodos.length === 0) {
    const emptyMessages = {
      all: '还没有待办事项，开始添加吧！',
      active: '太棒了！所有任务都已完成 🎉',
      completed: '还没有完成的任务，加油！',
    };

    return (
      <div className="todo-list__empty">
        <div className="todo-list__empty-icon">
          <Inbox size={64} />
        </div>
        <p className="todo-list__empty-text">{emptyMessages[filter]}</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {sortedTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
