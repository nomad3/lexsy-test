// backend/tests/agents/BaseAgent.test.ts
import { BaseAgent } from '../../src/agents/BaseAgent';
import { AgentType, TaskType, TaskStatus } from '@lexsy/common';

// Mock OpenAI
jest.mock('openai');

// Mock OpenAI config
jest.mock('../../src/config/openai', () => ({
  openai: {},
  calculateCost: jest.fn(),
}));

// Mock database
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

class TestAgent extends BaseAgent {
  constructor() {
    super('test-agent', AgentType.ANALYZER, 'gpt-4-turbo-preview');
  }

  async execute(input: any): Promise<any> {
    return { result: 'test' };
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    const { query } = require('../../src/config/database');
    mockQuery = query as jest.Mock;
    mockQuery.mockClear();

    agent = new TestAgent();
  });

  it('should create agent with correct properties', () => {
    expect(agent.name).toBe('test-agent');
    expect(agent.type).toBe(AgentType.ANALYZER);
    expect(agent.model).toBe('gpt-4-turbo-preview');
  });

  it('should create and complete task successfully', async () => {
    const agentId = 'agent-123';
    const taskId = 'task-456';

    // Mock getting existing agent
    mockQuery.mockResolvedValueOnce({ rows: [{ id: agentId }] });

    // Mock creating task record
    mockQuery.mockResolvedValueOnce({ rows: [] });

    // Mock completing task record
    mockQuery.mockResolvedValueOnce({ rows: [] });

    // Mock getting completed task
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: taskId,
        agent_id: agentId,
        task_type: TaskType.ANALYZE_DOCUMENT,
        input_data: { test: 'data' },
        output_data: { result: 'test' },
        status: TaskStatus.COMPLETED,
        tokens_used: null,
        cost: null,
        created_at: new Date(),
        completed_at: new Date(),
        error: null
      }]
    });

    const input = { test: 'data' };
    const result = await agent.runTask(TaskType.ANALYZE_DOCUMENT, input);

    expect(result).toBeDefined();
    expect(result.status).toBe(TaskStatus.COMPLETED);
    expect(result.outputData).toEqual({ result: 'test' });
  });
});
