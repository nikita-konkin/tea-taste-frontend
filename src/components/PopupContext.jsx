import React, { createContext, useState, useContext } from 'react';

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');

    const openPopup = (content) => {
        setContent(content);
        setOpen(true);
    };

    const closePopup = () => {
        setOpen(false);
        setContent('');
    };

    return (
        <PopupContext.Provider value={{ open, content, openPopup, closePopup }}>
            {children}
        </PopupContext.Provider>
    );
};