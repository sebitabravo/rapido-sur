-- =====================================================
-- SCRIPT DE BASE DE DATOS
-- Sistema de Gestión de Mantenimiento Vehicular
-- Rápido Sur
-- =====================================================
-- Versión: 1.0
-- Fecha: Diciembre 2025
-- Motor: PostgreSQL 15
-- Autor: Equipo de Desarrollo Rápido Sur
-- =====================================================

-- =====================================================
-- PASO 1: CREACIÓN DE BASE DE DATOS
-- =====================================================

-- Crear base de datos (ejecutar como superuser)
-- NOTA: Solo ejecutar una vez, al inicio

-- DROP DATABASE IF EXISTS rapido_sur_db;
CREATE DATABASE rapido_sur_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'es_CL.UTF-8'
    LC_CTYPE = 'es_CL.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectar a la base de datos
\c rapido_sur_db;

-- =====================================================
-- PASO 2: EXTENSIONES
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PASO 3: TIPOS ENUMERADOS (ENUMs)
-- =====================================================

-- Roles de usuarios
CREATE TYPE rol_usuario AS ENUM (
    'Administrador',
    'JefeMantenimiento',
    'Mecanico'
);

-- Estado de vehículos
CREATE TYPE estado_vehiculo AS ENUM (
    'Activo',
    'EnMantenimiento',
    'Inactivo',
    'DeBaja'
);

-- Tipo de orden de trabajo
CREATE TYPE tipo_orden_trabajo AS ENUM (
    'Preventivo',
    'Correctivo'
);

-- Estado de orden de trabajo
CREATE TYPE estado_orden_trabajo AS ENUM (
    'Pendiente',
    'Asignada',
    'EnProgreso',
    'Finalizada',
    'Cancelada'
);

-- Prioridad de orden de trabajo
CREATE TYPE prioridad_orden_trabajo AS ENUM (
    'BAJA',
    'MEDIA',
    'ALTA',
    'CRITICA'
);

-- Tipo de intervalo para mantenimiento preventivo
CREATE TYPE tipo_intervalo AS ENUM (
    'KM',      -- Por kilometraje
    'TIEMPO'   -- Por tiempo (días)
);

-- Tipo de alerta
CREATE TYPE tipo_alerta AS ENUM (
    'POR_KM',
    'POR_TIEMPO',
    'STOCK_BAJO'
);

-- Estado de alerta
CREATE TYPE estado_alerta AS ENUM (
    'Pendiente',
    'Resuelta',
    'Ignorada'
);

-- =====================================================
-- PASO 4: TABLA DE USUARIOS
-- =====================================================

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,

    -- Datos personales
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    -- Rol y estado
    rol rol_usuario NOT NULL,
    activo BOOLEAN DEFAULT TRUE,

    -- Personalización
    avatar VARCHAR(255) DEFAULT 'default',

    -- Preferencias de notificaciones
    notif_email BOOLEAN DEFAULT TRUE,
    notif_mantenimiento BOOLEAN DEFAULT TRUE,
    notif_reportes_semanales BOOLEAN DEFAULT FALSE,

    -- Timestamps automáticos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    -- Constraints
    CONSTRAINT email_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Comentarios
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema con RBAC';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash de contraseña con bcrypt cost factor 12';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: Administrador, JefeMantenimiento, Mecanico';
COMMENT ON COLUMN usuarios.deleted_at IS 'Soft delete - permite recuperación de datos';

-- =====================================================
-- PASO 5: TABLA DE VEHÍCULOS
-- =====================================================

