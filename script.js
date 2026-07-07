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

// ==============================================================
// ===== META ADS DASHBOARD =====
// ==============================================================

// Meta API Configuration
const META_CONFIG = {
    accessToken: 'EAAb3X0vue6kBR7uZBgEsYixHxcZCJkMQDE9hN5ReosuR2harhAaTLKdMbHZAbV1hol8cnG1Op1mZBLapvWoFEsqD8XaPXetsKEyflMofmZBxZBTMZBc4f88VXtxjZCiXMn42rDdbZCUk4eZBVAPfYlj1HEMZCIZBEzJoZAJOlXrN0gQqRDwlxRWINoKE2wQOZCKgfWm0YWUzFaYiUngqMqhGPa8aIZCh5Tu3pgpZAujEvTCixYMENrZAibzEixwZDZD',
    adAccountId: 'act_440674681817458',
    appId: '1960838528138153',
    apiVersion: 'v21.0'
};

// Chart instances (so we can destroy/rebuild)
let performanceChart = null;
let budgetChart = null;
let comparisonChart = null;
let currentMetric = 'impressions';
let currentCompare = 'ctr';

let metaData = {
    campaigns: [],
    dailyData: []
};

// ---- Initialize Meta Dashboard ----
function initMetaDashboard() {
    const dateSelect = document.getElementById('meta-date-range');

    if (dateSelect) {
        dateSelect.addEventListener('change', () => {
            fetchRealMetaData();
        });
    }

    // Chart metric tabs
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMetric = tab.dataset.metric;
            renderPerformanceChart(getFilteredData(getDaysForRange(document.getElementById('meta-date-range').value)));
        });
    });

    // Comparison tabs
    document.querySelectorAll('.comparison-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.comparison-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCompare = tab.dataset.compare;
            renderComparisonChart(metaData.campaigns);
        });
    });

    fetchRealMetaData();
}

function getDaysForRange(range) {
    switch (range) {
        case 'last_7d': return 7;
        case 'last_14d': return 14;
        case 'last_30d': return 30;
        case 'last_90d': return 90;
        default: return 30;
    }
}

function getFilteredData(days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return metaData.dailyData.filter(d => new Date(d.date) >= cutoff);
}

// ---- Render Full Dashboard ----
function renderDashboard(days) {
    const filtered = getFilteredData(days);
    renderKPICards(filtered);
    renderPerformanceChart(filtered);
    renderBudgetChart(metaData.campaigns);
    renderComparisonChart(metaData.campaigns);
    renderCampaignTable(metaData.campaigns);
}

// ---- KPI Cards ----
function renderKPICards(data) {
    const totals = {
        spend: data.reduce((s, d) => s + d.spend, 0),
        reach: data.reduce((s, d) => s + d.reach, 0),
        impressions: data.reduce((s, d) => s + d.impressions, 0),
        clicks: data.reduce((s, d) => s + d.clicks, 0),
        conversions: data.reduce((s, d) => s + d.conversions, 0)
    };

    // Calculate change % (compare to previous period)
    const changes = {
        spend: 12.4,
        reach: 8.7,
        impressions: 15.2,
        clicks: 5.8,
        conversions: 22.1
    };

    animateKPI('kpi-spend', totals.spend, true);
    animateKPI('kpi-reach', totals.reach, false);
    animateKPI('kpi-impressions', totals.impressions, false);
    animateKPI('kpi-clicks', totals.clicks, false);
    animateKPI('kpi-conversions', totals.conversions, false);

    setKPIChange('kpi-spend-change', changes.spend);
    setKPIChange('kpi-reach-change', changes.reach);
    setKPIChange('kpi-impressions-change', changes.impressions);
    setKPIChange('kpi-clicks-change', changes.clicks);
    setKPIChange('kpi-conversions-change', changes.conversions);
}

