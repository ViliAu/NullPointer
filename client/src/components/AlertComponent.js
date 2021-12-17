import { React } from 'react';
import Alert from 'react-bootstrap/Alert';

// Component that show the error message from backend (used in form validations)
const AlertComponent = ({ message, header, show, setShowAlert }) => {
    return (
        <>
            {show &&
            <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
                <Alert.Heading>{header}</Alert.Heading>
                <p>{message}</p>
            </Alert>}
        </>
    );

}
export default AlertComponent;