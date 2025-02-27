import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { usePopup } from './PopupContext';

export default function PopupMsg() {
    const { open, content, closePopup } = usePopup();

    return (
        <>
            <Popup open={open}
                modal nested closeOnDocumentClick
                contentStyle={{ width: '80%', maxWidth: '600px', background: 'none', border: 'none' }}
                onClose={closePopup}>
                {
                    close => (
                        <div className='popup'>
                            {/* <h5 className='popup__content-header'></h5> */}
                            <div className='popup__content'>

                                {content
                                    ? content
                                    : '...'}

                            </div>
                            <button className='popup__close-btn' onClick=
                                {() => {
                                    close()
                                }}>
                                &times;
                            </button>
                        </div>
                    )
                }
            </Popup>
        </>
    )
};
