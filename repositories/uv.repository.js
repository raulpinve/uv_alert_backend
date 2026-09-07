export async function obtenerUv(latitud, longitud) {
  const url = new URL(
    "https://api.open-meteo.com/v1/forecast"
  );

  url.searchParams.set("latitude", latitud);
  url.searchParams.set("longitude", longitud);

  url.searchParams.set(
    "current",
    "uv_index,uv_index_clear_sky"
  );

  url.searchParams.set(
    "hourly",
    "uv_index,uv_index_clear_sky"
  );

  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error al consultar Open-Meteo");
  }

  const data = await response.json();
  console.log('Open-Meteo timezone:', data.timezone);
  console.log('Open-Meteo current time:', data.current.time);

  return {
    actual: {
      uv: data.current.uv_index,
      uv_clear_sky: data.current.uv_index_clear_sky,
      hora: data.current.time
    },

    proyeccion: {
      horas: data.hourly.time,
      uv: data.hourly.uv_index,
      uv_clear_sky: data.hourly.uv_index_clear_sky
    },

    timezone: data.timezone
  };
}