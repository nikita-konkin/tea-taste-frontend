import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FormButton from './FormButton.jsx';
import FormEdit from './FormEdit.jsx';
import { RaitingPial } from './TeaRaiting.jsx';
import TeaPhotoGallery from './TeaPhotoGallery.jsx';
import TeaPhotoLightbox from './TeaPhotoLightbox.jsx';
import { orderPhotos } from './TeaPhotos.jsx';
import { usePopup } from './PopupContext.jsx';
import { useMyFormConext } from './MyFormConext.jsx';
import { v4 as uuidv4 } from 'uuid';
import { set } from 'react-hook-form';

function Form({
    formData,
    brewingsById,
    aromasById,
    tastesById,
    removeFormFromArrById,
    patchFormById,
    isMyForms
}) {
    const { openPopup } = usePopup();
    const { aromasByIdCxt, tastesByIdCxt, brewsByIdCxt } = useMyFormConext();
    const navigate = useNavigate();
    const brewsRender = useRef([]);
    const [openDetails, setOpenDetails] = React.useState(false);
    const [viewingPhotos, setViewingPhotos] = React.useState(false);

    // Public forms arrive with owner populated ({name, avatar}); own forms
    // carry plain ids — show the author chip only when the data is there.
    // Handles both the current single-object owner and the legacy array shape.
    const rawOwner = Array.isArray(formData.owner) ? formData.owner[0] : formData.owner;
    const author = rawOwner && typeof rawOwner === 'object' ? rawOwner : null;

    const authorChip = () => {
        if (!author || !author.name) return null;
        const avatarStyle = {
            width: '22px', height: '22px', borderRadius: '50%',
            objectFit: 'cover', flexShrink: 0,
        };
        return (
            <div className="myform__author" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                margin: '0 0 6px 0', fontSize: '14px', opacity: 0.9,
            }}>
                {author.avatar ? (
                    <img src={author.avatar} alt="" style={avatarStyle}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                    <span aria-hidden="true" style={{
                        ...avatarStyle, display: 'inline-flex', alignItems: 'center',
                        justifyContent: 'center', background: '#96B295',
                        color: '#ffffff', fontSize: '12px',
                    }}>{author.name.charAt(0).toUpperCase()}</span>
                )}
                <span>{author.name}</span>
            </div>
        );
    };

    useEffect(() => {

        if (aromasByIdCxt != null && tastesByIdCxt != null && brewsByIdCxt != null && openDetails) {
            brewsRender.current = brewingsContent(formData.sessionId);
            openPopup(popupContent(brewsRender.current));
        }
    }, [aromasByIdCxt, tastesByIdCxt, brewsByIdCxt]);

    // Card thumbnail: always the first filled slot in dry -> liquor -> wet
    // order, so the picture does not change when another slot is added later.
    // Tapping it opens the whole set full screen, starting from this one.
    const cardPhotos = orderPhotos(formData.photos);

    const cardThumb = () => {
        if (cardPhotos.length === 0) return null;
        return (
            <button type="button" className="myform__media"
                aria-label={`Открыть фото во весь экран: ${formData.nameRU}`}
                onClick={(e) => { e.preventDefault(); setViewingPhotos(true); }}>
                <img className="myform__media-image" src={cardPhotos[0].url} alt=""
                    onError={(e) => { e.target.closest('button').style.display = 'none'; }} />
            </button>
        );
    };

    // Compact read-only summary rating (averageRating) as a row of bowls.
    const summaryRating = () => {
        const r = Number(formData.averageRating);
        if (!r || r < 1) return null;
        return (
            <div className="myform__rating" aria-label={`Оценка ${r} из 10`} style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap',
                gap: '2px', margin: '6px 0 14px 0',
            }}>
                {Array.from({ length: 10 }, (_, i) => (
                    <RaitingPial key={i} active={i < r} width={17} height={11} />
                ))}
                <span style={{ marginLeft: '6px', fontSize: '14px', color: '#d8f5cc', fontWeight: 600 }}>
                    {r}/10
                </span>
            </div>
        );
    };

    // One descriptor record -> its readable path, stages strictly in 1-2-3
    // order, empty/'none' stages skipped.
    const descriptorPath = (rec, prefix) =>
        [1, 2, 3]
            .map((n) => rec[`${prefix}${n}`])
            .filter((v) => v && v !== 'none')
            .join(' → ');

    const chipStyle = {
        display: 'inline-block',
        background: 'rgba(255, 255, 255, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '999px',
        padding: '3px 12px',
        margin: '3px 6px 3px 0',
        fontSize: '14px',
    };

    const brewSectionStyle = {
        border: '1px solid rgba(255, 255, 255, 0.20)',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        padding: '10px 12px',
        margin: '10px 0',
        listStyle: 'none',
    };

    const accentStyle = { color: '#d8f5cc', fontWeight: 600 };

    const brewingsContent = (sessionId) => {
        const brews = [...brewsByIdCxt.data].sort((a, b) => a.brewingCount - b.brewingCount);

        return brews.map((brew) => {
            const aromaPaths = aromasByIdCxt.data
                .filter((a) => a.brewingCount === brew.brewingCount)
                .sort((a, b) => a.aromaCount - b.aromaCount)
                .map((a) => descriptorPath(a, 'aromaStage'))
                .filter(Boolean);
            const tastePaths = tastesByIdCxt.data
                .filter((t) => t.brewingCount === brew.brewingCount)
                .sort((a, b) => a.tasteCount - b.tasteCount)
                .map((t) => descriptorPath(t, 'tasteStage'))
                .filter(Boolean);

            return (
                <li key={`brew-${brew.brewingCount}`} style={brewSectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={accentStyle}>Пролив №{brew.brewingCount}</span>
                        {brew.brewingRating != null && <span>{brew.brewingRating}/10 пиал</span>}
                    </div>
                    {brew.brewingTime && brew.brewingTime !== 'none' && brew.brewingTime !== '00:00:00' && (
                        <div style={{ margin: '4px 0 0 0' }}>Время заваривания: {brew.brewingTime}</div>
                    )}
                    {brew.description && brew.description !== 'none' && (
                        <div style={{ margin: '4px 0 0 0', fontStyle: 'italic' }}>{brew.description}</div>
                    )}
                    {aromaPaths.length > 0 && (
                        <div style={{ margin: '8px 0 0 0' }}>
                            <span style={accentStyle}>Аромат</span><br />
                            {aromaPaths.map((p, i) => <span key={`a-${i}`} style={chipStyle}>{p}</span>)}
                        </div>
                    )}
                    {tastePaths.length > 0 && (
                        <div style={{ margin: '8px 0 0 0' }}>
                            <span style={accentStyle}>Вкус</span><br />
                            {tastePaths.map((p, i) => <span key={`t-${i}`} style={chipStyle}>{p}</span>)}
                        </div>
                    )}
                </li>
            );
        });
    };

    const popupContent = (test) => {
        const metaRow = (label, value) =>
            value !== undefined && value !== null && value !== '' && value !== 'none' ? (
                <li key={label} className="myforminteraction__row" style={{ padding: '1px 0' }}>
                    <bdi style={{ opacity: 0.75 }}>{label}: </bdi>{value}
                </li>
            ) : null;

        return (
            <section key={formData.sessionId} className="myforminteraction__section">
                <h3 style={{ margin: '0 0 2px 0', fontSize: '20px' }}>{formData.nameRU}</h3>
                <TeaPhotoGallery photos={formData.photos} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0 0 10px 0' }}>
                    <span style={{ opacity: 0.85, fontSize: '14px' }}>
                        {[author && author.name, formData.createdAt && new Date(formData.createdAt).toLocaleDateString('ru-RU')]
                            .filter(Boolean).join(' · ')}
                    </span>
                    {formData.averageRating != null && (
                        <span style={accentStyle}>{formData.averageRating}/10 пиал</span>
                    )}
                </div>
                <ul className="myforminteraction__list" style={{ margin: 0, padding: 0 }}>
                    {metaRow('Тип чая', formData.type)}
                    {metaRow('Страна', formData.country)}
                    {metaRow('Магазин', formData.shop)}
                    {metaRow('Вес', formData.weight != null ? `${formData.weight} г` : null)}
                    {metaRow('Вода', formData.water)}
                    {metaRow('Объем воды', formData.volume != null ? `${formData.volume} мл` : null)}
                    {metaRow('Температура воды', formData.temperature != null ? `${formData.temperature} °C` : null)}
                    {metaRow('Цена за грамм', formData.price != null ? `${formData.price} ₽` : null)}
                    {metaRow('Посуда', formData.teaware)}
                    {metaRow('Метод заваривания', formData.brewingtype)}
                    {metaRow('Публикация в блоге', formData.publicAccess ? 'да' : 'нет')}
                    {test}
                </ul>
            </section>
        );
    };

    const formButtons = () => {
        if (isMyForms) {
            return (
                <>
                    <FormButton
                        buttonName={'Удалить'}
                        width={'32%'}
                        margin={'0px'}
                        onClick={() => {
                            // deleteForm();
                            removeFormFromArrById(formData.sessionId)
                        }}
                    />
                    <FormButton
                        buttonName={'Изменить'}
                        width={'32%'}
                        margin={'0px'}
                        onClick={(e) => {
                            e.preventDefault();
                            openPopup(
                                <FormEdit
                                    formData={formData}
                                    patchFormById={patchFormById}
                                />
                            );
                        }}
                    />
                    <FormButton
                        buttonName={'Просмотр'}
                        width={'32%'}
                        margin={'0px'}
                        onClick={(e) => {
                            e.preventDefault();
                            brewingsById(formData.sessionId);
                            aromasById(formData.sessionId);
                            tastesById(formData.sessionId);
                            setOpenDetails(true);
                        }}
                    />
                </>
            )
        }
        else {
            return (
                <>
                    <FormButton
                        buttonName={'Просмотр'}
                        width={'49%'}
                        margin={'0px'}
                        onClick={(e) => {
                            e.preventDefault();
                            brewingsById(formData.sessionId);
                            aromasById(formData.sessionId);
                            tastesById(formData.sessionId);
                            setOpenDetails(true);
                        }}
                    />
                    <FormButton
                        buttonName={'Открыть'}
                        width={'49%'}
                        margin={'0px'}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/blog/${formData.sessionId}`);
                        }}
                    />
                </>
            )
        }
    }

    return (
        <section className="myform" key={formData.sessionId}>
            {authorChip()}
            <div className="myform__body">
                {cardThumb()}
                <ul className="myform__list">
                    <li key={uuidv4()} className="myform__row"><bdi>Название: </bdi>{formData.nameRU}</li>
                    <li key={uuidv4()} className="myform__row"><bdi>Дата публикации: </bdi>{
                        formData.createdAt
                            ? new Date(formData.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                            : ''
                    }</li>
                    <li key={uuidv4()} className="myform__row"><bdi>Тип чая: </bdi>{formData.type}</li>
                </ul>
            </div>
            {summaryRating()}
            <div className="myform__buttons">
                {formButtons()}
            </div>
            {viewingPhotos && (
                <TeaPhotoLightbox photos={cardPhotos} onClose={() => setViewingPhotos(false)} />
            )}
        </section>
    );
}

export default Form;