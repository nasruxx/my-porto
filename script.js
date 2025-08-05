// GitHub API Configuration
const GITHUB_USERNAME = 'nasruxx';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

// Language colors mapping
const LANGUAGE_COLORS = {
    'JavaScript': '#f1e05a',
    'Python': '#3572a5',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'PHP': '#4f5d95',
    'Ruby': '#701516',
    'Go': '#00add8',
    'Rust': '#dea584',
    'TypeScript': '#2b7489',
    'Vue': '#2c3e50',
    'React': '#61dafb',
    'Shell': '#89e051',
    'Dockerfile': '#384d54',
    'default': '#586069'
};

// Global variables
let allProjects = [];
let currentFilter = 'all';

// DOM Elements
const elements = {
    navbar: document.querySelector('.navbar'),
    hamburger: document.querySelector('.hamburger'),
    navMenu: document.querySelector('.nav-menu'),
    projectsGrid: document.getElementById('projects-grid'),
    projectsLoading: document.getElementById('projects-loading'),
    projectsError: document.getElementById('projects-error'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    contactForm: document.getElementById('contact-form'),
    backToTop: document.getElementById('back-to-top'),
    reposCount: document.getElementById('repos-count'),
    starsCount: document.getElementById('stars-count'),
    languagesCount: document.getElementById('languages-count')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollEffects();
    initializeProjectFilters();
    initializeContactForm();
    initializeBackToTop();
    fetchGitHubProjects();
    addScrollAnimations();
});

// Navigation functionality
function initializeNavigation() {
    if (elements.hamburger && elements.navMenu) {
        elements.hamburger.addEventListener('click', () => {
            elements.navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (elements.navMenu) {
                    elements.navMenu.classList.remove('active');
                }
            }
        });
    });
}

// Scroll effects
function initializeScrollEffects() {
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        // Navbar background effect
        if (scrollY > 50) {
            elements.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            elements.navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            elements.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            elements.navbar.style.boxShadow = 'none';
        }

        // Back to top button
        if (scrollY > 300) {
            elements.backToTop.classList.add('visible');
        } else {
            elements.backToTop.classList.remove('visible');
        }
    });
}

// Project filters
function initializeProjectFilters() {
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Update current filter
            currentFilter = btn.dataset.filter;
            // Filter projects
            filterProjects();
        });
    });
}

// Filter projects based on language
function filterProjects() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const language = card.dataset.language?.toLowerCase() || '';
        
        if (currentFilter === 'all' || language === currentFilter) {
            card.classList.remove('hidden');
            card.style.animation = 'fadeInUp 0.6s ease forwards';
        } else {
            card.classList.add('hidden');
        }
    });
}

// Contact form functionality
function initializeContactForm() {
    if (elements.contactForm) {
        elements.contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Simple validation
            if (!data.name || !data.email || !data.message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Here you would typically send the data to a server
            // For now, just show a success message
            alert('Thank you for your message! I will get back to you soon.');
            this.reset();
        });
    }
}

// Back to top functionality
function initializeBackToTop() {
    if (elements.backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                elements.backToTop.classList.add('visible');
            } else {
                elements.backToTop.classList.remove('visible');
            }
        });

        elements.backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Fetch GitHub projects
async function fetchGitHubProjects() {
    try {
        showProjectsLoading();
        
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const repos = await response.json();
        
        hideProjectsLoading();
        displayProjects(repos);
        updateGitHubStats(repos);
        
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        hideProjectsLoading();
        showProjectsError('Failed to load projects from GitHub');
    }
}

// Display projects
function displayProjects(repos) {
    // Filter hanya repository yang bukan fork
    const filteredRepos = repos
        .filter(repo => !repo.fork) // Hanya filter fork
        .sort((a, b) => {
            // Sort by stars first, then by updated date
            if (b.stargazers_count !== a.stargazers_count) {
                return b.stargazers_count - a.stargazers_count;
            }
            return new Date(b.updated_at) - new Date(a.updated_at);
        });
        // HAPUS .slice(0, 9) untuk menampilkan SEMUA repository

    if (filteredRepos.length === 0) {
        showProjectsError('No repositories found');
        return;
    }

    elements.projectsGrid.innerHTML = '';
    
    filteredRepos.forEach((repo, index) => {
        const projectCard = createProjectCard(repo, index);
        elements.projectsGrid.appendChild(projectCard);
    });

    // Apply current filter
    setTimeout(() => {
        filterProjects();
    }, 100);
}

