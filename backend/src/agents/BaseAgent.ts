// backend/src/agents/BaseAgent.ts
import { v4 as uuidv4 } from 'uuid';
import { openai, calculateCost } from '../config/openai';
import { query } from '../config/database';
import { AgentType, TaskType, TaskStatus, AITask } from '@lexsy/common';

export abstract class BaseAgent {
  public readonly name: string;
  public readonly type: AgentType;
  public readonly model: string;
  protected systemPrompt: string;
  protected config: Record<string, any>;

  constructor(name: string, type: AgentType, model: string, systemPrompt: string = '', config: Record<string, any> = {}) {
    this.name = name;
    this.type = type;
    this.model = model;
    this.systemPrompt = systemPrompt;
    this.config = {
      temperature: 0.7,
      max_tokens: 2000,
      ...config
    };
  }

  abstract execute(input: any): Promise<any>;

  async runTask(taskType: TaskType, input: any): Promise<AITask> {
    const taskId = uuidv4();

    try {
      // Get or create agent in database
      const agentId = await this.getOrCreateAgent();

      // Create task record
      await this.createTaskRecord(taskId, agentId, taskType, input);

      // Execute the task
      const output = await this.execute(input);

      // Complete task record
      await this.completeTaskRecord(taskId, output);

      // Return completed task
      const result = await query('SELECT * FROM ai_tasks WHERE id = $1', [taskId]);
      return this.mapRowToTask(result.rows[0]);
    } catch (error) {
      await this.failTaskRecord(taskId, error as Error);
      throw error;
    }
  }

  protected async callOpenAI(userPrompt: string): Promise<any> {
    const response = await openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.max_tokens,
    });

    return {
      content: response.choices[0].message.content,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      }
    };
  }

  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private async getOrCreateAgent(): Promise<string> {
    const result = await query(
      'SELECT id FROM ai_agents WHERE name = $1',
      [this.name]
    );

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    const insertResult = await query(
      `INSERT INTO ai_agents (name, type, model, system_prompt, config, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [this.name, this.type, this.model, this.systemPrompt, JSON.stringify(this.config), true]
    );

    return insertResult.rows[0].id;
  }

  private async createTaskRecord(taskId: string, agentId: string, taskType: TaskType, input: any): Promise<void> {
    await query(
      `INSERT INTO ai_tasks (id, agent_id, task_type, input_data, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [taskId, agentId, taskType, JSON.stringify(input), TaskStatus.PROCESSING]
    );
  }

  private async completeTaskRecord(taskId: string, output: any): Promise<void> {
    await query(
      `UPDATE ai_tasks
       SET output_data = $1, status = $2, completed_at = NOW()
       WHERE id = $3`,
      [JSON.stringify(output), TaskStatus.COMPLETED, taskId]
    );
  }

  private async failTaskRecord(taskId: string, error: Error): Promise<void> {
    await query(
      `UPDATE ai_tasks
       SET status = $1, error = $2, completed_at = NOW()
       WHERE id = $3`,
      [TaskStatus.FAILED, error.message, taskId]
    );
  }

  private mapRowToTask(row: any): AITask {
    return {
      id: row.id,
      agentId: row.agent_id,
      taskType: row.task_type,
      inputData: row.input_data,
      outputData: row.output_data,
      status: row.status,
      tokensUsed: row.tokens_used,
      cost: row.cost ? parseFloat(row.cost) : undefined,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      error: row.error
    };
  }
}
