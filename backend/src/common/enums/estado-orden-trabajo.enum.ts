/**
 * Estado de la orden de trabajo (flujo unidireccional)
 * Pendiente → Asignada → EnProgreso → Finalizada
 */
export enum EstadoOrdenTrabajo {
  Pendiente = "Pendiente",
  Asignada = "Asignada",
  EnProgreso = "EnProgreso",
  Finalizada = "Finalizada",
}
