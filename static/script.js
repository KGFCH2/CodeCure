// ═══════════════ CODECURE CORE JAVASCRIPT ═══════════════
// Handles: AI Predictions, Dashboard Analytics, Chatbot, and PDF Generation

// Get backend URL from configuration helper or template injection
// Supports: Local backend, Vercel frontend, hybrid deployments
const BACKEND_URL = typeof window !== 'undefined' && window.BACKEND_URL_CONFIG
    ? window.BACKEND_URL_CONFIG
    : ((window.ENV && window.ENV.BACKEND_URL) ? window.ENV.BACKEND_URL : 'http://localhost:8000');

// ────────────────────────────────────────
// Accordion Functionality
// ────────────────────────────────────────
function toggleAccordion(button) {
    const item = button.closest('.accordion-item');
    const container = button.closest('.accordion-container');

    if (!item) return;

    // Close other items in the same container
    if (container) {
        container.querySelectorAll('.accordion-item').forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
            }
        });
    }

    // Toggle current item
    item.classList.toggle('active');
}

// ────────────────────────────────────────
// Page Loader & Initialization
// ────────────────────────────────────────
function hideLoader() {
    const loader = document.getElementById('page-loader');
    const statusEl = loader ? loader.querySelector('.loader-status') : null;

    if (loader) {
        // Cycle status messages for a more "AI" feel during the 2.5s wait
        if (statusEl) {
            const messages = [
                "Initializing AI Diagnostics...",
                "Connecting to Neural Core...",
                "Analyzing Clinical Patterns...",
                "Optimizing Secure Data Stream..."
            ];
            let i = 0;
            const msgInterval = setInterval(() => {
                if (i < messages.length - 1) {
                    i++;
                    statusEl.style.opacity = '0';
                    setTimeout(() => {
                        statusEl.textContent = messages[i];
                        statusEl.style.opacity = '1';
                    }, 200);
                } else {
                    clearInterval(msgInterval);
                }
            }, 600);
        }

        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600);
        }, 2500);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) {
            if (window.scrollY > 20) {
                nav.classList.add('scrolled');
                nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
                nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            } else {
                nav.classList.remove('scrolled');
                nav.style.boxShadow = 'none';
            }
        }
    });

    // Initialize specific components
    initSlideshows();
    loadKnowledgeBase();
    updateHomeStats();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Mobile Menu Toggle logic
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('navbar-nav');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon && typeof lucide !== 'undefined') {
                const isMenu = icon.getAttribute('data-lucide') === 'menu';
                icon.setAttribute('data-lucide', isMenu ? 'x' : 'menu');
                lucide.createIcons();
            }
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            }
        });
    }
});

// ────────────────────────────────────────
// State Management
// ────────────────────────────────────────
let dashboardDataStore = [];
let knowledgeBase = [];

// ────────────────────────────────────────
// Identity & Persistence
// ────────────────────────────────────────

