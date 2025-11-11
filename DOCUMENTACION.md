# 📚 Guía de Documentación - Rápido Sur

Esta guía explica los documentos esenciales del proyecto y para qué sirve cada uno.

---

## 📁 Documentos Esenciales

### 1. **CLAUDE.md** 
📖 **Propósito:** Memoria completa del proyecto para Claude Code y el equipo de desarrollo.

**Contiene:**
- Contexto del proyecto y objetivos
- Stack tecnológico completo
- Arquitectura (N-Tier, modular monolith)
- Modelo de datos (entidades, relaciones)
- Reglas de seguridad inviolables
- Requisitos funcionales (FR-01, FR-02, FR-03)
- Requisitos no funcionales (NFR-01 a NFR-04)
- Flujos críticos de negocio
- Convenciones de código
- Guía de dockerización

**Cuándo usarlo:**
- ✅ Antes de hacer cualquier cambio al código
- ✅ Cuando necesites recordar decisiones arquitectónicas
- ✅ Para onboarding de nuevos desarrolladores
- ✅ Para trabajar con Claude Code

---

### 2. **README.md**
📘 **Propósito:** Documentación principal del proyecto. Primera lectura para desarrolladores.

**Contiene:**
- Descripción del proyecto
- Quick start (desarrollo local)
- Instalación de dependencias
- Scripts disponibles
- Estructura del proyecto
- **Sección completa de Deployment en Dokploy** ⭐
- Troubleshooting
- Testing
- Equipo y contacto

**Cuándo usarlo:**
- ✅ Primera vez trabajando en el proyecto
- ✅ Para saber cómo levantar el proyecto localmente
- ✅ Para ver todos los scripts disponibles
- ✅ Para deployment (incluye guía completa de Dokploy)

---

### 3. **DEPLOYMENT_GUIDE.md**
🚀 **Propósito:** Guía rápida de deployment en Dokploy (15 minutos).

**Contiene:**
- Pasos 1-2-3-4 para deployment
- Cómo generar secrets con `npm run secrets:generate`
- Configuración de variables de entorno en Dokploy
- Checklist pre-deploy
- Verificación post-deploy
- Troubleshooting de errores comunes
- Cómo obtener Gmail App Password

**Cuándo usarlo:**
- ✅ Cuando vayas a hacer deploy por primera vez
- ✅ Para recordar el proceso de deployment
- ✅ Si tienes errores en producción
- ✅ Para hacer re-deployment después de cambios

---

### 4. **docs/DATABASE_MODEL.md**
🗄️ **Propósito:** Documentación detallada del modelo de datos.

**Contiene:**
- Diagrama ER de la base de datos
- Descripción de cada tabla
- Relaciones entre entidades
- Constraints e índices
- Ejemplos de queries

**Cuándo usarlo:**
- ✅ Cuando necesites entender la estructura de la DB
- ✅ Para hacer cambios al modelo de datos
- ✅ Para escribir queries complejas

---

## ⚙️ Archivos de Configuración

### 5. **.env.example**
**Propósito:** Template de variables de entorno para **desarrollo local**.

**Uso:**
```bash
cp .env.example .env
# Edita .env con tus valores locales
```

---

### 6. **.env.production.example**
**Propósito:** Template de variables de entorno para **producción (Dokploy)**.

**Características:**
- ✅ Todos los valores marcados con `<CAMBIAR_AQUI>`
- ✅ Comentarios detallados para cada variable
- ✅ Warnings de seguridad
- ✅ Instrucciones para generar JWT_SECRET
- ✅ Checklist al final

**Uso:**
```bash
# 1. Abre .env.production.example
# 2. Reemplaza todos los <CAMBIAR_AQUI>
# 3. Copia TODO el contenido
# 4. Pega en Dokploy → Environment Variables
```

---

## 🎯 Flujo de Lectura Recomendado

### Para Nuevos Desarrolladores:
1. **README.md** - Entiende qué es el proyecto
2. **CLAUDE.md** - Lee arquitectura y reglas
3. **docs/DATABASE_MODEL.md** - Entiende el modelo de datos
4. Empieza a codear!

### Para Deployment:
1. **DEPLOYMENT_GUIDE.md** - Sigue los pasos 1-2-3-4
2. **.env.production.example** - Configura variables
3. **README.md** → Sección "Deployment" - Para más detalles

### Para Desarrollo Día a Día:
1. **CLAUDE.md** - Consulta cuando tengas dudas
2. **README.md** - Para scripts y comandos
3. **docs/DATABASE_MODEL.md** - Para queries y schema

---

## ❌ Documentos Eliminados

Se eliminaron estos documentos porque eran redundantes o reportes temporales:

**Reportes de Status (temporales):**
- ~CONFIRMACIONES_IMPLEMENTADAS.md~
- ~EXPORT_REPORTS_STATUS.md~
- ~FRONTEND_100_COMPLETE.md~
- ~FRONTEND_COMPLETION_REPORT.md~
- ~SECURITY_STATUS_FINAL.md~
- ~SECURITY_AUDIT_REPORT.md~
- ~TESTING_FINAL_REPORT.md~
- ~TESTING_SUMMARY.md~

**Documentación Redundante:**
- ~DOCKER.md~ (info en README.md)
- ~DOCKER_ORGANIZATION.md~ (info en README.md)
- ~DOCS_STRUCTURE.md~ (meta documento)
- ~MONOREPO.md~ (info en README.md)
- ~QUICK_START.md~ (info en README.md)
- ~docs/analysis/~ (carpeta completa)
- ~docs/setup/~ (carpeta completa)
- ~frontend/docs/~ (carpeta completa)
- ~backend/docs/~ (carpeta completa)

**Razón:** Toda la información importante está consolidada en los 4 documentos esenciales.

---

## 📝 Resumen

**Solo necesitas 4 documentos:**

1. **CLAUDE.md** → Memoria del proyecto
2. **README.md** → Documentación principal + Deployment
3. **DEPLOYMENT_GUIDE.md** → Guía rápida de deployment
4. **docs/DATABASE_MODEL.md** → Modelo de datos

**Más 2 templates de configuración:**

5. **.env.example** → Para desarrollo
6. **.env.production.example** → Para producción

**Total: 6 archivos esenciales** 

Todo lo demás era ruido. Ahora la documentación es clara y fácil de seguir! 🎉

---

**Última actualización:** 2025-01-10
