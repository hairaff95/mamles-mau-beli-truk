const NOMINALS_DEFAULT = Object.freeze([
    Object.freeze({ value: 'Rp 2.000',  raw: 2000,  msg: 'Lumayan buat beli jajan!' }),
    Object.freeze({ value: 'Rp 5.000',  raw: 5000,  msg: 'Alhamdulillah, ada rezekinya!' }),
    Object.freeze({ value: 'Rp 10.000', raw: 10000, msg: 'Wah, banyak banget! Berkah selalu' }),
    Object.freeze({ value: 'Rp 2.000',  raw: 2000,  msg: 'Lumayan buat beli jajan!' }),
    Object.freeze({ value: 'Rp 5.000',  raw: 5000,  msg: 'Alhamdulillah, ada rezekinya!' }),
    Object.freeze({ value: 'Rp 10.000', raw: 10000, msg: 'Wah, banyak banget! Berkah selalu' }),
]);

// ===== iOS-safe scroll lock =====
let _scrollY = 0;
let _lockCount = 0; // counter agar tidak di-unlock prematur saat 2 overlay terbuka
function lockScroll() {
    _lockCount++;
    if (_lockCount > 1) return; // sudah terkunci
    _scrollY = window.scrollY;
    document.body.style.top = `-${_scrollY}px`;
    document.body.classList.add('scroll-locked');
}
function unlockScroll() {
    _lockCount = Math.max(0, _lockCount - 1);
    if (_lockCount > 0) return; // masih ada overlay lain
    document.body.classList.remove('scroll-locked');
    document.body.style.top = '';
    window.scrollTo(0, _scrollY);
}

