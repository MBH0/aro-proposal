/**
 * ARO MULTISERVICES - Project Page Scripts
 * Discovery Form & Interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    initDiscoveryForm();
    initCategoryToggle();
    initProgressTracking();
    initAutoSave();
    loadSavedAnswers();
});

/**
 * Discovery Form Interactions
 */
function initDiscoveryForm() {
    const form = document.querySelector('.section-discovery');
    if (!form) return;

    // Option selection feedback
    const options = document.querySelectorAll('.question-options .option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const input = this.querySelector('input');

            // Add visual feedback
            if (input.type === 'radio') {
                // For radio, remove selected from siblings
                const siblings = this.closest('.question-options').querySelectorAll('.option');
                siblings.forEach(s => s.classList.remove('selected'));
            }

            this.classList.toggle('selected', input.checked);

            // Update progress
            updateProgress();

            // Auto-save
            saveAnswers();

            // Animate the card
            const card = this.closest('.question-card');
            card.classList.add('answered');
        });
    });

    // Textarea changes
    const textareas = document.querySelectorAll('.question-textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', debounce(() => {
            saveAnswers();
            updateProgress();

            if (textarea.value.trim()) {
                textarea.closest('.question-card').classList.add('answered');
            }
        }, 500));
    });

    // Submit button
    const submitBtn = document.getElementById('submitAnswers');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }

    // Save draft button
    const saveDraftBtn = document.getElementById('saveDraft');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => {
            saveAnswers();
            showNotification('Borrador guardado correctamente');
        });
    }
}

/**
 * Category Toggle (Expand/Collapse)
 */
function initCategoryToggle() {
    const categoryHeaders = document.querySelectorAll('.category-header');

    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const category = header.closest('.discovery-category');
            const grid = category.querySelector('.questions-grid');

            category.classList.toggle('collapsed');

            if (category.classList.contains('collapsed')) {
                grid.style.maxHeight = '0';
                grid.style.opacity = '0';
                grid.style.overflow = 'hidden';
            } else {
                grid.style.maxHeight = grid.scrollHeight + 'px';
                grid.style.opacity = '1';
                setTimeout(() => {
                    grid.style.overflow = 'visible';
                    grid.style.maxHeight = 'none';
                }, 300);
            }
        });
    });
}

/**
 * Progress Tracking
 */
function initProgressTracking() {
    updateProgress();
}

function updateProgress() {
    const totalQuestions = document.querySelectorAll('.question-card').length;
    const answeredQuestions = document.querySelectorAll('.question-card.answered').length;

    // Check for answered questions
    document.querySelectorAll('.question-card').forEach(card => {
        const hasChecked = card.querySelector('input:checked');
        const hasText = card.querySelector('.question-textarea')?.value.trim();

        if (hasChecked || hasText) {
            card.classList.add('answered');
        }
    });

    const newAnswered = document.querySelectorAll('.question-card.answered').length;
    const percentage = Math.round((newAnswered / totalQuestions) * 100);

    // Update stats if they exist
    const progressStat = document.querySelector('.project-stats .stat:nth-child(3) .stat-value');
    if (progressStat) {
        progressStat.textContent = newAnswered;
    }

    // Update submit button state
    const submitBtn = document.getElementById('submitAnswers');
    if (submitBtn) {
        if (newAnswered >= totalQuestions * 0.5) { // At least 50% answered
            submitBtn.disabled = false;
            submitBtn.classList.remove('disabled');
        }
    }

    // Update category progress
    document.querySelectorAll('.discovery-category').forEach(category => {
        const total = category.querySelectorAll('.question-card').length;
        const answered = category.querySelectorAll('.question-card.answered').length;
        const countEl = category.querySelector('.category-count');

        if (countEl) {
            countEl.textContent = `${answered}/${total} respondidas`;

            if (answered === total) {
                countEl.classList.add('complete');
            } else {
                countEl.classList.remove('complete');
            }
        }
    });
}

/**
 * Auto-save functionality
 */
function initAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
        saveAnswers();
    }, 30000);
}

function saveAnswers() {
    const answers = {};

    // Collect all radio/checkbox answers
    document.querySelectorAll('.question-card').forEach(card => {
        const questionNum = card.dataset.question;
        const inputs = card.querySelectorAll('input:checked');
        const textarea = card.querySelector('.question-textarea');

        if (inputs.length > 0) {
            answers[`q${questionNum}`] = Array.from(inputs).map(i => i.value);
        }

        if (textarea && textarea.value.trim()) {
            answers[`q${questionNum}_text`] = textarea.value.trim();
        }
    });

    // Save to localStorage
    localStorage.setItem('aro_discovery_answers', JSON.stringify(answers));
    localStorage.setItem('aro_discovery_timestamp', new Date().toISOString());
}

