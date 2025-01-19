import React, { createContext, useContext, useState, useEffect } from "react";
// import crypto from "crypto-browserify";

const TeaFormContext = createContext();

const useTeaFormContext = () => useContext(TeaFormContext);

const FormProvider = ({ children }) => {
  const [straitsStagesFormData, setStraitsStagesFormData] = useState(() => {
    const savedData = localStorage.getItem("straitsStagesFormData");
    return savedData ? JSON.parse(savedData) : {};
  });

  const [aromaStagesFormData, setAromaStagesFormData] = useState(() => {
    const savedData = localStorage.getItem("aromaStagesFormData");
    return savedData ? JSON.parse(savedData) : {};
  });

  const [tasteStagesFormData, setTasteStagesFormData] = useState(() => {
    const savedData = localStorage.getItem("tasteStagesFormData");
    return savedData ? JSON.parse(savedData) : {};
  });

  useEffect(() => {
    localStorage.setItem("straitsStagesFormData", JSON.stringify(straitsStagesFormData));
  }, [straitsStagesFormData]);

  useEffect(() => {
    localStorage.setItem("aromaStagesFormData", JSON.stringify(aromaStagesFormData));
  }, [aromaStagesFormData]);

  useEffect(() => {
    localStorage.setItem("tasteStagesFormData", JSON.stringify(tasteStagesFormData));
  }, [tasteStagesFormData]);

  const updateStraitsStagesFormData = (newData) => {
    setStraitsStagesFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const updateAromaStagesFormData = (newData) => {
    setAromaStagesFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const updateTasteStagesFormData = (newData) => {
    setTasteStagesFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const clearTeaFormData = () => {
    setStraitsStagesFormData({});
    setAromaStagesFormData({});
    setTasteStagesFormData({});
    localStorage.removeItem("straitsStagesFormData");
    localStorage.removeItem("aromaStagesFormData");
    localStorage.removeItem("tasteStagesFormData");
  };

  // const formID = crypto.randomBytes(16).toString("hex");

  useEffect(() => {
    console.log("Updated straitsStagesFormData:", straitsStagesFormData);
    console.log("Updated aromaStagesFormData:", aromaStagesFormData);
    console.log("Updated tasteStagesFormData:", tasteStagesFormData);
  }, [straitsStagesFormData, aromaStagesFormData, tasteStagesFormData]);

  return (
    <TeaFormContext.Provider
      value={{
        straitsStagesFormData,
        updateStraitsStagesFormData,
        aromaStagesFormData,
        updateAromaStagesFormData,
        tasteStagesFormData,
        updateTasteStagesFormData,
        clearTeaFormData,
        // formID,
      }}
    >
      {children}
    </TeaFormContext.Provider>
  );
};

export { useTeaFormContext, FormProvider };
