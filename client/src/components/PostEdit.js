import { React, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Highlight from 'react-highlight';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import LinkContainer from 'react-router-bootstrap/LinkContainer';

import RedirectComponent from './RedirectComponent';
import LoadingSpinner from './LoadingSpinner';

const PostEdit = () => {
    const [post, setPost] = useState(null);
    const [code, setCode] = useState(null);
    const [preview, setPreview] = useState(false);
    const [validated, setValidated] = useState(false);
    const [redirect, setRedirect] = useState('');

    const { id } = useParams();

    // Get user from authentication api so that the view is not visible to non-auth and wrong people
    useEffect(() => {
        let mounted = true;
        async function fetchPost() {
            try {
                const postReq = await fetch(`/api/post/postdata?id=${id}`);
                const postData = await postReq.json();

                // Get user from token and see if we are allowed on this site
                try {
                    const req = await fetch(`/api/user/authenticate?id=${postData.post.author}`, {
                        method: 'GET',
                        headers: { 'authorization': 'Bearer ' + localStorage.getItem('auth_token') }
                    });
                    if (req.status === 401) {
                        setRedirect(`/posts/?id=${id}`);
                    }
                }
                catch { }

                if (mounted) {
                    if (postReq.ok) {
                        setPost(postData.post);
                        setCode(postData.post.code ? postData.post.code : '');
                    }
                }
            }
            catch { }
        }
        fetchPost();
        return () => {
            mounted = false;
        }
    }, [id]);

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

    const renderPreview = (eventkey) => {
        setPreview(eventkey !== '1');
    }

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
            const res = await fetch('/api/post/edit?id=' + id, {
                method: 'PATCH',
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
            setValidated(true);
            return;
        }

        // Save token to localstorage
        else {
            setRedirect('/posts/' + id);
        }
    }

    const deletePost = async () => {
        let data = {};
        try {
            const res = await fetch('/api/post?id=' + id, {
                method: 'DELETE',
                headers: { 'authorization': 'Bearer ' + localStorage.getItem('auth_token') },
            })
            data = await res.json();
        }
        catch { }

        if (!data.success) {
            if (data.error) {
                alert(data.error);
            }
            return;
        }
        else {
            setRedirect('/posts/');
        }
    }

    if (post && code !== null) {
        return (
            <Container text='light' style={{ padding: 20, marginTop: 20, backgroundColor: '#1A1C1E', borderRadius: 8 }} >
                <Row>
                    <Col>
                        <LinkContainer to={'/posts/' + id} style={{ marginBottom: 10 }}>
                            <Button >{`← Back`}</Button>
                        </LinkContainer>
                    </Col>
                </Row>
                <h1>Edit post</h1>
                <Form noValidate validated={validated} className='postForm' onSubmit={handleSubmit} autoComplete='off'>
                    <Form.Group className='mb-3' controlId='formTitle'>
                        <Form.Label>Post title</Form.Label>
                        <Form.Control type='text' placeholder="Insert the topic of your post here" required defaultValue={post.title} />
                        <Form.Control.Feedback type='invalid'>The post needs to have a topic.</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className='mb-3' controlId="formText">
                        <Form.Label>Post text</Form.Label>
                        <Form.Control as='textarea' placeholder="Describe your problem" rows={8} required defaultValue={post.text} />
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
                    <Row>
                        <Col xs={'auto'}>
                            <Button variant='primary' type='submit'>
                                Submit
                            </Button>
                        </Col>
                        <Col></Col>
                        <Col xs={'auto'}>
                            <Button variant='danger' onClick={deletePost}>
                                Delete post
                            </Button>
                        </Col>
                    </Row>
                </Form>
                <RedirectComponent redirect={redirect} />
            </Container>
        );
    }
    else {
        return <LoadingSpinner />
    }

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

export default PostEdit;
