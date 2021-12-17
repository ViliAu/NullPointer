import { React, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LinkContainer from 'react-router-bootstrap/LinkContainer';
import Helmet from 'react-helmet';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import UserImage from './UserImage';
import LoadingSpinner from './LoadingSpinner';

import { DateTime } from 'luxon';
import Highlight from "react-highlight";
import CommentForm from './CommentForm'
import Comment from './Comment';
import Rating from './Rating';
import { Link } from 'react-router-dom';

const Post = () => {
    const [user, setUser] = useState(null);
    const [post, setPost] = useState(null);
    const [author, setAuthor] = useState(null);
    const [comments, setComments] = useState(null);
    const [userRating, setUserRating] = useState(0);
    const [postRating, setPostRating] = useState(null);
    const { id } = useParams();

    // Fetch post and comments
    useEffect(() => {
        let mounted = true;
        async function fetchPost() {
            try {
                // Get user from token
                let userData = null;
                try {
                    const req = await fetch('/api/user/authenticate', {
                        method: 'GET',
                        headers: { 'authorization': 'Bearer ' + localStorage.getItem('auth_token') }
                    });
                    userData = await req.json();
                    setUser(userData);
                    // Expired token => remove it
                    if (req.status === 401) {
                        localStorage.removeItem('auth_token');
                    }
                }
                catch { }

                const postReq = await fetch(`/api/post/postdata?id=${id}`);
                const postData = await postReq.json();

                const authorReq = await fetch(`/api/user/getuser?id=${postData.post.author}`);
                const authorData = await authorReq.json();
                
                // Setup post, ratings and user data
                if (mounted) {
                    if (postReq.ok) {
                        setPost(postData.post);
                        setPostRating(postData.rating);
                        setAuthor(authorData.user);
                        setComments(postData.comments.map((comment =>
                            <Comment key={comment._id} comment={comment} user={userData} />
                        )));
                        if (userData) {
                            for (let r of postData.post.ratings) {
                                if (r.author === userData._id) {
                                    setUserRating(r.rating);
                                    break;
                                }
                            }
                        }
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

    if (post && author) {
        return (
            <Container>
                <Helmet>
                    <title>Posts</title>
                </Helmet>
                <Container id='postBody' text='light' style={{ padding: 20, marginTop: 20, backgroundColor: '#1A1C1E', borderRadius: 8 }} >
                    <Row>
                        <Col>
                            <LinkContainer to={'/posts'} style={{ marginBottom: 10 }}>
                                <Button >{`← Back`}</Button>
                            </LinkContainer>
                        </Col>
                        <Col></Col>
                        <Col xs={'auto'}>
                            {(user && (user._id === author._id || user.admin)) && <LinkContainer to={'edit'} style={{ marginBottom: 10 }}>
                                <Button >{`✎ Edit/Delete post`}</Button>
                            </LinkContainer>}</Col>
                    </Row>
                    <Row>
                        <Col>
                            <h1 className='display-4' id='postHeader'>{post.title}</h1>
                            <Row>
                                <Col xs={'auto'} style={{ marginRight: -15 }}>{'By:  '}</Col>
                                <Col xs={'auto'} style={{ marginRight: -15 }}>
                                    <Link to={'/users/' + author.name} style={{ textDecoration: 'none', color: 'rgb(240, 240, 240)' }}><UserImage user={author} size={25} className={'align-top'} includeName /></Link>
                                </Col>
                                <Col></Col>
                                <Col xs={'auto'}>
                                    <p className='text-muted align-bottom' id='postTimestamp' style={{ fontSize: 12 }}>Last edited: {DateTime.fromISO(post.lastEdited).toLocaleString(DateTime.DATETIME_MED)}</p>
                                </Col>
                                <hr />
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={'auto'} className='d-block'>
                            <Rating user={user} rating={postRating} userRating={userRating} id={id} />
                        </Col>
                        <Col className='d-block'>
                            <Container id='postBody'>
                                {post.text}
                            </Container>
                            <br />
                            <Container id='postCode'>
                                {(post.code.length > 0) && <Highlight>{post.code}</Highlight>}
                            </Container>
                        </Col>
                    </Row>
                </Container>
                {comments}
                <CommentForm />
            </Container>
        )
    }
    else {
        return (
            <LoadingSpinner />
        );
    }
}

export default Post;