// Generate or retrieve a persistent identifier for this device
function getDeviceId() {
    const storageKey = 'codecure_device_id';
    let id = localStorage.getItem(storageKey);
    if (!id) {
        id = ((typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`);
        localStorage.setItem(storageKey, id);
    }
    return id;
}

// Local Persistence for Serverless Fallback
function savePredictionLocally(input, result) {
    try {
        const storageKey = 'codecure_history';
        let history = JSON.parse(localStorage.getItem(storageKey) || '[]');

        const record = {
            id: Math.floor(Math.random() * 9000) + 1000,
            name: input.name || 'Anonymous',
            age: input.age,
            glucose: input.glucose,
            bmi: input.bmi,
            health_score: result.health_score,
            risk_level: result.risk_level,
            created_at: new Date().toISOString()
        };

        history.unshift(record);
        localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 50)));
    } catch (e) { console.error("Local save failed:", e); }
}

function getLocalHistory() {
    try { return JSON.parse(localStorage.getItem('codecure_history') || '[]'); }
    catch (e) { return []; }
}

// ────────────────────────────────────────
// Tab Navigation
// ────────────────────────────────────────
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.navbar-nav a').forEach(el => el.classList.remove('active'));

    // Show selected tab
    const tab = document.getElementById('tab-' + tabName);
    if (tab) tab.classList.add('active');

    // Update nav
    const navLink = document.querySelector(`.navbar-nav a[data-tab="${tabName}"]`);
    if (navLink) navLink.classList.add('active');

    // Load dashboard data if switching to dashboard
    if (tabName === 'dashboard') {
        loadDashboard();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ────────────────────────────────────────
// Toast Notifications
// ────────────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '<i data-lucide="check-circle"></i>',
        error: '<i data-lucide="x-circle"></i>',
        info: '<i data-lucide="info"></i>'
    };

    toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;

    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ────────────────────────────────────────
// Prediction Engine
// ────────────────────────────────────────
async function handlePrediction(event) {
    event.preventDefault();

    const btn = document.getElementById('predict-btn');
    if (!btn) return;
    btn.classList.add('loading');

    const data = {
        device_id: getDeviceId(),
        name: document.getElementById('input-name').value || null,
        email: document.getElementById('input-email').value || null,
        gender: document.getElementById('input-gender').value || null,
        age: parseInt(document.getElementById('input-age').value),
        glucose: parseFloat(document.getElementById('input-glucose').value),
        bmi: parseFloat(document.getElementById('input-bmi').value),
        blood_pressure: parseFloat(document.getElementById('input-bp').value) || 72,
        pregnancies: parseInt(document.getElementById('input-pregnancies').value) || 0,
        skin_thickness: parseFloat(document.getElementById('input-skin').value) || 20,
        insulin: parseFloat(document.getElementById('input-insulin').value) || 80,
        diabetes_pedigree: parseFloat(document.getElementById('input-dpf').value) || 0.47,
        exercise_hours: parseFloat(document.getElementById('input-exercise').value) || 0,
        sleep_hours: parseFloat(document.getElementById('input-sleep').value) || 7,
        smoking: document.getElementById('input-smoking').checked
    };

    // Validate required fields
    if (!data.age || !data.glucose || !data.bmi) {
        showToast('Please fill in Age, Glucose, and BMI fields.', 'error');
        btn.classList.remove('loading');
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Prediction failed');
        }

        const result = await response.json();

        savePredictionLocally(data, result);
        displayResults(result);
        showToast('AI Analysis completed successfully!', 'success');
        updateHomeStats();
        loadDashboard();

    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        console.error('Prediction error:', error);
    } finally {
        btn.classList.remove('loading');
    }
}

function displayResults(result) {
    const section = document.getElementById('results-section');
    if (!section) return;
    section.classList.add('visible');

    // Scroll to results
    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    // ── Health Score Ring ──
    const scoreNumber = document.getElementById('score-number');
    const ringFill = document.getElementById('score-ring-fill');
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (result.health_score / 100) * circumference;

    let scoreColor = getScoreColor(result.health_score);
    if (ringFill) {
        ringFill.style.stroke = scoreColor;
        ringFill.style.strokeDashoffset = offset;
    }
    if (scoreNumber) animateCounter(scoreNumber, result.health_score);

    // ── Risk Badge ──
    const riskBadge = document.getElementById('risk-badge');
    const riskText = document.getElementById('risk-text');
    if (riskBadge) riskBadge.className = `risk-badge ${result.risk_level.toLowerCase()}`;
    if (riskText) riskText.textContent = `${result.risk_level} Risk`;

    // ── Summary ──
    const summaryEl = document.getElementById('result-summary');
    if (summaryEl) summaryEl.textContent = result.summary;

    // ── Probability Bar ──
    const probPercent = (result.risk_probability * 100).toFixed(1);
    const probValueEl = document.getElementById('probability-value');
    if (probValueEl) probValueEl.textContent = probPercent + '%';

    const probFill = document.getElementById('probability-fill');
    if (probFill) {
        let probColor;
        if (result.risk_probability < 0.3) probColor = 'var(--gradient-success)';
        else if (result.risk_probability < 0.5) probColor = 'var(--gradient-warning)';
        else probColor = 'var(--gradient-danger)';

        probFill.style.background = probColor;
        setTimeout(() => { probFill.style.width = probPercent + '%'; }, 100);
    }

    // ── Risk Factors ──
    const factorsGrid = document.getElementById('risk-factors-grid');
    if (factorsGrid) {
        factorsGrid.innerHTML = '';
        result.risk_factors.forEach(factor => {
            const card = document.createElement('div');
            card.className = 'risk-factor-card';
            card.innerHTML = `
                <div class="risk-factor-header">
                    <span class="risk-factor-name">${factor.factor}</span>
                    <span class="risk-factor-status ${factor.status}">${factor.status}</span>
                </div>
                <div class="risk-factor-value" style="color: ${getStatusColor(factor.status)}">${factor.value}</div>
                <p class="risk-factor-message">${factor.message}</p>
            `;
            factorsGrid.appendChild(card);
        });
    }

    // ── Recommendations ──
    const recsList = document.getElementById('recommendations-list');
    if (recsList) {
        recsList.innerHTML = '';
        result.recommendations.forEach(rec => {
            const text = rec.replace(/^[^\w\s]+\s*/, '');
            const li = document.createElement('li');
            li.className = 'recommendation-item';
            li.style.cssText = 'display: flex; align-items: flex-start; gap: 12px; padding: 12px; margin-bottom: 8px; border-radius: 8px; transition: background 0.2s;';
            li.onmouseover = () => li.style.background = 'rgba(16, 185, 129, 0.05)';
            li.onmouseout = () => li.style.background = 'transparent';

            li.innerHTML = `
                <span class="recommendation-icon" style="color: var(--primary-500); margin-top: 2px;">
                    <i data-lucide="lightbulb" style="width: 20px; height: 20px;"></i>
                </span>
                <span style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.5; font-weight: 500;">${text}</span>
            `;
            recsList.appendChild(li);
        });
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function getStatusColor(status) {
    const colors = { normal: '#10b981', warning: '#fbbf24', danger: '#f87171' };
    return colors[status] || '#94a3b8';
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 30);
}

function resetForm() {
    const form = document.getElementById('prediction-form');
    if (form) form.reset();
    const section = document.getElementById('results-section');
    if (section) section.classList.remove('visible');
    showToast('Form reset successfully', 'info');
}

// ────────────────────────────────────────
// Dashboard Logic
// ────────────────────────────────────────
function updateDashboardStats() {
    const total = dashboardDataStore.length;
    const highRisk = dashboardDataStore.filter(p => ['High', 'Critical'].includes(p.risk_level)).length;
    const lowRisk = total - highRisk;

    // Use Number() to ensure calculations are valid
    const avgScore = total > 0 ? (dashboardDataStore.reduce((acc, p) => acc + Number(p.health_score || 0), 0) / total).toFixed(1) : '—';
    const avgGlucose = total > 0 ? (dashboardDataStore.reduce((acc, p) => acc + Number(p.glucose || 0), 0) / total).toFixed(1) : '—';
    const avgBmi = total > 0 ? (dashboardDataStore.reduce((acc, p) => acc + Number(p.bmi || 0), 0) / total).toFixed(1) : '—';

    const els = {
        total: document.getElementById('dash-total'),
        high: document.getElementById('dash-high-risk'),
        low: document.getElementById('dash-low-risk'),
        avgScore: document.getElementById('dash-avg-score'),
        avgGlucose: document.getElementById('dash-avg-glucose'),
        avgBmi: document.getElementById('dash-avg-bmi')
    };

    if (els.total) animateCounter(els.total, total);
    if (els.high) animateCounter(els.high, highRisk);
    if (els.low) animateCounter(els.low, lowRisk);

    if (els.avgScore) els.avgScore.textContent = avgScore;
    if (els.avgGlucose) els.avgGlucose.textContent = avgGlucose;
    if (els.avgBmi) els.avgBmi.textContent = avgBmi;
}

async function loadDashboard() {
    try {
        const url = `${BACKEND_URL}/api/dashboard?device_id=${encodeURIComponent(getDeviceId())}`;
        console.log('[CodeCure] Fetching dashboard from:', url);
        
        const response = await fetch(url);
        
        // Check if response is OK and is JSON
        if (!response.ok) {
            console.error(`[CodeCure] Dashboard API returned status ${response.status}`);
            throw new Error(`API returned status ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('[CodeCure] Dashboard API returned non-JSON content:', contentType);
            console.error('[CodeCure] Possible causes: BACKEND_URL not set correctly, backend not running, or serving HTML instead of JSON');
            throw new Error('Dashboard API returned non-JSON response. Backend URL may be incorrect.');
        }
        
        const data = await response.json();

        // Merge with Local History for Serverless Persistence
        const localHistory = getLocalHistory();
        const serverRecordIds = new Set((data.recent_predictions || []).map(p => p.id));
        const uniqueLocal = localHistory.filter(p => !serverRecordIds.has(p.id));

        dashboardDataStore = [...(data.recent_predictions || []), ...uniqueLocal].sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        console.log('[CodeCure] Dashboard loaded successfully:', dashboardDataStore.length, 'records');

        updateDashboardStats();

        const container = document.getElementById('patients-table-container');
        if (container) renderDashboardTable(container);

    } catch (error) {
        console.error('[CodeCure] Dashboard error:', error.message);
        console.warn('[CodeCure] Using local history as fallback');
        
        const localHistory = getLocalHistory();
        dashboardDataStore = localHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        updateDashboardStats();

        const container = document.getElementById('patients-table-container');
        if (container) renderDashboardTable(container);
    }
}

function renderDashboardTable(container) {
    if (dashboardDataStore.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i data-lucide="database-backup"></i></div>
                <p class="empty-state-text">No predictions yet</p>
                <p class="empty-state-hint">Run an AI analysis to see patient data here</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    let tableHTML = `
        <div class="patients-table-wrapper">
            <table class="patients-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Name</th><th>Age</th><th>Glucose</th><th>BMI</th>
                        <th>Health Score</th><th>Risk Level</th><th>Date & Time</th><th>Action</th>
                    </tr>
                </thead>
                <tbody>
    `;

    dashboardDataStore.forEach(p => {
        const riskClass = (p.risk_level || 'low').toLowerCase();

        // Detailed Date & Time format as requested
        const dateObj = new Date(p.created_at);
        const dateStr = dateObj.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        const timeStr = dateObj.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });

        tableHTML += `
            <tr>
                <td style="font-family: 'JetBrains Mono', monospace; color: var(--text-muted);">#${p.id}</td>
                <td style="font-weight: 500; color: var(--text-primary);">${p.name || 'Anonymous'}</td>
                <td>${p.age}</td>
                <td style="font-family: 'JetBrains Mono', monospace;">${p.glucose}</td>
                <td style="font-family: 'JetBrains Mono', monospace;">${p.bmi}</td>
                <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${p.health_score || '—'}</td>
                <td><span class="table-badge ${riskClass}">${p.risk_level || '—'}</span></td>
                <td>
                    <div style="font-size: 0.9rem; color: var(--text-primary);">${dateStr}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${timeStr}</div>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="action-btn" onclick="showPatientSummary(${p.id})" title="View Details" style="background: var(--bg-secondary); color: var(--primary-600);">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="action-btn download" onclick="downloadDashboardPDF(${p.id})" title="Download Report">
                            <i data-lucide="download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table></div>';
    container.innerHTML = tableHTML;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ────────────────────────────────────────
// Modal Handlers
// ────────────────────────────────────────
function showPatientSummary(patientId) {
    const patient = dashboardDataStore.find(p => p.id === patientId);
    if (!patient) return;

    document.getElementById('modal-name').textContent = patient.name || 'Anonymous Patient';
    const dateObj = new Date(patient.created_at);
    const dateStr = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    const timeStr = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });
    document.getElementById('modal-date').textContent = `Analyzed on ${dateStr} at ${timeStr}`;

    document.getElementById('modal-glucose').textContent = patient.glucose + ' mg/dL';
    document.getElementById('modal-bmi').textContent = patient.bmi + ' kg/m²';
    document.getElementById('modal-score').textContent = patient.health_score + '/100';

    const riskEl = document.getElementById('modal-risk');
    riskEl.textContent = patient.risk_level || 'Unknown';
    riskEl.className = 'table-badge ' + (patient.risk_level || 'low').toLowerCase();

    const summary = patient.summary || `Based on a glucose level of ${patient.glucose} and a BMI of ${patient.bmi}, the AI has categorized this patient as ${patient.risk_level}. Further medical consultation is advised.`;
    document.getElementById('modal-summary').textContent = summary;

    document.getElementById('patient-modal').classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeModal() {
    const modal = document.getElementById('patient-modal');
    if (modal) modal.classList.remove('active');
}

// ────────────────────────────────────────
// Home Stats
// ────────────────────────────────────────
async function updateHomeStats() {
    try {
        const url = `${BACKEND_URL}/api/dashboard?device_id=${encodeURIComponent(getDeviceId())}`;
        const response = await fetch(url);
        let serverTotal = 0;
        let serverPredictions = [];

        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                serverTotal = data.total_patients || 0;
                serverPredictions = data.recent_predictions || [];
            } else {
                console.warn('[CodeCure] Dashboard API returned non-JSON response');
            }
        }

        const localHistory = getLocalHistory();
        const serverRecordIds = new Set(serverPredictions.map(p => p.id));
        const uniqueLocalCount = localHistory.filter(p => !serverRecordIds.has(p.id)).length;

        const total = Math.max(serverTotal, serverPredictions.length) + uniqueLocalCount;

        const statEl = document.getElementById('stat-total');
        if (statEl) statEl.textContent = total;
    } catch (e) {
        console.error('[CodeCure] Home stats error:', e.message);
        const localHistory = getLocalHistory();
        const statEl = document.getElementById('stat-total');
        if (statEl) statEl.textContent = localHistory.length;
    }
}

// ────────────────────────────────────────
// PDF Generation Engine
// ────────────────────────────────────────
async function downloadDashboardPDF(id) {
    const result = dashboardDataStore.find(p => p.id === id);
    if (!result) {
        showToast('Record not found', 'error');
        return;
    }

    // Collect health metrics from stored data
    const metrics = {
        'Glucose Level': (result.glucose || '—') + ' mg/dL',
        'Blood Pressure': (result.blood_pressure || '—') + ' mmHg',
        'BMI': (result.bmi || '—') + ' kg/m²',
        'Insulin Level': (result.insulin || '—') + ' mIU/L',
        'Skin Thickness': (result.skin_thickness || '—') + ' mm',
        'Diabetes Pedigree': (result.diabetes_pedigree || '—'),
        'Age': (result.age || '—') + ' years',
        'Pregnancies': (result.pregnancies || '0'),
        'Exercise Hours/Week': (result.exercise_hours || '0') + ' hrs',
        'Sleep Hours/Night': (result.sleep_hours || '7') + ' hrs'
    };

    const data = {
        name: result.name || 'Anonymous',
        email: result.email || 'Patient Record #' + result.id,
        age: result.age || 'N/A',
        gender: result.gender || 'Not specified',
        score: result.health_score || 0,
        risk: result.risk_level || 'Unknown',
        summary: result.summary || `AI Diabetes Risk Assessment Report for Patient #${result.id}.`,
        probability: (result.risk_probability ? (result.risk_probability * 100).toFixed(1) : '—') + '%',
        metrics: metrics,
        factors: [
            {
                name: 'Glucose Level',
                value: result.glucose || '—',
                message: `Blood glucose: ${result.glucose} mg/dL. ${result.glucose > 126 ? '[ELEVATED]' : 'Normal'}`,
                status: result.glucose > 140 ? 'danger' : result.glucose > 126 ? 'warning' : 'normal'
            },
            {
                name: 'BMI',
                value: result.bmi || '—',
                message: `Body Mass Index: ${result.bmi} kg/m². ${result.bmi > 30 ? 'Indicates obesity' : 'Within acceptable range'}`,
                status: result.bmi > 30 ? 'danger' : result.bmi > 25 ? 'warning' : 'normal'
            },
            {
                name: 'Blood Pressure',
                value: result.blood_pressure || '—',
                message: `Diastolic: ${result.blood_pressure} mmHg. ${result.blood_pressure > 90 ? '[ELEVATED]' : 'Normal'}`,
                status: result.blood_pressure > 90 ? 'danger' : result.blood_pressure > 80 ? 'warning' : 'normal'
            },
            {
                name: 'Insulin Level',
                value: result.insulin || '—',
                message: `Insulin: ${result.insulin} mIU/L. Reference: 2.6-24.9 mIU/L`,
                status: result.insulin > 24.9 ? 'warning' : 'normal'
            },
            {
                name: 'Diabetes Pedigree',
                value: result.diabetes_pedigree || '—',
                message: 'Family history factor in genetic risk assessment',
                status: result.diabetes_pedigree > 0.5 ? 'warning' : 'normal'
            }
        ],
        recommendations: [
            'Maintain regular medical check-ups',
            'Monitor blood glucose levels regularly',
            'Engage in at least 150 minutes of moderate exercise per week',
            'Maintain a balanced, low-glycemic diet',
            'Aim for 7-9 hours of quality sleep per night',
            'Reduce stress through meditation or relaxation techniques',
            'Consult with a diabetes specialist or endocrinologist',
            'Consider lifestyle modification programs if at high risk'
        ]
    };
    generatePDFReport(data);
}

function downloadPDF() {
    const scoreEl = document.getElementById('score-number');
    if (!scoreEl || scoreEl.innerText === '—') {
        showToast('Please run an AI analysis first.', 'error');
        return;
    }

    // Collect health metrics from form
    const metrics = {
        'Glucose Level': ((document.getElementById('input-glucose') && document.getElementById('input-glucose').value) || '—') + ' mg/dL',
        'Blood Pressure': ((document.getElementById('input-bp') && document.getElementById('input-bp').value) || '—') + ' mmHg',
        'BMI': ((document.getElementById('input-bmi') && document.getElementById('input-bmi').value) || '—') + ' kg/m²',
        'Insulin Level': ((document.getElementById('input-insulin') && document.getElementById('input-insulin').value) || '—') + ' mIU/L',
        'Skin Thickness': ((document.getElementById('input-skin') && document.getElementById('input-skin').value) || '—') + ' mm',
        'Diabetes Pedigree': ((document.getElementById('input-dpf') && document.getElementById('input-dpf').value) || '—'),
        'Age': ((document.getElementById('input-age') && document.getElementById('input-age').value) || '—') + ' years',
        'Pregnancies': ((document.getElementById('input-pregnancies') && document.getElementById('input-pregnancies').value) || '0'),
        'Exercise Hours/Week': ((document.getElementById('input-exercise') && document.getElementById('input-exercise').value) || '0') + ' hrs',
        'Sleep Hours/Night': ((document.getElementById('input-sleep') && document.getElementById('input-sleep').value) || '7') + ' hrs'
    };

    const data = {
        name: document.getElementById('input-name').value || 'Patient',
        email: document.getElementById('input-email').value || 'Not provided',
        age: (document.getElementById('input-age') && document.getElementById('input-age').value) || 'N/A',
        gender: (document.getElementById('input-gender') && document.getElementById('input-gender').value) || 'Not specified',
        score: scoreEl.innerText,
        risk: document.getElementById('risk-text').innerText,
        summary: document.getElementById('result-summary').innerText,
        probability: document.getElementById('probability-value').innerText,
        metrics: metrics,
        factors: Array.from(document.querySelectorAll('.risk-factor-card')).map(card => ({
            name: card.querySelector('.risk-factor-name').innerText,
            value: card.querySelector('.risk-factor-value').innerText,
            message: (card.querySelector('.risk-factor-message') && card.querySelector('.risk-factor-message').innerText) || card.querySelector('.risk-factor-name').innerText,
            status: card.querySelector('.risk-factor-status').innerText.toLowerCase().replace('risk ', '')
        })),
        recommendations: Array.from(document.querySelectorAll('.recommendation-item span:last-child')).map(rec => rec.innerText)
    };
    generatePDFReport(data);
}

function generatePDFReport(data) {
    const score = parseInt(data.score) || 0;
    const scoreColor = getScoreColor(score);
    const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const reportID = '#CC' + Date.now().toString().slice(-10);

    showToast('Generating PDF Report...', 'info');

    // PAGE 1: Patient Info + Health Metrics + Risk Factors
    const page1Content = document.createElement('div');
    page1Content.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:800px;background:white;padding:40px;font-family:Arial,sans-serif;';

    page1Content.innerHTML = `
        <div style="text-align:center;margin-bottom:25px;border-bottom:3px solid ${scoreColor};padding-bottom:15px;">
            <h1 style="color:${scoreColor};margin:0;font-size:36px;font-weight:bold;">CodeCure</h1>
            <p style="color:#666;margin:3px 0 0 0;font-size:12px;">AI Diabetes Risk Assessment Report</p>
        </div>

        <div style="background:${scoreColor}15;border:2px solid ${scoreColor};border-radius:8px;padding:15px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <div style="flex:1;">
                    <h2 style="margin:0 0 8px 0;font-size:24px;color:#333;font-weight:bold;">${data.risk} Risk</h2>
                    <p style="margin:0;font-size:13px;color:#666;">Probability: <strong style="color:${scoreColor};">${data.probability}</strong></p>
                </div>
                <div style="background:${scoreColor};color:white;width:80px;height:80px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0;">
                    <span style="font-size:32px;">${score}</span>
                    <span style="font-size:12px;">/100</span>
                </div>
            </div>
            <p style="margin:0;padding:8px;background:white;border-left:3px solid ${scoreColor};border-radius:4px;font-size:11px;color:#333;line-height:1.5;">${data.summary}</p>
        </div>

        <h3 style="margin:15px 0 12px 0;font-size:13px;color:#333;font-weight:bold;border-bottom:2px solid #ddd;padding-bottom:6px;text-transform:uppercase;">Patient Information</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:10px;">
            <tr style="background:#f8f8f8;">
                <td style="padding:6px;border:1px solid #ddd;font-weight:bold;width:25%;">Name</td>
                <td style="padding:6px;border:1px solid #ddd;width:25%;">${data.name}</td>
                <td style="padding:6px;border:1px solid #ddd;font-weight:bold;width:25%;">Email</td>
                <td style="padding:6px;border:1px solid #ddd;width:25%;">${data.email || 'N/A'}</td>
            </tr>
            <tr>
                <td style="padding:6px;border:1px solid #ddd;font-weight:bold;">Age</td>
                <td style="padding:6px;border:1px solid #ddd;">${data.age}</td>
                <td style="padding:6px;border:1px solid #ddd;font-weight:bold;">Gender</td>
                <td style="padding:6px;border:1px solid #ddd;">${data.gender}</td>
            </tr>
        </table>

        <h3 style="margin:15px 0 12px 0;font-size:13px;color:#333;font-weight:bold;border-bottom:2px solid #ddd;padding-bottom:6px;text-transform:uppercase;">Health Metrics</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:10px;">
            <tr style="background:#f8f8f8;">
                <td style="padding:6px;border:1px solid #ddd;font-weight:bold;width:50%;">Metric</td>
                <td style="padding:6px;border:1px solid #ddd;font-weight:bold;width:50%;">Value</td>
            </tr>
            ${Object.entries(data.metrics || {}).map(([key, val]) => `
                <tr>
                    <td style="padding:6px;border:1px solid #ddd;">${key}</td>
                    <td style="padding:6px;border:1px solid #ddd;font-weight:bold;">${val}</td>
                </tr>
            `).join('')}
        </table>

        ${data.factors && data.factors.length > 0 ? `
            <h3 style="margin:15px 0 12px 0;font-size:13px;color:#333;font-weight:bold;border-bottom:2px solid #ddd;padding-bottom:6px;text-transform:uppercase;">Risk Factors</h3>
            ${data.factors.slice(0, 5).map(f => {
        const statusColor = f.status === 'danger' ? '#ef4444' : f.status === 'warning' ? '#f59e0b' : '#10b981';
        const bgColor = f.status === 'danger' ? '#fef2f2' : f.status === 'warning' ? '#fffbeb' : '#f0fdf4';
        return `
                    <div style="border-left:3px solid ${statusColor};background:${bgColor};padding:8px;margin-bottom:6px;border-radius:3px;font-size:10px;">
                        <div style="font-weight:bold;color:#333;margin-bottom:2px;display:flex;justify-content:space-between;">
                            <span>${f.name}</span>
                            <span style="color:${statusColor};text-transform:uppercase;font-size:9px;">${f.status}</span>
                        </div>
                        <p style="margin:0;color:#555;line-height:1.4;">${f.message}</p>
                    </div>
                `;
    }).join('')}
        ` : ''}
    `;

    document.body.appendChild(page1Content);

    // PAGE 2: Recommendations + Disclaimer
    const page2Content = document.createElement('div');
    page2Content.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:800px;height:1050px;background:white;padding:40px;font-family:Arial,sans-serif;display:flex;flex-direction:column;box-sizing:border-box;';

    page2Content.innerHTML = `
        <div style="text-align:center;margin-bottom:25px;border-bottom:3px solid ${scoreColor};padding-bottom:15px;flex-shrink:0;">
            <h1 style="color:${scoreColor};margin:0;font-size:36px;font-weight:bold;">CodeCure</h1>
            <p style="color:#666;margin:3px 0 0 0;font-size:12px;">Personalized Health Recommendations</p>
        </div>

        <h2 style="margin:0 0 15px 0;font-size:16px;color:#333;font-weight:bold;flex-shrink:0;">Health Recommendations</h2>

        <div style="flex:1;overflow:hidden;">
            ${data.recommendations && data.recommendations.length > 0 ? `
                <ul style="margin:0 0 20px 0;padding:0 0 0 18px;font-size:11px;color:#333;line-height:1.7;">
                    ${data.recommendations.slice(0, 15).map(rec => `<li style="margin:6px 0;">${rec}</li>`).join('')}
                </ul>
            ` : '<p style="font-size:11px;color:#666;">No specific recommendations available.</p>'}
        </div>

        <div style="flex-shrink:0;border-top:2px solid #ddd;padding-top:12px;margin-top:auto;font-size:9px;">
            <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:8px;border-radius:4px;margin-bottom:12px;color:#78350f;line-height:1.6;">
                <strong>[DISCLAIMER]</strong> This is an AI assessment for informational purposes only and is NOT a medical diagnosis. Always consult with a qualified healthcare professional before making any medical decisions.
            </div>
            <div style="display:flex;justify-content:space-between;color:#999;">
                <span>&copy; 2026 CodeCure AI</span>
                <span>${reportID}</span>
                <span>${timestamp}</span>
            </div>
        </div>
    `;

    document.body.appendChild(page2Content);

    // Render and save PDF with proper page management
    setTimeout(async () => {
        try {
            const canvas1 = await html2canvas(page1Content, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            const canvas2 = await html2canvas(page2Content, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
            const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);

            const pdf = new (window.jsPDF || window.jspdf.jsPDF)({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 0;

            // Add Page 1
            const imgHeight1 = (canvas1.height * pageWidth) / canvas1.width;
            pdf.addImage(imgData1, 'JPEG', margin, margin, pageWidth, Math.min(imgHeight1, pageHeight));

            // Add Page 2
            pdf.addPage();
            const imgHeight2 = (canvas2.height * pageWidth) / canvas2.width;
            pdf.addImage(imgData2, 'JPEG', margin, margin, pageWidth, Math.min(imgHeight2, pageHeight));

            pdf.save(`CodeCure_Report_${data.name || 'Patient'}_${Date.now()}.pdf`);
            showToast('Report downloaded successfully!', 'success');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            showToast('PDF generation failed. Please try again.', 'error');
        } finally {
            if (document.body.contains(page1Content)) {
                document.body.removeChild(page1Content);
            }
            if (document.body.contains(page2Content)) {
                document.body.removeChild(page2Content);
            }
        }
    }, 300);
}

function getScoreColor(score) {
    const s = parseInt(score);
    if (s >= 70) return '#10b981';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
}

function initSlideshows() {
    document.querySelectorAll('.hero-slideshow').forEach(container => {
        const slides = container.querySelectorAll('.slide');
        if (slides.length <= 1) return;
        let idx = 0;
        setInterval(() => {
            slides[idx].classList.remove('active');
            idx = (idx + 1) % slides.length;
            slides[idx].classList.add('active');
        }, 5000);
    });
}

// ────────────────────────────────────────
// Chatbot Logic with GROQ API Integration
// ────────────────────────────────────────
// API key is injected from backend via HTML template environment variable
// window.ENV.GROQ_API_KEY is set in templates/index.html
const GROQ_API_KEY = (window.ENV && window.ENV.GROQ_API_KEY) || '';  // Safely access from window.ENV
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Log API key status for debugging
if (typeof window !== 'undefined') {
    console.log('[CodeCure] Chatbot initialized. GROQ API Key available:', !!GROQ_API_KEY);
    if (GROQ_API_KEY) {
        console.log('[CodeCure] Using GROQ API for intelligent responses');
    } else {
        console.log('[CodeCure] GROQ_API_KEY not set. Using local knowledge base only.');
    }
}

async function loadKnowledgeBase() {
    try {
        const response = await fetch('/static/codecure_kb.json');
        if (response.ok) knowledgeBase = await response.json();
    } catch (e) { console.error("KB Load Error:", e); }
}

function toggleChat() {
    const container = document.getElementById('chatbot-container');
    if (container) {
        container.classList.toggle('active');
        if (container.classList.contains('active')) document.getElementById('chat-input').focus();
    }
}

function getChatTranscript() {
    const messages = document.querySelectorAll('#chat-messages .message');
    const lines = [];

    messages.forEach(message => {
        if (message.classList.contains('typing')) return;

        const role = message.dataset.role || (message.classList.contains('user-message') ? 'User' : 'Assistant');
        const text = (message.dataset.rawText || message.innerText || '').trim();

        if (text) {
            lines.push(`${role}: ${text}`);
        }
    });

    return lines.join('\n\n');
}

async function copyChat() {
    const transcript = getChatTranscript();
    if (!transcript) {
        showToast('Nothing to copy yet.', 'info');
        return;
    }

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(transcript);
        } else {
            const fallback = document.createElement('textarea');
            fallback.value = transcript;
            fallback.style.position = 'fixed';
            fallback.style.left = '-9999px';
            document.body.appendChild(fallback);
            fallback.select();
            document.execCommand('copy');
            document.body.removeChild(fallback);
        }

        showToast('Chat copied to clipboard.', 'success');
    } catch (error) {
        console.error('Copy chat failed:', error);
        showToast('Could not copy chat.', 'error');
    }
}

function exportChatTxt() {
    const transcript = getChatTranscript();
    if (!transcript) {
        showToast('Nothing to export yet.', 'info');
        return;
    }

    const content = [
        'CodeCure Chat Transcript',
        `Generated: ${new Date().toLocaleString()}`,
        '',
        transcript
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CodeCure_Chat_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Chat exported as txt.', 'success');
}

function deleteChat() {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    messages.innerHTML = '';
    showToast('Chat deleted.', 'success');
}

// Close chatbot when clicking outside
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (event) {
        const chatbotContainer = document.getElementById('chatbot-container');
        const chatFab = document.querySelector('.chat-fab');
        const minimizeBtn = document.querySelector('.chatbot-minimize');

        if (chatbotContainer && chatbotContainer.classList.contains('active') &&
            !chatbotContainer.contains(event.target) &&
            (!chatFab || !chatFab.contains(event.target)) &&
            (!minimizeBtn || !minimizeBtn.contains(event.target))) {
            chatbotContainer.classList.remove('active');
        }
    });
});

function handleChatKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    if (!input || !messages) return;
    const query = input.value.trim();
    if (!query) return;

    addMessage(query, 'user');
    input.value = '';

    const typing = document.createElement('div');
    typing.className = 'message bot-message typing';
    typing.innerText = 'Analyzing...';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    try {
        const answer = await getAIResponse(query);
        messages.removeChild(typing);
        addMessage(answer, 'bot');
    } catch (error) {
        console.error('Chat error:', error);
        messages.removeChild(typing);
        addMessage('I encountered an error. Please try again.', 'bot');
    }
}

async function getAIResponse(query) {
    const q = query.toLowerCase().trim();

    // Greeting responses - short, non-specific
    if (['hello', 'hi', 'hey'].some(g => q.includes(g)) || q.length < 3)
        return "Hello! I'm your CodeCure AI assistant. I can help you with questions about CodeCure, diabetes prediction, our creators (Babin Bid and Debasmita Bose), and our platform. What would you like to know?";

    // Try GROQ API for ALL questions via backend
    try {
        console.log('[CodeCure] Attempting to reach backend chatbot endpoint...');
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query
            })
        });

        console.log(`[CodeCure] Backend response status: ${response.status}`);

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.response) {
                console.log('[CodeCure] ✅ Using GROQ API response (via backend)');
                return data.response.trim();
            } else {
                console.warn('[CodeCure] ⚠️ Backend returned error:', data.error || data.details);
            }
        } else {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            console.warn(`[CodeCure] ⚠️ Backend error ${response.status}:`, errorData);
        }
    } catch (error) {
        console.warn('[CodeCure] ⚠️ Backend fetch failed:', error.message);
    }

    console.log('[CodeCure] Falling back to local knowledge base');

    // Fallback to local knowledge base
    let bestMatch = null, maxScore = 0;
    knowledgeBase.forEach(item => {
        let score = 0;
        if (item.keywords) item.keywords.forEach(kw => { if (new RegExp(`\\b${kw}\\b`, 'i').test(q)) score += 3; });
        if (score > maxScore) { maxScore = score; bestMatch = item.answer; }
    });

    if (bestMatch && maxScore > 1) return bestMatch;
    return "I'm not sure about that specific detail. Could you please rephrase your question? I'm here to help with CodeCure platform questions!";
}

function renderMarkdown(text) {
    // Escape HTML special characters first
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Convert [link text](url) to <a> tags
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #10b981; text-decoration: underline; cursor: pointer;">$1</a>');

    // Convert **bold text** to <strong> tags
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 600; color: #065f46;">$1</strong>');

    // Convert *italic text* to <em> tags
    html = html.replace(/\*([^*]+)\*/g, '<em style="font-style: italic; color: #047857;">$1</em>');

    // Convert line breaks to <br> tags
    html = html.replace(/\n/g, '<br>');

    return html;
}

function addMessage(text, type) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;
    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    div.dataset.role = type === 'user' ? 'User' : 'Assistant';
    div.dataset.rawText = text;

    // Render markdown for AI/bot responses, plain text for user messages
    if (type === 'bot' || type === 'ai') {
        div.innerHTML = renderMarkdown(text);
    } else {
        div.innerText = text;
    }

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
