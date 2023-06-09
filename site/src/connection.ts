import axios, { AxiosInstance } from 'axios';
import md5 from 'md5';

enum HttpMethod {
    Get = "GET",
    Post = "POST",
    Put = "PUT"
}

enum ContentType {
    Text = 'text/plain',
    Json = 'application/json',
    FormData = 'multipart/form-data',
    OctetStream = 'application/octet-stream'
}

export class ImgProcApiConnection {
    private host: string;
    private instance: AxiosInstance;

    constructor(host: string) {
        this.host = host;
        this.instance = axios.create({
            baseURL: `${this.host}/api`,
            timeout: 3000
        });
    }

    public async getConfiguration() {
        return await this.tryAsyncHttpRequest(HttpMethod.Get, '/configuration');
    }

    public async fileUpload(file: File) {
        return await this.tryAsyncHttpRequest(HttpMethod.Post, '/file/upload', ContentType.FormData, { file });
    }

    public async processMultipartFileUpload(file: File) {
        console.log(await file.arrayBuffer());
        let partSize = 1 * 1024 * 1024; // Set part size to 1 MB.
        const { size, type } = file;
        // 1. Send file size and type to API and request an upload ID in response.
        let uploadId;
        let response = await this.tryAsyncHttpRequest(HttpMethod.Post, '/file/multipart-upload', ContentType.Json, { size, type });
        if (response) {
            uploadId = response.data.uploadId;
        } else {
            // upload request failed
        }

        // Create array of partIds
        // const partIds = [];
        // Break file into parts
        let filePosition = 0;
        for (let index = 1; filePosition < file.size; index++) {
            // Because the last part could be less than 1 MB, adjust the part size as needed.
            partSize = Math.min(partSize, (file.size - filePosition));
            const data = file.slice(filePosition, filePosition + partSize);

            // try uploading the part, get a partId in response
            response = await this.tryAsyncHttpRequest(HttpMethod.Put, '/file/multipart-upload-part', ContentType.FormData, {
                uploadId,
                index,
                size: partSize,
                file: data,
                md5: md5(await data.text())
            });

            if (response) {
                console.log(response);
                filePosition += partSize;
            } else {
                // uploading part failed
            }

        }
    }

    private async tryAsyncHttpRequest(method: HttpMethod, url: string, contentType: ContentType = ContentType.Text, data?: object) {
        let response;

        try {
            response = await this.instance.request({
                method,
                url,
                data,
                headers: {
                    'Content-Type': contentType
                }
            });
        } catch (err) {
            console.error(err);
        }

        return response;
    }
}
