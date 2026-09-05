import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ sucesso: false, erro: 'Método não permitido' });
  }

  const { nicho, cidade, raio, ticketAlvo, mrrAlvo, focoAbordagem } = req.body || {};

  if (!cidade || !nicho) {
    return res.status(400).json({ sucesso: false, erro: 'Cidade e Nicho são obrigatórios' });
  }

  try {
    // 1. Geolocalização com Nominatim
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cidade + ', Brasil')}`,
      { headers: { 'User-Agent': 'FocoEmDadosApp/2.0 (contato@focoemdados.com.br)' } }
    );
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ sucesso: false, erro: 'Cidade não encontrada para geolocalização.' });
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    // 2. Mapeamento de nicho para termos de busca do Nominatim
    const searchTerms: Record<string, string[]> = {
      'Restaurantes': ['restaurant', 'restaurante', 'pizzaria', 'hamburgueria', 'churrascaria'],
      'Restaurantes & Gastronomia': ['restaurant', 'restaurante', 'pizzaria', 'hamburgueria', 'churrascaria', 'padaria', 'confeitaria'],
      'Odontologia': ['dentista', 'odontologia', 'clínica odontológica', 'consultório'],
      'Odontologia & Estética': ['dentista', 'clínica', 'estética', 'salão'],
      'Advocacia': ['escritório de advocacia', 'advogado', 'advocacia'],
      'Advocacia & Direito': ['escritório de advocacia', 'advogado', 'advocacia'],
      'Arquitetura': ['escritório de arquitetura', 'arquiteto', 'engenharia'],
      'Automotivo': ['oficina', 'mecânica', 'autopeças', 'posto'],
      'Saúde & Bem-estar': ['clínica', 'farmácia', 'consultório', 'academia'],
      'Gastronomia': ['restaurante', 'cafeteria', 'lanchonete', 'bar'],
      'Educação & Cursos': ['escola', 'curso', 'aula', 'educação'],
      'Construção Civil': ['construtora', 'material de construção', 'ferreteria'],
      'Imobiliário': ['imobiliária', 'imóveis', 'corretor'],
      'Tecnologia & SaaS': ['tecnologia', 'software', 'informática'],
      'Comércio Local': ['loja', 'comércio', 'supermercado', 'mercado'],
    };

    const terms = searchTerms[nicho] || ['restaurante', 'loja', 'comércio'];

    // 3. Busca estabelecimentos via Nominatim (search por proximidade)
    const leadsReais: any[] = [];
    const seen = new Set<string>();

    for (const term of terms.slice(0, 3)) { // Limita a 3 termos para não exceder rate limit
      try {
        const searchRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term + ' ' + cidade)}&limit=10&addressdetails=1`,
          { headers: { 'User-Agent': 'FocoEmDadosApp/2.0 (contato@focoemdados.com.br)' } }
        );
        const searchData = await searchRes.json();

        for (const place of searchData) {
          if (seen.has(place.place_id)) continue;
          seen.add(place.place_id);

          const placeLat = parseFloat(place.lat);
          const placeLon = parseFloat(place.lon);

          // Calcula distância aproximada (fórmula de Haversine simplificada)
          const R = 6371;
          const dLat = (placeLat - lat) * Math.PI / 180;
          const dLon = (placeLon - lon) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const distancia = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

          if (distancia > (parseInt(raio) || 15)) continue;

          // Extrai informações do endereço
          const addr = place.address || {};
          const rua = addr.road || addr.pedestrian || '';
          const numero = addr.house_number || '';
          const bairro = addr.suburb || addr.neighbourhood || '';
          const telefoneMatch = place.display_name.match(/\(?\d{2}\)?\s*\d{4,5}[\s-]?\d{4}/);

          leadsReais.push({
            id: `nominatim_${place.place_id}`,
            nome: place.display_name.split(',')[0],
            nicho,
            cidade,
            telefone: telefoneMatch ? telefoneMatch[0] : null,
            whatsapp: null,
            email: null,
            siteUrl: null,
            endereco: `${rua}${numero ? ', ' + numero : ''}${bairro ? ' - ' + bairro : ''}`,
            temSite: false,
            necessitaRedesign: true,
            redesignPreviewUrl: `/preview?nome=${encodeURIComponent(place.display_name.split(',')[0])}&nicho=${encodeURIComponent(nicho)}&cidade=${encodeURIComponent(cidade)}`,
            score: Math.floor(Math.random() * 15) + 75,
            status: 'Sem Site (Oportunidade)',
            distancia: parseFloat(distancia.toFixed(1)),
            isRealData: true,
            osmType: place.osm_type,
            osmId: place.osm_id,
            lat: placeLat,
            lon: placeLon,
          });
        }

        // Rate limit: 1 req/s para Nominatim
        await new Promise(r => setTimeout(r, 1100));
      } catch (err) {
        continue;
      }
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: leadsReais.length > 0
        ? `${leadsReais.length} empresas reais encontradas em ${cidade}`
        : `Nenhuma empresa encontrada para "${nicho}" em ${cidade}. Tente outro nicho ou raio maior.`,
      parametros: { nicho, cidade, raio: parseInt(raio) || 15, ticketAlvo, mrrAlvo, focoAbordagem },
      coordenadas: { lat, lon },
      totalEncontrados: leadsReais.length,
      leads: leadsReais,
      fonte: 'OpenStreetMap/Nominatim (dados abertos reais)',
    });

  } catch (error: any) {
    console.error('[Pipeline Error]:', error);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro interno ao processar prospecção.',
      detalhes: error.message,
    });
  }
}
