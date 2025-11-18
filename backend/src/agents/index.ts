// backend/src/agents/index.ts
// Export all AI agents for easy importing

export { BaseAgent } from './BaseAgent';
export { DocumentAnalyzer } from './DocumentAnalyzer';
export { PlaceholderExtractor } from './PlaceholderExtractor';
export { EntityMatcher } from './EntityMatcher';
export { ConversationalAssistant } from './ConversationalAssistant';
export { ComplianceValidator } from './ComplianceValidator';
export { HealthScoreCalculator } from './HealthScoreCalculator';
export { TemplateAnalyzer } from './TemplateAnalyzer';
export { ConflictDetector } from './ConflictDetector';
export { MultiDocIntelligence } from './MultiDocIntelligence';
export { NLSearchAgent } from './NLSearchAgent';
export { InsightsEngine } from './InsightsEngine';

// Re-export types for convenience
export type { PlaceholderData } from './PlaceholderExtractor';
export type { EntityMatch } from './EntityMatcher';
export type { HealthScore } from './HealthScoreCalculator';
export type { TemplateAnalysis } from './TemplateAnalyzer';
export type { ConflictDetection } from './ConflictDetector';
export type { MultiDocIntelligenceResult } from './MultiDocIntelligence';
export type { NLSearchResult } from './NLSearchAgent';
export type { BusinessInsights } from './InsightsEngine';
