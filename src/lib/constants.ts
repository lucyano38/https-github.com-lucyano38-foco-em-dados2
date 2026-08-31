/**
 * Canonical list of market niches used across the application.
 * Import this instead of defining niche arrays locally.
 */
export const NICHOS = [
  'Clínicas Médicas e Odontológicas',
  'Academias e Centros de Fitness',
  'Restaurantes e Gastronomia',
  'Imobiliárias e Construtoras',
  'Escritórios de Advocacia',
  'E-commerce e Varejo Digital',
  'Empresas de Tecnologia (SaaS & TI)',
  'Oficinas Mecânicas e Autopeças',
  'Escolas e Cursos Profissionalizantes',
] as const;

export const CNAES = [
  { code: '8630-5/03', desc: 'Atividade médica ambulatorial restrita a consultas' },
  { code: '5611-2/01', desc: 'Restaurantes e similares' },
  { code: '6201-5/01', desc: 'Desenvolvimento de programas de computador sob encomenda' },
  { code: '6821-8/01', desc: 'Corretagem na compra e venda e avaliação de imóveis' },
  { code: '6920-6/01', desc: 'Atividades de contabilidade' },
  { code: '9313-5/00', desc: 'Atividades de condicionamento físico (Academias)' },
  { code: '4520-0/01', desc: 'Serviços de manutenção e reparação mecânica de veículos' },
  { code: '8599-6/99', desc: 'Outras atividades de ensino não especificadas anteriormente' },
] as const;
