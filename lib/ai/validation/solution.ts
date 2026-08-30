export interface SolutionResult {
  summary: string;
  description: string;
  steps: string[];
  affectedFiles: Array<{
    path: string;
    change: string;
  }>;
  risks: string[];
  confidence: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function parseSolutionResponse(content: string): SolutionResult {
  try {
    const parsed = JSON.parse(content);

    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : 'No summary',
      description: typeof parsed.description === 'string' ? parsed.description : 'No description',
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      affectedFiles: Array.isArray(parsed.affectedFiles) ? parsed.affectedFiles : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    };
  } catch {
    return {
      summary: 'Failed to parse AI response',
      description: 'The AI model returned an invalid response format.',
      steps: [],
      affectedFiles: [],
      risks: [],
      confidence: 0,
    };
  }
}

export function validateSolution(result: SolutionResult): ValidationResult {
  if (!result.summary || result.summary.length < 10) {
    return { valid: false, error: 'Summary too short' };
  }

  if (!result.description || result.description.length < 20) {
    return { valid: false, error: 'Description too short' };
  }

  if (!Array.isArray(result.steps) || result.steps.length === 0) {
    return { valid: false, error: 'No steps provided' };
  }

  if (typeof result.confidence !== 'number') {
    return { valid: false, error: 'Invalid confidence value' };
  }

  if (result.confidence < 0 || result.confidence > 1) {
    return { valid: false, error: 'Confidence must be between 0 and 1' };
  }

  for (const file of result.affectedFiles) {
    if (!file.path || typeof file.path !== 'string') {
      return { valid: false, error: 'Invalid affected file path' };
    }
    if (!file.change || typeof file.change !== 'string') {
      return { valid: false, error: 'Invalid affected file change' };
    }
  }

  return { valid: true };
}
