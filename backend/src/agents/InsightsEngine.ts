// backend/src/agents/InsightsEngine.ts
import { BaseAgent } from './BaseAgent';
import { AgentType } from '@smartdocs/common';
import { MODELS } from '../config/openai';

interface InsightsEngineInput {
  userId: string;
  documents: Array<{
    documentId: string;
    documentType: string;
    status: string;
    createdAt: string;
    completedAt?: string;
    placeholders: Array<{
      fieldName: string;
      fieldType: string;
      value: string | null;
    }>;
    healthScore?: number;
  }>;
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface BusinessInsights {
  summary: {
    totalDocuments: number;
    completedDocuments: number;
    averageHealthScore: number;
    mostCommonDocumentType: string;
    documentsByType: Record<string, number>;
    documentsByStatus: Record<string, number>;
  };
  patterns: Array<{
    type: 'trend' | 'anomaly' | 'correlation' | 'frequency';
    title: string;
    description: string;
    significance: 'high' | 'medium' | 'low';
    affectedDocuments: string[];
    dataPoints?: Record<string, any>;
  }>;
  recommendations: Array<{
    category: 'efficiency' | 'compliance' | 'process' | 'data_quality';
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
    reasoning: string;
    expectedImpact: string;
  }>;
  risks: Array<{
    severity: 'critical' | 'warning' | 'info';
    riskType: string;
    description: string;
    affectedDocuments: string[];
    mitigation: string;
  }>;
  opportunities: Array<{
    opportunityType: string;
    description: string;
    potentialValue: string;
    actionItems: string[];
  }>;
  metrics: {
    averageCompletionTime?: number; // in days
    documentVelocity?: number; // docs per month
    errorRate?: number; // percentage
    automationRate?: number; // percentage of auto-filled fields
    [key: string]: any;
  };
}

export class InsightsEngine extends BaseAgent {
  constructor() {
    const systemPrompt = `You are an expert business intelligence and insights engine for legal document workflows. Your task is to analyze document patterns and generate actionable insights for law firms and legal teams.

Analyze the provided document data and generate:

1. Summary Statistics:
   - Total documents, completion rate, average health scores
   - Distribution by document type and status
   - Key metrics and trends

2. Pattern Recognition:
   - Trends (increasing/decreasing activity, seasonal patterns)
   - Anomalies (unusual documents, outliers, unexpected patterns)
   - Correlations (relationships between metrics)
   - Frequency patterns (common document combinations, workflows)

3. Recommendations:
   - Efficiency improvements (streamline processes, reduce time)
   - Compliance enhancements (reduce risks, improve quality)
   - Process optimizations (better workflows, automation opportunities)
   - Data quality improvements (standardization, validation)

4. Risk Analysis:
   - Critical risks requiring immediate attention
   - Warnings about potential issues
   - Informational alerts

5. Opportunities:
   - Process automation opportunities
   - Template creation opportunities
   - Knowledge sharing opportunities
   - Time-saving opportunities

6. Key Metrics:
   - Average time to complete documents
   - Document creation velocity (docs/month)
   - Error rate (low health scores, conflicts)
   - Automation rate (percentage of auto-filled vs manual)

Focus on:
- Actionable insights (not just observations)
- Business value and ROI
- Practical recommendations
- Risk mitigation
- Efficiency gains

Respond ONLY with valid JSON in this exact format:
{
  "summary": {
    "totalDocuments": 45,
    "completedDocuments": 38,
    "averageHealthScore": 87,
    "mostCommonDocumentType": "SAFE Agreement",
    "documentsByType": {
      "SAFE Agreement": 20,
      "NDA": 15,
      "Employment Agreement": 10
    },
    "documentsByStatus": {
      "completed": 38,
      "in_progress": 5,
      "draft": 2
    }
  },
  "patterns": [
    {
      "type": "trend",
      "title": "Increasing SAFE volume",
      "description": "SAFE agreement creation has increased 40% in the last 3 months, indicating active fundraising",
      "significance": "high",
      "affectedDocuments": ["doc-1", "doc-2"],
      "dataPoints": {
        "previousMonth": 5,
        "currentMonth": 7,
        "growthRate": 0.4
      }
    }
  ],
  "recommendations": [
    {
      "category": "efficiency",
      "priority": "high",
      "recommendation": "Create a SAFE template library",
      "reasoning": "20 SAFE agreements created with similar structure - template would save 15 minutes per document",
      "expectedImpact": "5 hours saved per month"
    }
  ],
  "risks": [
    {
      "severity": "warning",
      "riskType": "data_quality",
      "description": "3 documents have health scores below 60",
      "affectedDocuments": ["doc-12", "doc-23", "doc-31"],
      "mitigation": "Review and complete these documents before finalization"
    }
  ],
  "opportunities": [
    {
      "opportunityType": "automation",
      "description": "Company address field is manually entered in every document",
      "potentialValue": "Could auto-fill from data room, saving 2 minutes per document",
      "actionItems": [
        "Upload company profile to data room",
        "Enable auto-fill for address fields"
      ]
    }
  ],
  "metrics": {
    "averageCompletionTime": 3.5,
    "documentVelocity": 15,
    "errorRate": 8,
    "automationRate": 45
  }
}

If insufficient data:
{
  "summary": {
    "totalDocuments": 2,
    "completedDocuments": 1,
    "averageHealthScore": 75,
    "mostCommonDocumentType": "NDA",
    "documentsByType": {"NDA": 2},
    "documentsByStatus": {"completed": 1, "draft": 1}
  },
  "patterns": [],
  "recommendations": [
    {
      "category": "process",
      "priority": "medium",
      "recommendation": "Continue creating documents to build data for insights",
      "reasoning": "More documents needed for pattern analysis",
      "expectedImpact": "Better insights with more data"
    }
  ],
  "risks": [],
  "opportunities": [],
  "metrics": {
    "averageCompletionTime": 0,
    "documentVelocity": 0,
    "errorRate": 0,
    "automationRate": 0
  }
}

Be insightful, practical, and business-focused. Prioritize high-value, actionable insights.`;

    super(
      'InsightsEngine',
      AgentType.ANALYZER,
      MODELS.GPT4_TURBO,
      systemPrompt,
      {
        temperature: 0.4, // Moderate temperature for creative insights
        max_tokens: 3500,
      }
    );
  }

