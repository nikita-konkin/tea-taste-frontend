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

import TeaFormStage1 from './TeaFormStage1.jsx'
import TeaFormStage2 from './TeaFormStage2.jsx'
import Login from './Login.jsx'
import Registration from './Registration.jsx'
import Profile from './Profile.jsx'
import MyForms from './MyForms.jsx'
import MyFormInteraction from './MyFormInteraction.jsx'
import Navigation from './Navigation.jsx'
import Blog from './Blog.jsx'

function handleRegistration(data){
  console.log(data)
  mainApi.handleRegistration(data.name, data.pass, data.email)
  .then(res => {
    console.log(res)
  })
  .catch(res => {console.log(res)})
}

function App() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(true)

  // setLoggedIn(true)
  const FormNavigateNextSatge = () => {
    navigate('/form_2')
  }
  const FormNavigatePrevSatge = () => {
    navigate('/form_1')
  }
  const FormNavigateToInteracion = () => {
    navigate('/my_forms/formID')
  }
  return (
    <div className="root">
      <Routes>

        <Route path = "/form_1"
        element = {
          < 
          ProtectedRoute 
          loggedIn = {loggedIn}
          component = {TeaFormStage1} 
          nextStage = {FormNavigateNextSatge}
          navigation = {Navigation}
          />
          }
        />

        <Route path = "/form_2"
        element = {
          < 
          ProtectedRoute
          loggedIn = {loggedIn}
          component = {TeaFormStage2}
          prevStage = {FormNavigatePrevSatge}
          navigation = {Navigation}
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
          <Login/>
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
