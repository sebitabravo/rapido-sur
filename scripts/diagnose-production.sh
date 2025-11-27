#!/bin/bash
# Script de diagnóstico para producción
# Ejecutar en el servidor de Dokploy

echo "=== DIAGNÓSTICO PRODUCCIÓN RÁPIDO SUR ==="
echo ""

# 1. Listar contenedores
echo "1. CONTENEDORES ACTIVOS:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "rapido|NAME"
echo ""

# 2. Verificar logs recientes del backend
echo "2. ÚLTIMAS 20 LÍNEAS - BACKEND:"
BACKEND_CONTAINER=$(docker ps --filter "name=backend" --format "{{.Names}}" | head -1)
if [ -n "$BACKEND_CONTAINER" ]; then
    docker logs $BACKEND_CONTAINER --tail 20
else
    echo "❌ Contenedor backend no encontrado"
fi
echo ""

# 3. Verificar logs recientes de postgres
echo "3. ÚLTIMAS 20 LÍNEAS - POSTGRES:"
POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -1)
if [ -n "$POSTGRES_CONTAINER" ]; then
    docker logs $POSTGRES_CONTAINER --tail 20
else
    echo "❌ Contenedor postgres no encontrado"
fi
echo ""

# 4. Verificar conexión de red
echo "4. VERIFICAR RED:"
if [ -n "$BACKEND_CONTAINER" ]; then
    echo "Ping desde backend a postgres:"
    docker exec $BACKEND_CONTAINER ping -c 2 postgres 2>&1 || echo "❌ No se puede hacer ping"
fi
echo ""

# 5. Verificar variables de entorno del backend
echo "5. VARIABLES DE ENTORNO - BACKEND:"
if [ -n "$BACKEND_CONTAINER" ]; then
    docker exec $BACKEND_CONTAINER env | grep -E "NODE_ENV|DB_|JWT_SECRET" | sed 's/\(PASSWORD\|SECRET\)=.*/\1=***HIDDEN***/'
fi
echo ""

# 6. Verificar que PostgreSQL está listo
echo "6. ESTADO POSTGRESQL:"
if [ -n "$POSTGRES_CONTAINER" ]; then
    docker exec $POSTGRES_CONTAINER pg_isready -U postgres
fi
echo ""

# 7. Verificar tablas en la BD
echo "7. TABLAS EN LA BASE DE DATOS:"
if [ -n "$POSTGRES_CONTAINER" ]; then
    docker exec $POSTGRES_CONTAINER psql -U postgres -d rapido_sur -c "\dt" 2>&1 | head -20
fi
echo ""

# 8. Verificar tabla report_history específicamente
echo "8. VERIFICAR TABLA REPORT_HISTORY:"
if [ -n "$POSTGRES_CONTAINER" ]; then
    docker exec $POSTGRES_CONTAINER psql -U postgres -d rapido_sur -c "SELECT COUNT(*) FROM report_history;" 2>&1 || echo "❌ Tabla report_history no existe"
fi
echo ""

# 9. Health check del backend
echo "9. HEALTH CHECK BACKEND:"
if [ -n "$BACKEND_CONTAINER" ]; then
    docker exec $BACKEND_CONTAINER wget -q -O - http://localhost:3000/health 2>&1 || \
    docker exec $BACKEND_CONTAINER wget -q -O - http://localhost:3000/api/health 2>&1 || \
    echo "❌ Health check fallido"
fi
echo ""

# 10. Recursos del sistema
echo "10. USO DE RECURSOS:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep -E "rapido|NAME"
echo ""

echo "=== FIN DIAGNÓSTICO ==="
