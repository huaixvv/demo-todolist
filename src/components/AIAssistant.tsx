import { MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AIMessage } from '../types/todo';
import { chatGenerateTodos, generateTodosWithAI } from '../services/deepseek';

interface AIAssistantProps {
  onTodosGenerated: (todos: any[]) => void;
}

export function AIAssistant({ onTodosGenerated }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 尝试直接生成待办事项
      try {
        const todos = await generateTodosWithAI(trimmed);
        const aiMessage: AIMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `已为您生成 ${todos.length} 个待办事项：\n\n${todos.map((t, i) => `${i + 1}. ${t.text}`).join('\n')}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        onTodosGenerated(todos);
      } catch (error) {
        // 如果无法直接生成，使用聊天模式
        const chatMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: trimmed },
        ];

        const response = await chatGenerateTodos(chatMessages);
        const aiMessage: AIMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-assistant">
      <div className={`ai-assistant__dialog ${isOpen ? 'ai-assistant__dialog--open' : ''}`}>
        <div className="ai-assistant__header">
          <div className="ai-assistant__title">
            <MessageSquare size={16} />
            <span>AI 助手</span>
          </div>
          <button
            className="ai-assistant__close"
            onClick={() => setIsOpen(false)}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <div className="ai-assistant__messages">
          {messages.length === 0 && (
            <div className="ai-assistant__message ai-assistant__message--ai">
              您好！我是您的 AI 任务规划助手。告诉我您想要完成的目标，我会帮您生成详细的待办事项列表。
              <br />
              <br />
              例如：
              <br />
              • "帮我制定一个健身计划"
              <br />
              • "如何学习 TypeScript"
              <br />
              • "准备去日本旅行"
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`ai-assistant__message ai-assistant__message--${message.role}`}
              style={{ whiteSpace: 'pre-line' }}
            >
              {message.content}
            </div>
          ))}

          {isLoading && (
            <div className="ai-assistant__message ai-assistant__message--ai ai-assistant__message--loading">
              <div className="ai-assistant__typing-indicator">
                <div className="ai-assistant__typing-dot"></div>
                <div className="ai-assistant__typing-dot"></div>
                <div className="ai-assistant__typing-dot"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="ai-assistant__input-area">
          <textarea
            className="ai-assistant__input"
            placeholder="告诉我您的目标..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="ai-assistant__send-button"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="发送"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      <button
        className="ai-assistant__toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? '关闭 AI 助手' : '打开 AI 助手'}
      >
        <MessageSquare size={28} />
      </button>
    </div>
  );
}
