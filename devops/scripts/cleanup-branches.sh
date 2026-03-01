#!/usr/bin/env bash
set -euo pipefail

# Cleanup merged remote branches in origin, preserving protected branches.
# Usage:
#   ./devops/scripts/cleanup-branches.sh --dry-run
#   ./devops/scripts/cleanup-branches.sh --execute

MODE="dry-run"
if [[ "${1:-}" == "--execute" ]]; then
  MODE="execute"
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "[ERROR] Ejecuta este script dentro de un repositorio git"
  exit 1
fi

echo "[INFO] Fetching latest refs..."
git fetch origin --prune

PROTECTED_REGEX='^(main|master|develop|dev|staging|production|release/.*)$'

mapfile -t merged_branches < <(
  git branch -r --merged origin/main \
    | grep -v -- '->' \
    | sed 's#^\s*origin/##' \
    | grep -v '^HEAD$' \
    | grep -v -E "$PROTECTED_REGEX" \
    | sort -u
)

if [[ ${#merged_branches[@]} -eq 0 ]]; then
  echo "[OK] No hay ramas remotas mergeadas para limpiar."
  exit 0
fi

echo "[INFO] Ramas candidatas a eliminar (${#merged_branches[@]}):"
for b in "${merged_branches[@]}"; do
  echo " - $b"
done

if [[ "$MODE" == "dry-run" ]]; then
  echo "[DRY-RUN] No se eliminó ninguna rama. Usa --execute para aplicar cambios."
  exit 0
fi

echo "[INFO] Eliminando ramas remotas..."
for b in "${merged_branches[@]}"; do
  echo "[DELETE] origin/$b"
  git push origin --delete "$b"
done

echo "[OK] Limpieza de ramas remotas finalizada."
