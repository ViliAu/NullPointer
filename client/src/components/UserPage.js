import { React, useState, useEffect } from 'react';
import LinkContainer from 'react-router-bootstrap/LinkContainer';
import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import Helmet from 'react-helmet';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import CenterItem from './CenterItem';
import UserImage from './UserImage';
import LoadingSpinner from './LoadingSpinner';

const UserPage = () => {
    const [loggedIn, setLoggedIn] = useState(true);
    const [user, setUser] = useState(null);
    const { id } = useParams();

    // This func gets user on page load
    useEffect(() => {
        let mounted = true;
        // Get user data from backend API
        async function fetchUserData() {
            try {
                // Get user data by name
                let req = await fetch(`/api/user/getuser?name=${id}`);
                const data = await req.json();
                let authData = {};
                try {
                    let authReq = await fetch(`/api/user/authenticate?name=${id}`, {
                        method: 'GET',
                        headers: { 'authorization': 'Bearer ' + localStorage.getItem('auth_token') }
                    });
                    authData = await authReq.json();
                    // Token expired => delete it from localstorage
                    if (authReq.status === 401) {
                        localStorage.removeItem('auth_token');
                        setLoggedIn(false);
                    }
                }
                catch { }
                // Save user info and check if we're the same user in the page
                if (mounted) {
                    if (data.success) {
                        setUser(data.user);
                        setLoggedIn(authData.name === id)
                    }
                }
            }
            catch { }
        }
        if (id) {
            fetchUserData();
        }
        return () => {
            mounted = false;
        }
    }, [id]);

    if (user) {
        return (
            <CenterItem>
                <Helmet>
                    <title>User {user.name}</title>
                </Helmet>
                <Container id='userBody' text='light' style={{ padding: 20, marginTop: 20, backgroundColor: '#1A1C1E', borderRadius: 8 }} >
                    <Row>
                        <Col xs={'auto'}>
                            <LinkContainer to={'/users'} style={{ marginBottom: 10 }}>
                                <Button>{`← Back`}</Button>
                            </LinkContainer>
                        </Col>
                        <Col></Col>
                        <Col xs={'auto'}>
                            {loggedIn &&
                                <LinkContainer to={'settings'} style={{ marginBottom: 10 }}>
                                    <Button>{`⚙ Edit profile`}</Button>
                                </LinkContainer>}
                        </Col>
                    </Row>
                    <Container className='text-center' style={{ marginTop: 20 }}>
                        <Container style={{ padding: 20 }}>
                            <UserImage user={user} size={128} />
                        </Container>
                        <h1 className='display-3'>{user.name}</h1>
                        <hr />
                        {(user.bio.trim().length > 0) ? <p>{user.bio}</p> : <p className='text-muted'><i>User has no bio</i></p>}
                        <hr />
                        <small className='text-muted'>Registered on {DateTime.fromISO(user.registerDate).toLocaleString(DateTime.DATETIME_MED)}</small>
                    </Container>
                </Container>
            </CenterItem>
        );
    }
    else {
        return <LoadingSpinner />
    }
}

export default UserPage;
