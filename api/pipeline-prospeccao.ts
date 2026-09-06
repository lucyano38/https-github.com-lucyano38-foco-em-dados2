import type { VercelRequest, VercelResponse } from '@vercel/node';

/* ──────────────────────────────────────────────────────────────────────
   Dynamic Overpass tag mapper — maps nicho text → OSM query fragments
   ────────────────────────────────────────────────────────────────────── */
function getOverpassFilter(nicho: string, customNicho?: string): string {
  const term = (customNicho || nicho || '').toLowerCase();

  // ── Automotivo ──
  if (term.includes('automotivo') || term.includes('oficina') || term.includes('mecânica') || term.includes('mecanica') || term.includes('autopeça') || term.includes('autopecas')) {
    return [
      'node["shop"="car_repair"]',
      'node["shop"="car"]',
      'node["amenity"="car_wash"]',
      'node["shop"="tyres"]',
    ].join('; ');
  }

  // ── Pallets / Embalagens / Logística / Galpão Industrial ──
  if (term.includes('pallet') || term.includes('embalagen') || term.includes('logistica') || term.includes('galpao') || term.includes('galpão') || term.includes('industrial') || term.includes('armazém') || term.includes('armazem') || term.includes('estoque')) {
    return [
      'node["industrial"="packaging"]',
      'node["craft"="carpenter"]',
      'node["building"="warehouse"]',
      'node["shop"="trade"]',
      'node["industrial"="woodworking"]',
    ].join('; ');
  }

  // ── Odonto / Clínica / Saúde ──
  if (term.includes('odonto') || term.includes('dentista') || term.includes('clínic') || term.includes('clinica') || term.includes('saúde') || term.includes('saude') || term.includes('médic') || term.includes('medic') || term.includes('farmácia') || term.includes('farmacia')) {
    return [
      'node["amenity"="dentist"]',
      'node["amenity"="clinic"]',
      'node["amenity"="pharmacy"]',
      'node["amenity"="doctors"]',
    ].join('; ');
  }

  // ── Restaurantes / Gastronomia ──
  if (term.includes('restaurante') || term.includes('gastronomia') || term.includes('comida') || term.includes('food') || term.includes('lanchonete') || term.includes('pizzaria') || term.includes('churrascaria') || term.includes('hamburgueria') || term.includes('padaria') || term.includes('confeitaria')) {
    return [
      'node["amenity"="restaurant"]',
      'node["amenity"="cafe"]',
      'node["amenity"="fast_food"]',
      'node["amenity"="bar"]',
      'node["amenity"="bakery"]',
    ].join('; ');
  }

  // ── Advocacia / Jurídico ──
  if (term.includes('advocacia') || term.includes('advogado') || term.includes('jurídic') || term.includes('juridic') || term.includes('escritório') || term.includes('escritorio')) {
    return [
      'node["office"="lawyer"]',
      'node["office"="government"]',
    ].join('; ');
  }

  // ── Barbearia / Estética ──
  if (term.includes('barbearia') || term.includes('barba') || term.includes('cabelo') || term.includes('salão') || term.includes('salao') || term.includes('estética') || term.includes('estetica') || term.includes('beleza')) {
    return [
      'node["shop"="hairdresser"]',
      'node["shop"="beauty"]',
      'node["shop"="cosmetics"]',
    ].join('; ');
  }

  // ── Comércio Local (lojas gerais) ──
  if (term.includes('comércio') || term.includes('comercio') || term.includes('loja') || term.includes('varejo') || term.includes('mercado') || term.includes('supermercado')) {
    return [
      'node["shop"="supermarket"]',
      'node["shop"="convenience"]',
      'node["shop"="general"]',
      'node["shop"="department_store"]',
    ].join('; ');
  }

  // ── Construção Civil ──
  if (term.includes('constru') || term.includes('obra') || term.includes('engenharia') || term.includes('arquitetura') || term.includes('material de construção')) {
    return [
      'node["shop"="doityourself"]',
      'node["shop"="hardware"]',
      'node["craft"="painter"]',
      'node["craft"="plumber"]',
      'node["craft"="electrician"]',
    ].join('; ');
  }

  // ── Imobiliário ──
  if (term.includes('imobiliá') || term.includes('imobiliaria') || term.includes('imóvel') || term.includes('imovel') || term.includes('corretor') || term.includes('imobili')) {
    return [
      'node["office"="estate_agent"]',
      'node["shop"="estate_agent"]',
    ].join('; ');
  }

  // ── Educação ──
  if (term.includes('escola') || term.includes('curso') || term.includes('educação') || term.includes('educacao') || term.includes('aula') || term.includes('faculdade') || term.includes('universidade')) {
    return [
      'node["amenity"="school"]',
      'node["amenity"="college"]',
      'node["amenity"="university"]',
      'node["amenity"="kindergarten"]',
    ].join('; ');
  }

  // ── Tecnologia / SaaS ──
  if (term.includes('tecnologia') || term.includes('software') || term.includes('informática') || term.includes('informatica') || term.includes('ti ') || term.includes('sistemas')) {
    return [
      'node["office"="it"]',
      'node["shop"="computer"]',
      'node["shop"="electronics"]',
    ].join('; ');
  }

  // ── Academia / Fitness ──
  if (term.includes('academia') || term.includes('fitness') || term.includes('gym') || term.includes('crossfit') || term.includes('pilates') || term.includes('yoga')) {
    return [
      'node["leisure"="fitness_centre"]',
      'node["leisure"="sports_centre"]',
      'node["amenity"="gym"]',
    ].join('; ');
  }

  // ── Pet Shop / Veterinário ──
  if (term.includes('pet') || term.includes('veteriná') || term.includes('veterina') || term.includes('animal') || term.includes('cão') || term.includes('gato')) {
    return [
      'node["shop"="pet"]',
      'node["amenity"="veterinary"]',
    ].join('; ');
  }

  // ── Posto de Gasolina / Combustível ──
  if (term.includes('posto') || term.includes('combustível') || term.includes('combustivel') || term.includes('gasolina') || term.includes('álcool') || term.includes('etanol')) {
    return [
      'node["amenity"="fuel"]',
    ].join('; ');
  }

  // ── Hotel / Hospedagem ──
  if (term.includes('hotel') || term.includes('pousada') || term.includes('hostel') || term.includes('hospedagem') || term.includes('aluguel') || term.includes('airbnb')) {
    return [
      'node["tourism"="hotel"]',
      'node["tourism"="hostel"]',
      'node["tourism"="guest_house"]',
    ].join('; ');
  }

  // ── Fallback genérico: busca por nome/descrição com regex ──
  const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    `node["name"~"${safeTerm}",i]`,
    `node["description"~"${safeTerm}",i]`,
    `node["shop"="${safeTerm}"]`,
  ].join('; ');
}

