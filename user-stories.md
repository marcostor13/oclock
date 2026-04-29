# Historias de Usuario — Plataforma de Control de Marcaciones (Time Tracking)

## 1. Resumen general

Plataforma web para el registro y administración de marcaciones de entrada/salida de empleados, con validación geográfica, gestión de cuentas, reportes por períodos y exportaciones. La plataforma está en **inglés**, es **responsive** y utiliza **autenticación JWT**.

### 1.1 Colecciones de base de datos involucradas

| Colección | Uso principal |
|---|---|
| `accounts` | Cuentas/sucursales con coordenadas (`latitude`, `longitude`) y nombre. |
| `departments` | Departamentos asociados a una cuenta. |
| `positions` | Cargos/posiciones asociados a un departamento. |
| `employees` | Empleados con `clockId` (número de identificación). |
| `users` | Usuarios autenticados de la plataforma administrativa. |
| `workperiodaccounts` | Períodos de trabajo (quincenal, mensual, etc.) por cuenta. |
| `markings` (nueva) | Registro de marcaciones (check-in / check-out, timestamp, account, department, position, employee, status, sent flag). |
| `notifications` (nueva) | Alertas de marcaciones incompletas y overtime. |

### 1.2 Roles

- **Empleado (público / sin login)**: solo accede a `/clock/[accountId]` para marcar.
- **Administrador (autenticado)**: gestiona marcaciones, reportes, cuentas, QR, etc.

---

## 2. Épicas

| # | Épica |
|---|---|
| E1 | Marcación pública de entrada/salida |
| E2 | Autenticación y gestión de cuenta de usuario |
| E3 | Visualización de marcaciones por usuario |
| E4 | Detalle y edición de marcaciones |
| E5 | Reporte de actividades por período |
| E6 | Envío y bloqueo de reportes |
| E7 | Notificaciones y alertas |
| E8 | Generador de URL/QR por cuenta |
| E9 | Perfil de usuario y recuperación de contraseña |
| E10 | Requisitos transversales (exportación, responsive, performance, zona horaria) |

---

## 3. Historias de Usuario

### EPIC 1 — Marcación pública de entrada/salida

#### HU-1.1 — Acceso público a la página de marcación
**Como** empleado,
**quiero** acceder a la URL `/clock/[accountId]` sin necesidad de iniciar sesión,
**para** poder marcar mi entrada o salida rápidamente.

**Criterios de aceptación**
- La ruta `/clock/[accountId]` es pública (no requiere JWT).
- Al ingresar se consulta la colección `accounts` por el `accountId` y se muestra el **nombre de la cuenta** en pantalla.
- Si el `accountId` no existe o está inactivo, se muestra un mensaje de error claro.
- La página no expone datos sensibles del backend.

---

#### HU-1.2 — Validación de geolocalización del navegador
**Como** sistema,
**quiero** validar que el usuario tiene la geolocalización habilitada antes de permitir marcar,
**para** garantizar que la marcación se realiza físicamente en el lugar correcto.

**Criterios de aceptación**
- Se solicita permiso de geolocalización al cargar la página.
- Si el usuario **no concede permiso** o tiene la ubicación desactivada, se muestra un mensaje **a pantalla completa** indicando que debe habilitar la ubicación para continuar.
- Mientras no haya ubicación válida, **no se pueden mostrar los botones de marcación**.
- Se maneja el caso de error (timeout, navegador no soportado).

---

#### HU-1.3 — Validación de distancia respecto a la cuenta
**Como** sistema,
**quiero** comparar la ubicación del usuario con `latitude`/`longitude` de la cuenta,
**para** evitar marcaciones fuera del lugar de trabajo.

**Criterios de aceptación**
- Se calcula la distancia (fórmula de Haversine) entre la ubicación del navegador y la de la cuenta.
- Si el usuario está a **más de 10 metros** del punto de la cuenta, no puede marcar y se muestra un mensaje claro: "You are too far from the location to clock in/out".
- Si está dentro del rango, se habilitan los botones de marcación.
- La distancia se valida también en **backend** al guardar la marcación (no solo en frontend).

---

#### HU-1.4 — Selección de tipo de marcación (check-in / check-out)
**Como** empleado,
**quiero** ver dos botones grandes para Check-in y Check-out,
**para** elegir fácilmente el tipo de marcación.

**Criterios de aceptación**
- Dos botones grandes, claramente diferenciados (color/ícono): **Check-in** y **Check-out**.
- Tras seleccionar uno, avanza al siguiente paso (selección de datos).
- Es accesible y usable en pantallas pequeñas (touch-friendly).

---

