// DOM Elements
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const loginChoice = document.getElementById('loginChoice');
const googleLoginForm = document.getElementById('googleLoginForm');
const loginForm = document.getElementById('loginForm');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const forgotPassword = document.getElementById('forgotPassword');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotPasswordFormSubmit = document.getElementById('forgotPasswordFormSubmit');
const backToLogin = document.getElementById('backToLogin');
const createPasswordForm = document.getElementById('createPasswordForm');
const createPasswordFormSubmit = document.getElementById('createPasswordFormSubmit');
const backToLoginFromCreate = document.getElementById('backToLoginFromCreate');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const videoPlayer = document.querySelector('.video-player');

// Show login modal
videoPlayer.addEventListener('click', () => {
    loginModal.classList.add('active');
    resetForms();
});

// Close modal
closeModal.addEventListener('click', () => {
    loginModal.classList.remove('active');
    resetForms();
});

// Google login button
googleLoginBtn.addEventListener('click', () => {
    loginChoice.style.display = 'none';
    googleLoginForm.style.display = 'block';
});

// Toggle password visibility
togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Login berhasil!');
            setTimeout(() => {
                loginModal.classList.remove('active');
                resetForms();
            }, 2000);
        } else {
            showError(data.message || 'Email atau kata sandi salah');
        }
    } catch (error) {
        showError('Terjadi kesalahan. Silakan coba lagi.');
        console.error('Login error:', error);
    }
});

// Forgot password
forgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    googleLoginForm.style.display = 'none';
    forgotPasswordForm.style.display = 'block';
});

// Handle forgot password form submission
forgotPasswordFormSubmit.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('recoveryEmail').value;
    
    try {
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Link reset kata sandi dikirim ke email Anda');
            setTimeout(() => {
                forgotPasswordForm.style.display = 'none';
                createPasswordForm.style.display = 'block';
            }, 2000);
        } else {
            showError(data.message || 'Email tidak ditemukan');
        }
    } catch (error) {
        showError('Terjadi kesalahan. Silakan coba lagi.');
        console.error('Forgot password error:', error);
    }
});

// Handle create new password form submission
createPasswordFormSubmit.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showError('Kata sandi tidak cocok');
        return;
    }
    
    try {
        const response = await fetch('/api/create-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: document.getElementById('recoveryEmail').value,
                newPassword 
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Kata sandi berhasil diubah!');
            setTimeout(() => {
                createPasswordForm.style.display = 'none';
                googleLoginForm.style.display = 'block';
                document.getElementById('password').value = '';
            }, 2000);
        } else {
            showError(data.message || 'Gagal mengubah kata sandi');
        }
    } catch (error) {
        showError('Terjadi kesalahan. Silakan coba lagi.');
        console.error('Create password error:', error);
    }
});

// Back to login buttons
backToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordForm.style.display = 'none';
    googleLoginForm.style.display = 'block';
});

backToLoginFromCreate.addEventListener('click', (e) => {
    e.preventDefault();
    createPasswordForm.style.display = 'none';
    googleLoginForm.style.display = 'block';
});

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    successMessage.style.display = 'none';
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    successText.textContent = message;
    successMessage.style.display = 'flex';
    errorMessage.style.display = 'none';
    
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Reset all forms
function resetForms() {
    loginChoice.style.display = 'block';
    googleLoginForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';
    createPasswordForm.style.display = 'none';
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    loginForm.reset();
    forgotPasswordFormSubmit.reset();
    createPasswordFormSubmit.reset();
}

// Real-time WebSocket connection
let ws = null;
let reconnectInterval = null;

function connectWebSocket() {
    const wsUrl = `ws://${window.location.host}/ws`;
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        updateRealtimeStatus('Connected', '#4caf50');
        
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealtimeData(data);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected');
        updateRealtimeStatus('Disconnected', '#f44336');
        
        // Try to reconnect after 5 seconds
        if (!reconnectInterval) {
            reconnectInterval = setInterval(() => {
                console.log('Attempting to reconnect...');
                connectWebSocket();
            }, 5000);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function handleRealtimeData(data) {
    console.log('Received data:', data);
    
    const lastUpdate = document.getElementById('lastUpdate');
    const statusValue = document.getElementById('statusValue');
    
    if (data.timestamp) {
        const date = new Date(data.timestamp);
        lastUpdate.textContent = date.toLocaleTimeString('id-ID');
    }
    
    if (data.status) {
        statusValue.textContent = data.status;
    }
    
    // Handle specific data types
    if (data.type === 'login_status') {
        console.log('Login status update:', data.value);
    } else if (data.type === 'video_status') {
        console.log('Video status update:', data.value);
    }
}

function updateRealtimeStatus(status, color) {
    const statusDot = document.querySelector('.status-dot');
    statusDot.style.background = color;
    
    const statusText = document.querySelector('.realtime-status span');
    statusText.textContent = `Real-time: ${status}`;
}

// Initialize WebSocket connection
connectWebSocket();

// Send periodic heartbeats
setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }));
    }
}, 30000);

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('Page is visible, checking WebSocket connection');
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            connectWebSocket();
        }
    }
});