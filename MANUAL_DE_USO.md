# Manual de uso — Vectra Cure

**Plataforma de Geolocalización y Agendamiento Médico**
PUCE · Facultad de Ingeniería · Desarrollo de Software
Isaac Unapucha · Justin Cedeño

Este manual explica **cómo ejecutar la aplicación, cómo usarla y qué hacer
cuando algo falla**. Para el reparto de tareas y el flujo de Git, revisa
[`FLUJO_DE_TRABAJO.md`](FLUJO_DE_TRABAJO.md).

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Cómo ejecutar el programa](#2-cómo-ejecutar-el-programa)
3. [Cuentas de prueba](#3-cuentas-de-prueba)
4. [Guía de uso: paciente](#4-guía-de-uso-paciente)
5. [Guía de uso: especialista](#5-guía-de-uso-especialista)
6. [Guía de uso: administrador](#6-guía-de-uso-administrador)
7. [Solución de problemas](#7-solución-de-problemas)
8. [Mensajes del sistema](#8-mensajes-del-sistema)
9. [Reglas y límites del sistema](#9-reglas-y-límites-del-sistema)
10. [Ejecutar las pruebas](#10-ejecutar-las-pruebas)

---

## 1. Requisitos previos

| Requisito | Versión | Cómo verificar |
| :--- | :--- | :--- |
| Python | 3.13 | `python --version` |
| PostgreSQL | 18 | Servicio `postgresql-x64-18` en ejecución |
| pgAdmin 4 | 9.x | Viene incluido con PostgreSQL 18 |
| Visual Studio Code | 1.13x | `code --version` |

**Extensiones de VS Code:** al abrir la carpeta del proyecto, VS Code ofrece
instalar las del equipo automáticamente (*"Install All"*). Si no aparece el
aviso, revisa la tabla de extensiones en
[`FLUJO_DE_TRABAJO.md` §3.0](FLUJO_DE_TRABAJO.md#30-vs-code--extensiones-del-proyecto).

**Verificar que PostgreSQL esté corriendo** (PowerShell):

```powershell
Get-Service postgresql*
```

Debe decir `Running`. Si dice `Stopped`:

```powershell
Start-Service postgresql-x64-18
```

---

## 2. Cómo ejecutar el programa

### 2.1 Primera vez (instalación completa)

**Paso 1 — Crear el entorno virtual e instalar dependencias**

```powershell
cd "Proyecto Sistema Medico\vectra_cure"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Sabrás que el entorno está activo porque la terminal muestra `(venv)` al inicio
de la línea.

**Paso 2 — Configurar la conexión**

```powershell
copy .env.example .env
```

Abre `.env` y escribe tu contraseña de PostgreSQL en `DB_PASSWORD`:

```env
SECRET_KEY=vectra-cure-clave-desarrollo-2026
APP_DEBUG=true

DB_DIALECT=postgresql+psycopg
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aquí
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vectra_cure
```

**Paso 3 — Cargar la base de datos**

Desde pgAdmin 4, o desde PowerShell en la raíz del proyecto:

```powershell
$env:PGPASSWORD = "tu_contraseña_aquí"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

& $psql -U postgres -h localhost -d postgres    -f database\00_create_database_postgresql.sql
& $psql -U postgres -h localhost -d vectra_cure -f database\01_schema_postgresql.sql
& $psql -U postgres -h localhost -d vectra_cure -f database\02_seed_demo_postgresql.sql
& $psql -U postgres -h localhost -d vectra_cure -f database\03_verificar_postgresql.sql
```

El último script debe terminar mostrando 4 tablas con sus conteos:

```
 entidad          | registros
------------------+-----------
 citas            |         8
 perfiles_medicos |         6
 resenas          |         8
 usuarios         |        12
```

> El script `01_schema` se ejecuta **una sola vez**. Si lo repites da error
> porque las tablas ya existen. `02_seed` y `03_verificar` sí se pueden repetir.

### 2.2 Uso diario

```powershell
cd "Proyecto Sistema Medico\vectra_cure"
venv\Scripts\activate
python app.py
```

Verás:

```
 * Serving Flask app 'app'
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

Abre **http://127.0.0.1:5000** en el navegador.

### 2.3 Desde VS Code

Presiona **F5** y elige *"Vectra Cure — Flask (app.py)"*. Se abre con depurador,
así que puedes poner puntos de interrupción en el código.

### 2.4 Detener el programa

En la terminal donde corre: **`Ctrl + C`**.

Si la terminal se cerró y el servidor quedó colgado, libera el puerto 5000:

```powershell
Get-Process python | Where-Object { $_.Path -like "*vectra_cure*" } | Stop-Process -Force
```

---

## 3. Cuentas de prueba

Vienen con los datos demostrativos (`02_seed_demo_postgresql.sql`).

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| Administrador | `admin@vectra.demo` | `admin123` |
| Especialista | `medico0@vectra.demo` … `medico5@vectra.demo` | `medico123` |
| Paciente | `paciente0@vectra.demo` … `paciente4@vectra.demo` | `paciente123` |

> **No hace falta iniciar sesión para agendar una cita.** El paciente puede
> reservar como invitado; la sesión solo se necesita para el perfil y el panel
> de administración.

---

## 4. Guía de uso: paciente

### 4.1 Buscar un especialista

1. Desde la pantalla de inicio, presiona **"⚡ Probar plataforma / Explorar mapa"**,
   o elige directamente una de las 5 especialidades del catálogo.
2. En el directorio puedes filtrar por especialidad con las etiquetas de arriba.
3. Ordena los resultados con las tres opciones:
   - **⭐ Mejor calificados** *(orden por defecto)*
   - **📍 Más cercanos** — distancia calculada desde el centro-norte de Quito
   - **💵 Más económico**

Cada tarjeta muestra: foto, insignia 🛡️ de verificación, nombre, especialidad,
estrellas, distancia en km, horario y precio aproximado.

### 4.2 Ver el perfil completo

Presiona **"Ver perfil"**. Ahí encuentras la galería del consultorio, la
dirección, el horario, el precio y todas las reseñas de otros pacientes.

### 4.3 Agendar una cita

1. Presiona **"⚡ Agendar cita rápida"**.
2. **Paso 1 — Datos y turno:** nombre, teléfono, correo, fecha, hora y motivo
   breve de consulta.
   - Los turnos son bloques de 2 horas: `08:00`, `10:00`, `12:00`, `14:00`,
     `16:00`, `18:00`.
3. **Paso 2 — Método de pago:**
   - **Pago digital (PayPal Mock)** → se abre una pasarela simulada. Presiona
     *"Aprobar pago simulado"*. La cita queda como **PAGADO · SIMULADO**.
     *No se transfiere dinero real.*
   - **Pago en efectivo (ventanilla)** → no pide tarjeta. La cita queda como
     **PENDIENTE EN VENTANILLA** y el ticket incluye el aviso de saldo pendiente.
4. Aparece la pantalla de confirmación con un **visto verde** y tu código de
   ticket (formato `VC-2026-1234`).

> **Anota o descarga tu código de ticket.** Es lo que necesitas para consultar
> o cancelar la cita después.

### 4.4 Descargar el ticket

En la pantalla de confirmación, presiona **"⬇️ Descargar ticket de cita (.md)"**.
Se descarga un archivo con formato de recibo de caja registradora que incluye
tus datos, los del especialista, el detalle de la cita y el desglose de pago.

### 4.5 Consultar una cita ya agendada

1. En la barra superior, presiona **"Consultar mi cita"**.
2. Escribe tu **código de ticket** (ej. `VC-2026-8942`) **o tu número de teléfono**.
3. Verás la ficha completa con dos acciones: volver a descargar el ticket o
   cancelar la cita.

### 4.6 Cancelar una cita

1. Desde la ficha de tu cita, presiona **"❌ Cancelar cita"**.
2. Elige **uno de los 5 motivos**:
   1. Problemas de horario o imprevisto personal
   2. Encontré atención médica en otro lugar más rápido
   3. Ya no presento molestias o síntomas médicos
   4. Inconveniente con el costo o método de pago
   5. Otros *(habilita un campo de texto opcional)*
3. Presiona **"Confirmar cancelación"**. Verás una animación de procesamiento
   y luego la confirmación.

Si habías pagado con PayPal Mock, el estado cambia a **REEMBOLSADO · SIMULADO**.
El turno queda liberado para otros pacientes de inmediato.

### 4.7 Dejar una reseña

En el perfil del especialista, en el panel derecho: escribe tu nombre, elige de
1 a 5 estrellas y un comentario opcional. La calificación promedio del
especialista se recalcula automáticamente.

---

## 5. Guía de uso: especialista

### 5.1 Registrarse

1. Presiona **"Registrarse"** en la barra superior.
2. Cambia al modo **"🩺 Soy especialista"**.
3. Llena los datos personales (nombre, teléfono, correo, contraseña) y los del
   consultorio:
   - Especialidad (una de las 5)
   - N° de colegiatura
   - Nombre del consultorio y dirección
   - Precio aproximado de la consulta
   - Latitud y longitud *(opcionales — si las dejas vacías se usa una ubicación
     de referencia en Quito)*
   - Horario de atención
   - Foto del consultorio *(opcional)*
4. Al enviar aparece el mensaje de credenciales en revisión y se activa
   automáticamente la insignia 🛡️ **Verificado** *(flujo simulado)*.

Ya puedes iniciar sesión y tu consultorio aparece en el directorio público.

### 5.2 Ver y editar tu ficha

Inicia sesión y presiona tu nombre en la barra superior → **"Ver mi ficha pública"**.
Desde tu perfil puedes actualizar nombre, teléfono y contraseña.

---

## 6. Guía de uso: administrador

Inicia sesión con `admin@vectra.demo` / `admin123`. Serás llevado directamente
al **⚙️ Panel Admin**, que muestra los conteos de usuarios, especialistas,
citas y reseñas.

| Sección | Qué puedes hacer |
| :--- | :--- |
| **Especialistas** | Crear uno nuevo (con foto), editar sus datos, activar/desactivar su ficha, otorgar o retirar la insignia 🛡️ |
| **Citas** | Filtrar por estado; cambiar el estado a Confirmada / Completada / Cancelada / No asistió; eliminar una cita |
| **Reseñas** | Editar el texto o la calificación; eliminar. En ambos casos se recalcula el promedio del especialista |
| **Usuarios** | Ver todas las cuentas; activar o desactivar |

### Notas importantes

- **Desactivar no es borrar.** Los especialistas y usuarios se desactivan
  (baja suave) para no perder el historial de citas y reseñas asociadas.
  Se pueden reactivar en cualquier momento.
- **Las citas sí se eliminan de forma permanente.** No hay deshacer.
- No puedes desactivar tu propia cuenta de administrador.
- Marcar una cita como **Cancelada** desde el panel dispara el mismo reverso
  simulado que la cancelación del paciente.

---

## 7. Solución de problemas

### 7.1 La aplicación no arranca

#### ❌ `RuntimeError: Configuración PostgreSQL incompleta. Faltan: DB_USER, DB_PASSWORD, ...`

**Causa:** no existe el archivo `.env`, o le faltan variables.

**Solución:** copia `.env.example` como `.env` dentro de `vectra_cure\` y
completa las 5 variables: `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`,
`DB_NAME`.

> El archivo debe llamarse exactamente `.env` (con el punto, sin extensión) y
> estar en `vectra_cure\`, no en la raíz del proyecto.

---

#### ❌ `ModuleNotFoundError: No module named 'flask'`

**Causa:** el entorno virtual no está activado, o no instalaste las dependencias.

**Solución:**

```powershell
cd vectra_cure
venv\Scripts\activate       # debe aparecer (venv) en la terminal
pip install -r requirements.txt
```

---

#### ❌ `ModuleNotFoundError: No module named 'psycopg'`

**Causa:** tienes instalado el driver antiguo `psycopg2` en vez de `psycopg` 3.

**Solución:**

```powershell
pip uninstall -y psycopg2-binary
pip install -r requirements.txt
```

---

#### ❌ `Address already in use` / el puerto 5000 está ocupado

**Causa:** quedó otra instancia del servidor corriendo.

**Solución:**

```powershell
Get-Process python | Where-Object { $_.Path -like "*vectra_cure*" } | Stop-Process -Force
```

O ejecuta en otro puerto: `python app.py` y edita la última línea de `app.py`,
o usa `flask --app app run --port 5001`.

---

### 7.2 Problemas de base de datos

#### ❌ `OperationalError: la autentificación password falló para el usuario «postgres»`

**Causa:** la contraseña en `.env` no coincide con la real de PostgreSQL.

**Solución:** corrige `DB_PASSWORD` en `vectra_cure\.env`. Verifica la
contraseña entrando a pgAdmin 4 con ella.

> Si tu contraseña tiene caracteres especiales (`@`, `:`, `/`, `#`), no hay
> problema: la aplicación los codifica automáticamente. No las escapes tú.

---

#### ❌ `OperationalError: (psycopg.errors.ConnectionTimeout) connection timeout expired`

**Causa:** PostgreSQL no está corriendo, o el puerto de `.env` es incorrecto.

**Solución:**

```powershell
Get-Service postgresql*          # debe decir Running
Start-Service postgresql-x64-18  # si está detenido
```

Y confirma que `DB_PORT=5432` en el `.env`.

---

#### ⚠️ La página muestra *"Servicio temporalmente no disponible"* (error 503)

**Causa:** la aplicación conecta a PostgreSQL, pero las tablas no existen o el
esquema no coincide.

**Solución:** ejecuta los scripts de `database/` en orden (sección 2.1, paso 3).
Verifica también que `DB_NAME=vectra_cure` sea la base correcta.

> Esta pantalla es **intencional**: reemplaza el mensaje de error técnico para
> no exponer consultas SQL, rutas internas ni credenciales al visitante. El
> detalle real queda en la consola donde corre el servidor.

---

#### ❌ `ERROR: relation "usuarios" already exists` al correr los scripts

**Causa:** ya cargaste el esquema y volviste a ejecutar `01_schema_postgresql.sql`.

**Solución:** es esperado; simplemente no lo vuelvas a ejecutar. Si necesitas
empezar de cero, borra la base en pgAdmin (clic derecho → *Delete/Drop*) y
vuelve a correr los 4 scripts desde el `00`.

---

### 7.3 Problemas al usar la aplicación

| Situación | Qué significa | Qué hacer |
| :--- | :--- | :--- |
| *"Ese turno ya está reservado. Elige otro horario."* | Otro paciente tomó ese bloque con ese mismo especialista | Elige otra hora o fecha |
| *"Cita no encontrada. Revisa el código o el teléfono."* | El código no existe o está mal escrito | Verifica el formato: `VC-2026-1234`. También puedes buscar por teléfono |
| *"Esta cita ya estaba cancelada."* | Intentas cancelar dos veces | No hay nada que hacer; ya está cancelada |
| *"Correo o contraseña incorrectos."* | Credenciales erradas **o** cuenta desactivada | Revisa los datos; si un admin desactivó la cuenta, debe reactivarla |
| *"Ya existe una cuenta con ese correo."* | Ese correo ya está registrado | Inicia sesión o usa otro correo |
| *"Debes iniciar sesión para acceder a esa página."* | Ruta protegida sin sesión | Inicia sesión |
| *"No tienes permisos para acceder a esa página."* | Tu rol no alcanza (ej. paciente entrando al panel admin) | Entra con una cuenta de administrador |
| *"La contraseña debe tener al menos 6 caracteres."* | Contraseña muy corta al registrarte | Usa 6 caracteres o más |
| *"La calificación debe estar entre 1 y 5 estrellas."* | Valor de reseña fuera de rango | Elige de 1 a 5 |
| *"Solo se permiten imágenes JPG, JPEG, PNG, GIF o WEBP."* | Formato de archivo no admitido | Convierte la imagen a uno de esos formatos |
| *"La imagen no puede superar los 5 MB."* | Archivo demasiado grande | Reduce el tamaño de la imagen |
| *"El campo X es obligatorio."* | Falta un dato requerido | Complétalo |
| *"El correo electrónico no tiene un formato válido."* | Correo mal escrito | Revisa que tenga `@` y dominio |

---

### 7.4 Los estilos se ven mal o la página se ve "sin diseño"

**Causa:** Bootstrap y las tipografías (Plus Jakarta Sans e Inter) se cargan
desde Internet mediante CDN.

**Solución:** revisa tu conexión. Sin Internet la aplicación funciona, pero se
ve sin formato.

---

### 7.5 Cómo leer los errores en la consola

Cuando `APP_DEBUG=true` en el `.env`, la terminal muestra el detalle completo de
cualquier fallo. Ahí verás también los mensajes normales de operación:

```
INFO in app: Notificación simulada -> paciente@correo.com / 0999 (ticket VC-2026-4102)
INFO in app: Reverso simulado emitido para ticket VC-2026-4102
```

Estos **no son errores**: confirman que la notificación y el reverso simulados
se ejecutaron.

---

## 8. Mensajes del sistema

Los avisos aparecen como barras de color en la parte superior:

| Color | Significado | Ejemplo |
| :--- | :--- | :--- |
| 🟢 Verde | Operación exitosa | *"¡Cita confirmada! Se envió el aviso a tu teléfono y correo."* |
| 🔴 Rojo | Error que debes corregir | *"Correo o contraseña incorrectos."* |
| 🟡 Amarillo | Advertencia, no bloquea | *"Esta cita ya estaba cancelada."* |

### Estados de una cita

| Estado | Significado |
| :--- | :--- |
| **Confirmada** | Turno reservado y activo |
| **Completada** | El paciente asistió a la consulta |
| **Cancelada** | Anulada por el paciente o por administración |
| **No asistió** | El paciente no llegó dentro de la tolerancia de 15 minutos |

### Estados de pago

| Estado | Significado |
| :--- | :--- |
| **Pagado · transacción simulada** | Se aprobó con PayPal Mock |
| **Pendiente · pago en ventanilla** | Se paga en efectivo en el consultorio |
| **Reembolso simulado emitido** | Se canceló una cita que estaba pagada |

---

## 9. Reglas y límites del sistema

| Regla | Valor |
| :--- | :--- |
| Especialidades disponibles | Medicina General, Odontología, Dermatología, Veterinaria, Pediatría |
| Bloques horarios | 08:00 · 10:00 · 12:00 · 14:00 · 16:00 · 18:00 (bloques de 2 h) |
| Doble reserva | No permitida: un especialista no puede tener dos citas activas en el mismo bloque |
| Tolerancia de inasistencia | 15 minutos |
| Tasa de plataforma al paciente | **$0.00 USD** |
| Contraseña mínima | 6 caracteres |
| Calificación de reseñas | 1 a 5 estrellas |
| Tamaño máximo de imagen | 5 MB |
| Formatos de imagen | JPG, JPEG, PNG, GIF, WEBP |
| Formato del código de ticket | `VC-AAAA-NNNN` (ej. `VC-2026-8942`) |

### Lo que está simulado

Este es un proyecto académico. **No se transfiere dinero real ni se envían
mensajes reales.** Concretamente:

- La pasarela **PayPal Mock** solo cambia el estado de la cita
- El **reverso / reembolso** solo cambia el estado de pago
- Las **notificaciones** por WhatsApp y correo se registran en la consola, no se envían
- La **verificación de credenciales** del especialista es automática e inmediata
- El **mapa** es una representación estática; la distancia sí se calcula de
  verdad con la fórmula de haversine sobre las coordenadas reales

---

## 10. Ejecutar las pruebas

Son 13 pruebas automatizadas. Usan SQLite en memoria, así que **no tocan tu
base PostgreSQL**:

```powershell
cd vectra_cure
venv\Scripts\activate
python -m unittest discover -s tests -v
```

Debe terminar en `OK`.

> Una de las pruebas (`test_esquema_faltante_no_expone_el_depurador`) borra las
> tablas a propósito para comprobar que la aplicación responde con la pantalla
> 503 sin filtrar trazas de SQL. Los mensajes de error que imprime en la consola
> durante esa prueba son **esperados**.

También puedes correrlas desde VS Code: **F5** → *"Vectra Cure — Pruebas (unittest)"*,
o desde el panel de pruebas (ícono del matraz).

---

## Referencias

| Documento | Contenido |
| :--- | :--- |
| [`FLUJO_DE_TRABAJO.md`](FLUJO_DE_TRABAJO.md) | Reparto de tareas y flujo de Git en equipo |
| [`vectra_cure/README.md`](vectra_cure/README.md) | Estructura técnica de la aplicación |
| [`vectra_cure/CONTRATO_MODELOS.md`](vectra_cure/CONTRATO_MODELOS.md) | Contrato entre la aplicación y la capa de datos |
| [`database/README.md`](database/README.md) | Scripts SQL y orden de ejecución |
| [`database/ESQUEMA_Y_CONTEXTO.md`](database/ESQUEMA_Y_CONTEXTO.md) | Modelo relacional explicado |
| [`03_USER_FLOW_AND_BOOKING.md`](03_USER_FLOW_AND_BOOKING.md) | Flujo de reserva y formato del ticket |
| [`06_SITEMAP_AND_USER_FLOWS.md`](06_SITEMAP_AND_USER_FLOWS.md) | Mapa de pantallas y diagramas de flujo |
