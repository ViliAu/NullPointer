import {React, useState} from 'react';
import { useParams } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

const CommentForm = () => {
    const [validated, setValidated] = useState(false);
    const {id} = useParams();
    const loggedIn = localStorage.getItem('auth_token') !== null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        // First, check validity locally, then post data and check validity on backend
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        // Create user obj to pass to the server
        let comment = {};
        comment.title = document.getElementById('formTitle').value;
        comment.text = document.getElementById('formText').value;
        comment.id = id

        // Pass values to server
        let data = {};
        try {
            const res = await fetch('/api/post/comment', {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + localStorage.getItem('auth_token') },
                body: JSON.stringify(comment)
            })
            data = await res.json();
            console.log(data);
        }
        catch { }

        // Form was valid but credentials incorrect
        if (!data.success) {
            if (data.error) {
                alert(data.error);
            }
            event.stopPropagation();
            setValidated(true);
            return;
        }

        else {
            window.location.reload();
        }
    }
    if (loggedIn) {
        return (
            <Container id='commentForm' text='light' style={{ padding: 20, marginTop: 20, backgroundColor: '#1A1C1E', borderRadius: 8 }} >
                <Row>
                    <Col>
                        <h5 id='commentHeader'>Write a comment</h5>
                    </Col>
                </Row>
                <hr />
                <Form noValidate validated={validated} className='postForm' onSubmit={handleSubmit} autoComplete='off'>
                    <Form.Group className="mb-3" controlId="formTitle">
                        <Form.Label>Comment subject</Form.Label>
                        <Form.Control as="textarea" rows={1} required/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formText">
                        <Form.Label>Comment text</Form.Label>
                        <Form.Control as="textarea" rows={3} required/>
                    </Form.Group>
                    <Button type='submit'>Submit</Button>
                </Form>
            </Container>
        );
    }
    else {
        return (
            <h1 className='display-4 text-center'>Log in to join the discussion!</h1>
        );
    }
}

export default CommentForm;