import React, { createContext, useState, useContext } from 'react';

const MyFormConext = createContext();

export const useMyFormConext = () => useContext(MyFormConext);

export const MyFormConextProvider = ({ children }) => {

    const [aromasByIdCxt, setAromasByIdCxt] = useState(null);
    const [tastesByIdCxt, setTastesByIdCxt] = useState(null);
    const [brewsByIdCxt, setBrewsByIdCxt] = useState(null);

    const [myForms, setMyForms] = useState(null);

    const [removedFormById, setRemovedFormById] = useState(false);
    const [removedBrewsByIdCxt, setRemovedBrewsByIdCxt] = useState(false);
    const [removedTastesByIdCxt, setRemovedTastesByIdCxt] = useState(false);
    const [removedAromasByIdCxt, setRemovedAromasByIdCxt] = useState(false);

    const updateAromasByIdCxt = (content) => {
        // console.log(content)
        setAromasByIdCxt(prev => ({
            ...prev,
            ...content
        }));
    };

    const updateTastesByIdCxt = (content) => {
        setTastesByIdCxt(prev => ({
            ...prev,
            ...content
        }));
    };

    const updateBrewsByIdCxt = (content) => {
        setBrewsByIdCxt(prev => ({
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
    const updateRemovedBrewsByIdCxt = (content) => {
        setRemovedBrewsByIdCxt(content);
    };
    const updateRemovedTastesByIdCxt = (content) => {
        setRemovedTastesByIdCxt(content);
    };
    const updateRemovedAromasByIdCxt = (content) => {
        setRemovedAromasByIdCxt(content);
    };

    return (
        <MyFormConext.Provider value={{ aromasByIdCxt, tastesByIdCxt, brewsByIdCxt, myForms,
            updateAromasByIdCxt, updateTastesByIdCxt, updateBrewsByIdCxt, updateMyForms,
            removedFormById, removedBrewsByIdCxt, removedTastesByIdCxt, removedAromasByIdCxt,
            updateRemovedFormById, updateRemovedBrewsByIdCxt, updateRemovedTastesByIdCxt, updateRemovedAromasByIdCxt }}>
            {children}
        </MyFormConext.Provider>
    );
};