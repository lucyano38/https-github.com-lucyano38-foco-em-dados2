// Cypress-style checkup para Foco em Dados
// Uso: node cypress-checkup.cjs [dist|dev]
//
// dist (padrao): verifica build em dist/
// dev: verifica arquivos-fonte sem build

const fs = require('fs');
const path = require('path');

const results = { pass: [], fail: [], warn: [] };
function assert(n, c, d = '') {
  if (c) { results.pass.push({n,d}); console.log(`  ✅ ${n}`); }
  else { results.fail.push({n,d}); console.log(`  ❌ ${n}${d?': '+d:''}`); }
}
function warn(n, d = '') { results.warn.push({n,d}); console.log(`  ⚠️  ${n}`); }

const mode = process.argv[2] || 'dist';
const distDir = path.join(__dirname, 'dist');

console.log('\n🔍 FOCO EM DADOS — Cypress-style Checkup\n');
console.log('═'.repeat(50));

if (mode === 'dist') {
  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  const assets = fs.readdirSync(path.join(distDir, 'assets'));

  assert('title presente', indexHtml.includes('<title>'), 'Foco em Dados');
  assert('description meta', indexHtml.includes('name="description"'));
  assert('lang pt-BR', indexHtml.includes('lang="pt-BR"'));
  assert('charset UTF-8', indexHtml.includes('charset="UTF-8"'));
  assert('Google Fonts', indexHtml.includes('fonts.googleapis.com'));
  assert('Google APIs', indexHtml.includes('apis.google.com'));
  assert('Google Identity', indexHtml.includes('accounts.google.com/gsi'));
  assert('Stripe', indexHtml.includes('js.stripe.com'));
  assert('#root mount', indexHtml.includes('id="root"'));
  assert('ES modules', indexHtml.includes('type="module"'));
  assert('dark theme (#0F172A)', indexHtml.includes('#0F172A'));
  assert('font Inter', indexHtml.includes("font-['Inter'"));
  assert('overflow-x-hidden', indexHtml.includes('overflow-x-hidden'));
  assert('build script', pkg.scripts?.build);
  assert('lint script', pkg.scripts?.lint);
  assert('vite dep', pkg.dependencies?.vite);
  assert('react 19', pkg.dependencies?.react?.startsWith('^19'));
  assert('tailwind CSS', pkg.dependencies?.['@tailwindcss/vite']);
  assert('playwright E2E', pkg.dependencies?.playwright);
  assert('dist/index.html exists', fs.existsSync(path.join(distDir, 'index.html')));
  assert('dist/assets exists', fs.existsSync(path.join(distDir, 'assets')));
  assert('CSS in dist', assets.some(f => f.endsWith('.css')), `${assets.filter(f=>f.endsWith('.css')).length} files`);
  assert('JS in dist', assets.some(f => f.endsWith('.js')), `${assets.filter(f=>f.endsWith('.js')).length} files`);
  assert('build output', fs.existsSync(path.join(distDir, 'assets')), 'dist/ gerado com sucesso');
} else {
  const files = ['src/App.tsx', 'src/main.tsx', 'src/index.css', 'src/pages/index.tsx',
                 'src/components/Landing.tsx', 'src/components/Navbar.tsx', 'src/components/CookieBanner.tsx',
                 'src/components/ErrorBoundary.tsx', 'src/lib/auth.ts', 'src/lib/constants.ts',
                 'src/lib/firebase.ts', 'vite.config.ts', 'tsconfig.json', 'index.html'];
  for (const f of files) assert(f, fs.existsSync(path.join(__dirname, f)), f);

  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
  assert('SEO completo', html.includes('<title>') && html.includes('lang="pt-BR"'), 'title+lang');
  assert('Scripts ext.', html.includes('apis.google.com') && html.includes('js.stripe.com'), 'Google+Stripe');
}

console.log('\n' + '═'.repeat(50));
console.log(`\n✅ PASS: ${results.pass.length} | ❌ FAIL: ${results.fail.length} | ⚠️ WARN: ${results.warn.length}`);
console.log(results.fail.length === 0 ? '🎉 Tudo ok!' : '⚠️ Issues encontradas');
process.exit(results.fail.length > 0 ? 1 : 0);
