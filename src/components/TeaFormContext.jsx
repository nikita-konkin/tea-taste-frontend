import React, { createContext, useContext, useState, useEffect } from "react";

const TeaFormContext = createContext();

const useTeaFormContext = () => useContext(TeaFormContext);

const FormProvider = ({ children }) => {
  const [teaFormData, setTeaFormData] = useState(() => {
    const savedData = localStorage.getItem("teaFormData");
    return savedData ? JSON.parse(savedData) : {};
  });

  useEffect(() => {
    // Save teaFormData to localStorage whenever it updates
    localStorage.setItem("teaFormData", JSON.stringify(teaFormData));
  }, [teaFormData]);

  const updateTeaFormData = (newData) => {
    setTeaFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const removeKeyFromTeaFormData = (keyToRemove) => {
    setTeaFormData((prevData) => {
      const newData = { ...prevData };
      delete newData[keyToRemove];
      return newData;
    });
  };

  const clearTeaFormData = () => {
    setTeaFormData({}); // Reset state to an empty object
    localStorage.removeItem("teaFormData"); // Clear from localStorage
  };

  useEffect(() => {
    console.log("Updated teaFormData:", teaFormData);
  }, [teaFormData]);

  return (
    <TeaFormContext.Provider
      value={{
        teaFormData,
        updateTeaFormData,
        // clearTeaFormData,
        removeKeyFromTeaFormData,
      }}
    >
      {children}
    </TeaFormContext.Provider>
  );
};

export { useTeaFormContext, FormProvider };
