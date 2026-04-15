async function fetchAllData() {
    try {
        // Executar sequencialmente para evitar erro 429 (Too Many Requests) da API
        if (typeof fetchDrivers === 'function') await fetchDrivers();
        if (typeof fetchChampionshipData === 'function') await fetchChampionshipData();
        if (typeof fetchSessionResults === 'function') await fetchSessionResults();
        if (typeof initTelemetry === 'function') await initTelemetry();
        if (typeof initHeroSlideshow === 'function') initHeroSlideshow();
        
        if (typeof refreshIcons === 'function') refreshIcons();
    } catch (err) {
        if (typeof logger !== 'undefined') logger.error('Failed to initialize application data', err);
    }
}

document.addEventListener('DOMContentLoaded', fetchAllData);