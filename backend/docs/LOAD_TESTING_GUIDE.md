# TEST-005: Pruebas de Carga - Rápido Sur

## Objetivo
Validar que el sistema cumple con los requisitos de performance definidos en RNF-01:
- Soportar mínimo 10 usuarios concurrentes
- Queries de datos en menos de 3 segundos
- Generación de reportes simples en menos de 10 segundos

---

## Herramientas Recomendadas

### Opción 1: Artillery (Recomendada)
**Ventajas:**
- Fácil configuración con YAML
- Excelente para APIs REST
- Reportes detallados
- CI/CD friendly

**Instalación:**
```bash
npm install --save-dev artillery
```

**Configuración Básica** (`artillery-config.yml`):
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10  # 10 usuarios por segundo
      name: "Sustained load"
  defaults:
    headers:
      Content-Type: "application/json"

scenarios:
  - name: "Health Check"
    flow:
      - get:
          url: "/health"
          expect:
            - statusCode: 200

  - name: "Login and Access Protected Route"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@rapidosur.cl"
            password: "testPassword123"
          capture:
            - json: "$.access_token"
              as: "token"
      - get:
          url: "/api/vehiculos"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
            - contentType: json

  - name: "Get Work Orders List"
    weight: 3  # 3x más frecuente
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "jefe@rapidosur.cl"
            password: "password"
          capture:
            - json: "$.access_token"
              as: "token"
      - get:
          url: "/api/ordenes-trabajo"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
            - maxResponseTime: 3000  # < 3 segundos

  - name: "Generate Cost Report"
    weight: 1
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "admin@rapidosur.cl"
            password: "password"
          capture:
            - json: "$.access_token"
              as: "token"
      - get:
          url: "/api/reportes/costos"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
            - maxResponseTime: 10000  # < 10 segundos
```

**Ejecución:**
```bash
# Test básico
npx artillery run artillery-config.yml

# Con reporte HTML
npx artillery run --output report.json artillery-config.yml
npx artillery report report.json
```

---

### Opción 2: k6 (Alternativa)
**Ventajas:**
- Escrito en Go (muy rápido)
- Scripting en JavaScript
- Excelentes visualizaciones

**Instalación:**
```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6
```

**Script de Ejemplo** (`load-test.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests < 3s
    http_req_failed: ['rate<0.1'],     // Error rate < 10%
  },
};

