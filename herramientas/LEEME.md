# Cómo actualizar el portal

Guía corta para la Junta Directiva. El portal se publica desde la rama `master`
de este repositorio en GitHub Pages.

## 1. Actuaciones (tablero «Así vamos»)

La fuente es la hoja de Google Drive **«Registro de actuaciones — JAC Los Profesionales»**,
en la carpeta *Comunidad y trámites › JAC Los Profesionales — Portal web*.

Una fila por actuación. Columnas:

| Columna | Qué poner |
|---|---|
| `estado` | **Ya se hizo**, **En trámite** o **Esperando respuesta** |
| `fecha` | Día en que se radicó o se hizo, como `2026-11-15` |
| `numero` | Oficio o radicado (`JAC-012-2026`, `2026PQR12345`). Vacío si no tiene |
| `titulo` | Qué se pidió o qué se hizo, en palabras sencillas |
| `entidad` | A quién se dirigió |
| `plazo_dias` | 15 en general · 10 si se pidieron documentos o información · 0 si no aplica |
| `novedades` | Una por línea dentro de la celda (Alt+Enter): `2026-11-20: Respondió Planeación (oficio 2026EE-1234).` |
| `pendiente` | Lo que falta. Puede quedar vacío |

Cuando llegue una respuesta: agregue una línea en `novedades` y cambie el `estado`.

**Para publicar los cambios**, cualquiera de estas dos vías:

- Pedírselo a Claude: *«actualiza el portal desde el registro de actuaciones del Drive»*.
- O a mano: en la hoja, *Archivo › Descargar › Valores separados por comas (.csv)*, y luego:

  ```
  python herramientas/actualizar_actuaciones.py importar "ruta/al/archivo.csv"
  git add js/actuaciones.js && git commit -m "Actualizar actuaciones" && git push
  ```

El script revisa las fechas y **se niega a publicar** si encuentra algo que parezca un
teléfono o una cédula.

### Reglas de oro

- Solo lo que tenga soporte: oficio, radicado o respuesta escrita.
- Nada de datos personales: ni cédulas, ni teléfonos, ni direcciones de vecinos, ni
  nombres de particulares (por ejemplo, dueños de predios).
- Los litigios y trámites personales no van en el portal.

### Fotos de las actuaciones

Las fotos van en `img/actuaciones/` en dos tamaños: `nombre.jpg` (1280 px) y
`nombre-sm.jpg` (640 px), sin metadatos (se quitan la fecha, el celular y el GPS).
En la hoja, la columna opcional `fotos` lleva una por línea: `nombre.jpg | descripción`.
Si la hoja no tiene esa columna, el script conserva las fotos ya publicadas.

Antes de publicar una foto: que no se vean caras, placas legibles, números de casa
ni letreros con teléfonos. Si aparecen, se difuminan o se escoge otra.

## 2. Próxima Asamblea

En `js/actuaciones.js`, bloque `asamblea`:

```js
asamblea: {
    estado: 'convocada',          // 'por-convocar' mientras no haya fecha
    fecha: '2026-11-28',          // AAAA-MM-DD
    hora: '18:30',                // 24 horas
    lugar: 'Dirección o sitio',
    modalidad: 'Mixta: presencial y virtual'
},
```

Con eso el portal muestra la fecha, la cuenta regresiva y el botón
«Agregar a mi calendario». Revise también el texto de la sección Asamblea y el aviso
superior en `index.html`.

## 3. Correos que llegan desde el portal

Todo llega a **jaclosprofesionales@gmail.com** a través de FormSubmit, con asuntos que
empiezan por `[Web JAC]`:

- `[Web JAC] <trámite> · WEB-AAAAMMDD-XXXX — <nombre>`: solicitudes. El número `WEB-…`
  es el que el vecino ve en pantalla; úselo al responder.
- `[Web JAC] Quiero recibir los avisos — <nombre>`: agregar ese correo a la lista de avisos.
- `[Web JAC] Opinión estatutos …`: comentarios sobre la reforma.

La primera vez, FormSubmit envía un correo de **activación** a la cuenta de la Junta:
hay que abrirlo y confirmar. Sin eso, los formularios no entregan mensajes.
(El correo de la Junta quedó activado el 11 de noviembre de 2026.)

Nota técnica: los formularios envían los datos en formato JSON. FormSubmit responde
«Server Error» si se le envían como formulario multipart (FormData), así que no cambie
esa parte de `js/main.js` ni de `estatutos.html`.

Para enviar avisos a la lista, escriba desde la cuenta de la Junta poniendo a los
suscriptores en **CCO** (copia oculta), para no exponer los correos de los vecinos.
