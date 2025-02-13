import React, { createContext, useState, useContext } from 'react';

const MyFormConext = createContext();

export const useMyFormConext = () => useContext(MyFormConext);

export const MyFormConextProvider = ({ children }) => {
    // const [open, setOpen] = useState(false);
    // const [content, setContent] = useState('');

    const [aromasById, setAromasById] = useState(null);
    const [tastesById, setTastesById] = useState(null);
    const [brewsById, setBrewsById] = useState(null);

    const updateAromasById = (content) => {
        // console.log(content)
        setAromasById(prev => ({
            ...prev,
            ...content
        }));
    };

    const updateTastesById = (content) => {
        setTastesById(prev => ({
            ...prev,
            ...content
        }));
    };

    const updateBrewsById = (content) => {
        setBrewsById(prev => ({
            ...prev,
            ...content
        }));
    };

    // const closePopup = () => {
    //     setOpen(false);
    //     setContent('');
    // };

    return (
        <MyFormConext.Provider value={{ aromasById, tastesById, brewsById, 
            updateAromasById, updateTastesById, updateBrewsById }}>
            {children}
        </MyFormConext.Provider>
    );
};