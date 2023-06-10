import axios, { AxiosInstance } from 'axios';

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

    constructor(host: string = "http://localhost:8080") {
        this.host = host;
        this.instance = axios.create({
            baseURL: `${this.host}/api`,
            timeout: 3000
        });
    }

    public async getConfiguration() {
        return await this.tryAsyncHttpRequest(HttpMethod.Get, '/configuration');
    }

    public async putConfiguration() {
        return await this.tryAsyncHttpRequest(HttpMethod.Put, '/configuration');
    }

    public async fileUpload(file: File) {
        return await this.tryAsyncHttpRequest(HttpMethod.Post, '/file/upload', ContentType.FormData, { image: file });
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
