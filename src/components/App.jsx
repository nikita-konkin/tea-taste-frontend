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

import TeaFormStage1 from './TeaFormStage1.jsx'
import TeaFormStage2 from './TeaFormStage2.jsx'
import Login from './Login.jsx'
import Registration from './Registration.jsx'
import Profile from './Profile.jsx'
import MyForms from './MyForms.jsx'
import Navigation from './Navigation.jsx'
import Blog from './Blog.jsx'



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
          <Registration/>
        }
        />
      </Routes>
    </div>
  );
}

export default App;
