/**
 * Dosis Eritémica Mínima (MED) en J/m² por fototipo de Fitzpatrick.
 * Valores de referencia estándar en fotobiología dermatológica
 * (Diffey, B.L., 1997; estándar COLIPA), citados también en la
 * OMS: "Global Solar UV Index: A Practical Guide" (2002).
 */
const MED_BY_FITZPATRICK_SCALE = {
  I: 200,
  II: 250,
  III: 300,
  IV: 450,
  V: 600,
  VI: 1000,
};

/**
 * Conversión oficial OMM/OMS: 1 unidad de Índice UV equivale a
 * 0.025 W/m² de irradiancia eritémica efectiva.
 * Fuente: WHO/WMO, "Global Solar UV Index: A Practical Guide", 2002.
 */
const ERYTHEMAL_IRRADIANCE_PER_UV_UNIT = 0.025; // W/m² por unidad de UV

const SAFETY_MARGIN = 0.75; // recomienda detenerse antes de llegar a la MED
const MAX_RECOMMENDED_MINUTES = 240; // tope superior razonable (4h)

/**
 * Calcula los minutos de exposición solar recomendados antes del
 * primer enrojecimiento (con margen de seguridad), según el Índice
 * UV actual y el fototipo de piel (escala Fitzpatrick I-VI).
 */
export function getRecommendedExposureMinutes(uvValue, fitzpatrickScale) {
  const med = MED_BY_FITZPATRICK_SCALE[fitzpatrickScale];

  if (!uvValue || uvValue <= 0 || !med) {
    return null;
  }

  const irradiance = uvValue * ERYTHEMAL_IRRADIANCE_PER_UV_UNIT; // W/m²
  const secondsToMed = med / irradiance;
  const minutesToMed = secondsToMed / 60;

  const recommendedMinutes = minutesToMed * SAFETY_MARGIN;

  return Math.min(Math.round(recommendedMinutes), MAX_RECOMMENDED_MINUTES);
}

export function getExposureMessage(minutes) {
  if (minutes === null) {
    return "No hay radiación UV significativa en este momento.";
  }

  if (minutes >= MAX_RECOMMENDED_MINUTES) {
    return `Puedes estar expuesto más de ${MAX_RECOMMENDED_MINUTES} minutos, pero se recomienda usar protector solar igualmente.`;
  }

  return `Tiempo de exposición segura estimado: ${minutes} minutos sin protección.`;
}