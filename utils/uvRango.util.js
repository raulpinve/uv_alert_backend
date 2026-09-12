import { pool } from '../init.db.js';

export const MENSAJES_POR_RANGO = {
  'Sin UV': [
    'Todo bien por ahora, no hay radiación UV.',
    'La UV está en cero por el momento.',
    'De una, parce, no hay UV.',
    'Tranquilo, la UV no está activa.',
    'No hay radiación UV que te preocupe ahorita.',
  ],

  'Bajo': [
    'La cosa está suave, la UV está bajita. Puedes salir sin problema.',
    'Todo tranquilo, parce. La UV está baja, así que dale con confianza.',
    'La UV anda relajada por ahora. Puedes salir sin mayor lío.',
    'Está bajita la radiación. Aprovecha y sal un rato sin preocuparte tanto.',
    'La UV está juiciosa hoy. Puedes salir tranquilo, sin tanto cuidado.',
  ],

  'Moderado': [
    'Si te vas a quedar afuera un rato, échate el bloqueador pa\' cuidarte.',
    'Ojo ahí, la UV ya está cogiendo fuerza. No estaría de más un bloqueador.',
    'La UV está moderada. Échate tu bloqueador antes de salir.',
    'Si vas pa\' la calle, no olvides el bloqueador.',
    'La UV está subiendo. Ponte bloqueador antes de exponerte mucho tiempo.',
  ],

  'Alto': [
    'Ey, parce, la UV está alta aunque esté nublado. Échate bloqueador y búscate una sombrita.',
    'La UV está fuerte hoy. Bloqueador puesto y evita quedarte mucho rato al sol directo.',
    'La cosa se está poniendo seria. Bloqueador y sombra cuando puedas.',
    'Ojo con esa UV. Que esté nublado no quiere decir que no esté fuerte.',
    'La UV está alta. Ponte bloqueador antes de salir, no cuando ya sea tarde.',
  ],

  'Muy alto': [
    'La UV está bien alta, así el cielo esté tapao\'. Ponte buen bloqueador y cuídate.',
    'Parce, esto está fuerte. Bloqueador ya y busca sombra en lo que puedas.',
    'La UV está pasada de revoluciones. Ponte bloqueador y evita el sol directo.',
    'Aunque esté nublado, esa UV viene con ganas. Bloqueador y sombrita, por si acaso.',
    'Ojo ahí, la UV está muy alta. Mejor no te expongas mucho tiempo sin protección.',
  ],

  'Extremo': [
    '¡Ombe! La UV está a millón, aunque no veas el sol de frente. Échate bloqueador full y evita el sol directo.',
    '¡Parce, esto está serio! La UV está extrema. Bloqueador, sombra y cuidado.',
    'Hoy la UV amaneció con todo. Bloqueador y evita el sol directo, no es pa\' jugar.',
    '¡Ojo! Esa UV está disparada. Protégete bien si vas a salir.',
    'Esto no es pa\' jugar. La UV está extrema. Bloqueador full y busca sombra.',
  ],

  'Extremo alto': [
    'Esto está que arde, parce. La UV está en el tope, nublado o no. Ponte bloqueador ya mismo y búscate sombra.',
    '¡Ombe, cuídate bien! La UV está por las nubes. Bloqueador y sombra, sin excusas.',
    'Esto está más peligroso de lo normal. UV extrema: busca sombra y protégete.',
    '¡Ajá! La UV está a otro nivel. Mejor no te expongas hoy sin protección.',
    'Esto está al máximo. UV extrema: bloqueador, sombra y evita el sol directo.',
  ],
};

export const TITULOS_POR_RANGO = {
  'Sin UV': 'Todo tranquilo con el UV',
  'Bajo': 'La UV anda bajita',
  'Moderado': 'La UV se está calentando',
  'Alto': 'La UV está pegando',
  'Muy alto': 'La UV está brava',
  'Extremo': '¡La UV está a millón!',
  'Extremo alto': '¡La UV está que arde!',
};

export function obtenerTituloNotificacion(nombreRango) {
  return TITULOS_POR_RANGO[nombreRango] || `UV en nivel ${nombreRango.toLowerCase()}`;
}

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