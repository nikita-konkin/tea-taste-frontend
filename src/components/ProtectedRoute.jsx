import React from 'react';
import { Navigate } from "react-router-dom";

import { FormProvider } from "./TeaFormContext";

const ProtectedRoute = ({ component: Component, ...props }) => {

  return (
    
    props.loggedIn ? <FormProvider> <Component {...props} /> </FormProvider> : <Navigate to="/sign-in" />
    
  )
};

export default ProtectedRoute;

