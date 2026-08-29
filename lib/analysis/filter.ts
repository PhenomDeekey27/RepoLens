const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  '.vercel',
  '.netlify',
  'dist',
  'build',
  'out',
  'coverage',
  '.nyc_output',
  'vendor',
  '.cache',
  '.parcel-cache',
  'tmp',
  'temp',
  '.tmp',
  '.temp',
  '__pycache__',
  '.pytest_cache',
  '.mypy_cache',
  '.tox',
  'venv',
  '.venv',
  'env',
  '.env',
  'target',
  '.gradle',
  '.idea',
  '.vscode',
  '.vs',
  'thumbs.db',
  '.DS_Store',
  'bower_components',
  '.sass-cache',
  'pkg',
  'bin',
  'obj',
  '.terraform',
  '.vagrant',
  'elm-stuff',
  '.spago',
  'node_modules',
]);

const IGNORED_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ico',
  'bmp',
  'tiff',
  'tif',
  'mp4',
  'mov',
  'avi',
  'mkv',
  'webm',
  'mp3',
  'wav',
  'ogg',
  'flac',
  'zip',
  'tar',
  'gz',
  'bz2',
  'xz',
  '7z',
  'rar',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'woff',
  'woff2',
  'ttf',
  'eot',
  'otf',
  'sqlite',
  'db',
  'lock',
]);

const ALWAYS_KEEP_FILES = new Set([
  'package.json',
  'tsconfig.json',
  'tsconfig.build.json',
  'jsconfig.json',
  'next.config.js',
  'next.config.mjs',
  'next.config.ts',
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.ts',
  'webpack.config.js',
  'webpack.config.ts',
  'rollup.config.js',
  'rollup.config.mjs',
  'rollup.config.ts',
  'esbuild.config.js',
  'tailwind.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'postcss.config.mjs',
  'postcss.config.ts',
  'babel.config.js',
  '.babelrc',
  'jest.config.js',
  'jest.config.ts',
  'vitest.config.ts',
  'vitest.config.js',
  '.eslintrc.js',
  '.eslintrc.json',
  'eslint.config.js',
  'eslint.config.mjs',
  '.prettierrc',
  '.prettierrc.json',
  'prettier.config.js',
  '.editorconfig',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'Makefile',
  'CMakeLists.txt',
  'README.md',
  'README.rst',
  'README.txt',
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'requirements.txt',
  'pyproject.toml',
  'setup.py',
  'setup.cfg',
  'Pipfile',
  'poetry.lock',
  'Cargo.toml',
  'go.mod',
  'go.sum',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'Gemfile',
  'Gemfile.lock',
  '.env.example',
  '.env.template',
  '.gitignore',
  '.gitattributes',
  'Procfile',
  'vercel.json',
  'netlify.toml',
  'renovate.json',
  '.github/dependabot.yml',
]);

export interface TreeEntry {
  path: string;
  mode: string;
  type: string;
  size?: number;
  sha: string;
}

export interface FilteredFile {
  path: string;
  type: 'file' | 'blob';
  size: number;
  sha: string;
  language: string;
  isIgnored: boolean;
}

function getFilename(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot + 1).toLowerCase();
}

function isIgnoredDirectory(path: string): boolean {
  const parts = path.split('/');
  return parts.some((part) => IGNORED_DIRECTORIES.has(part));
}

function isIgnoredFile(filename: string, ext: string): boolean {
  if (ALWAYS_KEEP_FILES.has(filename)) return false;
  if (IGNORED_EXTENSIONS.has(ext)) return true;
  if (filename.endsWith('.min.js') || filename.endsWith('.min.css')) return true;
  if (filename.endsWith('.map')) return true;
  if (filename.endsWith('.lock') && filename !== 'Pipfile.lock') return true;
  return false;
}

export function filterTreeEntries(
  entries: TreeEntry[],
  detectLanguageFn: (path: string) => string
): FilteredFile[] {
  return entries
    .filter((entry) => entry.type === 'blob')
    .map((entry) => {
      const filename = getFilename(entry.path);
      const ext = getExtension(filename);
      const ignored = isIgnoredDirectory(entry.path) || isIgnoredFile(filename, ext);
      const language = detectLanguageFn(entry.path);

      return {
        path: entry.path,
        type: 'file' as const,
        size: entry.size || 0,
        sha: entry.sha,
        language,
        isIgnored: ignored,
      };
    });
}

export function getActiveFiles(files: FilteredFile[]): FilteredFile[] {
  return files.filter((f) => !f.isIgnored);
}

export function getIgnoredFiles(files: FilteredFile[]): FilteredFile[] {
  return files.filter((f) => f.isIgnored);
}
