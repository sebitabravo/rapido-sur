# 📚 Índice de Documentación - Rápido Sur

**Bienvenido al sistema de gestión de mantenimiento vehicular de Rápido Sur**

Este índice te ayudará a encontrar rápidamente la información que necesitas.

---

## 🚀 Para Empezar AHORA

### ⚡ Inicio Ultra Rápido (5 minutos)
**[QUICK_START.md](./QUICK_START.md)**
- 3 comandos para empezar
- Workflow diario
- Debugging rápido
- **Recomendado para nuevos desarrolladores**

### 📖 Documentación Principal
**[README.md](./README.md)**
- Overview del proyecto
- Instalación detallada
- Scripts disponibles
- Testing

---

## 🐋 Docker & Deployment

### 🔧 Guía Completa de Docker
**[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)**
- Casos de uso detallados
- Comandos útiles
- Troubleshooting completo
- Gestión de BD
- **8000+ palabras de documentación completa**

### 📊 Resumen Visual de Docker
**[DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)**
- Diagramas ASCII
- Mapa mental de decisión
- Comparación de configuraciones
- Tips rápidos
- **Perfecto para entender la estructura visual**

### 🌐 Deploy a Producción (Dokploy)
**[DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)**
- Guía paso a paso
- Configuración de PostgreSQL
- Variables de entorno
- SSL y seguridad
- Backups automáticos
- **Checklist completo para deploy**

---

## 🏗️ Arquitectura & Diseño

### 🧠 Memoria Completa del Proyecto
**[CLAUDE.md](./CLAUDE.md)**
- Contexto del proyecto
- Stack técnico definitivo
- Decisiones arquitectónicas
- Modelo de datos
- Reglas de negocio
- Convenciones de código
- **20,000+ palabras - Fuente de verdad del proyecto**

### 🗺️ Estructura Visual del Sistema
**[.github/PROJECT_STRUCTURE.md](./.github/PROJECT_STRUCTURE.md)**
- Diagramas de arquitectura
- Flujos de trabajo
- Modelo de datos simplificado
- Roles y permisos
- Security layers
- **Perfecto para onboarding**

---

## 📂 Archivos Docker

### 🎯 Los 3 Docker Compose Files

#### `docker-compose.yml`
**Para**: Producción con Dokploy
**Levanta**: Solo backend
**Uso**: Automático por Dokploy
```bash
# NO ejecutar manualmente
# Dokploy lo usa automáticamente
```

#### `docker-compose.dev.yml`
**Para**: Desarrollo diario
**Levanta**: PostgreSQL + pgAdmin
**Uso**: Día a día
```bash
docker-compose -f docker-compose.dev.yml up -d
cd backend && npm run start:dev
```

#### `docker-compose.full.yml`
**Para**: Testing completo
**Levanta**: PostgreSQL + Backend + Frontend + pgAdmin
**Uso**: Probar todo junto antes de deploy
```bash
docker-compose -f docker-compose.full.yml up -d
```

---

## 🎯 ¿Qué Necesitas Hacer?

### 🆕 Soy Nuevo en el Proyecto
1. Lee primero: **[QUICK_START.md](./QUICK_START.md)**
2. Luego: **[.github/PROJECT_STRUCTURE.md](./.github/PROJECT_STRUCTURE.md)**
3. Profundiza en: **[CLAUDE.md](./CLAUDE.md)**

### 💻 Quiero Desarrollar
1. Configura tu entorno: **[QUICK_START.md](./QUICK_START.md)** (sección setup)
2. Entiende Docker: **[DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)**
3. Workflow diario: **[QUICK_START.md](./QUICK_START.md)** (sección workflow)
4. Convenciones: **[CLAUDE.md](./CLAUDE.md)** (sección Code Conventions)

### 🐛 Tengo un Problema con Docker
1. Primero intenta: **[QUICK_START.md](./QUICK_START.md)** (sección Debugging)
2. Si persiste: **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** (sección Troubleshooting)
3. Para errores específicos: **[DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)** (sección Errores Comunes)

### 🚀 Necesito Hacer Deploy a Producción
1. **Primer deploy**: **[DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)** (seguir paso a paso)
2. **Deploys posteriores**: Solo push a `main` (auto-deploy configurado)
3. Verificar: **[DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)** (sección Verificación)

### 🏗️ Quiero Entender la Arquitectura
1. Visión general: **[.github/PROJECT_STRUCTURE.md](./.github/PROJECT_STRUCTURE.md)**
2. Detalles técnicos: **[CLAUDE.md](./CLAUDE.md)**
3. Decisiones tomadas: **[CLAUDE.md](./CLAUDE.md)** (sección Critical Architectural Decisions)

### 🔐 Necesito Info sobre Seguridad
1. Security layers: **[.github/PROJECT_STRUCTURE.md](./.github/PROJECT_STRUCTURE.md)** (sección Security)
2. Reglas RBAC: **[CLAUDE.md](./CLAUDE.md)** (sección Security)
3. Best practices: **[CLAUDE.md](./CLAUDE.md)** (sección Inviolable Rules)

