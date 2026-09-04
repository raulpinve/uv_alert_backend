export async function obtenerCiudad(latitud, longitud) {
  const url = new URL(
    "https://nominatim.openstreetmap.org/reverse"
  );

  url.searchParams.set("lat", latitud);
  url.searchParams.set("lon", longitud);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("accept-language", "es");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "uv-alert/1.0"
    }
  });

  if (!response.ok) {
    throw new Error("Error al consultar el servicio de geocodificación");
  }

  const data = await response.json();

  const ciudad =
    data.address?.city ??
    data.address?.town ??
    data.address?.municipality ??
    data.address?.village ??
    null;

  return ciudad;
}