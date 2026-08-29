import { IssueContext, RepositoryFileRecord, RepositoryFingerprint } from '@/types';

interface DeterministicCandidate {
  path: string;
  score: number;
  reason: string;
}

const HIGH_VALUE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'rb', 'php',
  'vue', 'svelte', 'astro', 'css', 'scss', 'less', 'html',
]);

const LOW_VALUE_EXTENSIONS = new Set([
  'lock', 'sum', 'map', 'min.js', 'min.css', 'svg', 'png', 'jpg',
  'ico', 'woff', 'woff2', 'ttf', 'eot',
]);

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const stopwords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'has', 'his', 'how', 'its', 'may',
    'new', 'now', 'old', 'see', 'way', 'who', 'did', 'get', 'let', 'say',
    'she', 'too', 'use', 'with', 'that', 'this', 'will', 'each', 'make',
    'like', 'long', 'look', 'many', 'some', 'than', 'them', 'then',
    'these', 'from', 'have', 'been', 'said', 'more', 'when', 'what',
    'your', 'there', 'their', 'about', 'would', 'which', 'other',
    'into', 'just', 'also', 'after', 'before', 'being', 'does', 'doing',
    'should', 'could', 'might', 'must', 'here', 'where', 'why', 'how',
    'because', 'through', 'during', 'between', 'under', 'above',
  ]);

  return [...new Set(words.filter((w) => !stopwords.has(w)))];
}

function scoreFile(
  path: string,
  language: string,
  keywords: string[],
  fingerprint: RepositoryFingerprint
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const pathLower = path.toLowerCase();
  const pathParts = pathLower.split('/');
  const filename = pathParts[pathParts.length - 1];
  const ext = filename.split('.').pop() || '';

  if (HIGH_VALUE_EXTENSIONS.has(ext)) {
    score += 0.2;
    reasons.push('source file');
  }

  if (LOW_VALUE_EXTENSIONS.has(ext)) {
    score -= 0.3;
    reasons.push('low-value file');
  }

  const sourceDirs = fingerprint.sourceDirectories.map((d) => d.toLowerCase());
  const inSourceDir = sourceDirs.some((d) => pathLower.startsWith(d + '/'));
  if (inSourceDir) {
    score += 0.3;
    reasons.push('in source directory');
  }

  const testDirs = fingerprint.testDirectories.map((d) => d.toLowerCase());
  const inTestDir = testDirs.some((d) => pathLower.includes('/' + d + '/'));
  if (inTestDir) {
    score -= 0.1;
    reasons.push('test file');
  }

  for (const keyword of keywords) {
    if (pathLower.includes(keyword)) {
      score += 0.4;
      reasons.push(`path matches keyword "${keyword}"`);
      break;
    }
  }

  for (const keyword of keywords) {
    if (filename.includes(keyword)) {
      score += 0.2;
      reasons.push(`filename matches "${keyword}"`);
      break;
    }
  }

  if (pathParts.length <= 3) {
    score += 0.05;
  }

  if (pathParts.length >= 4) {
    score += 0.05;
  }

  if (fingerprint.primaryLanguage && language === fingerprint.primaryLanguage) {
    score += 0.1;
    reasons.push('primary language');
  }

  return { score, reasons };
}

export function deterministicPreFilter(
  files: RepositoryFileRecord[],
  issue: IssueContext,
  fingerprint: RepositoryFingerprint
): DeterministicCandidate[] {
  const allText = `${issue.title} ${issue.body} ${issue.labels.join(' ')}`;
  const keywords = extractKeywords(allText);

  const candidates = files
    .filter((f) => !f.is_ignored)
    .map((file) => {
      const { score, reasons } = scoreFile(file.path, file.language, keywords, fingerprint);
      return {
        path: file.path,
        score,
        reason: reasons.join('; ') || 'general candidate',
      };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  return candidates.slice(0, 50);
}
