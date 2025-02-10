import React from 'react';
import { Navigate } from "react-router-dom";
// import { PopupProvider } from './PopupContext.jsx';

const ProtectedRoute = ({ component: Component, ...props }) => {

  return (
    
    props.loggedIn ? 
    <Component {...props} />  : 
    <Navigate to="/sign-in" />
    
  )
};

export default ProtectedRoute;

