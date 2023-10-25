export function formatoFecha(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = padZero(fecha.getMonth() + 1);
  const day = padZero(fecha.getDate());
  return `${year}-${month}-${day}`;
}

export function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function separarNombresApellidos(razonSocial: string): any {

    // Divide la cadena en palabras
    const palabras = razonSocial.split(' ');

    // Inicializa nombres, apellido paterno y apellido materno
    let nombres = '';
    let apellidoPaterno = '';
    let apellidoMaterno = '';

    // Verifica si hay al menos 2 palabras
    if (palabras.length >= 2) {
        // Los últimos dos elementos se consideran los nombres
        nombres = palabras.slice(-2).join(' ');
        // El primer elemento es el apellido paterno
        apellidoPaterno = palabras[0];
        // Si hay más de 2 palabras, el segundo elemento es el apellido materno
        if (palabras.length > 2) {
            apellidoMaterno = palabras[1];
        }
    } else {
        // Si hay menos de 2 palabras, asumimos que toda la cadena es el nombre
        nombres = razonSocial;
    }

    return { nombres, apellidoPaterno, apellidoMaterno };
}  