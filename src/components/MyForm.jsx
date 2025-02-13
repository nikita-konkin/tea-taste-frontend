import React, { useEffect, useRef } from 'react';
import FormButton from './FormButton.jsx';
import { usePopup } from './PopupContext.jsx';
import { useMyFormConext } from './MyFormConext.jsx';
import { v4 as uuidv4 } from 'uuid';

function MyForm({
    formData,
    getAllMyBrewingsById,
    getAllMyAromasById,
    getAllMyTastesById,
    delMyFormById,
    delMyBrewsById,
    delMyTastesById,
    delMyAromasById,
    getAllMyForms,
    removeFormFromArrById,
}) {
    const { openPopup } = usePopup();
    const { aromasById, tastesById, brewsById } = useMyFormConext();
    const brewsRender = useRef([]);

    useEffect(() => {
        if (aromasById != null && tastesById != null && brewsById != null) {
            brewingsContent(formData.sessionId);
            openPopup(popupContent);
        }
    }, [aromasById, tastesById, brewsById]);

    const deleteForm = () => {
        delMyFormById(formData.sessionId);
        delMyBrewsById(formData.sessionId);
        delMyTastesById(formData.sessionId);
        delMyAromasById(formData.sessionId);

        removeFormFromArrById(formData.sessionId);

        if (localStorage.getItem(`brews_${formData.sessionId}`)) {
            localStorage.removeItem(`brews_${formData.sessionId}`);
        }
        if (localStorage.getItem(`aromas_${formData.sessionId}`)) {
            localStorage.removeItem(`aromas_${formData.sessionId}`);
        }
        if (localStorage.getItem(`tastes_${formData.sessionId}`)) {
            localStorage.removeItem(`tastes_${formData.sessionId}`);
        }
        localStorage.removeItem(`myForms`);

        getAllMyForms();
    };

    const brewingsContent = (sessionId) => {
        const brewsLocalData = JSON.parse(localStorage.getItem(`brews_${sessionId}`)) || [];
        const aromasLocalData = JSON.parse(localStorage.getItem(`aromas_${sessionId}`)) || [];
        const tastesLocalData = JSON.parse(localStorage.getItem(`tastes_${sessionId}`)) || [];

        const tempArr = [];

        const renderAromasAndTastes = (data, straitNum, aromas = false, tastes = false) => {
            let placeHolder = aromas ? 'аромата' : 'вкуса';
            tempArr.push(
                <li className="myforminteraction__row" key={uuidv4()}><bdi>{`Оттенки ${placeHolder}`}: </bdi></li>
            );
            for (let i = 0; i < data.length; i++) {
                if (data[i].brewingCount === straitNum) {
                    const obj = aromas ? aromasById.data[i] : tastesById.data[i];
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key) && key.includes('Stage')) {
                            tempArr.push(
                                <li className="myforminteraction__row" key={uuidv4()}><bdi>{`${straitNum}.${key.split('').slice(-1)})`}: </bdi>{obj[key]}</li>
                            );
                        }
                    }
                }
            }
        };

        for (let index = 0; index < brewsById.data.length; index++) {
            const brew = brewsById.data[index];
            tempArr.push(
                <li className="myforminteraction__row" key={uuidv4()}><bdi>{`Пролив №`}</bdi>{brew.brewingCount}</li>
            );

            renderAromasAndTastes(aromasById.data, brew.brewingCount, true, false);
            renderAromasAndTastes(tastesById.data, brew.brewingCount, false, true);

            tempArr.push(
                <React.Fragment key={uuidv4()}>
                    <li className="myforminteraction__row"><bdi>{`Время заваривания: `}</bdi>{brew.brewingTime}</li>
                    <li className="myforminteraction__row"><bdi>{`Описание: `}</bdi>{brew.description}</li>
                    <li className="myforminteraction__row"><bdi>{`Рейтинг пролива: `}</bdi>{brew.brewingRating}</li>
                </React.Fragment>
            );
        }

        brewsRender.current = tempArr;
    };

    const popupContent = () => {
        return (
            <section key={formData.sessionId} className="myforminteraction__section">
                <ul className="myforminteraction__list">
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Название: </bdi>{formData.nameRU != null ? formData.nameRU : ''}</li>
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Тип чая: </bdi>{formData.type != null ? formData.type : ''}</li>
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Страна: </bdi>{formData.country != null ? formData.country : ''}</li>
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Вес: </bdi>{formData.weight} г</li>
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Вода: </bdi>{formData.water != null ? formData.water : ''}</li>
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Объем воды: </bdi>{formData.volume} мл</li>
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Температура воды: </bdi>{formData.temperature} oC</li>
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Цена чая за грамм: </bdi>{formData.price} ₽</li>
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Посуда: </bdi>{formData.teaware != null ? formData.teaware : ''}</li>
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Метод заваривания: </bdi>{formData.brewingtype != null ? formData.brewingtype : ''}</li>
                    <li key={uuidv4()} className="myforminteraction__row"><bdi>Дата публикации: </bdi>{formData.createdAt}</li>
                    {brewsRender.current}
                </ul>
            </section>
        );
    };

    return (
        <section className="myform" key={formData.sessionId}>
            <ul className="myform__list">
                <li key={uuidv4()} className="myform__row"><bdi>Название: </bdi>{formData.nameRU}</li>
                <li key={uuidv4()} className="myform__row"><bdi>Дата публикации: </bdi>{formData.createdAt}</li>
                <li key={uuidv4()} className="myform__row"><bdi>Тип чая: </bdi>{formData.type}</li>
            </ul>
            <div className="myform__buttons">
                <FormButton
                    buttonName={'Удалить'}
                    width={'32%'}
                    margin={'0px'}
                    onClick={() => {
                        deleteForm();
                    }}
                />
                <FormButton
                    buttonName={'Изменить'}
                    width={'32%'}
                    margin={'0px'}
                />
                <FormButton
                    buttonName={'Просмотр'}
                    width={'32%'}
                    margin={'0px'}
                    onClick={() => {
                        getAllMyBrewingsById(formData.sessionId);
                        getAllMyAromasById(formData.sessionId);
                        getAllMyTastesById(formData.sessionId);
                    }}
                />
            </div>
        </section>
    );
}

export default MyForm;