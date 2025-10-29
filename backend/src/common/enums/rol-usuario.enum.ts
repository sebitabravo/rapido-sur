/**
 * Roles de usuario en el sistema (RBAC)
 * - Administrador: Acceso completo al sistema
 * - JefeMantenimiento: Gestiona órdenes de trabajo y asignaciones
 * - Mecanico: Ejecuta trabajos y registra tareas
 */
export enum RolUsuario {
  Administrador = "Administrador",
  JefeMantenimiento = "JefeMantenimiento",
  Mecanico = "Mecanico",
}
