import { FilteredFile } from './filter';

export interface RepositoryFingerprint {
  primaryLanguage: string | null;
  framework: string | null;
  packageManager: string | null;
  projectType: string;
  configFiles: string[];
  sourceDirectories: string[];
  testDirectories: string[];
  languages: string[];
  totalFiles: number;
  activeFiles: number;
}

const FRAMEWORK_INDICATORS: Record<string, string[]> = {
  'Next.js': ['next.config.js', 'next.config.mjs', 'next.config.ts'],
  Vite: ['vite.config.js', 'vite.config.mjs', 'vite.config.ts'],
  React: ['react.config.js'],
  Vue: ['vue.config.js', 'nuxt.config.js', 'nuxt.config.ts'],
  Nuxt: ['nuxt.config.js', 'nuxt.config.ts'],
  Svelte: ['svelte.config.js', 'svelte.config.ts'],
  Angular: ['angular.json'],
  Remix: ['remix.config.js'],
  Gatsby: ['gatsby-config.js', 'gatsby-config.ts'],
  Astro: ['astro.config.mjs', 'astro.config.ts'],
  Ember: ['ember-cli-build.js'],
  Rails: ['Gemfile', 'config/routes.rb'],
  Django: ['manage.py', 'settings.py'],
  Flask: ['wsgi.py', 'app.py'],
  FastAPI: ['main.py', 'pyproject.toml'],
  Express: ['app.js', 'server.js'],
  NestJS: ['nest-cli.json'],
  Laravel: ['artisan', 'composer.json'],
  Symfony: ['composer.json', 'symfony.lock'],
  Spring: ['pom.xml', 'build.gradle'],
};

const PACKAGE_MANAGER_INDICATORS: Record<string, string[]> = {
  npm: ['package-lock.json', 'package.json'],
  yarn: ['yarn.lock', '.yarnrc.yml'],
  pnpm: ['pnpm-lock.yaml', 'pnpm-workspace.yaml'],
  bun: ['bun.lockb', 'bunfig.toml'],
  pip: ['requirements.txt', 'setup.py', 'Pipfile'],
  poetry: ['poetry.lock', 'pyproject.toml'],
  conda: ['environment.yml', 'environment.yaml'],
  cargo: ['Cargo.lock', 'Cargo.toml'],
  go: ['go.sum', 'go.mod'],
  maven: ['pom.xml'],
  gradle: ['gradle.lockfile', 'build.gradle'],
  bundler: ['Gemfile.lock', 'Gemfile'],
  composer: ['composer.json', 'composer.lock'],
};

const PROJECT_TYPE_INDICATORS: Record<string, string[]> = {
  'Web Application': ['index.html', 'public/index.html', 'app/layout.tsx', 'app/page.tsx'],
  'CLI Tool': ['bin/', 'cli.ts', 'cli.js', 'main.go', 'cmd/'],
  'Library': ['src/index.ts', 'src/index.js', 'lib/index.ts', 'index.ts', 'index.js'],
  'API Server': ['server.ts', 'server.js', 'app.ts', 'main.py', 'cmd/server/'],
  'Mobile App': ['App.tsx', 'App.js', 'android/', 'ios/'],
  'Monorepo': ['lerna.json', 'turbo.json', 'nx.json', 'pnpm-workspace.yaml'],
  'Microservice': ['Dockerfile', 'docker-compose.yml', 'k8s/'],
};

const SOURCE_DIRECTORIES = [
  'src', 'lib', 'app', 'pages', 'components', 'internal',
  'pkg', 'cmd', 'internal', 'pkg', 'api', 'core', 'services',
  'utils', 'helpers', 'modules', 'features', 'domains',
];

const TEST_DIRECTORIES = [
  'test', 'tests', '__tests__', 'spec', 'specs',
  '__mocks__', 'mocks', 'fixtures', 'cypress',
  'e2e', 'integration', 'unit',
];

