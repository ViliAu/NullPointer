import React from 'react';
import {Link} from 'react-router-dom';
import { DateTime } from 'luxon';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';

import UserImage from './UserImage';

const UserPreview = ({ user }) => {

    // Take user bio and limit it to 50 characters long
    let bio = (user.bio.trim().length === 0) ? <p className='text-muted'><i>User has no bio</i></p> : <p>{user.bio.substring(0, 47) + (user.bio.substring(0, 47).length === 47 ? '...' : '')}</p>;

    return (
        <Link to={user.name} style={{ textDecoration: 'none' }}>
            <Container id='postBody' text='light' style={{ padding: 20, marginTop: 20, backgroundColor: '#1A1C1E', borderRadius: 8, border: '', color: 'rgb(240, 240, 240)' }} >
                <Row>
                    <Col xs={'auto'}>
                        <UserImage user={user} />
                    </Col>
                    <Col>
                        <Stack gap={2}>
                            <h5>{user.name}</h5>
                            {bio}
                            <small className='text-muted'>Registered: {DateTime.fromISO(user.registerDate).toLocaleString(DateTime.DATETIME_MED)}</small>
                        </Stack>
                    </Col>
                </Row>
            </Container>
        </Link>

    )
}

UserPreview.defaultProps = {
    user: {
        name: 'Defaultuser',
        bio: 'Default bio',
        image: 'none',
        registerDate: new Date().toDateString()
    }
}

export default UserPreview;
