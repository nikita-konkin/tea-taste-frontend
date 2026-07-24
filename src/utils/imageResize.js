// Shrinks a camera photo before upload. Phone pictures run 3-8 MB, which is
// slow on mobile data and would hit nginx's client_max_body_size; 1600px on the
// long edge is plenty for the sizes the app actually renders.
//
// Anything unexpected returns the original file rather than throwing: a photo
// that uploads at full size is a much better outcome than one that fails.

const DEFAULTS = { maxEdge: 1600, quality: 0.85 };

const canResize = () =>
    typeof createImageBitmap === 'function' &&
    typeof document !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined';

const toBlob = (canvas, quality) =>
    new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));

export async function downscaleImage(file, options = {}) {
    const { maxEdge, quality } = { ...DEFAULTS, ...options };

    if (!file || !canResize()) return file;

    let bitmap;
    try {
        // 'from-image' applies the EXIF orientation. Without it portrait photos
        // from a phone come out sideways — which is why there is no <img>-based
        // fallback here: that path silently loses the orientation.
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
        return file;
    }

    try {
        const { width, height } = bitmap;
        const scale = maxEdge / Math.max(width, height);
        if (!(scale < 1)) return file;

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        const blob = await toBlob(canvas, quality);
        // An already-optimised PNG/WebP can re-encode larger than it started.
        if (!blob || blob.size >= file.size) return file;

        // Named on purpose: canvas.toBlob() yields a nameless Blob, and the
        // server would then see no extension for the uploaded part.
        return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
    } catch {
        return file;
    } finally {
        if (bitmap.close) bitmap.close();
    }
}

export default downscaleImage;
