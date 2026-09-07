import type { VercelRequest, VercelResponse } from '@vercel/node';

/* ──────────────────────────────────────────────────────────────────────
   Nicho → Google Places type mapping
   ────────────────────────────────────────────────────────────────────── */
const NICHOS_TO_PLACES_TYPES: Record<string, string[]> = {
  'restaurantes': ['restaurant', 'cafe', 'food', 'bakery'],
  'gastronomia': ['restaurant', 'cafe', 'bar', 'food'],
  'odonto': ['dentist', 'doctor', 'hospital', 'pharmacy'],
  'clínic': ['doctor', 'hospital', 'dentist', 'pharmacy'],
  'saúde': ['doctor', 'hospital', 'dentist', 'pharmacy'],
  'advocacia': ['lawyer', 'accounting'],
  'advogado': ['lawyer'],
  'barbearia': ['hair_care', 'beauty_salon'],
  'estética': ['beauty_salon', 'hair_care'],
  'automotivo': ['car_repair', 'car_dealer', 'gas_station'],
  'comércio': ['store', 'supermarket', 'convenience_store', 'clothing_store'],
  'loja': ['store', 'supermarket', 'clothing_store'],
  'construção': ['hardware_store', 'home_improvement_store'],
  'imobiliário': ['real_estate_agency'],
  'educação': ['school', 'university', 'gym'],
  'academia': ['gym', 'fitness_center'],
  'pet': ['veterinary_care', 'pet_store'],
  'posto': ['gas_station'],
  'hotel': ['lodging', 'hotel'],
  'tecnologia': ['electronics_store', 'computer_store'],
};

function getPlacesTypes(nicho: string, customNicho?: string): string[] {
  const term = (customNicho || nicho || '').toLowerCase();
  for (const [key, types] of Object.entries(NICHOS_TO_PLACES_TYPES)) {
    if (term.includes(key)) return types;
  }
  return ['point_of_interest', 'establishment']; // fallback genérico
}

/* ──────────────────────────────────────────────────────────────────────
   Nicho → Overpass tag mapping (mantido do original)
   ────────────────────────────────────────────────────────────────────── */
