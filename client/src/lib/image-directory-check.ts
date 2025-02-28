
/**
 * Utility to check if image directories are properly set up
 */

export async function checkImageDirectories(): Promise<boolean> {
  try {
    console.log('Checking image directories...');
    
    // Check placeholder SVGs
    const placeholderResults = await Promise.all([
      fetch('/placeholders/product-placeholder.svg').then(res => res.ok),
      fetch('/placeholders/image-placeholder.svg').then(res => res.ok)
    ]);
    
    const allPlaceholdersExist = placeholderResults.every(Boolean);
    console.log(`Placeholder check result: ${allPlaceholdersExist ? 'OK' : 'Missing'}`);
    
    return allPlaceholdersExist;
  } catch (error) {
    console.error('Error checking image directories:', error);
    return false;
  }
}

// Expose the function to the window for debugging
if (typeof window !== 'undefined') {
  (window as any).checkImageDirectories = checkImageDirectories;
}
