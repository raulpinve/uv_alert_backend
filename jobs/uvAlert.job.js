import cron from 'node-cron';
import { messaging } from '../config/firebase.js';
import { pool } from '../init.db.js';
import { obtenerUv } from '../repositories/uv.repository.js';

// Mensajes según el rango de UV
const MENSAJES_POR_RANGO = {
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

async function obtenerRangoUV(valorUV) {
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

async function enviarNotificacion(
  fcmToken,
  rangoAnterior,
  rangoNuevo,
  valorUV
) {
  let direccion = 'cambió';

  if (rangoAnterior?.id != null) {
    if (rangoNuevo.id > rangoAnterior.id) {
      direccion = 'subió';
    } else if (rangoNuevo.id < rangoAnterior.id) {
      direccion = 'bajó';
    }
  }

  const nombreRango = rangoNuevo.nombre.toLowerCase();

  const mensajeTip =
    MENSAJES_POR_RANGO[rangoNuevo.nombre] ??
    'Échale un ojo al índice UV antes de salir.';

  const mensaje = {
    token: fcmToken,

    notification: {
      title: `El UV ${direccion} a nivel ${nombreRango}`,
      body: `Está en ${valorUV}. ${mensajeTip}`,
    },

    data: {
      uv_actual: String(valorUV),
      rango_uv_id: String(rangoNuevo.id),
      direccion,
    },
  };

  try {
    await messaging.send(mensaje);

    console.log(
      `Notificación enviada a token ${fcmToken.slice(0, 10)}...`
    );
  } catch (error) {
    console.error(
      `Error enviando notificación: ${error.message}`
    );
  }
}

async function procesarDispositivo(dispositivo) {
  const {
    id,
    latitud,
    longitud,
    fcm_token,
    rango_uv_id: rangoAnteriorId,
  } = dispositivo;

  try {
    const informacionUv = await obtenerUv(latitud, longitud);

    const valorUV = informacionUv.actual.uv;

    const rangoNuevo = await obtenerRangoUV(valorUV);

    if (!rangoNuevo) {
      console.warn(
        `No se encontró rango para UV=${valorUV} (dispositivo ${id})`
      );
      return;
    }

    const huboCambioDeRango =
      rangoAnteriorId !== rangoNuevo.id;

    await pool.query(
      `
      UPDATE dispositivos
      SET uv_actual = $1,
          rango_uv_id = $2,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [valorUV, rangoNuevo.id, id]
    );

    if (huboCambioDeRango) {
      const { rows } = await pool.query(
        `
        SELECT id, nombre
        FROM rangos_uv
        WHERE id = $1
        `,
        [rangoAnteriorId]
      );

      const rangoAnterior = rows[0] || null;

      await enviarNotificacion(
        fcm_token,
        rangoAnterior,
        rangoNuevo,
        valorUV
      );
    }
  } catch (error) {
    console.error(
      `Error procesando dispositivo ${id}: ${error.message}`
    );
  }
}

// CronJob de monitoreo UV
async function ejecutarCronJob() {
  console.log('Iniciando cronjob de monitoreo UV...');

  try {
    const { rows: dispositivos } = await pool.query(
      `
      SELECT
        id,
        latitud,
        longitud,
        fcm_token,
        rango_uv_id
      FROM dispositivos
      `
    );

    console.log(
      `Procesando ${dispositivos.length} dispositivo(s)...`
    );

    for (const dispositivo of dispositivos) {
      await procesarDispositivo(dispositivo);
    }

    console.log('Cronjob finalizado.');
  } catch (error) {
    console.error(
      `Error general en el cronjob: ${error.message}`
    );
  }
}

cron.schedule('0 */15 8-18 * * *', ejecutarCronJob);

export {
  ejecutarCronJob,
  enviarNotificacion,
};