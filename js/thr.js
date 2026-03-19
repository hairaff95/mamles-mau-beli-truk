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
}

function showClaimForm() {
    const nomLabel = document.getElementById('nominalLabel');
    if (nomLabel) nomLabel.textContent = _currentNominal || '';

    // Reset state form
    document.getElementById('claimSuccessNote').classList.remove('show');
    document.getElementById('btnWaSend').classList.remove('show');
    const submitBtn = document.getElementById('btnSubmitClaim');
    submitBtn.style.display = 'flex';
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" style="width:16px;height:16px;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;">
            <polyline points="20 6 9 17 4 12"/>
        </svg> Kirim Data`;
    document.getElementById('inputNama').value    = '';
    document.getElementById('inputNomor').value   = '';
    document.getElementById('inputNama').disabled  = false;
    document.getElementById('inputNomor').disabled = false;
    document.getElementById('errNama').classList.remove('show');
    document.getElementById('errNomor').classList.remove('show');
    document.getElementById('inputNama').classList.remove('input-error');
    document.getElementById('inputNomor').classList.remove('input-error');

    // Tutup modal game, buka modal form
    document.getElementById('thrOverlay').classList.remove('active');
    document.getElementById('claimOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('inputNama').focus(), 350);
}

function backToGame() {
    document.getElementById('claimOverlay').classList.remove('active');
    if (_currentNominal) {
        document.getElementById('thrOverlay').classList.add('active');
    } else {
        document.body.style.overflow = '';
    }
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
        // 1. Cek kuota (maks sesuai setting admin)
        const quotaRes = await fetch(
            `${SUPABASE_URL}/rest/v1/thr_claims?select=id`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        const allRows = await quotaRes.json();
        const kuota = window.__thrKuota || _adminKuota;
        if (Array.isArray(allRows) && allRows.length >= kuota) {
            document.getElementById('claimOverlay').classList.remove('active');
            document.body.style.overflow = '';
            lockTHRButtonFull();
            showToast('Maaf, kuota THR sudah habis.');
            return;
        }

        // 2. Cek duplikat nomor di Supabase
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

        // 3. Sukses — nominal dikunci dari server, tidak bisa diubah
        const claimedAt = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        localStorage.setItem('thrClaimed', JSON.stringify({ value: nominal, nama, nomor, claimedAt: Date.now() }));
        _claimData = { nama, nomor, nominal, claimedAt };

        // Generate canvas bukti lalu upload ke Supabase Storage
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" style="width:16px;height:16px;stroke:currentColor;stroke-width:2;stroke-linecap:round;">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg> Membuat bukti...`;

        const buktiPublicUrl = await uploadBuktiKlaim({ nama, nomor, nominal, claimedAt });
        _claimData.buktiPublicUrl = buktiPublicUrl;

        document.getElementById('claimSuccessNote').classList.add('show');
        btn.style.display = 'none';
        document.getElementById('btnWaSend').classList.add('show');
        document.getElementById('inputNama').disabled  = true;
        document.getElementById('inputNomor').disabled = true;

        // Tampilkan preview + link bukti
        const preview = document.getElementById('buktiPreview');
        const linkWrap = document.getElementById('buktiLinkWrap');
        const linkEl   = document.getElementById('buktiLink');
        if (buktiPublicUrl && preview) {
            preview.src = buktiPublicUrl;
            preview.style.display = 'block';
        }
        if (buktiPublicUrl && linkWrap && linkEl) {
            linkEl.href        = buktiPublicUrl;
            linkEl.textContent = buktiPublicUrl;
            linkWrap.style.display = 'flex';
        }

        lockTHRButton(nominal);
        showToast('Data berhasil dikirim!');

    } catch (err) {
        console.error(err);
        showToast('Terjadi kesalahan. Coba lagi.');
        resetBtn();
    }
}

async function uploadBuktiKlaim({ nama, nomor, nominal, claimedAt }) {
    try {
        // 1. Buat canvas
        const dataUrl = await generateBuktiCanvas({ nama, nomor, nominal, claimedAt });

        // 2. Konversi data URL → Blob (tanpa fetch, agar aman di file://)
        const byteString = atob(dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: 'image/png' });

        // 3. Nama file unik berdasarkan nomor HP
        const fileName = `${nomor.replace(/\D/g,'')}-${Date.now()}.png`;

        // 4. Upload ke Supabase Storage bucket "bukti-thr"
        const uploadRes = await fetch(
            `${SUPABASE_URL}/storage/v1/object/bukti-thr/${fileName}`,
            {
                method: 'POST',
                headers: {
                    'apikey':        SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type':  'image/png',
                    'x-upsert':      'true',
                },
                body: blob,
            }
        );

        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            console.error('Upload bukti gagal:', uploadRes.status, errText);
            return null;
        }

        // 5. Kembalikan public URL
        return `${SUPABASE_URL}/storage/v1/object/public/bukti-thr/${fileName}`;

    } catch (e) {
        console.warn('uploadBuktiKlaim error:', e);
        return null;
    }
}