function getOverpassFilter(nicho: string, customNicho?: string): string {
  const term = (customNicho || nicho || '').toLowerCase();

  if (term.includes('automotivo') || term.includes('oficina') || term.includes('mecânica') || term.includes('mecanica') || term.includes('autopeça') || term.includes('autopecas')) {
    return ['node["shop"="car_repair"]', 'node["shop"="car"]', 'node["amenity"="car_wash"]', 'node["shop"="tyres"]'].join('; ');
  }
  if (term.includes('pallet') || term.includes('embalagen') || term.includes('logistica') || term.includes('galpao') || term.includes('galpão') || term.includes('industrial') || term.includes('armazém') || term.includes('armazem') || term.includes('estoque')) {
    return ['node["industrial"="packaging"]', 'node["craft"="carpenter"]', 'node["building"="warehouse"]', 'node["shop"="trade"]', 'node["industrial"="woodworking"]'].join('; ');
  }
  if (term.includes('odonto') || term.includes('dentista') || term.includes('clínic') || term.includes('clinica') || term.includes('saúde') || term.includes('saude') || term.includes('médic') || term.includes('medic') || term.includes('farmácia') || term.includes('farmacia')) {
    return ['node["amenity"="dentist"]', 'node["amenity"="clinic"]', 'node["amenity"="pharmacy"]', 'node["amenity"="doctors"]'].join('; ');
  }
  if (term.includes('restaurante') || term.includes('gastronomia') || term.includes('comida') || term.includes('food') || term.includes('lanchonete') || term.includes('pizzaria') || term.includes('churrascaria') || term.includes('hamburgueria') || term.includes('padaria') || term.includes('confeitaria')) {
    return ['node["amenity"="restaurant"]', 'node["amenity"="cafe"]', 'node["amenity"="fast_food"]', 'node["amenity"="bar"]', 'node["amenity"="bakery"]'].join('; ');
  }
  if (term.includes('advocacia') || term.includes('advogado') || term.includes('jurídic') || term.includes('juridic') || term.includes('escritório') || term.includes('escritorio')) {
    return ['node["office"="lawyer"]', 'node["office"="government"]'].join('; ');
  }
  if (term.includes('barbearia') || term.includes('barba') || term.includes('cabelo') || term.includes('salão') || term.includes('salao') || term.includes('estética') || term.includes('estetica') || term.includes('beleza')) {
    return ['node["shop"="hairdresser"]', 'node["shop"="beauty"]', 'node["shop"="cosmetics"]'].join('; ');
  }
  if (term.includes('comércio') || term.includes('comercio') || term.includes('loja') || term.includes('varejo') || term.includes('mercado') || term.includes('supermercado')) {
    return ['node["shop"="supermarket"]', 'node["shop"="convenience"]', 'node["shop"="general"]', 'node["shop"="department_store"]'].join('; ');
  }
  if (term.includes('constru') || term.includes('obra') || term.includes('engenharia') || term.includes('arquitetura') || term.includes('material de construção')) {
    return ['node["shop"="doityourself"]', 'node["shop"="hardware"]', 'node["craft"="painter"]', 'node["craft"="plumber"]', 'node["craft"="electrician"]'].join('; ');
  }
  if (term.includes('imobiliá') || term.includes('imobiliaria') || term.includes('imóvel') || term.includes('imovel') || term.includes('corretor') || term.includes('imobili')) {
    return ['node["office"="estate_agent"]', 'node["shop"="estate_agent"]'].join('; ');
  }
  if (term.includes('escola') || term.includes('curso') || term.includes('educação') || term.includes('educacao') || term.includes('aula') || term.includes('faculdade') || term.includes('universidade')) {
    return ['node["amenity"="school"]', 'node["amenity"="college"]', 'node["amenity"="university"]', 'node["amenity"="kindergarten"]'].join('; ');
  }
  if (term.includes('tecnologia') || term.includes('software') || term.includes('informática') || term.includes('informatica') || term.includes('ti ') || term.includes('sistemas')) {
    return ['node["office"="it"]', 'node["shop"="computer"]', 'node["shop"="electronics"]'].join('; ');
  }
  if (term.includes('academia') || term.includes('fitness') || term.includes('gym') || term.includes('crossfit') || term.includes('pilates') || term.includes('yoga')) {
    return ['node["leisure"="fitness_centre"]', 'node["leisure"="sports_centre"]', 'node["amenity"="gym"]'].join('; ');
  }
  if (term.includes('pet') || term.includes('veteriná') || term.includes('veterina') || term.includes('animal') || term.includes('cão') || term.includes('gato')) {
    return ['node["shop"="pet"]', 'node["amenity"="veterinary"]'].join('; ');
  }
  if (term.includes('posto') || term.includes('combustível') || term.includes('combustivel') || term.includes('gasolina') || term.includes('álcool') || term.includes('etanol')) {
    return ['node["amenity"="fuel"]'].join('; ');
  }
  if (term.includes('hotel') || term.includes('pousada') || term.includes('hostel') || term.includes('hospedagem') || term.includes('aluguel') || term.includes('airbnb')) {
    return ['node["tourism"="hotel"]', 'node["tourism"="hostel"]', 'node["tourism"="guest_house"]'].join('; ');
  }

  const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [`node["name"~"${safeTerm}",i]`, `node["description"~"${safeTerm}",i]`, `node["shop"="${safeTerm}"]`].join('; ');
}

/* ──────────────────────────────────────────────────────────────────────
   Overpass API query with fallback endpoints
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
      if (!text.startsWith('{') && !text.startsWith('[')) continue;
      return JSON.parse(text);
    } catch { continue; }
  }
  throw new Error('Todos os endpoints Overpass API retornaram erro ou estavam indisponíveis.');
}

/* ──────────────────────────────────────────────────────────────────────
   Google Places API — Nearby Search + Text Search
   ────────────────────────────────────────────────────────────────────── */
