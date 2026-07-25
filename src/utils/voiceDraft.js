// Voice segments span both wizard steps: the general note is recorded on stage 1
// and the per-пролив notes on stage 2. Neither form owns the whole list, so it
// lives in its own draft key rather than being split across two react-hook-form
// states that cannot see each other.
const KEY = 'teaFormVoice';

export const readVoiceDraft = () => {
    try {
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        return [];
    }
};

export const writeVoiceDraft = (segments) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(segments || []));
    } catch (err) {
        // A full or disabled localStorage must not break the recorder itself;
        // the segments are already uploaded and their urls are in component state.
    }
};

export const clearVoiceDraft = () => {
    try {
        localStorage.removeItem(KEY);
    } catch (err) {
        // nothing to do
    }
};
