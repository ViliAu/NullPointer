import React from 'react';
import { Navigate } from 'react-router-dom';

// Wrapper component for navigate component
const RedirectComponent = ({redirect}) => {
    return (redirect !== '') && <Navigate to={redirect} />
}

export default RedirectComponent