function loadSavedAnswers() {
    const saved = localStorage.getItem('aro_discovery_answers');
    if (!saved) return;

    try {
        const answers = JSON.parse(saved);

        Object.entries(answers).forEach(([key, value]) => {
            if (key.endsWith('_text')) {
                // It's a textarea
                const qNum = key.replace('q', '').replace('_text', '');
                const card = document.querySelector(`.question-card[data-question="${qNum}"]`);
                const textarea = card?.querySelector('.question-textarea');
                if (textarea) {
                    textarea.value = value;
                }
            } else {
                // It's radio/checkbox
                const qNum = key.replace('q', '');
                const card = document.querySelector(`.question-card[data-question="${qNum}"]`);

                if (card && Array.isArray(value)) {
                    value.forEach(v => {
                        const input = card.querySelector(`input[value="${v}"]`);
                        if (input) {
                            input.checked = true;
                            input.closest('.option').classList.add('selected');
                        }
                    });
                }
            }
        });

        // Update progress after loading
        updateProgress();

        // Show saved notification
        const timestamp = localStorage.getItem('aro_discovery_timestamp');
        if (timestamp) {
            const date = new Date(timestamp);
            const timeAgo = getTimeAgo(date);
            showNotification(`Respuestas cargadas (guardadas ${timeAgo})`, 'info');
        }
    } catch (e) {
        console.error('Error loading saved answers:', e);
    }
}

/**
 * Handle form submission
 */
function handleSubmit() {
    const answers = JSON.parse(localStorage.getItem('aro_discovery_answers') || '{}');
    const answeredCount = Object.keys(answers).filter(k => !k.endsWith('_text')).length;

    if (answeredCount < 12) { // Minimum 50% of 24 questions
        showNotification('Por favor responda al menos 12 preguntas antes de enviar', 'warning');
        return;
    }

    // Generate summary
    const summary = generateSummary(answers);

    // Create WhatsApp message
    const message = encodeURIComponent(`*Discovery Completado - Aro Booking System*\n\n${summary}\n\n_Ver respuestas completas en la plataforma_`);

    // Option 1: Open WhatsApp
    const whatsappUrl = `https://wa.me/34614362100?text=${message}`;

    // Show confirmation modal
    showConfirmModal(summary, whatsappUrl);
}

function generateSummary(answers) {
    let summary = '';

    // Key insights from answers
    if (answers.q1) {
        const clientType = {
            'residential-heavy': 'Mayoria clientes residenciales',
            'balanced': 'Balance entre residencial y empresas',
            'business-heavy': 'Mayoria clientes empresariales',
            'unknown': 'Mix de clientes'
        };
        summary += `• Tipo de clientes: ${clientType[answers.q1[0]] || 'No especificado'}\n`;
    }

    if (answers.q8) {
        const frequency = {
            'one-time': 'Solo servicios unicos',
            'recurring': 'Servicios recurrentes',
            'both': 'Unicos y recurrentes'
        };
        summary += `• Modelo: ${frequency[answers.q8[0]] || 'No especificado'}\n`;
    }

    if (answers.q22) {
        const priority = {
            'speed': 'Velocidad de lanzamiento',
            'features': 'Funcionalidades completas',
            'design': 'Diseno y UX',
            'scalability': 'Escalabilidad'
        };
        summary += `• Prioridad: ${priority[answers.q22[0]] || 'No especificado'}\n`;
    }

    const totalAnswered = Object.keys(answers).filter(k => !k.endsWith('_text')).length;
    summary += `\n📊 ${totalAnswered}/24 preguntas respondidas`;

    return summary;
}

function showConfirmModal(summary, whatsappUrl) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Resumen de Respuestas</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <pre>${summary}</pre>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary modal-cancel">Seguir editando</button>
                <a href="${whatsappUrl}" target="_blank" class="btn btn-primary btn-glow">
                    Enviar por WhatsApp
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                </a>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animate in
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });

    // Close handlers
    modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.modal-backdrop').addEventListener('click', () => closeModal(modal));
}

function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            ${type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ'}
        </div>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('active');
    });

    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Utility: Time ago
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'hace unos segundos';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
    return `hace ${Math.floor(seconds / 86400)} dias`;
}

/**
 * Utility: Debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Project Hero Stats Animation
 */
document.addEventListener('DOMContentLoaded', () => {
    const stats = document.querySelectorAll('.project-stats .stat-value');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const value = parseInt(target.textContent);

                if (!isNaN(value)) {
                    animateNumber(target, 0, value, 1000);
                }

                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
});

function animateNumber(element, start, end, duration) {
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = current;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };

    window.requestAnimationFrame(step);
}

console.log('ARO Project Page - Discovery & Kanban Loaded');
