import React, { useEffect, useState } from 'react';
import { mainApi } from '../utils/MainAPI.jsx';

const LABEL = {
    queued: 'В очереди на расшифровку…',
    processing: 'Расшифровываем запись…',
    error: 'Не удалось расшифровать запись',
};

// Read-only playback of the merged voice track plus its transcript. Used on the
// detail popup, the review step and the public page.
//
// sessionId is optional: with it the component polls while recognition is still
// running, without it (the public page, where there is no owner endpoint) it
// simply renders whatever the form already carries.
function VoicePlayer({ voice, sessionId }) {
    const [state, setState] = useState(voice || {});

    useEffect(() => {
        setState(voice || {});
    }, [voice]);

    const pending = state.status === 'queued' || state.status === 'processing';

    useEffect(() => {
        if (!sessionId || !pending) return undefined;

        let live = true;
        const tick = () => {
            mainApi.getVoiceStatus(sessionId)
                .then(({ data }) => {
                    if (live) setState((prev) => ({ ...prev, ...data }));
                })
                .catch(() => {});
        };

        const timer = setInterval(tick, 5000);
        return () => {
            live = false;
            clearInterval(timer);
        };
    }, [sessionId, pending]);

    const track = state.track || {};
    if (!track.url && !state.transcript && !pending) return null;

    return (
        <div className="voiceplayer">
            {track.url && (
                <audio className="voiceplayer__audio" src={track.url} controls preload="none" />
            )}

            {pending && <p className="voiceplayer__status">{LABEL[state.status]}</p>}

            {state.status === 'error' && (
                <p className="voiceplayer__status voiceplayer__status_error">
                    {LABEL.error}{state.error ? `: ${state.error}` : ''}
                </p>
            )}

            {state.transcript && (
                // Open by default: the transcript is the point of the recording,
                // and behind a collapsed summary it reads as "no transcript".
                // Still collapsible, because a five-minute note is a wall of text.
                <details className="voiceplayer__details" open>
                    <summary className="voiceplayer__summary">Расшифровка записи</summary>
                    <p className="voiceplayer__transcript">{state.transcript}</p>
                </details>
            )}
        </div>
    );
}

export default VoicePlayer;
