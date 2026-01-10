/**
 * P1 CREATIONS LLC - Master Application Engine v1.0
 * Author: Patrick, Founder & CEO
 * Features: Mobile Menu, Scroll Animations, Investor Lead Logic
 */

class P1App {
    constructor() {
        // Core UI Elements
        this.menuBtn = document.querySelector('.menu-toggle');
        this.navLinks = document.querySelector('.nav-links');
        this.revealElements = document.querySelectorAll('.reveal, .reveal-delay, .bento-item, .stat-card, .timeline-item');
        
        // Investor Form Elements
        this.investorForm = document.getElementById('p1-investor-form');
        this.formStatus = document.getElementById('form-status');
        
        this.init();
    }

    /**
     * Initialize all application modules
     */
    init() {
        this.setupMobileMenu();
        this.setupScrollObserver();
        this.setupSmoothScroll();
        
        if (this.investorForm) {
            this.setupInvestorForm();
        }

        console.log("P1 Creations LLC Engine: Operational");
    }

    /**
     * Handle Mobile Navigation (Hamburger Menu)
     */
    setupMobileMenu() {
    // Add a log to your console so you can see if the script is even firing
    console.log("Initializing Mobile Menu...");
    
    if (!this.menuBtn || !this.navLinks) {
        console.error("Menu elements not found in DOM!");
        return;
    }
    
    this.menuBtn.addEventListener('click', (e) => {
        // Prevent any default behavior
        e.preventDefault();
        
        console.log("Hamburger Clicked");
        this.menuBtn.classList.toggle('active');
        this.navLinks.classList.toggle('active');
        
        // Block scrolling when menu is open
        if (this.navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });
}


    /**
     * High-Performance Reveal Animations
     * Uses IntersectionObserver to trigger animations as user scrolls
     */
    setupScrollObserver() {
        const options = {
            threshold: 0.1, // Trigger when 10% of element is visible
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before it hits the viewport
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once animation has played
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.revealElements.forEach(el => {
            // Ensure classes exist for CSS to hook into
            if (!el.classList.contains('reveal') && !el.classList.contains('reveal-delay')) {
                el.classList.add('reveal');
            }
            observer.observe(el);
        });
    }

    /**
     * Smooth Scrolling for internal anchor links
     */
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Investor Form Submission Logic
     * Uses fetch API for asynchronous submission without page reload
     */
    async setupInvestorForm() {
        this.investorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = this.investorForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // UI State: Loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = "Processing Request...";
            
            const formData = new FormData(this.investorForm);
            
            try {
                // Connect to Formspree or your backend endpoint
                const response = await fetch(this.investorForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    this.showFormMessage("Request Sent. We will contact you shortly.", "success");
                    this.investorForm.reset();
                } else {
                    throw new Error("Submission Failed");
                }
            } catch (err) {
                this.showFormMessage("Service unavailable. Please email directly.", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    showFormMessage(text, type) {
        if (!this.formStatus) return;
        this.formStatus.innerText = text;
        this.formStatus.className = `form-message ${type}`;
        this.formStatus.style.display = 'block';
        
        // Auto-hide message after 8 seconds
        setTimeout(() => {
            this.formStatus.style.display = 'none';
        }, 8000);
    }
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    window.p1App = new P1App();
});