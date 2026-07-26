import { useEffect, useState } from 'react';

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

// Every recorder in the wizard shares one list and one five-minute budget, but
// they sit in different components across two steps — stage 1 next to the photos,
// stage 2 inside each пролив. A module-level store keeps them consistent without
// threading state through components that have no other reason to know about it.
const listeners = new Set();
let current = null;

const snapshot = () => {
    if (current === null) current = readVoiceDraft();
    return current;
};

export const setVoiceDraft = (segments) => {
    current = segments || [];
    writeVoiceDraft(current);
    listeners.forEach((notify) => notify(current));
};

export const useVoiceDraft = () => {
    const [segments, setSegments] = useState(snapshot);

    useEffect(() => {
        listeners.add(setSegments);
        // A recorder mounted later must not start from a stale first render.
        setSegments(snapshot());
        return () => listeners.delete(setSegments);
    }, []);

    return [segments, setVoiceDraft];
};

export const clearVoiceDraft = () => {
    current = [];
    listeners.forEach((notify) => notify(current));
    try {
        localStorage.removeItem(KEY);
    } catch (err) {
        // nothing to do
    }
};
