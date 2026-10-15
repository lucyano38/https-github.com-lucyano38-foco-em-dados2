export interface ProspectingResult {
  establishment: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    place_id: string;
  };
  google_places_term: string;
  cnae_code: string;
  cnae_description: string;
}

const CNAE_MAP: Record<string, { code: string; description: string }> = {
  odontologia: { code: "8630-5/04", description: "Atividades de cirurgiões-dentistas" },
  dentista: { code: "8630-5/04", description: "Atividades de cirurgiões-dentistas" },
  "clinica odontologica": { code: "8630-5/04", description: "Atividades de cirurgiões-dentistas" },
  "odontologia e estetica": { code: "8630-5/04", description: "Atividades de cirurgiões-dentistas" },
  estetica: { code: "9602-3/01", description: "Lojas de beleza e salões de beleza" },
  "clinica estetica": { code: "9602-3/01", description: "Lojas de beleza e salões de beleza" },
  beleza: { code: "9602-3/01", description: "Lojas de beleza e salões de beleza" },
  "salao beleza": { code: "9602-3/01", description: "Lojas de beleza e salões de beleza" },
  spa: { code: "9602-3/01", description: "Lojas de beleza e salões de beleza" },
  "salao spa": { code: "9602-3/01", description: "Lojas de beleza e salões de beleza" },
};

const GOOGLE_PLACES_TERMS: Record<string, string[]> = {
  odontologia: ["dentista", "cirurgião-dentista", "clínica odontológica", "clínica dental"],
  dentista: ["dentista", "cirurgião-dentista", "clínica odontológica", "clínica dental"],
  "clinica odontologica": ["dentista", "cirurgião-dentista", "clínica odontológica", "clínica dental"],
  "odontologia e estetica": ["dentista", "clínica odontológica", "cirurgião-dentista"],
  estetica: ["estetica", "beauty", "spa", "clinica estetica", "salao beleza"],
  beleza: ["beauty", "spa", "estetica", "clinica estetica", "salao beleza"],
  "salao beleza": ["salao beleza", "beauty salon", "estetica", "spa"],
  spa: ["spa", "wellness", "beauty", "clinica estetica"],
  "salao spa": ["spa", "wellness", "beauty salon"],
};

function normalizeNiche(niche: string): string {
  return niche
    .toLowerCase()
    .replace(/&/g, " e ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function getGooglePlacesTerms(niche: string): string[] {
  const key = normalizeNiche(niche);
  if (GOOGLE_PLACES_TERMS[key]) {
    return GOOGLE_PLACES_TERMS[key];
  }
  for (const [k, terms] of Object.entries(GOOGLE_PLACES_TERMS)) {
    if (key.includes(k) || k.includes(key)) {
      return terms;
    }
  }
  return [""];
}

export function getCnaeCodes(niche: string): { code: string; description: string } | null {
  const key = normalizeNiche(niche);
  if (CNAE_MAP[key]) {
    return CNAE_MAP[key];
  }
  for (const [k, value] of Object.entries(CNAE_MAP)) {
    if (key.includes(k) || k.includes(key)) {
      return value;
    }
  }
  return null;
}

export async function prospectarEstabelecimentos(
  niche: string,
  city: string,
  radius: number = 50
): Promise<ProspectingResult[]> {
  const searchTerms = getGooglePlacesTerms(niche);
  const cnae = getCnaeCodes(niche);

  if (!searchTerms || searchTerms.length === 0) {
    throw new Error("Nicho não mapeado para termos de busca do Google Places");
  }

  const prospects: ProspectingResult[] = [];
  const errors: Error[] = [];

  const searchPromises = searchTerms.map(async (term) => {
    try {
      // Simulação de busca Google Places - em produção usaria a API real
      // Aqui simulamos com base nos termos e código CNAE
      await new Promise((resolve) => setTimeout(resolve, 200));

      const mockResults = [
        {
          name: `${niche} em ${city}`,
          address: `${Math.floor(Math.random() * 999) + 1} Rua Exemplo, ${city}`,
          latitude: -23.55 + Math.random() * 0.1,
          longitude: -46.64 + Math.random() * 0.1,
          place_id: `placeholder_${Math.random().toString(36).substring(2, 11)}`,
        },
      ];

      for (const result of mockResults) {
        prospects.push({
          establishment: result,
          google_places_term: term,
          cnae_code: cnae?.code || "",
          cnae_description: cnae?.description || "",
        });
      }
    } catch (error) {
      errors.push(error as Error);
    }
  });

  await Promise.all(searchPromises);

  if (errors.length > 0) {
    console.warn(`[Prospecção] Erros em ${errors.length} das ${searchTerms.length} buscas`, errors);
  }

  return prospects;
}