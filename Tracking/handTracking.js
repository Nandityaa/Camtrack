// ============================================
// HAND TRACKING MODULE
// Using MediaPipe Hands
// ============================================

class HandTracker {
    constructor() {
        this.hands = null;
        this.isActive = false;
        this.onResultsCallback = null;
        this.smoothingFilters = {
            left: new SmoothingFilter(0.5),
            right: new SmoothingFilter(0.5)
        };

        // Hand landmark indices (21 points per hand)
        this.LANDMARKS = {
            WRIST: 0,
            THUMB_TIP: 4,
            INDEX_TIP: 8,
            MIDDLE_TIP: 12,
            RING_TIP: 16,
            PINKY_TIP: 20,
            INDEX_MCP: 5,  // Base of index finger
            MIDDLE_MCP: 9,
            RING_MCP: 13,
            PINKY_MCP: 17
        };

        // Hand connections for drawing skeleton
        this.HAND_CONNECTIONS = [
            // Thumb
            [0, 1], [1, 2], [2, 3], [3, 4],
            // Index finger
            [0, 5], [5, 6], [6, 7], [7, 8],
            // Middle finger
            [0, 9], [9, 10], [10, 11], [11, 12],
            // Ring finger
            [0, 13], [13, 14], [14, 15], [15, 16],
            // Pinky
            [0, 17], [17, 18], [18, 19], [19, 20],
            // Palm
            [5, 9], [9, 13], [13, 17]
        ];
    }

    /**
     * Initialize Hands model
     */
    async initialize() {
        Logger.log('Initializing Hand Tracking...');

        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        // Configure Hands
        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        Logger.log('Hand Tracking initialized');
    }

    /**
     * Start hand tracking
     */
    start(onResults) {
        if (!this.hands) {
            Logger.error('Hands not initialized');
            return;
        }

        this.onResultsCallback = onResults;
        this.hands.onResults(this.processResults.bind(this));
        this.isActive = true;
        this.smoothingFilters.left.reset();
        this.smoothingFilters.right.reset();

        Logger.log('Hand tracking started');
    }

    /**
     * Stop hand tracking
     */
    stop() {
        this.isActive = false;
        this.smoothingFilters.left.reset();
        this.smoothingFilters.right.reset();
        Logger.log('Hand tracking stopped');
    }

