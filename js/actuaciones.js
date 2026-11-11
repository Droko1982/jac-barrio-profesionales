/* ==========================================================================
   ACTUACIONES DE LA JUNTA — fuente única de datos del portal
   --------------------------------------------------------------------------
   Este archivo alimenta: el tablero «Así vamos», la línea de tiempo, los
   contadores del informe, la cartelera imprimible y la ficha de la Asamblea.

   Se genera desde la hoja de Google Drive «Registro de actuaciones» con:
       python herramientas/actualizar_actuaciones.py registro.csv
   (ver herramientas/LEEME.md). También se puede editar a mano con cuidado.

   REGLAS
   - Solo se publica lo que tiene soporte (oficio, radicado o respuesta).
   - Nada de datos personales: ni cédulas, ni teléfonos, ni direcciones
     de vecinos, ni nombres de particulares.
   - Fechas en formato AAAA-MM-DD.

   CAMPOS DE CADA ACTUACIÓN
   estado     'hecho'   → ya se hizo (cumplido o respondido de fondo)
              'tramite' → solicitado, con avance o respuesta parcial
              'espera'  → solicitado, sin respuesta todavía
   fecha      día en que se radicó o se realizó
   numero     oficio o radicado ('' si no tiene)
   titulo     qué se hizo o qué se pidió, en palabras sencillas
   entidad    a quién se dirigió o quién lo hizo
   plazo      días hábiles que da la ley para responder (Ley 1755 de 2015:
              15 en general, 10 para documentos o información). 0 = no aplica
   novedades  lista de [fecha, texto], de la más antigua a la más reciente
   pendiente  lo que falta (texto corto; '' si nada)
   fotos      lista de [archivo.jpg, descripción] en img/actuaciones/
              (con su versión archivo-sm.jpg; placas difuminadas, sin rostros)
   documentos lista de [archivo.pdf, descripción] en documentos/. Solo PDF
              tachados con herramientas/publicar_documento.py: sin cédulas,
              teléfonos, correos personales, direcciones particulares ni firmas.
   ========================================================================== */

