# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

## Configuración de la API

El código utiliza dos variables de entorno para determinar cómo realizar las peticiones:

- `NEXT_PUBLIC_API_BASE_URL`: URL base del backend (por ejemplo `http://localhost:8080`).
- `NEXT_PUBLIC_API_MODE`: modo de la API, puede ser `production` o `mock`.

En desarrollo puedes crear un archivo `.env.local` con las siguientes opciones:

```env
# Utiliza el backend real
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_MODE=production

# O utiliza los datos simulados sin backend
# NEXT_PUBLIC_API_MODE=mock
```

Si estas variables no están definidas y el backend no está disponible, verás mensajes de error como `API call failed: {}` al iniciar la aplicación.
