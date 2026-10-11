# Institución TaskHub PWA — Sistema de Gestión de Tareas e Instructores sin Conexión

Aplicación Web Progresiva (PWA) desarrollada en **Angular 19 o superior**, pensada para estudiantes e instructores de una institución educativa. Permite consultar tareas, registrar entregas y guardar información cuando no hay conexión a Internet. Los datos se almacenan en el dispositivo y pueden sincronizarse cuando se recupere la conexión.

---

## Resumen del Taller ABP

- **Programa:** Tecnologías de la Información / Desarrollo de Aplicaciones Web
- **Unidad Didáctica:** Aplicaciones Web Progresivas y Arquitecturas Desconectadas
- **Tema:** Trabajo sin conexión y sincronización de tareas académicas mediante una PWA
- **Instructor:** Luque Chambi Jorge
- **Tecnologías utilizadas:** Angular 19, TypeScript, Service Worker e IndexedDB.

---

## 1. Arquitectura de la aplicación PWA

### 1.1. Archivo App Manifest (`manifest.webmanifest`)

Este archivo contiene la información necesaria para que la aplicación pueda instalarse en una computadora o un celular.

- Define el nombre y los colores de la aplicación.
- Utiliza un fondo blanco y un color azul como parte de su diseño.
- Permite abrir la aplicación en modo `standalone`, sin mostrar la barra de navegación del navegador.
- Incluye iconos en diferentes tamaños, como 192 × 192 y 512 × 512 píxeles.

### 1.2. Service Worker (`ngsw-worker.js` y `ngsw-config.json`)

El Service Worker permite que la aplicación pueda utilizar algunos recursos guardados en la caché cuando no hay conexión a Internet.

- Guarda recursos de la aplicación, como archivos HTML, JavaScript y CSS.
- Utiliza la estrategia `performance` para consultar los datos guardados en caché y mejorar el tiempo de respuesta.
- Permite acceder a los recursos previamente almacenados cuando no hay conexión.
- Para probarlo correctamente, se debe compilar la aplicación para producción y ejecutarla con un servidor HTTP local.

### 1.3. Almacenamiento local con IndexedDB (`StorageService`)

IndexedDB permite guardar información directamente en el navegador.

- Se utiliza una base de datos local llamada `institucionTaskDB`.
- Contiene un almacén de datos llamado `entregas_pendientes`.
- Permite guardar las tareas y observaciones que todavía no se han sincronizado.
- Cuando no hay conexión, las entregas se guardan con el estado `PENDIENTE`.
- Cuando vuelve la conexión, los datos pueden enviarse al servidor si la sincronización está implementada.

### 1.4. Interfaz para estudiantes e instructores (`AppComponent`)

La aplicación cuenta con una interfaz que permite realizar diferentes acciones según el tipo de usuario.

- Detecta si el navegador tiene conexión a Internet mediante `navigator.onLine`.
- Utiliza los eventos `online` y `offline` para detectar cambios en la conexión.
- Incluye una vista para estudiantes, donde pueden consultar y registrar sus entregas.
- Incluye una vista para instructores, donde pueden registrar observaciones y consultar información de los cursos.
- Permite simular los estados con conexión y sin conexión mediante un botón de la interfaz.
- Muestra las entregas pendientes de sincronización.

---

## 2. Saberes previos resueltos

### Pregunta 1. ¿Por qué es importante utilizar una estrategia Offline-First en talleres o entornos educativos?

La estrategia Offline-First es importante porque permite seguir utilizando una aplicación cuando no hay conexión a Internet. Por ejemplo, un estudiante puede registrar una entrega y guardarla en su dispositivo sin perder la información. Cuando vuelva a tener conexión, los datos podrán sincronizarse con el servidor, siempre que esta función esté implementada.

### Pregunta 2. ¿Cuál es la función del archivo `manifest.webmanifest`?

Su función es proporcionar la información necesaria para instalar una aplicación web como si fuera una aplicación normal. Contiene datos como el nombre, los iconos, los colores y la forma en que se mostrará la aplicación al abrirla.

### Pregunta 3. ¿Qué diferencia existe entre Cache Storage e IndexedDB?

**Cache Storage:** permite guardar recursos de una aplicación web, como archivos HTML, CSS, JavaScript e imágenes. Estos recursos pueden utilizarse después sin necesidad de descargarlos nuevamente.

**IndexedDB:** permite guardar datos organizados, como entregas, formularios, comentarios y registros creados por el usuario. Es útil para conservar información cuando no hay conexión a Internet.

En resumen, Cache Storage guarda principalmente recursos de la aplicación, mientras que IndexedDB permite guardar información generada durante su uso.

---

## 3. Guía para ejecutar la aplicación

### 3.1. Ejecutar en modo desarrollo

Primero, se ejecuta el siguiente comando en la terminal:

```bash
npm start
```

Después, se abre el navegador y se ingresa a la siguiente dirección:

`http://localhost:4200`

En este modo se puede desarrollar y probar la interfaz. Sin embargo, el Service Worker de Angular normalmente no se activa en el servidor de desarrollo.

### 3.2. Compilar la aplicación

Para generar la versión de producción, se ejecuta:

```bash
npm run build
```

Este comando genera los archivos necesarios para ejecutar la aplicación compilada. Si la configuración de Angular está preparada correctamente, también genera los archivos
