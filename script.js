// Intersection Observer for Reveal Animations
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Once the element has revealed, we don't need to observe it anymore
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15 // Reveal when at least 15% of the element is visible
});

revealElements.forEach(element => {
    revealOnScroll.observe(element);
});

// Navbar background change on scroll
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (backToTop) {
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    }
});

// Mobile Menu Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Toggle icon between bars and times (X)
        const icon = mobileMenu.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenu.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Offset for navbar
                behavior: 'smooth'
            });
        }
    });
});

// Simple Contact Form Handling
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Basic feedback animation
        const initialBtnText = this.querySelector('button').textContent;
        const btn = this.querySelector('button');

        btn.textContent = 'Enviando...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        // Send data to Formspree
        const formData = new FormData(this);

        fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                btn.textContent = 'Mensaje Enviado';
                btn.style.backgroundColor = '#2ecc71'; // Green for success
                btn.style.color = '#fff';
                contactForm.reset();
            } else {
                throw new Error('Error en el envío');
            }
        }).catch(error => {
            btn.textContent = 'Error al Enviar';
            btn.style.backgroundColor = '#e74c3c'; // Red for error
            btn.style.color = '#fff';
        }).finally(() => {
            // Revert button after 3 seconds
            setTimeout(() => {
                btn.textContent = initialBtnText;
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }, 3000);
        });
    });
}

// COMENTARIOS CON SUPABASE

/**
 * Renderiza las estrellas según la calificación (1-5).
 * @param {number} calificacion
 * @returns {string} HTML de íconos de estrellas
 */
function renderEstrellas(calificacion) {
    return Array.from({ length: 5 }, (_, i) =>
        `<i class="fas fa-star${i < calificacion ? ' filled' : ''}"></i>`
    ).join('');
}

/**
 * Formatea una fecha ISO a texto legible en español.
 * @param {string} isoString
 * @returns {string}
 */
function formatearFecha(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Carga todas las opiniones de Supabase y las pinta en el grid.
 */
async function cargarComentarios() {
    const grid = document.getElementById('opiniones-grid');
    if (!grid || typeof supabaseClient === 'undefined') return;

    // Estado de carga
    grid.innerHTML = `
        <div class="opiniones-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Cargando opiniones...</span>
        </div>`;

    try {
        const { data, error } = await supabaseClient
            .from('comentario')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            grid.innerHTML = `
                <p class="opiniones-empty">
                    <i class="fas fa-comment-slash" style="color: var(--secondary-color); margin-right: 8px;"></i>
                    Aún no hay opiniones. ¡Sé el primero en compartir la tuya!
                </p>`;
            return;
        }

        grid.innerHTML = data.map((op, i) => `
            <div class="opinion-card" style="animation-delay: ${i * 0.07}s">
                <div class="opinion-stars">
                    ${renderEstrellas(Number(op.calificacion))}
                    <span class="opinion-rating-num">${op.calificacion}/5</span>
                </div>
                <p class="opinion-text">"${op.comentario}"</p>
                ${op.created_at ? `
                <p class="opinion-date">
                    <i class="fas fa-calendar-alt"></i>
                    ${formatearFecha(op.created_at)}
                </p>` : ''}
            </div>
        `).join('');

    } catch (err) {
        console.error('Error al cargar opiniones:', err);
        grid.innerHTML = `
            <p class="opiniones-empty">
                <i class="fas fa-exclamation-circle" style="color:#e74c3c; margin-right: 8px;"></i>
                No se pudieron cargar las opiniones. Intenta más tarde.
            </p>`;
    }
}
const commentForm = document.getElementById("comment-form");

if (commentForm) {

    commentForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const btn = this.querySelector("button");
        const initialText = btn.textContent;

        btn.textContent = "Enviando...";
        btn.disabled = true;

        const comentario = document.getElementById("comentario").value;
        const nombre = document.getElementById('opinion-nombre').value.trim();
        const email = document.getElementById('opinion-email').value.trim();
        const ratingSelected = document.querySelector('input[name="rating"]:checked');

        if (!ratingSelected) {

            alert("Debes seleccionar una calificación de al menos 1 estrella.");

            btn.textContent = initialText;
            btn.disabled = false;

            return;
        }

        const calificacion = ratingSelected.value;

        try {

            const { data, error } = await supabaseClient
                .from("comentario")
                .insert([
                    {
                        comentario: comentario,
                        calificacion: calificacion,
                        nombre: nombre,
                        email: email
                    }
                ]);

            if (error) throw error;

            btn.textContent = "Comentario Enviado";
            btn.style.backgroundColor = "#2ecc71";

            commentForm.reset();

            await cargarComentarios();

        } catch (error) {

            console.error(error);

            btn.textContent = "Error al Enviar";
            btn.style.backgroundColor = "#e74c3c";

        }

        setTimeout(() => {
            btn.textContent = initialText;
            btn.disabled = false;
            btn.style.backgroundColor = "";
        }, 3000);

    });

}

// Cargar comentarios al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabaseClient !== 'undefined') {
        cargarComentarios();
    }
});

// Hover effects for service cards (optional subtle JS reinforcement)
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--secondary-color)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'var(--glass-border)';
    });
});
