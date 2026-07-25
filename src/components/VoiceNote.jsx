import React, { useEffect, useRef, useState } from 'react';
import { mainApi } from '../utils/MainAPI.jsx';
import { isSupported, startRecording } from '../utils/recorder.js';

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
                ? 'Нет доступа к микрофону. Разрешите запись в настройках браузера.'
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
            setError(err.message || 'Не удалось загрузить запись.');
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
                Этот браузер не умеет записывать звук. Откройте страницу в Chrome, Firefox или Safari.
            </p>
        );
    }

    return (
        <div className="voicenote">
            <div className="voicenote__row">
                {recording ? (
                    <button type="button" className="voicenote__button voicenote__button_stop"
                        onClick={finish} aria-label="Остановить запись">
                        <span className="voicenote__pulse" aria-hidden="true" />
                        Стоп {mmss(elapsed)}
                    </button>
                ) : (
                    <button type="button" className="voicenote__button"
                        onClick={begin} disabled={busy || remaining <= 0}
                        aria-label={label ? `Записать заметку: ${label}` : 'Записать заметку'}>
                        {busy ? 'Загрузка…' : '● Записать'}
                    </button>
                )}

                <span className="voicenote__budget">
                    {remaining > 0 ? `осталось ${mmss(remaining)} из ${mmss(MAX_TOTAL_SECONDS)}` : 'лимит 5 минут исчерпан'}
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
                                aria-label={`Удалить запись${label ? `: ${label}` : ''}`}>&times;</button>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="voicenote__error">{error}</p>}
        </div>
    );
}

export default VoiceNote;
