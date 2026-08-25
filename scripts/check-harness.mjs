import { access, readFile, readdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const requiredFiles = [
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'course/MEMORY.md',
  'course/COURSE_PLAN.md',
  'course/RELEASE.md',
  'materials/course-info.md',
  'docs/harness.md',
  'docs/instructor-tutorial.md',
  'docs/choosing-an-agent.md',
  'docs/practice-standard.md',
  'docs/debugging.md',
  'docs/release-guide.md',
  'docs/research-basis.md',
  'docs/content-coverage-standard.md',
  'docs/experience-quality-standard.md',
  'docs/ai101-reference-standard.md',
  'docs/content-voice.md',
  'docs/learning-design-standard.md',
  'docs/theme-standard.md',
  'docs/visualization-standard.md',
  'src/course/modules/index.ts',
  'src/lib/courseStorage.ts',
  'playwright.config.ts',
  'e2e/learning-experience.spec.ts',
  'e2e/accessibility.spec.ts',
  'scripts/check-course-coverage.mjs',
  'scripts/check-course-coverage.test.mjs',
  'scripts/check-release-readiness.mjs',
  'scripts/check-release-readiness.test.mjs',
  '.github/workflows/ci.yml',
  '.github/workflows/deploy-pages.yml',
  '.github/dependabot.yml',
];
const requiredSkills = [
  'manage-course-lifecycle',
  'onboard-course',
  'create-study-module',
  'create-practice-set',
  'debug-learning-experience',
  'review-learning-module',
  'prepare-course-release',
];

for (const file of requiredFiles) await access(resolve(root, file));

for (const skill of requiredSkills) {
  const skillPath = `.agents/skills/${skill}/SKILL.md`;
  const content = await readFile(resolve(root, skillPath), 'utf8');
  if (!content.startsWith('---\n') || !content.includes(`name: ${skill}`) || !content.includes('\ndescription:')) {
    throw new Error(`${skillPath} needs valid name and description frontmatter.`);
  }
}

const agents = await readFile(resolve(root, 'AGENTS.md'));
if (agents.byteLength > 32 * 1024) {
  throw new Error(`AGENTS.md is ${agents.byteLength} bytes; keep always-loaded instructions under 32 KiB.`);
}

const claude = await readFile(resolve(root, 'CLAUDE.md'), 'utf8');
if (!claude.trimStart().startsWith('@AGENTS.md')) {
  throw new Error('CLAUDE.md must import the canonical AGENTS.md before Claude-specific guidance.');
}

const referenceStandard = 'docs/ai101-reference-standard.md';
for (const instructionFile of ['AGENTS.md', '.agents/skills/create-study-module/SKILL.md', '.agents/skills/review-learning-module/SKILL.md']) {
  const content = await readFile(resolve(root, instructionFile), 'utf8');
  if (!content.includes(referenceStandard)) {
    throw new Error(`${instructionFile} must route interactive work through ${referenceStandard}.`);
  }
}

for (const [standard, instructionFiles] of [
  ['docs/content-coverage-standard.md', ['AGENTS.md', '.agents/skills/manage-course-lifecycle/SKILL.md', '.agents/skills/onboard-course/SKILL.md', '.agents/skills/create-study-module/SKILL.md', '.agents/skills/review-learning-module/SKILL.md', '.agents/skills/prepare-course-release/SKILL.md']],
  ['docs/experience-quality-standard.md', ['AGENTS.md', '.agents/skills/manage-course-lifecycle/SKILL.md', '.agents/skills/create-study-module/SKILL.md', '.agents/skills/review-learning-module/SKILL.md', '.agents/skills/prepare-course-release/SKILL.md']],
  ['docs/theme-standard.md', ['AGENTS.md', '.agents/skills/manage-course-lifecycle/SKILL.md', '.agents/skills/onboard-course/SKILL.md', '.agents/skills/create-study-module/SKILL.md', '.agents/skills/create-practice-set/SKILL.md', '.agents/skills/review-learning-module/SKILL.md', '.agents/skills/prepare-course-release/SKILL.md']],
]) {
  for (const instructionFile of instructionFiles) {
    const content = await readFile(resolve(root, instructionFile), 'utf8');
    if (!content.includes(standard)) throw new Error(`${instructionFile} must route relevant work through ${standard}.`);
  }
}

const coursePlan = await readFile(resolve(root, 'course/COURSE_PLAN.md'), 'utf8');
if (!coursePlan.includes('## Content coverage ledger') || !coursePlan.includes('Source and locator') || !coursePlan.includes('Decision note')) {
  throw new Error('course/COURSE_PLAN.md must provide the course-wide content coverage ledger.');
}
if (!coursePlan.includes('## Course visual direction') || !coursePlan.includes('Representative source evidence and locators') || !coursePlan.includes('Instructor approval:')) {
  throw new Error('course/COURSE_PLAN.md must provide a source-grounded course visual-direction brief.');
}

const courseInfo = await readFile(resolve(root, 'materials/course-info.md'), 'utf8');
if (!courseInfo.includes('## Course visual direction') || !courseInfo.includes('Representative material and locators used as visual evidence')) {
  throw new Error('materials/course-info.md must capture the instructor-confirmed course visual direction.');
}

const releaseRecord = await readFile(resolve(root, 'course/RELEASE.md'), 'utf8');
if (!releaseRecord.includes('## Content coverage') || !releaseRecord.includes('Unassigned items:')) {
  throw new Error('course/RELEASE.md must audit unresolved course content coverage.');
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
for (const script of ['test:unit', 'test:release-guard', 'test:e2e', 'test:e2e:browser', 'test:e2e:debug', 'build:app', 'build', 'ci', 'check:harness', 'check:voice', 'check:coverage', 'check:release', 'check:skills']) {
  if (!packageJson.scripts?.[script]) throw new Error(`package.json must define the ${script} script.`);
}
if (!packageJson.scripts['test:e2e'].includes('npm run build:app') || !packageJson.scripts['test:e2e'].includes('npm run test:e2e:browser')) {
  throw new Error('The standalone browser test must build the app before testing its production preview.');
}
if (!packageJson.scripts.ci.includes('npm run build') || !packageJson.scripts.ci.includes('npm run test:e2e:browser')) {
  throw new Error('The ci script must build once and then run real-browser learner flows against that bundle.');
}
if (!packageJson.devDependencies?.['@axe-core/playwright']) {
  throw new Error('Automated accessibility checks require @axe-core/playwright.');
}

for (const workflow of ['.github/workflows/ci.yml', '.github/workflows/deploy-pages.yml']) {
  const content = await readFile(resolve(root, workflow), 'utf8');
  if (!content.includes('npm ci') || !content.includes('playwright install') || !content.includes('npm run ci')) {
    throw new Error(`${workflow} must use a clean install, install a browser, and run the full CI gate.`);
  }
}

const playwrightConfig = await readFile(resolve(root, 'playwright.config.ts'), 'utf8');
if (!playwrightConfig.includes('npm run preview') || !playwrightConfig.includes('--strictPort')) {
  throw new Error('Playwright must test the built site through a strict production-preview server.');
}

const deploymentWorkflow = await readFile(resolve(root, '.github/workflows/deploy-pages.yml'), 'utf8');
if (!deploymentWorkflow.includes('workflow_dispatch:') || /^\s*push:\s*$/m.test(deploymentWorkflow)) {
  throw new Error('Course deployment must be an explicit manual action, not an automatic push side effect.');
}
if (!deploymentWorkflow.includes('npm run check:release')) {
  throw new Error('Course deployment must validate course/RELEASE.md before uploading the site.');
}

const courseConfig = await readFile(resolve(root, 'src/course/course.config.ts'), 'utf8');
if (!courseConfig.includes('storageNamespace:')) {
  throw new Error('src/course/course.config.ts must define a course-specific storageNamespace.');
}
for (const themeContract of ['light:', 'dark:', 'typography:', 'geometry:', 'rationale:', 'sourceRefs:']) {
  if (!courseConfig.includes(themeContract)) throw new Error(`src/course/course.config.ts is missing the theme contract ${themeContract}`);
}

const courseStorage = await readFile(resolve(root, 'src/lib/courseStorage.ts'), 'utf8');
for (const contract of ['COURSE.storageNamespace', 'readStorageJson', 'writeStorageJson']) {
  if (!courseStorage.includes(contract)) throw new Error(`src/lib/courseStorage.ts is missing ${contract}.`);
}

const knowledgeCheck = await readFile(resolve(root, 'src/components/KnowledgeCheck.tsx'), 'utf8');
if (!/interface KnowledgeCheckOption[\s\S]*?\bid: string;/.test(knowledgeCheck)) {
  throw new Error('KnowledgeCheck options must have stable semantic IDs.');
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectSourceFiles(path));
    else if (['.ts', '.tsx'].includes(extname(entry.name))) files.push(path);
  }
  return files;
}

for (const file of await collectSourceFiles(resolve(root, 'src'))) {
  const content = await readFile(file, 'utf8');
  if (/Number\s*\(\s*(?:window\.)?localStorage\.getItem\s*\(/.test(content)) {
    throw new Error(`${file.slice(root.length + 1)} coerces a possibly missing storage value to Number.`);
  }
}

const readme = await readFile(resolve(root, 'README.md'), 'utf8');
for (const guide of ['docs/instructor-tutorial.md', 'docs/choosing-an-agent.md', 'docs/debugging.md', 'docs/release-guide.md', 'docs/research-basis.md', 'docs/content-coverage-standard.md', 'docs/experience-quality-standard.md', 'docs/theme-standard.md']) {
  if (!readme.includes(guide)) throw new Error(`README.md must link to ${guide}.`);
}

console.log(`Verified ${requiredFiles.length} harness artifacts, ${requiredSkills.length} skills, content coverage, theme, experience quality, CI, and learner-state contracts.`);
