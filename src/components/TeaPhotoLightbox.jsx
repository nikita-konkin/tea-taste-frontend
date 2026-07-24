import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PHOTO_SLOTS } from './TeaPhotos.jsx';

const LABELS = PHOTO_SLOTS.reduce((acc, s) => ({ ...acc, [s.kind]: s.label }), {});

// Full-screen photo viewer. Portalled to <body> on purpose: the detail popup it
// usually opens from has a backdrop-filter, which makes it the containing block
// for fixed-position children — rendered in place, this would only fill the
// popup instead of the screen.
function TeaPhotoLightbox({ photos, startIndex = 0, onClose }) {
    const list = (photos || []).filter((p) => p && p.url);
    const [index, setIndex] = useState(() =>
        Math.min(Math.max(Number(startIndex) || 0, 0), Math.max(list.length - 1, 0)));

    const go = useCallback(
        (step) => setIndex((i) => (i + step + list.length) % list.length),
        [list.length]
    );

    useEffect(() => {
        // Both handlers capture and stop, so the popup this may sit on top of
        // does not close along with the viewer. Escape closes on key*up*
        // specifically: that is the event the popup itself listens for, and
        // swallowing only the keydown would let the trailing keyup through
        // after this component had already unmounted and dropped its listeners.
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                return;
            }
            const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
            if (!step) return;
            e.stopPropagation();
            e.preventDefault();
            go(step);
        };
        const onKeyUp = (e) => {
            if (e.key !== 'Escape') return;
            e.stopPropagation();
            e.preventDefault();
            onClose();
        };
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('keyup', onKeyUp, true);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown, true);
            document.removeEventListener('keyup', onKeyUp, true);
            document.body.style.overflow = previousOverflow;
        };
    }, [go, onClose]);

    if (list.length === 0) return null;

    const photo = list[index];
    const label = LABELS[photo.kind] || 'Фото чая';
    // Through the React tree these clicks still reach the popup overlay's own
    // click handler, which closes on any click outside its content.
    const contain = (e) => e.stopPropagation();

    return createPortal(
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Просмотр фото"
            onClick={(e) => { contain(e); onClose(); }}>

            <figure className="lightbox__figure" onClick={contain}>
                <img className="lightbox__image" src={photo.url} alt={label} />
                <figcaption className="lightbox__caption">
                    <span>{label}</span>
                    {list.length > 1 && (
                        <span className="lightbox__counter">{index + 1} / {list.length}</span>
                    )}
                </figcaption>
            </figure>

            {list.length > 1 && (
                <>
                    <button type="button" className="lightbox__nav lightbox__nav_prev"
                        aria-label="Предыдущее фото"
                        onClick={(e) => { contain(e); go(-1); }}>&#8249;</button>
                    <button type="button" className="lightbox__nav lightbox__nav_next"
                        aria-label="Следующее фото"
                        onClick={(e) => { contain(e); go(1); }}>&#8250;</button>
                </>
            )}

            <button type="button" className="lightbox__close" aria-label="Закрыть просмотр"
                onClick={(e) => { contain(e); onClose(); }}>&times;</button>
        </div>,
        document.body
    );
}

export default TeaPhotoLightbox;
