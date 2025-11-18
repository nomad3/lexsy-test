export enum PlaceholderFieldType {
  TEXT = 'text',
  DATE = 'date',
  CURRENCY = 'currency',
  NUMBER = 'number',
  EMAIL = 'email',
  ADDRESS = 'address'
}

export enum ValidationStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  FLAGGED = 'flagged'
}

export interface Placeholder {
  id: string;
  documentId: string;
  fieldName: string;
  fieldType: PlaceholderFieldType;
  originalText: string;
  position: number;
  filledValue?: string;
  aiSuggestedValue?: string;
  suggestionSource?: string;
  confidence: number;
  validationStatus: ValidationStatus;
  validationNotes?: string;
}