    /**
     * Process hand tracking results
     */
    processResults(results) {
        if (!this.isActive || !this.onResultsCallback) return;

        const processedData = {
            detected: false,
            hands: [],
            gestures: []
        };

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            processedData.detected = true;

            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const handedness = results.multiHandedness[i].label; // "Left" or "Right"

                // Get hand center (wrist)
                const wrist = landmarks[this.LANDMARKS.WRIST];
                const filter = handedness === 'Left' ? this.smoothingFilters.left : this.smoothingFilters.right;
                const smoothedCenter = filter.apply(wrist);

                const handData = {
                    landmarks: landmarks,
                    handedness: handedness,
                    center: smoothedCenter,
                    gesture: this.recognizeGesture(landmarks)
                };

                processedData.hands.push(handData);
                processedData.gestures.push(handData.gesture);
            }
        }

        this.onResultsCallback(processedData);
    }

    /**
     * Recognize hand gestures
     */
    recognizeGesture(landmarks) {
        // Check for common gestures

        // Peace sign (Victory) - Index and middle fingers up
        if (this.isPeaceSign(landmarks)) {
            return 'Peace ✌️';
        }

        // Thumbs up
        if (this.isThumbsUp(landmarks)) {
            return 'Thumbs Up 👍';
        }

        // Pointing (Index finger extended)
        if (this.isPointing(landmarks)) {
            return 'Pointing 👉';
        }

        // Open hand (all fingers extended)
        if (this.isOpenHand(landmarks)) {
            return 'Open Hand ✋';
        }

        // Fist (all fingers closed)
        if (this.isFist(landmarks)) {
            return 'Fist ✊';
        }

        return 'Unknown';
    }

    /**
     * Check if finger is extended
     */
    isFingerExtended(landmarks, tipIdx, mcpIdx) {
        const tip = landmarks[tipIdx];
        const mcp = landmarks[mcpIdx];
        const wrist = landmarks[this.LANDMARKS.WRIST];

        // Finger is extended if tip is farther from wrist than mcp
        const tipDist = MathUtils.distance(tip, wrist);
        const mcpDist = MathUtils.distance(mcp, wrist);

        return tipDist > mcpDist * 1.1;
    }

    /**
     * Gesture: Peace sign
     */
    isPeaceSign(landmarks) {
        const indexUp = this.isFingerExtended(landmarks, this.LANDMARKS.INDEX_TIP, this.LANDMARKS.INDEX_MCP);
        const middleUp = this.isFingerExtended(landmarks, this.LANDMARKS.MIDDLE_TIP, this.LANDMARKS.MIDDLE_MCP);
        const ringDown = !this.isFingerExtended(landmarks, this.LANDMARKS.RING_TIP, this.LANDMARKS.RING_MCP);
        const pinkyDown = !this.isFingerExtended(landmarks, this.LANDMARKS.PINKY_TIP, this.LANDMARKS.PINKY_MCP);

        return indexUp && middleUp && ringDown && pinkyDown;
    }

    /**
     * Gesture: Thumbs up
     */
    isThumbsUp(landmarks) {
        const thumbUp = landmarks[this.LANDMARKS.THUMB_TIP].y < landmarks[this.LANDMARKS.WRIST].y;
        const indexDown = !this.isFingerExtended(landmarks, this.LANDMARKS.INDEX_TIP, this.LANDMARKS.INDEX_MCP);
        const middleDown = !this.isFingerExtended(landmarks, this.LANDMARKS.MIDDLE_TIP, this.LANDMARKS.MIDDLE_MCP);

        return thumbUp && indexDown && middleDown;
    }

    /**
     * Gesture: Pointing
     */
    isPointing(landmarks) {
        const indexUp = this.isFingerExtended(landmarks, this.LANDMARKS.INDEX_TIP, this.LANDMARKS.INDEX_MCP);
        const middleDown = !this.isFingerExtended(landmarks, this.LANDMARKS.MIDDLE_TIP, this.LANDMARKS.MIDDLE_MCP);
        const ringDown = !this.isFingerExtended(landmarks, this.LANDMARKS.RING_TIP, this.LANDMARKS.RING_MCP);
        const pinkyDown = !this.isFingerExtended(landmarks, this.LANDMARKS.PINKY_TIP, this.LANDMARKS.PINKY_MCP);

        return indexUp && middleDown && ringDown && pinkyDown;
    }

    /**
     * Gesture: Open hand
     */
    isOpenHand(landmarks) {
        const allExtended =
            this.isFingerExtended(landmarks, this.LANDMARKS.INDEX_TIP, this.LANDMARKS.INDEX_MCP) &&
            this.isFingerExtended(landmarks, this.LANDMARKS.MIDDLE_TIP, this.LANDMARKS.MIDDLE_MCP) &&
            this.isFingerExtended(landmarks, this.LANDMARKS.RING_TIP, this.LANDMARKS.RING_MCP) &&
            this.isFingerExtended(landmarks, this.LANDMARKS.PINKY_TIP, this.LANDMARKS.PINKY_MCP);

        return allExtended;
    }

    /**
     * Gesture: Fist
     */
    isFist(landmarks) {
        const allClosed =
            !this.isFingerExtended(landmarks, this.LANDMARKS.INDEX_TIP, this.LANDMARKS.INDEX_MCP) &&
            !this.isFingerExtended(landmarks, this.LANDMARKS.MIDDLE_TIP, this.LANDMARKS.MIDDLE_MCP) &&
            !this.isFingerExtended(landmarks, this.LANDMARKS.RING_TIP, this.LANDMARKS.RING_MCP) &&
            !this.isFingerExtended(landmarks, this.LANDMARKS.PINKY_TIP, this.LANDMARKS.PINKY_MCP);

        return allClosed;
    }

    /**
     * Draw hand landmarks on canvas
     */
    draw(ctx, canvasWidth, canvasHeight, handsData, showLandmarks, showConnections) {
        if (!handsData || handsData.length === 0) return;

        for (const hand of handsData) {
            const landmarks = hand.landmarks;
            const color = hand.handedness === 'Left' ? '#ff00ff' : '#00ff00';

            // Draw connections
            if (showConnections) {
                const canvasLandmarks = landmarks.map(lm =>
                    CoordinateUtils.normalizedToCanvas(lm, canvasWidth, canvasHeight)
                );

                for (const connection of this.HAND_CONNECTIONS) {
                    const start = canvasLandmarks[connection[0]];
                    const end = canvasLandmarks[connection[1]];
                    DrawingUtils.drawLine(ctx, start.x, start.y, end.x, end.y, color + '80', 2);
                }
            }

            // Draw landmarks
            if (showLandmarks) {
                for (const landmark of landmarks) {
                    const canvas = CoordinateUtils.normalizedToCanvas(landmark, canvasWidth, canvasHeight);
                    DrawingUtils.drawPoint(ctx, canvas.x, canvas.y, 5, color);
                }
            }
        }
    }

    /**
     * Send frame to Hands for processing
     */
    async send(videoElement) {
        if (this.isActive && this.hands) {
            await this.hands.send({ image: videoElement });
        }
    }
}
