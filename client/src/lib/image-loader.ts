type ImageLoadResult = {
  src: string;
  error: boolean;
  loading: boolean;
};

const FALLBACK_IMAGES = [
  '/placeholders/image-placeholder.svg'
];

export async function loadImage(url: string): Promise<ImageLoadResult> {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.warn('Invalid image URL provided:', url);
    return {
      src: FALLBACK_IMAGES[0],
      error: true,
      loading: false
    };
  }

  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      console.log('Image loaded successfully:', url);
      resolve({
        src: url,
        error: false,
        loading: false
      });
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${url}`);
      resolve({
        src: FALLBACK_IMAGES[0],
        error: true,
        loading: false
      });
    };

    img.src = url;
  });
}

export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.warn('Invalid image URL format:', url);
    return false;
  }

  try {
    new URL(url);
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