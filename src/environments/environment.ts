// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// [CONFIG] Parámetros separados para el despliegue. Para pasar a producción
// solo se cambian estas dos líneas (o las del environment.prod.ts):
//   - apiUrl:    URL base del backend (MVC_CRM)
//   - dominioUrl: valor del parámetro ?dominio= (multi-tenant)
// api_url se compone de ambos. TODOS los servicios usan environment.api_url,
// por lo que el cambio aquí afecta a todo el sistema en un solo lugar.
const apiUrl = "http://localhost/MVC_CRM/";
const dominioUrl = "localhost";

export const environment = {
  production: false,
  apiUrl,
  dominioUrl,
  api_url: `${apiUrl}?dominio=${dominioUrl}`
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
