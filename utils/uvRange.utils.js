import { pool } from "../init.db.js";

// Keyed by uv_ranges.code (stable, English). Values are user-facing (Spanish).
export const MESSAGES_BY_RANGE = {
  NONE: [
    "No hay radiación UV en este momento.",
    "El índice UV está en cero por ahora.",
    "Sin radiación UV por el momento, no necesitas protección.",
  ],

  LOW: [
    "La radiación UV es baja. Puedes salir con tranquilidad.",
    "El índice UV está bajo, no necesitas precauciones especiales.",
    "UV baja por ahora. Puedes disfrutar del exterior sin preocuparte.",
  ],

  MODERATE: [
    "La radiación UV es moderada. Usa bloqueador si vas a estar afuera un rato.",
    "El índice UV está subiendo. Aplica bloqueador antes de salir.",
    "UV moderada: no olvides el bloqueador si te vas a exponer al sol.",
  ],

  HIGH: [
    "La radiación UV es alta, incluso con nubes. Usa bloqueador y busca sombra cuando puedas.",
    "El índice UV está alto. Aplica bloqueador y evita el sol directo por periodos largos.",
    "UV alta: aplica bloqueador antes de salir y busca sombra cuando puedas.",
  ],

  VERY_HIGH: [
    "La radiación UV es muy alta, aunque esté nublado. Usa bloqueador y busca sombra.",
    "El índice UV está muy alto. Evita el sol directo y aplica bloqueador.",
    "UV muy alta: evita exponerte mucho tiempo sin protección.",
  ],

  EXTREME: [
    "La radiación UV es extrema. Usa bloqueador, busca sombra y evita el sol directo.",
    "El índice UV está en nivel extremo. Protégete bien si vas a salir.",
    "UV extrema: aplica bloqueador y limita tu exposición al sol.",
  ],

  EXTREME_HIGH: [
    "La radiación UV está en su nivel máximo. Evita el sol directo y usa protección completa.",
    "El índice UV es extremadamente alto. Busca sombra y usa bloqueador.",
    "UV en el nivel más alto: evita exponerte al sol sin protección.",
  ],
};

export const TITLES_BY_RANGE = {
  NONE: "Sin radiación UV",
  LOW: "UV baja",
  MODERATE: "UV moderada",
  HIGH: "UV alta",
  VERY_HIGH: "UV muy alta",
  EXTREME: "¡UV extrema!",
  EXTREME_HIGH: "¡UV en nivel máximo!",
};

export function getNotificationTitle(rangeCode, rangeName) {
  return TITLES_BY_RANGE[rangeCode] || `UV en nivel ${rangeName.toLowerCase()}`;
}

export async function getUvRange(uvValue) {
  const { rows } = await pool.query(
    `
    SELECT id, code, name, min_value
    FROM uv_ranges
    WHERE $1 BETWEEN min_value AND max_value
    ORDER BY min_value DESC
    LIMIT 1
    `,
    [uvValue]
  );

  return rows[0] || null;
}

export function getRecommendationMessage(rangeCode) {
  const messages = MESSAGES_BY_RANGE[rangeCode];

  if (!messages?.length) {
    return "Revisa el índice UV antes de salir.";
  }

  const randomIndex = Math.floor(Math.random() * messages.length);

  return messages[randomIndex];
}