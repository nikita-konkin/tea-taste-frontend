import React, { useState } from 'react';
import { usePopup } from './PopupContext.jsx';

// Yes/no confirmation in the shared popup, for actions that cannot be undone by
// the person who just clicked them.
//
// It performs the action itself rather than closing first and letting the caller
// fire and forget: the card that opened this dialog is often the thing being
// deleted, so a failure has to be reported here, in the window the user is still
// looking at, instead of into a component that no longer exists.
function ConfirmDialog({
    title,
    text,
    confirmLabel = 'Да',
    cancelLabel = 'Нет',
    danger = false,
    onConfirm,
    onDone,
}) {
    const { closePopup } = usePopup();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const confirm = () => {
        setBusy(true);
        setError('');
        Promise.resolve()
            .then(() => onConfirm())
            .then(() => {
                closePopup();
                if (onDone) onDone();
            })
            .catch((err) => {
                setError(err.message || 'Не удалось выполнить действие.');
                setBusy(false);
            });
    };

    return (
        <section className="myforminteraction__section confirm">
            <h3>{title}</h3>
            {text && <p className="confirm__text">{text}</p>}
            {error && <p className="confirm__error">{error}</p>}
            <div className="confirm__buttons">
                <button type="button"
                    className={`voicenote__button${danger ? ' confirm__button_danger' : ''}`}
                    onClick={confirm} disabled={busy}>
                    {busy ? 'Выполняем…' : confirmLabel}
                </button>
                <button type="button" className="voicenote__button"
                    onClick={closePopup} disabled={busy}>
                    {cancelLabel}
                </button>
            </div>
        </section>
    );
}

export default ConfirmDialog;
