import type { VercelRequest, VercelResponse } from '@vercel/node';

/* ──────────────────────────────────────────────────────────────────────
   Nominatim multi-query search — the WORKING approach from Vercel
   Overpass is blocked from Vercel IPs. Google Places needs env key.
   Nominatim is fast, reliable, and has OSM business data.
   ────────────────────────────────────────────────────────────────────── */

// Map nicho → Nominatim search terms (multiple queries per nicho)
const NICHOS_SEARCH: Record<string, string[]> = {
  'restaurantes': ['restaurant', 'restaurante', 'cafe', 'lanchonete', 'pizzaria', 'churrascaria', 'hamburgueria', 'padaria', 'bar'],
  'gastronomia': ['restaurant', 'restaurante', 'cafe', 'lanchonete', 'pizzaria', 'bar'],
  'odonto': ['dentist', 'dentista', 'clinica', 'clinica medica', 'odontologia'],
  'clínic': ['clinica', 'clinica medica', 'consultorio medico'],
  'saúde': ['clinica', 'hospital', 'farmacia', 'consultorio'],
  'advocacia': ['lawyer', 'advogado', 'escritorio de advocacia', 'cartorio'],
  'advogado': ['lawyer', 'advogado', 'escritorio de advocacia'],
  'barbearia': ['hairdresser', 'barbearia', 'salao de beleza', 'estetica', 'beauty salon'],
  'estética': ['beauty salon', 'salao de beleza', 'estetica', 'spa'],
  'automotivo': ['car repair', 'oficina mecanica', 'auto pecas', 'car wash', 'lavagem de carros'],
  'comércio': ['supermarket', 'supermercado', 'loja', 'convenience store', 'mercado'],
  'loja': ['loja', 'store', 'mercado', 'shopping'],
  'construção': ['hardware store', 'loja de materiais de construcao', 'construtora'],
  'imobiliário': ['real estate', 'imobiliaria', 'corretor de imoveis'],
  'educação': ['school', 'escola', 'faculdade', 'curso', 'educacao'],
  'academia': ['gym', 'academia', 'fitness', 'crossfit', 'pilates'],
  'pet': ['pet shop', 'veterinary', 'veterinaria', 'pet'],
  'posto': ['gas station', 'posto de gasolina', 'combustivel'],
  'hotel': ['hotel', 'pousada', 'hostel', 'hospedagem'],
  'tecnologia': ['technology', 'software', 'informatica', 'computador'],
};

function getSearchTerms(nicho: string, customNicho?: string): string[] {
  const term = (customNicho || nicho || '').toLowerCase();
  for (const [key, queries] of Object.entries(NICHOS_SEARCH)) {
    if (term.includes(key)) return queries;
  }
  return [term]; // fallback: use the custom nicho text directly
}

/* ──────────────────────────────────────────────────────────────────────
   Nominatim search — single query
   ────────────────────────────────────────────────────────────────────── */
