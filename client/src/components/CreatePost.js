import { React, useState, useEffect } from 'react';
import Highlight from 'react-highlight';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';

import RedirectComponent from './RedirectComponent';

const Create = () => {
    const [code, setCode] = useState('');
    const [preview, setPreview] = useState(false);
    const [validated, setValidated] = useState(false);
    const [redirect, setRedirect] = useState('');

    // Update the preview text and code snippet box
    const updateCode = () => {
        const codetextBox = document.getElementById('formCode');
        // Resize text box
        codetextBox.style.overflow = 'hidden';
        codetextBox.style.height = 0;
        codetextBox.style.height = codetextBox.scrollHeight + 'px';

        // Set values
        const codeString = codetextBox.value;
        setCode(codeString);
    }

    // Toggle between preview and input
    const renderPreview = (eventkey) => {
        setPreview(eventkey !== '1');
    }

    // Handles form submitting
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
        let post = {};
        post.title = document.getElementById('formTitle').value;
        post.text = document.getElementById('formText').value;
        post.code = code;

        // Pass values to server
        let data = {};
        try {
            const res = await fetch('/api/post', {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + localStorage.getItem('auth_token') },
                body: JSON.stringify(post)
            })
            data = await res.json();
        }
        catch { }

        // Form was valid but credentials incorrect
        // TODO: Nicer looking message
        if (!data.success) {
            if (data.error) {
                alert(data.error);
            }
            event.stopPropagation();
            setValidated(false);
            return;
        }

        // reload window to apply changes
        else {
            setRedirect('/posts/' + data.id);
        }
    }

    return (
        <Container text='light' style={{ padding: 20, marginTop: 20, backgroundColor: '#1A1C1E', borderRadius: 8 }} >
            <h1>Create a post</h1>
            <Form noValidate validated={validated} className='postForm' onSubmit={handleSubmit} autoComplete='off'>
                <Form.Group className='mb-3' controlId='formTitle'>
                    <Form.Label>Post title</Form.Label>
                    <Form.Control type='text' placeholder="Insert the topic of your post here" required />
                    <Form.Control.Feedback type='invalid'>The post needs to have a topic.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className='mb-3' controlId="formText">
                    <Form.Label>Post text</Form.Label>
                    <Form.Control as='textarea' placeholder="Describe your problem" rows={8} required />
                    <Form.Control.Feedback type='invalid'>The post needs to have text.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className='mb-3' controlId='formCode'>
                    <Form.Label>Post code</Form.Label>
                    <Nav variant='tabs' defaultActiveKey='1' bg='dark' onSelect={renderPreview}>
                        <Nav.Item>
                            <Nav.Link eventKey='1'><Form.Label>Raw</Form.Label></Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey='2'><Form.Label>Preview</Form.Label></Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <CodeInput preview={preview} updateCode={updateCode} code={code} />
                </Form.Group>
                <Button variant='primary' type='submit'>
                    Submit
                </Button>
            </Form>
            <RedirectComponent redirect={redirect} />
        </Container>
    );
}

const CodeInput = ({ preview, updateCode, code }) => {
    useEffect(() => {
        if (!preview)
            updateCode();
    });
    if (preview) {
        return (
            <Highlight>{code}</Highlight>
        );
    }
    else {
        return (
            <pre><code><Form.Control as="textarea" placeholder="Insert your code snippet here" defaultValue={code} onKeyUp={() => { updateCode() }} style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 0 }} /></code></pre>
        );
    }
}

export default Create;