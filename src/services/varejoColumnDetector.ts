export interface ColumnMapping {
  column: string;
  detectedRole: 'revenue' | 'cost' | 'quantity' | 'product' | 'category' | 'collection' | 'customer' | 'seller' | 'payment_status' | 'date' | 'discount' | 'commission' | 'city' | 'unknown';
  confidence: number; // 0-1
}

export interface DetectionResult {
  mappings: ColumnMapping[];
  suggestedTemplate: 'vendas_padrao' | 'vendas_moda' | 'estoque' | 'financeiro';
  summary: string;
}

const COLUMN_PATTERNS: Record<string, { role: ColumnMapping['detectedRole']; keywords: string[] }> = {
  revenue: {
    role: 'revenue',
    keywords: ['faturamento', 'receita', 'valor total', 'total venda', 'vlr líquido', 'líquido', 'bruto', 'preço total', 'venda', 'recebido'],
  },
  cost: {
    role: 'cost',
    keywords: ['custo', 'preço de custo', 'custo unitário', 'custo total', 'margem', 'custo produto'],
  },
  quantity: {
    role: 'quantity',
    keywords: ['quantidade', 'qtd', 'itens', 'qtde', 'volume', 'unidades', 'pecas', 'peças'],
  },
  product: {
    role: 'product',
    keywords: ['produto', 'sku', 'código', 'referência', 'item', 'nome produto', 'descrição', 'modelo', 'artigo'],
  },
  category: {
    role: 'category',
    keywords: ['categoria', 'departamento', 'grupo', 'seção', 'linha', 'tipo produto', 'segmento', 'divisão'],
  },
  collection: {
    role: 'collection',
    keywords: ['coleção', 'colecao', 'safra', 'temporada', 'estação', 'colecao verão', 'coleção inverno', 'campanha'],
  },
  customer: {
    role: 'customer',
    keywords: ['cliente', 'comprador', 'consumidor', 'nome cliente', 'cpf', 'cnpj', 'documento'],
  },
  seller: {
    role: 'seller',
    keywords: ['vendedor', 'representante', 'consultor', 'vendas', 'vendedor'],
  },
  payment_status: {
    role: 'payment_status',
    keywords: ['status', 'pagamento', 'situação', 'pago', 'pendente', 'atraso', 'vencimento', 'status pagamento'],
  },
  date: {
    role: 'date',
    keywords: ['data', 'dia', 'mês', 'ano', 'emissão', 'vencimento', 'competência', 'lançamento'],
  },
  discount: {
    role: 'discount',
    keywords: ['desconto', 'desc', 'abatimento', 'percentual desconto'],
  },
  commission: {
    role: 'commission',
    keywords: ['comissão', 'comissao', 'comissões'],
  },
  city: {
    role: 'city',
    keywords: ['cidade', 'cidade', 'município', 'uf', 'estado', 'região'],
  },
};

function matchColumn(columnName: string): ColumnMapping {
  const lower = columnName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [role, pattern] of Object.entries(COLUMN_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lower.includes(normalizedKeyword) || normalizedKeyword.includes(lower)) {
        const confidence = lower === normalizedKeyword ? 0.95 
          : lower.includes(normalizedKeyword) ? 0.85 
          : 0.6;
        return {
          column: columnName,
          detectedRole: pattern.role,
          confidence,
        };
      }
    }
  }

  return {
    column: columnName,
    detectedRole: 'unknown',
    confidence: 0,
  };
}

export function detectVarejoColumns(headers: string[]): DetectionResult {
  const mappings = headers.map(matchColumn);

  // Determine suggested template based on detected columns
  const roles = new Set(mappings.map(m => m.detectedRole));
  const hasRevenue = roles.has('revenue');
  const hasQuantity = roles.has('quantity');
  const hasCategory = roles.has('category');
  const hasCollection = roles.has('collection');
  const hasProduct = roles.has('product');
  const hasPayment = roles.has('payment_status');

  let suggestedTemplate: DetectionResult['suggestedTemplate'] = 'vendas_padrao';
  let summary = 'Planilha de vendas detectada.';

  if (hasCollection && hasCategory && hasProduct) {
    suggestedTemplate = 'vendas_moda';
    summary = 'Planilha de vendas de moda/vestuário com coleções e categorias detectada.';
  } else if (hasRevenue && hasQuantity) {
    suggestedTemplate = 'vendas_padrao';
    summary = 'Planilha de vendas com receita e quantidades.';
  } else if (hasProduct && !hasRevenue) {
    suggestedTemplate = 'estoque';
    summary = 'Planilha de estoque/produtos detectada.';
  } else if (hasPayment && hasRevenue) {
    suggestedTemplate = 'financeiro';
    summary = 'Planilha financeira com status de pagamento detectada.';
  }

  return { mappings, suggestedTemplate, summary };
}
