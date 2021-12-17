import React from 'react';
import Helmet from 'react-helmet';
import Container from 'react-bootstrap/Container';
import CenterItem from './CenterItem';

const NotFound = () => {
    return (
        <Container className='text-center'>
            <Helmet>
                <title>Site nout found!</title>
            </Helmet>
            <CenterItem>
                <img
                    alt=''
                    src='/logo.svg'
                />
            </CenterItem>
            <h1>404 - Site doesn't exist<br/><a href='/'>Home</a></h1>
        </Container>
    )
}

export default NotFound;
