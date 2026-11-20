/**
 * Optimizes user-uploaded raster images on the client before R2 storage upload.
 * Downscales large camera photos to at most `maxDimension` px and converts to WebP.
 */
export async function optimizeImageFile(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const { maxDimension = 1920, quality = 0.85 } = options;

  // Skip non-raster, SVG, or animated GIF images
  const optimizableTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp']);
  if (!optimizableTypes.has(file.type.toLowerCase())) {
    return file;
  }

  // Tiny files (< 80KB) don't benefit noticeably unless oversized in pixels
  if (typeof document === 'undefined') {
    return file;
  }

  try {
    let width = 0;
    let height = 0;
    let drawSource: CanvasImageSource;
    let cleanup: (() => void) | null = null;

    if (typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(file);
      width = bitmap.width;
      height = bitmap.height;
      drawSource = bitmap;
      cleanup = () => bitmap.close();
    } else {
      const objectUrl = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('Image decode failed'));
        el.src = objectUrl;
      });
      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;
      drawSource = img;
      cleanup = () => URL.revokeObjectURL(objectUrl);
    }

    try {
      if (!width || !height) return file;

      const maxSide = Math.max(width, height);
      const scale = maxSide > maxDimension ? maxDimension / maxSide : 1;
      const targetWidth = Math.max(1, Math.round(width * scale));
      const targetHeight = Math.max(1, Math.round(height * scale));

      // Skip re-encoding if already WebP within dimensions and reasonably small
      if (file.type === 'image/webp' && scale === 1 && file.size <= 350 * 1024) {
        return file;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(drawSource, 0, 0, targetWidth, targetHeight);

      const webpBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/webp', quality)
      );

      if (!webpBlob) return file;

      // Keep original only if dimensions didn't change and WebP turned out larger
      if (scale === 1 && webpBlob.size >= file.size) {
        return file;
      }

      const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
      return new File([webpBlob], `${baseName}.webp`, {
        type: 'image/webp',
        lastModified: Date.now(),
      });
    } finally {
      cleanup?.();
    }
  } catch {
    return file;
  }
}
