import winston from "winston";

export default winston.createLogger({
    format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp()
    ),
    transports: [
        new winston.transports.Console()
    ]
})