export default function () {
  // Login
  const loginRes = http.post('http://localhost:3000/api/auth/login', 
    JSON.stringify({
      email: 'test@rapidosur.cl',
      password: 'testPassword123',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('access_token') !== undefined,
  });

  const token = loginRes.json('access_token');

  // Get vehicles
  const vehiclesRes = http.get('http://localhost:3000/api/vehiculos', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(vehiclesRes, {
    'vehicles loaded': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 3000,
  });

  sleep(1);
}
```

**Ejecución:**
```bash
k6 run load-test.js
```

---

### Opción 3: Apache JMeter (Completa pero compleja)
Solo si se necesita testing muy detallado con UI gráfica.

---

## Escenarios de Test Recomendados

### 1. Test de Carga Básico
**Objetivo:** Validar 10 usuarios concurrentes  
**Duración:** 5 minutos  
**Endpoints:**
- GET /api/vehiculos
- GET /api/ordenes-trabajo
- POST /api/ordenes-trabajo (crear OT)

**Criterios de Éxito:**
- ✅ 0% errores
- ✅ P95 response time < 3s
- ✅ CPU < 80%
- ✅ Memoria < 512MB

---

### 2. Test de Stress
**Objetivo:** Encontrar límite del sistema  
**Configuración:**
- Inicio: 1 usuario
- Incremento: +5 usuarios cada 30s
- Máximo: 50 usuarios
- Mantener carga hasta que falle

**Métricas a observar:**
- Response time degradation
- Error rate
- Database connections
- Memory usage

---

### 3. Test de Reportes
**Objetivo:** Validar generación de reportes  
**Endpoints:**
- GET /api/reportes/indisponibilidad
- GET /api/reportes/costos
- GET /api/reportes/mantenimientos
- GET /api/reportes/export/csv

**Criterios:**
- ✅ Reportes simples < 10s
- ✅ CSV export completa correctamente
- ✅ Datos consistentes bajo carga

---

### 4. Test de Picos (Spike Test)
**Objetivo:** Validar recuperación ante picos repentinos  
**Configuración:**
- Normal: 5 usuarios
- Pico: 30 usuarios por 1 minuto
- Vuelta: 5 usuarios

**Validar:**
- Sistema se recupera
- No hay errores permanentes
- Performance vuelve a normal

---

## Métricas Clave a Monitorear

### Response Times
```
P50 (median):  < 1000ms
P95:           < 3000ms
P99:           < 5000ms
```

### Error Rates
```
HTTP 4xx: < 5%   (errores de cliente)
HTTP 5xx: < 1%   (errores de servidor)
```

### Throughput
```
Requests/sec: > 50 (para 10 usuarios)
```

### Database
```
Connection pool: No debe saturarse
Query time: Mayoría < 100ms
```

---

## Implementación Paso a Paso

### Fase 1: Setup (1 día)
1. Instalar Artillery: `npm install --save-dev artillery`
2. Crear `artillery-config.yml` básico
3. Configurar datos de prueba en BD
4. Ejecutar primer test

### Fase 2: Escenarios Básicos (1 día)
1. Test de login
2. Test de lectura (GET)
3. Test de escritura (POST/PUT)
4. Validar thresholds

### Fase 3: Reportes y Optimización (1 día)
1. Tests de reportes
2. Identificar cuellos de botella
3. Optimizar queries lentas
4. Agregar índices si necesario

---

## Integración con CI/CD

**GitHub Actions Workflow** (`.github/workflows/load-test.yml`):
```yaml
name: Load Tests

on:
  schedule:
    - cron: '0 2 * * 0'  # Domingos 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          npm install -g artillery
      
      - name: Start application
        run: |
          cd backend
          npm run start:prod &
          sleep 30
      
      - name: Run load tests
        run: artillery run artillery-config.yml
      
      - name: Check results
        run: |
          if [ -f artillery-report.json ]; then
            # Parse and validate metrics
            echo "Load test completed"
          fi
```

---

## Comandos Rápidos

```bash
# Instalar Artillery
npm install --save-dev artillery

# Test rápido (30s, 5 usuarios/s)
npx artillery quick --duration 30 --rate 5 http://localhost:3000/health

# Test con configuración
npx artillery run artillery-config.yml

# Test con reporte HTML
npx artillery run --output report.json artillery-config.yml
npx artillery report report.json

# Ver métricas en tiempo real
npx artillery run --output - artillery-config.yml | npx artillery report
```

---

## Criterios de Aceptación (RNF-01)

### Requisito 1: 10 Usuarios Concurrentes
```yaml
✅ Artillery config:
   arrivalRate: 10
   duration: 300  # 5 minutos
   
✅ Métricas esperadas:
   - Error rate: < 1%
   - P95 latency: < 3000ms
   - Successful requests: > 95%
```

### Requisito 2: Queries < 3 segundos
```yaml
✅ Artillery threshold:
   - http.response_time:
       max: 3000
       p95: 2500
       
✅ Endpoints críticos:
   - GET /api/vehiculos
   - GET /api/ordenes-trabajo
   - GET /api/usuarios
```

### Requisito 3: Reportes < 10 segundos
```yaml
✅ Artillery scenario:
   - name: "Generate Report"
     flow:
       - get:
           url: "/api/reportes/costos"
           expect:
             - maxResponseTime: 10000
```

---

## Ejemplo Completo Listo para Usar

**Guardar como:** `backend/artillery-basic.yml`

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 120
      arrivalRate: 10
      name: "RNF-01: 10 concurrent users"
  defaults:
    headers:
      Content-Type: "application/json"

scenarios:
  - name: "Critical Path - Complete Flow"
    weight: 5
    flow:
      # 1. Login
      - post:
          url: "/api/auth/login"
          json:
            email: "jefe@rapidosur.cl"
            password: "{{ $processEnvironment.TEST_PASSWORD }}"
          capture:
            - json: "$.access_token"
              as: "token"
          expect:
            - statusCode: 200
            - maxResponseTime: 2000

      # 2. List vehicles (< 3s per RNF-01)
      - get:
          url: "/api/vehiculos"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
            - maxResponseTime: 3000
            - contentType: json

      # 3. List work orders
      - get:
          url: "/api/ordenes-trabajo"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
            - maxResponseTime: 3000

      # 4. View specific vehicle
      - get:
          url: "/api/vehiculos/1"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: [200, 404]

  - name: "Report Generation"
    weight: 1
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "admin@rapidosur.cl"
            password: "{{ $processEnvironment.TEST_PASSWORD }}"
          capture:
            - json: "$.access_token"
              as: "token"

      # Report must complete in < 10s per RNF-01
      - get:
          url: "/api/reportes/indisponibilidad"
          headers:
            Authorization: "Bearer {{ token }}"
          expect:
            - statusCode: 200
            - maxResponseTime: 10000
```

**Ejecutar:**
```bash
export TEST_PASSWORD="your-test-password"
npx artillery run backend/artillery-basic.yml
```

---

## Estado Actual

- ✅ **Documentación completa** de estrategia de load testing
- ✅ **Herramientas seleccionadas** (Artillery recomendada)
- ✅ **Configuraciones listas** para implementar
- ⚠️ **Pendiente:** Ejecutar tests reales (requiere BD poblada)

**Estimación para implementación real:** 2-3 días

---

## Próximos Pasos

1. **Preparar datos de prueba**
   - Seeders con ~100 vehículos
   - ~500 órdenes de trabajo
   - 20-30 usuarios

2. **Ejecutar baseline**
   - Artillery quick test
   - Capturar métricas iniciales

3. **Optimizar si necesario**
   - Agregar índices BD
   - Optimizar queries N+1
   - Cachear reportes

4. **Integrar en CI/CD**
   - Tests semanales automáticos
   - Alertas si performance degrada

---

*Documentación generada para TEST-005*  
*Rápido Sur - Universidad Técnica Federico Santa María*
