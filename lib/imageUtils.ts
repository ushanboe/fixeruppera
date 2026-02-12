/**
 * Convert an image URL or data URL to a compressed base64 data URL.
 * Uses canvas for resizing/compression. Falls back to server-side proxy on CORS error.
 */
export async function imageToBase64(
  src: string,
  maxSize = 512,
  quality = 0.7
): Promise<string> {
  // Already a data URL — just compress via canvas
  if (src.startsWith("data:")) {
    return compressViaCanvas(src, maxSize, quality);
  }

  // Try client-side first (canvas with crossOrigin)
  try {
    return await compressViaCanvas(src, maxSize, quality);
  } catch {
    // CORS blocked — fall back to server-side proxy
    const res = await fetch(
      `/api/upcycle/proxy-image?url=${encodeURIComponent(src)}`
    );
    if (!res.ok) throw new Error("Proxy fetch failed");
    const { dataUrl } = await res.json();
    return compressViaCanvas(dataUrl, maxSize, quality);
  }
}

function compressViaCanvas(
  src: string,
  maxSize: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      let width = img.width;
      let height = img.height;

      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}
