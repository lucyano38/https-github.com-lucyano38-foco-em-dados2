/* ──────────────────────────────────────────────────────────────────────
   Affiliates Config — Links de afiliado centralizados
   Use: import { AFFILIATES } from '@/config/affiliates'
   ────────────────────────────────────────────────────────────────────── */

export interface AffiliateItem {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'hospedagem' | 'dominio' | 'pagamento' | 'ferramenta' | 'equipamento';
  url: string;
  preco?: string;
  icone?: string;
  destaque?: boolean;
}

export const AFFILIATES: AffiliateItem[] = [
  // HOSPEDAGEM
  {
    id: 'vercel-pro',
    nome: 'Vercel Pro',
    descricao: 'Hospedagem frontend para React/Next.js com CDN global, previews de deploy e analytics.',
    categoria: 'hospedagem',
    url: 'https://vercel.com/?ref=focoemdados',
    preco: '$20/mês',
    destaque: true,
  },
  {
    id: 'cloudflare-workers',
    nome: 'Cloudflare Workers',
    descricao: 'Compute serverless边缘 com Workers KV, R2 storage e D1 database.',
    categoria: 'hospedagem',
    url: 'https://workers.cloudflare.com/?ref=focoemdados',
    preco: 'Grátis até 100k req/dia',
  },
  {
    id: 'hostinger',
    nome: 'Hostinger Business',
    descricao: 'Hospedagem compartilhada com painel hPanel, SSL grátis e domínio incluso.',
    categoria: 'hospedagem',
    url: 'https://hostinger.com/?ref=focoemdados',
    preco: 'R$ 16,99/mês',
  },

  // DOMÍNIO
  {
    id: 'namecheap',
    nome: 'Namecheap',
    descricao: 'Registro de domínio com proteção WHOIS grátis e transferência facilitada.',
    categoria: 'dominio',
    url: 'https://namecheap.com/?ref=focoemdados',
    preco: 'R$ 30/ano',
  },
  {
    id: 'google-domains',
    nome: 'Google Domains (Squarespace)',
    descricao: 'Domínio com DNS rápido, SSL e integração direta com Google Workspace.',
    categoria: 'dominio',
    url: 'https://domains.squarespace.com/?ref=focoemdados',
    preco: 'R$ 60/ano',
  },

  // PAGAMENTO
  {
    id: 'stripe',
    nome: 'Stripe',
    descricao: 'Gateway de pagamento para e-commerce com PIX, cartão e boleto. Taxa: 3,99% + R$ 0,39.',
    categoria: 'pagamento',
    url: 'https://stripe.com/?ref=focoemdados',
    preco: 'Taxa por transação',
    destaque: true,
  },
  {
    id: 'pagseguro',
    nome: 'PagSeguro',
    descricao: 'Maquininha de cartão e link de pagamento para WhatsApp. Taxa a partir de 1,69%.',
    categoria: 'pagamento',
    url: 'https://pagseguro.uol.com.br/?ref=focoemdados',
    preco: 'R$ 37,90/mês',
  },

  // FERRAMENTAS B2B
  {
    id: 'n8n',
    nome: 'n8n Cloud',
    descricao: 'Automação de workflows: conectar CRM, WhatsApp, email, planilhas e APIs.',
    categoria: 'ferramenta',
    url: 'https://n8n.io/?ref=focoemdados',
    preco: '€ 20/mês',
  },
  {
    id: 'supabase',
    nome: 'Supabase',
    descricao: 'Backend-as-a-Service: PostgreSQL, Auth, Storage e Realtime para apps.',
    categoria: 'ferramenta',
    url: 'https://supabase.com/?ref=focoemdados',
    preco: 'Grátis até 500MB DB',
  },
  {
    id: 'canva-pro',
    nome: 'Canva Pro',
    descricao: 'Design gráfico profissional para artes de redes sociais, apresentações e posts.',
    categoria: 'ferramenta',
    url: 'https://canva.com/?ref=focoemdados',
    preco: 'R$ 34,90/mês',
  },

  // EQUIPAMENTOS
  {
    id: 'maquininha-pagseguro',
    nome: 'Maquininha PagSeguro',
    descricao: 'Maquininha de cartão com Wi-Fi e 4G. Aceita PIX, débito e crédito.',
    categoria: 'equipamento',
    url: 'https://loja.pagseguro.uol.com.br/maquininhas?ref=focoemdados',
    preco: 'R$ 379,00',
  },
  {
    id: 'maquininha-stone',
    nome: 'Stone M10',
    descricao: 'Maquininha Touch com tela, impressora e leitor QR Code integrado.',
    categoria: 'equipamento',
    url: 'https://loja.stone.com.br/maquininhas?ref=focoemdados',
    preco: 'R$ 449,00',
  },
];

export const AFFILIATE_CATEGORIES = {
  hospedagem: { label: 'Hospedagem & Infraestrutura', color: '#3b82f6' },
  dominio: { label: 'Domínio & DNS', color: '#8b5cf6' },
  pagamento: { label: 'Pagamento & Maquininhas', color: '#10b981' },
  ferramenta: { label: 'Ferramentas B2B', color: '#d4a574' },
  equipamento: { label: 'Equipamentos', color: '#f59e0b' },
} as const;

export function getAffiliatesByCategory(categoria: string): AffiliateItem[] {
  return AFFILIATES.filter(a => a.categoria === categoria);
}

export function getFeaturedAffiliates(): AffiliateItem[] {
  return AFFILIATES.filter(a => a.destaque);
}