CREATE TABLE vehiculos (
    id SERIAL PRIMARY KEY,

    -- Identificación del vehículo
    patente VARCHAR(10) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anno INT NOT NULL,

    -- Estado y kilometraje
    kilometraje_actual INT DEFAULT 0,
    estado estado_vehiculo DEFAULT 'Activo',

    -- Mantenimiento
    ultima_revision DATE NULL,

    -- Timestamps automáticos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    -- Constraints
    CONSTRAINT patente_valida CHECK (LENGTH(patente) BETWEEN 6 AND 10),
    CONSTRAINT anno_valido CHECK (anno BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    CONSTRAINT kilometraje_valido CHECK (kilometraje_actual >= 0)
);

-- Índices para vehículos
CREATE INDEX idx_vehiculos_patente ON vehiculos(patente);
CREATE INDEX idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX idx_vehiculos_ultima_revision ON vehiculos(ultima_revision);

-- Comentarios
COMMENT ON TABLE vehiculos IS 'Flota de 45 vehículos de Rápido Sur';
COMMENT ON COLUMN vehiculos.patente IS 'Patente única - formato chileno (6-10 caracteres)';
COMMENT ON COLUMN vehiculos.kilometraje_actual IS 'Odómetro actual - usado para alertas preventivas';

-- =====================================================
-- PASO 6: TABLA DE PLANES PREVENTIVOS
-- =====================================================

CREATE TABLE planes_preventivos (
    id SERIAL PRIMARY KEY,

    -- Relación con vehículo (1:1)
    vehiculo_id INT NOT NULL UNIQUE,

    -- Configuración del plan
    tipo_mantenimiento VARCHAR(100) NOT NULL,
    tipo_intervalo tipo_intervalo NOT NULL,
    intervalo INT NOT NULL,
    descripcion TEXT NOT NULL,

    -- Próxima programación
    proximo_kilometraje INT NULL,
    proxima_fecha DATE NULL,

    -- Estado
    activo BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_plan_vehiculo FOREIGN KEY (vehiculo_id)
        REFERENCES vehiculos(id)
        ON DELETE RESTRICT,

    -- Constraints
    CONSTRAINT intervalo_valido CHECK (intervalo > 0),
    CONSTRAINT tipo_intervalo_coherente CHECK (
        (tipo_intervalo = 'KM' AND proximo_kilometraje IS NOT NULL) OR
        (tipo_intervalo = 'TIEMPO' AND proxima_fecha IS NOT NULL)
    )
);

-- Índices
CREATE INDEX idx_planes_vehiculo ON planes_preventivos(vehiculo_id);
CREATE INDEX idx_planes_activo ON planes_preventivos(activo);
CREATE INDEX idx_planes_proximo_km ON planes_preventivos(proximo_kilometraje);
CREATE INDEX idx_planes_proxima_fecha ON planes_preventivos(proxima_fecha);

-- Comentarios
COMMENT ON TABLE planes_preventivos IS 'Planes de mantenimiento preventivo por vehículo';
COMMENT ON COLUMN planes_preventivos.tipo_intervalo IS 'KM: cada X kilómetros | TIEMPO: cada X días';
COMMENT ON COLUMN planes_preventivos.intervalo IS 'Valor del intervalo (ej: 10000 km o 180 días)';

-- =====================================================
-- PASO 7: TABLA DE ÓRDENES DE TRABAJO
-- =====================================================

CREATE TABLE ordenes_trabajo (
    id SERIAL PRIMARY KEY,

    -- Identificación única
    numero_ot VARCHAR(20) NOT NULL UNIQUE,

    -- Relaciones
    vehiculo_id INT NOT NULL,
    mecanico_id INT NULL,

    -- Tipo y estado
    tipo tipo_orden_trabajo NOT NULL,
    estado estado_orden_trabajo DEFAULT 'Pendiente',
    prioridad prioridad_orden_trabajo DEFAULT 'MEDIA',

    -- Descripción
    descripcion TEXT NOT NULL,
    observaciones TEXT NULL,

    -- Fechas
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio TIMESTAMP NULL,
    fecha_cierre TIMESTAMP NULL,

    -- Costos
    costo_estimado DECIMAL(10,2) NULL,
    costo_real DECIMAL(10,2) NULL,
    costo_total DECIMAL(10,2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    -- Foreign Keys
    CONSTRAINT fk_ot_vehiculo FOREIGN KEY (vehiculo_id)
        REFERENCES vehiculos(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_ot_mecanico FOREIGN KEY (mecanico_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    -- Constraints
    CONSTRAINT costo_estimado_valido CHECK (costo_estimado IS NULL OR costo_estimado >= 0),
    CONSTRAINT costo_real_valido CHECK (costo_real IS NULL OR costo_real >= 0),
    CONSTRAINT costo_total_valido CHECK (costo_total >= 0),
    CONSTRAINT fechas_coherentes CHECK (
        (fecha_inicio IS NULL OR fecha_inicio >= fecha_creacion) AND
        (fecha_cierre IS NULL OR fecha_cierre >= fecha_creacion)
    )
);

-- Índices para órdenes de trabajo
CREATE INDEX idx_ot_numero ON ordenes_trabajo(numero_ot);
CREATE INDEX idx_ot_vehiculo ON ordenes_trabajo(vehiculo_id);
CREATE INDEX idx_ot_mecanico ON ordenes_trabajo(mecanico_id);
CREATE INDEX idx_ot_estado ON ordenes_trabajo(estado);
CREATE INDEX idx_ot_tipo ON ordenes_trabajo(tipo);
CREATE INDEX idx_ot_fecha_creacion ON ordenes_trabajo(fecha_creacion);
CREATE INDEX idx_ot_vehiculo_fecha ON ordenes_trabajo(vehiculo_id, fecha_creacion);

-- Comentarios
COMMENT ON TABLE ordenes_trabajo IS 'Órdenes de trabajo - Core del sistema';
COMMENT ON COLUMN ordenes_trabajo.numero_ot IS 'Formato: OT-YYYY-NNNNN (ej: OT-2025-00001)';
COMMENT ON COLUMN ordenes_trabajo.estado IS 'Flujo: Pendiente → Asignada → EnProgreso → Finalizada';
COMMENT ON COLUMN ordenes_trabajo.costo_total IS 'Suma de repuestos + mano de obra';

-- =====================================================
-- PASO 8: TABLA DE TAREAS
-- =====================================================

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,

    -- Relación con orden de trabajo
    orden_trabajo_id INT NOT NULL,
    mecanico_id INT NULL,

    -- Descripción de la tarea
    descripcion TEXT NOT NULL,
    observaciones TEXT NULL,

    -- Estado y fechas
    completada BOOLEAN DEFAULT FALSE,
    fecha_vencimiento DATE NULL,

    -- Horas trabajadas (para cálculo de costo)
    horas_trabajadas DECIMAL(5,2) NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_tarea_ot FOREIGN KEY (orden_trabajo_id)
        REFERENCES ordenes_trabajo(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_tarea_mecanico FOREIGN KEY (mecanico_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    -- Constraints
    CONSTRAINT horas_validas CHECK (horas_trabajadas IS NULL OR horas_trabajadas >= 0)
);

-- Índices
CREATE INDEX idx_tareas_ot ON tareas(orden_trabajo_id);
CREATE INDEX idx_tareas_mecanico ON tareas(mecanico_id);
CREATE INDEX idx_tareas_completada ON tareas(completada);

-- Comentarios
COMMENT ON TABLE tareas IS 'Tareas dentro de una orden de trabajo';
COMMENT ON COLUMN tareas.horas_trabajadas IS 'Horas invertidas - usado para cálculo de mano de obra';

-- =====================================================
-- PASO 9: TABLA DE REPUESTOS
-- =====================================================

CREATE TABLE repuestos (
    id SERIAL PRIMARY KEY,

    -- Identificación
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    categoria VARCHAR(50) NULL,

    -- Precio e inventario
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad_stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    -- Constraints
    CONSTRAINT precio_valido CHECK (precio_unitario >= 0),
    CONSTRAINT stock_valido CHECK (cantidad_stock >= 0),
    CONSTRAINT stock_minimo_valido CHECK (stock_minimo >= 0)
);

-- Índices
CREATE INDEX idx_repuestos_codigo ON repuestos(codigo);
CREATE INDEX idx_repuestos_nombre ON repuestos(nombre);
CREATE INDEX idx_repuestos_stock ON repuestos(cantidad_stock);

-- Comentarios
COMMENT ON TABLE repuestos IS 'Catálogo de repuestos e inventario';
COMMENT ON COLUMN repuestos.cantidad_stock IS 'Stock actual - no puede ser negativo';
COMMENT ON COLUMN repuestos.stock_minimo IS 'Nivel mínimo para generar alerta de reposición';

-- =====================================================
-- PASO 10: TABLA DE DETALLES DE REPUESTOS
-- (Relación Many-to-Many entre Tareas y Repuestos)
-- =====================================================

CREATE TABLE detalles_repuestos (
    id SERIAL PRIMARY KEY,

    -- Relaciones
    tarea_id INT NOT NULL,
    repuesto_id INT NOT NULL,

    -- Cantidad y precio en el momento de uso
    cantidad_usada INT NOT NULL,
    precio_unitario_momento DECIMAL(10,2) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_detalle_tarea FOREIGN KEY (tarea_id)
        REFERENCES tareas(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_detalle_repuesto FOREIGN KEY (repuesto_id)
        REFERENCES repuestos(id)
        ON DELETE RESTRICT,

    -- Constraints
    CONSTRAINT cantidad_valida CHECK (cantidad_usada > 0),
    CONSTRAINT precio_momento_valido CHECK (precio_unitario_momento >= 0)
);

-- Índices
CREATE INDEX idx_detalles_tarea ON detalles_repuestos(tarea_id);
CREATE INDEX idx_detalles_repuesto ON detalles_repuestos(repuesto_id);

-- Comentarios
COMMENT ON TABLE detalles_repuestos IS 'Registro de repuestos usados en cada tarea';
COMMENT ON COLUMN detalles_repuestos.precio_unitario_momento IS 'Precio histórico - para cálculos precisos de costo';

-- =====================================================
-- PASO 11: TABLA DE ALERTAS
-- =====================================================

CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,

    -- Relación con vehículo
    vehiculo_id INT NOT NULL,

    -- Tipo y estado de la alerta
    tipo tipo_alerta NOT NULL,
    estado estado_alerta DEFAULT 'Pendiente',

    -- Mensaje y detalles
    mensaje TEXT NOT NULL,
    detalles JSONB NULL,

    -- Fechas
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_alerta_vehiculo FOREIGN KEY (vehiculo_id)
        REFERENCES vehiculos(id)
        ON DELETE RESTRICT
);

-- Índices
CREATE INDEX idx_alertas_vehiculo ON alertas(vehiculo_id);
CREATE INDEX idx_alertas_estado ON alertas(estado);
CREATE INDEX idx_alertas_tipo ON alertas(tipo);
CREATE INDEX idx_alertas_fecha_generacion ON alertas(fecha_generacion);

-- Comentarios
COMMENT ON TABLE alertas IS 'Alertas de mantenimiento preventivo';
COMMENT ON COLUMN alertas.detalles IS 'JSON con información adicional (km actual, próximo mantenimiento, etc.)';

-- =====================================================
-- PASO 12: TABLA DE HISTORIAL DE REPORTES
-- =====================================================

CREATE TABLE report_history (
    id SERIAL PRIMARY KEY,

    -- Usuario que generó el reporte
    usuario_id INT NOT NULL,

    -- Tipo de reporte
    tipo_reporte VARCHAR(50) NOT NULL,
    parametros JSONB NULL,

    -- Resultados
    resultado JSONB NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_report_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT
);

-- Índices
CREATE INDEX idx_reports_usuario ON report_history(usuario_id);
CREATE INDEX idx_reports_tipo ON report_history(tipo_reporte);
CREATE INDEX idx_reports_fecha ON report_history(created_at);

-- Comentarios
COMMENT ON TABLE report_history IS 'Historial de reportes generados';
COMMENT ON COLUMN report_history.parametros IS 'JSON con filtros aplicados (fechas, vehículo, etc.)';

-- =====================================================
-- PASO 13: FUNCIÓN PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 14: TRIGGERS PARA updated_at AUTOMÁTICO
-- =====================================================

CREATE TRIGGER trigger_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_vehiculos_updated_at
    BEFORE UPDATE ON vehiculos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_planes_updated_at
    BEFORE UPDATE ON planes_preventivos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_ot_updated_at
    BEFORE UPDATE ON ordenes_trabajo
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_tareas_updated_at
    BEFORE UPDATE ON tareas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_repuestos_updated_at
    BEFORE UPDATE ON repuestos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_alertas_updated_at
    BEFORE UPDATE ON alertas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- =====================================================
-- PASO 15: FUNCIÓN PARA DESCONTAR STOCK
-- =====================================================

CREATE OR REPLACE FUNCTION descontar_stock_repuesto()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar que hay stock suficiente
    IF (SELECT cantidad_stock FROM repuestos WHERE id = NEW.repuesto_id) < NEW.cantidad_usada THEN
        RAISE EXCEPTION 'Stock insuficiente para el repuesto ID %', NEW.repuesto_id;
    END IF;

    -- Descontar stock
    UPDATE repuestos
    SET cantidad_stock = cantidad_stock - NEW.cantidad_usada
    WHERE id = NEW.repuesto_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para descontar stock al registrar uso
CREATE TRIGGER trigger_descontar_stock
    AFTER INSERT ON detalles_repuestos
    FOR EACH ROW
    EXECUTE FUNCTION descontar_stock_repuesto();

-- =====================================================
-- PASO 16: FUNCIÓN PARA DEVOLVER STOCK
-- =====================================================

CREATE OR REPLACE FUNCTION devolver_stock_repuesto()
RETURNS TRIGGER AS $$
BEGIN
    -- Devolver stock al eliminar detalle
    UPDATE repuestos
    SET cantidad_stock = cantidad_stock + OLD.cantidad_usada
    WHERE id = OLD.repuesto_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para devolver stock al eliminar detalle
CREATE TRIGGER trigger_devolver_stock
    AFTER DELETE ON detalles_repuestos
    FOR EACH ROW
    EXECUTE FUNCTION devolver_stock_repuesto();

-- =====================================================
-- PASO 17: VISTA - RESUMEN DE ÓRDENES DE TRABAJO
-- =====================================================

CREATE OR REPLACE VIEW vista_resumen_ordenes AS
SELECT
    ot.id,
    ot.numero_ot,
    v.patente,
    v.marca || ' ' || v.modelo AS vehiculo,
    ot.tipo,
    ot.estado,
    ot.prioridad,
    u.nombre_completo AS mecanico,
    ot.fecha_creacion,
    ot.fecha_cierre,
    ot.costo_total,
    -- Calcular días de inactividad
    CASE
        WHEN ot.fecha_cierre IS NOT NULL
        THEN EXTRACT(DAY FROM (ot.fecha_cierre - ot.fecha_creacion))
        ELSE NULL
    END AS dias_inactividad,
    -- Contar tareas
    (SELECT COUNT(*) FROM tareas WHERE orden_trabajo_id = ot.id) AS total_tareas,
    (SELECT COUNT(*) FROM tareas WHERE orden_trabajo_id = ot.id AND completada = TRUE) AS tareas_completadas
FROM ordenes_trabajo ot
LEFT JOIN vehiculos v ON ot.vehiculo_id = v.id
LEFT JOIN usuarios u ON ot.mecanico_id = u.id
WHERE ot.deleted_at IS NULL;

COMMENT ON VIEW vista_resumen_ordenes IS 'Vista con resumen completo de órdenes de trabajo';

-- =====================================================
-- PASO 18: VISTA - VEHÍCULOS CON ALERTAS
-- =====================================================

CREATE OR REPLACE VIEW vista_vehiculos_con_alertas AS
SELECT
    v.id,
    v.patente,
    v.marca || ' ' || v.modelo AS vehiculo,
    v.kilometraje_actual,
    v.ultima_revision,
    pp.tipo_intervalo,
    pp.intervalo,
    pp.proximo_kilometraje,
    pp.proxima_fecha,
    -- Calcular si necesita alerta por KM
    CASE
        WHEN pp.tipo_intervalo = 'KM'
             AND v.kilometraje_actual >= (pp.proximo_kilometraje - 1000)
        THEN TRUE
        ELSE FALSE
    END AS alerta_por_km,
    -- Calcular si necesita alerta por tiempo
    CASE
        WHEN pp.tipo_intervalo = 'TIEMPO'
             AND pp.proxima_fecha <= (CURRENT_DATE + INTERVAL '7 days')
        THEN TRUE
        ELSE FALSE
    END AS alerta_por_tiempo
FROM vehiculos v
LEFT JOIN planes_preventivos pp ON v.id = pp.vehiculo_id
WHERE v.deleted_at IS NULL
  AND v.estado = 'Activo'
  AND pp.activo = TRUE;

COMMENT ON VIEW vista_vehiculos_con_alertas IS 'Vehículos que necesitan mantenimiento preventivo';

-- =====================================================
-- PASO 19: DATOS DE EJEMPLO (SEED)
-- =====================================================
-- NOTA: Estos datos son opcionales y solo para testing
-- En producción, usar el seed script de NestJS

-- Usuario Administrador (password: Admin123!)
-- Hash generado con bcrypt cost factor 12
INSERT INTO usuarios (nombre_completo, email, password_hash, rol, activo)
VALUES (
    'Administrador del Sistema',
    'admin@rapidosur.cl',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5UpiiLvZ4/yXW', -- Admin123!
    'Administrador',
    TRUE
);

-- Usuario Jefe de Mantenimiento (password: Jefe123!)
INSERT INTO usuarios (nombre_completo, email, password_hash, rol, activo)
VALUES (
    'Juan Pérez González',
    'jefe@rapidosur.cl',
    '$2b$12$EixZX0y8D5aU9M.nEGFl5.Ll0U.xfLwBqpT7.zzN4yDsN4vNO/rPO', -- Jefe123!
    'JefeMantenimiento',
    TRUE
);

-- Usuario Mecánico (password: Meca123!)
INSERT INTO usuarios (nombre_completo, email, password_hash, rol, activo)
VALUES (
    'Carlos Díaz Muñoz',
    'mecanico@rapidosur.cl',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Meca123!
    'Mecanico',
    TRUE
);

-- Vehículo de ejemplo
INSERT INTO vehiculos (patente, marca, modelo, anno, kilometraje_actual, estado, ultima_revision)
VALUES
    ('ABCD12', 'Mercedes-Benz', 'Sprinter 515', 2020, 85000, 'Activo', '2025-11-01'),
    ('EFGH34', 'Iveco', 'Daily 50C17', 2019, 120000, 'Activo', '2025-10-15'),
    ('IJKL56', 'Mercedes-Benz', 'OF-1722', 2021, 45000, 'Activo', '2025-11-20');

-- Plan preventivo para vehículo 1
INSERT INTO planes_preventivos (vehiculo_id, tipo_mantenimiento, tipo_intervalo, intervalo, descripcion, proximo_kilometraje, activo)
VALUES (
    1,
    'Mantenimiento General',
    'KM',
    10000,
    'Cambio de aceite, filtros, revisión de frenos y sistema eléctrico',
    95000,
    TRUE
);

-- Repuestos de ejemplo
INSERT INTO repuestos (nombre, codigo, descripcion, precio_unitario, cantidad_stock, stock_minimo)
VALUES
    ('Filtro de aceite Bosch P3274', 'FILT-001', 'Filtro de aceite para motor diesel', 12000, 15, 3),
    ('Aceite motor 15W40 Mobil', 'ACEI-001', 'Aceite sintético 15W40 (litro)', 8000, 30, 10),
    ('Pastillas de freno delanteras', 'FREN-001', 'Juego de pastillas Brembo', 45000, 8, 2);

-- =====================================================
-- PASO 20: PERMISOS Y SEGURIDAD
-- =====================================================

-- Crear role para la aplicación (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rapido_sur_app') THEN
        CREATE ROLE rapido_sur_app WITH LOGIN PASSWORD 'cambiar_en_produccion';
    END IF;
END
$$;

-- Otorgar permisos
GRANT CONNECT ON DATABASE rapido_sur_db TO rapido_sur_app;
GRANT USAGE ON SCHEMA public TO rapido_sur_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rapido_sur_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rapido_sur_app;

-- Permisos para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO rapido_sur_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO rapido_sur_app;

-- =====================================================
-- PASO 21: VERIFICACIÓN DE INTEGRIDAD
-- =====================================================

-- Contar tablas creadas
SELECT COUNT(*) AS total_tablas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- Listar todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- Verificar índices
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Resumen de objetos creados:
-- - 1 Base de datos (rapido_sur_db)
-- - 7 Tipos enumerados
-- - 9 Tablas principales
-- - 2 Vistas
-- - 3 Funciones
-- - 8 Triggers
-- - Múltiples índices y constraints
-- - Datos de ejemplo (seed)

-- Para ejecutar este script completo:
-- psql -U postgres -f SCRIPT_BASE_DE_DATOS.sql

-- Para ejecutar solo la estructura (sin seed):
-- Comentar la sección PASO 19

-- Para resetear la base de datos (CUIDADO en producción):
-- DROP DATABASE rapido_sur_db;
-- Luego ejecutar este script nuevamente

COMMENT ON DATABASE rapido_sur_db IS 'Sistema de Gestión de Mantenimiento Vehicular - Rápido Sur v1.0';

-- =====================================================
-- INFORMACIÓN ADICIONAL
-- =====================================================

/*
CREDENCIALES DE PRUEBA (generadas en SEED):

Administrador:
- Email: admin@rapidosur.cl
- Password: Admin123!

Jefe de Mantenimiento:
- Email: jefe@rapidosur.cl
- Password: Jefe123!

Mecánico:
- Email: mecanico@rapidosur.cl
- Password: Meca123!

IMPORTANTE: Cambiar todas las contraseñas en producción.

---

CONVENCIONES DE NOMBRES:

- Tablas: snake_case plural (usuarios, ordenes_trabajo)
- Columnas: snake_case (nombre_completo, fecha_creacion)
- Índices: idx_tabla_columna
- Foreign Keys: fk_tabla_referencia
- Constraints: descripcion_valida
- Triggers: trigger_tabla_accion
- Funciones: verbo_objeto()

---

INTEGRACIÓN CON TypeORM:

Este script es compatible con TypeORM. El ORM puede:
- Generar migraciones automáticamente
- Sincronizar esquema en desarrollo
- Ejecutar seeds programáticamente

Para usar con TypeORM, configurar en ormconfig.json:
{
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "postgres",
  "password": "postgres123",
  "database": "rapido_sur_db",
  "entities": ["src/**/*.entity.ts"],
  "migrations": ["src/migrations/*.ts"],
  "synchronize": false,
  "logging": true
}

---

BACKUP Y RESTORE:

Backup:
pg_dump -U postgres rapido_sur_db > backup.sql

Restore:
psql -U postgres -d rapido_sur_db -f backup.sql

---

CONTACTO:

Para dudas sobre este script:
- Email: dev@rapidosur.cl
- Documentación: docs/DATABASE_MODEL.md

---

Versión: 1.0
Fecha: Diciembre 2025
Autores: Rubilar, Bravo, Loyola, Aguayo
*/
