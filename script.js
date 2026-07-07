// GitHub Configuration
const GITHUB_USERNAME = 'nasruxx';
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

const LANG_COLORS = {
    'JavaScript': '#f1e05a',
    'Python': '#3572a5',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555',
    'PHP': '#4f5d95',
    'TypeScript': '#2b7489',
    'Go': '#00add8',
    'Shell': '#89e051',
    'default': '#888'
};

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    setupScroll();
    setupFilters();
    setupForm();
    setupBackToTop();
    setupReveal();
    fetchGitHubProjects();
});

// ---- Navigation ----
function setupNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    const navbar = document.getElementById('navbar');

    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
            toggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                links.classList.remove('open');
                toggle.classList.remove('active');
            });
        });
    }

    // Navbar scroll style
    window.addEventListener('scroll', () => {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 30);
        }
    }, { passive: true });
}

// ---- Scroll Reveal ----
function setupReveal() {
    const targets = document.querySelectorAll(
        '.about-main, .about-stats, .skill-group, .contact-left, .contact-right'
    );

    targets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
}

// ---- Scroll Effects ----
function setupScroll() {
    // Handled inside setupNav for navbar
}

// ---- Back to Top ----
function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ---- Project Filters ----
let currentFilter = 'all';

function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterProjects();
        });
    });
}

function filterProjects() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        const lang = (card.dataset.language || '').toLowerCase();
        if (currentFilter === 'all' || lang === currentFilter) {
            card.classList.remove('hidden');
            card.style.animation = 'slideUp 0.4s ease forwards';
        } else {
            card.classList.add('hidden');
        }
    });
}

// ---- Contact Form ----
function setupForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));

        if (!data.name || !data.email || !data.message) {
            showToast('Mohon isi semua kolom yang diperlukan.', 'warn');
            return;
        }

        showToast('Pesan terkirim! Saya akan segera membalas.', 'ok');
        form.reset();
    });
}

// ---- GitHub Fetch ----
async function fetchGitHubProjects() {
    const grid = document.getElementById('projects-grid');
    const loading = document.getElementById('projects-loading');
    const error = document.getElementById('projects-error');

    try {
        if (loading) loading.style.display = 'block';
        if (grid) grid.style.display = 'none';
        if (error) error.style.display = 'none';

        const res = await fetch(GITHUB_API);
        if (!res.ok) throw new Error(res.status);

        const repos = await res.json();

        if (loading) loading.style.display = 'none';
        if (grid) grid.style.display = 'grid';

        renderProjects(repos);
        updateStats(repos);
    } catch (err) {
        console.error('GitHub fetch error:', err);
        if (loading) loading.style.display = 'none';
        if (error) error.style.display = 'block';
    }
}

function renderProjects(repos) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const filtered = repos
        .filter(r => !r.fork)
        .sort((a, b) => {
            if (b.stargazers_count !== a.stargazers_count) {
                return b.stargazers_count - a.stargazers_count;
            }
            return new Date(b.updated_at) - new Date(a.updated_at);
        });

    if (!filtered.length) {
        document.getElementById('projects-error').style.display = 'block';
        grid.style.display = 'none';
        return;
    }

    grid.innerHTML = '';

    filtered.forEach((repo, i) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.language = (repo.language || '').toLowerCase();
        card.style.animationDelay = `${i * 0.06}s`;

        const color = LANG_COLORS[repo.language] || LANG_COLORS.default;
        const desc = repo.description || 'Belum ada deskripsi.';
        const lang = repo.language || '—';
        const stars = repo.stargazers_count || 0;
        const date = new Date(repo.updated_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        card.innerHTML = `
            <div class="project-body">
                <h3 class="project-title">${repo.name}</h3>
                <p class="project-description">${desc}</p>
                <div class="project-meta">
                    <div class="project-language">
                        <span class="language-dot" style="background:${color}"></span>
                        <span>${lang}</span>
                    </div>
                    ${stars > 0 ? `<div class="project-stars"><i class="fas fa-star"></i> ${stars}</div>` : ''}
                </div>
            </div>
            <div class="project-actions">
                <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-link primary">
                    <i class="fab fa-github"></i> Kode
                </a>
                ${repo.homepage
                    ? `<a href="${repo.homepage}" target="_blank" rel="noopener" class="project-link secondary"><i class="fas fa-external-link-alt"></i> Demo</a>`
                    : `<span class="project-link secondary" style="opacity:0.5;cursor:default;"><i class="fas fa-calendar-alt"></i> ${date}</span>`
                }
            </div>
        `;

        grid.appendChild(card);
    });

    setTimeout(filterProjects, 60);
}

function updateStats(repos) {
    const pub = repos.filter(r => !r.fork);
    const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const langs = [...new Set(repos.map(r => r.language).filter(Boolean))];

    animateNum('repos-count', pub.length);
    animateNum('stars-count', stars);
    animateNum('languages-count', langs.length);
}

function animateNum(id, target) {
    const el = document.getElementById(id);
    if (!el) return;

    let current = 0;
    const step = Math.max(1, target / 40);
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            el.textContent = target;
            clearInterval(interval);
        } else {
            el.textContent = Math.floor(current);
        }
    }, 30);
}

// ---- Toast Notification ----
function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${type === 'ok' ? '#2d5a27' : '#c47d2e'};
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-family: 'DM Sans', sans-serif;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Expose for retry button
window.fetchGitHubProjects = fetchGitHubProjects;