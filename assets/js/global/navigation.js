window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('glass-card', 'h-16');
        header.classList.remove('h-20');
    } else {
        header.classList.remove('glass-card', 'h-16');
        header.classList.add('h-20');
    }
});