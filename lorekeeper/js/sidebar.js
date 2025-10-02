document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        toggleBtn.textContent = sidebar.classList.contains('open') ? '✕ Close' : '☰ Menu';
    });
});
