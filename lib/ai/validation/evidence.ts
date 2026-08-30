export interface EvidenceValidationResult {
  status: 'evidence_found' | 'no_evidence' | 'insufficient_evidence';
  description: string;
  reason?: string;
  confidence?: number;
  evidence: Array<{
    file: string;
    lineStart: number;
    lineEnd: number;
    code: string;
    explanation: string;
    type: 'direct' | 'supporting';
  }>;
  requiredFiles?: string[];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function parseEvidenceResponse(content: string): EvidenceValidationResult {
  try {
    const parsed = JSON.parse(content);

    const hasEvidence = Array.isArray(parsed.evidence) && parsed.evidence.length > 0;
    let status: EvidenceValidationResult['status'] = 'evidence_found';

    if (parsed.status === 'no_evidence' || parsed.status === 'insufficient_evidence') {
      status = parsed.status;
    } else if (!hasEvidence) {
      status = 'no_evidence';
    }

    const genericPatterns = [
      /insufficient/i,
      /unable to find/i,
      /no concrete/i,
      /cannot determine/i,
      /generic/i,
    ];

    if (hasEvidence) {
      const allGeneric = parsed.evidence.every((ev: { explanation?: string }) => {
        const exp = (ev.explanation || '').toLowerCase();
        return genericPatterns.some((p) => p.test(exp));
      });
      if (allGeneric && parsed.evidence.length <= 2) {
        status = 'insufficient_evidence';
      }
    }

    return {
      status,
      description: typeof parsed.description === 'string' ? parsed.description : 'No description provided',
      reason: typeof parsed.reason === 'string' ? parsed.reason : undefined,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : undefined,
      evidence: hasEvidence ? parsed.evidence : [],
      requiredFiles: Array.isArray(parsed.requiredFiles) ? parsed.requiredFiles : undefined,
    };
  } catch {
    return {
      status: 'no_evidence',
      description: 'Failed to parse AI response',
      reason: 'The AI response could not be parsed',
      evidence: [],
    };
  }
}

export function validateEvidence(result: EvidenceValidationResult): ValidationResult {
  if (!result.description || result.description.length < 5) {
    return { valid: false, error: 'Description too short' };
  }

  if (result.status === 'no_evidence' || result.status === 'insufficient_evidence') {
    return { valid: true };
  }

  if (!Array.isArray(result.evidence) || result.evidence.length === 0) {
    return { valid: false, error: 'No evidence provided' };
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
    if (!ev.code || typeof ev.code !== 'string') {
      return { valid: false, error: 'Missing evidence code' };
    }
    if (!ev.explanation || typeof ev.explanation !== 'string') {
      return { valid: false, error: 'Missing evidence explanation' };
    }
    if (ev.type !== 'direct' && ev.type !== 'supporting') {
      return { valid: false, error: 'Invalid evidence type' };
    }
  }

  return { valid: true };
}
