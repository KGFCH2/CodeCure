// ═══════════════ CODECURE CORE JAVASCRIPT ═══════════════
// Handles: AI Predictions, Dashboard Analytics, Chatbot, and PDF Generation

// Get backend URL from configuration helper or template injection
// Supports: Local backend, Vercel frontend, hybrid deployments
const BACKEND_URL = typeof window !== 'undefined' && window.BACKEND_URL_CONFIG
    ? window.BACKEND_URL_CONFIG
    : (window.ENV?.BACKEND_URL || 'http://localhost:8000');

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
    // NOTE: updateHomeStats() is intentionally NOT called here to ensure a clean state
    // on first visit. User stats will update only after they perform a prediction.
    initSlideshows();
    loadKnowledgeBase();

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
        id = (crypto?.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`);
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
        const response = await fetch(`${BACKEND_URL}/api/dashboard?device_id=${encodeURIComponent(getDeviceId())}`);
        const data = await response.json();

        // Merge with Local History for Serverless Persistence
        const localHistory = getLocalHistory();
        const serverRecordIds = new Set((data.recent_predictions || []).map(p => p.id));
        const uniqueLocal = localHistory.filter(p => !serverRecordIds.has(p.id));

        dashboardDataStore = [...(data.recent_predictions || []), ...uniqueLocal].sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        updateDashboardStats();

        const container = document.getElementById('patients-table-container');
        if (container) renderDashboardTable(container);

    } catch (error) {
        console.error('Dashboard error:', error);
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
        const response = await fetch(`${BACKEND_URL}/api/dashboard?device_id=${encodeURIComponent(getDeviceId())}`);
        let serverTotal = 0;
        let serverPredictions = [];

        if (response.ok) {
            const data = await response.json();
            serverTotal = data.total_patients || 0;
            serverPredictions = data.recent_predictions || [];
        }

        const localHistory = getLocalHistory();
        const serverRecordIds = new Set(serverPredictions.map(p => p.id));
        const uniqueLocalCount = localHistory.filter(p => !serverRecordIds.has(p.id)).length;

        const total = Math.max(serverTotal, serverPredictions.length) + uniqueLocalCount;

        const statEl = document.getElementById('stat-total');
        if (statEl) statEl.textContent = total;
    } catch (e) {
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
        'Glucose Level': (document.getElementById('input-glucose')?.value || '—') + ' mg/dL',
        'Blood Pressure': (document.getElementById('input-blood-pressure')?.value || '—') + ' mmHg',
        'BMI': (document.getElementById('input-bmi')?.value || '—') + ' kg/m²',
        'Insulin Level': (document.getElementById('input-insulin')?.value || '—') + ' mIU/L',
        'Skin Thickness': (document.getElementById('input-skin-thickness')?.value || '—') + ' mm',
        'Diabetes Pedigree': (document.getElementById('input-diabetes-pedigree')?.value || '—'),
        'Age': (document.getElementById('input-age')?.value || '—') + ' years',
        'Pregnancies': (document.getElementById('input-pregnancies')?.value || '0'),
        'Exercise Hours/Week': (document.getElementById('input-exercise-hours')?.value || '0') + ' hrs',
        'Sleep Hours/Night': (document.getElementById('input-sleep-hours')?.value || '7') + ' hrs'
    };

    const data = {
        name: document.getElementById('input-name').value || 'Patient',
        email: document.getElementById('input-email').value || 'Not provided',
        age: document.getElementById('input-age')?.value || 'N/A',
        gender: document.getElementById('input-gender')?.value || 'Not specified',
        score: scoreEl.innerText,
        risk: document.getElementById('risk-text').innerText,
        summary: document.getElementById('result-summary').innerText,
        probability: document.getElementById('probability-value').innerText,
        metrics: metrics,
        factors: Array.from(document.querySelectorAll('.risk-factor-card')).map(card => ({
            name: card.querySelector('.risk-factor-name').innerText,
            value: card.querySelector('.risk-factor-value').innerText,
            message: card.querySelector('.risk-factor-message')?.innerText || card.querySelector('.risk-factor-name').innerText,
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

    // Create HTML canvas for rendering
    const htmlContent = document.createElement('div');
    htmlContent.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:800px;background:white;padding:40px;font-family:Arial,sans-serif;';

    htmlContent.innerHTML = `
        <div style="text-align:center;margin-bottom:30px;border-bottom:3px solid ${scoreColor};padding-bottom:20px;">
            <h1 style="color:${scoreColor};margin:0;font-size:40px;font-weight:bold;">CodeCure</h1>
            <p style="color:#666;margin:5px 0 0 0;font-size:14px;">AI Diabetes Risk Assessment Platform</p>
        </div>

        <div style="background:${scoreColor}15;border:2px solid ${scoreColor};border-radius:8px;padding:20px;margin-bottom:25px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;">
                <div>
                    <h2 style="margin:0 0 10px 0;font-size:28px;color:#333;font-weight:bold;">${data.risk} Risk</h2>
                    <p style="margin:0;font-size:14px;color:#666;">Diabetes Probability: <strong style="color:${scoreColor};font-size:16px;">${data.probability}</strong></p>
                </div>
                <div style="text-align:center;">
                    <div style="background:${scoreColor};color:white;width:100px;height:100px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:bold;">
                        <span style="font-size:40px;">${score}</span>
                        <span style="font-size:14px;margin-top:5px;">/100</span>
                    </div>
                </div>
            </div>
            <p style="margin:0;padding:10px;background:white;border-left:3px solid ${scoreColor};border-radius:4px;font-size:12px;color:#333;">${data.summary}</p>
        </div>

        <h3 style="margin:20px 0 15px 0;font-size:14px;color:#333;font-weight:bold;border-bottom:2px solid #ddd;padding-bottom:8px;text-transform:uppercase;">Patient Information</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:25px;font-size:11px;">
            <tr style="background:#f8f8f8;">
                <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td>
                <td style="padding:8px;border:1px solid #ddd;">${data.name}</td>
                <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td>
                <td style="padding:8px;border:1px solid #ddd;">${data.email}</td>
            </tr>
            <tr>
                <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Age</td>
                <td style="padding:8px;border:1px solid #ddd;">${data.age}</td>
                <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Gender</td>
                <td style="padding:8px;border:1px solid #ddd;">${data.gender}</td>
            </tr>
        </table>

        <h3 style="margin:20px 0 15px 0;font-size:14px;color:#333;font-weight:bold;border-bottom:2px solid #ddd;padding-bottom:8px;text-transform:uppercase;">Health Metrics</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:25px;font-size:11px;">
            <tr style="background:#f8f8f8;">
                <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Metric</td>
                <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Value</td>
            </tr>
            ${Object.entries(data.metrics || {}).map(([key, val]) => `
                <tr>
                    <td style="padding:8px;border:1px solid #ddd;">${key}</td>
                    <td style="padding:8px;border:1px solid #ddd;">${val}</td>
                </tr>
            `).join('')}
        </table>

        ${data.factors && data.factors.length > 0 ? `
            <h3 style="margin:20px 0 15px 0;font-size:14px;color:#333;font-weight:bold;border-bottom:2px solid #ddd;padding-bottom:8px;text-transform:uppercase;">Risk Factor Analysis</h3>
            ${data.factors.slice(0, 6).map(f => {
        const statusColor = f.status === 'danger' ? '#ff4444' : f.status === 'warning' ? '#ffaa00' : '#00aa00';
        const bgColor = f.status === 'danger' ? '#ffeeee' : f.status === 'warning' ? '#fffaee' : '#eeffee';
        return `
                    <div style="border-left:4px solid ${statusColor};background:${bgColor};padding:10px;margin-bottom:8px;border-radius:4px;font-size:11px;">
                        <div style="font-weight:bold;color:#333;margin-bottom:4px;display:flex;justify-content:space-between;">
                            <span>${f.name}</span>
                            <span style="color:${statusColor};text-transform:uppercase;">${f.status}</span>
                        </div>
                        <p style="margin:0;color:#666;">${f.message}</p>
                    </div>
                `;
    }).join('')}
        ` : ''}

        ${data.recommendations && data.recommendations.length > 0 ? `
            <h3 style="margin:20px 0 15px 0;font-size:14px;color:#333;font-weight:bold;border-bottom:2px solid #ddd;padding-bottom:8px;text-transform:uppercase;">Recommendations</h3>
            <ul style="margin:0;padding:0 0 0 20px;font-size:11px;color:#333;line-height:1.6;">
                ${data.recommendations.slice(0, 8).map(rec => `<li style="margin:4px 0;">${rec}</li>`).join('')}
            </ul>
        ` : ''}

        <div style="border-top:2px solid #ddd;padding-top:15px;margin-top:25px;font-size:10px;">
            <div style="background:#fff3cd;border-left:4px solid #{f59e0b};padding:10px;border-radius:4px;margin-bottom:12px;">
                <strong style="color:#856404;">[DISCLAIMER]</strong> <span style="color:#856404;">This is an AI assessment for informational purposes only. NOT a medical diagnosis. Always consult a healthcare professional.</span>
            </div>
            <div style="display:flex;justify-content:space-between;color:#999;">
                <span>&copy; 2026 CodeCure AI Platform</span>
                <span>Report ID: ${reportID}</span>
                <span>Generated: ${timestamp}</span>
            </div>
        </div>
    `;

    document.body.appendChild(htmlContent);

    // Use html2canvas and jsPDF for better rendering
    setTimeout(async () => {
        try {
            const canvas = await html2canvas(htmlContent, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new (window.jsPDF || window.jspdf.jsPDF)({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`CodeCure_Report_${data.name || 'Patient'}_${Date.now()}.pdf`);
            showToast('Report downloaded successfully!', 'success');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            showToast('PDF generation failed. Please try again.', 'error');
        } finally {
            if (document.body.contains(htmlContent)) {
                document.body.removeChild(htmlContent);
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
}

// ────────────────────────────────────────
// Chatbot Logic with GROQ API Integration
// ────────────────────────────────────────
// API key is injected from backend via HTML template environment variable
// window.ENV.GROQ_API_KEY is set in templates/index.html
const GROQ_API_KEY = window.ENV?.GROQ_API_KEY || '';  // Safely access from window.ENV
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

function handleChatKey(event) { if (event.key === 'Enter') sendChatMessage(); }

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

    // Greeting responses
    if (['hello', 'hi', 'hey'].some(g => q.includes(g)) || q.length < 3)
        return "Hello! I'm your CodeCure AI assistant. I can help you with questions about CodeCure, diabetes prediction, our creators (Babin Bid and Debasmita Bose), and our platform. What would you like to know?";

    // Check if question is CodeCure-related
    const codecureKeywords = ['codecure', 'health', 'diabetes', 'predict', 'report', 'dashboard', 'ai', 'bmi', 'glucose', 'risk', 'babin', 'debasmita', 'bose', 'bid', 'creator', 'founder', 'developer', 'team', 'platform', 'medical', 'prediction', 'assessment'];
    const isCodeCureRelated = codecureKeywords.some(k => q.includes(k));

    if (!isCodeCureRelated) {
        return "I'm specialized only in CodeCure-related queries. I can answer questions about diabetes prediction, health metrics, our AI platform, or our creators Babin Bid and Debasmita Bose. What would you like to know?";
    }

    // Try GROQ API for CodeCure-related questions
    if (GROQ_API_KEY) {
        try {
            const systemPrompt = `You are CodeCure's AI Health Assistant. CodeCure is an AI-powered Diabetes Risk Prediction Platform created by Babin Bid and Debasmita Bose. 
            
Key Information:
- CodeCure predicts diabetes risk using 8 clinical metrics: Glucose Level, Blood Pressure, BMI, Insulin Level, Skin Thickness, Diabetes Pedigree Function, Age, and Pregnancy History
- The platform provides an AI Health Score (0-100) and diabetes probability
- Creators: Babin Bid and Debasmita Bose
- Deployed on Vercel at https://codecure.vercel.app
- Features: AI predictions, professional PDF reports, health analytics dashboard, AI chatbot assistant

Please answer user questions about CodeCure, diabetes prediction, health metrics, and the platform's features. Keep responses concise (2-3 sentences for brief questions, 3-4 for detailed ones). Always mention the creators when asked about them.`;

            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'mixtral-8x7b-32768',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: query }
                    ],
                    max_tokens: 256,
                    temperature: 0.7
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content.trim();
                }
            }
        } catch (error) {
            console.warn('GROQ API error, falling back to knowledge base:', error);
        }
    }

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

function addMessage(text, type) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;
    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    div.innerText = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
