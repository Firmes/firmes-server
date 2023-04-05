# Firmes

## Backend

El back del proyecto es una REST API que permite CRUDs para proyectos, usuarios y autenticación

Para la base de datos se utiliza PostgreSQL.

## Iteración #1 Instalación de paqueterías

```bash
  npm i
```

No olvides configurar tu `.env` según el `.env.example`

## Las rutas son:

### Rutas de autenticación:


|   Route   | HTTP Verb |   Description   |
|-----------|-----------|-----------------|
| `/auth/login` |    POST    | Loggea al usuario|
| `/auth/signup` |    POST    | Crea nuevos usuarios administradores|

### Rutas de proyecto:

|   Route   | HTTP Verb |   Description   |
|-----------|-----------|-----------------|
| `/project/get-all-projects` |    GET    | Obtiene una lista de todos los proyectos actuales 
| `/project/get-single-project/:projectId` |    GET    | Obtiene información detallada sobre un proyecto específico.
| `/project/create-new-project` |    POST    | Crea un nuevo proyecto  
| `/project/edit-project/:projectId` | PUT | Edita la información de un proyecto específico. 
| `/project/delete-project/:projectId` | DELETE | Elimina un proyecto específico.
| `/project/upload-image` | POST | Guarda una imagen en cloudinary y retorna url

### Rutas de contactos:

|   Route   | HTTP Verb |   Description   |
|-----------|-----------|-----------------|
| `/contact/save-contact-hubspot` |    POST    | Guarda la información del cliente en hubspot|