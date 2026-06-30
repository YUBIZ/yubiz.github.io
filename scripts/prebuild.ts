import fs from 'fs';
import path from 'path';

const CONFIG_OUT_DIR = path.join(process.cwd(), 'src/config');
const CONFIG_YAML_PATH = path.join(process.cwd(), 'blog-config.yaml');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

if (!fs.existsSync(CONFIG_OUT_DIR)) fs.mkdirSync(CONFIG_OUT_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

/// @brief 문자열 내의 특수 문자를 이스케이프합니다.
function escapeStr(InVal: string): string {
  return InVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/// @brief YAML 파일을 파싱하여 설정 객체를 반환합니다. (1단계 중첩 지원)
function parseYaml(InContent: string): Record<string, string | Record<string, string>> {
  const config: Record<string, string | Record<string, string>> = {};
  const lines = InContent.split(/\r?\n/);
  let currentSection: string | null = null;

  for (const line of lines) {
    if (line.trim().startsWith('#') || line.trim() === '') continue;

    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    let val = trimmed.substring(colonIndex + 1).trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }

    if (indent === 0) {
      if (val === '') {
        currentSection = key;
        config[key] = {};
      } else {
        currentSection = null;
        config[key] = val;
      }
    } else if (currentSection) {
      (config[currentSection] as Record<string, string>)[key] = val;
    }
  }

  return config;
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
function compileAdsTxt(): void {
  const content = fs.readFileSync(CONFIG_YAML_PATH, 'utf-8');
  const config = parseYaml(content);
  const ads = config.ads as Record<string, string> | undefined;

  if (!ads || !ads.adsenseId) {
    console.log('ads.txt: AdSense ID가 없어 생성을 건너뜁니다.');
    return;
  }

  // ca-pub-XXXXXXXXX → pub-XXXXXXXXX
  const pubId = ads.adsenseId.replace('ca-', '');
  const adsTxt = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'ads.txt'), adsTxt, 'utf-8');
  console.log('public/ads.txt 생성 완료.');
}

compileYamlConfig();
compileAdsTxt();