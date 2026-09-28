// Checkup estilo Cypress para o Foco em Dados
// Roda com: node cypress-checkup.js
// Usa fetch HTTP contra o servidor Vite dev

const BASE = 'http://localhost:5173';
const results = { pass: [], fail: [], warn: [] };

function assert(name, condition, detail = '') {
  if (condition) {
    results.pass.push({ name, detail });
    console.log(`  ✅ ${name}${detail ? ' — ' + detail : ''}`);
  } else {
    results.fail.push({ name, detail });
    console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`);
  }
}

function warn(name, detail = '') {
  results.warn.push({ name, detail });
  console.log(`  ⚠️  ${name}${detail ? ' — ' + detail : ''}`);
}

async function check(path, expectStatus = 200) {
  try {
    const res = await fetch(BASE + path);
    const status = res.status;
    assert(`GET ${path}`, status === expectStatus, `status=${status}`);
    return await res.text();
  } catch (e) {
    assert(`GET ${path}`, false, `error: ${e.message}`);
    return null;
  }
}

async function runChecks() {
  console.log('\n🔍 FOCO EM DADOS — Cypress-style Checkup\n');
  console.log('═'.repeat(50));
  
  // 1. Páginas principais
  console.log('\n📄 PÁGINAS PRINCIPAIS');
  const landing = await check('/');
  const pricing = await check('/pricing');
  const auth = await check('/auth/callback');
  
  // 2. SEO & Meta Tags
  console.log('\n🏷️  SEO & META TAGS');
  if (landing) {
    assert('title presente', landing.includes('<title>'), 'verifique <title>');
    assert('description meta', landing.includes('name="description"'), 'meta description');
    assert('viewport meta', landing.includes('name="viewport"'), 'responsive design');
    assert('lang="pt-BR"', landing.includes('lang="pt-BR"'), 'idioma correto');
    assert('charset UTF-8', landing.includes('charset="UTF-8"'), 'encoding');
    assert('Google Fonts carregado', landing.includes('fonts.googleapis.com'), 'tipografia');
  }
  
  // 3. Scripts externos
  console.log('\n🔗 SCRIPTS EXTERNOS');
  if (landing) {
    assert('Google APIs', landing.includes('apis.google.com'), 'Google Auth');
    assert('Google Identity', landing.includes('accounts.google.com/gsi'), 'GSI client');
    assert('Stripe', landing.includes('js.stripe.com'), 'pagamento');
    assert('Vite client HMR', landing.includes('@vite/client'), 'dev server');
    assert('Script defer/async', landing.includes('async') || landing.includes('defer'), 'scripts não bloqueantes');
  }
  
  // 4. Assets e CSS
  console.log('\n🎨 ASSETS & CSS');
  const css = await check('/src/index.css', 200);
  assert('index.css carrega', css !== null && css.length > 0, `${css ? css.length : 0} bytes`);
  
  // 5. React/Vite app
  console.log('\n⚛️  APP REACT/VITE');
  const appTsx = await check('/src/App.tsx');
  const mainTsx = await check('/src/main.tsx');
  const indexTsx = await check('/src/pages/index.tsx');
  assert('App.tsx carrega', appTsx !== null, 'rota principal');
  assert('main.tsx carrega', mainTsx !== null, 'entry point');
  assert('Landing page', indexTsx !== null, 'página inicial');
  
  // 6. Componentes críticos
  console.log('\n🧩 COMPONENTES CRÍTICOS');
  const components = [
    'Navbar', 'Landing', 'CookieBanner', 'ErrorBoundary',
    'LoginModal', 'PayButton', 'ChatwootWidget', 'GeminiChatSidebar',
    'SiteChat', 'CrmDashboard', 'ProspectList', 'ProspeccaoDashboard',
    'ApolloSearchFilters', 'ProspectCard', 'GlobalSearchBar',
    'HermesGrowthEngineView', 'SocialPulseView', 'LivePreviewView',
    'PowerBIDashboard', 'MrrForecastVisualization', 'Paywall'
  ];
  for (const comp of components) {
    const res = await fetch(BASE + `/src/components/${comp}.tsx`);
    assert(comp, res.ok, comp);
  }
  
  // 7. Configurações
  console.log('\n⚙️  CONFIGURAÇÕES');
  const viteConfig = await fetch(BASE + '/vite.config.ts');
  const tsconfig = await fetch(BASE + '/tsconfig.json');
  assert('vite.config.ts', viteConfig.ok, 'build config');
  assert('tsconfig.json', tsconfig.ok, 'TypeScript config');
  
  // 8. Verificar body#root
  console.log('\n🏗️  ESTRUTURA DOM');
  if (landing) {
    assert('<div id="root">', landing.includes('id="root"'), 'mount point React');
    assert('script type="module"', landing.includes('type="module"'), 'ES modules');
    assert('body bg-[#0F172A]', landing.includes('#0F172A'), 'dark theme');
    assert('font Inter', landing.includes("font-['Inter'"), 'tipografia principal');
    assert('overflow-x-hidden', landing.includes('overflow-x-hidden'), 'sem scroll horizontal');
  }
  
  // 9. Fontes
  console.log('\n🔤 FONTES');
  if (landing) {
    assert('Inter font', landing.includes('Inter:wght'), 'Inter weights');
    assert('DM Sans font', landing.includes('DM+Sans'), 'DM Sans');
  }
  
  // 10. Build verificação
  console.log('\n📦 BUILD');
  const pkgRes = await fetch(BASE + '/package.json');
  if (pkgRes.ok) {
    const pkg = await pkgRes.json();
    assert('Pacote nome', pkg.name === 'echo-radio', `name=${pkg.name}`);
    assert('Dependências principais', pkg.dependencies?.react && pkg.dependencies?.vite, 'React + Vite');
    assert('Tailwind CSS plugin', pkg.dependencies?.['@tailwindcss/vite'], '@tailwindcss/vite');
    assert('Tailwind CSS devDep', pkg.devDependencies?.tailwindcss, 'Tailwind');
    assert('Playwright', pkg.dependencies?.playwright, 'E2E testing');
    assert('Script build', pkg.scripts?.build, 'comando build');
    assert('Script lint', pkg.scripts?.lint, 'comando lint');
    assert('Script dev', pkg.scripts?.dev, 'comando dev');
    assert('TypeScript', pkg.devDependencies?.typescript, 'TS');
    assert('React 19', pkg.dependencies?.react?.startsWith('^19'), 'React 19');
  }
  
  // 11. Auth pages
  console.log('\n🔐 AUTH');
  const callback = await check('/src/pages/auth/callback.tsx');
  assert('Auth callback page', callback !== null, 'página de callback OAuth');
  
  // 12. Libs
  console.log('\n📚 LIBS');
  const libFiles = ['supabaseClient', 'auth', 'constants', 'roles', 'subscription', 'firebase', 'firestore'];
  for (const lib of libFiles) {
    const res = await fetch(BASE + `/src/lib/${lib}.ts`);
    assert(`lib/${lib}.ts`, res.ok, `lib/${lib}`);
  }
  
  // 13. Build output
  console.log('\n📤 BUILD OUTPUT');
  const fs = await import('fs');
  const distExists = fs.existsSync('/data/data/com.termux/files/home/foco-em-dados2/dist');
  assert('dist/ existe', distExists, 'build output');
  if (distExists) {
    const files = fs.readdirSync('/data/data/com.termux/files/home/foco-em-dados2/dist');
    assert('index.html em dist', files.includes('index.html'), 'dist/index.html');
    assert('assets em dist', files.includes('assets'), 'dist/assets/');
  }
  
  // Relatório final
  console.log('\n' + '═'.repeat(50));
  console.log('\n📊 RELATÓRIO FINAL');
  console.log(`  ✅ PASS: ${results.pass.length}`);
  console.log(`  ❌ FAIL: ${results.fail.length}`);
  console.log(`  ⚠️  WARN: ${results.warn.length}`);
  
  if (results.fail.length > 0) {
    console.log('\n❌ FALHAS:');
    results.fail.forEach(f => console.log(`   • ${f.name}: ${f.detail}`));
  }
  
  const allOk = results.fail.length === 0;
  console.log(`\n${allOk ? '🎉 Tudo ok!' : '⚠️  Issues encontradas'}`);
  return allOk;
}

runChecks().then(ok => process.exit(ok ? 0 : 1)).catch(e => { console.error(e); process.exit(1); });
