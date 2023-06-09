import React, { useState, useEffect, useMemo } from 'react';
import { ImgProcConfiguration } from './types';
import {
    MBtoBytes,
    bytesToMB,
} from './utilities';
import {
    ImgProcApiConnection
} from './connection';
import { Helmet } from "react-helmet";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function App() {
    const [configuration, setConfiguration] = useState<ImgProcConfiguration>({
        App: {
            Name: 'Image Processor',
            Version: 'x.y.z'
        },
        ApiHost: 'http://localhost:8080',
        Upload: {
            PartSizeMB: 5,
            MaxSizeMB: 50,
            AcceptedFileTypes: ['image/bmp', 'image/jpeg', 'image.png']
        }
    });
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

    const api = useMemo(() => {
        return new ImgProcApiConnection(process.env.REACT_APP_API_HOST || configuration.ApiHost);
    }, [configuration.ApiHost]);

    useEffect(() => {
        api.getConfiguration()
            .then(response => {
                if (response) {
                    setConfiguration(response.data);
                }
            })
            .catch(err => {
                console.error(err);
            });
    }, [api]);

    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;

        if (validateSelectedFile(file)) {
            setSelectedFile(file as File);
        } else {
            console.warn('Image failed validation.');
        }
    };

    const validateSelectedFile = (file: File | null) => {
        if (file) {
            return file.size < MBtoBytes(configuration.Upload.MaxSizeMB) ? true : false;
        } else {
            return false;
        }
    }

    const requiresMultipartFileUpload = (file: File) => {
        return file.size > MBtoBytes(configuration.Upload.PartSizeMB) ? true : false;
    }

    const handleSubmit = async () => {
        if (requiresMultipartFileUpload(selectedFile as File)) {
            await api.processMultipartFileUpload(selectedFile as File);
        } else {
            await api.fileUpload(selectedFile as File);
        }
    };

    const testMultipart = async () => {
        await api.processMultipartFileUpload(selectedFile as File);
    }

    return (
        <React.Fragment>
            <Helmet>
                <title>{configuration.App.Name} {configuration.App.Version}</title>
            </Helmet>
            <Container fluid>
                <Row>
                    <Col>
                        <Card className='w-50 m-4'>
                            <Card.Header as="h5">{configuration.App.Name} {configuration.App.Version}</Card.Header>
                            <Card.Body>
                                <Form noValidate encType="multipart/form-data">
                                    <Form.Group controlId="formFile" className="mb-3">
                                        <Form.Label>Upload an Image</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept={configuration.Upload.AcceptedFileTypes.join(",")}
                                            onChange={changeHandler} />
                                        <Form.Text className="text-muted">
                                            Maximum image size is {configuration.Upload.MaxSizeMB} MB. Accepted image types are BMP, JPEG, and PNG.
                                        </Form.Text>
                                    </Form.Group>
                                    {selectedFile && <Card.Text>Size: {bytesToMB(selectedFile.size)} MB</Card.Text>}
                                </Form>
                            </Card.Body>
                            <Card.Footer>
                                <Button variant="primary" type="submit" disabled={!selectedFile} onClick={handleSubmit}>
                                    Upload
                                </Button>
                                <Button variant="primary" type="submit" disabled={!selectedFile} onClick={testMultipart}>
                                    Test Multipart Upload
                                </Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );
}

export default App;
