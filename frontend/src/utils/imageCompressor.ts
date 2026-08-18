/**
 * Client-Side Smart Image Compressor
 * Reduces raw 5MB-25MB camera uploads down to ~100-250KB WebP/JPEG
 * before transmission to Neon DB & Gemini Vision AI.
 */

export interface CompressionResult {
  file: File;
  base64: string;
  mimeType: string;
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: string;
  width: number;
  height: number;
}

export interface CompressionOptions {
  maxDimension?: number;
  quality?: number;
  targetMimeType?: 'image/jpeg' | 'image/webp';
}

export async function compressImage(
  input: File | Blob | string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxDimension = 1280,
    quality = 0.82,
    targetMimeType = 'image/jpeg',
  } = options;

  let originalSizeBytes = 0;
  let sourceUrl = '';
  let filename = 'compressed_food_sample.jpg';

  if (input instanceof File) {
    originalSizeBytes = input.size;
    filename = input.name.replace(/\.[^/.]+$/, '') + (targetMimeType === 'image/webp' ? '.webp' : '.jpg');
    sourceUrl = URL.createObjectURL(input);
  } else if (input instanceof Blob) {
    originalSizeBytes = input.size;
    sourceUrl = URL.createObjectURL(input);
  } else if (typeof input === 'string') {
    if (input.startsWith('data:')) {
      const base64Str = input.split(',')[1] || '';
      originalSizeBytes = Math.round((base64Str.length * 3) / 4);
      sourceUrl = input;
    } else {
      sourceUrl = input;
      try {
        const res = await fetch(input);
        const blob = await res.blob();
        originalSizeBytes = blob.size;
        sourceUrl = URL.createObjectURL(blob);
      } catch {
        originalSizeBytes = 500000;
      }
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio while bounding max dimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        reject(new Error('Unable to acquire 2D canvas context for compression.'));
        return;
      }

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob conversion failed.'));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const cleanBase64 = dataUrl.split(',')[1] || '';
            const compressedSizeBytes = blob.size;
            const savings = Math.max(0, ((originalSizeBytes - compressedSizeBytes) / (originalSizeBytes || 1)) * 100);

            const compressedFile = new File([blob], filename, {
              type: targetMimeType,
              lastModified: Date.now(),
            });

            // Cleanup object URL if allocated
            if (sourceUrl.startsWith('blob:')) {
              URL.revokeObjectURL(sourceUrl);
            }

            resolve({
              file: compressedFile,
              base64: cleanBase64,
              mimeType: targetMimeType,
              dataUrl,
              originalSizeBytes,
              compressedSizeBytes,
              compressionRatio: `${savings.toFixed(1)}% savings (${(originalSizeBytes / 1024).toFixed(0)}KB → ${(compressedSizeBytes / 1024).toFixed(0)}KB)`,
              width,
              height,
            });
          };

          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        targetMimeType,
        quality
      );
    };

    img.onerror = (err) => {
      if (sourceUrl.startsWith('blob:')) {
        URL.revokeObjectURL(sourceUrl);
      }
      reject(err);
    };

    img.src = sourceUrl;
  });
}