// Create project card element
function createProjectCard(repo, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.language = repo.language?.toLowerCase() || '';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const languageColor = LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.default;
    const description = repo.description || 'No description available';
    const stars = repo.stargazers_count || 0;
    const language = repo.language || 'Unknown';
    const updatedDate = new Date(repo.updated_at).toLocaleDateString();
    
    card.innerHTML = `
        <div class="project-header">
            <h3 class="project-title">${repo.name}</h3>
            <p class="project-description">${description}</p>
            <div class="project-meta">
                <div class="project-language">
                    <span class="language-dot" style="background-color: ${languageColor}"></span>
                    <span>${language}</span>
                </div>
                ${stars > 0 ? `<div class="project-stars">
                    <i class="fas fa-star"></i>
                    <span>${stars}</span>
                </div>` : ''}
            </div>
        </div>
        <div class="project-footer">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">
                <i class="fab fa-github"></i>
                View Code
            </a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="project-link secondary">
                <i class="fas fa-external-link-alt"></i>
                Live Demo
            </a>` : `<span class="project-link secondary" style="opacity: 0.5; cursor: not-allowed;">
                <i class="fas fa-calendar"></i>
                ${updatedDate}
            </span>`}
        </div>
    `;
    
    return card;
}

// Update GitHub statistics
function updateGitHubStats(repos) {
    const publicRepos = repos.filter(repo => !repo.fork);
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const languages = [...new Set(repos.map(repo => repo.language).filter(Boolean))];

    // Update stats with animation
    animateCounter('repos-count', publicRepos.length);
    animateCounter('stars-count', totalStars);
    animateCounter('languages-count', languages.length);
}

// Animate counter numbers
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let currentValue = 0;
    const increment = targetValue / 50;
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            element.textContent = targetValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(currentValue);
        }
    }, 30);
}

// Loading states
function showProjectsLoading() {
    if (elements.projectsLoading) elements.projectsLoading.style.display = 'block';
    if (elements.projectsGrid) elements.projectsGrid.style.display = 'none';
    if (elements.projectsError) elements.projectsError.style.display = 'none';
}

function hideProjectsLoading() {
    if (elements.projectsLoading) elements.projectsLoading.style.display = 'none';
    if (elements.projectsGrid) elements.projectsGrid.style.display = 'grid';
}

function showProjectsError(message = 'Unable to load projects. Please check your internet connection and try again.') {
    if (elements.projectsLoading) elements.projectsLoading.style.display = 'none';
    if (elements.projectsGrid) elements.projectsGrid.style.display = 'none';
    if (elements.projectsError) elements.projectsError.style.display = 'block';
    
    const errorText = elements.projectsError.querySelector('p');
    if (errorText) {
        errorText.textContent = message;
    }
}

// Retry function for projects
window.fetchGitHubProjects = fetchGitHubProjects;

// Scroll animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.about-card, .skill-category, .stat-card, .contact-card'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Hamburger animation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        
        const spans = this.querySelectorAll('span');
        if (this.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// Typing effect for hero subtitle
document.addEventListener('DOMContentLoaded', function() {
    const subtitle = document.querySelector('.hero-subtitle');
    const text = subtitle.textContent;
    subtitle.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            subtitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    };
    
    // Start typing effect after page load
    setTimeout(typeWriter, 1000);
});

// Error handling
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    if (event.reason.message && event.reason.message.includes('GitHub')) {
        showProjectsError('Failed to load GitHub data. Please check your internet connection.');
    }
});

// Performance optimization
document.addEventListener('DOMContentLoaded', function() {
    // Lazy load images if any
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Add some interactive hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Skill tags hover effect
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Social links pulse effect
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.6s ease-in-out';
        });
        
        link.addEventListener('animationend', function() {
            this.style.animation = '';
        });
    });
});

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);