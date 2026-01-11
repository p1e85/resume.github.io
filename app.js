/**
 * P1 CREATIONS LLC - Master Script
 */

class P1App {
    constructor() {
        // Use direct IDs for absolute certainty
        this.menuBtn = document.getElementById('menu-toggle-btn');
        this.navLinks = document.getElementById('nav-links-list');
        this.revealElements = document.querySelectorAll('.reveal, .reveal-delay');
        
        this.init();
    }

    init() {
        console.log("P1 Engine Start...");
        this.setupMobileMenu();
        this.setupScrollObserver();
    }

    setupMobileMenu() {
        if (!this.menuBtn || !this.navLinks) {
            console.error("Critical Error: Menu elements missing from HTML!");
            return;
        }

        this.menuBtn.addEventListener('click', (e) => {
            console.log("Toggle Clicked"); // This will show in your console
            
            // Toggle classes
            this.menuBtn.classList.toggle('active');
            this.navLinks.classList.toggle('active');

            // Freeze background scroll
            if (this.navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });

        // Close menu when a link is clicked
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

// Ensure the script runs only after the DOM is fully ready
window.addEventListener('load', () => {
    new P1App();
});
