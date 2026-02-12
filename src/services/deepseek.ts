import { Todo } from '../types/todo';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

interface GenerateTodosResponse {
  todos: { text: string }[];
}

/**
 * 调用 DeepSeek API 生成 Todo 列表
 */
export async function generateTodosWithAI(prompt: string): Promise<Todo[]> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('未找到 DeepSeek API Key，请在 .env 文件中配置 VITE_DEEPSEEK_API_KEY');
  }

  const systemPrompt = `你是一个专业的任务规划助手。用户会给你一个目标或需求，你需要将其拆解为具体、可执行的待办事项列表。

规则：
1. 返回的待办事项应该是具体的、可操作的步骤
2. 每个待办事项应该简洁明了，一般不超过 20 个字
3. 按照逻辑顺序排列这些待办事项
4. 返回 3-8 个待办事项
5. 只返回 JSON 格式的数据，不要有任何额外说明

JSON 格式示例：
{
  "todos": [
    { "text": "第一个待办事项" },
    { "text": "第二个待办事项" }
  ]
}`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API 错误: ${response.status} ${response.statusText}\n${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // 解析返回的内容
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('AI 未返回任何内容');
    }

    // 尝试从返回的内容中提取 JSON
    let jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('无法解析 AI 返回的数据');
    }

    const parsed = JSON.parse(jsonMatch[0]) as GenerateTodosResponse;

    if (!parsed.todos || !Array.isArray(parsed.todos)) {
      throw new Error('AI 返回的数据格式不正确');
    }

    // 转换为 Todo 对象
    const todos: Todo[] = parsed.todos.map((todo) => ({
      id: crypto.randomUUID(),
      text: todo.text,
      completed: false,
      createdAt: Date.now(),
      aiGenerated: true,
    }));

    return todos;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('生成待办事项时发生未知错误');
  }
}

/**
 * 聊天式生成 Todo
 */
export async function chatGenerateTodos(messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('未找到 DeepSeek API Key，请在 .env 文件中配置 VITE_DEEPSEEK_API_KEY');
  }

  const systemPrompt = `你是一个友好的任务规划助手。帮助用户将他们的想法和目标拆解为可执行的待办事项。

当用户描述一个目标时，你应该：
1. 理解用户的需求
2. 提出一些引导性问题（如果需要）
3. 将目标拆解为具体的待办事项
4. 以友好的语气回复

请用简洁、友好的方式回复用户。`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API 错误: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '抱歉，我无法理解您的请求。';
  } catch (error) {
    throw new Error('与 AI 通信时发生错误');
  }
}
