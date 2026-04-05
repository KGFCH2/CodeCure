// ═══════════════ CODECURE ENVIRONMENT CONFIGURATION ═══════════════
// This file provides backend URL configuration for both local and production deployments

/**
 * Gets the appropriate backend URL based on environment
 * @returns {string} Backend URL for API calls
 */
function getBackendURL() {
    // Priority 1: Check if BACKEND_URL environment variable is set (Vercel env var)
    if (typeof window !== 'undefined' && process && process.env && process.env.REACT_APP_BACKEND_URL) {
        return process.env.REACT_APP_BACKEND_URL;
    }

    // Priority 2: Use Jinja2 injected value from template, but check if it was actually replaced
    if (typeof window !== 'undefined' && window.ENV && window.ENV.BACKEND_URL) {
        const backendUrl = window.ENV.BACKEND_URL.trim();
        // Check if the template variable was replaced; if not, ignore it
        if (backendUrl && !backendUrl.includes('{{') && !backendUrl.includes('}}')) {
            return backendUrl;
        }
    }

    // Priority 3: Check for production Vercel deployment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Vercel production domain
        if (hostname.includes('vercel.app')) {
            console.log('[CodeCure Config] Detected Vercel environment, using Render backend');
            return 'https://codecure-api.onrender.com';
        }

        // Local development
        if (hostname.includes('localhost') || hostname === '127.0.0.1') {
            console.log('[CodeCure Config] Detected local development, using localhost backend');
            return 'http://localhost:8000';
        }
    }

    // Fallback: Render production URL
    console.log('[CodeCure Config] Using fallback Render backend URL');
    return 'https://codecure-api.onrender.com';
}

// Export for use in script.js
if (typeof window !== 'undefined') {
    window.BACKEND_URL_CONFIG = getBackendURL();
}
