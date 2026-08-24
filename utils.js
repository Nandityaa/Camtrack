// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Canvas Drawing Utilities
 */
const DrawingUtils = {
    // Draw a point/landmark on canvas
    drawPoint: (ctx, x, y, radius = 3, color = '#00ffff') => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;
    },

    // Draw a line between two points
    drawLine: (ctx, x1, y1, x2, y2, color = '#00ffff', width = 2) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    },

    // Draw connections between landmarks
    drawConnections: (ctx, landmarks, connections, color = '#00ffff') => {
        for (const connection of connections) {
            const startIdx = connection[0];
            const endIdx = connection[1];
            
            if (landmarks[startIdx] && landmarks[endIdx]) {
                const start = landmarks[startIdx];
                const end = landmarks[endIdx];
                DrawingUtils.drawLine(ctx, start.x, start.y, end.x, end.y, color, 1.5);
            }
        }
    },

    // Clear canvas
    clear: (ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);
    }
};

/**
 * Mathematical Utilities
 */
const MathUtils = {
    // Calculate distance between two points
    distance: (p1, p2) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Calculate angle between three points (in degrees)
    angle: (p1, p2, p3) => {
        const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                       Math.atan2(p1.y - p2.y, p1.x - p2.x);
        let angle = Math.abs(radians * 180 / Math.PI);
        if (angle > 180) angle = 360 - angle;
        return angle;
    },

    // Linear interpolation
    lerp: (start, end, t) => {
        return start * (1 - t) + end * t;
    },

    // Clamp value between min and max
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },

    // Map value from one range to another
    map: (value, inMin, inMax, outMin, outMax) => {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
};

/**
 * Coordinate Conversion Utilities
 */
const CoordinateUtils = {
    // Convert normalized coordinates (0-1) to canvas coordinates
    normalizedToCanvas: (normalized, canvasWidth, canvasHeight) => {
        return {
            x: normalized.x * canvasWidth,
            y: normalized.y * canvasHeight,
            z: normalized.z || 0
        };
    },

    // Convert canvas coordinates to normalized (0-1)
    canvasToNormalized: (canvas, canvasWidth, canvasHeight) => {
        return {
            x: canvas.x / canvasWidth,
            y: canvas.y / canvasHeight,
            z: canvas.z || 0
        };
    }
};

/**
 * FPS Counter
 */
class FPSCounter {
    constructor() {
        this.fps = 0;
        this.frames = 0;
        this.lastTime = performance.now();
    }

    update() {
        this.frames++;
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;

        if (elapsed >= 1000) {
            this.fps = Math.round((this.frames * 1000) / elapsed);
            this.frames = 0;
            this.lastTime = currentTime;
        }

        return this.fps;
    }

    getFPS() {
        return this.fps;
    }
}

/**
 * Smoothing Filter for coordinates
 * Uses exponential moving average
 */
class SmoothingFilter {
    constructor(alpha = 0.3) {
        this.alpha = alpha; // 0 = no smoothing, 1 = instant change
        this.previousValue = null;
    }

    apply(currentValue) {
        if (this.previousValue === null) {
            this.previousValue = currentValue;
            return currentValue;
        }

        const smoothed = {
            x: MathUtils.lerp(this.previousValue.x, currentValue.x, this.alpha),
            y: MathUtils.lerp(this.previousValue.y, currentValue.y, this.alpha),
            z: currentValue.z !== undefined 
                ? MathUtils.lerp(this.previousValue.z || 0, currentValue.z, this.alpha)
                : undefined
        };

        this.previousValue = smoothed;
        return smoothed;
    }

    reset() {
        this.previousValue = null;
    }
}

/**
 * Color Utilities
 */
const ColorUtils = {
    // Convert hex to rgba
    hexToRgba: (hex, alpha = 1) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    // Generate gradient colors
    generateGradient: (color1, color2) => {
        return `linear-gradient(135deg, ${color1}, ${color2})`;
    }
};

/**
 * Debug Logger
 */
const Logger = {
    enabled: true,
    
    log: (...args) => {
        if (Logger.enabled) {
            console.log('[AR Tracker]', ...args);
        }
    },

    warn: (...args) => {
        if (Logger.enabled) {
            console.warn('[AR Tracker]', ...args);
        }
    },

    error: (...args) => {
        console.error('[AR Tracker]', ...args);
    }
};
