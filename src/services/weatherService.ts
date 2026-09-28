// Service de météo réelle en direct pour les cols des Alpes-Maritimes (06)
// Données fournies sans clé d'API par Open-Meteo avec coordonnées GPS précises

export interface MountainPassLive {
  col: string;
  altitude: number;
  status: 'Normal' | 'Délicat' | 'Travaux' | 'Fermé' | 'Indisponible';
  temp: number | null;
  windSpeed: number | null;
  windGusts: number | null;
  weatherDesc: string;
  details: string;
  isRealTime: boolean;
  updatedAt: string;
}

const PASSES_COORDS = [
  {
    col: 'Col de Turini (1 604m)',
    name: 'Turini',
    altitude: 1604,
    lat: 43.978,
    lon: 7.391,
    defaultDetails: 'Revêtement sec, prudence gravillons en épingle.',
  },
  {
    col: 'Col de la Bonette (2 802m)',
    name: 'Bonette',
    altitude: 2802,
    lat: 44.321,
    lon: 6.807,
    defaultDetails: 'Haute altitude, vent soutenu et risque verglas matinal.',
  },
  {
    col: 'Col de Braus (1 002m)',
    name: 'Braus',
    altitude: 1002,
    lat: 43.871,
    lon: 7.401,
    defaultDetails: 'Conditions optimales, circulation fluide.',
  },
  {
    col: 'Col de Vence (963m)',
    name: 'Vence',
    altitude: 963,
    lat: 43.743,
    lon: 7.108,
    defaultDetails: 'Chaussée sèche, attention cyclistes en montée.',
  },
  {
    col: 'Col de Castillon (706m)',
    name: 'Castillon',
    altitude: 706,
    lat: 43.834,
    lon: 7.467,
    defaultDetails: 'Accès dégagé vers Sospel et Vallée de la Roya.',
  },
];

function interpretWeatherCode(code: number, temp: number, gusts: number): {
  status: 'Normal' | 'Délicat' | 'Travaux' | 'Fermé' | 'Indisponible';
  weatherDesc: string;
  details: string;
} {
  // WMO Weather interpretation codes
  // 0: Clear sky, 1-3: Partly cloudy, 45-48: Fog
  // 51-55: Drizzle, 61-65: Rain, 71-77: Snow, 80-82: Showers, 95-99: Thunderstorm
  if (temp <= 1) {
    return {
      status: 'Délicat',
      weatherDesc: 'Givre / Risque verglas',
      details: `${temp}°C en altitude. Risque élevé de verglas matinal et plaques d'ombre. Prudence 2-roues.`,
    };
  }

  if (code >= 71 && code <= 77) {
    return {
      status: 'Délicat',
      weatherDesc: 'Chutes de neige',
      details: `${temp}°C. Neige ou neige fondue. Conditions défavorables aux motos ; vérifier les consignes locales.`,
    };
  }

  if (gusts >= 60) {
    return {
      status: 'Délicat',
      weatherDesc: 'Vent violent',
      details: `Rafales mesurées à ${gusts} km/h. Prudence renforcée sur crêtes et viaducs.`,
    };
  }

  if (code >= 61 && code <= 67) {
    return {
      status: 'Délicat',
      weatherDesc: 'Pluie / Chaussée mouillée',
      details: `${temp}°C. Pluie en cours. Risque d'aquaplaning et d'adhérence réduite sur les peintures.`,
    };
  }

  if (code >= 51 && code <= 55) {
    return {
      status: 'Délicat',
      weatherDesc: 'Bruine / Brouillard',
      details: `${temp}°C. Visibilité réduite et chaussée grasse. Allumer feux de croisement.`,
    };
  }

  if (code >= 45 && code <= 48) {
    return {
      status: 'Délicat',
      weatherDesc: 'Brouillard épais',
      details: `${temp}°C. Nappes de brouillard denses en versant nord. Réduire l'allure.`,
    };
  }

  // Conditions normales
  const condition = code <= 1 ? 'Ensoleillé' : 'Nuageux';
  return {
    status: 'Normal',
    weatherDesc: condition,
    details: `${temp}°C, vent ${gusts > 25 ? `rafales ${gusts} km/h` : 'calme'}. Prévision météo uniquement ; ouverture et état de la route à vérifier.`,
  };
}

export async function fetchLivePassesWeather(): Promise<MountainPassLive[]> {
  try {
    const results = await Promise.all(
      PASSES_COORDS.map(async (p) => {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m&timezone=Europe%2FParis`;
          const res = await fetch(url);
          if (!res.ok) throw new Error('API offline');
          const data = await res.json();
          const current = data.current;
          const temp = Math.round(current.temperature_2m * 10) / 10;
          const windSpeed = Math.round(current.wind_speed_10m);
          const windGusts = Math.round(current.wind_gusts_10m);
          const weatherCode = current.weather_code;

          const interpretation = interpretWeatherCode(weatherCode, temp, windGusts);

          return {
            col: p.col,
            altitude: p.altitude,
            status: interpretation.status,
            temp,
            windSpeed,
            windGusts,
            weatherDesc: interpretation.weatherDesc,
            details: interpretation.details,
            isRealTime: true,
            updatedAt: current.time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          };
        } catch {
          return {
            col: p.col,
            altitude: p.altitude,
            status: 'Indisponible' as const,
            temp: null,
            windSpeed: null,
            windGusts: null,
            weatherDesc: 'Données indisponibles',
            details: 'La météo ne permet pas de confirmer l’ouverture ni l’état de la route.',
            isRealTime: false,
            updatedAt: 'Indisponible',
          };
        }
      })
    );
    return results;
  } catch (err) {
    console.warn('Erreur chargement météo cols:', err);
    return PASSES_COORDS.map((p) => ({
      col: p.col,
      altitude: p.altitude,
      status: 'Indisponible' as const,
      temp: null,
      windSpeed: null,
      windGusts: null,
      weatherDesc: 'Données indisponibles',
      details: 'La météo ne permet pas de confirmer l’ouverture ni l’état de la route.',
      isRealTime: false,
      updatedAt: 'Indisponible',
    }));
  }
}
