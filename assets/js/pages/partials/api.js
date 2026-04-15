const featuredDrivers = [1, 16, 4, 44, 11];

// 0. Session Results
async function fetchSessionResults() {
    const container = document.getElementById('session-results-container');
    if (!container) return;

    try {
        // Fetch the top 3 results from the provided session
        const results = await fetch('https://api.openf1.org/v1/session_result?session_key=7782&position%3C=3')
            .then(res => res.ok ? res.json() : [])
            .catch(() => []);

        if (Array.isArray(results) && results.length > 0) {
            // Fetch driver details sequentially to avoid 429
            const drivers = [];
            for (const res of results) {
                try {
                    const r = await fetch(`https://api.openf1.org/v1/drivers?driver_number=${res.driver_number}`);
                    if (r.ok) {
                        const data = await r.json();
                        drivers.push((Array.isArray(data) && data.length > 0) ? data[data.length - 1] : null);
                    } else {
                        drivers.push(null);
                    }
                } catch (e) {
                    drivers.push(null);
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            renderSessionResults(results, drivers);
        }
    } catch (error) {
        logger.warn('Session results fetch failed', error);
    }
}

function renderSessionResults(results, drivers) {
    const container = document.getElementById('session-results-container');
    if (!container || !results) return;

    container.innerHTML = '';
    results.slice(0, 3).forEach((res, index) => {
        const driver = drivers[index];
        const teamColor = driver?.team_colour ? `#${driver.team_colour}` : '#FF1801';
        const positionColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

        container.insertAdjacentHTML('beforeend', `
            <div class="glass-card p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-f1-red/30 transition-all duration-500">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                        <span class="text-xl font-display font-black italic ${positionColors[index]}">${res.position}</span>
                    </div>
                    <div>
                        <h4 class="text-sm font-display font-black text-white uppercase italic leading-none mb-1">
                            ${driver?.last_name || 'Driver ' + res.driver_number}
                        </h4>
                        <span class="text-[9px] font-bold text-f1-gray uppercase tracking-widest">
                            ${driver?.team_name || 'Formula 1 Team'}
                        </span>
                    </div>
                </div>
                <div class="text-right">
                    <span class="block text-xs font-mono font-bold text-white mb-1">
                        ${res.gap_to_leader === 0 ? 'LEADER' : '+' + res.gap_to_leader + 's'}
                    </span>
                    <div class="h-1 w-12 ml-auto" style="background: ${teamColor}"></div>
                </div>
            </div>
        `);
    });
    refreshIcons();
}

// 1. Pilotos Showcase
async function fetchDrivers() {
    const container = document.getElementById('drivers-container');
    if (!container) return;

    try {
        const drivers = [];
        for (const num of featuredDrivers) {
            try {
                const res = await fetch(`https://api.openf1.org/v1/drivers?driver_number=${num}`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        drivers.push(data[data.length - 1]);
                    }
                } else if (res.status === 429) {
                    logger.warn(`Rate limit hit for driver #${num}`);
                }
            } catch (err) {
                logger.warn(`Driver fetch failed for #${num}`, err);
            }
            // Pequeno delay para evitar 429
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (drivers.length > 0) {
            renderDrivers(drivers);
            renderStandingsSmall(drivers);
            refreshIcons();
        }
    } catch (error) {
        logger.error('Drivers API fatal error', error);
    }
}

function renderDrivers(drivers) {
    const container = document.getElementById('drivers-container');
    if (!container || !Array.isArray(drivers)) return;

    container.innerHTML = '';
    drivers.forEach(d => {
        if (!d) return;
        const teamColor = d.team_colour ? `#${d.team_colour}` : '#FF1801';
        let imgUrl = d.headshot_url ? d.headshot_url.replace('.transform/1col/image.png', '').replace('1col', '4col') : '';

        container.insertAdjacentHTML('beforeend', `
            <div class="card-hover-effect rounded-2xl bg-f1-dark border border-white/5 overflow-hidden relative h-[380px] group cursor-pointer">
                <div class="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity" style="background: radial-gradient(circle at 100% 100%, ${teamColor}, transparent)"></div>
                <span class="absolute -top-4 -right-2 text-9xl font-display font-black text-white/[0.02] group-hover:text-white/[0.05] transition-all">${d.driver_number || ''}</span>
                
                <div class="p-6 h-full flex flex-col justify-between relative z-10">
                    <div>
                        <span class="text-4xl font-display font-black text-white italic leading-none">${d.driver_number || ''}</span>
                        <span class="block text-[10px] font-bold tracking-[0.3em] text-f1-gray uppercase mt-2">${d.name_acronym || ''}</span>
                    </div>
                    
                    <img src="${imgUrl}" class="absolute bottom-0 right-0 w-4/5 h-3/4 object-contain object-bottom transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl" onerror="this.style.display='none'">

                    <div class="w-3/4">
                        <p class="text-xs font-bold text-f1-gray uppercase tracking-widest mb-1">${d.first_name || ''}</p>
                        <h3 class="text-2xl font-display font-black text-white uppercase italic leading-none mb-4">${d.last_name || ''}</h3>
                        <div class="h-[2px] w-8 mb-4" style="background: ${teamColor}"></div>
                        <p class="text-[10px] font-bold text-white/60 uppercase tracking-widest truncate">${d.team_name || ''}</p>
                    </div>
                </div>
            </div>
        `);
    });
}

function renderStandingsSmall(drivers) {
    const list = document.getElementById('standings-list');
    if (!list || !Array.isArray(drivers)) return;

    list.innerHTML = '';
    drivers.slice(0, 4).forEach((d, i) => {
        if (!d) return;
        const teamColor = d.team_colour ? `#${d.team_colour}` : '#FF1801';
        list.insertAdjacentHTML('beforeend', `
            <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border-l-2" style="border-color: ${teamColor}">
                <div class="flex items-center gap-3">
                    <span class="text-xs font-black text-f1-gray">${i + 1}</span>
                    <span class="text-xs font-bold text-white uppercase tracking-wider">${d.last_name || ''}</span>
                </div>
                <span class="text-[10px] font-mono font-bold text-f1-gray">${d.name_acronym || ''}</span>
            </div>
        `);
    });
}

// 2. Campeonato McLaren
async function fetchChampionshipData() {
    const container = document.getElementById('teams-container');
    if (!container) return;

    try {
        let tRes, dRes;
        try {
            const tr = await fetch('https://api.openf1.org/v1/championship_teams?session_key=9839&team_name=McLaren');
            tRes = { status: 'fulfilled', value: tr.ok ? await tr.json() : [] };
        } catch(e) { tRes = { status: 'rejected' }; }

        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            const dr = await fetch('https://api.openf1.org/v1/championship_drivers?session_key=9839&driver_number=4&driver_number=81');
            dRes = { status: 'fulfilled', value: dr.ok ? await dr.json() : [] };
        } catch(e) { dRes = { status: 'rejected' }; }

        const teamData = tRes.status === 'fulfilled' ? tRes.value : [];
        const driverData = dRes.status === 'fulfilled' ? dRes.value : [];

        if (Array.isArray(teamData) && teamData.length > 0) {
            renderTeams(teamData[0], Array.isArray(driverData) ? driverData : []);
        }
    } catch (error) {
        logger.warn('Championship API failed gracefully:', error);
    }
}

function renderTeams(team, drivers) {
    const container = document.getElementById('teams-container');
    if (!container || !team) return;

    const diff = (team.points_current || 0) - (team.points_start || 0);
    const driversList = Array.isArray(drivers) ? drivers : [];

    container.innerHTML = `
        <div class="glass-card p-8 rounded-3xl border-l-4 border-f1-papaya relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                <i data-lucide="shield" class="w-24 h-24 text-f1-papaya"></i>
            </div>
            <div class="relative z-10">
                <div class="flex justify-between items-start mb-8">
                    <div>
                        <span class="text-4xl font-display font-black text-white italic">P${team.position_current || '-'}</span>
                        <h4 class="text-xl font-display font-black text-white uppercase italic tracking-tighter mt-1">${team.team_name || ''}</h4>
                    </div>
                    <div class="text-right">
                        <span class="block text-3xl font-display font-black text-white leading-none">${team.points_current || '0'}</span>
                        <span class="text-[10px] font-bold text-f1-papaya uppercase tracking-widest">+${diff} PTS LIVE</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    ${driversList.map(d => `
                        <div class="bg-black/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                            <span class="text-[10px] font-bold text-white uppercase">${d?.driver_number === 4 ? 'Norris' : (d?.driver_number === 81 ? 'Piastri' : 'Piloto')}</span>
                            <span class="text-xs font-black text-f1-papaya">P${d?.position_current || '-'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    refreshIcons();
}