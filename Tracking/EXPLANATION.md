# Penjelasan Cara Kerja AR Tracker

## 📖 Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
3. [Cara Kerja Face Tracking](#cara-kerja-face-tracking)
4. [Cara Kerja Hand Tracking](#cara-kerja-hand-tracking)
5. [Struktur Kode](#struktur-kode)
6. [Cara Mengembangkan](#cara-mengembangkan)

---

## Gambaran Umum

Aplikasi AR Tracker ini menggunakan **Computer Vision** dan **Machine Learning** untuk melacak wajah dan tangan Anda secara real-time melalui webcam. Teknologi yang sama digunakan oleh aplikasi seperti TikTok, Instagram, dan Snapchat untuk efek AR mereka.

### Apa yang Dilakukan Aplikasi Ini?

1. **Face Tracking**: Mendeteksi 468 titik landmark di wajah Anda
2. **Hand Tracking**: Mendeteksi 21 titik landmark per tangan (maksimal 2 tangan)
3. **Gesture Recognition**: Mengenali gesture seperti Peace Sign ✌️, Thumbs Up 👍, dll
4. **Text Overlay**: Menampilkan teks yang mengikuti wajah atau tangan Anda

---

## Teknologi yang Digunakan

### 1. MediaPipe (Google)

**MediaPipe** adalah framework machine learning dari Google yang sudah dilatih untuk mendeteksi wajah dan tangan. Keuntungannya:
- ✅ Sangat cepat (bisa mencapai 30+ FPS)
- ✅ Berjalan langsung di browser, tidak perlu server
- ✅ Akurat dan robust (tahan terhadap berbagai kondisi pencahayaan)
- ✅ Gratis dan open-source

### 2. WebRTC

**WebRTC** adalah teknologi browser untuk mengakses kamera dan mikrofon. Kita gunakan untuk mengambil video stream dari webcam.

### 3. Canvas API

**Canvas** adalah elemen HTML yang bisa kita gambar secara programmatik. Kita gunakan untuk:
- Menggambar titik-titik landmark
- Menggambar garis penghubung (skeleton)
- Overlay visual effects

---

## Cara Kerja Face Tracking

### Konsep Dasar

Face Mesh MediaPipe menggunakan **neural network** yang sudah dilatih dengan jutaan gambar wajah. Network ini bisa mendeteksi **468 titik landmark** di wajah dalam koordinat 3D (x, y, z).

### Landmark Points

468 titik ini mencakup semua fitur wajah:
- **Mata**: ~30 titik per mata (untuk iris, kelopak mata, dll)
- **Alis**: ~10 titik per alis
- **Hidung**: ~20 titik
- **Bibir**: ~40 titik untuk outline mulut
- **Kontur wajah**: ~100 titik untuk bentuk wajah
- **Telinga**: Beberapa titik
- Dan masih banyak lagi...

### Flow Proses (faceTracking.js)

```
1. Video Frame dari Webcam
   ↓
2. Kirim ke MediaPipe Face Mesh
   ↓
3. Neural Network Processing
   ↓
4. Hasil: 468 Landmark Coordinates (x, y, z)
   ↓
5. Smoothing Filter (agar tidak bergetar)
   ↓
6. Hitung Posisi Tengah Wajah (nose tip)
   ↓
7. Posisikan Text Overlay di atas wajah
```

### Kode Penting

**Inisialisasi Face Mesh:**
```javascript
this.faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});

this.faceMesh.setOptions({
    maxNumFaces: 1,              // Deteksi 1 wajah
    refineLandmarks: true,        // Detail lebih tinggi
    minDetectionConfidence: 0.5,  // Threshold deteksi
    minTrackingConfidence: 0.5    // Threshold tracking
});
```

**Menghitung Pusat Wajah:**
```javascript
calculateFaceCenter(landmarks) {
    // Gunakan ujung hidung sebagai referensi
    const noseTip = landmarks[this.LANDMARKS.NOSE_TIP]; // Index 1
    
    // Smoothing agar tidak bergetar
    const smoothed = this.smoothingFilter.apply(noseTip);
    
    return smoothed;
}
```

**Koordinat System:**
- MediaPipe memberikan koordinat **normalized** (0.0 - 1.0)
- Kita konversi ke koordinat canvas menggunakan:
  ```javascript
  x_canvas = x_normalized * canvas_width
  y_canvas = y_normalized * canvas_height
  ```

---

## Cara Kerja Hand Tracking

### Konsep Dasar

MediaPipe Hands mendeteksi **21 titik landmark** per tangan yang merepresentasikan:
- Pergelangan tangan (1 titik)
- Setiap jari (4 titik per jari = 20 titik)

### Landmark Points per Jari

Setiap jari punya 4 titik:
1. **MCP** (Metacarpophalangeal) - Pangkal jari
2. **PIP** (Proximal Interphalangeal) - Ruas pertama
3. **DIP** (Distal Interphalangeal) - Ruas kedua
4. **TIP** - Ujung jari

### Flow Proses (handTracking.js)

```
1. Video Frame dari Webcam
   ↓
2. Kirim ke MediaPipe Hands
   ↓
3. Neural Network Processing
   ↓
4. Hasil: 21 Landmark per tangan + label (Left/Right)
   ↓
5. Analisis Gesture (cek posisi jari)
   ↓
6. Tentukan gesture (Peace, Thumbs Up, dll)
   ↓
7. Posisikan Text Overlay di atas tangan
```

### Gesture Recognition

**Cara kerja deteksi gesture:**

1. **Cek apakah jari extended (terentang)**:
   ```javascript
   isFingerExtended(landmarks, tipIdx, mcpIdx) {
       const tip = landmarks[tipIdx];
       const mcp = landmarks[mcpIdx];
       const wrist = landmarks[0];
       
       // Jari dianggap extended jika tip lebih jauh dari wrist
       // dibanding dengan mcp
       const tipDist = distance(tip, wrist);
       const mcpDist = distance(mcp, wrist);
       
       return tipDist > mcpDist * 1.1;
   }
   ```

2. **Peace Sign ✌️**:
   - Telunjuk extended ✓
   - Jari tengah extended ✓
   - Jari manis NOT extended ✓
   - Kelingking NOT extended ✓

3. **Thumbs Up 👍**:
   - Jempol di atas pergelangan tangan ✓
   - Semua jari lain NOT extended ✓

4. **Pointing 👉**:
   - Hanya telunjuk extended ✓
   - Jari lain NOT extended ✓

5. **Open Hand ✋**:
   - Semua jari extended ✓

6. **Fist ✊**:
   - Semua jari NOT extended ✓

### Multi-Hand Support

MediaPipe bisa deteksi hingga 2 tangan sekaligus, dan memberikan label:
- `"Left"` = Tangan kiri
- `"Right"` = Tangan kanan

---

## Struktur Kode

### File Organization

```
Tracking/
├── index.html          # Struktur HTML & UI
├── style.css           # Styling (dark theme, glassmorphism)
├── app.js              # Main application controller
├── faceTracking.js     # Face tracking logic
├── handTracking.js     # Hand tracking logic
└── utils.js            # Utility functions
```

### Architecture Pattern

```
┌─────────────────────────────────────┐
│         app.js (Controller)         │
│  - Initialize camera                │
│  - Coordinate trackers               │
│  - Render loop                       │
│  - UI event handlers                 │
└──────────┬──────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
┌────▼────┐  ┌──▼─────────┐
│  Face   │  │   Hand     │
│ Tracker │  │  Tracker   │
└────┬────┘  └──┬─────────┘
     │          │
     └──────┬───┘
            │
      ┌─────▼─────┐
      │  Canvas   │
      │  Drawing  │
      └───────────┘
```

### Class Diagram

```javascript
// Main App
ARTrackerApp
  - faceTracker: FaceTracker
  - handTracker: HandTracker
  - video: HTMLVideoElement
  - canvas: HTMLCanvasElement
  - currentMode: 'face' | 'hand' | 'both'
  + initialize()
  + switchMode(mode)
  + render()

// Face Tracking
FaceTracker
  - faceMesh: FaceMesh
  - smoothingFilter: SmoothingFilter
  + initialize()
  + start(callback)
  + send(videoElement)
  + calculateFaceCenter(landmarks)

// Hand Tracking
HandTracker
  - hands: Hands
  - smoothingFilters: {left, right}
  + initialize()
  + start(callback)
  + send(videoElement)
  + recognizeGesture(landmarks)
```

---

## Cara Mengembangkan

### 1. Menambah Gesture Baru

Edit `handTracking.js` di method `recognizeGesture()`:

```javascript
recognizeGesture(landmarks) {
    // Tambahkan gesture baru di sini
    if (this.isCustomGesture(landmarks)) {
        return 'Custom Gesture 🤟';
    }
    
    // ... existing gestures
}

// Buat method baru untuk gesture Anda
isCustomGesture(landmarks) {
    // Cek kondisi jari-jari
    const indexUp = this.isFingerExtended(landmarks, 8, 5);
    const pinkyUp = this.isFingerExtended(landmarks, 20, 17);
    // ... logika gesture Anda
    
    return /* kondisi terpenuhi */;
}
```

### 2. Menambah Efek Visual

Edit `faceTracking.js` atau `handTracking.js` di method `draw()`:

```javascript
draw(ctx, canvasWidth, canvasHeight, landmarks, ...) {
    // Tambahkan efek visual custom
    
    // Contoh: Gambar lingkaran di sekitar wajah
    const center = this.calculateFaceCenter(landmarks);
    const canvasCenter = CoordinateUtils.normalizedToCanvas(
        center, canvasWidth, canvasHeight
    );
    
    ctx.beginPath();
    ctx.arc(canvasCenter.x, canvasCenter.y, 100, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.stroke();
}
```

### 3. Menambah Mode Tracking Baru

Edit `app.js`:

```javascript
// Tambah mode baru di HTML (index.html)
<button class="mode-btn" data-mode="newmode">
    New Mode
</button>

// Tambah case di switchMode()
switchMode(mode) {
    // ...
    if (mode === 'newmode') {
        // Custom logic untuk mode baru
        this.faceTracker.start(/* ... */);
        // Aktifkan fitur tambahan
    }
}
```

### 4. Mengubah Sensitivity Detection

Edit parameter di `initialize()`:

```javascript
// Face Mesh
this.faceMesh.setOptions({
    minDetectionConfidence: 0.7,  // Lebih tinggi = lebih strict
    minTrackingConfidence: 0.7
});

// Hands
this.hands.setOptions({
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});
```

### 5. Optimasi Performance

**Tips untuk performa lebih baik:**

1. **Reduce video resolution**:
   ```javascript
   const stream = await navigator.mediaDevices.getUserMedia({
       video: {
           width: { ideal: 640 },   // Turunkan dari 1280
           height: { ideal: 480 }   // Turunkan dari 720
       }
   });
   ```

2. **Kurangi jumlah landmark yang digambar**:
   ```javascript
   // Gambar hanya landmark penting saja, tidak semua
   const keyPoints = [1, 33, 263, 61, 291]; // Hanya 5 titik
   ```

3. **Disable smoothing untuk speed**:
   ```javascript
   // Di utils.js, set alpha lebih tinggi
   new SmoothingFilter(0.8); // Lebih dekat ke 1 = lebih cepat
   ```

### 6. Menambah Filter/Effects

Buat file baru `effects.js`:

```javascript
class EffectsProcessor {
    applyBlur(ctx, x, y, radius) {
        ctx.filter = 'blur(5px)';
        // ... drawing code
        ctx.filter = 'none';
    }
    
    applyGlow(ctx, x, y, color) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        // ... drawing code
        ctx.shadowBlur = 0;
    }
    
    applyParticles(ctx, x, y) {
        // Gambar partikel-partikel kecil
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50;
            const px = x + Math.cos(angle) * distance;
            const py = y + Math.sin(angle) * distance;
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px, py, 2, 2);
        }
    }
}
```

### 7. Menyimpan Recording

Tambahkan MediaRecorder:

```javascript
let mediaRecorder;
let recordedChunks = [];

function startRecording() {
    const stream = canvas.captureStream(30); // 30 FPS
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };
    
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        
        // Download video
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tracking-recording.webm';
        a.click();
    };
    
    mediaRecorder.start();
}

function stopRecording() {
    mediaRecorder.stop();
}
```

---

## Performance Tips

### Mengapa FPS Penting?

FPS (Frames Per Second) menentukan seberapa smooth aplikasi berjalan:
- **30+ FPS**: Smooth, nyaman dilihat
- **20-30 FPS**: Masih OK, sedikit lag
- **<20 FPS**: Choppy, tidak nyaman

### Apa yang Mempengaruhi Performance?

1. **CPU/GPU Device**: Komputer lebih kuat = lebih cepat
2. **Video Resolution**: Resolusi tinggi = lebih lambat
3. **Number of detections**: Lebih banyak wajah/tangan = lebih lambat
4. **Model Complexity**: MediaPipe punya setting complexity
5. **Drawing Operations**: Gambar terlalu banyak = lambat

### Monitoring Performance

Lihat FPS counter di aplikasi. Jika <25 FPS:
1. Turunkan resolusi video
2. Set `modelComplexity: 0` (lebih cepat, kurang akurat)
3. Reduce drawing operations
4. Disable connections, hanya gambar key landmarks

---

## Troubleshooting

### Camera tidak berfungsi
- **Solusi**: Pastikan sudah memberikan permission camera
- Cek di browser settings → Privacy → Camera

### FPS rendah
- **Solusi**: Lower video resolution atau model complexity
- Close aplikasi lain yang berat

### Deteksi tidak akurat
- **Solusi**: Increase `minDetectionConfidence` dan `minTrackingConfidence`
- Pastikan pencahayaan cukup

### Text overlay bergetar
- **Solusi**: Increase smoothing dengan menurunkan alpha:
  ```javascript
  new SmoothingFilter(0.3); // Lebih smooth tapi sedikit delay
  ```

---

## Kesimpulan

Aplikasi ini menggunakan **machine learning modern** yang berjalan langsung di browser tanpa server. Teknologi yang sama dipakai oleh platform besar seperti TikTok, Instagram, dan Snapchat untuk AR effects mereka.

**Key Technologies:**
- ✅ MediaPipe (Google AI)
- ✅ WebRTC (Camera Access)
- ✅ Canvas API (Graphics)
- ✅ JavaScript ES6+

**Anda bisa kembangkan ini menjadi:**
- Aplikasi video filter
- Gesture-controlled game
- Virtual try-on (makeup, glasses)
- Sign language translator
- Interactive art installation
- Dan masih banyak lagi!

Selamat bereksperimen! 🚀
