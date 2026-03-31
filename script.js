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
        if(icon.classList.contains('fa-bars')) {
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

const commentForm = document.getElementById("comment-form");

if (commentForm) {

    commentForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const btn = this.querySelector("button");
        const initialText = btn.textContent;

        btn.textContent = "Enviando...";
        btn.disabled = true;

        const comentario = document.getElementById("comentario").value;

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
                        calificacion: calificacion
                    }
                ]);

            if (error) throw error;

            btn.textContent = "Comentario Enviado";
            btn.style.backgroundColor = "#2ecc71";

            commentForm.reset();

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
