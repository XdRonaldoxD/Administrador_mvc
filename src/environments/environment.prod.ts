// [CONFIG] Parámetros separados para producción. Cambiar solo estas dos líneas
// para apuntar a otro servidor o dominio; api_url se compone de ambos y todos
// los servicios lo usan, así el cambio afecta a todo el sistema en un solo lugar.
const apiUrl = "http://108.181.190.28/api/";
const dominioUrl = "localhost";

export const environment = {
  production: true,
  apiUrl,
  dominioUrl,
  api_url: `${apiUrl}?dominio=${dominioUrl}`
};
