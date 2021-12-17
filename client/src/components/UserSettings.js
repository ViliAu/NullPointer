import { React, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LinkContainer from 'react-router-bootstrap/LinkContainer';

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';

import CenterItem from './CenterItem';
import RedirectComponent from './RedirectComponent';
import AlertComponent from './AlertComponent';

const UserSettings = () => {
    const [user, setUser] = useState(null);
    const [redirect, setRedirect] = useState('');
    const [password, setPassword] = useState(false);
    const [validated, setValidated] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [error, setError] = useState('');

    let newPswdVisible = false;

    const { id } = useParams();

    // Get user from authentication api so that the view is not visible to non-auth and wrong people
    useEffect(() => {
        let mounted = true;
        // Get user data from backend API
        async function fetchUserData() {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setUser(null);
                setRedirect('/login');
                return;
            }
            try {
                const req = await fetch(`/api/user/authenticate?name=${id}`, {
                    method: 'GET',
                    headers: { 'authorization': 'Bearer ' + token }
                });
                if (mounted) {
                    // Unauthorized (token may be expired)
                    if (req.status === 401) {
                        setUser(null);
                        setRedirect('/');
                    }
                    // Authorized
                    else {
                        const userData = await req.json();
                        setUser(userData);
                    }
                }
            }
            catch { }
        }
        fetchUserData();
        return () => {
            mounted = false;
        }
    }, [id]);

    const updatePassword = (event) => {
        const pswd = event.currentTarget;
        setPassword(pswd.value);
    }

    const changeNewPasswordVisibility = () => {
        newPswdVisible = !newPswdVisible;
        document.getElementById('formNewPassword').type = newPswdVisible ? 'text' : 'password';
        document.getElementById('formConfirmNewPassword').type = newPswdVisible ? 'text' : 'password';
        const pswdBtn = document.getElementById('newPswdButton');
        pswdBtn.querySelector('img').src = newPswdVisible ? '/eye.svg' : '/eye_closed.svg';
    }

    const checkFormValidity = async (event) => {
        // Prevent page reload and default html validation
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            event.preventDefault();
            setValidated(true);
            return;
        }
        const newName = document.getElementById('formUsername').value;

        // Check if name already exists
        let data = null;
        if (user.name !== newName) {
            try {
                const res = await fetch(`/api/user/getuser?name=${newName}`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(user)
                })
                data = await res.json();
            }
            catch { }
        }
        // The backend didn't accept our request => parse error
        if (data && !data.success) {
            if (data.error) {
                setError(data.error);
                setShowAlert(true);
            }
            event.stopPropagation();
            setValidated(false);
            return;
        }
        else {
            if (form.checkValidity()) {
                await updateUser();
                setValidated(true);
            }
        }
    }

    const updateUser = async () => {
        // Upload image
        const imgID = await uploadImage();

        // Construct user object
        let userData = {}
        userData.name = document.getElementById('formUsername').value;
        userData.password = document.getElementById('formNewPassword').value;
        userData.bio = document.getElementById('formBio').value;
        userData.image = imgID.id;
        try {
            const res = await fetch(`/api/user/updateuser?id=${user._id}`, {
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + localStorage.getItem('auth_token')
                },
                body: JSON.stringify(userData)
            });
            const resData = await res.json();
            if (!resData.success) {
                if (resData.error) {
                    setError(resData.error);
                    setShowAlert(true);
                }
                setValidated(false);
                return;
            }
            // Use vanilla redirect to refresh navbar
            else {
                window.location.href = `/users/${userData.name}`;
            }
        }
        catch { }
    }

    // Uploads the user image to image backend api
    const uploadImage = async () => {
        let file = document.getElementById("formImage").files[0];
        if (!file) {
            return '';
        }
        let data = new FormData();
        data.append('image', file);
        let res = null;
        try {
            res = await fetch("/api/image/", {
                method: "post",
                body: data
            });
        }
        catch (e) {
            console.log(e);
            return '';
        }
        if (res.ok) {
            return await res.json();
        }
        else {
            return '';
        }
    }

    return (
        <CenterItem md={6}>
            <Container text='light' style={{ padding: 30, marginTop: 20, backgroundColor: '#1A1C1E', borderRadius: 8 }} >
                <LinkContainer to={`/users/${id}`} style={{ marginBottom: 10 }}>
                    <Button>{`← Back`}</Button>
                </LinkContainer>
                <h1>Edit profile</h1>
                <Form className='settingsForm' noValidate validated={validated} onSubmit={checkFormValidity} autoComplete='off' >
                    <Form.Group className="mb-3" controlId="formUsername">
                        <Form.Label>Username <small className='text-muted'>Required</small></Form.Label>
                        <Form.Control type="text" placeholder="Enter a username" required defaultValue={user ? user.name : ''} pattern={'^[a-zA-Z\\d]{3,15}$'} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBio">
                        <Form.Label>Bio <small className='text-muted'>Optional</small></Form.Label>
                        <Form.Control as="textarea" placeholder="Enter a quick summary about yourself" rows={8} defaultValue={user ? user.bio : ''} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formNewPassword">
                        <Form.Label>New password <small className='text-muted'>Optional</small></Form.Label>
                        <InputGroup className='mb-3'>
                            <Form.Control type="password" placeholder="Password" pattern={'^$|^((?=.*[a-z])(?=.*[A-Z])|(?=.*\\d)|(?=.*[!@#$%^&?]))[a-zA-Z\\d!@#$%^&?]{8,20}$'} onKeyUp={updatePassword}/>
                            <Button variant="outline-secondary" id="newPswdButton" onClick={changeNewPasswordVisibility}><img alt='' src='/eye_closed.svg' width={25} height={25} /></Button>
                            <Form.Control.Feedback type='invalid'>
                                Password must be either empty or contain between 8-20 characters and must contain a capital letter or a number or a special character (!@#$%^&?).
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type='valid'>
                                Password must be either empty or contain between 8-20 characters and must contain a capital letter or a number or a special character (!@#$%^&?).
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formConfirmNewPassword">
                        <Form.Label>Confirm new password</Form.Label>
                        <Form.Control type="password" placeholder="Repeat password" pattern={`^${password}$`} />
                        <Form.Control.Feedback type="invalid">Passwords do not match.</Form.Control.Feedback>
                        <Form.Control.Feedback type="valid">Passwords match.</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group noValidate controlId="formImage" className="mb-3">
                        <Form.Label>Profile image <small className='text-muted'>Optional</small></Form.Label>
                        <Form.Control type="file" />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
                <AlertComponent header={'Error!'} message={error} show={showAlert} setShowAlert={setShowAlert} />
            </Container>
            <RedirectComponent redirect={redirect} />
        </CenterItem>
    );
}

export default UserSettings
