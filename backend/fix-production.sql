-- FIX PRODUCCIÓN: Crear tabla report_history
-- Ejecutar este script en el servidor de producción

-- 1. Crear tabla report_history si no existe
CREATE TABLE IF NOT EXISTS report_history (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    fecha_inicio VARCHAR(50) NOT NULL,
    fecha_fin VARCHAR(50) NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(255)
);

-- 2. Verificar que la tabla se creó correctamente
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'report_history'
ORDER BY ordinal_position;

-- 3. Contar registros (debería ser 0 si es nueva)
SELECT COUNT(*) as total_registros FROM report_history;
