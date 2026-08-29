const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('ProspeccaoDashboard')) {
  code = 'import { ProspeccaoDashboard } from "./components/ProspeccaoDashboard";\n' + code;
}

code = code.replace(
  '<UnifiedProspectView onNavigateToCrm={() => setEcosystemMode(\'crm\')} onLeadAddedToCrm={fetchAppLeads} />',
  '<ProspeccaoDashboard />'
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log('App.tsx updated successfully.');
