#!/bin/bash

# ================================
# Rápido Sur - Docker Helper Script
# ================================
# Script de ayuda para manejar Docker de forma fácil
#
# Uso: ./docker.sh [comando]
#

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Archivo docker-compose principal
COMPOSE_FILE="docker-compose.yml"

# Función para mostrar mensajes
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Función para mostrar el menú
show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}        🚀 Rápido Sur - Docker Helper         ${BLUE}║${NC}"
    echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
    echo ""
    echo "Comandos disponibles:"
    echo ""
    echo "  ${GREEN}start${NC}      - Levantar todos los servicios"
    echo "  ${GREEN}stop${NC}       - Detener todos los servicios"
    echo "  ${GREEN}restart${NC}    - Reiniciar todos los servicios"
    echo "  ${GREEN}logs${NC}       - Ver logs de todos los servicios"
    echo "  ${GREEN}build${NC}      - Reconstruir todos los servicios"
    echo "  ${GREEN}clean${NC}      - Limpiar contenedores y volúmenes (⚠️  CUIDADO)"
    echo "  ${GREEN}status${NC}     - Ver estado de los servicios"
    echo "  ${GREEN}db${NC}         - Conectar a PostgreSQL"
    echo "  ${GREEN}backend${NC}    - Shell en el contenedor backend"
    echo "  ${GREEN}frontend${NC}   - Shell en el contenedor frontend"
    echo ""
    echo "Ejemplos:"
    echo "  ./docker.sh start"
    echo "  ./docker.sh logs backend"
    echo "  ./docker.sh build frontend"
    echo ""
}

# Verificar si existe docker-compose
check_docker() {
    if ! command -v docker-compose &> /dev/null; then
        error "docker-compose no está instalado"
        exit 1
    fi
}

# Comandos
case "${1:-help}" in
    start)
        info "Levantando servicios..."
        docker-compose -f $COMPOSE_FILE up -d
        success "Servicios levantados"
        echo ""
        info "Acceso:"
        echo "  Frontend: ${GREEN}http://localhost:8080${NC}"
        echo "  Backend:  ${GREEN}http://localhost:3000${NC}"
        echo "  Database: ${GREEN}localhost:5432${NC}"
        ;;
    
    stop)
        info "Deteniendo servicios..."
        docker-compose -f $COMPOSE_FILE down
        success "Servicios detenidos"
        ;;
    
    restart)
        info "Reiniciando servicios..."
        docker-compose -f $COMPOSE_FILE restart ${2:-}
        success "Servicios reiniciados"
        ;;
    
    logs)
        if [ -z "$2" ]; then
            docker-compose -f $COMPOSE_FILE logs -f
        else
            docker-compose -f $COMPOSE_FILE logs -f $2
        fi
        ;;
    
    build)
        info "Reconstruyendo servicios..."
        if [ -z "$2" ]; then
            docker-compose -f $COMPOSE_FILE up -d --build
        else
            docker-compose -f $COMPOSE_FILE up -d --build $2
        fi
        success "Servicios reconstruidos"
        ;;
    
    clean)
        warning "⚠️  CUIDADO: Esto eliminará todos los contenedores y volúmenes"
        read -p "¿Estás seguro? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            info "Limpiando..."
            docker-compose -f $COMPOSE_FILE down -v
            success "Limpieza completada"
        else
            info "Cancelado"
        fi
        ;;
    
    status)
        docker-compose -f $COMPOSE_FILE ps
        echo ""
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        ;;
    
    db)
        info "Conectando a PostgreSQL..."
        docker exec -it rapido-sur-db psql -U postgres -d rapido_sur
        ;;
    
    backend)
        info "Shell en backend..."
        docker exec -it rapido-sur-backend sh
        ;;
    
    frontend)
        info "Shell en frontend..."
        docker exec -it rapido-sur-frontend sh
        ;;
    
    help|*)
        show_menu
        ;;
esac
