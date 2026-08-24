// ============================================
// FINAL OPTIMIZED LIQUID MORPHING
// Velocity + Friction Physics + Random Ease
// Organic flowing movement
// ============================================

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;

        // VELOCITY SYSTEM
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.94; // Drift effect

        // RANDOM EASE for organic movement (each particle moves differently)
        this.ease = 0.03 + Math.random() * 0.05; // 0.03 - 0.08

        this.color = color;
        this.size = 4.5; // Larger to compensate for gap
        this.alpha = 0;
        this.targetAlpha = 1;
        this.isOffScreen = false;
    }

    update(allRepulsors, attractionStrength, repulsionStrength) {
        // ==========================================
        // ATTRACTION TO TARGET (Velocity-based)
        // ==========================================
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;

        // Add force to velocity (not direct position change)
        this.vx += dx * this.ease;
        this.vy += dy * this.ease;

        // ==========================================
        // HAND REPULSION (Momentum-based)
        // ==========================================
        for (const repulsor of allRepulsors) {
            const rx = this.x - repulsor.x;
            const ry = this.y - repulsor.y;
            const distSq = rx * rx + ry * ry;
            const radiusSq = repulsor.radius * repulsor.radius;

            if (distSq < radiusSq && distSq > 0) {
                const dist = Math.sqrt(distSq);
                const force = (1 - dist / repulsor.radius) * repulsionStrength;

                // Push velocity (creates drift effect)
                this.vx += (rx / dist) * force;
                this.vy += (ry / dist) * force;
            }
        }

        // Apply velocity to position
        this.x += this.vx;
        this.y += this.vy;

        // Apply friction (smooth deceleration)
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Smooth alpha transition
        this.alpha += (this.targetAlpha - this.alpha) * 0.08;
    }

    draw(ctx) {
        if (this.alpha <= 0.02) return;

        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        // Square particles (digital dust)
        ctx.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

class GestureApp {
    constructor() {
        this.video = document.getElementById('videoElement');
        this.canvas = document.getElementById('canvasElement');
        this.ctx = this.canvas.getContext('2d');
        this.overlayText = document.getElementById('overlayText');
        this.loading = document.getElementById('loading');

        if (this.overlayText) this.overlayText.style.display = 'none';

        this.hands = null;
        this.handsData = [];

        this.particles = [];
        this.currentText = null;
        this.currentColor = '#00F3FF';

        this.allRepulsors = [];

        // OPTIMIZED PHYSICS
        this.attractionStrength = 0.08;  // Base attraction
        this.repulsionStrength = 18;      // Strong push
        this.repulsionRadius = 200;

        this.showDebug = true;

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Starting organic liquid morphing...');

            await this.setupCamera();
            await this.setupHandTracking();

            this.loading.classList.add('hidden');
            this.render();

            console.log('✅ Ready! Show 1-3 fingers.');
        } catch (error) {
            console.error('❌ Init error:', error);
            document.getElementById('loadingText').innerHTML =
                `<span style="color:#ff4444">Error: ${error.message}</span><br><br>` +
                `<span style="font-size:12px">Check F12 Console for details</span>`;
        }
    }

    async setupCamera() {
        console.log('📹 Requesting camera access...');

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: 'user'
            },
            audio: false
        });

        this.video.srcObject = stream;

        await new Promise((resolve) => {
            this.video.onloadedmetadata = () => resolve();
        });

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        console.log('✅ Camera ready');
    }

    async setupHandTracking() {
        try {
            document.getElementById('loadingText').textContent = 'Loading Hand AI Models...';
            console.log('📦 Loading MediaPipe...');

            if (typeof Hands === 'undefined') {
                throw new Error('MediaPipe not loaded. Check internet connection or try refreshing.');
            }

            this.hands = new Hands({
                locateFile: (file) => {
                    console.log('📥 Loading:', file);
                    return `https://unpkg.com/@mediapipe/hands@0.4/${file}`;
                }
            });

            console.log('⚙️ Configuring Hands...');

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults(this.onHandsResults.bind(this));

            console.log('📹 Starting camera processing...');

            const camera = new Camera(this.video, {
                onFrame: async () => {
                    await this.hands.send({ image: this.video });
                },
                width: 1280,
                height: 720
            });

            await camera.start();

            console.log('✅ Hand tracking ready!');
        } catch (error) {
            console.error('❌ Hand tracking error:', error);
            throw error;
        }
    }

    generateTextPoints(text, color) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');

        offCanvas.width = 1400;
        offCanvas.height = 500;

        offCtx.fillStyle = color;
        // Super bold font
        offCtx.font = '900 140px Arial Black';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

        const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const pixels = imageData.data;

        const points = [];
        const gap = 6; // CRITICAL: 60% particle reduction for performance

        for (let y = 0; y < offCanvas.height; y += gap) {
            for (let x = 0; x < offCanvas.width; x += gap) {
                const i = (y * offCanvas.width + x) * 4;
                const alpha = pixels[i + 3];

                if (alpha > 128) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];

                    const screenX = (x / offCanvas.width) * 900 + (window.innerWidth - 900) / 2;
                    const screenY = (y / offCanvas.height) * 350 + (window.innerHeight - 350) / 2;

                    const particleColor = `rgb(${r},${g},${b})`;
                    points.push({ x: screenX, y: screenY, color: particleColor });
                }
            }
        }

        return points;
    }

    // ======================================
    // SIMPLE CROSS-FADE TRANSITION
    // ======================================
    morphToText(text, color) {
        console.log(`🌊 Fading to "${text}"...`);

        const targets = this.generateTextPoints(text, color);
        const targetCount = targets.length;
        const currentCount = this.particles.length;

        console.log(`📊 Targets: ${targetCount} particles (gap=6)`);

        if (currentCount === 0) {
            // First spawn - directly at target positions
            for (const t of targets) {
                const p = new Particle(t.x, t.y, t.color);
                p.targetX = t.x;
                p.targetY = t.y;
                p.alpha = 0; // Start invisible
                p.targetAlpha = 1; // Fade in
                this.particles.push(p);
            }

            console.log(`✅ Spawned ${targetCount} particles (fade in)`);
            return;
        }

        // ======================================
        // CROSS-FADE: Fade out old, spawn new
        // ======================================

        // Fade out ALL existing particles
        for (const p of this.particles) {
            p.targetAlpha = 0;
        }

        // After fade completes, spawn new particles
        setTimeout(() => {
            // Clear old particles
            this.particles = [];

            // Spawn new particles at target positions
            for (const t of targets) {
                const p = new Particle(t.x, t.y, t.color);
                p.targetX = t.x;
                p.targetY = t.y;
                p.alpha = 0;
                p.targetAlpha = 1;
                this.particles.push(p);
            }

            console.log(`✅ Cross-faded: ${currentCount} → ${targetCount} particles`);
        }, 500); // Wait for fade out (500ms)
    }

    flyParticleOffScreen(particle) {
        const edge = Math.floor(Math.random() * 4);

        if (edge === 0) {
            particle.targetX = Math.random() * window.innerWidth;
            particle.targetY = -150;
        } else if (edge === 1) {
            particle.targetX = window.innerWidth + 150;
            particle.targetY = Math.random() * window.innerHeight;
        } else if (edge === 2) {
            particle.targetX = Math.random() * window.innerWidth;
            particle.targetY = window.innerHeight + 150;
        } else {
            particle.targetX = -150;
            particle.targetY = Math.random() * window.innerHeight;
        }

        particle.targetAlpha = 0;
        particle.isOffScreen = true;
    }

    clearAllParticles() {
        console.log('🧹 Clearing...');

        for (const p of this.particles) {
            this.flyParticleOffScreen(p);
        }

        setTimeout(() => {
            this.particles = [];
        }, 2500);
    }

    onHandsResults(results) {
        this.handsData = [];

        if (results.multiHandLandmarks && results.multiHandedness) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                this.handsData.push({
                    landmarks: results.multiHandLandmarks[i],
                    label: results.multiHandedness[i].label
                });
            }
        }

        this.processGestures();
    }

    processGestures() {
        this.allRepulsors = [];

        let gestureFound = false;
        let targetText = null;
        let targetColor = null;

        for (const hand of this.handsData) {
            const landmarks = hand.landmarks;

            // Index finger repulsor
            const indexTip = landmarks[8];
            const indexX = (1 - indexTip.x) * this.canvas.width;
            const indexY = indexTip.y * this.canvas.height;
            this.allRepulsors.push({
                x: indexX,
                y: indexY,
                radius: this.repulsionRadius
            });

            // Palm center repulsor
            const palmLandmarks = [0, 5, 9, 13, 17];
            let palmX = 0, palmY = 0;
            for (const idx of palmLandmarks) {
                palmX += landmarks[idx].x;
                palmY += landmarks[idx].y;
            }
            palmX /= palmLandmarks.length;
            palmY /= palmLandmarks.length;

            const palmScreenX = (1 - palmX) * this.canvas.width;
            const palmScreenY = palmY * this.canvas.height;
            this.allRepulsors.push({
                x: palmScreenX,
                y: palmScreenY,
                radius: this.repulsionRadius * 1.3
            });

            const gesture = this.detectGesture(landmarks);

            // GESTURE COLORS (Electric + Glow)
            if (gesture.count === 1) {
                targetText = 'HELLO';
                targetColor = '#00F3FF'; // Cyan Electric
                gestureFound = true;
            } else if (gesture.count === 2) {
                targetText = 'MY NAME IS';
                targetColor = '#FFFFFF'; // White Bright
                gestureFound = true;
            } else if (gesture.count === 3) {
                targetText = 'NANDITYA';
                targetColor = '#FF00AA'; // Pink/Magenta
                gestureFound = true;
            }
        }

        // No gesture = clear
        if (!gestureFound) {
            if (this.currentText !== null) {
                this.currentText = null;
                this.clearAllParticles();
            }
            return;
        }

        // Gesture changed = morph
        if (targetText !== this.currentText) {
            this.currentText = targetText;
            this.currentColor = targetColor;
            this.morphToText(targetText, targetColor);
        }
    }

    countFingers(landmarks) {
        let count = 0;
        const fingerTips = [8, 12, 16, 20];
        const fingerPips = [6, 10, 14, 18];

        for (let i = 0; i < fingerTips.length; i++) {
            if (landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y - 0.02) {
                count++;
            }
        }

        return count;
    }

    detectGesture(landmarks) {
        const fingers = this.countFingers(landmarks);

        const indexUp = landmarks[8].y < landmarks[6].y - 0.02;
        const middleDown = landmarks[12].y > landmarks[10].y;
        const middleUp = landmarks[12].y < landmarks[10].y - 0.02;
        const ringDown = landmarks[16].y > landmarks[14].y;
        const ringUp = landmarks[16].y < landmarks[14].y - 0.02;
        const pinkyDown = landmarks[20].y > landmarks[18].y;

        if (indexUp && middleDown && ringDown && pinkyDown) {
            return { type: 'ONE', count: 1 };
        }

        if (indexUp && middleUp && ringDown && pinkyDown) {
            return { type: 'TWO', count: 2 };
        }

        if (indexUp && middleUp && ringUp && pinkyDown) {
            return { type: 'THREE', count: 3 };
        }

        return { type: 'null', count: fingers };
    }

    updateParticles() {
        for (const p of this.particles) {
            p.update(
                this.allRepulsors,
                this.attractionStrength,
                this.repulsionStrength
            );
        }
    }

    drawParticles() {
        for (const p of this.particles) {
            p.draw(this.ctx);
        }
    }

    drawHands() {
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17]
        ];

        for (let i = 0; i < this.handsData.length; i++) {
            const hand = this.handsData[i];
            const landmarks = hand.landmarks;

            this.ctx.strokeStyle = i === 0 ? '#00ff0080' : '#ff00ff80';
            this.ctx.lineWidth = 2;

            for (const [start, end] of connections) {
                const startPoint = landmarks[start];
                const endPoint = landmarks[end];

                const startX = (1 - startPoint.x) * this.canvas.width;
                const startY = startPoint.y * this.canvas.height;
                const endX = (1 - endPoint.x) * this.canvas.width;
                const endY = endPoint.y * this.canvas.height;

                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }

            for (const landmark of landmarks) {
                const x = (1 - landmark.x) * this.canvas.width;
                const y = landmark.y * this.canvas.height;

                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
                this.ctx.fillStyle = i === 0 ? '#00ff00' : '#ff00ff';
                this.ctx.fill();
            }
        }

        for (const repulsor of this.allRepulsors) {
            this.ctx.beginPath();
            this.ctx.arc(repulsor.x, repulsor.y, repulsor.radius, 0, 2 * Math.PI);
            this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.15)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    drawDebugInfo() {
        if (!this.showDebug) return;

        this.ctx.font = '14px monospace';
        this.ctx.fillStyle = '#00ff00';

        let y = 30;
        const lineHeight = 20;

        this.ctx.fillText(`Hands: ${this.handsData.length}`, 20, y);
        y += lineHeight;

        this.ctx.fillText(`Repulsors: ${this.allRepulsors.length}`, 20, y);
        y += lineHeight;

        this.ctx.fillText(`Particles: ${this.particles.length}`, 20, y);
        y += lineHeight;

        this.ctx.fillText(`Text: "${this.currentText || 'NONE'}"`, 20, y);
        y += lineHeight;

        this.ctx.fillText(`Physics: Velocity + Friction`, 20, y);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateParticles();
        this.drawParticles();

        if (this.showDebug) {
            this.drawHands();
            this.drawDebugInfo();
        }

        requestAnimationFrame(this.render.bind(this));
    }
}

window.addEventListener('load', () => {
    new GestureApp();

    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading && !loading.classList.contains('hidden')) {
            document.getElementById('loadingText').innerHTML =
                '⚠️ Loading timeout!<br><br>' +
                '<span style="font-size:14px">Internet too slow or CDN blocked<br>' +
                'Try: Ctrl+F5 to refresh<br>' +
                'Or check F12 Console for errors</span>';
        }
    }, 60000);
});
