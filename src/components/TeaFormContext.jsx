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

	const maxLastStageNumberFnc = (aromaStagesFormData, tasteStagesFormData, straitsStagesFormData) => {

    const obj1_len = Object.keys(straitsStagesFormData).length
		const obj2_len = Object.keys(aromaStagesFormData).length
		const obj3_len = Object.keys(tasteStagesFormData).length

		const maxLenObj = Math.max(obj1_len, obj2_len, obj3_len)
		
		if (maxLenObj != 0) {
      const lastStageNumber1 = obj1_len ? Object.keys(straitsStagesFormData)[obj1_len-1].split('').map(Number)[0] : 0
      const LastStageNumber2 = obj2_len ? Object.keys(aromaStagesFormData)[obj2_len-1].split('').map(Number)[0] : 0
      const LastStageNumber3 = obj3_len ? Object.keys(tasteStagesFormData)[obj3_len-1].split('').map(Number)[0] : 0

      return Math.max(lastStageNumber1, LastStageNumber2, LastStageNumber3)
    } else {
      return 0
    }
	}

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
        maxLastStageNumberFnc,
        // formID,
      }}
    >
      {children}
    </TeaFormContext.Provider>
  );
};

export { useTeaFormContext, FormProvider };
