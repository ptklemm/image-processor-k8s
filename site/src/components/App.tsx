import React, { useState, useEffect, useMemo } from 'react';
import { ImgProcConfiguration } from '../types';
import { defaultConfig } from '../defaultConfig';
import {
    MBtoBytes,
    bytesToMB,
} from '../utilities';
import {
    ImgProcApiConnection
} from '../connection';
import { Helmet } from "react-helmet";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function App() {
    const [configuration, setConfiguration] = useState<ImgProcConfiguration>(defaultConfig);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [uploadId, setUploadId] = useState<string | undefined>(undefined);

    const api = useMemo(() => {
        return new ImgProcApiConnection(process.env.REACT_APP_API_HOST);
    }, []);

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

    const handleUpload = async () => {
        const response = await api.fileUpload(selectedFile as File);

        if (response) {
            console.log(response);
            if (response.status === 200) {
                setUploadId(response.data.uploadId);
                setSelectedFile(undefined);
            }
        }
    };

    const handleCheckStatus = async () => {
        const response = await api.getUploadStatus(uploadId as string);

        if (response) {
            console.log(response);
        }
    };

    const handleDownload = async () => {
        const response = await api.downloadFile(uploadId as string);

        if (response) {
            console.log(response);
            // create file link in browser's memory
            const href = URL.createObjectURL(response.data);

            // create "a" HTML element with href to file & click
            const link = document.createElement('a');
            link.href = href;
            link.setAttribute('download', `${uploadId}.jpg`); //or any other extension
            document.body.appendChild(link);
            link.click();

            // clean up "a" element & remove ObjectURL
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
        }
    };

    return (
        <React.Fragment>
            <Helmet>
                <title>{configuration.App.Name} {configuration.App.Version}</title>
            </Helmet>
            <Container fluid>
                <Row>
                    <Col>
                        <Card className='w-50 m-4'>
                            <Card.Header><Card.Title>{configuration.App.Name} {configuration.App.Version}</Card.Title></Card.Header>
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
                                <Button variant="primary" type="submit" disabled={!selectedFile} onClick={handleUpload}>
                                    Upload
                                </Button>
                                <Button variant="primary" type="submit" disabled={!uploadId} onClick={handleCheckStatus}>
                                    Check Status
                                </Button>
                                <Button variant="primary" type="submit" disabled={!uploadId} onClick={handleDownload}>
                                    Download
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
