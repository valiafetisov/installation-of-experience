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
- `PATH_TO_ARDUINO_PORT` (optional, default: first port starting with `/dev/tty.usb`) – path to a specific COM port on which Arduino is connected. Note that the Arduino should be pre-programmed with `../sketch` source code before being specified here
- `AWS_*` (optional) – credentials with write access to the S3-like bucket where videos will be uploaded automatically
    - `AWS_REGION` (required) – AWS region of your bucket
    - `AWS_S3_BUCKET_NAME` (required) – name of your bucket
    - `AWS_ACCESS_KEY_ID` (required) – access key ID (of your IAM user which have access to the S3 bucket)
    - `AWS_SECRET_ACCESS_KEY` (required) – access key secret (of your IAM user which have access to the S3 bucket)

## Quick start

0. Specify env variables required above
1. Install dependencies via `npm install`
2. Run dev server via `npm run dev`
3. For production, build the system via `npm run build`, preview via `npm run preview`
