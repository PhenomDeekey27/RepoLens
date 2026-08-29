const EXTENSION_MAP: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TypeScript React',
  js: 'JavaScript',
  jsx: 'JavaScript React',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  py: 'Python',
  pyw: 'Python',
  go: 'Go',
  rs: 'Rust',
  java: 'Java',
  kt: 'Kotlin',
  kts: 'Kotlin',
  rb: 'Ruby',
  php: 'PHP',
  c: 'C',
  h: 'C Header',
  cpp: 'C++',
  cc: 'C++',
  cxx: 'C++',
  hpp: 'C++ Header',
  cs: 'C#',
  swift: 'Swift',
  m: 'Objective-C',
  mm: 'Objective-C++',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  html: 'HTML',
  htm: 'HTML',
  xml: 'XML',
  svg: 'SVG',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  ini: 'INI',
  cfg: 'Config',
  conf: 'Config',
  md: 'Markdown',
  mdx: 'MDX',
  rst: 'reStructuredText',
  txt: 'Text',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Shell',
  zsh: 'Shell',
  fish: 'Shell',
  ps1: 'PowerShell',
  bat: 'Batch',
  cmd: 'Batch',
  dockerfile: 'Dockerfile',
  makefile: 'Makefile',
  cmake: 'CMake',
  gradle: 'Gradle',
  groovy: 'Groovy',
  lua: 'Lua',
  r: 'R',
  dart: 'Dart',
  ex: 'Elixir',
  exs: 'Elixir',
  erl: 'Erlang',
  hs: 'Haskell',
  ml: 'OCaml',
  clj: 'Clojure',
  scala: 'Scala',
  zig: 'Zig',
  nim: 'Nim',
  v: 'V',
  vue: 'Vue',
  svelte: 'Svelte',
 astro: 'Astro',
  tf: 'Terraform',
  hcl: 'HCL',
  proto: 'Protocol Buffers',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  prisma: 'Prisma',
};

export function detectLanguage(filePath: string): string {
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1].toLowerCase();

  if (filename === 'dockerfile') return 'Dockerfile';
  if (filename === 'makefile') return 'Makefile';
  if (filename === 'cmakelists.txt') return 'CMake';
  if (filename === '.gitignore') return 'Git Config';
  if (filename === '.env' || filename.startsWith('.env.')) return 'Env Config';

  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return 'Unknown';

  const ext = filename.slice(lastDot + 1);
  return EXTENSION_MAP[ext] || ext.toUpperCase();
}
