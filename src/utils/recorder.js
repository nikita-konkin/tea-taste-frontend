// Thin wrapper over MediaRecorder. Kept separate from the component so the
// component can be tested in jsdom, which has neither MediaRecorder nor
// getUserMedia.
import { translateHere } from '../i18n/index.js';

// Chrome, Firefox and Edge record webm/opus; Safari and iOS only offer mp4/aac.
// The server accepts both and normalises to mp3, so the first supported one wins.
const CANDIDATES = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
];

export const isSupported = () => (
    typeof window !== 'undefined'
    && typeof window.MediaRecorder !== 'undefined'
    && Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
);

const pickMimeType = () => CANDIDATES.find((type) => {
    try {
        return window.MediaRecorder.isTypeSupported(type);
    } catch (err) {
        return false;
    }
}) || '';

// Resolves with a Blob when stop() is called. The microphone track is stopped
// explicitly: leaving it live keeps the browser's recording indicator on, which
// users read — correctly — as "this page is still listening".
export const startRecording = async ({ onTick } = {}) => {
    if (!isSupported()) throw new Error(translateHere('voice.recordUnsupported'));

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
    });

    const mimeType = pickMimeType();
    const recorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks = [];
    const startedAt = Date.now();

    recorder.addEventListener('dataavailable', (event) => {
        if (event.data && event.data.size) chunks.push(event.data);
    });

    const ticker = onTick
        ? setInterval(() => onTick(Math.round((Date.now() - startedAt) / 1000)), 500)
        : null;

    const release = () => {
        if (ticker) clearInterval(ticker);
        stream.getTracks().forEach((track) => track.stop());
    };

    const finished = new Promise((resolve, reject) => {
        recorder.addEventListener('stop', () => {
            release();
            resolve({
                blob: new Blob(chunks, { type: mimeType || 'audio/webm' }),
                seconds: Math.round((Date.now() - startedAt) / 1000),
            });
        });
        recorder.addEventListener('error', (event) => {
            release();
            reject(event.error || new Error(translateHere('voice.recordError')));
        });
    });

    recorder.start();

    return {
        stop: () => {
            if (recorder.state !== 'inactive') recorder.stop();
            return finished;
        },
        cancel: () => {
            // Discard: stop the recorder so the stream is released, ignore the blob.
            if (recorder.state !== 'inactive') recorder.stop();
            finished.catch(() => {});
            release();
        },
    };
};
