import { pool } from '../init.db.js';

export const MENSAJES_POR_RANGO = {
  'Bajo':
    'El sol está suave. Puedes salir tranquilo.',

  'Moderado':
    'Si vas a estar un buen rato afuera, échate protector solar.',

  'Alto':
    'Ojo con ese sol. Échate protector solar y busca sombrita de vez en cuando.',

  'Muy alto':
    'Ese sol está fuerte. Mejor busca sombrita y ponte buen protector solar.',

  'Extremo':
    'Ajá, ese sol viene con toda. Evita el sol directo y protégete bien.',

  'Extremo alto':
    'Ese sol está bastante bravo. Mejor evita la exposición directa y busca sombra.',
};

export async function obtenerRangoUV(valorUV) {
  const { rows } = await pool.query(
    `
    SELECT id, nombre
    FROM rangos_uv
    WHERE $1 BETWEEN valor_min AND valor_max
    `,
    [valorUV]
  );

  return rows[0] || null;
}

export function obtenerMensajeRecomendacion(nombreRango) {
  return (
    MENSAJES_POR_RANGO[nombreRango] ??
    'Échale un ojo al índice UV antes de salir.'
  );
}