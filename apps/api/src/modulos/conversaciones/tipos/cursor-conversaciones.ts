export interface ContextoCursor {
  idEmpresa: string;
  busqueda: string;
}
export interface PosicionConversacion {
  id: string;
  fecha: string;
}
export interface CursorConversaciones {
  emitir(contexto: ContextoCursor, posicion: PosicionConversacion): string;
  leer(contexto: ContextoCursor, valor: string): PosicionConversacion;
}
