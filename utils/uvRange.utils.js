import { pool } from "../init.db.js";

// Keyed by uv_ranges.code (stable, English). Values are user-facing (Spanish).
export const MESSAGES_BY_RANGE = {
  NONE: [
    "No necesitas protección por ahora.",
    "Sin radiación UV en este momento.",
  ],

  LOW: [
    "Puedes salir con tranquilidad.",
    "No necesitas precauciones especiales.",
  ],

  MODERATE: [
    "Usa bloqueador si vas a estar afuera.",
    "Aplica bloqueador antes de salir.",
  ],

  HIGH: [
    "Usa bloqueador y busca sombra.",
    "Aplica bloqueador y evita el sol directo.",
  ],

  VERY_HIGH: [
    "Usa bloqueador y busca sombra.",
    "Evita el sol directo y aplica bloqueador.",
  ],

  EXTREME: [
    "Evita el sol directo y usa bloqueador.",
    "Protégete bien si vas a salir.",
  ],

  EXTREME_HIGH: [
    "Evita el sol directo. Usa protección total.",
    "Busca sombra y usa bloqueador.",
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
    WHERE min_value <= $1
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