/**
 * ARO MULTISERVICES - Propuesta 2025
 * Interactive Landing Page Scripts
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initNavbar();
    initMobileMenu();
    initReadingProgress();
    initCursorFollower();
    initScrollAnimations();
    initCounterAnimations();
    initDates();
    initSmoothScroll();
    initGanttAnimation();
    initParticles();
    initHoverEffects();
});

/**
 * Navbar scroll effect
 */
function initNavbar() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }
}

/**
 * Reading progress bar
 */
function initReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.pageYOffset;
        const progress = (scrolled / documentHeight) * 100;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
}

/**
 * Custom cursor follower
 */
function initCursorFollower() {
    const cursor = document.getElementById('cursorFollower');
    if (!cursor) return;

    // Only enable on non-touch devices
    if ('ontouchstart' in window) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
    });

    // Smooth cursor animation
    function animateCursor() {
        const speed = 0.15;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const hoverElements = document.querySelectorAll('a, button, .btn, .pillar, .challenge-card, .metric-card, .roi-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

/**
 * Scroll-triggered animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.pillar, .challenge-card, .transformation-block, .roadmap-phase, .roi-card'
    );

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add staggered delays
    document.querySelectorAll('.pillar').forEach((el, i) => el.dataset.delay = i * 100);
    document.querySelectorAll('.challenge-card').forEach((el, i) => el.dataset.delay = i * 100);
    document.querySelectorAll('.roadmap-phase').forEach((el, i) => el.dataset.delay = i * 150);
    document.querySelectorAll('.roi-card').forEach((el, i) => el.dataset.delay = i * 100);

    animatedElements.forEach(el => observer.observe(el));
}

/**
 * Counter animations for metrics
 */
function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');

    const observerOptions = {
        root: null,
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseInt(target.dataset.count);
                animateCounter(target, 0, countTo, 1500);
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = easeOutQuart(progress);
        const current = Math.floor(easeProgress * (end - start) + start);
        element.textContent = current;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

/**
 * Initialize dates
 */
function initDates() {
    const validityDateEl = document.getElementById('validityDate');
    const currentDateEl = document.getElementById('currentDate');

    const today = new Date();
    const validityDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const formatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    if (validityDateEl) {
        validityDateEl.textContent = validityDate.toLocaleDateString('es-ES', formatOptions);
    }

    if (currentDateEl) {
        currentDateEl.textContent = today.toLocaleDateString('es-ES', formatOptions);
    }
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Animate Gantt chart bars
 */
function initGanttAnimation() {
    const ganttWrapper = document.querySelector('.gantt-wrapper');
    if (!ganttWrapper) return;

    const ganttBars = document.querySelectorAll('.gantt-bar');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                ganttBars.forEach((bar, index) => {
                    const width = bar.style.width;
                    bar.style.width = '0';
                    bar.style.transition = `width 0.8s ease ${index * 0.1}s`;

                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(ganttWrapper);
}

/**
 * Particle background effect
 */
function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        background: rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2});
        border-radius: 50%;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
        opacity: 0;
    `;

    container.appendChild(particle);

    // Fade in
    setTimeout(() => {
        particle.style.opacity = '1';
        particle.style.transition = 'opacity 2s ease';
    }, Math.random() * 2000);
}

// Add particle animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            transform: translateY(0) translateX(0);
        }
        25% {
            transform: translateY(-30px) translateX(10px);
        }
        50% {
            transform: translateY(-60px) translateX(-10px);
        }
        75% {
            transform: translateY(-30px) translateX(5px);
        }
        100% {
            transform: translateY(0) translateX(0);
        }
    }
`;
document.head.appendChild(style);

/**
 * Interactive hover effects
 */
function initHoverEffects() {
    // Magnetic effect on buttons
    const magneticElements = document.querySelectorAll('.btn-primary, .metric-card');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            el.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });

    // Tilt effect on cards
    const tiltElements = document.querySelectorAll('.pillar, .challenge-card');

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });

    // Ripple effect on buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

/**
 * Timeline progress on scroll
 */
window.addEventListener('scroll', () => {
    const timelineProgress = document.getElementById('timelineProgress');
    if (!timelineProgress) return;

    const timeline = document.querySelector('.roadmap-timeline');
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight && rect.bottom > 0) {
        const visibleHeight = Math.min(windowHeight - rect.top, rect.height);
        const progress = (visibleHeight / rect.height) * 100;
        timelineProgress.style.height = `${Math.min(progress, 100)}%`;
    }
});

/**
 * Parallax effect on hero
 */
window.addEventListener('scroll', () => {
    const heroGradient = document.querySelector('.hero-gradient');
    if (heroGradient) {
        const scrolled = window.pageYOffset;
        heroGradient.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

/**
 * Active nav link on scroll
 */
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});

/**
 * Typing effect for highlight word
 */
function initTypingEffect() {
    const highlightWord = document.querySelector('.highlight-word');
    if (!highlightWord) return;

    const words = ['dominar', 'controlar', 'escalar', 'automatizar'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            highlightWord.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            highlightWord.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            setTimeout(() => isDeleting = true, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }

        const speed = isDeleting ? 50 : 100;
        setTimeout(type, speed);
    }

    setTimeout(type, 3000);
}

// Initialize typing effect after page load
window.addEventListener('load', initTypingEffect);

/**
 * Utility: Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttle to scroll handlers
window.addEventListener('scroll', throttle(() => {
    // Additional scroll-based animations can be added here
}, 16));

/**
 * Kanban Board Interactions
 */
function initKanban() {
    const filters = document.querySelectorAll('.kanban-filter');
    const cards = document.querySelectorAll('.kanban-card');

    if (!filters.length || !cards.length) return;

    // Filter functionality
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Update active filter
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            const filterValue = filter.dataset.filter;

            // Filter cards with animation
            cards.forEach(card => {
                const category = card.dataset.category;

                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';

                    setTimeout(() => {
                        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-10px)';

                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });

            // Update column counts
            updateColumnCounts(filterValue);
        });
    });

    // Card hover effects
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('completed')) {
                card.style.transform = 'translateY(-4px)';
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // Animate cards on scroll into view
    const kanbanSection = document.querySelector('.section-kanban');
    if (kanbanSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateKanbanCards();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(kanbanSection);
    }
}

function updateColumnCounts(filter) {
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(column => {
        const cards = column.querySelectorAll('.kanban-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const category = card.dataset.category;
            if (filter === 'all' || category === filter) {
                visibleCount++;
            }
        });

        const countEl = column.querySelector('.column-count');
        if (countEl) {
            countEl.textContent = visibleCount;
        }
    });
}

function animateKanbanCards() {
    const cards = document.querySelectorAll('.kanban-card');

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

/**
 * Tech Stack Banner Animation
 */
function initTechStackAnimation() {
    const techItems = document.querySelectorAll('.tech-item');

    techItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(item);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(item);
    });
}

/**
 * PostHog Benefits Animation
 */
function initPostHogAnimation() {
    const benefits = document.querySelectorAll('.posthog-benefit');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';

                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    benefits.forEach(benefit => observer.observe(benefit));
}

// Initialize Kanban on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initKanban();
    initTechStackAnimation();
    initPostHogAnimation();
});

console.log('ARO Multiservices Proposal - Interactive Landing Loaded');
