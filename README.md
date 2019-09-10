S3 support storage files with gzip encoding. This tool support user friendly interface for upload files with max compression ratio using zopfli

## install
```bash
npm i -g google-storage-upload-zip
```
or npx
```bash
npx google-storage-upload-zip
```

## Usage
```bash
gsuploadzip dist/client tramvay/client/compiled
```
    * `dist/client` - directory with files
    * `tramvay/client/compiled` - storage bucket and directories when upload files with encoding

You have been auth in google reed docs https://cloud.google.com/docs/authentication/getting-started

## gzip files
    * js
    * css
    * svg
    * txt
    * html
    * json

other files upload with original encoding
