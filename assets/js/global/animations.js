function initHeroSlideshow() {
    const bg1 = document.getElementById('bg-1');
    const bg2 = document.getElementById('bg-2');
    if (!bg1 || !bg2) return;

    let current = 1;

    setInterval(() => {
        if (current === 1) {
            bg1.classList.replace('opacity-100', 'opacity-0');
            bg2.classList.replace('opacity-0', 'opacity-100');
            current = 2;
        } else {
            bg2.classList.replace('opacity-100', 'opacity-0');
            bg1.classList.replace('opacity-0', 'opacity-100');
            current = 1;
        }
    }, 5000); // Troca a cada 5 segundos
}