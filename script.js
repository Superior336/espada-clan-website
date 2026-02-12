// ============================================
// ESPADA CLAN WEBSITE - script.js
// Dynamic rendering + Admin Dashboard
// ============================================

// ===== GLOBAL STATE =====
let ranksData = [];
let servicesData = [];
let adminToken = sessionStorage.getItem('espada_admin_token') || null;

// ===== LOADING SCREEN =====
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 800);
    }, 1000);
});

// ===== MOBILE MENU =====
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const spans = mobileToggle.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(10px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }
    });
});

// ===== SCROLL ANIMATIONS =====
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

function observeNewElements() {
    document.querySelectorAll('.scroll-reveal:not(.observed)').forEach(el => {
        el.classList.add('observed');
        observer.observe(el);
    });
}
observeNewElements();

// ===== PARALLAX (desktop only) =====
if (!isMobile) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-content');
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            hero.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });
}

// ===== NAVBAR SCROLL EFFECT =====
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.style.background = window.scrollY > 100
            ? 'rgba(15, 15, 35, 0.95)'
            : 'rgba(15, 15, 35, 0.8)';
    });

    // Load dynamic data
    loadServices();
    loadRanks();
});

// ===== LEADER AVATAR HOVER =====
document.querySelectorAll('.leader-avatar').forEach(avatar => {
    avatar.addEventListener('mouseenter', function () { this.style.transform = 'scale(1.15) rotate(5deg)'; });
    avatar.addEventListener('mouseleave', function () { this.style.transform = 'scale(1) rotate(0deg)'; });
});

// ===== CTA BUTTON RIPPLE =====
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// ===== HERO TYPING EFFECT =====
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle) {
    const originalText = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    let charIndex = 0;
    function typeText() {
        if (charIndex < originalText.length) {
            heroSubtitle.textContent += originalText.charAt(charIndex);
            charIndex++;
            setTimeout(typeText, 50);
        }
    }
    setTimeout(typeText, 1000);
}

// ===== CONSOLE EASTER EGG =====
console.log('%c🔥 ESPADA CLAN 🔥', 'color: #DC143C; font-size: 28px; font-weight: bold;');
console.log('%cElite Warriors United', 'color: #FF0000; font-size: 18px; font-weight: bold;');

// ===== MODAL FUNCTIONS =====
function closeModal() {
    document.getElementById('successModal').classList.add('hidden');
}

// ============================================
// DYNAMIC DATA LOADING
// ============================================

async function loadServices() {
    try {
        const res = await fetch('/api/services');
        servicesData = await res.json();
        renderServices();
    } catch (e) {
        console.error('Failed to load services:', e);
    }
}

function renderServices() {
    const container = document.getElementById('servicesContainer');
    if (!container) return;
    container.innerHTML = servicesData.map(s => `
        <div class="glass-card service-card scroll-reveal">
            <div class="service-icon">${s.icon}</div>
            <h3>${s.title}</h3>
            <p>${s.description}</p>
        </div>
    `).join('');
    observeNewElements();
}

async function loadRanks() {
    try {
        const res = await fetch('/api/ranks');
        ranksData = await res.json();
        renderRanks();
    } catch (e) {
        console.error('Failed to load ranks:', e);
    }
}

function renderRanks() {
    const container = document.getElementById('rankingsContainer');
    if (!container) return;
    container.innerHTML = ranksData.map((tier, i) => `
        <div class="glass-card rank-card scroll-reveal" data-rank="${i + 1}">
            <div class="rank-number">${tier.rankNumber}</div>
            <div class="rank-info">
                <h3 class="rank-title">${tier.title}</h3>
                <p class="rank-description">${tier.description}</p>
            </div>
            <span class="rank-badge">${tier.badge}</span>
            <span class="expand-icon">▼</span>
            <div class="rank-members">
                <div class="member-list">
                    ${tier.members.map(m => `
                        <div class="member-item">${m.name} <span style="opacity: 0.6;">• ${m.rank}</span></div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Re-attach click-to-expand
    document.querySelectorAll('.rank-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.classList.contains('member-item')) return;
            document.querySelectorAll('.rank-card').forEach(c => {
                if (c !== this && c.classList.contains('expanded')) c.classList.remove('expanded');
            });
            this.classList.toggle('expanded');
        });
    });

    observeNewElements();
}

// ============================================
// APPLICATION FORM SUBMISSION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recruitmentForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            const originalBtnText = submitButton.innerText;
            submitButton.disabled = true;
            submitButton.innerHTML = 'Transmitting... <span style="animation: buttonPulse 1s infinite;">⚡';

            let userIP = 'Unknown';
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                userIP = ipData.ip;
            } catch (error) { console.error('Could not fetch IP:', error); }

            const formData = {
                name: document.getElementById('name').value,
                age: document.getElementById('age').value,
                discord: document.getElementById('discord').value,
                experience: document.getElementById('experience').value,
                reason: document.getElementById('reason').value,
                ip: userIP,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch('/submit-application', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    document.getElementById('successModal').classList.remove('hidden');
                    form.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                console.error('Error submitting application:', error);
                alert('Network error. Please try again or contact us directly.');
                document.getElementById('successModal').classList.remove('hidden');
                form.reset();
            } finally {
                submitButton.disabled = false;
                submitButton.innerText = originalBtnText;
            }
        });
    }
});

