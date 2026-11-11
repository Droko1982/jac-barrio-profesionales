/* ========================================
   JAC Barrio Los Profesionales - Main JS v3
   Dark Mode + Scroll Animations + A11y
   ======================================== */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // localStorage puede fallar (modo privado o datos bloqueados): nunca debe romper la página
    const store = {
        get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
        remove: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
    };

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {

        // === Announcement Banner ===
        const announcement = document.getElementById('announcement');
        const announcementClose = document.getElementById('announcement-close');
        const ANNOUNCEMENT_KEY = 'jac-announcement-asi-vamos-2026-11';

        if (announcement) {
            let dismissed = false;
            try { dismissed = !!localStorage.getItem(ANNOUNCEMENT_KEY); } catch (e) { /* ignore */ }
            if (!dismissed) {
                announcement.hidden = false;
            }
            if (announcementClose) {
                announcementClose.addEventListener('click', function () {
                    announcement.hidden = true;
                    try { localStorage.setItem(ANNOUNCEMENT_KEY, '1'); } catch (e) { /* ignore */ }
                });
            }
        }

        // === Letra grande (accesibilidad) ===
        const textSizeToggle = document.getElementById('text-size-toggle');
        if (textSizeToggle) {
            const syncTextSize = function () {
                const isLarge = document.documentElement.classList.contains('text-lg');
                textSizeToggle.setAttribute('aria-pressed', isLarge ? 'true' : 'false');
                textSizeToggle.setAttribute('aria-label', isLarge ? 'Volver al tamaño de letra normal' : 'Agrandar la letra');
                textSizeToggle.title = isLarge ? 'Letra normal' : 'Agrandar la letra';
                const lab = textSizeToggle.querySelector('.text-size-toggle__label');
                if (lab) lab.textContent = isLarge ? 'Letra normal' : 'Letra grande';
            };
            syncTextSize();
            textSizeToggle.addEventListener('click', function () {
                const isLarge = document.documentElement.classList.toggle('text-lg');
                try { localStorage.setItem('jac-text-lg', isLarge ? '1' : '0'); } catch (e) { /* ignore */ }
                syncTextSize();
            });
        }

        // === Dark Mode Toggle ===
        const themeToggle = document.getElementById('theme-toggle');
        const savedTheme = store.get('jac-theme');
        const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (systemDark && systemDark.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', function () {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                store.set('jac-theme', newTheme);
            });
        }

        // Follow system theme changes when user has not chosen one
        if (systemDark && systemDark.addEventListener) {
            systemDark.addEventListener('change', function (e) {
                if (!store.get('jac-theme')) {
                    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                }
            });
        }

        // === Mobile Navigation Toggle ===
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navOverlay = document.getElementById('nav-overlay');

        // El botón dice «Menú» o «Cerrar», para que sea claro qué pasa al tocarlo.
        function etiquetaMenu(texto, aria) {
            const label = navToggle && navToggle.querySelector('.nav__toggle-label');
            if (label) label.textContent = texto;
            if (navToggle) navToggle.setAttribute('aria-label', aria);
        }

        function closeMenu() {
            if (!navToggle || !navMenu) return;
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('open');
            etiquetaMenu('Menú', 'Abrir el menú');
            if (navOverlay) navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        function openMenu() {
            if (!navToggle || !navMenu) return;
            navToggle.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
            navMenu.classList.add('open');
            etiquetaMenu('Cerrar', 'Cerrar el menú');
            if (navOverlay) navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        if (navToggle) {
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-controls', 'nav-menu');
            navToggle.addEventListener('click', function () {
                if (navMenu && navMenu.classList.contains('open')) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });
        }

        if (navOverlay) {
            navOverlay.addEventListener('click', closeMenu);
        }

        // Close menu on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
                closeMenu();
                if (navToggle) navToggle.focus();
            }
        });

        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        // === Active Nav Link on Scroll ===
        const sections = document.querySelectorAll('section[id]');

        function highlightNavOnScroll() {
            const scrollY = window.scrollY + 120;

            sections.forEach(function (section) {
                const sectionTop = section.offsetTop - 120;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                const navLink = document.querySelector('.nav__link[href="#' + sectionId + '"]');

                if (navLink) {
                    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                        navLink.classList.add('active');
                    } else {
                        navLink.classList.remove('active');
                    }
                }
            });
        }

        // === Header Shadow on Scroll ===
        const header = document.getElementById('header');

        function handleHeaderScroll() {
            if (!header) return;
            if (window.scrollY > 50) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }
        }

        // === Back to Top Button ===
        const backToTop = document.getElementById('back-to-top');

        function handleBackToTopVisibility() {
            if (!backToTop) return;
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        // requestAnimationFrame-throttled scroll handler
        let scrollTicking = false;
        window.addEventListener('scroll', function () {
            if (scrollTicking) return;
            scrollTicking = true;
            window.requestAnimationFrame(function () {
                highlightNavOnScroll();
                handleHeaderScroll();
                handleBackToTopVisibility();
                scrollTicking = false;
            });
        }, { passive: true });

        if (backToTop) {
            backToTop.addEventListener('click', function () {
                window.scrollTo({
                    top: 0,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            });
        }

        // === Scroll Fade-in Animations ===
        const fadeElements = document.querySelectorAll('.fade-in');

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            fadeElements.forEach(function (el) {
                el.classList.add('visible');
            });
        } else {
            const fadeObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        fadeObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -40px 0px'
            });

            fadeElements.forEach(function (el) {
                fadeObserver.observe(el);
            });
        }

        // === Dias de gestion (desde la Resolucion 282 del 23 jun 2026) ===
        const gestionStart = new Date(2026, 5, 23);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diasGestion = Math.max(0, Math.round((today - gestionStart) / 86400000));
        document.querySelectorAll('[data-dias-gestion]').forEach(function (el) {
            el.textContent = diasGestion.toLocaleString('es-CO');
        });
        const heroDias = document.getElementById('hero-dias');
        if (heroDias) heroDias.setAttribute('data-count', diasGestion);

        // === Hero Stats Counter Animation ===
        const statNumbers = document.querySelectorAll('.hero__stat-number[data-count]');
        let statsAnimated = false;

        function setFinalStats() {
            statNumbers.forEach(function (el) {
                const target = parseInt(el.getAttribute('data-count'), 10);
                el.textContent = target.toLocaleString('es-CO');
            });
        }

        function animateCounters() {
            if (prefersReducedMotion) {
                setFinalStats();
                return;
            }
            statNumbers.forEach(function (el) {
                const target = parseInt(el.getAttribute('data-count'), 10);
                const duration = 2000;
                let startTime = null;

                function step(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(eased * target);
                    el.textContent = current.toLocaleString('es-CO');
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.textContent = target.toLocaleString('es-CO');
                    }
                }

                requestAnimationFrame(step);
            });
        }

        const heroStats = document.querySelector('.hero__stats');
        if (heroStats && 'IntersectionObserver' in window) {
            const statsObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !statsAnimated) {
                        statsAnimated = true;
                        animateCounters();
                        statsObserver.disconnect();
                    }
                });
            }, { threshold: 0.5 });
            statsObserver.observe(heroStats);
        } else {
            setFinalStats();
        }

        // === Accordion (Transparency + FAQ) ===
        const accordionHeaders = document.querySelectorAll('.accordion__header');

        accordionHeaders.forEach(function (headerBtn) {
            headerBtn.addEventListener('click', function () {
                const item = this.parentElement;
                const accordion = item.parentElement;
                const isActive = item.classList.contains('active');

                accordion.querySelectorAll('.accordion__item').forEach(function (acc) {
                    acc.classList.remove('active');
                    const accHeader = acc.querySelector('.accordion__header');
                    if (accHeader) accHeader.setAttribute('aria-expanded', 'false');
                });

                if (!isActive) {
                    item.classList.add('active');
                    this.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // === Inventory Search/Filter ===
        const inventorySearch = document.getElementById('inventory-search');
        const inventoryTable = document.getElementById('inventory-table');
        const inventoryCount = document.getElementById('inventory-count');

        if (inventorySearch && inventoryTable) {
            const allRows = inventoryTable.querySelectorAll('tbody tr');
            const totalRows = allRows.length;

            if (inventoryCount) {
                inventoryCount.setAttribute('aria-live', 'polite');
                inventoryCount.setAttribute('role', 'status');
            }

            inventorySearch.addEventListener('input', function () {
                const filter = this.value.toLowerCase().trim();
                let visibleCount = 0;

                allRows.forEach(function (row) {
                    const text = row.textContent.toLowerCase();
                    if (text.indexOf(filter) !== -1) {
                        row.classList.remove('hidden');
                        visibleCount++;
                    } else {
                        row.classList.add('hidden');
                    }
                });

                if (inventoryCount) {
                    inventoryCount.textContent = filter
                        ? 'Mostrando ' + visibleCount + ' de ' + totalRows + ' items'
                        : 'Mostrando ' + totalRows + ' de ' + totalRows + ' items';
                }
            });
        }

        // === Imprimir solo el Informe General ===
        const reportPrint = document.getElementById('report-print');
        if (reportPrint) {
            reportPrint.addEventListener('click', function () {
                document.body.classList.add('print-report');
                window.print();
            });
            window.addEventListener('afterprint', function () {
                document.body.classList.remove('print-report');
            });
        }

        // === Formulario de solicitudes (llega al correo de la Junta vía FormSubmit) ===
        const contactForm = document.getElementById('contact-form');
        const submitBtn = document.getElementById('submit-btn');
        const JUNTA_EMAIL = 'jaclosprofesionales@gmail.com';
        const asuntoSelect = document.getElementById('asunto');
        const mensajeInput = document.getElementById('mensaje');
        const subjectInput = document.getElementById('form-subject');
        const radicadoInput = document.getElementById('form-radicado');
        const MIS_KEY = 'jac-mis-solicitudes';
        const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Texto de ayuda del mensaje según lo que necesita el vecino
        const MENSAJE_AYUDA = {
            certificado: 'Escribe tu dirección en el barrio y para qué trámite necesitas el certificado.',
            afiliacion: 'Escribe tu dirección en el barrio. Te diremos si ya estás afiliado o cómo afiliarte.',
            problema: 'Cuéntanos qué pasa y dónde (calle, carrera o punto de referencia).',
            sismo: 'Describe los daños de tu vivienda, la dirección y si ya los reportaste a la Alcaldía.',
            documentos: 'Indica qué documento o libro quieres consultar y de qué periodo.'
        };

        function campo(id) {
            const e = document.getElementById(id);
            return e ? e.value.trim() : '';
        }

        function asuntoLabel() {
            if (!asuntoSelect || asuntoSelect.selectedIndex < 1) return 'Nueva solicitud';
            return asuntoSelect.options[asuntoSelect.selectedIndex].text;
        }

        function applyAsunto(value) {
            if (!asuntoSelect) return;
            asuntoSelect.value = value;
            if (mensajeInput) {
                mensajeInput.placeholder = MENSAJE_AYUDA[value] || 'Escribe tu mensaje aquí...';
            }
        }

        if (asuntoSelect) {
            asuntoSelect.addEventListener('change', function () {
                applyAsunto(this.value);
            });
        }

        // Botones de trámites: preseleccionan el asunto del formulario
        document.querySelectorAll('[data-asunto]').forEach(function (link) {
            link.addEventListener('click', function () {
                applyAsunto(this.getAttribute('data-asunto'));
                const nombreInput = document.getElementById('nombre');
                if (nombreInput) {
                    setTimeout(function () { nombreInput.focus({ preventScroll: true }); }, 600);
                }
            });
        });

        // Número de solicitud: WEB-AAAAMMDD-XXXX (sin letras que se confundan: I, L, O, 0, 1)
        function nuevoNumero() {
            const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
            const azar = new Uint8Array(4);
            if (window.crypto && window.crypto.getRandomValues) {
                window.crypto.getRandomValues(azar);
            } else {
                for (let i = 0; i < 4; i++) azar[i] = Math.floor(Math.random() * 256);
            }
            let sufijo = '';
            for (let i = 0; i < 4; i++) sufijo += abc[azar[i] % abc.length];
            const d = new Date();
            return 'WEB-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') +
                String(d.getDate()).padStart(2, '0') + '-' + sufijo;
        }

        function textoCorreo(numero) {
            return 'Nombre: ' + campo('nombre') + '\n' +
                'Correo: ' + campo('email') + '\n' +
                'Teléfono: ' + (campo('telefono') || 'No indicado') + '\n' +
                'Trámite: ' + asuntoLabel() + '\n' +
                (numero ? 'Número de solicitud: ' + numero + '\n' : '') +
                '\nMensaje:\n' + campo('mensaje');
        }

        function mailtoJunta(numero) {
            const asunto = '[Web JAC] ' + asuntoLabel() + (numero ? ' · ' + numero : '') +
                (campo('nombre') ? ' — ' + campo('nombre') : '');
            return 'mailto:' + JUNTA_EMAIL + '?subject=' + encodeURIComponent(asunto) +
                '&body=' + encodeURIComponent(textoCorreo(numero));
        }

        // «Abrir el mensaje listo en mi correo»: se arma con lo que el vecino ya escribió
        const formMailto = document.getElementById('form-mailto');
        if (formMailto) {
            formMailto.addEventListener('click', function () {
                this.href = mailtoJunta('');
            });
        }

        // Envío a FormSubmit. Responde 200 aunque el correo no esté activado: hay que leer «success».
        // Se envía como JSON: el modo AJAX de FormSubmit responde «Server Error» a los envíos
        // multipart (FormData) para este correo, y sí acepta JSON (probado el 11 nov 2026).
        function enviarAJunta(url, formData) {
            const datos = {};
            formData.forEach(function (valor, clave) {
                datos[clave] = clave in datos ? datos[clave] + ', ' + valor : valor;
            });
            return fetch(url, {
                method: 'POST',
                body: JSON.stringify(datos),
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            })
                .then(function (response) {
                    return response.json().catch(function () { return {}; }).then(function (body) {
                        return response.ok && String(body.success) === 'true';
                    });
                })
                .catch(function (err) {
                    if (window.console && console.error) console.error('[formulario] Error de red:', err);
                    return false;
                });
        }

        // --- «Tus solicitudes enviadas desde este equipo» (solo en este navegador) ---
        const misBox = document.getElementById('mis-solicitudes');
        const misList = document.getElementById('mis-solicitudes-list');
        const misBorrar = document.getElementById('mis-solicitudes-borrar');

        function leerMis() {
            try {
                const v = JSON.parse(store.get(MIS_KEY) || '[]');
                return Array.isArray(v) ? v : [];
            } catch (e) {
                return [];
            }
        }

        function pintarMis() {
            if (!misBox || !misList) return;
            const mis = leerMis();
            misList.textContent = '';
            mis.slice(0, 10).forEach(function (s) {
                const li = document.createElement('li');
                const num = document.createElement('strong');
                num.textContent = s.numero;
                const meta = document.createElement('span');
                const d = new Date(s.fecha);
                meta.textContent = ' · ' + d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) +
                    ' · ' + s.asunto;
                li.appendChild(num);
                li.appendChild(meta);
                misList.appendChild(li);
            });
            misBox.hidden = mis.length === 0;
        }

        function guardarMis(numero, asunto) {
            const mis = leerMis();
            mis.unshift({ numero: numero, asunto: asunto, fecha: new Date().toISOString() });
            store.set(MIS_KEY, JSON.stringify(mis.slice(0, 20)));
            pintarMis();
        }

        if (misBorrar) {
            misBorrar.addEventListener('click', function () {
                if (window.confirm('¿Borrar la lista guardada en este equipo? Las solicitudes ya enviadas siguen en el correo de la Junta.')) {
                    store.remove(MIS_KEY);
                    pintarMis();
                }
            });
        }
        pintarMis();

        // --- Constancia con el número de solicitud (no se cierra sola) ---
        function quitarMensajes() {
            if (!contactForm) return;
            contactForm.querySelectorAll('.form__message, .constancia').forEach(function (m) { m.remove(); });
        }

        // «Prefiero enviarla por WhatsApp»: abre WhatsApp con la solicitud lista para la Secretaria.
        // No exige correo: basta con el trámite, el nombre, el mensaje y la autorización de datos.
        const WHATSAPP_JUNTA = '573136555392';
        const formWhatsapp = document.getElementById('form-whatsapp');
        if (formWhatsapp) {
            formWhatsapp.addEventListener('click', function () {
                const requeridos = ['asunto', 'nombre', 'mensaje', 'acepta-politica']
                    .map(function (id) { return document.getElementById(id); })
                    .filter(Boolean);
                for (let i = 0; i < requeridos.length; i++) {
                    const el = requeridos[i];
                    const vacio = el.type === 'checkbox' ? !el.checked : !String(el.value).trim();
                    if (vacio) {
                        if (el.reportValidity) el.reportValidity(); else el.focus();
                        return;
                    }
                }
                const numero = nuevoNumero();
                const texto = 'Hola, Dra. Silvia. Envío esta solicitud desde la página de la Junta.\n\n' +
                    'Trámite: ' + asuntoLabel() + '\n' +
                    'Número de solicitud: ' + numero + '\n' +
                    'Nombre: ' + campo('nombre') +
                    (campo('telefono') ? '\nTeléfono: ' + campo('telefono') : '') +
                    (campo('email') ? '\nCorreo: ' + campo('email') : '') +
                    '\n\n' + campo('mensaje');
                guardarMis(numero, asuntoLabel());
                window.open('https://wa.me/' + WHATSAPP_JUNTA + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
                if (window.JAC_AVISO) window.JAC_AVISO('Se abrió WhatsApp. Toca «Enviar» para que llegue a la Secretaria.');
            });
        }

        function mostrarConstancia(numero, email) {
            quitarMensajes();
            const box = document.createElement('div');
            box.className = 'constancia';
            box.setAttribute('role', 'status');
            box.setAttribute('tabindex', '-1');

            const ok = document.createElement('p');
            ok.className = 'constancia__ok';
            ok.textContent = '✅ ¡Listo! Tu solicitud llegó al correo de la Junta.';
            const lab = document.createElement('p');
            lab.className = 'constancia__label';
            lab.textContent = 'Tu número de solicitud';
            const num = document.createElement('p');
            num.className = 'constancia__num';
            num.textContent = numero;
            const txt = document.createElement('p');
            txt.className = 'constancia__text';
            txt.textContent = 'Guárdalo y menciónalo si nos escribes por esta solicitud. Te responderemos a ' + email + '.';

            const acciones = document.createElement('div');
            acciones.className = 'constancia__actions';
            const copiar = document.createElement('button');
            copiar.type = 'button';
            copiar.className = 'btn btn--ghost';
            copiar.textContent = '📋 Copiar número';
            copiar.addEventListener('click', function () {
                if (window.JAC_COPIAR) window.JAC_COPIAR(numero, 'Número de solicitud copiado');
            });
            const otra = document.createElement('button');
            otra.type = 'button';
            otra.className = 'link-btn';
            otra.textContent = 'Enviar otra solicitud';
            otra.addEventListener('click', function () {
                box.remove();
                if (asuntoSelect) asuntoSelect.focus();
            });
            acciones.appendChild(copiar);
            acciones.appendChild(otra);

            [ok, lab, num, txt, acciones].forEach(function (n) { box.appendChild(n); });
            const formTitle = contactForm.querySelector('.contact__form-title');
            if (formTitle) formTitle.insertAdjacentElement('afterend', box);
            else contactForm.insertBefore(box, contactForm.firstChild);
            box.focus({ preventScroll: true });
            box.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        }

        if (contactForm) {
            contactForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const nombre = campo('nombre');
                const email = campo('email');
                const asunto = asuntoSelect ? asuntoSelect.value : '';
                const mensaje = campo('mensaje');

                if (!nombre || !email || !asunto || !mensaje) {
                    showFormMessage('Por favor complete todos los campos obligatorios.', 'error');
                    return;
                }
                if (!EMAIL_RE.test(email)) {
                    showFormMessage('Por favor ingrese un correo electrónico válido.', 'error');
                    return;
                }
                const aceptaCheckbox = document.getElementById('acepta-politica');
                if (aceptaCheckbox && !aceptaCheckbox.checked) {
                    showFormMessage('Debe aceptar la Política de Tratamiento de Datos para continuar.', 'error');
                    return;
                }

                const numero = nuevoNumero();
                const etiqueta = asuntoLabel();
                if (radicadoInput) radicadoInput.value = numero;
                if (subjectInput) subjectInput.value = '[Web JAC] ' + etiqueta + ' · ' + numero + ' — ' + nombre;

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Enviando...';
                }
                contactForm.setAttribute('aria-busy', 'true');

                enviarAJunta(contactForm.action, new FormData(contactForm))
                    .then(function (ok) {
                        if (ok) {
                            mostrarConstancia(numero, email);
                            guardarMis(numero, etiqueta);
                            contactForm.reset();
                            applyAsunto('');
                        } else {
                            showFormFallback('No pudimos enviarla desde la página.', numero);
                        }
                    })
                    .finally(function () {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Enviar solicitud';
                        }
                        contactForm.removeAttribute('aria-busy');
                    });
            });
        }

        function showFormFallback(prefix, numero) {
            showFormMessage(
                prefix + ' Tu mensaje no se ha perdido: ',
                'error',
                { href: mailtoJunta(numero), label: 'envíalo desde tu correo con un clic' }
            );
            // Segunda salida: copiar el mensaje para pegarlo en cualquier correo
            const msg = contactForm.querySelector('.form__message');
            if (msg) {
                const texto = 'Para: ' + JUNTA_EMAIL + '\n' + textoCorreo(numero);
                const ayuda = document.createElement('p');
                ayuda.className = 'form__copy-help';
                ayuda.textContent = 'O cópialo y pégalo en un correo para ' + JUNTA_EMAIL + '.';
                const copia = document.createElement('button');
                copia.type = 'button';
                copia.className = 'btn btn--ghost form__copy';
                copia.textContent = '📋 Copiar mi mensaje';
                copia.addEventListener('click', function () {
                    if (window.JAC_COPIAR) window.JAC_COPIAR(texto, 'Mensaje copiado. Pégalo en un correo para la Junta.');
                });
                msg.appendChild(ayuda);
                msg.appendChild(copia);
            }
        }

        function showFormMessage(message, type, link) {
            quitarMensajes();

            const msgEl = document.createElement('div');
            msgEl.className = 'form__message form__message--' + (type === 'success' ? 'ok' : 'error');
            msgEl.setAttribute('role', 'alert');
            msgEl.textContent = message;

            if (link && link.href) {
                const a = document.createElement('a');
                a.href = link.href;
                a.textContent = link.label;
                msgEl.appendChild(a);
                msgEl.appendChild(document.createTextNode('.'));
            }

            const formTitle = contactForm.querySelector('.contact__form-title');
            if (formTitle) {
                formTitle.insertAdjacentElement('afterend', msgEl);
            } else {
                contactForm.insertBefore(msgEl, contactForm.firstChild);
            }
            // Los errores con enlace de respaldo no se cierran solos
            if (!link) {
                setTimeout(function () {
                    if (msgEl.parentNode) msgEl.remove();
                }, 12000);
            }
        }

        // === Inscripción a los avisos por correo ===
        const susForm = document.getElementById('suscribe-form');
        if (susForm) {
            const susMsg = susForm.querySelector('.stayup__msg');
            const susBtn = susForm.querySelector('button[type="submit"]');
            const susSubject = susForm.querySelector('input[name="_subject"]');

            const decir = function (txt, tipo, link) {
                susMsg.textContent = txt;
                susMsg.className = 'stayup__msg' + (tipo ? ' is-' + tipo : '');
                if (link) {
                    const a = document.createElement('a');
                    a.href = link.href;
                    a.textContent = link.label;
                    a.className = 'contact__link';
                    susMsg.appendChild(a);
                    susMsg.appendChild(document.createTextNode('.'));
                }
            };

            susForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const nombre = susForm.querySelector('#sus-nombre').value.trim();
                const email = susForm.querySelector('#sus-email').value.trim();
                const acepta = susForm.querySelector('input[name="acepta_politica"]');

                if (!nombre || !EMAIL_RE.test(email)) {
                    decir('Escribe tu nombre y un correo válido.', 'error');
                    return;
                }
                if (acepta && !acepta.checked) {
                    decir('Para inscribirte debes aceptar la Política de Tratamiento de Datos.', 'error');
                    return;
                }
                if (susSubject) susSubject.value = '[Web JAC] Quiero recibir los avisos — ' + nombre;

                const etiqueta = susBtn.textContent;
                susBtn.disabled = true;
                susBtn.textContent = 'Enviando...';
                enviarAJunta(susForm.action, new FormData(susForm))
                    .then(function (ok) {
                        if (ok) {
                            decir('¡Listo, ' + nombre + '! La Junta agregará ' + email + ' a la lista de avisos.', 'ok');
                            susForm.reset();
                        } else {
                            const href = 'mailto:' + JUNTA_EMAIL +
                                '?subject=' + encodeURIComponent('[Web JAC] Quiero recibir los avisos — ' + nombre) +
                                '&body=' + encodeURIComponent('Por favor agreguen este correo a la lista de avisos de la Junta.\n\nNombre: ' + nombre + '\nCorreo: ' + email);
                            decir('No pudimos inscribirte desde la página. ', 'error', { href: href, label: 'Pídelo por correo con un clic' });
                        }
                    })
                    .finally(function () {
                        susBtn.disabled = false;
                        susBtn.textContent = etiqueta;
                    });
            });
        }

        // Initial state
        highlightNavOnScroll();
        handleHeaderScroll();
        handleBackToTopVisibility();
    });
})();