function detectFramework(files: FilteredFile[]): string | null {
  for (const [framework, indicators] of Object.entries(FRAMEWORK_INDICATORS)) {
    for (const indicator of indicators) {
      if (files.some((f) => f.path.endsWith(indicator) || f.path.includes(indicator))) {
        return framework;
      }
    }
  }
  return null;
}

function detectPackageManager(files: FilteredFile[]): string | null {
  for (const [pm, indicators] of Object.entries(PACKAGE_MANAGER_INDICATORS)) {
    for (const indicator of indicators) {
      if (files.some((f) => f.path.endsWith(indicator))) {
        return pm;
      }
    }
  }
  return null;
}

function detectProjectType(files: FilteredFile[]): string {
  for (const [type, indicators] of Object.entries(PROJECT_TYPE_INDICATORS)) {
    for (const indicator of indicators) {
      if (files.some((f) => f.path.includes(indicator))) {
        return type;
      }
    }
  }
  return 'Software Project';
}

function detectSourceDirectories(files: FilteredFile[]): string[] {
  const dirs = new Set<string>();
  for (const file of files) {
    const parts = file.path.split('/');
    if (parts.length > 1) {
      dirs.add(parts[0]);
    }
  }
  return SOURCE_DIRECTORIES.filter((d) => dirs.has(d));
}

function detectTestDirectories(files: FilteredFile[]): string[] {
  const dirs = new Set<string>();
  for (const file of files) {
    const parts = file.path.split('/');
    for (const part of parts) {
      if (TEST_DIRECTORIES.includes(part)) {
        dirs.add(part);
      }
    }
  }
  return Array.from(dirs);
}

function detectPrimaryLanguage(files: FilteredFile[]): string | null {
  const langCounts: Record<string, number> = {};
  for (const file of files) {
    if (file.isIgnored || file.language === 'Unknown') continue;
    langCounts[file.language] = (langCounts[file.language] || 0) + 1;
  }

  let maxCount = 0;
  let primary: string | null = null;
  for (const [lang, count] of Object.entries(langCounts)) {
    if (count > maxCount) {
      maxCount = count;
      primary = lang;
    }
  }
  return primary;
}

function detectLanguages(files: FilteredFile[]): string[] {
  const langs = new Set<string>();
  for (const file of files) {
    if (!file.isIgnored && file.language !== 'Unknown') {
      langs.add(file.language);
    }
  }
  return Array.from(langs).sort();
}

function detectConfigFiles(files: FilteredFile[]): string[] {
  return files
    .filter((f) => {
      const name = f.path.split('/').pop() || '';
      return (
        name.startsWith('.') ||
        name.endsWith('.config.js') ||
        name.endsWith('.config.mjs') ||
        name.endsWith('.config.ts') ||
        name.endsWith('.config.json') ||
        name === 'package.json' ||
        name === 'tsconfig.json' ||
        name === 'Dockerfile' ||
        name === 'docker-compose.yml' ||
        name === 'Makefile' ||
        name === 'go.mod' ||
        name === 'Cargo.toml' ||
        name === 'pyproject.toml' ||
        name === 'requirements.txt' ||
        name === 'pom.xml' ||
        name === 'build.gradle'
      );
    })
    .map((f) => f.path)
    .slice(0, 30);
}

export function buildFingerprint(files: FilteredFile[]): RepositoryFingerprint {
  const activeFiles = files.filter((f) => !f.isIgnored);

  return {
    primaryLanguage: detectPrimaryLanguage(activeFiles),
    framework: detectFramework(activeFiles),
    packageManager: detectPackageManager(activeFiles),
    projectType: detectProjectType(activeFiles),
    configFiles: detectConfigFiles(activeFiles),
    sourceDirectories: detectSourceDirectories(activeFiles),
    testDirectories: detectTestDirectories(activeFiles),
    languages: detectLanguages(activeFiles),
    totalFiles: files.length,
    activeFiles: activeFiles.length,
  };
}
