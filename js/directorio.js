/* ==========================================================================
   Directorio «Negocios del barrio»: dibuja las tarjetas desde js/negocios.js
   y envía el formulario de inscripción al correo de la Junta.
   ========================================================================== */
(function () {
    'use strict';

    var JUNTA = 'jaclosprofesionales@gmail.com';
    var CATEGORIAS = [
        ['comida', '🍲', 'Comida y repostería'],
        ['salud', '🩺', 'Salud y bienestar'],
        ['belleza', '💇', 'Belleza y cuidado personal'],
        ['hogar', '🔧', 'Arreglos y hogar'],
        ['profesional', '💼', 'Servicios profesionales'],
        ['educacion', '📚', 'Clases y tutorías'],
        ['tienda', '🛍️', 'Tiendas y ventas'],
        ['tecnologia', '💻', 'Tecnología'],
        ['mascotas', '🐾', 'Mascotas'],
        ['transporte', '🚗', 'Transporte y domicilios'],
        ['otro', '✨', 'Otro']
    ];
    var CAT = {};
    CATEGORIAS.forEach(function (c) { CAT[c[0]] = c; });

    function el(tag, cls, texto) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (texto != null) n.textContent = texto;
        return n;
    }

    function digitos(tel) { return String(tel || '').replace(/\D/g, ''); }
    // En Colombia los fijos y celulares tienen 10 dígitos: se les antepone el 57.
    function telColombia(tel) {
        var d = digitos(tel);
        return d.length === 10 ? '57' + d : d;
    }
    function enlaceTel(tel) {
        var d = telColombia(tel);
        return 'tel:' + (d.length === 12 ? '+' + d : d);
    }

    /* ---------- Opciones del formulario ---------- */
    var select = document.getElementById('neg-cat');
    if (select) {
        CATEGORIAS.forEach(function (c) {
            var o = el('option', null, c[1] + ' ' + c[2]);
            o.value = c[0];
            select.appendChild(o);
        });
    }

    /* ---------- Tarjetas ---------- */
    var lista = document.getElementById('neg-lista');
    var vacio = document.getElementById('neg-vacio');
    var filtros = document.getElementById('neg-filtros');
    var datos = (window.JAC_NEGOCIOS && window.JAC_NEGOCIOS.negocios) || [];
    var negocios = datos.filter(function (n) { return n && n.nombre; })
        .sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); });

    function boton(href, cls, icono, texto, externo) {
        var a = el('a', 'neg-card__btn ' + cls);
        a.href = href;
        if (externo) { a.target = '_blank'; a.rel = 'noopener'; }
        var i = el('span', null, icono);
        i.setAttribute('aria-hidden', 'true');
        a.appendChild(i);
        a.appendChild(document.createTextNode(' ' + texto));
        return a;
    }

    function tarjeta(n) {
        var c = CAT[n.categoria] || CAT.otro;
        var li = el('li', 'neg-card');
        li.setAttribute('data-cat', c[0]);
        var top = el('p', 'neg-card__cat');
        var ic = el('span', 'neg-card__icon', c[1]);
        ic.setAttribute('aria-hidden', 'true');
        top.appendChild(ic);
        top.appendChild(document.createTextNode(' ' + c[2]));
        li.appendChild(top);
        li.appendChild(el('h3', 'neg-card__name', n.nombre));
        if (n.descripcion) li.appendChild(el('p', 'neg-card__desc', n.descripcion));
        if (n.responsable) li.appendChild(el('p', 'neg-card__who', 'Atiende: ' + n.responsable));

        var acc = el('div', 'neg-card__actions');
        if (n.telefono) {
            acc.appendChild(boton(enlaceTel(n.telefono), 'neg-card__btn--tel', '📞', 'Llamar ' + n.telefono));
            if (n.whatsapp) {
                var msg = 'Hola, vi su negocio «' + n.nombre + '» en el portal de la JAC Barrio Los Profesionales.';
                acc.appendChild(boton('https://wa.me/' + telColombia(n.telefono) + '?text=' + encodeURIComponent(msg),
                    'neg-card__btn--wa', '💬', 'WhatsApp', true));
            }
        }
        if (n.correo) acc.appendChild(boton('mailto:' + n.correo, 'neg-card__btn--mail', '✉️', 'Correo'));
        if (n.enlace && /^https?:\/\//i.test(n.enlace)) {
            acc.appendChild(boton(n.enlace, 'neg-card__btn--web', '🌐', 'Ver página', true));
        }
        li.appendChild(acc);
        return li;
    }

    function mostrar(cat) {
        if (!lista) return;
        lista.textContent = '';
        negocios.filter(function (n) { return !cat || (CAT[n.categoria] ? n.categoria : 'otro') === cat; })
            .forEach(function (n) { lista.appendChild(tarjeta(n)); });
    }

    if (lista) {
        mostrar('');
        if (vacio) vacio.hidden = negocios.length > 0;
        if (filtros && negocios.length >= 4) {
            var presentes = CATEGORIAS.filter(function (c) {
                return negocios.some(function (n) { return (CAT[n.categoria] ? n.categoria : 'otro') === c[0]; });
            });
            [['', '📋', 'Todos']].concat(presentes).forEach(function (c, i) {
                var b = el('button', 'neg__filtro', c[1] + ' ' + c[2]);
                b.type = 'button';
                b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
                b.addEventListener('click', function () {
                    Array.prototype.forEach.call(filtros.children, function (x) { x.setAttribute('aria-pressed', 'false'); });
                    b.setAttribute('aria-pressed', 'true');
                    mostrar(c[0]);
                });
                filtros.appendChild(b);
            });
            filtros.hidden = false;
        }
    }

    /* ---------- Formulario de inscripción ---------- */
    var form = document.getElementById('neg-form');
    if (!form) return;
    var msgBox = document.getElementById('neg-mensaje');
    var enviar = document.getElementById('neg-enviar');

    function mensaje(ok, texto, enlace) {
        msgBox.hidden = false;
        msgBox.className = 'form__message ' + (ok ? 'form__message--ok' : 'form__message--error');
        msgBox.textContent = texto;
        if (enlace) {
            msgBox.appendChild(document.createTextNode(' '));
            var a = el('a', null, enlace[1]);
            a.href = enlace[0];
            msgBox.appendChild(a);
        }
    }

    function textoCorreo(d) {
        var c = CAT[d.categoria] || CAT.otro;
        return 'Negocio: ' + d.negocio + '\nActividad: ' + c[2] + '\nQué ofrece: ' + d.descripcion +
            '\nResponsable: ' + d.responsable +
            '\nTeléfono para publicar: ' + (d.telefono_publico || '—') + (d.tiene_whatsapp ? ' (tiene WhatsApp)' : '') +
            '\nCorreo para publicar: ' + (d.correo_publico || '—') +
            '\nPágina o red social: ' + (d.enlace || '—') +
            '\nContacto para la Junta (no se publica): ' + d.contacto_junta +
            '\n\nAutorizo a la Junta de Acción Comunal a publicar en su portal los datos de mi negocio escritos arriba (Ley 1581 de 2012).';
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form.querySelector('[name="_honey"]').value) return;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        var d = {};
        new FormData(form).forEach(function (v, k) { d[k] = typeof v === 'string' ? v.trim() : v; });
        if (!d.telefono_publico && !d.correo_publico && !d.enlace) {
            mensaje(false, 'Escribe al menos un dato de contacto para publicar: teléfono, correo o página.');
            document.getElementById('neg-tel').focus();
            return;
        }
        d._subject = '[Web JAC] Negocio para el directorio — ' + d.negocio;
        var mailto = 'mailto:' + JUNTA + '?subject=' + encodeURIComponent(d._subject) + '&body=' + encodeURIComponent(textoCorreo(d));

        enviar.disabled = true;
        enviar.textContent = 'Enviando…';
        fetch(form.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(d)
        })
            .then(function (r) {
                return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && String(j.success) === 'true'; });
            })
            .catch(function () { return false; })
            .then(function (ok) {
                enviar.disabled = false;
                enviar.textContent = 'Enviar para publicar';
                if (ok) {
                    form.reset();
                    mensaje(true, '✅ ¡Recibido! La Junta revisará tu negocio y te confirmará antes de publicarlo.');
                    if (window.JAC_AVISO) window.JAC_AVISO('Tu negocio llegó a la Junta');
                } else {
                    mensaje(false, 'No pudimos enviarlo en este momento. No pierdas lo que escribiste:', [mailto, 'ábrelo listo en tu correo y envíalo a la Junta.']);
                }
                msgBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
    });
})();