async function searchGooglePlaces(
  lat: number, lon: number, radius: number, nicho: string, customNicho?: string, limit = 20
): Promise<any[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  const types = getPlacesTypes(nicho, customNicho);
  const results: any[] = [];
  const seen = new Set<string>();

  for (const type of types) {
    try {
      // Nearby Search (raio)
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius * 1000}&type=${type}&key=${apiKey}&language=pt-BR`;
      const nearbyRes = await fetch(nearbyUrl, { signal: AbortSignal.timeout(10_000) });
      const nearbyData = await nearbyRes.json();

      if (nearbyData.status === 'OK' && Array.isArray(nearbyData.results)) {
        for (const place of nearbyData.results) {
          if (seen.has(place.place_id)) continue;
          seen.add(place.place_id);
          results.push(place);
        }
      }
    } catch { continue; }
  }

  // Se Google retornou poucos resultados, tenta Text Search genérico
  if (results.length < 3) {
    try {
      const searchTerm = customNicho || nicho;
      const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm + ' em ' + lat + ',' + lon)}&key=${apiKey}&language=pt-BR`;
      const textRes = await fetch(textUrl, { signal: AbortSignal.timeout(10_000) });
      const textData = await textRes.json();
      if (textData.status === 'OK' && Array.isArray(textData.results)) {
        for (const place of textData.results) {
          if (seen.has(place.place_id)) continue;
          seen.add(place.place_id);
          results.push(place);
        }
      }
    } catch { /* ignore */ }
  }

  return results.slice(0, limit);
}

/* ──────────────────────────────────────────────────────────────────────
   BrasilAPI — busca por CNAE / CNPJ (dados públicos)
   ────────────────────────────────────────────────────────────────────── */
// Mapeamento nicho → código CNAE principal
const CNAE_MAP: Record<string, string[]> = {
  'restaurante': ['5611-2', '5612-1'],
  'gastronomia': ['5611-2', '5612-1', '1091-1'],
  'odonto': ['8630-5'],
  'clínic': ['8630-5', '8690-9'],
  'saúde': ['8630-5', '8690-9', '4771-7'],
  'advocacia': ['6911-7'],
  'barbearia': ['9602-5'],
  'estética': ['9602-5', '9609-2'],
  'automotivo': ['4520-0', '4543-5'],
  'comércio': ['4711-3', '4712-1', '4713-0'],
  'loja': ['4711-3', '4712-1'],
  'construção': ['4120-4', '4399-1'],
  'imobiliário': ['6821-8'],
  'educação': ['8599-6', '8512-1'],
  'academia': ['9313-5'],
  'pet': ['4789-0', '7500-1'],
  'hotel': ['5510-8', '5590-6'],
  'tecnologia': ['6201-5', '6202-3'],
};

