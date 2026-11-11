/* ==========================================================================
   LIBRO DE CUENTAS DE LA JUNTA — visible para todos (index.html#cuentas)
   --------------------------------------------------------------------------
   Para registrar un movimiento, agregue una línea en «movimientos», en orden
   de fecha. La página calcula sola lo que entra, lo que sale, lo que queda en
   caja y lo que se debe.

   tipo    'ingreso'  → dinero propio que entra (aportes, donaciones, actividades)
           'prestamo' → dinero prestado a la Junta (entra, pero se debe)
           'gasto'    → dinero que sale
           'abono'    → pago de un préstamo (sale y baja la deuda)
   fecha   AAAA-MM-DD (si aún no se tiene, déjela '' y se muestra «2026»)
   valor   en pesos, sin puntos: 50000
   ========================================================================== */

window.JAC_CUENTAS = {
    actualizado: '2026-11-11',

    movimientos: [
        { fecha: '', tipo: 'prestamo', valor: 200000, concepto: 'Préstamo de Humberto Carvajal a la Junta. Se le devolverá cuando entren fondos.' },
        { fecha: '', tipo: 'gasto', valor: 50000, concepto: 'Libros de la Junta' },
        { fecha: '', tipo: 'gasto', valor: 150000, concepto: 'Desarrollo de la página web y dominio por un año' }
    ]
};

/* ---------- Dibujo del libro (no hace falta tocar de aquí para abajo) ---------- */
(function () {
    'use strict';
    var C = window.JAC_CUENTAS;
    var filas = document.getElementById('cuentas-filas');
    var resumen = document.getElementById('cuentas-resumen');
    if (!C || !filas || !resumen) return;

    var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    var MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    function pesos(v) { return '$' + Number(v || 0).toLocaleString('es-CO'); }
    function fecha(f) {
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f || '');
        return m ? Number(m[3]) + ' ' + MESES[Number(m[2]) - 1] + ' ' + m[1] : '2026';
    }
    function el(tag, cls, texto) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (texto != null) n.textContent = texto;
        return n;
    }

    var t = { ingreso: 0, prestamo: 0, gasto: 0, abono: 0 };
    var caja = 0;
    C.movimientos.forEach(function (m) {
        var entra = m.tipo === 'ingreso' || m.tipo === 'prestamo';
        t[m.tipo] = (t[m.tipo] || 0) + Number(m.valor || 0);
        caja += entra ? Number(m.valor) : -Number(m.valor);
        var tr = el('tr', 'cuentas__fila cuentas__fila--' + m.tipo);
        tr.appendChild(el('td', 'fecha', fecha(m.fecha)));
        var td = el('td', 'concepto');
        var etiqueta = { ingreso: 'Ingreso', prestamo: 'Préstamo', gasto: 'Gasto', abono: 'Abono a préstamo' }[m.tipo] || '';
        td.appendChild(el('span', 'cuentas__tipo cuentas__tipo--' + m.tipo, etiqueta));
        td.appendChild(document.createTextNode(' ' + m.concepto));
        tr.appendChild(td);
        tr.appendChild(el('td', 'num entra', entra ? pesos(m.valor) : ''));
        tr.appendChild(el('td', 'num sale', entra ? '' : pesos(m.valor)));
        tr.appendChild(el('td', 'num saldo', pesos(caja)));
        filas.appendChild(tr);
    });

    var deuda = t.prestamo - t.abono;
    [
        ['💰', 'Ingresos propios', t.ingreso, t.ingreso ? '' : 'La Junta no tiene ingresos todavía'],
        ['🧾', 'Gastos', t.gasto, ''],
        ['🤝', 'Se debe', deuda, deuda ? 'Préstamo que se devolverá cuando entren fondos' : 'La Junta no tiene deudas'],
        ['🏦', 'Queda en caja', caja, '']
    ].forEach(function (c) {
        var d = el('div', 'cuentas__dato');
        var ic = el('span', 'cuentas__icono', c[0]);
        ic.setAttribute('aria-hidden', 'true');
        d.appendChild(ic);
        d.appendChild(el('span', 'cuentas__valor', pesos(c[2])));
        d.appendChild(el('span', 'cuentas__etiqueta', c[1]));
        if (c[3]) d.appendChild(el('span', 'cuentas__ayuda', c[3]));
        resumen.appendChild(d);
    });

    var f = document.querySelector('[data-cuentas-fecha]');
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(C.actualizado || '');
    if (f && m) {
        f.setAttribute('datetime', C.actualizado);
        f.textContent = Number(m[3]) + ' de ' + MESES_LARGOS[Number(m[2]) - 1] + ' de ' + m[1];
    }
})();
