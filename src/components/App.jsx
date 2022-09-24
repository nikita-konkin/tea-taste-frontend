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


function App() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(true)

  // setLoggedIn(true)
  function FormNavigateNextSatge() {
    useEffect(()=>{navigate('/form_2')},[])
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

          />
        }
        />

        <Route path = "/form_2"
        element = {
          < 
          ProtectedRoute loggedIn = {
            loggedIn
          }
          component = {
            TeaFormStage2
          } 
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
