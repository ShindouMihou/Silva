import configuration from "../configuration";
import * as jwt from "jsonwebtoken";
import { FileRequest } from "../models/file_request";

/**
 * Generates a signature from the file request given, this is to be used by the user themselves 
 * to upload the file. This is similar to AWS's presigned urls and lasts up to 10 minutes maximum which 
 * should be far more than enough time to upload a 10 megabyte maximum file.
 * 
 * @param request The file request that is to be confirmed and signed.
 * @returns 
 */
export function sign(request: FileRequest): string {
    if (!configuration('AROMA_SECRET')) {
        throw {
            error: 'AROMA_SECRET is not configured, please configure it.'
        }
    }


    return jwt.sign(request, configuration('AROMA_SECRET') || '', {
        expiresIn: '10m'
    })
}

/**
 * Decodes a JWT token and returns the payload. This performs verification of lifetime and other 
 * details beforehand.
 * 
 * @param token The token to decode.
 * @returns The decoded JWT token payload.
 */
export function decode(token: string): any | null {
    if (!configuration('AROMA_SECRET')) {
        throw {
            error: 'AROMA_SECRET is not configured, please configure it.'
        }
    }

    try {
        const decoded: any = jwt.verify(token, configuration('AROMA_SECRET') || '')
        return decoded
    } catch(err) {
        return null
    }
}