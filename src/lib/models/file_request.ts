export interface FileRequest {

    /**
     * The file name that this request is performing for. If this is a PUT request then this is 
     * the reserved file name that should be used.
     */
    fileName: string,

    /**
     * The file directory that this request is to be stored.
     */
    directory: string,

    /**
     * A responsibility is an {@link ObjectId} that is responsible for this 
     * file request. It will be stored on the database as the sole responsible user for 
     * this file and can only be deleted when requested with the same responsibility.
     */
    responsiblity: string,

    /**
     * The operation that this file request is intended for.
     */
    operation: 'PUT' | 'DELETE'

}