async function searchNominatim(query: string, lat: number, lon: number, limit: number): Promise<any[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&extratags=1&limit=${limit}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FocoEmDadosProspector/2.0 (contato@focoemdados.com.br)' },
      signal: AbortSignal.timeout(8_000),
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
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
      { headers: { 'User-Agent': 'FocoEmDadosProspector/2.0 (contato@focoemdados.com.br)' }, signal: AbortSignal.timeout(8_000) }
    );
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ sucesso: false, erro: 'Cidade não encontrada para geolocalização.' });
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);
    const raioMax = parseInt(raio) || 15;
    const limit = Math.min(parseInt(maxResults) || 20, 50);

    /* ── 2. Buscar empresas via Nominatim multi-query ── */
    const searchTerms = getSearchTerms(nicho, customNicho);
    const allResults: any[] = [];
    const seenIds = new Set<string>();
    const diag: string[] = [];

    // Execute searches in parallel (max 5 concurrent)
    const searchTermSlices = searchTerms.slice(0, 5);
    const searchPromises = searchTermSlices.map(term => {
      const q = `${term} ${cidade.split('/')[0]}`;
      return searchNominatim(q, lat, lon, Math.ceil(limit / searchTermSlices.length));
    });

    const searchResults = await Promise.all(searchPromises);

    for (let i = 0; i < searchResults.length; i++) {
      const results = searchResults[i];
      diag.push(`[${searchTermSlices[i]}] ${results.length} resultados`);
      for (const r of results) {
        const placeId = r.place_id || r.osm_id;
        if (seenIds.has(String(placeId))) continue;
        seenIds.add(String(placeId));

        const rLat = parseFloat(r.lat);
        const rLon = parseFloat(r.lon);
        if (isNaN(rLat) || isNaN(rLon)) continue;

        const dist = haversine(lat, lon, rLat, rLon);
        if (dist > raioMax) continue;

        allResults.push({ ...r, _distancia: dist });
      }
    }

    diag.push(`[Total] ${allResults.length} empresas dentro do raio`);

    /* ── 3. Normalizar em leads ── */
    const leadsReais: any[] = [];
    const seenNames = new Set<string>();

    for (const r of allResults) {
      const name = (r.display_name || '').split(',')[0]?.trim();
      if (!name || name.length < 3) continue;
      const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);

      const extratags = r.extratags || {};
      const address = r.address || {};
      const phone = extratags.phone || extratags['contact:phone'] || null;
      const website = extratags.website || extratags['contact:website'] || null;
      const email = extratags.email || extratags['contact:email'] || null;
      const openingHours = extratags.opening_hours || null;

      const temSite = !!website;

      const addr = [address.road, address.house_number, address.suburb || address.neighbourhood, address.city || address.town]
        .filter(Boolean).join(', ');

      leadsReais.push({
        id: `nominatim_${r.place_id || Math.random().toString(36).slice(2)}`,
        nome: name,
        nicho, cidade,
        telefone: phone,
        whatsapp: phone,
        email,
        siteUrl: website,
        endereco: addr || r.display_name?.split(',').slice(1, 4).join(',') || null,
        temSite,
        necessitaRedesign: true,
        redesignPreviewUrl: `/preview-redesign?nome=${encodeURIComponent(name)}&nicho=${encodeURIComponent(nicho)}&cidade=${encodeURIComponent(cidade)}`,
        score: temSite ? 65 : 85,
        status: temSite ? 'Site Potencial (Redesign)' : 'Sem Site (Alta Oportunidade)',
        distancia: parseFloat(r._distancia.toFixed(1)),
        isRealData: true,
        fonte: 'OpenStreetMap/Nominatim',
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        osmType: r.osm_type,
        osmId: r.osm_id,
        tags: {
          cuisine: extratags.cuisine || null,
          openingHours,
          amenity: r.type,
          shop: null,
        },
      });
    }

    // Sort by distance
    leadsReais.sort((a, b) => (a.distancia || 999) - (b.distancia || 999));

    return res.status(200).json({
      sucesso: true,
      mensagem: leadsReais.length > 0
        ? `${leadsReais.length} empresas reais encontradas em ${cidade} para "${nicho}"`
        : `Nenhuma empresa encontrada para "${nicho}" em ${cidade}. Tente outro nicho ou raio maior.`,
      parametros: { nicho, customNicho, cidade, raio: raioMax, ticketAlvo, mrrAlvo, focoAbordagem },
      coordenadas: { lat, lon },
      totalEncontrados: leadsReais.length,
      leads: leadsReais,
      fontes: {
        overpass: 0,
        googlePlaces: 0,
        cnaeBrasilAPI: 0,
        nominatim: leadsReais.length,
        total: leadsReais.length,
      },
      fonteDescricao: `${leadsReais.length} via OpenStreetMap/Nominatim`,
      diagnostico: diag,
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
