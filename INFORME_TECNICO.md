# Informe técnico — API REST del Consultorio Psicológico

**Versión de la API:** 2.0.1  
**Fecha de elaboración:** 6 de noviembre de 2026  
**Estado verificado:** producción activa, Render conectado a MySQL de Railway.  
**Última verificación:** `GET /api/salud` respondió `200` con `"baseDatos": "conectada"` a las 21:15 UTC.

---

## Índice

1. [Enlaces y repositorios](#1-enlaces-y-repositorios)
2. [Documentación de rutas y endpoints para Postman](#2-documentación-de-rutas-y-endpoints-para-postman)
3. [Datos de prueba poblados en la base de datos](#3-datos-de-prueba-poblados-en-la-base-de-datos)
4. [Integración con WordPress mediante WPGetAPI](#4-integración-con-wordpress-mediante-wpgetapi)

---

## 1. Enlaces y repositorios

### 1.1 Repositorio de GitHub

- **Repositorio:** <https://github.com/ivanavasquezr-pixel/consultorio-psiquiatrico>
- **Rama de despliegue:** `main`
- **Último commit de datos y seeder:** `19aa00e — Add: seeder de datos de prueba para las cinco entidades`

### 1.2 Despliegue en Render

- **URL base de la API:** <https://consultorio-psiquiatrico.onrender.com/api/>
- **Endpoint de salud:** <https://consultorio-psiquiatrico.onrender.com/api/salud>
- **Ruta raíz informativa:** <https://consultorio-psiquiatrico.onrender.com/>
- **Autenticación:** no requiere token ni API key.
- **Formato:** JSON (`Content-Type: application/json`).

Respuesta real de `GET /api/salud` al momento de este informe:

```json
{
  "exito": true,
  "mensaje": "Servicio activo.",
  "datos": {
    "servicio": "API Consultorio Psicológico",
    "estado": "activo",
    "baseDatos": "conectada",
    "conexion": {
      "host": "junction.proxy.rlwy.net",
      "puerto": 26123,
      "baseDatos": "railway",
      "ssl": false,
      "origenConfiguracion": "DB_*"
    },
    "fecha": "2026-11-06T21:15:55.231Z"
  }
}
```

### 1.3 Base de datos en Railway

| Dato | Valor |
|---|---|
| Proyecto | `reasonable-abundance` |
| Entorno | `production` |
| Servicio | `MySQL` (MySQL 8.4.13) |
| Región | `iad` |
| Volumen | `mysql-volume` |
| Host público (TCP Proxy) | `junction.proxy.rlwy.net` |
| Puerto público | `26123` |
| Base de datos usada por Render | `railway` |
| Base alternativa disponible | `consultorio_psicologico` |
| Usuario | `root` |
| SSL | `false` |
| Credenciales | Panel de Railway → servicio MySQL → **Variables** (`MYSQLPASSWORD`) |

> **Importante:** Render se conecta mediante el **TCP Proxy público** de Railway. El host interno `mysql.railway.internal` no es accesible desde Render. La contraseña no se incluye en este informe por seguridad; se obtiene desde las variables del servicio MySQL en Railway o desde el archivo `.env` local (no versionado).

Variables configuradas en Render:

```env
DB_HOST=junction.proxy.rlwy.net
DB_PORT=26123
DB_USER=root
DB_PASSWORD=<MYSQLPASSWORD de Railway>
DB_NAME=railway
DB_SSL=false
NODE_ENV=production
```

---

## 2. Documentación de rutas y endpoints para Postman

### 2.1 Configuración recomendada en Postman

Crea un **Environment** con estas variables:

| Variable | Valor |
|---|---|
| `base_url` | `https://consultorio-psiquiatrico.onrender.com/api` |
| `id_psicologo` | `2` |
| `id_paciente` | `2` |
| `id_consultorio` | `3` |
| `id_cita` | `2` |
| `id_historial` | `2` |

- Agrega el encabezado `Content-Type: application/json` en las solicitudes `POST` y `PUT`.
- No se requiere autenticación.
- Todas las rutas de entidades están bajo el prefijo `/api`.

### 2.2 Formato general de las respuestas

**Listado:**

```json
{
  "exito": true,
  "mensaje": "Psicólogos obtenidos correctamente.",
  "total": 3,
  "datos": []
}
```

**Recurso individual o creado:**

```json
{
  "exito": true,
  "mensaje": "Psicólogo encontrado.",
  "datos": {}
}
```

**Error de validación:**

```json
{
  "exito": false,
  "mensaje": "Los datos enviados no son válidos.",
  "errores": ["El nombre es obligatorio."]
}
```

---

### 2.3 Endpoints generales

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Información general de la API y versión. URL completa: `https://consultorio-psiquiatrico.onrender.com/` |
| `GET` | `/api/salud` | Estado del servicio y de la conexión a MySQL. Siempre responde `200`. |

**Ejemplo `GET /api/salud`:**

```http
GET https://consultorio-psiquiatrico.onrender.com/api/salud
```

---

### 2.4 Psicólogos

Prefijo: `/api/psicologos`

| Método | Ruta | Descripción | Parámetros / cuerpo |
|---|---|---|---|
| `GET` | `/api/psicologos` | Lista todos los psicólogos. | — |
| `GET` | `/api/psicologos/:id` | Obtiene un psicólogo por ID. | `id` numérico, por ejemplo `2`. |
| `POST` | `/api/psicologos` | Crea un psicólogo. | Cuerpo JSON (ver abajo). |
| `PUT` | `/api/psicologos/:id` | Actualiza completamente un psicólogo. | `id` numérico + cuerpo JSON completo. |
| `DELETE` | `/api/psicologos/:id` | Elimina un psicólogo sin citas asociadas. | `id` numérico. |

**Cuerpo para `POST` / `PUT`:**

```json
{
  "nombre": "Lucía",
  "apellido": "Fernández Ramos",
  "especialidad": "Psicología Clínica",
  "cedula_profesional": "CED-PSI-2001",
  "telefono": "+52 555 444 5566",
  "correo": "lucia.fernandez@consultorio-prueba.com",
  "enfoque_terapeutico": "Terapia de aceptación y compromiso",
  "id_consultorio": 3
}
```

**Campos:**

| Campo | Obligatorio | Regla |
|---|---|---|
| `nombre` | Sí | Máximo 100 caracteres. |
| `apellido` | Sí | Máximo 100 caracteres. |
| `especialidad` | Sí | Máximo 100 caracteres. |
| `cedula_profesional` | Sí | Máximo 50 caracteres, único. |
| `correo` | Sí | Formato válido, máximo 120 caracteres, único. |
| `telefono` | No | Entre 7 y 20 caracteres. |
| `enfoque_terapeutico` | No | Máximo 100 caracteres. |
| `id_consultorio` | No | Debe existir en `consultorios`. |

**Respuestas:** `200` listado/consulta/actualización, `201` creación, `400` validación, `404` no encontrado, `400` al eliminar si tiene citas asociadas.

---

### 2.5 Pacientes

Prefijo: `/api/pacientes`

| Método | Ruta | Descripción | Parámetros / cuerpo |
|---|---|---|---|
| `GET` | `/api/pacientes` | Lista todos los pacientes. | — |
| `GET` | `/api/pacientes/:id` | Obtiene un paciente por ID. | `id` numérico, por ejemplo `2`. |
| `POST` | `/api/pacientes` | Crea un paciente. | Cuerpo JSON (ver abajo). |
| `PUT` | `/api/pacientes/:id` | Actualiza completamente un paciente. | `id` numérico + cuerpo JSON completo. |
| `DELETE` | `/api/pacientes/:id` | Elimina un paciente sin citas asociadas. | `id` numérico. |

**Cuerpo para `POST` / `PUT`:**

```json
{
  "nombre": "Andrea",
  "apellido": "Morales Vargas",
  "documento_identidad": "MOVN920518MDFRRN02",
  "fecha_nacimiento": "1992-05-18",
  "sexo": "Femenino",
  "telefono": "+52 555 333 4455",
  "correo": "andrea.morales@correo-prueba.com",
  "direccion": "Calle Luna 22, Col. Nápoles, CDMX",
  "antecedentes": "Sin antecedentes relevantes."
}
```

**Campos:**

| Campo | Obligatorio | Regla |
|---|---|---|
| `nombre` | Sí | Máximo 100 caracteres. |
| `apellido` | Sí | Máximo 100 caracteres. |
| `documento_identidad` | No | Máximo 30 caracteres, único. |
| `fecha_nacimiento` | Sí | Formato `AAAA-MM-DD`, no futura. |
| `sexo` | Sí | `Masculino`, `Femenino` u `Otro`. |
| `telefono` | No | Entre 7 y 20 caracteres. |
| `correo` | No | Formato válido, máximo 120 caracteres. |
| `direccion` | No | Máximo 255 caracteres. |
| `antecedentes` | No | Texto libre. |

**Respuestas:** `200`, `201`, `400` (incluye documento duplicado), `404`, `400` al eliminar si tiene citas o historial asociados.

---

### 2.6 Consultorios

Prefijo: `/api/consultorios`

| Método | Ruta | Descripción | Parámetros / cuerpo |
|---|---|---|---|
| `GET` | `/api/consultorios` | Lista todos los consultorios. Incluye `total_psicologos`. | — |
| `GET` | `/api/consultorios/:id` | Obtiene un consultorio por ID. | `id` numérico, por ejemplo `3`. |
| `POST` | `/api/consultorios` | Crea un consultorio. | Cuerpo JSON (ver abajo). |
| `PUT` | `/api/consultorios/:id` | Actualiza completamente un consultorio. | `id` numérico + cuerpo JSON completo. |
| `DELETE` | `/api/consultorios/:id` | Elimina un consultorio sin psicólogos ni citas asociadas. | `id` numérico. |

**Cuerpo para `POST` / `PUT`:**

```json
{
  "nombre": "CONS-404",
  "ubicacion": "Piso 4, Ala Poniente",
  "telefono": "+52 555 800 4404",
  "estado": "Disponible"
}
```

**Campos:**

| Campo | Obligatorio | Regla |
|---|---|---|
| `nombre` | Sí | Código o nombre del consultorio, máximo 100 caracteres. |
| `ubicacion` | Sí | Piso, ala o referencia, máximo 255 caracteres. |
| `telefono` | No | Entre 7 y 20 caracteres. |
| `estado` | No | `Disponible`, `Ocupado` o `Inactivo`. Por defecto `Disponible`. |

**Respuestas:** `200`, `201`, `400`, `404`.

---

### 2.7 Citas

Prefijo: `/api/citas`

| Método | Ruta | Descripción | Parámetros / cuerpo |
|---|---|---|---|
| `GET` | `/api/citas` | Lista todas las citas con paciente, psicólogo y consultorio. | — |
| `GET` | `/api/citas/:id` | Obtiene una cita por ID. | `id` numérico, por ejemplo `2`. |
| `GET` | `/api/citas/paciente/:idPaciente` | Lista las citas de un paciente. | `idPaciente` numérico, por ejemplo `2`. |
| `GET` | `/api/citas/psicologo/:idPsicologo` | Lista las citas de un psicólogo. | `idPsicologo` numérico, por ejemplo `2`. |
| `POST` | `/api/citas` | Crea una cita. | Cuerpo JSON (ver abajo). |
| `PUT` | `/api/citas/:id` | Actualiza completamente una cita. | `id` numérico + cuerpo JSON completo. |
| `DELETE` | `/api/citas/:id` | Elimina una cita sin historial asociado. | `id` numérico. |

**Cuerpo para `POST` / `PUT`:**

```json
{
  "id_paciente": 2,
  "id_psicologo": 2,
  "id_consultorio": 3,
  "fecha_cita": "2026-12-10",
  "hora_cita": "10:00",
  "modalidad": "Presencial",
  "motivo": "Seguimiento terapéutico",
  "estado": "Programada"
}
```

**Campos:**

| Campo | Obligatorio | Regla |
|---|---|---|
| `id_paciente` | Sí | Entero positivo; debe existir. |
| `id_psicologo` | Sí | Entero positivo; debe existir. |
| `id_consultorio` | Sí | Entero positivo; debe existir. |
| `fecha_cita` | Sí | Formato `AAAA-MM-DD`. |
| `hora_cita` | Sí | Formato `HH:MM` o `HH:MM:SS`. |
| `modalidad` | No | `Presencial`, `Virtual` o `Híbrida`. Por defecto `Presencial`. |
| `motivo` | No | Máximo 255 caracteres. |
| `estado` | No | `Programada`, `Confirmada`, `Atendida` o `Cancelada`. Por defecto `Programada`. |

**Validaciones adicionales:** la API rechaza citas con paciente, psicólogo o consultorio inexistente y detecta conflictos de horario para el mismo paciente o psicólogo.

**Respuestas:** `200`, `201`, `400`, `404`, `400` al eliminar si tiene historial asociado.

---

### 2.8 Historial clínico

Prefijo: `/api/historial`

| Método | Ruta | Descripción | Parámetros / cuerpo |
|---|---|---|---|
| `GET` | `/api/historial` | Lista todos los registros con paciente, psicólogo y datos de la cita. | — |
| `GET` | `/api/historial/:id` | Obtiene un registro por ID. | `id` numérico, por ejemplo `2`. |
| `GET` | `/api/historial/cita/:idCita` | Obtiene el historial asociado a una cita. | `idCita` numérico, por ejemplo `2`. |
| `POST` | `/api/historial` | Crea un registro clínico para una cita sin historial previo. | Cuerpo JSON (ver abajo). |
| `PUT` | `/api/historial/:id` | Actualiza completamente un registro clínico. | `id` numérico + cuerpo JSON completo. |
| `DELETE` | `/api/historial/:id` | Elimina un registro clínico. | `id` numérico. |

**Cuerpo para `POST` / `PUT`:**

```json
{
  "id_cita": 2,
  "diagnostico": "Episodio depresivo leve (F32.0)",
  "tratamiento": "Terapia cognitivo-conductual semanal.",
  "notas": "Evolución favorable; se continúa con seguimiento."
}
```

**Campos:**

| Campo | Obligatorio | Regla |
|---|---|---|
| `id_cita` | Sí | Debe existir y no tener otro historial. |
| `diagnostico` | Sí | Texto libre. |
| `tratamiento` | No | Texto libre. |
| `notas` | No | Texto libre. |

> **Relación:** el historial se vincula con el paciente y el psicólogo a través de `id_cita`. Cada cita admite un único registro clínico. La respuesta de `GET /api/historial` incluye `paciente`, `psicologo`, `especialidad`, `fecha_cita` y `hora_cita`.

**Respuestas:** `200`, `201`, `400` (cita inexistente o con historial previo), `404`.

---

### 2.9 Orden recomendado para probar en Postman

Por las llaves foráneas, realiza las pruebas en este orden:

1. `POST /api/consultorios` → guarda `id_consultorio`.
2. `POST /api/psicologos` usando ese `id_consultorio` → guarda `id_psicologo`.
3. `POST /api/pacientes` → guarda `id_paciente`.
4. `POST /api/citas` usando los tres IDs anteriores → guarda `id_cita`.
5. `POST /api/historial` usando ese `id_cita` → guarda `id_historial`.
6. `GET` de las cinco entidades para confirmar los listados.
7. `PUT` de cada entidad para actualizar.
8. `DELETE` en orden inverso: historial → cita → psicólogo → paciente → consultorio.

### 2.10 Códigos de estado HTTP

| Código | Significado |
|---|---|
| `200` | Consulta, actualización o eliminación correcta. |
| `201` | Recurso creado correctamente. |
| `400` | Datos inválidos, relación inexistente, duplicado o conflicto. |
| `404` | Recurso no encontrado (o ruta inexistente). |
| `500` | Error interno del servidor. |

---

## 3. Datos de prueba poblados en la base de datos

Los siguientes registros fueron insertados con el seeder `src/scripts/sembrarDatosPrueba.js` (`npm run sembrar:prueba`) y verificados en vivo contra la API desplegada en Render el **6 de noviembre de 2026 a las 21:15 UTC**.

**Totales devueltos por producción:**

| Endpoint | Total |
|---|---|
| `GET /api/consultorios` | 3 |
| `GET /api/psicologos` | 3 |
| `GET /api/pacientes` | 3 |
| `GET /api/citas` | 3 |
| `GET /api/historial` | 3 |

### 3.1 Consultorios

| `id_consultorio` | Código / nombre | Ubicación | Teléfono | Estado | Psicólogos |
|---|---|---|---|---|---|
| 3 | `CONS-101` | Piso 1, Ala Norte | +52 555 800 1101 | Disponible | 1 |
| 4 | `CONS-202` | Piso 2, Ala Sur | +52 555 800 2202 | Ocupado | 1 |
| 5 | `CONS-303` | Piso 3, Área de Terapia Familiar | +52 555 800 3303 | Disponible | 1 |

### 3.2 Psicólogos

| `id_psicologo` | Nombre completo | Especialidad | Cédula / registro | Correo | Consultorio |
|---|---|---|---|---|---|
| 2 | Ana Martínez López | Psicología Clínica | `CED-PSI-1001` | ana.martinez@consultorio-prueba.com | CONS-101 |
| 3 | Carlos Hernández Ruiz | Terapia de Pareja | `CED-PSI-1002` | carlos.hernandez@consultorio-prueba.com | CONS-202 |
| 4 | Laura Gómez Sánchez | Psicología Infantil | `CED-PSI-1003` | laura.gomez@consultorio-prueba.com | CONS-303 |

Enfoques terapéuticos registrados: terapia cognitivo-conductual, terapia sistémica familiar y terapia de juego.

### 3.3 Pacientes

| `id_paciente` | Nombre completo | Documento de identidad | Fecha de nacimiento | Sexo | Teléfono | Correo |
|---|---|---|---|---|---|---|
| 2 | María Fernanda López García | `LOPM900312MDFPRR08` | 1990-03-12 | Femenino | +52 555 700 1001 | maria.lopez@correo-prueba.com |
| 3 | Jorge Alberto Ramírez Torres | `RATJ850726HDFMRR05` | 1985-07-26 | Masculino | +52 555 700 2002 | jorge.ramirez@correo-prueba.com |
| 4 | Valeria Sánchez Díaz | `SADV001120MDFNNL09` | 2000-11-20 | Femenino | +52 555 700 3003 | valeria.sanchez@correo-prueba.com |

### 3.4 Citas

| `id_cita` | Paciente | Psicólogo | Consultorio | Fecha | Hora | Modalidad | Estado |
|---|---|---|---|---|---|---|---|
| 2 | María Fernanda López García | Ana Martínez López | CONS-101 | 2026-10-15 | 09:00 | Presencial | Atendida |
| 3 | Jorge Alberto Ramírez Torres | Carlos Hernández Ruiz | CONS-202 | 2026-10-20 | 11:30 | Virtual | Atendida |
| 4 | Valeria Sánchez Díaz | Laura Gómez Sánchez | CONS-303 | 2026-10-27 | 16:00 | Presencial | Atendida |

### 3.5 Historial clínico

| `id_historial` | `id_cita` | Paciente | Psicólogo | Diagnóstico | Tratamiento |
|---|---|---|---|---|---|
| 2 | 2 | María Fernanda López García | Ana Martínez López | Episodio depresivo leve (F32.0) | Terapia cognitivo-conductual semanal durante 12 sesiones. |
| 3 | 3 | Jorge Alberto Ramírez Torres | Carlos Hernández Ruiz | Dificultades de comunicación y conflicto de pareja (Z63.0) | Terapia de pareja quincenal con técnicas de comunicación asertiva. |
| 4 | 4 | Valeria Sánchez Díaz | Laura Gómez Sánchez | Trastorno de ansiedad por separación en la infancia (F93.0) | Terapia de juego semanal y orientación a cuidadores. |

**Notas clínicas registradas:**

- Cita 2: “La paciente refiere mejoría en el sueño y disminución de la sintomatología ansiosa.”
- Cita 3: “Se observa disposición de ambos integrantes para continuar el proceso terapéutico.”
- Cita 4: “La paciente expresa sus emociones mediante el juego; se sugiere seguimiento familiar.”

### 3.6 Integridad referencial verificada

```
citas.id_paciente   -> pacientes.id_paciente       (2, 3, 4)
citas.id_psicologo  -> psicologos.id_psicologo     (2, 3, 4)
citas.id_consultorio-> consultorios.id_consultorio (3, 4, 5)
historial.id_cita   -> citas.id_cita               (2, 3, 4)
```

El seeder es idempotente: puede ejecutarse varias veces sin duplicar registros. También se aplicó en la base alternativa `consultorio_psicologico` para que la API funcione con cualquiera de los dos valores de `DB_NAME`.

---

## 4. Integración con WordPress mediante WPGetAPI

La API puede consumirse desde una instalación local de WordPress sobre **XAMPP** usando el plugin gratuito **WPGetAPI**. El plugin realiza la petición desde el servidor de WordPress (PHP), por lo que no hay problemas de CORS para este caso.

### 4.1 Instalación

1. Inicia Apache y MySQL desde el panel de XAMPP.
2. Accede a `http://localhost/wordpress/wp-admin` (o la ruta de tu instalación).
3. Ve a **Plugins → Añadir nuevo**, busca **WPGet API** e instálalo/actívalo.

### 4.2 Configuración de la API

En el panel de WordPress: **WPGetAPI → Setup**.

| Campo | Valor |
|---|---|
| API ID | `consultorio_api` |
| Base URL | `https://consultorio-psiquiatrico.onrender.com/api` |
| Timeout | `60` segundos (Render puede tardar en despertar) |
| Authentication | Ninguna |

> No agregues una barra final en la Base URL para evitar rutas con doble barra (`//`).

### 4.3 Endpoints a crear

En **WPGetAPI → consultorio_api → Add Endpoint** crea uno por cada recurso:

| Endpoint ID | Método | Ruta final |
|---|---|---|
| `psicologos` | `GET` | `https://consultorio-psiquiatrico.onrender.com/api/psicologos` |
| `pacientes` | `GET` | `https://consultorio-psiquiatrico.onrender.com/api/pacientes` |
| `consultorios` | `GET` | `https://consultorio-psiquiatrico.onrender.com/api/consultorios` |
| `citas` | `GET` | `https://consultorio-psiquiatrico.onrender.com/api/citas` |
| `historial` | `GET` | `https://consultorio-psiquiatrico.onrender.com/api/historial` |

Para el endpoint usa únicamente la ruta relativa (`psicologos`, `pacientes`, etc.) y selecciona **Results Format → JSON string** si vas a usar shortcodes, o **PHP array data** si vas a usar la plantilla PHP.

### 4.4 Shortcodes

**Shortcode básico (versión gratuita):**

```text
[wpgetapi_endpoint api_id='consultorio_api' endpoint_id='psicologos' debug='false']
```

Este shortcode imprime la respuesta JSON de la API. Sustituye `endpoint_id` por `pacientes`, `consultorios`, `citas` o `historial` según la entidad.

**Ejemplos por entidad:**

```text
[wpgetapi_endpoint api_id='consultorio_api' endpoint_id='pacientes' debug='false']
[wpgetapi_endpoint api_id='consultorio_api' endpoint_id='consultorios' debug='false']
[wpgetapi_endpoint api_id='consultorio_api' endpoint_id='citas' debug='false']
[wpgetapi_endpoint api_id='consultorio_api' endpoint_id='historial' debug='false']
```

> La versión gratuita muestra el JSON como texto. Para renderizar tarjetas o tablas con HTML se puede usar la etiqueta de plantilla en PHP o la versión Pro de WPGetAPI con `format='html'`.

### 4.5 Plantilla PHP para mostrar los datos

Agrega este bloque en una plantilla de página, en un widget PHP o mediante un plugin de fragmentos de código. El endpoint debe estar configurado con **Results Format → PHP array data**:

```php
<?php
$respuesta = wpgetapi_endpoint(
    'consultorio_api',
    'psicologos',
    array('debug' => false)
);

if (!empty($respuesta['datos'])) {
    echo '<div class="lista-psicologos">';

    foreach ($respuesta['datos'] as $psicologo) {
        echo '<article class="psicologo">';
        echo '<h3>' . esc_html($psicologo['nombre'] . ' ' . $psicologo['apellido']) . '</h3>';
        echo '<p><strong>Especialidad:</strong> ' . esc_html($psicologo['especialidad']) . '</p>';
        echo '<p><strong>Registro:</strong> ' . esc_html($psicologo['cedula_profesional']) . '</p>';
        echo '<p><strong>Correo:</strong> ' . esc_html($psicologo['correo']) . '</p>';
        echo '<p><strong>Consultorio:</strong> ' . esc_html($psicologo['consultorio']) . '</p>';
        echo '</article>';
    }

    echo '</div>';
} else {
    echo '<p>No hay psicólogos registrados.</p>';
}
?>
```

El mismo patrón aplica para las demás entidades; solo cambia el `endpoint_id` y los campos que deseas mostrar.

### 4.6 Recomendaciones y consideraciones

- **Render gratuito:** si el servicio estuvo inactivo, la primera petición puede tardar aproximadamente 30–60 segundos. Configura el timeout de WPGetAPI en 60 segundos.
- **CORS:** WPGetAPI hace la llamada desde PHP en el servidor, por lo que no requiere configurar CORS. Si en el futuro consumes la API con JavaScript desde el navegador, agrega el origen local a `CORS_ORIGIN` en Render (por ejemplo `http://localhost`).
- **HTTPS:** Render sirve la API con certificado válido; no es necesario desactivar la verificación SSL.
- **Mutaciones:** WPGetAPI está orientado principalmente a `GET`. Para crear o actualizar registros (`POST`, `PUT`, `DELETE`) conviene usar el formulario de WordPress con una petición server-side o una herramienta como Postman.
- **Datos visibles:** el plugin leerá el arreglo `datos` de cada respuesta JSON. Los IDs (`id_psicologo`, `id_paciente`, etc.) pueden usarse para construir endpoints específicos o relaciones.

---

## Anexo: comandos útiles del proyecto

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start

# Verificar la conexión con MySQL
npm run verificar:conexion

# Sembrar los datos de prueba de las cinco entidades
npm run sembrar:prueba

# Verificar sintaxis del archivo principal
npm run verificar
```

---

**Fin del informe.**
