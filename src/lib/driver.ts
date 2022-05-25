import { FileRequest } from "./models/file_request";

export interface StorageDriver {
    put: (request: FileRequest,  buffer: Buffer) => Promise<void>,
    delete: (request: FileRequest) => Promise<void>
}