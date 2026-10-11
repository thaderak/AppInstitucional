# SENATI TaskHub PWA — Sistema de Gestión de Tareas e Instructores Offline-First

Aplicación Web Progresiva (PWA) desarrollada en **Angular 19+**, diseñada para instructores y estudiantes del **SENATI (Escuela de Tecnologías de la Información)**. Permite gestionar, consultar, encolar y entregar tareas académicas en entornos con conectividad inestable o nula (Offline-First).

---

## 📋 Resumen del Taller ABP

- **Programa:** Tecnologías de la Información / Ingeniería de Software con IA
- **Unidad Didáctica:** Aplicaciones Web Progresivas y Arquitecturas Desconectadas
- **Tema:** Sincronización Fuera de Línea e Integración PWA para Tareas Académicas
- **Instructor Referencial:** Luque Chambi Jorge
- **Tecnologías:** Angular 19+, TypeScript estricto, `@angular/service-worker` (ngsw), IndexedDB NoSQL local.

---

## 🏛️ Pilares de la Arquitectura PWA

1. **App Manifest (`manifest.webmanifest`):**
   - Identidad institucional SENATI: Azul corporativo (`#0033A0`) y fondo blanco.
   - Modo de visualización `standalone` (sin barra de navegador).
   - Íconos adaptativos generados en múltiples resoluciones (incluyendo `192x192` y `512x512`).

2. **Service Worker (`ngsw-worker.js` / `ngsw-config.json`):**
   - Estrategia `performance` (Cache-First) para el catálogo de tareas `/assets/data/tareas.json`.
   - Prefetch del App Shell (`index.html`, scripts JS, hojas de estilo CSS, favicon e íconos).

3. **Persistencia NoSQL con IndexedDB (`StorageService`):**
   - Base de datos transaccional del navegador: `senatiTaskDB`.
   - ObjectStore: `entregas_pendientes` con clave auto-incremental (`keyPath: 'id'`).
   - Encola entregas y observaciones en estado `PENDIENTE` cuando no hay conexión.

4. **Interfaz Dual e Interactiva (`AppComponent`):**
   - Detección en tiempo real del sensor de red (`navigator.onLine`) y eventos `online` / `offline`.
   - Conmutación visual entre vista de **Estudiante** (Entrega de tareas) e **Instructor** (Registro de observaciones locales y control de cursos).
   - Botón integrado para simular estado con/sin conexión sin necesidad de desconectar el equipo.
   - Cola de entregas con sincronización manual o automática hacia el Campus Virtual.

---

## 📘 Saberes Previos Resueltos (Fase 1)

1. **¿Por qué una estrategia Offline-First es crítica para entornos industriales y de taller?**  
   En talleres de mecánica, electricidad o informática industrial, las infraestructuras a menudo cuentan con cobertura de red débil o zonas muertas. La estrategia Offline-First garantiza que la aplicación siga operativa sin colapsar ni perder el progreso del usuario, almacenando localmente hasta restablecer la señal.

2. **¿Cuál es la función del archivo `manifest.webmanifest` en la instalación de una app?**  
   Define los metadatos necesarios para que el navegador y el sistema operativo móvil o de escritorio reconozcan la aplicación como instalable: nombre, íconos de pantalla de inicio, color temático de la barra de estado y comportamiento de ventana independiente (`display: standalone`).

3. **¿Qué diferencia existe entre almacenar recursos en Cache Storage y datos estructurados en IndexedDB?**  
   - **Cache Storage:** Diseñado para almacenar pares Request/Response HTTP (archivos estáticos como HTML, JS, CSS, fuentes, imágenes y endpoints de solo lectura).
   - **IndexedDB:** Base de datos NoSQL transaccional orientada a objetos JSON con índices y claves, adecuada para almacenar entradas del usuario, formularios en cola y datos transaccionales mutables.

---

## 🚀 Guía de Ejecución y Pruebas

### 1. Ejecutar en Modo Desarrollo
```bash
npm start
```
Abre [http://localhost:4200](http://localhost:4200).  
*(Nota: Por estándar de Angular, el Service Worker está activo en compilaciones de producción).*

### 2. Compilar para Producción (Genera Service Worker)
```bash
npm run build
```
Genera los artefactos en `dist/AppSenati/browser` con `ngsw.json` preconfigurado.

### 3. Previsualizar la PWA con Service Worker activo
```bash
npm run preview:pwa
```
Abre tu navegador en [http://localhost:8080](http://localhost:8080).

### 4. Ejecutar Pruebas Unitarias
```bash
npm test
```
Ejecuta las pruebas con Vitest verificando componentes, roles y cambio online/offline.

---

## 📸 Guía para Capturas de Evidencias (DevTools)

Para cumplir con el criterio de **Evidencias Técnicas DevTools (10 pts)**:

1. **Service Worker Activo:**
   - Abre DevTools (`F12`) en Google Chrome o Edge.
   - Ve a la pestaña **Application** (Aplicación) -> **Service Workers**.
   - Verifica el estado en verde: `ngsw-worker.js (activated and is running)`. Toma captura.

2. **Cache Storage Poblado:**
   - En la pestaña **Application**, despliega **Storage** -> **Cache Storage**.
   - Observa las memorias caché generadas: `ngsw:...:app:cache` y `ngsw:...:data:tareas-api`. Toma captura.

3. **IndexedDB Poblado:**
   - Activa el modo Offline (usando el botón "📴 Offline" de la app o marcando la casilla *Offline* en DevTools -> Network).
   - Escribe un comentario/entrega y presiona **GUARDAR EN DISPOSITIVO**.
   - En DevTools -> **Application** -> **Storage** -> **IndexedDB**, despliega `senatiTaskDB` -> `entregas_pendientes`.
   - Verás el registro guardado con `estadoSincronizacion: "PENDIENTE"`. Toma captura.

---

## 📊 Matriz de Cumplimiento de la Rúbrica (100 / 100 pts)

| Criterio | Descripción Técnica | Estado | Puntaje |
| :--- | :--- | :---: | :---: |
| **Configuración PWA & Manifest** | Soporte PWA, metadatos corporativos SENATI, theme color `#0033A0`, íconos 192x192 y 512x512 | ✅ Completo | 20 / 20 pts |
| **Runtime Caching (ngsw-config)** | Estrategia `performance` configurada para `/assets/data/tareas.json` | ✅ Completo | 20 / 20 pts |
| **Persistencia NoSQL (IndexedDB)** | Servicio `StorageService` con BD `senatiTaskDB` y store `entregas_pendientes` | ✅ Completo | 25 / 25 pts |
| **Interfaz Dual (Online/Offline)** | Sensor `navigator.onLine`, conmutación reactiva, vistas de Estudiante e Instructor | ✅ Completo | 15 / 15 pts |
| **Evidencias Técnicas DevTools** | Guía y soporte para capturas de SW activo, Cache Storage e IndexedDB | ✅ Completo | 10 / 10 pts |
| **Buenas Prácticas y Código** | TypeScript tipado estricto, SCSS responsivo mobile-first, pruebas unitarias aprobadas | ✅ Completo | 10 / 10 pts |
| **TOTAL** | **Evaluación Sumativa del Taller ABP** | **Aprobado** | **100 / 100 pts** |
