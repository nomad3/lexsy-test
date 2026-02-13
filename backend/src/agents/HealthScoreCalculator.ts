// backend/src/agents/HealthScoreCalculator.ts
import { BaseAgent } from './BaseAgent';
import { AgentType } from '@smartdocs/common';
import { MODELS } from '../config/openai';

interface HealthScoreInput {
  documentId: string;
  documentType: string;
  totalPlaceholders: number;
  filledPlaceholders: number;
  validationIssues: Array<{
    severity: 'critical' | 'warning' | 'info';
    issue: string;
  }>;
  conflicts: Array<{
    severity: 'critical' | 'warning' | 'info';
    description: string;
  }>;
}

export interface HealthScore {
  overallScore: number; // 0-100
  completenessScore: number; // 0-100
  consistencyScore: number; // 0-100
  riskScore: number; // 0-100
  issues: string[];
  recommendations: string[];
  status: 'excellent' | 'good' | 'fair' | 'needs_attention' | 'critical';
}

export class HealthScoreCalculator extends BaseAgent {
  constructor() {
    const systemPrompt = `You are an expert document health score calculator. Your task is to calculate comprehensive health metrics for legal documents.

Analyze the provided document metrics and calculate:

1. Overall Score (0-100): Combined health metric
2. Completeness Score (0-100): Based on filled vs total placeholders
3. Consistency Score (0-100): Based on validation issues and conflicts
4. Risk Score (0-100): Based on severity of issues (higher = more risk)

Scoring Guidelines:
- Completeness: (filled/total) * 100, with penalties for critical unfilled fields
- Consistency: 100 minus deductions for validation issues (critical: -20, warning: -5, info: -1)
- Risk: Sum of risk factors (critical issues: +30, warnings: +10, conflicts: +15)
- Overall: Weighted average (completeness: 40%, consistency: 35%, risk_inverse: 25%)

Status Categories:
- excellent (90-100): Ready to use, no significant issues
- good (75-89): Minor issues to address
- fair (60-74): Several issues need attention
- needs_attention (40-59): Significant issues present
- critical (0-39): Major problems, not ready for use

Provide actionable issues and recommendations.

Respond ONLY with valid JSON in this exact format:
{
  "overallScore": 85,
  "completenessScore": 90,
  "consistencyScore": 85,
  "riskScore": 20,
  "issues": [
    "3 placeholders remain unfilled",
    "1 warning-level validation issue detected"
  ],
  "recommendations": [
    "Complete remaining fields before finalizing",
    "Review the warning about investment amount"
  ],
  "status": "good"
}`;

    super(
      'HealthScoreCalculator',
      AgentType.ANALYZER,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.1, // Very low temperature for consistent scoring
        max_tokens: 800,
      }
    );
  }

  async execute(input: HealthScoreInput): Promise<HealthScore> {
    try {
      const { documentId, documentType, totalPlaceholders, filledPlaceholders, validationIssues, conflicts } = input;

      if (!documentId || typeof totalPlaceholders !== 'number' || typeof filledPlaceholders !== 'number') {
        throw new Error('documentId, totalPlaceholders, and filledPlaceholders are required');
      }

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        const userPrompt = this.buildHealthPrompt(
          documentType,
          totalPlaceholders,
          filledPlaceholders,
          validationIssues || [],
          conflicts || []
        );
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const healthScore = this.parseHealthResponse(response.content);

      return healthScore;
    } catch (error) {
      console.error('HealthScoreCalculator error:', error);

      // Return conservative health score if calculation fails
      return {
        overallScore: 0,
        completenessScore: 0,
        consistencyScore: 0,
        riskScore: 100,
        issues: ['Health score calculation failed'],
        recommendations: ['Please retry or review document manually'],
        status: 'critical'
      };
    }
  }

  private buildHealthPrompt(
    documentType: string,
    totalPlaceholders: number,
    filledPlaceholders: number,
    validationIssues: Array<{ severity: string; issue: string }>,
    conflicts: Array<{ severity: string; description: string }>
  ): string {
    const completionPercentage = totalPlaceholders > 0
      ? Math.round((filledPlaceholders / totalPlaceholders) * 100)
      : 0;

    const criticalIssues = validationIssues.filter(i => i.severity === 'critical').length;
    const warningIssues = validationIssues.filter(i => i.severity === 'warning').length;
    const infoIssues = validationIssues.filter(i => i.severity === 'info').length;

    const criticalConflicts = conflicts.filter(c => c.severity === 'critical').length;
    const warningConflicts = conflicts.filter(c => c.severity === 'warning').length;

    return `Calculate health score for this document:

Document Type: ${documentType}
Completion: ${filledPlaceholders}/${totalPlaceholders} fields (${completionPercentage}%)

Validation Issues:
- Critical: ${criticalIssues}
- Warnings: ${warningIssues}
- Info: ${infoIssues}

Conflicts Detected:
- Critical: ${criticalConflicts}
- Warnings: ${warningConflicts}

Calculate comprehensive health scores and provide specific issues and recommendations.`;
  }

  private parseHealthResponse(content: string): HealthScore {
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
        typeof parsed.overallScore !== 'number' ||
        typeof parsed.completenessScore !== 'number' ||
        typeof parsed.consistencyScore !== 'number' ||
        typeof parsed.riskScore !== 'number' ||
        !Array.isArray(parsed.issues) ||
        !Array.isArray(parsed.recommendations) ||
        !parsed.status
      ) {
        throw new Error('Invalid response format: missing required fields');
      }

      // Ensure all scores are between 0 and 100
      parsed.overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore)));
      parsed.completenessScore = Math.max(0, Math.min(100, Math.round(parsed.completenessScore)));
      parsed.consistencyScore = Math.max(0, Math.min(100, Math.round(parsed.consistencyScore)));
      parsed.riskScore = Math.max(0, Math.min(100, Math.round(parsed.riskScore)));

      // Validate status
      const validStatuses = ['excellent', 'good', 'fair', 'needs_attention', 'critical'];
      if (!validStatuses.includes(parsed.status)) {
        // Derive status from overall score
        if (parsed.overallScore >= 90) parsed.status = 'excellent';
        else if (parsed.overallScore >= 75) parsed.status = 'good';
        else if (parsed.overallScore >= 60) parsed.status = 'fair';
        else if (parsed.overallScore >= 40) parsed.status = 'needs_attention';
        else parsed.status = 'critical';
      }

      return parsed as HealthScore;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse health score response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