async function generateBuktiCanvas({ nama, nomor, nominal, claimedAt }) {
    const W = 600, H = 320;
    const canvas = document.createElement('canvas');
    canvas.width  = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0D3D2A');
    bg.addColorStop(1, '#071A0F');
    ctx.fillStyle = bg;
    roundRect(ctx, 0, 0, W, H, 16);
    ctx.fill();

    // Border emas
    ctx.strokeStyle = 'rgba(201,168,76,0.5)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 1, 1, W - 2, H - 2, 15);
    ctx.stroke();

    // Header strip
    const header = ctx.createLinearGradient(0, 0, W, 0);
    header.addColorStop(0, 'rgba(201,168,76,0.25)');
    header.addColorStop(1, 'rgba(201,168,76,0.05)');
    ctx.fillStyle = header;
    roundRect(ctx, 0, 0, W, 56, 16, true);
    ctx.fill();

    // Judul
    ctx.fillStyle = '#F0D080';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUKTI KLAIM THR IDUL FITRI 1447 H', W / 2, 34);

    // Divider
    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, 58); ctx.lineTo(W - 24, 58);
    ctx.stroke();

    // Nominal box (kanan atas)
    ctx.fillStyle = 'rgba(201,168,76,0.12)';
    roundRect(ctx, W - 168, 66, 144, 78, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.45)';
    ctx.lineWidth = 1;
    roundRect(ctx, W - 168, 66, 144, 78, 12);
    ctx.stroke();
    ctx.fillStyle = 'rgba(240,208,128,0.65)';
    ctx.font = '10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NOMINAL THR', W - 96, 86);
    ctx.fillStyle = '#F0D080';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText(nominal, W - 96, 120);

    // Data rows (kiri)
    const rows = [
        ['NAMA',     nama],
        ['NO. DANA', nomor],
        ['NOMINAL',  nominal],
        ['WAKTU',    claimedAt],
    ];
    ctx.textAlign = 'left';
    rows.forEach(([label, value], i) => {
        const y = 88 + i * 48;
        ctx.fillStyle = 'rgba(240,208,128,0.55)';
        ctx.font = '10px Arial, sans-serif';
        ctx.fillText(label, 32, y);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.fillText(value, 32, y + 18);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(32, y + 28); ctx.lineTo(W - 184, y + 28);
        ctx.stroke();
    });

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.font = '10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Dokumen ini dibuat otomatis oleh sistem', W / 2, H - 12);

    return canvas.toDataURL('image/png');
}
function roundRect(ctx, x, y, w, h, r, onlyTop = false) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    if (onlyTop) {
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
    } else {
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    }
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
function kirimWA() {
    if (!_claimData) return;
    const { nama, nomor, nominal, claimedAt, buktiPublicUrl } = _claimData;

    const LTR = '\u200E';

    const buktiLine = buktiPublicUrl
        ? `${LTR}Asli yah Bang : ${buktiPublicUrl}`
        : `${LTR}Asli yah Bang : (upload gagal, hubungi admin)`;

    // Baris Arab TIDAK diberi marker agar WA deteksi sebagai RTL → rata kanan
    // Baris latin diberi LTR marker di depan → rata kiri
    const pesan = [
        'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم',
        'السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ',
        '',
        LTR + 'Halo! Saya ingin mengonfirmasi klaim THR Idul Fitri 1447 H',
        '',
        LTR + 'Nama         : ' + nama,
        LTR + 'No. Dana     : ' + nomor,
        LTR + 'Nominal      : ' + nominal,
        LTR + 'Waktu        : ' + claimedAt,
        buktiLine,
        '',
        'تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ',
        LTR + 'Taqabbalallahu minna wa minkum',
        LTR + 'Mohon Maaf Lahir & Batin',
        '',
        LTR + 'Selamat Hari Raya Idul Fitri 1447 H!',
    ].join('\n');

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, '_blank');
}
function openTHR() {
    if (localStorage.getItem('thrClaimed')) return;
    // Cek kuota dulu sebelum buka modal
    checkQuotaAndOpen();
}