// ============================================
// ADMIN SYSTEM
// ============================================

// --- Admin Login ---
const adminLoginTrigger = document.getElementById('adminLoginTrigger');
const adminLoginOverlay = document.getElementById('adminLoginOverlay');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginCancel = document.getElementById('adminLoginCancel');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminLoginError = document.getElementById('adminLoginError');

adminLoginTrigger.addEventListener('click', () => {
    if (adminToken) {
        // Already logged in, open dashboard directly
        openDashboard();
    } else {
        adminLoginOverlay.classList.remove('hidden');
        adminPasswordInput.focus();
    }
});

adminLoginCancel.addEventListener('click', () => {
    adminLoginOverlay.classList.add('hidden');
    adminPasswordInput.value = '';
    adminLoginError.textContent = '';
});

adminLoginOverlay.addEventListener('click', (e) => {
    if (e.target === adminLoginOverlay) {
        adminLoginOverlay.classList.add('hidden');
        adminPasswordInput.value = '';
        adminLoginError.textContent = '';
    }
});

adminPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') adminLoginBtn.click();
});

adminLoginBtn.addEventListener('click', async () => {
    const password = adminPasswordInput.value.trim();
    if (!password) {
        adminLoginError.textContent = 'Enter a password';
        return;
    }

    adminLoginBtn.disabled = true;
    adminLoginBtn.textContent = 'Authenticating...';
    adminLoginError.textContent = '';

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        const data = await res.json();

        if (data.success) {
            adminToken = data.token;
            sessionStorage.setItem('espada_admin_token', adminToken);
            adminLoginOverlay.classList.add('hidden');
            adminPasswordInput.value = '';
            adminLoginError.textContent = '';
            openDashboard();
        } else {
            adminLoginError.textContent = '⛔ Access denied. Wrong password.';
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    } catch (e) {
        adminLoginError.textContent = 'Connection error. Try again.';
    } finally {
        adminLoginBtn.disabled = false;
        adminLoginBtn.textContent = 'Authenticate';
    }
});

// --- Admin Dashboard ---
const adminDashOverlay = document.getElementById('adminDashOverlay');
const adminDashClose = document.getElementById('adminDashClose');
const adminSaveBtn = document.getElementById('adminSaveBtn');
const adminSaveMsg = document.getElementById('adminSaveMsg');

// Local copies for editing
let editRanks = [];
let editServices = [];

function openDashboard() {
    // Deep clone current data for editing
    editRanks = JSON.parse(JSON.stringify(ranksData));
    editServices = JSON.parse(JSON.stringify(servicesData));

    adminDashOverlay.classList.remove('hidden');
    renderAdminRanks();
    renderAdminServices();
    adminSaveMsg.textContent = 'Changes are auto-tracked';
    adminSaveMsg.className = 'admin-save-msg';
}

adminDashClose.addEventListener('click', () => {
    adminDashOverlay.classList.add('hidden');
});

adminDashOverlay.addEventListener('click', (e) => {
    if (e.target === adminDashOverlay) adminDashOverlay.classList.add('hidden');
});

// Dashboard Tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const panelId = this.dataset.tab === 'ranks' ? 'adminRanksPanel' : 'adminServicesPanel';
        document.getElementById(panelId).classList.add('active');
    });
});

// --- Render Admin Ranks ---
function renderAdminRanks() {
    const list = document.getElementById('adminRanksList');
    list.innerHTML = editRanks.map((tier, ti) => `
        <div class="admin-rank-tier">
            <div class="admin-rank-header">
                <div class="tier-label">
                    <span class="tier-rank-num">${tier.rankNumber}</span>
                    <span class="tier-title">${tier.title}</span>
                </div>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span class="tier-badge">${tier.badge}</span>
                    <button class="admin-delete-tier-btn" data-tier="${ti}">Delete</button>
                </div>
            </div>
            <div class="admin-rank-body">
                <div class="admin-member-list">
                    ${tier.members.map((m, mi) => `
                        <div class="admin-member-chip">
                            <span>${m.name}</span>
                            <span class="chip-rank">${m.rank}</span>
                            <button class="chip-remove" data-tier="${ti}" data-member="${mi}">✕</button>
                        </div>
                    `).join('')}
                    ${tier.members.length === 0 ? '<span style="color:rgba(255,255,255,0.3);font-size:0.85rem;">No members</span>' : ''}
                </div>
                <div class="admin-add-row">
                    <input type="text" placeholder="Member name" id="addMemberName_${ti}">
                    <input type="text" placeholder="Rank" value="${tier.rankNumber}" id="addMemberRank_${ti}" style="max-width:80px;">
                    <button class="admin-add-btn" data-tier="${ti}">+ Add</button>
                </div>
            </div>
        </div>
    `).join('');

    // Attach events
    list.querySelectorAll('.chip-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ti = parseInt(btn.dataset.tier);
            const mi = parseInt(btn.dataset.member);
            editRanks[ti].members.splice(mi, 1);
            renderAdminRanks();
        });
    });

    list.querySelectorAll('.admin-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ti = parseInt(btn.dataset.tier);
            const nameInput = document.getElementById(`addMemberName_${ti}`);
            const rankInput = document.getElementById(`addMemberRank_${ti}`);
            const name = nameInput.value.trim();
            const rank = rankInput.value.trim();
            if (name && rank) {
                editRanks[ti].members.push({ name, rank });
                renderAdminRanks();
            }
        });
    });

    list.querySelectorAll('.admin-delete-tier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ti = parseInt(btn.dataset.tier);
            if (confirm(`Delete tier "${editRanks[ti].title}"?`)) {
                editRanks.splice(ti, 1);
                renderAdminRanks();
            }
        });
    });
}

