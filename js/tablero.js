/* ==========================================================================
   Tablero «Así vamos» — JAC Barrio Los Profesionales
   Dibuja las actuaciones (ya se hizo · en trámite · esperando respuesta),
   la línea de tiempo, los contadores, la ficha de la Asamblea, y los
   botones Escuchar, Compartir y Copiar. Los datos vienen de js/actuaciones.js.
   ========================================================================== */

(function () {
    'use strict';

    var D = window.JAC_DATOS;
    if (!D || !D.actuaciones) return;

    /* ---------- Fechas ---------- */
    var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    var MESES_L = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
        'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var DIAS_L = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    // Festivos de Colombia (Ley 51 de 1983). Agregar el año siguiente cuando se acerque.
    var FESTIVOS = {};
    [
        '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03', '2026-05-01',
        '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29', '2026-07-20', '2026-08-07',
        '2026-08-17', '2026-10-12', '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25',
        '2027-01-01', '2027-01-11', '2027-03-22', '2027-03-25', '2027-03-26', '2027-05-01',
        '2027-05-10', '2027-05-31', '2027-06-07', '2027-07-05', '2027-07-20', '2027-08-07',
        '2027-08-16', '2027-10-18', '2027-11-01', '2027-11-15', '2027-12-08', '2027-12-25'
    ].forEach(function (f) { FESTIVOS[f] = true; });

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function aFecha(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
    function aIso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function corta(iso) { var d = aFecha(iso); return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear(); }
    function larga(iso) { var d = aFecha(iso); return d.getDate() + ' de ' + MESES_L[d.getMonth()] + ' de ' + d.getFullYear(); }
    function esHabil(d) { var w = d.getDay(); return w !== 0 && w !== 6 && !FESTIVOS[aIso(d)]; }

    function sumarHabiles(iso, n) {
        var d = aFecha(iso), c = 0;
        while (c < n) {
            d.setDate(d.getDate() + 1);
            if (esHabil(d)) c++;
        }
        return d;
    }

    var HOY = new Date();
    HOY.setHours(0, 0, 0, 0);
    function diasEntre(a, b) { return Math.round((b - a) / 86400000); }
    function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

    /* ---------- Utilidades DOM ---------- */
    function el(tag, cls, texto) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (texto != null) e.textContent = texto;
        return e;
    }
    function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
    function ultima(it) { return it.novedades[it.novedades.length - 1]; }

    /* ---------- Cálculo del plazo legal (Ley 1755 de 2015) ---------- */
    function plazoDe(it) {
        if (it.estado !== 'espera' || !it.plazo) return null;
        var vence = sumarHabiles(it.fecha, it.plazo);
        return { vence: vence, vencido: HOY > vence };
    }

    var items = D.actuaciones.slice();
    var conteo = { hecho: 0, tramite: 0, espera: 0, total: items.length, vencidas: 0 };
    items.forEach(function (it) {
        conteo[it.estado] = (conteo[it.estado] || 0) + 1;
        var p = plazoDe(it);
        if (p && p.vencido) conteo.vencidas++;
    });

    /* ---------- Contadores y fecha de actualización ---------- */
    $all('[data-act-count]').forEach(function (e) {
        var v = conteo[e.getAttribute('data-act-count')];
        if (v != null) e.textContent = v;
    });
    $all('[data-act-count-attr]').forEach(function (e) {
        var v = conteo[e.getAttribute('data-act-count-attr')];
        if (v != null) e.setAttribute('data-count', v);
    });
    $all('[data-act-updated]').forEach(function (e) {
        e.textContent = larga(D.actualizado);
        if (e.tagName === 'TIME') e.dateTime = D.actualizado;
    });

    /* ---------- Tarjetas ---------- */
    function tarjeta(it) {
        var li = el('li', 'act-card act-card--' + it.estado);

        var top = el('div', 'act-card__top');
        var t = el('time', 'act-card__date', corta(it.fecha));
        t.dateTime = it.fecha;
        top.appendChild(t);
        if (it.numero) top.appendChild(el('span', 'act-card__num', it.numero));
        li.appendChild(top);

        li.appendChild(el('h4', 'act-card__title', it.titulo));

        if (it.entidad) {
            var ent = el('p', 'act-card__entity');
            if (it.estado !== 'hecho') ent.appendChild(el('span', 'act-card__label', 'Ante: '));
            ent.appendChild(document.createTextNode(it.entidad));
            li.appendChild(ent);
        }

        if (it.estado === 'espera') {
            var dias = diasEntre(aFecha(it.fecha), HOY);
            var p = plazoDe(it);
            var reloj = el('p', 'act-card__clock' + (p && p.vencido ? ' is-late' : ''));
            var txt = plural(dias, 'día', 'días') + ' esperando respuesta';
            if (p) {
                txt += p.vencido
                    ? ' · el plazo legal venció el ' + corta(aIso(p.vence))
                    : ' · plazo legal hasta el ' + corta(aIso(p.vence));
            }
            reloj.appendChild(el('span', 'act-card__clock-icon', p && p.vencido ? '⚠️' : '⏱️'));
            reloj.appendChild(document.createTextNode(' ' + txt));
            li.appendChild(reloj);
        }

        var u = ultima(it);
        if (it.novedades.length > 1 || it.estado !== 'espera') {
            var last = el('p', 'act-card__last');
            last.appendChild(el('strong', null, (it.novedades.length > 1 ? 'Última novedad, ' : '') + corta(u[0]) + ': '));
            last.appendChild(document.createTextNode(u[1]));
            li.appendChild(last);
        }

        if (it.pendiente) {
            var pen = el('p', 'act-card__pending');
            pen.appendChild(el('strong', null, 'Falta: '));
            pen.appendChild(document.createTextNode(it.pendiente));
            li.appendChild(pen);
        }

        if (it.novedades.length > 1) {
            var det = el('details', 'act-card__history');
            det.appendChild(el('summary', null, 'Ver historial (' + it.novedades.length + ' pasos)'));
            var ol = el('ol');
            it.novedades.forEach(function (n) {
                var item = el('li');
                var tt = el('time', null, corta(n[0]));
                tt.dateTime = n[0];
                item.appendChild(tt);
                item.appendChild(el('span', null, n[1]));
                ol.appendChild(item);
            });
            det.appendChild(ol);
            li.appendChild(det);
        }
        return li;
    }

    $all('[data-act-list]').forEach(function (lista) {
        var estado = lista.getAttribute('data-act-list');
        var propios = items.filter(function (it) { return it.estado === estado; });
        if (estado === 'espera') {
            // Lo que más lleva esperando, primero
            propios.sort(function (a, b) { return a.fecha.localeCompare(b.fecha); });
        } else {
            // Lo más reciente, primero (según la fecha que se muestra en la tarjeta)
            propios.sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
        }
        lista.textContent = '';
        if (!propios.length) {
            lista.appendChild(el('li', 'act-empty', 'Nada por ahora.'));
            return;
        }
        propios.forEach(function (it) { lista.appendChild(tarjeta(it)); });
    });

    /* ---------- Línea de tiempo ---------- */
    var tl = document.getElementById('act-timeline');
    if (tl) {
        var eventos = [];
        items.forEach(function (it) {
            it.novedades.forEach(function (n) { eventos.push({ fecha: n[0], texto: n[1], it: it }); });
        });
        eventos.sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });

        var VISIBLES = 8;
        var mesActual = '';
        tl.textContent = '';
        eventos.forEach(function (ev, i) {
            var extra = i >= VISIBLES;
            var mes = ev.fecha.slice(0, 7);
            if (mes !== mesActual) {
                mesActual = mes;
                var d = aFecha(ev.fecha);
                var cab = el('li', 'act-tl__month' + (extra ? ' is-extra' : ''),
                    MESES_L[d.getMonth()].charAt(0).toUpperCase() + MESES_L[d.getMonth()].slice(1) + ' de ' + d.getFullYear());
                tl.appendChild(cab);
            }
            var li = el('li', 'act-tl__item act-tl__item--' + ev.it.estado + (extra ? ' is-extra' : ''));
            var t = el('time', 'act-tl__date', corta(ev.fecha));
            t.dateTime = ev.fecha;
            li.appendChild(t);
            var cuerpo = el('div', 'act-tl__body');
            cuerpo.appendChild(el('strong', 'act-tl__title', ev.it.titulo));
            cuerpo.appendChild(el('span', 'act-tl__text', ev.texto));
            li.appendChild(cuerpo);
            tl.appendChild(li);
        });

        var mas = document.getElementById('act-timeline-more');
        var ocultos = Math.max(0, eventos.length - VISIBLES);
        if (mas && ocultos > 0) {
            mas.hidden = false;
            mas.textContent = 'Ver toda la línea de tiempo (' + ocultos + ' más)';
            mas.addEventListener('click', function () {
                tl.classList.add('is-open');
                mas.hidden = true;
            });
        }
    }

    /* ---------- Toast (mensajes cortos) ---------- */
    var toastTimer = null;
    function aviso(msg) {
        var t = document.getElementById('toast');
        if (!t) {
            t = el('div', 'toast');
            t.id = 'toast';
            t.setAttribute('role', 'status');
            t.setAttribute('aria-live', 'polite');
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 3500);
    }
    window.JAC_AVISO = aviso;

    function copiar(texto, msg) {
        function ok() { aviso(msg || 'Copiado.'); }
        function respaldo() {
            var ta = el('textarea');
            ta.value = texto;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); ok(); } catch (e) { aviso('No se pudo copiar: ' + texto); }
            document.body.removeChild(ta);
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(texto).then(ok, respaldo);
        } else {
            respaldo();
        }
    }
    window.JAC_COPIAR = copiar;

    $all('[data-copy]').forEach(function (b) {
        b.addEventListener('click', function () {
            copiar(b.getAttribute('data-copy'), b.getAttribute('data-copy-msg') || 'Copiado.');
        });
    });

    /* ---------- Compartir ---------- */
    $all('[data-share]').forEach(function (b) {
        b.addEventListener('click', function () {
            var url = location.origin + location.pathname + (b.getAttribute('data-share') || '');
            var datos = {
                title: b.getAttribute('data-share-title') || document.title,
                text: b.getAttribute('data-share-text') || '',
                url: url
            };
            if (navigator.share) {
                navigator.share(datos).catch(function () { /* el usuario canceló */ });
            } else {
                copiar(url, 'Enlace copiado. Pégalo en el mensaje que quieras enviar.');
            }
        });
    });

    /* ---------- Escuchar el resumen (lectura en voz alta) ---------- */
    var btnEscuchar = document.getElementById('act-listen');
    if (btnEscuchar && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
        btnEscuchar.hidden = false;
        var etiqueta = btnEscuchar.innerHTML;

        var resumen = function () {
            var partes = [
                'Actuaciones de la Junta de Acción Comunal del barrio Los Profesionales, actualizadas al ' + larga(D.actualizado) + '.',
                'Ya se hicieron ' + conteo.hecho + '. Hay ' + conteo.tramite + ' solicitudes en trámite y ' +
                    conteo.espera + ' esperando respuesta.'
            ];
            var esp = items.filter(function (i) { return i.estado === 'espera'; })
                .sort(function (a, b) { return a.fecha.localeCompare(b.fecha); });
            if (esp.length) {
                partes.push('Esperando respuesta.');
                esp.forEach(function (it) {
                    var p = plazoDe(it);
                    partes.push(it.titulo + '. Radicado el ' + larga(it.fecha) +
                        (p && p.vencido ? '; el plazo legal ya venció.' : '.'));
                });
            }
            var tra = items.filter(function (i) { return i.estado === 'tramite'; });
            if (tra.length) {
                partes.push('En trámite.');
                tra.forEach(function (it) {
                    partes.push(it.titulo + '. Última novedad: ' + ultima(it)[1] + (it.pendiente ? ' Falta: ' + it.pendiente : ''));
                });
            }
            var hec = items.filter(function (i) { return i.estado === 'hecho'; });
            if (hec.length) {
                partes.push('Ya se hizo.');
                hec.forEach(function (it) { partes.push(it.titulo + '.'); });
            }
            partes.push('Para hacer una solicitud, escriba al correo de la Junta o use el formulario del portal.');
            return partes;
        };

        var detener = function () {
            window.speechSynthesis.cancel();
            btnEscuchar.innerHTML = etiqueta;
            btnEscuchar.setAttribute('aria-pressed', 'false');
        };

        btnEscuchar.addEventListener('click', function () {
            var synth = window.speechSynthesis;
            if (synth.speaking || synth.pending) { detener(); return; }
            var voces = synth.getVoices();
            var voz = voces.filter(function (v) { return /^es[-_]CO/i.test(v.lang); })[0] ||
                voces.filter(function (v) { return /^es/i.test(v.lang); })[0] || null;
            var frases = resumen();
            // Frases cortas: algunos navegadores cortan los textos largos
            frases.forEach(function (f, i) {
                var u = new SpeechSynthesisUtterance(f.replace(/\s·\s/g, ', '));
                u.lang = voz ? voz.lang : 'es-CO';
                if (voz) u.voice = voz;
                u.rate = 0.95;
                if (i === frases.length - 1) u.onend = detener;
                synth.speak(u);
            });
            btnEscuchar.innerHTML = '<span aria-hidden="true">⏹️</span> Detener lectura';
            btnEscuchar.setAttribute('aria-pressed', 'true');
        });
        window.addEventListener('pagehide', function () { window.speechSynthesis.cancel(); });
    }

    /* ---------- Próxima Asamblea ---------- */
    var A = D.asamblea;
    if (A && A.estado === 'convocada' && A.fecha) {
        var dA = aFecha(A.fecha);
        var hora12 = function (h) {
            if (!h) return '';
            var p = h.split(':'), hh = +p[0], mm = p[1] || '00';
            var suf = hh >= 12 ? 'p. m.' : 'a. m.';
            hh = hh % 12 || 12;
            return hh + ':' + mm + ' ' + suf;
        };
        var fechaTexto = DIAS_L[dA.getDay()].charAt(0).toUpperCase() + DIAS_L[dA.getDay()].slice(1) +
            ' ' + larga(A.fecha) + (A.hora ? ' · ' + hora12(A.hora) : '');

        $all('[data-asamblea-badge]').forEach(function (e) {
            e.textContent = 'Convocada';
            e.className = 'status-badge status-badge--good';
        });
        $all('[data-asamblea-fecha]').forEach(function (e) { e.textContent = fechaTexto; });
        $all('[data-asamblea-detalle]').forEach(function (e) {
            e.textContent = (A.lugar ? 'Lugar: ' + A.lugar + '. ' : '') + (A.modalidad ? A.modalidad + '. ' : '') +
                'Lleva tu documento de identidad.';
        });
        var faltan = diasEntre(HOY, dA);
        $all('[data-asamblea-cuenta]').forEach(function (e) {
            e.hidden = false;
            e.textContent = faltan > 1 ? 'Faltan ' + faltan + ' días' : faltan === 1 ? 'Es mañana' :
                faltan === 0 ? '¡Es hoy!' : 'Ya se realizó';
        });

        $all('[data-asamblea-ics]').forEach(function (b) {
            if (faltan < 0) return;
            b.hidden = false;
            b.addEventListener('click', function () {
                var p = A.fecha.split('-'), h = (A.hora || '18:00').split(':');
                // Armenia: UTC-5 todo el año
                var ini = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], +h[0] + 5, +(h[1] || 0)));
                var fin = new Date(ini.getTime() + 3 * 3600000);
                var f = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
                var esc = function (s) { return String(s || '').replace(/\\/g, '\\\\').replace(/[;,]/g, '\\$&').replace(/\n/g, '\\n'); };
                var url = location.origin + location.pathname;
                var ics = [
                    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JAC Los Profesionales//Portal//ES',
                    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
                    'UID:asamblea-' + A.fecha + '@jac-los-profesionales',
                    'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(ini), 'DTEND:' + f(fin),
                    'SUMMARY:' + esc('Asamblea General · JAC Barrio Los Profesionales'),
                    'LOCATION:' + esc(A.lugar),
                    'DESCRIPTION:' + esc('Lleva tu documento de identidad. Información: ' + url + '#asamblea'),
                    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY',
                    'DESCRIPTION:' + esc('Mañana es la Asamblea General de la Junta'), 'END:VALARM',
                    'END:VEVENT', 'END:VCALENDAR'
                ].join('\r\n');
                var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                var a = el('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'asamblea-jac-los-profesionales.ics';
                document.body.appendChild(a);
                a.click();
                setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
            });
        });
    }

    // Para otras páginas (cartelera) y pruebas
    window.JAC_FECHAS = { corta: corta, larga: larga, plazoDe: plazoDe, diasEntre: diasEntre, aFecha: aFecha, aIso: aIso, HOY: HOY };
    window.JAC_CONTEO = conteo;
})();
