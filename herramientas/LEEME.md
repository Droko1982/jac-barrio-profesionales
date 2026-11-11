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
| `novedades` | Una por línea dentro de la celda (Alt+Enter), con su tipo entre corchetes: `2026-11-20 [respuesta]: Respondió Planeación (oficio 2026EE-1234).` Tipos: `enviado` (la Junta envió un oficio, petición o escrito; `enviado x2` si salieron dos), `respuesta` (una entidad respondió o actuó), `visita` (visita técnica, reunión o asamblea), `avance` (publicación o resultado), `antecedente` (antes de esta Junta). Con esto se arman las cifras y la tabla de «La gestión mes a mes». Si una línea no trae tipo, se conserva el que ya estaba publicado. Los pasos `enviado` deben sumar lo mismo que la columna `enviados` (el script avisa si no). |
| `pendiente` | Lo que falta. Puede quedar vacío |
| `fotos` | Opcional. Una por línea: `nombre.jpg \| descripción` (ver «Fotos») |
| `documentos` | Opcional. Uno por línea: `nombre.pdf \| descripción` (ver «Documentos») |

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
- Los procesos que adelanta la Junta (impugnaciones, acciones populares) sí van, contados
  con hechos, fechas y radicados, sin calificar ni acusar a personas. Los trámites
  personales de los dignatarios no van.

### Fotos de las actuaciones

Las fotos van en `img/actuaciones/` en dos tamaños: `nombre.jpg` (1280 px) y
`nombre-sm.jpg` (640 px), sin metadatos (se quitan la fecha, el celular y el GPS).
En la hoja, la columna opcional `fotos` lleva una por línea: `nombre.jpg | descripción`.
Si la hoja no tiene esa columna, el script conserva las fotos ya publicadas.

Antes de publicar una foto: que no se vean caras, placas legibles, números de casa
ni letreros con teléfonos. Si aparecen, se difuminan o se escoge otra.

### Documentos (cartas y respuestas en PDF)

Van en `documentos/` y **siempre tachados** con `herramientas/publicar_documento.py`
(requiere `pip install pymupdf`). La herramienta borra de verdad —no solo tapa— los números
de cédula, celulares, correos personales, la dirección de residencia del presidente, los
códigos de validación de la Alcaldía y la Personería (con ellos cualquiera descarga el
original sin tachar) y los metadatos.

1. Ver qué tiene el documento (imágenes numeradas y una cuadrícula en puntos):

   ```
   python herramientas/publicar_documento.py analizar "carta.pdf" vista
   ```

2. Publicarlo, retirando las firmas y los códigos QR que muestre el análisis:

   ```
   python herramientas/publicar_documento.py publicar "carta.pdf" documentos/JAC-014-2026-tema.pdf ^
       --quitar 3:1 3:2:qr --vista vista
   ```

   Otras opciones: `--zona PAG:x0,y0,x1,y1` para tachar a mano (firmas en escaneos, placas
   en fotos), `--texto "Nombre Apellido"` para nombres de particulares (por ejemplo, dueños
   de predios), `--paginas 1-3` para no publicar hojas de firmas y `--comprimir` solo para
   escaneos. No use `--comprimir` en carteleras con fondos de color.

3. **Abrir siempre la vista previa** (carpeta `vista`) y revisar página por página antes
   de publicar. Si el programa escribe «¡QUEDA!», algo no se tachó.

En la hoja, la columna `documentos` lleva uno por línea: `JAC-014-2026-tema.pdf | Oficio
JAC-014-2026 (15 nov 2026)`. Si la hoja no tiene esa columna, se conservan los publicados.

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
- `[Web JAC] Negocio para el directorio — <nombre>`: un vecino quiere publicar su negocio
  (ver sección 4).

La primera vez, FormSubmit envía un correo de **activación** a la cuenta de la Junta:
hay que abrirlo y confirmar. Sin eso, los formularios no entregan mensajes.
(El correo de la Junta quedó activado el 11 de noviembre de 2026.)

Nota técnica: los formularios envían los datos en formato JSON. FormSubmit responde
«Server Error» si se le envían como formulario multipart (FormData), así que no cambie
esa parte de `js/main.js` ni de `estatutos.html`.

Para enviar avisos a la lista, escriba desde la cuenta de la Junta poniendo a los
suscriptores en **CCO** (copia oculta), para no exponer los correos de los vecinos.

## 4. Negocios del barrio (directorio)

Los negocios publicados están en `js/negocios.js`. Cuando llegue un correo
«Negocio para el directorio»:

1. Confirme con la persona por el contacto que dejó (ese contacto **no** se publica).
2. Copie el bloque de ejemplo de `js/negocios.js`, quítele los `/* */` y complételo solo
   con los datos que la persona autorizó. Categorías: `comida`, `salud`, `belleza`,
   `hogar`, `profesional`, `educacion`, `tienda`, `tecnologia`, `mascotas`,
   `transporte`, `otro`.
3. Publique (`git add js/negocios.js`, commit y push) o pídaselo a Claude.

Si alguien pide corregir o retirar su negocio, hágalo de inmediato (Ley 1581 de 2012).
Con 4 o más negocios, el portal muestra botones para filtrar por tipo.

## 5. Teléfonos útiles

Están en `index.html`, bloque `id="telefonos"` (dentro de «¿Qué necesitas?»). Solo números
verificados en fuentes oficiales; revise la fecha de la nota de fuentes cuando los cambie.

El **cuadrante 17** de la Policía (el del barrio) es el 312 822 1634, confirmado por la Junta
Directiva en noviembre de 2026. Si cambia, actualícelo en `index.html` y en `cartelera.html`.

## 6b. WhatsApp de la Secretaria

Solo se publica como enlace para **afiliarse** (inscribirse en el libro de afiliados): la
tarjeta «Afiliarme a la Junta», el paso «Afiliarme o verificar» de la Asamblea y la pregunta
«¿Cómo me afilio?». El número no aparece escrito en la página. Las solicitudes siguen
llegando al correo de la Junta.

## 6. Libro de cuentas

Está en `js/cuentas.js` y se ve en la sección Transparencia (`#cuentas`). Para registrar un
movimiento, agregue una línea en `movimientos`, en orden de fecha:

```js
{ fecha: '2026-12-01', tipo: 'gasto', valor: 30000, concepto: 'Fotocopias de la convocatoria' },
```

Tipos: `ingreso` (dinero propio que entra), `prestamo` (dinero prestado a la Junta),
`gasto` (dinero que sale) y `abono` (pago de un préstamo). La página suma sola lo que entra,
lo que sale, lo que queda en caja y lo que se debe. Guarde los recibos: se presentan a la
Asamblea y cualquier afiliado puede pedir verlos. Revise también el resumen «Cuentas de la
Junta» del Informe General en `index.html` si cambian las cifras.