#### HU-1.5 — Selección de departamento, posición e identificación
**Como** empleado,
**quiero** seleccionar mi departamento, posición e ingresar mi número de identificación,
**para** registrar correctamente mi marcación.

**Criterios de aceptación**
- Selector de **department** que carga desde `departments` filtrado por la cuenta.
- Selector de **position** que carga desde `positions` filtrado por el departamento seleccionado (cascada).
- Campo de **clockId** (número de identificación), validado contra la colección `employees`.
- Si el `clockId` no corresponde a un empleado activo de esa cuenta/departamento/posición, se muestra error y no se permite continuar.
- Validación en backend además del frontend.

---

#### HU-1.6 — Resumen de marcación y reinicio
**Como** empleado,
**quiero** ver un resumen de mi marcación luego de registrarla,
**para** confirmar que se realizó correctamente.

**Criterios de aceptación**
- Tras registrar exitosamente, se muestra resumen con: nombre del empleado, cuenta, departamento, posición, tipo (check-in/out), fecha y hora local.
- Mensaje de éxito visible.
- Tras unos segundos (o un botón "Done"), se redirige automáticamente al **inicio del flujo de marcación** (`/clock/[accountId]`).

---

### EPIC 2 — Autenticación y gestión

#### HU-2.1 — Login con JWT
**Como** administrador,
**quiero** iniciar sesión con email y contraseña,
**para** acceder a las funcionalidades privadas de la plataforma.

**Criterios de aceptación**
- La autenticación usa la colección `users`.
- El backend devuelve un **JWT** con expiración configurable.
- El token se guarda de forma segura en el cliente (httpOnly cookie preferido o storage seguro).
- Las rutas privadas validan el JWT en cada request.
- Login fallido muestra un mensaje genérico ("Invalid credentials").
- Existe logout que invalida el token (lista negra opcional o expiración).

---

### EPIC 3 — Visualización de marcaciones por usuario

#### HU-3.1 — Listado consolidado de marcaciones por empleado
**Como** administrador,
**quiero** ver un listado de empleados con la sumatoria total de horas trabajadas en un rango,
**para** tener una vista rápida del desempeño.

**Criterios de aceptación**
- Vista accesible desde el menú principal.
- Cada fila muestra: empleado (único), cuenta, departamento, posición, **total de horas** del rango seleccionado.
- Empleados únicos (no duplicados por marcación).
- Filtros disponibles: **rango de fechas**, **account**, **department**, **position**.
- Los filtros se aplican en backend (no en cliente).
- Paginación en backend.
- Botón para exportar a **Excel** y **PDF** con los filtros aplicados.

---

### EPIC 4 — Detalle de marcaciones

#### HU-4.1 — Ver detalle de marcaciones de un empleado
**Como** administrador,
**quiero** hacer click en un empleado para ver el detalle de sus marcaciones,
**para** revisar día a día su jornada.

**Criterios de aceptación**
- Al hacer click sobre el empleado en el listado consolidado (HU-3.1), se navega a una vista de detalle.
- **Los filtros (rango, account, department, position) se mantienen** al navegar.
- Cada fila representa **un día completo**: check-in + check-out emparejados.
- Cada fila muestra: posición, departamento, hora de check-in, hora de check-out, total de horas.
- Una **barra visual** indica las horas trabajadas:
  - **Verde** si ≤ 8 horas.
  - **Rojo** si > 8 horas (overtime diario).
- Cada fila tiene acciones: **Edit** y **Delete**.
- Confirmación antes de eliminar.
- Edición permite ajustar fecha/hora de check-in y check-out (con validación de zona horaria).
- Las marcaciones ya **enviadas en un reporte no son editables ni eliminables** (ver E6).
- Exportación a Excel y PDF del detalle.

---

#### HU-4.2 — Editar y eliminar marcaciones
**Como** administrador,
**quiero** editar o eliminar marcaciones específicas,
**para** corregir errores o casos especiales.

**Criterios de aceptación**
- Edición en modal o página dedicada.
- Validación de que `checkout > checkin`.
- Registro en log/auditoría de quién y cuándo modificó la marcación.
- No permite editar marcaciones bloqueadas por envío de reporte.

---

### EPIC 5 — Reporte de actividades

#### HU-5.1 — Vista de reporte por períodos
**Como** administrador,
**quiero** ver el reporte de actividades por períodos en lugar de rangos de fecha,
**para** alinearme con los ciclos de pago.

**Criterios de aceptación**
- Vista accesible desde el menú.
- Selector de período obtenido de la colección `workperiodaccounts` (filtrado por cuenta).
- Muestra dos secciones:
  1. **Marcaciones incompletas** (ej. solo check-in sin check-out) con un acceso directo a editar/completar.
  2. **Listado de empleados con sus horas trabajadas** durante el período.
