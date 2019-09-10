const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const zopfli = require('node-zopfli');

const canZipFiles = {
    js: 'application/javascript',
    css: 'text/css',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    html: 'text/html',
    json: 'application/json'
};

const generateMetadata = (gzip) => {
    const metadata = {
        cacheControl: 'public, max-age=31536000',
    };
    if (gzip) {
        metadata.contentEncoding = 'gzip'
        metadata.contentType = gzip
        metadata.metadata = {
            vary = 'Accept-Encoding'
        }
    }

    return metadata;
};

function generateBucketFilePath(bucketPath, filename) {
    const pars = bucketPath.split('/');
    pars.shift();
    return path.join(pars.join('/'), filename)
}

async function createWriteToS3() {
    const storage = new Storage();

    return async ($stream, { fileName, bucketPath, gzip }) => {
        const bucketName = bucketPath.split('/')[0];
        const filePath = generateBucketFilePath(bucketPath, fileName);
        const file = storage.bucket(bucketName).file(filePath);

        $stream.pipe(file.createWriteStream({
            gzip: true,
            metadata: generateMetadata(gzip),
        }));
    }
}

async function openFile(fileName) {
    return fs.createReadStream(fileName)
}

async function compressFile($stream, fileName) {
    return $stream.pipe(zopfli.createGzip({ verbose: true }))
}

async function main() {
    const filesDirectories = process.argv[2];
    const bucketPath = process.argv[3];

    const files = fs.readdirSync(filesDirectories);
    const s3WriteClient = await createWriteToS3();

    files.forEach(async fileName => {
        const filePath = path.resolve(filesDirectories, fileName);
        const extFile = path.extname(fileName).split('.').reverse()[0];
        const canZip = canZipFiles[extFile];
        let $file = await openFile(filePath);

        if (canZip) {
            $file = await compressFile($file, fileName);
        }

        await s3WriteClient($file, { fileName, bucketPath, gzip: canZip });
    });
}

main();
