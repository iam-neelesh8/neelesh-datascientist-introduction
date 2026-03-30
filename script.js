document.addEventListener('DOMContentLoaded', () => {
    // --- Data Science Background Animation ---
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        const particles = [];
        const properties = {
            particleColor: 'rgba(56, 189, 248, 0.5)',
            lineColor: '129, 140, 248',
            particleRadius: 3,
            particleCount: window.innerWidth < 768 ? 40 : 80,
            particleMaxVelocity: 0.5,
            lineLength: 150,
        };

        function updateColors() {
            if (document.documentElement.classList.contains('light-mode')) {
                properties.particleColor = 'rgba(14, 165, 233, 0.5)';
                properties.lineColor = '99, 102, 241';
            } else {
                properties.particleColor = 'rgba(56, 189, 248, 0.5)';
                properties.lineColor = '129, 140, 248';
            }
        }
        
        // Initial color update
        setTimeout(updateColors, 50);

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            // Optional: Adjust count on resize, but generally better to keep stable list
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.velocityX = (Math.random() * (properties.particleMaxVelocity * 2)) - properties.particleMaxVelocity;
                this.velocityY = (Math.random() * (properties.particleMaxVelocity * 2)) - properties.particleMaxVelocity;
            }
            position() {
                if (this.x + this.velocityX > width || this.x + this.velocityX < 0) this.velocityX *= -1;
                if (this.y + this.velocityY > height || this.y + this.velocityY < 0) this.velocityY *= -1;
                this.x += this.velocityX;
                this.y += this.velocityY;
            }
            reDraw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, properties.particleRadius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = properties.particleColor;
                ctx.fill();
            }
        }

        function drawLines() {
            let x1, y1, x2, y2, length, opacity;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    x1 = particles[i].x;
                    y1 = particles[i].y;
                    x2 = particles[j].x;
                    y2 = particles[j].y;
                    length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    if (length < properties.lineLength) {
                        opacity = 1 - length / properties.lineLength;
                        ctx.lineWidth = 0.5;
                        ctx.strokeStyle = `rgba(${properties.lineColor}, ${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
            }
        }

        function loop() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].position();
                particles[i].reDraw();
            }
            drawLines();
            requestAnimationFrame(loop);
        }

        for (let i = 0; i < properties.particleCount; i++) {
            particles.push(new Particle());
        }
        loop();
        
        // Listen to theme toggle explicitly anywhere in window to update colors
        document.addEventListener('click', (e) => {
            if (e.target.closest('#theme-toggle')) {
                setTimeout(updateColors, 50);
            }
        });
    }

    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        document.documentElement.classList.add('light-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('light-mode');
            const isLightMode = document.documentElement.classList.contains('light-mode');
            
            // Save preference
            localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
            
            // Toggle icon
            if (isLightMode) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        });
    }

    // --- Smooth scrolling & Navigation ---
    // Smooth scrolling for navigation links (only on the same page)
    document.querySelectorAll('a[href^="index.html#"], a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            let targetId = this.getAttribute('href');
            
            // Handle cross-page hash links on the same page
            if (targetId.startsWith('index.html#') && window.location.pathname.endsWith('index.html')) {
                targetId = targetId.replace('index.html', '');
            } else if (targetId.startsWith('index.html#')) {
                return; // Let default navigation happen
            }

            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                // Adjust for fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Observe all sections and cards
    document.querySelectorAll('.section, .card, .hero-content').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Add class for animation styles
    const style = document.createElement('style');
    style.innerHTML = `
        .fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close mobile menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
});