- Filtros adicionales por cuenta, departamento, posición.
- Paginación en backend.
- Exportación a Excel y PDF.

---

#### HU-5.2 — Resaltar y editar marcaciones incompletas
**Como** administrador,
**quiero** identificar fácilmente marcaciones incompletas y completarlas,
**para** mantener los reportes consistentes.

**Criterios de aceptación**
- Una marcación es "incompleta" si tiene check-in sin check-out (o viceversa) en el día.
- Cada fila incompleta tiene botón "Edit / Complete" que abre el formulario de edición precargado.
- Al guardar, la marcación pasa de "incomplete" a "complete".

---

### EPIC 6 — Envío y bloqueo de reportes

#### HU-6.1 — Enviar reporte de un período
**Como** administrador,
**quiero** enviar el reporte de un período,
**para** cerrar oficialmente las marcaciones de ese ciclo.

**Criterios de aceptación**
- Botón "Send Report" en la vista de reporte por período (HU-5.1).
- Confirmación previa al envío.
- Al enviar, todas las marcaciones del período se marcan con un flag `sent: true` (o referencia al reporte enviado).
- A partir de ese momento, esas marcaciones **no pueden editarse ni eliminarse**.
- Se registra fecha, usuario que envió y período.

---

#### HU-6.2 — Vista de reportes enviados
**Como** administrador,
**quiero** ver el historial de reportes enviados,
**para** consultarlos cuando sea necesario.

**Criterios de aceptación**
- Vista accesible desde el menú.
- Lista de reportes enviados con: cuenta, período, fecha de envío, usuario que envió, total de horas, total de empleados.
- Click en un reporte muestra el detalle (solo lectura).
- Exportación a Excel y PDF.
- Paginación en backend.

---

### EPIC 7 — Notificaciones y alertas

#### HU-7.1 — Notificación de marcaciones incompletas
**Como** administrador,
**quiero** recibir alertas de marcaciones incompletas,
**para** corregirlas antes del envío del reporte.

**Criterios de aceptación**
- Indicador (badge) en el menú/header con cantidad de marcaciones incompletas.
- Centro de notificaciones con detalle.
- Click en la notificación lleva directamente a la marcación a corregir.
- Las notificaciones se marcan como leídas.

---

#### HU-7.2 — Alerta de overtime (>40h por período)
**Como** administrador,
**quiero** ser alertado cuando un empleado supera 40 horas en un período,
**para** controlar el overtime.

**Criterios de aceptación**
- Cálculo automático al cierre de jornada/marcación.
- Notificación visible con el nombre del empleado, cuenta y total de horas.
- Indicador visual (rojo) en las vistas de listado y detalle.
- Configurable: el umbral 40h podría parametrizarse por cuenta/período.

---

### EPIC 8 — Generador de URL y QR por cuenta

#### HU-8.1 — Generar URL y QR para marcación
**Como** administrador,
**quiero** generar una URL y un código QR por cuenta,
**para** distribuirlo a los empleados y que marquen fácilmente.

**Criterios de aceptación**
- Vista accesible desde el menú.
- Selector de cuenta (`accounts`).
- Genera la URL `/clock/[accountId]` y el QR correspondiente.
- Botón para descargar el QR como imagen (PNG/SVG).
- Botón para copiar la URL al portapapeles.
- Opción de imprimir QR con el nombre de la cuenta.

---

### EPIC 9 — Perfil de usuario y recuperación de contraseña

#### HU-9.1 — Cambio de contraseña
**Como** usuario autenticado,
**quiero** cambiar mi contraseña,
**para** mantener mi cuenta segura.

**Criterios de aceptación**
- Formulario que solicita contraseña actual y nueva (con confirmación).
- Validación de fortaleza mínima.
- Re-hash en backend (bcrypt/argon2).
- Mensaje de éxito y posible cierre de sesiones activas.

---

#### HU-9.2 — Recuperación de contraseña
**Como** usuario,
**quiero** recuperar mi contraseña si la olvido,
**para** poder volver a acceder.

**Criterios de aceptación**
- Página pública "Forgot password" donde se ingresa email.
- Envío de email con un token de un solo uso (expiración corta, ej. 30 min).
- Página para establecer nueva contraseña usando el token.
- Token invalidado tras uso.

---

#### HU-9.3 — Edición de perfil y foto
**Como** usuario,
**quiero** editar mis datos de perfil y subir una foto,
**para** mantener mi información actualizada.

