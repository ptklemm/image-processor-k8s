import axios from 'axios';
import {
    PROTOCOL,
    API_HOST,
    API_PORT
} from './constants';
import { HttpMethod, ContentType } from './enums';

export const MBtoBytes = (MB: number) => {
    return MB * 1024 * 1024;
}

export const bytesToMB = (bytes: number) => {
    return (bytes / 1024 / 1024).toPrecision(3);
}

export const endpoint = (endpointStr: string) => {
    return `${PROTOCOL}://${API_HOST}:${API_PORT}/api/${endpointStr}`;
}

export const tryAsyncHttpRequest = async (method: HttpMethod, url: string, data: object, contentType: ContentType) => {
    let response;

    try {
        response = await axios({
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

