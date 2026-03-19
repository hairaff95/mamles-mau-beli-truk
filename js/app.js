// ============================================================
//  app.js — Logic umum: bintang, countdown, share, copy
// ============================================================

// ===== GENERATE STARS =====
(function generateStars() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const size = Math.random() * 2.5 + 0.5;
        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            --dur: ${Math.random() * 4 + 2}s;
            --delay: ${Math.random() * 4}s;
        `;
        starsContainer.appendChild(star);
    }
})();

// ===== COUNTDOWN =====
function updateCountdown() {
    // Idul Fitri 1447 H — 30 Maret 2026
    const target = new Date('2026-03-30T00:00:00');
    const now    = new Date();
    const diff   = target - now;

    if (diff <= 0) {
        document.getElementById('days').textContent    = '00';
        document.getElementById('hours').textContent   = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '🎉';
        return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent    = String(days).padStart(2, '0');
    document.getElementById('hours').textContent   = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ===== SHARE =====
async function shareCard() {
    const text = `🌙 Taqabbalallahu Minna wa Minkum 🌙\n\nSelamat Hari Raya Idul Fitri 1447 H\nMohon Maaf Lahir & Batin\n\n✨ Semoga amal ibadah kita diterima Allah SWT ✨`;
    if (navigator.share) {
        try { await navigator.share({ title: 'Selamat Hari Raya Idul Fitri', text }); }
        catch (e) {}
    } else {
        copyText();
    }
}

// ===== COPY =====
async function copyText() {
    const text = `🌙 Taqabbalallahu Minna wa Minkum 🌙\n\nSelamat Hari Raya Idul Fitri 1447 H\nMohon Maaf Lahir & Batin\n\n✨ Semoga amal ibadah kita diterima Allah SWT ✨`;
    try {
        await navigator.clipboard.writeText(text);
        showToast('Teks berhasil disalin! 📋');
    } catch (e) {
        showToast('Gagal menyalin teks');
    }
}

// ===== DOWNLOAD =====
function downloadCard() {
    showToast('Fitur simpan segera hadir! 🚀');
}

// ===== TOAST =====
function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(201,168,76,0.15);
        border: 1px solid rgba(201,168,76,0.4);
        backdrop-filter: blur(20px);
        color: #F0D080;
        padding: 12px 24px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 600;
        font-family: 'Plus Jakarta Sans', sans-serif;
        z-index: 99999;
        opacity: 0;
        transition: all 0.3s ease;
        white-space: nowrap;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
