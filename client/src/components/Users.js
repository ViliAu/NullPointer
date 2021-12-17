import { React, useEffect, useState } from 'react'
import Helmet from 'react-helmet';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import UserPreview from './UserPreview';
import LoadingSpinner from './LoadingSpinner';

// This is the user view
const User = () => {
    const [users, setUser] = useState(null);
    // Get user on load
    useEffect(() => {
        let mounted = true;
        // Get user data from backend API
        async function fetchUserData() {
            try {
                const req = await fetch(`/api/user/getuser`);
                const data = await req.json();
                if (mounted) {
                    if (data.success) {
                        setUser(data.user);
                    }
                }
            }
            catch { }
        }
        fetchUserData();
        return () => {
            mounted = false;
        }
    }, []);

    if (users) {
        return (
            <Container>
                <Helmet>
                    <title>Users</title>
                </Helmet>
                <h1 className='display-2 text-center'>All users on NullPointer</h1>
                <hr />
                <UserPreviewGrid users={users} />
            </Container>
        )
    }

    else {
        return (
            <LoadingSpinner />
        );
    }

}

const UserPreviewGrid = ({ users }) => {
    if (users.length === 0) {
        return <h1 className='display-4 text-muted'>There are currently no users on NullPointer</h1>
    }
    let userElementList = users.map((user) =>
        <Col key={user.name} sm md={4}><UserPreview user={user} /></Col>
    );
    return <Container><Row>{userElementList}</Row></Container>
}

export default User
