import React, { useState } from 'react';
import {
    APP_NAME,
    APP_VERSION,
    UPLOAD_PART_SIZE_MB,
    UPLOAD_MAX_SIZE_MB,
    ACCEPTED_FILE_TYPES
} from './constants';
import { HttpMethod, ContentType } from './enums';
import {
    MBtoBytes,
    bytesToMB,
    endpoint,
    tryAsyncHttpRequest
} from './utilities';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function App() {
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        console.log(file);

        if (validate(file)) {
            setSelectedFile(file as File);
        } else {
            console.warn('Image failed validation.');
        }
    };

    const validate = (file: File | null) => {
        if (file) {
            return file.size < MBtoBytes(UPLOAD_MAX_SIZE_MB) ? true : false;
        } else {
            return false;
        }
    }

    const requiresMultipartUpload = (file: File) => {
        return file.size > MBtoBytes(UPLOAD_PART_SIZE_MB) ? true : false;
    }

    const processMultipartUpload = async (file: File) => {
        const { size, type } = file;
        // 1. Send file size and type to API and request an upload ID in response.
        let response = await tryAsyncHttpRequest(HttpMethod.Post, endpoint('multipart-upload'), { size, type }, ContentType.Json);
        console.log(response);
    }

    const upload = async (file: File) => {
        const response = await tryAsyncHttpRequest(HttpMethod.Post, endpoint('upload'), { file }, ContentType.FormData);
        console.log(response);
    }

    const handleSubmit = () => {
        if (requiresMultipartUpload(selectedFile as File)) {
            processMultipartUpload(selectedFile as File);
        } else {
            upload(selectedFile as File);
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className='w-50 m-4'>
                        <Card.Header as="h5">{APP_NAME} {APP_VERSION}</Card.Header>
                        <Card.Body>
                            <Form noValidate encType="multipart/form-data">
                                <Form.Group controlId="formFile" className="mb-3">
                                    <Form.Label>Upload an Image</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept={ACCEPTED_FILE_TYPES.join(",")}
                                        onChange={changeHandler} />
                                    <Form.Text className="text-muted">
                                        Maximum image size is {UPLOAD_MAX_SIZE_MB} MB. Accepted image types are BMP, JPEG, and PNG.
                                    </Form.Text>
                                </Form.Group>
                                {selectedFile && <Card.Text>Size: {bytesToMB(selectedFile.size)} MB</Card.Text>}
                            </Form>
                        </Card.Body>
                        <Card.Footer>
                            <Button variant="primary" type="submit" disabled={!selectedFile} onClick={handleSubmit}>
                                Upload
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default App;
