# API REST - Consultorio Psicológico

API REST completa para la gestión de pacientes, psicólogos, consultorios, citas e historial clínico de un consultorio psicológico. Está desarrollada con **Node.js**, **Express**, **MySQL** y el patrón de arquitectura **MVC (Modelo - Vista - Controlador)**.

Toda la estructura del proyecto, los nombres de archivos, las variables, los comentarios y los mensajes de respuesta están en español.

> En una API REST la "vista" es la respuesta JSON que consume el cliente. Por ello no existen plantillas HTML: los modelos contienen el acceso a datos, los controladores contienen la lógica de negocio y las rutas exponen los endpoints.

---

## Tabla de contenido

1. [Características](#características)
2. [Tecnologías y dependencias](#tecnologías-y-dependencias)
3. [Arquitectura del proyecto](#arquitectura-del-proyecto)
4. [Requisitos previos](#requisitos-previos)
5. [Instalación](#instalación)
6. [Configuración de MySQL en Railway](#configuración-de-mysql-en-railway)
7. [Variables de entorno](#variables-de-entorno)
8. [Base de datos](#base-de-datos)
9. [Ejecución del servidor](#ejecución-del-servidor)
10. [Formato de las respuestas](#formato-de-las-respuestas)
11. [Códigos de estado HTTP](#códigos-de-estado-http)
12. [Resumen de endpoints](#resumen-de-endpoints)
13. [Detalle de los endpoints](#detalle-de-los-endpoints)
14. [Ejemplos con cURL](#ejemplos-con-curl)
15. [Reglas de negocio y validaciones](#reglas-de-negocio-y-validaciones)
16. [Solución de problemas](#solución-de-problemas)
17. [Despliegue en producción](#despliegue-en-producción)

---

## Características

- CRUD completo (listar, obtener, crear, actualizar y eliminar) para pacientes, psicólogos, consultorios, citas e historial clínico.
- Arquitectura MVC estricta con separación de responsabilidades.
- Consultas SQL parametrizadas para prevenir inyecciones SQL.
- Validación de datos en la capa de controladores.
- Verificación de llaves foráneas y relaciones entre entidades.
- Control de conflictos de horario al registrar o actualizar citas.
- Modalidad de atención por cita: `Presencial`, `Virtual` o `Híbrida`.
- Registro del enfoque terapéutico de cada psicólogo.
- Restricción de un único registro de historial clínico por cita.
- Respuestas JSON uniformes con códigos HTTP apropiados.
- Manejo centralizado de errores, incluidos errores de MySQL.
- Conexión mediante un grupo de conexiones (`pool`) de `mysql2/promise`.
- Compatibilidad con variables de entorno `DB_*`, variables `MYSQL*` de Railway y URL de conexión.
- CORS configurable mediante variables de entorno.
- Endpoint de salud para verificar el servicio y la base de datos.
- Cierre ordenado del servidor y del grupo de conexiones.

---

## Tecnologías y dependencias

| Dependencia | Versión | Tipo | Uso |
| --- | --- | --- | --- |
| Node.js | >= 18 | Entorno | Ejecución del servidor |
| Express | ^4.21.2 | Producción | Framework HTTP y enrutamiento |
| MySQL | 8.x | Base de datos | Persistencia de la información |
| mysql2 | ^3.14.0 | Producción | Driver MySQL con soporte de promesas y pool |
| dotenv | ^16.4.7 | Producción | Lectura de variables desde `.env` |
| cors | ^2.8.5 | Producción | Control de acceso HTTP entre orígenes |
| nodemon | ^3.1.9 | Desarrollo | Reinicio automático del servidor |

Las dependencias se declaran en `package.json` y se instalan con `npm install`.

---

## Arquitectura del proyecto

```text
consultorio/
├── src/
│   ├── configuracion/
│   │   └── conexion.js                  # Pool de conexiones a MySQL
│   ├── modelos/
│   │   ├── pacienteModelo.js            # Consultas de pacientes
│   │   ├── psicologoModelo.js           # Consultas de psicólogos
│   │   ├── consultorioModelo.js         # Consultas de consultorios
│   │   ├── citaModelo.js                # Consultas de citas y relaciones
│   │   └── historialModelo.js           # Consultas del historial clínico
│   ├── controladores/
│   │   ├── pacienteControlador.js
│   │   ├── psicologoControlador.js
│   │   ├── consultorioControlador.js
│   │   ├── citaControlador.js
│   │   └── historialControlador.js
│   ├── rutas/
│   │   ├── pacienteRutas.js
│   │   ├── psicologoRutas.js
│   │   ├── consultorioRutas.js
│   │   ├── citaRutas.js
│   │   └── historialRutas.js
│   ├── utilidades/
│   │   ├── validaciones.js              # Funciones de validación reutilizables
│   │   └── respuestas.js                # Respuestas y manejo de errores
│   └── index.js                         # Configuración de Express y servidor
├── base_de_datos.sql                    # Creación de la base y las tablas
├── migracion_consultorio_psicologico.sql # Migración desde la estructura anterior
├── .env                                 # Variables locales (no se versiona)
├── .env.example                         # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### Responsabilidades de cada capa

- **Modelo (`src/modelos`)**: contiene exclusivamente el acceso a la base de datos mediante consultas parametrizadas. No conoce los objetos `req` ni `res` de Express.
- **Controlador (`src/controladores`)**: recibe la solicitud, valida y normaliza los datos, aplica las reglas de negocio, llama a los modelos y devuelve la respuesta JSON con el código HTTP adecuado.
- **Rutas (`src/rutas`)**: define los endpoints REST y los asocia con las funciones del controlador mediante `express.Router()`.
- **Configuración (`src/configuracion`)**: centraliza la conexión a MySQL y la lectura de variables de entorno.
- **Utilidades (`src/utilidades`)**: agrupa funciones reutilizables de validación y construcción de respuestas.

---

## Requisitos previos

- Node.js 18 o superior.
- npm 9 o superior.
- Una instancia de MySQL 8.x local o en Railway.
- Git (opcional, para clonar el repositorio).
- Un cliente HTTP como Postman, Insomnia, Thunder Client o cURL.

---

## Instalación

1. Clona el repositorio o ubícate en la carpeta del proyecto:

   ```bash
   cd consultorio
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea el archivo de variables de entorno a partir de la plantilla:

   ```bash
   # En Linux o macOS
   cp .env.example .env

   # En Windows (PowerShell)
   Copy-Item .env.example .env
   ```

4. Edita `.env` con las credenciales reales de MySQL. En este proyecto ya existe un archivo `.env` con valores de ejemplo que **debes reemplazar**.

5. Crea las tablas ejecutando el script `base_de_datos.sql` en tu instancia de MySQL.

   **MySQL local en Linux, macOS o CMD:**

   ```bash
   mysql -u root -p < base_de_datos.sql
   ```

   **MySQL local en PowerShell:**

   ```powershell
   mysql -u root -p -e "source base_de_datos.sql"
   ```

   **Railway:** abre el servicio de MySQL, entra en la pestaña **Query** y pega el contenido de `base_de_datos.sql`.

   > **Importante:** el script completo crea la base de datos `consultorio_psicologico`. Si lo ejecutas de esa forma, configura `DB_NAME=consultorio_psicologico` en `.env`. Si prefieres usar la base de datos que Railway crea por defecto (normalmente `railway`), ejecuta únicamente las sentencias `CREATE TABLE` del script, sin las instrucciones `CREATE DATABASE` y `USE`, y configura `DB_NAME=railway`.

6. Si ya tienes una base de datos con la estructura anterior (tabla `medicos`), ejecuta `migracion_consultorio_psicologico.sql` en lugar del script completo. La migración renombra la tabla y las columnas, agrega los campos nuevos y **no elimina información**.

7. Inicia el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

   O en modo normal:

   ```bash
   npm start
   ```

8. Verifica el servicio:

   ```bash
   curl http://localhost:3000/api/salud
   ```

---

## Configuración de MySQL en Railway

1. Crea un proyecto en [Railway](https://railway.app/).
2. Agrega un nuevo servicio seleccionando **MySQL** desde la plantilla de bases de datos.
3. Abre el servicio de MySQL y revisa la pestaña **Variables** o **Connect**. Railway proporciona variables como:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
   - `MYSQL_URL`
4. Copia esos valores en tu archivo `.env` usando las variables `DB_*`:

   ```env
   DB_HOST=monorail.proxy.rlwy.net
   DB_PORT=12345
   DB_USER=root
   DB_PASSWORD=contraseña_real
   # Usa consultorio_psicologico si ejecutas el script completo.
   # Usa railway si aprovechas la base de datos existente de Railway.
   DB_NAME=consultorio_psicologico
   DB_SSL=false
   ```

5. Si vas a conectarte desde tu computadora local, tienes dos alternativas:

   **Opción A: túnel SSH con la CLI de Railway (recomendada).** Abre el túnel en una terminal y déjalo activo:

   ```bash
   railway link
   railway connect MySQL --tunnel-only --port 13306
   ```

   El comando imprime las credenciales y el puerto local. Configura `.env` así:

   ```env
   DB_HOST=127.0.0.1
   DB_PORT=13306
   DB_USER=root
   DB_PASSWORD=contraseña_impresa_por_el_túnel
   DB_NAME=railway
   DB_SSL=false
   ```

   El túnel se cierra con `Ctrl+C`; mientras esté cerrado, la API no podrá conectarse a MySQL.

   **Opción B: TCP Proxy.** Habilita el **TCP Proxy** del servicio MySQL en **Settings > Networking** y utiliza el host y puerto públicos que aparecen en **Connect**. El host interno `*.railway.internal` solo funciona entre servicios dentro de Railway.

6. Ejecuta `base_de_datos.sql` desde la pestaña **Query** del servicio MySQL o mediante un cliente externo. Si ejecutas el script completo, usa `DB_NAME=consultorio_psicologico`; si utilizas la base de datos existente de Railway, usa `DB_NAME=railway` y ejecuta solo las sentencias `CREATE TABLE`. Para una base existente con la estructura anterior, ejecuta `migracion_consultorio_psicologico.sql`.
7. Si el proveedor requiere conexión cifrada, configura `DB_SSL=true`.

### Prioridad de configuración

La conexión se construye en este orden:

1. Variables `DB_*`.
2. Variables `MYSQL*` de Railway (`MYSQLHOST`, `MYSQLPORT`, etc.).
3. URL completa en `MYSQL_URL` o `DATABASE_URL`.
4. Configuración local predeterminada (`localhost`, usuario `root`, base de datos `consultorio_psicologico`).

---

## Variables de entorno

| Variable | Obligatoria | Valor por defecto | Descripción |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | Puerto en el que escucha el servidor |
| `NODE_ENV` | No | `development` | Entorno de ejecución (`development` o `production`) |
| `CORS_ORIGIN` | No | `*` | Orígenes permitidos, separados por comas. Usa `*` para todos |
| `DB_HOST` | Sí | `localhost` | Host de MySQL |
| `DB_PORT` | No | `3306` | Puerto de MySQL |
| `DB_USER` | Sí | `root` | Usuario de MySQL |
| `DB_PASSWORD` | Sí | Vacío | Contraseña de MySQL |
| `DB_NAME` | Sí | `consultorio_psicologico` | Nombre de la base de datos |
| `DB_SSL` | No | `false` | Activa SSL/TLS (`true` o `false`) |
| `DB_CONNECTION_LIMIT` | No | `10` | Máximo de conexiones simultáneas del pool |
| `DB_CONNECT_TIMEOUT` | No | `10000` | Tiempo máximo de espera para conectar, en milisegundos |
| `MYSQLHOST` | No | — | Alternativa Railway para el host |
| `MYSQLPORT` | No | — | Alternativa Railway para el puerto |
| `MYSQLUSER` | No | — | Alternativa Railway para el usuario |
| `MYSQLPASSWORD` | No | — | Alternativa Railway para la contraseña |
| `MYSQLDATABASE` | No | — | Alternativa Railway para la base de datos |
| `MYSQL_URL` / `DATABASE_URL` | No | — | URL completa de conexión (`mysql://usuario:contraseña@host:puerto/base`) |

> **Importante:** el archivo `.env` contiene credenciales y está incluido en `.gitignore`. Nunca lo subas a un repositorio público. Usa `.env.example` como plantilla.

---

## Base de datos

El script `base_de_datos.sql` crea las siguientes tablas:

### `consultorios`

| Campo | Tipo | Restricción |
| --- | --- | --- |
| `id_consultorio` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | NOT NULL, UNIQUE |
| `ubicacion` | VARCHAR(255) | NOT NULL |
| `telefono` | VARCHAR(20) | NULL |
| `estado` | ENUM | `Disponible`, `Ocupado`, `Inactivo` |
| `fecha_registro` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### `pacientes`

| Campo | Tipo | Restricción |
| --- | --- | --- |
| `id_paciente` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | NOT NULL |
| `apellido` | VARCHAR(100) | NOT NULL |
| `fecha_nacimiento` | DATE | NOT NULL |
| `sexo` | ENUM | `Masculino`, `Femenino`, `Otro` |
| `telefono` | VARCHAR(20) | NULL |
| `correo` | VARCHAR(120) | NULL |
| `direccion` | VARCHAR(255) | NULL |
| `antecedentes` | TEXT | NULL (antecedentes psicológicos) |
| `fecha_registro` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### `psicologos`

| Campo | Tipo | Restricción |
| --- | --- | --- |
| `id_psicologo` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | NOT NULL |
| `apellido` | VARCHAR(100) | NOT NULL |
| `especialidad` | VARCHAR(100) | NOT NULL |
| `cedula_profesional` | VARCHAR(50) | NOT NULL, UNIQUE |
| `telefono` | VARCHAR(20) | NULL |
| `correo` | VARCHAR(120) | NOT NULL, UNIQUE |
| `enfoque_terapeutico` | VARCHAR(100) | NULL |
| `id_consultorio` | INT UNSIGNED | FK → `consultorios`, NULL |
| `fecha_registro` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### `citas`

| Campo | Tipo | Restricción |
| --- | --- | --- |
| `id_cita` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `id_paciente` | INT UNSIGNED | FK → `pacientes`, NOT NULL |
| `id_psicologo` | INT UNSIGNED | FK → `psicologos`, NOT NULL |
| `id_consultorio` | INT UNSIGNED | FK → `consultorios`, NOT NULL |
| `fecha_cita` | DATE | NOT NULL |
| `hora_cita` | TIME | NOT NULL |
| `modalidad` | ENUM | `Presencial`, `Virtual`, `Híbrida` |
| `motivo` | VARCHAR(255) | NULL (motivo de consulta) |
| `estado` | ENUM | `Programada`, `Confirmada`, `Atendida`, `Cancelada` |
| `fecha_registro` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### `historial_clinico`

| Campo | Tipo | Restricción |
| --- | --- | --- |
| `id_historial` | INT UNSIGNED | PK, AUTO_INCREMENT |
| `id_cita` | INT UNSIGNED | FK → `citas`, NOT NULL, UNIQUE |
| `diagnostico` | TEXT | NOT NULL (diagnóstico psicológico) |
| `tratamiento` | TEXT | NULL (plan de tratamiento psicológico) |
| `notas` | TEXT | NULL |
| `fecha_registro` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### Relaciones

- Un **consultorio** puede tener varios **psicólogos** (`psicologos.id_consultorio`).
- Un **paciente** puede tener varias **citas** (`citas.id_paciente`).
- Un **psicólogo** puede tener varias **citas** (`citas.id_psicologo`).
- Un **consultorio** puede tener varias **citas** (`citas.id_consultorio`).
- Una **cita** puede tener un único **registro de historial clínico** (`historial_clinico.id_cita`, UNIQUE).
- Las eliminaciones con información relacionada están restringidas (`ON DELETE RESTRICT`) para proteger la integridad de los datos clínicos. Un consultorio con psicólogos o citas asociadas no puede eliminarse.

---

## Ejecución del servidor

```bash
# Desarrollo, con reinicio automático
npm run dev

# Producción
npm start

# Verificación de sintaxis del archivo principal
npm run verificar
```

Salida esperada al iniciar:

```text
Conexión a MySQL establecida correctamente en monorail.proxy.rlwy.net:12345/consultorio_psicologico.
Servidor escuchando en http://localhost:3000
Entorno: development
Endpoint de salud: http://localhost:3000/api/salud
```

Si la base de datos no está disponible, el servidor se inicia igualmente y muestra una advertencia. Esto permite consultar `/api/salud` y diagnosticar el problema sin que el proceso termine.

---

## Formato de las respuestas

### Respuesta exitosa

```json
{
  "exito": true,
  "mensaje": "Paciente encontrado.",
  "datos": {
    "id_paciente": 1,
    "nombre": "Ana",
    "apellido": "Martínez"
  }
}
```

### Respuesta de listado

```json
{
  "exito": true,
  "mensaje": "Pacientes obtenidos correctamente.",
  "total": 1,
  "datos": []
}
```

### Error de validación

```json
{
  "exito": false,
  "mensaje": "Los datos enviados no son válidos.",
  "errores": [
    "El nombre es obligatorio.",
    "La fecha de nacimiento es obligatoria y debe tener un formato válido AAAA-MM-DD."
  ]
}
```

### Error de recurso no encontrado

```json
{
  "exito": false,
  "mensaje": "Paciente no encontrado."
}
```

### Error interno

En desarrollo se incluye el campo `detalle` con información técnica. En producción no se expone.

```json
{
  "exito": false,
  "mensaje": "Error al obtener los pacientes.",
  "detalle": "connect ECONNREFUSED 127.0.0.1:3306"
}
```

---

## Códigos de estado HTTP

| Código | Uso en la API |
| --- | --- |
| `200 OK` | Consultas, actualizaciones y eliminaciones exitosas |
| `201 Created` | Creación exitosa de un recurso |
| `400 Bad Request` | Datos inválidos, conflictos de horario, referencias inexistentes o eliminación restringida por relaciones |
| `404 Not Found` | Recurso o ruta inexistente |
| `500 Internal Server Error` | Error inesperado del servidor o de la conexión a la base de datos |

---

## Resumen de endpoints

### Generales

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/` | Información general de la API |
| GET | `/api/salud` | Estado del servicio y de la base de datos |

### Pacientes

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/pacientes` | Lista todos los pacientes |
| GET | `/api/pacientes/:id` | Obtiene un paciente por su identificador |
| POST | `/api/pacientes` | Crea un paciente |
| PUT | `/api/pacientes/:id` | Actualiza un paciente |
| DELETE | `/api/pacientes/:id` | Elimina un paciente |

### Psicólogos

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/psicologos` | Lista todos los psicólogos |
| GET | `/api/psicologos/:id` | Obtiene un psicólogo por su identificador |
| POST | `/api/psicologos` | Crea un psicólogo |
| PUT | `/api/psicologos/:id` | Actualiza un psicólogo |
| DELETE | `/api/psicologos/:id` | Elimina un psicólogo |

### Consultorios

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/consultorios` | Lista todos los consultorios |
| GET | `/api/consultorios/:id` | Obtiene un consultorio por su identificador |
| POST | `/api/consultorios` | Crea un consultorio |
| PUT | `/api/consultorios/:id` | Actualiza un consultorio |
| DELETE | `/api/consultorios/:id` | Elimina un consultorio |

### Citas

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/citas` | Lista todas las citas |
| GET | `/api/citas/:id` | Obtiene una cita por su identificador |
| GET | `/api/citas/paciente/:idPaciente` | Lista las citas de un paciente |
| GET | `/api/citas/psicologo/:idPsicologo` | Lista las citas de un psicólogo |
| POST | `/api/citas` | Crea una cita |
| PUT | `/api/citas/:id` | Actualiza una cita |
| DELETE | `/api/citas/:id` | Elimina una cita |

### Historial clínico

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/historial` | Lista todos los registros del historial |
| GET | `/api/historial/:id` | Obtiene un registro por su identificador |
| GET | `/api/historial/cita/:idCita` | Obtiene el historial de una cita |
| POST | `/api/historial` | Crea un registro clínico |
| PUT | `/api/historial/:id` | Actualiza un registro clínico |
| DELETE | `/api/historial/:id` | Elimina un registro clínico |

---

## Detalle de los endpoints

### 1. Generales

#### `GET /`

Devuelve información básica de la API.

**Respuesta `200`:**

```json
{
  "exito": true,
  "mensaje": "API REST del Consultorio Psicológico.",
  "version": "2.0.0",
  "documentacion": "Consulta el archivo README.md para ver todos los endpoints.",
  "estado": "Servicio activo."
}
```

#### `GET /api/salud`

Verifica el estado del servicio y de la conexión a MySQL.

**Respuesta `200`:**

```json
{
  "exito": true,
  "mensaje": "Servicio activo.",
  "datos": {
    "servicio": "API Consultorio Psicológico",
    "estado": "activo",
    "baseDatos": "conectada",
    "fecha": "2026-11-06T14:30:00.000Z"
  }
}
```

Si no hay conexión a la base de datos, `baseDatos` será `"desconectada"`, pero el endpoint seguirá respondiendo `200` para permitir el diagnóstico.

---

### 2. Pacientes

#### `GET /api/pacientes`

Lista todos los pacientes ordenados por apellido y nombre.

**Respuesta `200`:**

```json
{
  "exito": true,
  "mensaje": "Pacientes obtenidos correctamente.",
  "total": 1,
  "datos": [
    {
      "id_paciente": 1,
      "nombre": "Ana",
      "apellido": "Martínez",
      "fecha_nacimiento": "1990-04-15",
      "sexo": "Femenino",
      "telefono": "+52 555 123 4567",
      "correo": "ana.martinez@correo.com",
      "direccion": "Av. Reforma 123",
      "antecedentes": "Antecedentes de ansiedad en la adolescencia.",
      "fecha_registro": "2026-11-06 09:00:00"
    }
  ]
}
```

#### `GET /api/pacientes/:id`

Obtiene un paciente por su identificador.

- `200`: paciente encontrado.
- `400`: identificador inválido.
- `404`: paciente no encontrado.

#### `POST /api/pacientes`

Crea un paciente.

**Cuerpo de la solicitud:**

```json
{
  "nombre": "Ana",
  "apellido": "Martínez",
  "fecha_nacimiento": "1990-04-15",
  "sexo": "Femenino",
  "telefono": "+52 555 123 4567",
  "correo": "ana.martinez@correo.com",
  "direccion": "Av. Reforma 123",
  "antecedentes": "Antecedentes de ansiedad en la adolescencia."
}
```

**Campos:**

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `nombre` | Sí | Máximo 100 caracteres |
| `apellido` | Sí | Máximo 100 caracteres |
| `fecha_nacimiento` | Sí | Formato `AAAA-MM-DD`, no puede ser futura |
| `sexo` | Sí | `Masculino`, `Femenino` u `Otro` |
| `telefono` | No | Entre 7 y 20 caracteres |
| `correo` | No | Formato de correo válido, máximo 120 caracteres |
| `direccion` | No | Máximo 255 caracteres |
| `antecedentes` | No | Texto libre |

**Respuesta `201`:** devuelve el paciente creado con `"exito": true` y el mensaje `"Paciente registrado correctamente."`.

#### `PUT /api/pacientes/:id`

Actualiza todos los datos del paciente. Se debe enviar el mismo cuerpo completo de `POST`.

- `200`: paciente actualizado.
- `400`: datos inválidos.
- `404`: paciente no encontrado.

#### `DELETE /api/pacientes/:id`

Elimina un paciente.

- `200`: paciente eliminado.
- `400`: no se puede eliminar porque tiene citas o historial asociado.
- `404`: paciente no encontrado.

---

### 3. Psicólogos

#### `GET /api/psicologos`

Lista todos los psicólogos e incluye el nombre y la ubicación de su consultorio cuando está asignado.

#### `GET /api/psicologos/:id`

Obtiene un psicólogo por su identificador.

#### `POST /api/psicologos`

**Cuerpo de la solicitud:**

```json
{
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "especialidad": "Psicología Clínica",
  "cedula_profesional": "12345678",
  "telefono": "+52 555 987 6543",
  "correo": "carlos.ramirez@consultorio.com",
  "enfoque_terapeutico": "Terapia cognitivo-conductual",
  "id_consultorio": 1
}
```

**Campos:**

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `nombre` | Sí | Máximo 100 caracteres |
| `apellido` | Sí | Máximo 100 caracteres |
| `especialidad` | Sí | Máximo 100 caracteres (por ejemplo, `Psicología Clínica`) |
| `cedula_profesional` | Sí | Máximo 50 caracteres, único |
| `telefono` | No | Entre 7 y 20 caracteres |
| `correo` | Sí | Formato válido, máximo 120 caracteres, único |
| `enfoque_terapeutico` | No | Máximo 100 caracteres |
| `id_consultorio` | No | Identificador de un consultorio existente |

**Respuesta `201`:**

```json
{
  "exito": true,
  "mensaje": "Psicólogo registrado correctamente.",
  "datos": {
    "id_psicologo": 1,
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "especialidad": "Psicología Clínica",
    "cedula_profesional": "12345678",
    "telefono": "+52 555 987 6543",
    "correo": "carlos.ramirez@consultorio.com",
    "enfoque_terapeutico": "Terapia cognitivo-conductual",
    "id_consultorio": 1,
    "consultorio": "Consultorio 1",
    "ubicacion_consultorio": "Planta baja, ala norte",
    "fecha_registro": "2026-11-06 09:10:00"
  }
}
```

#### `PUT /api/psicologos/:id`

Actualiza todos los datos del psicólogo. Se debe enviar el cuerpo completo de `POST`.

- `200`: psicólogo actualizado.
- `400`: datos inválidos, cédula o correo duplicados, consultorio inexistente.
- `404`: psicólogo no encontrado.

#### `DELETE /api/psicologos/:id`

- `200`: psicólogo eliminado.
- `400`: no se puede eliminar porque tiene citas asociadas.
- `404`: psicólogo no encontrado.

---

### 4. Consultorios

#### `GET /api/consultorios`

Lista todos los consultorios e incluye el total de psicólogos asignados.

**Respuesta `200`:**

```json
{
  "exito": true,
  "mensaje": "Consultorios obtenidos correctamente.",
  "total": 1,
  "datos": [
    {
      "id_consultorio": 1,
      "nombre": "Consultorio 1",
      "ubicacion": "Planta baja, ala norte",
      "telefono": "+52 555 111 2222",
      "estado": "Disponible",
      "fecha_registro": "2026-11-06 08:00:00",
      "total_psicologos": 1
    }
  ]
}
```

#### `GET /api/consultorios/:id`

Obtiene un consultorio por su identificador.

#### `POST /api/consultorios`

**Cuerpo de la solicitud:**

```json
{
  "nombre": "Consultorio 1",
  "ubicacion": "Planta baja, ala norte",
  "telefono": "+52 555 111 2222",
  "estado": "Disponible"
}
```

**Campos:**

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `nombre` | Sí | Máximo 100 caracteres, único |
| `ubicacion` | Sí | Máximo 255 caracteres |
| `telefono` | No | Entre 7 y 20 caracteres |
| `estado` | No | `Disponible` (predeterminado), `Ocupado` o `Inactivo` |

**Respuesta `201`:** devuelve el consultorio creado con `"exito": true` y el mensaje `"Consultorio registrado correctamente."`.

#### `PUT /api/consultorios/:id`

Actualiza todos los datos del consultorio. Se debe enviar el cuerpo completo de `POST`.

- `200`: consultorio actualizado.
- `400`: datos inválidos o nombre duplicado.
- `404`: consultorio no encontrado.

#### `DELETE /api/consultorios/:id`

- `200`: consultorio eliminado.
- `400`: no se puede eliminar porque tiene psicólogos o citas asociadas.
- `404`: consultorio no encontrado.

---

### 5. Citas

#### `GET /api/citas`

Lista todas las citas con los datos del paciente, del psicólogo y del consultorio.

**Respuesta `200`:**

```json
{
  "exito": true,
  "mensaje": "Citas obtenidas correctamente.",
  "total": 1,
  "datos": [
    {
      "id_cita": 1,
      "id_paciente": 1,
      "paciente": "Ana Martínez",
      "id_psicologo": 1,
      "psicologo": "Carlos Ramírez",
      "especialidad": "Psicología Clínica",
      "enfoque_terapeutico": "Terapia cognitivo-conductual",
      "id_consultorio": 1,
      "consultorio": "Consultorio 1",
      "fecha_cita": "2026-11-10",
      "hora_cita": "10:00:00",
      "modalidad": "Presencial",
      "motivo": "Primera consulta",
      "estado": "Programada",
      "fecha_registro": "2026-11-06 09:30:00"
    }
  ]
}
```

#### `GET /api/citas/:id`

Obtiene una cita por su identificador.

#### `GET /api/citas/paciente/:idPaciente`

Lista las citas de un paciente. Devuelve `404` si el paciente no existe.

#### `GET /api/citas/psicologo/:idPsicologo`

Lista las citas de un psicólogo. Devuelve `404` si el psicólogo no existe.

#### `POST /api/citas`

**Cuerpo de la solicitud:**

```json
{
  "id_paciente": 1,
  "id_psicologo": 1,
  "id_consultorio": 1,
  "fecha_cita": "2026-11-10",
  "hora_cita": "10:00",
  "modalidad": "Presencial",
  "motivo": "Primera consulta",
  "estado": "Programada"
}
```

**Campos:**

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `id_paciente` | Sí | Paciente existente |
| `id_psicologo` | Sí | Psicólogo existente |
| `id_consultorio` | Sí | Consultorio existente |
| `fecha_cita` | Sí | Formato `AAAA-MM-DD` |
| `hora_cita` | Sí | Formato `HH:MM` o `HH:MM:SS` |
| `modalidad` | No | `Presencial` (predeterminado), `Virtual` o `Híbrida` |
| `motivo` | No | Máximo 255 caracteres |
| `estado` | No | `Programada` (predeterminado), `Confirmada`, `Atendida` o `Cancelada` |

**Respuesta `201`:** devuelve la cita creada con los nombres del paciente, psicólogo y consultorio.

**Errores frecuentes:**

- `400`: paciente, psicólogo o consultorio inexistente.
- `400`: ya existe una cita activa para el psicólogo o el paciente en la misma fecha y hora.
- `400`: formato de fecha, hora o modalidad inválido.

#### `PUT /api/citas/:id`

Actualiza todos los datos de la cita. Se debe enviar el cuerpo completo de `POST`.

- `200`: cita actualizada.
- `400`: datos inválidos, referencias inexistentes o conflicto de horario.
- `404`: cita no encontrada.

> Las citas con estado `Cancelada` no se consideran en la validación de conflictos, por lo que su horario puede reutilizarse.

#### `DELETE /api/citas/:id`

- `200`: cita eliminada.
- `400`: no se puede eliminar porque tiene un registro de historial clínico asociado.
- `404`: cita no encontrada.

---

### 6. Historial clínico

#### `GET /api/historial`

Lista todos los registros del historial clínico psicológico con los datos de la cita, el paciente y el psicólogo.

**Respuesta `200`:**

```json
{
  "exito": true,
  "mensaje": "Historial clínico psicológico obtenido correctamente.",
  "total": 1,
  "datos": [
    {
      "id_historial": 1,
      "id_cita": 1,
      "fecha_cita": "2026-11-10",
      "hora_cita": "10:00:00",
      "id_paciente": 1,
      "paciente": "Ana Martínez",
      "id_psicologo": 1,
      "psicologo": "Carlos Ramírez",
      "especialidad": "Psicología Clínica",
      "enfoque_terapeutico": "Terapia cognitivo-conductual",
      "diagnostico": "Trastorno de ansiedad generalizada",
      "tratamiento": "Terapia cognitivo-conductual y seguimiento mensual.",
      "notas": "Paciente con buena adherencia al tratamiento.",
      "fecha_registro": "2026-11-10 11:00:00"
    }
  ]
}
```

#### `GET /api/historial/:id`

Obtiene un registro del historial por su identificador.

#### `GET /api/historial/cita/:idCita`

Obtiene el registro clínico asociado a una cita.

- `200`: registro encontrado.
- `404`: la cita no existe o no tiene historial.

#### `POST /api/historial`

**Cuerpo de la solicitud:**

```json
{
  "id_cita": 1,
  "diagnostico": "Trastorno de ansiedad generalizada",
  "tratamiento": "Terapia cognitivo-conductual y seguimiento mensual.",
  "notas": "Paciente con buena adherencia al tratamiento."
}
```

**Campos:**

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `id_cita` | Sí | Cita existente y sin historial previo |
| `diagnostico` | Sí | Texto libre (diagnóstico psicológico) |
| `tratamiento` | No | Texto libre (plan de tratamiento psicológico) |
| `notas` | No | Texto libre |

**Respuesta `201`:** devuelve el registro creado con `"exito": true` y el mensaje `"Registro del historial clínico psicológico creado correctamente."`.

**Errores frecuentes:**

- `400`: la cita indicada no existe.
- `400`: la cita ya tiene un registro en el historial clínico.

#### `PUT /api/historial/:id`

Actualiza todos los datos del registro clínico. Se debe enviar el cuerpo completo de `POST`.

- `200`: registro actualizado.
- `400`: cita inexistente o ya asociada a otro registro.
- `404`: registro no encontrado.

#### `DELETE /api/historial/:id`

Elimina un registro del historial clínico.

- `200`: registro eliminado.
- `404`: registro no encontrado.

---

## Ejemplos con cURL

### Crear un consultorio

```bash
curl -X POST http://localhost:3000/api/consultorios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Consultorio 1",
    "ubicacion": "Planta baja, ala norte",
    "telefono": "+52 555 111 2222",
    "estado": "Disponible"
  }'
```

### Crear un paciente

```bash
curl -X POST http://localhost:3000/api/pacientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana",
    "apellido": "Martínez",
    "fecha_nacimiento": "1990-04-15",
    "sexo": "Femenino",
    "telefono": "+52 555 123 4567",
    "correo": "ana.martinez@correo.com",
    "direccion": "Av. Reforma 123",
    "antecedentes": "Antecedentes de ansiedad en la adolescencia."
  }'
```

### Crear un psicólogo

```bash
curl -X POST http://localhost:3000/api/psicologos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "especialidad": "Psicología Clínica",
    "cedula_profesional": "12345678",
    "telefono": "+52 555 987 6543",
    "correo": "carlos.ramirez@consultorio.com",
    "enfoque_terapeutico": "Terapia cognitivo-conductual",
    "id_consultorio": 1
  }'
```

### Crear una cita

```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Content-Type: application/json" \
  -d '{
    "id_paciente": 1,
    "id_psicologo": 1,
    "id_consultorio": 1,
    "fecha_cita": "2026-11-10",
    "hora_cita": "10:00",
    "modalidad": "Presencial",
    "motivo": "Primera consulta",
    "estado": "Programada"
  }'
```

### Crear un registro de historial

```bash
curl -X POST http://localhost:3000/api/historial \
  -H "Content-Type: application/json" \
  -d '{
    "id_cita": 1,
    "diagnostico": "Trastorno de ansiedad generalizada",
    "tratamiento": "Terapia cognitivo-conductual y seguimiento mensual.",
    "notas": "Paciente con buena adherencia al tratamiento."
  }'
```

### Consultar todas las citas de un psicólogo

```bash
curl http://localhost:3000/api/citas/psicologo/1
```

### Actualizar un psicólogo

```bash
curl -X PUT http://localhost:3000/api/psicologos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "especialidad": "Psicología Clínica",
    "cedula_profesional": "12345678",
    "telefono": "+52 555 987 6543",
    "correo": "carlos.ramirez@consultorio.com",
    "enfoque_terapeutico": "Terapia cognitivo-conductual",
    "id_consultorio": 1
  }'
```

### Eliminar una cita

```bash
curl -X DELETE http://localhost:3000/api/citas/1
```

---

## Reglas de negocio y validaciones

### Pacientes

- `nombre` y `apellido` son obligatorios y admiten hasta 100 caracteres.
- `fecha_nacimiento` es obligatoria, debe ser una fecha real y no puede ser futura.
- `sexo` solo admite `Masculino`, `Femenino` u `Otro`.
- El teléfono, si se envía, debe tener entre 7 y 20 caracteres permitidos.
- El correo, si se envía, debe tener un formato válido.
- No se puede eliminar un paciente con citas o historial asociado.

### Psicólogos

- `nombre`, `apellido`, `especialidad`, `cedula_profesional` y `correo` son obligatorios.
- La cédula profesional y el correo son únicos.
- El enfoque terapéutico es opcional y admite hasta 100 caracteres.
- El consultorio, si se indica, debe existir.
- No se puede eliminar un psicólogo con citas asociadas.

### Consultorios

- `nombre` y `ubicacion` son obligatorios.
- El nombre es único.
- `estado` solo admite `Disponible`, `Ocupado` o `Inactivo`.
- No se puede eliminar un consultorio con psicólogos o citas asociadas.

### Citas

- El paciente, el psicólogo y el consultorio deben existir.
- La fecha debe tener formato `AAAA-MM-DD`.
- La hora debe tener formato `HH:MM` o `HH:MM:SS` y se normaliza a `HH:MM:SS`.
- La modalidad solo admite `Presencial`, `Virtual` o `Híbrida`.
- El estado solo admite `Programada`, `Confirmada`, `Atendida` o `Cancelada`.
- No puede existir otra cita activa para el mismo psicólogo o paciente en la misma fecha y hora. Las citas canceladas no bloquean el horario.
- No se puede eliminar una cita que tenga historial clínico asociado.

### Historial clínico

- La cita debe existir.
- Cada cita solo puede tener un registro de historial clínico.
- El diagnóstico psicológico es obligatorio.
- El tratamiento y las notas son opcionales.

### Seguridad de las consultas

Todas las consultas de los modelos usan marcadores `?` y arreglos de parámetros con `execute()` o `query()`. Los valores enviados por el usuario nunca se concatenan directamente en el SQL.

---

## Solución de problemas

### `ECONNREFUSED` o `ENOTFOUND`

- Verifica que `DB_HOST` y `DB_PORT` sean correctos.
- Si usas Railway desde tu computadora, habilita el **TCP Proxy** y usa el host público, no el host interno `*.railway.internal`.
- Comprueba que el servicio de MySQL esté activo.

### `ER_ACCESS_DENIED_ERROR`

- Revisa `DB_USER` y `DB_PASSWORD`.
- Copia nuevamente las credenciales desde la pestaña **Connect** de Railway.

### `ER_BAD_DB_ERROR`

- Verifica que `DB_NAME` coincida con la base de datos creada.
- Ejecuta `base_de_datos.sql` en la instancia correcta.

### La tabla `psicologos` no existe

- Si tu base de datos todavía tiene la tabla `medicos`, ejecuta `migracion_consultorio_psicologico.sql`.
- Si estás creando la base desde cero, ejecuta `base_de_datos.sql` completo.

### `Cannot find module`

- Ejecuta `npm install` dentro de la raíz del proyecto.
- Verifica que estés ejecutando los comandos desde la carpeta que contiene `package.json`.

### `EADDRINUSE`

- El puerto ya está ocupado. Cambia `PORT` en `.env` o detén el proceso que lo está usando.

### El servidor inicia pero las consultas fallan

- Consulta `GET /api/salud`. Si `baseDatos` es `"desconectada"`, revisa las credenciales y la conectividad.
- Revisa los mensajes de error de la consola.

---

## Despliegue en producción

1. Configura las variables de entorno directamente en el panel de tu proveedor (por ejemplo, Render o Railway). No subas el archivo `.env` al repositorio.
2. Verifica que el comando de inicio sea:

   ```bash
   npm start
   ```

3. Asegúrate de que el puerto se tome de la variable `PORT` proporcionada por el proveedor. El código ya usa `process.env.PORT` con valor predeterminado `3000`.
4. Configura `NODE_ENV=production` para evitar que se expongan detalles técnicos en las respuestas de error.
5. Configura `CORS_ORIGIN` con el dominio del frontend autorizado. Ejemplo:

   ```env
   CORS_ORIGIN=https://mi-frontend.com,https://admin.mi-frontend.com
   ```

6. Ejecuta el script `base_de_datos.sql` en la base de datos de producción antes de iniciar la API. Si la base ya existía con el esquema anterior, ejecuta `migracion_consultorio_psicologico.sql`.
7. Verifica el despliegue consultando `GET /api/salud`.

### Redespliegue automático

Render vuelve a desplegar la aplicación automáticamente cuando se detecta un nuevo commit en la rama configurada (normalmente `main`). Después de hacer `git push origin main`, revisa el panel de Render para confirmar que el despliegue terminó correctamente y consulta `GET /api/salud`.

---

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Puedes utilizarlo y adaptarlo para fines académicos o comerciales.
