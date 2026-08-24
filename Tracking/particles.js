// ===============================================
// PARTICLE SYSTEM FOR TEXT SHATTER EFFECT
// ===============================================

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isAnimating = false;

        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Create particle explosion from text position
     */
    explode(x, y, text, color) {
        const particleCount = 60; // Number of particles

        // Create particles radiating outward
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 3 + Math.random() * 5;

            const particle = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.01 + Math.random() * 0.02,
                size: 3 + Math.random() * 5,
                color: color || '#00ffff',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            };

            this.particles.push(particle);
        }

        // Add some larger chunks for variety
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;

            const chunk = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.005 + Math.random() * 0.01,
                size: 8 + Math.random() * 12,
                color: color || '#00ffff',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                isChunk: true
            };

            this.particles.push(chunk);
        }

        if (!this.isAnimating) {
            this.animate();
        }
    }

    /**
     * Animate particles
     */
    animate() {
        this.isAnimating = true;

        const animateFrame = () => {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Apply gravity
                p.vy += 0.15;

                // Apply air resistance
                p.vx *= 0.98;
                p.vy *= 0.98;

                // Update rotation
                p.rotation += p.rotationSpeed;

                // Decrease life
                p.life -= p.decay;

                // Remove dead particles
                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }

                // Draw particle
                this.ctx.save();
                this.ctx.globalAlpha = p.life;
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);

                if (p.isChunk) {
                    // Draw chunky squares for larger pieces
                    this.ctx.fillStyle = p.color;
                    this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

                    // Add glow
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = p.color;
                    this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else {
                    // Draw circular particles
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = p.color;
                    this.ctx.fill();

                    // Add glow
                    this.ctx.shadowBlur = 8;
                    this.ctx.shadowColor = p.color;
                    this.ctx.fill();
                }

                this.ctx.restore();
            }

            // Continue animation if particles exist
            if (this.particles.length > 0) {
                requestAnimationFrame(animateFrame);
            } else {
                this.isAnimating = false;
            }
        };

        animateFrame();
    }

    /**
     * Create text shatter effect
     */
    shatterText(text, x, y, fontSize, color) {
        // Create particles from text position
        this.explode(x, y, text, color);

        // Add some sparkle particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            const distance = fontSize * 0.5 + Math.random() * fontSize;

            const sparkle = {
                x: x + Math.cos(angle) * distance * 0.3,
                y: y + Math.sin(angle) * distance * 0.3,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                size: 1 + Math.random() * 3,
                color: '#ffffff',
                rotation: 0,
                rotationSpeed: 0
            };

            this.particles.push(sparkle);
        }
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

/**
 * Create glitch effect on text
 */
class GlitchEffect {
    static apply(element) {
        // Add random glitch classes
        element.style.transform = 'translate(-50%, -50%)';

        // Quick glitch animation
        const glitchSteps = [
            { offset: -3, hue: 90, delay: 0 },
            { offset: 5, hue: -90, delay: 50 },
            { offset: -2, hue: 180, delay: 100 },
            { offset: 0, hue: 0, delay: 150 }
        ];

        glitchSteps.forEach(step => {
            setTimeout(() => {
                element.style.transform = `translate(calc(-50% + ${step.offset}px), -50%)`;
                element.style.filter = `hue-rotate(${step.hue}deg) contrast(1.2)`;
            }, step.delay);
        });

        // Reset after glitch
        setTimeout(() => {
            element.style.transform = 'translate(-50%, -50%)';
            element.style.filter = 'contrast(1.2) brightness(1.1)';
        }, 200);
    }
}
