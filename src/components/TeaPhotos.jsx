import React, { useState } from 'react';
import { mainApi } from '../utils/MainAPI.jsx';
import { downscaleImage } from '../utils/imageResize.js';

// The classic tasting triptych. The order is also the order photos are stored
// in, which keeps the feed thumbnail from changing when a later slot is filled.
export const PHOTO_SLOTS = [
    { kind: 'dry', label: 'Сухой лист' },
    { kind: 'liquor', label: 'Настой' },
    { kind: 'wet', label: 'Мокрый лист' },
];

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

// Usable photos in slot order. Everything that displays or indexes photos goes
// through this, so a card thumbnail and the viewer it opens always agree.
export const orderPhotos = (photos) => PHOTO_SLOTS
    .map((slot) => (photos || []).find((p) => p && p.url && p.kind === slot.kind))
    .filter(Boolean);

// Three-slot photo picker, shared by the new-tasting wizard and the edit dialog.
// Files are uploaded as soon as they are picked and only their urls live in the
// form state — step 1 of the wizard is kept in localStorage, which cannot hold
// a File, and the form itself does not exist until the last step.
//
// `onRemovedUrl` decides who cleans up a replaced or removed file. The edit
// dialog passes it so deletion can wait for a successful save (its urls are
// live on the stored form); the wizard omits it and the file goes immediately.
function TeaPhotos({ value = [], onChange, onRemovedUrl }) {
    const [busy, setBusy] = useState({});
    const [errors, setErrors] = useState({});

    const photos = Array.isArray(value) ? value : [];
    const byKind = (kind) => photos.find((p) => p && p.kind === kind);

    const dropFile = (url) => {
        if (!url) return;
        if (onRemovedUrl) onRemovedUrl(url);
        else mainApi.deleteTeaPhoto(url);
    };

    const emit = (next) => onChange(orderPhotos(next));

    const handlePick = async (kind, file) => {
        setErrors((prev) => ({ ...prev, [kind]: '' }));
        setBusy((prev) => ({ ...prev, [kind]: true }));
        try {
            const prepared = await downscaleImage(file);
            const res = await mainApi.uploadTeaPhoto(prepared);
            const previous = byKind(kind);
            emit([...photos.filter((p) => p.kind !== kind), { url: res.data.url, kind }]);
            if (previous) dropFile(previous.url);
        } catch (err) {
            setErrors((prev) => ({ ...prev, [kind]: err.message || 'Не удалось загрузить фото.' }));
        } finally {
            setBusy((prev) => ({ ...prev, [kind]: false }));
        }
    };

    const handleRemove = (kind) => {
        const current = byKind(kind);
        emit(photos.filter((p) => p.kind !== kind));
        if (current) dropFile(current.url);
    };

    return (
        <div className="teaphotos">
            <span className="teaphotos__title">Фото чая — необязательно</span>
            <div className="teaphotos__row">
                {PHOTO_SLOTS.map(({ kind, label }) => {
                    const photo = byKind(kind);
                    const isBusy = Boolean(busy[kind]);
                    return (
                        <div className="teaphotos__slot" key={kind}>
                            {photo ? (
                                <div className="teaphotos__frame">
                                    <img className="teaphotos__image" src={photo.url} alt={label} />
                                    <button type="button" className="teaphotos__remove"
                                        aria-label={`Удалить фото: ${label}`}
                                        onClick={() => handleRemove(kind)}>&times;</button>
                                </div>
                            ) : (
                                <label className="teaphotos__frame teaphotos__frame_empty">
                                    <span className="teaphotos__plus" aria-hidden="true">+</span>
                                    <input type="file" accept={ACCEPT} className="teaphotos__input"
                                        aria-label={`Добавить фото: ${label}`}
                                        disabled={isBusy}
                                        onChange={(e) => {
                                            const file = e.target.files && e.target.files[0];
                                            // Reset so re-picking the same file fires onChange again.
                                            e.target.value = '';
                                            if (file) handlePick(kind, file);
                                        }} />
                                </label>
                            )}
                            <span className="teaphotos__caption">{isBusy ? 'Загрузка…' : label}</span>
                            {errors[kind] && <span className="teaphotos__error">{errors[kind]}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TeaPhotos;
