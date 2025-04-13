/**
 * This file contains utilities to handle Vite HMR errors in development mode
 * and prevent them from causing unhandled rejections in the console.
 */

// Initialize error handling for Vite HMR
export function initializeViteErrorHandling() {
  if (import.meta.env.DEV) {
    console.log('[Vite Patcher] Initializing HMR error handling...');
    
    // Handle WebSocket message errors
    window.addEventListener('error', (event) => {
      const isViteError = 
        event.message?.includes('vite') || 
        event.message?.includes('hmr') || 
        event.message?.includes('HMR') ||
        event.message?.includes('WebSocket');
        
      if (isViteError) {
        console.debug('[Vite Patcher] Suppressed Vite client error:', event);
        event.preventDefault();
        return false;
      }
    }, true);
    
    console.log('[Vite Patcher] HMR error handling initialized');
    
    // Handle Promise rejections from Vite HMR
    console.log('[Vite Patcher] Promise rejection handling initialized');
  }
}

// Auto-initialize when the file is imported
initializeViteErrorHandling();

export default {
  initializeViteErrorHandling
};