window.JAC_DATOS = {
    actualizado: '2026-11-11',

    /* Próxima Asamblea General.
       Al convocarla: estado 'convocada' y completa fecha (AAAA-MM-DD),
       hora ('18:30') y lugar. El portal mostrará la cuenta regresiva y el
       botón «Agregar a mi calendario». */
    asamblea: {
        estado: 'por-convocar',
        fecha: '',
        hora: '',
        lugar: '',
        modalidad: ''
    },

    /* Lista generada por herramientas/actualizar_actuaciones.py — se puede editar a mano
       respetando el formato JSON (comillas dobles, sin coma al final). */
    actuaciones: /* INICIO-ACTUACIONES */
[
    {
        "estado": "espera",
        "fecha": "2026-05-22",
        "numero": "",
        "titulo": "Basuras dejadas en la vía pública por establecimientos comerciales del sector",
        "entidad": "Secretaría de Gobierno · Inspección de Policía Comuna 10",
        "plazo": 15,
        "enviados": 1,
        "novedades": [
            ["2026-05-22", "Derecho de petición radicado.", "enviado"]
        ],
        "pendiente": "Respuesta y medidas de las autoridades.",
        "fotos": [
            ["basuras-comercio-1.jpg", "Basuras regadas junto a un árbol, sobre la vía pública (22 may 2026)"],
            ["basuras-comercio-2.jpg", "Bolsas y residuos acumulados al pie de un árbol (22 may 2026)"],
            ["basuras-comercio-3.jpg", "Empaques, bandejas y bolsas tirados en el andén (22 may 2026)"],
            ["basuras-comercio-4.jpg", "Basuras junto a un poste del barrio (22 may 2026)"]
        ],
        "documentos": [
            ["basuras-2026-05-22-derecho-de-peticion.pdf", "Derecho de petición de la Junta (22 may 2026)"]
        ]
    },
    {
        "estado": "espera",
        "fecha": "2026-07-02",
        "numero": "JAC-003-2026",
        "titulo": "Información sobre presupuesto participativo y postulación de dos proyectos: cámaras de seguridad y caseta comunal",
        "entidad": "Unidad de Participación Ciudadana · Planeación Municipal",
        "plazo": 10,
        "enviados": 1,
        "novedades": [
            ["2026-07-02", "Petición radicada.", "enviado"]
        ],
        "pendiente": "Respuesta de la Alcaldía.",
        "fotos": [],
        "documentos": [
            ["JAC-003-2026-presupuesto-participativo.pdf", "Petición JAC-003-2026 (2 jul 2026)"]
        ]
    },
    {
        "estado": "espera",
        "fecha": "2026-07-02",
        "numero": "JAC-006-2026",
        "titulo": "Titularidad de dos predios del barrio y comodato de uno de ellos para una sede comunal",
        "entidad": "Planeación · Hacienda (Bienes) · Secretaría de Gobierno",
        "plazo": 10,
        "enviados": 1,
        "novedades": [
            ["2026-07-02", "Petición radicada.", "enviado"]
        ],
        "pendiente": "Respuesta de la Alcaldía.",
        "fotos": [],
        "documentos": [
            ["JAC-006-2026-predios-comodato.pdf", "Petición JAC-006-2026 (2 jul 2026)"]
        ]
    },
    {
        "estado": "espera",
        "fecha": "2026-10-02",
        "numero": "JAC-011-2026",
        "titulo": "Registrar el correo jaclosprofesionales@gmail.com como canal oficial de la Junta para comunicaciones y notificaciones",
        "entidad": "Unidad de Participación Ciudadana · Secretaría de Desarrollo Social",
        "plazo": 15,
        "enviados": 1,
        "novedades": [
            ["2026-10-02", "Oficio radicado.", "enviado"]
        ],
        "pendiente": "Confirmación de la Unidad de Participación Ciudadana.",
        "fotos": [],
        "documentos": [
            ["JAC-011-2026-canal-oficial.pdf", "Oficio JAC-011-2026 (2 oct 2026)"]
        ]
    },
    {
        "estado": "espera",
        "fecha": "2026-10-02",
        "numero": "JAC-012-2026 · JAC-013-2026",
        "titulo": "Elección de dignatarios de ASOCOMUNAL Comuna 10: la Junta la impugnó y pide que se decida",
        "entidad": "Federación Comunal del Quindío · Unidad de Participación Ciudadana",
        "plazo": 15,
        "enviados": 6,
        "novedades": [
            ["2026-07-22", "La Junta pidió a la Unidad de Participación Ciudadana intervenir en el proceso electoral de ASOCOMUNAL Comuna 10 antes de la elección, por posibles irregularidades.", "enviado"],
            ["2026-07-25", "La Junta pidió información y copias a ASOCOMUNAL y a su Tribunal de Garantías (JAC-007-2026) y acompañamiento urgente a la Unidad (JAC-008-2026).", "enviado", 2],
            ["2026-07-26", "ASOCOMUNAL Comuna 10 realizó la elección de sus dignatarios 2026–2030.", "avance"],
            ["2026-08-10", "La Junta presentó una demanda de impugnación contra esa elección.", "enviado"],
            ["2026-08-26", "La Unidad respondió que aún no encontraba elementos suficientes para declarar viciado el proceso y que seguía verificando ocho puntos (oficio SO-PSP-3919).", "respuesta"],
            ["2026-09-07", "La Unidad envió la demanda a la Federación Comunal del Quindío y anunció que no inscribirá a los dignatarios mientras haya vicios sin subsanar (oficio SO-PSP-4029).", "respuesta"],
            ["2026-10-02", "La Junta pidió a las federaciones el estado de la demanda (JAC-012-2026) y a la Unidad, el resultado de su verificación (JAC-013-2026).", "enviado", 2]
        ],
        "pendiente": "Que la federación competente decida la demanda (la ley le da hasta 4 meses) y que la Unidad entregue el resultado de su verificación.",
        "fotos": [],
        "documentos": [
            ["asocomunal-2026-07-22-solicitud-intervencion.pdf", "Solicitud de intervención (22 jul 2026)"],
            ["JAC-007-2026-asocomunal-informacion.pdf", "Oficio JAC-007-2026 a ASOCOMUNAL (25 jul 2026)"],
            ["JAC-008-2026-asocomunal-acompanamiento.pdf", "Oficio JAC-008-2026 a la Unidad (25 jul 2026)"],
            ["JAC-012-2026-asocomunal-federacion.pdf", "Oficio JAC-012-2026 a las federaciones (2 oct 2026)"],
            ["JAC-013-2026-asocomunal-seguimiento.pdf", "Oficio JAC-013-2026 a la Unidad (2 oct 2026)"]
        ]
    },
    {
        "estado": "tramite",
        "fecha": "2026-05-22",
        "numero": "2026PQR22891",
        "titulo": "Cables aéreos sueltos y a baja altura en la Calle 5 Norte (entre carreras 14 y 15) y en la Calle 7 con Carrera 12",
        "entidad": "Alcaldía (Planeación) · EDEQ · Personería",
        "plazo": 15,
        "enviados": 1,
        "novedades": [
            ["2026-05-22", "Petición radicada ante la Alcaldía y EDEQ.", "enviado"],
            ["2026-06-09", "EDEQ inspeccionó: los cables son de empresas de telecomunicaciones, no de EDEQ.", "visita"],
            ["2026-06-11", "La Personería le pidió a EDEQ una respuesta de fondo (oficio 2026EE-2526).", "respuesta"],
            ["2026-06-12", "Planeación visitó los dos puntos y trasladó el caso a EDEQ (oficio 2026EE-9290).", "visita"],
            ["2026-06-16", "Planeación informó el traslado a la Junta (oficio 2026EE-9360).", "respuesta"]
        ],
        "pendiente": "Confirmar que las empresas dueñas de los cables los retiren o ajusten.",
        "fotos": [
            ["cables-poste.jpg", "Cables sueltos y enredados en un poste del barrio (22 may 2026)"],
            ["cables-anden.jpg", "Cable suelto a baja altura sobre un andén (22 may 2026)"]
        ],
        "documentos": [
            ["cables-2026-05-22-derecho-de-peticion.pdf", "Derecho de petición de la Junta (22 may 2026)"],
            ["cables-EDEQ-respuesta-2026-06-09.pdf", "Respuesta de EDEQ (9 jun 2026)"],
            ["cables-Personeria-2026EE-2526.pdf", "Seguimiento de la Personería, 2026EE-2526 (11 jun 2026)"],
            ["cables-2026EE-9290-traslado-EDEQ.pdf", "Traslado de Planeación a EDEQ, 2026EE-9290 (12 jun 2026)"],
            ["cables-2026EE-9360-respuesta-planeacion.pdf", "Respuesta de Planeación a la Junta, 2026EE-9360 (16 jun 2026)"]
        ]
    },
    {
        "estado": "tramite",
        "fecha": "2026-05-22",
        "numero": "2026PQR22936",
        "titulo": "Predio de la cancha (Calle 5 Norte con Carrera 16): limpieza, mantenimiento y comodato para la comunidad",
        "entidad": "Desarrollo Social · Planeación · Catastro · Hacienda · Bienes · EDUA · EPA · Personería",
        "plazo": 15,
        "enviados": 1,
        "novedades": [
            ["2026-05-22", "Petición radicada.", "enviado"],
            ["2026-06-09", "Desarrollo Social repartió la petición entre las dependencias competentes (oficio SO-PSP-2491).", "respuesta"],
            ["2026-06-12", "La Personería hizo seguimiento a la petición (oficio 2026EE-2535).", "respuesta"],
            ["2026-06-16", "EPA: la limpieza no procede porque el predio está cerrado; trasladó el caso a Planeación e Infraestructura (oficio GA-939).", "respuesta"],
            ["2026-06-17", "La Personería informó a la Junta el seguimiento que hizo (oficio 2026EE-2600).", "respuesta"],
            ["2026-06-19", "Planeación: el predio no es del Municipio; es de propiedad privada (oficio 2026EE-9573).", "respuesta"]
        ],
        "pendiente": "La mesa de trabajo que Desarrollo Social quedó de programar (aún sin fecha).",
        "fotos": [
            ["cancha-malla.jpg", "Malla dañada del predio de la cancha (enero de 2026)"],
            ["cancha-cerramiento.jpg", "Cerramiento del predio de la cancha visto desde el andén (22 may 2026)"],
            ["cancha-puesto.jpg", "Puesto comercial dentro del predio de la cancha (22 may 2026)"],
            ["cancha-maleza-1.jpg", "Maleza y basura dentro del predio (22 may 2026)"],
            ["cancha-maleza-2.jpg", "Vegetación crecida dentro del predio (22 may 2026)"]
        ],
        "documentos": [
            ["cancha-2026-05-22-derecho-de-peticion.pdf", "Derecho de petición de la Junta (22 may 2026)"],
            ["cancha-SO-PSP-2491-desarrollo-social.pdf", "Respuesta de Desarrollo Social, SO-PSP-2491 (9 jun 2026)"],
            ["cancha-GA-939-EPA.pdf", "Respuesta de EPA, GA-939 (16 jun 2026)"],
            ["cancha-Personeria-2026EE-2600.pdf", "Comunicación de la Personería, 2026EE-2600 (17 jun 2026)"],
            ["cancha-2026EE-9573-planeacion.pdf", "Respuesta de Planeación, 2026EE-9573 (19 jun 2026)"]
        ]
    },
    {
        "estado": "tramite",
        "fecha": "2026-06-11",
        "numero": "JAC-002-2026 · 2026PQR26154",
        "titulo": "Tala controlada de un árbol en riesgo de caída y manejo de un guadual en la Carrera 16 N.° 4N-39, frente al Restaurante Omedeto",
        "entidad": "Planeación · Gestión del Riesgo (OMGERD) · Secretaría de Gobierno",
        "plazo": 15,
        "enviados": 1,
        "novedades": [
            ["2026-03-09", "Planeación visitó el sitio y su informe técnico recomendó la tala controlada. La comunidad lo venía pidiendo desde 2022.", "visita"],
            ["2026-06-11", "La Junta pidió ejecutar la tala y el manejo del guadual (oficio JAC-002-2026).", "enviado"],
            ["2026-07-08", "Planeación respondió y recomendó la tala del árbol y el manejo del guadual (oficio 2026EE-10728).", "respuesta"]
        ],
        "pendiente": "Que se ejecute la intervención.",
        "fotos": [],
        "documentos": [
            ["arbol-JAC-002-2026-solicitud.pdf", "Solicitud de la Junta, JAC-002-2026 (11 jun 2026)"],
            ["arbol-2026EE-10728-respuesta-planeacion.pdf", "Respuesta de Planeación, 2026EE-10728 (8 jul 2026)"]
        ]
    },
    {
        "estado": "tramite",
        "fecha": "2026-07-07",
        "numero": "Acción popular 2026-00180",
        "titulo": "Calle 6 Norte entre carreras 16 y 17: reparación completa de la vía, el andén y el alcantarillado",
        "entidad": "Juzgado 3.º Administrativo de Armenia · Secretaría de Infraestructura · EPA",
        "plazo": 0,
        "enviados": 2,
        "novedades": [
            ["2025-11-13", "Antecedente: un residente del sector, hoy presidente de la Junta, pidió a Infraestructura y a EPA visita técnica y reparación de la vía.", "antecedente"],
            ["2026-02-11", "Un juez de tutela (Juzgado 3.º Penal del Circuito) ordenó a Infraestructura y a EPA responder de fondo esa solicitud.", "antecedente"],
            ["2026-02-13", "EPA e Infraestructura visitaron el tramo y reportaron deterioro significativo del pavimento (informe GRTAR-135).", "antecedente"],
            ["2026-07-03", "Infraestructura y EPA hicieron una nueva visita técnica conjunta al tramo.", "visita"],
            ["2026-07-07", "La Junta y el residente presentaron una acción popular ante el Juzgado 3.º Administrativo de Armenia.", "enviado"],
            ["2026-07-31", "El juzgado decretó una medida cautelar sobre el tramo mientras decide el caso.", "respuesta"],
            ["2026-09-18", "La Junta informó al juzgado que la medida cautelar se cumplió solo en parte y pidió fijar la audiencia de pacto de cumplimiento.", "enviado"]
        ],
        "pendiente": "Que el juzgado fije la audiencia de pacto de cumplimiento y se acuerde la reparación completa, con fechas.",
        "fotos": [
            ["calle6-hueco.jpg", "Hueco acordonado en la vía (22 dic 2025)"],
            ["calle6-tapa-1.jpg", "Pavimento hundido y roto alrededor de una tapa de alcantarillado (22 dic 2025)"],
            ["calle6-socavon.jpg", "Socavón bajo el pavimento (22 dic 2025)"],
            ["calle6-tapa-2.jpg", "Tapa de alcantarillado con el pavimento roto (22 dic 2025)"],
            ["calle6-tapa-3.jpg", "Grietas alrededor de una tapa de alcantarillado (22 dic 2025)"],
            ["calle6-via.jpg", "Placas de concreto agrietadas en la Calle 6 Norte (22 dic 2025)"],
            ["calle6-anden.jpg", "Andén levantado y roto en la Calle 6 Norte (2026)"]
        ],
        "documentos": [
            ["calle6-2026-02-11-fallo-tutela.pdf", "Fallo de tutela de segunda instancia (11 feb 2026)"],
            ["calle6-GRTAR-135-informe-EPA.pdf", "Informe de la visita de EPA, GRTAR-135 (13 feb 2026)"],
            ["calle6-2026-07-07-accion-popular.pdf", "Demanda de acción popular (7 jul 2026)"],
            ["calle6-2026-09-18-pronunciamiento.pdf", "Escrito de la Junta al juzgado (18 sep 2026)"]
        ]
    },
    {
        "estado": "tramite",
        "fecha": "2026-09-18",
        "numero": "",
        "titulo": "Asamblea General: volver a convocarla con el libro de afiliados al día",
        "entidad": "Junta Directiva · Secretaría",
        "plazo": 0,
        "enviados": 0,
        "novedades": [
            ["2026-09-18", "Asamblea General convocada, presencial y virtual: no se alcanzó el quórum. Se adelantó la depuración del libro de afiliados.", "visita"],
            ["2026-11-11", "La Junta invita a quienes ya no puedan participar a pedir su retiro voluntario del libro de afiliados.", "avance"]
        ],
        "pendiente": "Terminar la depuración del libro de afiliados (en espera) y convocar de nuevo la Asamblea (fecha por definir).",
        "fotos": [],
        "documentos": [
            ["asamblea-2026-09-18-convocatoria.pdf", "Convocatoria a la Asamblea del 18 de septiembre de 2026"]
        ]
    },
    {
        "estado": "hecho",
        "fecha": "2026-04-26",
        "numero": "SO-PSP-1038",
        "titulo": "Reorganización de la Junta: petición de los vecinos, asamblea y elección de la directiva 2026–2030",
        "entidad": "Vecinos del barrio · Unidad de Participación Ciudadana",
        "plazo": 0,
        "enviados": 1,
        "novedades": [
            ["2026-02-13", "La Unidad de Participación Ciudadana certificó la renuncia de los dignatarios anteriores y la vacancia de la Junta (oficio SO-PSP-741).", "respuesta"],
            ["2026-02-20", "Vecinos del barrio radicaron un derecho de petición colectivo para reorganizar la Junta (radicado SO-PSP-1038).", "enviado"],
            ["2026-03-16", "Asamblea organizativa, con acompañamiento de la Unidad: se conformó el Tribunal de Garantías.", "visita"],
            ["2026-04-26", "Jornada de elección de los dignatarios para el periodo 2026–2030.", "visita"]
        ],
        "pendiente": "",
        "fotos": [],
        "documentos": [
            ["reorganizacion-2026-02-20-peticion-colectiva.pdf", "Texto de la petición colectiva (20 feb 2026), sin las firmas de los vecinos"]
        ]
    },
    {
        "estado": "hecho",
        "fecha": "2026-06-23",
        "numero": "Resolución N° 282",
        "titulo": "Junta Directiva reconocida e inscrita por la Alcaldía",
        "entidad": "Secretaría de Desarrollo Social de Armenia",
        "plazo": 0,
        "enviados": 0,
        "novedades": [
            ["2026-06-23", "La Secretaría reconoció e inscribió a los dignatarios elegidos.", "respuesta"],
            ["2026-07-01", "Empezó el periodo 2026–2030.", "avance"]
        ],
        "pendiente": "",
        "fotos": [],
        "documentos": []
    },
    {
        "estado": "hecho",
        "fecha": "2026-06-30",
        "numero": "JAC-LP-2026-001",
        "titulo": "Empalme con la administración saliente",
        "entidad": "Administración saliente",
        "plazo": 0,
        "enviados": 1,
        "novedades": [
            ["2026-06-30", "Se pidió por escrito la entrega de libros, bienes, recursos y documentos de la Junta.", "enviado"],
            ["2026-10-07", "El Informe de Gestión reportó el empalme como realizado; la Junta depura los libros recibidos.", "avance"]
        ],
        "pendiente": "Presentar a la Asamblea el detalle de lo recibido.",
        "fotos": [],
        "documentos": []
    },
    {
        "estado": "hecho",
        "fecha": "2026-09-20",
        "numero": "Versión 4.0",
        "titulo": "Reforma de estatutos consolidada y publicada para que todos opinen",
        "entidad": "Junta Directiva",
        "plazo": 0,
        "enviados": 0,
        "novedades": [
            ["2026-09-20", "Se consolidó la versión 4.0: 93 artículos en 23 capítulos.", "avance"],
            ["2026-10-07", "Publicada en este portal, con un botón para opinar en cada artículo.", "avance"]
        ],
        "pendiente": "Votarla en la Asamblea General.",
        "fotos": [],
        "documentos": []
    },
    {
        "estado": "hecho",
        "fecha": "2026-09-21",
        "numero": "JAC-010-2026",
        "titulo": "Retiro de los escombros que dejó el sismo y de las basuras acumuladas en cuatro puntos del barrio",
        "entidad": "Alcaldía (Despacho, Planeación, Gestión del Riesgo y Gobierno) · EPA",
        "plazo": 15,
        "enviados": 1,
        "novedades": [
            ["2026-09-21", "Oficio radicado, con registro fotográfico.", "enviado"],
            ["2026-11-11", "Los escombros ya fueron retirados (verificado por la Junta).", "avance"]
        ],
        "pendiente": "",
        "fotos": [
            ["jac010-basuras-1.jpg", "Antes: basuras acumuladas sobre un andén del barrio (21 sep 2026)"],
            ["jac010-basuras-2.jpg", "Antes: basuras y escombros junto a un lote del barrio (21 sep 2026)"],
            ["jac010-escombros.jpg", "Antes: escombros entre los árboles de un separador (21 sep 2026)"],
            ["jac010-esquina.jpg", "Antes: bolsas y cajas abandonadas en una esquina del barrio (21 sep 2026)"],
            ["jac010-ramas.jpg", "Antes: ramas y escombros sobre el andén (21 sep 2026)"],
            ["jac010-costales.jpg", "Antes: costales y cajas en una esquina (21 sep 2026)"],
            ["jac010-anden.jpg", "Antes: costales con escombros sobre un andén (21 sep 2026)"]
        ],
        "documentos": [
            ["JAC-010-2026-escombros-basuras.pdf", "Oficio JAC-010-2026 (21 sep 2026)"]
        ]
    },
    {
        "estado": "hecho",
        "fecha": "2026-10-07",
        "numero": "",
        "titulo": "Informe General de Gestión publicado en este portal",
        "entidad": "Junta Directiva",
        "plazo": 0,
        "enviados": 0,
        "novedades": [
            ["2026-10-07", "Publicado: lo cumplido, lo que sigue en curso y los próximos pasos.", "avance"]
        ],
        "pendiente": "",
        "fotos": [],
        "documentos": []
    }
]
/* FIN-ACTUACIONES */
};
