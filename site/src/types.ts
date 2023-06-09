export interface ImgProcConfiguration {
    App: {
        Name: string,
        Version: string
    },
    ApiHost: string,
    Upload: {
        PartSizeMB: number,
        MaxSizeMB: number,
        AcceptedFileTypes: string[]
    }
}