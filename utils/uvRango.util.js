import { pool } from '../init.db.js';

export const MENSAJES_POR_RANGO = {
  'Sin UV':
    'Todo bien, mi loco — no hay radiación UV ahorita. Sal tranquilo.',

  'Bajo':
    'La cosa está suave, la radiación UV está bajita. Sal tranquilo.',

  'Moderado':
    'Si te vas a quedar un rato afuera, échate el bloqueador pa\' que no te ponga como camarón.',

  'Alto':
    'Ey mani, la radiación UV está alta aunque esté nublado. Échate bloqueador y búscate una sombrita de vez en cuando.',

  'Muy alto': 'Ey, la UV está bien alta, así el cielo esté tapao\'. Ponte buen bloqueador, no te me vayas a achicharrar.',

  'Extremo':
    '¡Ombeee! La radiación UV está a millón, aunque no veas el sol de frente. Échate bloqueador full y evita el sol directo.',

  'Extremo alto':
    'Esto está que arde, mi loco. La UV está en el tope, nublado o no. Ponte bloqueador ya mismo y búscate sombra, no te expongas de frente.',
};

export async function obtenerRangoUV(valorUV) {
  const { rows } = await pool.query(
    `
    SELECT id, nombre, valor_min
    FROM rangos_uv
    WHERE $1 BETWEEN valor_min AND valor_max
    ORDER BY valor_min DESC
    LIMIT 1
    `,
    [valorUV]
  );

  return rows[0] || null;
}

export function obtenerMensajeRecomendacion(nombreRango) {
  return (
    MENSAJES_POR_RANGO[nombreRango] ??
    'Échale un ojo al índice UV antes de salir, parce.'
  );
}