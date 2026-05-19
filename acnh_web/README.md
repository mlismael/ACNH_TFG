# ACNH Web

Frontend Angular del proyecto ACNH. Consume un backend PHP que expone una API REST y muestra:

- Lista de aldeanos (`/villagers`)
- Lista de bichos (`/bugs`)
- Lista de peces (`/fishes`)
- Lista de criaturas marinas (`/seacreatures`)
- Login / registro (`/login`)
- Perfil de usuario (`/perfil-usuario`)

## Estructura principal

- `src/app/components/` - Componentes de cada página y elementos UI.
- `src/app/services/` - Servicios para autenticación, traducción, temas y conexión con el backend.
- `src/assets/` - Imágenes, logos y iconos utilizados por la aplicación.
- `src/styles.css` - Estilos globales compartidos.
- `src/app/app.routes.ts` - Rutas de la aplicación.

## Rutas de la aplicación

- `/home`
- `/villagers`
- `/bugs`
- `/fishes`
- `/seacreatures`
- `/login`
- `/perfil-usuario`

## Dependencias principales

- Angular 19
- Bootstrap 5 (estilos y responsive)
- RxJS
- Angular Forms

## Ejecución local

Instala dependencias y ejecuta el servidor:

```bash
cd acnh_web
npm install
npm run build
npm run serve
```

O directamente con Angular CLI:

```bash
cd acnh_web
ng serve
```

La aplicación se abrirá en `http://localhost:4200/`.

## Configuración del backend de consumo

El frontend realiza llamadas al backend en:

```text
http://localhost/ACNH_TFG/acnh_project/index.php
```

Los servicios principales son:

- `auth.service.ts` → login, logout y almacenamiento de sesión.
- `nookipedia.service.ts` → petición de aldeanos, coleccionables y eventos.
- `translation.service.ts` → traducción de texto y mapeo de signos zodiacales.
- `theme.service.ts` → alternancia de tema claro/oscuro.

## Notas útiles

- La ruta `/login` muestra formulario de acceso y registro en el mismo componente.
- El logo del header alterna entre `acnh-dark-logo.png` y `acnh-light-logo_Nero_AI_Image_Upscaler_Photo.jpeg`.
- La aplicación usa `sessionStorage` para guardar el usuario y token tras el login.
- `villagers.component.ts` usa mocks traducidos si la API real no responde.

## Build

Para compilar en modo producción:

```bash
cd acnh_web
ng build --prod
```

Los artefactos se generan en `dist/acnh_web`.
