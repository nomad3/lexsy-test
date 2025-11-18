// backend/src/agents/ConversationalAssistant.ts
import { BaseAgent } from './BaseAgent';
import { AgentType } from '@lexsy/common';
import { MODELS } from '../config/openai';

interface ConversationalAssistantInput {
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  currentPlaceholder?: {
    fieldName: string;
    fieldType: string;
    suggestedQuestion: string;
    suggestedValue?: string;
  };
  documentContext: {
    documentType: string;
    completionPercentage: number;
    totalPlaceholders: number;
    filledPlaceholders: number;
  };
}

export interface ConversationalResponse {
  message: string;
  suggestedAction?: 'fill_field' | 'next_field' | 'review' | 'complete' | 'clarify';
  fieldName?: string;
  extractedValue?: string;
  confidence: number;
}

export class ConversationalAssistant extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a friendly, professional conversational assistant helping lawyers fill legal documents. Your role is to:

1. Guide users through filling document placeholders conversationally
2. Ask clear, concise questions about each field
3. Extract values from user responses
4. Validate and confirm values before proceeding
5. Provide helpful context and examples when needed
6. Handle ambiguity gracefully and ask follow-up questions

Communication Style:
- Professional but conversational
- Clear and concise
- Patient and helpful
- Provide examples when useful
- Confirm understanding before moving on

When asking about a field:
- Use the suggested question as a starting point
- If a suggested value exists, mention it: "I suggest '{value}'. Is this correct?"
- For dates, specify format (e.g., "YYYY-MM-DD" or "Month DD, YYYY")
- For currency, clarify if needed (e.g., "in USD")
- For complex fields, provide brief context

When receiving a response:
- Extract the value from natural language
- Confirm if unclear
- Validate format (dates, emails, currency)
- Acknowledge and move forward

Respond ONLY with valid JSON in this exact format:
{
  "message": "Your conversational response here",
  "suggestedAction": "fill_field",
  "fieldName": "field_name_here",
  "extractedValue": "extracted value if applicable",
  "confidence": 0.9
}

suggestedAction can be:
- "fill_field": Ready to fill current field with extracted value
- "next_field": Move to next placeholder
- "review": User wants to review previous answers
- "complete": Document is complete
- "clarify": Need clarification from user

If extractedValue is provided, confidence should reflect how certain you are about the extraction (0-1).`;

    super(
      'ConversationalAssistant',
      AgentType.RECOMMENDER,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.7, // Higher temperature for more natural conversation
        max_tokens: 300,
      }
    );
  }

  async execute(input: ConversationalAssistantInput): Promise<ConversationalResponse> {
    try {
      const { conversationHistory, currentPlaceholder, documentContext } = input;

      if (!conversationHistory || !documentContext) {
        throw new Error('conversationHistory and documentContext are required');
      }

      // Build context-aware prompt
      const userPrompt = this.buildConversationalPrompt(
        conversationHistory,
        currentPlaceholder,
        documentContext
      );

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const conversationalResponse = this.parseConversationalResponse(response.content);

      return conversationalResponse;
    } catch (error) {
      console.error('ConversationalAssistant error:', error);

      // Return default helpful response if processing fails
      return {
        message: "I'm having trouble processing that. Could you please rephrase?",
        suggestedAction: 'clarify',
        confidence: 0.0
      };
    }
  }

  private buildConversationalPrompt(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    currentPlaceholder?: {
      fieldName: string;
      fieldType: string;
      suggestedQuestion: string;
      suggestedValue?: string;
    },
    documentContext?: {
      documentType: string;
      completionPercentage: number;
      totalPlaceholders: number;
      filledPlaceholders: number;
    }
  ): string {
    let prompt = `Document Context:
- Type: ${documentContext?.documentType || 'Unknown'}
- Progress: ${documentContext?.filledPlaceholders || 0}/${documentContext?.totalPlaceholders || 0} fields (${documentContext?.completionPercentage || 0}% complete)

`;

    if (currentPlaceholder) {
      prompt += `Current Field:
- Name: ${currentPlaceholder.fieldName}
- Type: ${currentPlaceholder.fieldType}
- Suggested Question: ${currentPlaceholder.suggestedQuestion}
${currentPlaceholder.suggestedValue ? `- Suggested Value: ${currentPlaceholder.suggestedValue}` : ''}

`;
    }

    prompt += `Conversation History:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

`;

    prompt += `Based on the conversation, provide your next response:`;

    return prompt;
  }

  private parseConversationalResponse(content: string): ConversationalResponse {
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanContent);

      // Validate required fields
      if (!parsed.message || typeof parsed.confidence !== 'number') {
        throw new Error('Invalid response format: missing required fields');
      }

      // Ensure confidence is between 0 and 1
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));

      // Validate suggestedAction if present
      const validActions = ['fill_field', 'next_field', 'review', 'complete', 'clarify'];
      if (parsed.suggestedAction && !validActions.includes(parsed.suggestedAction)) {
        parsed.suggestedAction = 'clarify';
      }

      return parsed as ConversationalResponse;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse conversational response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