/* ──────────────────────────────────────────────────────────────────────
   Overpass API query builder with fallback endpoints
   ────────────────────────────────────────────────────────────────────── */
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function queryOverpass(query: string): Promise<any> {
  const body = `data=${encodeURIComponent(query)}`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'FocoEmDadosProspector/2.0 (contato@focoemdados.com.br)',
        },
        body,
        signal: AbortSignal.timeout(20_000),
      });

      const text = await res.text();
      if (!text.startsWith('{') && !text.startsWith('[')) continue; // got HTML error page
      return JSON.parse(text);
    } catch {
      continue;
    }
  }

  throw new Error('Todos os endpoints Overpass API retornaram erro ou estavam indisponíveis.');
}

/* ──────────────────────────────────────────────────────────────────────
   Vercel serverless handler
   ────────────────────────────────────────────────────────────────────── */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ sucesso: false, erro: 'Método não permitido' });

  const { nicho, cidade, raio, customNicho, ticketAlvo, mrrAlvo, focoAbordagem, maxResults } = req.body || {};

  if (!cidade || !nicho) {
    return res.status(400).json({ sucesso: false, erro: 'Cidade e Nicho são obrigatórios' });
  }

  try {
    /* ── 1. Geocoding via Nominatim ── */
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cidade + ', Brasil')}`,
      { headers: { 'User-Agent': 'FocoEmDadosProspector/2.0 (contato@focoemdados.com.br)' } }
    );
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ sucesso: false, erro: 'Cidade não encontrada para geolocalização.' });
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);
    const raioMetros = (parseInt(raio) || 15) * 1000;
    const limit = Math.min(parseInt(maxResults) || 20, 50);

    /* ── 2. Build Overpass query with dynamic tag mapper ── */
    const overpassFilter = getOverpassFilter(nicho, customNicho);
    const overpassQueries = overpassFilter.split(';').filter(Boolean).map(q => `${q}(around:${raioMetros},${lat},${lon})`);
    const query = `[out:json][timeout:25];(${overpassQueries.join('; ')});out tags ${limit};`;

    /* ── 3. Query Overpass API ── */
    const overpassData = await queryOverpass(query);
    const elements: any[] = overpassData?.elements || [];

    /* ── 4. Map elements to lead objects ── */
    const leadsReais: any[] = [];
    const seen = new Set<string>();

    for (const el of elements) {
      if (!el.tags?.name) continue;
      const name = el.tags.name.trim();
      if (seen.has(name)) continue;
      seen.add(name);

      const elLat = el.lat;
      const elLon = el.lon;

      // Haversine distance
      const R = 6371;
      const dLat = (elLat - lat) * Math.PI / 180;
      const dLon = (elLon - lon) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(lat * Math.PI / 180) * Math.cos(elLat * Math.PI / 180) *
                Math.sin(dLon / 2) ** 2;
      const distancia = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      if (distancia > (parseInt(raio) || 15)) continue;

      // Extract contact info from OSM tags
      const phone = el.tags.phone || el.tags['contact:phone'] || null;
      const website = el.tags.website || el.tags['contact:website'] || null;
      const email = el.tags.email || el.tags['contact:email'] || null;
      const openingHours = el.tags.opening_hours || null;
      const cuisine = el.tags.cuisine || null;
      const addr = [
        el.tags['addr:street'], el.tags['addr:housenumber'],
        el.tags['addr:suburb'], el.tags['addr:city'],
      ].filter(Boolean).join(', ') || null;

      const temSite = !!website;
      const nomeLower = name.toLowerCase();

      leadsReais.push({
        id: `overpass_${el.id}`,
        nome: name,
        nicho,
        cidade,
        telefone: phone,
        whatsapp: phone,
        email,
        siteUrl: website,
        endereco: addr,
        temSite,
        necessitaRedesign: !temSite,
        redesignPreviewUrl: `/preview?nome=${encodeURIComponent(name)}&nicho=${encodeURIComponent(nicho)}&cidade=${encodeURIComponent(cidade)}`,
        score: temSite ? Math.floor(Math.random() * 15) + 50 : Math.floor(Math.random() * 15) + 75,
        status: temSite ? 'Site Potencial (Redesign)' : 'Sem Site (Oportunidade)',
        distancia: parseFloat(distancia.toFixed(1)),
        isRealData: true,
        osmType: 'node',
        osmId: el.id,
        lat: elLat,
        lon: elLon,
        tags: {
          cuisine,
          openingHours,
          amenity: el.tags.amenity,
          shop: el.tags.shop,
          industrial: el.tags.industrial,
          craft: el.tags.craft,
          building: el.tags.building,
        },
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: leadsReais.length > 0
        ? `${leadsReais.length} empresas reais encontradas em ${cidade} para "${nicho}"`
        : `Nenhuma empresa encontrada para "${nicho}" em ${cidade}. Tente outro nicho ou raio maior.`,
      parametros: { nicho, customNicho, cidade, raio: parseInt(raio) || 15, ticketAlvo, mrrAlvo, focoAbordagem },
      coordenadas: { lat, lon },
      totalEncontrados: leadsReais.length,
      leads: leadsReais,
      fonte: 'OpenStreetMap/Overpass API (dados abertos reais)',
      overpassFilterUsed: overpassFilter,
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
