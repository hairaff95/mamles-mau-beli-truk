const NOMINALS = Object.freeze([
    Object.freeze({ value: 'Rp 2.000',  raw: 2000,  msg: 'Lumayan buat beli jajan!' }),
    Object.freeze({ value: 'Rp 5.000',  raw: 5000,  msg: 'Alhamdulillah, ada rezekinya!' }),
    Object.freeze({ value: 'Rp 10.000', raw: 10000, msg: 'Wah, banyak banget! Berkah selalu' }),
    Object.freeze({ value: 'Rp 2.000',  raw: 2000,  msg: 'Lumayan buat beli jajan!' }),
    Object.freeze({ value: 'Rp 5.000',  raw: 5000,  msg: 'Alhamdulillah, ada rezekinya!' }),
    Object.freeze({ value: 'Rp 10.000', raw: 10000, msg: 'Wah, banyak banget! Berkah selalu' }),
]);

const K_COLORS = Object.freeze([
    ['#2E8B57','#1A5C38'],
    ['#C9A84C','#8B6914'],
    ['#2E8B57','#1A5C38'],
    ['#C9A84C','#8B6914'],
    ['#2E8B57','#1A5C38'],
    ['#C9A84C','#8B6914'],
]);

let gameActive       = false;
let shuffledNominals = [];
let _currentNominal  = null;
let _claimData       = null;
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function ketupatSVG(color1, color2) {
    const id = color1.replace('#', '');
    return `
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
        <defs>
            <radialGradient id="kg${id}" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stop-color="${color1}" stop-opacity="0.9"/>
                <stop offset="100%" stop-color="${color2}" stop-opacity="1"/>
            </radialGradient>
        </defs>
        <path d="M40 4 L76 40 L40 76 L4 40 Z" fill="url(#kg${id})" stroke="${color2}" stroke-width="1.5"/>
        <path d="M13 28 Q40 22 67 28" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none"/>
        <path d="M7 40 Q40 33 73 40"  stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none"/>
        <path d="M13 52 Q40 58 67 52" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none"/>
        <path d="M28 13 Q22 40 28 67" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none"/>
        <path d="M40 7 Q33 40 40 73"  stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none"/>
        <path d="M52 13 Q58 40 52 67" stroke="rgba(255,255,255,0.2)" stroke-width="1" fill="none"/>
        <path d="M40 4 L76 40 L40 76 L4 40 Z" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2.5"/>
        <circle cx="40" cy="40" r="10" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <text x="40" y="45" text-anchor="middle" font-size="13" font-weight="800"
              fill="rgba(255,255,255,0.6)" font-family="Plus Jakarta Sans, sans-serif">?</text>
    </svg>`;
}
function buildKetupatGrid() {
    shuffledNominals = shuffleArray([...NOMINALS]);
    const grid = document.getElementById('ketupatGrid');
    grid.innerHTML = '';

    shuffledNominals.forEach((nom, i) => {
        const item = document.createElement('div');
        item.className = 'ketupat-item';
        // Nominal TIDAK disimpan di data-* attribute agar tidak bisa dibaca DevTools
        item.innerHTML = `
            <div class="ketupat-svg-wrap" id="kw${i}">
                <div class="k-bottom">${ketupatSVG(K_COLORS[i][0], K_COLORS[i][1])}</div>
                <div class="k-top">${ketupatSVG(K_COLORS[i][0], K_COLORS[i][1])}</div>
                <div class="k-nominal">
                    <span class="nom-label">THR</span>
                    <span class="nom-value" style="visibility:hidden">${nom.value}</span>
                </div>
            </div>
            <div class="ketupat-hint">Ketuk!</div>
        `;
        // Nominal diikat lewat closure, bukan DOM
        item.addEventListener('click', () => openKetupat(item, i, nom));
        grid.appendChild(item);
    });

    document.getElementById('thrResult').classList.remove('show');
    gameActive = true;
}
function openKetupat(item, idx, nom) {
    if (!gameActive || item.classList.contains('opened') || item.classList.contains('opening')) return;

    // Nonaktifkan semua ketupat lain SEGERA agar tidak bisa diklik ganda
    gameActive = false;

    item.classList.add('opening');

    setTimeout(() => {
        item.classList.add('opened');
        item.classList.remove('opening');

        // Tampilkan nominal setelah animasi buka
        const nomValue = item.querySelector('.nom-value');
        if (nomValue) nomValue.style.visibility = 'visible';

        spawnConfetti(item);

        setTimeout(() => {
            showResult(nom);
            // Redup ketupat lain
            document.querySelectorAll('.ketupat-item:not(.opened)').forEach(k => {
                k.style.opacity  = '0.35';
                k.style.filter   = 'grayscale(60%)';
                k.style.pointerEvents = 'none';
                const hint = k.querySelector('.ketupat-hint');
                if (hint) hint.textContent = '';
            });
        }, 800);
    }, 100);
}
function spawnConfetti(parent) {
    const wrap   = parent.querySelector('.ketupat-svg-wrap');
    const colors = ['#F0D080','#C9A84C','#2E8B57','#FFE566','#fff'];
    for (let i = 0; i < 18; i++) {
        const c = document.createElement('div');
        c.className = 'confetti-piece';
        c.style.cssText = `
            left: ${20 + Math.random()*60}%;
            top: ${10 + Math.random()*40}%;
            background: ${colors[Math.floor(Math.random()*colors.length)]};
            transform: rotate(${Math.random()*360}deg);
            animation-delay: ${Math.random()*0.3}s;
            animation-duration: ${0.6 + Math.random()*0.5}s;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            width: ${4 + Math.random()*5}px;
            height: ${4 + Math.random()*5}px;
        `;
        wrap.appendChild(c);
        setTimeout(() => c.remove(), 1200);
    }
}
function showResult(nom) {
    _currentNominal = nom.value; // simpan di variabel private, bukan window

    const result = document.getElementById('thrResult');
    document.getElementById('resultAmount').textContent = nom.value;
    const msgEl = document.getElementById('resultMsg');
    msgEl.innerHTML = `${nom.msg}
        <svg viewBox="0 0 24 24" fill="none" style="width:14px;height:14px;display:inline-block;
             vertical-align:middle;margin-left:4px;stroke:var(--gold);stroke-width:1.6;
             stroke-linecap:round;stroke-linejoin:round;">
            <path d="M18 11V7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4"/>
            <path d="M14 10V5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5"/>
            <path d="M10 10.5V8a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8a6 6 0 0 0 6 6h2a6 6 0 0 0 5.2-3"/>
            <path d="M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2"/>
        </svg>`;

    result.classList.add('show');
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Reset form
    document.getElementById('thrClaimForm').classList.remove('show');
    document.getElementById('claimSuccessNote').classList.remove('show');
    document.getElementById('btnWaSend').classList.remove('show');
    document.getElementById('btnSubmitClaim').style.display = 'flex';
    document.getElementById('inputNama').value   = '';
    document.getElementById('inputNomor').value  = '';
    document.getElementById('inputNama').disabled  = false;
    document.getElementById('inputNomor').disabled = false;
}
function showClaimForm() {
    document.getElementById('thrClaimForm').classList.add('show');
    document.getElementById('btnKlaimSekarang').style.display = 'none';
    setTimeout(() => document.getElementById('inputNama').focus(), 300);
}
async function submitClaim() {
    const nama   = document.getElementById('inputNama').value.trim();
    const nomor  = document.getElementById('inputNomor').value.trim().replace(/\s/g, '');
    const nominal = _currentNominal || '-';

    // Reset error UI
    const errNama   = document.getElementById('errNama');
    const errNomor  = document.getElementById('errNomor');
    const inpNama   = document.getElementById('inputNama');
    const inpNomor  = document.getElementById('inputNomor');
    [errNama, errNomor].forEach(el => el.classList.remove('show'));
    [inpNama, inpNomor].forEach(el => el.classList.remove('input-error'));

    // Validasi frontend
    let valid = true;
    if (!nama) {
        errNama.classList.add('show');
        inpNama.classList.add('input-error');
        valid = false;
    }
    if (!nomor || nomor.replace(/\D/g, '').length < 10) {
        errNomor.textContent = 'Nomor wajib diisi (min. 10 digit)';
        errNomor.classList.add('show');
        inpNomor.classList.add('input-error');
        valid = false;
    }
    if (!valid) return;

    // Disable tombol selama proses
    const btn = document.getElementById('btnSubmitClaim');
    btn.disabled = true;
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" style="width:16px;height:16px;stroke:currentColor;stroke-width:2;stroke-linecap:round;">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg> Mengirim...`;

    const resetBtn = () => {
        btn.disabled = false;
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" style="stroke:currentColor;stroke-width:2.2;
                 stroke-linecap:round;stroke-linejoin:round;width:16px;height:16px;">
                <polyline points="20 6 9 17 4 12"/>
            </svg> Kirim Data`;
    };

    try {
        // 1. Cek duplikat nomor di Supabase
        const checkRes = await fetch(
            `${SUPABASE_URL}/rest/v1/thr_claims?nomor_hp=eq.${encodeURIComponent(nomor)}&select=id`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        const existing = await checkRes.json();
        if (Array.isArray(existing) && existing.length > 0) {
            errNomor.textContent = '⚠️ Nomor ini sudah pernah klaim THR!';
            errNomor.classList.add('show');
            inpNomor.classList.add('input-error');
            resetBtn();
            return;
        }

        // 2. Insert data baru
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/thr_claims`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ nama, nomor_hp: nomor, nominal })
        });

        if (!insertRes.ok) {
            const errBody = await insertRes.json().catch(() => ({}));
            // UNIQUE constraint violation (duplikat dari race condition)
            if (insertRes.status === 409 || errBody?.code === '23505') {
                errNomor.textContent = '⚠️ Nomor ini sudah pernah klaim THR!';
                errNomor.classList.add('show');
                inpNomor.classList.add('input-error');
                resetBtn();
                return;
            }
            throw new Error('Gagal menyimpan data ke server');
        }

        // 3. Sukses
        localStorage.setItem('thrClaimed', JSON.stringify({ value: nominal, nama, nomor, claimedAt: Date.now() }));
        _claimData = { nama, nomor, nominal };

        document.getElementById('claimSuccessNote').classList.add('show');
        btn.style.display = 'none';
        document.getElementById('btnWaSend').classList.add('show');
        document.getElementById('inputNama').disabled  = true;
        document.getElementById('inputNomor').disabled = true;

        lockTHRButton(nominal);
        showToast('Data berhasil dikirim! 🎉');

    } catch (err) {
        console.error(err);
        showToast('Terjadi kesalahan. Coba lagi.');
        resetBtn();
    }
}
function kirimWA() {
    if (!_claimData) return;
    const { nama, nomor, nominal } = _claimData;

    const pesan =
`✨ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم ✨

السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ

Halo! Saya ingin mengonfirmasi klaim THR Idul Fitri 1447 H 🌙

👤 Nama     : ${nama}
📱 No. Dana : ${nomor}
💰 Nominal  : ${nominal}

تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ
Taqabbalallahu minna wa minkum
Mohon Maaf Lahir & Batin 🤲

Selamat Hari Raya Idul Fitri 1447 H! 🎊`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, '_blank');
}
function openTHR() {
    if (localStorage.getItem('thrClaimed')) return; // sudah klaim
    document.getElementById('thrOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    buildKetupatGrid();
}

function closeTHR() {
    document.getElementById('thrOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function handleOverlayClick(e) {
    if (e.target === document.getElementById('thrOverlay')) closeTHR();
}
function lockTHRButton(claimedValue) {
    const btn = document.querySelector('.btn-thr');
    if (!btn) return;
    btn.classList.add('thr-claimed');
    btn.disabled = true;
    btn.innerHTML = `
        <span class="thr-icon">
            <svg viewBox="0 0 24 24" fill="none" style="width:20px;height:20px;flex-shrink:0;
                 stroke:rgba(255,255,255,0.3);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
        </span>
        THR Sudah Diklaim (${claimedValue})
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:rgba(255,255,255,0.25);
             stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;">
            <polyline points="20 6 9 17 4 12"/>
        </svg>`;
}
(function checkTHRClaimed() {
    const claimed = localStorage.getItem('thrClaimed');
    if (!claimed) return;
    try {
        const data = JSON.parse(claimed);
        lockTHRButton(data.value);
    } catch (e) {
        lockTHRButton('THR');
    }
})();