**Criterios de aceptación**
- Formulario con datos editables (nombre, email, teléfono, etc.).
- Subida de imagen con preview, validación de tipo y tamaño (ej. máx 2MB, JPG/PNG).
- Almacenamiento en bucket/CDN.
- La foto se muestra en el header/avatar.

---

### EPIC 10 — Requisitos transversales

#### HU-10.1 — Manejo correcto de zona horaria
**Como** sistema,
**quiero** que las marcaciones sean coherentes entre el navegador del empleado y el servidor,
**para** evitar conflictos por zona horaria.

**Criterios de aceptación**
- Las marcaciones se almacenan en **UTC** en backend.
- Se guarda también la **timezone original** del navegador en cada marcación.
- En las visualizaciones, se muestra la hora local correcta según la cuenta o el usuario que consulta.
- Pruebas con múltiples zonas horarias (UTC-5 Lima, UTC, UTC+1, etc.).

---

#### HU-10.2 — Idioma del sistema
**Como** usuario,
**quiero** que toda la interfaz esté en inglés,
**para** mantener consistencia con la operación de la empresa.

**Criterios de aceptación**
- Todos los textos visibles (labels, mensajes, errores, emails) están en inglés.
- Strings centralizados en archivos de i18n para futura localización.

---

#### HU-10.3 — Exportación a Excel y PDF
**Como** administrador,
**quiero** descargar la información en Excel y PDF respetando los filtros aplicados,
**para** compartirla o archivarla.

**Criterios de aceptación**
- Cada vista de listado/detalle/reporte tiene botones "Export to Excel" y "Export to PDF".
- La exportación respeta los filtros activos.
- El **diseño del PDF** es limpio: encabezado con logo, título, filtros aplicados, fecha de generación, paginado, tabla con estilos.
- El **Excel** trae columnas tipadas (fechas como fecha, números como número).
- La generación se hace en backend para grandes volúmenes (no bloquea UI).

---

#### HU-10.4 — Diseño responsive
**Como** usuario,
**quiero** usar la plataforma desde cualquier dispositivo,
**para** trabajar también desde móvil o tablet.

**Criterios de aceptación**
- Layout adaptable (mobile, tablet, desktop).
- En móvil, **las tablas se reemplazan por listas** (cards con la información clave).
- Navegación adaptada (menú hamburguesa).
- Botones touch-friendly (mínimo 44×44px).

---

#### HU-10.5 — Paginación en backend
**Como** sistema,
**quiero** paginar todas las consultas de listas en backend,
**para** mantener el rendimiento.

**Criterios de aceptación**
- Endpoints de listas aceptan `page`, `pageSize`, `sortBy`, `sortDir`.
- Respuesta incluye `total`, `page`, `pageSize`, `items`.
- Frontend usa la paginación devuelta por el backend (no carga todo en memoria).

---

#### HU-10.6 — Optimización de performance
**Como** sistema,
**quiero** que las consultas y la página sean rápidas,
**para** ofrecer buena experiencia.

**Criterios de aceptación**
- **Índices en MongoDB**: `markings.employeeId`, `markings.accountId`, `markings.timestamp`, `markings.workPeriodId`, `employees.clockId`, etc.
- Agregaciones (`$group`, `$lookup`) para cálculo de totales en lugar de cálculo en memoria.
- Caching de datos relativamente estáticos (departments, positions, accounts).
- Lazy loading de rutas y componentes pesados (gráficos, exportaciones).
- Imágenes optimizadas (WebP, srcset).
- Métricas objetivo: TTFB < 300ms, LCP < 2.5s.

---

## 4. Reglas de negocio adicionales

1. Una marcación válida requiere `accountId`, `employeeId`, `departmentId`, `positionId`, `type` (in/out), `timestamp` (UTC) y `timezone`.
2. Una jornada (día) se compone de un par check-in / check-out; si falta uno, queda **incompleta**.
3. Un empleado puede tener múltiples pares en el mismo día (entrada/salida múltiple) — el sistema debe sumarlos.
4. Tras enviar el reporte de un período, las marcaciones se vuelven **inmutables**.
5. Overtime se calcula contra `workperiodaccounts` (>40h por período por defecto).

---

## 5. Glosario

| Término | Definición |
|---|---|
| Account | Sucursal o cliente al que pertenece la marcación; tiene coordenadas. |
| Clock-in / Clock-out | Marcación de entrada / salida del empleado. |
| ClockId | Identificador del empleado utilizado para marcar. |
| Work Period | Período de trabajo (semanal, quincenal, mensual) configurable por cuenta. |
| Overtime | Horas que superan el límite definido (por defecto 40h por período). |
| Sent Report | Reporte cerrado de un período cuyas marcaciones quedan inmutables. |
