import React, {
  useState,
  useEffect
} from 'react'
import {
  Route,
  Routes,
  useNavigate
} from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";

import {mainApi} from "../utils/MainAPI.jsx"
import {formApi} from "../utils/FormAPI.jsx"

import TeaFormStage1 from './TeaFormStage1.jsx'
import TeaFormStage2 from './TeaFormStage2.jsx'
import MyForm from './MyForm.jsx';
import Login from './Login.jsx'
import Registration from './Registration.jsx'
import Profile from './Profile.jsx'
import MyForms from './MyForms.jsx'
import MyFormInteraction from './MyFormInteraction.jsx'
import Navigation from './Navigation.jsx'
import Blog from './Blog.jsx'

// import { FormProvider } from "./TeaFormContext";

function App() {
  
  const loggedIn = localStorage.getItem("loggedIn");

  const navigate = useNavigate();
  // const [loggedIn, setLoggedIn] = useState(false)


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log('token')
      mainApi.handleTokenValidation(token).then(data => {
        localStorage.setItem('loggedIn', true)
      }).catch(err => {
        console.log(err)
        localStorage.removeItem('token')
        localStorage.removeItem('loggedIn')
      })
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('loggedIn')
    }
  }, []);


  function handleRegistration(data){

    mainApi.handleRegistration(data.name, data.pass, data.email)
    .then(res => {
      // console.log(res)
      handleAuthorization(res)
      navigate('/form_1')
    })
    .catch(err => {console.log(err)})
  }

  function handleAuthorization(data){
    console.log(data)
    mainApi.handleAuthorization(data.email, data.password)
    .then(res => {
      // console.log(res)
      // setLoggedIn(true)
      localStorage.setItem('token', res.token);
      localStorage.setItem('loggedIn', res.ok)
      if (res.ok) {navigate('/form_1')}
    })
    .catch(err => console.log(err))
  }

  function postFormStage1(data, formId){

    formApi.postFormStage1(data, formId)
    .then(res=>{
      // console.log(res)
      // FormNavigateNextSatge()
    })
    .catch(err => console.log(err))
  }

  function postFormStage2Aroma(data, formId, brewId, aromaShadeId){
    // console.log(data)
    formApi.postFormStage2Aroma(data, formId, brewId, aromaShadeId)
    .then(res=>{
      // console.log(res)
      // FormNavigateNextSatge()
    })
    .catch(err => console.log(err))
  }
  
  function patchFormStage2Aroma(data, formId, brewId, aromaShadeId, aromaStage){
    // console.log(data)
    formApi.patchFormStage2Aroma(data, formId, brewId, aromaShadeId, aromaStage)
    .then(res=>{
      console.log(res)
      // FormNavigateNextSatge()
    })
    .catch(err => console.log(err))
  }


  function postFormStage2Taste(data, formId, brewId, tasteShadeId){
    // console.log(data)
    formApi.postFormStage2Taste(data, formId, brewId, tasteShadeId)
    .then(res=>{
      // console.log(res)
      // FormNavigateNextSatge()
    })
    .catch(err => console.log(err))
  }
  
  function patchFormStage2Taste(data, formId, brewId, tasteShadeId, tasteStage){
    // console.log(data)
    formApi.patchFormStage2Taste(data, formId, brewId, tasteShadeId, tasteStage)
    .then(res=>{
      // console.log(res)
      // FormNavigateNextSatge()
    })
    .catch(err => console.log(err))
  }  

  function postFormStage2Brew(data, formId, brewId){
    // console.log(data)
    formApi.postFormStage2Brew(data, formId, brewId)
    .then(res=>{
      // console.log(res)
      // FormNavigateNextSatge()
    })
    .catch(err => console.log(err))
  }  
  
  function patchFormStage2Brew(data, formId, brewId){
    // console.log(data)
    formApi.patchFormStage2Brew(data, formId, brewId)
    .then(res=>{
      // console.log(res)
      // FormNavigateNextSatge()
    })
    .catch(err => console.log(err))
  }

  function getAllFromAromaDB(){
    formApi.getAllFromAromaDB()
    .then(res=>{
      // console.log(res)
      localStorage.setItem('aromaDB', JSON.stringify(res))
    })
    .catch(err => console.log(err))
  }

  function getAllFromTasteDB(){
    formApi.getAllFromTasteDB()
    .then(res=>{
      // console.log(res)
      localStorage.setItem('tasteDB', JSON.stringify(res))
    })
    .catch(err => console.log(err))
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


        <Route path = "/"
        element = {
          < 
          ProtectedRoute 
          loggedIn = {loggedIn}
          />
          }
        />
        
        <Route path = "/form_1"
        element = {
          < 
          ProtectedRoute 
          loggedIn = {loggedIn}
          component = {TeaFormStage1} 
          nextStage = {FormNavigateNextSatge}
          navigation = {Navigation}
          getAllFromAromaDB = {getAllFromAromaDB}
          getAllFromTasteDB = {getAllFromTasteDB}
          
          />
          }
        />

        <Route path = "/form_2"
        element = {
          < 
          ProtectedRoute
          loggedIn = {loggedIn}
          component = {TeaFormStage2}
          nextStage = {FormNavigateToFormInteraction}
          prevStage = {FormNavigatePrevSatge}
          navigation = {Navigation}

          />
          }
        />

        <Route path = "/form_submit"
        element = {
          < 
          ProtectedRoute
          loggedIn = {loggedIn}
          component={MyFormInteraction}
          navigateAfterSubmit = {FormNavigatePrevSatge}

          postFormStage1 = {postFormStage1}
          postFormStage2Aroma = {postFormStage2Aroma}
          patchFormStage2Aroma = {patchFormStage2Aroma}
          postFormStage2Taste = {postFormStage2Taste}
          patchFormStage2Taste = {patchFormStage2Taste}
          postFormStage2Brew = {postFormStage2Brew}
          patchFormStage2Brew = {patchFormStage2Brew}
          
          />
          }
        />

        <Route path = "/profile"
        element = {
          < 
          ProtectedRoute
          loggedIn = {loggedIn}
          component = {Profile}
          />
          }
        />
        <Route path = "/my_forms"
        element = {
          < 
          ProtectedRoute
          loggedIn = {loggedIn}
          component = {MyForms}
          navigation = {FormNavigateToInteracion}
          />
          }
        />
        <Route path = "/my_forms/formID"
        element = {
          < 
          ProtectedRoute
          loggedIn = {loggedIn}
          component = {MyFormInteraction}
          />
          }
        />
        <Route path = "/blog"
        element = {
          < 
          ProtectedRoute
          loggedIn = {loggedIn}
          component = {Blog}
          />
          }
        />

        <Route path = "/sign-in"
        element = {
          <Login auth = {handleAuthorization}/>
        }
        />
        <Route path = "/sign-up"
        element = {
          <Registration auth = {handleRegistration}/>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
