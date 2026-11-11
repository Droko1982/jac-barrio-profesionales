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
        "novedades": [
            ["2026-05-22", "Derecho de petición radicado."]
        ],
        "pendiente": "Respuesta y medidas de las autoridades.",
        "fotos": []
    },
    {
        "estado": "espera",
        "fecha": "2026-07-02",
        "numero": "JAC-003-2026",
        "titulo": "Información sobre presupuesto participativo y postulación de dos proyectos: cámaras de seguridad y caseta comunal",
        "entidad": "Unidad de Participación Ciudadana · Planeación Municipal",
        "plazo": 10,
        "novedades": [
            ["2026-07-02", "Petición radicada."]
        ],
        "pendiente": "Respuesta de la Alcaldía.",
        "fotos": []
    },
    {
        "estado": "espera",
        "fecha": "2026-07-02",
        "numero": "JAC-006-2026",
        "titulo": "Titularidad de dos predios del barrio y comodato de uno de ellos para una sede comunal",
        "entidad": "Planeación · Hacienda (Bienes) · Secretaría de Gobierno",
        "plazo": 10,
        "novedades": [
            ["2026-07-02", "Petición radicada."]
        ],
        "pendiente": "Respuesta de la Alcaldía.",
        "fotos": []
    },
    {
        "estado": "espera",
        "fecha": "2026-09-21",
        "numero": "JAC-010-2026",
        "titulo": "Retiro de los escombros que dejó el sismo y de las basuras acumuladas en cuatro puntos del barrio",
        "entidad": "Alcaldía (Despacho, Planeación, Gestión del Riesgo y Gobierno) · EPA",
        "plazo": 15,
        "novedades": [
            ["2026-09-21", "Oficio radicado, con registro fotográfico."]
        ],
        "pendiente": "Respuesta y retiro de los escombros y basuras.",
        "fotos": [
            ["jac010-basuras-1.jpg", "Basuras acumuladas sobre un andén del barrio (21 sep 2026)"],
            ["jac010-basuras-2.jpg", "Basuras y escombros junto a un lote del barrio (21 sep 2026)"],
            ["jac010-escombros.jpg", "Escombros entre los árboles de un separador (21 sep 2026)"]
        ]
    },
    {
        "estado": "espera",
        "fecha": "2026-10-02",
        "numero": "JAC-011-2026",
        "titulo": "Registrar el correo jaclosprofesionales@gmail.com como canal oficial de la Junta para comunicaciones y notificaciones",
        "entidad": "Unidad de Participación Ciudadana · Secretaría de Desarrollo Social",
        "plazo": 15,
        "novedades": [
            ["2026-10-02", "Oficio radicado."]
        ],
        "pendiente": "Confirmación de la Unidad de Participación Ciudadana.",
        "fotos": []
    },
    {
        "estado": "tramite",
        "fecha": "2026-05-22",
        "numero": "2026PQR22891",
        "titulo": "Cables aéreos sueltos y a baja altura en la Calle 5 Norte (entre carreras 14 y 15) y en la Calle 7 con Carrera 12",
        "entidad": "Alcaldía (Planeación) · EDEQ · Personería",
        "plazo": 15,
        "novedades": [
            ["2026-05-22", "Petición radicada ante la Alcaldía y EDEQ."],
            ["2026-06-09", "EDEQ inspeccionó: los cables son de empresas de telecomunicaciones, no de EDEQ."],
            ["2026-06-11", "La Personería le pidió a EDEQ una respuesta de fondo (oficio 2026EE-2526)."],
            ["2026-06-12", "Planeación visitó los dos puntos y trasladó el caso a EDEQ (oficio 2026EE-9290)."],
            ["2026-06-16", "Planeación informó el traslado a la Junta (oficio 2026EE-9360)."]
        ],
        "pendiente": "Confirmar que las empresas dueñas de los cables los retiren o ajusten.",
        "fotos": [
            ["cables-poste.jpg", "Cables sueltos y enredados en un poste del barrio (22 may 2026)"]
        ]
    },
    {
        "estado": "tramite",
        "fecha": "2026-05-22",
        "numero": "2026PQR22936",
        "titulo": "Predio de la cancha (Calle 5 Norte con Carrera 16): limpieza, mantenimiento y comodato para la comunidad",
        "entidad": "Desarrollo Social · Planeación · Catastro · Hacienda · Bienes · EDUA · EPA · Personería",
        "plazo": 15,
        "novedades": [
            ["2026-05-22", "Petición radicada."],
            ["2026-06-09", "Desarrollo Social repartió la petición entre las dependencias competentes (oficio SO-PSP-2491)."],
            ["2026-06-12", "La Personería hizo seguimiento a la petición (oficio 2026EE-2535)."],
            ["2026-06-16", "EPA: la limpieza no procede porque el predio está cerrado; trasladó el caso a Planeación e Infraestructura (oficio GA-939)."],
            ["2026-06-19", "Planeación: el predio no es del Municipio; es de propiedad privada (oficio 2026EE-9573)."]
        ],
        "pendiente": "La mesa de trabajo que Desarrollo Social quedó de programar (aún sin fecha).",
        "fotos": [
            ["cancha-malla.jpg", "Malla dañada del predio de la cancha (enero de 2026)"]
        ]
    },
    {
        "estado": "tramite",
        "fecha": "2026-06-11",
        "numero": "JAC-002-2026 · 2026PQR26154",
        "titulo": "Tala controlada de un árbol en riesgo de caída y manejo de un guadual en el barrio",
        "entidad": "Planeación · Gestión del Riesgo (OMGERD) · Secretaría de Gobierno",
        "plazo": 15,
        "novedades": [
            ["2026-06-11", "Solicitud radicada."],
            ["2026-07-08", "Planeación visitó el sitio y recomendó la tala del árbol (oficio 2026EE-10728)."]
        ],
        "pendiente": "Que se ejecute la intervención.",
        "fotos": []
    },
    {
        "estado": "tramite",
        "fecha": "2026-09-18",
        "numero": "",
        "titulo": "Asamblea General: volver a convocarla con el libro de afiliados al día",
        "entidad": "Junta Directiva · Secretaría",
        "plazo": 0,
        "novedades": [
            ["2026-09-18", "Asamblea General convocada, presencial y virtual: no se alcanzó el quórum."],
            ["2026-11-11", "La Junta invita a quienes ya no puedan participar a pedir su retiro voluntario del libro de afiliados."]
        ],
        "pendiente": "Depurar el libro de afiliados y convocar de nuevo la Asamblea (fecha por definir).",
        "fotos": []
    },
    {
        "estado": "hecho",
        "fecha": "2026-06-23",
        "numero": "Resolución N° 282",
        "titulo": "Junta Directiva reconocida e inscrita por la Alcaldía",
        "entidad": "Secretaría de Desarrollo Social de Armenia",
        "plazo": 0,
        "novedades": [
            ["2026-06-23", "La Secretaría reconoció e inscribió a los dignatarios elegidos."],
            ["2026-07-01", "Empezó el periodo 2026–2030."]
        ],
        "pendiente": "",
        "fotos": []
    },
    {
        "estado": "hecho",
        "fecha": "2026-06-30",
        "numero": "JAC-LP-2026-001",
        "titulo": "Empalme con la administración saliente",
        "entidad": "Administración saliente",
        "plazo": 0,
        "novedades": [
            ["2026-06-30", "Se pidió por escrito la entrega de libros, bienes, recursos y documentos de la Junta."],
            ["2026-10-07", "El Informe de Gestión reportó el empalme como realizado; la Junta depura los libros recibidos."]
        ],
        "pendiente": "Presentar a la Asamblea el detalle de lo recibido.",
        "fotos": []
    },
    {
        "estado": "hecho",
        "fecha": "2026-09-20",
        "numero": "Versión 4.0",
        "titulo": "Reforma de estatutos consolidada y publicada para que todos opinen",
        "entidad": "Junta Directiva",
        "plazo": 0,
        "novedades": [
            ["2026-09-20", "Se consolidó la versión 4.0: 93 artículos en 23 capítulos."],
            ["2026-10-07", "Publicada en este portal, con un botón para opinar en cada artículo."]
        ],
        "pendiente": "Votarla en la Asamblea General.",
        "fotos": []
    },
    {
        "estado": "hecho",
        "fecha": "2026-10-07",
        "numero": "",
        "titulo": "Informe General de Gestión publicado en este portal",
        "entidad": "Junta Directiva",
        "plazo": 0,
        "novedades": [
            ["2026-10-07", "Publicado: lo cumplido, lo que sigue en curso y los próximos pasos."]
        ],
        "pendiente": "",
        "fotos": []
    }
]
/* FIN-ACTUACIONES */
};
