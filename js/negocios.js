/* ==========================================================================
   NEGOCIOS Y EMPRENDIMIENTOS DEL BARRIO — datos del directorio
   --------------------------------------------------------------------------
   Alimenta la sección «Negocios del barrio» del portal (index.html#negocios).

   CÓMO AGREGAR UN NEGOCIO
   1. Llega al correo de la Junta con el asunto
      «[Web JAC] Negocio para el directorio — <nombre>».
   2. Confirma con la persona responsable (por el contacto que dejó).
   3. Copia el bloque de ejemplo de abajo dentro de "negocios", quítale
      las marcas de comentario (la línea EJEMPLO y la del cierre) y completa
      los campos. Separa cada negocio con una coma.

   REGLAS
   - Publica SOLO los datos que la persona autorizó en el formulario.
   - Nunca publiques el «contacto para la Junta» (es privado).
   - Si alguien pide corregir o retirar su negocio, hazlo de inmediato.

   CAMPOS
   nombre       nombre del negocio
   categoria    una de: comida, salud, belleza, hogar, profesional, educacion,
                tienda, tecnologia, mascotas, transporte, otro
   descripcion  qué ofrece, en una o dos frases (máx. 240 letras)
   responsable  nombre de la persona (o '' si no quiere mostrarlo)
   telefono     número para publicar, p. ej. '300 000 0000' (o '')
   whatsapp     true si ese número tiene WhatsApp
   correo       correo para publicar (o '')
   enlace       página web o red social, empezando por https:// (o '')
   desde        fecha de publicación, AAAA-MM-DD
   ========================================================================== */

window.JAC_NEGOCIOS = {
    actualizado: '2026-11-11',

    negocios: [
        /* EJEMPLO — copia este bloque, quítale los comentarios y complétalo:
        {
            nombre: 'Nombre del negocio',
            categoria: 'comida',
            descripcion: 'Qué ofrece, en una o dos frases.',
            responsable: 'Nombre de la persona',
            telefono: '300 000 0000',
            whatsapp: true,
            correo: '',
            enlace: '',
            desde: '2026-11-15'
        }
        */
    ]
};