// --- Add New Tier ---
const showAddTierBtn = document.getElementById('showAddTierForm');
const newTierForm = document.getElementById('newTierForm');
const confirmAddTier = document.getElementById('confirmAddTier');
const cancelAddTier = document.getElementById('cancelAddTier');

showAddTierBtn.addEventListener('click', () => {
    newTierForm.classList.toggle('visible');
});

cancelAddTier.addEventListener('click', () => {
    newTierForm.classList.remove('visible');
});

confirmAddTier.addEventListener('click', () => {
    const rank = document.getElementById('newTierRank').value.trim();
    const title = document.getElementById('newTierTitle').value.trim();
    const badge = document.getElementById('newTierBadge').value.trim();
    const desc = document.getElementById('newTierDesc').value.trim();

    if (!rank || !title) {
        alert('Rank and Title are required');
        return;
    }

    editRanks.push({
        id: rank.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        rankNumber: rank,
        title: title,
        description: desc || 'No description.',
        badge: badge || rank,
        members: []
    });

    // Clear and hide form
    document.getElementById('newTierRank').value = '';
    document.getElementById('newTierTitle').value = '';
    document.getElementById('newTierBadge').value = '';
    document.getElementById('newTierDesc').value = '';
    newTierForm.classList.remove('visible');
    renderAdminRanks();
});

// --- Render Admin Services ---
function renderAdminServices() {
    const list = document.getElementById('adminServicesList');
    list.innerHTML = editServices.map((s, si) => `
        <div class="admin-service-card">
            <div class="admin-service-icon">${s.icon}</div>
            <div class="admin-service-info">
                <h4>${s.title}</h4>
                <p>${s.description}</p>
            </div>
            <button class="admin-service-delete" data-idx="${si}">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('.admin-service-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const si = parseInt(btn.dataset.idx);
            if (confirm(`Delete service "${editServices[si].title}"?`)) {
                editServices.splice(si, 1);
                renderAdminServices();
            }
        });
    });
}

// --- Add New Service ---
document.getElementById('confirmAddService').addEventListener('click', () => {
    const icon = document.getElementById('newServiceIcon').value.trim();
    const title = document.getElementById('newServiceTitle').value.trim();
    const desc = document.getElementById('newServiceDesc').value.trim();

    if (!title) {
        alert('Service title is required');
        return;
    }

    editServices.push({
        id: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        icon: icon || '🔧',
        title: title,
        description: desc || 'No description.'
    });

    document.getElementById('newServiceIcon').value = '';
    document.getElementById('newServiceTitle').value = '';
    document.getElementById('newServiceDesc').value = '';
    renderAdminServices();
});

// --- SAVE ALL ---
adminSaveBtn.addEventListener('click', async () => {
    adminSaveBtn.disabled = true;
    adminSaveBtn.textContent = 'Saving...';
    adminSaveMsg.textContent = 'Saving changes...';
    adminSaveMsg.className = 'admin-save-msg';

    try {
        // Save ranks
        const ranksRes = await fetch('/api/ranks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(editRanks)
        });

        // Save services
        const servicesRes = await fetch('/api/services', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(editServices)
        });

        if (ranksRes.ok && servicesRes.ok) {
            // Update live data
            ranksData = JSON.parse(JSON.stringify(editRanks));
            servicesData = JSON.parse(JSON.stringify(editServices));
            renderServices();
            renderRanks();

            adminSaveMsg.textContent = '✓ All changes saved successfully!';
            adminSaveMsg.className = 'admin-save-msg success';
        } else {
            throw new Error('Save failed');
        }
    } catch (e) {
        console.error('Save error:', e);
        adminSaveMsg.textContent = '✕ Failed to save. Check connection.';
        adminSaveMsg.className = 'admin-save-msg error';
    } finally {
        adminSaveBtn.disabled = false;
        adminSaveBtn.textContent = '💾 SAVE ALL';
    }
});
