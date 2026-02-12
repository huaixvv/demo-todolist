import { Todo } from '../types/todo';

interface ProgressBarProps {
  todos: Todo[];
}

export function ProgressBar({ todos }: ProgressBarProps) {
  const completed = todos.filter((t) => t.completed).length;
  const total = todos.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="progress-bar">
      <div className="progress-bar__container">
        <div
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="progress-bar__stats">
        <span>
          已完成 <strong>{completed}</strong> / {total} 项任务
        </span>
        <span className="progress-bar__percentage">{percentage}%</span>
      </div>
    </div>
  );
}
