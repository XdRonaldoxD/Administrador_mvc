// [CONFIG] Parámetros separados para producción. Cambiar solo estas dos líneas
// para apuntar a otro servidor o dominio; api_url se compone de ambos y todos
// los servicios lo usan, así el cambio afecta a todo el sistema en un solo lugar.
const apiUrl = "https://api.sistemaboticarosa.com/";
const dominioUrl = "sistemabotica";

export const environment = {
  production: true,
  apiUrl,
  dominioUrl,
  api_url: `${apiUrl}?dominio=${dominioUrl}`
};
