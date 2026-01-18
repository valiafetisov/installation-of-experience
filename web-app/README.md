# Installation of Experience Application

The code which primary functions are:
- Receive serial commands from Arduino controller regarding the state of the room
- Keep clean sqlite database with every visit to the room
- Display latest database records in a table
- Record videos from two IP cameras
- Upload videos to the specified remote server

Written using [nuxt framework](https://nuxt.com/docs/getting-started/introduction).

## Environment variables

- `CAMERA_STREAM_*` – RTPS urls with valid H264 streams coming from IP cameras
    - `CAMERA_STREAM_INSIDE` (required) – RTPS from the camera inside the room
    - `CAMERA_STREAM_OUTSIDE` (required) – RTPS from the camera outside of the room
- `S3_*` (required) – credentials with (write and meta-data read) access to the S3-compatible bucket where videos will be uploaded automatically as soon as they are recorded
    - `S3_REGION` (required) – region of your bucket
    - `S3_BUCKET_NAME` (required) – name of your bucket
    - `S3_ACCESS_KEY_ID` (required) – access key ID (of your IAM user which have access to the S3 bucket)
    - `S3_SECRET_ACCESS_KEY` (required) – access key secret (of your IAM user which have access to the S3 bucket)
    - `S3_ENDPOINT` (optional, default empty) – endpoint which is nessesery to provide only if you're using non-AWS, unofficial S3 service
- `PATH_TO_ARDUINO_PORT` (optional, default: first port starting with `/dev/tty.usb`) – path to a specific COM port on which Arduino is connected. Note that the Arduino should be pre-programmed with `../sketch` source code before being specified here

## Quick start

0. Specify env variables required above
1. Install dependencies via `npm install`
2. Run dev server via `npm run dev`
3. For production, build the system via `npm run build`, preview via `npm run preview`
