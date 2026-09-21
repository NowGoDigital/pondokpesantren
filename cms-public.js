/* ============================================================
   cms-public.js v3 — Jembatan CMS → Halaman Publik (PATCHED)
   Sumber data: cms-data.json (server/GitHub) → fallback localStorage
   PATCH v3:
   #1 Galeri CMS dirender MASUK ke #galleryGrid (ikut filter & lightbox)
   #4 Kartu berita CMS memakai class .news-item + data-cat (ikut filter)
   ============================================================ */
(function () {
    'use strict';

    /* ---------- util ---------- */
    function lsGet(k, fb) { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch (e) { return fb; } }
    function lsSet(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
    const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const escAttr = s => String(s ?? '').replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const MONTHS_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    function localSnapshot() {
        return {
            news: lsGet('newsData', []),
            agenda: lsGet('agendaData', []),
            galeri: lsGet('galeriData', []),
            prestasi: lsGet('prestasiData', []),
            profil: lsGet('profilData', {}),
            siteSettings: lsGet('siteSettings', {}),
            psbRegistrations: lsGet('psbRegistrations', [])
        };
    }

    /* ---------- mount finder (defensif) ---------- */
    const MOUNTS = {
        news: ['cmsNewsMount', 'cmsBeritaMount'],
        agenda: ['cmsAgendaMount'],
        prestasi: ['cmsPrestasiMount']
    };
    function firstMount(ids) {
        for (const id of ids) { const el = document.getElementById(id); if (el) return el; }
        return null;
    }

    /* ---------- PATCH #4: berita CMS ikut filter kategori ---------- */
    function renderNews(list) {
        const m = firstMount(MOUNTS.news); if (!m) return;
        if (!list.length) { m.innerHTML = ''; return; }
        m.innerHTML = list.map(n => `
            <article class="news-item card-green relative rounded-2xl p-6" data-cat="${escAttr(n.cat || 'kegiatan')}">
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="bg-gold-400 text-slate-900 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">${esc(n.cat || 'kegiatan')}</span>
                        <span class="text-emerald-100/60 text-[11px]"><i class="far fa-calendar mr-1"></i>${esc(n.date || '')}</span>
                    </div>
                    <h3 class="font-serif font-bold text-white text-lg leading-snug mb-2">${esc(n.title)}</h3>
                    <p class="text-emerald-100/75 text-sm leading-relaxed">${esc(n.content || '')}</p>
                    <span class="inline-flex items-center gap-2 mt-4 text-gold-light text-xs font-bold">Baca Selengkapnya <i class="fas fa-arrow-right text-[10px]"></i></span>
                </div>
            </article>`).join('');
    }

    function renderAgenda(list) {
        const m = firstMount(MOUNTS.agenda); if (!m) return;
        if (!list.length) { m.innerHTML = ''; return; }
        const sorted = list.slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        m.innerHTML = sorted.map(a => {
            const d = a.date ? new Date(a.date + 'T00:00:00') : null;
            return `
            <article class="card-green relative flex gap-5 rounded-2xl p-6">
                <div class="relative z-10 flex gap-5 w-full">
                    <div class="shrink-0 w-16 text-center bg-gold-400/15 border border-gold-400/40 rounded-xl py-3">
                        <p class="font-serif text-2xl font-bold text-gold-light leading-none">${d ? d.getDate() : '--'}</p>
                        <p class="text-[10px] uppercase tracking-widest text-emerald-100/70 mt-1">${d ? MONTHS_ABBR[d.getMonth()] : '---'}</p>
                    </div>
                    <div>
                        <span class="inline-block bg-gold-400 text-slate-900 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2">${esc(a.category || 'Kegiatan')}</span>
                        <h3 class="font-serif font-bold text-white mb-1 leading-snug">${esc(a.title)}</h3>
                        <p class="text-emerald-100/70 text-xs mb-2"><i class="far fa-clock mr-1"></i>${esc(a.time || '-')} · <i class="fas fa-location-dot mx-1"></i>${esc(a.location || '-')}</p>
                    </div>
                </div>
            </article>`; }).join('');
    }

    /* ---------- PATCH #1: galeri CMS masuk grid publik (filter + lightbox) ---------- */
    function renderGaleri(list) {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;
        grid.querySelectorAll('[data-cms="1"]').forEach(el => el.remove());
        if (!list || !list.length) return;
        const html = list.map(g => `
            <div class="g-item relative group overflow-hidden rounded-xl cursor-pointer aspect-video bg-emerald-900/40" data-cat="${escAttr(g.category || 'kegiatan')}" data-cms="1" onclick="openLightbox('${escAttr(g.img)}','${escAttr(g.caption)}')">
                <img src="${escAttr(g.img)}" alt="${escAttr(g.caption)}" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110" onerror="this.style.opacity=0.15">
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                <div class="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <span class="inline-block bg-gold-400 text-slate-900 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5">${esc(g.category || 'kegiatan')}</span>
                    <p class="text-white text-sm font-semibold leading-snug">${esc(g.caption)}</p>
                </div>
            </div>`).join('');
        grid.insertAdjacentHTML('beforeend', html);
    }

    function renderPrestasi(list) {
        const m = firstMount(MOUNTS.prestasi); if (!m) return;
        if (!list.length) { m.innerHTML = ''; return; }
        m.innerHTML = list.map(p => `
            <article class="card-green relative rounded-2xl p-6">
                <div class="relative z-10">
                    <div class="w-12 h-12 rounded-xl bg-gold-400/15 border border-gold-400/40 flex items-center justify-center mb-4"><i class="fas fa-trophy text-gold-light text-lg"></i></div>
                    <span class="inline-block bg-gold-400 text-slate-900 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">${esc(p.medal || 'Emas')}</span>
                    <h3 class="font-serif font-bold text-white leading-snug mb-2">${esc(p.title)}</h3>
                    <p class="text-emerald-100/70 text-xs mb-2"><i class="fas fa-globe mr-1"></i>${esc(p.level || 'Nasional')} · <i class="far fa-calendar mx-1"></i>${esc(p.year || '-')}</p>
                    <p class="text-emerald-100/75 text-sm leading-relaxed">${esc(p.desc || '')}</p>
                </div>
            </article>`).join('');
    }

    /* ---------- PATCH #2 target: profil.html kini punya id cmsVisi/cmsMisi/cmsSejarah ---------- */
    function renderProfil(p) {
        if (!p) return;
        const set = (id, txt) => { const el = document.getElementById(id); if (el && txt) el.textContent = txt; };
        set('cmsVisi', p.visi); set('cmsSejarah', p.sejarah); set('cmsSambutan', p.sambutan);
        set('cmsAddr', p.addr); set('cmsPhone', p.phone); set('cmsEmail', p.email); set('cmsWa', p.wa);
        const misi = document.getElementById('cmsMisi');
        if (misi && p.misi) {
            misi.innerHTML = (p.misi || '').split('\n').filter(x => x.trim())
                .map(m => `<li class="flex gap-2.5 text-emerald-100/85 text-sm"><i class="fas fa-check-circle text-gold-light mt-0.5"></i><span>${esc(m)}</span></li>`).join('');
        }
    }

    function renderSettings(s) {
        const tb = document.getElementById('topbar');
        if (!tb) return;
        if (s.topbarVisible === false) {
            tb.classList.add('max-h-0', 'opacity-0', 'border-b-0');
            try { if (typeof topbarDismissed !== 'undefined') topbarDismissed = true; } catch (e) {}
        }
        if (s.topbarText) tb.querySelectorAll('p > span').forEach(sp => { sp.textContent = s.topbarText; });
        if (s.waClaim) { const a = tb.querySelector('a[href^="https://wa.me/"]'); if (a) a.href = s.waClaim; }
    }

    function mergePsb(published) {
        if (!published || !published.length) return;
        const local = lsGet('psbRegistrations', []);
        if (!local.length) { lsSet('psbRegistrations', published); return; }
        const nums = new Set(local.map(p => p.nomor));
        const add = published.filter(p => !nums.has(p.nomor));
        if (add.length) lsSet('psbRegistrations', local.concat(add));
    }

    function applyAll(data) {
        renderNews(data.news || []);
        renderAgenda(data.agenda || []);
        renderGaleri(data.galeri || []);
        renderPrestasi(data.prestasi || []);
        renderProfil(data.profil || {});
        renderSettings(data.siteSettings || {});
        mergePsb(data.psbRegistrations || []);
    }

    /* ---------- boot ---------- */
    function start() {
        fetch('cms-data.json?v=' + Date.now(), { cache: 'no-store' })
            .then(r => { if (!r.ok) throw 0; return r.json(); })
            .then(data => {
                window.CMS_DATA = data;
                applyAll(data);
                console.log('%c📡 cms-public: memuat cms-data.json dari server', 'color:#059669;font-weight:bold');
            })
            .catch(() => {
                window.CMS_DATA = localSnapshot();
                applyAll(window.CMS_DATA);
                console.log('%c📡 cms-public: cms-data.json belum ada → fallback localStorage', 'color:#B45309;font-weight:bold');
            });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
