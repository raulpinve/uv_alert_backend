/**
 * Conversión oficial OMM/OMS:
 * 1 unidad de Índice UV = 0.025 W/m²
 * de irradiancia eritemática efectiva.
 *
 * Fuente:
 * WHO/WMO, "Global Solar UV Index: A Practical Guide", 2002.
 */
const ERYTHEMAL_IRRADIANCE_PER_UV_UNIT = 0.025;

const SAFETY_MARGIN = 0.75;

// No mostramos estimaciones superiores a este límite.
export const MAX_RECOMMENDED_MINUTES = 240;

/**
 * Estima los minutos antes de alcanzar la dosis mínima eritemática (MED),
 * aplicando un margen de seguridad.
 *
 * @param {number} uvValue Índice UV actual.
 * @param {number} medJm2 MED estimada para el fototipo, en J/m².
 * @returns {number|null} Minutos estimados o null si no hay datos válidos.
 */
export function getRecommendedExposureMinutes(uvValue, medJm2) {
  if (!uvValue || uvValue <= 0 || !medJm2) {
    return null;
  }

  const irradiance = uvValue * ERYTHEMAL_IRRADIANCE_PER_UV_UNIT;
  const minutesToMed = medJm2 / irradiance / 60;

  return Math.min(
    Math.round(minutesToMed * SAFETY_MARGIN),
    MAX_RECOMMENDED_MINUTES
  );
}

/**
 * Convierte minutos a un formato legible para el usuario.
 *
 * Ejemplos:
 * 35  → "35 minutos"
 * 60  → "1 hora"
 * 65  → "1 hora y 5 minutos"
 * 155 → "2 horas y 35 minutos"
 */
export function formatExposureTime(minutes) {
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const hoursText = `${hours} ${hours === 1 ? "hora" : "horas"}`;

  if (remainingMinutes === 0) {
    return hoursText;
  }

  const minutesText = `${remainingMinutes} ${
    remainingMinutes === 1 ? "minuto" : "minutos"
  }`;

  return `${hoursText} y ${minutesText}`;
}

/**
 * Genera el mensaje de exposición estimada.
 */
export function getExposureMessage(minutes) {
  if (minutes === null) {
    return "No se pudo estimar tu tiempo de exposición.";
  }

  if (minutes >= MAX_RECOMMENDED_MINUTES) {
    return "Tardarías más de 4 h en enrojecerte. Usa protector igual.";
  }

  return `Sin protección, podrías enrojecerte en ${formatExposureTime(minutes)}.`;
}