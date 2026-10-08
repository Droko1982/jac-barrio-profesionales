/* ========================================
   JAC Barrio Los Profesionales - Main JS v3
   Dark Mode + Scroll Animations + A11y
   ======================================== */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        const ANNOUNCEMENT_KEY = 'jac-announcement-asamblea-2026-11';

        if (announcement) {
            if (!localStorage.getItem(ANNOUNCEMENT_KEY)) {
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
        const savedTheme = localStorage.getItem('jac-theme');
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
                localStorage.setItem('jac-theme', newTheme);
            });
        }

        // Follow system theme changes when user has not chosen one
        if (systemDark && systemDark.addEventListener) {
            systemDark.addEventListener('change', function (e) {
                if (!localStorage.getItem('jac-theme')) {
                    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                }
            });
        }

        // === Mobile Navigation Toggle ===
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navOverlay = document.getElementById('nav-overlay');

        function closeMenu() {
            if (!navToggle || !navMenu) return;
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('open');
            if (navOverlay) navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        function openMenu() {
            if (!navToggle || !navMenu) return;
            navToggle.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
            navMenu.classList.add('open');
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

        // === Gestion / Seguimiento de Solicitudes ===
        const gestionSearch = document.getElementById('gestion-search');
        const gestionTable = document.getElementById('gestion-table');
        const gestionCount = document.getElementById('gestion-count');
        const gestionFilters = document.querySelectorAll('.seguimiento__filter');

        if (gestionTable) {
            const gRows = Array.prototype.slice.call(gestionTable.querySelectorAll('tbody tr[data-estado]'));
            const gTotal = gRows.length;
            let currentEstado = 'todas';

            // Live status counters in the intro block
            const elTotal = document.getElementById('gestion-total');
            const elTramite = document.getElementById('gestion-tramite');
            const elResueltas = document.getElementById('gestion-resueltas');

            function countBy(estado) {
                return gRows.filter(function (r) {
                    return r.getAttribute('data-estado') === estado;
                }).length;
            }
            if (elTotal) elTotal.textContent = gTotal;
            if (elTramite) elTramite.textContent = countBy('tramite');
            if (elResueltas) elResueltas.textContent = countBy('resuelta');

            if (gestionCount) {
                gestionCount.setAttribute('aria-live', 'polite');
                gestionCount.setAttribute('role', 'status');
            }

            function applyGestionFilter() {
                const text = gestionSearch ? gestionSearch.value.toLowerCase().trim() : '';
                let visible = 0;

                gRows.forEach(function (row) {
                    const matchesEstado = currentEstado === 'todas' ||
                        row.getAttribute('data-estado') === currentEstado;
                    const matchesText = row.textContent.toLowerCase().indexOf(text) !== -1;

                    if (matchesEstado && matchesText) {
                        row.classList.remove('hidden');
                        visible++;
                    } else {
                        row.classList.add('hidden');
                    }
                });

                if (gestionCount) {
                    if (gTotal === 0) {
                        gestionCount.textContent = 'Sin gestiones publicadas todavía';
                    } else if (visible === gTotal) {
                        gestionCount.textContent = 'Mostrando las ' + gTotal + ' gestiones';
                    } else if (visible === 0) {
                        gestionCount.textContent = 'No hay gestiones que coincidan con la búsqueda';
                    } else {
                        gestionCount.textContent = 'Mostrando ' + visible + ' de ' + gTotal + ' gestiones';
                    }
                }
            }

            if (gestionSearch) {
                gestionSearch.addEventListener('input', applyGestionFilter);
            }

            gestionFilters.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    gestionFilters.forEach(function (b) {
                        b.classList.remove('is-active');
                        b.setAttribute('aria-pressed', 'false');
                    });
                    this.classList.add('is-active');
                    this.setAttribute('aria-pressed', 'true');
                    currentEstado = this.getAttribute('data-filter') || 'todas';
                    applyGestionFilter();
                });
            });

            applyGestionFilter();
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

        // === Contact Form Handling ===
        const contactForm = document.getElementById('contact-form');
        const submitBtn = document.getElementById('submit-btn');
        const FALLBACK_EMAIL = 'jaclosprofesionales@gmail.com';
        const asuntoSelect = document.getElementById('asunto');
        const mensajeInput = document.getElementById('mensaje');
        const subjectInput = document.getElementById('form-subject');

        // Texto de ayuda del mensaje según lo que necesita el vecino
        const MENSAJE_AYUDA = {
            certificado: 'Escribe tu dirección en el barrio y para qué trámite necesitas el certificado.',
            afiliacion: 'Escribe tu dirección en el barrio. Te diremos si ya estás afiliado o cómo afiliarte.',
            problema: 'Cuéntanos qué pasa y dónde (calle, carrera o punto de referencia).',
            sismo: 'Describe los daños de tu vivienda, la dirección y si ya los reportaste a la Alcaldía.',
            documentos: 'Indica qué documento o libro quieres consultar y de qué periodo.'
        };

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

        if (contactForm) {
            contactForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const nombre = (document.getElementById('nombre') || {}).value || '';
                const email = (document.getElementById('email') || {}).value || '';
                const asunto = (document.getElementById('asunto') || {}).value || '';
                const mensaje = (document.getElementById('mensaje') || {}).value || '';
                const telefono = (document.getElementById('telefono') || {}).value || '';

                if (!nombre.trim() || !email.trim() || !asunto || !mensaje.trim()) {
                    showFormMessage('Por favor complete todos los campos obligatorios.', 'error');
                    return;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    showFormMessage('Por favor ingrese un correo electrónico válido.', 'error');
                    return;
                }

                const aceptaCheckbox = document.getElementById('acepta-politica');
                if (aceptaCheckbox && !aceptaCheckbox.checked) {
                    showFormMessage('Debe aceptar la Política de Tratamiento de Datos para continuar.', 'error');
                    return;
                }

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Enviando...';
                }
                contactForm.setAttribute('aria-busy', 'true');

                if (subjectInput) {
                    subjectInput.value = '[Web JAC] ' + asuntoLabel() + ' — ' + nombre.trim();
                }
                const formData = new FormData(contactForm);

                fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                })
                .then(function (response) {
                    // FormSubmit responde 200 aunque el correo aún no esté activado: hay que leer "success"
                    return response.json().catch(function () { return {}; }).then(function (body) {
                        return { ok: response.ok && String(body.success) === 'true' };
                    });
                })
                .then(function (result) {
                    if (result.ok) {
                        showFormMessage('¡Listo! Tu solicitud llegó al correo de la Junta. Te responderemos a ' + email.trim() + '.', 'success');
                        contactForm.reset();
                        applyAsunto('');
                    } else {
                        showFormFallback('Hubo un error al enviar el mensaje.', { nombre: nombre, email: email, asunto: asunto, mensaje: mensaje, telefono: telefono });
                    }
                })
                .catch(function (err) {
                    if (window.console && console.error) {
                        console.error('[contact-form] Error de red:', err);
                    }
                    showFormFallback('Error de conexión.', { nombre: nombre, email: email, asunto: asunto, mensaje: mensaje, telefono: telefono });
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

        function showFormFallback(prefix, data) {
            const subject = encodeURIComponent('[Web JAC] ' + asuntoLabel() + ' — ' + data.nombre);
            const body = encodeURIComponent(
                'Nombre: ' + data.nombre + '\n' +
                'Email: ' + data.email + '\n' +
                'Teléfono: ' + (data.telefono || 'No indicado') + '\n' +
                'Asunto: ' + asuntoLabel() + '\n\n' +
                'Mensaje:\n' + data.mensaje
            );
            const mailtoUrl = 'mailto:' + FALLBACK_EMAIL + '?subject=' + subject + '&body=' + body;
            showFormMessage(
                prefix + ' Por favor escríbanos directamente: ',
                'error',
                { href: mailtoUrl, label: FALLBACK_EMAIL }
            );
        }

        function showFormMessage(message, type, link) {
            const existing = document.querySelector('.form__message');
            if (existing) existing.remove();

            const msgEl = document.createElement('div');
            msgEl.className = 'form__message';
            msgEl.setAttribute('role', 'alert');
            msgEl.style.cssText = 'padding:0.85rem 1rem;margin-bottom:1.25rem;border-radius:10px;font-size:0.9rem;font-weight:500;text-align:center;';

            if (type === 'success') {
                msgEl.style.backgroundColor = 'var(--color-primary-alpha)';
                msgEl.style.color = 'var(--color-success)';
                msgEl.style.border = '1px solid var(--color-primary)';
            } else {
                msgEl.style.backgroundColor = 'rgba(211, 47, 47, 0.08)';
                msgEl.style.color = 'var(--color-error)';
                msgEl.style.border = '1px solid rgba(211, 47, 47, 0.3)';
            }

            msgEl.textContent = message;

            if (link && link.href) {
                const a = document.createElement('a');
                a.href = link.href;
                a.textContent = link.label;
                a.style.cssText = 'color:inherit;text-decoration:underline;font-weight:600;';
                msgEl.appendChild(a);
            }

            const formTitle = contactForm.querySelector('.contact__form-title');
            if (formTitle) {
                formTitle.insertAdjacentElement('afterend', msgEl);
            } else {
                contactForm.insertBefore(msgEl, contactForm.firstChild);
            }

            const dismissDelay = type === 'success' ? 10000 : 15000;
            setTimeout(function () {
                if (msgEl.parentNode) {
                    msgEl.style.transition = 'opacity 0.3s ease';
                    msgEl.style.opacity = '0';
                    setTimeout(function () {
                        if (msgEl.parentNode) msgEl.remove();
                    }, 300);
                }
            }, dismissDelay);
        }

        // Initial state
        highlightNavOnScroll();
        handleHeaderScroll();
        handleBackToTopVisibility();
    });
})();
