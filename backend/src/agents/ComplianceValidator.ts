// backend/src/agents/ComplianceValidator.ts
import { BaseAgent } from './BaseAgent';
import { AgentType } from '@smartdocs/common';
import { MODELS } from '../config/openai';

interface ComplianceValidatorInput {
  documentId: string;
  documentType: string;
  placeholders: Array<{
    fieldName: string;
    fieldType: string;
    filledValue?: string;
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  overallScore: number; // 0-100
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    fieldName?: string;
    issue: string;
    suggestion: string;
  }>;
  summary: string;
}

export class ComplianceValidator extends BaseAgent {
  constructor() {
    const systemPrompt = `You are an expert legal compliance validator. Your task is to validate filled legal documents for completeness, format compliance, and potential issues.

Analyze the provided document and its filled placeholders to identify:
1. Missing required fields
2. Format validation errors (dates, emails, currency, numbers)
3. Inconsistencies or unusual values
4. Potential legal or compliance issues
5. Best practice violations

Categorize issues by severity:
- CRITICAL: Must be fixed before document can be used (missing required fields, invalid formats)
- WARNING: Should be reviewed (unusual values, potential issues)
- INFO: Suggestions for improvement

For each issue provide:
- Severity level
- Field name (if applicable)
- Clear description of the issue
- Specific suggestion for resolution

Calculate an overall compliance score (0-100):
- 100: Perfect, no issues
- 80-99: Minor warnings only
- 60-79: Some warnings to address
- 40-59: Multiple warnings or some critical issues
- 0-39: Major critical issues

Respond ONLY with valid JSON in this exact format:
{
  "isValid": true,
  "overallScore": 95,
  "issues": [
    {
      "severity": "warning",
      "fieldName": "investment_amount",
      "issue": "Investment amount seems unusually high",
      "suggestion": "Verify the amount is correct: $10,000,000"
    }
  ],
  "summary": "Document is mostly compliant with 1 warning to review"
}

If no issues found:
{
  "isValid": true,
  "overallScore": 100,
  "issues": [],
  "summary": "Document passes all compliance checks"
}

Be thorough but practical - focus on real issues that could cause problems.`;

    super(
      'ComplianceValidator',
      AgentType.VALIDATOR,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.2, // Low temperature for consistent validation
        max_tokens: 1500,
      }
    );
  }

  async execute(input: ComplianceValidatorInput): Promise<ValidationResult> {
    try {
      const { documentId, documentType, placeholders } = input;

      if (!documentId || !documentType || !placeholders) {
        throw new Error('documentId, documentType, and placeholders are required');
      }

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        const userPrompt = this.buildValidationPrompt(documentType, placeholders);
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const validationResult = this.parseValidationResponse(response.content);

      return validationResult;
    } catch (error) {
      console.error('ComplianceValidator error:', error);

      // Return conservative validation result if validation fails
      return {
        isValid: false,
        overallScore: 0,
        issues: [{
          severity: 'critical',
          issue: 'Validation system error',
          suggestion: 'Please retry validation or review document manually'
        }],
        summary: 'Unable to complete validation due to system error'
      };
    }
  }

  private buildValidationPrompt(
    documentType: string,
    placeholders: Array<{ fieldName: string; fieldType: string; filledValue?: string }>
  ): string {
    const filledFields = placeholders.filter(p => p.filledValue);
    const unfilledFields = placeholders.filter(p => !p.filledValue);

    let prompt = `Document Type: ${documentType}

Total Placeholders: ${placeholders.length}
Filled: ${filledFields.length}
Unfilled: ${unfilledFields.length}

Filled Fields:
${filledFields.length > 0 ? filledFields.map(p =>
  `- ${p.fieldName} (${p.fieldType}): "${p.filledValue}"`
).join('\n') : 'None'}

Unfilled Fields:
${unfilledFields.length > 0 ? unfilledFields.map(p =>
  `- ${p.fieldName} (${p.fieldType})`
).join('\n') : 'None'}

Validate this document for compliance and completeness:`;

    return prompt;
  }

  private parseValidationResponse(content: string): ValidationResult {
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
      if (
        typeof parsed.isValid !== 'boolean' ||
        typeof parsed.overallScore !== 'number' ||
        !Array.isArray(parsed.issues) ||
        !parsed.summary
      ) {
        throw new Error('Invalid response format: missing required fields');
      }

      // Ensure score is between 0 and 100
      parsed.overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore)));

      // Validate each issue
      parsed.issues = parsed.issues.filter((issue: any) => {
        const validSeverities = ['critical', 'warning', 'info'];
        return (
          validSeverities.includes(issue.severity) &&
          issue.issue &&
          issue.suggestion
        );
      });

      return parsed as ValidationResult;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse validation response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
