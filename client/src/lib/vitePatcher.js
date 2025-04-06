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
      patchPromiseRejectionHandling();
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
        url.includes('/@vite/client') ||
        url.includes('/@react-refresh') ||
        url.includes('/@hmr')
      );
      
      // Call original fetch
      const response = await originalFetch(url, options);
      return response;
    } catch (error) {
      // For HMR requests, return a synthetic Response to prevent errors from bubbling up
      if (typeof url === 'string' && (
        url.includes('/__vite_ping') || 
        url.includes('/@vite/client') ||
        url.includes('/@react-refresh')
      )) {
        // Suppress all console output for these common errors
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
  
  // Also patch XMLHttpRequest for older Vite versions
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(...args) {
    const url = args[1];
    if (typeof url === 'string' && (
      url.includes('/__vite_ping') || 
      url.includes('/@vite/client') ||
      url.includes('/@react-refresh') ||
      url.includes('/@hmr')
    )) {
      this.addEventListener('error', (event) => {
        // Prevent error propagation for Vite HMR requests
        event.stopPropagation();
        event.preventDefault();
      });
    }
    return originalXHROpen.apply(this, args);
  };
  
  console.log('[Vite Patcher] HMR error handling initialized');
}

/**
 * Patches the global Promise rejection handling to completely silence Vite HMR errors
 */
function patchPromiseRejectionHandling() {
  // Global flag to prevent redundant Vite-related error logging
  window.__suppressViteHMRErrors = true;
  
  // Additional global error handler that runs before React's error handling
  window.addEventListener('unhandledrejection', function(event) {
    if (!event || !event.reason) return;
    
    // Check if this is a Vite HMR-related error that should be completely suppressed
    const isViteError = 
      (event.reason.stack && event.reason.stack.includes('@vite/client')) ||
      (event.reason.message && (
        event.reason.message.includes('Failed to fetch') ||
        event.reason.message.includes('Vite') ||
        event.reason.message.includes('hmr') ||
        event.reason.message.includes('HMR') ||
        event.reason.message.includes('websocket')
      ));
    
    if (isViteError) {
      // Completely prevent the event from propagating
      event.preventDefault();
      event.stopPropagation();
      
      // Stop further processing
      return false;
    }
  }, true); // Use capture to ensure this runs before other handlers
  
  console.log('[Vite Patcher] Promise rejection handling initialized');
}

// Export empty object to prevent imports from throwing errors
export {};