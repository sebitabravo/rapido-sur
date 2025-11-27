/**
 * Estado de una alerta de mantenimiento
 * - Activa: Alerta recién generada, pendiente de gestión
 * - EnProceso: Orden de trabajo creada pero no finalizada
 * - Atendida: Orden de trabajo finalizada, vehículo mantenido
 * - Descartada: Alerta descartada manualmente (falsa alarma)
 */
export enum EstadoAlerta {
  Activa = "Activa",
  EnProceso = "EnProceso",
  Atendida = "Atendida",
  Descartada = "Descartada",
}
