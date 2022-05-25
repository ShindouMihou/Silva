import { StorageDriver } from "../driver";
import * as fs from 'fs'
import sanitize from 'sanitize-filename'
import { FileRequest } from "../models/file_request";

export class MediaLocal implements StorageDriver {

    public async put(request: FileRequest, buffer: Buffer): Promise<void> {
        try {
            if (!fs.existsSync(`./public/${request.directory}`)) {
                fs.mkdirSync(`./public/${request.directory}`, {
                    recursive: true
                })
            }

            fs.writeFileSync(`./public/${request.directory}${sanitize(request.fileName)}`, buffer)
        } catch (err: any) {
            console.error(err)
            throw {
                error: "An error occurred while trying to store file onto the storage."
            }
        }
    };

    public async delete(request: FileRequest): Promise<void> {
        try {
            fs.rmSync(`./public/${request.directory}${sanitize(request.fileName)}`, {
                force: true
            })
        } catch (err: any) {
            console.error(err)
            throw {
                error: "An error occurred while trying to remove file from the storage."
            }
        }
    };

}