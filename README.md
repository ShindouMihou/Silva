# 🌉 Silva
Silva (formerly Aromatic Media Server) is a media library server of the Aroma platform and related platforms which is intended to handle file operations for avatars and book covers. It supports AWS S3 and local filesystems with a maximum of customizable maximum megabytes per file. 

The media server was created to workaround the issue with Sveltekit being unable to handle file uploads neatly. It is recommended to use AWS S3 for this but if unable to bear the costs of AWS S3 then we recommend pairing this with NGINX to enable fast uploads.

## ⚙️ Flow
Silva works akin to AWS S3's presigned urls where the website's backend asks for presigned token from the media server that contains the important metadata such as the filename, directory, who is responsible for this operation and other details and can then allow the frontend client to use that presigned token to upload the file onto the media server who checks the validity of the token from the database and stores the file if the token is valid.

![Silva Flow](https://user-images.githubusercontent.com/69381903/169654864-2935e453-71e1-4ab4-9b5e-591043a38b50.png)

## 💼 Local Filesystem
When specified as the storage driver, Silva will make a directory (`/public`) where it will store all the files with reads disabled to the filesystem by default. You can enable reads to the `/public` folder by enabling the `LOCAL_FILE_SERVER` option on the `.env` file:
```env
LOCAL_FILE_SERVER=true
```

This is not recommended though as it will take up precious resources that are intended for the file operations, instead it is recommended to use NGINX or similar web server proxies for the static files located under `/public` folder.

When specifying the storage driver as local filesystem, you should also map the `/public` folder either to a Docker volume or to a folder in the local system when using Docker to enable persistence of the data. Load balancing with local filesystem is a bit more complex which is why we recommend AWS S3 when possible.
