document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        toggleBtn.textContent = sidebar.classList.contains('open') ? '✕ Close' : '☰ Menu';
    });

    backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        toggleBtn.textContent = '☰ Menu';
    });
});
