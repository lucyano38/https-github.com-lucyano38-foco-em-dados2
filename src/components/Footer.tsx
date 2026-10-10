interface FooterProps {
  onNavigateTo?: (view: string) => void;
}

const COLUMNS = [
  {
    title: 'Produto',
    links: [
      { label: 'Dashboards', view: 'bi' },
      { label: 'Chatbots', view: 'bot-factory' },
      { label: 'Preços', view: 'pricing' },
      { label: 'Integrações', view: 'integrations' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Templates', view: '#' },
      { label: 'Blog', view: '#' },
      { label: 'API Docs', view: '#' },
      { label: 'Data Academy', view: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de Uso', view: 'terms' },
      { label: 'Privacidade (LGPD)', view: 'privacy' },
      { label: 'Cookies', view: '#' },
    ],
  },
  {
    title: 'Programas',
    links: [
      { label: 'Afiliados', view: '#' },
      { label: 'Indique e Ganhe', view: '#' },
      { label: 'Parceiros', view: '#' },
    ],
  },
];

export default function Footer({ onNavigateTo }: FooterProps) {
  return (
    <footer className="w-full glass-card-strong border-t border-glass-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-on-surface mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => link.view !== '#' && onNavigateTo?.(link.view)}
                      className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-on-surface-variant">
            &copy; 2026 VarejoBI LTDA. CNPJ: 00.000.000/0001-00
          </p>
          <a
            href="mailto:contato@focoemdados.com.br"
            className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
          >
            contato@focoemdados.com.br
          </a>
        </div>
      </div>
    </footer>
  );
}
