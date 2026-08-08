import React, { useState } from 'react';
import { PHOTO_SLOTS, orderPhotos } from './TeaPhotos.jsx';
import TeaPhotoLightbox from './TeaPhotoLightbox.jsx';
import { useT } from '../i18n/index.js';

const LABELS = PHOTO_SLOTS.reduce((acc, s) => ({ ...acc, [s.kind]: s.label }), {});

const rowStyle = {
    display: 'flex',
    gap: '8px',
    margin: '0 0 12px 0',
    padding: 0,
    listStyle: 'none',
};

// Sized in fractions rather than pixels so all three stay on one row inside the
// narrow detail popup, and cap out instead of stretching on the public page.
const figureStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    margin: 0,
    flex: '1 1 0',
    minWidth: 0,
    maxWidth: '130px',
};

const buttonStyle = {
    display: 'block',
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'zoom-in',
};

const imageStyle = {
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    display: 'block',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
};

// Same mint as the picker's captions (.teaphotos__caption) — one slot label,
// one colour, wherever it is shown.
const captionStyle = { fontSize: '12px', color: '#a8f493' };

// Read-only photo strip for the detail popup, the public page and the review
// step. Inline-styled to match the surfaces it sits on, which are inline-styled
// throughout; a missing file hides its figure rather than showing a broken icon.
function TeaPhotoGallery({ photos }) {
    const { t } = useT();
    const [viewing, setViewing] = useState(null);
    const list = orderPhotos(photos);
    if (list.length === 0) return null;

    return (
        <>
            <ul style={rowStyle}>
                {list.map((photo, i) => {
                    // LABELS holds message keys (PHOTO_SLOTS), not text.
                    const label = LABELS[photo.kind] ? t(LABELS[photo.kind]) : t('photo.fallback');
                    return (
                        <li key={photo.url} style={figureStyle}>
                            <button type="button" style={buttonStyle}
                                aria-label={t('card.openPhotos', { name: label })}
                                onClick={() => setViewing(i)}>
                                <img src={photo.url} alt={label} style={imageStyle}
                                    loading="lazy" decoding="async"
                                    onError={(e) => { e.target.closest('li').style.display = 'none'; }} />
                            </button>
                            <span style={captionStyle}>{label}</span>
                        </li>
                    );
                })}
            </ul>
            {viewing !== null && (
                <TeaPhotoLightbox photos={list} startIndex={viewing} onClose={() => setViewing(null)} />
            )}
        </>
    );
}

export default TeaPhotoGallery;
