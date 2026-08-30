export interface RootCauseResult {
  rootCause: {
    summary: string;
    explanation: string;
    confidence: number;
  };
  affectedFiles: Array<{
    path: string;
    reason: string;
  }>;
  evidence: Array<{
    file: string;
    lineStart: number;
    lineEnd: number;
    explanation: string;
  }>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function parseRootCauseResponse(content: string): RootCauseResult {
  try {
    const parsed = JSON.parse(content);

    if (!parsed.rootCause || typeof parsed.rootCause !== 'object') {
      throw new Error('Missing rootCause object');
    }

    return {
      rootCause: {
        summary: typeof parsed.rootCause.summary === 'string' ? parsed.rootCause.summary : 'No summary',
        explanation: typeof parsed.rootCause.explanation === 'string' ? parsed.rootCause.explanation : 'No explanation',
        confidence: typeof parsed.rootCause.confidence === 'number' ? parsed.rootCause.confidence : 0.5,
      },
      affectedFiles: Array.isArray(parsed.affectedFiles) ? parsed.affectedFiles : [],
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
    };
  } catch {
    return {
      rootCause: {
        summary: 'Failed to parse AI response',
        explanation: 'The AI model returned an invalid response format.',
        confidence: 0,
      },
      affectedFiles: [],
      evidence: [],
    };
  }
}

export function validateRootCause(result: RootCauseResult): ValidationResult {
  if (!result.rootCause) {
    return { valid: false, error: 'Missing root cause' };
  }

  if (typeof result.rootCause.confidence !== 'number') {
    return { valid: false, error: 'Invalid confidence value' };
  }

  if (result.rootCause.confidence < 0 || result.rootCause.confidence > 1) {
    return { valid: false, error: 'Confidence must be between 0 and 1' };
  }

  if (!result.rootCause.summary || result.rootCause.summary.length < 10) {
    return { valid: false, error: 'Summary too short' };
  }

  if (!result.rootCause.explanation || result.rootCause.explanation.length < 20) {
    return { valid: false, error: 'Explanation too short' };
  }

  if (result.rootCause.confidence < 0.3 && result.affectedFiles.length === 0) {
    return {
      valid: false,
      error: `Insufficient analysis: confidence ${Math.round(result.rootCause.confidence * 100)}% with no affected files identified. The model failed to analyze the provided source code. Retry with fallback model.`,
    };
  }

  const genericPatterns = [
    /insufficient code provided/i,
    /cannot determine/i,
    /unable to identify/i,
    /no clear root cause/i,
    /more context needed/i,
    /search the codebase/i,
    /generic/i,
  ];

  const summaryLower = result.rootCause.summary.toLowerCase();
  const explanationLower = result.rootCause.explanation.toLowerCase();
  const isGeneric = genericPatterns.some(
    (p) => p.test(result.rootCause.summary) || p.test(result.rootCause.explanation)
  );

  if (isGeneric && result.affectedFiles.length === 0) {
    return {
      valid: false,
      error: `Generic response detected: "${result.rootCause.summary.slice(0, 100)}". The model did not perform actual code analysis. Retry with fallback model.`,
    };
  }

  for (const file of result.affectedFiles) {
    if (!file.path || typeof file.path !== 'string') {
      return { valid: false, error: 'Invalid affected file path' };
    }
    if (!file.reason || typeof file.reason !== 'string') {
      return { valid: false, error: 'Invalid affected file reason' };
    }
  }

  for (const ev of result.evidence) {
    if (!ev.file || typeof ev.file !== 'string') {
      return { valid: false, error: 'Invalid evidence file path' };
    }
    if (typeof ev.lineStart !== 'number' || typeof ev.lineEnd !== 'number') {
      return { valid: false, error: 'Invalid evidence line numbers' };
    }
    if (ev.lineStart < 1 || ev.lineEnd < ev.lineStart) {
      return { valid: false, error: 'Invalid evidence line range' };
    }
  }

  return { valid: true };
}
