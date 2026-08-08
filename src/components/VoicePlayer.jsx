import React, { useEffect, useState } from 'react';
import { mainApi } from '../utils/MainAPI.jsx';
import { useT } from '../i18n/index.js';

// Status -> catalogue key. The status itself is what the server stores, so it
// stays English regardless of who is reading.
const LABEL_KEY = {
    queued: 'voice.queued',
    processing: 'voice.processing',
    error: 'voice.failed',
};

// Read-only playback of the merged voice track plus its transcript. Used on the
// detail popup, the review step and the public page.
//
// sessionId is optional: with it the component polls while recognition is still
// running, without it (the public page, where there is no owner endpoint) it
// simply renders whatever the form already carries.
function VoicePlayer({ voice, sessionId }) {
    const { t } = useT();
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
                error: err.message || t('voice.retryFailed'),
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

            {pending && <p className="voiceplayer__status">{t(LABEL_KEY[state.status])}</p>}

            {state.status === 'error' && (
                <div className="voiceplayer__failure">
                    <p className="voiceplayer__status voiceplayer__status_error">
                        {t('voice.failed')}{state.error ? `: ${state.error}` : ''}
                    </p>
                    {/* Recognition is a network call to a third party, so most
                        failures are transient. The audio is still on the server —
                        only the recognition has to be re-run. */}
                    {sessionId && (
                        <button type="button" className="voicenote__button"
                            onClick={retry} disabled={retrying}>
                            {retrying ? t('voice.sending') : t('voice.retry')}
                        </button>
                    )}
                </div>
            )}

            {state.transcript && (
                // Open by default: the transcript is the point of the recording,
                // and behind a collapsed summary it reads as "no transcript".
                // Still collapsible, because a five-minute note is a wall of text.
                <details className="voiceplayer__details" open>
                    <summary className="voiceplayer__summary">{t('voice.transcript')}</summary>
                    <p className="voiceplayer__transcript">{state.transcript}</p>
                </details>
            )}
        </div>
    );
}

export default VoicePlayer;
