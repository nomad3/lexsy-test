import { DocumentAnalyzer } from '../agents/DocumentAnalyzer';
import { PlaceholderExtractor } from '../agents/PlaceholderExtractor';
import { AITask, TaskType } from '@smartdocs/common';

/**
 * AIAgentService
 * Orchestrates AI agent execution and manages agent instances
 */
export class AIAgentService {
  private documentAnalyzer: DocumentAnalyzer;
  private placeholderExtractor: PlaceholderExtractor;

  constructor() {
    // Instantiate agents
    this.documentAnalyzer = new DocumentAnalyzer();
    this.placeholderExtractor = new PlaceholderExtractor();
  }

  /**
   * Run an agent with the given input
   * @param agentName - Name of the agent to run (DocumentAnalyzer or PlaceholderExtractor)
   * @param input - Input data for the agent
   * @returns Promise<AITask> - Completed task with results
   */
  async runAgent(agentName: string, input: any): Promise<AITask> {
    // Validate agent name
    if (!agentName || agentName.trim() === '') {
      throw new Error('Agent name is required');
    }

    // Route to appropriate agent
    switch (agentName) {
      case 'DocumentAnalyzer':
        return await this.documentAnalyzer.runTask(TaskType.ANALYZE_DOCUMENT, input);

      case 'PlaceholderExtractor':
        return await this.placeholderExtractor.runTask(TaskType.EXTRACT_PLACEHOLDERS, input);

      default:
        throw new Error(`Unknown agent: ${agentName}`);
    }
  }
}