async function searchByCNAE(cidade: string, nicho: string, customNicho?: string): Promise<any[]> {
  const term = (customNicho || nicho || '').toLowerCase();
  let cnaeCodes: string[] = [];

  for (const [key, codes] of Object.entries(CNAE_MAP)) {
    if (term.includes(key)) { cnaeCodes = codes; break; }
  }
  if (cnaeCodes.length === 0) return [];

  const results: any[] = [];

  // Busca via BrasilAPI (dados públicos de CNPJ)
  for (const cnae of cnaeCodes) {
    try {
      const res = await fetch(
        `https://brasilapi.com.br/api/cnae/v1/${cnae.replace('-', '')}`,
        { signal: AbortSignal.timeout(8_000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      // BrasilAPI retorna estabelecimentos com este CNAE
      if (Array.isArray(data)) {
        // Filtra por cidade se possível
        const filtered = data.filter((e: any) => {
          const cidadeEstab = (e.municipio_fantasia || e.cidade || '').toLowerCase();
          return cidadeEstab.includes(cidade.toLowerCase().split('/')[0]);
        });
        results.push(...filtered.slice(0, 10));
      }
    } catch { continue; }
  }

  return results;
}

/* ──────────────────────────────────────────────────────────────────────
   Haversine distance
   ────────────────────────────────────────────────────────────────────── */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ──────────────────────────────────────────────────────────────────────
   Vercel serverless handler — Pipeline Enriquecido
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

    /* ── 2. Buscar em PARALELO: Overpass + Google Places + CNAE ── */
    const overpassPromise = (async () => {
      try {
        const overpassFilter = getOverpassFilter(nicho, customNicho);
        const overpassQueries = overpassFilter.split(';').filter(Boolean).map(q => `${q}(around:${raioMetros},${lat},${lon})`);
        const query = `[out:json][timeout:25];(${overpassQueries.join('; ')});out tags ${limit};`;
        const data = await queryOverpass(query);
        return data?.elements || [];
      } catch (err) {
        console.warn('[Pipeline] Overpass falhou:', (err as Error).message);
        return [];
      }
    })();

    const placesPromise = searchGooglePlaces(lat, lon, parseInt(raio) || 15, nicho, customNicho, limit);

    const cnaePromise = searchByCNAE(cidade, nicho, customNicho);

    const [overpassElements, googlePlaces, cnaeResults] = await Promise.all([
      overpassPromise, placesPromise, cnaePromise
    ]);

    /* ── 3. Normalizar e deduplicar resultados ── */
    const leadsMap = new Map<string, any>();
    const fontes = { overpass: 0, google: 0, cnae: 0 };

    // 3a. Overpass (OSM) — prioridade alta
    for (const el of overpassElements) {
      if (!el.tags?.name) continue;
      const name = el.tags.name.trim();
      const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (leadsMap.has(key)) continue;

      const dist = haversine(lat, lon, el.lat, el.lon);
      if (dist > (parseInt(raio) || 15)) continue;

      leadsMap.set(key, {
        id: `overpass_${el.id}`,
        nome: name,
        nicho, cidade,
        telefone: el.tags.phone || el.tags['contact:phone'] || null,
        whatsapp: el.tags.phone || el.tags['contact:phone'] || null,
        email: el.tags.email || el.tags['contact:email'] || null,
        siteUrl: el.tags.website || el.tags['contact:website'] || null,
        endereco: [el.tags['addr:street'], el.tags['addr:housenumber'], el.tags['addr:suburb'], el.tags['addr:city']].filter(Boolean).join(', ') || null,
        temSite: !!(el.tags.website || el.tags['contact:website']),
        necessitaRedesign: false,
        redesignPreviewUrl: '',
        score: 0,
        status: '',
        distancia: parseFloat(dist.toFixed(1)),
        isRealData: true,
        fonte: 'OpenStreetMap',
        osmType: 'node',
        osmId: el.id,
        lat: el.lat,
        lon: el.lon,
        tags: {
          cuisine: el.tags.cuisine || null,
          openingHours: el.tags.opening_hours || null,
          amenity: el.tags.amenity,
          shop: el.tags.shop,
        },
      });
      fontes.overpass++;
    }

    // 3b. Google Places — prioridade alta
    for (const place of googlePlaces) {
      const name = (place.name || '').trim();
      if (!name) continue;
      const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (leadsMap.has(key)) continue;

      const pLat = place.geometry?.location?.lat;
      const pLng = place.geometry?.location?.lng;
      if (!pLat || !pLng) continue;

      const dist = haversine(lat, lon, pLat, pLng);
      if (dist > (parseInt(raio) || 15)) continue;

      const temSite = !!(place.website || place.url);
      const phone = place.formatted_phone_number || null;

      leadsMap.set(key, {
        id: `google_${place.place_id}`,
        nome: name,
        nicho, cidade,
        telefone: phone,
        whatsapp: phone,
        email: null,
        siteUrl: place.website || null,
        endereco: place.vicinity || place.formatted_address || null,
        temSite,
        necessitaRedesign: false,
        redesignPreviewUrl: '',
        score: 0,
        status: '',
        distancia: parseFloat(dist.toFixed(1)),
        isRealData: true,
        fonte: 'Google Places',
        googleRating: place.rating || null,
        googleTotalRatings: place.user_ratings_total || 0,
        googleTypes: place.types || [],
        googleOpenNow: place.opening_hours?.open_now ?? null,
        lat: pLat,
        lon: pLng,
        tags: {
          cuisine: null,
          openingHours: null,
          amenity: null,
          shop: null,
        },
      });
      fontes.google++;
    }

    // 3c. CNAE (BrasilAPI) — dados complementares
    for (const cnpj of cnaeResults) {
      const name = (cnpj.nome_fantasia || cnpj.razao_social || '').trim();
      if (!name) continue;
      const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (leadsMap.has(key)) continue;

      // Tenta geocodificar a cidade do CNAE
      const cidadeCnae = cnpj.municipio_fantasia || cnpj.cidade || cidade;

      leadsMap.set(key, {
        id: `cnae_${cnpj.cnpj || Math.random().toString(36).slice(2)}`,
        nome: name,
        nicho, cidade: cidadeCnae,
        telefone: cnpj.ddd_telefone_1 || cnpj.telefone || null,
        whatsapp: cnpj.ddd_telefone_1 || cnpj.telefone || null,
        email: null,
        siteUrl: null,
        endereco: [cnpj.logradouro, cnpj.numero, cnpj.bairro].filter(Boolean).join(', ') || null,
        temSite: false,
        necessitaRedesign: false,
        redesignPreviewUrl: '',
        score: 0,
        status: '',
        distancia: null,
        isRealData: true,
        fonte: 'CNAE/BrasilAPI',
        cnpj: cnpj.cnpj || null,
        razaoSocial: cnpj.razao_social || null,
        cnaePrincipal: cnpj.cnae_fiscal_principal || null,
        situacaoCadastral: cnpj.situacao_cadastral || null,
        lat: null,
        lon: null,
        tags: {
          cuisine: null,
          openingHours: null,
          amenity: null,
          shop: null,
        },
      });
      fontes.cnae++;
    }

    /* ── 4. Enriquecer e classificar leads ── */
    const leadsReais = Array.from(leadsMap.values()).map(lead => {
      const temSite = !!lead.siteUrl;

      // Auto-detectar necessidade de redesign
      lead.necessitaRedesign = temSite; // tem site? provavelmente precisa de redesign
      if (!temSite) lead.necessitaRedesign = true; // sem site = oportunidade

      // Score de oportunidade baseado em múltiplos fatores
      let score = 50;
      if (!temSite) score += 25; // sem site = alta oportunidade
      if (lead.googleRating && lead.googleRating < 4.0) score += 10; // rating baixo
      if (lead.googleTotalRatings && lead.googleTotalRatings < 50) score += 5; // poucas avaliações
      if (!lead.telefone && !lead.whatsapp) score -= 10; // sem contato
      if (lead.situacaoCadastral && lead.situacaoCadastral !== 'Ativa') score -= 20;
      score = Math.max(0, Math.min(100, score));

      lead.score = score;
      lead.status = temSite
        ? (score >= 70 ? 'Site Potencial (Redesign)' : 'Site Existente')
        : (score >= 70 ? 'Sem Site (Alta Oportunidade)' : 'Sem Site (Oportunidade)');

      // Gerar preview URL
      lead.redesignPreviewUrl = `/preview-redesign?nome=${encodeURIComponent(lead.nome)}&nicho=${encodeURIComponent(nicho)}&cidade=${encodeURIComponent(cidade)}`;

      return lead;
    }).sort((a, b) => b.score - a.score);

    return res.status(200).json({
      sucesso: true,
      mensagem: leadsReais.length > 0
        ? `${leadsReais.length} empresas reais encontradas em ${cidade} para "${nicho}"`
        : `Nenhuma empresa encontrada para "${nicho}" em ${cidade}. Tente outro nicho ou raio maior.`,
      parametros: { nicho, customNicho, cidade, raio: parseInt(raio) || 15, ticketAlvo, mrrAlvo, focoAbordagem },
      coordenadas: { lat, lon },
      totalEncontrados: leadsReais.length,
      leads: leadsReais,
      fontes: {
        overpass: fontes.overpass,
        googlePlaces: fontes.google,
        cnaeBrasilAPI: fontes.cnae,
        total: fontes.overpass + fontes.google + fontes.cnae,
      },
      fonteDescricao: [
        fontes.overpass > 0 ? `${fontes.overpass} via OpenStreetMap` : null,
        fontes.google > 0 ? `${fontes.google} via Google Places` : null,
        fontes.cnae > 0 ? `${fontes.cnae} via CNAE/BrasilAPI` : null,
      ].filter(Boolean).join(' + ') || 'Nenhuma fonte retornou dados',
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
