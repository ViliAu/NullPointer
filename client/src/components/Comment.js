import { React, useState, useEffect } from 'react';
import { DateTime } from 'luxon';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Rating from './Rating';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {Link} from 'react-router-dom';

import UserImage from './UserImage';
import LoadingSpinner from './LoadingSpinner';

const Comment = ({ comment, user }) => {
    const [editing, setEditing] = useState(false);
    const [validated, setValidated] = useState(false);
    const [author, setAuthor] = useState(null);

    // Calculate comment rating and check user rating
    let userRating = 0;
    let rating = 0;
    for (let r of comment.ratings) {
        if (user) {
            if (r.author === user._id) {
                userRating = r.rating;
            }
        }
        rating += r.rating;
    }

    const changeEditMode = () => {
        setEditing(!editing);
        setValidated(false);
    }

    // Fetch comment author data
    useEffect(() => {
        let mounted = true;
        async function fetchPost() {
            try {
                const authorReq = await fetch(`/api/user/getuser?id=${comment.author}`);
                const authorData = await authorReq.json();
                if (mounted) {
                    if (authorReq.ok) {
                        setAuthor(authorData.user);
                    }
                }
            }
            catch { }
        }
        fetchPost();
        return () => {
            mounted = false;
        }
    }, [comment]);

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
        let commentObj = {};
        commentObj.title = document.getElementById('formTitle').value;
        commentObj.text = document.getElementById('formText').value;

        // Pass values to server
        let data = {};
        try {
            const res = await fetch('/api/post/edit?id=' + comment._id, {
                method: 'PATCH',
                headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + localStorage.getItem('auth_token') },
                body: JSON.stringify(commentObj)
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

        // Reload window to apply updates due to time constraints
        else {
            window.location.reload();
        }
    }

    const deleteComment = async () => {
        let data = {};
        try {
            const res = await fetch('/api/post?id=' + comment._id, {
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
            window.location.reload();
        }
    }

    if (!editing) {
        if (author) {
            return (
                <Container id='postBody' text='light' style={{ padding: 20, marginTop: 20, backgroundColor: '#1A1C1E', borderRadius: 8 }} >
                    <Row>
                        <Col></Col>
                        <Col xs={'auto'}>{(user && (user._id === comment.author || user.admin)) && <Button style={{ marginBottom: 10 }} onClick={changeEditMode}>{`✎ Edit/Delete comment`}</Button>}</Col>
                    </Row>
                    <Row>
                        <Col>
                            <h3 id='postHeader'>{comment.title}</h3>
                            <Row>
                                <Col xs={'auto'} style={{ marginRight: -15 }}>{'By:  '}</Col>
                                <Col xs={'auto'} style={{ marginRight: -15 }}>
                                <Link to={'/users/' + author.name} style={{ textDecoration: 'none', color: 'rgb(240, 240, 240)' }}><UserImage user={author} size={25} className={'align-top'} includeName /></Link>
                                </Col>
                                <Col></Col>
                                <Col xs={'auto'}>
                                    <p className='text-muted align-bottom' id='postTimestamp' style={{ fontSize: 12 }}>Last edited: {DateTime.fromISO(comment.lastEdited).toLocaleString(DateTime.DATETIME_MED)}</p>
                                </Col>
                                <hr />
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={'auto'}>
                            <Rating user={user} rating={rating} userRating={userRating} id={comment._id} />
                        </Col>
                        <Col>
                            <Container id='postBody'>
                                {comment.text}
                            </Container>
                        </Col>
                    </Row>
                </Container >
            );
        }
        else {
            return <LoadingSpinner />
        }
    }
    else {
        return (
            <Container id='postBody' text='light' style={{ padding: 20, marginTop: 20, backgroundColor: '#1A1C1E', borderRadius: 8 }} >
                <Row>
                    <Col></Col>
                    <Col xs={'auto'}>{(user && (user._id === comment.author)) && <Button style={{ marginBottom: 10 }} onClick={changeEditMode}>{`X Cancel editing`}</Button>}</Col>
                </Row>
                <Row>
                    <Form noValidate validated={validated} className='postForm' onSubmit={handleSubmit} autoComplete='off'>
                        <Form.Group className="mb-3" controlId="formTitle">
                            <Form.Control as="textarea" rows={1} required placeholder={'Comment subject'} defaultValue={comment.title} />
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3" controlId="formText">
                            <Form.Control as="textarea" rows={3} required placeholder={'Comment text'} defaultValue={comment.text} />
                        </Form.Group>
                        <Row>
                            <Col xs={'auto'}><Button type='submit' variant='success'>{`✔ Apply changes`}</Button></Col>
                            <Col></Col>
                            <Col xs={'auto'}><Button variant='danger' onClick={deleteComment}>{`🗑 Delete comment`}</Button></Col>
                        </Row>
                    </Form>
                </Row>
            </Container >
        );
    }
}

export default Comment;