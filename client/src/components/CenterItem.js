import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// Wrapper component to format some objects nicely and centered (such ars forms)
const CenterItem = ({xs, md, children}) => {
    return (
        <Container>
            <Row className='justify-content-md-center'>
                <Col></Col>
                <Col xs={xs} md={md} >{children}</Col>
                <Col></Col>
            </Row>
        </Container>
    )
}

CenterItem.defaultProps = {
    xs: 'auto',
    md: 6
}

export default CenterItem;