function formatRupiah(raw) {
    return 'Rp ' + raw.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function getNominalMsg(raw) {
    if (raw <= 2000)  return 'Lumayan buat beli jajan!';
    if (raw <= 5000)  return 'Alhamdulillah, ada rezekinya!';
    if (raw <= 10000) return 'Wah, banyak banget! Berkah selalu';
    if (raw <= 50000) return 'Subhanallah, rezekinya berlimpah!';
    return 'MasyaAllah, semoga berkah!';
}

function getActiveNominals() {
    try {
        const saved = localStorage.getItem('thrNominalCustom');
        if (saved) {
            const arr = JSON.parse(saved); // [2000, 5000, 10000]
            if (Array.isArray(arr) && arr.length === 3) {
                const expanded = [...arr, ...arr]; // 6 ketupat, 2 tiap nominal
                return expanded.map(raw => ({
                    value: formatRupiah(raw),
                    raw,
                    msg: getNominalMsg(raw)
                }));
            }
        }
    } catch (e) {}
    return [...NOMINALS_DEFAULT];
}

const K_COLORS = Object.freeze([
    ['#8FD06E','#5BA842'],
    ['#8FD06E','#5BA842'],
    ['#8FD06E','#5BA842'],
    ['#8FD06E','#5BA842'],
    ['#8FD06E','#5BA842'],
    ['#8FD06E','#5BA842'],
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
    // Flat woven ketupat — diamond body with neck top & fork bottom
    const light = color1;   // lighter green (checkerboard light)
    const dark  = color2;   // darker green  (checkerboard dark)
    return `
    <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
        <defs>
            <clipPath id="bodyClip">
                <!-- Diamond body rounded -->
                <path d="M50 18 Q50 18 85 62 Q85 66 50 104 Q15 66 15 62 Q15 58 50 18Z"/>
            </clipPath>
            <clipPath id="neckClip">
                <rect x="41" y="2" width="18" height="22" rx="4"/>
            </clipPath>
            <clipPath id="fork1Clip">
                <polygon points="30,102 43,102 37,120 24,120"/>
            </clipPath>
            <clipPath id="fork2Clip">
                <polygon points="57,102 70,102 76,120 63,120"/>
            </clipPath>
        </defs>

        <!-- === NECK === -->
        <rect x="41" y="2" width="18" height="22" rx="4" fill="${dark}"/>
        <!-- neck weave stripes -->
        <g clip-path="url(#neckClip)">
            <rect x="41" y="2"  width="18" height="5"  fill="${light}" opacity="0.5"/>
            <rect x="41" y="12" width="18" height="5"  fill="${light}" opacity="0.5"/>
            <rect x="41" y="22" width="18" height="5"  fill="${light}" opacity="0.5"/>
        </g>

        <!-- === DIAMOND BODY — base fill === -->
        <path d="M50 18 Q50 18 85 62 Q85 66 50 104 Q15 66 15 62 Q15 58 50 18Z" fill="${light}"/>

        <!-- === WOVEN GRID inside diamond === -->
        <g clip-path="url(#bodyClip)">
            <!-- diagonal strips going ↗ direction (dark) -->
            <line x1="5"   y1="102" x2="58"  y2="14"  stroke="${dark}" stroke-width="14" opacity="0.55"/>
            <line x1="22"  y1="110" x2="78"  y2="18"  stroke="${dark}" stroke-width="14" opacity="0.55"/>
            <line x1="40"  y1="116" x2="96"  y2="24"  stroke="${dark}" stroke-width="14" opacity="0.55"/>
            <line x1="58"  y1="120" x2="110" y2="36"  stroke="${dark}" stroke-width="14" opacity="0.55"/>
            <!-- diagonal strips going ↘ direction (dark) -->
            <line x1="4"   y1="20"  x2="62"  y2="110" stroke="${dark}" stroke-width="14" opacity="0.55"/>
            <line x1="22"  y1="14"  x2="80"  y2="116" stroke="${dark}" stroke-width="14" opacity="0.55"/>
            <line x1="42"  y1="10"  x2="96"  y2="104" stroke="${dark}" stroke-width="14" opacity="0.55"/>
            <line x1="60"  y1="6"   x2="108" y2="90"  stroke="${dark}" stroke-width="14" opacity="0.55"/>
        </g>

        <!-- === DIAMOND BODY — border === -->
        <path d="M50 18 Q50 18 85 62 Q85 66 50 104 Q15 66 15 62 Q15 58 50 18Z"
              fill="none" stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"/>

        <!-- === QUESTION MARK (hidden after open via k-top opacity) === -->
        <text x="50" y="68" text-anchor="middle" dominant-baseline="middle"
              font-size="26" font-weight="900" fill="rgba(255,255,255,0.75)"
              font-family="Plus Jakarta Sans, Arial, sans-serif"
              style="text-shadow:0 2px 8px rgba(0,0,0,0.4)">?</text>

        <!-- === FORK BOTTOM === -->
        <polygon points="30,101 43,101 37,120 24,120" fill="${dark}"/>
        <!-- fork1 weave -->
        <g clip-path="url(#fork1Clip)">
            <line x1="24" y1="102" x2="43"  y2="120" stroke="${light}" stroke-width="5" opacity="0.5"/>
            <line x1="30" y1="102" x2="43"  y2="115" stroke="${light}" stroke-width="5" opacity="0.5"/>
        </g>
        <polygon points="57,101 70,101 76,120 63,120" fill="${dark}"/>
        <!-- fork2 weave -->
        <g clip-path="url(#fork2Clip)">
            <line x1="57" y1="102" x2="76"  y2="120" stroke="${light}" stroke-width="5" opacity="0.5"/>
            <line x1="63" y1="102" x2="76"  y2="115" stroke="${light}" stroke-width="5" opacity="0.5"/>
        </g>
    </svg>`;
}
function buildKetupatGrid() {
    shuffledNominals = shuffleArray(getActiveNominals());
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

    // Simpan ke localStorage SEKARANG — agar close/refresh tidak bisa main ulang
    localStorage.setItem('thrPlayed', JSON.stringify({ value: nom.value, ts: Date.now() }));

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
    // scroll klaim overlay ke atas
    const co = document.getElementById('claimOverlay');
    if (co) co.scrollTop = 0;
    setTimeout(() => document.getElementById('inputNama').focus(), 350);
}

function backToGame() {
    document.getElementById('claimOverlay').classList.remove('active');
    if (_currentNominal) {
        document.getElementById('thrOverlay').classList.add('active');
    } else {
        unlockScroll();
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
    if (!nama || !/^[a-zA-Z\s]+$/.test(nama)) {
        errNama.textContent = nama ? 'Nama hanya boleh huruf, tanpa angka' : 'Nama wajib diisi';
        errNama.classList.add('show');
        inpNama.classList.add('input-error');
        valid = false;
    }
    const nomorDigits = nomor.replace(/\D/g, '');
    if (!nomorDigits || !nomorDigits.startsWith('08') || nomorDigits.length < 10 || nomorDigits.length > 13) {
        errNomor.textContent = !nomorDigits ? 'Nomor wajib diisi' :
            !nomorDigits.startsWith('08') ? 'Nomor harus diawali 08' :
            'Nomor HP Indonesia: 10–13 digit';
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
            unlockScroll();
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
        localStorage.removeItem('thrPlayed'); // Bersihkan thrPlayed setelah klaim sukses
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

    // Semua baris diawali LTR marker — tanpa teks Arab agar WA tidak flip ke RTL
    const pesan = [
        LTR + 'Assalamualaikum warahmatullahi wabarakatuh',
        '',
        LTR + 'Halo! Saya ingin mengonfirmasi klaim THR Idul Fitri 1447 H',
        '',
        LTR + 'Nama         : ' + nama,
        LTR + 'No. Dana     : ' + nomor,
        LTR + 'Nominal      : ' + nominal,
        LTR + 'Waktu        : ' + claimedAt,
        buktiLine,
        '',
        LTR + 'Taqabbalallahu minna wa minkum',
        LTR + 'Minal aidin wal faizin wal maqbulin',
        LTR + 'Mohon Maaf Lahir & Batin',
        '',
        LTR + 'Selamat Hari Raya Idul Fitri 1447 H!',
    ].join('\n');

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, '_blank');
}
function openTHR() {
    if (localStorage.getItem('thrClaimed')) return;

    // Sudah buka ketupat tapi belum klaim → langsung ke form klaim dengan nominal lama
    const played = localStorage.getItem('thrPlayed');
    if (played) {
        try {
            const data = JSON.parse(played);
            _currentNominal = data.value;
            showClaimForm();
        } catch (e) {
            showClaimForm();
        }
        return;
    }

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
    lockScroll();
    buildKetupatGrid();
}

function closeTHR() {
    document.getElementById('thrOverlay').classList.remove('active');
    document.getElementById('claimOverlay').classList.remove('active');
    unlockScroll();
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

    // Sudah buka ketupat tapi belum submit form → ubah tombol jadi "Lanjutkan Klaim"
    const played = localStorage.getItem('thrPlayed');
    if (played) {
        const btn = document.querySelector('.btn-thr');
        if (btn) {
            btn.innerHTML = `
                <span class="thr-icon">
                    <svg viewBox="0 0 24 24" fill="none" style="width:20px;height:20px;flex-shrink:0;stroke:#FFE566;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                        <line x1="12" y1="2" x2="12" y2="6"/>
                        <line x1="12" y1="18" x2="12" y2="22"/>
                    </svg>
                </span>
                Lanjutkan Klaim THR`;
        }
        return;
    }

    // Cek kuota dari Supabase saat halaman load
    fetch(
        `${SUPABASE_URL}/rest/v1/thr_claims?select=id`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    ).then(r => r.json()).then(rows => {
        const kuota = window.__thrKuota || _adminKuota;
        if (Array.isArray(rows) && rows.length >= kuota) lockTHRButtonFull();
    }).catch(() => {});
})();

// ===== ADMIN PANEL =====
// Kuota disimpan di localStorage agar tidak hilang saat reset klaim
const _kuotaBase = typeof THR_QUOTA !== 'undefined' ? THR_QUOTA : 10;
const _kuotaSaved = parseInt(localStorage.getItem('thrKuotaCustom')) || 0;
let _adminKuota = _kuotaBase + _kuotaSaved;

(function initAdminPanel() {
    const params = new URLSearchParams(location.search);
    const secret = typeof ADMIN_SECRET !== 'undefined' ? ADMIN_SECRET : null;
    if (!secret || params.get('admin') !== secret) return;

    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    panel.style.display = 'flex';
    lockScroll();
    adminMuatData();
})();

async function adminMuatData() {
    const infoEl   = document.getElementById('adminKuotaInfo');
    const daftarEl = document.getElementById('adminDaftarKlaim');

    // Isi input kuota dengan nilai saat ini
    const kuotaInput = document.getElementById('adminKuotaInput');
    if (kuotaInput) kuotaInput.value = _adminKuota;

    // Isi input nominal dengan nilai tersimpan
    try {
        const savedNom = localStorage.getItem('thrNominalCustom');
        if (savedNom) {
            const arr = JSON.parse(savedNom);
            if (Array.isArray(arr) && arr.length === 3) {
                const el1 = document.getElementById('adminNom1');
                const el2 = document.getElementById('adminNom2');
                const el3 = document.getElementById('adminNom3');
                if (el1) el1.value = arr[0];
                if (el2) el2.value = arr[1];
                if (el3) el3.value = arr[2];
            }
        }
    } catch (e) {}

    // Isi input countdown dengan nilai dari Supabase
    try {
        const cdRes   = await fetch(
            `${SUPABASE_URL}/rest/v1/settings?key=eq.countdown_target&select=value`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        const cdData  = await cdRes.json();
        const cdValue = cdData[0]?.value || '2026-03-30T00:00:00.000Z';
        const inputCD     = document.getElementById('adminCountdownInput');
        const currentCDEl = document.getElementById('adminCountdownCurrent');
        if (inputCD) inputCD.value = cdValue.slice(0, 16);
        if (currentCDEl) {
            const d = new Date(cdValue);
            currentCDEl.textContent = `Saat ini: ${d.toLocaleString('id-ID')}`;
        }
    } catch (e) {}

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

function adminUbahKuota() {
    const input = document.getElementById('adminKuotaInput');
    const newVal = parseInt(input.value) || 0;
    if (newVal < 1) { showToast('Kuota minimal 1'); return; }
    const base = typeof THR_QUOTA !== 'undefined' ? THR_QUOTA : 10;
    // Simpan selisih dari base ke localStorage
    const selisih = newVal - base;
    localStorage.setItem('thrKuotaCustom', selisih);
    _adminKuota = newVal;
    window.__thrKuota = _adminKuota;
    const maxEl = document.getElementById('adminKuotaMax');
    if (maxEl) maxEl.textContent = _adminKuota;
    showToast(`Kuota diubah menjadi ${_adminKuota}`);
}

function adminSimpanNominal() {
    const n1 = parseInt(document.getElementById('adminNom1').value) || 0;
    const n2 = parseInt(document.getElementById('adminNom2').value) || 0;
    const n3 = parseInt(document.getElementById('adminNom3').value) || 0;
    if (n1 < 1 || n2 < 1 || n3 < 1) { showToast('Semua nominal harus diisi'); return; }
    localStorage.setItem('thrNominalCustom', JSON.stringify([n1, n2, n3]));
    showToast(`Nominal disimpan: ${formatRupiah(n1)}, ${formatRupiah(n2)}, ${formatRupiah(n3)}`);
}

async function adminResetLokal() {
    const btn = document.getElementById('btnAdminReset');
    if (btn) { btn.disabled = true; btn.textContent = 'Mereset...'; }

    // Hapus semua data klaim di Supabase
    try {
        await fetch(
            `${SUPABASE_URL}/rest/v1/thr_claims?id=gte.0`,
            {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal',
                }
            }
        );
    } catch (e) {
        showToast('Gagal hapus data server, hanya reset lokal');
    }

    // Hapus klaim & played, tapi JANGAN hapus thrKuotaCustom & thrNominalCustom
    localStorage.removeItem('thrClaimed');
    localStorage.removeItem('thrPlayed');
    document.getElementById('adminPanel').style.display = 'none';
    unlockScroll();
    location.reload();
}

async function adminSetCountdown() {
    const input = document.getElementById('adminCountdownInput');
    if (!input || !input.value) { showToast('Pilih tanggal dulu'); return; }

    const newDate = new Date(input.value);
    if (isNaN(newDate.getTime())) { showToast('Format tanggal tidak valid'); return; }

    const btn = document.querySelector('[onclick="adminSetCountdown()"]');
    if (btn) { btn.textContent = 'Menyimpan...'; btn.disabled = true; }

    try {
        // Upsert ke Supabase — berlaku untuk semua pengunjung
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/settings?key=eq.countdown_target`,
            {
                method: 'PATCH',
                headers: {
                    'apikey':        SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type':  'application/json',
                    'Prefer':        'return=minimal',
                },
                body: JSON.stringify({ value: newDate.toISOString() }),
            }
        );

        if (!res.ok) throw new Error(await res.text());

        // Update countdown langsung di halaman ini juga (tanpa reload)
        if (typeof _countdownTarget !== 'undefined') {
            window._countdownTarget = newDate;
        }

        const currentCDEl = document.getElementById('adminCountdownCurrent');
        if (currentCDEl) currentCDEl.textContent = `Saat ini: ${newDate.toLocaleString('id-ID')}`;

        showToast(`Target diubah ke ${newDate.toLocaleDateString('id-ID')} — berlaku untuk semua!`);
    } catch (e) {
        console.error(e);
        showToast('Gagal menyimpan ke server');
    } finally {
        if (btn) { btn.textContent = 'Simpan'; btn.disabled = false; }
    }
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
        localStorage.removeItem('thrPlayed');
        location.reload();
    };
    document.body.appendChild(btn);
})();
