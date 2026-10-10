export const RAG_DOCUMENTS = [
  {
    id: 'upload',
    title: 'Como fazer upload de planilhas',
    keywords: ['upload', 'planilha', 'csv', 'xlsx', 'arquivo', 'importar', 'carregar'],
    content: `Para fazer upload: clique em "Gerar Dashboard" no canto superior direito, selecione um arquivo .csv ou .xlsx. O sistema detecta automaticamente colunas de receita, produtos, clientes e gera o dashboard em segundos. Limite gratuito: 1 upload. Planos pagos: upload ilimitado.`,
  },
  {
    id: 'dashboard',
    title: 'Entendendo o Dashboard de Varejo',
    keywords: ['dashboard', 'indicadores', 'kpi', 'métrica', 'painel', 'ações de lucro', 'visão geral'],
    content: `O dashboard "Ações de Lucro" exibe 4 KPIs principais: Margem Líquida, Giro de Estoque, Ticket Médio e Risco de Inadimplência. Use as abas da sidebar para navegar entre Visão Geral, Produtos, Vendedores, Clientes, Recebíveis, Marketplaces, Análise IA e Dados.`,
  },
  {
    id: 'insight-diario',
    title: 'Insight Diário — Como funciona',
    keywords: ['insight', 'diário', 'ia', 'inteligência artificial', 'sugestão', 'alerta', 'oportunidade'],
    content: `O Insight Diário é gerado automaticamente pela IA sempre que você faz upload de dados. Ele analisa margem, ticket médio, inadimplência e giro de estoque para sugerir ações práticas. Os tipos de insight são: alerta (vermelho), oportunidade (verde), sugestão (âmbar) e informativo (azul).`,
  },
  {
    id: 'planos',
    title: 'Planos e Limites',
    keywords: ['plano', 'preço', 'assinatura', 'starter', 'pro', 'business', 'enterprise', 'upgrade', 'downgrade', 'cancelar'],
    content: `Planos disponíveis: Starter (R$97/mês, 2.000 linhas, 1 marketplace), Pro (R$297/mês, 20.000 linhas, 3 marketplaces), Business (R$597/mês, 100.000 linhas, marketplaces ilimitados), Enterprise (R$997/mês, linhas ilimitadas). Upgrade/downgrade automático com ajuste prorata via Stripe.`,
  },
  {
    id: 'trial',
    title: 'Período de Trial',
    keywords: ['trial', 'grátis', 'teste', 'experimentar', '7 dias', 'gratuito'],
    content: `Ao se cadastrar, você ganha 7 dias de trial gratuito com acesso completo. No 8º dia, o plano é automaticamente convertido para Starter (R$97/mês). Para evitar a cobrança, cancele antes do fim do trial nas configurações da conta.`,
  },
  {
    id: 'marketplace',
    title: 'Conectando Marketplaces',
    keywords: ['marketplace', 'bling', 'mercado livre', 'shopee', 'integração', 'conectar', 'api'],
    content: `Na aba "Marketplaces" do dashboard, clique em "Conectar" para cada plataforma (Bling, Mercado Livre, Shopee). A integração via API sincroniza produtos, pedidos e estoque automaticamente. Disponível nos planos Starter (1), Pro (3) e Business (ilimitado).`,
  },
  {
    id: 'exportar',
    title: 'Exportando Relatórios (PDF/Excel)',
    keywords: ['exportar', 'pdf', 'excel', 'relatório', 'download', 'baixar'],
    content: `Clique no botão "Exportar" no canto superior direito do dashboard. Escolha entre PDF (relatório formatado com KPIs, insight diário e tabela) ou Excel (duas abas: Ações de Lucro e Dados Consolidados). Disponível nos planos Pro e superiores.`,
  },
  {
    id: 'parceiros',
    title: 'Programa de Parceiros',
    keywords: ['parceiro', 'comissão', 'afiliado', 'indicar', 'revenda', 'comissionamento'],
    content: `O Programa de Parceiros oferece 25% de comissão vitalícia para indicações diretas e 20% para revenda ERP. Acesse a aba "Parceiros" no dashboard para ver seu link único e comissões acumuladas. Pagamento todo dia 15 via Pix.`,
  },
  {
    id: 'churn',
    title: 'Notificações de Reengajamento',
    keywords: ['churn', 'reengajamento', 'inatividade', 'notificação', 'alerta', 'voltar'],
    content: `O sistema detecta automaticamente se você fica 7+ dias sem acessar e envia sugestões de reengajamento com descontos exclusivos. Basta acessar o dashboard novamente para dismissar o alerta e continuar usando normalmente.`,
  },
  {
    id: 'seguranca',
    title: 'Segurança e Privacidade dos Dados',
    keywords: ['segurança', 'privacidade', 'dados', 'lgpd', 'criptografia', 'proteção'],
    content: `Seus dados são armazenados com criptografia em repouso e em trânsito. Utilizamos Firebase (Google Cloud) com certificação ISO 27001. Os arquivos enviados são processados apenas para geração do dashboard e não são compartilhados com terceiros.`,
  },
  {
    id: 'troubleshooting',
    title: 'Solução de Problemas Comuns',
    keywords: ['erro', 'problema', 'não funciona', 'falha', 'bug', 'troubleshooting', 'ajuda'],
    content: `Problemas comuns: 1) "Arquivo muito grande" — limite de 10MB por upload. 2) "Colunas não reconhecidas" — verifique se sua planilha tem cabeçalhos claros (ex: "Faturamento Líquido", "Quantidade"). 3) Dashboard não atualiza — tente recarregar a página. 4) Erro no Stripe — verifique se o cartão está ativo e com limite disponível.`,
  },
];

export function searchRAG(query: string): { id: string; title: string; content: string; score: number }[] {
  const lower = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const terms = lower.split(/\s+/).filter(t => t.length > 2);

  return RAG_DOCUMENTS
    .map(doc => {
      const keywordScore = doc.keywords.filter(k => lower.includes(k.toLowerCase())).length * 3;
      const titleScore = doc.title.toLowerCase().includes(lower) ? 5 : 0;
      const contentScore = terms.filter(t => doc.content.toLowerCase().includes(t)).length * 2;
      const score = keywordScore + titleScore + contentScore;
      return { ...doc, score };
    })
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score);
}
