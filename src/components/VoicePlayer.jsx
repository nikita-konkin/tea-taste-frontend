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
    const [retrying, setRetrying] = useState(false);

    // Flipping the local status to "queued" restarts the polling effect below,
    // so progress appears immediately instead of after the next page load.
    const retry = () => {
        setRetrying(true);
        mainApi.retryVoice(sessionId)
            .then(() => setState((prev) => ({ ...prev, status: 'queued', error: '' })))
            .catch((err) => setState((prev) => ({
                ...prev,
                error: err.message || 'Не удалось отправить повторно.',
            })))
            .finally(() => setRetrying(false));
    };

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
                <div className="voiceplayer__failure">
                    <p className="voiceplayer__status voiceplayer__status_error">
                        {LABEL.error}{state.error ? `: ${state.error}` : ''}
                    </p>
                    {/* Recognition is a network call to a third party, so most
                        failures are transient. The audio is still on the server —
                        only the recognition has to be re-run. */}
                    {sessionId && (
                        <button type="button" className="voicenote__button"
                            onClick={retry} disabled={retrying}>
                            {retrying ? 'Отправляем…' : 'Повторить расшифровку'}
                        </button>
                    )}
                </div>
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
