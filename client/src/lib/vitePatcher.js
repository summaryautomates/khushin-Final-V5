/**
 * This script patches the Vite HMR client to handle fetch errors gracefully
 * These errors are common in development and don't affect functionality
 */

// Wait for the window to load
window.addEventListener('load', () => {
  setTimeout(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'production') {
      patchViteHMRClient();
    }
  }, 1000); // Wait a bit for everything to initialize
});

/**
 * Patches window.fetch to catch HMR-related errors without causing unhandled rejections
 */
function patchViteHMRClient() {
  console.log('[Vite Patcher] Initializing HMR error handling...');
  
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Replace fetch with patched version
  window.fetch = async function patchedFetch(url, options) {
    try {
      // Check if this is an HMR-related fetch (ping for Vite)
      const isHMRRequest = typeof url === 'string' && (
        url.includes('/__vite_ping') || 
        url.includes('/@vite/client')
      );
      
      // Call original fetch
      const response = await originalFetch(url, options);
      return response;
    } catch (error) {
      // For HMR requests, return a synthetic Response to prevent errors from bubbling up
      if (typeof url === 'string' && url.includes('/__vite_ping')) {
        console.debug('[Vite Patcher] Suppressed HMR connection error');
        // Create a synthetic response that will prevent HMR from triggering unhandled rejections
        return new Response(JSON.stringify({ status: 'suppressed-error', timestamp: Date.now() }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Let other fetch errors propagate normally
      throw error;
    }
  };
  
  console.log('[Vite Patcher] HMR error handling initialized');
}

// Export empty object to prevent imports from throwing errors
export {};