import { React, useState } from 'react';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import CenterItem from './CenterItem';
import Helmet from 'react-helmet';
import RedirectComponent from './RedirectComponent';
import InputGroup from 'react-bootstrap/InputGroup';

import AlertComponent from './AlertComponent';

const Register = () => {
    const [validated, setValidated] = useState(false);
    const [redirect, setRedirect] = useState('');
    const [password, setPassword] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [error, setError] = useState('');

    let pswdVisible = false;

    // Handles the validation and data sending after the form has been submitted
    const checkFormValidity = async (event) => {
        // Prevent page reload and default html validation
        event.preventDefault();

        // First, check validity locally, then post data and check validity on backend
        document.getElementById('pswdHelpText').style.display = 'none';
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            event.preventDefault();
            setValidated(true);
            return;
        }
        // Create user obj to pass to the server
        let user = {};
        user.name = document.getElementById('formUsername').value;
        user.password = document.getElementById('formPassword').value;

        // Server side check
        let data = {};
        try {
            const res = await fetch('/api/user/register', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(user)
            })
            data = await res.json();
        }
        catch { }

        // The backend didn't accept our request => parse error
        if (!data.success) {
            event.stopPropagation();
            setValidated(false);
            if (data.error) {
                setError(data.error);
                setShowAlert(true);
            }
        }
        // Success
        else {
            setRedirect('/login');
        }
    }

    // Updates the password matching string (for the confirm password field)
    const updatePassword = (event) => {
        const pswd = event.currentTarget;
        setPassword(pswd.value);
    }

    // Toggles password field between plaintext and password
    const changePasswordVisibility = () => {
        pswdVisible = !pswdVisible;
        document.getElementById('formPassword').type = pswdVisible ? 'text' : 'password';
        document.getElementById('formConfirmPassword').type = pswdVisible ? 'text' : 'password';
        const pswdBtn = document.getElementById('pswdButton');
        pswdBtn.querySelector('img').src = pswdVisible ? '/eye.svg' : '/eye_closed.svg';
    }

    return (
        <>
            <Helmet>
                <title>Register user</title>
            </Helmet>
            <Container className='text-center'>
                <img
                    alt=''
                    src='/logo.svg'
                />
                <h1 className='display-3 text-center'>Register</h1>
            </Container>

            <CenterItem md={5}>
                <Form noValidate validated={validated} onSubmit={checkFormValidity} autoComplete='off' style={{ marginBottom: 25 }}>

                    <Form.Group className="mb-3" controlId="formUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Username" required pattern={'^[a-zA-Z\\d]{3,15}$'} />
                        <Form.Control.Feedback id='usernameFeedback' type="invalid">Username must be 3-15 characters long and contain only letters and numbers</Form.Control.Feedback>
                        <Form.Control.Feedback type="valid">Correct name.</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <InputGroup className='mb-3' hasValidation>
                            <Form.Control type="password" placeholder="Password" required pattern={'^((?=.*[a-z])(?=.*[A-Z])|(?=.*\\d)|(?=.*[!@#$%^&?]))[a-zA-Z\\d!@#$%^&?]{8,20}$'} onKeyUp={updatePassword} />
                            <Button variant="outline-secondary" id="pswdButton" onClick={changePasswordVisibility}><img alt='' src='/eye_closed.svg' width={25} height={25} /></Button>
                            <Form.Control.Feedback type='invalid'>
                                Password must be between 8-20 characters and must contain a capital letter or a number or a special character (!@#$%^&?).
                            </Form.Control.Feedback>
                            <Form.Control.Feedback type='valid'>
                                Password must be between 8-20 characters and must contain a capital letter or a number or a special character (!@#$%^&?).
                            </Form.Control.Feedback>
                        </InputGroup>
                        <Form.Text id='pswdHelpText' className="text-muted">
                            Password must be between 8-20 characters and must contain a capital letter or a number or a special character (!@#$%^&?).
                        </Form.Text>

                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formConfirmPassword">
                        <Form.Label>Confirm password</Form.Label>
                        <Form.Control type="password" placeholder="Repeat password" required pattern={`^${password}$`} />
                        <Form.Control.Feedback type="invalid">Passwords do not match.</Form.Control.Feedback>
                        <Form.Control.Feedback type="valid">Passwords match.</Form.Control.Feedback>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
                <AlertComponent header={'Error!'} message={error} show={showAlert} setShowAlert={setShowAlert} />
            </CenterItem>
            <RedirectComponent redirect={redirect} />
        </>
    );
}

export default Register;
