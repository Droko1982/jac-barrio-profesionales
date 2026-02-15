/* ========================================
   JAC Barrio Profesionales - Main JS v2
   Dark Mode + Scroll Animations
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

    // === Dark Mode Toggle ===
    var themeToggle = document.getElementById('theme-toggle');
    var savedTheme = localStorage.getItem('jac-theme');

    // Apply saved theme or detect system preference
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', function () {
        var currentTheme = document.documentElement.getAttribute('data-theme');
        var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('jac-theme', newTheme);
    });

    // === Mobile Navigation Toggle ===
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.getElementById('nav-menu');

    navToggle.addEventListener('click', function () {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
    });

    // Close menu when a nav link is clicked
    var navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            navToggle.classList.remove('active');
            navMenu.classList.remove('open');
        });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', function (e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('open');
        }
    });

    // === Active Nav Link on Scroll ===
    var sections = document.querySelectorAll('section[id]');

    function highlightNavOnScroll() {
        var scrollY = window.scrollY + 120;

        sections.forEach(function (section) {
            var sectionTop = section.offsetTop - 120;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');
            var navLink = document.querySelector('.nav__link[href="#' + sectionId + '"]');

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
    var header = document.getElementById('header');

    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    }

    // === Back to Top Button ===
    var backToTop = document.getElementById('back-to-top');

    function handleBackToTopVisibility() {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    // Combine all scroll handlers for performance
    var scrollTimeout;
    window.addEventListener('scroll', function () {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(function () {
            scrollTimeout = null;
            highlightNavOnScroll();
            handleHeaderScroll();
            handleBackToTopVisibility();
        }, 16);
    });

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // === Scroll Fade-in Animations ===
    var fadeElements = document.querySelectorAll('.fade-in');

    var fadeObserver = new IntersectionObserver(function (entries) {
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

    // === Hero Stats Counter Animation ===
    var statNumbers = document.querySelectorAll('.hero__stat-number[data-count]');
    var statsAnimated = false;

    var statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                animateCounters();
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.5 });

    var heroStats = document.querySelector('.hero__stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }

    function animateCounters() {
        statNumbers.forEach(function (el) {
            var target = parseInt(el.getAttribute('data-count'), 10);
            var duration = 2000;
            var start = 0;
            var startTime = null;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                // Ease out
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = Math.floor(eased * target);
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

    // === Accordion (Transparency + FAQ) ===
    var accordionHeaders = document.querySelectorAll('.accordion__header');

    accordionHeaders.forEach(function (headerBtn) {
        headerBtn.addEventListener('click', function () {
            var item = this.parentElement;
            var accordion = item.parentElement;
            var isActive = item.classList.contains('active');

            // Close all items in this accordion only
            accordion.querySelectorAll('.accordion__item').forEach(function (acc) {
                acc.classList.remove('active');
                acc.querySelector('.accordion__header').setAttribute('aria-expanded', 'false');
            });

            // Open clicked item if it was closed
            if (!isActive) {
                item.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // === Inventory Search/Filter ===
    var inventorySearch = document.getElementById('inventory-search');
    var inventoryTable = document.getElementById('inventory-table');
    var inventoryCount = document.getElementById('inventory-count');

    if (inventorySearch && inventoryTable) {
        var allRows = inventoryTable.querySelectorAll('tbody tr');
        var totalRows = allRows.length;

        inventorySearch.addEventListener('input', function () {
            var filter = this.value.toLowerCase();
            var visibleCount = 0;

            allRows.forEach(function (row) {
                var text = row.textContent.toLowerCase();
                if (text.indexOf(filter) !== -1) {
                    row.classList.remove('hidden');
                    visibleCount++;
                } else {
                    row.classList.add('hidden');
                }
            });

            if (inventoryCount) {
                inventoryCount.textContent = 'Mostrando ' + visibleCount + ' de ' + totalRows + ' items';
            }
        });
    }

    // === Contact Form Handling ===
    var contactForm = document.getElementById('contact-form');
    var submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var nombre = document.getElementById('nombre').value.trim();
            var email = document.getElementById('email').value.trim();
            var asunto = document.getElementById('asunto').value;
            var mensaje = document.getElementById('mensaje').value.trim();

            if (!nombre || !email || !asunto || !mensaje) {
                showFormMessage('Por favor complete todos los campos obligatorios.', 'error');
                return;
            }

            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFormMessage('Por favor ingrese un correo electronico valido.', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            var formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(function (response) {
                if (response.ok) {
                    showFormMessage('Mensaje enviado exitosamente. Nos pondremos en contacto pronto.', 'success');
                    contactForm.reset();
                } else {
                    showFormMessage('Hubo un error al enviar el mensaje. Por favor intente nuevamente.', 'error');
                }
            })
            .catch(function () {
                showFormMessage('Error de conexion. Por favor verifique su conexion a internet e intente nuevamente.', 'error');
            })
            .finally(function () {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Mensaje';
            });
        });
    }

    function showFormMessage(message, type) {
        var existing = document.querySelector('.form__message');
        if (existing) existing.remove();

        var msgEl = document.createElement('div');
        msgEl.className = 'form__message';
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

        var formTitle = contactForm.querySelector('.contact__form-title');
        if (formTitle) {
            formTitle.insertAdjacentElement('afterend', msgEl);
        } else {
            contactForm.insertBefore(msgEl, contactForm.firstChild);
        }

        setTimeout(function () {
            if (msgEl.parentNode) {
                msgEl.style.transition = 'opacity 0.3s ease';
                msgEl.style.opacity = '0';
                setTimeout(function () {
                    if (msgEl.parentNode) msgEl.remove();
                }, 300);
            }
        }, 5000);
    }

    // Run initial checks
    highlightNavOnScroll();
    handleHeaderScroll();
    handleBackToTopVisibility();
});