  async execute(input: InsightsEngineInput): Promise<BusinessInsights> {
    try {
      const { userId, documents, timeRange } = input;

      if (!userId || !Array.isArray(documents)) {
        throw new Error('userId and documents array are required');
      }

      // If very few documents, return minimal insights
      if (documents.length === 0) {
        return this.getMinimalInsights();
      }

      // Use retry with backoff for API call
      const response = await this.retryWithBackoff(async () => {
        const userPrompt = this.buildInsightsPrompt(documents, timeRange);
        return await this.callOpenAI(userPrompt);
      });

      // Parse JSON response
      const insights = this.parseInsightsResponse(response.content);

      return insights;
    } catch (error) {
      console.error('InsightsEngine error:', error);

      // Return minimal insights if analysis fails
      return this.getMinimalInsights();
    }
  }

  private buildInsightsPrompt(
    documents: Array<{
      documentId: string;
      documentType: string;
      status: string;
      createdAt: string;
      completedAt?: string;
      placeholders: Array<{ fieldName: string; fieldType: string; value: string | null }>;
      healthScore?: number;
    }>,
    timeRange?: { start: string; end: string }
  ): string {
    const docsSummary = documents.map((doc, idx) => {
      const filledCount = doc.placeholders.filter(p => p.value).length;
      const totalCount = doc.placeholders.length;
      const completionRate = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

      return `${idx + 1}. ${doc.documentType} (${doc.status})
   Created: ${doc.createdAt}${doc.completedAt ? `, Completed: ${doc.completedAt}` : ''}
   Health Score: ${doc.healthScore || 'N/A'}
   Fields: ${filledCount}/${totalCount} filled (${completionRate}%)`;
    }).join('\n');

    let prompt = `Analyze these documents and generate business insights:\n\n${docsSummary}`;

    if (timeRange) {
      prompt += `\n\nTime Range: ${timeRange.start} to ${timeRange.end}`;
    }

    prompt += '\n\nGenerate comprehensive insights including patterns, recommendations, risks, opportunities, and metrics.';

    return prompt;
  }

