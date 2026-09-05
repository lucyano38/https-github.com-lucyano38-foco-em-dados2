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
      { headers: { 'User-Agent': 'FocoEmDadosApp/2.0' } }
    );
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ sucesso: false, erro: 'Cidade não encontrada para geolocalização.' });
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);
    const raioMetros = (parseInt(raio) || 15) * 1000;

    // 2. Mapeamento de CNAE/nicho para tags do OpenStreetMap
    const amenityMap: Record<string, string[]> = {
      'Restaurantes': ['restaurant', 'cafe', 'fast_food', 'bar', 'pub'],
      'Odontologia': ['dentist', 'clinic'],
      'Advocacia': ['lawyer'],
      'Arquitetura': ['office'],
      'Automotivo': ['car_repair', 'car', 'fuel'],
      'Saúde & Bem-estar': ['clinic', 'pharmacy', 'dentist'],
      'Gastronomia': ['restaurant', 'cafe', 'fast_food', 'bar', 'bakery'],
      'Educação & Cursos': ['school', 'university', 'college'],
      'Construção Civil': ['hardware', 'trade'],
      'Imobiliário': ['estate_agent'],
      'Tecnologia & SaaS': ['office'],
      'Comércio Local': ['shop', 'supermarket', 'convenience'],
    };

    const amenityTypes = amenityMap[nicho] || ['restaurant', 'cafe', 'shop'];

    // 3. Busca Overpass API — dados REAIS do OpenStreetMap
    const amenityFilters = amenityTypes.map(t => `node["amenity"="${t}"](around:${raioMetros},${lat},${lon});`).join('\n        ');
    const shopFilters = nicho === 'Comércio Local'
      ? `node["shop"](around:${raioMetros},${lat},${lon});`
      : '';

    const queryOverpass = `
      [out:json][timeout:20];
      (
        ${amenityFilters}
        ${shopFilters}
      );
      out tags 25;
    `.trim();

    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: queryOverpass,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const overpassData = await overpassRes.json();
    const elementos = overpassData?.elements || [];

    // 4. Mapeia APENAS empresas reais que possuem nome
    const leadsReais = elementos
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any, index: number) => ({
        id: `real_${el.id || index}`,
        nome: el.tags.name,
        nicho,
        cidade,
        telefone: el.tags.phone || el.tags['contact:phone'] || null,
        whatsapp: el.tags['contact:mobile'] || el.tags.phone || null,
        email: el.tags['contact:email'] || null,
        siteUrl: el.tags.website || null,
        temSite: !!el.tags.website,
        necessitaRedesign: !el.tags.website,
        score: !el.tags.website ? 90 : 60,
        status: !el.tags.website ? 'Sem Site (Oportunidade)' : 'Com Site',
        rating: el.tags.stars ? parseFloat(el.tags.stars) : null,
        notas: el.tags.opening_hours ? `Horário: ${el.tags.opening_hours}` : null,
        isRealData: true,
        osmId: el.id,
        lat: el.lat,
        lon: el.lon,
      }));

    return res.status(200).json({
      sucesso: true,
      mensagem: leadsReais.length > 0
        ? `${leadsReais.length} empresas reais encontradas em ${cidade}`
        : `Nenhuma empresa encontrada no OpenStreetMap para ${nicho} em ${cidade}. Tente outro nicho ou raio maior.`,
      parametros: { nicho, cidade, raio: parseInt(raio) || 15, ticketAlvo, mrrAlvo, focoAbordagem },
      coordenadas: { lat, lon },
      totalEncontrados: leadsReais.length,
      leads: leadsReais,
      fonte: 'OpenStreetMap (dados abertos reais)',
    });

  } catch (error: any) {
    console.error('[Pipeline Error]:', error);
    return res.status(500).json({
      sucesso: false,
      erro: 'Erro ao consultar base de dados reais de empresas.',
      detalhes: error.message,
    });
  }
}
