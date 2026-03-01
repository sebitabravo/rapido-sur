#!/usr/bin/env bash
set -euo pipefail

# Cleanup operational files older than retention days.
# Default paths are aligned with PLAN_IMPLEMENTACION_MANTENCION.md
# Usage:
#   LOG_DIR=/var/log/rapido-sur BACKUP_DIR=/opt/rapido-sur/backups ./devops/scripts/cleanup-logs-backups.sh --dry-run
#   LOG_DIR=/var/log/rapido-sur BACKUP_DIR=/opt/rapido-sur/backups ./devops/scripts/cleanup-logs-backups.sh --execute

MODE="dry-run"
RETENTION_DAYS="30"

for arg in "$@"; do
  case "$arg" in
    --execute) MODE="execute" ;;
    --dry-run) MODE="dry-run" ;;
    --days=*) RETENTION_DAYS="${arg#*=}" ;;
  esac
done

LOG_DIR="${LOG_DIR:-/var/log/rapido-sur}"
BACKUP_DIR="${BACKUP_DIR:-/opt/rapido-sur/backups}"

echo "[INFO] Mode: $MODE"
echo "[INFO] Retention: ${RETENTION_DAYS} días"
echo "[INFO] Logs dir: $LOG_DIR"
echo "[INFO] Backups dir: $BACKUP_DIR"

find_old() {
  local dir="$1"
  local pattern="$2"
  if [[ -d "$dir" ]]; then
    find "$dir" -type f -name "$pattern" -mtime "+$RETENTION_DAYS"
  fi
}

mapfile -t old_logs < <(find_old "$LOG_DIR" "*.log")
mapfile -t old_backups < <(find_old "$BACKUP_DIR" "backup-*.sql.gz")

if [[ ${#old_logs[@]} -eq 0 && ${#old_backups[@]} -eq 0 ]]; then
  echo "[OK] No hay archivos antiguos para limpiar."
  exit 0
fi

if [[ ${#old_logs[@]} -gt 0 ]]; then
  echo "[INFO] Logs antiguos (${#old_logs[@]}):"
  printf ' - %s\n' "${old_logs[@]}"
fi

if [[ ${#old_backups[@]} -gt 0 ]]; then
  echo "[INFO] Backups antiguos (${#old_backups[@]}):"
  printf ' - %s\n' "${old_backups[@]}"
fi

if [[ "$MODE" == "dry-run" ]]; then
  echo "[DRY-RUN] No se eliminó ningún archivo. Usa --execute para aplicar cambios."
  exit 0
fi

for f in "${old_logs[@]}"; do rm -f "$f"; done
for f in "${old_backups[@]}"; do rm -f "$f"; done

echo "[OK] Limpieza de logs y backups completada."
