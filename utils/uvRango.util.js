import { pool } from '../init.db.js';

export const MENSAJES_POR_RANGO = {
  'Sin UV': [
    'Todo bien, mi llave — no hay radiación UV ahorita. Puedes salir sin lío.',
    'La UV está en cero, mi llave. Puedes salir sin miedo a quedar como camarón.',
    'Relájate, que el sol está suavecito y la UV no está haciendo de las suyas.',
    'Hoy el sol está portándose bien. No hay UV peligrosa, así que dale sin mente.',
    'La UV está dormida. Aprovecha y sal a darte tu vueltica.',
  ],

  'Bajo': [
    'La cosa está suave, mi llave. La radiación UV está bajita. Puedes salir sin lío.',
    'La UV está más relajada que uno un domingo después del almuerzo.',
    'Todo bajo control, mi llave. La UV está bajita, así que dale sin mente.',
    'El sol está haciendo presencia, pero la UV está juiciosa. Puedes salir sin miedo.',
    'La UV está suave como brisa de playa. Aprovecha y sal un rato.',
  ],

  'Moderado': [
    'Si te vas a quedar un rato afuera, échate el bloqueador pa\' que no te ponga como camarón.',
    'Ojo ahí, mi llave. La UV ya está cogiendo fuerza. Un poquito de bloqueador no mata a nadie.',
    'La UV está moderada. Échate tu bloqueador antes de salir, que después uno anda como tomate.',
    'Si vas pa\' la calle, bloqueador. No esperes a sentir el sol pa\' acordarte.',
    'La UV está subiendo. Ponte bloqueador y no te pongas a desafiar el sol, que después pareces langosta.',
  ],

  'Alto': [
    'Ey, mi llave, la radiación UV está alta aunque esté nublado. Échate bloqueador y búscate una sombrita.',
    'Ajá, mi llave, la UV está fuerte. Bloqueador puesto y no te quedes tostándote como arepa.',
    'La cosa se está poniendo seria. Bloqueador y sombra cuando puedas.',
    'Ojo con esa UV. Que esté nublado no significa que el sol se fue de vacaciones.',
    'La UV está alta. Ponte bloqueador antes de salir, no después de quedar como camarón.',
  ],

  'Muy alto': [
    'Ey, la UV está bien alta, así el cielo esté tapao\'. Ponte buen bloqueador y no te me vayas a achicharrar.',
    'Mi llave, esto está fuerte. Bloqueador ya y busca sombra, que aquí nadie quiere quedar como chicharrón.',
    'La UV está pasada de revoluciones. Ponte bloqueador y evita quedarte bajo el sol directo.',
    'Aunque esté nublado, esa UV viene con ganas de pelea. Bloqueador y sombrita.',
    'Ojo ahí, mi llave. La UV está muy alta. No salgas a pecho pelao\' como si estuvieras en la playa.',
  ],

  'Extremo': [
    '¡Ombeee! La radiación UV está a millón, aunque no veas el sol de frente. Échate bloqueador full y evita el sol directo.',
    '¡Mi llave, esto está criminal! La UV está extrema. Bloqueador, sombra y nada de hacerse el Superman.',
    '¡Ajá! Hoy el sol amaneció con ganas de cobrar. UV extrema: bloqueador y evita el sol directo.',
    '¡Ojo! Esa UV está disparada. No te me vayas a achicharrar por andar de valiente.',
    'Esto no es pa\' jugar. La UV está extrema. Bloqueador full y busca sombra.',
  ],

  'Extremo alto': [
    'Esto está que arde, mi llave. La UV está en el tope, nublado o no. Ponte bloqueador ya mismo y búscate sombra.',
    '¡Ombe, guarda esa humanidad! La UV está por las nubes. Bloqueador y sombra, mi llave.',
    'Esto está más peligroso que ventilador sin luz en pleno mediodía. UV extrema: busca sombra y protégete.',
    '¡Ajá! La UV está a otro nivel. No salgas a desafiar el sol porque hoy viene buscando víctimas.',
    'Esto está como pa\' freír huevo en la calle. UV al máximo: bloqueador, sombra y evita el sol directo.',
  ],
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
  const mensajes = MENSAJES_POR_RANGO[nombreRango];

  if (!mensajes?.length) {
    return 'Échale un ojo al índice UV antes de salir, parce.';
  }

  const indiceAleatorio = Math.floor(Math.random() * mensajes.length);

  return mensajes[indiceAleatorio];
}