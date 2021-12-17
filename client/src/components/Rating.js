import React from 'react'

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button'

const Rating = ({ user, rating, userRating, id }) => {

    // Handle the rating button click
    const handleRating = async (event) => {
        let rating = event.target.id;
        if (rating === userRating) {
            rating = 0;
        }
        if (!id) {
            return;
        }
        // Update the post/comments rating
        try {
            let ratingData = {};
            ratingData.rating = rating;
            const req = await fetch(`/api/post/rate?id=${id}`, {
                method: 'PUT',
                headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + localStorage.getItem('auth_token') },
                body: JSON.stringify(ratingData)
            });
            const data = await req.json();

            // Update the data for the client by reloading the whole page due to time constraints
            if (data.success) {
                window.location.reload();
            }
            else {
                alert(data.error);
            }
        }
        catch (e) {
            console.log(e);
        }
    };

    return (
        <Container className='text-center noselect'>
            <Button size='sm' id='1' onClick={handleRating} style={{ fontSize: 18, background: 'none', border: 'none'}}>{user ? userRating > 0 ? '▲' : '△' : ' '}</Button>
            <div style={{ fontSize: 15 }}>{rating}</div>
            <Button size='sm' id='-1' onClick={handleRating} style={{ fontSize: 18, background: 'none', border: 'none'}}>{user ? userRating < 0 ? '▼' : '▽' : ' '}</Button>
        </Container>
    );
}

export default Rating;