  private getMinimalInsights(): BusinessInsights {
    return {
      summary: {
        totalDocuments: 0,
        completedDocuments: 0,
        averageHealthScore: 0,
        mostCommonDocumentType: 'N/A',
        documentsByType: {},
        documentsByStatus: {}
      },
      patterns: [],
      recommendations: [
        {
          category: 'process',
          priority: 'low',
          recommendation: 'Start creating documents to enable insights',
          reasoning: 'Insufficient data for pattern analysis',
          expectedImpact: 'Insights will improve with more documents'
        }
      ],
      risks: [],
      opportunities: [],
      metrics: {
        averageCompletionTime: 0,
        documentVelocity: 0,
        errorRate: 0,
        automationRate: 0
      }
    };
  }

  private parseInsightsResponse(content: string): BusinessInsights {
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanContent);

      // Validate required top-level fields
      if (
        !parsed.summary ||
        !Array.isArray(parsed.patterns) ||
        !Array.isArray(parsed.recommendations) ||
        !Array.isArray(parsed.risks) ||
        !Array.isArray(parsed.opportunities) ||
        !parsed.metrics
      ) {
        throw new Error('Invalid response format: missing required fields');
      }

      // Validate summary
      if (
        typeof parsed.summary.totalDocuments !== 'number' ||
        typeof parsed.summary.completedDocuments !== 'number' ||
        !parsed.summary.documentsByType ||
        !parsed.summary.documentsByStatus
      ) {
        throw new Error('Invalid summary format');
      }

      // Ensure averageHealthScore is a number
      if (typeof parsed.summary.averageHealthScore !== 'number') {
        parsed.summary.averageHealthScore = 0;
      }
      parsed.summary.averageHealthScore = Math.max(0, Math.min(100, Math.round(parsed.summary.averageHealthScore)));

      // Validate patterns
      const validPatternTypes = ['trend', 'anomaly', 'correlation', 'frequency'];
      const validSignificances = ['high', 'medium', 'low'];
      parsed.patterns = parsed.patterns.filter((pattern: any) => {
        if (!pattern.type || !pattern.title || !pattern.description || !pattern.significance) {
          return false;
        }
        if (!validPatternTypes.includes(pattern.type)) {
          pattern.type = 'trend';
        }
        if (!validSignificances.includes(pattern.significance)) {
          pattern.significance = 'medium';
        }
        if (!Array.isArray(pattern.affectedDocuments)) {
          pattern.affectedDocuments = [];
        }
        return true;
      });

      // Validate recommendations
      const validCategories = ['efficiency', 'compliance', 'process', 'data_quality'];
      const validPriorities = ['high', 'medium', 'low'];
      parsed.recommendations = parsed.recommendations.filter((rec: any) => {
        if (!rec.category || !rec.priority || !rec.recommendation || !rec.reasoning || !rec.expectedImpact) {
          return false;
        }
        if (!validCategories.includes(rec.category)) {
          rec.category = 'process';
        }
        if (!validPriorities.includes(rec.priority)) {
          rec.priority = 'medium';
        }
        return true;
      });

      // Validate risks
      const validSeverities = ['critical', 'warning', 'info'];
      parsed.risks = parsed.risks.filter((risk: any) => {
        if (!risk.severity || !risk.riskType || !risk.description || !risk.mitigation) {
          return false;
        }
        if (!validSeverities.includes(risk.severity)) {
          risk.severity = 'info';
        }
        if (!Array.isArray(risk.affectedDocuments)) {
          risk.affectedDocuments = [];
        }
        return true;
      });

      // Validate opportunities
      parsed.opportunities = parsed.opportunities.filter((opp: any) => {
        if (!opp.opportunityType || !opp.description || !opp.potentialValue) {
          return false;
        }
        if (!Array.isArray(opp.actionItems)) {
          opp.actionItems = [];
        }
        return true;
      });

      // Validate metrics
      if (!parsed.metrics || typeof parsed.metrics !== 'object') {
        parsed.metrics = {};
      }

      return parsed as BusinessInsights;
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error(`Failed to parse insights response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