async function checkQuotaAndOpen() {
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/thr_claims?select=id`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        const rows = await res.json();
        const kuota = window.__thrKuota || _adminKuota;
        if (Array.isArray(rows) && rows.length >= kuota) {
            lockTHRButtonFull();
            return;
        }
    } catch (e) {
        // Kalau gagal fetch, tetap buka (fallback)
    }
    document.getElementById('thrOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    buildKetupatGrid();
}

function closeTHR() {
    document.getElementById('thrOverlay').classList.remove('active');
    document.getElementById('claimOverlay').classList.remove('active');
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

function lockTHRButtonFull() {
    const btn = document.querySelector('.btn-thr');
    if (!btn) return;
    btn.classList.add('thr-claimed');
    btn.disabled = true;
    btn.innerHTML = `
        <span class="thr-icon">
            <svg viewBox="0 0 24 24" fill="none" style="width:20px;height:20px;flex-shrink:0;
                 stroke:rgba(255,255,255,0.3);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        </span>
        Maaf, kamu kurang beruntung :(
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:rgba(255,255,255,0.25);
             stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>`;
}
(function checkTHRClaimed() {
    const claimed = localStorage.getItem('thrClaimed');
    if (claimed) {
        try {
            const data = JSON.parse(claimed);
            lockTHRButton(data.value);
        } catch (e) {
            lockTHRButton('THR');
        }
        return;
    }
    // Cek kuota dari Supabase saat halaman load
    fetch(
        `${SUPABASE_URL}/rest/v1/thr_claims?select=id`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    ).then(r => r.json()).then(rows => {
        if (Array.isArray(rows) && rows.length >= (typeof THR_QUOTA !== 'undefined' ? THR_QUOTA : 10)) lockTHRButtonFull();
    }).catch(() => {});
})();

// ===== ADMIN PANEL =====
let _adminKuota = typeof THR_QUOTA !== 'undefined' ? THR_QUOTA : 10;

(function initAdminPanel() {
    const params = new URLSearchParams(location.search);
    const secret = typeof ADMIN_SECRET !== 'undefined' ? ADMIN_SECRET : null;
    if (!secret || params.get('admin') !== secret) return;

    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    panel.style.display = 'flex';
    adminMuatData();
})();

async function adminMuatData() {
    const infoEl   = document.getElementById('adminKuotaInfo');
    const daftarEl = document.getElementById('adminDaftarKlaim');

    // Isi input countdown dengan nilai tersimpan
    const savedTarget  = localStorage.getItem('countdownTarget') || '2026-03-30T00:00:00';
    const inputCD      = document.getElementById('adminCountdownInput');
    const currentCDEl  = document.getElementById('adminCountdownCurrent');
    if (inputCD) {
        // format untuk datetime-local: YYYY-MM-DDTHH:mm
        inputCD.value = savedTarget.slice(0, 16);
    }
    if (currentCDEl) {
        const d = new Date(savedTarget);
        currentCDEl.textContent = `Saat ini: ${d.toLocaleString('id-ID')}`;
    }

    try {
        const res  = await fetch(
            `${SUPABASE_URL}/rest/v1/thr_claims?select=nama,nomor_hp,nominal,claimed_at&order=claimed_at.asc`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        const rows = await res.json();
        const total = Array.isArray(rows) ? rows.length : 0;

        infoEl.innerHTML = `
            <span style="color:#F0D080;font-size:20px;font-weight:700;">${total}</span>
            <span style="color:rgba(255,255,255,0.5);"> / </span>
            <span style="color:#F0D080;font-size:20px;font-weight:700;" id="adminKuotaMax">${_adminKuota}</span>
            <span style="color:rgba(255,255,255,0.5);font-size:13px;"> klaim terpakai</span>`;

        if (!Array.isArray(rows) || rows.length === 0) {
            daftarEl.innerHTML = '<span style="color:rgba(255,255,255,0.3);">Belum ada klaim</span>';
            return;
        }
        daftarEl.innerHTML = rows.map((r, i) => `
            <div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);
                        display:flex;justify-content:space-between;gap:8px;">
                <span style="color:rgba(240,208,128,0.7);min-width:18px;">${i+1}.</span>
                <span style="flex:1;color:#fff;">${r.nama}</span>
                <span style="color:rgba(255,255,255,0.5);font-size:11px;">${r.nominal}</span>
            </div>`).join('');
    } catch (e) {
        infoEl.textContent = 'Gagal memuat data';
    }
}

function adminTambahKuota() {
    const input = document.getElementById('adminTambahInput');
    const tambah = parseInt(input.value) || 0;
    if (tambah < 1) return;
    _adminKuota += tambah;
    const maxEl = document.getElementById('adminKuotaMax');
    if (maxEl) maxEl.textContent = _adminKuota;
    showToast(`Kuota ditambah ${tambah} → total ${_adminKuota}`);
    // Update pengecekan kuota secara runtime
    window.__thrKuota = _adminKuota;
}

function adminResetLokal() {
    localStorage.removeItem('thrClaimed');
    document.getElementById('adminPanel').style.display = 'none';
    location.reload();
}

function adminSetCountdown() {
    const input = document.getElementById('adminCountdownInput');
    if (!input || !input.value) { showToast('Pilih tanggal dulu'); return; }

    const newDate = new Date(input.value);
    if (isNaN(newDate.getTime())) { showToast('Format tanggal tidak valid'); return; }

    localStorage.setItem('countdownTarget', newDate.toISOString());

    // Update label info
    const currentCDEl = document.getElementById('adminCountdownCurrent');
    if (currentCDEl) currentCDEl.textContent = `Saat ini: ${newDate.toLocaleString('id-ID')}`;

    showToast(`Target diubah ke ${newDate.toLocaleDateString('id-ID')}`);
}

(function devResetButton() {
    const host = location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
    if (!isLocal) return;
    const btn = document.createElement('button');
    btn.textContent = 'DEV: Reset Klaim THR';
    btn.style.cssText = `
        position: fixed;
        bottom: 16px;
        left: 16px;
        z-index: 9999;
        background: #ff4444;
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 8px 14px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        opacity: 0.85;
        font-family: monospace;
    `;
    btn.onclick = () => {
        localStorage.removeItem('thrClaimed');
        location.reload();
    };
    document.body.appendChild(btn);
})();
