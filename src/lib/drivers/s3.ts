import { S3 } from "@aws-sdk/client-s3";
import sanitize from "sanitize-filename";
import configuration from '../configuration'
import { StorageDriver } from '../driver'
import { FileRequest } from "../models/file_request";

const client = new S3({
    region: configuration('S3_REGION'),
    credentials: {
        accessKeyId: configuration('S3_ACCESS_KEY_ID') || '',
        secretAccessKey: configuration('S3_ACCESS_KEY') || ''
    }
})

const BUCKET = configuration('S3_BUCKET')

export class MediaS3 implements StorageDriver {

    constructor() {
        if (!configuration('S3_REGION')) {
            throw {
                error: 'The S3_REGION cannot be found in the configuration.'
            }
        }

        if (!configuration('S3_ACCESS_KEY_ID')) {
            throw {
                error: 'The S3_ACCESS_KEY_ID cannot be found in the configuration.'
            }
        }

        if (!configuration('S3_ACCESS_KEY')) {
            throw {
                error: 'The S3_ACCESS_KEY cannot be found in the configuration.'
            }
        }

        if (!configuration('S3_BUCKET')) {
            throw {
                error: 'The S3_BUCKET cannot be found in the configuration.'
            }
        }
    }
    
    public async put(request: FileRequest, buffer: Buffer): Promise<void> {
        await client.putObject({
            Bucket: BUCKET,
            Key: `${request.directory}${sanitize(request.fileName)}`,
            Body: buffer,
            ACL: 'public-read'
        })
    };

    public async delete(request: FileRequest): Promise<void> {
        await client.deleteObject({
            Bucket: BUCKET,
            Key: `${request.directory}${sanitize(request.fileName)}`
        })
    };

}