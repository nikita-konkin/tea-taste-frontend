import React, {
  useState,
  // useEffect
} from 'react'
import {
  Route,
  Routes,
  // useNavigate
} from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";

import TeaForm from './Teaform.jsx'
import Login from './Login.jsx'
import Registration from './Registration.jsx'


function App() {
  // const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(true)

  // setLoggedIn(true)

  return (
    <div className="root">
      <Routes>

        <Route path = "/"
        element = {
          < 
          ProtectedRoute loggedIn = {
            loggedIn
          }

          component = {
            TeaForm
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
