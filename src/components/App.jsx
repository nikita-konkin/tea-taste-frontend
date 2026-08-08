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
import PublicForm from './PublicForm.jsx';
import Landing from './Landing.jsx';
import { LOCALES, LOCALE_PREFIX, localizePath, useLocalizedNavigate } from '../i18n/index.js';
import ResetPassword from './ResetPassword.jsx';
import VkAuthDone from './VkAuthDone.jsx';
import Admin from './Admin.jsx';
import MyFormInteraction from './MyFormInteraction.jsx';
import Navigation from './Navigation.jsx';
// import Blog from './Blog.jsx';
import PopupMsg from './Popup.jsx';
import { PopupProvider, usePopup } from './PopupContext.jsx';
import { MyFormConextProvider, useMyFormConext } from './MyFormConext.jsx';

function App() {

  // Locale-aware: every navigate() below is written as a bare Russian path, and
  // this is what keeps a reader in /en or /zh when the app moves them.
  const navigate = useLocalizedNavigate();
  // The raw one, for the single case that is deliberately changing language:
  // the sign-in landing. Passing an already-localized path to `navigate` above
  // would not work — it strips the prefix and re-applies the current one.
  const navigateTo = useNavigate();

  return (
    <PopupProvider>
      <MyFormConextProvider>

        <AppContent navigate={navigate} navigateTo={navigateTo} />
        <PopupMsg />

      </MyFormConextProvider>
    </PopupProvider>
  );
}

