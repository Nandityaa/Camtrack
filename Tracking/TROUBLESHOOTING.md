# Troubleshooting - Loading Terus

## Kenapa Loading Terus?

MediaPipe download **15-20 MB** file AI model dari CDN:
```
https://cdn.jsdelivr.net/npm/@mediapipe/hands/
```

## Fix Steps:

### 1. Cek Console Browser
1. Buka `gesture.html`
2. Tekan **F12**
3. Tab **Console**
4. Screenshot error yang muncul

### 2. Cek Network
1. F12 → Tab **Network**
2. Refresh page
3. Lihat file mana yang failed/lambat
4. Screenshot

### 3. Coba Browser Lain
- MediaPipe paling stabil di **Chrome**
- Jangan pakai Firefox/Safari

### 4. Cek Internet
- Pastikan koneksi stabil
- CDN jsdelivr accessible

### 5. Wait Longer
- Tunggu **30-60 detik** (tergantung internet)
- Jangan close tab

## Alternative: Offline Mode

Kalau tetap ga jalan, saya bisa:
1. Download MediaPipe ke local (file besar ~50MB)
2. Pakai gesture alternatif (keyboard control)

**Kirim screenshot console error-nya!** 📸
