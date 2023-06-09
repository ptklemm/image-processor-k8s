export const MBtoBytes = (MB: number) => {
    return MB * 1024 * 1024;
}

export const bytesToMB = (bytes: number) => {
    return (bytes / 1024 / 1024).toPrecision(3);
}
