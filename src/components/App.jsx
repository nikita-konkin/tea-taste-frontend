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


function App() {
  // const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false)

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

      </Routes>
    </div>
  );
}

export default App;
