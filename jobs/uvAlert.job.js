import cron from 'node-cron';
import { messaging } from '../config/firebase.js';
import { pool } from '../init.db.js';
import { obtenerUv } from '../repositories/uv.repository.js';
import {
  obtenerRangoUV,
  obtenerMensajeRecomendacion,
} from '../utils/uvRango.util.js';

async function enviarNotificacion(
  fcmToken,
  rangoAnterior,
  rangoNuevo,
  valorUV
) {
  let direccion = 'cambió';

  if (rangoAnterior?.valor_min != null) {
    const minAnterior = parseFloat(rangoAnterior.valor_min);
    const minNuevo = parseFloat(rangoNuevo.valor_min);

    if (minNuevo > minAnterior) {
      direccion = 'subió';
    } else if (minNuevo < minAnterior) {
      direccion = 'bajó';
    }
  }

  const nombreRango = rangoNuevo.nombre.toLowerCase();
  const mensajeTip = obtenerMensajeRecomendacion(rangoNuevo.nombre);

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
    if (error.code === 'messaging/registration-token-not-registered') {
      await pool.query('DELETE FROM dispositivos WHERE fcm_token = $1', [fcmToken]);
    }
    console.error(`Error enviando notificación: ${error.message}`);
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

    const esPrimeraVez = rangoAnteriorId == null;
    const huboCambioDeRango =
      !esPrimeraVez && rangoAnteriorId !== rangoNuevo.id;

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

    if (esPrimeraVez) {
      console.log(
        `Dispositivo ${id} inicializado con rango ${rangoNuevo.nombre} (sin notificación).`
      );
      return;
    }

    if (huboCambioDeRango) {
      const { rows } = await pool.query(
        `
        SELECT id, nombre, valor_min
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

// cron.schedule('0 */15 8-18 * * *', ejecutarCronJob, {
//   timezone: 'America/Bogota',
// });


export {
  ejecutarCronJob,
  enviarNotificacion,
};