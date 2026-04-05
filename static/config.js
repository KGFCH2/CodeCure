// ═══════════════ CODECURE ENVIRONMENT CONFIGURATION ═══════════════
// This file provides backend URL configuration for single-host Render deployment

/**
 * Gets the appropriate backend URL based on environment
 * @returns {string} Backend URL for API calls
 */
function getBackendURL() {
    console.log('[CodeCure Config] Determining backend URL...');

    // Since we are deploying frontend and backend together on Render,
    // we use a relative path if the frontend matches the current host.
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Single-host deployment (Frontend & Backend on same server)
        // This is the most reliable way when serving static files via FastAPI
        return window.location.origin;
    }

    // Fallback for local development if everything else fails
    return 'http://localhost:8000';
}

// Export for use in script.js
if (typeof window !== 'undefined') {
    window.BACKEND_URL_CONFIG = getBackendURL();
}
