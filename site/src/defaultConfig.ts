import { ImgProcConfiguration } from './types';

export const defaultConfig: ImgProcConfiguration = {
    App: {
        Name: 'Image Processor',
        Version: '0.1.0'
    },
    ApiHost: 'http://localhost:8080',
    Upload: {
        PartSizeMB: 5,
        MaxSizeMB: 50,
        AcceptedFileTypes: ['image/bmp', 'image/jpeg', 'image.png']
    }
};