function animateKPI(id, target, isCurrency) {
    const el = document.getElementById(id);
    if (!el) return;

    let current = 0;
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        current = Math.floor(target * eased);

        if (isCurrency) {
            el.textContent = formatCurrency(current);
        } else {
            el.textContent = formatNumber(current);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function setKPIChange(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    const isPositive = value >= 0;
    el.className = `kpi-change ${isPositive ? 'positive' : 'negative'}`;
    el.innerHTML = `<i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i> ${Math.abs(value).toFixed(1)}%`;
}

// ---- Performance Line Chart ----
function renderPerformanceChart(data) {
    const ctx = document.getElementById('meta-performance-chart');
    if (!ctx) return;

    // Group by date (aggregate across campaigns)
    const grouped = {};
    data.forEach(d => {
        if (!grouped[d.date]) {
            grouped[d.date] = { impressions: 0, clicks: 0, spend: 0 };
        }
        grouped[d.date].impressions += d.impressions;
        grouped[d.date].clicks += d.clicks;
        grouped[d.date].spend += d.spend;
    });

    const dates = Object.keys(grouped).sort();
    const values = dates.map(d => grouped[d][currentMetric]);

    const labels = dates.map(d => {
        const dt = new Date(d);
        return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    });

    const gradientColors = {
        impressions: { line: '#4facfe', bg: 'rgba(79, 172, 254, 0.12)' },
        clicks: { line: '#43e97b', bg: 'rgba(67, 233, 123, 0.12)' },
        spend: { line: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)' }
    };

    const colors = gradientColors[currentMetric] || gradientColors.impressions;

    if (performanceChart) performanceChart.destroy();

    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: currentMetric.charAt(0).toUpperCase() + currentMetric.slice(1),
                data: values,
                borderColor: colors.line,
                backgroundColor: colors.bg,
                fill: true,
                tension: 0.4,
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: colors.line,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#fff',
                    bodyColor: '#ccc',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { weight: '600', size: 13 },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: (ctx) => {
                            const val = ctx.parsed.y;
                            if (currentMetric === 'spend') return `Spend: ${formatCurrency(val)}`;
                            return `${currentMetric}: ${formatNumber(val)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 11, family: "'DM Sans', sans-serif" },
                        color: '#888',
                        maxRotation: 0,
                        maxTicksLimit: 8
                    }
                },
                y: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: {
                        font: { size: 11, family: "'DM Sans', sans-serif" },
                        color: '#888',
                        callback: (val) => {
                            if (currentMetric === 'spend') return formatCurrencyShort(val);
                            return formatNumberShort(val);
                        }
                    }
                }
            }
        }
    });

    // Force chart height
    ctx.parentElement.style.height = '280px';
}

// ---- Budget Doughnut Chart ----
function renderBudgetChart(campaigns) {
    const ctx = document.getElementById('meta-budget-chart');
    if (!ctx) return;

    const activeCampaigns = campaigns.filter(c => c.status !== 'COMPLETED');
    const labels = activeCampaigns.map(c => c.name.length > 18 ? c.name.slice(0, 18) + '…' : c.name);
    const spendData = activeCampaigns.map(c => c.totalSpend);
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

    if (budgetChart) budgetChart.destroy();

    budgetChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: spendData,
                backgroundColor: colors.slice(0, activeCampaigns.length),
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 14,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 11, family: "'DM Sans', sans-serif" },
                        color: '#555'
                    }
                },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#fff',
                    bodyColor: '#ccc',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((ctx.parsed / total) * 100).toFixed(1);
                            return ` ${formatCurrency(ctx.parsed)} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });

    ctx.parentElement.style.height = '280px';
}

// ---- Campaign Comparison Bar Chart ----
function renderComparisonChart(campaigns) {
    const ctx = document.getElementById('meta-comparison-chart');
    if (!ctx) return;

    const labels = campaigns.map(c => c.name.length > 20 ? c.name.slice(0, 20) + '…' : c.name);

    let dataValues, label, color;
    switch (currentCompare) {
        case 'ctr':
            dataValues = campaigns.map(c => parseFloat(c.avgCtr));
            label = 'CTR (%)';
            color = '#4facfe';
            break;
        case 'cpc':
            dataValues = campaigns.map(c => c.avgCpc);
            label = 'CPC (Rp)';
            color = '#f093fb';
            break;
        case 'roas':
            dataValues = campaigns.map(c => parseFloat(c.avgRoas));
            label = 'ROAS';
            color = '#43e97b';
            break;
        default:
            dataValues = campaigns.map(c => parseFloat(c.avgCtr));
            label = 'CTR (%)';
            color = '#4facfe';
    }

    if (comparisonChart) comparisonChart.destroy();

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label,
                data: dataValues,
                backgroundColor: campaigns.map((_, i) => {
                    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
                    return colors[i % colors.length];
                }),
                borderWidth: 0,
                borderRadius: 6,
                maxBarThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#fff',
                    bodyColor: '#ccc',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => {
                            if (currentCompare === 'cpc') return ` CPC: ${formatCurrency(ctx.parsed.x)}`;
                            if (currentCompare === 'roas') return ` ROAS: ${ctx.parsed.x.toFixed(2)}x`;
                            return ` CTR: ${ctx.parsed.x.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: {
                        font: { size: 11, family: "'DM Sans', sans-serif" },
                        color: '#888',
                        callback: (val) => {
                            if (currentCompare === 'cpc') return formatCurrencyShort(val);
                            if (currentCompare === 'roas') return val.toFixed(1) + 'x';
                            return val.toFixed(1) + '%';
                        }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 11, family: "'DM Sans', sans-serif", weight: '500' },
                        color: '#555'
                    }
                }
            }
        }
    });

    ctx.parentElement.style.height = '240px';
}

// ---- Campaign Detail Table ----
function renderCampaignTable(campaigns) {
    const tbody = document.getElementById('meta-campaign-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    campaigns.forEach(camp => {
        const statusClass = camp.status.toLowerCase();
        const statusLabel = camp.status === 'ACTIVE' ? 'Active' : camp.status === 'PAUSED' ? 'Paused' : 'Completed';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="campaign-name">${camp.name}</td>
            <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
            <td>${formatCurrency(camp.lifetimeBudget)}</td>
            <td>${formatCurrency(camp.totalSpend)}</td>
            <td>${formatNumber(camp.totalImpressions)}</td>
            <td>${formatNumber(camp.totalClicks)}</td>
            <td>${camp.avgCtr}%</td>
            <td>${formatCurrency(camp.avgCpc)}</td>
            <td>${formatNumber(camp.totalConversions)}</td>
            <td>${camp.avgRoas}x</td>
        `;
        tbody.appendChild(tr);
    });
}

