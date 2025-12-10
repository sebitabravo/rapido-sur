# 🎨 Diagramas del Sistema - Rápido Sur

Esta carpeta contiene todos los diagramas del sistema en formatos fuente que puedes convertir a imágenes bonitas.

## 📂 Archivos Incluidos

| Archivo | Tipo | Herramienta | Descripción |
|---------|------|-------------|-------------|
| `01-arquitectura.mmd` | Mermaid | mermaid.live | Arquitectura general del sistema |
| `02-diagrama-er.dbml` | DBML | dbdiagram.io | Modelo de base de datos |
| `03-casos-uso.puml` | PlantUML | plantuml.com | Casos de uso por rol |
| `04-secuencia-login.puml` | PlantUML | plantuml.com | Flujo de autenticación |
| `05-secuencia-orden-trabajo.puml` | PlantUML | plantuml.com | Flujo completo de OT |
| `06-estados-orden-trabajo.mmd` | Mermaid | mermaid.live | Estados de una OT |
| `07-componentes-backend.mmd` | Mermaid | mermaid.live | Módulos de NestJS |
| `08-deployment.mmd` | Mermaid | mermaid.live | Arquitectura de deployment |

---

## 🚀 Cómo Convertir a Imágenes

### Opción 1: Herramientas Online (MÁS FÁCIL) ⭐

#### Para archivos `.mmd` (Mermaid):
1. Ve a **https://mermaid.live**
2. Abre el archivo `.mmd` y copia todo el contenido
3. Pega en el editor de mermaid.live
4. El diagrama se renderiza automáticamente a la derecha
5. Click en **"Download PNG"** o **"Download SVG"**
6. ✨ ¡Listo! Tienes una imagen bonita

#### Para archivos `.dbml` (Diagrama ER):
1. Ve a **https://dbdiagram.io**
2. Abre el archivo `.dbml` y copia todo el contenido
3. Pega en el editor (lado izquierdo)
4. El diagrama se renderiza automáticamente a la derecha
5. Click en **"Export"** → **"Export to PNG/SVG"**
6. ✨ ¡Listo!

#### Para archivos `.puml` (PlantUML):
1. Ve a **https://www.plantuml.com/plantuml/uml/**
2. Abre el archivo `.puml` y copia todo el contenido
3. Pega en el cuadro de texto
4. Click en **"Submit"**
5. El diagrama se genera
6. Click derecho en la imagen → **"Guardar imagen como..."**
7. ✨ ¡Listo!

---

### Opción 2: VS Code Extensions (MÁS PROFESIONAL)

#### Instalar extensiones:
```bash
# En VS Code, instala estas extensiones:
1. "PlantUML" (jebbs.plantuml)
2. "Mermaid Preview" (vstirbu.vscode-mermaid-preview)
```

#### Renderizar:
1. Abre cualquier archivo `.puml` o `.mmd` en VS Code
2. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
3. Escribe "PlantUML: Export Current Diagram" (para .puml)
4. O "Mermaid: Preview" (para .mmd)
5. Exporta como PNG o SVG

---

### Opción 3: CLI (PARA EXPERTOS)

#### PlantUML CLI:
```bash
# Instalar PlantUML
brew install plantuml  # En Mac
# O descargar de https://plantuml.com/download

# Convertir todos los .puml a PNG
cd docs/diagramas
plantuml *.puml
```

#### Mermaid CLI:
```bash
# Instalar Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Convertir todos los .mmd a PNG
cd docs/diagramas
mmdc -i 01-arquitectura.mmd -o 01-arquitectura.png
```

---

## 🎨 Configuración de Estilo (Opcional)

### Para Mermaid - Agregar tema profesional:
En cualquier archivo `.mmd`, puedes cambiar el tema agregando al inicio:

```mermaid
%%{init: {'theme':'forest'}}%%
```

**Temas disponibles**:
- `default` - Colores estándar
- `forest` - Verde profesional ⭐ (recomendado)
- `dark` - Fondo oscuro
- `neutral` - Grises y azules
- `base` - Minimalista

### Para PlantUML - Agregar colores:
Agrega al inicio de cualquier `.puml`:

```plantuml
skinparam backgroundColor #FEFEFE
skinparam handwritten false
skinparam shadowing false
skinparam defaultFontSize 12
skinparam defaultFontName Arial
```

---

## 📸 Galería de Diagramas Generados

Una vez que conviertas los archivos, te quedarán así:

```
docs/diagramas/
├── 01-arquitectura.png          ✅
├── 02-diagrama-er.png           ✅
├── 03-casos-uso.png             ✅
├── 04-secuencia-login.png       ✅
├── 05-secuencia-orden-trabajo.png ✅
├── 06-estados-orden-trabajo.png ✅
├── 07-componentes-backend.png   ✅
└── 08-deployment.png            ✅
```

---

## ⚡ Script de Conversión Automática

Si quieres convertir todos de una vez, usa este script:

### `convert-all.sh`:
```bash
#!/bin/bash
# Script para convertir todos los diagramas a PNG

echo "🎨 Convirtiendo diagramas a PNG..."

# Convertir PlantUML
if command -v plantuml &> /dev/null; then
    echo "📊 Convirtiendo archivos PlantUML..."
    plantuml *.puml
else
    echo "⚠️  PlantUML no instalado. Instala con: brew install plantuml"
fi

# Convertir Mermaid
if command -v mmdc &> /dev/null; then
    echo "📊 Convirtiendo archivos Mermaid..."
    for file in *.mmd; do
        mmdc -i "$file" -o "${file%.mmd}.png"
    done
else
    echo "⚠️  Mermaid CLI no instalado. Instala con: npm install -g @mermaid-js/mermaid-cli"
fi

echo "✅ ¡Conversión completada!"
echo "📁 Revisa las imágenes PNG generadas en esta carpeta"
```

**Uso**:
```bash
cd docs/diagramas
chmod +x convert-all.sh
./convert-all.sh
```

---

## 🎯 Recomendación para tu Entrega

**Para esta semana**, lo más rápido es:

1. ✅ Abre **https://mermaid.live**
2. ✅ Copia y pega cada archivo `.mmd`
3. ✅ Descarga como PNG
4. ✅ Repite para **https://dbdiagram.io** (archivo `.dbml`)
5. ✅ Repite para **https://plantuml.com** (archivos `.puml`)

**Tiempo estimado**: 10-15 minutos para todos los diagramas.

---

## 📚 Recursos Adicionales

- **Mermaid Docs**: https://mermaid.js.org/intro/
- **PlantUML Docs**: https://plantuml.com/
- **dbdiagram Docs**: https://dbdiagram.io/docs

---

## 💡 Tips para Diagramas Bonitos

1. **Usa colores consistentes**: Los archivos ya tienen colores profesionales
2. **Exporta en SVG para mejor calidad**: Especialmente para presentaciones
3. **PNG es suficiente para documentos PDF**: Resolucion 300 DPI
4. **Para impresión**: Usa SVG y conviértelo a PDF

---

**¿Necesitas ayuda?** Revisa la sección de troubleshooting en `MANUAL_INSTALACION.md`

*Última actualización: Diciembre 2025*
