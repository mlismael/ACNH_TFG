# ACNH Project - Plataforma Animal Crossing

Proyecto completo que combina un backend API REST en PHP con un frontend Angular para gestionar usuarios, favoritos y datos de Animal Crossing: New Horizons.

## Resumen actual del proyecto

- `acnh_project/`: Backend PHP MVC con API REST y acceso a base de datos MySQL.
- `acnh_web/`: Frontend Angular que consume el backend y muestra listado de aldeanos, bichos, peces y criaturas marinas.
- `acnh_project/sql`: Script de creación de la base de datos MySQL y datos de usuario inicial.
- `acnh_web/src/assets/`: Activos gráficos usados por la aplicación, incluyendo logos y iconos zodiacales.

## Estructura del proyecto

```
ACNH_TFG/
├── acnh_project/              # Backend PHP
│   ├── index.php              # Punto de entrada común
│   ├── controllers/           # Controladores que devuelven JSON
│   │   ├── UsuarioController.php
│   │   ├── AldeanosUsuarioController.php
│   │   ├── ColeccionablesUsuarioController.php
│   │   └── NookipediaController.php
│   ├── models/                # Modelos de acceso a base de datos
│   │   ├── UsuarioModel.php
│   │   ├── AldeanosUsuarioModel.php
│   │   ├── ColeccionablesUsuarioModel.php
│   │   └── TipoColeccionableModel.php
│   ├── libs/                  # Librerías de configuración y router
│   │   ├── Config.php
│   │   ├── FrontController.php
│   │   ├── NookipediaClient.php
│   │   ├── SPDO.php
│   │   └── setup.php
│   └── acnh_project.sql       # Script de creación de la base de datos
└── acnh_web/                  # Frontend Angular
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── app/
    │   │   ├── app.component.*
    │   │   ├── app.routes.ts
    │   │   ├── app.config.ts
    │   │   ├── components/
    │   │   │   ├── bugs/
    │   │   │   ├── fish/
    │   │   │   ├── footer/
    │   │   │   ├── header/
    │   │   │   ├── home/
    │   │   │   ├── login/
    │   │   │   ├── perfil-usuario/
    │   │   │   ├── sea-creatures/
    │   │   │   └── villagers/
    │   │   └── services/
    │   │       ├── auth.service.ts
    │   │       ├── nookipedia.service.ts
    │   │       ├── theme.service.ts
    │   │       └── translation.service.ts
    │   ├── assets/
    │   ├── styles.css
    │   ├── main.ts
    │   └── index.html
```

---

## Backend actual

### Qué hace

El backend ofrece un API REST para:

- Autenticación de usuarios
- Registro y actualización de usuarios
- Gestión de favoritos de aldeanos
- Gestión de favoritos de coleccionables
- Proxy hacia la API de Nookipedia

### Configuración inicial

1. Copia `acnh_project/acnh_project.sql` en tu servidor MySQL.
2. Crea la base de datos `acnh_project`.
3. Ajusta credenciales en `acnh_project/libs/setup.php` si tu configuración local difiere.
4. Asegúrate de que Apache sirve `acnh_project` en `http://localhost/ACNH_TFG/acnh_project/`.

### Controladores disponibles

- `UsuarioController.php`
  - `login` → autentica usuario
  - `crear` → registra nuevo usuario
  - `ver` → devuelve usuario por `id`
  - `actualizar` → actualiza `username`, `email`, `img_perfil`, `nombre_isla`, `color_tema` y `password`
- `AldeanosUsuarioController.php`
  - Administra favoritos de aldeanos del usuario
- `ColeccionablesUsuarioController.php`
  - Administra favoritos de coleccionables del usuario
- `NookipediaController.php`
  - Actúa como proxy para obtener aldeanos, coleccionables y eventos de la API de Nookipedia

### Campos importantes en la base de datos `USUARIO`

- `username` (VARCHAR 50)
- `email` (VARCHAR 100)
- `password` (VARCHAR 255)
- `img_perfil` (VARCHAR 100)
- `nombre_isla` (VARCHAR 100)
- `color_tema` (VARCHAR 7)
- `activo` (BOOLEAN)

### Endpoints de uso principal

- `POST index.php?controlador=Usuario&accion=login`
- `POST index.php?controlador=Usuario&accion=crear`
- `GET  index.php?controlador=Usuario&accion=ver&id={id}`
- `POST index.php?controlador=Usuario&accion=actualizar&id={id}`
- `GET  index.php?controlador=AldeanosUsuario&accion=listarPorUsuario&id_usuario={id}`
- `POST index.php?controlador=AldeanosUsuario&accion=crear`
- `GET  index.php?controlador=ColeccionablesUsuario&accion=listarPorUsuario&id_usuario={id}`
- `POST index.php?controlador=ColeccionablesUsuario&accion=crear`
- `GET  index.php?controlador=Nookipedia&accion=listarAldeanos&search={nombre}`
- `GET  index.php?controlador=Nookipedia&accion=listarColeccionables&type={bugs|fish|sea}&name={nombre}`

### CORS y seguridad

- CORS configurado para aceptar `http://localhost:4200`.
- El token de Nookipedia se almacena en `acnh_project/libs/setup.php`.
- El frontend no tiene acceso directo al token.

---

## Frontend actual

### Qué muestra

- Página de inicio (`/home`)
- Lista de aldeanos (`/villagers`)
- Lista de bichos (`/bugs`)
- Lista de peces (`/fishes`)
- Lista de criaturas marinas (`/seacreatures`)
- Login y registro (`/login`)
- Perfil de usuario (`/perfil-usuario`)

### Servicios principales

- `auth.service.ts`: maneja login, logout, almacenamiento de usuario y token en `sessionStorage`.
- `nookipedia.service.ts`: obtención de datos desde el backend/proxy.
- `translation.service.ts`: traducción de texto, signos zodiacales y mapeo de iconos.
- `theme.service.ts`: control de temas claro/oscuro.

### Componentes clave

- `header`: navegación y logo.
- `footer`: pie de página.
- `login`: formulario de acceso y registro.
- `villagers`: listado de aldeanos con filtro, paginación y favoritos.
- `perfil-usuario`: edición de datos de usuario e imagen de perfil.

### Rutas Angular

- `/home`
- `/villagers`
- `/bugs`
- `/fishes`
- `/seacreatures`
- `/login`
- `/perfil-usuario`

### Active actualmente

- El logo claro y oscuro se cargan desde `src/assets`.
- Los iconos zodiacales se esperan en `src/assets/*.png`.
- El login consume `UsuarioController.login`.
- La UI de aldeanos usa fallback de mock traducido si la API de Nookipedia no responde.

### Cómo ejecutar

```bash
cd acnh_web
npm install
npm run build
npm run serve
```

O con Angular CLI:

```bash
ng serve
```

---

## Información adicional

- El proyecto actual no incluye `AppController.php` ni `TipoColeccionableController.php` en el backend.
- El frontend y backend están diseñados para trabajar como un conjunto local en XAMPP / Angular.
- El archivo de base de datos `acnh_project.sql` contiene la tabla `USUARIO` con usuarios iniciales.

