# MbpWorkspace

Workspace Angular con:

- **Libreria**: `lib-mbp-solutions` (Sidebar + Auth)
- **App de prueba**: `testbed-app` (implementa las funcionalidades principales de la libreria)

## Estructura

- Libreria: `projects/lib-mbp-solutions/`
- App demo: `projects/testbed-app/`

## Documentacion por funcionalidad (libreria)

- Sidebar: [README](projects/lib-mbp-solutions/src/lib/sidebar/README.md)
- Auth: [README](projects/lib-mbp-solutions/src/lib/auth/README.md)

## Desarrollo

### Instalar dependencias

```bash
npm install
```

### Consumir la libreria desde otro proyecto

Opcion A: usando el build local del workspace.

```bash
ng build lib-mbp-solutions
npm install ../mbp-workspace/dist/lib-mbp-solutions
```

Opcion B: publicando en NPM (cuando aplique).

```bash
npm publish
```

### Levantar la app demo

```bash
ng serve testbed-app
```

### Build de la libreria

```bash
ng build lib-mbp-solutions
```

## Tests

```bash
ng test
```

## Requisitos

- Node.js (LTS recomendado)
- Angular ^21
