import React from 'react'

import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/Container';

const LoadingSpinner = () => {
    return (
        <Container className='text-center' style={{ padding: 20, marginTop: 20 }}>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Container >
    )
}

export default LoadingSpinner
