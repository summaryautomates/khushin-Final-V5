
/**
 * Utility to check image URLs and report problems
 */

export interface ImageCheckResult {
  url: string;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

/**
 * Tests if an image URL is valid and can be loaded
 */
export function checkImageUrl(url: string): Promise<ImageCheckResult> {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      resolve({
        url,
        status: 'error',
        message: 'Invalid URL format',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const img = new Image();
    const timestamp = new Date().toISOString();
    
    // Set a timeout to handle very slow loading images
    const timeoutId = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      resolve({
        url,
        status: 'error',
        message: 'Timeout loading image',
        timestamp
      });
    }, 10000); // 10 second timeout
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve({
        url,
        status: 'success',
        timestamp
      });
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve({
        url,
        status: 'error',
        message: 'Failed to load image',
        timestamp
      });
    };
    
    // Start loading the image
    img.src = url;
  });
}

/**
 * Batch check multiple image URLs
 */
export async function checkMultipleImages(urls: string[]): Promise<ImageCheckResult[]> {
  console.log(`Checking ${urls.length} images...`);
  
  const results = await Promise.all(
    urls.map(url => checkImageUrl(url))
  );
  
  const failures = results.filter(r => r.status === 'error');
  console.log(`Image check complete: ${results.length - failures.length} succeeded, ${failures.length} failed`);
  
  if (failures.length > 0) {
    console.error('Failed images:', failures);
  }
  
  return results;
}

// Expose the function to the window for debugging
if (typeof window !== 'undefined') {
  (window as any).checkImages = checkMultipleImages;
}
