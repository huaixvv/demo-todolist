import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Todo, FilterType, AppData } from './types/todo';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { ProgressBar } from './components/ProgressBar';
import { AIAssistant } from './components/AIAssistant';
import { Confetti } from './components/Confetti';
import './styles/variables.css';
import './styles/TodoList.css';

const INITIAL_DATA: AppData = {
  todos: [],
};

function App() {
  const [data, setData] = useLocalStorage<AppData>('todo-app-data', INITIAL_DATA);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showConfetti, setShowConfetti] = useState(false);

  // 计算上次的完成状态，用于触发庆祝动画
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);

  const todos = data.todos;
  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  // 监听任务完成，触发庆祝动画
  useEffect(() => {
    if (completedCount > 0 && completedCount === totalCount && completedCount > prevCompletedCount) {
      // 所有任务刚完成
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setPrevCompletedCount(completedCount);
  }, [completedCount, totalCount, prevCompletedCount]);

  const addTodo = useCallback(
    (text: string) => {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
      };
      setData((prev) => ({
        ...prev,
        todos: [newTodo, ...prev.todos],
      }));
    },
    [setData]
  );

  const toggleTodo = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        todos: prev.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
      }));
    },
    [setData]
  );

  const deleteTodo = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        todos: prev.todos.filter((todo) => todo.id !== id),
      }));
    },
    [setData]
  );

  const editTodo = useCallback(
    (id: string, newText: string) => {
      setData((prev) => ({
        ...prev,
        todos: prev.todos.map((todo) =>
          todo.id === id ? { ...todo, text: newText } : todo
        ),
      }));
    },
    [setData]
  );

  const addTodos = useCallback(
    (newTodos: Todo[]) => {
      setData((prev) => ({
        ...prev,
        todos: [...newTodos, ...prev.todos],
      }));
    },
    [setData]
  );

  const clearCompleted = useCallback(() => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.filter((todo) => !todo.completed),
    }));
  }, [setData]);

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="todo-app">
      {/* 庆祝动画 */}
      <Confetti active={showConfetti} />

      {/* 头部 */}
      <header className="todo-app__header">
        <h1 className="todo-app__title">TaskFlow</h1>
        <p className="todo-app__subtitle">智能任务管理，让每一天都更有意义</p>
      </header>

      {/* 进度条 */}
      <ProgressBar todos={todos} />

      {/* 输入框 */}
      <TodoInput onAdd={addTodo} />

      {/* 筛选器 */}
      <div className="todo-filter">
        <button
          className={`todo-filter__button ${filter === 'all' ? 'todo-filter__button--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 ({todos.length})
        </button>
        <button
          className={`todo-filter__button ${filter === 'active' ? 'todo-filter__button--active' : ''}`}
          onClick={() => setFilter('active')}
        >
          进行中 ({activeCount})
        </button>
        <button
          className={`todo-filter__button ${filter === 'completed' ? 'todo-filter__button--active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          已完成 ({completedCount})
        </button>
      </div>

      {/* 任务列表 */}
      <TodoList
        todos={todos}
        filter={filter}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
      />

      {/* 底部操作 */}
      {completedCount > 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={clearCompleted}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-warning)';
              e.currentTarget.style.color = 'var(--color-warning)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            清除已完成任务
          </button>
        </div>
      )}

      {/* AI 助手 */}
      <AIAssistant onTodosGenerated={addTodos} />

      {/* 页脚 */}
      <footer style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        <p>使用 ❤️ 和 AI 驱动</p>
      </footer>
    </div>
  );
}

export default App;
