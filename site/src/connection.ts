import axios, { AxiosInstance } from 'axios';

enum HttpMethod {
    Get = "GET",
    Post = "POST",
    Put = "PUT"
}

enum ResponseType {
    ArrayBuffer = 'arraybuffer',
    Blob = 'blob',
    Document = 'document',
    Json = 'json',
    Text = 'text',
    Stream = 'stream'
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

    constructor(host: string = "http://localhost:8080") {
        this.host = host;
        this.instance = axios.create({
            baseURL: `${this.host}/api`,
            timeout: 5000
        });
    }

    public async getConfiguration() {
        return await this.tryAsyncHttpRequest(HttpMethod.Get, '/configuration');
    }

    public async putConfiguration() {
        return await this.tryAsyncHttpRequest(HttpMethod.Put, '/configuration');
    }

    public async fileUpload(file: File) {
        return await this.tryAsyncHttpRequest(HttpMethod.Post, '/file/upload', ContentType.FormData, ResponseType.Json, { image: file });
    }

    public async getUploadStatus(uploadId: string) {
        return await this.tryAsyncHttpRequest(HttpMethod.Get, `/file/upload/${uploadId}`);
    }

    public async downloadFile(uploadId: string) {
        return await this.tryAsyncHttpRequest(HttpMethod.Get, `/file/download/${uploadId}`, ContentType.Text, ResponseType.Blob);
    }

    private async tryAsyncHttpRequest(method: HttpMethod, url: string, contentType: ContentType = ContentType.Text, responseType: ResponseType = ResponseType.Json, data?: object) {
        let response;

        try {
            response = await this.instance.request({
                method,
                url,
                data,
                responseType,
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
