// 3. Telemetria Live
async function initTelemetry() {
    const els = {
        speed: document.getElementById('tel-speed'),
        rpm: document.getElementById('tel-rpm'),
        rpmBar: document.getElementById('tel-rpm-bar'),
        gear: document.getElementById('tel-gear'),
        thrBar: document.getElementById('tel-thr-bar'),
        brkBar: document.getElementById('tel-brk-bar'),
        drs: document.getElementById('tel-drs'),
        trackTemp: document.getElementById('track-temp'),
        airTemp: document.getElementById('air-temp'),
        rainfall: document.getElementById('rainfall'),
        toast: document.getElementById('overtake-toast')
    };

    const canvas = document.getElementById('raceCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width, height;

    const teams = {
        'Red Bull': '#3671C6', 'Ferrari': '#E8002D', 'Mercedes': '#27F4D2',
        'McLaren': '#FF8000', 'Aston Martin': '#229971', 'Alpine': '#0093CC',
        'Williams': '#64C4FF', 'RB': '#6692FF', 'Haas': '#B6BABD', 'Sauber': '#52E252'
    };

    const pilots = [
        { id: 'VER', team: 'Red Bull', pos: 0.99, speed: 0.00128 },
        { id: 'NOR', team: 'McLaren', pos: 0.94, speed: 0.00126 },
        { id: 'LEC', team: 'Ferrari', pos: 0.91, speed: 0.00122 },
        { id: 'HAM', team: 'Mercedes', pos: 0.88, speed: 0.00118 },
        { id: 'PIA', team: 'McLaren', pos: 0.85, speed: 0.00123 },
        { id: 'SAI', team: 'Ferrari', pos: 0.82, speed: 0.00120 },
        { id: 'RUS', team: 'Mercedes', pos: 0.79, speed: 0.00119 },
        { id: 'PER', team: 'Red Bull', pos: 0.75, speed: 0.00115 },
        { id: 'ALO', team: 'Aston Martin', pos: 0.70, speed: 0.00112 },
        { id: 'STR', team: 'Aston Martin', pos: 0.65, speed: 0.00108 },
        { id: 'TSU', team: 'RB', pos: 0.60, speed: 0.00110 },
        { id: 'HUL', team: 'Haas', pos: 0.55, speed: 0.00111 },
        { id: 'ALB', team: 'Williams', pos: 0.50, speed: 0.00109 },
        { id: 'RIC', team: 'RB', pos: 0.45, speed: 0.00105 },
        { id: 'GAS', team: 'Alpine', pos: 0.40, speed: 0.00104 },
        { id: 'OCO', team: 'Alpine', pos: 0.35, speed: 0.00103 },
        { id: 'MAG', team: 'Haas', pos: 0.30, speed: 0.00102 },
        { id: 'BOT', team: 'Sauber', pos: 0.25, speed: 0.00101 },
        { id: 'ZHO', team: 'Sauber', pos: 0.20, speed: 0.00099 },
        { id: 'SAR', team: 'Williams', pos: 0.15, speed: 0.00098 }
    ];

    function resize() {
        const container = canvas.parentElement;
        if (!container) return;
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width * (window.devicePixelRatio || 1);
        canvas.height = height * (window.devicePixelRatio || 1);
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    function getTrackPoint(t) {
        t = (t % 1 + 1) % 1;
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const scale = Math.min(width, height) * 0.8;
        const points = [
            { x: 0.35, y: 0.90 }, { x: 0.30, y: 0.82 }, { x: 0.05, y: 0.75 },
            { x: 0.10, y: 0.65 }, { x: 0.05, y: 0.55 }, { x: 0.10, y: 0.25 },
            { x: 0.15, y: 0.26 }, { x: 0.25, y: 0.20 }, { x: 0.55, y: 0.60 },
            { x: 0.65, y: 0.50 }, { x: 0.95, y: 0.65 }, { x: 0.85, y: 0.82 },
            { x: 0.75, y: 0.78 }, { x: 0.75, y: 0.90 }, { x: 0.35, y: 0.90 }
        ];
        const n = points.length - 1;
        const index = t * n;
        const i = Math.floor(index);
        const f = index - i;
        const p1 = points[i];
        const p2 = points[i + 1];
        return {
            x: centerX + (p1.x + (p2.x - p1.x) * f - 0.5) * scale,
            y: centerY + (p1.y + (p2.y - p1.y) * f - 0.5) * scale
        };
    }

    function draw() {
        if (!width || !height) return;
        ctx.clearRect(0, 0, width, height);
        // Track
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.beginPath(); ctx.strokeStyle = '#2d333b'; ctx.lineWidth = 20;
        for (let t = 0; t <= 1; t += 0.01) { const p = getTrackPoint(t); if (t === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.closePath(); ctx.stroke();

        ctx.beginPath(); ctx.strokeStyle = '#161b22'; ctx.lineWidth = 16;
        for (let t = 0; t <= 1; t += 0.01) { const p = getTrackPoint(t); if (t === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.closePath(); ctx.stroke();

        // Pilots
        pilots.forEach(p => {
            p.pos = (p.pos + p.speed) % 1;
            const pos = getTrackPoint(p.pos);
            const color = teams[p.team] || '#FFF';
            ctx.shadowBlur = 10; ctx.shadowColor = color;
            ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0; ctx.strokeStyle = color; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = color; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
            ctx.fillText(p.id, pos.x, pos.y - 12);
        });

        // Leaderboard Overlay
        const sorted = [...pilots].sort((a, b) => b.pos - a.pos);
        const lb = document.getElementById('track-leaderboard');
        if (lb) {
            lb.innerHTML = sorted.map((p, i) => `
                <div class="flex items-center gap-3 text-[10px] font-bold text-white/80">
                    <span class="w-3 text-f1-gray">${i + 1}</span>
                    <span class="w-1 h-3" style="background: ${teams[p.team] || '#FFF'}"></span>
                    <span class="flex-1">${p.id}</span>
                </div>
            `).join('');
        }

        requestAnimationFrame(draw);
    }

    async function updateAPIs() {
        try {
            // Weather
            const wRes = await fetch('https://api.openf1.org/v1/weather?meeting_key=1208').then(r => r.ok ? r.json() : []).catch(() => []);
            await new Promise(r => setTimeout(r, 100));
            if (Array.isArray(wRes) && wRes.length) {
                const last = wRes[wRes.length - 1];
                if (els.trackTemp) els.trackTemp.innerText = `${last.track_temperature || '--'}°C`;
                if (els.airTemp) els.airTemp.innerText = `${last.air_temperature || '--'}°C`;
                if (els.rainfall) els.rainfall.innerText = `${last.rainfall || '0'}%`;
            }

            // Car Data
            const cRes = await fetch('https://api.openf1.org/v1/car_data?driver_number=55&session_key=9159').then(r => r.ok ? r.json() : []).catch(() => []);
            await new Promise(r => setTimeout(r, 100));
            if (Array.isArray(cRes) && cRes.length) {
                const entry = cRes[Math.floor(Math.random() * cRes.length)];
                if (els.speed) els.speed.innerText = entry.speed || '0';
                if (els.rpm) els.rpm.innerText = entry.rpm || '0';
                if (els.gear) els.gear.innerText = entry.n_gear || 'N';
                if (els.rpmBar) els.rpmBar.style.width = `${Math.min(((entry.rpm || 0) / 12000) * 100, 100)}%`;
                if (els.thrBar) els.thrBar.style.width = `${entry.throttle || 0}%`;
                if (els.brkBar) els.brkBar.style.width = `${entry.brake || 0}%`;
                if (els.drs) {
                    const drsActive = entry.drs >= 10;
                    els.drs.innerText = drsActive ? 'Active' : 'Inactive';
                    els.drs.className = `text-[9px] font-black uppercase px-3 py-1 rounded-sm border transition-all ${drsActive ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'bg-white/5 text-f1-gray border-white/5'}`;
                }
            }

            // Overtakes Simulation
            const oRes = await fetch('https://api.openf1.org/v1/overtakes?session_key=9636').then(r => r.ok ? r.json() : []).catch(() => []);
            await new Promise(r => setTimeout(r, 100));
            if (Array.isArray(oRes) && oRes.length > 0 && Math.random() > 0.8 && els.toast) {
                els.toast.classList.remove('opacity-0', 'translate-x-10');
                setTimeout(() => els.toast.classList.add('opacity-0', 'translate-x-10'), 3000);
            }

        } catch (e) {
            logger.warn('Telemetry background sync failed gracefully.');
        }
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
    setInterval(updateAPIs, 3000);
    updateAPIs();
}