function AppContent({ navigate, navigateTo }) {
  const { openPopup } = usePopup();
  const { updateAromasByIdCxt, updateTastesByIdCxt, updateBrewsByIdCxt, updateMyForms,
    updateRemovedFormById, updateRemovedBrewsByIdCxt, updateRemovedTastesByIdCxt, 
    updateRemovedAromasByIdCxt
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
          // navigate(-1);
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
          // The one moment the saved language is applied. Signing in is a move
          // into the account, so the account's language decides where it lands;
          // reading a page is not, so no other navigation consults this. An
          // account that never chose (`''` — everyone who predates the setting)
          // stays in whatever language they were already reading.
          if (res.language) {
            navigateTo(localizePath('/form_1', res.language));
          } else {
            navigate('/form_1');
          }
        }
      })
      .catch(err => {
        openPopup(err.message);
      });
  }

  function handleLogOut() {

    // Clear local auth state even if /sign-out fails (e.g. the cookie has
    // already expired) — otherwise the user stays "logged in" locally.
    mainApi.handleLogOut()
      .catch(err => console.log(err))
      .finally(() => {
        localStorage.setItem('loggedIn', false);
        localStorage.removeItem('token');
        setLoggedIn(false);
        navigate('/sign-in');
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

  async function getAllPublicForms(params = {}) {
    await formApi.getAllPublicForms(params)
      .then(res => {
        localStorage.setItem('publicForms', JSON.stringify(res))
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

  async function getPublicBrewingsById(id) {
    await formApi.getPublicBrewingsById(id)
      .then(res => {
        localStorage.setItem(`publicBrews_${id}`, JSON.stringify(res))
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

  async function getPublicTastesById(id) {
    await formApi.getPublicTastesById(id)
      .then(res => {
        localStorage.setItem(`publicTastes_${id}`, JSON.stringify(res))
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

  async function getPublicAromasById(id) {
    await formApi.getPublicAromasById(id)
      .then(res => {
        localStorage.setItem(`publicAromas_${id}`, JSON.stringify(res))
        updateAromasByIdCxt(res)
      })
      .catch(err => { console.log(err) })
  }

  // Full update of a saved tea form; refreshes the list on success.
  // Errors are re-thrown so the edit dialog can show them.
  async function patchMyFormById(id, body) {
    return formApi.patchMyFormById(id, body)
      .then(res => {
        getAllMyForms()
        return res
      })
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


  // The route table, written once and mounted once per language.
  //
  // Every path also exists under /en and /zh (LOCALE_PREFIX), so a language has
  // real addresses that can be linked to and indexed — the same reason the
  // feed's filters moved into the URL. Building it as an array rather than
  // repeating the JSX three times keeps the prop lists in one place; getting
  // them out of step between languages is exactly the bug this avoids.
  const routes = [
    /* A real page, not a redirect. `/` was <Navigate to="/blog">, which meant
       the site's most important URL served no HTML, no text and no links —
       nothing that does not run JavaScript could follow it, and a visitor
       arriving from a search landed in a wall of tasting cards with no sentence
       saying what any of it was. /blog is still the one address of the feed. */
    { path: '/', element: <Landing /> },
    { path: '/form_1', element: <ProtectedRoute loggedIn={loggedIn} localStorageLoggedIn={localStorageLoggedIn} component={TeaFormStage1} nextStage={FormNavigateNextSatge} navigation={Navigation} getAllFromAromaDB={getAllFromAromaDB} getAllFromTasteDB={getAllFromTasteDB} /> },
    { path: '/form_2', element: <ProtectedRoute loggedIn={loggedIn} localStorageLoggedIn={localStorageLoggedIn} component={TeaFormStage2} nextStage={FormNavigateToFormInteraction} prevStage={FormNavigatePrevSatge} navigation={Navigation} /> },
    { path: '/form_submit', element: <ProtectedRoute loggedIn={loggedIn} localStorageLoggedIn={localStorageLoggedIn} component={MyFormInteraction} navigateAfterSubmit={FormNavigatePrevSatge} postFormStage1={postFormStage1} postFormStage2Aroma={postFormStage2Aroma} patchFormStage2Aroma={patchFormStage2Aroma} postFormStage2Taste={postFormStage2Taste} patchFormStage2Taste={patchFormStage2Taste} postFormStage2Brew={postFormStage2Brew} patchFormStage2Brew={patchFormStage2Brew} /> },
    { path: '/profile', element: <ProtectedRoute loggedIn={loggedIn} localStorageLoggedIn={localStorageLoggedIn} component={Profile} handleLogout={handleLogOut} /> },
    { path: '/admin', element: <ProtectedRoute loggedIn={loggedIn} localStorageLoggedIn={localStorageLoggedIn} component={Admin} /> },
    {
      path: '/my_forms',
      element: <ProtectedRoute localStorageLoggedIn={localStorageLoggedIn}
        loggedIn={loggedIn}
        component={Forms}
        isMyForms={true}
        isBlog={false}
        navigation={FormNavigateToInteracion}
        forms={getAllMyForms}
        brewingsById={getAllMyBrewingsById}
        tastesById={getAllMyTastesById}
        aromasById={getAllMyAromasById}
        delFormById={delMyFormById}
        delBrewsById={delMyBrewsById}
        delTastesById={delMyTastesById}
        delAromasById={delMyAromasById}
        patchFormById={patchMyFormById}
      />,
    },
    {
      path: '/blog',
      element: <Forms localStorageLoggedIn={localStorageLoggedIn}
        isMyForms={false}
        isBlog={true}
        navigation={FormNavigatePrevSatge}
        forms={getAllPublicForms}
        brewingsById={getPublicBrewingsById}
        tastesById={getPublicTastesById}
        aromasById={getPublicAromasById}
      />,
    },
    /* One page per tea type, with an address of its own — the feed's filter
       used to be component state, so a type could not be linked to or indexed.
       Declared before /blog/:sessionId so «type» matches as the literal segment
       it is rather than as a tasting's slug. */
    {
      path: '/blog/type/:typeSlug',
      element: <Forms localStorageLoggedIn={localStorageLoggedIn}
        isMyForms={false}
        isBlog={true}
        navigation={FormNavigatePrevSatge}
        forms={getAllPublicForms}
        brewingsById={getPublicBrewingsById}
        tastesById={getPublicTastesById}
        aromasById={getPublicAromasById}
      />,
    },
    { path: '/blog/:sessionId', element: <PublicForm /> },
    { path: '/reset-password', element: <ResetPassword /> },
    { path: '/oauth/vk', element: <VkAuthDone /> },
    { path: '/sign-in', element: <Login auth={handleAuthorization} /> },
    { path: '/sign-up', element: <Registration auth={handleRegistration} /> },
  ];

  return (
    <div className="root">
      <Routes>
        {LOCALES.map((locale) => routes.map(({ path, element }) => {
          // '/' under a prefix is '/en', not '/en/' — one address per page.
          const prefix = LOCALE_PREFIX[locale];
          const full = path === '/' ? (prefix || '/') : `${prefix}${path}`;
          return <Route key={`${locale}:${path}`} path={full} element={element} />;
        }))}
      </Routes>
    </div>
  );
}

export default App;