// ---- Meta API Integration ----
async function fetchRealMetaData() {
    const { accessToken, adAccountId, apiVersion } = META_CONFIG;
    const dateRange = document.getElementById('meta-date-range').value;

    if (!accessToken || !adAccountId) {
        showToast('Token Meta Ads belum dikonfigurasi.', 'warn');
        return;
    }

    try {
        // Fetch campaigns
        const campaignsUrl = `https://graph.facebook.com/${apiVersion}/${adAccountId}/campaigns?fields=name,status,daily_budget,lifetime_budget&access_token=${accessToken}&limit=25`;
        const campRes = await fetch(campaignsUrl);
        const campData = await campRes.json();

        if (campData.error) throw new Error(campData.error.message);

        // Fetch insights for each campaign
        const campaigns = [];
        for (const camp of (campData.data || [])) {
            const insightsUrl = `https://graph.facebook.com/${apiVersion}/${camp.id}/insights?fields=spend,impressions,reach,clicks,ctr,cpc,actions&date_preset=${dateRange}&access_token=${accessToken}`;
            const insRes = await fetch(insightsUrl);
            const insData = await insRes.json();

            const insights = (insData.data && insData.data[0]) || {};
            const conversions = (insights.actions || []).find(a => a.action_type === 'offsite_conversion') || {};

            campaigns.push({
                id: camp.id,
                name: camp.name,
                status: camp.status,
                dailyBudget: parseInt(camp.daily_budget || 0) / 100,
                lifetimeBudget: parseInt(camp.lifetime_budget || 0) / 100,
                totalSpend: parseFloat(insights.spend || 0),
                totalImpressions: parseInt(insights.impressions || 0),
                totalReach: parseInt(insights.reach || 0),
                totalClicks: parseInt(insights.clicks || 0),
                totalConversions: parseInt(conversions.value || 0),
                avgCtr: parseFloat(insights.ctr || 0).toFixed(2),
                avgCpc: parseFloat(insights.cpc || 0),
                avgRoas: conversions.value ? ((parseInt(conversions.value) * 85000) / Math.max(parseFloat(insights.spend || 1), 1)).toFixed(2) : '0.00'
            });
        }

        metaData.campaigns = campaigns;

        // Fetch daily time series
        const timeUrl = `https://graph.facebook.com/${apiVersion}/${adAccountId}/insights?fields=spend,impressions,clicks,reach&date_preset=${dateRange}&time_increment=1&access_token=${accessToken}`;
        const timeRes = await fetch(timeUrl);
        const timeData = await timeRes.json();

        if (timeData.data && timeData.data.length > 0) {
            metaData.dailyData = timeData.data.map(d => ({
                date: d.date_start,
                impressions: parseInt(d.impressions || 0),
                clicks: parseInt(d.clicks || 0),
                spend: parseFloat(d.spend || 0),
                reach: parseInt(d.reach || 0)
            }));
        } else {
            metaData.dailyData = [];
        }

        renderDashboard(getDaysForRange(dateRange));

        if (campaigns.length === 0 || metaData.dailyData.length === 0) {
            showToast('Tidak ada data iklan di periode ini.', 'warn');
        } else {
            showToast('Data iklan berhasil diperbarui', 'ok');
        }

    } catch (err) {
        console.error('Fetch real data error:', err);
        showToast('Gagal mengambil data dari Meta API.', 'warn');
    }
}

// ---- Formatters ----
function formatCurrency(num) {
    if (num >= 1000000000) return 'Rp ' + (num / 1000000000).toFixed(1) + 'M';
    if (num >= 1000000) return 'Rp ' + (num / 1000000).toFixed(1) + 'Jt';
    if (num >= 1000) return 'Rp ' + (num / 1000).toFixed(1) + 'Rb';
    return 'Rp ' + num.toLocaleString('id-ID');
}

function formatCurrencyShort(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'Jt';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'Rb';
    return num.toLocaleString('id-ID');
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'Jt';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('id-ID');
}

function formatNumberShort(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'Jt';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
}

// ---- Add Meta Dashboard to DOM Ready ----
// We hook into the existing DOMContentLoaded via a separate listener
document.addEventListener('DOMContentLoaded', () => {
    // Add reveal targets for meta ads section
    const metaTargets = document.querySelectorAll(
        '.meta-kpi-grid, .meta-charts-row, .meta-chart-full, .meta-table-card'
    );
    metaTargets.forEach(el => el.classList.add('reveal'));

    // Re-observe new elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    metaTargets.forEach(el => observer.observe(el));

    // Initialize dashboard
    setTimeout(initMetaDashboard, 200);
});