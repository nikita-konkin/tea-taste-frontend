import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";
import { mainApi } from "../utils/MainAPI.jsx";
import { formApi } from "../utils/FormAPI.jsx";
import TeaFormStage1 from './TeaFormStage1.jsx';
import TeaFormStage2 from './TeaFormStage2.jsx';
import Login from './Login.jsx';
import Registration from './Registration.jsx';
import Profile from './Profile.jsx';
import Forms from './Forms.jsx';
import MyFormInteraction from './MyFormInteraction.jsx';
import Navigation from './Navigation.jsx';
import Blog from './Blog.jsx';
import PopupMsg from './Popup.jsx';
import { PopupProvider, usePopup } from './PopupContext.jsx';
import { MyFormConextProvider, useMyFormConext } from './MyFormConext.jsx';

function App() {

  const navigate = useNavigate();

  return (
    <PopupProvider>
      <MyFormConextProvider>

        <AppContent navigate={navigate} />
        <PopupMsg />

      </MyFormConextProvider>
    </PopupProvider>
  );
}

function AppContent({ navigate }) {
  const { openPopup } = usePopup();
  const { updateAromasByIdCxt, updateTastesByIdCxt, updateBrewsByIdCxt, updateMyForms,
    updateRemovedFormById, updateRemovedBrewsByIdCxt, updateRemovedTastesByIdCxt, updateRemovedAromasByIdCxt
  } = useMyFormConext();

  const [loggedIn, setLoggedIn] = useState(false);
  const localStorageLoggedIn = localStorage.getItem('loggedIn') === 'true';

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && localStorageLoggedIn) {
      mainApi.handleTokenValidation(token)
        .then(data => {
          localStorage.setItem('loggedIn', true);
          setLoggedIn(true)
          navigate('/form_1');
        })
        .catch(err => {
          localStorage.removeItem('token');
          localStorage.setItem('loggedIn', false);
          setLoggedIn(false);
        });
    } else {
      localStorage.removeItem('token');
      localStorage.setItem('loggedIn', false);
      setLoggedIn(false);
    }
  }, []);


  function handleRegistration(data) {
    mainApi.handleRegistration(data.name, data.pass, data.email)
      .then(res => {
        const authData = {
          email: data.email,
          password: data.pass
        };
        return handleAuthorization(authData);
      })
      .catch(err => {
        openPopup(err.message);
      });
  }

  function handleAuthorization(data) {
    mainApi.handleAuthorization(data.email, data.password)
      .then(res => {
        if (res.ok && res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('loggedIn', res.ok);
          // document.cookie = `jwt=${res.token}; path=/; secure; HttpOnly`;
          setLoggedIn(true)
          navigate('/form_1');
        }
      })
      .catch(err => {
        openPopup(err.message);
      });
  }

  function handleLogOut() {

    mainApi.handleLogOut()
      .then(res => {
        localStorage.setItem('loggedIn', false);
        localStorage.removeItem('token');
        navigate('/sign-in');
      })
      .catch(err => {
        console.log(err);
        openPopup(err.message);
      });
  }

  function postFormStage1(data, formId) {

    formApi.postFormStage1(data, formId)
      .then(res => {
      })
      .catch(err => console.log(err))
  }

  function postFormStage2Aroma(data, formId, brewId, aromaShadeId, publicAccess) {
    formApi.postFormStage2Aroma(data, formId, brewId, aromaShadeId, publicAccess)
      .then(res => {
      })
      .catch(err => console.log(err))
  }

  function patchFormStage2Aroma(data, formId, brewId, aromaShadeId, aromaStage, publicAccess) {
    formApi.patchFormStage2Aroma(data, formId, brewId, aromaShadeId, aromaStage, publicAccess)
      .then(res => {
      })
      .catch(err => console.log(err))
  }

  function postFormStage2Taste(data, formId, brewId, tasteShadeId, publicAccess) {
    formApi.postFormStage2Taste(data, formId, brewId, tasteShadeId, publicAccess)
      .then(res => {
      })
      .catch(err => console.log(err))
  }

  function patchFormStage2Taste(data, formId, brewId, tasteShadeId, tasteStage, publicAccess) {
    formApi.patchFormStage2Taste(data, formId, brewId, tasteShadeId, tasteStage, publicAccess)
      .then(res => {
      })
      .catch(err => console.log(err))
  }

  function postFormStage2Brew(data, formId, brewId, publicAccess) {
    formApi.postFormStage2Brew(data, formId, brewId, publicAccess)
      .then(res => {
      })
      .catch(err => console.log(err))
  }

  function patchFormStage2Brew(data, formId, brewId, publicAccess) {
    formApi.patchFormStage2Brew(data, formId, brewId, publicAccess)
      .then(res => {
      })
      .catch(err => console.log(err))
  }

  async function getAllFromAromaDB() {
    await formApi.getAllFromAromaDB()
      .then(res => {
        localStorage.setItem('aromaDB', JSON.stringify(res))
      })
      .catch(err => console.log(err))
  }

  async function getAllFromTasteDB() {
    await formApi.getAllFromTasteDB()
      .then(res => {
        localStorage.setItem('tasteDB', JSON.stringify(res))
      })
      .catch(err => console.log(err))
  }

  async function getAllMyForms() {
    await formApi.getAllMyForms()
      .then(res => {
        localStorage.setItem('myForms', JSON.stringify(res))
        updateMyForms(res)
      })
      .catch(err => { console.log(err) })
  }

  async function getAllMyBrewingsById(id) {
    await formApi.getAllMyBrewingsById(id)
      .then(res => {
        localStorage.setItem(`brews_${id}`, JSON.stringify(res))
        updateBrewsByIdCxt(res)
      })
      .catch(err => { console.log(err) })
  }

  async function getAllMyTastesById(id) {
    await formApi.getAllMyTastesById(id)
      .then(res => {
        localStorage.setItem(`tastes_${id}`, JSON.stringify(res))
        updateTastesByIdCxt(res)
      })
      .catch(err => { console.log(err) })
  }

  async function getAllMyAromasById(id) {
    await formApi.getAllMyAromasById(id)
      .then(res => {
        localStorage.setItem(`aromas_${id}`, JSON.stringify(res))
        updateAromasByIdCxt(res)

      })
      .catch(err => { console.log(err) })
  }

  async function delMyFormById(id) {
    await formApi.delMyFormById(id)
      .then(res => {
        updateRemovedFormById(true)
        getAllMyForms()
      })
      .catch(err => { console.log(err) })
  }

  async function delMyBrewsById(id) {
    await formApi.delMyBrewsById(id)
      .then(res => {
        updateRemovedBrewsByIdCxt(true)
      })
      .catch(err => { console.log(err) })
  }

  async function delMyTastesById(id) {
    await formApi.delMyTastesById(id)
      .then(res => {
        updateRemovedTastesByIdCxt(true)
      })
      .catch(err => { console.log(err) })
  }

  async function delMyAromasById(id) {
    await formApi.delMyAromasById(id)
      .then(res => {
        updateRemovedAromasByIdCxt(true)
      })
      .catch(err => { console.log(err) })
  }

  const FormNavigateNextSatge = () => {
    navigate('/form_2')
  }
  const FormNavigatePrevSatge = () => {
    navigate('/form_1')
  }
  const FormNavigateToInteracion = () => {
    navigate('/my_forms/formID')
  }
  const FormNavigateToFormInteraction = () => {
    navigate('/form_submit')
  }


  return (
    <div className="root">
      <Routes>
        <Route path="/" element={<ProtectedRoute loggedIn={loggedIn} />} />
        <Route path="/form_1" element={<ProtectedRoute loggedIn={loggedIn} localStorageLoggedIn={localStorageLoggedIn} component={TeaFormStage1} nextStage={FormNavigateNextSatge} navigation={Navigation} getAllFromAromaDB={getAllFromAromaDB} getAllFromTasteDB={getAllFromTasteDB} />} />
        <Route path="/form_2" element={<ProtectedRoute loggedIn={loggedIn} localStorageLoggedIn={localStorageLoggedIn} component={TeaFormStage2} nextStage={FormNavigateToFormInteraction} prevStage={FormNavigatePrevSatge} navigation={Navigation} />} />
        <Route path="/form_submit" element={<ProtectedRoute loggedIn={loggedIn} localStorageLoggedIn={localStorageLoggedIn} component={MyFormInteraction} navigateAfterSubmit={FormNavigatePrevSatge} postFormStage1={postFormStage1} postFormStage2Aroma={postFormStage2Aroma} patchFormStage2Aroma={patchFormStage2Aroma} postFormStage2Taste={postFormStage2Taste} patchFormStage2Taste={patchFormStage2Taste} postFormStage2Brew={postFormStage2Brew} patchFormStage2Brew={patchFormStage2Brew} />} />
        <Route path="/profile" element={<ProtectedRoute loggedIn={loggedIn} localStorageLoggedIn={localStorageLoggedIn} component={Profile} handleLogout={handleLogOut} />} />
        <Route path="/my_forms" element={<ProtectedRoute localStorageLoggedIn={localStorageLoggedIn}
          loggedIn={loggedIn}
          component={Forms}
          isMyForms={true}
          isBlog={false}
          navigation={FormNavigateToInteracion}
          formsById={getAllMyForms}
          brewingsById={getAllMyBrewingsById}
          tastesById={getAllMyTastesById}
          aromasById={getAllMyAromasById}
          delFormById={delMyFormById}
          delBrewsById={delMyBrewsById}
          delTastesById={delMyTastesById}
          delAromasById={delMyAromasById}
        />} />
          <Route path="/blog" element={<ProtectedRoute localStorageLoggedIn={localStorageLoggedIn}
          loggedIn={loggedIn}
          component={Forms}
          isMyForms={false}
          isBlog={true}
          navigation={FormNavigateToInteracion}
          allForms={getAllMyForms}
          allBrewings={getAllMyBrewingsById}
          allTastes={getAllMyTastesById}
          allAromas={getAllMyAromasById}
          // delMyFormById={delMyFormById}
          // delMyBrewsById={delMyBrewsById}
          // delMyTastesById={delMyTastesById}
          // delMyAromasById={delMyAromasById}
        />} />
        {/* <Route path="/blog" element={<ProtectedRoute loggedIn={loggedIn} localStorageLoggedIn={localStorageLoggedIn} component={Blog} />} /> */}
        <Route path="/sign-in" element={<Login auth={handleAuthorization} />} />
        <Route path="/sign-up" element={<Registration auth={handleRegistration} />} />
      </Routes>
    </div>
  );
}

export default App;
