# 🚀 Setup & Configuration - Rápido Sur

Guías de instalación, configuración y deployment del proyecto.

---

## 📋 Guías Disponibles

### ⚡ Quick Start
**[QUICK_START.md](./QUICK_START.md)**

Inicio ultra rápido en 5 minutos.

**Contenido:**
- 3 comandos para empezar
- Workflow diario de desarrollo
- Debugging rápido
- Troubleshooting común

**Para quién:** Nuevos desarrolladores que quieren empezar inmediatamente.

---

### 🐋 Docker Guide
**[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)**

Guía completa de Docker y containerización.

**Contenido:**
- Conceptos de Docker
- Tres configuraciones disponibles
- Docker Compose explicado
- Comandos útiles
- Troubleshooting Docker

**Para quién:** Desarrolladores que quieren entender Docker en profundidad.

---

### 📊 Docker Setup Summary
**[DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)**

Resumen rápido de las tres configuraciones Docker.

**Contenido:**
- Opción 1: Desarrollo Local (recomendada)
- Opción 2: Full Docker
- Opción 3: Producción (Dokploy)
- Comparativa de opciones
- Cuándo usar cada una

**Para quién:** Referencia rápida sobre configuraciones Docker.

---

### 🌐 Dokploy Setup
**[DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)**

Configuración completa de Dokploy para producción.

**Contenido:**
- Qué es Dokploy
- Configuración del servidor VPS
- Deploy de backend
- Deploy de frontend
- Configuración de PostgreSQL
- Variables de entorno
- SSL con Let's Encrypt
- Monitoreo y logs

**Para quién:** DevOps y deployment a producción.

---

## 🗺️ Flujo de Setup Recomendado

### Para Desarrollo Local (Primera vez):

1. **[QUICK_START.md](./QUICK_START.md)** - Instalar y correr (5 min)
2. **[DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)** - Entender opciones (2 min)
3. Empezar a desarrollar 🚀

### Para Entender Docker:

1. **[DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)** - Resumen rápido
2. **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Guía completa
3. Experimentar con diferentes configuraciones

### Para Deploy a Producción:

1. **[DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)** - Setup completo de Dokploy
2. **[Backend Deployment](../../backend/docs/deployment/)** - Deploy del backend
3. **[Frontend Deployment](../../frontend/docs/deployment/)** - Deploy del frontend

---

## 🔧 Configuraciones Docker Disponibles

### 1️⃣ Desarrollo Local (Recomendada)
```bash
docker-compose -f docker-compose.dev.yml up -d
# Solo PostgreSQL + pgAdmin
# Backend y Frontend corren en tu máquina
```

**Ventajas:**
- ✅ Hot reload instantáneo
- ✅ Debugging con breakpoints
- ✅ Máxima velocidad de desarrollo

---

### 2️⃣ Full Docker (Testing)
```bash
docker-compose -f docker-compose.full.yml up -d
# PostgreSQL + Backend + Frontend containerizados
```

**Ventajas:**
- ✅ Ambiente idéntico a producción
- ✅ Testing de integraciones
- ✅ No contamina tu máquina

---

### 3️⃣ Producción (Dokploy)
```bash
# Dokploy maneja automáticamente
# Ver DOKPLOY_SETUP.md
```

**Ventajas:**
- ✅ Deploy automático
- ✅ SSL gratis
- ✅ Monitoreo incluido

---

## 📦 Prerequisites

Antes de comenzar cualquier setup:

- ✅ **Node.js 20 LTS** - [Download](https://nodejs.org/)
- ✅ **Docker & Docker Compose** - [Download](https://www.docker.com/)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **npm o yarn** - Incluido con Node.js

### Verificar instalación:
```bash
node --version    # v20.x.x
docker --version  # 24.x.x
git --version     # 2.x.x
```

---

## 🆘 Troubleshooting

### Puerto 3000 ocupado
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Puerto 5432 ocupado (PostgreSQL)
```bash
# Detener PostgreSQL local
# Windows (Services)
# Linux
sudo systemctl stop postgresql
```

### Docker no inicia contenedores
```bash
# Limpiar Docker
docker-compose down -v
docker system prune -a
```

### Error de permisos en node_modules
```bash
# Eliminar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🔗 Enlaces Relacionados

### Documentación General
- [README Principal](../../README.md)
- [CLAUDE.md - Memoria del Proyecto](../../CLAUDE.md)
- [Estructura de Documentación](../DOCS_STRUCTURE.md)

### Backend
- [Backend Documentation](../../backend/docs/README.md)
- [Backend Deployment](../../backend/docs/deployment/)

### Frontend
- [Frontend Documentation](../../frontend/docs/README.md)
- [Frontend Deployment](../../frontend/docs/deployment/)

### Análisis
- [Análisis del Sistema](../analysis/README.md)

---

**Última actualización**: Noviembre 2025
**Equipo**: Rápido Sur Development Team
