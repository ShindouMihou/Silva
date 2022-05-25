import express, { Request, Response } from "express";
import multer from 'multer'
import { decode, sign } from "./lib/auth/authentication";
import configuration from "./lib/configuration";
import { StorageDriver } from "./lib/driver";
import { MediaLocal } from "./lib/drivers/local";
import { MediaS3 } from "./lib/drivers/s3";
import { FileRequest } from "./lib/models/file_request";
import mongo from "./lib/mongo";
import logger from './lib/logger'
import bodyParser from "body-parser";

const server = express()
const maximumFileSize = Number.parseInt(configuration('APP_LIMITS') || '10')

const upload = multer({
    limits: {
        fileSize: maximumFileSize * 1024 * 1024
    }
})

const ACCEPTED_FILE_TYPES = [
    "image/jpeg",
    "image/png"
]

let STORAGE_DRIVER: StorageDriver = configuration('STORAGE_DRIVER')?.toLowerCase() !== 's3' ? new MediaLocal() : new MediaS3();

if (STORAGE_DRIVER instanceof MediaLocal) {
    if (configuration('LOCAL_FILE_SERVER') === 'true') {
        server.use(express.static('public'))
    }
}

server.set('trust proxy', true)

server.use((req, res, next) => {
    logger.info({
        method: req.method,
        url: [
            req.url,
            req.baseUrl,
            req.originalUrl
        ],
        headers: req.headers,
        address: [
            req.ip
        ],
        forwards: req.ips,
        query: req.query
    })
    next()
})

const onSignRoute = async (req: Request, res: Response) => {
    try {
        if (!req.headers.authorization) return res.status(401).send()
        if (req.headers.authorization !== configuration('APP_SECRET')) return res.status(401).send()

        if (!(req.body.directory && req.body.fileName && req.body.responsiblity && req.body.textback)) {
            return res.status(400).send()
        }
        const fileRequest: FileRequest = {
            directory: req.body.directory,
            fileName: req.body.fileName,
            responsiblity: req.body.responsibility,
            operation: 'PUT'
        }

        if (req.method === 'DELETE') {
            fileRequest.operation = 'DELETE'
        }

        if (fileRequest.directory === '/') fileRequest.directory = ''

        return res.status(200).send({
            token: sign(fileRequest)
        })
    } catch (error: any) {
        console.error(error)
        return res.status(500).send({
            error: 'An internal error occurred while trying to handle this request.'
        })
    }
}


server.put('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send()
        if (!req.query.token) return res.status(401).send()

        const fileRequest: FileRequest = decode(req.query.token.toString())

        if (!fileRequest) return res.status(401).send()

        if (fileRequest.operation !== 'PUT') return res.status(401).send()

        if (!ACCEPTED_FILE_TYPES.includes(req.file.mimetype.toLowerCase())) return res.status(400).send({
            error: 'The file-type is not supported by the media server.'
        })

        const client = (await mongo.getClient())!
        const data = await client.db('silva').collection('storage').findOne({
            token: req.query.token
        })

        if (data) return res.status(401).send()

        await STORAGE_DRIVER.put(fileRequest, req.file.buffer)

        await client.db('silva').collection('storage').insertOne({
            ...fileRequest,
            token: req.query.token
        })

        return res.status(204).send()
    } catch (error: any) {
        return res.status(500).send({
            error: 'An internal error occurred while trying to handle this request.'
        })
    }
});

server.delete('/', upload.none(), async (req, res) => {
    try {
        if (!req.query.token) return res.status(401).send()

        const fileRequest: FileRequest = decode(req.query.token.toString())

        if (!fileRequest) return res.status(401).send()

        if (fileRequest.operation !== 'DELETE') return res.status(401).send()

        const client = (await mongo.getClient())!
        const data = await client.db('silva').collection('storage').findOne({
            token: req.query.token
        })

        if (!data) return res.status(404).send()

        await STORAGE_DRIVER.delete(fileRequest)

        return res.status(204).send()
    } catch (error: any) {
        return res.status(500).send({
            error: 'An internal error occurred while trying to handle this request.'
        })
    }
});

server.use(bodyParser.json()).put('/sign', onSignRoute).delete('/sign', onSignRoute);


if (!configuration('SERVER_PORT')) {
    throw {
        error: "The server port is not found in the configuration files."
    }
}

server.listen(Number.parseInt(configuration('SERVER_PORT')!), () => {
    logger.info({
        message: 'The server is now running.',
        port: configuration('SERVER_PORT'),
        specifications: {
            driver: configuration('STORAGE_DRIVER'),
            maximumFileSize: (configuration('APP_LIMITS') || '10') + " MB"
        }
    })
});