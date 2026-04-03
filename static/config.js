// ═══════════════ CODECURE ENVIRONMENT CONFIGURATION ═══════════════
// This file provides backend URL configuration for both local and production deployments

/**
 * Gets the appropriate backend URL based on environment
 * @returns {string} Backend URL for API calls
 */
function getBackendURL() {
    // Priority 1: Use Jinja2 injected value from template (for backend rendering)
    if (typeof window !== 'undefined' && window.ENV && window.ENV.BACKEND_URL) {
        return window.ENV.BACKEND_URL;
    }

    // Priority 2: Check for production Vercel deployment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Vercel production domain
        if (hostname.includes('vercel.app')) {
            return 'https://codecure-backend-8yt5.onrender.com';
        }

        // Local development
        if (hostname.includes('localhost') || hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
    }

    // Fallback: Render production URL
    return 'https://codecure-backend-8yt5.onrender.com';
}

// Export for use in script.js
if (typeof window !== 'undefined') {
    window.BACKEND_URL_CONFIG = getBackendURL();
}
