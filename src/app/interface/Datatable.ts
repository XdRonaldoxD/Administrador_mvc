export class DataTablesResponse {
  data: any[] | undefined;
  draw: number | undefined;
  recordsFiltered: number | undefined;
  recordsTotal: number | undefined;
}

export class Atributo_seleccionado {
  id_atributo_producto: number | undefined;
  id_atributo: number | undefined;
  glosa_atributo: string | undefined;
  cantidad: number | undefined;
}