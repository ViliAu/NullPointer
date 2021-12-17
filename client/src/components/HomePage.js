import {React, useState, useEffect} from 'react';
import { Container } from 'react-bootstrap';

const HomePage = () => {
    const [postAmount, setPostAmount] = useState(0);
    const [userAmount, setUserAmount] = useState(0);

        // Fetch post and comment amounts
        useEffect(() => {
            let mounted = true;
            async function fetchPost() {
                try {    
                    const postReq = await fetch(`/api/post/amount`);
                    const postData = await postReq.json();
    
                    const userReq = await fetch(`/api/user/amount`);
                    const userData = await userReq.json();
    
                    if (mounted) {
                        if (postReq.ok) {
                            setPostAmount(postData.amount);
                            setUserAmount(userData.amount);
                        }
                    }
                }
                catch { }
            }
            fetchPost();
            return () => {
                mounted = false;
            }
        }, []);

    return (
        <div>
            <Container className='text-center'>
                <img
                    alt=''
                    src='/logo.svg'
                />
                <h1 className='display-1'>Welcome to NullPointer</h1>
                <h1 className='lead'>The world's most popular place for desperate developers</h1>
                <h3 className='display-7'>Currently having {postAmount} posts from {userAmount} users</h3>
            </Container>
        </div>
    );
}

export default HomePage;
