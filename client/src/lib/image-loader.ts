type ImageLoadResult = {
  src: string;
  error: boolean;
  loading: boolean;
  errorMessage?: string;
};

const FALLBACK_IMAGES = [
  '/placeholders/image-placeholder.svg',
  '/placeholders/error-placeholder.svg'
];

export async function loadImage(url: string): Promise<ImageLoadResult> {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.warn('Invalid image URL provided:', url);
    return {
      src: FALLBACK_IMAGES[0],
      error: true,
      loading: false,
      errorMessage: 'Invalid image URL provided'
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    let timeoutId: NodeJS.Timeout;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };

    // Set a timeout to handle very slow loading images
    timeoutId = setTimeout(() => {
      cleanup();
      console.warn(`Image load timeout for: ${url}`);
      resolve({
        src: FALLBACK_IMAGES[0],
        error: true,
        loading: false,
        errorMessage: 'Image load timeout'
      });
    }, 15000); // 15 second timeout

    img.onload = () => {
      cleanup();
      console.log('Image loaded successfully:', url);
      resolve({
        src: url,
        error: false,
        loading: false
      });
    };

    img.onerror = () => {
      cleanup();
      console.error(`Failed to load image: ${url}`);
      resolve({
        src: FALLBACK_IMAGES[0],
        error: true,
        loading: false,
        errorMessage: `Failed to load image: ${url}`
      });
    };

    // Start loading the image
    img.src = url;

    // For cached images, the load event might have already fired
    if (img.complete) {
      cleanup();
      resolve({
        src: url,
        error: false,
        loading: false
      });
    }
  });
}

export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.warn('Invalid image URL format:', url);
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    // Check if the URL protocol is either http or https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      console.warn('Invalid URL protocol:', url);
      return false;
    }
    return true;
  } catch {
    // If URL is relative, check if it starts with /
    const isRelative = url.startsWith('/');
    if (!isRelative) {
      console.warn('Invalid relative URL format:', url);
    }
    return isRelative;
  }
}

// Helper function to check if WebP is supported
export async function supportsWebP(): Promise<boolean> {
  const elem = document.createElement('canvas');
  if (!!(elem.getContext && elem.getContext('2d'))) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}