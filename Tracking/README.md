# AR Tracker - Face & Hand Tracking

Aplikasi tracking dengan particle effects dan teks pixelated seperti TikTok.

## 🚀 Quick Start

### Untuk Penggunaan Langsung (RECOMMENDED):

**Buka `camera-lite.html`** ⚡
- ✅ Langsung jalan (NO loading!)
- ✅ Real webcam background
- ✅ Particle explosion effects
- ✅ 3 mode: Center, Mouse, Random

### Untuk Full AI Tracking (Advanced):

**Buka `index.html`** 🤖
- ✅ Face tracking (468 landmarks)
- ✅ Hand tracking + gestures
- ⚠️ Loading 10-30 detik (download 15MB AI model)
- ⚠️ Butuh internet cepat

## 📁 File Structure

```
Tracking/
├── camera-lite.html    ← MAIN FILE (instant load!)
├── camera-lite.js      ← Camera logic
├── index.html          ← Full AI version (slow loading)
├── app.js              ← AI tracking logic
├── faceTracking.js     ← Face AI
├── handTracking.js     ← Hand AI
├── particles.js        ← Particle system (SHARED)
├── utils.js            ← Utilities (SHARED)
├── style.css           ← Styling (SHARED)
├── EXPLANATION.md      ← Cara kerja lengkap (Bahasa Indonesia)
└── README.md           ← File ini
```

## 🎯 Features

### Camera Lite Version (camera-lite.html)
- **Real webcam** background fullscreen
- **Pixelated text effect** dengan multi-color shadow
- **Particle shatter** saat ganti teks
- 3 tracking modes:
  - Center: Text di tengah
  - Mouse: Text ikut mouse
  - Random: Text gerak smooth random
- FPS counter
- Color picker
- **NO LOADING - instant start!**

### Full AI Version (index.html)
- MediaPipe Face Mesh (468 landmarks)
- MediaPipe Hands (21 landmarks/hand, max 2 hands)
- Gesture recognition: Peace ✌️, Thumbs Up 👍, Pointing 👉
- Semua fitur camera-lite + AI tracking

## 🎨 Cara Pakai

1. **Buka `camera-lite.html`** dengan:
   - Live Server (VS Code extension)
   - Atau local server: `npx http-server`

2. **Allow camera permission**

3. **Pilih mode tracking**:
   - Center: Static di tengah
   - Mouse: Ikuti mouse
   - Random: Animasi smooth

4. **Ketik teks** di input → Lihat particle explosion! 💥

5. **Ganti warna** dengan color picker

## ⚙️ Technical Details

- **No framework** - Pure HTML/CSS/JS
- **Particle system**: Custom canvas-based dengan physics
- **Text effects**: CSS pixelated/blocky dengan multi-shadow
- **Fullscreen**: Optimized untuk 1920x1080
- **Performance**: 60 FPS target

## 📖 Documentation

Lihat `EXPLANATION.md` untuk:
- Penjelasan cara kerja tracking
- Cara kerja particle system
- Panduan pengembangan
- Tips optimasi

## 🐛 Troubleshooting

**Camera tidak muncul:**
- Allow camera permission
- Pastikan pakai HTTPS atau localhost
- Cek camera tidak dipakai app lain

**Particle effect tidak muncul:**
- Pastikan `particles.js` ter-load
- Check browser console (F12)

**Full AI version loading lama:**
- Normal! MediaPipe download 15-20MB
- Butuh internet cepat
- Tunggu 30 detik
- Atau pakai camera-lite.html aja

## 🎉 Credits

- MediaPipe by Google (untuk full AI version)
- Inspirasi: TikTok AR effects

---

**Enjoy!** 🚀