### 📊 Quiero Entender el Modelo de Datos
1. Diagrama simplificado: **[.github/PROJECT_STRUCTURE.md](./.github/PROJECT_STRUCTURE.md)**
2. Modelo completo: **[CLAUDE.md](./CLAUDE.md)** (sección Data Model)
3. Reglas de integridad: **[CLAUDE.md](./CLAUDE.md)** (sección Integrity Rules)

---

## 📋 Documentos por Extensión

### 📊 Largo (>5000 palabras)
- **[CLAUDE.md](./CLAUDE.md)** - 20,187 bytes - Memoria completa
- **[DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)** - 9,697 bytes - Guía de deploy
- **[README.md](./README.md)** - 8,289 bytes - Documentación principal
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - 8,052 bytes - Guía completa Docker

### 📄 Medio (2000-5000 palabras)
- **[DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md)** - 7,502 bytes - Resumen visual
- **[QUICK_START.md](./QUICK_START.md)** - 5,672 bytes - Inicio rápido

### 📝 Archivos de Configuración
- **[docker-compose.yml](./docker-compose.yml)** - 4,046 bytes - Producción
- **[docker-compose.full.yml](./docker-compose.full.yml)** - 4,304 bytes - Stack completo
- **[docker-compose.dev.yml](./docker-compose.dev.yml)** - 2,433 bytes - Desarrollo

---

## 🔗 Links Rápidos

### Documentación Externa
- [NestJS Docs](https://docs.nestjs.com)
- [React Docs](https://react.dev)
- [TypeORM Docs](https://typeorm.io)
- [Dokploy Docs](https://docs.dokploy.com)
- [Docker Compose Docs](https://docs.docker.com/compose/)

### Herramientas
- Backend local: http://localhost:3000
- API Docs (Swagger): http://localhost:3000/api/docs
- pgAdmin: http://localhost:5050
- Frontend local: http://localhost:5173

---

## 🎓 Rutas de Aprendizaje

### 🟢 Junior Developer (Primera Semana)
```
Día 1-2: QUICK_START.md → Setup básico
Día 3: DOCKER_SETUP_SUMMARY.md → Entender configuraciones
Día 4-5: PROJECT_STRUCTURE.md → Arquitectura general
Semana 2: CLAUDE.md (completo) → Profundizar
```

### 🟡 Mid-Level Developer (Primer Día)
```
Mañana: QUICK_START.md + DOCKER_SETUP_SUMMARY.md
Tarde: CLAUDE.md (secciones críticas) + PROJECT_STRUCTURE.md
```

### 🔴 Senior Developer / Team Lead
```
1 hora: CLAUDE.md completo
30 min: DOKPLOY_SETUP.md
Listo para liderar
```

---

## 📞 Contacto y Soporte

### Para Problemas Técnicos
1. Revisar este índice
2. Buscar en documentación específica
3. Preguntar al equipo en Slack/Discord

### Para Decisiones de Arquitectura
1. Consultar **[CLAUDE.md](./CLAUDE.md)** primero
2. Si no está documentado, preguntar al Tech Lead
3. Documentar la decisión tomada

### Para Issues de Deployment
1. Seguir **[DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)**
2. Revisar logs en Dokploy UI
3. Contactar DevOps si persiste

---

## ✅ Checklist: "¿He Leído lo Correcto?"

Antes de preguntar, verifica:

- [ ] ¿Leíste **[QUICK_START.md](./QUICK_START.md)** para problemas de setup?
- [ ] ¿Consultaste **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** para problemas Docker?
- [ ] ¿Revisaste **[CLAUDE.md](./CLAUDE.md)** para decisiones arquitectónicas?
- [ ] ¿Seguiste **[DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md)** para deploy?
- [ ] ¿Buscaste el error específico en troubleshooting?

---

## 🎯 Meta-Documentación

Este índice fue creado para:
- ✅ Facilitar onboarding de nuevos desarrolladores
- ✅ Reducir tiempo buscando documentación
- ✅ Evitar preguntas repetidas
- ✅ Centralizar conocimiento del proyecto

**Mantén este índice actualizado cuando agregues nueva documentación**

---

**Última actualización**: Enero 2025
**Equipo**: Rubilar, Bravo, Loyola, Aguayo
**Cliente**: Rápido Sur

---

## 🎁 Bonus: Comandos Más Usados

```bash
# Desarrollo diario
docker-compose -f docker-compose.dev.yml up -d
cd backend && npm run start:dev

# Health check
curl http://localhost:3000/health

# Ver logs
docker logs -f rapido-sur-backend

# Testing completo
docker-compose -f docker-compose.full.yml up -d

# Detener todo
docker-compose -f docker-compose.dev.yml down
```

---

**¿Perdido? Empieza aquí: [QUICK_START.md](./QUICK_START.md)** 🚀
