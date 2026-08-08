import React, { useEffect, useRef, useState } from 'react';
import { mainApi } from '../utils/MainAPI.jsx';
import { isSupported, startRecording } from '../utils/recorder.js';
import { useT } from '../i18n/index.js';

export const MAX_TOTAL_SECONDS = 300;

export const totalSeconds = (segments) => (segments || [])
    .reduce((sum, segment) => sum + (Number(segment.duration) || 0), 0);

const mmss = (seconds) => {
    const whole = Math.max(0, Math.round(seconds));
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

// One recorder, bound to one пролив (brewingNumber 0 is the general note about
// the tea itself). The parent owns the segment list; this only adds and removes
// its own entries, so the same component serves the wizard and the edit dialog.
//
// onRemovedUrl decides who deletes the file: the wizard passes nothing and the
// file goes immediately, while the edit dialog collects the urls and unlinks
// them only once the PATCH has succeeded — the same contract as TeaPhotos.
function VoiceNote({ value = [], onChange, brewingNumber = 0, label, onRemovedUrl }) {
	const { t } = useT();
    const [recording, setRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const handle = useRef(null);

    const mine = value.filter((segment) => (segment.brewingNumber || 0) === brewingNumber);
    const used = totalSeconds(value);
    const remaining = Math.max(0, MAX_TOTAL_SECONDS - used);
    const supported = isSupported();

    // A recorder left running when the step unmounts would hold the microphone
    // open with nothing listening for its blob.
    useEffect(() => () => {
        if (handle.current) handle.current.cancel();
    }, []);

    const begin = async () => {
        setError('');
        try {
            handle.current = await startRecording({ onTick: setElapsed });
            setElapsed(0);
            setRecording(true);
        } catch (err) {
            setError(err.name === 'NotAllowedError'
                ? t('voice.noMic')
                : err.message);
        }
    };

    const finish = async () => {
        if (!handle.current) return;
        const current = handle.current;
        handle.current = null;
        setRecording(false);

        try {
            const { blob, seconds } = await current.stop();
            if (!blob.size) return;

            setBusy(true);
            const { data } = await mainApi.uploadVoice(blob);
            onChange([...value, {
                url: data.url,
                brewingNumber,
                // The server measures the real length with ffprobe; the stopwatch
                // reading is only a fallback if that came back empty.
                duration: Number(data.duration) || seconds,
            }]);
        } catch (err) {
            setError(err.message || t('voice.uploadFailed'));
        } finally {
            setBusy(false);
            setElapsed(0);
        }
    };

    const remove = (segment) => {
        onChange(value.filter((item) => item.url !== segment.url));
        if (onRemovedUrl) onRemovedUrl(segment.url);
        else mainApi.deleteVoice(segment.url);
    };

    if (!supported) {
        return (
            <p className="voicenote__hint">
                {t('voice.unsupported')}
            </p>
        );
    }

    return (
        <div className="voicenote">
            <div className="voicenote__row">
                {recording ? (
                    <button type="button" className="voicenote__button voicenote__button_stop"
                        onClick={finish} aria-label={t('voice.stop')}>
                        <span className="voicenote__pulse" aria-hidden="true" />
                        {t('voice.stopShort')} {mmss(elapsed)}
                    </button>
                ) : (
                    <button type="button" className="voicenote__button"
                        onClick={begin} disabled={busy || remaining <= 0}
                        aria-label={label ? t('voice.recordFor', { label }) : t('voice.record')}>
                        {busy ? t('voice.loading') : t('voice.recordButton')}
                    </button>
                )}

                <span className="voicenote__budget">
                    {remaining > 0 ? t('voice.remaining', { left: mmss(remaining), total: mmss(MAX_TOTAL_SECONDS) }) : t('voice.limitSpent')}
                </span>
            </div>

            {mine.length > 0 && (
                <ul className="voicenote__list">
                    {mine.map((segment) => (
                        <li className="voicenote__item" key={segment.url}>
                            <audio className="voicenote__player" src={segment.url} controls preload="none" />
                            <span className="voicenote__length">{mmss(segment.duration)}</span>
                            <button type="button" className="voicenote__remove"
                                onClick={() => remove(segment)}
                                aria-label={label ? t('voice.deleteFor', { label }) : t('voice.delete')}>&times;</button>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="voicenote__error">{error}</p>}
        </div>
    );
}

export default VoiceNote;
