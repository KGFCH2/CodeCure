// ═══════════════ CODECURE ENVIRONMENT CONFIGURATION ═══════════════
// This file provides backend URL configuration for both local and production deployments

/**
 * Gets the appropriate backend URL based on environment
 * @returns {string} Backend URL for API calls
 */
function getBackendURL() {
    console.log('[CodeCure Config] Determining backend URL...');

    // Priority 1: Check for Vercel deployment FIRST (most reliable)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        if (hostname.includes('vercel.app')) {
            const backendUrl = 'https://codecure-api.onrender.com';
            console.log('[CodeCure Config] ✓ Vercel detected, using Render backend:', backendUrl);
            return backendUrl;
        }

        // Local development
        if (hostname.includes('localhost') || hostname === '127.0.0.1') {
            const backendUrl = 'http://localhost:8000';
            console.log('[CodeCure Config] ✓ Local development detected, using localhost:', backendUrl);
            return backendUrl;
        }
    }

    // Priority 2: Use Jinja2 injected value from template, but validate it's a real URL
    if (typeof window !== 'undefined' && window.ENV && window.ENV.BACKEND_URL) {
        const backendUrl = window.ENV.BACKEND_URL.trim();

        // Skip if it's an unresolved Jinja2 template variable
        if (backendUrl && !backendUrl.includes('{{') && !backendUrl.includes('}}') && backendUrl.startsWith('http')) {
            console.log('[CodeCure Config] ✓ Using Jinja2 injected backend URL:', backendUrl);
            return backendUrl;
        } else if (backendUrl.includes('{{')) {
            console.warn('[CodeCure Config] ⚠ Template variable not resolved, falling back to Render');
        }
    }

    // Fallback: Production Render URL
    const fallbackUrl = 'https://codecure-api.onrender.com';
    console.log('[CodeCure Config] ✓ Using fallback Render backend:', fallbackUrl);
    return fallbackUrl;
}

// Export for use in script.js
if (typeof window !== 'undefined') {
    window.BACKEND_URL_CONFIG = getBackendURL();
}
