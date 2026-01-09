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

        const investor = new InvestorEngine();
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

// Extend the existing P1App class or add a new one
class InvestorEngine {
    constructor() {
        this.init();
    }

    init() {
        // Example: Add a simple calculator logic if needed later
        this.logVisitorInterest();
    }

    logVisitorInterest() {
        // This is a placeholder for future analytics
        console.log("Investor Page Engine: Active");
    }
}

class InvestorContact {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;

        this.submitBtn = this.form.querySelector('#submit-btn');
        this.statusMsg = document.getElementById('form-status');
        this.loader = this.submitBtn.querySelector('.loader');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        console.log("Investor Contact Engine: Active");
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setLoading(true);

        const formData = new FormData(this.form);
        
        try {
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                this.showMessage("Success! We will send the documents within 24 hours.", "success");
                this.form.reset();
            } else {
                throw new Error();
            }
        } catch (error) {
            this.showMessage("Oops! There was a problem. Please email patrick@p1creations.com directly.", "error");
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.loader.classList.remove('hidden');
            this.submitBtn.querySelector('.btn-text').style.opacity = '0.3';
        } else {
            this.submitBtn.disabled = false;
            this.loader.classList.add('hidden');
            this.submitBtn.querySelector('.btn-text').style.opacity = '1';
        }
    }

    showMessage(text, type) {
        this.statusMsg.innerText = text;
        this.statusMsg.className = `form-message ${type}`;
        this.statusMsg.classList.remove('hidden');
    }
}

// Instantiate in the DOMContentLoaded block
window.addEventListener('DOMContentLoaded', () => {
    new P1App(); // Existing UI logic
    new InvestorContact('p1-investor-form');
});
