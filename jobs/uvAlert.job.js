import cron from 'node-cron';
import { messaging } from "../config/firebase.js";
import { pool } from '../init.db.js';
import { obtenerUv } from '../repositories/uv.repository.js';

// Tips según el rango de UV
const TIPS_POR_RANGO = {
  'Bajo': 'Puedes estar al aire libre sin protección especial.',
  'Moderado': 'Usa protector solar si vas a estar expuesto por largos periodos.',
  'Alto': 'Usa protector solar, gafas de sol y busca sombra en horas pico.',
  'Muy alto': 'Evita el sol entre 10am y 4pm. Usa protector solar, sombrero y gafas.',
  'Extremo': 'Evita salir en horas de sol directo. Protección obligatoria: protector solar, ropa cubierta y sombra.',
  'Extremo alto': 'Riesgo muy alto de daño en piel en minutos. Evita exposición directa al sol por completo.',
};

async function obtenerRangoUV(valorUV) {
  const { rows } = await pool.query(
    `SELECT id, nombre 
     FROM rangos_uv 
     WHERE $1 BETWEEN valor_min AND valor_max`,
    [valorUV]
  );
  return rows[0] || null;
}

async function enviarNotificacion(fcmToken, rangoAnterior, rangoNuevo, valorUV) {
    // Determina si subió, bajó, o es la primera lectura
    let direccion = 'cambió';
    if (rangoAnterior?.id != null) {
        if (rangoNuevo.id > rangoAnterior.id) {
            direccion = 'subió';
        } else if (rangoNuevo.id < rangoAnterior.id) {
            direccion = 'bajó';
        }
    }

    const tip = TIPS_POR_RANGO[rangoNuevo.nombre] ?? 'Consulta el índice UV antes de salir.';
    const mensaje = {
        token: fcmToken,
        notification: {
            title: `El UV ${direccion} a: ${rangoNuevo.nombre}`,
            body: `Índice UV actual: ${valorUV}. ${tip}`,
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
    rango_uv_id: rangoAnteriorId
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

// Función del cronJob
async function ejecutarCronJob() {
    console.log('Iniciando cronjob de monitoreo UV...');

  try {
    const { rows: dispositivos } = await pool.query(
      `SELECT id, latitud, longitud, fcm_token, rango_uv_id FROM dispositivos`
    );

    console.log(`Procesando ${dispositivos.length} dispositivo(s)...`);

    for (const dispositivo of dispositivos) {
      await procesarDispositivo(dispositivo);
    }

    console.log('Cronjob finalizado.');
  } catch (error) {
    console.error(`Error general en el cronjob: ${error.message}`);
  }
}

cron.schedule('0 */30 * * * *', ejecutarCronJob);

export { ejecutarCronJob, enviarNotificacion };