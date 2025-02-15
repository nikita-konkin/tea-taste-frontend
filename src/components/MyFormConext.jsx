import React, { createContext, useState, useContext } from 'react';

const MyFormConext = createContext();

export const useMyFormConext = () => useContext(MyFormConext);

export const MyFormConextProvider = ({ children }) => {
    // const [open, setOpen] = useState(false);
    // const [content, setContent] = useState('');

    const [aromasById, setAromasById] = useState(null);
    const [tastesById, setTastesById] = useState(null);
    const [brewsById, setBrewsById] = useState(null);

    const [myForms, setMyForms] = useState(null);

    const [removedFormById, setRemovedFormById] = useState(false);
    const [removedBrewsById, setRemovedBrewsById] = useState(false);
    const [removedTastesById, setRemovedTastesById] = useState(false);
    const [removedAromasById, setRemovedAromasById] = useState(false);

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

    const updateMyForms = (content) => {
        setMyForms(prev => ({
            ...prev,
            ...content
        }));
    };

    const updateRemovedFormById = (content) => {
        setRemovedFormById(content);
    };
    const updateRemovedBrewsById = (content) => {
        setRemovedBrewsById(content);
    };
    const updateRemovedTastesById = (content) => {
        setRemovedTastesById(content);
    };
    const updateRemovedAromasById = (content) => {
        setRemovedAromasById(content);
    };


    // const closePopup = () => {
    //     setOpen(false);
    //     setContent('');
    // };

    return (
        <MyFormConext.Provider value={{ aromasById, tastesById, brewsById, myForms,
            updateAromasById, updateTastesById, updateBrewsById, updateMyForms,
            removedFormById, removedBrewsById, removedTastesById, removedAromasById,
            updateRemovedFormById, updateRemovedBrewsById, updateRemovedTastesById, updateRemovedAromasById }}>
            {children}
        </MyFormConext.Provider>
    );
};