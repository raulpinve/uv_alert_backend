export async function getUv(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);

  url.searchParams.set("current", "uv_index,uv_index_clear_sky");
  url.searchParams.set("hourly", "uv_index,uv_index_clear_sky");

  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error al consultar Open-Meteo");
  }

  const data = await response.json();

  return {
    current: {
      uv: data.current.uv_index,
      uv_clear_sky: data.current.uv_index_clear_sky,
      time: data.current.time,
    },

    forecast: {
      hours: data.hourly.time,
      uv: data.hourly.uv_index,
      uv_clear_sky: data.hourly.uv_index_clear_sky,
    },

    timezone: data.timezone,
  };
}