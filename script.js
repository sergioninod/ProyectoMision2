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
let allOpinions = [];
let currentPage = 1;
const itemsPerPage = 4;

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

        allOpinions = data || [];
        currentPage = 1;
        renderPagination();

    } catch (err) {
        console.error('Error al cargar opiniones:', err);
        grid.innerHTML = `
            <p class="opiniones-empty">
                <i class="fas fa-exclamation-circle" style="color:#e74c3c; margin-right: 8px;"></i>
                No se pudieron cargar las opiniones. Intenta más tarde.
            </p>`;
        const paginationControls = document.getElementById('pagination-controls');
        if(paginationControls) paginationControls.style.display = 'none';
    }
}

function renderPagination() {
    const grid = document.getElementById('opiniones-grid');
    const paginationControls = document.getElementById('pagination-controls');
    
    if (allOpinions.length === 0) {
        grid.innerHTML = `
            <p class="opiniones-empty">
                <i class="fas fa-comment-slash" style="color: var(--secondary-color); margin-right: 8px;"></i>
                Aún no hay opiniones. ¡Sé el primero en compartir la tuya!
            </p>`;
        if(paginationControls) paginationControls.style.display = 'none';
        return;
    }

    const totalPages = Math.ceil(allOpinions.length / itemsPerPage);
    if(currentPage < 1) currentPage = 1;
    if(currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = allOpinions.slice(startIndex, endIndex);

    grid.innerHTML = paginatedItems.map((op, i) => `
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

    if (paginationControls) {
        if (totalPages > 1) {
            paginationControls.style.display = 'flex';
            document.getElementById('page-info').innerText = `${currentPage} / ${totalPages}`;
            
            const btnPrev = document.getElementById('prev-page');
            const btnNext = document.getElementById('next-page');
            
            if (btnPrev && btnNext) {
                btnPrev.disabled = currentPage === 1;
                btnNext.disabled = currentPage === totalPages;
                
                btnPrev.style.opacity = btnPrev.disabled ? '0.5' : '1';
                btnNext.style.opacity = btnNext.disabled ? '0.5' : '1';
                btnPrev.style.cursor = btnPrev.disabled ? 'not-allowed' : 'pointer';
                btnNext.style.cursor = btnNext.disabled ? 'not-allowed' : 'pointer';
            }
        } else {
            paginationControls.style.display = 'none';
        }
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

// Cargar comentarios y escuchar botones de paginación al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabaseClient !== 'undefined') {
        cargarComentarios();
    }
    
    // Listeners paginación
    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPagination();
            }
        });
    }
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            const totalPages = Math.ceil(allOpinions.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderPagination();
            }
        });
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

/* === INTEGRACIÓN TEACHABLE MACHINE (👍 / 👎) === */
const tmURL = "https://teachablemachine.withgoogle.com/models/kp0cBYs9C/";
let tmModel, webcam, maxPredictions;
let isCameraActive = false;
let tmInterval;
let lastDetectedValue = null;

const startCameraBtn = document.getElementById("start-camera-btn");
const tmStatus = document.getElementById("tm-status");
const webcamContainer = document.getElementById("webcam-container");

if (startCameraBtn) {
    startCameraBtn.addEventListener("click", initTM);
}

// Opcional: Escuchar eventos de finalización de llamada en VAPI para invitar a calificar
window.addEventListener('vapi-call-end', () => {
    // Si queremos Auto-start, llamar a initTM(). 
    // Por el momento, el fallback de "Cámara activa" depende del click del usuario.
    if(startCameraBtn) {
        startCameraBtn.classList.add('pulse'); // Añadir alguna animación sugerida
    }
});

async function initTM() {
    if (isCameraActive) return;
    
    startCameraBtn.style.display = "none";
    tmStatus.style.display = "block";
    tmStatus.innerText = "Solicitando permisos de cámara y cargando modelo...";

    try {
        const modelURL = tmURL + "model.json";
        const metadataURL = tmURL + "metadata.json";

        tmModel = await tmImage.load(modelURL, metadataURL);
        maxPredictions = tmModel.getTotalClasses();

        // Configuración de la cámara
        const flip = true; 
        webcam = new tmImage.Webcam(250, 250, flip); 
        
        await webcam.setup(); // Solicitar acceso a la cámara
        await webcam.play();
        window.requestAnimationFrame(loopTM);
        
        isCameraActive = true;
        webcamContainer.innerHTML = "";
        webcamContainer.appendChild(webcam.canvas);
        
        let timeLeft = 5;
        tmStatus.innerHTML = `<strong>Cámara Activa:</strong> Evaluando en <span id="tm-timer">${timeLeft}</span>s. <br><span id="tm-live-feedback">Haz un gesto 👍 o 👎.</span>`;
        tmStatus.style.color = "var(--secondary-color)";

        tmInterval = setInterval(() => {
            if (!isCameraActive) {
                clearInterval(tmInterval);
                return;
            }
            timeLeft--;
            const timerSpan = document.getElementById("tm-timer");
            if (timerSpan) timerSpan.innerText = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(tmInterval);
                confirmarCalificacionTM();
            }
        }, 1000);

    } catch (error) {
        console.error("Error al iniciar Teachable Machine:", error);
        tmStatus.innerText = "Error accediendo a la cámara. Por favor, usa la calificación manual (botones).";
        tmStatus.style.color = "#e74c3c";
        startCameraBtn.style.display = "block";
    }
}

async function loopTM() {
    if (!isCameraActive) return;
    webcam.update(); 
    await predictTM();
    if(isCameraActive) {
        window.requestAnimationFrame(loopTM);
    }
}

async function predictTM() {
    if (!isCameraActive) return;
    
    const prediction = await tmModel.predict(webcam.canvas);
    
    // Umbral de confianza
    const umbral = 0.85;
    lastDetectedValue = null;
    const liveFeedback = document.getElementById("tm-live-feedback");

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > umbral) {
            let className = prediction[i].className.toLowerCase();
            
            // Evaluamos si el nombre de la clase está típicamente relacionado al lado positivo (1) o negativo (2)
            // Se asume el índice 0 o palabras como "bien", "arriba", etc., como Positivo
            if (className.includes("1") || className.includes("bien") || className.includes("arriba") || className.includes("👍") || className.includes("positivo") || i === 0) {
                lastDetectedValue = { valor: 5, mensaje: "¡Gesto Positivo Detectado! Calificación asignada: 5 estrellas." };
                if (liveFeedback) {
                    liveFeedback.innerHTML = "<strong>👍 Detectando Positivo... ¡Mantenlo!</strong>";
                    liveFeedback.style.color = "#2ecc71";
                }
                return;
            } else if (className.includes("2") || className.includes("mal") || className.includes("abajo") || className.includes("👎") || className.includes("negativo") || i === 1) {
                lastDetectedValue = { valor: 1, mensaje: "¡Gesto Negativo Detectado! Calificación asignada: 1 estrella." };
                if (liveFeedback) {
                    liveFeedback.innerHTML = "<strong>👎 Detectando Negativo... ¡Mantenlo!</strong>";
                    liveFeedback.style.color = "#e74c3c";
                }
                return;
            }
        }
    }
    
    if (liveFeedback) {
        liveFeedback.innerHTML = "Haz un gesto 👍 o 👎.";
        liveFeedback.style.color = "inherit";
    }
}

function confirmarCalificacionTM() {
    if (lastDetectedValue) {
        seleccionarEstrellas(lastDetectedValue.valor);
        detenerTM(lastDetectedValue.mensaje, true);
    } else {
        detenerTM("Tiempo agotado. No se detectó un gesto claro. Puedes intentarlo de nuevo.", false);
    }
}

function seleccionarEstrellas(valor) {
    const star = document.getElementById("star" + valor);
    if (star) {
        star.checked = true;
        
        // Destacar visualmente la selección si se desea
        star.parentElement.style.animation = "pulse 0.5s ease-in-out";
    }
}

function detenerTM(mensaje, exito = true) {
    isCameraActive = false;
    if (webcam) {
        webcam.stop();
    }
    webcamContainer.innerHTML = "";
    clearInterval(tmInterval);
    
    tmStatus.innerHTML = `<strong>${mensaje}</strong><br>Cámara detenida.${exito ? ' Puedes enviar tu comentario ahora.' : ''}`;
    tmStatus.style.color = exito ? "#2ecc71" : "#e74c3c"; // Verde éxito o rojo error
    
    // Mostramos botón por si quiere re-evaluar manual o volver a intentar
    startCameraBtn.style.display = "inline-block";
    startCameraBtn.innerHTML = '<i class="fas fa-redo"></i> ' + (exito ? 'Volver a Calificar con Cámara' : 'Reintentar con Cámara');
}
