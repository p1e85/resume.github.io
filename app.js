/**
 * P1 CREATIONS LLC - Master Script v1.1
 */

class P1App {
    constructor() {
        this.menuBtn = document.getElementById('menu-toggle-btn');
        this.navLinks = document.getElementById('nav-links-list');
        this.revealElements = document.querySelectorAll('.reveal, .reveal-delay, .stat-card, .log-entry, .offering-card');
        
        this.init();
    }

    init() {
        console.log("P1 Engine v1.1 Online");
        this.setupMobileMenu();
        this.setupScrollObserver();
    }

    setupMobileMenu() {
        if (!this.menuBtn || !this.navLinks) return;

        this.menuBtn.addEventListener('click', () => {
            const isOpen = this.navLinks.classList.toggle('active');
            this.menuBtn.classList.toggle('active');
            document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        });

        // Close menu on link click
        this.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.menuBtn.classList.remove('active');
                this.navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }

    setupScrollObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        this.revealElements.forEach(el => observer.observe(el));
    }
}

// Re-initialize for every page load
window.addEventListener('load', () => {
    new P1App();
});
