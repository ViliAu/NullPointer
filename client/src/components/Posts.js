import { React, useEffect, useState } from 'react';
import LinkContainer from 'react-router-bootstrap/LinkContainer'
import Helmet from 'react-helmet';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Stack from 'react-bootstrap/Stack'
import PostPreview from './PostPreview';

const Posts = () => {
    const [posts, setPosts] = useState(null);
    // Get query string
    const query = window.location.search;

    // Get all post previews
    useEffect(() => {
        let mounted = true;
        // Get post data from backend API
        async function fetchPosts() {
            try {
                const req = await fetch(`/api/post/preview` + query);
                const data = await req.json();
                if (mounted) {
                    // Map posts into nice preview cards
                    if (req.ok) {
                        setPosts(data.previews.map((post) => <PostPreview key={post._id} post={post} />))
                    }
                }
            }
            catch { }
        }
        fetchPosts();
        return () => {
            mounted = false;
        }
    }, [query]);

    return (
        <Allposts posts={posts} />
    );
}

const Allposts = ({ posts }) => {

    let isLoggedIn = localStorage.getItem('auth_token') !== null;

    return (
        <Container text='light' style={{ padding: 10 }}>
            <Helmet>
                <title>Posts</title>
            </Helmet>
            <Row className="d-flex align-items-middle" float="center" style={{marginBottom: 10}}>
                <Col md={'auto'} xs={6}>
                    <a href='/posts' style={{ textDecoration: 'none', color: 'rgb(240, 240, 240)' }}><h1>Latest posts</h1></a>
                </Col>
                <Col xs={0}></Col>
                <Col xs={'auto'}>
                    {isLoggedIn &&
                        <LinkContainer to='/create'>
                            <Button variant='primary' >+ Create post</Button>
                        </LinkContainer>}
                </Col>
            </Row>
            <Row>
                <Stack gap={3}>
                    {posts}
                </Stack>
            </Row>
        </Container>
    )
}

export default Posts
