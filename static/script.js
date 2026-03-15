// ═══════════════ CODECURE CORE JAVASCRIPT ═══════════════
// Handles: AI Predictions, Dashboard Analytics, Chatbot, and PDF Generation

// Initialize Lucide Icons & UI Effects
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

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
    updateHomeStats();
    initSlideshows();
    loadKnowledgeBase();
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
        const response = await fetch('/api/predict', {
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
async function loadDashboard() {
    try {
        const response = await fetch(`/api/dashboard?device_id=${encodeURIComponent(getDeviceId())}`);
        const data = await response.json();

        const localHistory = getLocalHistory();
        const serverRecordIds = new Set((data.recent_predictions || []).map(p => p.id));
        const uniqueLocal = localHistory.filter(p => !serverRecordIds.has(p.id));
        
        dashboardDataStore = [...(data.recent_predictions || []), ...uniqueLocal].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );

        const total = dashboardDataStore.length;
        const highRisk = dashboardDataStore.filter(p => ['High', 'Critical'].includes(p.risk_level)).length;
        const lowRisk = total - highRisk;
        
        const avgScore = total > 0 ? (dashboardDataStore.reduce((acc, p) => acc + (p.health_score || 0), 0) / total).toFixed(1) : '—';
        const avgGlucose = total > 0 ? (dashboardDataStore.reduce((acc, p) => acc + (p.glucose || 0), 0) / total).toFixed(1) : '—';
        const avgBmi = total > 0 ? (dashboardDataStore.reduce((acc, p) => acc + (p.bmi || 0), 0) / total).toFixed(1) : '—';

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

        const container = document.getElementById('patients-table-container');
        if (container) renderDashboardTable(container);

    } catch (error) {
        console.error('Dashboard error:', error);
        const localHistory = getLocalHistory();
        dashboardDataStore = localHistory.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
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
                        <th>Health Score</th><th>Risk Level</th><th>Date</th><th>Action</th>
                    </tr>
                </thead>
                <tbody>
    `;

    dashboardDataStore.forEach(p => {
        const riskClass = (p.risk_level || 'low').toLowerCase();
        const date = new Date(p.created_at).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
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
                <td style="color: var(--text-muted);">${date}</td>
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
    document.getElementById('modal-date').textContent = 'Analyzed on ' + new Date(patient.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

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
        const response = await fetch(`/api/dashboard?device_id=${encodeURIComponent(getDeviceId())}`);
        const data = await response.json();
        
        const localHistory = getLocalHistory();
        const serverRecordIds = new Set((data.recent_predictions || []).map(p => p.id));
        const uniqueLocal = localHistory.filter(p => !serverRecordIds.has(p.id));
        const total = (data.total_patients || 0) + uniqueLocal.length;
        
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
    if (!result) return;
    const data = {
        name: result.name || 'Anonymous',
        email: 'Patient Record #' + result.id,
        score: result.health_score || 0,
        risk: result.risk_level || 'Low',
        summary: result.summary || `Prediction analysis for patient #${result.id}.`,
        probability: (result.risk_probability ? (result.risk_probability * 100).toFixed(1) : '—') + '%'
    };
    generatePDFReport(data);
}

function downloadPDF() {
    const scoreEl = document.getElementById('score-number');
    if (!scoreEl || scoreEl.innerText === '—') {
        showToast('Please run an AI analysis first.', 'error');
        return;
    }
    const data = {
        name: document.getElementById('input-name').value || 'Patient',
        email: document.getElementById('input-email').value || 'Not provided',
        score: scoreEl.innerText,
        risk: document.getElementById('risk-text').innerText,
        summary: document.getElementById('result-summary').innerText,
        probability: document.getElementById('probability-value').innerText,
        factors: Array.from(document.querySelectorAll('.risk-factor-card')).map(card => ({
            name: card.querySelector('.risk-factor-name').innerText,
            value: card.querySelector('.risk-factor-value').innerText,
            status: card.querySelector('.risk-factor-status').innerText
        })),
        recommendations: Array.from(document.querySelectorAll('.recommendation-item span:last-child')).map(rec => rec.innerText)
    };
    generatePDFReport(data);
}

function generatePDFReport(data) {
    const scoreColor = getScoreColor(data.score);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:100000;background:rgba(255,255,255,0.98);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;';
    
    overlay.innerHTML = `
        <div style="margin-bottom:20px;font-weight:bold;color:#10b981;font-size:18px;">📄 Generating Report...</div>
        <div id="pdf-report-content" style="width:800px;background:white;padding:40px;border:1px solid #e2e8f0;color:#111827;box-sizing:border-box;">
            <div style="border-bottom:4px solid #10b981;padding-bottom:15px;margin-bottom:25px;display:flex;justify-content:space-between;align-items:center;">
                <h1 style="color:#10b981;font-size:32px;margin:0;font-weight:800;">CodeCure AI</h1>
                <div style="text-align:right;">#CC-${Date.now().toString().slice(-6)}</div>
            </div>
            <div style="background:#f8fafc;padding:20px;border-radius:10px;margin-bottom:25px;">
                <h3 style="margin:0;">${data.name}</h3>
                <p style="color:#64748b;">${data.email} | ${new Date().toLocaleDateString()}</p>
            </div>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:30px;">
                <div style="background:${scoreColor};color:white;width:80px;height:80px;border-radius:15px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:bold;">
                    <span style="font-size:28px;">${data.score}</span>
                </div>
                <div><h2 style="margin:0;">${data.risk} Risk</h2><p>Probability: ${data.probability}</p></div>
            </div>
            <div style="border-left:5px solid ${scoreColor};padding:15px;background:#f8fafc;margin-bottom:30px;">
                <strong>Diagnostic Insight:</strong><p>${data.summary}</p>
            </div>
            <div style="font-size:10px;color:#94a3b8;text-align:center;margin-top:40px;">© 2026 CodeCure AI - Clinical Summary Only</div>
        </div>
    `;

    document.body.appendChild(overlay);
    const opt = { 
        margin:0, filename:`CodeCure_Report_${data.name.replace(/\s+/g,'_')}.pdf`,
        image:{type:'jpeg',quality:1}, html2canvas:{scale:2, useCORS:true},
        jsPDF:{unit:'mm',format:'a4',orientation:'portrait'} 
    };

    setTimeout(() => {
        html2pdf().set(opt).from(document.getElementById('pdf-report-content')).save().then(() => {
            showToast('Report downloaded!', 'success');
            document.body.removeChild(overlay);
        }).catch(() => document.body.removeChild(overlay));
    }, 800);
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
// Chatbot Logic
// ────────────────────────────────────────
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

    setTimeout(() => {
        messages.removeChild(typing);
        addMessage(findBestAnswer(query), 'bot');
    }, 600);
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

function findBestAnswer(query) {
    const q = query.toLowerCase().trim();
    if (['hello', 'hi', 'hey'].some(g => q.includes(g)) || q.length < 3) 
        return "Hello! I am your CodeCure AI assistant. How can I help you today?";
    
    let bestMatch = null, maxScore = 0;
    knowledgeBase.forEach(item => {
        let score = 0;
        if (item.keywords) item.keywords.forEach(kw => { if (new RegExp(`\\b${kw}\\b`, 'i').test(q)) score += 3; });
        if (score > maxScore) { maxScore = score; bestMatch = item.answer; }
    });

    if (bestMatch && maxScore > 1) return bestMatch;
    
    const related = ['codecure', 'health', 'diabetes', 'predict', 'report', 'dashboard', 'ai', 'bmi', 'glucose'];
    if (!related.some(k => q.includes(k))) return "I am specialized in CodeCure-related queries. Please ask about the platform!";
    
    return "I'm not sure about that specific detail. Could you please rephrase?";
}
