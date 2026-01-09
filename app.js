/**
 * P1 Creations UI Controller
 * Uses Intersection Observer for high-performance scroll reveals.
 */
class P1App {
    constructor() {
        this.revealElements = document.querySelectorAll('.reveal, .reveal-delay, .bento-item');
        this.init();
    }

    init() {
        this.setupRevealObserver();
        this.setupSmoothScroll();
        console.log("P1 Creations Engine Initialized...");
    }

    setupRevealObserver() {
        const observerOptions = {
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Once animated, we don't need to observe it anymore
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.revealElements.forEach(el => {
            // Pre-add the reveal class if not there for Bento items
            if (!el.classList.contains('reveal')) el.classList.add('reveal');
            observer.observe(el);
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Instantiate the App on Load
window.addEventListener('DOMContentLoaded', () => {
    const p1 = new P1App();
});
