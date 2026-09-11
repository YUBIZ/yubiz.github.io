import fs from 'fs';
import path from 'path';
import { parse as parseYamlDocument } from 'yaml';

const CONFIG_OUT_DIR = path.join(process.cwd(), 'src/config');
const CONFIG_YAML_PATH = path.join(process.cwd(), 'blog-config.yaml');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const HIGHLIGHT_THEMES_DIR = path.join(process.cwd(), 'node_modules/highlight.js/styles');

if (!fs.existsSync(CONFIG_OUT_DIR)) fs.mkdirSync(CONFIG_OUT_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

/// @brief 문자열 내의 특수 문자를 이스케이프합니다.
function escapeStr(InVal: string): string {
  return InVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function parseYaml(InContent: string): Record<string, unknown> {
  return parseYamlDocument(InContent) as Record<string, unknown>;
}

/// @brief blog-config.yaml을 컴파일하여 TypeScript 설정 모듈을 생성합니다.
function compileYamlConfig(): void {
  console.log('blog-config.yaml 컴파일 중...');
  if (!fs.existsSync(CONFIG_YAML_PATH)) {
    console.error(`오류: 설정 파일을 찾을 수 없습니다: ${CONFIG_YAML_PATH}`);
    return;
  }

  const content = fs.readFileSync(CONFIG_YAML_PATH, 'utf-8');
  const config = parseYaml(content);

  const flatKeys = Object.keys(config).filter(k => typeof config[k] === 'string');
  const nestedKeys = Object.keys(config).filter(k => typeof config[k] === 'object');

  const flatLines = flatKeys.map(k => `  ${k}: "${escapeStr(config[k] as string)}"`);

  const nestedSections = nestedKeys.map(nk => {
    const obj = config[nk] as Record<string, string>;
    const entries = Object.entries(obj).map(([k, v]) => `    ${k}: "${escapeStr(v)}"`);
    return `  ${nk}: {\n${entries.join(',\n')}${entries.length > 0 ? ',' : ''}\n  }`;
  });

  const allLines = [...flatLines, ...nestedSections];

  const output = `// blog-config.yaml로부터 컴파일 시점에 자동 생성됩니다. 직접 편집하지 마세요.
export const blogConfig = {
${allLines.join(',\n')},
};
`;

  fs.writeFileSync(path.join(CONFIG_OUT_DIR, 'blogConfig.ts'), output, 'utf-8');
  console.log('src/config/blogConfig.ts 생성 완료.');
}

/// @brief AdSense ads.txt를 생성합니다.
/// @note ads.txt는 인증된 광고 판매자를 선언하는 파일로 사이트 루트에 배치됩니다.
function compileHighlightTheme(): void {
  const content = fs.readFileSync(CONFIG_YAML_PATH, 'utf-8');
  const config = parseYaml(content);
  const theme = typeof config.codeTheme === 'string' ? config.codeTheme : 'github';
  const themes: Record<string, [string, string]> = {
    github: ['github.css', 'github-dark.css'],
    monokai: ['monokai.css', 'monokai.css'],
    nord: ['nord.css', 'nord.css'],
    dracula: ['base16/dracula.css', 'base16/dracula.css'],
    'visual-studio': ['vs.css', 'vs2015.css'],
  };
  const [lightFile, darkFile] = themes[theme] || themes.github;

  const scope = (css: string, selector: string): string => css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/([^{}]+)\{([^{}]*)\}/g, (_, selectors: string, declarations: string) => {
      const scoped = selectors.split(',').map(item => `${selector} ${item.trim()}`).join(',\n');
      return `${scoped} {${declarations}}`;
    });

  const lightCss = fs.readFileSync(path.join(HIGHLIGHT_THEMES_DIR, lightFile), 'utf-8');
  const darkCss = fs.readFileSync(path.join(HIGHLIGHT_THEMES_DIR, darkFile), 'utf-8');
  const output = [
    scope(lightCss, `html[data-code-theme="${theme}"]:not(.dark)`),
    scope(darkCss, `html.dark[data-code-theme="${theme}"]`),
  ].join('\n');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'highlight-theme.css'), output, 'utf-8');
}

function compileAdsTxt(): void {
  const content = fs.readFileSync(CONFIG_YAML_PATH, 'utf-8');
  const config = parseYaml(content);
  const ads = config.ads as Record<string, string> | undefined;
  const adsTxtPath = path.join(PUBLIC_DIR, 'ads.txt');

  if (!ads || ads.enabled !== 'true' || !ads.adsenseId) {
    if (fs.existsSync(adsTxtPath)) fs.unlinkSync(adsTxtPath);
    console.log('ads.txt: 광고가 비활성화되었거나 AdSense ID가 없어 생성을 건너뜁니다.');
    return;
  }

  // ca-pub-XXXXXXXXX → pub-XXXXXXXXX
  const pubId = ads.adsenseId.replace('ca-', '');
  const adsTxt = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;

  fs.writeFileSync(adsTxtPath, adsTxt, 'utf-8');
  console.log('public/ads.txt 생성 완료.');
}

compileYamlConfig();
compileHighlightTheme();
compileAdsTxt();